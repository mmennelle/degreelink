"""
Degree Link - Comprehensive Test Suite
Copyright (c) 2025 University of New Orleans - Computer Science Department

Covers: models, course normalization, plan codes, equivalency chains,
        category mapping, progress calculation, prerequisite validation,
        and API endpoint behaviour.
"""

import os
import sys

# Ensure backend is importable when running from repo root
THIS_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(THIS_DIR, '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault('PROGRESS_USE_GROUPED_EVALUATION', 'true')
os.environ.setdefault('AUTO_ASSIGN_REQUIREMENT_GROUPS', 'true')

import json
import pytest
from flask import Flask

from models import init_app, db
from models.course import Course
from models.equivalency import Equivalency
from models.program import Program, ProgramRequirement, RequirementGroup, GroupCourseOption
from models.plan import Plan, PlanCourse, _CATEGORY_SUBJECT_MAP
from services.prerequisite_service import PrerequisiteService
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

    # Register blueprints for API tests
    from routes import register_routes
    register_routes(application)

    with application.app_context():
        db.create_all()
    yield application


@pytest.fixture(autouse=True)
def session(app):
    """Provide a clean database session per test.

    Drops and recreates all tables for full isolation between tests.
    """
    with app.app_context():
        db.drop_all()
        db.create_all()
        yield db.session
        db.session.rollback()


@pytest.fixture()
def client(app):
    """Flask test client for API endpoint tests."""
    return app.test_client()


# ===========================================================================
# 1. COURSE MODEL TESTS
# ===========================================================================

class TestCourseModel:
    """Tests for Course creation and automatic field population."""

    def test_subject_code_and_number_extracted(self, session):
        """Setting code auto-populates subject_code & course_number."""
        c = Course(code='BIOL 1010', title='Intro Bio', credits=3,
                   institution='UNO', department='Biology')
        session.add(c)
        session.flush()
        assert c.subject_code == 'BIOL'
        assert c.course_number == '1010'

    def test_code_normalised_to_uppercase(self, session):
        """Lowercase code should be normalised on save."""
        c = Course(code='psyc201', title='Gen Psych', credits=3,
                   institution='UNO', department='PSYC')
        session.add(c)
        session.flush()
        assert c.subject_code == 'PSYC'
        assert c.course_number == '201'
        assert c.code == 'PSYC 201'

    def test_course_number_numeric_extracted(self, session):
        """Numeric portion of course number is stored."""
        c = Course(code='CSCI 6500G', title='Graduate Seminar', credits=3,
                   institution='UNO', department='CSCI')
        session.add(c)
        session.flush()
        assert c.course_number_numeric == 6500
        assert c.course_level == 6000

    def test_course_level_sets_correctly(self, session):
        """Course level should truncate to nearest thousand."""
        c = Course(code='MATH 1583', title='Calculus I', credits=4,
                   institution='UNO', department='MATH')
        session.add(c)
        session.flush()
        assert c.course_level == 1000

    def test_prerequisites_stored(self, session):
        """Prerequisites field stores free-text prerequisite string."""
        c = Course(code='ENGL 1158', title='Eng Comp II', credits=3,
                   institution='UNO', department='ENGL',
                   prerequisites='ENGL 1157')
        session.add(c)
        session.flush()
        assert c.prerequisites == 'ENGL 1157'

    def test_unique_constraint_on_subject_number_institution(self, session):
        """Duplicate subject+number+institution should raise."""
        c1 = Course(code='HIST 1000', title='World History I', credits=3,
                    institution='UNO', department='HIST')
        c2 = Course(code='HIST 1000', title='World History I duplicate', credits=3,
                    institution='UNO', department='HIST')
        session.add(c1)
        session.flush()
        session.add(c2)
        with pytest.raises(Exception):
            session.flush()
        session.rollback()


# ===========================================================================
# 2. PLAN MODEL TESTS
# ===========================================================================

class TestPlanModel:
    """Tests for Plan creation, codes, and serialisation."""

    def test_plan_code_generated_automatically(self, session):
        """Plan.plan_code should be set to an 8-char alphanumeric string."""
        p = Plan(student_name='Alice', student_email='alice@example.com',
                 program_id=1, plan_name='My Plan')
        session.add(p)
        session.flush()
        assert p.plan_code is not None
        assert len(p.plan_code) == 8
        assert p.plan_code.isalnum()

    def test_plan_codes_unique(self, session):
        """Two plans should get different codes."""
        p1 = Plan(student_name='A', student_email='a@x.com',
                  program_id=1, plan_name='Plan A')
        p2 = Plan(student_name='B', student_email='b@x.com',
                  program_id=1, plan_name='Plan B')
        session.add_all([p1, p2])
        session.flush()
        assert p1.plan_code != p2.plan_code

    def test_find_by_code(self, session):
        """Plan.find_by_code should retrieve the correct plan."""
        p = Plan(student_name='Charlie', student_email='c@x.com',
                 program_id=1, plan_name='Lookup Test')
        session.add(p)
        session.flush()
        found = Plan.find_by_code(p.plan_code)
        assert found is not None
        assert found.id == p.id

    def test_normalize_category_maps_known_variants(self, session):
        """normalize_category should collapse variant names."""
        assert Plan.normalize_category('math/analytical reasoning') == 'Mathematics'
        assert Plan.normalize_category('english composition') == 'English'
        assert Plan.normalize_category('social/behavioral sciences') == 'Social Sciences'
        assert Plan.normalize_category('biology') == 'Science'
        assert Plan.normalize_category('humanities') == 'Humanities'

    def test_normalize_category_preserves_unknown(self, session):
        """Unknown categories are returned unchanged."""
        assert Plan.normalize_category('Custom Stuff') == 'Custom Stuff'

    def test_normalize_category_handles_none(self, session):
        """None or empty category returns 'Uncategorized'."""
        assert Plan.normalize_category(None) == 'Uncategorized'
        assert Plan.normalize_category('') == 'Uncategorized'


# ===========================================================================
# 3. CATEGORY SUBJECT MAP TESTS
# ===========================================================================

class TestCategorySubjectMap:
    """Tests for the _CATEGORY_SUBJECT_MAP used in auto-assignment."""

    def test_biology_keys_include_bios(self):
        """'biology' key should list BIOS for UNO and BIO for Delgado."""
        bio_subjects = _CATEGORY_SUBJECT_MAP.get('biology', [])
        assert 'BIOS' in bio_subjects
        assert 'BIOL' in bio_subjects
        assert 'BIO' in bio_subjects

    def test_english_keys(self):
        assert 'ENGL' in _CATEGORY_SUBJECT_MAP['english']

    def test_social_sciences_includes_common_subjects(self):
        subjects = _CATEGORY_SUBJECT_MAP.get('social sciences', [])
        for code in ['SOC', 'SOCI', 'PSY', 'PSYC', 'POLI', 'ANTH', 'ECON']:
            assert code in subjects, f"{code} missing from social sciences map"

    def test_arts_includes_mus_and_musc(self):
        subjects = _CATEGORY_SUBJECT_MAP.get('arts', [])
        assert 'MUS' in subjects
        assert 'MUSC' in subjects

    def test_humanities_includes_important_subjects(self):
        subjects = _CATEGORY_SUBJECT_MAP.get('humanities', [])
        for code in ['ENGL', 'HIST', 'PHIL', 'ART', 'MUSC', 'MUS']:
            assert code in subjects, f"{code} missing from humanities map"

    def test_mathematics_includes_stat(self):
        subjects = _CATEGORY_SUBJECT_MAP.get('mathematics', [])
        assert 'STAT' in subjects
        assert 'MATH' in subjects


# ===========================================================================
# 4. EQUIVALENCY TESTS
# ===========================================================================

class TestEquivalency:
    """Tests for course equivalency model and relationships."""

    def _make_courses(self, session):
        c1 = Course(code='ENGL 101', title='Eng I (Delgado)', credits=3,
                    institution='Delgado', department='ENGL')
        c2 = Course(code='ENGL 1157', title='Eng I (UNO)', credits=3,
                    institution='UNO', department='ENGL')
        session.add_all([c1, c2])
        session.flush()
        return c1, c2

    def test_equivalency_created(self, session):
        c1, c2 = self._make_courses(session)
        eq = Equivalency(from_course_id=c1.id, to_course_id=c2.id,
                         equivalency_type='direct')
        session.add(eq)
        session.flush()
        assert eq.from_course.code == 'ENGL 101'
        assert eq.to_course.code == 'ENGL 1157'

    def test_bidirectional_relationships(self, session):
        c1, c2 = self._make_courses(session)
        eq = Equivalency(from_course_id=c1.id, to_course_id=c2.id,
                         equivalency_type='direct')
        session.add(eq)
        session.flush()
        # c1 should have equivalent_from entries
        assert any(e.to_course_id == c2.id for e in c1.equivalent_from)
        # c2 should have equivalent_to entries
        assert any(e.from_course_id == c1.id for e in c2.equivalent_to)


# ===========================================================================
# 5. PREREQUISITE SERVICE TESTS
# ===========================================================================

class TestPrerequisiteServiceParsing:
    """Tests for PrerequisiteService.parse_prerequisites()."""

    def test_comma_separated(self):
        result = PrerequisiteService.parse_prerequisites('MATH 101, BIOL 200')
        assert result == ['MATH 101', 'BIOL 200']

    def test_semicolon_separated(self):
        result = PrerequisiteService.parse_prerequisites('CSCI 1583; CSCI 2001')
        assert result == ['CSCI 1583', 'CSCI 2001']

    def test_and_separated(self):
        result = PrerequisiteService.parse_prerequisites('ENGL 1157 and MATH 1115')
        assert result == ['ENGL 1157', 'MATH 1115']

    def test_or_separated(self):
        result = PrerequisiteService.parse_prerequisites('PHYS 101 or PHYS 201')
        assert result == ['PHYS 101', 'PHYS 201']

    def test_normalises_no_space(self):
        """'MATH101' should become 'MATH 101'."""
        result = PrerequisiteService.parse_prerequisites('MATH101')
        assert result == ['MATH 101']

    def test_empty_string(self):
        assert PrerequisiteService.parse_prerequisites('') == []
        assert PrerequisiteService.parse_prerequisites(None) == []

    def test_single_course(self):
        result = PrerequisiteService.parse_prerequisites('ENGL 1157')
        assert result == ['ENGL 1157']


class TestPrerequisiteServiceValidation:
    """Tests for full prerequisite validation (with DB equivalencies)."""

    def _setup_prerequisite_scenario(self, session):
        """Create ENGL 1157 → ENGL 1158 prerequisite chain at UNO,
        plus an equivalency: Delgado ENGL 101 ↔ UNO ENGL 1157."""
        engl1157 = Course(code='ENGL 1157', title='Eng Comp I',
                          credits=3, institution='UNO', department='ENGL')
        engl1158 = Course(code='ENGL 1158', title='Eng Comp II',
                          credits=3, institution='UNO', department='ENGL',
                          prerequisites='ENGL 1157')
        engl101 = Course(code='ENGL 101', title='Composition I',
                         credits=3, institution='Delgado', department='ENGL')
        session.add_all([engl1157, engl1158, engl101])
        session.flush()

        eq = Equivalency(from_course_id=engl101.id,
                         to_course_id=engl1157.id,
                         equivalency_type='direct')
        session.add(eq)
        session.flush()
        return engl1157, engl1158, engl101

    def test_prerequisite_met_directly(self, session, app):
        """If student completed the exact prerequisite course, validation passes."""
        engl1157, engl1158, _ = self._setup_prerequisite_scenario(session)
        prog = Program(name='Test', degree_type='BS', institution='UNO',
                       total_credits_required=120, description='')
        session.add(prog)
        session.flush()

        plan = Plan(student_name='Test', student_email='t@t.com',
                    program_id=prog.id, plan_name='Test Plan')
        session.add(plan)
        session.flush()

        pc = PlanCourse(plan_id=plan.id, course_id=engl1157.id,
                        status='completed')
        session.add(pc)
        session.flush()

        result = PrerequisiteService.validate_prerequisites(
            'ENGL 1158', [pc]
        )
        assert result['can_take'] is True
        assert result['missing_prerequisites'] == []

    def test_prerequisite_not_met(self, session, app):
        """If student has NOT completed the prerequisite, validation fails."""
        _, engl1158, _ = self._setup_prerequisite_scenario(session)
        result = PrerequisiteService.validate_prerequisites(
            'ENGL 1158', []  # No completed courses
        )
        assert result['can_take'] is False
        assert 'ENGL 1157' in result['missing_prerequisites']

    def test_prerequisite_met_via_equivalency(self, session, app):
        """Delgado ENGL 101 should satisfy UNO ENGL 1157 prereq for ENGL 1158."""
        _, engl1158, engl101 = self._setup_prerequisite_scenario(session)
        prog = Program(name='Test', degree_type='BS', institution='UNO',
                       total_credits_required=120, description='')
        session.add(prog)
        session.flush()

        plan = Plan(student_name='Test', student_email='t@t.com',
                    program_id=prog.id, plan_name='Test Plan')
        session.add(plan)
        session.flush()

        # Student completed the Delgado equivalent, not the UNO course directly
        pc = PlanCourse(plan_id=plan.id, course_id=engl101.id,
                        status='completed')
        session.add(pc)
        session.flush()

        result = PrerequisiteService.validate_prerequisites(
            'ENGL 1158', [pc]
        )
        assert result['can_take'] is True
        assert result['satisfied_prerequisites'] == ['ENGL 1157']

    def test_course_with_no_prerequisites(self, session, app):
        """A course without prerequisites should always be takeable."""
        c = Course(code='ART 1000', title='Intro Art', credits=3,
                   institution='UNO', department='ART')
        session.add(c)
        session.flush()

        result = PrerequisiteService.validate_prerequisites('ART 1000', [])
        assert result['can_take'] is True
        assert result['all_prerequisites'] == []


class TestPrerequisiteServiceEquivalents:
    """Tests for equivalent-course lookup."""

    def test_get_equivalent_includes_self(self, session, app):
        c = Course(code='MATH 1115', title='College Algebra', credits=3,
                   institution='UNO', department='MATH')
        session.add(c)
        session.flush()
        result = PrerequisiteService.get_equivalent_courses('MATH 1115')
        assert 'MATH 1115' in result

    def test_transitive_equivalency(self, session, app):
        """A ↔ B ↔ C should make A,B,C all transitively equivalent."""
        a = Course(code='TRAN 100', title='A', credits=3,
                   institution='SchoolA', department='TRAN')
        b = Course(code='TRAN 200', title='B', credits=3,
                   institution='SchoolB', department='TRAN')
        c = Course(code='TRAN 300', title='C', credits=3,
                   institution='SchoolC', department='TRAN')
        session.add_all([a, b, c])
        session.flush()

        eq1 = Equivalency(from_course_id=a.id, to_course_id=b.id,
                          equivalency_type='direct')
        eq2 = Equivalency(from_course_id=b.id, to_course_id=c.id,
                          equivalency_type='direct')
        session.add_all([eq1, eq2])
        session.flush()

        result = PrerequisiteService.get_all_transitive_equivalents('TRAN 100')
        assert 'TRAN 100' in result
        assert 'TRAN 200' in result
        assert 'TRAN 300' in result


# ===========================================================================
# 6. PROGRESS CALCULATION TESTS
# ===========================================================================

class TestProgressCalculation:
    """Tests for Plan.calculate_progress()."""

    def _make_program_with_simple_req(self, session, category='Mathematics',
                                       credits=6):
        prog = Program(name='Test Prog', degree_type='BS', institution='UNO',
                       total_credits_required=credits, description='')
        session.add(prog)
        session.flush()
        req = ProgramRequirement(program_id=prog.id, category=category,
                                  credits_required=credits, description='',
                                  requirement_type='simple', is_current=True)
        session.add(req)
        session.flush()
        return prog, req

    def test_progress_zero_when_empty_plan(self, session, app):
        prog, _ = self._make_program_with_simple_req(session)
        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='Empty')
        session.add(plan)
        session.flush()

        result = plan.calculate_progress(program=prog,
                                          view_filter='Completed Courses')
        assert result['percent'] == 0

    def test_progress_100_when_fully_met(self, session, app):
        prog, _ = self._make_program_with_simple_req(session, 'Mathematics', 6)
        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='Full')
        session.add(plan)
        session.flush()

        m1 = Course(code='MATH 1115', title='Algebra', credits=3,
                    institution='UNO', department='MATH', subject_code='MATH')
        m2 = Course(code='MATH 1125', title='Pre-Calc', credits=3,
                    institution='UNO', department='MATH', subject_code='MATH')
        session.add_all([m1, m2])
        session.flush()

        pc1 = PlanCourse(plan_id=plan.id, course_id=m1.id,
                         status='completed', requirement_category='Mathematics')
        pc2 = PlanCourse(plan_id=plan.id, course_id=m2.id,
                         status='completed', requirement_category='Mathematics')
        session.add_all([pc1, pc2])
        session.flush()

        result = plan.calculate_progress(program=prog,
                                          view_filter='Completed Courses')
        assert result['percent'] == 100

    def test_partial_progress(self, session, app):
        prog, _ = self._make_program_with_simple_req(session, 'English', 6)
        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='Partial')
        session.add(plan)
        session.flush()

        e1 = Course(code='ENGL 1157', title='Eng I', credits=3,
                    institution='UNO', department='ENGL', subject_code='ENGL')
        session.add(e1)
        session.flush()

        pc = PlanCourse(plan_id=plan.id, course_id=e1.id,
                        status='completed', requirement_category='English')
        session.add(pc)
        session.flush()

        result = plan.calculate_progress(program=prog,
                                          view_filter='Completed Courses')
        req_result = next(r for r in result['requirements']
                          if r['category'] == 'English')
        assert req_result['status'] == 'part'
        assert req_result['completedCredits'] == 3


# ===========================================================================
# 7. GROUPED REQUIREMENT / AUTO-ASSIGNMENT TESTS
# ===========================================================================

class TestGroupedRequirements:
    """Tests for grouped requirement progress and auto-assignment."""

    def _build_grouped_program(self, session):
        prog = Program(name='Bio Prog', degree_type='BS', institution='UNO',
                       total_credits_required=6, description='')
        session.add(prog)
        session.flush()

        req = ProgramRequirement(program_id=prog.id,
                                  category='Science Electives',
                                  credits_required=6, description='',
                                  requirement_type='grouped', is_current=True)
        session.add(req)
        session.flush()

        grp = RequirementGroup(requirement_id=req.id,
                                group_name='Science Options',
                                courses_required=0, credits_required=6)
        session.add(grp)
        session.flush()

        c1 = Course(code='BIOS 1011', title='Bio I', credits=3,
                    institution='UNO', department='BIOS')
        c2 = Course(code='BIOS 1021', title='Bio II', credits=3,
                    institution='UNO', department='BIOS')
        session.add_all([c1, c2])
        session.flush()

        for c in [c1, c2]:
            opt = GroupCourseOption(group_id=grp.id, course_code=c.code,
                                    institution='UNO', is_preferred=False)
            session.add(opt)
        session.commit()
        return prog, req, grp, c1, c2

    def test_grouped_requirement_met(self, session, app):
        prog, req, grp, c1, c2 = self._build_grouped_program(session)
        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='GrpTest')
        session.add(plan)
        session.flush()

        for c in [c1, c2]:
            pc = PlanCourse(plan_id=plan.id, course_id=c.id,
                            status='completed', requirement_group_id=grp.id)
            session.add(pc)
        session.commit()

        result = plan.calculate_progress(program=prog,
                                          view_filter='Completed Courses')
        rr = next(r for r in result['requirements']
                  if r['category'] == 'Science Electives')
        assert rr['status'] == 'met'
        assert rr['completedCredits'] == 6

    def test_auto_assign_requirement_group(self, session, app):
        prog, req, grp, c1, _ = self._build_grouped_program(session)
        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='AutoAssign')
        session.add(plan)
        session.flush()

        pc = PlanCourse(plan_id=plan.id, course_id=c1.id, status='completed')
        session.add(pc)
        session.flush()

        _assign_requirement_group(plan, pc)
        session.flush()
        assert pc.requirement_group_id == grp.id


# ===========================================================================
# 8. BIDIRECTIONAL EQUIVALENCY IN PROGRESS
# ===========================================================================

class TestBidirectionalEquivalency:
    """Ensure _get_equivalent_course works in both directions."""

    def test_forward_equivalency(self, session, app):
        """from_course → to_course at target institution is found."""
        prog = Program(name='UNO Bio', degree_type='BS', institution='UNO',
                       total_credits_required=6, description='')
        session.add(prog)
        session.flush()

        delg = Course(code='BIOL 111', title='Bio I Delgado', credits=3,
                      institution='Delgado', department='BIOL')
        uno = Course(code='BIOS 1001', title='Bio I UNO', credits=3,
                     institution='UNO', department='BIOS')
        session.add_all([delg, uno])
        session.flush()

        eq = Equivalency(from_course_id=delg.id, to_course_id=uno.id,
                         equivalency_type='direct')
        session.add(eq)
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='FwdEq')
        session.add(plan)
        session.flush()

        pc = PlanCourse(plan_id=plan.id, course_id=delg.id,
                        status='completed')
        session.add(pc)
        session.flush()

        found = plan._get_equivalent_course(pc, prog)
        assert found is not None
        assert found.code == 'BIOS 1001'

    def test_reverse_equivalency(self, session, app):
        """to_course → from_course at target institution is found."""
        prog = Program(name='UNO Bio', degree_type='BS', institution='UNO',
                       total_credits_required=6, description='')
        session.add(prog)
        session.flush()

        delg = Course(code='BIOL 112', title='Bio II Delgado', credits=3,
                      institution='Delgado', department='BIOL')
        uno = Course(code='BIOS 1002', title='Bio II UNO', credits=3,
                     institution='UNO', department='BIOS')
        session.add_all([uno, delg])
        session.flush()

        # stored in reverse: UNO → Delgado, but we are looking for UNO match
        eq = Equivalency(from_course_id=uno.id, to_course_id=delg.id,
                         equivalency_type='direct')
        session.add(eq)
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='RevEq')
        session.add(plan)
        session.flush()

        pc = PlanCourse(plan_id=plan.id, course_id=delg.id,
                        status='completed')
        session.add(pc)
        session.flush()

        found = plan._get_equivalent_course(pc, prog)
        assert found is not None
        assert found.code == 'BIOS 1002'


# ===========================================================================
# 9. CCN-MEDIATED EQUIVALENCY TESTS
# ===========================================================================

class TestCCNMediatedEquivalency:
    """Test 3-way chain: School1 → CCN → School2."""

    def test_ccn_chain(self, session, app):
        prog = Program(name='UNO Bio', degree_type='BS', institution='UNO',
                       total_credits_required=6, description='')
        session.add(prog)
        session.flush()

        delg = Course(code='BIO 141', title='Bio for CCN', credits=3,
                      institution='Delgado', department='BIO')
        ccn = Course(code='CBIO 1010', title='Common Bio', credits=3,
                     institution='Louisiana Board of Regents', department='BIO')
        uno = Course(code='BIOS 1003', title='Bio CCN UNO', credits=3,
                     institution='UNO', department='BIOS')
        session.add_all([delg, ccn, uno])
        session.flush()

        # Delgado → CCN
        eq1 = Equivalency(from_course_id=delg.id, to_course_id=ccn.id,
                          equivalency_type='articulation')
        # UNO → CCN
        eq2 = Equivalency(from_course_id=uno.id, to_course_id=ccn.id,
                          equivalency_type='articulation')
        session.add_all([eq1, eq2])
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='CCN')
        session.add(plan)
        session.flush()

        pc = PlanCourse(plan_id=plan.id, course_id=delg.id,
                        status='completed')
        session.add(pc)
        session.flush()

        found = plan._get_equivalent_course(pc, prog)
        assert found is not None
        assert found.code == 'BIOS 1003'


# ===========================================================================
# 10. API ENDPOINT TESTS
# ===========================================================================

class TestPrerequisiteEndpoint:
    """Tests for the new /validate-prerequisites API endpoint."""

    def _create_scenario(self, session):
        """Create a full prerequisite scenario and return (plan, course_with_prereq)."""
        prog = Program(name='Test', degree_type='BS', institution='UNO',
                       total_credits_required=120, description='')
        session.add(prog)
        session.flush()

        engl1157 = Course(code='ENGL 1157', title='Eng I', credits=3,
                          institution='UNO', department='ENGL')
        engl1158 = Course(code='ENGL 1158', title='Eng II', credits=3,
                          institution='UNO', department='ENGL',
                          prerequisites='ENGL 1157')
        session.add_all([engl1157, engl1158])
        session.flush()

        plan = Plan(student_name='T', student_email='t@t.com',
                    program_id=prog.id, plan_name='API Test')
        session.add(plan)
        session.flush()

        return prog, plan, engl1157, engl1158

    def test_prereq_warning_when_missing(self, session, client, app):
        """Adding ENGL 1158 without ENGL 1157 should flag a warning."""
        with app.app_context():
            prog, plan, engl1157, engl1158 = self._create_scenario(session)
            session.commit()

            # Set plan access in session for @require_plan_access
            with client.session_transaction() as sess:
                sess['plan_access'] = {str(plan.id): True}

            resp = client.post(
                f'/api/plans/by-code/{plan.plan_code}/validate-prerequisites',
                json={'course_id': engl1158.id},
                content_type='application/json'
            )
            assert resp.status_code == 200
            data = resp.get_json()
            assert data['has_warnings'] is True
            assert data['can_take'] is False
            assert any('ENGL 1157' in w['description']
                       for w in data['warnings'])

    def test_no_prereq_warning_when_satisfied(self, session, client, app):
        """Adding ENGL 1158 with ENGL 1157 completed should pass."""
        with app.app_context():
            prog, plan, engl1157, engl1158 = self._create_scenario(session)
            pc = PlanCourse(plan_id=plan.id, course_id=engl1157.id,
                            status='completed')
            session.add(pc)
            session.commit()

            with client.session_transaction() as sess:
                sess['plan_access'] = {str(plan.id): True}

            resp = client.post(
                f'/api/plans/by-code/{plan.plan_code}/validate-prerequisites',
                json={'course_id': engl1158.id},
                content_type='application/json'
            )
            assert resp.status_code == 200
            data = resp.get_json()
            assert data['has_warnings'] is False
            assert data['can_take'] is True

    def test_no_warning_for_course_without_prereqs(self, session, client, app):
        """A course with no prerequisites should return no warnings."""
        with app.app_context():
            prog, plan, engl1157, _ = self._create_scenario(session)
            session.commit()

            with client.session_transaction() as sess:
                sess['plan_access'] = {str(plan.id): True}

            # Test with ENGL 1157 which has no prerequisites
            resp = client.post(
                f'/api/plans/by-code/{plan.plan_code}/validate-prerequisites',
                json={'course_id': engl1157.id},
                content_type='application/json'
            )
            assert resp.status_code == 200
            data = resp.get_json()
            assert data['has_warnings'] is False
            assert data['can_take'] is True


class TestConstraintEndpoint:
    """Tests for the existing constraint validation endpoint."""

    def test_constraint_endpoint_exists(self, session, client, app):
        """The validate-course-constraints endpoint should respond."""
        with app.app_context():
            prog = Program(name='Test', degree_type='BS', institution='UNO',
                           total_credits_required=120, description='')
            session.add(prog)
            session.flush()

            c = Course(code='TEST 100', title='Test', credits=3,
                       institution='UNO', department='TEST')
            session.add(c)
            session.flush()

            plan = Plan(student_name='T', student_email='t@t.com',
                        program_id=prog.id, plan_name='Constr Test')
            session.add(plan)
            session.commit()

            with client.session_transaction() as sess:
                sess['plan_access'] = {str(plan.id): True}

            resp = client.post(
                f'/api/plans/by-code/{plan.plan_code}/validate-course-constraints',
                json={
                    'course_id': c.id,
                    'requirement_category': 'Test Category'
                },
                content_type='application/json'
            )
            assert resp.status_code == 200


class TestPlanCourseAddition:
    """Tests for adding courses to a plan via the API."""

    def test_add_course_to_plan_by_code(self, session, client, app):
        """Should successfully add a course to a plan using plan_code."""
        with app.app_context():
            prog = Program(name='Test', degree_type='BS', institution='UNO',
                           total_credits_required=120, description='')
            session.add(prog)
            session.flush()

            c = Course(code='CSCI 1583', title='Intro CS', credits=3,
                       institution='UNO', department='CSCI')
            session.add(c)
            session.flush()

            plan = Plan(student_name='T', student_email='t@t.com',
                        program_id=prog.id, plan_name='Add Test')
            session.add(plan)
            session.commit()

            with client.session_transaction() as sess:
                sess['plan_access'] = {str(plan.id): True}

            resp = client.post(
                f'/api/plans/by-code/{plan.plan_code}/courses',
                json={
                    'course_id': c.id,
                    'semester': 'Fall',
                    'year': 2025,
                    'status': 'planned',
                    'requirement_category': 'Computer Science'
                },
                content_type='application/json'
            )
            assert resp.status_code == 201

    def test_duplicate_course_rejected(self, session, client, app):
        """Adding the same course twice should return 400."""
        with app.app_context():
            prog = Program(name='Test', degree_type='BS', institution='UNO',
                           total_credits_required=120, description='')
            session.add(prog)
            session.flush()

            c = Course(code='CSCI 1584', title='Intro CS II', credits=3,
                       institution='UNO', department='CSCI')
            session.add(c)
            session.flush()

            plan = Plan(student_name='T', student_email='t@t.com',
                        program_id=prog.id, plan_name='Dup Test')
            session.add(plan)
            session.flush()

            pc = PlanCourse(plan_id=plan.id, course_id=c.id,
                            status='planned')
            session.add(pc)
            session.commit()

            with client.session_transaction() as sess:
                sess['plan_access'] = {str(plan.id): True}

            resp = client.post(
                f'/api/plans/by-code/{plan.plan_code}/courses',
                json={
                    'course_id': c.id,
                    'semester': 'Fall',
                    'year': 2025,
                    'status': 'planned',
                    'requirement_category': 'Computer Science'
                },
                content_type='application/json'
            )
            assert resp.status_code == 400


# ===========================================================================
# 11. PLAN ACCESS / SECURITY TESTS
# ===========================================================================

class TestPlanAccessControl:
    """Ensure plan-code based access control works."""

    def test_invalid_plan_code_format_rejected(self, session, client, app):
        """Plan code that isn't 8 characters should be rejected."""
        with app.app_context():
            resp = client.post(
                '/api/plans/by-code/ABC/validate-prerequisites',
                json={'course_id': 1},
                content_type='application/json'
            )
            assert resp.status_code == 400

    def test_nonexistent_plan_code_returns_404(self, session, client, app):
        """A valid-format but nonexistent plan code should 404."""
        with app.app_context():
            with client.session_transaction() as sess:
                sess['plan_access'] = {}

            resp = client.post(
                '/api/plans/by-code/ZZZZZZZZ/validate-prerequisites',
                json={'course_id': 1},
                content_type='application/json'
            )
            assert resp.status_code == 404
