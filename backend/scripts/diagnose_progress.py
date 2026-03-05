#!/usr/bin/env python3
"""
Diagnostic script: trace why courses do/don't fill progress bars.
Run on the server: python scripts/diagnose_progress.py <plan_id>
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from models import init_app, db
from models.course import Course
from models.program import Program, ProgramRequirement, RequirementGroup, GroupCourseOption
from models.plan import Plan, PlanCourse
from models.equivalency import Equivalency
from config import Config

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = Config.SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
init_app(app)

CCN_INSTITUTION = 'Louisiana Board of Regents'

def diagnose(plan_id):
    plan = Plan.query.get(plan_id)
    if not plan:
        print(f"Plan {plan_id} not found")
        return

    print(f"=== Plan: {plan.plan_name} (id={plan.id}) ===")
    print(f"  Current program: {plan.current_program.name if plan.current_program else 'None'} "
          f"(inst: {plan.current_program.institution if plan.current_program else 'N/A'})")
    print(f"  Target program:  {plan.target_program.name if plan.target_program else 'None'} "
          f"(inst: {plan.target_program.institution if plan.target_program else 'N/A'})")
    print()

    target_inst = plan.target_program.institution if plan.target_program else None
    current_inst = plan.current_program.institution if plan.current_program else None

    print(f"=== Plan Courses ({len(plan.courses)}) ===")
    for pc in plan.courses:
        c = pc.course
        if not c:
            print(f"  PlanCourse {pc.id}: NO COURSE OBJECT")
            continue
        print(f"\n  PlanCourse id={pc.id} | course_id={c.id} | {c.code}: {c.title}")
        print(f"    institution={c.institution} | dept={c.department} | subj={c.subject_code}")
        print(f"    credits={pc.credits or c.credits} | status={pc.status} | grade={pc.grade}")
        print(f"    requirement_category={pc.requirement_category}")
        print(f"    requirement_group_id={pc.requirement_group_id}")

        # Find ALL equivalencies for this course
        fwd = Equivalency.query.filter_by(from_course_id=c.id).all()
        rev = Equivalency.query.filter_by(to_course_id=c.id).all()
        
        if fwd:
            print(f"    Forward equivalencies ({len(fwd)}):")
            for eq in fwd:
                to_c = Course.query.get(eq.to_course_id)
                print(f"      → {to_c.code} @ {to_c.institution} (type={eq.equivalency_type})" if to_c else f"      → id={eq.to_course_id} MISSING")
        if rev:
            print(f"    Reverse equivalencies ({len(rev)}):")
            for eq in rev:
                from_c = Course.query.get(eq.from_course_id)
                print(f"      ← {from_c.code} @ {from_c.institution} (type={eq.equivalency_type})" if from_c else f"      ← id={eq.from_course_id} MISSING")

        # CCN chain check
        ccn_fwd = [eq for eq in fwd if eq.equivalency_type in ('articulation', 'subject_area')]
        if ccn_fwd:
            print(f"    CCN chain:")
            for eq in ccn_fwd:
                ccn_c = Course.query.get(eq.to_course_id)
                if not ccn_c:
                    continue
                print(f"      {c.code} → CCN {ccn_c.code} ({ccn_c.institution})")
                # Find what maps to same CCN at target and current institutions
                for check_inst in [target_inst, current_inst]:
                    if check_inst and check_inst != c.institution:
                        sibling_eqs = Equivalency.query.filter(
                            Equivalency.to_course_id == ccn_c.id,
                            Equivalency.equivalency_type.in_(['articulation', 'subject_area']),
                            Equivalency.from_course_id != c.id
                        ).all()
                        for seq in sibling_eqs:
                            sib = Course.query.get(seq.from_course_id)
                            if sib and sib.institution == check_inst:
                                print(f"        CCN sibling at {check_inst}: {sib.code} (dept={sib.department}, subj={sib.subject_code})")
        
        # Check direct equiv to target/current
        if target_inst and c.institution != target_inst:
            direct = Equivalency.query.join(Course, Equivalency.to_course_id == Course.id).filter(
                Equivalency.from_course_id == c.id,
                Course.institution == target_inst
            ).first()
            if not direct:
                direct = Equivalency.query.join(Course, Equivalency.from_course_id == Course.id).filter(
                    Equivalency.to_course_id == c.id,
                    Course.institution == target_inst
                ).first()
            if direct:
                print(f"    DIRECT equiv to target ({target_inst}): YES")
            else:
                print(f"    DIRECT equiv to target ({target_inst}): NO — relies on CCN chain")

        if current_inst and c.institution != current_inst:
            direct = Equivalency.query.join(Course, Equivalency.to_course_id == Course.id).filter(
                Equivalency.from_course_id == c.id,
                Course.institution == current_inst
            ).first()
            if not direct:
                direct = Equivalency.query.join(Course, Equivalency.from_course_id == Course.id).filter(
                    Equivalency.to_course_id == c.id,
                    Course.institution == current_inst
                ).first()
            if direct:
                print(f"    DIRECT equiv to current ({current_inst}): YES")
            else:
                print(f"    DIRECT equiv to current ({current_inst}): NO — relies on CCN chain")

    # Now check requirements for both programs
    for label, prog in [("CURRENT", plan.current_program), ("TARGET", plan.target_program)]:
        if not prog:
            continue
        print(f"\n\n=== {label} PROGRAM: {prog.name} ({prog.institution}) ===")
        print(f"  Requirements ({len(prog.requirements or [])}):")
        for req in (prog.requirements or []):
            print(f"    [{req.id}] {req.category} | type={req.requirement_type} | credits_req={req.credits_required} | is_current={req.is_current}")
            if req.requirement_type == 'grouped':
                for g in (req.groups or []):
                    opts = [f"{o.course_code}@{o.institution}" for o in (g.course_options or [])]
                    print(f"      Group '{g.group_name}': {', '.join(opts[:5]}{'...' if len(opts) > 5 else ''}")

    # Run calculate_progress and show results
    print("\n\n=== PROGRESS CALCULATION ===")
    result = plan.calculate_progress(view_filter='All Courses')
    for side in ['current', 'transfer']:
        data = result.get(side, {})
        print(f"\n--- {side.upper()} ({data.get('institution', '?')}) ---")
        print(f"  Percent: {data.get('percent', 0):.1f}%")
        print(f"  Total earned: {data.get('total_credits_earned', 0)} / {data.get('total_credits_required', 0)}")
        for r in data.get('requirements', []):
            courses_str = ", ".join(f"{c.get('code','?')}({c.get('credits',0)}cr)" for c in r.get('courses', []))
            print(f"  [{r.get('status','?')}] {r.get('category','?')}: {r.get('completedCredits',0)}/{r.get('totalCredits',0)} | courses=[{courses_str}]")


if __name__ == '__main__':
    plan_id = int(sys.argv[1]) if len(sys.argv) > 1 else None
    with app.app_context():
        if plan_id:
            diagnose(plan_id)
        else:
            # List recent plans
            plans = Plan.query.order_by(Plan.created_at.desc()).limit(10).all()
            print("Recent plans:")
            for p in plans:
                print(f"  id={p.id} | {p.plan_name} | code={p.plan_code} | courses={len(p.courses)}")
            print("\nUsage: python scripts/diagnose_progress.py <plan_id>")
