"""
Phase 2: Simple constraint evaluation tests
Focused tests for constraint functionality.
"""
import os
os.environ.setdefault('PROGRESS_USE_GROUPED_EVALUATION', 'true')
os.environ.setdefault('AUTO_ASSIGN_REQUIREMENT_GROUPS', 'true')

import pytest
from flask import Flask

from models import init_app, db
from models.course import Course
from models.program import Program, ProgramRequirement, RequirementGroup, GroupCourseOption
from models.plan import Plan, PlanCourse
from models.constraint import RequirementConstraint


@pytest.fixture
def app():
    """Create and configure a test Flask app."""
    test_app = Flask(__name__)
    test_app.config['TESTING'] = True
    test_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    test_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    init_app(test_app)
    
    with test_app.app_context():
        db.create_all()
        yield test_app
        db.session.remove()
        db.drop_all()


def test_constraints_all_satisfied(app):
    """Test BIOS electives where all constraints are satisfied."""
    with app.app_context():
        # Create courses
        bios_3010 = Course(subject_code='BIOS', course_number='3010', title='Cell Biology', credits=4, institution='UNO', has_lab=True, course_type='lecture_lab')
        bios_3150 = Course(subject_code='BIOS', course_number='3150', title='Genetics', credits=4, institution='UNO', has_lab=True, course_type='lecture_lab')
        bios_3500 = Course(subject_code='BIOS', course_number='3500', title='Microbiology', credits=4, institution='UNO', has_lab=True, course_type='lecture_lab')
        bios_3200 = Course(subject_code='BIOS', course_number='3200', title='Ecology', credits=3, institution='UNO', has_lab=False, course_type='lecture')
        bios_4990 = Course(subject_code='BIOS', course_number='4990', title='Research', credits=3, institution='UNO', has_lab=False, course_type='research')
        
        db.session.add_all([bios_3010, bios_3150, bios_3500, bios_3200, bios_4990])
        db.session.flush()
        
        # Create program and requirement
        program = Program(name="Biology B.S.", degree_type="Bachelor of Science", institution="UNO", total_credits_required=120)
        db.session.add(program)
        db.session.flush()
        
        bios_req = ProgramRequirement(
            program_id=program.id,
            category="BIOS Electives",
            credits_required=17,
            description="Biology electives with constraints",
            requirement_type='grouped',
            is_current=True
        )
        db.session.add(bios_req)
        db.session.flush()
        
        # Create group with course options
        bios_group = RequirementGroup(requirement_id=bios_req.id, group_name="BIOS 3000+", courses_required=0)
        db.session.add(bios_group)
        db.session.flush()
        
        for course in [bios_3010, bios_3150, bios_3500, bios_3200, bios_4990]:
            opt = GroupCourseOption(group_id=bios_group.id, course_code=f'{course.subject_code} {course.course_number}', institution=course.institution)
            db.session.add(opt)
        
        # Create constraints
        constraint_min_level = RequirementConstraint(requirement_id=bios_req.id, constraint_type='min_level_credits', description='Min 10cr at 3000+')
        constraint_min_level.set_params({'min_credits': 10, 'min_level': 3000})
        constraint_min_level.set_scope_filter({'subject_codes': ['BIOS']})
        db.session.add(constraint_min_level)
        
        constraint_min_labs = RequirementConstraint(requirement_id=bios_req.id, constraint_type='min_tag_courses', description='Min 2 labs')
        constraint_min_labs.set_params({'min_courses': 2, 'tag': 'has_lab', 'tag_value': True})
        constraint_min_labs.set_scope_filter({'subject_codes': ['BIOS']})
        db.session.add(constraint_min_labs)
        
        constraint_max_research = RequirementConstraint(requirement_id=bios_req.id, constraint_type='max_tag_credits', description='Max 7cr research')
        constraint_max_research.set_params({'max_credits': 7, 'tag': 'course_type', 'tag_value': 'research'})
        constraint_max_research.set_scope_filter({'subject_codes': ['BIOS']})
        db.session.add(constraint_max_research)
        
        db.session.commit()
        
        # Create plan with courses satisfying all constraints
        # 18cr total, 3 labs, 3cr research
        plan = Plan(program_id=program.id, student_name="Test Student", plan_name="Valid Plan")
        db.session.add(plan)
        db.session.flush()
        
        for course in [bios_3010, bios_3150, bios_3500, bios_3200, bios_4990]:
            pc = PlanCourse(plan_id=plan.id, course_id=course.id, semester='Fall', year=2025, status='completed')
            db.session.add(pc)
        
        db.session.commit()
        
        # Calculate progress
        progress = plan.calculate_progress(program, view_filter="Completed Courses")
        
        # Find BIOS result
        bios_result = next((r for r in progress['requirements'] if r['category'] == 'BIOS Electives'), None)
        assert bios_result is not None, "BIOS Electives requirement not found"
        
        # Check that requirement is met
        assert bios_result['status'] == 'met', f"Expected 'met', got '{bios_result['status']}'"
        assert bios_result['completedCredits'] >= 17, f"Expected >= 17 credits, got {bios_result['completedCredits']}"
        
        # Check constraints
        assert 'constraint_results' in bios_result, "constraint_results missing"
        assert len(bios_result['constraint_results']) == 3, f"Expected 3 constraints, got {len(bios_result['constraint_results'])}"
        assert bios_result['constraints_satisfied'] == True, "Expected constraints_satisfied=True"
        
        # All constraints should be satisfied
        for constraint_result in bios_result['constraint_results']:
            assert constraint_result['satisfied'] == True, f"Constraint {constraint_result['constraint_type']} not satisfied: {constraint_result.get('reason', '')}"


def test_constraints_lab_requirement_fails(app):
    """Test BIOS electives where lab constraint is NOT satisfied."""
    with app.app_context():
        # Create courses - mostly non-lab courses
        bios_3010 = Course(subject_code='BIOS', course_number='3010', title='Cell Biology', credits=4, institution='UNO', has_lab=True, course_type='lecture_lab')
        bios_3200 = Course(subject_code='BIOS', course_number='3200', title='Ecology', credits=3, institution='UNO', has_lab=False, course_type='lecture')
        bios_4990 = Course(subject_code='BIOS', course_number='4990', title='Research', credits=3, institution='UNO', has_lab=False, course_type='research')
        bios_4991 = Course(subject_code='BIOS', course_number='4991', title='Advanced Research', credits=4, institution='UNO', has_lab=False, course_type='research')
        bios_4800 = Course(subject_code='BIOS', course_number='4800', title='Seminar', credits=1, institution='UNO', has_lab=False, course_type='seminar')
        
        db.session.add_all([bios_3010, bios_3200, bios_4990, bios_4991, bios_4800])
        db.session.flush()
        
        # Create program and requirement
        program = Program(name="Biology B.S.", degree_type="Bachelor of Science", institution="UNO", total_credits_required=120)
        db.session.add(program)
        db.session.flush()
        
        bios_req = ProgramRequirement(
            program_id=program.id,
            category="BIOS Electives",
            credits_required=17,
            description="Biology electives with constraints",
            requirement_type='grouped',
            is_current=True
        )
        db.session.add(bios_req)
        db.session.flush()
        
        # Create group
        bios_group = RequirementGroup(requirement_id=bios_req.id, group_name="BIOS 3000+", courses_required=0)
        db.session.add(bios_group)
        db.session.flush()
        
        for course in [bios_3010, bios_3200, bios_4990, bios_4991, bios_4800]:
            opt = GroupCourseOption(group_id=bios_group.id, course_code=f'{course.subject_code} {course.course_number}', institution=course.institution)
            db.session.add(opt)
        
        # Create constraints (same as before)
        constraint_min_level = RequirementConstraint(requirement_id=bios_req.id, constraint_type='min_level_credits', description='Min 10cr at 3000+')
        constraint_min_level.set_params({'min_credits': 10, 'min_level': 3000})
        constraint_min_level.set_scope_filter({'subject_codes': ['BIOS']})
        db.session.add(constraint_min_level)
        
        constraint_min_labs = RequirementConstraint(requirement_id=bios_req.id, constraint_type='min_tag_courses', description='Min 2 labs')
        constraint_min_labs.set_params({'min_courses': 2, 'tag': 'has_lab', 'tag_value': True})
        constraint_min_labs.set_scope_filter({'subject_codes': ['BIOS']})
        db.session.add(constraint_min_labs)
        
        constraint_max_research = RequirementConstraint(requirement_id=bios_req.id, constraint_type='max_tag_credits', description='Max 7cr research')
        constraint_max_research.set_params({'max_credits': 7, 'tag': 'course_type', 'tag_value': 'research'})
        constraint_max_research.set_scope_filter({'subject_codes': ['BIOS']})
        db.session.add(constraint_max_research)
        
        db.session.commit()
        
        # Create plan with only 1 lab course (fails lab constraint)
        # 15cr total, 1 lab, 7cr research (at max)
        plan = Plan(program_id=program.id, student_name="Test Student", plan_name="Insufficient Labs Plan")
        db.session.add(plan)
        db.session.flush()
        
        for course in [bios_3010, bios_3200, bios_4990, bios_4991, bios_4800]:
            pc = PlanCourse(plan_id=plan.id, course_id=course.id, semester='Fall', year=2025, status='completed')
            db.session.add(pc)
        
        db.session.commit()
        
        # Calculate progress
        progress = plan.calculate_progress(program, view_filter="Completed Courses")
        
        # Find BIOS result
        bios_result = next((r for r in progress['requirements'] if r['category'] == 'BIOS Electives'), None)
        assert bios_result is not None
        
        # Should NOT be met because lab constraint fails
        assert bios_result['constraints_satisfied'] == False, "Expected constraints_satisfied=False"
        assert bios_result['status'] != 'met', f"Status should not be 'met' when constraints fail"
        
        # Check lab constraint failed
        lab_constraint = next((c for c in bios_result['constraint_results'] if c['constraint_type'] == 'min_tag_courses'), None)
        assert lab_constraint is not None, "Lab constraint result not found"
        assert lab_constraint['satisfied'] == False, "Lab constraint should not be satisfied"
