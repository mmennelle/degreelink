"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

from flask import Blueprint, request, jsonify, session
from auth import require_admin
from models import db, Plan, PlanCourse, Program, Course
import secrets
import time
import re
import io
import csv
from datetime import datetime
from functools import wraps
from services.progress_service import ProgressService
from services.articulation_service import enrich_plan_courses_batch
from config import Config

bp = Blueprint('plans', __name__, url_prefix='/api/plans')


def _attach_ccn_info(plan_data: dict) -> dict:
    """Attach CCN transfer info to each course in a plan response."""
    courses = plan_data.get('courses', [])
    if not courses:
        return plan_data
    course_ids = [c['course_id'] for c in courses if c.get('course_id')]
    if not course_ids:
        return plan_data
    ccn_map = enrich_plan_courses_batch(course_ids)
    for course_entry in courses:
        cid = course_entry.get('course_id')
        if cid and cid in ccn_map:
            course_entry['ccn_info'] = ccn_map[cid]
    return plan_data

# Security decorator for plan access
def require_plan_access(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        plan_id = kwargs.get('plan_id')
        plan_code = kwargs.get('plan_code')
        
        # Get real client IP from proxy headers (Caddy sets X-Forwarded-For)
        x_forwarded_for = request.environ.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            # X-Forwarded-For can be: "client, proxy1, proxy2"
            # Take the FIRST IP (the original client)
            client_ip = x_forwarded_for.split(',')[0].strip()
        else:
            client_ip = request.environ.get('REMOTE_ADDR', 'unknown')
        
        rate_limit_key = f"plan_access:{client_ip}"
        
        # Simple in-memory rate limiting (in production, use Redis)
        if not hasattr(require_plan_access, 'attempts'):
            require_plan_access.attempts = {}
        
        current_time = time.time()
        
        # Clean up old attempts (older than 5 minutes)
        if rate_limit_key in require_plan_access.attempts:
            attempts = [t for t in require_plan_access.attempts[rate_limit_key] if current_time - t < 300]
            require_plan_access.attempts[rate_limit_key] = attempts
        else:
            require_plan_access.attempts[rate_limit_key] = []
        
        # Check if too many attempts in the last 5 minutes
        if len(require_plan_access.attempts[rate_limit_key]) >= 50:  # 50 requests per 5 minutes
            response = jsonify({
                'error': 'Too many access attempts. Please try again later.',
                'code': 'rate_limited'
            })
            response.headers['Retry-After'] = '300'  # Tell client to wait 5 minutes
            response.headers['X-RateLimit-Limit'] = '50'
            response.headers['X-RateLimit-Remaining'] = '0'
            response.headers['X-RateLimit-Reset'] = str(int(current_time + 300))
            return response, 429
        
        # Log this attempt
        require_plan_access.attempts[rate_limit_key].append(current_time)
        
        # Execute the wrapped function
        result = f(*args, **kwargs)
        
        # Add rate limit headers to successful responses
        if isinstance(result, tuple):
            response, status = result[0], result[1] if len(result) > 1 else 200
        else:
            response, status = result, 200
        
        # Only add headers if it's a Flask Response object
        if hasattr(response, 'headers'):
            remaining = 50 - len(require_plan_access.attempts[rate_limit_key])
            response.headers['X-RateLimit-Limit'] = '50'
            response.headers['X-RateLimit-Remaining'] = str(max(0, remaining))
            response.headers['X-RateLimit-Reset'] = str(int(current_time + 300))
        
        return result
    return decorated_function

@bp.route('', methods=['GET'])
def get_plans():
    """REMOVED: No longer allow browsing all plans"""
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
    
    # No session needed - plan code is the security mechanism
    # Return full plan data
    plan_data = plan.to_dict()
    _attach_ccn_info(plan_data)
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
    """Check if current session has access to the specified plan.

    Access is granted when ANY of the following are true:
      1. The request comes from an authenticated advisor session.
      2. The request includes a valid ``X-Plan-Code`` header whose
         corresponding plan matches *plan_id*.  This allows the frontend
         to transparently authorise ID-based endpoint calls once the user
         has proved possession of the plan code.
    """
    # 1. Advisor session
    if 'advisor_id' in session:
        return True

    # 2. Plan code header (set by the frontend ApiService automatically)
    plan_code = request.headers.get('X-Plan-Code', '').strip()
    if plan_code and len(plan_code) == 8:
        clean = ''.join(c for c in plan_code.upper() if c.isalnum())
        if len(clean) == 8:
            plan = Plan.find_by_code(clean)
            if plan and plan.id == plan_id:
                return True

    return False

@bp.route('', methods=['POST'])
def create_plan():
    """Create a new plan - returns plan with secure code"""
    data = request.get_json()
    
    # Validate target program exists
    target_program = Program.query.get(data.get('program_id'))
    if not target_program:
        return jsonify({'error': 'Target program not found'}), 404
    
    # Get current version of target program requirements for catalog year lock
    from models.program import ProgramRequirement
    current_version = ProgramRequirement.query.filter_by(
        program_id=target_program.id,
        is_current=True
    ).first()
    
    program_version_semester = None
    program_version_year = None
    
    if current_version:
        program_version_semester = current_version.semester
        program_version_year = current_version.year
    else:
        # Fallback: try to find any version
        any_version = ProgramRequirement.query.filter_by(
            program_id=target_program.id
        ).first()
        if any_version:
            program_version_semester = any_version.semester
            program_version_year = any_version.year
    
    # Validate current program exists (if provided)
    current_program_id = data.get('current_program_id')
    if current_program_id:
        current_program = Program.query.get(current_program_id)
        if not current_program:
            return jsonify({'error': 'Current program not found'}), 404
    
    # Validate advisor email (if provided)
    advisor_email = data.get('advisor_email')
    if advisor_email:
        # Normalize email to lowercase
        advisor_email = advisor_email.strip().lower()
        # Check if advisor is whitelisted (optional - they can be added later)
        from models.advisor_auth import AdvisorAuth
        advisor = AdvisorAuth.query.filter_by(email=advisor_email).first()
        if not advisor:
            # Advisor not whitelisted yet - that's okay, just log it
            print(f"[INFO] Plan created with non-whitelisted advisor email: {advisor_email}")
    
    try:
        plan = Plan(
            student_name=data.get('student_name'),
            student_email=data.get('student_email'),
            advisor_email=advisor_email,  # Link to advisor
            program_id=data.get('program_id'),  # Target program
            current_program_id=current_program_id,  # Current program (optional)
            program_version_semester=program_version_semester,  # Lock catalog year
            program_version_year=program_version_year,  # Lock catalog year
            catalog_year_locked_at=datetime.utcnow(),  # Record when locked
            plan_name=data.get('plan_name'),
            status=data.get('status', 'draft')
            # plan_code will be auto-generated in __init__
        )
        
        db.session.add(plan)
        db.session.commit()
        
        # Plan code provides access - no session needed
        catalog_info = ''
        if program_version_semester and program_version_year:
            catalog_info = f' Following {program_version_semester} {program_version_year} catalog.'
        
        return jsonify({
            'plan': plan.to_dict(),
            'message': f'Plan created successfully with code: {plan.plan_code}.{catalog_info}',
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
    _attach_ccn_info(plan_data)
    plan_data['progress'] = plan.calculate_progress()
    plan_data['unmet_requirements'] = plan.get_unmet_requirements()
    plan_data['course_suggestions'] = plan.suggest_courses_for_requirements()
    
    return jsonify(plan_data)

@bp.route('/<int:plan_id>', methods=['PUT'])
def update_plan(plan_id):
    """Update plan - requires prior code access"""
    
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403
    
    plan = Plan.query.get_or_404(plan_id)
    data = request.get_json()
    
    # Only allow updating certain fields
    allowed_fields = ['plan_name', 'student_email', 'advisor_email', 'status', 'current_program_id']
    for field in allowed_fields:
        if field in data:
            if field == 'current_program_id' and data[field]:
                # Validate program exists
                program = Program.query.get(data[field])
                if not program:
                    return jsonify({'error': 'Current program not found'}), 404
            elif field == 'advisor_email' and data[field]:
                # Normalize advisor email
                data[field] = data[field].strip().lower()
            setattr(plan, field, data[field])
    
    try:
        db.session.commit()
        return jsonify(plan.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update plan'}), 500

@bp.route('/<int:plan_id>/catalog-year', methods=['PUT'])
@require_admin
def update_catalog_year(plan_id):
    """Update the catalog year lock for a plan - admin only"""
    
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403
    
    plan = Plan.query.get_or_404(plan_id)
    data = request.get_json()
    
    semester = data.get('semester')
    year = data.get('year')
    
    if not semester or not year:
        return jsonify({'error': 'Both semester and year are required'}), 400
    
    try:
        year_int = int(year)
    except (TypeError, ValueError):
        return jsonify({'error': 'Year must be an integer'}), 400
    
    # Verify that this version exists for the target program
    from models.program import ProgramRequirement
    version_exists = ProgramRequirement.query.filter_by(
        program_id=plan.program_id,
        semester=semester,
        year=year_int
    ).first()
    
    if not version_exists:
        return jsonify({'error': f'No requirements found for {semester} {year_int} version'}), 404
    
    # Update catalog year lock
    plan.program_version_semester = semester
    plan.program_version_year = year_int
    plan.catalog_year_locked_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'message': f'Catalog year updated to {semester} {year_int}',
            'plan': plan.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update catalog year'}), 500

@bp.route('/by-code/<plan_code>/catalog-year', methods=['PUT'])
@require_plan_access
@require_admin
def update_catalog_year_by_code(plan_code):
    """Update catalog year using plan code - admin only"""
    
    # Validate and find plan
    if not plan_code or len(plan_code.strip()) != 8:
        return jsonify({'error': 'Invalid plan code format'}), 400
    
    clean_code = ''.join(c for c in plan_code.upper().strip() if c.isalnum())
    plan = Plan.find_by_code(clean_code)
    
    if not plan:
        return jsonify({'error': 'Plan not found or access denied'}), 404
    
    data = request.get_json()
    semester = data.get('semester')
    year = data.get('year')
    
    if not semester or not year:
        return jsonify({'error': 'Both semester and year are required'}), 400
    
    try:
        year_int = int(year)
    except (TypeError, ValueError):
        return jsonify({'error': 'Year must be an integer'}), 400
    
    # Verify that this version exists for the target program
    from models.program import ProgramRequirement
    version_exists = ProgramRequirement.query.filter_by(
        program_id=plan.program_id,
        semester=semester,
        year=year_int
    ).first()
    
    if not version_exists:
        return jsonify({'error': f'No requirements found for {semester} {year_int} version'}), 404
    
    # Update catalog year lock
    plan.program_version_semester = semester
    plan.program_version_year = year_int
    plan.catalog_year_locked_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'message': f'Catalog year updated to {semester} {year_int}',
            'plan': plan.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update catalog year'}), 500

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
        notes=data.get('notes', ''),
        constraint_violation=data.get('constraint_violation', False),  # ADDED
        constraint_violation_reason=data.get('constraint_violation_reason')  # ADDED
    )
    
    try:
        # Auto-assign requirement group if enabled and not provided
        if Config.AUTO_ASSIGN_REQUIREMENT_GROUPS and not plan_course.requirement_group_id and plan.target_program and plan_course.course:
            _assign_requirement_group(plan, plan_course)
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
        notes=data.get('notes', ''),
        constraint_violation=data.get('constraint_violation', False),  # ADDED
        constraint_violation_reason=data.get('constraint_violation_reason')  # ADDED
    )
    
    try:
        # Auto-assign requirement group if enabled and not provided
        if Config.AUTO_ASSIGN_REQUIREMENT_GROUPS and not plan_course.requirement_group_id and plan.target_program and plan_course.course:
            _assign_requirement_group(plan, plan_course)
        db.session.add(plan_course)
        db.session.commit()
        
        return jsonify(plan_course.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add course to plan'}), 500

@bp.route('/<int:plan_id>/validate-course-constraints', methods=['POST'])
def validate_course_constraints(plan_id):
    """Validate if adding a course would violate constraints - requires prior code access"""
    
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403
    
    plan = Plan.query.get_or_404(plan_id)
    data = request.get_json()
    
    course_id = data.get('course_id')
    requirement_category = data.get('requirement_category')
    requirement_group_id = data.get('requirement_group_id')
    
    if not course_id or not requirement_category:
        return jsonify({'error': 'course_id and requirement_category required'}), 400
    
    try:
        result = plan.check_course_constraint_violations(
            course_id, 
            requirement_category,
            requirement_group_id
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f'Failed to validate constraints: {str(e)}'}), 500

@bp.route('/by-code/<plan_code>/validate-course-constraints', methods=['POST'])
@require_plan_access
def validate_course_constraints_by_code(plan_code):
    """Validate if adding a course would violate constraints using plan code"""
    
    if not plan_code or len(plan_code.strip()) != 8:
        return jsonify({'error': 'Invalid plan code format'}), 400
    
    clean_code = ''.join(c for c in plan_code.upper().strip() if c.isalnum())
    plan = Plan.find_by_code(clean_code)
    
    if not plan:
        return jsonify({'error': 'Plan not found or access denied'}), 404
    
    data = request.get_json()
    
    course_id = data.get('course_id')
    requirement_category = data.get('requirement_category')
    requirement_group_id = data.get('requirement_group_id')
    
    if not course_id or not requirement_category:
        return jsonify({'error': 'course_id and requirement_category required'}), 400
    
    try:
        result = plan.check_course_constraint_violations(
            course_id, 
            requirement_category,
            requirement_group_id
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f'Failed to validate constraints: {str(e)}'}), 500

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
        # Auto-assign on update if still not set
        if Config.AUTO_ASSIGN_REQUIREMENT_GROUPS and not plan_course.requirement_group_id:
            plan = Plan.query.get(plan_id)
            if plan and plan.target_program and plan_course.course:
                _assign_requirement_group(plan, plan_course)
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


@bp.route('/<int:plan_id>/courses/bulk-delete', methods=['POST'])
def bulk_remove_courses_from_plan(plan_id):
    """Remove multiple courses from plan in one request."""
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied. Use plan code to access this plan.'}), 403

    data = request.get_json()
    course_ids = data.get('plan_course_ids', [])
    if not course_ids or not isinstance(course_ids, list):
        return jsonify({'error': 'plan_course_ids array is required'}), 400

    try:
        deleted = 0
        for pcid in course_ids:
            pc = PlanCourse.query.filter_by(id=pcid, plan_id=plan_id).first()
            if pc:
                db.session.delete(pc)
                deleted += 1
        db.session.commit()
        return jsonify({'message': f'{deleted} course(s) removed from plan', 'deleted': deleted})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to remove courses: {str(e)}'}), 500

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
    full = svc.full_progress()

    # The frontend expects a flattened summary, not the nested { current, transfer } shape.
    # Prefer the target/transfer program; fall back to current if transfer missing.
    transfer = (full or {}).get('transfer') or {}
    current = (full or {}).get('current') or {}
    chosen = transfer if transfer.get('requirements') else current

    reqs = chosen.get('requirements') or []
    requirement_progress = []
    for r in reqs:
        total = int(r.get('totalCredits') or 0)
        completed = int(r.get('completedCredits') or 0)
        requirement_progress.append({
            'id': r.get('id'),
            'category': r.get('category') or r.get('name') or '',
            'credits_required': total,
            'credits_completed': min(completed, total) if total else completed,
            'credits_remaining': max(0, (total or 0) - (completed or 0)),
            'is_complete': (r.get('status') == 'met')
        })

    total_credits_required = sum(x.get('credits_required', 0) for x in requirement_progress)
    total_credits_earned = sum(x.get('credits_completed', 0) for x in requirement_progress)
    completion_percentage = (total_credits_earned / total_credits_required * 100) if total_credits_required else 0.0
    requirements_completion_percentage = (
        (sum(1 for x in requirement_progress if x.get('is_complete')) / len(requirement_progress) * 100)
        if requirement_progress else 0.0
    )

    progress_payload = {
        'requirement_progress': requirement_progress,
        'total_credits_earned': total_credits_earned,
        'total_credits_required': total_credits_required,
        'completion_percentage': completion_percentage,
        'requirements_completion_percentage': requirements_completion_percentage,
        # keep a hint of which program we summarized
        'program_type': 'transfer' if chosen is transfer else 'current',
    }

    unmet = svc.unmet()
    return jsonify({'plan_id': plan_id, 'progress': progress_payload, 'unmet_requirements': unmet})


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


# ---------------------------------------------------------------------------
# Transcript import  (CSV academic-record export  +  PDF fallback)
# ---------------------------------------------------------------------------

# Course-code pattern for column-1 values like "CSCI 6454 - Parallel & Sci Computing"
_CSV_COURSE_RE = re.compile(
    r'^(?P<subj>[A-Z]{2,5})\s+(?P<num>\d{3,5}[A-Z]{0,2})\s*-\s*(?P<title>.+)$',
    re.IGNORECASE,
)

# Academic-period value: "2025 Fall", "2023 Summer", etc.
_PERIOD_RE = re.compile(
    r'(?P<year>20\d{2})\s+(?P<semester>Fall|Spring|Summer)',
    re.IGNORECASE,
)


def _parse_academic_record_csv(text: str):
    """
    Parse a Workday-style "View My Academic Record" CSV export.

    Returns a list of dicts:
    {
        'code': 'CSCI 6454',
        'subject_code': 'CSCI',
        'course_number': '6454',
        'title': 'Parallel & Sci Computing',
        'credits': 3,
        'grade': 'A',
        'semester': 'Fall',
        'year': 2025,
        'status': 'completed',
        'transfer': False,
        'originating': None,        # populated for transfer rows
    }
    """
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)

    courses = []
    current_semester = None
    current_year = None
    section = None  # 'enrollments' | 'transfer' | None

    for row in rows:
        # Pad short rows so index access is safe
        while len(row) < 6:
            row.append('')

        col0 = row[0].strip()
        col1 = row[1].strip()

        # --- Track academic period ---
        if col0 == 'Academic Period' and col1:
            m = _PERIOD_RE.search(col1)
            if m:
                current_year = int(m.group('year'))
                current_semester = m.group('semester').capitalize()
            section = None
            continue

        # --- Section markers ---
        if col0 == 'Enrollments':
            section = 'enrollments'
            continue
        if col0.startswith('Transfer Credit from Coursework'):
            section = 'transfer'
            continue
        # End-of-section markers
        if col0 in (
            'Academic Period Totals', 'Cumulative Totals', 'Student Standings',
            'Specialized Totals', 'Cumulative Transfer Totals',
        ) or col0.startswith('Units ') or col0.startswith('Cumulative '):
            section = None
            continue

        # --- Enrollment rows ---
        if section == 'enrollments' and col1:
            m = _CSV_COURSE_RE.match(col1)
            if m:
                subj = m.group('subj').upper()
                num = m.group('num').upper()
                title = m.group('title').strip()
                grade = row[2].strip().upper() or None
                try:
                    credits = int(float(row[4].strip())) if row[4].strip() else 0
                except ValueError:
                    credits = 0

                status = 'completed'
                if grade in ('W', 'WP', 'WF'):
                    status = 'planned'
                elif grade in ('IP', 'I', None, ''):
                    status = 'in_progress'

                courses.append({
                    'code': f'{subj} {num}',
                    'subject_code': subj,
                    'course_number': num,
                    'title': title,
                    'credits': credits,
                    'grade': grade or '',
                    'semester': current_semester,
                    'year': current_year,
                    'status': status,
                    'transfer': False,
                    'originating': None,
                })

        # --- Transfer-credit rows ---
        if section == 'transfer' and col1:
            m = _CSV_COURSE_RE.match(col1)
            if m:
                subj = m.group('subj').upper()
                num = m.group('num').upper()
                title = m.group('title').strip()
                grade = row[3].strip().upper() or None
                try:
                    credits = int(float(row[2].strip())) if row[2].strip() else 0
                except ValueError:
                    credits = 0

                originating = row[4].strip() if row[4].strip() else None

                status = 'completed'
                if grade in ('W', 'WP', 'WF'):
                    status = 'planned'

                courses.append({
                    'code': f'{subj} {num}',
                    'subject_code': subj,
                    'course_number': num,
                    'title': title,
                    'credits': credits,
                    'grade': grade or '',
                    'semester': current_semester,
                    'year': current_year,
                    'status': status,
                    'transfer': True,
                    'originating': originating,
                })

    return courses


# Legacy PDF text parser (kept as fallback) -----------------------------------

_COURSE_LINE_RE = re.compile(
    r'(?P<subj>[A-Z]{2,5})\s+'
    r'(?P<num>\d{3,5}[A-Z]?(?:L)?)\s+'
    r'(?P<title>.+?)\s+'
    r'(?P<credits>\d{1,2}(?:\.\d{1,2})?)\s+'
    r'(?P<grade>[A-DF][+\-]?|W|WP|WF|P|S|U|I|IP|AU|CR|NC)'
    r'(?:\s|$)',
    re.IGNORECASE,
)

_SEMESTER_RE = re.compile(
    r'(?P<semester>Fall|Spring|Summer)\s+(?P<year>20\d{2})',
    re.IGNORECASE,
)


def _parse_transcript_text(text):
    """Parse free-form transcript text (from a text-based PDF)."""
    courses = []
    current_semester = None
    current_year = None

    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue
        sem_match = _SEMESTER_RE.search(line)
        if sem_match:
            current_semester = sem_match.group('semester').capitalize()
            current_year = int(sem_match.group('year'))
            continue
        course_match = _COURSE_LINE_RE.search(line)
        if course_match:
            subj = course_match.group('subj').upper()
            num = course_match.group('num').upper()
            title = course_match.group('title').strip()
            title = re.sub(r'\s+\d+\.?\d*$', '', title).strip()
            credits = int(float(course_match.group('credits')))
            grade = course_match.group('grade').upper()
            status = 'completed'
            if grade in ('W', 'WP', 'WF'):
                status = 'planned'
            elif grade in ('IP', 'I'):
                status = 'in_progress'
            courses.append({
                'code': f'{subj} {num}',
                'subject_code': subj,
                'course_number': num,
                'title': title,
                'credits': credits,
                'grade': grade,
                'semester': current_semester,
                'year': current_year,
                'status': status,
                'transfer': False,
                'originating': None,
            })
    return courses


def _match_and_add_courses(plan, parsed_courses):
    """
    Match a list of parsed course dicts against the Course database and add
    them to the given plan.  Returns (added, skipped, not_found) lists.
    """
    added = []
    skipped = []
    not_found = []
    existing_course_ids = {pc.course_id for pc in plan.courses}

    for parsed in parsed_courses:
        # Try matching by subject_code + course_number first
        course = Course.query.filter(
            db.func.upper(Course.subject_code) == parsed['subject_code'],
            db.func.upper(Course.course_number) == parsed['course_number'],
        ).first()

        # Fallback: match by code variants
        if not course:
            for variant in [
                parsed['code'],
                parsed['code'].replace(' ', ''),
                f"{parsed['subject_code']}-{parsed['course_number']}",
            ]:
                course = Course.query.filter(
                    db.func.upper(Course.code) == variant.upper()
                ).first()
                if course:
                    break

        if not course:
            not_found.append({
                'code': parsed['code'],
                'title': parsed['title'],
                'credits': parsed['credits'],
                'grade': parsed.get('grade', ''),
                'reason': 'Course not found in database',
                'transfer': parsed.get('transfer', False),
                'originating': parsed.get('originating'),
            })
            continue

        if course.id in existing_course_ids:
            skipped.append({
                'code': course.code,
                'title': course.title,
                'reason': 'Already in plan',
            })
            continue

        plan_course = PlanCourse(
            plan_id=plan.id,
            course_id=course.id,
            semester=parsed.get('semester'),
            year=parsed.get('year'),
            status=parsed['status'],
            grade=parsed['grade'] if parsed['status'] == 'completed' else None,
            credits=parsed['credits'],
            notes='Imported from transcript',
        )

        try:
            if Config.AUTO_ASSIGN_REQUIREMENT_GROUPS and plan.target_program and plan_course.course:
                _assign_requirement_group(plan, plan_course)
        except Exception:
            pass

        db.session.add(plan_course)
        existing_course_ids.add(course.id)
        added.append({
            'code': course.code,
            'title': course.title,
            'credits': course.credits,
            'grade': parsed.get('grade', ''),
            'status': parsed['status'],
            'semester': parsed.get('semester'),
            'year': parsed.get('year'),
            'transfer': parsed.get('transfer', False),
        })

    return added, skipped, not_found


@bp.route('/<int:plan_id>/import-transcript', methods=['POST'])
def import_transcript(plan_id):
    """
    Upload a transcript file (CSV or PDF), parse courses, match against the
    database, and add matched courses to the plan.

    Accepted formats:
    - CSV: Workday "View My Academic Record" export
    - PDF: text-based transcript (scanned / image PDFs are not supported)
    """
    if not check_plan_access(plan_id):
        return jsonify({'error': 'Access denied.'}), 403

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    filename = (file.filename or '').lower()

    if not (filename.endswith('.csv') or filename.endswith('.pdf')):
        return jsonify({'error': 'File must be a CSV or PDF'}), 400

    plan = Plan.query.get_or_404(plan_id)

    # ---- CSV path ----
    if filename.endswith('.csv'):
        try:
            raw = file.read()
            # Try UTF-8 first, fall back to latin-1
            try:
                text = raw.decode('utf-8')
            except UnicodeDecodeError:
                text = raw.decode('latin-1')
            parsed_courses = _parse_academic_record_csv(text)
        except Exception as e:
            return jsonify({'error': f'Failed to parse CSV: {str(e)}'}), 400

    # ---- PDF path ----
    else:
        try:
            import pdfplumber
        except ImportError:
            return jsonify({'error': 'PDF parsing library not available on server.'}), 500
        try:
            pdf_bytes = file.read()
            full_text = ''
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        full_text += page_text + '\n'
        except Exception as e:
            return jsonify({'error': f'Failed to read PDF: {str(e)}'}), 400

        if not full_text.strip():
            return jsonify({
                'error': 'Could not extract text from the PDF. '
                         'Try exporting your academic record as a CSV instead.',
            }), 400

        parsed_courses = _parse_transcript_text(full_text)

    if not parsed_courses:
        return jsonify({
            'error': 'No courses could be identified in the file. '
                     'Make sure you are uploading a Workday "View My Academic Record" CSV export '
                     'or a text-based transcript PDF.',
        }), 400

    # Match & add
    added, skipped, not_found = _match_and_add_courses(plan, parsed_courses)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save courses: {str(e)}'}), 500

    return jsonify({
        'message': f'{len(added)} course(s) added to plan',
        'added': added,
        'skipped': skipped,
        'not_found': not_found,
        'total_parsed': len(parsed_courses),
    })

@bp.route('/session/status', methods=['GET'])
def session_status():
    """Check current session status for advisor authentication"""
    if 'advisor_id' in session:
        return jsonify({
            'authenticated': True,
            'advisor_id': session['advisor_id'],
            'advisor_email': session.get('advisor_email')
        })
    else:
        return jsonify({
            'authenticated': False,
            'message': 'No active advisor session. Plan access via codes does not require sessions.'
        })


# --- Helpers ---------------------------------------------------------------
def _assign_requirement_group(plan: Plan, plan_course: PlanCourse):
    """Assign plan_course.requirement_group_id based on target program groups.

    Strategy:
      - Collect all GroupCourseOption whose course_code matches course.code (case-insensitive; hyphen/space normalized).
      - If multiple matches:
        1. Prefer is_preferred=True options first
        2. Then sort by requirement.priority_order (ascending)
        3. Then by group.courses_required (descending - strictest first)
        4. Then by group.id (ascending - for deterministic tie-breaking)
      - Log ambiguities when multiple groups match
      - Log when no match is found
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        from models.program import ProgramRequirement, RequirementGroup, GroupCourseOption
    except Exception:
        logger.error("Failed to import models for group assignment")
        return
    
    if not plan_course.course:
        return
    
    code_norm = (plan_course.course.code or '').upper().replace('-', ' ').strip()
    course_inst = getattr(plan_course.course, 'institution', None)
    
    matches = []
    for req in (plan.target_program.requirements or []):
        if getattr(req, 'requirement_type', '') != 'grouped':
            continue
        for grp in (req.groups or []):
            for opt in (grp.course_options or []):
                opt_code_norm = (opt.course_code or '').upper().replace('-', ' ').strip()
                opt_inst = opt.institution
                
                # Match if codes match and institution is compatible
                code_match = (opt_code_norm == code_norm)
                inst_match = (not opt_inst) or (opt_inst == course_inst)
                
                if code_match and inst_match:
                    matches.append((req, grp, opt))
    
    if not matches:
        logger.info(f"No group match for course {code_norm} (institution: {course_inst}) in plan {plan.id}")
        return
    
    # Log ambiguity if multiple matches
    if len(matches) > 1:
        group_details = [f"Group '{m[1].group_name}' in req '{m[0].category}'" for m in matches]
        logger.info(f"Multiple group matches for course {code_norm} in plan {plan.id}: {', '.join(group_details)}")
    
    # Prefer preferred options first
    preferred = [m for m in matches if getattr(m[2], 'is_preferred', False)]
    candidates = preferred if preferred else matches
    
    # Sort deterministically by priority
    # 1. requirement.priority_order (lower = higher priority)
    # 2. group.courses_required (higher = stricter requirement, higher priority)
    # 3. group.id (lower = first created, tie-breaker)
    candidates.sort(key=lambda m: (
        getattr(m[0], 'priority_order', 0) or 0,
        -1 * (getattr(m[1], 'courses_required', 0) or 0),
        getattr(m[1], 'id', 0) or 0
    ))
    
    chosen_req, chosen_group, chosen_opt = candidates[0]
    plan_course.requirement_group_id = chosen_group.id
    # Also set requirement_category so category-based matching works for both programs
    if not plan_course.requirement_category:
        plan_course.requirement_category = chosen_req.category
    
    logger.debug(
        f"Assigned course {code_norm} to group '{chosen_group.group_name}' "
        f"(id: {chosen_group.id}) in requirement '{chosen_req.category}' for plan {plan.id}"
    )

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