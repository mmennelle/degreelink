from flask import Blueprint, request, jsonify
from auth import require_admin
from models import db
from models.program import Program, ProgramRequirement, RequirementGroup, GroupCourseOption

bp = Blueprint('programs', __name__, url_prefix='/api/programs')

@bp.route('', methods=['GET'])
def get_programs():
    """
    Retrieve a list of programs.  By default, only the currently active
    requirement versions are returned for each program.  Advisors can
    request all versions by passing include_all=true in the query string.
    Optionally, a specific semester and year can be requested via
    semester=...&year=....
    """
    include_all = request.args.get('include_all', 'false').lower() == 'true'
    sem_filter = request.args.get('semester')
    year_filter = request.args.get('year')
    year_filter_int = None
    if year_filter:
        try:
            year_filter_int = int(year_filter)
        except ValueError:
            year_filter_int = None
    programs = Program.query.all()
    result = []
    for program in programs:
        prog_data = program.to_dict()
        # Filter requirements based on flags
        requirements = program.requirements
        if not include_all or sem_filter or year_filter_int is not None:
            filtered = []
            for req in requirements:
                # Only include if matches semester/year filter, else skip
                if sem_filter and req.semester != sem_filter:
                    continue
                if year_filter_int is not None and req.year != year_filter_int:
                    continue
                if include_all:
                    # When include_all is true, return all matching versions
                    filtered.append(req.to_dict())
                else:
                    # Default: only include current requirements
                    if req.is_current:
                        filtered.append(req.to_dict())
            prog_data['requirements'] = filtered
        else:
            prog_data['requirements'] = [r.to_dict() for r in requirements]
        result.append(prog_data)
    return jsonify({'programs': result})

@bp.route('/<int:program_id>', methods=['GET'])
def get_program(program_id):
    """
    Retrieve detailed program information.  Only the active requirement
    version is returned by default.  Advisors can request all versions
    with include_all=true or filter by semester/year.
    """
    include_all = request.args.get('include_all', 'false').lower() == 'true'
    sem_filter = request.args.get('semester')
    year_filter = request.args.get('year')
    year_filter_int = None
    if year_filter:
        try:
            year_filter_int = int(year_filter)
        except ValueError:
            year_filter_int = None
    program = Program.query.get_or_404(program_id)
    program_data = program.to_dict()
    requirements_analysis = []
    for requirement in program.requirements:
        # Apply filters similar to get_programs
        if sem_filter and requirement.semester != sem_filter:
            continue
        if year_filter_int is not None and requirement.year != year_filter_int:
            continue
        if not include_all and not requirement.is_current:
            continue
        req_data = requirement.to_dict()
        if requirement.requirement_type == 'grouped':
            total_options = sum(len(group.course_options) for group in requirement.groups)
            preferred_options = sum(
                len([opt for opt in group.course_options if opt.is_preferred]) 
                for group in requirement.groups
            )
            req_data['statistics'] = {
                'total_groups': len(requirement.groups),
                'total_course_options': total_options,
                'preferred_options': preferred_options
            }
        requirements_analysis.append(req_data)
    program_data['requirements'] = requirements_analysis
    return jsonify(program_data)

@bp.route('/<int:program_id>/versions', methods=['GET'])
def get_program_versions(program_id):
    """
    Return a list of distinct requirement versions for a program.  Each
    version is represented by its semester, year and whether it is the
    current version.  The count of requirements in each version is also
    included.
    """
    program = Program.query.get_or_404(program_id)
    from models.program import ProgramRequirement
    versions = db.session.query(
        ProgramRequirement.semester,
        ProgramRequirement.year,
        db.func.count(ProgramRequirement.id).label('requirement_count'),
        db.func.max(ProgramRequirement.is_current).label('is_current')
    ).filter(
        ProgramRequirement.program_id == program_id
    ).group_by(
        ProgramRequirement.semester,
        ProgramRequirement.year
    ).all()
    version_list = []
    for sem, yr, count, current in versions:
        version_list.append({
            'semester': sem,
            'year': yr,
            'requirement_count': count,
            'is_current': bool(current)
        })
    return jsonify({'program_id': program_id, 'versions': version_list})

@bp.route('/<int:program_id>/versions/set-current', methods=['PUT'])
@require_admin
def set_program_current_version(program_id):
    """
    Set the current requirement version for a program.  Expects JSON
    payload with 'semester' and 'year' fields identifying the version.
    All other versions of the program will be marked as not current.
    """
    data = request.get_json() or {}
    semester = data.get('semester')
    year = data.get('year')
    if not semester or year is None:
        return jsonify({'error': 'semester and year are required'}), 400
    try:
        year_int = int(year)
    except (TypeError, ValueError):
        return jsonify({'error': 'year must be an integer'}), 400
    from models.program import ProgramRequirement
    # Ensure program exists
    program = Program.query.get_or_404(program_id)
    # Update current flags
    ProgramRequirement.query.filter_by(program_id=program_id).update({ProgramRequirement.is_current: False})
    updated = ProgramRequirement.query.filter_by(
        program_id=program_id,
        semester=semester,
        year=year_int
    ).update({ProgramRequirement.is_current: True})
    db.session.commit()
    if not updated:
        return jsonify({'error': 'Specified version not found'}), 404
    return jsonify({'message': 'Current version updated', 'semester': semester, 'year': year_int})

@bp.route('/<int:program_id>/requirements/<int:requirement_id>', methods=['PUT'])
@require_admin
def update_program_requirement(program_id, requirement_id):
    """
    Update an existing program requirement.  Currently allows updating
    basic fields such as credits_required, description, requirement_type,
    semester, year and is_current.  Group and option edits are not
    handled here and should be performed via CSV re-upload if needed.
    """
    from models.program import ProgramRequirement
    requirement = ProgramRequirement.query.filter_by(
        id=requirement_id,
        program_id=program_id
    ).first_or_404()
    data = request.get_json() or {}
    # Update simple fields
    if 'category' in data:
        requirement.category = data['category']
    if 'credits_required' in data:
        try:
            requirement.credits_required = int(data['credits_required'])
        except (TypeError, ValueError):
            return jsonify({'error': 'credits_required must be an integer'}), 400
    if 'description' in data:
        requirement.description = data['description']
    if 'requirement_type' in data:
        requirement.requirement_type = data['requirement_type']
    if 'semester' in data:
        requirement.semester = data['semester']
    if 'year' in data:
        try:
            requirement.year = int(data['year']) if data['year'] is not None else None
        except (TypeError, ValueError):
            return jsonify({'error': 'year must be an integer'}), 400
    if 'is_current' in data:
        is_cur = bool(data['is_current'])
        requirement.is_current = is_cur
        if is_cur:
            # Clear current flag on other requirements of this program
            from models.program import ProgramRequirement as PR
            PR.query.filter(
                PR.program_id == program_id,
                PR.id != requirement_id
            ).update({PR.is_current: False})
    db.session.commit()
    return jsonify({'message': 'Requirement updated', 'requirement': requirement.to_dict()})

@bp.route('/<int:program_id>/requirements/<int:requirement_id>/suggestions', methods=['GET'])
def get_requirement_suggestions(program_id, requirement_id):
    
    requirement = ProgramRequirement.query.filter_by(
        id=requirement_id, 
        program_id=program_id
    ).first_or_404()
    
    suggestions = []
    
    if requirement.requirement_type == 'grouped':
        for group in requirement.groups:
            group_suggestions = []
            for option in group.course_options:
                
                from models.course import Course
                course = Course.query.filter_by(code=option.course_code).first()
                if course:
                    group_suggestions.append({
                        'course': course.to_dict(),
                        'option_info': option.to_dict(),
                        'group_name': group.group_name
                    })
            
            suggestions.append({
                'group': group.to_dict(),
                'course_options': group_suggestions
            })
    
    return jsonify({
        'requirement': requirement.to_dict(),
        'suggestions': suggestions
    })
