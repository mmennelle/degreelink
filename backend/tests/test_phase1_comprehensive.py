"""Comprehensive Phase 1 tests for grouped requirements.

Tests cover:
- Credits vs courses required distinction
- Multiple groups in a requirement
- Mixed completion states
- Edge cases for auto-assignment
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
from routes.plans import _assign_requirement_group


@pytest.fixture(scope="module")
def app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    init_app(app)
    with app.app_context():
        db.create_all()
    yield app


@pytest.fixture()
def session(app):
    with app.app_context():
        yield db.session
        db.session.rollback()


def test_credits_required_multiple_courses(session, app):
    """Test group requiring 6 credits from options (2 courses @ 3cr each)."""
    prog = Program(name='BS Test', degree_type='BS', institution='UNO', 
                   total_credits_required=6, description='')
    session.add(prog)
    session.flush()

    req = ProgramRequirement(program_id=prog.id, category='Science Electives', 
                              credits_required=6, description='6 credits of science',
                              requirement_type='grouped', is_current=True)
    session.add(req)
    session.flush()

    grp = RequirementGroup(requirement_id=req.id, group_name='Science Options', 
                           courses_required=0, credits_required=6)
    session.add(grp)
    session.flush()

    # Create courses
    bio1 = Course(code='BIOS 1010', title='Biology I', credits=3, institution='UNO', department='BIOS')
    bio2 = Course(code='BIOS 1020', title='Biology II', credits=3, institution='UNO', department='BIOS')
    bio3 = Course(code='BIOS 2010', title='Biology III', credits=3, institution='UNO', department='BIOS')
    session.add_all([bio1, bio2, bio3])
    session.flush()

    # Add options
    for course in [bio1, bio2, bio3]:
        opt = GroupCourseOption(group_id=grp.id, course_code=course.code, 
                                institution='UNO', is_preferred=False)
        session.add(opt)
    session.commit()

    # Create plan and add 2 courses (6 credits total)
    plan = Plan(student_name='Test', student_email='t@test.com', 
                program_id=prog.id, plan_name='TestPlan')
    session.add(plan)
    session.flush()

    pc1 = PlanCourse(plan_id=plan.id, course_id=bio1.id, status='completed', 
                     requirement_group_id=grp.id)
    pc2 = PlanCourse(plan_id=plan.id, course_id=bio2.id, status='completed', 
                     requirement_group_id=grp.id)
    session.add_all([pc1, pc2])
    session.commit()

    # Test strict evaluation
    result = plan.calculate_progress(program=prog, view_filter='Completed Courses')
    req_result = next(r for r in result['requirements'] if r['category'] == 'Science Electives')
    
    assert req_result['status'] == 'met'
    assert req_result['completedCredits'] == 6
    assert req_result['totalCredits'] == 6
    assert len(req_result['courses']) == 2
    assert 'group_results' in req_result


def test_courses_required_not_credits(session, app):
    """Test group requiring specific number of courses, not credits."""
    prog = Program(name='BS Test', degree_type='BS', institution='UNO', 
                   total_credits_required=6, description='')
    session.add(prog)
    session.flush()

    req = ProgramRequirement(program_id=prog.id, category='Core Requirements', 
                              credits_required=6, description='2 core courses',
                              requirement_type='grouped', is_current=True)
    session.add(req)
    session.flush()

    grp = RequirementGroup(requirement_id=req.id, group_name='Core Group', 
                            courses_required=2, credits_required=0)
    session.add(grp)
    session.flush()

    # Create courses with different credit values
    math1 = Course(code='MATH 1157', title='Math I', credits=3, institution='UNO', department='MATH')
    math2 = Course(code='MATH 1158', title='Math II', credits=4, institution='UNO', department='MATH')
    session.add_all([math1, math2])
    session.flush()

    for course in [math1, math2]:
        opt = GroupCourseOption(group_id=grp.id, course_code=course.code, 
                                institution='UNO', is_preferred=False)
        session.add(opt)
    session.commit()

    # Create plan and add both courses
    plan = Plan(student_name='Test', student_email='t@test.com', 
                program_id=prog.id, plan_name='TestPlan')
    session.add(plan)
    session.flush()

    pc1 = PlanCourse(plan_id=plan.id, course_id=math1.id, status='completed', 
                     requirement_group_id=grp.id)
    pc2 = PlanCourse(plan_id=plan.id, course_id=math2.id, status='completed', 
                     requirement_group_id=grp.id)
    session.add_all([pc1, pc2])
    session.commit()

    # Test strict evaluation - should be satisfied with 2 courses (7 credits total)
    result = plan.calculate_progress(program=prog, view_filter='Completed Courses')
    req_result = next(r for r in result['requirements'] if r['category'] == 'Core Requirements')
    
    assert req_result['status'] == 'met'
    assert req_result['completedCredits'] == 6  # Clamped to requirement total
    assert len(req_result['courses']) == 2


def test_partial_completion(session, app):
    """Test group partially completed."""
    prog = Program(name='BS Test', degree_type='BS', institution='UNO', 
                   total_credits_required=9, description='')
    session.add(prog)
    session.flush()

    req = ProgramRequirement(program_id=prog.id, category='Electives', 
                              credits_required=9, description='9 credits',
                              requirement_type='grouped', is_current=True)
    session.add(req)
    session.flush()

    grp = RequirementGroup(requirement_id=req.id, group_name='Elective Options', 
                           courses_required=0, credits_required=9)
    session.add(grp)
    session.flush()

    # Create courses
    courses = []
    for i in range(3):
        c = Course(code=f'ELEC {1010+i}', title=f'Elective {i+1}', credits=3, 
                   institution='UNO', department='ELEC')
        session.add(c)
        courses.append(c)
    session.flush()

    for course in courses:
        opt = GroupCourseOption(group_id=grp.id, course_code=course.code, 
                                institution='UNO', is_preferred=False)
        session.add(opt)
    session.commit()

    # Create plan and add only 2 of 3 courses (6 of 9 credits)
    plan = Plan(student_name='Test', student_email='t@test.com', 
                program_id=prog.id, plan_name='TestPlan')
    session.add(plan)
    session.flush()

    pc1 = PlanCourse(plan_id=plan.id, course_id=courses[0].id, status='completed', 
                     requirement_group_id=grp.id)
    pc2 = PlanCourse(plan_id=plan.id, course_id=courses[1].id, status='completed', 
                     requirement_group_id=grp.id)
    session.add_all([pc1, pc2])
    session.commit()

    # Test strict evaluation - should show partial completion
    result = plan.calculate_progress(program=prog, view_filter='Completed Courses')
    req_result = next(r for r in result['requirements'] if r['category'] == 'Electives')
    
    assert req_result['status'] == 'part'
    assert req_result['completedCredits'] == 6
    assert req_result['totalCredits'] == 9
    assert len(req_result['courses']) == 2


def test_auto_assign_prefers_is_preferred(session, app):
    """Test that auto-assignment prefers is_preferred=True options."""
    prog = Program(name='BS Test', degree_type='BS', institution='UNO', 
                   total_credits_required=3, description='')
    session.add(prog)
    session.flush()

    # Create two requirements with the same course in different groups
    req1 = ProgramRequirement(program_id=prog.id, category='Core', 
                               credits_required=3, description='Core req',
                               requirement_type='grouped', priority_order=1, is_current=True)
    req2 = ProgramRequirement(program_id=prog.id, category='Elective', 
                               credits_required=3, description='Elective req',
                               requirement_type='grouped', priority_order=2, is_current=True)
    session.add_all([req1, req2])
    session.flush()

    grp1 = RequirementGroup(requirement_id=req1.id, group_name='Core Group', 
                            courses_required=1, credits_required=0)
    grp2 = RequirementGroup(requirement_id=req2.id, group_name='Elective Group', 
                            courses_required=1, credits_required=0)
    session.add_all([grp1, grp2])
    session.flush()

    # Create one course with unique name for this test
    eng = Course(code='ENGL 2001', title='English Pref', credits=3, institution='UNO', department='ENGL')
    session.add(eng)
    session.flush()

    # Add to both groups, but mark as preferred in group2 (which has lower priority)
    opt1 = GroupCourseOption(group_id=grp1.id, course_code=eng.code, 
                             institution='UNO', is_preferred=False)
    opt2 = GroupCourseOption(group_id=grp2.id, course_code=eng.code, 
                             institution='UNO', is_preferred=True)  # Preferred!
    session.add_all([opt1, opt2])
    session.commit()

    # Create plan and add course
    plan = Plan(student_name='Test', student_email='t@test.com', 
                program_id=prog.id, plan_name='TestPlan')
    session.add(plan)
    session.flush()

    pc = PlanCourse(plan_id=plan.id, course_id=eng.id, status='completed')
    session.add(pc)
    session.flush()
    
    # Run auto-assignment
    _assign_requirement_group(plan, pc)
    session.commit()

    # Should assign to grp2 because it's preferred, even though req1 has higher priority
    assert pc.requirement_group_id == grp2.id


def test_auto_assign_uses_priority_when_no_preferred(session, app):
    """Test that auto-assignment uses priority_order when no is_preferred."""
    prog = Program(name='BS Test', degree_type='BS', institution='UNO', 
                   total_credits_required=3, description='')
    session.add(prog)
    session.flush()

    # Create two requirements with different priority_order
    req1 = ProgramRequirement(program_id=prog.id, category='Core', 
                               credits_required=3, description='Core req',
                               requirement_type='grouped', priority_order=10, is_current=True)
    req2 = ProgramRequirement(program_id=prog.id, category='Elective', 
                               credits_required=3, description='Elective req',
                               requirement_type='grouped', priority_order=5, is_current=True)
    session.add_all([req1, req2])
    session.flush()

    grp1 = RequirementGroup(requirement_id=req1.id, group_name='Core Group', 
                            courses_required=1, credits_required=0)
    grp2 = RequirementGroup(requirement_id=req2.id, group_name='Elective Group', 
                            courses_required=1, credits_required=0)
    session.add_all([grp1, grp2])
    session.flush()

    # Create one course with unique name for this test
    eng = Course(code='ENGL 2002', title='English Pri', credits=3, institution='UNO', department='ENGL')
    session.add(eng)
    session.flush()

    # Add to both groups, neither preferred
    opt1 = GroupCourseOption(group_id=grp1.id, course_code=eng.code, 
                             institution='UNO', is_preferred=False)
    opt2 = GroupCourseOption(group_id=grp2.id, course_code=eng.code, 
                             institution='UNO', is_preferred=False)
    session.add_all([opt1, opt2])
    session.commit()

    # Create plan and add course
    plan = Plan(student_name='Test', student_email='t@test.com', 
                program_id=prog.id, plan_name='TestPlan')
    session.add(plan)
    session.flush()

    pc = PlanCourse(plan_id=plan.id, course_id=eng.id, status='completed')
    session.add(pc)
    session.flush()
    
    # Run auto-assignment
    _assign_requirement_group(plan, pc)
    session.commit()

    # Should assign to grp2 because req2 has lower priority_order (5 < 10)
    assert pc.requirement_group_id == grp2.id


def test_simple_requirement_unchanged(session, app):
    """Test that simple requirements still work correctly."""
    prog = Program(name='BS Test', degree_type='BS', institution='UNO', 
                   total_credits_required=6, description='')
    session.add(prog)
    session.flush()

    req = ProgramRequirement(program_id=prog.id, category='Mathematics', 
                              credits_required=6, description='6 credits math',
                              requirement_type='simple', is_current=True)
    session.add(req)
    session.flush()

    # Create courses with unique names for this test
    math1 = Course(code='MATH 2001', title='Math I Simple', credits=3, institution='UNO', 
                   department='MATH', subject_code='MATH')
    math2 = Course(code='MATH 2002', title='Math II Simple', credits=3, institution='UNO', 
                   department='MATH', subject_code='MATH')
    session.add_all([math1, math2])
    session.commit()

    # Create plan and add courses
    plan = Plan(student_name='Test', student_email='t@test.com', 
                program_id=prog.id, plan_name='TestPlan')
    session.add(plan)
    session.flush()

    pc1 = PlanCourse(plan_id=plan.id, course_id=math1.id, status='completed', 
                     requirement_category='Mathematics')
    pc2 = PlanCourse(plan_id=plan.id, course_id=math2.id, status='completed', 
                     requirement_category='Mathematics')
    session.add_all([pc1, pc2])
    session.commit()

    # Test evaluation
    result = plan.calculate_progress(program=prog, view_filter='Completed Courses')
    req_result = next(r for r in result['requirements'] if r['category'] == 'Mathematics')
    
    assert req_result['status'] == 'met'
    assert req_result['completedCredits'] == 6
    assert req_result['totalCredits'] == 6
    assert req_result['requirement_type'] == 'simple'
    # Simple requirements should NOT have group_results
    assert 'group_results' not in req_result or req_result['group_results'] == []
