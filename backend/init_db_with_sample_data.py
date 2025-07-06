import os
import sys


sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app
    from models import db
    from models.course import Course
    from models.program import Program, ProgramRequirement
    from models.equivalency import Equivalency
    
    
    try:
        from models.plan import Plan, PlanCourse
    except ImportError:
        print("Warning: PlanCourse not found, using basic Plan model")
        from models.plan import Plan
        PlanCourse = None
        
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure you're in the backend directory and all model files exist")
    sys.exit(1)

from datetime import datetime

def init_database():
    """Initialize database with tables and sample data"""
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        
        
        db.create_all()
        print("Database tables created successfully")
        
        
        existing_courses = Course.query.count()
        if existing_courses > 0:
            print(f"Database already contains {existing_courses} courses")
            print("Delete course_transfer.db if you want to start fresh")
            return
        
        print("Adding sample courses...")
        
        
        sample_courses = [
            
            {
                'code': 'BIOL 101',
                'title': 'Introduction to Biology',
                'description': 'Fundamental principles of biology including cell structure, genetics, and evolution.',
                'credits': 4,
                'institution': 'City Community College',
                'department': 'Biology'
            },
            {
                'code': 'MATH 151',
                'title': 'Calculus I',
                'description': 'Limits, derivatives, and applications of differential calculus.',
                'credits': 4,
                'institution': 'City Community College',
                'department': 'Mathematics'
            },
            {
                'code': 'ENG 101',
                'title': 'English Composition I',
                'description': 'Introduction to academic writing and critical thinking.',
                'credits': 3,
                'institution': 'City Community College',
                'department': 'English'
            },
            {
                'code': 'HIST 101',
                'title': 'World History I',
                'description': 'Survey of world civilizations from ancient times to 1500.',
                'credits': 3,
                'institution': 'City Community College',
                'department': 'History'
            },
            {
                'code': 'CHEM 111',
                'title': 'General Chemistry I',
                'description': 'Introduction to chemical principles and laboratory techniques.',
                'credits': 4,
                'institution': 'City Community College',
                'department': 'Chemistry'
            },
            {
                'code': 'PHYS 101',
                'title': 'College Physics I',
                'description': 'Introduction to mechanics, heat, and wave motion.',
                'credits': 4,
                'institution': 'City Community College',
                'department': 'Physics'
            },
            
            
            {
                'code': 'BIO 1010',
                'title': 'Principles of Biology',
                'description': 'Comprehensive introduction to biological principles.',
                'credits': 4,
                'institution': 'State University',
                'department': 'Biology'
            },
            {
                'code': 'MATH 1210',
                'title': 'Calculus I',
                'description': 'Differential calculus with applications.',
                'credits': 4,
                'institution': 'State University',
                'department': 'Mathematics'
            },
            {
                'code': 'ENGL 1010',
                'title': 'College Writing',
                'description': 'Academic writing and research methods.',
                'credits': 3,
                'institution': 'State University',
                'department': 'English'
            },
            {
                'code': 'HIST 1700',
                'title': 'World Civilizations',
                'description': 'Survey of global historical developments.',
                'credits': 3,
                'institution': 'State University',
                'department': 'History'
            },
            {
                'code': 'CHEM 1210',
                'title': 'Principles of Chemistry I',
                'description': 'Fundamental chemical concepts and laboratory work.',
                'credits': 4,
                'institution': 'State University',
                'department': 'Chemistry'
            },
            {
                'code': 'PHYS 2210',
                'title': 'Physics for Scientists I',
                'description': 'Calculus-based mechanics and thermodynamics.',
                'credits': 4,
                'institution': 'State University',
                'department': 'Physics'
            }
        ]
        
        
        course_refs = {}
        for course_data in sample_courses:
            course = Course(**course_data)
            db.session.add(course)
            
            key = f"{course_data['code']}_{course_data['institution']}"
            course_refs[key] = course
        
        db.session.commit()
        print(f"✅ Created {len(sample_courses)} sample courses")
        
        print("🎓 Creating sample program...")
        
        
        biology_program = Program(
            name='Biology Major',
            degree_type='BS',
            institution='State University',
            total_credits_required=120,
            description='Bachelor of Science in Biology with emphasis on life sciences and research.'
        )
        db.session.add(biology_program)
        db.session.commit()
        
        
        requirements = [
            {
                'program_id': biology_program.id,
                'category': 'Core Biology',
                'credits_required': 32,
                'description': 'Required biology courses for the major'
            },
            {
                'program_id': biology_program.id,
                'category': 'Mathematics',
                'credits_required': 12,
                'description': 'Calculus and statistics requirements'
            },
            {
                'program_id': biology_program.id,
                'category': 'Chemistry',
                'credits_required': 16,
                'description': 'General and organic chemistry sequences'
            },
            {
                'program_id': biology_program.id,
                'category': 'Physics',
                'credits_required': 8,
                'description': 'Physics for science majors'
            },
            {
                'program_id': biology_program.id,
                'category': 'General Education',
                'credits_required': 40,
                'description': 'Liberal arts and sciences breadth requirements'
            },
            {
                'program_id': biology_program.id,
                'category': 'Electives',
                'credits_required': 12,
                'description': 'Upper-division biology electives'
            }
        ]
        
        for req_data in requirements:
            requirement = ProgramRequirement(**req_data)
            db.session.add(requirement)
        
        db.session.commit()
        print(f"✅ Created program with {len(requirements)} requirements")
        
        print("🔗 Creating course equivalencies...")
        
        
        equivalencies_data = [
            ('BIOL 101_City Community College', 'BIO 1010_State University', 'direct', 'Direct transfer equivalency', 'Dr. Smith'),
            ('MATH 151_City Community College', 'MATH 1210_State University', 'direct', 'Same content and credit hours', 'Dr. Johnson'),
            ('ENG 101_City Community College', 'ENGL 1010_State University', 'direct', 'Meets composition requirement', 'Dr. Williams'),
            ('HIST 101_City Community College', 'HIST 1700_State University', 'partial', 'Covers similar content but different time periods', 'Dr. Brown'),
            ('CHEM 111_City Community College', 'CHEM 1210_State University', 'direct', 'Laboratory component included', 'Dr. Davis'),
            ('PHYS 101_City Community College', 'PHYS 2210_State University', 'conditional', 'Requires additional calculus preparation', 'Dr. Wilson')
        ]
        
        for from_key, to_key, eq_type, notes, approved_by in equivalencies_data:
            from_course = course_refs[from_key]
            to_course = course_refs[to_key]
            
            equivalency = Equivalency(
                from_course_id=from_course.id,
                to_course_id=to_course.id,
                equivalency_type=eq_type,
                notes=notes,
                approved_by=approved_by
            )
            db.session.add(equivalency)
        
        db.session.commit()
        print(f"✅ Created {len(equivalencies_data)} course equivalencies")
        
        
        print("\n🎉 Database initialization complete!")
        print("\n📊 Summary:")
        print(f"   • {Course.query.count()} courses")
        print(f"   • {Program.query.count()} program")
        print(f"   • {ProgramRequirement.query.count()} program requirements")
        print(f"   • {Equivalency.query.count()} equivalencies")
        
        print("\n🚀 You can now start the Flask server with:")
        print("   python app.py")
        
        
        print("\n📚 Sample courses created:")
        cc_courses = Course.query.filter_by(institution='City Community College').limit(3).all()
        for course in cc_courses:
            print(f"   • {course.code}: {course.title}")
        
        print("\n🏫 University equivalent courses:")
        univ_courses = Course.query.filter_by(institution='State University').limit(3).all()
        for course in univ_courses:
            print(f"   • {course.code}: {course.title}")

def reset_database():
    """Reset database by dropping all tables and recreating"""
    app = create_app()
    
    with app.app_context():
        print("🗑️  Dropping all tables...")
        db.drop_all()
        print("✅ All tables dropped")
        
        init_database()

if __name__ == '__main__':
    print("🚀 Course Transfer System - Database Initialization")
    print("=" * 50)
    try:
        init_database()
    except Exception as e:
        print(f"❌ Error during initialization: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure you're in the backend directory")
        print("2. Ensure virtual environment is activated")
        print("3. Check that all dependencies are installed: pip install -r requirements.txt")
        print("4. Add PlanCourse class to models/plan.py if missing")
        sys.exit(1)

def init_database():
    """Initialize database with tables and sample data"""
    app = create_app()
    
    with app.app_context():
        print("🏗️  Creating database tables...")
        
        
        db.create_all()
        print("✅ Database tables created successfully")
        
        
        existing_courses = Course.query.count()
        if existing_courses > 0:
            print(f"⚠️  Database already contains {existing_courses} courses")
            print("   Delete course_transfer.db if you want to start fresh")
            return
        
        print("📚 Adding sample courses...")
        
        
        sample_courses = [
            
            {
                'code': 'BIOL 101',
                'title': 'Introduction to Biology',
                'description': 'Fundamental principles of biology including cell structure, genetics, and evolution.',
                'credits': 4,
                'institution': 'City Community College',
                'department': 'Biology'
            },
            {
                'code': 'MATH 151',
                'title': 'Calculus I',
                'description': 'Limits, derivatives, and applications of differential calculus.',
                'credits': 4,
                'institution': 'City Community College',
                'department': 'Mathematics'
            },
            {
                'code': 'ENG 101',
                'title': 'English Composition I',
                'description': 'Introduction to academic writing and critical thinking.',
                'credits': 3,
                'institution': 'City Community College',
                'department': 'English'
            },
            {
                'code': 'HIST 101',
                'title': 'World History I',
                'description': 'Survey of world civilizations from ancient times to 1500.',
                'credits': 3,
                'institution': 'City Community College',
                'department': 'History'
            },
            {
                'code': 'CHEM 111',
                'title': 'General Chemistry I',
                'description': 'Introduction to chemical principles and laboratory techniques.',
                'credits': 4,
                'institution': 'City Community College',
                'department': 'Chemistry'
            },
            {
                'code': 'PHYS 101',
                'title': 'College Physics I',
                'description': 'Introduction to mechanics, heat, and wave motion.',
                'credits': 4,
                'institution': 'City Community College',
                'department': 'Physics'
            },
            
            
            {
                'code': 'BIO 1010',
                'title': 'Principles of Biology',
                'description': 'Comprehensive introduction to biological principles.',
                'credits': 4,
                'institution': 'State University',
                'department': 'Biology'
            },
            {
                'code': 'MATH 1210',
                'title': 'Calculus I',
                'description': 'Differential calculus with applications.',
                'credits': 4,
                'institution': 'State University',
                'department': 'Mathematics'
            },
            {
                'code': 'ENGL 1010',
                'title': 'College Writing',
                'description': 'Academic writing and research methods.',
                'credits': 3,
                'institution': 'State University',
                'department': 'English'
            },
            {
                'code': 'HIST 1700',
                'title': 'World Civilizations',
                'description': 'Survey of global historical developments.',
                'credits': 3,
                'institution': 'State University',
                'department': 'History'
            },
            {
                'code': 'CHEM 1210',
                'title': 'Principles of Chemistry I',
                'description': 'Fundamental chemical concepts and laboratory work.',
                'credits': 4,
                'institution': 'State University',
                'department': 'Chemistry'
            },
            {
                'code': 'PHYS 2210',
                'title': 'Physics for Scientists I',
                'description': 'Calculus-based mechanics and thermodynamics.',
                'credits': 4,
                'institution': 'State University',
                'department': 'Physics'
            }
        ]
        
        
        course_refs = {}
        for course_data in sample_courses:
            course = Course(**course_data)
            db.session.add(course)
            
            key = f"{course_data['code']}_{course_data['institution']}"
            course_refs[key] = course
        
        db.session.commit()
        print(f"✅ Created {len(sample_courses)} sample courses")
        
        print("🎓 Creating sample program...")
        
        
        biology_program = Program(
            name='Biology Major',
            degree_type='BS',
            institution='State University',
            total_credits_required=120,
            description='Bachelor of Science in Biology with emphasis on life sciences and research.'
        )
        db.session.add(biology_program)
        db.session.commit()
        
        
        requirements = [
            {
                'program_id': biology_program.id,
                'category': 'Core Biology',
                'credits_required': 32,
                'description': 'Required biology courses for the major'
            },
            {
                'program_id': biology_program.id,
                'category': 'Mathematics',
                'credits_required': 12,
                'description': 'Calculus and statistics requirements'
            },
            {
                'program_id': biology_program.id,
                'category': 'Chemistry',
                'credits_required': 16,
                'description': 'General and organic chemistry sequences'
            },
            {
                'program_id': biology_program.id,
                'category': 'Physics',
                'credits_required': 8,
                'description': 'Physics for science majors'
            },
            {
                'program_id': biology_program.id,
                'category': 'General Education',
                'credits_required': 40,
                'description': 'Liberal arts and sciences breadth requirements'
            },
            {
                'program_id': biology_program.id,
                'category': 'Electives',
                'credits_required': 12,
                'description': 'Upper-division biology electives'
            }
        ]
        
        for req_data in requirements:
            requirement = ProgramRequirement(**req_data)
            db.session.add(requirement)
        
        db.session.commit()
        print(f"Created program with {len(requirements)} requirements")
        
        print("Creating course equivalencies...")
        
        
        equivalencies_data = [
            ('BIOL 101_City Community College', 'BIO 1010_State University', 'direct', 'Direct transfer equivalency', 'Dr. Smith'),
            ('MATH 151_City Community College', 'MATH 1210_State University', 'direct', 'Same content and credit hours', 'Dr. Johnson'),
            ('ENG 101_City Community College', 'ENGL 1010_State University', 'direct', 'Meets composition requirement', 'Dr. Williams'),
            ('HIST 101_City Community College', 'HIST 1700_State University', 'partial', 'Covers similar content but different time periods', 'Dr. Brown'),
            ('CHEM 111_City Community College', 'CHEM 1210_State University', 'direct', 'Laboratory component included', 'Dr. Davis'),
            ('PHYS 101_City Community College', 'PHYS 2210_State University', 'conditional', 'Requires additional calculus preparation', 'Dr. Wilson')
        ]
        
        for from_key, to_key, eq_type, notes, approved_by in equivalencies_data:
            from_course = course_refs[from_key]
            to_course = course_refs[to_key]
            
            equivalency = Equivalency(
                from_course_id=from_course.id,
                to_course_id=to_course.id,
                equivalency_type=eq_type,
                notes=notes,
                approved_by=approved_by
            )
            db.session.add(equivalency)
        
        db.session.commit()
        print(f"Created {len(equivalencies_data)} course equivalencies")
        
        
        print("\nDatabase initialization complete!")
        print("\nSummary:")
        print(f"   • {Course.query.count()} courses")
        print(f"   • {Program.query.count()} program")
        print(f"   • {ProgramRequirement.query.count()} program requirements")
        print(f"   • {Equivalency.query.count()} equivalencies")
        
        print("\nYou can now start the Flask server with:")
        print("   python app.py")
        
        
        print("\nSample courses created:")
        cc_courses = Course.query.filter_by(institution='City Community College').limit(3).all()
        for course in cc_courses:
            print(f"   • {course.code}: {course.title}")
        
        print("\nUniversity equivalent courses:")
        univ_courses = Course.query.filter_by(institution='State University').limit(3).all()
        for course in univ_courses:
            print(f"   • {course.code}: {course.title}")

def reset_database():
    """Reset database by dropping all tables and recreating"""
    app = create_app()
    
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("All tables dropped")
        
        init_database()

if __name__ == '__main__':
    print("Course Transfer System - Database Initialization")
    print("=" * 50)
    try:
        init_database()
    except Exception as e:
        print(f"Error during initialization: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure you're in the backend directory")
        print("2. Ensure virtual environment is activated")
        print("3. Check that all dependencies are installed: pip install -r requirements.txt")
        sys.exit(1)