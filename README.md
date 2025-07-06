# Backend Tester Usage

## Steps

1. Initialize database: `python init_db.py`
2. Start Flask backend: `python app.py`
3. Run an API tester
   1. use postman or burpsuite ETC
   2. Open `backend-tester.html` in web browser
4. Verify connection test shows green success message
5. Test endpoints in order:
  - Basic Data (institutions, departments, courses)
  - Programs (create, analyze)
  - Transfer Plans (create, retrieve)
  - CSV Import
6. Check JSON responses for expected data structure
7. Some data is uploaded to db on init but you can also add the CSV files in docs/equic-csvs via the import endpoints for more test data

## Quick Test Sequence

1. GET /institutions
2. GET /departments (use institution ID from step 1)
3. GET /courses (use department ID from step 2)
4. POST /programs (create test program)
5. POST /create-plan (create test transfer plan)
6. GET /get-plan/{code} (retrieve plan using code from step 5)