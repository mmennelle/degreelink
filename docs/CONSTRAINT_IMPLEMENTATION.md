# Requirement Constraint System

## Overview
The constraint system provides comprehensive validation, filtering, warnings, and credit exclusions for program requirements. Constraints ensure students meet specific academic requirements beyond simple credit or course counts.

## System Components

### 1. Database Schema
**File:** `backend/models/plan.py` - PlanCourse model

**Fields:**
- `constraint_violation` (Boolean): Tracks courses that violate constraints
- `constraint_violation_reason` (Text): Stores human-readable violation reasons
- `to_dict()` method: Includes constraint violation information in API responses

**Purpose:** Track which courses violate constraints so they can be excluded from credit calculations and displayed differently in the UI.

---

### 2. Constraint Evaluation & Credit Exclusion
**File:** `backend/models/plan.py` - Plan model

**Features:**
- Filters out constraint-violating courses before evaluating constraints
- Excludes constraint-violating courses from credit calculations
- Includes constraint type, ID, and description in results
- Recalculates valid credits after filtering violating courses

**Purpose:** Ensures that courses violating constraints don't count toward requirement totals while still allowing them to exist in the plan.

---

### 3. Constraint Validation API
**File:** `backend/routes/plans.py`

**New Endpoints:**
- `POST /api/plans/<plan_id>/validate-course-constraints`
- `POST /api/plans/by-code/<plan_code>/validate-course-constraints`

**New Method:** `Plan.check_course_constraint_violations()`

**Functionality:**
- Validates if adding a course would violate any constraints
- Checks constraint scope (group-level vs category-level)
- Returns list of violations with descriptions
- Used by frontend before adding courses

**Purpose:** Allow frontend to check for constraint violations before committing courses to the database.

---

### 4. Course Addition with Constraint Support
**File:** `backend/routes/plans.py`

**Changes:**
- Updated `add_course_to_plan()` to accept `constraint_violation` and `constraint_violation_reason` fields
- Updated `add_course_to_plan_by_code()` similarly
- Courses can be added with violation flags when user explicitly overrides warnings

**Purpose:** Support adding courses that violate constraints with proper tracking.

---

### 5. Constraint Display in UI
**File:** `frontend/src/components/ProgressTracking.jsx` - RequirementDetails component

**Changes:**
- Added collapsible "Constraints" section showing all constraints for a requirement
- Visual indicators for satisfied (checkmark green) vs unsatisfied (warning red) constraints
- Displays constraint descriptions, reasons for failure, and tallies
- Course cards now show warning icon for constraint-violating courses
- Orange highlighting for courses that violate constraints
- Shows constraint violation reason on course cards

**Purpose:** Give users full visibility into constraint status and which courses violate them.

---

### 6. Filtered Course Suggestions
**File:** `frontend/src/components/ProgressTracking.jsx` - generateSuggestions()

**Changes:**
- Extracts constraint filters from requirement constraint results
- Applies minimum level filters (e.g., only suggest 3000+ level courses)
- Excludes courses with tags that have reached maximum credits
- `passesConstraintFilters()` helper function validates each suggestion
- Filters apply to both grouped and simple requirement suggestions

**Purpose:** Only suggest courses that would satisfy applicable constraints, improving user experience.

---

### 7. Constraint Violation Warnings
**File:** `frontend/src/components/AddCourseToPlanModal.jsx`

**Changes:**
- Added constraint validation check before submitting courses
- Calls validation API for each course being added
- Shows warning modal if any course violates constraints
- Warning displays:
  - Which constraint(s) are violated
  - Clear explanation that credits won't count
  - "Cancel" and "Add Anyway" options
- If user overrides, course is added with `constraint_violation = true`

**Purpose:** Warn users before adding courses that violate constraints while still allowing override for edge cases.

---

## How It Works End-to-End

### Adding a Course (Normal Flow)
1. User selects "Add Course" from progress modal
2. Chooses course and requirement category
3. Clicks "Add Course"
4. System validates against constraints via API
5. If no violations: Course added normally
6. Progress bar updates with credits counted

### Adding a Course (With Constraint Violation)
1. User selects course that violates constraint
2. Clicks "Add Course"
3. **Warning modal appears** showing:
   - Constraint type and description
   - Reason for violation
   - Notice that credits won't count
4. User can:
   - **Cancel**: Go back and choose different course
   - **Add Anyway**: Course added with violation flag
5. Course appears in plan with:
   - Orange background
   - Warning icon
   - Violation reason displayed
   - **Credits do NOT count toward requirement**

### Viewing Constraint Status
1. User clicks on progress bar segment
2. Modal shows requirement details
3. "Constraints" section displays:
   - All constraints for requirement
   - Green checkmark for satisfied constraints
   - Red X for unsatisfied constraints
   - Specific reasons and tallies
4. Courses section shows which courses violate constraints

### Course Suggestions with Constraints
1. User views course suggestions for requirement
2. System checks if requirement has constraints
3. Filters suggestions by:
   - Minimum course level requirements
   - Maximum credits for specific tags
   - Tag exclusions
4. Only compliant courses are suggested

---

## Constraint Types Supported

### 1. `min_level_credits`
**Example:** "At least 10 credits at 3000+ level"
- **Filtering:** Only suggests courses at or above minimum level
- **Evaluation:** Counts credits from courses meeting level requirement
- **Violation:** If not enough high-level credits

### 2. `min_tag_courses`
**Example:** "At least 2 lab courses"
- **Filtering:** Not currently applied to suggestions
- **Evaluation:** Counts courses with matching tag
- **Violation:** If not enough tagged courses

### 3. `max_tag_credits`
**Example:** "Maximum 7 credits of research courses"
- **Filtering:** Excludes courses with that tag when maximum reached
- **Evaluation:** Sums credits of courses with tag
- **Violation:** If too many credits of that type

### 4. `min_courses_at_level`
**Example:** "At least 3 courses at 4000 level"
- **Filtering:** Suggests only courses at that exact level (if constraint unsatisfied)
- **Evaluation:** Counts courses at specific level
- **Violation:** If not enough courses at that level

---

## Technical Details

### Database Migration
```bash
flask db migrate -m "Add constraint violation tracking to PlanCourse"
flask db upgrade
```

### New Database Fields
```python
constraint_violation = db.Column(db.Boolean, default=False, index=True)
constraint_violation_reason = db.Column(db.Text)
```

### API Request Format
```json
POST /api/plans/by-code/ABC12345/validate-course-constraints
{
  "course_id": 123,
  "requirement_category": "Upper-Level Biology",
  "requirement_group_id": 45
}
```

### API Response Format
```json
{
  "violates": true,
  "violations": [
    {
      "constraint_type": "min_level_credits",
      "description": "At least 10 credits at 3000+ level",
      "reason": "Need 10cr at 3000+ level, have 6cr",
      "constraint_id": 7
    }
  ]
}
```

---

## Benefits

1. **User Awareness:** Users see all constraints and their status
2. **Guided Selection:** Suggestions are pre-filtered to match constraints
3. **Informed Decisions:** Clear warnings before violating constraints
4. **Flexibility:** Users can still override constraints when necessary
5. **Accurate Progress:** Violating courses don't inflate credit counts
6. **Transparency:** Violation reasons are clearly displayed

---

## Future Enhancements (Optional)

1. **Constraint Autocorrection:** Suggest alternative courses when violations detected
2. **Constraint Templates:** Common constraint patterns for quick setup
3. **Historical Tracking:** Log when constraints are overridden and why
4. **Bulk Validation:** Validate entire plan against all constraints
5. **Smart Suggestions:** AI-powered course recommendations considering constraints
6. **Constraint Dependencies:** Support for complex multi-constraint logic

---

## Testing Recommendations

1. **Basic Constraint Satisfaction:**
   - Add courses that satisfy constraints → Credits count normally
   
2. **Level Constraints:**
   - Try adding 1000-level course to requirement needing 3000+ → See warning
   
3. **Tag Constraints:**
   - Add research courses beyond maximum → See warning and exclusion from suggestions
   
4. **Override Functionality:**
   - Add violating course with override → Course added but credits don't count
   
5. **UI Display:**
   - Check constraint section shows all constraints with correct status
   - Verify violating courses have orange background and warning icon
   
6. **Filtered Suggestions:**
   - Verify suggestions respect minimum level requirements
   - Check that maxed-out tags don't appear in suggestions

---

## Files Modified

### Backend
- `backend/models/plan.py` - PlanCourse model and Plan evaluation logic
- `backend/routes/plans.py` - Validation endpoints and course addition
- `backend/migrations/versions/f54a517d7e8f_add_constraint_violation_tracking_to_.py` - Database migration

### Frontend
- `frontend/src/components/ProgressTracking.jsx` - Constraint display and filtered suggestions
- `frontend/src/components/AddCourseToPlanModal.jsx` - Validation and warning modal

---

## Conclusion

The constraint system is now fully functional with:
- Constraint evaluation and credit exclusion
- User warnings before violations
- Visual indicators for constraint status
- Filtered course suggestions
- Override capability with proper tracking

Users can now make informed decisions about course selection while the system ensures academic requirements are accurately tracked.
