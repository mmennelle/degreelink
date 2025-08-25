from flask import Blueprint, request, jsonify
from models import db, Course, Equivalency
from sqlalchemy import or_

bp = Blueprint('courses', __name__, url_prefix='/api/courses')

@bp.route('', methods=['GET'])
def get_courses():
    """
    Retrieve a paginated list of courses.  Clients may pass optional
    query parameters to filter the results:

    - search: full‑text search across code, subject, number, title and
      description fields (case‑insensitive).
    - institution: filter courses by institution (partial match).
    - department: filter courses by department (partial match).
    - subject: filter by subject prefix (exact match, case insensitive).
    - level: integer representing the thousand‑level (e.g. 1000, 2000).
      Courses with a course_level equal to the provided level will be
      returned.  Courses whose numeric part is below 1000 will have
      course_level = 0.
    - page/per_page: pagination controls.
    """

    search = request.args.get('search', '')
    institution = request.args.get('institution', '')
    department = request.args.get('department', '')
    subject = request.args.get('subject', '')
    level = request.args.get('level', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)

    query = Course.query

    # Full‑text search across multiple fields.  Includes legacy `code`
    # field as well as subject_code and course_number to allow users to
    # search for partial codes like "BIOL" or "1583".
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Course.code.ilike(term),
                Course.subject_code.ilike(term),
                Course.course_number.ilike(term),
                Course.title.ilike(term),
                Course.description.ilike(term)
            )
        )

    # Collect filters except institution first.  The institution filter
    # requires special handling to support abbreviation matching.
    inst_filter_value = institution.strip()

    if department:
        query = query.filter(Course.department.ilike(f'%{department}%'))

    if subject:
        query = query.filter(Course.subject_code.ilike(subject.strip().upper()))

    if level is not None:
        # Only apply filter if level is a non‑negative integer
        if level < 0:
            return jsonify({'error': 'Level must be non‑negative'}), 400
        query = query.filter(Course.course_level == level)

    # Order the base query before applying the institution filter so that
    # manual pagination maintains a consistent ordering.
    ordered_query = query.order_by(Course.subject_code, Course.course_number)

    # Custom institution filtering to support abbreviation search.  If the
    # client supplies an institution string, we will include any course
    # whose institution name contains the search term (case‑insensitive)
    # OR whose computed abbreviation matches the search term.  The
    # abbreviation is formed by taking the first letter of each word
    # (excluding common prepositions) in the institution name.
    def compute_abbreviation(name: str) -> str:
        import re
        preps = {'of', 'the', 'and', 'for', 'in', 'on', 'at', 'by', 'to', 'with', 'without', 'from', 'into', 'onto', 'over', 'under', 'a', 'an'}
        # Split on whitespace and punctuation
        words = re.split(r'\W+', name)
        initials = [w[0] for w in words if w and w.lower() not in preps]
        return ''.join(ch.upper() for ch in initials)

    if inst_filter_value:
        # Prepare the search term for comparison.  A lowercase version is
        # used for substring matching and an uppercase version (with
        # whitespace removed) is used as an abbreviation candidate.  We do
        # not run the search term through compute_abbreviation because
        # users entering an abbreviation (e.g. "UNO") already supply the
        # desired letters.
        inst_search_lower = inst_filter_value.lower()
        inst_search_abbrev = inst_filter_value.replace(' ', '').upper()
        all_courses = ordered_query.all()
        matching_courses = []
        for course in all_courses:
            inst_name = course.institution or ''
            # Check if the raw institution contains the search term
            if inst_search_lower in inst_name.lower():
                matching_courses.append(course)
                continue
            # Otherwise compare computed abbreviation of the institution
            course_abbrev = compute_abbreviation(inst_name)
            # Normalise the course abbreviation by removing whitespace and
            # punctuation (compute_abbreviation already removes punctuation)
            # and compare directly to the user‑supplied abbreviation.
            if course_abbrev == inst_search_abbrev:
                matching_courses.append(course)
        # Manual pagination
        total = len(matching_courses)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_courses = matching_courses[start_idx:end_idx]
        pages = (total + per_page - 1) // per_page if per_page else 1
        return jsonify({
            'courses': [c.to_dict() for c in paginated_courses],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': pages,
                'has_next': end_idx < total,
                'has_prev': start_idx > 0
            }
        })
    else:
        # No institution filter; rely on database pagination for performance
        pagination = ordered_query.paginate(page=page, per_page=per_page, error_out=False)
        courses = pagination.items
        return jsonify({
            'courses': [course.to_dict() for course in courses],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })

@bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    
    # Get all equivalency records for this course
    all_equivalencies = Equivalency.query.filter_by(from_course_id=course_id).all()
    
    if not all_equivalencies:
        return jsonify({
            'course': course.to_dict(),
            'equivalency_status': 'not_evaluated',
            'message': 'No equivalency information available for this course',
            'equivalencies': []
        })
    
    # Check for "no equivalent" records (target course code is 1000NE)
    no_equiv_records = []
    transfer_equivalencies = []
    
    for equiv in all_equivalencies:
        if equiv.to_course and equiv.to_course.code == '1000NE':
            no_equiv_records.append({
                'type': 'no_equivalent',
                'equivalency': equiv.to_dict(),
                'message': 'This course does not transfer'
            })
        elif equiv.to_course:
            transfer_equivalencies.append({
                'type': 'equivalent_to',
                'course': equiv.to_course.to_dict(),
                'equivalency': equiv.to_dict()
            })
    
    # Determine status and response
    if no_equiv_records and not transfer_equivalencies:
        return jsonify({
            'course': course.to_dict(),
            'equivalency_status': 'no_transfer',
            'message': 'Course has been evaluated and does not transfer',
            'equivalencies': no_equiv_records
        })
    elif transfer_equivalencies:
        return jsonify({
            'course': course.to_dict(),
            'equivalency_status': 'has_equivalents',
            'message': f'Course has {len(transfer_equivalencies)} equivalent(s)',
            'equivalencies': transfer_equivalencies + no_equiv_records
        })
    else:
        return jsonify({
            'course': course.to_dict(),
            'equivalency_status': 'unknown',
            'message': 'Equivalency records exist but are unclear',
            'equivalencies': []
        })


@bp.route('', methods=['POST'])
def create_course():
    data = request.get_json() or {}
    # Extract fields from JSON.  Accept both the legacy `code` and the
    # new `subject_code`/`course_number` combinations.  The Course
    # instance will normalise them via sync_composite_fields().
    code = data.get('code')
    subject_code = data.get('subject_code')
    course_number = data.get('course_number')

    course = Course(
        code=code or '',
        subject_code=subject_code or '',
        course_number=course_number or '',
        title=data.get('title'),
        description=data.get('description', ''),
        credits=data.get('credits'),
        institution=data.get('institution'),
        department=data.get('department', ''),
        prerequisites=data.get('prerequisites', '')
    )
    # Ensure composite fields and code are synchronised before validation
    course.sync_composite_fields()

    errors = course.validate()
    if errors:
        return jsonify({'errors': errors}), 400

    try:
        db.session.add(course)
        db.session.commit()
        return jsonify(course.to_dict()), 201
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to create course'}), 500

@bp.route('/<int:course_id>', methods=['PUT'])
def update_course(course_id):
    course = Course.query.get_or_404(course_id)
    data = request.get_json() or {}

    # Update legacy code or new composite fields if provided
    if 'code' in data:
        course.code = data['code'] or ''
    if 'subject_code' in data:
        course.subject_code = data['subject_code'] or ''
    if 'course_number' in data:
        course.course_number = data['course_number'] or ''

    # Synchronise code/subject/number/numeric/level
    course.sync_composite_fields()

    course.title = data.get('title', course.title)
    course.description = data.get('description', course.description)
    course.credits = data.get('credits', course.credits)
    course.institution = data.get('institution', course.institution)
    course.department = data.get('department', course.department)
    course.prerequisites = data.get('prerequisites', course.prerequisites)

    errors = course.validate()
    if errors:
        return jsonify({'errors': errors}), 400

    try:
        db.session.commit()
        return jsonify(course.to_dict())
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to update course'}), 500

@bp.route('/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    
    course = Course.query.get_or_404(course_id)
    
    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({'message': 'Course deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete course'}), 500
