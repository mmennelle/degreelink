"""Test script for uploading unified CSV files to the backend."""
import requests
import json

# Backend URL
BASE_URL = "http://127.0.0.1:5000"

def test_upload_unified_csv(csv_path, program_type):
    """Upload a unified CSV file to the backend."""
    print(f"\n{'='*60}")
    print(f"Testing upload: {csv_path}")
    print(f"Program type: {program_type}")
    print(f"{'='*60}")
    
    url = f"{BASE_URL}/api/upload/program-requirements"
    
    with open(csv_path, 'rb') as f:
        files = {'file': (csv_path.split('\\')[-1], f, 'text/csv')}
        data = {'program_type': program_type}
        
        response = requests.post(url, files=files, data=data)
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success!")
            print(f"   Programs created: {result.get('programs_created', 0)}")
            print(f"   Requirements created: {result.get('requirements_created', 0)}")
            print(f"   Groups created: {result.get('groups_created', 0)}")
            print(f"   Options created: {result.get('options_created', 0)}")
            print(f"   Constraints created: {result.get('constraints_created', 0)}")
            
            if result.get('warnings'):
                print(f"\n⚠️  Warnings:")
                for warning in result['warnings']:
                    print(f"   - {warning}")
            
            if result.get('programs'):
                print(f"\n📋 Programs uploaded:")
                for prog in result['programs']:
                    print(f"   - {prog['name']} ({prog['code']})")
                    print(f"     Total requirements: {prog['total_requirements']}")
            
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False

if __name__ == "__main__":
    # Test DCC unified CSV
    dcc_path = r"docs\equic-csvs\current_dcc_prog-reqs_associate_92525_unified.csv"
    test_upload_unified_csv(dcc_path, "Associate")
    
    # Test UNO unified CSV
    uno_path = r"docs\equic-csvs\target_uno_prog-reqs_bachelors_92525_unified.csv"
    test_upload_unified_csv(uno_path, "Bachelor")
