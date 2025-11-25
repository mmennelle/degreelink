"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

import pytest
from models import init_app, db
from models.course import Course
from models.plan import Plan
from flask import Flask

@pytest.fixture(scope="module")
def app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    init_app(app)
    with app.app_context():
        db.create_all()
    yield app

@pytest.fixture()
def session(app):
    with app.app_context():
        yield db.session
        db.session.rollback()

def test_course_normalization(session):
    c = Course(code='BiOl104', title='Intro Biology', credits=3, institution='TestU', department='Biology')
    session.add(c)
    session.commit()
    assert c.subject_code == 'BIOL'
    assert c.course_number == '104'
    assert c.code == 'BIOL 104'

def test_plan_code_uniqueness(session):
    p1 = Plan(student_name='A', student_email='a@example.com', program_id=1, plan_name='Plan A')
    p2 = Plan(student_name='B', student_email='b@example.com', program_id=1, plan_name='Plan B')
    session.add_all([p1, p2])
    session.commit()
    assert p1.plan_code != p2.plan_code
    assert len(p1.plan_code) == 8
    assert len(p2.plan_code) == 8
