# backend/init_db.py
"""
Database initialization script for Course Transfer System
Run this from the backend directory to set up the database with sample data
"""

from app import create_app
from models import db, Course, Program, ProgramRequirement, Equivalency
from datetime import datetime

def init_database():
    """Initialize database with tables and sample data"""
    app = create_app()
    
    with app.app_context():
        print("🏗️  Creating database tables...")
        
        # Create all tables
        db.create_all()
        print("✅ Database tables created successfully")
        
        # Check if data already exists
        existing_courses = Course.query.count()
        if existing_courses > 0:
            print(f"⚠️  Database already contains {existing_courses} courses")
            print("   Delete course_transfer.db if you want to start fresh")
            return
        
        print("📚 Adding sample courses...")
        
        # Add sample institutions and courses
        sample_courses = [
            # Community College Courses
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
            
            # University Courses
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
        
        # Create courses
        course_objects = {}
        for course_data in sample_courses:
            course = Course(**course_data)
            db.session.add(course)
            course_objects[f"{course_data['code']}_{course_data['institution']}"] = course
        
        db.session.commit()
        print(f"✅ Created {len(sample_courses)} sample courses")
        
        print("🎓 Creating sample program...")
        
        # Create sample program
        biology_program = Program(
            name='Biology Major',
            degree_type='BS',
            institution='State University',
            total_credits_required=120,
            description='Bachelor of Science in Biology with emphasis on life sciences and research.'
        )
        db.session.add(biology_program)
        db.session.commit()
        
        # Add program requirements
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
        
        # Create sample equivalencies
        equivalencies_data = [
            # Biology equivalency
            {
                'from_course': 'BIOL 101_City Community College',
                'to_course': 'BIO 1010_State University',
                'equivalency_type': 'direct',
                'notes': 'Direct transfer equivalency',
                'approved_by': 'Dr. Smith'
            },
            # Math equivalency
            {
                'from_course': 'MATH 151_City Community College',
                'to_course': 'MATH 1210_State University',
                'equivalency_type': 'direct',
                'notes': 'Same content and credit hours',
                'approved_by': 'Dr. Johnson'
            },
            # English equivalency
            {
                'from_course': 'ENG 101_City Community College',
                'to_course': 'ENGL 1010_State University',
                'equivalency_type': 'direct',
                'notes': 'Meets composition requirement',
                'approved_by': 'Dr. Williams'
            },
            # History equivalency
            {
                'from_course': 'HIST 101_City Community College',
                'to_course': 'HIST 1700_State University',
                'equivalency_type': 'partial',
                'notes': 'Covers similar content but different time periods',
                'approved_by': 'Dr. Brown'
            },
            # Chemistry equivalency
            {
                'from_course': 'CHEM 111_City Community College',
                'to_course': 'CHEM 1210_State University',
                'equivalency_type': 'direct',
                'notes': 'Laboratory component included',
                'approved_by': 'Dr. Davis'
            },
            # Physics equivalency
            {
                'from_course': 'PHYS 101_City Community College',
                'to_course': 'PHYS 2210_State University',
                'equivalency_type': 'conditional',
                'notes': 'Requires additional calculus preparation',
                'approved_by': 'Dr. Wilson'
            }
        ]
        
        for equiv_data in equivalencies_data:
            from_course = course_objects[equiv_data['from_course']]
            to_course = course_objects[equiv_data['to_course']]
            
            equivalency = Equivalency(
                from_course_id=from_course.id,
                to_course_id=to_course.id,
                equivalency_type=equiv_data['equivalency_type'],
                notes=equiv_data['notes'],
                approved_by=equiv_data['approved_by']
            )
            db.session.add(equivalency)
        
        db.session.commit()
        print(f"✅ Created {len(equivalencies_data)} course equivalencies")
        
        # Print summary
        print("\n🎉 Database initialization complete!")
        print("\n📊 Summary:")
        print(f"   • {Course.query.count()} courses")
        print(f"   • {Program.query.count()} program")
        print(f"   • {ProgramRequirement.query.count()} program requirements")
        print(f"   • {Equivalency.query.count()} equivalencies")
        
        print("\n🚀 You can now start the Flask server with:")
        print("   python app.py")
        
        # Show sample courses
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
    init_database()