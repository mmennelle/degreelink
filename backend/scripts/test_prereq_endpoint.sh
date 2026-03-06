#!/bin/bash
# Test the prerequisite validation endpoint
ENGL_1158_ID=$(PGPASSWORD=DeptOfCs psql -U ct_user -h localhost course_transfer -t -A -c "SELECT id FROM courses WHERE code='ENGL 1158' LIMIT 1;")
echo "ENGL 1158 id: $ENGL_1158_ID"

# Test prerequisite validation - should return warnings since ENGL 1157 is not in plan
curl -s -X POST "http://127.0.0.1:5000/api/plans/by-code/94MRZGK5/validate-prerequisites" \
  -H "Content-Type: application/json" \
  -d "{\"course_id\": $ENGL_1158_ID}" | python3 -m json.tool
