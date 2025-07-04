from flask import Blueprint, request, jsonify
from models import db
from models.program import Program, ProgramRequirement, RequirementGroup, GroupCourseOption

bp = Blueprint('programs', __name__, url_prefix='/api/programs')

@bp.route('', methods=['GET'])
def get_programs():
    """Get all programs with their requirements"""
    programs = Program.query.all()
    
    return jsonify({
        'programs': [program.to_dict() for program in programs]
    })

@bp.route('/<int:program_id>', methods=['GET'])
def get_program(program_id):
    """Get a specific program with detailed requirements"""
    program = Program.query.get_or_404(program_id)
    
    program_data = program.to_dict()
    
    # Add detailed requirement analysis
    requirements_analysis = []
    for requirement in program.requirements:
        req_data = requirement.to_dict()
        
        # Add statistics about course options
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

@bp.route('/<int:program_id>/requirements/<int:requirement_id>/suggestions', methods=['GET'])
def get_requirement_suggestions(program_id, requirement_id):
    """Get course suggestions for a specific requirement"""
    requirement = ProgramRequirement.query.filter_by(
        id=requirement_id, 
        program_id=program_id
    ).first_or_404()
    
    suggestions = []
    
    if requirement.requirement_type == 'grouped':
        for group in requirement.groups:
            group_suggestions = []
            for option in group.course_options:
                # Find actual course
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
