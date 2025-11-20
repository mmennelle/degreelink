"""Prerequisites API routes for checking course prerequisites with equivalency support."""

from flask import Blueprint, request, jsonify
from models import db
from models.course import Course
from models.plan import Plan, PlanCourse
from services.prerequisite_service import PrerequisiteService
from auth import require_admin

bp = Blueprint('prerequisites', __name__, url_prefix='/api/prerequisites')


@bp.route('/check/<course_code>', methods=['GET'])
@require_admin
def check_prerequisites(course_code):
    """
    Check if a student can take a course based on completed courses.
    
    Query parameters:
    - plan_id: ID of the student's plan (to get completed courses)
    - institution: Optional institution filter
    
    Returns validation results including missing prerequisites.
    """
    plan_id = request.args.get('plan_id', type=int)
    institution = request.args.get('institution')
    
    if not plan_id:
        return jsonify({'error': 'plan_id is required'}), 400
    
    # Get the student's plan
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    
    # Get completed courses
    completed_courses = PlanCourse.query.filter(
        PlanCourse.plan_id == plan_id,
        PlanCourse.status == 'completed'
    ).all()
    
    # Validate prerequisites
    result = PrerequisiteService.validate_prerequisites(
        course_code,
        completed_courses,
        institution
    )
    
    return jsonify(result)


@bp.route('/details/<course_code>', methods=['GET'])
@require_admin
def get_prerequisite_details(course_code):
    """
    Get detailed prerequisite information for a course.
    
    Query parameters:
    - institution: Optional institution filter
    
    Returns prerequisite details including equivalent courses.
    """
    institution = request.args.get('institution')
    
    result = PrerequisiteService.get_prerequisite_details(
        course_code,
        institution
    )
    
    return jsonify(result)


@bp.route('/validate-plan/<int:plan_id>', methods=['GET'])
@require_admin
def validate_plan_prerequisites(plan_id):
    """
    Validate all prerequisites for courses in a student's plan.
    
    Checks all courses in the plan (planned, in-progress, completed) against
    completed courses to identify any prerequisite violations.
    
    Returns a list of courses with prerequisite issues.
    """
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    
    # Get completed courses
    completed_courses = PlanCourse.query.filter(
        PlanCourse.plan_id == plan_id,
        PlanCourse.status == 'completed'
    ).all()
    
    # Get all plan courses that need prerequisite checking
    plan_courses = PlanCourse.query.filter(
        PlanCourse.plan_id == plan_id,
        PlanCourse.status.in_(['planned', 'in_progress', 'completed'])
    ).all()
    
    issues = []
    
    for plan_course in plan_courses:
        if not plan_course.course:
            continue
        
        # Validate prerequisites for this course
        validation = PrerequisiteService.validate_prerequisites(
            plan_course.course.code,
            completed_courses,
            plan_course.course.institution
        )
        
        if not validation['can_take'] and validation.get('missing_prerequisites'):
            issues.append({
                'course_code': plan_course.course.code,
                'course_title': plan_course.course.title,
                'status': plan_course.status,
                'semester': plan_course.semester,
                'year': plan_course.year,
                'missing_prerequisites': validation['missing_prerequisites'],
                'all_prerequisites': validation['all_prerequisites']
            })
    
    return jsonify({
        'plan_id': plan_id,
        'student_name': plan.student_name if hasattr(plan, 'student_name') else None,
        'issues': issues,
        'total_issues': len(issues)
    })


@bp.route('/suggest-next-courses/<int:plan_id>', methods=['GET'])
@require_admin
def suggest_next_courses(plan_id):
    """
    Suggest courses the student can take next based on completed prerequisites.
    
    Query parameters:
    - program_id: Filter by specific program requirements
    - limit: Maximum number of suggestions (default: 20)
    
    Returns courses from the student's program that they have prerequisites for.
    """
    plan = Plan.query.get(plan_id)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    
    program_id = request.args.get('program_id', type=int)
    limit = request.args.get('limit', type=int, default=20)
    
    # Get completed courses
    completed_courses = PlanCourse.query.filter(
        PlanCourse.plan_id == plan_id,
        PlanCourse.status == 'completed'
    ).all()
    
    # Get courses already in the plan
    plan_course_codes = {
        pc.course.code for pc in PlanCourse.query.filter(
            PlanCourse.plan_id == plan_id
        ).all() if pc.course
    }
    
    # Get all courses with prerequisites (if program_id specified, filter by program requirements)
    # For simplicity, just get all courses with prerequisites for now
    courses_with_prereqs = Course.query.filter(
        Course.prerequisites != None,
        Course.prerequisites != ''
    ).all()
    
    suggestions = []
    
    for course in courses_with_prereqs:
        # Skip if already in plan
        if course.code in plan_course_codes:
            continue
        
        # Check prerequisites
        validation = PrerequisiteService.validate_prerequisites(
            course.code,
            completed_courses,
            course.institution
        )
        
        if validation['can_take']:
            suggestions.append({
                'course_code': course.code,
                'course_title': course.title,
                'institution': course.institution,
                'credits': course.credits,
                'prerequisites': validation['all_prerequisites'],
                'satisfied_prerequisites': validation['satisfied_prerequisites']
            })
        
        if len(suggestions) >= limit:
            break
    
    return jsonify({
        'plan_id': plan_id,
        'suggestions': suggestions,
        'total_suggestions': len(suggestions)
    })
