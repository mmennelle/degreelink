from flask import Blueprint, request, jsonify
from models import db, Course
from sqlalchemy import or_

bp = Blueprint('courses', __name__, url_prefix='/api/courses')

@bp.route('', methods=['GET'])
def get_courses():
    
    search = request.args.get('search', '')
    institution = request.args.get('institution', '')
    department = request.args.get('department', '')
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    
    query = Course.query
    
    
    if search:
        query = query.filter(
            or_(
                Course.code.ilike(f'%{search}%'),
                Course.title.ilike(f'%{search}%'),
                Course.description.ilike(f'%{search}%')
            )
        )
    
    if institution:
        query = query.filter(Course.institution.ilike(f'%{institution}%'))
    
    if department:
        query = query.filter(Course.department.ilike(f'%{department}%'))
    
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
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
    
    
    equivalencies = []
    for equiv in course.equivalent_from:
        equivalencies.append({
            'type': 'equivalent_to',
            'course': equiv.to_course.to_dict(),
            'equivalency': equiv.to_dict()
        })
    
    for equiv in course.equivalent_to:
        equivalencies.append({
            'type': 'equivalent_from',
            'course': equiv.from_course.to_dict(),
            'equivalency': equiv.to_dict()
        })
    
    return jsonify({
        'course': course.to_dict(),
        'equivalencies': equivalencies
    })

@bp.route('', methods=['POST'])
def create_course():
    
    data = request.get_json()
    
    course = Course(
        code=data.get('code'),
        title=data.get('title'),
        description=data.get('description', ''),
        credits=data.get('credits'),
        institution=data.get('institution'),
        department=data.get('department', ''),
        prerequisites=data.get('prerequisites', '')
    )
    
    
    errors = course.validate()
    if errors:
        return jsonify({'errors': errors}), 400
    
    try:
        db.session.add(course)
        db.session.commit()
        return jsonify(course.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create course'}), 500

@bp.route('/<int:course_id>', methods=['PUT'])
def update_course(course_id):
    
    course = Course.query.get_or_404(course_id)
    data = request.get_json()
    
    
    course.code = data.get('code', course.code)
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
    except Exception as e:
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
