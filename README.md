# Backend Tester Usage

## Prerequisites
- Flask backend running on localhost:5000
- Any modern web browser

## Steps

1. Initialize database: `python init_db.py`
2. Start Flask backend: `python app.py`
3. Save the HTML file as `backend-tester.html`
4. Open `backend-tester.html` in web browser
5. Verify connection test shows green success message
6. Test endpoints in order:
  - Basic Data (institutions, departments, courses)
  - Programs (create, analyze)
  - Transfer Plans (create, retrieve)
  - CSV Import
7. Check JSON responses for expected data structure
8. YOu can also add the CSV files in docs/equic-csvs via the import endpoints for more test data

## Quick Test Sequence

1. GET /institutions
2. GET /departments (use institution ID from step 1)
3. GET /courses (use department ID from step 2)
4. POST /programs (create test program)
5. POST /create-plan (create test transfer plan)
6. GET /get-plan/{code} (retrieve plan using code from step 5)