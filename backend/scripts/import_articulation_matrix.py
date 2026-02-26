"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

Seed the database from the extracted Louisiana Articulation Matrix CSV.

Usage (run from the backend/ directory with the venv active):
    python scripts/import_articulation_matrix.py [CSV_PATH] [--dry-run] [--validate-only]

Options:
    CSV_PATH         Path to articulation_matrix.csv (extracted by extract_articulation_matrix.py)
                     Default: ../docs/articulation_matrix.csv
    --dry-run        Print what would happen without touching the DB
    --validate-only  Only check existing equivalencies against the CCN data; do not import

What this script does:
    1. For each row in the CSV it creates a "CCN" Course record with
       institution = "Louisiana Board of Regents" (the statewide virtual institution).
    2. For each institution column that has a non-empty, non-wildcard value it
       creates (or finds) a local Course record at that institution, then creates
       an Equivalency:  local_course → ccn_course (type='articulation').
    3. After seeding, it validates all EXISTING equivalencies in the DB:
       if both sides have a CCN mapping and those CCNs differ, it prints a warning.

Generic designation handling:
    "GSOC 3" etc. are stored as real courses with subject_code="GSOC" and
    institution=<institution_name>.  They represent "generic credit" awards.

Wildcard values like "ACCT ***" mean no specific local course exists but the
subject is recognised.  These create an Equivalency with type='subject_area'
pointing to the CCN course (no specific local course record created).
"""

import sys
import os
import csv
import re

# ---------------------------------------------------------------------------
# Bootstrap Flask app context so we can use SQLAlchemy models
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, '..'))

sys.path.insert(0, BACKEND_DIR)

DEFAULT_CSV = os.path.join(PROJECT_ROOT, 'docs', 'articulation_matrix.csv')

ALL_INSTITUTIONS = [
    'BPCC', 'BRCC', 'CLTCC', 'DCC', 'FTCC', 'LDCC',
    'NCC', 'NTCC', 'RPCC', 'SLCC', 'STCC',
    'LSU_AM', 'LSUA', 'LSUE', 'LSUS', 'GSU', 'LA_TECH',
    'MCNEESE', 'NICHOLLS', 'NSU', 'SLU', 'ULL', 'ULM',
    'UNO', 'SU_AM', 'SUNO', 'SUSLA',
]

# Human-readable names used as the institution field in Course records
INSTITUTION_DISPLAY = {
    'BPCC':     'Bossier Parish Community College',
    'BRCC':     'Baton Rouge Community College',
    'CLTCC':    'Central Louisiana Technical Community College',
    'DCC':      'Delgado Community College',
    'FTCC':     'Fletcher Technical Community College',
    'LDCC':     'Louisiana Delta Community College',
    'NCC':      'Nunez Community College',
    'NTCC':     'Northshore Technical Community College',
    'RPCC':     'River Parishes Community College',
    'SLCC':     'South Louisiana Community College',
    'STCC':     'SOWELA Technical Community College',
    'LSU_AM':   'Louisiana State University',
    'LSUA':     'LSU Alexandria',
    'LSUE':     'LSU Eunice',
    'LSUS':     'LSU Shreveport',
    'GSU':      'Grambling State University',
    'LA_TECH':  'Louisiana Tech University',
    'MCNEESE':  'McNeese State University',
    'NICHOLLS': 'Nicholls State University',
    'NSU':      'Northwestern State University',
    'SLU':      'Southeastern Louisiana University',
    'ULL':      'University of Louisiana, Lafayette',
    'ULM':      'University of Louisiana, Monroe',
    'UNO':      'University of New Orleans',
    'SU_AM':    'Southern University and A&M College',
    'SUNO':     'Southern University New Orleans',
    'SUSLA':    'Southern University at Shreveport',
}

CCN_INSTITUTION = 'Louisiana Board of Regents'

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def is_wildcard(value: str) -> bool:
    """True for values like 'ACCT ***' that mean subject recognised, no specific course."""
    return bool(value) and '***' in value


def is_generic(value: str) -> bool:
    """True for values like 'GSOC 3', 'GNAT 1', 'GMAT 3' etc."""
    generic_subjects = {'GSOC', 'GNAT', 'GFAR', 'GMAT', 'GHUM', 'GBUS', 'GLAN'}
    parts = value.strip().split()
    return len(parts) >= 1 and parts[0].upper() in generic_subjects


def ccn_to_credits(ccn: str) -> int:
    """
    Derive credit hours from the CCN code.
    The last digit of the 4-digit number = credit hours (1, 3, 4, 6).
    """
    m = re.search(r'(\d{4})', ccn)
    if m:
        last_digit = int(m.group(1)[-1])
        # 0 digit sometimes means 0-credit lab, treat as 1
        return last_digit if last_digit > 0 else 1
    return 3  # default


# Regex for a clean course code: SUBJ + optional NUM (with possible letter suffix)
_COURSE_RE = re.compile(r'^([A-Za-z]{2,6})\s*([0-9]+[A-Za-z]*)$')


def split_code(code: str):
    """Parse a course code string into (subject, number).

    Handles:
      - Normal: 'ACCT 2113' → ('ACCT', '2113')
      - PDF artifacts with merged spaces: 'BIOL10 40' → ('BIOL', '1040')
      - Slash alternatives: 'BIOL 1207/1208' → ('BIOL', '1207')
      - 'or'/'and'/'+' alternatives: 'MATH 102 or 103' → ('MATH', '102')
      - Parenthetical credits: 'CHEM 205 (4 cr.)' → ('CHEM', '205')
      - Bare number (from & split): '1021' → ('', '1021')
    """
    code = code.strip()
    if not code:
        return '', ''

    # Strip parenthetical suffixes like '(4 cr.)', '(G)', '(1cr.)'
    code = re.sub(r'\s*\(.*?\)\s*', ' ', code).strip()

    # Remove trailing single letters that are PDF noise: 'ACCT 462 N' → 'ACCT 462'
    code = re.sub(r'\s+[A-Z]$', '', code)

    # Split on 'or', 'and', '+', '/' — take only the first alternative
    first = re.split(r'\s+or\s+|\s+and\s+|\s*\+\s*|/', code)[0].strip()

    # Fix PDF artifacts where subject runs into number: 'BIOL10 40' → 'BIOL 1040'
    m_artifact = re.match(r'^([A-Za-z]{2,6})(\d+)\s+(\d+[A-Za-z]*)$', first)
    if m_artifact:
        first = f"{m_artifact.group(1)} {m_artifact.group(2)}{m_artifact.group(3)}"

    # Try clean parse
    m = _COURSE_RE.match(first)
    if m:
        return m.group(1).upper(), m.group(2).upper()

    # Bare number like '1021'
    if re.match(r'^\d+[A-Za-z]*$', first):
        return '', first.upper()

    # Dashes like 'BIOL ---' or '---' → empty
    if re.match(r'^[A-Za-z]*\s*-+$', first):
        return '', ''

    # Last resort: try to grab the first 2-6 letter prefix + first number
    m2 = re.match(r'^([A-Za-z]{2,6})[\s/*+&-]+([0-9]+[A-Za-z]*)', first)
    if m2:
        return m2.group(1).upper(), m2.group(2).upper()

    return first[:20].upper(), ''


# ---------------------------------------------------------------------------
# Core import logic
# ---------------------------------------------------------------------------

def import_matrix(csv_path: str, dry_run: bool = False, validate_only: bool = False):
    from app import create_app
    from models import db, Course, Equivalency

    flask_app = create_app()

    with flask_app.app_context():
        if validate_only:
            validate_existing_equivalencies(db, Course, Equivalency)
            return

        if not os.path.exists(csv_path):
            print(f"[error] CSV not found: {csv_path}")
            print(f"  Run extract_articulation_matrix.py first to produce this file.")
            sys.exit(1)

        stats = {
            'ccn_created': 0, 'ccn_updated': 0, 'ccn_found': 0,
            'local_created': 0, 'local_updated': 0, 'local_found': 0,
            'equiv_created': 0, 'equiv_found': 0,
            'wildcard_equiv_created': 0,
            'skipped': 0, 'errors': [],
        }

        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        print(f"[import] Processing {len(rows)} CCN rows …")

        for row in rows:
            ccn_code = row.get('ccn', '').strip()
            ccn_title = row.get('ccn_title', '').strip()

            if not ccn_code:
                stats['skipped'] += 1
                continue

            credits = ccn_to_credits(ccn_code)
            subj, num = split_code(ccn_code)

            # ---- 1. Upsert the CCN course ----
            ccn_course = Course.query.filter_by(
                subject_code=subj,
                course_number=num,
                institution=CCN_INSTITUTION
            ).first()

            if ccn_course:
                # Update title/description if we now have better data
                changed = False
                if ccn_title and ccn_course.title != ccn_title:
                    ccn_course.title = ccn_title
                    changed = True
                if not ccn_course.department:
                    ccn_course.department = 'Common Course Number'
                    changed = True
                if changed:
                    stats['ccn_updated'] += 1
                else:
                    stats['ccn_found'] += 1
            else:
                ccn_course = Course(
                    code=ccn_code,
                    title=ccn_title or ccn_code,
                    credits=credits,
                    institution=CCN_INSTITUTION,
                    department='Common Course Number',
                    description=f'Louisiana Common Course Number: {ccn_code}',
                )
                if not dry_run:
                    db.session.add(ccn_course)
                    db.session.flush()  # get id before referencing it
                stats['ccn_created'] += 1
                if dry_run:
                    print(f"  [dry-run] Would create CCN course: {ccn_code} — {ccn_title}")

            # ---- 2. For each institution column ----
            for inst_key in ALL_INSTITUTIONS:
                local_code_raw = row.get(inst_key, '').strip()
                if not local_code_raw:
                    continue

                inst_name = INSTITUTION_DISPLAY.get(inst_key, inst_key)

                if is_wildcard(local_code_raw):
                    # Subject recognised but no specific local course.
                    # Create a wildcard equivalency pointing to the CCN.
                    if not dry_run and ccn_course.id:
                        existing = Equivalency.query.filter_by(
                            from_course_id=ccn_course.id,
                            to_course_id=ccn_course.id,  # self-ref placeholder
                        ).first()
                        # Store wildcard as a note on the CCN course rather than
                        # a separate equivalency row to avoid foreign-key games.
                        # Better: store as a zero-credit "subject credit" course.
                        _upsert_wildcard(db, Course, Equivalency,
                                         local_code_raw, inst_name, ccn_course, stats, dry_run)
                    continue

                # Handle combined equivalencies like "ACCT 2101 & ACCT 2***"
                parts = [p.strip() for p in local_code_raw.split('&')]
                last_subj = ''  # track subject for bare-number parts
                for part in parts:
                    if not part:
                        continue
                    if is_wildcard(part):
                        _upsert_wildcard(db, Course, Equivalency,
                                         part, inst_name, ccn_course, stats, dry_run)
                        last_subj = part.split()[0].upper() if part.split() else last_subj
                        continue
                    # If this is a bare number (from '&' split), prepend last subject
                    if re.match(r'^\d+[A-Za-z]*$', part.strip()) and last_subj:
                        part = f"{last_subj} {part.strip()}"
                    try:
                        _upsert_local_and_equiv(
                            db, Course, Equivalency,
                            part, inst_name, ccn_course, credits, stats, dry_run
                        )
                        # Remember subject for next bare-number part
                        s, _ = split_code(part)
                        if s:
                            last_subj = s
                    except Exception as e:
                        stats['errors'].append(f"{part!r} @ {inst_name}: {e}")
                        db.session.rollback()  # discard the failed flush
                        continue

        if not dry_run:
            try:
                db.session.commit()
                print("[import] Committed.")
            except Exception as e:
                db.session.rollback()
                print(f"[import] ERROR on commit: {e}")
                return

        print("\n[import] Summary:")
        print(f"  CCN courses created : {stats['ccn_created']}")
        print(f"  CCN courses updated : {stats['ccn_updated']}")
        print(f"  CCN courses found   : {stats['ccn_found']}")
        print(f"  Local courses created: {stats['local_created']}")
        print(f"  Local courses updated: {stats['local_updated']}")
        print(f"  Local courses found  : {stats['local_found']}")
        print(f"  Equivalencies created: {stats['equiv_created']}")
        print(f"  Equivalencies found  : {stats['equiv_found']}")
        print(f"  Wildcard equivs      : {stats['wildcard_equiv_created']}")
        print(f"  Rows skipped         : {stats['skipped']}")
        if stats['errors']:
            print(f"  Errors ({len(stats['errors'])}):")
            for e in stats['errors'][:20]:
                print(f"    {e}")

        # Run validation after seeding
        if not dry_run:
            print("\n[validate] Checking existing equivalencies against CCN data …")
            validate_existing_equivalencies(db, Course, Equivalency)


def _upsert_local_and_equiv(db, Course, Equivalency,
                             local_code_raw, inst_name, ccn_course, credits, stats, dry_run):
    subj, num = split_code(local_code_raw)
    if not subj:
        stats['errors'].append(f"Could not parse local code: {local_code_raw!r} at {inst_name}")
        return

    # Guard: subject_code and course_number columns are varchar(20)
    if len(subj) > 20 or len(num) > 20:
        stats['errors'].append(f"Parsed code too long: subj={subj!r} num={num!r} from {local_code_raw!r} at {inst_name}")
        return

    # For generic designations (GSOC 3) the "num" is a credit count, not a course number
    is_gen = is_generic(local_code_raw) or is_generic(f"{subj} {num}")
    if is_gen:
        course_num = 'GEN'
        cred = int(num) if num.isdigit() else credits
    else:
        course_num = num or '0'
        cred = credits

    local_course = Course.query.filter_by(
        subject_code=subj,
        course_number=course_num,
        institution=inst_name
    ).first()

    desc = 'Generic credit award' if is_gen else 'Imported from Louisiana Articulation Matrix'

    if local_course:
        # Upsert: update fields that may be stale
        changed = False
        if not local_course.department:
            local_course.department = subj
            changed = True
        # Only update credits from the matrix for generic credit courses;
        # for real courses, trust what's already in the DB unless it's 0
        if is_gen and local_course.credits != cred:
            local_course.credits = cred
            changed = True
        elif local_course.credits == 0 and cred > 0:
            local_course.credits = cred
            changed = True
        if changed:
            stats['local_updated'] += 1
        else:
            stats['local_found'] += 1
    else:
        code_str = f"{subj} {course_num}".strip()
        local_course = Course(
            code=code_str,
            subject_code=subj,
            course_number=course_num,
            title=local_code_raw,
            credits=cred,
            institution=inst_name,
            department=subj,
            description=desc,
        )
        if not dry_run:
            db.session.add(local_course)
            db.session.flush()
        stats['local_created'] += 1
        if dry_run:
            print(f"  [dry-run] Would create local course: {local_code_raw} @ {inst_name}")

    if dry_run or not (local_course.id and ccn_course.id):
        return

    existing = Equivalency.query.filter_by(
        from_course_id=local_course.id,
        to_course_id=ccn_course.id
    ).first()

    if existing:
        stats['equiv_found'] += 1
    else:
        equiv = Equivalency(
            from_course_id=local_course.id,
            to_course_id=ccn_course.id,
            equivalency_type='articulation',
            notes='Louisiana Articulation Matrix AY 2022-2023',
            approved_by='Louisiana Board of Regents',
        )
        db.session.add(equiv)
        stats['equiv_created'] += 1


def _upsert_wildcard(db, Course, Equivalency,
                     wildcard_raw, inst_name, ccn_course, stats, dry_run):
    """
    For wildcard values like 'ACCT ***', create a placeholder Course with
    course_number='***' to record that the subject is recognised at this
    institution without a specific course.
    """
    subj = wildcard_raw.split()[0].upper()
    if not dry_run and ccn_course.id:
        placeholder = Course.query.filter_by(
            subject_code=subj,
            course_number='***',
            institution=inst_name
        ).first()
        if not placeholder:
            placeholder = Course(
                code=f'{subj} ***',
                subject_code=subj,
                course_number='***',
                title=f'{subj} — Subject Credit (No Direct Equivalent)',
                credits=0,
                institution=inst_name,
                department=subj,
                description='Wildcard: subject area recognised, no direct course equivalent',
            )
            db.session.add(placeholder)
            db.session.flush()
            stats['local_created'] += 1

        if placeholder and placeholder.id:
            existing = Equivalency.query.filter_by(
                from_course_id=placeholder.id,
                to_course_id=ccn_course.id
            ).first()
            if not existing:
                db.session.add(Equivalency(
                    from_course_id=placeholder.id,
                    to_course_id=ccn_course.id,
                    equivalency_type='subject_area',
                    notes='Wildcard: subject recognised, no direct equivalent',
                    approved_by='Louisiana Board of Regents',
                ))
                stats['wildcard_equiv_created'] += 1


# ---------------------------------------------------------------------------
# Validation: check existing manual equivalencies against CCN data
# ---------------------------------------------------------------------------

def validate_existing_equivalencies(db, Course, Equivalency):
    """
    For every non-articulation Equivalency in the DB, check if both sides
    have 'articulation' equivalency chains to CCN courses.  If they do but
    the CCNs differ, flag as a mismatch.
    """
    # Build a map: course_id → set of CCN course ids it maps to
    ccn_course_ids = set(
        c.id for c in Course.query.filter_by(institution=CCN_INSTITUTION).all()
    )

    # articulation equivs: local → ccn
    art_equivs = Equivalency.query.filter_by(equivalency_type='articulation').all()
    local_to_ccns: dict[int, set[int]] = {}
    for eq in art_equivs:
        local_to_ccns.setdefault(eq.from_course_id, set()).add(eq.to_course_id)

    # Now check manual equivalencies
    manual_equivs = Equivalency.query.filter(
        Equivalency.equivalency_type.notin_(['articulation', 'subject_area', 'no_equiv'])
    ).all()

    mismatches = []
    no_ccn = []

    for eq in manual_equivs:
        from_ccns = local_to_ccns.get(eq.from_course_id, set())
        to_ccns   = local_to_ccns.get(eq.to_course_id, set())

        if not from_ccns and not to_ccns:
            continue  # Neither side has CCN data yet; skip

        if from_ccns and to_ccns:
            # Both sides have CCN mappings — check for overlap
            if from_ccns.isdisjoint(to_ccns):
                from_c = db.session.get(Course, eq.from_course_id)
                to_c   = db.session.get(Course, eq.to_course_id)
                mismatches.append({
                    'equiv_id': eq.id,
                    'from': f"{from_c.code} @ {from_c.institution}" if from_c else f"id:{eq.from_course_id}",
                    'to':   f"{to_c.code} @ {to_c.institution}" if to_c else f"id:{eq.to_course_id}",
                    'from_ccns': [db.session.get(Course, cid).code for cid in from_ccns if db.session.get(Course, cid)],
                    'to_ccns':   [db.session.get(Course, cid).code for cid in to_ccns   if db.session.get(Course, cid)],
                })
        else:
            # Only one side has CCN data
            no_ccn.append(eq.id)

    print(f"  Manual equivalencies checked : {len(manual_equivs)}")
    print(f"  CCN mismatches found         : {len(mismatches)}")
    print(f"  One-sided (no CCN yet)       : {len(no_ccn)}")

    if mismatches:
        print("\n  [WARNING] Possible mis-mapped equivalencies:")
        for m in mismatches:
            print(f"    Equiv #{m['equiv_id']}: {m['from']} ↔ {m['to']}")
            print(f"      From CCNs: {m['from_ccns']}")
            print(f"      To CCNs  : {m['to_ccns']}")

    if not mismatches:
        print("  All checked equivalencies are consistent with the CCN mapping.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    csv_path = DEFAULT_CSV
    dry_run = False
    validate_only = False

    for arg in sys.argv[1:]:
        if arg == '--dry-run':
            dry_run = True
        elif arg == '--validate-only':
            validate_only = True
        else:
            csv_path = arg

    if dry_run:
        print("[import] DRY RUN — no changes will be written to the database")

    import_matrix(csv_path, dry_run=dry_run, validate_only=validate_only)


if __name__ == '__main__':
    main()
