"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def init_app(app):
    db.init_app(app)
    migrate.init_app(app, db)
    return db

# circular import issue!!!
from .course import Course
from .program import Program, ProgramRequirement, RequirementGroup, GroupCourseOption
from .equivalency import Equivalency
from .plan import Plan, PlanCourse
from .constraint import RequirementConstraint
from .advisor_auth import AdvisorAuth

__all__ = ['db', 'migrate', 'init_app', 'Course', 'Program', 'ProgramRequirement', 
           'RequirementGroup', 'GroupCourseOption', 'Equivalency', 'Plan', 'PlanCourse',
           'RequirementConstraint', 'AdvisorAuth', 
           'RequirementConstraint']