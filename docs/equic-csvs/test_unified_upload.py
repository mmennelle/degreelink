"""
Test unified CSV upload for 92525 files.

This script tests the new unified CSV format by:
1. Uploading courses from both institutions
2. Uploading equivalencies
3. Uploading unified program requirements (which includes constraints)
4. Verifying constraints were created correctly
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_upload(file_path, endpoint, file_field='file'):
    """Upload a CSV file to the specified endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        with open(file_path, 'rb') as f:
            files = {file_field: f}
            response = requests.post(url, files=files)
            
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {endpoint} - Success")
            print(f"   Response: {json.dumps(result, indent=2)}")
            return True, result
        else:
            print(f"❌ {endpoint} - Failed (Status: {response.status_code})")
            print(f"   Error: {response.text}")
            return False, None
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to backend at {BASE_URL}")
        print("   Make sure the Flask backend is running (python app.py)")
        return False, None
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return False, None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, None

def get_constraints(program_name):
    """Retrieve constraints for a program"""
    url = f"{BASE_URL}/programs"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            programs = response.json().get('programs', [])
            for prog in programs:
                if prog['name'] == program_name:
                    # Get full program details including constraints
                    detail_url = f"{BASE_URL}/programs/{prog['id']}/requirements"
                    detail_response = requests.get(detail_url)
                    if detail_response.status_code == 200:
                        return detail_response.json()
            return None
    except Exception as e:
        print(f"Error getting constraints: {e}")
        return None

def main():
    print("=" * 70)
    print("Testing Unified CSV Upload - 92525 Files")
    print("=" * 70)
    
    # Step 1: Upload DCC courses
    print("\n1. Uploading DCC courses...")
    success, result = test_upload(
        'Dcc_courses_92525_updated.csv',
        '/upload/courses'
    )
    if success:
        print(f"   Created: {result.get('courses_created', 0)} courses")
        print(f"   Updated: {result.get('courses_updated', 0)} courses")
    
    # Step 2: Upload UNO courses
    print("\n2. Uploading UNO courses...")
    success, result = test_upload(
        'Uno_courses_92525_updated.csv',
        '/upload/courses'
    )
    if success:
        print(f"   Created: {result.get('courses_created', 0)} courses")
        print(f"   Updated: {result.get('courses_updated', 0)} courses")
    
    # Step 3: Upload equivalencies
    print("\n3. Uploading course equivalencies...")
    success, result = test_upload(
        'uno-dcc-equivs-92525.csv',
        '/upload/equivalencies'
    )
    if success:
        print(f"   Created: {result.get('equivalencies_created', 0)} equivalencies")
    
    # Step 4: Upload DCC program requirements (unified format)
    print("\n4. Uploading DCC Associate program requirements (unified format)...")
    success, result = test_upload(
        'current_dcc_prog-reqs_associate_92525_unified.csv',
        '/upload/requirements'
    )
    if success:
        print(f"   Programs: {result.get('programs_created', 0)} created")
        print(f"   Requirements: {result.get('requirements_created', 0)} created")
        print(f"   Groups: {result.get('groups_created', 0)} created")
        print(f"   Options: {result.get('options_created', 0)} created")
        print(f"   Constraints: {result.get('constraints_created', 0)} created")
        if result.get('errors'):
            print(f"   ⚠️  Errors: {len(result['errors'])}")
            for err in result['errors'][:5]:  # Show first 5 errors
                print(f"      - {err}")
    
    # Step 5: Upload UNO program requirements (unified format)
    print("\n5. Uploading UNO Bachelor's program requirements (unified format)...")
    success, result = test_upload(
        'target_uno_prog-reqs_bachelors_92525_unified.csv',
        '/upload/requirements'
    )
    if success:
        print(f"   Programs: {result.get('programs_created', 0)} created")
        print(f"   Requirements: {result.get('requirements_created', 0)} created")
        print(f"   Groups: {result.get('groups_created', 0)} created")
        print(f"   Options: {result.get('options_created', 0)} created")
        print(f"   Constraints: {result.get('constraints_created', 0)} created ⭐")
        if result.get('errors'):
            print(f"   ⚠️  Errors: {len(result['errors'])}")
            for err in result['errors'][:5]:
                print(f"      - {err}")
    
    # Step 6: Verify constraints were created
    print("\n6. Verifying constraints for Biology B.S...")
    constraints = get_constraints("Biology B.S")
    if constraints:
        print("   ✅ Program found with requirements")
        # Count constraints in requirements
        constraint_count = 0
        for req in constraints.get('requirements', []):
            if req.get('constraints'):
                constraint_count += len(req['constraints'])
                print(f"   Category '{req['category']}' has {len(req['constraints'])} constraints")
        
        if constraint_count > 0:
            print(f"\n   🎉 Total constraints found: {constraint_count}")
        else:
            print("   ⚠️  No constraints found in requirements")
    else:
        print("   ⚠️  Could not retrieve program details")
    
    print("\n" + "=" * 70)
    print("Test Complete!")
    print("=" * 70)

if __name__ == '__main__':
    main()
