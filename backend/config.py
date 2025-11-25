"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://localhost/course_transfer'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  
    # Phase 1 grouped requirements feature flags (enabled by default)
    PROGRESS_USE_GROUPED_EVALUATION = (os.environ.get('PROGRESS_USE_GROUPED_EVALUATION', 'true').lower() in ('1', 'true', 'yes'))
    AUTO_ASSIGN_REQUIREMENT_GROUPS = (os.environ.get('AUTO_ASSIGN_REQUIREMENT_GROUPS', 'true').lower() in ('1', 'true', 'yes'))

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}