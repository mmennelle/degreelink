"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

# routes/__init__.py
def register_routes(app):
    """Register all API routes"""
    
    # Basic test routes
    @app.route('/api/test')
    def test():
        return {'message': 'API is working'}
    
    @app.route('/api/institutions')
    def get_institutions():
        from models import Course, Program
        return [
            {'id': 1, 'name': 'Test Institution 1'},
            {'id': 2, 'name': 'Test Institution 2'}
        ]
    
    @app.route('/api/departments')
    def get_departments():
        from flask import request
        institution_id = request.args.get('institution_id')
        return [
            {'id': 1, 'name': 'Test Department 1', 'institution_id': institution_id}
        ]
    
    @app.route('/api/courses')
    def get_courses():
        from flask import request
        department_id = request.args.get('department_id')
        return [
            {'id': 1, 'code': 'TEST1', 'title': 'Test Course 1', 'department_id': department_id}
        ]