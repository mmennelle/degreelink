import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///course_transfer.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  
    # Feature flags
    PROGRESS_USE_GROUPED_EVALUATION = (os.environ.get('PROGRESS_USE_GROUPED_EVALUATION', 'false').lower() in ('1', 'true', 'yes'))
    AUTO_ASSIGN_REQUIREMENT_GROUPS = (os.environ.get('AUTO_ASSIGN_REQUIREMENT_GROUPS', 'false').lower() in ('1', 'true', 'yes'))

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