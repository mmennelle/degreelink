# routes/api_routes.py
from flask import Flask
from controllers.institution_controller import InstitutionController
from controllers.department_controller import DepartmentController
from controllers.course_controller import CourseController
from controllers.transfer_plan_controller import TransferPlanController
from controllers.import_controller import ImportController

def register_routes(app: Flask):
    """Register all API routes"""
    
    # Institution routes
    @app.route('/api/institutions', methods=['GET'])
    def get_institutions():
        controller = InstitutionController()
        return controller.get_all_institutions()
    
    @app.route('/api/institutions/<int:institution_id>', methods=['GET'])
    def get_institution(institution_id):
        controller = InstitutionController()
        return controller.get_institution(institution_id)
    
    @app.route('/api/institutions', methods=['POST'])
    def create_institution():
        controller = InstitutionController()
        return controller.create_institution()
    
    @app.route('/api/institutions/<int:institution_id>', methods=['PUT'])
    def update_institution(institution_id):
        controller = InstitutionController()
        return controller.update_institution(institution_id)
    
    @app.route('/api/institutions/<int:institution_id>', methods=['DELETE'])
    def delete_institution(institution_id):
        controller = InstitutionController()
        return controller.delete_institution(institution_id)
    
    # Department routes
    @app.route('/api/departments', methods=['GET'])
    def get_departments():
        from flask import request
        institution_id = request.args.get('institution_id', type=int)
        if not institution_id:
            return {'error': 'institution_id parameter is required'}, 400
        
        controller = DepartmentController()
        return controller.get_departments_by_institution(institution_id)
    
    @app.route('/api/departments/<int:department_id>', methods=['GET'])
    def get_department(department_id):
        controller = DepartmentController()
        return controller.get_department(department_id)
    
    @app.route('/api/departments', methods=['POST'])
    def create_department():
        controller = DepartmentController()
        return controller.create_department()
    
    # Course routes
    @app.route('/api/courses', methods=['GET'])
    def get_courses():
        from flask import request
        department_id = request.args.get('department_id', type=int)
        if not department_id:
            return {'error': 'department_id parameter is required'}, 400
        
        controller = CourseController()
        return controller.get_courses_by_department(department_id)
    
    @app.route('/api/courses/<int:course_id>', methods=['GET'])
    def get_course(course_id):
        controller = CourseController()
        return controller.get_course(course_id)
    
    @app.route('/api/courses/search', methods=['GET'])
    def search_courses():
        controller = CourseController()
        return controller.search_courses()
    
    @app.route('/api/courses', methods=['POST'])
    def create_course():
        controller = CourseController()
        return controller.create_course()
    
    @app.route('/api/equivalents', methods=['GET'])
    def get_equivalents():
        from flask import request
        course_id = request.args.get('course_id', type=int)
        if not course_id:
            return {'error': 'course_id parameter is required'}, 400
        
        controller = CourseController()
        return controller.get_course_equivalents(course_id)
    
    # Transfer Plan routes
    @app.route('/api/create-plan', methods=['POST'])
    def create_plan():
        controller = TransferPlanController()
        return controller.create_plan()
    
    @app.route('/api/get-plan/<plan_code>', methods=['GET'])
    def get_plan(plan_code):
        controller = TransferPlanController()
        return controller.get_plan(plan_code)
    
    @app.route('/api/update-plan/<plan_code>', methods=['PUT'])
    def update_plan(plan_code):
        controller = TransferPlanController()
        return controller.update_plan(plan_code)
    
    @app.route('/api/delete-plan/<plan_code>', methods=['DELETE'])
    def delete_plan(plan_code):
        controller = TransferPlanController()
        return controller.delete_plan(plan_code)
    
    @app.route('/api/search-equivalents', methods=['POST'])
    def search_equivalents():
        controller = TransferPlanController()
        return controller.search_equivalents_bulk()
    
    # Import routes
    @app.route('/api/import', methods=['POST'])
    def import_csv():
        controller = ImportController()
        return controller.import_csv()
    
    @app.route('/api/validate-csv', methods=['POST'])
    def validate_csv():
        controller = ImportController()
        return controller.validate_csv()
