# Unified Program Requirements CSV Format

## Overview
The unified CSV format combines program requirements, grouping rules, and constraints into a single file. This simplifies the upload process by eliminating the need for separate requirements and constraints CSV files.

## Key Concepts

### Structure
- Each row represents either a requirement category or a course option within a grouped requirement
- Constraint columns are **optional** and only need values on the **first row** of each category
- Course listings follow with empty constraint columns

### Backward Compatibility
The system still supports the legacy format with `course_option`, `courses_required`, `credits_required`, `credits_required_group`, `description`, `group_description`, and `option_notes` columns for existing data files.

## Column Definitions

### Required Columns

| Column | Description | Example |
|--------|-------------|---------|
| `program_name` | Name of the academic program | "Biology B.S." |
| `category` | Requirement category name | "BIOS Electives" |
| `requirement_type` | Type of requirement: `simple`, `grouped`, or `conditional` | grouped |
| `semester` | Academic semester | Fall |
| `year` | Academic year | 2025 |
| `is_current` | Whether this is the current version (true/false) | true |

### Grouped Requirement Columns

| Column | Description | Example |
|--------|-------------|---------|
| `group_name` | Name of the course group | "Electives" |
| `course_code` | Specific course code | "BIOS 301" |
| `institution` | Institution offering the course | "State University" |
| `is_preferred` | Whether this is a preferred option (true/false) | false |

### Constraint Columns (Optional - First Row Only)

| Column | Description | Example |
|--------|-------------|---------|
| `min_credits` | Minimum credits required | 10 |
| `max_credits` | Maximum credits allowed | 15 |
| `min_courses` | Minimum number of courses | 3 |
| `max_courses` | Maximum number of courses | 5 |
| `min_level` | Minimum course level (e.g., 3000 for 3000+) | 3000 |
| `min_courses_at_level` | Minimum courses at or above level | 2 |
| `tag_requirement` | Tag-based requirement in format "tag:value:count" | "has_lab:true:2" |
| `scope_subject_codes` | Limit constraints to specific subject codes | "BIOS" |

## Example: Biology B.S. BIOS Electives

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,min_credits,max_credits,min_courses,max_courses,min_level,min_courses_at_level,tag_requirement,scope_subject_codes
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,10,"",3,"",3000,2,has_lab:true:2,BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"State University",true,"","","","","","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"State University",false,"","","","","","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 401,"State University",false,"","","","","","","",""
```

This example creates:
1. A **requirement category** "BIOS Electives" with type "grouped"
2. A **requirement group** "Electives" with 4 course options (BIOS 300, 301, 305, 401)
3. **Constraints** for the category:
   - Minimum 10 credits required
   - Minimum 3 courses required
   - Minimum level 3000 (courses must be 3000+)
   - Minimum 2 courses at level 3000+
   - Must have at least 2 courses with lab component (`has_lab:true`)
   - All constraints apply only to courses in subject "BIOS"

## Constraint Types

### Credits Constraints
- `min_credits`: Minimum total credits
- `max_credits`: Maximum total credits
- Creates a `RequirementConstraint` with `constraint_type='credits'`

### Course Count Constraints
- `min_courses`: Minimum number of courses
- `max_courses`: Maximum number of courses
- Creates a `RequirementConstraint` with `constraint_type='courses'`

### Level Constraints
- `min_level`: Minimum course level (e.g., 3000, 4000)
- `min_courses_at_level`: How many courses must be at or above this level
- Creates a `RequirementConstraint` with `constraint_type='level'`

### Tag Constraints
- `tag_requirement`: Format is `"tag_name:tag_value:count"`
  - Examples:
    - `"has_lab:true:2"` - At least 2 courses must have lab
    - `"course_type:research:1"` - At least 1 research course
- Creates a `RequirementConstraint` with `constraint_type='tag'`

### Scope Constraints
- `scope_subject_codes`: Comma-separated list of subject codes
  - Example: `"BIOS,BIO"` - Constraints apply only to BIOS and BIO courses
- Creates a `RequirementConstraint` with `constraint_type='scope'`

## Backend Processing

When the CSV is uploaded, the backend:

1. **Pass 1**: Creates/updates Program records
2. **Pass 2**: Validates course codes exist in Course table
3. **Pass 3**: Creates ProgramRequirement, RequirementGroup, and GroupCourseOption records
   - Parses constraint columns from first row of each category
   - Stores in `category_constraints` dictionary
4. **Pass 4**: Creates RequirementConstraint records from collected constraint data
5. **Pass 5**: Sets `is_current` flags for program versions

## Migration from Legacy Format

If you have existing CSV files using the old format, they will still work. The backend supports both:

### Legacy Format
- `course_option` instead of `course_code`
- `courses_required` for group
- `credits_required` for category
- `credits_required_group` for group
- `description`, `group_description`, `option_notes`

### New Unified Format
- `course_code` (clearer naming)
- Constraint columns embedded directly
- More flexible structure

## Benefits

1. **Single Upload**: No need to upload requirements and constraints separately
2. **Less Redundancy**: Eliminates duplicate fields like `credits_required` vs `min_credits`
3. **Clearer Intent**: Constraints are visible alongside the courses they constrain
4. **Easier Maintenance**: Update requirements and constraints together
5. **Better Validation**: Backend can validate constraints match the courses provided

## See Also

- Sample file: `docs/equic-csvs/sample-templates/unified_program_requirements.csv`
- Backend route: `backend/routes/upload.py` - `/upload/requirements` endpoint
- Frontend component: `frontend/src/components/CSVUpload.jsx`
