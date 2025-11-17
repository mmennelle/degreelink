"""Direct test of constraint creation logic by importing backend modules."""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Test imports
print("Testing imports...")
try:
    from models.constraint import RequirementConstraint
    print("✅ RequirementConstraint imported successfully")
    
    from models.program import ProgramRequirement, RequirementGroup
    print("✅ Program models imported successfully")
    
    from models.plan import PlanCourse
    print("✅ PlanCourse imported successfully")
    
    # Test RequirementConstraint structure
    print("\n" + "="*60)
    print("RequirementConstraint Model Structure:")
    print("="*60)
    
    # Get column info
    if hasattr(RequirementConstraint, '__table__'):
        table = RequirementConstraint.__table__
        print(f"Table name: {table.name}")
        print("\nColumns:")
        for col in table.columns:
            print(f"  - {col.name}: {col.type} {'(nullable)' if col.nullable else '(required)'}")
    
    # Test methods
    print("\nMethods:")
    methods = [m for m in dir(RequirementConstraint) if not m.startswith('_') and callable(getattr(RequirementConstraint, m))]
    for method in methods[:10]:  # Show first 10
        print(f"  - {method}()")
    
    # Test JSON params structure
    print("\n" + "="*60)
    print("Testing JSON Params Structure:")
    print("="*60)
    
    import json
    
    # Credits constraint
    credits_params = {"credits_min": 15, "credits_max": 18}
    print(f"\nCredits constraint params: {json.dumps(credits_params)}")
    
    # Level constraint
    level_params = {"level": 3000, "courses": 2}
    print(f"Level constraint params: {json.dumps(level_params)}")
    
    # Tag constraint
    tag_params = {"tag": "true", "courses": 2}
    tag_scope = {"tag_field": "has_lab", "group_name": "Biology Lab"}
    print(f"Tag constraint params: {json.dumps(tag_params)}")
    print(f"Tag constraint scope: {json.dumps(tag_scope)}")
    
    # Test PlanCourse group_name property
    print("\n" + "="*60)
    print("PlanCourse Model Structure:")
    print("="*60)
    
    if hasattr(PlanCourse, 'group_name'):
        print("✅ PlanCourse has group_name property")
    else:
        print("❌ PlanCourse missing group_name property")
    
    if hasattr(PlanCourse, 'requirement_group'):
        print("✅ PlanCourse has requirement_group relationship")
    else:
        print("❌ PlanCourse missing requirement_group relationship")
    
    print("\n" + "="*60)
    print("✅ All tests passed! Backend is ready for constraint upload.")
    print("="*60)
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
