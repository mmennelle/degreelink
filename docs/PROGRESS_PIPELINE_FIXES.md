# Progress Pipeline — Cross-Institution Fix Procedure

**Created:** 2026-03-10  
**Context:** The unified progress pipeline correctly shares a single `calculate_progress()` path for both current and target programs, but three points in the code fail to resolve equivalencies across institutions. These fixes make the existing pipeline consistently institution-aware without structural changes.

---

## Fix 1: Strict Grouped Evaluation — Resolve Equivalencies Before Matching

**Risk:** HIGH  
**Files:** `backend/models/program.py` (~L247), `backend/models/plan.py` (~L346–L455)

### Problem

`RequirementGroup.evaluate_completion()` matches `course.course.code` directly against `GroupCourseOption.course_code`. A Delgado course like `BIOL 104` will never match UNO's `BIOL 1001` even when an equivalency record exists. The legacy (non-strict) path in `plan.py` (~L496–L520) already compensates by resolving equivalencies first — the strict evaluator lacks this step.

### Procedure

1. In `RequirementGroup.evaluate_completion()` (`program.py`), add an optional `equivalency_map` parameter — a dict mapping `course_id → equivalent_course_code` at the target institution.

2. Before the code-matching loop at ~L247, check both the raw `course.code` **and** the equivalent code from the map:
   ```python
   raw_code = course.course.code.upper().replace('-', ' ').strip()
   eq_code = equivalency_map.get(course.course_id, '').upper().replace('-', ' ').strip()
   matched = raw_code in option_codes or (eq_code and eq_code in option_codes)
   ```

3. In `ProgramRequirement.evaluate_completion()` (~L108–L189), pass the equivalency map through from the caller.

4. In `Plan.calculate_progress()` where grouped requirements are evaluated (~L346–L455), build the equivalency map by calling `_get_equivalent_course()` for each plan course once, then pass it into `evaluate_completion()`.

5. **Preserve backward compatibility:** Default `equivalency_map=None` and fall back to the current raw-code-only behavior when not provided, so existing callers are unaffected.

### Validation

- Add a plan course from Institution A that has an equivalency to a grouped-requirement course at Institution B.
- With `PROGRESS_USE_GROUPED_EVALUATION=true` and a status filter active, verify the course counts toward the grouped requirement.
- Verify existing same-institution grouped matching still works identically.

---

## Fix 2: Replace Hardcoded Institution in Transfer Suggestions

**Risk:** HIGH  
**File:** `backend/models/plan.py` (~L1018–L1050, specifically ~L1043)

### Problem

Transfer course suggestions are hardcoded to filter by `'Delgado Community College'`:
```python
if equiv.from_course.institution == 'Delgado Community College':
```
This breaks for any plan whose current institution isn't Delgado.

### Procedure

1. Locate the transfer suggestions method at ~L1018. Replace the hardcoded string with a reference to the plan's current program institution:
   ```python
   current_institution = self.current_program.institution if self.current_program else None
   # ...
   if current_institution and equiv.from_course.institution == current_institution:
   ```

2. Add a guard: if `self.current_program` is `None`, skip transfer suggestions gracefully (return empty list or log a warning).

3. Search the entire file for any other hardcoded institution strings (`grep -n "Delgado" backend/models/plan.py`) and replace any other occurrences with dynamic references.

### Validation

- Create a plan with a non-Delgado current institution (e.g., Baton Rouge CC).
- Request suggestions for a target-program requirement.
- Verify transfer suggestions come from the correct current institution, not Delgado.
- Verify Delgado-based plans still produce correct suggestions.

---

## Fix 3: Extend Backend Suggestions to Support Current Program

**Risk:** MEDIUM  
**Files:** `backend/models/plan.py` (~L858–L905), `backend/routes/plans.py` (suggestions endpoint)

### Problem

`suggest_courses_for_requirements()` only generates suggestions for `self.target_program`. When a user clicks "Course Suggestions" on the current-program progress bar, the backend returns nothing — the frontend falls back to local heuristic matching with no constraint validation.

### Procedure

1. Add a `program` parameter to `suggest_courses_for_requirements()` (default: `None` → falls back to `self.target_program` for backward compatibility):
   ```python
   def suggest_courses_for_requirements(self, program=None, ...):
       program = program or self.target_program
       if not program:
           return {}
   ```

2. Propagate the `program` parameter through to the inner suggestion helpers (`_suggest_for_simple_requirement`, `_suggest_for_grouped_requirement`, etc.) so institution filtering uses `program.institution` instead of `self.target_program.institution`.

3. In the route layer (`plans.py`, suggestions endpoint), accept an optional `program_target` query parameter (`current` or `transfer`, default `transfer`). Resolve to the appropriate program object and pass it through:
   ```python
   target = request.args.get('program_target', 'transfer')
   program = plan.current_program if target == 'current' else plan.target_program
   suggestions = plan.suggest_courses_for_requirements(program=program)
   ```

4. On the frontend, in `ProgressTracking.jsx` where `getProgramRequirementSuggestions` is called (~L600–L608), pass the `program_target` parameter based on which bar was clicked (the `program` prop already distinguishes this).

### Validation

- Open a plan and click "Course Suggestions" on the **current-program** progress bar.
- Verify backend-generated suggestions appear (not just frontend heuristics).
- Verify suggestions are filtered to the current program's institution and requirements.
- Verify target-program suggestions still work identically (no regression).

---

## Implementation Order

| Step | Fix | Reason |
|------|-----|--------|
| 1 | **Fix 2** — Hardcoded institution | Smallest change, highest immediate impact, zero API changes |
| 2 | **Fix 1** — Grouped equivalency resolution | Core correctness fix, backend-only, no frontend changes needed |
| 3 | **Fix 3** — Suggestions for current program | Requires both backend and frontend changes, lower urgency |

## Testing Strategy

- Each fix should be implemented on a feature branch and tested independently.
- For Fix 1: unit test with mock plan courses from two institutions and a grouped requirement.
- For Fix 2: integration test with plans using multiple current institutions.
- For Fix 3: API-level test confirming `?program_target=current` returns valid suggestions.
- After all three, run a full end-to-end test: create a plan with current + target programs, add cross-institution courses, verify both progress bars, constraints, grouped requirements, and suggestions all resolve correctly.

## Files Affected Summary

| File | Fix 1 | Fix 2 | Fix 3 |
|------|:-----:|:-----:|:-----:|
| `backend/models/program.py` | ✓ | | |
| `backend/models/plan.py` | ✓ | ✓ | ✓ |
| `backend/routes/plans.py` | | | ✓ |
| `frontend/src/components/ProgressTracking.jsx` | | | ✓ |
