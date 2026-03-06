#!/usr/bin/env python3
import json, urllib.request

# Check program 1 (Delgado - current)
resp = urllib.request.urlopen('http://localhost:5000/api/programs/1')
d = json.loads(resp.read())
print(f"Program 1: {d.get('name')} ({d.get('institution')})")
for r in d.get('requirements', []):
    print(f"  id={r['id']} cat={r['category']!r} type={r['requirement_type']} credits={r['credits_required']}")

print()

# Check program 2 (UNO - transfer)
resp = urllib.request.urlopen('http://localhost:5000/api/programs/2')
d = json.loads(resp.read())
print(f"Program 2: {d.get('name')} ({d.get('institution')})")
for r in d.get('requirements', []):
    print(f"  id={r['id']} cat={r['category']!r} type={r['requirement_type']} credits={r['credits_required']}")

print()

# Create a fresh test plan and add a course, then check progress for both bars
import urllib.parse

# Create plan
plan_data = json.dumps({
    "student_name": "Test Student",
    "current_program_id": 1,
    "program_id": 2
}).encode()
req_obj = urllib.request.Request(
    'http://localhost:5000/api/plans',
    data=plan_data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
resp = urllib.request.urlopen(req_obj)
plan = json.loads(resp.read())
plan_code = plan.get('plan_code')
print(f"Created plan: {plan_code}")

# Add MATH 130 (Delgado math course)
add_data = json.dumps({"course_id": 109}).encode()  # MATH 130 id
req_obj = urllib.request.Request(
    f'http://localhost:5000/api/plans/by-code/{plan_code}/courses',
    data=add_data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
resp = urllib.request.urlopen(req_obj)
result = json.loads(resp.read())
print(f"Added course: {result.get('course', {}).get('code')} category={result.get('requirement_category')}")

# Get full plan with progress
resp = urllib.request.urlopen(f'http://localhost:5000/api/plans/by-code/{plan_code}')
full_plan = json.loads(resp.read())
progress = full_plan.get('progress', {})

print("\n=== CURRENT PROGRAM PROGRESS ===")
current = progress.get('current', {})
print(f"Percent: {current.get('percent', 0):.1f}%")
print(f"Credits: {current.get('total_credits_earned', 0)}/{current.get('total_credits_required', 0)}")
for r in current.get('requirements', []):
    cat = r.get('category', '')
    comp = r.get('completedCredits', 0)
    tot = r.get('totalCredits', 0)
    status = r.get('status', '')
    courses = r.get('courses', [])
    print(f"  {cat}: {comp}/{tot} cr status={status} courses={len(courses)}")
    for c in courses:
        print(f"    - {c.get('code')} {c.get('credits')}cr")

print("\n=== TRANSFER PROGRAM PROGRESS ===")
transfer = progress.get('transfer', {})
print(f"Percent: {transfer.get('percent', 0):.1f}%")
print(f"Credits: {transfer.get('total_credits_earned', 0)}/{transfer.get('total_credits_required', 0)}")
for r in transfer.get('requirements', []):
    cat = r.get('category', '')
    comp = r.get('completedCredits', 0)
    tot = r.get('totalCredits', 0)
    status = r.get('status', '')
    courses = r.get('courses', [])
    print(f"  {cat}: {comp}/{tot} cr status={status} courses={len(courses)}")
    for c in courses:
        print(f"    - {c.get('code')} {c.get('credits')}cr")

# Clean up
import subprocess
subprocess.run(['psql', '-U', 'ct_user', '-h', 'localhost', '-d', 'course_transfer',
                '-c', f"DELETE FROM plan_courses WHERE plan_id IN (SELECT id FROM plans WHERE plan_code='{plan_code}'); DELETE FROM plans WHERE plan_code='{plan_code}';"],
               env={'PGPASSWORD': 'DeptOfCs'})
print(f"\nCleaned up plan {plan_code}")
