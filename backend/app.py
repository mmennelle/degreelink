# Updated app.py with session security

from flask import Flask, jsonify, session
from flask_cors import CORS
from models import init_app
from routes import register_routes
import os
from datetime import timedelta

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Security configurations
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///course_transfer.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  
    
    # Session security
    app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'  # HTTPS only in production
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent XSS
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)  # 1 hour session timeout
    
    # CORS with credentials support for sessions
    CORS(app, supports_credentials=True, origins=[
        'http://localhost:3000',  # Development frontend
        'http://localhost:5173',  # Vite dev server
        'https://yourdomain.com'  # Production domain (update this)
    ])
    
    db = init_app(app)
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
    
    # Error handlers with security considerations
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Access denied'}), 403
    
    @app.errorhandler(429)
    def too_many_requests(error):
        return jsonify({'error': 'Too many requests. Please try again later.'}), 429
    
    @app.errorhandler(500)
    def internal_error(error):
        # Don't leak internal error details
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(413)
    def too_large(error):
        return jsonify({'error': 'File too large'}), 413
    
    # Health check
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Course Transfer API is running'})
    
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
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    
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