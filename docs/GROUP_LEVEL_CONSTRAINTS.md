# Category-Level and Group-Level Constraints

## Overview
The system supports hybrid constraint scope, allowing constraints to apply either to an entire requirement category or to specific groups within that category.

## Constraint Scoping

### Constraint Key Structure
Constraints are identified by a 5-tuple: `(program_id, category, semester, year, group_name)`

**Scope Logic:**
- If `group_name` exists → group-level constraint (applies only to that specific group)
- If `group_name` is None → category-level constraint (applies to all groups in category)

```python
# Determine constraint scope based on group_name presence
constraint_key = (program.id, category, semester, year, group_name)
```

## Constraint Storage

### JSON-Based Parameters
Constraints use JSON fields for flexible parameter storage:

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

### Scope Filter Structure
```json
{
  "group_name": "Biology Lab",  // Optional: for group-level constraints
  "subject_codes": ["BIOS", "CHEM"],  // Optional: limit to specific subjects
  "tag_field": "has_lab"  // Optional: specify which tag field to check
}
```

## Constraint Evaluation

### Scope Filtering Logic
During constraint evaluation, the system filters courses based on the scope filter:

**Group name filtering (for group-level constraints):**
```python
if 'group_name' in scope:
    pc_group_name = getattr(pc, 'group_name', None)
    if pc_group_name != scope['group_name']:
        match = False
```

**Subject codes list filtering:**
```python
if 'subject_codes' in scope:
    if course.subject_code not in scope['subject_codes']:
        match = False
```

### PlanCourse Group Tracking
The `PlanCourse` model includes group name tracking for constraint evaluation:

```python
requirement_group = db.relationship('RequirementGroup', foreign_keys=[requirement_group_id])

@property
def group_name(self):
    """Get the group name from the related RequirementGroup."""
    if self.requirement_group:
        return self.requirement_group.group_name
    return None
```

## Examples

### Category-Level Constraint
**CSV Row:**
```csv
category,semester,year,type,group_name,...,constraint_type,description,min_credits,...
Core Major Requirements,1,1,grouped,,,credits,Minimum 15 credits,15,...
```
- First row of category with `constraint_type` but NO `group_name`
- Creates constraint with: `scope_filter = {}`
- Applies to ALL courses in "Core Major Requirements" category across all groups

### Group-Level Constraint
**CSV Row:**
```csv
category,semester,year,type,group_name,...,constraint_type,description,min_courses,...
Core Major Requirements,1,1,grouped,Biology Lab,min_tag_courses,At least 2 lab courses,,,2,...
```
- First row of "Biology Lab" group with `constraint_type` AND `group_name`
- Creates constraint with: `scope_filter = {"group_name": "Biology Lab"}`
- Applies ONLY to courses assigned to "Biology Lab" group

## Use Cases

### Biology B.S. Program Example
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

## Benefits

1. **Flexibility:** Can apply constraints at both category and group levels
2. **Granular Control:** Different groups can have different requirements
3. **Backwards Compatible:** Category-level constraints work exactly as before
4. **Clear Semantics:** `group_name` in scope_filter clearly indicates group-scoped constraint
5. **Extensible:** Easy to add more scope filters (subject codes, level ranges, etc.)

## Database Schema

Uses existing `scope_filter` JSON column in `requirement_constraints` table:
- `params` (TEXT/JSON): Constraint-specific parameters
- `scope_filter` (TEXT/JSON): Optional filtering criteria including `group_name`
- `constraint_type` (VARCHAR): Type of constraint ('credits', 'courses', 'min_courses_at_level', etc.)
- `description` (TEXT): Human-readable description
