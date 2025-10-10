from flask import Blueprint, request, jsonify
from auth import require_admin
import csv
import io
from models import db, Course, Equivalency
from routes.equivalencies import get_no_equivalent_course
from werkzeug.utils import secure_filename

bp = Blueprint('upload', __name__, url_prefix='/api/upload')

@bp.route('/courses', methods=['POST'])
@require_admin
def upload_courses():
    
    if 'file' not in request.files:
        return jsonify({'error': 'File not Given'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'file not selected'}), 400
    
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        courses_created = 0
        courses_updated = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                
                code = row.get('code', '').strip()
                title = row.get('title', '').strip()
                
                if not code or not title:
                    errors.append(f"Row {row_num}: Missing required code or title")
                    continue
                
                
                # Look up an existing course using the normalised composite
                # key rather than the raw code.  This prevents duplicate
                # records when the incoming CSV uses different casing or
                # separators (e.g. "BIOL104" vs "BIOL 104").  We
                # intentionally use Course._split_code here to parse the
                # subject and number from whatever format the CSV provides.
                subj, num = Course._split_code(code)
                inst = row.get('institution', '').strip()
                existing_course = Course.query.filter(
                    Course.subject_code == subj,
                    Course.course_number == num,
                    Course.institution.ilike(inst)
                ).first()
                
                if existing_course:
                    
                    existing_course.title = title
                    existing_course.description = row.get('description', '').strip()
                    existing_course.credits = int(row.get('credits', 0))
                    existing_course.department = row.get('department', '').strip()
                    existing_course.prerequisites = row.get('prerequisites', '').strip()
                    courses_updated += 1
                else:
                    
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
@require_admin
def upload_equivalencies():
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        equivalencies_created = 0
        equivalencies_updated = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                
                from_code = row.get('from_course_code', '').strip()
                from_institution = row.get('from_institution', '').strip()
                to_code = row.get('to_course_code', '').strip()
                to_institution = row.get('to_institution', '').strip()
                
                if not all([from_code, from_institution, to_code, to_institution]):
                    errors.append(f"Row {row_num}: Missing required course information")
                    continue
                
                
                # Normalize codes to match composite course keys.  Use the
                # Course._split_code helper to break the code into subject and
                # course number, then search on those fields.  This makes
                # equivalency uploads tolerant of differences in spacing,
                # hyphenation or case in the CSV.
                from_subj, from_num = Course._split_code(from_code)
                to_subj, to_num = Course._split_code(to_code)
                # Find the originating course.  Match on subject, number and
                # institution using case‑insensitive institution comparison.
                from_course = Course.query.filter(
                    Course.subject_code == from_subj,
                    Course.course_number == from_num,
                    Course.institution.ilike(from_institution)
                ).first()
                # Determine the target course.  Handle the special "1000NE"
                # code for "no equivalent" as before; otherwise search by
                # composite fields.
                if to_code == '1000NE':
                    # Handle special "no equivalent" case
                    to_course = get_no_equivalent_course()
                else:
                    to_course = Course.query.filter(
                        Course.subject_code == to_subj,
                        Course.course_number == to_num,
                        Course.institution.ilike(to_institution)
                    ).first()
                
                if not from_course:
                    errors.append(f"Row {row_num}: From course {from_code} at {from_institution} not found")
                    continue
                
                # At this point `to_course` has been determined by the
                # composite key search above (or by get_no_equivalent_course())
                # If the course could not be found, record an error.
                if not to_course:
                    errors.append(f"Row {row_num}: To course {to_code} at {to_institution} not found")
                    continue
                
                
                existing_equiv = Equivalency.query.filter_by(
                    from_course_id=from_course.id,
                    to_course_id=to_course.id
                ).first()
                
                if existing_equiv:
                    
                    existing_equiv.equivalency_type = row.get('equivalency_type', 'direct').strip()
                    existing_equiv.notes = row.get('notes', '').strip()
                    existing_equiv.approved_by = row.get('approved_by', '').strip()
                    equivalencies_updated += 1
                else:
                    
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
    

@bp.route('/requirements', methods=['POST'])
@require_admin
def upload_requirements():
    """
    Upload program requirements from CSV file.
    Uses a three-pass approach to ensure correct program institution assignment.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        # Deferred import to avoid circular dependency
        from models.program import Program, ProgramRequirement, RequirementGroup, GroupCourseOption

        # Read CSV as text and parse with DictReader
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)

        # FIRST PASS: Collect all rows and analyze program data
        programs_data = {}
        all_rows = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            all_rows.append((row_num, row))
            
            program_name = (row.get('program_name') or '').strip()
            institution = (row.get('institution') or '').strip()
            
            if not program_name:
                continue
                
            if program_name not in programs_data:
                programs_data[program_name] = {
                    'institution': institution,
                    'first_row': row,
                    'all_institutions': {institution}
                }
            else:
                programs_data[program_name]['all_institutions'].add(institution)
                # If we find a different institution, log it but keep the first one
                if programs_data[program_name]['institution'] != institution:
                    print(f"Warning: Multiple institutions found for program '{program_name}': "
                          f"{programs_data[program_name]['all_institutions']}")

        # Track created counts
        programs_created = 0
        requirements_created = 0
        groups_created = 0
        options_created = 0
        errors = []

        # SECOND PASS: Create or update programs with correct institutions
        for program_name, prog_data in programs_data.items():
            if not program_name:
                continue
                
            program = Program.query.filter_by(name=program_name).first()
            if not program:
                # Infer degree type from program name patterns
                degree_type = 'BS'  # Default
                if any(pattern in program_name.upper() for pattern in ['A.S', 'AS ', 'ASSOCIATE']):
                    degree_type = 'AS'
                elif any(pattern in program_name.upper() for pattern in ['A.A', 'AA ']):
                    degree_type = 'AA'
                elif any(pattern in program_name.upper() for pattern in ['B.A', 'BA ', 'BACHELOR OF ARTS']):
                    degree_type = 'BA'
                
                first_row = prog_data['first_row']
                program = Program(
                    name=program_name,
                    degree_type=degree_type,
                    institution=prog_data['institution'],  # Use the correct institution from CSV
                    total_credits_required=int(first_row.get('program_total_credits', 120) or 120),
                    description=first_row.get('program_description', '') or f'Imported program: {program_name}'
                )
                db.session.add(program)
                programs_created += 1
            else:
                # Update existing program institution if it was wrong
                if program.institution != prog_data['institution']:
                    print(f"Updating institution for program '{program_name}' from "
                          f"'{program.institution}' to '{prog_data['institution']}'")
                    program.institution = prog_data['institution']
        
        # Commit programs first to ensure they exist
        db.session.commit()

        # THIRD PASS: Process requirements with caching for performance
        current_requirement = None
        current_group = None
        marked_current_versions = set()

        for row_num, row in all_rows:
            try:
                # Normalize and extract fields
                program_name = (row.get('program_name') or '').strip()
                category = (row.get('category') or '').strip()
                requirement_type = (row.get('requirement_type') or 'simple').strip().lower()
                semester = (row.get('semester') or '').strip() or None
                
                # Parse year safely
                year_raw = (row.get('year') or '').strip()
                year = None
                if year_raw:
                    try:
                        year = int(year_raw)
                    except ValueError:
                        errors.append(f"Row {row_num}: Invalid year '{year_raw}'")

                is_current_str = (row.get('is_current') or '').strip().lower()
                is_current = True if is_current_str in ('true', '1', 'yes') else False

                # Validate base fields
                if not program_name or not category:
                    errors.append(f"Row {row_num}: Missing program_name or category")
                    continue

                # Ensure grouped/conditional rows have required group fields
                if requirement_type in ['grouped', 'conditional']:
                    required_group_fields = [
                        ('group_name', 'Group name'),
                        ('courses_required', 'Courses required'),
                        ('credits_required_group', 'Credits required for group'),
                        ('course_option', 'Course option')
                    ]
                    missing_fields = []
                    for field, label in required_group_fields:
                        value = (row.get(field) or '').strip()
                        # Accept sentinel values for course_option
                        if field == 'course_option' and value.lower() in ('nan', 'na', 'n/a'):
                            value = ''
                        if not value:
                            missing_fields.append(label)
                    
                    if missing_fields:
                        errors.append(f"Row {row_num}: Missing required fields for grouped/conditional requirements: {', '.join(missing_fields)}")
                        continue

                # Find the program (should exist now)
                program = Program.query.filter_by(name=program_name).first()
                if not program:
                    errors.append(f"Row {row_num}: Program {program_name} not found")
                    continue

                # Determine requirement credits
                try:
                    req_credits = int(row.get('credits_required') or 0)
                except ValueError:
                    errors.append(f"Row {row_num}: Invalid credits_required value")
                    req_credits = 0

                # Retrieve or create requirement for program/semester/year/category
                # Reset cache if any key field changes
                if (not current_requirement or 
                    current_requirement.category != category or
                    current_requirement.semester != semester or 
                    current_requirement.year != year or
                    current_requirement.program_id != program.id):
                    
                    # Try to find existing requirement
                    current_requirement = ProgramRequirement.query.filter_by(
                        program_id=program.id,
                        category=category,
                        semester=semester,
                        year=year
                    ).first()

                if not current_requirement:
                    current_requirement = ProgramRequirement(
                        program_id=program.id,
                        category=category,
                        credits_required=req_credits,
                        requirement_type=requirement_type,
                        description=(row.get('description') or '').strip(),
                        semester=semester,
                        year=year,
                        is_current=is_current
                    )
                    db.session.add(current_requirement)
                    requirements_created += 1

                # Track current versions for later batch update
                if is_current:
                    current_requirement.is_current = True
                    marked_current_versions.add((program.id, semester, year))

                # Handle grouped/conditional requirement groups
                group_name = (row.get('group_name') or '').strip()
                if requirement_type in ['grouped', 'conditional'] and group_name:
                    # Reset group cache if group_name changes or requirement changes
                    if (not current_group or 
                        current_group.group_name != group_name or
                        current_group.requirement_id != current_requirement.id):
                        
                        current_group = RequirementGroup.query.filter_by(
                            requirement_id=current_requirement.id,
                            group_name=group_name
                        ).first()

                    if not current_group:
                        try:
                            courses_required = int(row.get('courses_required') or 0)
                        except ValueError:
                            errors.append(f"Row {row_num}: Invalid courses_required value")
                            courses_required = 0

                        # Parse credits_required_group (may be empty)
                        crg_raw = (row.get('credits_required_group') or '').strip()
                        credits_required_group = None
                        if crg_raw:
                            try:
                                credits_required_group = int(crg_raw)
                            except ValueError:
                                errors.append(f"Row {row_num}: Invalid credits_required_group value")

                        current_group = RequirementGroup(
                            requirement_id=current_requirement.id,
                            group_name=group_name,
                            courses_required=courses_required,
                            credits_required=credits_required_group,
                            description=(row.get('group_description') or '').strip()
                        )
                        db.session.add(current_group)
                        groups_created += 1

                    # Process course options
                    raw_course_option = (row.get('course_option') or '').strip()
                    # Skip sentinel values indicating missing options
                    if raw_course_option and raw_course_option.lower() not in ('nan', 'na', 'n/a'):
                        normalized_code = raw_course_option.upper().replace('-', ' ').strip()
                        
                        existing_option = GroupCourseOption.query.filter_by(
                            group_id=current_group.id,
                            course_code=normalized_code
                        ).first()
                        
                        if not existing_option:
                            # Parse is_preferred safely
                            is_preferred_str = (row.get('is_preferred') or '').strip().lower()
                            is_preferred = is_preferred_str in ('true', '1', 'yes')
                            
                            option = GroupCourseOption(
                                group_id=current_group.id,
                                course_code=normalized_code,
                                institution=(row.get('institution') or '').strip() or None,
                                is_preferred=is_preferred,
                                notes=(row.get('option_notes') or '').strip()
                            )
                            db.session.add(option)
                            options_created += 1

            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")

        # FOURTH PASS: Set current flags atomically per version
        from models.program import ProgramRequirement
        for prog_id, sem, yr in marked_current_versions:
            # Set all requirements of this version as current
            ProgramRequirement.query.filter_by(
                program_id=prog_id, 
                semester=sem, 
                year=yr
            ).update({ProgramRequirement.is_current: True})
            
            # Set all other versions for this program as not current
            ProgramRequirement.query.filter(
                ProgramRequirement.program_id == prog_id,
                (ProgramRequirement.semester != sem) | (ProgramRequirement.year != yr)
            ).update({ProgramRequirement.is_current: False})

        # Final commit
        db.session.commit()

        return jsonify({
            'message': 'Requirements upload completed',
            'programs_created': programs_created,
            'requirements_created': requirements_created,
            'groups_created': groups_created,
            'options_created': options_created,
            'errors': errors
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500