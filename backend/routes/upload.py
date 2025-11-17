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
                    
                    # Phase 2: Update has_lab and course_type if provided
                    has_lab_str = row.get('has_lab', '').strip().lower()
                    if has_lab_str in ['true', 'false']:
                        existing_course.has_lab = (has_lab_str == 'true')
                    
                    course_type = row.get('course_type', '').strip()
                    if course_type:
                        existing_course.course_type = course_type
                    
                    courses_updated += 1
                else:
                    
                    # Parse has_lab (default to False)
                    has_lab = False
                    has_lab_str = row.get('has_lab', '').strip().lower()
                    if has_lab_str == 'true':
                        has_lab = True
                    
                    # Get course_type (default to 'lecture')
                    course_type = row.get('course_type', 'lecture').strip()
                    if not course_type:
                        course_type = 'lecture'
                    
                    course = Course(
                        code=code,
                        title=title,
                        description=row.get('description', '').strip(),
                        credits=int(row.get('credits', 0)),
                        institution=row.get('institution', '').strip(),
                        department=row.get('department', '').strip(),
                        prerequisites=row.get('prerequisites', '').strip(),
                        has_lab=has_lab,
                        course_type=course_type
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
        
        # Track constraints per requirement (category) to create once per category
        category_constraints = {}

        for row_num, row in all_rows:
            try:
                # Normalize and extract fields
                program_name = (row.get('program_name') or '').strip()
                category = (row.get('category') or '').strip()
                requirement_type = (row.get('requirement_type') or 'simple').strip().lower()
                semester = (row.get('semester') or '').strip() or None
                
                # Auto-detect grouped requirements: if group_name is present, treat as grouped
                # This handles CSVs where requirement_type says 'simple' but structure is grouped
                group_name_check = (row.get('group_name') or '').strip()
                if group_name_check and requirement_type == 'simple':
                    requirement_type = 'grouped'
                
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

                # For grouped requirements: group_name and course_code are required
                # For simple requirements: just course_code is required
                if requirement_type in ['grouped', 'conditional']:
                    group_name = (row.get('group_name') or '').strip()
                    course_code = (row.get('course_code') or '').strip()
                    if not group_name or not course_code:
                        errors.append(f"Row {row_num}: Missing group_name or course_code for grouped requirement")
                        continue
                else:
                    course_code = (row.get('course_code') or '').strip()
                    if not course_code:
                        errors.append(f"Row {row_num}: Missing course_code")
                        continue

                # Find the program (should exist now)
                program = Program.query.filter_by(name=program_name).first()
                if not program:
                    errors.append(f"Row {row_num}: Program {program_name} not found")
                    continue

                # Parse group_name early (needed for constraint processing)
                group_name = (row.get('group_name') or '').strip()
                
                # Parse constraint columns (optional, only on first row of category)
                constraint_type = row.get('constraint_type', '').strip()
                description = row.get('description', '').strip()
                min_credits = row.get('min_credits', '').strip()
                max_credits = row.get('max_credits', '').strip()
                min_courses = row.get('min_courses', '').strip()
                max_courses = row.get('max_courses', '').strip()
                min_level = row.get('min_level', '').strip()
                tag = row.get('tag', '').strip()
                tag_value = row.get('tag_value', '').strip()
                scope_subjects = row.get('scope_subject_codes', '').strip()
                
                # Determine requirement credits (for backward compatibility)
                try:
                    req_credits = int(row.get('credits_required') or min_credits or 0)
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
                        description=(row.get('description') or '').strip() or None,
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

                # Process constraints - support for all requirement types (simple, grouped, conditional)
                # Category-level: First row of category with no group_name
                # Group-level: First row of each group within category (grouped/conditional only)
                if constraint_type:
                    # Determine constraint scope
                    if group_name and requirement_type in ['grouped', 'conditional']:
                        # Group-level constraint: applies to this specific group only
                        constraint_key = (program.id, category, semester, year, group_name)
                    else:
                        # Category-level constraint: applies to entire category
                        constraint_key = (program.id, category, semester, year, None)
                    
                    # Only store if this is the first row for this key
                    if constraint_key not in category_constraints:
                        category_constraints[constraint_key] = {
                            'constraint_type': constraint_type,
                            'description': description,
                            'min_credits': min_credits,
                            'max_credits': max_credits,
                            'min_courses': min_courses,
                            'max_courses': max_courses,
                            'min_level': min_level,
                            'tag': tag,
                            'tag_value': tag_value,
                            'scope_subjects': scope_subjects,
                            'requirement': current_requirement,
                            'group_name': group_name  # Store group name for reference
                        }

                # Handle grouped/conditional requirement groups
                if requirement_type in ['grouped', 'conditional']:
                    if not group_name:
                        errors.append(f"Row {row_num}: Missing group_name for grouped requirement")
                        continue
                        
                    # Reset group cache if group_name changes or requirement changes
                    if (not current_group or 
                        current_group.group_name != group_name or
                        current_group.requirement_id != current_requirement.id):
                        
                        current_group = RequirementGroup.query.filter_by(
                            requirement_id=current_requirement.id,
                            group_name=group_name
                        ).first()

                    if not current_group:
                        # Use min_courses if courses_required not provided
                        try:
                            courses_required = int(row.get('courses_required') or min_courses or 0)
                        except ValueError:
                            courses_required = int(min_courses) if min_courses else 0

                        # Use min_credits if credits_required_group not provided
                        crg_raw = (row.get('credits_required_group') or min_credits or '').strip()
                        credits_required_group = None
                        if crg_raw:
                            try:
                                credits_required_group = int(crg_raw)
                            except ValueError:
                                pass

                        current_group = RequirementGroup(
                            requirement_id=current_requirement.id,
                            group_name=group_name,
                            courses_required=courses_required,
                            credits_required=credits_required_group,
                            description=(row.get('group_description') or '').strip() or None
                        )
                        db.session.add(current_group)
                        groups_created += 1

                    # Process course option (now using course_code column)
                    if course_code:
                        normalized_code = course_code.upper().replace('-', ' ').strip()
                        
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
                                notes=(row.get('option_notes') or '').strip() or None
                            )
                            db.session.add(option)
                            options_created += 1

            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")

        # FOURTH PASS: Create RequirementConstraint records from category_constraints
        from models.constraint import RequirementConstraint
        import json
        constraints_created = 0
        
        for constraint_key, constraint_data in category_constraints.items():
            requirement = constraint_data['requirement']
            group_name = constraint_data.get('group_name')  # None for category-level, string for group-level
            
            # Build scope_filter for group-level constraints or subject scoping
            scope_filter = {}
            if group_name:
                scope_filter['group_name'] = group_name
            
            # Add subject scoping if present
            scope_subjects = constraint_data.get('scope_subjects', '').strip()
            if scope_subjects:
                # Parse comma-separated subject codes
                subject_list = [s.strip() for s in scope_subjects.split(',') if s.strip()]
                if subject_list:
                    scope_filter['subject_codes'] = subject_list
            
            # NEW APPROACH: Check for all constraint types and create them if values are present
            # This allows mixing multiple constraint parameters in a single CSV row
            
            # 1. Credits constraint - check if min_credits or max_credits are specified
            if constraint_data['min_credits'] or constraint_data['max_credits']:
                params = {}
                if constraint_data['min_credits']:
                    params['credits_min'] = int(constraint_data['min_credits'])
                if constraint_data['max_credits']:
                    params['credits_max'] = int(constraint_data['max_credits'])
                
                constraint = RequirementConstraint(
                    requirement_id=requirement.id,
                    constraint_type='credits',
                    params=json.dumps(params),
                    scope_filter=json.dumps(scope_filter) if scope_filter else None,
                    description=constraint_data.get('description', '')
                )
                db.session.add(constraint)
                constraints_created += 1
            
            # 2. Course count constraint - check if min_courses or max_courses are specified
            # BUT only if they're not part of a level or tag constraint
            if (constraint_data['min_courses'] or constraint_data['max_courses']) and not constraint_data['min_level'] and not constraint_data['tag']:
                params = {}
                if constraint_data['min_courses']:
                    params['courses_min'] = int(constraint_data['min_courses'])
                if constraint_data['max_courses']:
                    params['courses_max'] = int(constraint_data['max_courses'])
                
                constraint = RequirementConstraint(
                    requirement_id=requirement.id,
                    constraint_type='courses',
                    params=json.dumps(params),
                    scope_filter=json.dumps(scope_filter) if scope_filter else None,
                    description=constraint_data.get('description', '')
                )
                db.session.add(constraint)
                constraints_created += 1
            
            # 3. Level constraint - check if min_level is specified
            if constraint_data['min_level']:
                params = {'level': int(constraint_data['min_level'])}
                # min_courses is used here as min_courses_at_level
                if constraint_data['min_courses']:
                    params['courses'] = int(constraint_data['min_courses'])
                
                constraint = RequirementConstraint(
                    requirement_id=requirement.id,
                    constraint_type='min_courses_at_level',
                    params=json.dumps(params),
                    scope_filter=json.dumps(scope_filter) if scope_filter else None,
                    description=constraint_data.get('description', '')
                )
                db.session.add(constraint)
                constraints_created += 1
            
            # 4. Tag constraint - check if tag and tag_value are specified
            tag = constraint_data.get('tag', '').strip()
            tag_value = constraint_data.get('tag_value', '').strip()
            if tag and tag_value:
                params = {'tag': tag_value}
                
                # Determine if it's a min_tag_courses or max_tag_credits constraint
                # min_courses is used here as the number of courses with the tag
                if constraint_data['min_courses']:
                    params['courses'] = int(constraint_data['min_courses'])
                    actual_constraint_type = 'min_tag_courses'
                else:
                    # Default to at least 1 course with the tag
                    params['courses'] = 1
                    actual_constraint_type = 'min_tag_courses'
                
                # Add tag field type to scope for evaluation
                tag_scope_filter = scope_filter.copy()
                tag_scope_filter['tag_field'] = tag  # e.g., "has_lab", "course_type"
                
                constraint = RequirementConstraint(
                    requirement_id=requirement.id,
                    constraint_type=actual_constraint_type,
                    params=json.dumps(params),
                    scope_filter=json.dumps(tag_scope_filter) if tag_scope_filter else None,
                    description=constraint_data.get('description', '')
                )
                db.session.add(constraint)
                constraints_created += 1

        # FIFTH PASS: Set current flags atomically per version
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
            'constraints_created': constraints_created,
            'errors': errors
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500


@bp.route('/constraints', methods=['POST'])
@require_admin
def upload_constraints():
    """
    Upload requirement constraints from CSV file.
    Links constraints to existing program requirements.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        # Import models
        from models.program import Program, ProgramRequirement
        from models.constraint import RequirementConstraint

        # Read CSV
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)

        constraints_created = 0
        constraints_updated = 0
        errors = []

        # Valid constraint types
        valid_types = ['min_level_credits', 'min_tag_courses', 'max_tag_credits', 'min_courses_at_level']

        for row_num, row in enumerate(csv_reader, start=2):
            try:
                program_name = row.get('program_name', '').strip()
                category = row.get('category', '').strip()
                constraint_type = row.get('constraint_type', '').strip()
                description = row.get('description', '').strip()

                if not all([program_name, category, constraint_type, description]):
                    errors.append(f"Row {row_num}: Missing required fields (program_name, category, constraint_type, description)")
                    continue

                # Validate constraint type
                if constraint_type not in valid_types:
                    errors.append(f"Row {row_num}: Invalid constraint_type '{constraint_type}'. Must be one of: {', '.join(valid_types)}")
                    continue

                # Find the program
                program = Program.query.filter(Program.name.ilike(program_name)).first()
                if not program:
                    errors.append(f"Row {row_num}: Program '{program_name}' not found")
                    continue

                # Find the requirement (use current version)
                requirement = ProgramRequirement.query.filter(
                    ProgramRequirement.program_id == program.id,
                    ProgramRequirement.category.ilike(category),
                    ProgramRequirement.is_current == True
                ).first()

                if not requirement:
                    errors.append(f"Row {row_num}: Requirement category '{category}' not found for program '{program_name}'")
                    continue

                # Only allow constraints on grouped requirements
                if requirement.requirement_type != 'grouped':
                    errors.append(f"Row {row_num}: Constraints can only be applied to 'grouped' requirement types. '{category}' is '{requirement.requirement_type}'")
                    continue

                # Build params dict based on constraint type
                params = {}
                scope_filter = {}

                if constraint_type == 'min_level_credits':
                    min_credits = row.get('min_credits', '').strip()
                    min_level = row.get('min_level', '').strip()
                    if not min_credits or not min_level:
                        errors.append(f"Row {row_num}: min_level_credits requires min_credits and min_level")
                        continue
                    params['min_credits'] = int(min_credits)
                    params['min_level'] = int(min_level)

                elif constraint_type == 'min_tag_courses':
                    min_courses = row.get('min_courses', '').strip()
                    tag = row.get('tag', '').strip()
                    tag_value = row.get('tag_value', '').strip()
                    if not min_courses or not tag or not tag_value:
                        errors.append(f"Row {row_num}: min_tag_courses requires min_courses, tag, and tag_value")
                        continue
                    params['min_courses'] = int(min_courses)
                    params['tag'] = tag
                    # Convert boolean strings
                    if tag_value.lower() == 'true':
                        params['tag_value'] = True
                    elif tag_value.lower() == 'false':
                        params['tag_value'] = False
                    else:
                        params['tag_value'] = tag_value

                elif constraint_type == 'max_tag_credits':
                    max_credits = row.get('max_credits', '').strip()
                    tag = row.get('tag', '').strip()
                    tag_value = row.get('tag_value', '').strip()
                    if not max_credits or not tag or not tag_value:
                        errors.append(f"Row {row_num}: max_tag_credits requires max_credits, tag, and tag_value")
                        continue
                    params['max_credits'] = int(max_credits)
                    params['tag'] = tag
                    # Convert boolean strings
                    if tag_value.lower() == 'true':
                        params['tag_value'] = True
                    elif tag_value.lower() == 'false':
                        params['tag_value'] = False
                    else:
                        params['tag_value'] = tag_value

                elif constraint_type == 'min_courses_at_level':
                    min_level = row.get('min_level', '').strip()
                    min_courses = row.get('min_courses', '').strip()
                    if not min_level or not min_courses:
                        errors.append(f"Row {row_num}: min_courses_at_level requires min_level and min_courses")
                        continue
                    params['min_level'] = int(min_level)
                    params['min_courses'] = int(min_courses)

                # Add scope filter if provided
                scope_subjects = row.get('scope_subject_codes', '').strip()
                if scope_subjects:
                    # Split comma-separated subject codes
                    subject_codes = [s.strip() for s in scope_subjects.split(',') if s.strip()]
                    if subject_codes:
                        scope_filter['subject_codes'] = subject_codes

                # Check if constraint already exists
                existing = RequirementConstraint.query.filter_by(
                    requirement_id=requirement.id,
                    constraint_type=constraint_type
                ).first()

                if existing:
                    # Update existing constraint
                    existing.description = description
                    existing.set_params(params)
                    existing.set_scope_filter(scope_filter)
                    constraints_updated += 1
                else:
                    # Create new constraint
                    constraint = RequirementConstraint(
                        requirement_id=requirement.id,
                        constraint_type=constraint_type,
                        description=description
                    )
                    constraint.set_params(params)
                    constraint.set_scope_filter(scope_filter)
                    
                    db.session.add(constraint)
                    constraints_created += 1

            except ValueError as e:
                errors.append(f"Row {row_num}: Invalid data format - {str(e)}")
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")

        if constraints_created > 0 or constraints_updated > 0:
            db.session.commit()

        return jsonify({
            'message': 'Constraints upload completed',
            'constraints_created': constraints_created,
            'constraints_updated': constraints_updated,
            'errors': errors
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500