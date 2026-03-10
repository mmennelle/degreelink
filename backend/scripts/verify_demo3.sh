#!/bin/bash
PLAN_CODE="M7GCUQSK"

echo "=== Progress from plan details ==="
curl -s "http://localhost:5000/api/plans/by-code/$PLAN_CODE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
progress = data.get('progress', {})
if 'progress_error' in data:
    print(f'ERROR: {data[\"progress_error\"]}')
    sys.exit(1)
transfer = progress.get('transfer', {})
current = progress.get('current', {})
print(f'Transfer progress: {transfer.get(\"percent\", 0):.1f}%')
print(f'  Earned: {transfer.get(\"total_credits_earned\", 0)}/{transfer.get(\"total_credits_required\", 0)}')
for req in transfer.get('requirements', []):
    cat = req.get('category', '')
    comp = req.get('completedCredits', 0)
    total = req.get('totalCredits', 0)
    courses = req.get('courses', [])
    print(f'  {cat}: {comp}/{total} cr [{len(courses)} courses]')
    for c in courses:
        eq_code = c.get('equivalent_code', '')
        eq_info = f' => {eq_code}' if eq_code else ''
        print(f'    - {c.get(\"code\",\"\")} ({c.get(\"credits\",0)}cr, {c.get(\"status\",\"\")}){eq_info}')
print()
print(f'Current progress: {current.get(\"percent\", 0):.1f}%')
print(f'  Earned: {current.get(\"total_credits_earned\", 0)}/{current.get(\"total_credits_required\", 0)}')
" 2>/dev/null
