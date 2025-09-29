# Updated app.py with session security

from flask import Flask, jsonify, session, request
from flask_cors import CORS
from models import init_app
from flask_migrate import Migrate
from routes import register_routes
from dotenv import load_dotenv
import os
from datetime import timedelta

def create_app(config_name='default'):
    # Load .env from current directory (backend/) first
    load_dotenv()
    # If ADMIN_API_TOKEN still missing, attempt to load parent project-level .env as fallback
    if not os.environ.get('ADMIN_API_TOKEN'):
        parent_env = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
        if os.path.exists(parent_env):
            load_dotenv(parent_env, override=False)
            if os.environ.get('ADMIN_API_TOKEN'):
                print("[app] Loaded ADMIN_API_TOKEN from parent .env fallback")
    app = Flask(__name__)
    
    # Security configurations
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///course_transfer.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  
    
    # Session security
    app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'  # HTTPS only in production
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent XSS
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)  # 1 hour session timeout
    
    # CORS with credentials support for sessions - UPDATED
    CORS(app,
         supports_credentials=True,
         origins=[
             'http://localhost:3000',
             'http://localhost:5173',
             'http://127.0.0.1:3000',
             'http://127.0.0.1:5173'
         ],
         allow_headers=['Content-Type', 'Authorization', 'X-Admin-Token'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    )
    
    db = init_app(app)
    # Initialize migrations (alembic) support
    Migrate(app, db)
    register_routes(app)
    
    # Security headers
    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Only add HSTS in production with HTTPS
        if os.environ.get('FLASK_ENV') == 'production':
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response
    
    # --- Standard error helper -------------------------------------------------
    def error_response(message, status=400, code=None, details=None):
        payload = {'error': {'message': message}}
        if code:
            payload['error']['code'] = code
        if details is not None:
            payload['error']['details'] = details
        return jsonify(payload), status

    app.error_response = error_response  # expose for blueprints if imported

    # Error handlers with security considerations
    @app.errorhandler(404)
    def not_found(error):
        return error_response('Resource not found', 404, code='not_found')
    
    @app.errorhandler(403)
    def forbidden(error):
        return error_response('Access denied', 403, code='forbidden')
    
    @app.errorhandler(429)
    def too_many_requests(error):
        return error_response('Too many requests. Please try again later.', 429, code='rate_limited')
    
    @app.errorhandler(500)
    def internal_error(error):
        # Don't leak internal error details
        return error_response('Internal server error', 500, code='internal')
    
    @app.errorhandler(413)
    def too_large(error):
        return error_response('File too large', 413, code='payload_too_large')
    
    # Health check
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Course Transfer API is running'})

    # (Removed debug endpoint after resolution of token issue)
    
    # Security info endpoint
    @app.route('/api/security/info')
    def security_info():
        return jsonify({
            'message': 'This system protects student privacy through secure plan codes',
            'features': [
                'Plan codes required for access',
                'Session-based temporary access',
                'Rate limiting on code attempts',
                'No bulk plan browsing',
                'Secure session management'
            ],
            'session_timeout': '1 hour',
            'note': 'Keep your plan codes secure and private'
        })

    # Lightweight debug endpoint (guarded) – only if ADMIN_DEBUG=1 and not production
    if os.environ.get('ADMIN_DEBUG') == '1' and os.environ.get('FLASK_ENV') != 'production':
        @app.route('/api/debug/admin-token-status')
        def debug_admin_token_status():
            token = os.environ.get('ADMIN_API_TOKEN')
            provided = request.headers.get('X-Admin-Token')
            return jsonify({
                'configured': bool(token),
                'header_present': provided is not None,
                'match': bool(token and provided and token == provided)
            })
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

app = create_app()

if __name__ == '__main__':
    
    # Development vs Production settings
    if os.environ.get('FLASK_ENV') == 'production':
        # Production: Use a proper WSGI server like Gunicorn
        print("Warning: Use a production WSGI server for production deployment")
        app.run(debug=False, host='0.0.0.0', port=5000)
    else:
        # Development
        print("🔒 Starting in DEVELOPMENT mode with security features")
        print("⚠️ Remember to:")
        print("   • Use HTTPS in production")
        print("   • Set proper SECRET_KEY in production")
        print("   • Configure secure session storage")
        app.run(debug=True, host='127.0.0.1', port=5000)