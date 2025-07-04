from flask import Blueprint, request, jsonify
import csv
import io
from models import db, Course, Equivalency
from werkzeug.utils import secure_filename

bp = Blueprint('upload', __name__, url_prefix='/api/upload')

@bp.route('/courses', methods=['POST'])
def upload_courses():
    """Upload courses from CSV file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        # Read CSV
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        courses_created = 0
        courses_updated = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Expected columns: code, title, description, credits, institution, department, prerequisites
                code = row.get('code', '').strip()
                title = row.get('title', '').strip()
                
                if not code or not title:
                    errors.append(f"Row {row_num}: Missing required code or title")
                    continue
                
                # Check if course exists
                existing_course = Course.query.filter_by(
                    code=code,
                    institution=row.get('institution', '').strip()
                ).first()
                
                if existing_course:
                    # Update existing course
                    existing_course.title = title
                    existing_course.description = row.get('description', '').strip()
                    existing_course.credits = int(row.get('credits', 0))
                    existing_course.department = row.get('department', '').strip()
                    existing_course.prerequisites = row.get('prerequisites', '').strip()
                    courses_updated += 1
                else:
                    # Create new course
                    course = Course(
                        code=code,
                        title=title,
                        description=row.get('description', '').strip(),
                        credits=int(row.get('credits', 0)),
                        institution=row.get('institution', '').strip(),
                        department=row.get('department', '').strip(),
                        prerequisites=row.get('prerequisites', '').strip()
                    )
                    
                    validation_errors = course.validate()
                    if validation_errors:
                        errors.append(f"Row {row_num}: {', '.join(validation_errors)}")
                        continue
                    
                    db.session.add(course)
                    courses_created += 1
                    
            except ValueError as e:
                errors.append(f"Row {row_num}: Invalid data format - {str(e)}")
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        if courses_created > 0 or courses_updated > 0:
            db.session.commit()
        
        return jsonify({
            'message': 'Upload completed',
            'courses_created': courses_created,
            'courses_updated': courses_updated,
            'errors': errors
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

@bp.route('/equivalencies', methods=['POST'])
def upload_equivalencies():
    """Upload course equivalencies from CSV file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        # Read CSV
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        equivalencies_created = 0
        equivalencies_updated = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Expected columns: from_course_code, from_institution, to_course_code, to_institution, equivalency_type, notes, approved_by
                from_code = row.get('from_course_code', '').strip()
                from_institution = row.get('from_institution', '').strip()
                to_code = row.get('to_course_code', '').strip()
                to_institution = row.get('to_institution', '').strip()
                
                if not all([from_code, from_institution, to_code, to_institution]):
                    errors.append(f"Row {row_num}: Missing required course information")
                    continue
                
                # Find courses
                from_course = Course.query.filter_by(code=from_code, institution=from_institution).first()
                to_course = Course.query.filter_by(code=to_code, institution=to_institution).first()
                
                if not from_course:
                    errors.append(f"Row {row_num}: From course {from_code} at {from_institution} not found")
                    continue
                
                if not to_course:
                    errors.append(f"Row {row_num}: To course {to_code} at {to_institution} not found")
                    continue
                
                # Check if equivalency exists
                existing_equiv = Equivalency.query.filter_by(
                    from_course_id=from_course.id,
                    to_course_id=to_course.id
                ).first()
                
                if existing_equiv:
                    # Update existing equivalency
                    existing_equiv.equivalency_type = row.get('equivalency_type', 'direct').strip()
                    existing_equiv.notes = row.get('notes', '').strip()
                    existing_equiv.approved_by = row.get('approved_by', '').strip()
                    equivalencies_updated += 1
                else:
                    # Create new equivalency
                    equivalency = Equivalency(
                        from_course_id=from_course.id,
                        to_course_id=to_course.id,
                        equivalency_type=row.get('equivalency_type', 'direct').strip(),
                        notes=row.get('notes', '').strip(),
                        approved_by=row.get('approved_by', '').strip()
                    )
                    
                    db.session.add(equivalency)
                    equivalencies_created += 1
                    
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        if equivalencies_created > 0 or equivalencies_updated > 0:
            db.session.commit()
        
        return jsonify({
            'message': 'Upload completed',
            'equivalencies_created': equivalencies_created,
            'equivalencies_updated': equivalencies_updated,
            'errors': errors
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500