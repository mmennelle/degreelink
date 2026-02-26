#!/usr/bin/env python3
"""
Merge duplicate courses in the database.

For each set of duplicates (same subject_code, course_number, institution):
  1. Keep the ORIGINAL (lowest id — usually the one with the most data).
  2. Reassign all equivalencies (from_course_id / to_course_id) from the
     duplicate to the keeper.  Skip if that equivalency already exists.
  3. Reassign all plan_courses rows from the duplicate to the keeper.
     Skip if the plan already has the keeper course.
  4. Delete the duplicate course row.

Usage:
    python scripts/merge_duplicate_courses.py             # dry-run (default)
    python scripts/merge_duplicate_courses.py --commit    # actually apply
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from models import db


def find_duplicates():
    """Return list of (course_number, department, institution, [ids])."""
    rows = db.session.execute(db.text("""
        SELECT course_number, subject_code, institution,
               array_agg(id ORDER BY id) AS ids
        FROM courses
        GROUP BY course_number, subject_code, institution
        HAVING COUNT(*) > 1
        ORDER BY subject_code, course_number, institution
    """)).fetchall()
    return rows


def compare_courses(keeper_id, dup_id):
    """Print a side-by-side comparison of keeper vs duplicate."""
    keeper = db.session.execute(
        db.text("SELECT * FROM courses WHERE id = :id"), {"id": keeper_id}
    ).mappings().fetchone()
    dup = db.session.execute(
        db.text("SELECT * FROM courses WHERE id = :id"), {"id": dup_id}
    ).mappings().fetchone()

    print(f"    KEEPER (id={keeper_id}): code={keeper['code']}, title={keeper['title']!r}, "
          f"credits={keeper['credits']}, dept={keeper['department']!r}")
    print(f"    DUPLICATE(id={dup_id}): code={dup['code']}, title={dup['title']!r}, "
          f"credits={dup['credits']}, dept={dup['department']!r}")

    # Count references
    for label, cid in [("KEEPER", keeper_id), ("DUPLICATE", dup_id)]:
        eq_from = db.session.execute(
            db.text("SELECT COUNT(*) FROM equivalencies WHERE from_course_id = :id"),
            {"id": cid}
        ).scalar()
        eq_to = db.session.execute(
            db.text("SELECT COUNT(*) FROM equivalencies WHERE to_course_id = :id"),
            {"id": cid}
        ).scalar()
        plan_refs = db.session.execute(
            db.text("SELECT COUNT(*) FROM plan_courses WHERE course_id = :id"),
            {"id": cid}
        ).scalar()
        print(f"      {label} refs: {eq_from} equiv-from, {eq_to} equiv-to, {plan_refs} plan_courses")


def merge_one(keeper_id, dup_id, commit=False):
    """Reassign references from dup_id → keeper_id, then delete dup."""
    moved_eq = 0
    skipped_eq = 0
    moved_plan = 0
    skipped_plan = 0

    # --- Equivalencies: from_course_id ---
    eq_from_rows = db.session.execute(
        db.text("SELECT id, to_course_id FROM equivalencies WHERE from_course_id = :dup"),
        {"dup": dup_id}
    ).fetchall()
    for row in eq_from_rows:
        # Check if keeper already has this equivalency
        exists = db.session.execute(
            db.text("""SELECT 1 FROM equivalencies
                       WHERE from_course_id = :keeper AND to_course_id = :to_id"""),
            {"keeper": keeper_id, "to_id": row.to_course_id}
        ).fetchone()
        if exists:
            if commit:
                db.session.execute(
                    db.text("DELETE FROM equivalencies WHERE id = :eid"), {"eid": row.id}
                )
            skipped_eq += 1
        else:
            if commit:
                db.session.execute(
                    db.text("UPDATE equivalencies SET from_course_id = :keeper WHERE id = :eid"),
                    {"keeper": keeper_id, "eid": row.id}
                )
            moved_eq += 1

    # --- Equivalencies: to_course_id ---
    eq_to_rows = db.session.execute(
        db.text("SELECT id, from_course_id FROM equivalencies WHERE to_course_id = :dup"),
        {"dup": dup_id}
    ).fetchall()
    for row in eq_to_rows:
        exists = db.session.execute(
            db.text("""SELECT 1 FROM equivalencies
                       WHERE from_course_id = :from_id AND to_course_id = :keeper"""),
            {"from_id": row.from_course_id, "keeper": keeper_id}
        ).fetchone()
        if exists:
            if commit:
                db.session.execute(
                    db.text("DELETE FROM equivalencies WHERE id = :eid"), {"eid": row.id}
                )
            skipped_eq += 1
        else:
            if commit:
                db.session.execute(
                    db.text("UPDATE equivalencies SET to_course_id = :keeper WHERE id = :eid"),
                    {"keeper": keeper_id, "eid": row.id}
                )
            moved_eq += 1

    # --- plan_courses ---
    plan_rows = db.session.execute(
        db.text("SELECT id, plan_id FROM plan_courses WHERE course_id = :dup"),
        {"dup": dup_id}
    ).fetchall()
    for row in plan_rows:
        exists = db.session.execute(
            db.text("""SELECT 1 FROM plan_courses
                       WHERE plan_id = :pid AND course_id = :keeper"""),
            {"pid": row.plan_id, "keeper": keeper_id}
        ).fetchone()
        if exists:
            if commit:
                db.session.execute(
                    db.text("DELETE FROM plan_courses WHERE id = :pcid"), {"pcid": row.id}
                )
            skipped_plan += 1
        else:
            if commit:
                db.session.execute(
                    db.text("UPDATE plan_courses SET course_id = :keeper WHERE id = :pcid"),
                    {"keeper": keeper_id, "pcid": row.id}
                )
            moved_plan += 1

    # --- Delete the duplicate course ---
    if commit:
        db.session.execute(
            db.text("DELETE FROM courses WHERE id = :dup"), {"dup": dup_id}
        )

    return moved_eq, skipped_eq, moved_plan, skipped_plan


def main():
    commit = "--commit" in sys.argv
    mode = "COMMIT" if commit else "DRY-RUN"
    print(f"=== Merge Duplicate Courses ({mode}) ===\n")

    duplicates = find_duplicates()
    if not duplicates:
        print("No duplicate courses found. Nothing to do.")
        return

    print(f"Found {len(duplicates)} sets of duplicates:\n")

    total_merged = 0
    for row in duplicates:
        ids = list(row.ids)
        keeper_id = ids[0]  # lowest id = original
        dup_ids = ids[1:]
        print(f"  {row.subject_code} {row.course_number} @ {row.institution}  "
              f"(keeper={keeper_id}, duplicates={dup_ids})")

        for dup_id in dup_ids:
            compare_courses(keeper_id, dup_id)
            moved_eq, skipped_eq, moved_plan, skipped_plan = merge_one(keeper_id, dup_id, commit)
            print(f"    → Equivalencies: {moved_eq} moved, {skipped_eq} skipped (already existed)")
            print(f"    → Plan courses:  {moved_plan} moved, {skipped_plan} skipped")
            if commit:
                print(f"    → Deleted duplicate course id={dup_id}")
            total_merged += 1
        print()

    if commit:
        db.session.commit()
        print(f"DONE — merged {total_merged} duplicate(s) across {len(duplicates)} course sets.")
    else:
        print(f"DRY-RUN complete — {total_merged} duplicate(s) would be merged.")
        print("Re-run with --commit to apply changes.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        main()
