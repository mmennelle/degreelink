from flask import Blueprint

def register_routes(app):
    from . import courses, equivalencies, plans, upload, programs  # Add programs
    
    app.register_blueprint(courses.bp)
    app.register_blueprint(equivalencies.bp)
    app.register_blueprint(plans.bp)
    app.register_blueprint(upload.bp)
    app.register_blueprint(programs.bp) 