"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

from flask import Blueprint, request, jsonify, session
from auth import require_admin
from models import db, Equivalency, Course
from sqlalchemy.orm import aliased
import os
from hmac import compare_digest

bp = Blueprint('equivalencies', __name__, url_prefix='/api/equivalencies')

def is_admin_request():
    """Check if the current request has a valid admin token or advisor session."""
    # Check admin token
    token = os.environ.get('ADMIN_API_TOKEN')
    if token:
        provided = request.headers.get('X-Admin-Token')
        if provided and compare_digest(str(provided), str(token)):
            return True
    # Check advisor session
    advisor_token = request.headers.get('X-Advisor-Token') or session.get('advisor_token')
    if advisor_token:
        try:
            from models.advisor_auth import AdvisorAuth
            advisor = AdvisorAuth.find_by_session_token(advisor_token)
            if advisor and advisor.verify_session(advisor_token):
                return True
        except Exception:
            pass
    return False

def get_no_equivalent_course():
    
    no_equiv_course = Course.query.filter_by(code='1000NE').first()
    if not no_equiv_course:
        no_equiv_course = Course(
            code='1000NE',
            title='No Equivalent',
            description='This course does not have an equivalent at the target institution',
            credits=0,
            institution='System',
            department='System'
        )
        db.session.add(no_equiv_course)
        db.session.commit()
    return no_equiv_course

@bp.route('', methods=['GET'])
def get_equivalencies():
    from_institution = request.args.get('from_institution')
    to_institution = request.args.get('to_institution')
    page = request.args.get('page', 1, type=int)
    
    # Allow admins to request up to 10000 equivalencies, regular users get all (no limit for now)
    max_per_page = 10000 if is_admin_request() else 10000
    per_page = min(request.args.get('per_page', 10000, type=int), max_per_page)
    
    query = Equivalency.query.join(Course, Equivalency.from_course_id == Course.id)
    
    if from_institution:
        query = query.filter(Course.institution.ilike(f'%{from_institution}%'))
    
    if to_institution:
        
        ToCourse = aliased(Course)
        query = query.join(ToCourse, Equivalency.to_course_id == ToCourse.id)
        query = query.filter(ToCourse.institution.ilike(f'%{to_institution}%'))
    
    # Apply pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    equivalencies = pagination.items
    
    return jsonify({
        'equivalencies': [equiv.to_dict() for equiv in equivalencies],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages
        }
    })

@bp.route('', methods=['POST'])
@require_admin
def create_equivalency():
    
    data = request.get_json()
    
    
    from_course = Course.query.get(data.get('from_course_id'))
    to_course = Course.query.get(data.get('to_course_id'))
    
    if not from_course or not to_course:
        return jsonify({'error': 'One or both courses not found'}), 404
    
    
    existing = Equivalency.query.filter_by(
        from_course_id=data.get('from_course_id'),
        to_course_id=data.get('to_course_id')
    ).first()
    
    if existing:
        return jsonify({'error': 'Equivalency already exists'}), 400
    
    equivalency = Equivalency(
        from_course_id=data.get('from_course_id'),
        to_course_id=data.get('to_course_id'),
        equivalency_type=data.get('equivalency_type', 'direct'),
        notes=data.get('notes', ''),
        approved_by=data.get('approved_by', '')
    )
    
    try:
        db.session.add(equivalency)
        db.session.commit()
        return jsonify(equivalency.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create equivalency'}), 500
    

@bp.route('/no-equivalent', methods=['POST'])
@require_admin
def create_no_equivalent():
    """Create an explicit 'no equivalent' record"""
    data = request.get_json()
    
    # Validate the source course exists
    from_course = Course.query.get(data.get('from_course_id'))
    if not from_course:
        return jsonify({'error': 'Source course not found'}), 404
    
    # Get the special "no equivalent" course
    no_equiv_course = get_no_equivalent_course()
    
    # Check if equivalency already exists
    existing = Equivalency.query.filter_by(
        from_course_id=data.get('from_course_id'),
        to_course_id=no_equiv_course.id
    ).first()
    
    if existing:
        return jsonify({'error': 'No equivalent record already exists'}), 400
    
    equivalency = Equivalency(
        from_course_id=data.get('from_course_id'),
        to_course_id=no_equiv_course.id,
        equivalency_type='no_equiv',
        notes=data.get('notes', 'Course has been evaluated and does not transfer'),
        approved_by=data.get('approved_by', '')
    )
    
    try:
        db.session.add(equivalency)
        db.session.commit()
        return jsonify(equivalency.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create no equivalent record'}), 500

@bp.route('/<int:equiv_id>/check', methods=['GET'])
def check_equivalency_matrix(equiv_id):
    """Preflight check: returns matrix conflict warnings for an equivalency.

    Used by the frontend before showing edit/delete confirmation dialogs.
    """
    from services.articulation_service import check_edit_conflict, check_delete_conflict
    edit_warning = check_edit_conflict(equiv_id, {})
    delete_warning = check_delete_conflict(equiv_id)
    return jsonify({
        'is_matrix_backed': edit_warning is not None or delete_warning is not None,
        'edit_warning': edit_warning,
        'delete_warning': delete_warning,
    })

@bp.route('/<int:equiv_id>', methods=['PUT'])
@require_admin
def update_equivalency(equiv_id):
    from services.articulation_service import check_edit_conflict

    equivalency = Equivalency.query.get_or_404(equiv_id)
    data = request.get_json()

    # Check for matrix conflict (advisory, never blocking)
    matrix_warning = check_edit_conflict(equiv_id, data)

    equivalency.equivalency_type = data.get('equivalency_type', equivalency.equivalency_type)
    equivalency.notes = data.get('notes', equivalency.notes)
    equivalency.approved_by = data.get('approved_by', equivalency.approved_by)
    
    try:
        db.session.commit()
        result = equivalency.to_dict()
        if matrix_warning:
            result['matrix_warning'] = matrix_warning
        return jsonify(result)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update equivalency'}), 500

@bp.route('/<int:equiv_id>', methods=['DELETE'])
@require_admin
def delete_equivalency(equiv_id):
    from services.articulation_service import check_delete_conflict

    equivalency = Equivalency.query.get_or_404(equiv_id)

    # Check for matrix conflict — include in response but don't block
    matrix_warning = check_delete_conflict(equiv_id)
    
    try:
        db.session.delete(equivalency)
        db.session.commit()
        result = {'message': 'Equivalency deleted successfully'}
        if matrix_warning:
            result['matrix_warning'] = matrix_warning
        return jsonify(result)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete equivalency'}), 500