#!/usr/bin/env python3
"""
Quick script to add initial advisor email to whitelist.
Run this to bootstrap the advisor authentication system.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db
from models.advisor_auth import AdvisorAuth

def add_initial_advisor():
    """Add mmennell@uno.edu to the advisor whitelist"""
    app = create_app()
    
    with app.app_context():
        # Check if already exists
        existing = AdvisorAuth.find_by_email('mmennell@uno.edu')
        
        if existing:
            print("✅ mmennell@uno.edu is already in the whitelist")
            return
        
        # Create new advisor
        advisor = AdvisorAuth(
            email='mmennell@uno.edu',
            added_by='system_initialization'
        )
        
        try:
            db.session.add(advisor)
            db.session.commit()
            print("✅ Successfully added mmennell@uno.edu to advisor whitelist")
            print("   You can now request an access code from the Settings menu")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error adding advisor: {e}")
            return False
        
        return True

if __name__ == '__main__':
    print("🔐 Adding initial advisor to whitelist...")
    add_initial_advisor()
