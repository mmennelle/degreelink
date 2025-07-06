from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def init_app(app):
    db.init_app(app)
    migrate.init_app(app, db)
    return db

# Keep imports here because of circular import issue.
from .course import Course
from .program import Program, ProgramRequirement
from .equivalency import Equivalency
from .plan import Plan, PlanCourse

__all__ = ['db', 'migrate', 'init_app', 'Course', 'Program', 'ProgramRequirement', 'Equivalency', 'Plan', 'PlanCourse']