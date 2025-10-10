#!/usr/bin/env python3
"""
Migration script to add plan_code column to existing plans
Run this after updating the Plan model
"""

import os
import sys
import secrets
import string

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app
    from models import db
    from models.plan import Plan
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure you're in the backend directory and all dependencies are installed")
    sys.exit(1)

def generate_unique_plan_code(existing_codes):
    """Generate a unique 8-character alphanumeric code"""
    # Use uppercase letters and digits, excluding confusing characters
    alphabet = string.ascii_uppercase + string.digits
    alphabet = alphabet.replace('0', '').replace('O', '').replace('1', '').replace('I', '')
    
    max_attempts = 100
    for _ in range(max_attempts):
        # Generate 8-character code
        code = ''.join(secrets.choice(alphabet) for _ in range(8))
        
        # Check if code already exists
        if code not in existing_codes:
            existing_codes.add(code)
            return code
    
    # Fallback if all attempts fail (highly unlikely)
    raise Exception("Unable to generate unique plan code after multiple attempts")

def migrate_plan_codes():
    """Add plan_code column and generate codes for existing plans"""
    app = create_app()
    
    with app.app_context():
        print("🔄 Starting plan code migration...")
        
        # Check if plan_code column exists
        inspector = db.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('plans')]
        
        if 'plan_code' not in columns:
            print("📝 Adding plan_code column to plans table...")
            
            # Add the column (SQLite-safe approach)
            try:
                with db.engine.connect() as conn:
                    conn.execute(db.text('ALTER TABLE plans ADD COLUMN plan_code VARCHAR(8)'))
                    conn.commit()
                print("✅ Column added successfully")
            except Exception as e:
                print(f"❌ Failed to add column: {e}")
                return False
        else:
            print("✅ plan_code column already exists")
        
        # Generate codes for existing plans without codes
        plans_without_codes = Plan.query.filter(
            (Plan.plan_code == None) | (Plan.plan_code == '')
        ).all()
        
        if not plans_without_codes:
            print("✅ All plans already have codes")
            return True
        
        print(f"🔧 Generating codes for {len(plans_without_codes)} existing plans...")
        
        # Get all existing codes to avoid duplicates
        existing_codes = set()
        plans_with_codes = Plan.query.filter(
            (Plan.plan_code != None) & (Plan.plan_code != '')
        ).all()
        for plan in plans_with_codes:
            existing_codes.add(plan.plan_code)
        
        # Generate codes for plans that don't have them
        updated_count = 0
        for plan in plans_without_codes:
            try:
                new_code = generate_unique_plan_code(existing_codes)
                plan.plan_code = new_code
                updated_count += 1
                print(f"   • Generated code {new_code} for plan: {plan.plan_name}")
            except Exception as e:
                print(f"   ❌ Failed to generate code for plan {plan.id}: {e}")
                return False
        
        # Commit all changes
        try:
            db.session.commit()
            print(f"✅ Successfully generated codes for {updated_count} plans")
            
            # Add unique constraint and index
            try:
                with db.engine.connect() as conn:
                    # Create unique index
                    conn.execute(db.text('CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_plan_code ON plans(plan_code)'))
                    conn.commit()
                print("✅ Added unique index on plan_code column")
            except Exception as e:
                print(f"⚠️ Warning: Could not add unique index: {e}")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to save changes: {e}")
            return False

def verify_migration():
    """Verify that all plans have valid codes"""
    app = create_app()
    
    with app.app_context():
        print("\n🔍 Verifying migration...")
        
        total_plans = Plan.query.count()
        plans_with_codes = Plan.query.filter(
            (Plan.plan_code != None) & (Plan.plan_code != '')
        ).count()
        
        print(f"   • Total plans: {total_plans}")
        print(f"   • Plans with codes: {plans_with_codes}")
        
        if total_plans == plans_with_codes:
            print("✅ Migration successful - all plans have codes")
            
            # Check for duplicate codes
            all_codes = db.session.query(Plan.plan_code).all()
            code_list = [code[0] for code in all_codes if code[0]]
            unique_codes = set(code_list)
            
            if len(code_list) == len(unique_codes):
                print("✅ All plan codes are unique")
            else:
                print(f"❌ Found duplicate codes: {len(code_list) - len(unique_codes)} duplicates")
                return False
            
            # Show some sample codes
            sample_plans = Plan.query.limit(3).all()
            print("\n📋 Sample plan codes:")
            for plan in sample_plans:
                print(f"   • {plan.plan_name}: {plan.plan_code}")
            
            return True
        else:
            print(f"❌ Migration incomplete: {total_plans - plans_with_codes} plans missing codes")
            return False

def rollback_migration():
    """Remove plan_code column (use with caution)"""
    app = create_app()
    
    with app.app_context():
        print("⚠️ Rolling back plan code migration...")
        
        try:
            # SQLite doesn't support DROP COLUMN, so we'd need to recreate the table
            # This is dangerous, so we'll just warn the user
            print("❌ Cannot rollback plan_code column in SQLite")
            print("   To remove the column, you would need to:")
            print("   1. Export all plan data")
            print("   2. Drop and recreate the plans table")
            print("   3. Import the data without plan_code")
            print("   This is not recommended - consider keeping the column")
            
        except Exception as e:
            print(f"❌ Rollback failed: {e}")

if __name__ == '__main__':
    print("🚀 Plan Code Migration Tool")
    print("=" * 40)
    
    if len(sys.argv) > 1 and sys.argv[1] == 'rollback':
        rollback_migration()
    elif len(sys.argv) > 1 and sys.argv[1] == 'verify':
        verify_migration()
    else:
        success = migrate_plan_codes()
        if success:
            verify_migration()
        else:
            print("\n❌ Migration failed. Please check the errors above.")
            sys.exit(1)
    
    print("\n🎉 Migration complete!")
    print("\nNext steps:")
    print("1. Update your frontend to use the new plan code features")
    print("2. Test the new plan code lookup functionality")
    print("3. Consider implementing email notifications with plan codes")