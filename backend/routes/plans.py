from flask import Blueprint, request, jsonify
from models import db, Plan, PlanCourse, Program, Course

bp = Blueprint('plans', __name__, url_prefix='/api/plans')

@bp.route('', methods=['GET'])
def get_plans():
    
    student_email = request.args.get('student_email')
    program_id = request.args.get('program_id', type=int)
    
    query = Plan.query
    
    if student_email:
        query = query.filter(Plan.student_email.ilike(f'%{student_email}%'))
    
    if program_id:
        query = query.filter(Plan.program_id == program_id)
    
    plans = query.all()
    
    return jsonify({
        'plans': [plan.to_dict() for plan in plans]
    })

@bp.route('', methods=['POST'])
def create_plan():
    
    data = request.get_json()
    
    
    program = Program.query.get(data.get('program_id'))
    if not program:
        return jsonify({'error': 'Program not found'}), 404
    
    plan = Plan(
        student_name=data.get('student_name'),
        student_email=data.get('student_email'),
        program_id=data.get('program_id'),
        plan_name=data.get('plan_name'),
        status=data.get('status', 'draft')
    )
    
    try:
        db.session.add(plan)
        db.session.commit()
        return jsonify(plan.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create plan'}), 500
    
@bp.route('/<int:plan_id>', methods=['DELETE'])
def delete_plan(plan_id):
    """Delete a plan and all associated courses"""
    plan = Plan.query.get_or_404(plan_id)
    
    try:
        db.session.delete(plan)
        db.session.commit()
        return jsonify({'message': 'Plan deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete plan'}), 500

@bp.route('/<int:plan_id>/courses', methods=['POST'])
def add_course_to_plan(plan_id):
    
    plan = Plan.query.get_or_404(plan_id)
    data = request.get_json()
    
    
    course = Course.query.get(data.get('course_id'))
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    
    existing = PlanCourse.query.filter_by(
        plan_id=plan_id,
        course_id=data.get('course_id')
    ).first()
    
    if existing:
        return jsonify({'error': 'Course already in plan'}), 400
    
    plan_course = PlanCourse(
        plan_id=plan_id,
        course_id=data.get('course_id'),
        semester=data.get('semester'),
        year=data.get('year'),
        status=data.get('status', 'planned'),
        requirement_category=data.get('requirement_category'),
        notes=data.get('notes', '')
    )
    
    try:
        db.session.add(plan_course)
        db.session.commit()
        return jsonify(plan_course.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add course to plan'}), 500

@bp.route('/<int:plan_id>/courses/<int:plan_course_id>', methods=['PUT'])
def update_plan_course(plan_id, plan_course_id):
    
    plan_course = PlanCourse.query.filter_by(
        id=plan_course_id,
        plan_id=plan_id
    ).first_or_404()
    
    data = request.get_json()
    
    plan_course.semester = data.get('semester', plan_course.semester)
    plan_course.year = data.get('year', plan_course.year)
    plan_course.status = data.get('status', plan_course.status)
    plan_course.grade = data.get('grade', plan_course.grade)
    plan_course.requirement_category = data.get('requirement_category', plan_course.requirement_category)
    plan_course.notes = data.get('notes', plan_course.notes)
    
    try:
        db.session.commit()
        return jsonify(plan_course.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update course'}), 500

@bp.route('/<int:plan_id>/courses/<int:plan_course_id>', methods=['DELETE'])
def remove_course_from_plan(plan_id, plan_course_id):
    
    plan_course = PlanCourse.query.filter_by(
        id=plan_course_id,
        plan_id=plan_id
    ).first_or_404()
    
    try:
        db.session.delete(plan_course)
        db.session.commit()
        return jsonify({'message': 'Course removed from plan'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to remove course'}), 500
    
@bp.route('/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    
    plan = Plan.query.get_or_404(plan_id)
    
    plan_data = plan.to_dict()
    
    
    plan_data['progress'] = plan.calculate_progress()
    plan_data['unmet_requirements'] = plan.get_unmet_requirements()
    plan_data['course_suggestions'] = plan.suggest_courses_for_requirements()
    
    return jsonify(plan_data)

@bp.route('/<int:plan_id>/progress', methods=['GET'])
def get_plan_progress(plan_id):
    
    plan = Plan.query.get_or_404(plan_id)
    
    progress = plan.calculate_progress()
    
    return jsonify({
        'plan_id': plan_id,
        'progress': progress,
        'unmet_requirements': plan.get_unmet_requirements(),
        'suggestions': plan.suggest_courses_for_requirements()
    })