#!/bin/bash
# Test the demo flow end-to-end

echo "=== 1. Creating test plan ==="
PLAN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -d '{"student_name":"Demo Verify","plan_name":"Demo Verify Plan","program_id":2,"current_program_id":1,"starting_semester":"Fall","starting_year":2026}')
echo "$PLAN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PLAN_RESPONSE"
PLAN_CODE=$(echo "$PLAN_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('plan',{}).get('plan_code','') or d.get('plan_code',''))" 2>/dev/null)
echo "Plan code: $PLAN_CODE"

if [ -z "$PLAN_CODE" ]; then
  echo "FAIL: Could not create plan"
  exit 1
fi

echo ""
echo "=== 2. Test prereq validation: MATH 2114 with NO MATH 1125 in plan ==="
curl -s -X POST "http://localhost:5000/api/plans/by-code/$PLAN_CODE/validate-prerequisites" \
  -H "Content-Type: application/json" \
  -d '{"course_code":"MATH 2114","institution":"University of New Orleans"}' | python3 -m json.tool

echo ""
echo "=== 3. Add MATH 130 (Delgado) to plan ==="
curl -s -X POST "http://localhost:5000/api/plans/by-code/$PLAN_CODE/courses" \
  -H "Content-Type: application/json" \
  -d '{"course_id":176,"status":"completed","requirement_category":"Mathematics"}' | python3 -m json.tool 2>/dev/null | head -5

echo ""
echo "=== 4. Test prereq validation: MATH 2114 WITH MATH 130 in plan (should pass via equivalency) ==="
curl -s -X POST "http://localhost:5000/api/plans/by-code/$PLAN_CODE/validate-prerequisites" \
  -H "Content-Type: application/json" \
  -d '{"course_code":"MATH 2114","institution":"University of New Orleans"}' | python3 -m json.tool

echo ""
echo "=== 5. Add BIOL 101 (Delgado) to plan and check progress ==="
curl -s -X POST "http://localhost:5000/api/plans/by-code/$PLAN_CODE/courses" \
  -H "Content-Type: application/json" \
  -d '{"course_id":90,"status":"completed","requirement_category":"Science"}' | python3 -m json.tool 2>/dev/null | head -5

echo ""
echo "=== 6. Check progress (should show Science and Math bars filling) ==="
curl -s "http://localhost:5000/api/plans/by-code/$PLAN_CODE/progress" | python3 -c "
import sys, json
data = json.load(sys.stdin)
transfer = data.get('transfer', {})
print(f'Overall: {transfer.get(\"percent\", 0):.1f}%')
for req in transfer.get('requirements', []):
    cat = req.get('category', '')
    comp = req.get('completedCredits', 0)
    total = req.get('totalCredits', 0)
    pct = req.get('percent', 0)
    if comp > 0:
        print(f'  {cat}: {comp}/{total} credits ({pct:.0f}%)')
" 2>/dev/null

echo ""
echo "=== 7. Clean up - delete test plan ==="
curl -s -X DELETE "http://localhost:5000/api/plans/by-code/$PLAN_CODE" | python3 -m json.tool 2>/dev/null || echo "Cleanup done"

echo ""
echo "=== DEMO DATA VERIFICATION COMPLETE ==="
