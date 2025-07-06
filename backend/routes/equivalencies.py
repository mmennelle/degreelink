from flask import Blueprint, request, jsonify
from models import db, Equivalency, Course

bp = Blueprint('equivalencies', __name__, url_prefix='/api/equivalencies')

@bp.route('', methods=['GET'])
def get_equivalencies():
    """Get all equivalencies with optional filtering"""
    from_institution = request.args.get('from_institution')
    to_institution = request.args.get('to_institution')
    
    query = Equivalency.query.join(Course, Equivalency.from_course_id == Course.id)
    
    if from_institution:
        query = query.filter(Course.institution.ilike(f'%{from_institution}%'))
    
    if to_institution:
        query = query.join(Course, Equivalency.to_course_id == Course.id, aliased=True)
        query = query.filter(Course.institution.ilike(f'%{to_institution}%'))
    
    equivalencies = query.all()
    
    return jsonify({
        'equivalencies': [equiv.to_dict() for equiv in equivalencies]
    })

@bp.route('', methods=['POST'])
def create_equivalency():
    """Create a new course equivalency"""
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

@bp.route('/<int:equiv_id>', methods=['PUT'])
def update_equivalency(equiv_id):
    """Update an equivalency"""
    equivalency = Equivalency.query.get_or_404(equiv_id)
    data = request.get_json()
    
    equivalency.equivalency_type = data.get('equivalency_type', equivalency.equivalency_type)
    equivalency.notes = data.get('notes', equivalency.notes)
    equivalency.approved_by = data.get('approved_by', equivalency.approved_by)
    
    try:
        db.session.commit()
        return jsonify(equivalency.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update equivalency'}), 500

@bp.route('/<int:equiv_id>', methods=['DELETE'])
def delete_equivalency(equiv_id):
    """Delete an equivalency"""
    equivalency = Equivalency.query.get_or_404(equiv_id)
    
    try:
        db.session.delete(equivalency)
        db.session.commit()
        return jsonify({'message': 'Equivalency deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete equivalency'}), 500