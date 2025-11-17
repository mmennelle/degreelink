# Option 3 Implementation: Category-Level AND Group-Level Constraints

## Overview
Successfully implemented hybrid constraint scope support that allows constraints to apply either to an entire category or to specific groups within that category.

## Changes Made

### 1. Constraint Tracking (backend/routes/upload.py, lines 440-472)
**Updated constraint key structure:**
- OLD: `(program_id, category, semester, year)` - 4-tuple, category-level only
- NEW: `(program_id, category, semester, year, group_name)` - 5-tuple with optional group_name

**Logic:**
- If `group_name` exists → group-level constraint (applies only to that specific group)
- If `group_name` is None → category-level constraint (applies to all groups in category)

```python
# Determine constraint scope based on group_name presence
constraint_key = (program.id, category, semester, year, group_name)
```

### 2. Constraint Creation (backend/routes/upload.py, lines 546-645)
**Updated to use JSON params and scope_filter:**
- Migrated from direct column fields to JSON-based storage
- Added `group_name` to `scope_filter` for group-level constraints
- Added `subject_codes` list support for subject scoping
- Fixed constraint types to match model expectations

**Constraint types supported:**
1. **credits** - Min/max credit requirements
   - Params: `{"credits_min": X, "credits_max": Y}`
   
2. **courses** - Min/max course count requirements
   - Params: `{"courses_min": X, "courses_max": Y}`
   
3. **min_courses_at_level** - Level-based requirements
   - Params: `{"level": 3000, "courses": 2}`
   
4. **min_tag_courses** / **max_tag_credits** - Tag-based requirements
   - Params: `{"tag": "true", "courses": 2}` or `{"tag": "lab", "credits": 7}`
   - Scope: `{"tag_field": "has_lab"}` or `{"tag_field": "course_type"}`

**Scope filter structure:**
```json
{
  "group_name": "Biology Lab",  // Optional: for group-level constraints
  "subject_codes": ["BIOS", "CHEM"],  // Optional: limit to specific subjects
  "tag_field": "has_lab"  // Optional: specify which tag field to check
}
```

### 3. Constraint Evaluation (backend/models/constraint.py, lines 120-158)
**Enhanced scope filtering:**
- Added `group_name` filtering during constraint evaluation
- Added `subject_codes` list support (multi-subject filtering)
- Maintains existing level filtering logic

**Filtering logic:**
```python
# Group name filtering (for group-level constraints)
if 'group_name' in scope:
    pc_group_name = getattr(pc, 'group_name', None)
    if pc_group_name != scope['group_name']:
        match = False

# Subject codes list filtering
if 'subject_codes' in scope:
    if course.subject_code not in scope['subject_codes']:
        match = False
```

### 4. PlanCourse Model (backend/models/plan.py, lines 820-860)
**Added group name tracking:**
- Added `requirement_group` relationship to access RequirementGroup
- Added `group_name` property to get group name from related RequirementGroup
- Enables constraint evaluation to filter courses by group

```python
requirement_group = db.relationship('RequirementGroup', foreign_keys=[requirement_group_id])

@property
def group_name(self):
    """Get the group name from the related RequirementGroup."""
    if self.requirement_group:
        return self.requirement_group.group_name
    return None
```

## How It Works

### Category-Level Constraint Example
**CSV Row:**
```csv
category,semester,year,type,group_name,...,constraint_type,description,min_credits,...
Core Major Requirements,1,1,grouped,,,credits,Minimum 15 credits,15,...
```
- First row of category with `constraint_type` but NO `group_name`
- Creates constraint with: `scope_filter = {}`
- Applies to ALL courses in "Core Major Requirements" category across all groups

### Group-Level Constraint Example
**CSV Row:**
```csv
category,semester,year,type,group_name,...,constraint_type,description,min_courses,...
Core Major Requirements,1,1,grouped,Biology Lab,min_tag_courses,At least 2 lab courses,,,2,...
```
- First row of "Biology Lab" group with `constraint_type` AND `group_name`
- Creates constraint with: `scope_filter = {"group_name": "Biology Lab"}`
- Applies ONLY to courses assigned to "Biology Lab" group

## Use Cases

### Real-World Example: Biology B.S. Program
**Category:** Core Major Requirements (40-45 credits)
**Groups within category:**
1. Major Required Courses (specific BIOS courses)
2. Biology Electives (choose from list)
3. Biology Lab (must have lab component)
4. Biology 2000 (2000-level requirement)
5. Biology Research/Apprentice (special types)
6. Biology 4000 (4000-level requirement)

**Constraints:**
- **Category-level:** "Minimum 40 credits in Core Major Requirements"
  - Applies to ALL groups combined
  
- **Group-level:** "Biology Lab group must have at least 2 courses with has_lab:true"
  - Applies ONLY to courses in "Biology Lab" group
  
- **Group-level:** "Biology 4000 group must have at least 3 courses at 4000 level"
  - Applies ONLY to courses in "Biology 4000" group

## Testing

### Test Files
1. `docs/equic-csvs/current_dcc_prog-reqs_associate_92525_unified.csv` - 124 rows, 7 categories
2. `docs/equic-csvs/target_uno_prog-reqs_bachelors_92525_unified.csv` - 155 rows, 9 categories, 8 constraints
   - Contains real example with "Core Major Requirements" having 6 groups
   - Shows both category-level and potential group-level constraints

### How to Test
1. Start Flask backend: `cd backend; python app.py`
2. Open http://127.0.0.1:5000 in browser
3. Navigate to CSV Upload page
4. Upload unified CSV files
5. Check console logs for constraint creation
6. Verify constraints in database:
   - Category-level constraints should have `scope_filter = {}` or `null`
   - Group-level constraints should have `scope_filter = {"group_name": "..."}`

## Benefits

1. **Flexibility:** Can apply constraints at both category and group levels
2. **Granular Control:** Different groups can have different requirements
3. **Backwards Compatible:** Category-level constraints work exactly as before
4. **Clear Semantics:** `group_name` in scope_filter clearly indicates group-scoped constraint
5. **Extensible:** Easy to add more scope filters (subject codes, level ranges, etc.)

## Database Schema

No schema changes required! Uses existing `scope_filter` JSON column in `requirement_constraints` table:
- `params` (TEXT/JSON): Constraint-specific parameters
- `scope_filter` (TEXT/JSON): Optional filtering criteria including `group_name`
- `constraint_type` (VARCHAR): Type of constraint ('credits', 'courses', 'min_courses_at_level', etc.)
- `description` (TEXT): Human-readable description

## Next Steps

1. ✅ Constraint tracking updated with group_name
2. ✅ Constraint creation updated to use JSON params
3. ✅ Constraint evaluation updated to filter by group_name
4. ✅ PlanCourse model updated with group_name property
5. 🔄 TEST uploads with unified CSV files
6. 🔄 Verify constraint creation in database
7. 🔄 Test constraint evaluation with plan progress
8. 📝 Update documentation with examples
