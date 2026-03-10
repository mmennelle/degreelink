#!/bin/bash
# Fix verification - use course_id and check raw progress
PLAN_CODE="M7GCUQSK"

echo "=== Check plan courses ==="
curl -s "http://localhost:5000/api/plans/by-code/$PLAN_CODE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
plan = data.get('plan', data)
for c in plan.get('courses', []):
    print(f\"  {c.get('course',{}).get('code','?')} | cat={c.get('requirement_category','?')} | status={c.get('status','?')} | credits={c.get('credits',0)}\")
" 2>/dev/null

echo ""
echo "=== Raw progress (transfer) ==="
curl -s "http://localhost:5000/api/plans/by-code/$PLAN_CODE/progress" | python3 -c "
import sys, json
data = json.load(sys.stdin)
transfer = data.get('transfer', {})
print(f\"Overall: {transfer.get('percent', 0):.1f}%\")
print(f\"Total earned: {transfer.get('total_credits_earned', 0)}/{transfer.get('total_credits_required', 0)}\")
for req in transfer.get('requirements', []):
    cat = req.get('category', '')
    comp = req.get('completedCredits', 0)
    total = req.get('totalCredits', 0)
    pct = req.get('percent', 0)
    courses = req.get('courses', [])
    print(f\"  {cat}: {comp}/{total} credits ({pct:.0f}%) [{len(courses)} courses]\")
" 2>/dev/null

echo ""
echo "=== Test prereq: MATH 2114 (id=2299) with MATH 130 already in plan ==="
curl -s -X POST "http://localhost:5000/api/plans/by-code/$PLAN_CODE/validate-prerequisites" \
  -H "Content-Type: application/json" \
  -d '{"course_id":2299}' | python3 -m json.tool

echo ""
echo "=== Test prereq: ENGL 1158 (id=1323) with NO ENGL in plan ==="
curl -s -X POST "http://localhost:5000/api/plans/by-code/$PLAN_CODE/validate-prerequisites" \
  -H "Content-Type: application/json" \
  -d '{"course_id":1323}' | python3 -m json.tool
