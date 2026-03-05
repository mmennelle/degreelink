#!/usr/bin/env python3
"""Quick diagnostic: print progress summary for a plan."""
import json, sys, urllib.request

plan_id = sys.argv[1] if len(sys.argv) > 1 else '52'
plan_code = sys.argv[2] if len(sys.argv) > 2 else '94MRZGK5'

# Get plan details
url = f'http://127.0.0.1:5000/api/plans/{plan_id}'
req = urllib.request.Request(url, headers={'X-Plan-Code': plan_code})
resp = urllib.request.urlopen(req)
plan = json.loads(resp.read())

print('=== PLAN COURSES ===')
for c in plan['courses']:
    code = c['course']['code'] if c.get('course') else '?'
    inst = c['course']['institution'][:20] if c.get('course') else '?'
    print(f'  pc={c["id"]} {code:15s} cat={str(c["requirement_category"]):30s} status={c["status"]:10s} inst={inst}')

# Get progress
url2 = f'http://127.0.0.1:5000/api/plans/{plan_id}/progress'
req2 = urllib.request.Request(url2, headers={'X-Plan-Code': plan_code})
resp2 = urllib.request.urlopen(req2)
d = json.loads(resp2.read())

for label, key in [('CURRENT', 'current'), ('TRANSFER', 'transfer')]:
    section = d[key]
    inst = section.get('institution', '?')
    print(f'\n=== {label} ({inst}) ===')
    print(f'  Overall: {section["percent"]:.1f}%')
    print(f'  Credits: {section["total_credits_earned"]}/{section["total_credits_required"]}')
    for r in section['requirements']:
        names = [c['code'] for c in r['courses']]
        print(f'  {r["name"]:35s} {r["completedCredits"]:2d}/{r["totalCredits"]:2d} [{r["status"]:4s}] -> {names}')
