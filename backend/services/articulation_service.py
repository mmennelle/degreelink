"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

"""Articulation matrix validation service.

Provides helpers that cross-reference equivalency operations against the
Louisiana Articulation Matrix data stored in the database.  All functions
are *advisory* — they return warnings but never block the caller.
"""
from __future__ import annotations

from typing import Optional, List, Dict, Any
from models import db, Course, Equivalency

CCN_INSTITUTION = 'Louisiana Board of Regents'


# ---------------------------------------------------------------------------
# Core lookup helpers
# ---------------------------------------------------------------------------

def get_ccn_equivalency(from_course_id: int, to_course_id: int) -> Optional[Equivalency]:
    """Return the articulation-matrix equivalency linking these two courses, if any.

    The matrix stores rows as  local_course → CCN_course  with
    equivalency_type in ('articulation', 'subject_area').
    We check both directions so callers don't need to know which is from/to.
    """
    eq = Equivalency.query.filter(
        Equivalency.equivalency_type.in_(['articulation', 'subject_area']),
        db.or_(
            db.and_(Equivalency.from_course_id == from_course_id, Equivalency.to_course_id == to_course_id),
            db.and_(Equivalency.from_course_id == to_course_id, Equivalency.to_course_id == from_course_id),
        )
    ).first()
    return eq


def get_matrix_equivalencies_for_course(course_id: int) -> List[Equivalency]:
    """Return all articulation-matrix equivalencies involving a course.

    This finds both directions:
    - course is a local course that maps TO a CCN course
    - course is a CCN course that local courses map FROM
    """
    return Equivalency.query.filter(
        Equivalency.equivalency_type.in_(['articulation', 'subject_area']),
        db.or_(
            Equivalency.from_course_id == course_id,
            Equivalency.to_course_id == course_id,
        )
    ).all()


def is_matrix_backed(equiv: Equivalency) -> bool:
    """True if this equivalency was created by the articulation matrix import."""
    return equiv.equivalency_type in ('articulation', 'subject_area')


def course_is_ccn(course: Course) -> bool:
    """True if the course belongs to the CCN institution."""
    return course.institution == CCN_INSTITUTION


# ---------------------------------------------------------------------------
# Validation: single equivalency operations
# ---------------------------------------------------------------------------

def check_edit_conflict(equiv_id: int, proposed_changes: dict) -> Optional[Dict[str, Any]]:
    """Check if editing an equivalency conflicts with the articulation matrix.

    Returns a warning dict if conflicts found, or None.
    """
    equiv = Equivalency.query.get(equiv_id)
    if not equiv:
        return None

    if not is_matrix_backed(equiv):
        # Not a matrix equivalency — check if the change would contradict one
        return _check_contradicts_matrix(equiv, proposed_changes)

    # The equivalency IS matrix-backed — warn they're overriding official data
    from_course = Course.query.get(equiv.from_course_id)
    to_course = Course.query.get(equiv.to_course_id)

    changes_desc = []
    if 'equivalency_type' in proposed_changes and proposed_changes['equivalency_type'] != equiv.equivalency_type:
        changes_desc.append(f"type: {equiv.equivalency_type} → {proposed_changes['equivalency_type']}")

    if not changes_desc:
        return None

    return {
        'type': 'matrix_override',
        'severity': 'warning',
        'message': (
            f"This equivalency is defined by the Louisiana Articulation Matrix. "
            f"Changing it may cause it to no longer align with statewide transfer policy."
        ),
        'details': {
            'from_course': from_course.code if from_course else str(equiv.from_course_id),
            'to_course': to_course.code if to_course else str(equiv.to_course_id),
            'original_type': equiv.equivalency_type,
            'proposed_changes': changes_desc,
            'matrix_notes': equiv.notes,
        }
    }


def check_delete_conflict(equiv_id: int) -> Optional[Dict[str, Any]]:
    """Check if deleting an equivalency removes a matrix-backed record.

    Returns a warning dict if the equivalency is matrix-backed, or None.
    """
    equiv = Equivalency.query.get(equiv_id)
    if not equiv:
        return None

    if not is_matrix_backed(equiv):
        return None

    from_course = Course.query.get(equiv.from_course_id)
    to_course = Course.query.get(equiv.to_course_id)

    return {
        'type': 'matrix_delete',
        'severity': 'warning',
        'message': (
            f"This equivalency is defined by the Louisiana Articulation Matrix. "
            f"Deleting it will remove an officially recognised statewide transfer pathway."
        ),
        'details': {
            'from_course': from_course.code if from_course else str(equiv.from_course_id),
            'to_course': to_course.code if to_course else str(equiv.to_course_id),
            'equivalency_type': equiv.equivalency_type,
            'matrix_notes': equiv.notes,
        }
    }


def _check_contradicts_matrix(equiv: Equivalency, proposed_changes: dict) -> Optional[Dict[str, Any]]:
    """Check if a non-matrix equivalency edit creates a contradiction.

    For example, if the matrix says course A → CCN X, and the advisor is
    creating/editing an equivalency that says A → B (not X), that's worth
    noting (but allowed).
    """
    # Not currently enforced — reserved for future use
    return None


# ---------------------------------------------------------------------------
# Validation: batch (CSV upload)
# ---------------------------------------------------------------------------

def validate_equivalencies_against_matrix(equiv_rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Cross-check a list of proposed equivalency rows against the matrix.

    Each row should have: from_course_id, to_course_id, equivalency_type.
    Returns a list of warning dicts for rows that conflict.
    """
    warnings = []

    for i, row in enumerate(equiv_rows):
        from_id = row.get('from_course_id')
        to_id = row.get('to_course_id')
        proposed_type = row.get('equivalency_type', 'direct')
        row_num = row.get('row_num', i + 1)

        if not from_id or not to_id:
            continue

        # Check: does the matrix already say something different about this pair?
        matrix_eq = get_ccn_equivalency(from_id, to_id)
        if matrix_eq and matrix_eq.equivalency_type != proposed_type:
            from_course = Course.query.get(from_id)
            to_course = Course.query.get(to_id)
            warnings.append({
                'row': row_num,
                'type': 'matrix_type_mismatch',
                'message': (
                    f"Row {row_num}: Equivalency type '{proposed_type}' differs from "
                    f"articulation matrix type '{matrix_eq.equivalency_type}' for "
                    f"{from_course.code if from_course else from_id} → "
                    f"{to_course.code if to_course else to_id}"
                ),
            })
            continue

        # Check: does the matrix say from_course → some_other_CCN, but the CSV says from_course → different_course?
        # i.e., the from_course has a matrix mapping, but CSV maps it elsewhere
        from_matrix_eqs = Equivalency.query.filter(
            Equivalency.equivalency_type.in_(['articulation', 'subject_area']),
            Equivalency.from_course_id == from_id
        ).all()

        if from_matrix_eqs:
            matrix_to_ids = {eq.to_course_id for eq in from_matrix_eqs}
            if to_id not in matrix_to_ids:
                from_course = Course.query.get(from_id)
                to_course = Course.query.get(to_id)
                matrix_targets = []
                for eq in from_matrix_eqs:
                    tc = Course.query.get(eq.to_course_id)
                    if tc:
                        matrix_targets.append(tc.code)
                warnings.append({
                    'row': row_num,
                    'type': 'matrix_target_mismatch',
                    'message': (
                        f"Row {row_num}: {from_course.code if from_course else from_id} maps to "
                        f"{to_course.code if to_course else to_id} in CSV, but the articulation "
                        f"matrix maps it to {', '.join(matrix_targets)}"
                    ),
                })

    return warnings


# ---------------------------------------------------------------------------
# Plan enrichment: attach CCN info to plan courses
# ---------------------------------------------------------------------------

def enrich_plan_course(course_id: int) -> Optional[Dict[str, Any]]:
    """Return CCN transfer info for a course, if any matrix link exists.

    Returns a dict like:
    {
        'is_ccn_linked': True,
        'ccn_course': {'code': 'CMAT 1223', 'title': 'Trigonometry'},
        'transfer_scope': 'Louisiana Statewide',
        'matrix_year': 'AY 2022-2023'
    }
    or None if no matrix link exists.
    """
    # A course participates in the matrix as a from_course → CCN_course
    matrix_eqs = Equivalency.query.filter(
        Equivalency.equivalency_type.in_(['articulation', 'subject_area']),
        Equivalency.from_course_id == course_id
    ).all()

    if not matrix_eqs:
        return None

    # Pick the first articulation (preference) or subject_area link
    best = None
    for eq in matrix_eqs:
        if eq.equivalency_type == 'articulation':
            best = eq
            break
    if not best:
        best = matrix_eqs[0]

    ccn_course = Course.query.get(best.to_course_id)
    if not ccn_course:
        return None

    # Extract year from notes (e.g. "Louisiana Articulation Matrix AY 2022-2023")
    matrix_year = None
    if best.notes:
        import re
        m = re.search(r'AY\s+(\d{4}-\d{4})', best.notes)
        if m:
            matrix_year = f'AY {m.group(1)}'

    return {
        'is_ccn_linked': True,
        'ccn_course': {
            'id': ccn_course.id,
            'code': ccn_course.code,
            'title': ccn_course.title,
        },
        'transfer_scope': 'Louisiana Statewide',
        'equivalency_type': best.equivalency_type,
        'matrix_year': matrix_year,
    }


def enrich_plan_courses_batch(course_ids: List[int]) -> Dict[int, Dict[str, Any]]:
    """Batch version of enrich_plan_course. Returns {course_id: ccn_info}."""
    if not course_ids:
        return {}

    # Single query: all matrix equivalencies where from_course_id is in our list
    matrix_eqs = Equivalency.query.filter(
        Equivalency.equivalency_type.in_(['articulation', 'subject_area']),
        Equivalency.from_course_id.in_(course_ids)
    ).all()

    if not matrix_eqs:
        return {}

    # Group by from_course_id, pick best per course
    from collections import defaultdict
    import re

    by_course = defaultdict(list)
    for eq in matrix_eqs:
        by_course[eq.from_course_id].append(eq)

    # Collect all CCN course IDs we need
    ccn_ids = set()
    for eqs in by_course.values():
        for eq in eqs:
            ccn_ids.add(eq.to_course_id)

    # Batch load CCN courses
    ccn_courses = {c.id: c for c in Course.query.filter(Course.id.in_(ccn_ids)).all()} if ccn_ids else {}

    result = {}
    for cid, eqs in by_course.items():
        # Prefer articulation over subject_area
        best = next((eq for eq in eqs if eq.equivalency_type == 'articulation'), eqs[0])
        ccn = ccn_courses.get(best.to_course_id)
        if not ccn:
            continue

        matrix_year = None
        if best.notes:
            m = re.search(r'AY\s+(\d{4}-\d{4})', best.notes)
            if m:
                matrix_year = f'AY {m.group(1)}'

        result[cid] = {
            'is_ccn_linked': True,
            'ccn_course': {
                'id': ccn.id,
                'code': ccn.code,
                'title': ccn.title,
            },
            'transfer_scope': 'Louisiana Statewide',
            'equivalency_type': best.equivalency_type,
            'matrix_year': matrix_year,
        }

    return result
