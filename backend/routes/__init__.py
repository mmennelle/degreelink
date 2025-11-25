"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

def register_routes(app):
    print("Register_routes called")
    
    try:
        from . import courses
        app.register_blueprint(courses.bp)
        print("Courses blueprint registered")
    except Exception as e:
        print(f"Failed to import courses: {e}")
    
    try:
        from . import equivalencies
        app.register_blueprint(equivalencies.bp)
        print("Equivalencies blueprint registered")
    except ImportError as e:
        print(f"Failed to import equivalencies: {e}")
    
    try:
        from . import plans
        app.register_blueprint(plans.bp)
        print("Plans blueprint registered")
    except ImportError as e:
        print(f"Failed to import plans: {e}")
    
    try:
        from . import upload
        app.register_blueprint(upload.bp)
        print("Upload blueprint registered")
    except ImportError as e:
        print(f"Failed to import upload: {e}")
    
    try:
        from . import programs
        app.register_blueprint(programs.bp)
        print("Programs blueprint registered")
    except ImportError as e:
        print(f"Failed to import programs: {e}")

    # Register QR route
    try:
        from . import qr
        app.register_blueprint(qr.bp)
        print("QR blueprint registered")
    except ImportError as e:
        print(f"Failed to import qr: {e}")
    
    # Register Prerequisites route
    try:
        from . import prerequisites
        app.register_blueprint(prerequisites.bp)
        print("Prerequisites blueprint registered")
    except ImportError as e:
        print(f"Failed to import prerequisites: {e}")
    
    # Register Advisor Auth route
    try:
        from . import advisor_auth
        app.register_blueprint(advisor_auth.bp)
        print("Advisor Auth blueprint registered")
    except ImportError as e:
        print(f"Failed to import advisor_auth: {e}")