from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def init_app(app):
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import all models to ensure they're registered
    from .course import Course
    from .program import Program, ProgramRequirement
    from .equivalency import Equivalency
    from .plan import Plan, PlanCourse
    
    return db

# Import models here to make them available when importing from models
from .course import Course
from .program import Program, ProgramRequirement
from .equivalency import Equivalency
from .plan import Plan, PlanCourse

# Make models available at package level
__all__ = ['db', 'migrate', 'init_app', 'Course', 'Program', 'ProgramRequirement', 'Equivalency', 'Plan', 'PlanCourse']
