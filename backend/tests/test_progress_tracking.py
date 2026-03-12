"""
Degree Link - Comprehensive Progress Tracking Test Suite
Copyright (c) 2025 University of New Orleans - Computer Science Department

End-to-end progress tracking tests that:
  1. Create a plan with current + target programs (each having multiple categories)
  2. Add courses one-by-one, asserting credit counts at each step
  3. Verify both current and target progress trackers update correctly
  4. Test constraint evaluation (min/max credits, course counts, level requirements)
  5. Test constraint warnings and violations
  6. Test equivalency-driven cross-institution credit mapping
"""

import os
import sys
import json

THIS_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(THIS_DIR, '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault('PROGRESS_USE_GROUPED_EVALUATION', 'true')
os.environ.setdefault('AUTO_ASSIGN_REQUIREMENT_GROUPS', 'true')

import pytest
from flask import Flask

from models import init_app, db
from models.course import Course
from models.equivalency import Equivalency
from models.program import (
    Program, ProgramRequirement, RequirementGroup, GroupCourseOption
)
from models.plan import Plan, PlanCourse
from models.constraint import RequirementConstraint
from services.progress_service import ProgressService
from routes.plans import _assign_requirement_group


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def app():
    """Create a test Flask app with an in-memory SQLite database."""
    application = Flask(__name__)
    application.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    application.config['TESTING'] = True
    application.config['SECRET_KEY'] = 'test-secret-key'
    init_app(application)

    from routes import register_routes
    register_routes(application)

    with application.app_context():
        db.create_all()
    yield application


@pytest.fixture(autouse=True)
def session(app):
    """Clean database per test."""
    with app.app_context():
        db.drop_all()
        db.create_all()
        yield db.session
        db.session.rollback()


@pytest.fixture()
def client(app):
    return app.test_client()


# ---------------------------------------------------------------------------
# Helper: build a realistic two-institution scenario
# ---------------------------------------------------------------------------

def _build_two_institution_scenario(session):
    """Build a realistic Delgado → UNO transfer scenario.

    Current program (Delgado AS):
      - English Composition: 6 cr (simple)
      - Mathematics: 6 cr (simple)
      - Science: 8 cr (simple)

    Target program (UNO BS):
      - English: 6 cr (simple)
      - Mathematics: 6 cr (simple)
      - Biological Sciences: 12 cr (grouped, with constraints)

    Returns dict with all created objects.
    """
    # ---- Programs ----
    delgado = Program(
        name='AS General Studies', degree_type='AS',
        institution='Delgado', total_credits_required=20, description=''
    )
    uno = Program(
        name='BS Biology', degree_type='BS',
        institution='UNO', total_credits_required=24, description=''
    )
    session.add_all([delgado, uno])
    session.flush()

    # ---- Delgado requirements (simple) ----
    del_eng = ProgramRequirement(
        program_id=delgado.id, category='English Composition',
        credits_required=6, requirement_type='simple', is_current=True
    )
    del_math = ProgramRequirement(
        program_id=delgado.id, category='Mathematics',
        credits_required=6, requirement_type='simple', is_current=True
    )
    del_sci = ProgramRequirement(
        program_id=delgado.id, category='Science',
        credits_required=8, requirement_type='simple', is_current=True
    )
    session.add_all([del_eng, del_math, del_sci])
    session.flush()

    # ---- UNO requirements ----
    uno_eng = ProgramRequirement(
        program_id=uno.id, category='English',
        credits_required=6, requirement_type='simple', is_current=True
    )
    uno_math = ProgramRequirement(
        program_id=uno.id, category='Mathematics',
        credits_required=6, requirement_type='simple', is_current=True
    )
    # Grouped requirement with constraints
    uno_bio = ProgramRequirement(
        program_id=uno.id, category='Biological Sciences',
        credits_required=12, requirement_type='grouped', is_current=True
    )
    session.add_all([uno_eng, uno_math, uno_bio])
    session.flush()

    # ---- UNO Bio groups ----
    bio_core = RequirementGroup(
        requirement_id=uno_bio.id, group_name='Biology Core',
        courses_required=0, credits_required=8
    )
    bio_elective = RequirementGroup(
        requirement_id=uno_bio.id, group_name='Biology Electives',
        courses_required=0, credits_required=4
    )
    session.add_all([bio_core, bio_elective])
    session.flush()

    # ---- Courses: Delgado ----
    del_courses = {}
    for code, title, credits, dept, subj in [
        ('ENGL 101', 'Composition I', 3, 'ENGL', 'ENGL'),
        ('ENGL 102', 'Composition II', 3, 'ENGL', 'ENGL'),
        ('MATH 130', 'College Algebra', 3, 'MATH', 'MATH'),
        ('MATH 221', 'Calculus I', 3, 'MATH', 'MATH'),
        ('BIOL 111', 'General Biology I', 4, 'BIOL', 'BIOL'),
        ('BIOL 112', 'General Biology II', 4, 'BIOL', 'BIOL'),
        ('BIOL 210', 'Microbiology', 4, 'BIOL', 'BIOL'),
    ]:
        c = Course(code=code, title=title, credits=credits,
                   institution='Delgado', department=dept, subject_code=subj)
        session.add(c)
        del_courses[code] = c

    # ---- Courses: UNO ----
    uno_courses = {}
    for code, title, credits, dept, subj, level in [
        ('ENGL 1157', 'English Comp I', 3, 'ENGL', 'ENGL', 1000),
        ('ENGL 1158', 'English Comp II', 3, 'ENGL', 'ENGL', 1000),
        ('MATH 1115', 'College Algebra', 3, 'MATH', 'MATH', 1000),
        ('MATH 1125', 'Calculus I', 3, 'MATH', 'MATH', 1000),
        ('BIOS 1011', 'General Bio I', 4, 'BIOS', 'BIOS', 1000),
        ('BIOS 1012', 'General Bio I Lab', 0, 'BIOS', 'BIOS', 1000),
        ('BIOS 1021', 'General Bio II', 4, 'BIOS', 'BIOS', 1000),
        ('BIOS 2051', 'Cell Biology', 4, 'BIOS', 'BIOS', 2000),
        ('BIOS 3044', 'Genetics', 4, 'BIOS', 'BIOS', 3000),
        ('BIOS 4050', 'Molecular Bio', 4, 'BIOS', 'BIOS', 4000),
    ]:
        c = Course(code=code, title=title, credits=credits,
                   institution='UNO', department=dept, subject_code=subj)
        # Force course_level since SQLite won't trigger all column defaults
        c.course_level = level
        c.course_number_numeric = int(code.split()[1][:4])
        session.add(c)
        uno_courses[code] = c

    session.flush()

    # ---- Group course options for UNO Bio ----
    for code in ['BIOS 1011', 'BIOS 1021']:
        session.add(GroupCourseOption(
            group_id=bio_core.id, course_code=code,
            institution='UNO', is_preferred=True
        ))
    for code in ['BIOS 2051', 'BIOS 3044', 'BIOS 4050']:
        session.add(GroupCourseOption(
            group_id=bio_elective.id, course_code=code,
            institution='UNO', is_preferred=False
        ))
    session.flush()

    # ---- Equivalencies: Delgado ↔ UNO ----
    equivs = [
        ('ENGL 101', 'ENGL 1157'),
        ('ENGL 102', 'ENGL 1158'),
        ('MATH 130', 'MATH 1115'),
        ('MATH 221', 'MATH 1125'),
        ('BIOL 111', 'BIOS 1011'),
        ('BIOL 112', 'BIOS 1021'),
    ]
    for del_code, uno_code in equivs:
        session.add(Equivalency(
            from_course_id=del_courses[del_code].id,
            to_course_id=uno_courses[uno_code].id,
            equivalency_type='direct'
        ))
    session.flush()

    return {
        'delgado': delgado,
        'uno': uno,
        'del_eng': del_eng, 'del_math': del_math, 'del_sci': del_sci,
        'uno_eng': uno_eng, 'uno_math': uno_math, 'uno_bio': uno_bio,
        'bio_core': bio_core, 'bio_elective': bio_elective,
        'del_courses': del_courses,
        'uno_courses': uno_courses,
    }


def _add_course_to_plan(session, plan, course, status='completed',
                        category=None, group_id=None):
    """Helper: add a PlanCourse, flush, and expire plan to bust relationship cache."""
    pc = PlanCourse(
        plan_id=plan.id, course_id=course.id,
        status=status, credits=course.credits,
        requirement_category=category,
        requirement_group_id=group_id,
    )
    session.add(pc)
    session.flush()
    session.expire(plan)  # Force reload of plan.courses relationship
    return pc


def _get_req_progress(result, category):
    """Extract a single requirement entry from progress results."""
    for r in result.get('requirements', []):
        if r['category'] == category:
            return r
    return None


# ===========================================================================
# 1. EMPTY PLAN — BOTH TRACKERS START AT ZERO
# ===========================================================================

class TestEmptyPlanProgress:
    """With no courses, both progress trackers should show zero."""

    def test_empty_plan_current_and_target_zero(self, session, app):
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Empty Plan'
        )
        session.add(plan)
        session.flush()

        result = plan.calculate_progress()

        # Current (Delgado)
        cur = result['current']
        assert cur['percent'] == 0
        assert cur['total_credits_earned'] == 0
        assert cur['total_credits_required'] == 20  # 6 + 6 + 8

        # Target (UNO)
        tgt = result['transfer']
        assert tgt['percent'] == 0
        assert tgt['total_credits_earned'] == 0
        assert tgt['total_credits_required'] == 24  # 6 + 6 + 12

    def test_empty_all_categories_status_none(self, session, app):
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Empty Plan'
        )
        session.add(plan)
        session.flush()

        result = plan.calculate_progress()

        for req in result['current']['requirements']:
            assert req['status'] == 'none', f"Current req {req['category']} should be 'none'"
            assert req['completedCredits'] == 0

        for req in result['transfer']['requirements']:
            assert req['status'] == 'none', f"Transfer req {req['category']} should be 'none'"
            assert req['completedCredits'] == 0


# ===========================================================================
# 2. INCREMENTAL COURSE ADDITION — SIMPLE REQUIREMENTS
# ===========================================================================

class TestIncrementalSimpleProgress:
    """Add courses one-by-one and verify credit counts at each step."""

    def test_add_english_courses_incrementally(self, session, app):
        """Add Delgado ENGL 101 then ENGL 102. Track credits on both bars."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='English Test'
        )
        session.add(plan)
        session.flush()

        # --- Step 1: Add ENGL 101 (Delgado, 3cr) ---
        _add_course_to_plan(
            session, plan, s['del_courses']['ENGL 101'],
            category='English Composition'
        )

        result = plan.calculate_progress()

        # Current (Delgado): English Composition should show 3/6
        cur_eng = _get_req_progress(result['current'], 'English Composition')
        assert cur_eng is not None
        assert cur_eng['completedCredits'] == 3
        assert cur_eng['totalCredits'] == 6
        assert cur_eng['status'] == 'part'

        # Target (UNO): English should also show 3/6 via equivalency
        tgt_eng = _get_req_progress(result['transfer'], 'English')
        assert tgt_eng is not None
        assert tgt_eng['completedCredits'] == 3
        assert tgt_eng['totalCredits'] == 6
        assert tgt_eng['status'] == 'part'

        # --- Step 2: Add ENGL 102 (Delgado, 3cr) ---
        _add_course_to_plan(
            session, plan, s['del_courses']['ENGL 102'],
            category='English Composition'
        )

        result = plan.calculate_progress()

        # Current (Delgado): English Composition should show 6/6 = met
        cur_eng = _get_req_progress(result['current'], 'English Composition')
        assert cur_eng['completedCredits'] == 6
        assert cur_eng['status'] == 'met'

        # Target (UNO): English should show 6/6 = met
        tgt_eng = _get_req_progress(result['transfer'], 'English')
        assert tgt_eng['completedCredits'] == 6
        assert tgt_eng['status'] == 'met'

    def test_add_math_courses_incrementally(self, session, app):
        """Add Delgado MATH courses. Track on both bars."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Math Test'
        )
        session.add(plan)
        session.flush()

        # Step 1: MATH 130 (3cr)
        _add_course_to_plan(
            session, plan, s['del_courses']['MATH 130'],
            category='Mathematics'
        )
        result = plan.calculate_progress()

        cur_math = _get_req_progress(result['current'], 'Mathematics')
        assert cur_math['completedCredits'] == 3
        assert cur_math['status'] == 'part'

        tgt_math = _get_req_progress(result['transfer'], 'Mathematics')
        assert tgt_math['completedCredits'] == 3
        assert tgt_math['status'] == 'part'

        # Step 2: MATH 221 (3cr) - should hit 6/6
        _add_course_to_plan(
            session, plan, s['del_courses']['MATH 221'],
            category='Mathematics'
        )
        result = plan.calculate_progress()

        cur_math = _get_req_progress(result['current'], 'Mathematics')
        assert cur_math['completedCredits'] == 6
        assert cur_math['status'] == 'met'

        tgt_math = _get_req_progress(result['transfer'], 'Mathematics')
        assert tgt_math['completedCredits'] == 6
        assert tgt_math['status'] == 'met'

    def test_overall_percent_increases(self, session, app):
        """Overall percent should increase as courses are added."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Percent Test'
        )
        session.add(plan)
        session.flush()

        result = plan.calculate_progress()
        assert result['current']['percent'] == 0
        assert result['transfer']['percent'] == 0

        # Add one 3cr course
        _add_course_to_plan(
            session, plan, s['del_courses']['ENGL 101'],
            category='English Composition'
        )
        result = plan.calculate_progress()
        cur_pct_1 = result['current']['percent']
        tgt_pct_1 = result['transfer']['percent']
        assert cur_pct_1 > 0
        assert tgt_pct_1 > 0

        # Add another 3cr course
        _add_course_to_plan(
            session, plan, s['del_courses']['MATH 130'],
            category='Mathematics'
        )
        result = plan.calculate_progress()
        cur_pct_2 = result['current']['percent']
        tgt_pct_2 = result['transfer']['percent']
        assert cur_pct_2 > cur_pct_1
        assert tgt_pct_2 > tgt_pct_1


# ===========================================================================
# 3. GROUPED REQUIREMENT PROGRESS (Biology at UNO)
# ===========================================================================

class TestGroupedRequirementProgress:
    """Test grouped requirement progress by adding UNO biology courses."""

    def test_bio_core_partial(self, session, app):
        """Adding one core bio course should give partial credit."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Bio Core Partial'
        )
        session.add(plan)
        session.flush()

        # Add BIOS 1011 (4cr) to core group
        _add_course_to_plan(
            session, plan, s['uno_courses']['BIOS 1011'],
            category='Biological Sciences', group_id=s['bio_core'].id
        )
        result = plan.calculate_progress(program=s['uno'])

        bio_req = _get_req_progress(result, 'Biological Sciences')
        assert bio_req is not None
        assert bio_req['completedCredits'] >= 4
        assert bio_req['status'] == 'part'

    def test_bio_core_plus_elective_progress(self, session, app):
        """Adding core + elective should accumulate credits."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Bio Mixed'
        )
        session.add(plan)
        session.flush()

        # Core: BIOS 1011 (4cr) + BIOS 1021 (4cr) = 8cr core
        _add_course_to_plan(
            session, plan, s['uno_courses']['BIOS 1011'],
            category='Biological Sciences', group_id=s['bio_core'].id
        )
        _add_course_to_plan(
            session, plan, s['uno_courses']['BIOS 1021'],
            category='Biological Sciences', group_id=s['bio_core'].id
        )

        result = plan.calculate_progress(program=s['uno'])
        bio_req = _get_req_progress(result, 'Biological Sciences')
        assert bio_req['completedCredits'] >= 8

        # Now add elective: BIOS 2051 (4cr) → total 12cr = met
        _add_course_to_plan(
            session, plan, s['uno_courses']['BIOS 2051'],
            category='Biological Sciences', group_id=s['bio_elective'].id
        )

        result = plan.calculate_progress(program=s['uno'])
        bio_req = _get_req_progress(result, 'Biological Sciences')
        assert bio_req['completedCredits'] == 12
        assert bio_req['status'] == 'met'


# ===========================================================================
# 4. CROSS-INSTITUTION EQUIVALENCY PROGRESS
# ===========================================================================

class TestCrossInstitutionProgress:
    """Delgado courses should count toward UNO via equivalency, and vice versa."""

    def test_delgado_bio_maps_to_uno_target(self, session, app):
        """Delgado BIOL 111 (equiv to BIOS 1011) should count for UNO Biological Sciences."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Cross Bio'
        )
        session.add(plan)
        session.flush()

        # Add Delgado BIOL 111 — has equivalency to UNO BIOS 1011
        _add_course_to_plan(
            session, plan, s['del_courses']['BIOL 111'],
            category='Science'  # Delgado category
        )

        result = plan.calculate_progress()

        # Current (Delgado): Science should show 4cr
        cur_sci = _get_req_progress(result['current'], 'Science')
        assert cur_sci is not None
        assert cur_sci['completedCredits'] == 4
        assert cur_sci['status'] == 'part'

        # Target (UNO): Biological Sciences should pick up via equivalency
        tgt_bio = _get_req_progress(result['transfer'], 'Biological Sciences')
        assert tgt_bio is not None
        # The Delgado BIOL 111 maps to UNO BIOS 1011 which is in bio_core group
        assert tgt_bio['completedCredits'] >= 4

    def test_delgado_english_maps_to_uno(self, session, app):
        """Delgado ENGL 101 should map to UNO English via equivalency."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Cross Eng'
        )
        session.add(plan)
        session.flush()

        _add_course_to_plan(
            session, plan, s['del_courses']['ENGL 101'],
            category='English Composition'
        )

        result = plan.calculate_progress()

        # UNO bar: English should get 3 credits from Delgado ENGL 101 → ENGL 1157
        tgt_eng = _get_req_progress(result['transfer'], 'English')
        assert tgt_eng is not None
        assert tgt_eng['completedCredits'] == 3

    def test_full_transfer_both_bars_satisfied(self, session, app):
        """Completing all Delgado courses should satisfy both programs' English & Math."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Full Transfer'
        )
        session.add(plan)
        session.flush()

        # Add all 4 english+math Delgado courses
        _add_course_to_plan(session, plan, s['del_courses']['ENGL 101'], category='English Composition')
        _add_course_to_plan(session, plan, s['del_courses']['ENGL 102'], category='English Composition')
        _add_course_to_plan(session, plan, s['del_courses']['MATH 130'], category='Mathematics')
        _add_course_to_plan(session, plan, s['del_courses']['MATH 221'], category='Mathematics')

        result = plan.calculate_progress()

        # Delgado: English + Math met
        assert _get_req_progress(result['current'], 'English Composition')['status'] == 'met'
        assert _get_req_progress(result['current'], 'Mathematics')['status'] == 'met'

        # UNO: English + Math met via equivalency
        assert _get_req_progress(result['transfer'], 'English')['status'] == 'met'
        assert _get_req_progress(result['transfer'], 'Mathematics')['status'] == 'met'


# ===========================================================================
# 5. VIEW FILTER TESTS
# ===========================================================================

class TestViewFilterProgress:
    """Test that status filters (Completed, In Progress, Planned) work."""

    def test_completed_filter_excludes_planned(self, session, app):
        """Completed filter should not count planned courses."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Filter Test'
        )
        session.add(plan)
        session.flush()

        # Add one completed, one planned
        _add_course_to_plan(
            session, plan, s['del_courses']['ENGL 101'],
            status='completed', category='English Composition'
        )
        _add_course_to_plan(
            session, plan, s['del_courses']['ENGL 102'],
            status='planned', category='English Composition'
        )

        # "All Courses" should count both
        result_all = plan.calculate_progress(program=s['delgado'], view_filter='All Courses')
        eng_all = _get_req_progress(result_all, 'English Composition')
        assert eng_all['completedCredits'] == 6  # 3 + 3

        # "Completed Courses" should count only completed
        result_comp = plan.calculate_progress(program=s['delgado'], view_filter='Completed Courses')
        eng_comp = _get_req_progress(result_comp, 'English Composition')
        assert eng_comp['completedCredits'] == 3

    def test_in_progress_filter(self, session, app):
        """In-progress filter should only count in_progress courses."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='InProgress Filter'
        )
        session.add(plan)
        session.flush()

        _add_course_to_plan(
            session, plan, s['del_courses']['MATH 130'],
            status='in_progress', category='Mathematics'
        )
        _add_course_to_plan(
            session, plan, s['del_courses']['MATH 221'],
            status='completed', category='Mathematics'
        )

        result = plan.calculate_progress(program=s['delgado'], view_filter='In Progress')
        math_req = _get_req_progress(result, 'Mathematics')
        assert math_req['completedCredits'] == 3  # only in_progress one


# ===========================================================================
# 6. CONSTRAINT EVALUATION — CREDITS
# ===========================================================================

class TestConstraintCredits:
    """Test RequirementConstraint of type 'credits' (min/max)."""

    def _build_constrained_program(self, session):
        """Build a program with a simple requirement that has a credits constraint."""
        prog = Program(
            name='Constrained Prog', degree_type='BS',
            institution='UNO', total_credits_required=12, description=''
        )
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Electives',
            credits_required=12, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        # Constraint: min 6 credits, max 12 credits
        constraint = RequirementConstraint(
            requirement_id=req.id,
            constraint_type='credits',
            params=json.dumps({'credits_min': 6, 'credits_max': 12}),
            description='Between 6 and 12 credits required'
        )
        session.add(constraint)
        session.flush()

        # Create some courses
        courses = []
        for i, (code, title) in enumerate([
            ('ELEC 1001', 'Elective 1'),
            ('ELEC 1002', 'Elective 2'),
            ('ELEC 1003', 'Elective 3'),
            ('ELEC 1004', 'Elective 4'),
            ('ELEC 1005', 'Elective 5'),
        ]):
            c = Course(code=code, title=title, credits=3,
                       institution='UNO', department='ELEC', subject_code='ELEC')
            c.course_level = 1000
            session.add(c)
            courses.append(c)
        session.flush()

        return prog, req, constraint, courses

    def test_credits_constraint_not_met_at_zero(self, session, app):
        """With 0 courses, credits constraint should not be satisfied."""
        prog, req, constraint, courses = self._build_constrained_program(session)

        result = constraint.evaluate([])
        assert result['satisfied'] is False

    def test_credits_constraint_not_met_below_min(self, session, app):
        """With 1 course (3cr), below min of 6, constraint not satisfied."""
        prog, req, constraint, courses = self._build_constrained_program(session)

        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=prog.id, plan_name='Constr Min'
        )
        session.add(plan)
        session.flush()

        pc = _add_course_to_plan(session, plan, courses[0], category='Electives')

        result = constraint.evaluate([pc])
        assert result['satisfied'] is False
        assert result['tally']['credits_earned'] == 3

    def test_credits_constraint_met_at_min(self, session, app):
        """With 2 courses (6cr), exactly at min, should be satisfied."""
        prog, req, constraint, courses = self._build_constrained_program(session)

        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=prog.id, plan_name='Constr Met'
        )
        session.add(plan)
        session.flush()

        pcs = [
            _add_course_to_plan(session, plan, courses[0], category='Electives'),
            _add_course_to_plan(session, plan, courses[1], category='Electives'),
        ]

        result = constraint.evaluate(pcs)
        assert result['satisfied'] is True
        assert result['tally']['credits_earned'] == 6

    def test_credits_constraint_exceeded_max(self, session, app):
        """With 5 courses (15cr), exceeding max of 12, not satisfied."""
        prog, req, constraint, courses = self._build_constrained_program(session)

        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=prog.id, plan_name='Constr Max'
        )
        session.add(plan)
        session.flush()

        pcs = [_add_course_to_plan(session, plan, c, category='Electives') for c in courses]

        result = constraint.evaluate(pcs)
        assert result['satisfied'] is False
        assert result['tally']['credits_earned'] == 15
        assert 'Maximum' in (result.get('reason') or '')


# ===========================================================================
# 7. CONSTRAINT EVALUATION — COURSE COUNT
# ===========================================================================

class TestConstraintCourseCount:
    """Test RequirementConstraint of type 'courses' (min/max count)."""

    def test_course_count_min_not_met(self, session, app):
        prog = Program(name='CC', degree_type='BS', institution='UNO',
                       total_credits_required=9, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Lab Courses',
            credits_required=9, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        constraint = RequirementConstraint(
            requirement_id=req.id,
            constraint_type='courses',
            params=json.dumps({'courses_min': 3}),
            description='Minimum 3 courses'
        )
        session.add(constraint)
        session.flush()

        c1 = Course(code='LAB 101', title='Lab 1', credits=3,
                    institution='UNO', department='LAB', subject_code='LAB')
        session.add(c1)
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='CC Test')
        session.add(plan)
        session.flush()

        pc = _add_course_to_plan(session, plan, c1, category='Lab Courses')
        result = constraint.evaluate([pc])
        assert result['satisfied'] is False
        assert result['tally']['courses_earned'] == 1

    def test_course_count_max_exceeded(self, session, app):
        prog = Program(name='CC2', degree_type='BS', institution='UNO',
                       total_credits_required=9, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Research',
            credits_required=9, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        constraint = RequirementConstraint(
            requirement_id=req.id,
            constraint_type='courses',
            params=json.dumps({'courses_max': 2}),
            description='Maximum 2 courses'
        )
        session.add(constraint)
        session.flush()

        courses = []
        for i in range(3):
            c = Course(code=f'RES 10{i}', title=f'Research {i}', credits=3,
                       institution='UNO', department='RES', subject_code='RES')
            session.add(c)
            courses.append(c)
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='CC Max Test')
        session.add(plan)
        session.flush()

        pcs = [_add_course_to_plan(session, plan, c, category='Research') for c in courses]
        result = constraint.evaluate(pcs)
        assert result['satisfied'] is False
        assert result['tally']['courses_earned'] == 3
        assert 'Maximum' in (result.get('reason') or '')


# ===========================================================================
# 8. CONSTRAINT EVALUATION — MIN LEVEL CREDITS
# ===========================================================================

class TestConstraintMinLevelCredits:
    """Test 'min_level_credits' constraint: at least X credits at Y+ level."""

    def test_min_level_credits_not_met(self, session, app):
        """All 1000-level courses should NOT satisfy a 3000+ level constraint."""
        prog = Program(name='Level', degree_type='BS', institution='UNO',
                       total_credits_required=12, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Advanced Bio',
            credits_required=12, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        constraint = RequirementConstraint(
            requirement_id=req.id,
            constraint_type='min_level_credits',
            params=json.dumps({'level_min': 3000, 'credits': 8}),
            description='At least 8cr at 3000+ level'
        )
        session.add(constraint)
        session.flush()

        # Only 1000-level courses
        c1 = Course(code='BIOS 1011', title='Bio I', credits=4,
                    institution='UNO', department='BIOS', subject_code='BIOS')
        c1.course_level = 1000
        c2 = Course(code='BIOS 1021', title='Bio II', credits=4,
                    institution='UNO', department='BIOS', subject_code='BIOS')
        c2.course_level = 1000
        session.add_all([c1, c2])
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='Level Test')
        session.add(plan)
        session.flush()

        pcs = [
            _add_course_to_plan(session, plan, c1, category='Advanced Bio'),
            _add_course_to_plan(session, plan, c2, category='Advanced Bio'),
        ]

        result = constraint.evaluate(pcs)
        assert result['satisfied'] is False
        assert result['tally']['credits_3000_plus'] == 0

    def test_min_level_credits_met(self, session, app):
        """Upper-division courses should satisfy level constraint."""
        prog = Program(name='Level2', degree_type='BS', institution='UNO',
                       total_credits_required=12, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Upper Bio',
            credits_required=12, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        constraint = RequirementConstraint(
            requirement_id=req.id,
            constraint_type='min_level_credits',
            params=json.dumps({'level_min': 3000, 'credits': 8}),
            description='At least 8cr at 3000+ level'
        )
        session.add(constraint)
        session.flush()

        c1 = Course(code='BIOS 3044', title='Genetics', credits=4,
                    institution='UNO', department='BIOS', subject_code='BIOS')
        c1.course_level = 3000
        c2 = Course(code='BIOS 4050', title='Molecular', credits=4,
                    institution='UNO', department='BIOS', subject_code='BIOS')
        c2.course_level = 4000
        session.add_all([c1, c2])
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='Level Met')
        session.add(plan)
        session.flush()

        pcs = [
            _add_course_to_plan(session, plan, c1, category='Upper Bio'),
            _add_course_to_plan(session, plan, c2, category='Upper Bio'),
        ]

        result = constraint.evaluate(pcs)
        assert result['satisfied'] is True
        assert result['tally']['credits_3000_plus'] == 8


# ===========================================================================
# 9. CONSTRAINT EVALUATION — MIN COURSES AT LEVEL
# ===========================================================================

class TestConstraintMinCoursesAtLevel:
    """Test 'min_courses_at_level' constraint."""

    def test_min_courses_at_level_not_met(self, session, app):
        constraint = RequirementConstraint(
            constraint_type='min_courses_at_level',
            params=json.dumps({'level': 4000, 'courses': 2}),
            description='At least 2 courses at 4000+ level',
            requirement_id=0  # not linked to a real req for unit test
        )

        # One 4000-level course — not enough
        c1 = Course(code='BIOS 4050', title='Mol Bio', credits=4,
                    institution='UNO', department='BIOS', subject_code='BIOS')
        c1.course_level = 4000
        session.add(c1)
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=1, plan_name='MinCourses')
        session.add(plan)
        session.flush()

        pc = _add_course_to_plan(session, plan, c1, category='Test')
        result = constraint.evaluate([pc])
        assert result['satisfied'] is False
        assert result['tally']['courses_at_4000+'] == 1

    def test_min_courses_at_level_met(self, session, app):
        constraint = RequirementConstraint(
            constraint_type='min_courses_at_level',
            params=json.dumps({'level': 4000, 'courses': 2}),
            description='At least 2 courses at 4000+ level',
            requirement_id=0
        )

        c1 = Course(code='ADV 4001', title='Adv 1', credits=3,
                    institution='UNO', department='ADV', subject_code='ADV')
        c1.course_level = 4000
        c2 = Course(code='ADV 4002', title='Adv 2', credits=3,
                    institution='UNO', department='ADV', subject_code='ADV')
        c2.course_level = 4000
        session.add_all([c1, c2])
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=1, plan_name='MinCoursesMet')
        session.add(plan)
        session.flush()

        pcs = [
            _add_course_to_plan(session, plan, c1, category='Test'),
            _add_course_to_plan(session, plan, c2, category='Test'),
        ]
        result = constraint.evaluate(pcs)
        assert result['satisfied'] is True
        assert result['tally']['courses_at_4000+'] == 2


# ===========================================================================
# 10. CONSTRAINTS INTEGRATION WITH PROGRESS
# ===========================================================================

class TestConstraintProgressIntegration:
    """Test that constraints affect the overall progress status."""

    def test_progress_shows_constraint_failure(self, session, app):
        """A requirement with met credits but failed constraint should show constraint results."""
        prog = Program(name='ConstraintInt', degree_type='BS',
                       institution='UNO', total_credits_required=6, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Advanced Electives',
            credits_required=6, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        # Constraint: min 6cr at 3000+ level
        constraint = RequirementConstraint(
            requirement_id=req.id,
            constraint_type='min_level_credits',
            params=json.dumps({'level_min': 3000, 'credits': 6}),
            description='At least 6cr at 3000+ level'
        )
        session.add(constraint)
        session.flush()

        # Two 1000-level courses totaling 6cr (meets credit req but NOT constraint)
        c1 = Course(code='ELEC 1010', title='Intro Elec', credits=3,
                    institution='UNO', department='ELEC', subject_code='ELEC')
        c1.course_level = 1000
        c2 = Course(code='ELEC 1020', title='Elec II', credits=3,
                    institution='UNO', department='ELEC', subject_code='ELEC')
        c2.course_level = 1000
        session.add_all([c1, c2])
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='ConstraintInt Test')
        session.add(plan)
        session.flush()

        _add_course_to_plan(session, plan, c1, category='Advanced Electives')
        _add_course_to_plan(session, plan, c2, category='Advanced Electives')

        result = plan.calculate_progress(program=prog, view_filter='All Courses')
        req_result = _get_req_progress(result, 'Advanced Electives')

        # Requirement has enough credits but constraint fails
        assert req_result is not None
        assert req_result['completedCredits'] == 6
        assert len(req_result.get('constraint_results', [])) > 0
        # constraint should be not satisfied
        cr = req_result['constraint_results'][0]
        assert cr['satisfied'] is False

    def test_progress_constraint_satisfied(self, session, app):
        """When constraint is met, progress should reflect it fully."""
        prog = Program(name='ConstraintSat', degree_type='BS',
                       institution='UNO', total_credits_required=6, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Upper Division',
            credits_required=6, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        constraint = RequirementConstraint(
            requirement_id=req.id,
            constraint_type='min_level_credits',
            params=json.dumps({'level_min': 3000, 'credits': 6}),
            description='At least 6cr at 3000+ level'
        )
        session.add(constraint)
        session.flush()

        c1 = Course(code='ADV 3001', title='Adv 1', credits=3,
                    institution='UNO', department='ADV', subject_code='ADV')
        c1.course_level = 3000
        c2 = Course(code='ADV 4001', title='Adv 2', credits=3,
                    institution='UNO', department='ADV', subject_code='ADV')
        c2.course_level = 4000
        session.add_all([c1, c2])
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='ConstraintSat Test')
        session.add(plan)
        session.flush()

        _add_course_to_plan(session, plan, c1, category='Upper Division')
        _add_course_to_plan(session, plan, c2, category='Upper Division')

        result = plan.calculate_progress(program=prog, view_filter='All Courses')
        req_result = _get_req_progress(result, 'Upper Division')
        assert req_result['completedCredits'] == 6
        assert req_result['status'] == 'met'
        assert req_result.get('constraints_satisfied') is True


# ===========================================================================
# 11. CONSTRAINT VIOLATION CHECKING (pre-add warning)
# ===========================================================================

class TestConstraintViolationChecking:
    """Test Plan.check_course_constraint_violations() for pre-add warnings."""

    def test_no_violation_when_under_max(self, session, app):
        """Adding a course under max should not violate."""
        prog = Program(name='ViolCheck', degree_type='BS', institution='UNO',
                       total_credits_required=9, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Capped Electives',
            credits_required=9, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        constraint = RequirementConstraint(
            requirement_id=req.id,
            constraint_type='credits',
            params=json.dumps({'credits_max': 9}),
            description='Maximum 9 credits'
        )
        session.add(constraint)
        session.flush()

        c = Course(code='CAP 101', title='Cap 1', credits=3,
                   institution='UNO', department='CAP', subject_code='CAP')
        session.add(c)
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='Viol Test')
        session.add(plan)
        session.flush()

        result = plan.check_course_constraint_violations(
            c.id, 'Capped Electives'
        )
        assert result['violates'] is False
        assert result['violations'] == []

    def test_violation_when_exceeding_max(self, session, app):
        """Adding a course that exceeds max should report violation."""
        prog = Program(name='ViolExceed', degree_type='BS', institution='UNO',
                       total_credits_required=6, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Limited Electives',
            credits_required=6, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        constraint = RequirementConstraint(
            requirement_id=req.id,
            constraint_type='credits',
            params=json.dumps({'credits_max': 6}),
            description='Maximum 6 credits'
        )
        session.add(constraint)
        session.flush()

        courses = []
        for i in range(3):
            c = Course(code=f'LIM 10{i}', title=f'Lim {i}', credits=3,
                       institution='UNO', department='LIM', subject_code='LIM')
            session.add(c)
            courses.append(c)
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='Viol Exceed')
        session.add(plan)
        session.flush()

        # Add 2 courses (6cr) — at max
        _add_course_to_plan(session, plan, courses[0], category='Limited Electives')
        _add_course_to_plan(session, plan, courses[1], category='Limited Electives')

        # Try to add 3rd — would exceed max
        result = plan.check_course_constraint_violations(
            courses[2].id, 'Limited Electives'
        )
        assert result['violates'] is True
        assert len(result['violations']) > 0


# ===========================================================================
# 12. PROGRESS SERVICE FACADE
# ===========================================================================

class TestProgressService:
    """Test the ProgressService facade."""

    def test_full_progress_returns_both(self, session, app):
        """ProgressService.full_progress returns current + transfer."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Service Test'
        )
        session.add(plan)
        session.flush()

        svc = ProgressService(plan)
        result = svc.full_progress()
        assert 'current' in result
        assert 'transfer' in result
        assert result['current']['percent'] == 0
        assert result['transfer']['percent'] == 0

    def test_program_progress_current(self, session, app):
        """ProgressService.program_progress('current') returns Delgado progress."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Svc Current'
        )
        session.add(plan)
        session.flush()

        _add_course_to_plan(session, plan, s['del_courses']['ENGL 101'], category='English Composition')

        svc = ProgressService(plan)
        result = svc.program_progress('current')
        assert result['total_credits_required'] == 20
        assert result['total_credits_earned'] >= 3

    def test_program_progress_transfer(self, session, app):
        """ProgressService.program_progress('transfer') returns UNO progress."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Svc Transfer'
        )
        session.add(plan)
        session.flush()

        _add_course_to_plan(session, plan, s['del_courses']['ENGL 101'], category='English Composition')

        svc = ProgressService(plan)
        result = svc.program_progress('transfer')
        assert result['total_credits_required'] == 24
        assert result['total_credits_earned'] >= 3

    def test_unmet_reports_missing_categories(self, session, app):
        """ProgressService.unmet() should list categories still needing credits."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Unmet Test'
        )
        session.add(plan)
        session.flush()

        svc = ProgressService(plan)
        unmet = svc.unmet()
        # Should list all UNO requirements since nothing is completed
        categories = [u['category'] for u in unmet]
        assert 'English' in categories
        assert 'Mathematics' in categories
        assert 'Biological Sciences' in categories


# ===========================================================================
# 13. PROGRESS API ENDPOINT
# ===========================================================================

class TestProgressEndpoint:
    """Test the /api/plans/<id>/progress endpoint."""

    def test_progress_endpoint_returns_data(self, session, client, app):
        """Progress endpoint should return current + transfer data."""
        with app.app_context():
            s = _build_two_institution_scenario(session)
            plan = Plan(
                student_name='T', student_email='t@t.com',
                program_id=s['uno'].id,
                current_program_id=s['delgado'].id,
                plan_name='API Progress'
            )
            session.add(plan)
            session.commit()

            resp = client.get(
                f'/api/plans/{plan.id}/progress',
                headers={'X-Plan-Code': plan.plan_code}
            )
            assert resp.status_code == 200

            data = resp.get_json()
            assert 'current' in data
            assert 'transfer' in data
            assert 'unmet_requirements' in data
            assert 'suggestions' in data

    def test_progress_endpoint_with_courses(self, session, client, app):
        """Progress endpoint should reflect added courses."""
        with app.app_context():
            s = _build_two_institution_scenario(session)
            plan = Plan(
                student_name='T', student_email='t@t.com',
                program_id=s['uno'].id,
                current_program_id=s['delgado'].id,
                plan_name='API With Courses'
            )
            session.add(plan)
            session.flush()

            _add_course_to_plan(
                session, plan, s['del_courses']['ENGL 101'],
                category='English Composition'
            )
            _add_course_to_plan(
                session, plan, s['del_courses']['ENGL 102'],
                category='English Composition'
            )
            session.commit()

            resp = client.get(
                f'/api/plans/{plan.id}/progress',
                headers={'X-Plan-Code': plan.plan_code}
            )
            data = resp.get_json()

            # Current bar should have English met
            cur_reqs = data['current']['requirements']
            cur_eng = next((r for r in cur_reqs if r['category'] == 'English Composition'), None)
            assert cur_eng is not None
            assert cur_eng['completedCredits'] == 6
            assert cur_eng['status'] == 'met'

    def test_progress_endpoint_view_filter(self, session, client, app):
        """Progress endpoint should respect the view query param."""
        with app.app_context():
            s = _build_two_institution_scenario(session)
            plan = Plan(
                student_name='T', student_email='t@t.com',
                program_id=s['uno'].id,
                current_program_id=s['delgado'].id,
                plan_name='API Filter'
            )
            session.add(plan)
            session.flush()

            _add_course_to_plan(
                session, plan, s['del_courses']['MATH 130'],
                status='completed', category='Mathematics'
            )
            _add_course_to_plan(
                session, plan, s['del_courses']['MATH 221'],
                status='planned', category='Mathematics'
            )
            session.commit()

            # Completed filter
            resp = client.get(
                f'/api/plans/{plan.id}/progress?view=Completed+Courses',
                headers={'X-Plan-Code': plan.plan_code}
            )
            data = resp.get_json()
            cur_math = next(
                (r for r in data['current']['requirements'] if r['category'] == 'Mathematics'),
                None
            )
            assert cur_math is not None
            assert cur_math['completedCredits'] == 3  # only completed one


# ===========================================================================
# 14. AUTO-ASSIGNMENT + GROUPED PROGRESS
# ===========================================================================

class TestAutoAssignWithGroupedProgress:
    """Test that auto-assigned courses correctly count toward grouped requirements."""

    def test_auto_assign_then_progress(self, session, app):
        """Course auto-assigned to a group should count in grouped progress."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Auto Assign Progress'
        )
        session.add(plan)
        session.flush()

        # Add BIOS 1011 without group_id — should be auto-assigned
        pc = PlanCourse(
            plan_id=plan.id, course_id=s['uno_courses']['BIOS 1011'].id,
            status='completed', credits=4
        )
        session.add(pc)
        session.flush()

        _assign_requirement_group(plan, pc)
        session.flush()

        # Should be assigned to bio_core group
        assert pc.requirement_group_id == s['bio_core'].id

        # Now check progress
        result = plan.calculate_progress(program=s['uno'])
        bio_req = _get_req_progress(result, 'Biological Sciences')
        assert bio_req is not None
        assert bio_req['completedCredits'] >= 4


# ===========================================================================
# 15. SCOPE-FILTERED CONSTRAINTS
# ===========================================================================

class TestScopeFilteredConstraints:
    """Test constraints with scope_filter (group-level or subject-level)."""

    def test_subject_code_scope_filter(self, session, app):
        """A constraint scoped to BIOS should only count BIOS courses."""
        prog = Program(name='Scoped', degree_type='BS', institution='UNO',
                       total_credits_required=12, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Science Mix',
            credits_required=12, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        # Constraint: at least 6 credits of BIOS courses
        constraint = RequirementConstraint(
            requirement_id=req.id,
            constraint_type='credits',
            params=json.dumps({'credits_min': 6}),
            scope_filter=json.dumps({'subject_code': 'BIOS'}),
            description='At least 6 BIOS credits'
        )
        session.add(constraint)
        session.flush()

        bios = Course(code='BIOS 1011', title='Bio I', credits=4,
                      institution='UNO', department='BIOS', subject_code='BIOS')
        bios.course_level = 1000
        chem = Course(code='CHEM 1001', title='Chem I', credits=4,
                      institution='UNO', department='CHEM', subject_code='CHEM')
        chem.course_level = 1000
        session.add_all([bios, chem])
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='Scope Test')
        session.add(plan)
        session.flush()

        pc_bios = _add_course_to_plan(session, plan, bios, category='Science Mix')
        pc_chem = _add_course_to_plan(session, plan, chem, category='Science Mix')

        # Evaluate with scope — should only see BIOS (4cr), not 8cr total
        result = constraint.evaluate([pc_bios, pc_chem])
        assert result['satisfied'] is False
        assert result['tally']['credits_earned'] == 4


# ===========================================================================
# 16. FULL END-TO-END SCENARIO
# ===========================================================================

class TestE2EFullScenario:
    """Full walkthrough: build plan, add courses incrementally, verify everything."""

    def test_full_student_journey(self, session, app):
        """Simulate a student completing courses across both institutions."""
        s = _build_two_institution_scenario(session)

        # Add a constraint to UNO Bio: at least 4cr at 3000+ level
        constraint = RequirementConstraint(
            requirement_id=s['uno_bio'].id,
            constraint_type='min_level_credits',
            params=json.dumps({'level_min': 3000, 'credits': 4}),
            description='At least 4 credits at 3000+ level'
        )
        session.add(constraint)
        session.flush()

        plan = Plan(
            student_name='Jane Student', student_email='jane@example.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Jane Transfer Plan'
        )
        session.add(plan)
        session.flush()

        # === Phase 1: Delgado courses (English + Math) ===
        _add_course_to_plan(session, plan, s['del_courses']['ENGL 101'], category='English Composition')
        _add_course_to_plan(session, plan, s['del_courses']['ENGL 102'], category='English Composition')
        _add_course_to_plan(session, plan, s['del_courses']['MATH 130'], category='Mathematics')
        _add_course_to_plan(session, plan, s['del_courses']['MATH 221'], category='Mathematics')

        result = plan.calculate_progress()

        # Delgado: English + Math met, Science still 0
        assert _get_req_progress(result['current'], 'English Composition')['status'] == 'met'
        assert _get_req_progress(result['current'], 'Mathematics')['status'] == 'met'
        assert _get_req_progress(result['current'], 'Science')['completedCredits'] == 0

        # UNO: English + Math met via equivalency, Bio still 0
        assert _get_req_progress(result['transfer'], 'English')['status'] == 'met'
        assert _get_req_progress(result['transfer'], 'Mathematics')['status'] == 'met'
        assert _get_req_progress(result['transfer'], 'Biological Sciences')['completedCredits'] == 0

        # === Phase 2: Add Delgado BIOL 111 → maps to UNO BIOS 1011 ===
        _add_course_to_plan(session, plan, s['del_courses']['BIOL 111'], category='Science')

        result = plan.calculate_progress()
        assert _get_req_progress(result['current'], 'Science')['completedCredits'] == 4

        # UNO bio should pick up BIOL 111 via equivalency to BIOS 1011
        tgt_bio = _get_req_progress(result['transfer'], 'Biological Sciences')
        assert tgt_bio['completedCredits'] >= 4

        # === Phase 3: Add UNO upper-division biology ===
        _add_course_to_plan(
            session, plan, s['uno_courses']['BIOS 1021'],
            category='Biological Sciences', group_id=s['bio_core'].id
        )
        _add_course_to_plan(
            session, plan, s['uno_courses']['BIOS 3044'],
            category='Biological Sciences', group_id=s['bio_elective'].id
        )

        result = plan.calculate_progress()
        tgt_bio = _get_req_progress(result['transfer'], 'Biological Sciences')

        # Should have Bio core (BIOS 1011 via equiv + BIOS 1021) + elective (BIOS 3044)
        assert tgt_bio['completedCredits'] >= 12
        assert tgt_bio['status'] == 'met'

        # Constraint: 3000+ credits = BIOS 3044 = 4cr >= 4cr required → satisfied
        if tgt_bio.get('constraint_results'):
            assert tgt_bio['constraint_results'][0]['satisfied'] is True

        # === Final: Overall percent should be 100% ===
        assert result['transfer']['percent'] == 100

    def test_constraint_warning_e2e(self, session, app):
        """E2E test where constraint is NOT met — verify warning in progress."""
        s = _build_two_institution_scenario(session)

        # Constraint: need 8cr at 3000+ for Bio
        constraint = RequirementConstraint(
            requirement_id=s['uno_bio'].id,
            constraint_type='min_level_credits',
            params=json.dumps({'level_min': 3000, 'credits': 8}),
            description='At least 8cr at 3000+ level'
        )
        session.add(constraint)
        session.flush()

        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Constraint Warning E2E'
        )
        session.add(plan)
        session.flush()

        # Add all English + Math (satisfied)
        _add_course_to_plan(session, plan, s['del_courses']['ENGL 101'], category='English Composition')
        _add_course_to_plan(session, plan, s['del_courses']['ENGL 102'], category='English Composition')
        _add_course_to_plan(session, plan, s['del_courses']['MATH 130'], category='Mathematics')
        _add_course_to_plan(session, plan, s['del_courses']['MATH 221'], category='Mathematics')

        # Add only 1000-level bio courses (12cr total but 0cr at 3000+)
        _add_course_to_plan(
            session, plan, s['uno_courses']['BIOS 1011'],
            category='Biological Sciences', group_id=s['bio_core'].id
        )
        _add_course_to_plan(
            session, plan, s['uno_courses']['BIOS 1021'],
            category='Biological Sciences', group_id=s['bio_core'].id
        )
        _add_course_to_plan(
            session, plan, s['uno_courses']['BIOS 2051'],
            category='Biological Sciences', group_id=s['bio_elective'].id
        )

        result = plan.calculate_progress()
        tgt_bio = _get_req_progress(result['transfer'], 'Biological Sciences')

        # Credits MET (12) but constraint NOT met (0cr at 3000+, need 8)
        assert tgt_bio['completedCredits'] == 12
        assert tgt_bio.get('constraints_satisfied') is False
        assert len(tgt_bio.get('constraint_results', [])) > 0
        assert tgt_bio['constraint_results'][0]['satisfied'] is False


# ===========================================================================
# 17. EDGE CASES
# ===========================================================================

class TestEdgeCases:
    """Test edge cases in progress tracking."""

    def test_plan_with_no_current_program(self, session, app):
        """Plan without current_program should return empty current progress."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=s['uno'].id,
            plan_name='No Current'
        )
        session.add(plan)
        session.flush()

        result = plan.calculate_progress()
        assert result['current']['percent'] == 0
        assert result['current']['requirements'] == []

    def test_plan_with_no_target_program(self, session, app):
        """Plan with invalid program_id should handle gracefully."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Edge Target'
        )
        session.add(plan)
        session.flush()

        # Valid scenario — just ensure no crash
        result = plan.calculate_progress()
        assert isinstance(result, dict)
        assert 'current' in result
        assert 'transfer' in result

    def test_zero_credit_course_doesnt_break(self, session, app):
        """A 0-credit course (lab) should not break progress calculation."""
        s = _build_two_institution_scenario(session)
        plan = Plan(
            student_name='T', student_email='t@t.com',
            program_id=s['uno'].id,
            current_program_id=s['delgado'].id,
            plan_name='Zero Credit'
        )
        session.add(plan)
        session.flush()

        # BIOS 1012 is a 0-credit lab
        _add_course_to_plan(
            session, plan, s['uno_courses']['BIOS 1012'],
            category='Biological Sciences', group_id=s['bio_core'].id
        )

        # Should not throw
        result = plan.calculate_progress()
        assert isinstance(result, dict)

    def test_duplicate_category_courses_accumulate(self, session, app):
        """Multiple courses in same category should add up credits."""
        prog = Program(name='Dup', degree_type='BS', institution='UNO',
                       total_credits_required=9, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='History',
            credits_required=9, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        courses = []
        for i in range(3):
            c = Course(code=f'HIST 100{i}', title=f'History {i}', credits=3,
                       institution='UNO', department='HIST', subject_code='HIST')
            session.add(c)
            courses.append(c)
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='Dup Cat')
        session.add(plan)
        session.flush()

        for c in courses:
            _add_course_to_plan(session, plan, c, category='History')

        result = plan.calculate_progress(program=prog, view_filter='All Courses')
        hist = _get_req_progress(result, 'History')
        assert hist['completedCredits'] == 9
        assert hist['status'] == 'met'

    def test_credits_clamped_at_requirement_max(self, session, app):
        """Credits should be clamped at the requirement's credits_required."""
        prog = Program(name='Clamp', degree_type='BS', institution='UNO',
                       total_credits_required=6, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(
            program_id=prog.id, category='Small Req',
            credits_required=6, requirement_type='simple', is_current=True
        )
        session.add(req)
        session.flush()

        courses = []
        for i in range(4):
            c = Course(code=f'SM 10{i}', title=f'Small {i}', credits=3,
                       institution='UNO', department='SM', subject_code='SM')
            session.add(c)
            courses.append(c)
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='Clamp Test')
        session.add(plan)
        session.flush()

        # Add 4 courses = 12cr, but requirement only needs 6
        for c in courses:
            _add_course_to_plan(session, plan, c, category='Small Req')

        result = plan.calculate_progress(program=prog, view_filter='All Courses')
        req_result = _get_req_progress(result, 'Small Req')
        assert req_result['completedCredits'] == 6  # clamped
        assert req_result['status'] == 'met'


# ===========================================================================
# Cross-program constraint scope contamination regression test
# ===========================================================================

class TestCrossProgramConstraintContamination:
    """Ensure _resolved_group_name is re-resolved per program.

    Regression for the bug where the current program's evaluation sets
    _resolved_group_name on a PlanCourse, and the target program's
    constraint scope filter then sees the stale (wrong) group name,
    causing credits to show as 0 despite the course matching via equivalency.
    """

    def test_constraint_credits_not_contaminated_across_programs(self, app, session):
        """A cross-institution course should have its group name resolved fresh
        for each program when evaluating scoped constraints."""
        # Two programs with DIFFERENT group names for their Bio requirements
        delgado = Program(
            name='AS Bio', degree_type='AS',
            institution='Delgado', total_credits_required=10, description=''
        )
        uno = Program(
            name='BS Bio', degree_type='BS',
            institution='UNO', total_credits_required=10, description=''
        )
        session.add_all([delgado, uno])
        session.flush()

        # Delgado requirement with group "Del Bio Group"
        del_bio_req = ProgramRequirement(
            program_id=delgado.id, category='Biology',
            credits_required=4, requirement_type='simple', is_current=True
        )
        session.add(del_bio_req)
        session.flush()

        del_bio_group = RequirementGroup(
            requirement_id=del_bio_req.id, group_name='Del Bio Group',
            courses_required=0, credits_required=4
        )
        session.add(del_bio_group)
        session.flush()

        # UNO requirement with group "UNO Bio Group"
        uno_bio_req = ProgramRequirement(
            program_id=uno.id, category='Science',
            credits_required=4, requirement_type='simple', is_current=True
        )
        session.add(uno_bio_req)
        session.flush()

        uno_bio_group = RequirementGroup(
            requirement_id=uno_bio_req.id, group_name='UNO Bio Group',
            courses_required=0, credits_required=4
        )
        session.add(uno_bio_group)
        session.flush()

        # Courses: BIOL 141 at Delgado, BIOS 1083 at UNO
        del_course = Course(
            code='BIOL 141', title='General Bio I', credits=4,
            institution='Delgado', department='BIOL', subject_code='BIOL'
        )
        uno_course = Course(
            code='BIOS 1083', title='Biology I', credits=4,
            institution='UNO', department='BIOS', subject_code='BIOS'
        )
        session.add_all([del_course, uno_course])
        session.flush()

        # Group options
        session.add(GroupCourseOption(
            group_id=del_bio_group.id, course_code='BIOL 141',
            institution='Delgado', is_preferred=True
        ))
        session.add(GroupCourseOption(
            group_id=uno_bio_group.id, course_code='BIOS 1083',
            institution='UNO', is_preferred=True
        ))
        session.flush()

        # Equivalency
        session.add(Equivalency(
            from_course_id=del_course.id,
            to_course_id=uno_course.id,
            equivalency_type='direct'
        ))
        session.flush()

        # Constraint on Delgado req scoped to "Del Bio Group"
        del_constraint = RequirementConstraint(
            requirement_id=del_bio_req.id,
            constraint_type='credits',
            params='{"credits_min": 4}',
            scope_filter='{"group_name": "Del Bio Group"}'
        )
        # Constraint on UNO req scoped to "UNO Bio Group"
        uno_constraint = RequirementConstraint(
            requirement_id=uno_bio_req.id,
            constraint_type='credits',
            params='{"credits_min": 4}',
            scope_filter='{"group_name": "UNO Bio Group"}'
        )
        session.add_all([del_constraint, uno_constraint])
        session.flush()

        # Plan: BIOL 141 (Delgado course) on the plan
        plan = Plan(
            student_name='Test Student', student_email='test@test.com',
            program_id=uno.id, current_program_id=delgado.id,
            plan_name='Contamination Test'
        )
        session.add(plan)
        session.flush()

        _add_course_to_plan(
            session, plan, del_course, status='planned',
            category='Biology', group_id=None
        )

        # Call full progress (both programs) — this is where contamination happened
        result = plan.calculate_progress(program=None, view_filter='All Courses')

        # Current (Delgado) should show 4 credits in constraint
        del_req = _get_req_progress(result['current'], 'Biology')
        assert del_req is not None
        assert del_req['completedCredits'] == 4
        del_constraints = del_req.get('constraint_results', [])
        assert len(del_constraints) == 1
        assert del_constraints[0]['tally']['credits_earned'] == 4

        # Transfer (UNO) should ALSO show 4 credits in constraint via equivalency
        uno_req = _get_req_progress(result['transfer'], 'Science')
        assert uno_req is not None
        assert uno_req['completedCredits'] == 4
        uno_constraints = uno_req.get('constraint_results', [])
        assert len(uno_constraints) == 1
        # This was the bug: used to be 0 because _resolved_group_name was stale
        assert uno_constraints[0]['tally']['credits_earned'] == 4

    def test_suggestion_excludes_equivalent_courses(self, app, session):
        """Suggestions should not include a target-institution course
        if its equivalent from the source institution is already on the plan."""
        delgado = Program(
            name='AS Gen', degree_type='AS',
            institution='Delgado', total_credits_required=10, description=''
        )
        uno = Program(
            name='BS Bio', degree_type='BS',
            institution='UNO', total_credits_required=10, description=''
        )
        session.add_all([delgado, uno])
        session.flush()

        uno_req = ProgramRequirement(
            program_id=uno.id, category='Science',
            credits_required=8, requirement_type='grouped', is_current=True
        )
        session.add(uno_req)
        session.flush()

        uno_group = RequirementGroup(
            requirement_id=uno_req.id, group_name='Sci Group',
            courses_required=0, credits_required=8
        )
        session.add(uno_group)
        session.flush()

        del_course = Course(
            code='BIOL 141', title='Gen Bio I', credits=4,
            institution='Delgado', department='BIOL', subject_code='BIOL'
        )
        uno_course = Course(
            code='BIOS 1083', title='Bio I', credits=4,
            institution='UNO', department='BIOS', subject_code='BIOS'
        )
        uno_course2 = Course(
            code='CHEM 1017', title='Chem I', credits=4,
            institution='UNO', department='CHEM', subject_code='CHEM'
        )
        session.add_all([del_course, uno_course, uno_course2])
        session.flush()

        session.add(GroupCourseOption(
            group_id=uno_group.id, course_code='BIOS 1083',
            institution='UNO', is_preferred=True
        ))
        session.add(GroupCourseOption(
            group_id=uno_group.id, course_code='CHEM 1017',
            institution='UNO', is_preferred=False
        ))
        session.flush()

        session.add(Equivalency(
            from_course_id=del_course.id,
            to_course_id=uno_course.id,
            equivalency_type='direct'
        ))
        session.flush()

        plan = Plan(
            student_name='Test', student_email='t@t.com',
            program_id=uno.id, current_program_id=delgado.id,
            plan_name='Suggestion Test'
        )
        session.add(plan)
        session.flush()

        _add_course_to_plan(
            session, plan, del_course, status='planned',
            category='Science'
        )

        suggestions = plan.suggest_courses_for_requirements(program=uno)
        # BIOS 1083 should NOT be suggested (its equiv BIOL 141 is on the plan)
        suggested_codes = [
            c['code'] for s in suggestions for c in s.get('course_options', [])
        ]
        assert 'BIOS 1083' not in suggested_codes
        # CHEM 1017 should still be suggested
        assert 'CHEM 1017' in suggested_codes
