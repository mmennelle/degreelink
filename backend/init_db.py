"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

#icludes some test data for db init.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app
    from models import db
    from models.course import Course
    from models.program import Program, ProgramRequirement
    from models.equivalency import Equivalency
except ImportError as e:
    print(f"Module error: {e}")
    print("Are you in the backend directory?")
    sys.exit(1)

def init_database():
    app = create_app()
    
    with app.app_context():
        print("Creating db tables")
        
        db.create_all()
        print("Db tables created")
        
        
        existing_courses = Course.query.count()
        if existing_courses > 0:
            print(f"Database already contains {existing_courses} courses")
            print("Delete database file if you want to start fresh")
            return
        
        print("Adding test data...")
        
        
        test_course = Course(
            code='TEST1',
            title='Test Course 1',
            description='Test Description 1',
            credits=3,
            institution='Test Institution 1',
            department='Test Department 1'
        )
        db.session.add(test_course)
        db.session.commit()
        
        test_course2 = Course(
            code='TEST2',
            title='Test Course 2',
            description='Test Description 2',
            credits=3,
            institution='Test Institution 2',
            department='Test Department 2'
        )
        db.session.add(test_course2)
        db.session.commit()
        
        test_program = Program(
            name='Test Program 1',
            degree_type='TEST1',
            institution='Test Institution 1',
            total_credits_required=120,
            description='Test Program Description 1'
        )
        db.session.add(test_program)
        db.session.commit()
        
        
        test_requirement = ProgramRequirement(
            program_id=test_program.id,
            category='Test Category 1',
            credits_required=12,
            description='Test Requirement Description 1'
        )
        db.session.add(test_requirement)
        db.session.commit()
        
        
        test_equivalency = Equivalency(
            from_course_id=test_course.id,
            to_course_id=test_course.id,
            equivalency_type='test1',
            notes='Test Notes 1',
            approved_by='Test Approver 1'
        )
        db.session.add(test_equivalency)
        db.session.commit()
        
        print("Database init complete")
        print(f"Created {Course.query.count()} test course")
        print(f"Created {Program.query.count()} test program")
        print(f"Created {ProgramRequirement.query.count()} test requirement")
        print(f"Created {Equivalency.query.count()} test equivalency")

def reset_database():
    """Reset database by dropping all tables and recreating"""
    app = create_app()
    
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("All tables dropped")
        init_database()

if __name__ == '__main__':
    print("Database Init")
    print("=" * 30)
    try:
        init_database()
    except Exception as e:
        print(f"Error during init: {str(e)}")
        print("Check that all dependencies are installed and models exist")
        sys.exit(1)