"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

Articulation Matrix routes.

Endpoints:
    POST /api/articulation/upload/preview     Preview a matrix CSV upload (admin)
    POST /api/articulation/upload             Commit a matrix CSV upload (admin)
    GET  /api/articulation/institutions       List all institutions in the matrix
    GET  /api/articulation/ccn                List all CCN courses (paginated)
    GET  /api/articulation/lookup             Lookup a course's CCN and cross-institution equivalents
    GET  /api/articulation/validate           Validate existing equivalencies against CCN data

Matrix CSV format (produced by extract_articulation_matrix.py):
    ccn, ccn_title, BPCC, BRCC, CLTCC, DCC, FTCC, LDCC,
    NCC, NTCC, RPCC, SLCC, STCC, LSU_AM, LSUA, LSUE,
    LSUS, GSU, LA_TECH, MCNEESE, NICHOLLS, NSU, SLU, ULL, ULM,
    UNO, SU_AM, SUNO, SUSLA
"""

from flask import Blueprint, request, jsonify
from auth import require_admin
from models import db, Course, Equivalency
import csv
import io
import re


bp = Blueprint('articulation', __name__, url_prefix='/api/articulation')

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CCN_INSTITUTION = 'Louisiana Board of Regents'

ALL_INSTITUTION_KEYS = [
    'BPCC', 'BRCC', 'CLTCC', 'DCC', 'FTCC', 'LDCC',
    'NCC', 'NTCC', 'RPCC', 'SLCC', 'STCC',
    'LSU_AM', 'LSUA', 'LSUE', 'LSUS', 'GSU', 'LA_TECH',
    'MCNEESE', 'NICHOLLS', 'NSU', 'SLU', 'ULL', 'ULM',
    'UNO', 'SU_AM', 'SUNO', 'SUSLA',
]

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

# Reverse: display name → key
DISPLAY_TO_KEY = {v.lower(): k for k, v in INSTITUTION_DISPLAY.items()}


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def _normalise_cell(raw: str) -> str:
    if not raw:
        return ''
    value = re.sub(r'\s+', ' ', raw.strip())
    if re.match(r'^[_\s]+$', value):
        return ''
    value = re.sub(r'\((\d+)\)', r'\1', value)
    return value.strip()


def _is_wildcard(value: str) -> bool:
    return bool(value) and '***' in value


def _is_generic(value: str) -> bool:
    generic = {'GSOC', 'GNAT', 'GFAR', 'GMAT', 'GHUM', 'GBUS', 'GLAN'}
    parts = value.strip().split()
    return len(parts) >= 1 and parts[0].upper() in generic


def _ccn_credits(ccn: str) -> int:
    m = re.search(r'(\d{4})', ccn)
    if m:
        last = int(m.group(1)[-1])
        return last if last > 0 else 1
    return 3


def _split_code(code: str):
    code = code.strip()
    match = re.match(r'^([A-Za-z]+)[\s-]*([0-9]+[A-Za-z]*)?$', code)
    if match:
        return (match.group(1) or '').upper(), (match.group(2) or '').upper()
    return code.upper(), ''


# ---------------------------------------------------------------------------
# Core upsert helpers (shared by preview and commit)
# ---------------------------------------------------------------------------

def _process_matrix_rows(rows: list[dict], commit: bool = False) -> dict:
    """
    Process a list of matrix row-dicts.  If commit=True, writes to DB.
    Returns a stats/preview dict.
    """
    stats = {
        'ccn_created': 0, 'ccn_updated': 0, 'ccn_existing': 0,
        'local_created': 0, 'local_updated': 0, 'local_existing': 0,
        'equiv_created': 0, 'equiv_existing': 0,
        'wildcard_noted': 0,
        'errors': [], 'warnings': [],
        'preview_rows': [],
    }

    for row in rows:
        ccn_code  = row.get('ccn', '').strip()
        ccn_title = row.get('ccn_title', '').strip()
        if not ccn_code:
            continue

        credits  = _ccn_credits(ccn_code)
        subj, num = _split_code(ccn_code)

        ccn_course = Course.query.filter_by(
            subject_code=subj,
            course_number=num,
            institution=CCN_INSTITUTION
        ).first()

        preview_row = {'ccn': ccn_code, 'ccn_title': ccn_title, 'institutions': {}}

        if ccn_course:
            # Upsert: refresh title/department if we have better data
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
                stats['ccn_existing'] += 1
        else:
            ccn_course = Course(
                code=ccn_code,
                title=ccn_title or ccn_code,
                credits=credits,
                institution=CCN_INSTITUTION,
                department='Common Course Number',
                description=f'Louisiana Common Course Number: {ccn_code}',
            )
            if commit:
                db.session.add(ccn_course)
                db.session.flush()
            stats['ccn_created'] += 1

        for inst_key in ALL_INSTITUTION_KEYS:
            raw_val = _normalise_cell(row.get(inst_key, ''))
            if not raw_val:
                continue

            inst_name = INSTITUTION_DISPLAY.get(inst_key, inst_key)
            cell_status = []

            parts = [p.strip() for p in raw_val.split('&')]
            for part in parts:
                if _is_wildcard(part):
                    stats['wildcard_noted'] += 1
                    cell_status.append({'code': part, 'type': 'wildcard'})
                    if commit and ccn_course.id:
                        _commit_wildcard(part, inst_name, ccn_course, stats)
                    continue

                subj_l, num_l = _split_code(part)
                if not subj_l:
                    stats['errors'].append(f"Cannot parse '{part}' at {inst_key}")
                    continue

                is_gen = _is_generic(part)
                course_num   = 'GEN' if is_gen else (num_l or '0')
                course_cred  = int(num_l) if is_gen and num_l.isdigit() else credits

                existing_local = Course.query.filter_by(
                    subject_code=subj_l,
                    course_number=course_num,
                    institution=inst_name
                ).first()

                desc = 'Generic credit award' if is_gen else 'Imported from Louisiana Articulation Matrix'

                if existing_local:
                    # Upsert: update missing department
                    changed = False
                    if not existing_local.department:
                        existing_local.department = subj_l
                        changed = True
                    if is_gen and existing_local.credits != course_cred:
                        existing_local.credits = course_cred
                        changed = True
                    elif existing_local.credits == 0 and course_cred > 0:
                        existing_local.credits = course_cred
                        changed = True
                    if changed:
                        stats['local_updated'] += 1
                    else:
                        stats['local_existing'] += 1
                    local_course = existing_local
                    cell_status.append({'code': part, 'type': 'existing_local' if not changed else 'updated_local'})
                else:
                    local_course = Course(
                        code=f'{subj_l} {course_num}'.strip(),
                        title=part,
                        credits=course_cred,
                        institution=inst_name,
                        department=subj_l,
                        description=desc,
                    )
                    if commit:
                        db.session.add(local_course)
                        db.session.flush()
                    stats['local_created'] += 1
                    cell_status.append({'code': part, 'type': 'new_local'})

                if commit and local_course.id and ccn_course.id:
                    existing_eq = Equivalency.query.filter_by(
                        from_course_id=local_course.id,
                        to_course_id=ccn_course.id
                    ).first()
                    if existing_eq:
                        stats['equiv_existing'] += 1
                    else:
                        db.session.add(Equivalency(
                            from_course_id=local_course.id,
                            to_course_id=ccn_course.id,
                            equivalency_type='articulation',
                            notes='Louisiana Articulation Matrix AY 2022-2023',
                            approved_by='Louisiana Board of Regents',
                        ))
                        stats['equiv_created'] += 1

            if cell_status:
                preview_row['institutions'][inst_key] = cell_status

        stats['preview_rows'].append(preview_row)

    return stats


def _commit_wildcard(wildcard_raw: str, inst_name: str, ccn_course, stats: dict):
    subj = wildcard_raw.split()[0].upper()
    placeholder = Course.query.filter_by(
        subject_code=subj,
        course_number='***',
        institution=inst_name
    ).first()
    if not placeholder:
        placeholder = Course(
            code=f'{subj} ***',
            title=f'{subj} — Subject Credit (No Direct Equivalent)',
            credits=0,
            institution=inst_name,
            department=subj,
            description='Wildcard: subject area recognised, no specific course equivalent',
        )
        db.session.add(placeholder)
        db.session.flush()
        stats['local_created'] += 1

    if placeholder.id:
        existing = Equivalency.query.filter_by(
            from_course_id=placeholder.id,
            to_course_id=ccn_course.id
        ).first()
        if not existing:
            db.session.add(Equivalency(
                from_course_id=placeholder.id,
                to_course_id=ccn_course.id,
                equivalency_type='subject_area',
                notes='Wildcard: subject recognised, no direct course equivalent',
                approved_by='Louisiana Board of Regents',
            ))
            stats['equiv_created'] += 1


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@bp.route('/institutions', methods=['GET'])
def list_institutions():
    """Return all institutions known from the articulation matrix."""
    return jsonify({
        'institutions': [
            {'key': k, 'name': INSTITUTION_DISPLAY[k]}
            for k in ALL_INSTITUTION_KEYS
        ],
        'ccn_institution': CCN_INSTITUTION,
    })


@bp.route('/ccn', methods=['GET'])
def list_ccn_courses():
    """Return all CCN courses (Common Course Numbers), paginated."""
    page     = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 100, type=int), 500)
    subject  = request.args.get('subject', '').strip().upper()

    query = Course.query.filter_by(institution=CCN_INSTITUTION)
    if subject:
        query = query.filter(Course.subject_code == subject)

    query = query.order_by(Course.subject_code, Course.course_number)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'ccn_courses': [c.to_dict() for c in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
        }
    })


@bp.route('/lookup', methods=['GET'])
def lookup_course():
    """
    Given a course code + institution (or a CCN code), return:
      - the matching CCN course(s)
      - all cross-institution equivalents from the matrix
      - a flag indicating whether existing manual equivalencies are
        consistent with the CCN mapping

    Query params:
        course_code  - e.g. "ACCT 205"  (required unless ccn given)
        institution  - e.g. "Delgado Community College" or "DCC"  (required unless ccn given)
        ccn          - e.g. "CACC 2113"  (alternative: look up by CCN directly)
    """
    course_code  = request.args.get('course_code', '').strip()
    institution  = request.args.get('institution', '').strip()
    ccn_param    = request.args.get('ccn', '').strip()

    if not course_code and not institution and not ccn_param:
        return jsonify({'error': 'Provide course_code + institution or ccn'}), 400

    ccn_courses = []

    if ccn_param:
        subj, num = _split_code(ccn_param)
        ccn_courses = Course.query.filter_by(
            subject_code=subj,
            course_number=num,
            institution=CCN_INSTITUTION
        ).all()
    else:
        # Resolve institution key → display name
        inst_display = institution
        if institution.upper() in INSTITUTION_DISPLAY:
            inst_display = INSTITUTION_DISPLAY[institution.upper()]
        else:
            # Try reverse lookup
            inst_display = DISPLAY_TO_KEY.get(institution.lower(), institution)
            if inst_display in INSTITUTION_DISPLAY:
                inst_display = INSTITUTION_DISPLAY[inst_display]

        # Find the local course
        subj_l, num_l = _split_code(course_code)
        local_course = Course.query.filter(
            Course.subject_code == subj_l,
            Course.course_number == num_l,
            Course.institution.ilike(inst_display)
        ).first()

        if not local_course:
            return jsonify({'error': f'Course {course_code} not found at {inst_display}'}), 404

        # Find its articulation equivalency → CCN
        art_equivs = Equivalency.query.filter(
            Equivalency.from_course_id == local_course.id,
            Equivalency.equivalency_type.in_(['articulation', 'subject_area'])
        ).all()

        ccn_courses = [db.session.get(Course, eq.to_course_id) for eq in art_equivs]
        ccn_courses = [c for c in ccn_courses if c and c.institution == CCN_INSTITUTION]

    if not ccn_courses:
        return jsonify({
            'message': 'No CCN mapping found for this course',
            'results': [],
        })

    result = []
    for ccn_course in ccn_courses:
        # Find all institution equivalents for this CCN
        all_equivs = Equivalency.query.filter(
            Equivalency.to_course_id == ccn_course.id,
            Equivalency.equivalency_type.in_(['articulation', 'subject_area'])
        ).all()

        cross = []
        for eq in all_equivs:
            local = db.session.get(Course, eq.from_course_id)
            if not local:
                continue
            # Resolve institution key
            inst_key = DISPLAY_TO_KEY.get(local.institution.lower(), '')
            cross.append({
                'institution_key': inst_key,
                'institution_name': local.institution,
                'course_code': local.code,
                'course_title': local.title,
                'credits': local.credits,
                'equivalency_type': eq.equivalency_type,
            })

        # Cross-check manual equivalencies
        validation = _validate_against_ccn(ccn_course)

        result.append({
            'ccn': ccn_course.to_dict(),
            'cross_institution': sorted(cross, key=lambda x: x['institution_key']),
            'validation': validation,
        })

    return jsonify({'results': result})


def _validate_against_ccn(ccn_course) -> dict:
    """
    Find all manual (non-articulation) equivalencies whose from_course or
    to_course has an articulation link to this CCN.  Return consistency info.
    """
    # courses that map TO this CCN
    art_links = Equivalency.query.filter_by(
        to_course_id=ccn_course.id,
        equivalency_type='articulation'
    ).all()
    linked_course_ids = {eq.from_course_id for eq in art_links}

    mismatches = []
    for cid in linked_course_ids:
        # Find manual equivalencies FROM this course
        manual = Equivalency.query.filter(
            Equivalency.from_course_id == cid,
            Equivalency.equivalency_type.notin_(['articulation', 'subject_area', 'no_equiv'])
        ).all()
        for meq in manual:
            # Does the to_course also have an articulation link to THIS CCN?
            to_link = Equivalency.query.filter_by(
                from_course_id=meq.to_course_id,
                to_course_id=ccn_course.id,
                equivalency_type='articulation'
            ).first()
            if not to_link:
                # Check if to_course has a different CCN
                other_art = Equivalency.query.filter(
                    Equivalency.from_course_id == meq.to_course_id,
                    Equivalency.equivalency_type == 'articulation'
                ).first()
                other_ccn = db.session.get(Course, other_art.to_course_id) if other_art else None
                from_c = db.session.get(Course, cid)
                to_c   = db.session.get(Course, meq.to_course_id)
                mismatches.append({
                    'equiv_id': meq.id,
                    'from_course': from_c.code if from_c else f'id:{cid}',
                    'to_course':   to_c.code if to_c else f'id:{meq.to_course_id}',
                    'to_course_ccn': other_ccn.code if other_ccn else None,
                })

    return {
        'consistent': len(mismatches) == 0,
        'mismatches': mismatches,
    }


@bp.route('/validate', methods=['GET'])
@require_admin
def validate_all():
    """
    Check every manual equivalency in the DB against CCN data.
    Returns equivalencies where the two sides map to different CCNs.
    """
    from sqlalchemy import and_

    # All articulation links: local_id → ccn_id
    art_equivs = Equivalency.query.filter_by(equivalency_type='articulation').all()
    local_to_ccns: dict[int, set[int]] = {}
    for eq in art_equivs:
        local_to_ccns.setdefault(eq.from_course_id, set()).add(eq.to_course_id)

    # All manual equivalencies
    manual = Equivalency.query.filter(
        Equivalency.equivalency_type.notin_(['articulation', 'subject_area', 'no_equiv'])
    ).all()

    consistent   = []
    mismatches   = []
    no_ccn_data  = []

    for eq in manual:
        from_ccns = local_to_ccns.get(eq.from_course_id, set())
        to_ccns   = local_to_ccns.get(eq.to_course_id,   set())

        from_c = db.session.get(Course, eq.from_course_id)
        to_c   = db.session.get(Course, eq.to_course_id)

        base = {
            'equiv_id': eq.id,
            'from_course': from_c.code if from_c else f'id:{eq.from_course_id}',
            'from_institution': from_c.institution if from_c else '',
            'to_course': to_c.code if to_c else f'id:{eq.to_course_id}',
            'to_institution': to_c.institution if to_c else '',
            'equivalency_type': eq.equivalency_type,
        }

        if not from_ccns and not to_ccns:
            no_ccn_data.append(base)
        elif from_ccns and to_ccns and from_ccns.isdisjoint(to_ccns):
            from_ccn_courses = [db.session.get(Course, cid) for cid in from_ccns]
            to_ccn_courses   = [db.session.get(Course, cid) for cid in to_ccns]
            mismatches.append({**base,
                'from_ccns': [c.code for c in from_ccn_courses if c],
                'to_ccns':   [c.code for c in to_ccn_courses   if c],
            })
        else:
            shared = from_ccns & to_ccns
            shared_courses = [db.session.get(Course, cid) for cid in shared]
            consistent.append({**base,
                'shared_ccns': [c.code for c in shared_courses if c],
            })

    return jsonify({
        'summary': {
            'total_manual': len(manual),
            'consistent': len(consistent),
            'mismatches': len(mismatches),
            'no_ccn_data': len(no_ccn_data),
        },
        'mismatches': mismatches,
        'consistent': consistent,
        'no_ccn_data': no_ccn_data,
    })


@bp.route('/upload/preview', methods=['POST'])
@require_admin
def preview_matrix_upload():
    """Preview importing an articulation matrix CSV without committing."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400

    try:
        stream = io.StringIO(file.stream.read().decode('UTF-8'), newline=None)
        reader = csv.DictReader(stream)
        rows = list(reader)
    except Exception as e:
        return jsonify({'error': f'Could not parse CSV: {e}'}), 400

    if not rows:
        return jsonify({'error': 'CSV is empty'}), 400

    # Validate columns
    missing = [c for c in ['ccn', 'ccn_title'] if c not in (rows[0] if rows else {})]
    if missing:
        return jsonify({'error': f'Missing required columns: {missing}'}), 400

    stats = _process_matrix_rows(rows, commit=False)

    return jsonify({
        'preview': {
            'total_ccn_rows': len(rows),
            'ccn_to_create': stats['ccn_created'],
            'ccn_to_update': stats['ccn_updated'],
            'ccn_existing': stats['ccn_existing'],
            'local_courses_to_create': stats['local_created'],
            'local_courses_to_update': stats['local_updated'],
            'local_courses_existing': stats['local_existing'],
            'equivalencies_to_create': stats['equiv_created'],
            'equivalencies_existing': stats['equiv_existing'],
            'wildcards': stats['wildcard_noted'],
            'errors': stats['errors'],
            'warnings': stats['warnings'],
        },
        'sample_rows': stats['preview_rows'][:10],
    })


@bp.route('/upload', methods=['POST'])
@require_admin
def upload_matrix():
    """Commit an articulation matrix CSV import."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400

    try:
        stream = io.StringIO(file.stream.read().decode('UTF-8'), newline=None)
        reader = csv.DictReader(stream)
        rows = list(reader)
    except Exception as e:
        return jsonify({'error': f'Could not parse CSV: {e}'}), 400

    if not rows:
        return jsonify({'error': 'CSV is empty'}), 400

    missing = [c for c in ['ccn', 'ccn_title'] if c not in (rows[0] if rows else {})]
    if missing:
        return jsonify({'error': f'Missing required columns: {missing}'}), 400

    try:
        stats = _process_matrix_rows(rows, commit=True)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Import failed: {str(e)}'}), 500

    return jsonify({
        'message': 'Articulation matrix imported successfully',
        'ccn_created': stats['ccn_created'],
        'ccn_updated': stats['ccn_updated'],
        'ccn_existing': stats['ccn_existing'],
        'local_courses_created': stats['local_created'],
        'local_courses_updated': stats['local_updated'],
        'local_courses_existing': stats['local_existing'],
        'equivalencies_created': stats['equiv_created'],
        'equivalencies_existing': stats['equiv_existing'],
        'wildcards_noted': stats['wildcard_noted'],
        'errors': stats['errors'],
    }), 201
