from flask import Blueprint, request, jsonify
from models import db, Course, Equivalency
from sqlalchemy import or_

bp = Blueprint('courses', __name__, url_prefix='/api/courses')

@bp.route('', methods=['GET'])
def get_courses():

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

    if institution:
        query = query.filter(Course.institution.ilike(f'%{institution}%'))

    if department:
        query = query.filter(Course.department.ilike(f'%{department}%'))

    if subject:
        query = query.filter(Course.subject_code.ilike(subject.strip().upper()))

    if level is not None:
        # Only apply filter if level is a non‑negative integer
        if level < 0:
            return jsonify({'error': 'Level must be non‑negative'}), 400
        query = query.filter(Course.course_level == level)

    pagination = query.order_by(Course.subject_code, Course.course_number).paginate(page=page, per_page=per_page, error_out=False)
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
