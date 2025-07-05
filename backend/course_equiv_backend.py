# app.py - Application Factory Pattern
from flask import Flask
from flask_cors import CORS
from config.settings import Config
from database.connection import init_database
from routes.api_routes import register_routes

def create_app(config_class=Config):
    """Application factory function"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app)
    
    # Initialize database
    init_database()
    
    # Register routes
    register_routes(app)
    
    return app

# Main application runner
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)

# config/settings.py
import os
from datetime import timedelta

class Config:
    """Application configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///database.db'
    PLAN_EXPIRY_DAYS = int(os.environ.get('PLAN_EXPIRY_DAYS', 365))
    MAX_UPLOAD_SIZE = int(os.environ.get('MAX_UPLOAD_SIZE', 16 * 1024 * 1024))  # 16MB
    ALLOWED_EXTENSIONS = {'csv'}

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DATABASE_URL = 'sqlite:///:memory:'

# database/connection.py
import sqlite3
from typing import Any
from config.settings import Config

def get_db_connection() -> sqlite3.Connection:
    """Get database connection with proper configuration"""
    conn = sqlite3.connect('database.db', timeout=30)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize database with all required tables"""
    from models.institution import Institution
    from models.department import Department
    from models.course import Course
    from models.equivalency import CourseEquivalency
    from models.transfer_plan import TransferPlan
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tables in order of dependencies
    cursor.execute(Institution.create_table_sql())
    cursor.execute(Department.create_table_sql())
    cursor.execute(Course.create_table_sql())
    cursor.execute(CourseEquivalency.create_table_sql())
    cursor.execute(TransferPlan.create_table_sql())
    
    conn.commit()
    conn.close()