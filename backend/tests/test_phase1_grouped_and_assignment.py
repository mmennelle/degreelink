"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

import os
# Ensure feature flags are set BEFORE importing modules that read config
os.environ.setdefault('PROGRESS_USE_GROUPED_EVALUATION', 'true')
os.environ.setdefault('AUTO_ASSIGN_REQUIREMENT_GROUPS', 'true')

import pytest
from flask import Flask

from models import init_app, db
from models.course import Course
from models.program import Program, ProgramRequirement, RequirementGroup, GroupCourseOption
from models.plan import Plan, PlanCourse
from models.equivalency import Equivalency
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


def seed_program_with_group(session, institution='TargetU'):
    # Program with one grouped requirement: choose 1 course from options
    prog = Program(name='BS Test', degree_type='BS', institution=institution, total_credits_required=3, description='')
    session.add(prog)
    session.flush()

    req = ProgramRequirement(program_id=prog.id, category='Test Grouped', credits_required=3,
                              description='One from group', requirement_type='grouped', is_current=True)
    session.add(req)
    session.flush()

    grp = RequirementGroup(requirement_id=req.id, group_name='Core Group', courses_required=1, credits_required=None)
    session.add(grp)
    session.flush()

    optA = GroupCourseOption(group_id=grp.id, course_code='ENGL 1157', institution=institution, is_preferred=True)
    optB = GroupCourseOption(group_id=grp.id, course_code='ENGL 1158', institution=institution, is_preferred=False)
    session.add_all([optA, optB])

    session.commit()
    return prog, req, grp


def seed_courses_and_equiv(session, source_inst='SourceCC', target_inst='TargetU'):
    # Get-or-create target courses
    t1 = Course.query.filter_by(code='ENGL 1157', institution=target_inst).first()
    if not t1:
        t1 = Course(code='ENGL 1157', title='Comp I', credits=3, institution=target_inst, department='ENGL')
        session.add(t1)
        session.flush()
    t2 = Course.query.filter_by(code='ENGL 1158', institution=target_inst).first()
    if not t2:
        t2 = Course(code='ENGL 1158', title='Comp II', credits=3, institution=target_inst, department='ENGL')
        session.add(t2)
        session.flush()
    # Get-or-create source course and equivalency to ENGL 1157
    s1 = Course.query.filter_by(code='ENGL 1010', institution=source_inst).first()
    if not s1:
        s1 = Course(code='ENGL 1010', title='English I', credits=3, institution=source_inst, department='ENGL')
        session.add(s1)
        session.flush()
    eq = Equivalency.query.filter_by(from_course_id=s1.id, to_course_id=t1.id).first()
    if not eq:
        eq = Equivalency(from_course_id=s1.id, to_course_id=t1.id, equivalency_type='direct')
        session.add(eq)
        session.flush()
    session.commit()
    return s1, t1, t2


def test_all_courses_shows_transfer_fill_legacy(session, app):
    prog, req, grp = seed_program_with_group(session)
    s1, t1, _ = seed_courses_and_equiv(session)

    # Create plan targeting program; add source course as planned
    plan = Plan(student_name='Stu', student_email='s@example.com', program_id=prog.id, plan_name='P')
    session.add(plan)
    session.flush()

    pc = PlanCourse(plan_id=plan.id, course_id=s1.id, status='planned')
    session.add(pc)
    session.commit()

    # In All Courses view, legacy path should include equivalency to t1 and count toward grouped req
    prog_result = plan.calculate_progress(program=prog, view_filter='All Courses')
    reqs = prog_result.get('requirements') or []
    found = next((r for r in reqs if (r.get('category') == 'Test Grouped' or r.get('name') == 'Test Grouped')), None)
    assert found is not None
    assert (found.get('completedCredits') or 0) >= 3


def test_completed_view_uses_strict_group_eval(session, app):
    prog, req, grp = seed_program_with_group(session)
    s1, t1, _ = seed_courses_and_equiv(session)

    plan = Plan(student_name='Stu', student_email='s@example.com', program_id=prog.id, plan_name='P2')
    session.add(plan)
    session.flush()

    # Completed mapping of a SOURCE course should NOT satisfy grouped evaluator in strict mode
    pc = PlanCourse(plan_id=plan.id, course_id=s1.id, status='completed')
    session.add(pc)
    session.commit()

    prog_result = plan.calculate_progress(program=prog, view_filter='Completed Courses')
    reqs = prog_result.get('requirements') or []
    found = next((r for r in reqs if (r.get('category') == 'Test Grouped' or r.get('name') == 'Test Grouped')), None)
    assert found is not None
    assert (found.get('completedCredits') or 0) == 0
    assert found.get('status') in ('none', 'part')

    # Now add the direct TARGET course and verify strict grouped evaluation counts it
    pc2 = PlanCourse(plan_id=plan.id, course_id=t1.id, status='completed')
    session.add(pc2)
    session.commit()

    prog_result2 = plan.calculate_progress(program=prog, view_filter='Completed Courses')
    reqs2 = prog_result2.get('requirements') or []
    found2 = next((r for r in reqs2 if (r.get('category') == 'Test Grouped' or r.get('name') == 'Test Grouped')), None)
    assert found2 is not None
    assert (found2.get('completedCredits') or 0) >= 3
    assert found2.get('status') in ('met', 'part')


def test_auto_assign_group_on_add(session, app):
    # Program at TargetU, group with option ENGL 1157 preferred
    prog, req, grp = seed_program_with_group(session)
    # Add the target course directly to plan; auto-assignment should attach group id
    t_course = Course.query.filter_by(code='ENGL 1157', institution=prog.institution).first()
    assert t_course is not None

    plan = Plan(student_name='Stu', student_email='s@example.com', program_id=prog.id, plan_name='P3')
    session.add(plan)
    session.flush()

    pc = PlanCourse(plan_id=plan.id, course_id=t_course.id, status='planned')
    session.add(pc)
    session.flush()
    # Explicitly invoke the same helper the endpoint uses for auto-assignment
    _assign_requirement_group(plan, pc)
    session.commit()

    # Verify that requirement_group_id is set to the expected group
    assert pc.requirement_group_id == grp.id


def test_zero_credit_group_is_satisfied(session, app):
    # Program with a grouped requirement requiring 0 credits and group requiring 0 courses
    prog = Program(name='BS Zero', degree_type='BS', institution='TargetU', total_credits_required=0, description='')
    session.add(prog)
    session.flush()

    req = ProgramRequirement(program_id=prog.id, category='Zero Grouped', credits_required=0,
                              description='Zero credit requirement', requirement_type='grouped', is_current=True)
    session.add(req)
    session.flush()

    grp = RequirementGroup(requirement_id=req.id, group_name='Zero Group', courses_required=0, credits_required=None)
    session.add(grp)
    session.commit()

    plan = Plan(student_name='Z', student_email='z@example.com', program_id=prog.id, plan_name='ZP')
    session.add(plan)
    session.commit()

    # Strict view should mark it satisfied with 0 credits
    res = plan.calculate_progress(program=prog, view_filter='Completed Courses')
    r = next((x for x in (res.get('requirements') or []) if (x.get('category') == 'Zero Grouped')), None)
    assert r is not None
    assert r.get('status') == 'met'
    assert (r.get('completedCredits') or 0) == 0

