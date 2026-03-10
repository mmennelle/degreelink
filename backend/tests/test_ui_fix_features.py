"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

"""Tests for ui-fix branch features:

1. Plan code persistence / restore-by-code (Fix 1)
2. Institution filtering on programs endpoint (Fix 2)
3. Plan creation with current_program_id (Fix 2)
4. Prerequisites on courses (existing feature validation)
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
from routes.plans import bp as plans_bp
from routes.programs import bp as programs_bp


@pytest.fixture(scope="module")
def app():
    """Create a Flask test app with routes registered."""
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret'
    init_app(app)
    app.register_blueprint(plans_bp)
    app.register_blueprint(programs_bp)
    with app.app_context():
        db.create_all()
    yield app


@pytest.fixture()
def session(app):
    with app.app_context():
        yield db.session
        db.session.rollback()


@pytest.fixture()
def client(app):
    return app.test_client()


# ─── Seed helpers ────────────────────────────────────────────────────────────

def _seed_institutions(session):
    """Create programs at two distinct institutions."""
    p1 = Program(name='AS General Studies', degree_type='AS',
                 institution='Delgado Community College',
                 total_credits_required=60, description='Gen-studies at Delgado')
    p2 = Program(name='AS Biology', degree_type='AS',
                 institution='Delgado Community College',
                 total_credits_required=60, description='Biology at Delgado')
    p3 = Program(name='BS Computer Science', degree_type='BS',
                 institution='University of New Orleans',
                 total_credits_required=120, description='CS at UNO')
    p4 = Program(name='BS Biology', degree_type='BS',
                 institution='University of New Orleans',
                 total_credits_required=120, description='Biology at UNO')
    session.add_all([p1, p2, p3, p4])
    session.flush()
    return p1, p2, p3, p4


# ─── Fix 1: Plan code persistence & lookup ──────────────────────────────────

class TestPlanCodePersistence:
    """Tests that validate the plan code lookup flow used to restore plans
    after a page refresh (Fix 1 - session persistence)."""

    def test_plan_has_unique_code(self, session, app):
        """Each plan gets a unique 8-char alphanumeric code on creation."""
        with app.app_context():
            prog = Program(name='Test', degree_type='BS', institution='UNO',
                           total_credits_required=120, description='')
            session.add(prog)
            session.flush()

            plans = []
            for i in range(5):
                p = Plan(student_name=f'Student {i}', student_email=f's{i}@test.com',
                         program_id=prog.id, plan_name=f'Plan {i}')
                session.add(p)
                plans.append(p)
            session.flush()

            codes = [p.plan_code for p in plans]
            assert len(set(codes)) == 5, "All plan codes must be unique"
            for code in codes:
                assert len(code) == 8
                assert code.isalnum()

    def test_find_by_code(self, session, app):
        """Plan.find_by_code returns the correct plan."""
        with app.app_context():
            prog = Program(name='Test2', degree_type='BS', institution='UNO',
                           total_credits_required=120, description='')
            session.add(prog)
            session.flush()

            plan = Plan(student_name='Lookup Test', student_email='lookup@test.com',
                        program_id=prog.id, plan_name='Lookup Plan')
            session.add(plan)
            session.flush()

            found = Plan.find_by_code(plan.plan_code)
            assert found is not None
            assert found.id == plan.id
            assert found.student_name == 'Lookup Test'

    def test_find_by_code_invalid(self, session, app):
        """Plan.find_by_code returns None for invalid codes."""
        with app.app_context():
            assert Plan.find_by_code('ZZZZZZZZ') is None
            assert Plan.find_by_code('') is None
            assert Plan.find_by_code(None) is None

    def test_get_plan_by_code_endpoint(self, client, session, app):
        """GET /api/plans/by-code/<code> returns full plan data."""
        with app.app_context():
            prog = Program(name='EndpointTest', degree_type='BS', institution='UNO',
                           total_credits_required=120, description='')
            session.add(prog)
            session.flush()

            plan = Plan(student_name='Endpoint', student_email='ep@test.com',
                        program_id=prog.id, plan_name='EP Plan')
            session.add(plan)
            session.commit()

            resp = client.get(f'/api/plans/by-code/{plan.plan_code}')
            assert resp.status_code == 200
            data = resp.get_json()
            assert data['plan_code'] == plan.plan_code
            assert data['student_name'] == 'Endpoint'

    def test_get_plan_by_code_not_found(self, client, app):
        """GET /api/plans/by-code/<bad-code> returns 404."""
        with app.app_context():
            resp = client.get('/api/plans/by-code/XXXX0000')
            assert resp.status_code == 404

    def test_get_plan_by_code_bad_format(self, client, app):
        """GET /api/plans/by-code/<short> returns 400."""
        with app.app_context():
            resp = client.get('/api/plans/by-code/ABC')
            assert resp.status_code == 400


# ─── Fix 2: Institution filtering on programs ───────────────────────────────

class TestInstitutionFiltering:
    """Tests that programs carry institution info and can be filtered client-side."""

    def test_programs_have_institution(self, session, app):
        """Program.to_dict() includes institution field."""
        with app.app_context():
            prog = Program(name='Inst Test', degree_type='AS',
                           institution='Delgado Community College',
                           total_credits_required=60, description='')
            session.add(prog)
            session.flush()
            d = prog.to_dict()
            assert 'institution' in d
            assert d['institution'] == 'Delgado Community College'

    def test_programs_endpoint_returns_institutions(self, client, session, app):
        """GET /api/programs returns institution for every program."""
        with app.app_context():
            _seed_institutions(session)
            session.commit()

            resp = client.get('/api/programs')
            assert resp.status_code == 200
            data = resp.get_json()
            programs = data['programs']
            assert len(programs) >= 4

            institutions = {p['institution'] for p in programs}
            assert 'Delgado Community College' in institutions
            assert 'University of New Orleans' in institutions

    def test_client_side_filtering_simulation(self, session, app):
        """Simulate the client-side institution filter logic."""
        with app.app_context():
            p1, p2, p3, p4 = _seed_institutions(session)
            session.commit()

            all_programs = [p.to_dict() for p in [p1, p2, p3, p4]]

            # Derive unique institutions
            institutions = sorted({p['institution'] for p in all_programs})
            assert len(institutions) == 2

            # Filter for Delgado
            delgado_programs = [p for p in all_programs
                                if p['institution'] == 'Delgado Community College']
            assert len(delgado_programs) == 2
            assert all('Delgado' in p['institution'] for p in delgado_programs)

            # Filter for UNO
            uno_programs = [p for p in all_programs
                            if p['institution'] == 'University of New Orleans']
            assert len(uno_programs) == 2
            assert all('New Orleans' in p['institution'] for p in uno_programs)


# ─── Fix 2: Plan creation with current_program_id ───────────────────────────

class TestPlanCreationWithPrograms:
    """Tests plan creation including optional current_program_id."""

    def test_create_plan_with_target_only(self, client, session, app):
        """Create a plan with just a target program."""
        with app.app_context():
            prog = Program(name='Target Only', degree_type='BS', institution='UNO',
                           total_credits_required=120, description='')
            session.add(prog)
            session.commit()

            resp = client.post('/api/plans', json={
                'student_name': 'Target Student',
                'student_email': 'target@test.com',
                'program_id': prog.id,
                'plan_name': 'Target Plan',
            })
            assert resp.status_code == 201
            data = resp.get_json()
            assert 'plan' in data
            assert data['plan']['plan_code'] is not None
            assert len(data['plan']['plan_code']) == 8

    def test_create_plan_with_current_program(self, client, session, app):
        """Create a plan with both current and target programs."""
        with app.app_context():
            current = Program(name='Delgado AS', degree_type='AS',
                              institution='Delgado', total_credits_required=60,
                              description='')
            target = Program(name='UNO BS', degree_type='BS',
                             institution='UNO', total_credits_required=120,
                             description='')
            session.add_all([current, target])
            session.commit()

            resp = client.post('/api/plans', json={
                'student_name': 'Transfer Student',
                'student_email': 'transfer@test.com',
                'program_id': target.id,
                'current_program_id': current.id,
                'plan_name': 'Transfer Plan',
            })
            assert resp.status_code == 201
            data = resp.get_json()
            plan = data['plan']
            assert plan['program_id'] == target.id
            assert plan['current_program_id'] == current.id

    def test_create_plan_invalid_target(self, client, app):
        """Creating a plan with nonexistent target program returns 404."""
        with app.app_context():
            resp = client.post('/api/plans', json={
                'student_name': 'Bad',
                'student_email': 'bad@test.com',
                'program_id': 99999,
                'plan_name': 'Bad Plan',
            })
            assert resp.status_code == 404

    def test_create_plan_invalid_current(self, client, session, app):
        """Creating a plan with nonexistent current program returns 404."""
        with app.app_context():
            target = Program(name='Valid Target', degree_type='BS',
                             institution='UNO', total_credits_required=120,
                             description='')
            session.add(target)
            session.commit()

            resp = client.post('/api/plans', json={
                'student_name': 'Bad Current',
                'student_email': 'bc@test.com',
                'program_id': target.id,
                'current_program_id': 99999,
                'plan_name': 'Bad Current Plan',
            })
            assert resp.status_code == 404


# ─── Backend required-field validation ───────────────────────────────────────

class TestCreatePlanValidation:
    """Tests that POST /api/plans returns 400 with specific missing fields."""

    def test_missing_all_required_fields(self, client, app):
        """Submitting empty body returns 400 with all missing field names."""
        with app.app_context():
            resp = client.post('/api/plans', json={})
            assert resp.status_code == 400
            data = resp.get_json()
            assert 'missing_fields' in data
            assert 'Student Name' in data['missing_fields']
            assert 'Student Email' in data['missing_fields']
            assert 'Plan Name' in data['missing_fields']
            assert 'Target Program' in data['missing_fields']

    def test_missing_student_email_only(self, client, session, app):
        """Omitting only student_email returns 400 naming that field."""
        with app.app_context():
            prog = Program(name='ValTest', degree_type='BS', institution='UNO',
                           total_credits_required=120, description='')
            session.add(prog)
            session.commit()

            resp = client.post('/api/plans', json={
                'student_name': 'Has Name',
                'program_id': prog.id,
                'plan_name': 'Has Plan',
            })
            assert resp.status_code == 400
            data = resp.get_json()
            assert 'Student Email' in data['missing_fields']
            assert len(data['missing_fields']) == 1

    def test_missing_student_name_only(self, client, session, app):
        """Omitting only student_name returns 400 naming that field."""
        with app.app_context():
            prog = Program(name='ValTest2', degree_type='BS', institution='UNO',
                           total_credits_required=120, description='')
            session.add(prog)
            session.commit()

            resp = client.post('/api/plans', json={
                'student_email': 'test@test.com',
                'program_id': prog.id,
                'plan_name': 'Has Plan',
            })
            assert resp.status_code == 400
            data = resp.get_json()
            assert 'Student Name' in data['missing_fields']
            assert len(data['missing_fields']) == 1

    def test_whitespace_only_name_rejected(self, client, session, app):
        """A name with only spaces is treated as missing."""
        with app.app_context():
            prog = Program(name='ValTest3', degree_type='BS', institution='UNO',
                           total_credits_required=120, description='')
            session.add(prog)
            session.commit()

            resp = client.post('/api/plans', json={
                'student_name': '   ',
                'student_email': 'test@test.com',
                'program_id': prog.id,
                'plan_name': 'Has Plan',
            })
            assert resp.status_code == 400
            data = resp.get_json()
            assert 'Student Name' in data['missing_fields']


# ─── Prerequisites validation ────────────────────────────────────────────────

class TestPrerequisites:
    """Tests that courses with prerequisites are correctly stored and retrievable."""

    def test_course_prerequisites_stored(self, session, app):
        """Course prerequisite text is stored and returned in to_dict()."""
        with app.app_context():
            c = Course(code='MATH 1115', title='College Algebra',
                       credits=3, institution='Delgado', department='MATH',
                       prerequisites='MATH 0114 or placement')
            session.add(c)
            session.flush()

            d = c.to_dict()
            assert d['prerequisites'] == 'MATH 0114 or placement'

    def test_course_no_prerequisites(self, session, app):
        """Course without prerequisites returns None/empty."""
        with app.app_context():
            c = Course(code='ENGL 1010', title='Freshman Comp',
                       credits=3, institution='Delgado', department='ENGL')
            session.add(c)
            session.flush()

            d = c.to_dict()
            assert d.get('prerequisites') in (None, '', [])


# ─── Progress calculation with grouped requirements ──────────────────────────

class TestProgressCalculation:
    """Tests that plan progress calculation works correctly across view filters."""

    def test_all_courses_view(self, session, app):
        """'All Courses' view shows both completed and planned courses."""
        with app.app_context():
            prog = Program(name='All View Test', degree_type='BS', institution='UNO',
                           total_credits_required=9, description='')
            session.add(prog)
            session.flush()

            req = ProgramRequirement(program_id=prog.id, category='Core',
                                     credits_required=9, description='9 credits',
                                     requirement_type='grouped', is_current=True)
            session.add(req)
            session.flush()

            grp = RequirementGroup(requirement_id=req.id, group_name='Core Options',
                                   courses_required=0, credits_required=9)
            session.add(grp)
            session.flush()

            courses = []
            for i in range(3):
                c = Course(code=f'VIEW {1000+i}', title=f'View Course {i}',
                           credits=3, institution='UNO', department='VIEW')
                session.add(c)
                courses.append(c)
            session.flush()

            for c in courses:
                opt = GroupCourseOption(group_id=grp.id, course_code=c.code,
                                       institution='UNO', is_preferred=False)
                session.add(opt)
            session.commit()

            plan = Plan(student_name='View Test', student_email='v@test.com',
                        program_id=prog.id, plan_name='View Plan')
            session.add(plan)
            session.flush()

            # 2 completed + 1 planned
            pc1 = PlanCourse(plan_id=plan.id, course_id=courses[0].id,
                             status='completed', requirement_group_id=grp.id)
            pc2 = PlanCourse(plan_id=plan.id, course_id=courses[1].id,
                             status='completed', requirement_group_id=grp.id)
            pc3 = PlanCourse(plan_id=plan.id, course_id=courses[2].id,
                             status='planned', requirement_group_id=grp.id)
            session.add_all([pc1, pc2, pc3])
            session.commit()

            # All Courses view should count everything
            result = plan.calculate_progress(program=prog, view_filter='All Courses')
            req_r = next(r for r in result['requirements'] if r['category'] == 'Core')
            assert req_r['completedCredits'] == 9
            assert req_r['status'] == 'met'

            # Completed only should show 6/9
            result2 = plan.calculate_progress(program=prog, view_filter='Completed Courses')
            req_r2 = next(r for r in result2['requirements'] if r['category'] == 'Core')
            assert req_r2['completedCredits'] == 6
            assert req_r2['status'] == 'part'

    def test_zero_credit_requirement(self, session, app):
        """A requirement with 0 credits_required shouldn't cause division errors."""
        with app.app_context():
            prog = Program(name='Zero Cr Test', degree_type='BS', institution='UNO',
                           total_credits_required=0, description='')
            session.add(prog)
            session.flush()

            req = ProgramRequirement(program_id=prog.id, category='Optional',
                                     credits_required=0, description='Optional items',
                                     requirement_type='simple', is_current=True)
            session.add(req)
            session.commit()

            plan = Plan(student_name='Zero', student_email='z@test.com',
                        program_id=prog.id, plan_name='Zero Plan')
            session.add(plan)
            session.commit()

            # Should not raise any exceptions
            result = plan.calculate_progress(program=prog, view_filter='All Courses')
            assert result is not None
            assert 'percent' in result
