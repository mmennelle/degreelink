"""
Test CSV upload with various constraint configurations and edge cases.
Tests the unified CSV format for program requirements with embedded constraints.
"""
import pytest
import json
from io import BytesIO
from flask import Flask

from models import init_app, db
from models.program import Program, ProgramRequirement, RequirementGroup, GroupCourseOption
from models.course import Course
from models.constraint import RequirementConstraint


@pytest.fixture
def app():
    """Create and configure a test Flask app."""
    test_app = Flask(__name__)
    test_app.config['TESTING'] = True
    test_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    test_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Register the upload blueprint
    from routes.upload import bp as upload_bp
    test_app.register_blueprint(upload_bp)
    
    init_app(test_app)
    
    with test_app.app_context():
        db.create_all()
        
        # Create test program
        program = Program(
            name="Biology B.S.",
            institution="Test University",
            degree_type="Bachelor of Science",
            total_credits_required=120
        )
        db.session.add(program)
        
        # Create sample courses
        courses = [
            Course(course_code="BIOS 101", title="Intro Biology", credits=3, 
                   institution="Test University", level=1000),
            Course(course_code="BIOS 201", title="Cell Biology", credits=4, 
                   institution="Test University", level=2000, has_lab=True),
            Course(course_code="BIOS 301", title="Genetics", credits=4, 
                   institution="Test University", level=3000, has_lab=True),
            Course(course_code="BIOS 305", title="Ecology", credits=3, 
                   institution="Test University", level=3000, has_lab=False),
            Course(course_code="BIOS 401", title="Advanced Biology", credits=4, 
                   institution="Test University", level=4000, has_lab=True),
            Course(course_code="CHEM 101", title="General Chemistry", credits=4, 
                   institution="Test University", level=1000, has_lab=True),
            Course(course_code="MATH 201", title="Calculus I", credits=3, 
                   institution="Test University", level=2000),
        ]
        
        for course in courses:
            db.session.add(course)
        
        db.session.commit()
        
        yield test_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client for the app."""
    return app.test_client()


def test_credits_constraint_basic(app, client):
    """Test basic credits constraint (min only)."""
    with app.app_context():
        csv_data = """program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,min_credits
"Biology B.S.","Core Electives",grouped,Fall,2025,true,"Electives",BIOS 201,"Test University",credits,10
"Biology B.S.","Core Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"Test University","",""
"Biology B.S.","Core Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"Test University","",""
"""
        
        data = {'file': (BytesIO(csv_data.encode('utf-8')), 'test.csv')}
        response = client.post('/api/upload/requirements', 
                             data=data,
                             content_type='multipart/form-data')
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['success'] == True
        assert result['constraints_created'] == 1
        
        # Verify constraint was created correctly
        requirement = ProgramRequirement.query.filter_by(category="Core Electives").first()
        constraint = RequirementConstraint.query.filter_by(requirement_id=requirement.id).first()
        
        assert constraint.constraint_type == 'credits'
        params = json.loads(constraint.params)
        assert params['credits_min'] == 10
        assert 'credits_max' not in params


def test_credits_constraint_range(app, client):
    """Test credits constraint with both min and max."""
    with app.app_context():
        csv_data = """program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,min_credits,max_credits
"Biology B.S.","Electives",grouped,Fall,2025,true,"Options",BIOS 201,"Test University",credits,10,15
"Biology B.S.","Electives",grouped,Fall,2025,true,"Options",BIOS 301,"Test University","","",""
"Biology B.S.","Electives",grouped,Fall,2025,true,"Options",BIOS 401,"Test University","","",""
"""
        
        data = {'file': (BytesIO(csv_data.encode('utf-8')), 'test.csv')}
        response = client.post('/api/upload/requirements', data=data, content_type='multipart/form-data')
        
        assert response.status_code == 200
        
        requirement = ProgramRequirement.query.filter_by(category="Electives").first()
        constraint = RequirementConstraint.query.filter_by(requirement_id=requirement.id).first()
        
        params = json.loads(constraint.params)
        assert params['credits_min'] == 10
        assert params['credits_max'] == 15


def test_courses_constraint_basic(app, client):
    """Test course count constraint."""
    with app.app_context():
        csv_data = """program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,min_courses,max_courses
"Biology B.S.","Upper Level",grouped,Fall,2025,true,"Options",BIOS 301,"Test University",courses,2,4
"Biology B.S.","Upper Level",grouped,Fall,2025,true,"Options",BIOS 305,"Test University","","",""
"Biology B.S.","Upper Level",grouped,Fall,2025,true,"Options",BIOS 401,"Test University","","",""
"""
        
        data = {'file': (BytesIO(csv_data.encode('utf-8')), 'test.csv')}
        response = client.post('/api/upload/requirements', data=data, content_type='multipart/form-data')
        
        assert response.status_code == 200
        
        requirement = ProgramRequirement.query.filter_by(category="Upper Level").first()
        constraint = RequirementConstraint.query.filter_by(requirement_id=requirement.id).first()
        
        assert constraint.constraint_type == 'courses'
        params = json.loads(constraint.params)
        assert params['courses_min'] == 2
        assert params['courses_max'] == 4


def test_level_constraint(app, client):
    """Test level constraint (courses at certain level)."""
    with app.app_context():
        csv_data = """program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,min_level,min_courses_at_level
"Biology B.S.","Advanced Courses",grouped,Fall,2025,true,"Options",BIOS 201,"Test University",level,3000,2
"Biology B.S.","Advanced Courses",grouped,Fall,2025,true,"Options",BIOS 301,"Test University","","",""
"Biology B.S.","Advanced Courses",grouped,Fall,2025,true,"Options",BIOS 401,"Test University","","",""
"""
        
        data = {'file': (BytesIO(csv_data.encode('utf-8')), 'test.csv')}
        response = client.post('/api/upload/requirements', data=data, content_type='multipart/form-data')
        
        assert response.status_code == 200
        
        requirement = ProgramRequirement.query.filter_by(category="Advanced Courses").first()
        constraint = RequirementConstraint.query.filter_by(requirement_id=requirement.id).first()
        
        assert constraint.constraint_type == 'min_courses_at_level'
        params = json.loads(constraint.params)
        assert params['level'] == 3000
        assert params['courses'] == 2


def test_tag_constraint(app, client):
    """Test tag-based constraint (e.g., has_lab)."""
    with app.app_context():
        csv_data = """program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,tag,tag_value,min_courses
"Biology B.S.","Lab Courses",grouped,Fall,2025,true,"Options",BIOS 201,"Test University",tag,has_lab,true,2
"Biology B.S.","Lab Courses",grouped,Fall,2025,true,"Options",BIOS 301,"Test University","","","",""
"Biology B.S.","Lab Courses",grouped,Fall,2025,true,"Options",BIOS 401,"Test University","","","",""
"""
        
        data = {'file': (BytesIO(csv_data.encode('utf-8')), 'test.csv')}
        response = client.post('/api/upload/requirements', data=data, content_type='multipart/form-data')
        
        assert response.status_code == 200
        
        requirement = ProgramRequirement.query.filter_by(category="Lab Courses").first()
        constraint = RequirementConstraint.query.filter_by(requirement_id=requirement.id).first()
        
        assert constraint.constraint_type == 'min_tag_courses'
        params = json.loads(constraint.params)
        assert params['tag'] == 'true'
        assert params['courses'] == 2
        
        # Check scope filter includes tag field
        scope = json.loads(constraint.scope_filter)
        assert scope['tag_field'] == 'has_lab'


def test_multiple_constraints_same_category(app, client):
    """Test multiple constraints applied to the same category."""
    with app.app_context():
        csv_data = """program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,min_credits,min_courses,min_level,min_courses_at_level,tag,tag_value,scope_subject_codes
"Biology B.S.","Complex Requirements",grouped,Fall,2025,true,"Options",BIOS 201,"Test University",credits,12,"","","","","",BIOS
"Biology B.S.","Complex Requirements",grouped,Fall,2025,true,"Options",BIOS 201,"Test University",courses,"",3,"","","","",""
"Biology B.S.","Complex Requirements",grouped,Fall,2025,true,"Options",BIOS 201,"Test University",level,"","",3000,2,"","",BIOS
"Biology B.S.","Complex Requirements",grouped,Fall,2025,true,"Options",BIOS 301,"Test University","","","","","","","",""
"Biology B.S.","Complex Requirements",grouped,Fall,2025,true,"Options",BIOS 305,"Test University","","","","","","","",""
"Biology B.S.","Complex Requirements",grouped,Fall,2025,true,"Options",BIOS 401,"Test University","","","","","","","",""
"""
        
        data = {'file': (BytesIO(csv_data.encode('utf-8')), 'test.csv')}
        response = client.post('/api/upload/requirements', data=data, content_type='multipart/form-data')
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['constraints_created'] == 3
        
        requirement = ProgramRequirement.query.filter_by(category="Complex Requirements").first()
        constraints = RequirementConstraint.query.filter_by(requirement_id=requirement.id).all()
        
        assert len(constraints) == 3
        constraint_types = {c.constraint_type for c in constraints}
        assert constraint_types == {'credits', 'courses', 'min_courses_at_level'}
