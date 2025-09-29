from flask import Blueprint, request, jsonify, session
from auth import require_admin
from models import db, Plan, PlanCourse, Program, Course
import secrets
import time
from functools import wraps
from services.progress_service import ProgressService

bp = Blueprint('plans', __name__, url_prefix='/api/plans')

# Security decorator for plan access
def require_plan_access(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        plan_id = kwargs.get('plan_id')
        plan_code = kwargs.get('plan_code')
        
        # Rate limiting for code attempts
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
        rate_limit_key = f"plan_access:{client_ip}"
        
        # Simple in-memory rate limiting (in production, use Redis)
        if not hasattr(require_plan_access, 'attempts'):
            require_plan_access.attempts = {}
        
        current_time = time.time()
        if rate_limit_key in require_plan_access.attempts:
            attempts = require_plan_access.attempts[rate_limit_key]
            # Remove old attempts (older than 1 hour)
            attempts = [t for t in attempts if current_time - t < 3600]
            
            # Check if too many attempts
            if len(attempts) >= 10:  # Max 10 attempts per hour
                return jsonify({'error': 'Too many access attempts. Please try again later.'}), 429
            
            require_plan_access.attempts[rate_limit_key] = attempts
        else:
            require_plan_access.attempts[rate_limit_key] = []
        
        # Log the attempt
        require_plan_access.attempts[rate_limit_key].append(current_time)
        
        return f(*args, **kwargs)
    return decorated_function

@bp.route('', methods=['GET'])
def get_plans():
    """REMOVED: No longer allow browsing all plans for security"""
    return jsonify({
        'error': 'Plan browsing not allowed. Use plan codes to access specific plans.',
        'message': 'For security reasons, plans can only be accessed individually using plan codes.'
    }), 403

@bp.route('/by-code/<plan_code>', methods=['GET'])
@require_plan_access
def get_plan_by_code(plan_code):
    """Get a plan using its 8-character secure code - MAIN ACCESS METHOD"""
    
    # Validate code format
    if not plan_code or len(plan_code.strip()) != 8:
        return jsonify({'error': 'Invalid plan code format'}), 400
    
    # Sanitize input
    clean_code = ''.join(c for c in plan_code.upper().strip() if c.isalnum())
    if len(clean_code) != 8:
        return jsonify({'error': 'Invalid plan code characters'}), 400
    
    # Find plan
    plan = Plan.find_by_code(clean_code)
    
    if not plan:
        return jsonify({'error': 'Plan not found or access denied'}), 404
    
    # Create temporary session for this plan access
    session['accessed_plan_id'] = plan.id
    session['access_time'] = time.time()
    
    # Return full plan data
    plan_data = plan.to_dict()
    svc = ProgressService(plan)
    try:
        plan_data['progress'] = svc.full_progress()
    except Exception:
        plan_data['progress_error'] = 'progress_calculation_failed'
    return jsonify(plan_data)

@bp.route('/verify-code/<plan_code>', methods=['GET'])
@require_plan_access
def verify_plan_code(plan_code):
    """Verify if a plan code exists and return minimal info"""
    
    # Validate code format
    if not plan_code or len(plan_code.strip()) != 8:
        return jsonify({'valid': False, 'error': 'Invalid plan code format'}), 400
    
    # Sanitize input
    clean_code = ''.join(c for c in plan_code.upper().strip() if c.isalnum())
    if len(clean_code) != 8:
        return jsonify({'valid': False, 'error': 'Invalid plan code characters'}), 400
    
    # Find plan
    plan = Plan.find_by_code(clean_code)
    
    if not plan:
        return jsonify({'valid': False, 'error': 'Plan not found'})
    
    # Return minimal info only
    return jsonify({
        'valid': True,
        'plan': {
            'plan_name': plan.plan_name,
            'student_name': plan.student_name,
            'plan_code': plan.plan_code,
            'status': plan.status,
            'created_at': plan.created_at.isoformat() if plan.created_at else None
        }
    })

def check_plan_access(plan_id):
    """Check if current session has access to the specified plan"""
    accessed_plan_id = session.get('accessed_plan_id')
    access_time = session.get('access_time', 0)
    current_time = time.time()
    
    # Session expires after 1 hour
    if current_time - access_time > 3600:
        session.pop('accessed_plan_id', None)
        session.pop('access_time', None)
        return False
    
    return accessed_plan_id == plan_id

@bp.route('', methods=['POST'])
@require_admin
def create_plan():
    """Create a new plan - returns plan with secure code"""
    data = request.get_json()
    
    # Validate target program exists
    target_program = Program.query.get(data.get('program_id'))
    if not target_program:
        return jsonify({'error': 'Target program not found'}), 404
    
    # Validate current program exists (if provided)
    current_program_id = data.get('current_program_id')
    if current_program_id:
        current_program = Program.query.get(current_program_id)
        if not current_program:
            return jsonify({'error': 'Current program not found'}), 404
    
    try:
        plan = Plan(
            student_name=data.get('student_name'),
            student_email=data.get('student_email'),
            program_id=data.get('program_id'),  # Target program
            current_program_id=current_program_id,  # Current program (optional)
            plan_name=data.get('plan_name'),
            status=data.get('status', 'draft')
            # plan_code will be auto-generated in __init__
        )
        
        db.session.add(plan)
        db.session.commit()
        
        # Grant immediate access to the creator
        session['accessed_plan_id'] = plan.id
        session['access_time'] = time.time()
        
        return jsonify({
            'plan': plan.to_dict(),
            'message': f'Plan created successfully with code: {plan.plan_code}',
            'security_note': 'Keep your plan code secure - it provides full access to your plan'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        
        if "Unable to generate unique plan code" in str(e):
            return jsonify({'error': 'Unable to generate unique plan code. Please try again.'}), 500
        
        return jsonify({'error': 'Failed to create plan'}), 500

@bp.route('/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    """Get plan by ID - requires prior code access"""
    
    # Check if user has access to this plan
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403
    
    plan = Plan.query.get_or_404(plan_id)
    
    plan_data = plan.to_dict()
    plan_data['progress'] = plan.calculate_progress()
    plan_data['unmet_requirements'] = plan.get_unmet_requirements()
    plan_data['course_suggestions'] = plan.suggest_courses_for_requirements()
    
    return jsonify(plan_data)

@bp.route('/<int:plan_id>', methods=['PUT'])
@require_admin
def update_plan(plan_id):
    """Update plan - requires prior code access"""
    
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403
    
    plan = Plan.query.get_or_404(plan_id)
    data = request.get_json()
    
    # Only allow updating certain fields
    allowed_fields = ['plan_name', 'student_email', 'status', 'current_program_id']  # ADDED current_program_id
    for field in allowed_fields:
        if field in data:
            if field == 'current_program_id' and data[field]:
                # Validate program exists
                program = Program.query.get(data[field])
                if not program:
                    return jsonify({'error': 'Current program not found'}), 404
            setattr(plan, field, data[field])
    
    try:
        db.session.commit()
        return jsonify(plan.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update plan'}), 500

@bp.route('/<int:plan_id>', methods=['DELETE'])
@require_admin
def delete_plan(plan_id):
    """Delete a plan - requires prior code access"""
    
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403
    
    plan = Plan.query.get_or_404(plan_id)
    
    try:
        db.session.delete(plan)
        db.session.commit()
        
        # Clear session access
        session.pop('accessed_plan_id', None)
        session.pop('access_time', None)
        
        return jsonify({'message': 'Plan deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete plan'}), 500

@bp.route('/by-code/<plan_code>', methods=['DELETE'])
@require_plan_access
@require_admin
def delete_plan_by_code(plan_code):
    """Delete a plan using its secure code"""
    
    # Validate and find plan
    if not plan_code or len(plan_code.strip()) != 8:
        return jsonify({'error': 'Invalid plan code format'}), 400
    
    clean_code = ''.join(c for c in plan_code.upper().strip() if c.isalnum())
    plan = Plan.find_by_code(clean_code)
    
    if not plan:
        return jsonify({'error': 'Plan not found or access denied'}), 404
    
    try:
        db.session.delete(plan)
        db.session.commit()
        return jsonify({'message': 'Plan deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete plan'}), 500

@bp.route('/<int:plan_id>/courses', methods=['POST'])
def add_course_to_plan(plan_id):
    """Add course to plan - requires prior code access"""
    
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403
    
    plan = Plan.query.get_or_404(plan_id)
    data = request.get_json()
    
    # Validate course exists
    course = Course.query.get(data.get('course_id'))
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Check if course already in plan
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
        requirement_group_id=data.get('requirement_group_id'),  # ADDED
        credits=data.get('credits'),  # ADDED
        grade=data.get('grade'),  # ADDED
        notes=data.get('notes', '')
    )
    
    try:
        db.session.add(plan_course)
        db.session.commit()
        return jsonify(plan_course.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add course to plan'}), 500

@bp.route('/by-code/<plan_code>/courses', methods=['POST'])
@require_plan_access
def add_course_to_plan_by_code(plan_code):
    """Add a course to a plan using the plan's secure code"""
    
    # Validate and find plan
    if not plan_code or len(plan_code.strip()) != 8:
        return jsonify({'error': 'Invalid plan code format'}), 400
    
    clean_code = ''.join(c for c in plan_code.upper().strip() if c.isalnum())
    plan = Plan.find_by_code(clean_code)
    
    if not plan:
        return jsonify({'error': 'Plan not found or access denied'}), 404
    
    data = request.get_json()
    
    # Validate course exists
    course = Course.query.get(data.get('course_id'))
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Check if course already in plan
    existing = PlanCourse.query.filter_by(
        plan_id=plan.id,
        course_id=data.get('course_id')
    ).first()
    
    if existing:
        return jsonify({'error': 'Course already in plan'}), 400
    
    plan_course = PlanCourse(
        plan_id=plan.id,
        course_id=data.get('course_id'),
        semester=data.get('semester'),
        year=data.get('year'),
        status=data.get('status', 'planned'),
        requirement_category=data.get('requirement_category'),
        requirement_group_id=data.get('requirement_group_id'),  # ADDED
        credits=data.get('credits'),  # ADDED
        grade=data.get('grade'),  # ADDED
        notes=data.get('notes', '')
    )
    
    try:
        db.session.add(plan_course)
        db.session.commit()
        
        # Grant session access for this plan
        session['accessed_plan_id'] = plan.id
        session['access_time'] = time.time()
        
        return jsonify(plan_course.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add course to plan'}), 500

@bp.route('/<int:plan_id>/courses/<int:plan_course_id>', methods=['PUT'])
def update_plan_course(plan_id, plan_course_id):
    """Update plan course - requires prior code access"""
    
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403
    
    plan_course = PlanCourse.query.filter_by(
        id=plan_course_id,
        plan_id=plan_id
    ).first_or_404()
    
    data = request.get_json()
    
    plan_course.semester = data.get('semester', plan_course.semester)
    plan_course.year = data.get('year', plan_course.year)
    plan_course.status = data.get('status', plan_course.status)
    plan_course.grade = data.get('grade', plan_course.grade)
    plan_course.credits = data.get('credits', plan_course.credits)  # ADDED
    plan_course.requirement_category = data.get('requirement_category', plan_course.requirement_category)
    plan_course.requirement_group_id = data.get('requirement_group_id', plan_course.requirement_group_id)  # ADDED
    plan_course.notes = data.get('notes', plan_course.notes)
    
    try:
        db.session.commit()
        return jsonify(plan_course.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update course'}), 500

@bp.route('/<int:plan_id>/courses/<int:plan_course_id>', methods=['DELETE'])
def remove_course_from_plan(plan_id, plan_course_id):
    """Remove course from plan - requires prior code access"""
    
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403
    
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

@bp.route('/<int:plan_id>/audit', methods=['GET'])
def get_degree_audit(plan_id):
    """
    Return a degree audit summary for a given plan.

    This endpoint computes high-level progress metrics using
    ``Plan.calculate_progress()`` and lists unmet requirements via
    ``Plan.get_unmet_requirements()``.  The response JSON contains:

      * ``plan_id`` — the ID of the plan.
      * ``progress`` — a dictionary of progress metrics (total credits, requirement completion,
        category breakdown etc.).
      * ``unmet_requirements`` — a list of outstanding requirement categories with credits still needed.

    Access to this endpoint is guarded by ``check_plan_access()`` to ensure that only
    authorized sessions (students who have entered a plan code or advisors) can view
    the audit.  If access is denied a 403 response is returned.
    """
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403

    plan = Plan.query.get_or_404(plan_id)
    svc = ProgressService(plan)
    progress = svc.full_progress()
    unmet = svc.unmet()
    return jsonify({'plan_id': plan_id, 'progress': progress, 'unmet_requirements': unmet})


@bp.route('/<int:plan_id>/degree-audit', methods=['GET'])
def download_degree_audit(plan_id):
    """
    Download a degree audit report for a plan in CSV format.

    The CSV summarises each program requirement's completion status.  Columns include
    ``category``, ``credits_required``, ``credits_completed``, ``credits_remaining``, and
    ``is_complete`` ("yes" or "no").  Only CSV output is supported; if the
    ``format`` query parameter is provided with a value other than ``csv``, a 400
    response will be returned.

    Access control matches that of other plan operations: a 403 response will be
    returned if the user has not been granted access via plan code or advisor
    session.
    """
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403

    fmt = request.args.get('format', 'csv').lower()
    if fmt != 'csv':
        return jsonify({'error': 'Unsupported format'}), 400

    plan = Plan.query.get_or_404(plan_id)
    svc = ProgressService(plan)
    progress = svc.full_progress()
    
    # Handle both current and transfer progress
    current_requirements = progress.get('current', {}).get('requirements', [])
    transfer_requirements = progress.get('transfer', {}).get('requirements', [])

    import io
    import csv

    output = io.StringIO()
    writer = csv.writer(output)
    # Write header
    writer.writerow([
        'program_type', 'category', 'credits_required', 'credits_completed',
        'credits_remaining', 'is_complete'
    ])
    
    # Write current program requirements
    for r in current_requirements:
        writer.writerow([
            'current',
            r.get('category', ''),
            r.get('totalCredits', 0),
            r.get('completedCredits', 0),
            max(0, r.get('totalCredits', 0) - r.get('completedCredits', 0)),
            'yes' if r.get('status') == 'met' else 'no'
        ])
    
    # Write transfer program requirements
    for r in transfer_requirements:
        writer.writerow([
            'transfer',
            r.get('category', ''),
            r.get('totalCredits', 0),
            r.get('completedCredits', 0),
            max(0, r.get('totalCredits', 0) - r.get('completedCredits', 0)),
            'yes' if r.get('status') == 'met' else 'no'
        ])
    
    csv_data = output.getvalue()
    output.close()

    from flask import Response
    response = Response(
        csv_data,
        mimetype='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename=degree_audit_{plan_id}.csv'
        }
    )
    return response

@bp.route('/<int:plan_id>/progress', methods=['GET'])
def get_plan_progress(plan_id):
    """Get plan progress with view filtering - requires prior code access"""
    
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403
    
    plan = Plan.query.get_or_404(plan_id)
    view_filter = request.args.get('view', 'All Courses')
    svc = ProgressService(plan)
    full = svc.full_progress(view_filter=view_filter)
    return jsonify({
        'plan_id': plan_id,
        'view_filter': view_filter,
        'current': full.get('current'),
        'transfer': full.get('transfer'),
        'unmet_requirements': svc.unmet(),
        'suggestions': svc.suggestions()
    })

@bp.route('/session/clear', methods=['POST'])
def clear_session():
    """Clear plan access session"""
    session.pop('accessed_plan_id', None)
    session.pop('access_time', None)
    return jsonify({'message': 'Session cleared'})

@bp.route('/session/status', methods=['GET'])
def session_status():
    """Check current session status"""
    accessed_plan_id = session.get('accessed_plan_id')
    access_time = session.get('access_time', 0)
    current_time = time.time()
    
    if accessed_plan_id and current_time - access_time < 3600:
        return jsonify({
            'has_access': True,
            'plan_id': accessed_plan_id,
            'expires_in': 3600 - (current_time - access_time)
        })
    else:
        # Clear expired session
        session.pop('accessed_plan_id', None)
        session.pop('access_time', None)
        return jsonify({'has_access': False})

# For advisor access - could be expanded with proper authentication
@bp.route('/advisor/plans', methods=['GET'])
def get_advisor_plans():
    """Advisor endpoint - would require proper authentication in production"""
    
    # This would need proper advisor authentication
    # For now, just return an error encouraging use of plan codes
    return jsonify({
        'error': 'Advisor access requires individual plan codes',
        'message': 'Have students share their plan codes for access',
        'note': 'Implement proper advisor authentication for bulk access'
    }), 403