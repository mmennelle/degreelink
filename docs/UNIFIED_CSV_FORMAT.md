# Program Requirements CSV Instructions

## Quick Start

**To add constraints to a requirement category:**

1. Fill in the relevant constraint columns in the first row of your category:
   - **Credits**: `min_credits`, `max_credits`
   - **Courses**: `min_courses`, `max_courses`
   - **Level**: `min_level`, `min_courses_at_level`
   - **Tag**: `tag`, `tag_value`, `min_courses`

2. Optionally add `scope_subject_codes` to limit which courses the constraints apply to

3. List your course options in subsequent rows with empty constraint columns

4. **You can mix multiple constraint types in a single row!** For example, specify both a level requirement AND a credit maximum in the same row.

**That's it!** The system will automatically create the appropriate constraints based on which columns have values. The `constraint_type` column is technically optional because the system intelligently detects which constraints to create based on the filled columns. But it is recommended to provide a constraint type when possible

## Overview
The CSV format combines program requirements, grouping rules, and constraints into a single file. This simplifies the upload process by eliminating the need for separate requirements and constraints CSV files.

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

**How to specify constraints:**
Simply fill in the constraint columns you need. The system automatically detects and creates constraints based on which columns have values. You can mix multiple constraint types in a single row!

| Column | Description | When to Use | Example |
|--------|-------------|-------------|---------|
| `constraint_type` | Name the primary constraint type | For clarity in complex CSVs | credits |
| `min_credits` | Minimum credits required | When you need a credit minimum | 10 |
| `max_credits` | Maximum credits allowed | When you need a credit maximum | 15 |
| `min_courses` | Minimum number of courses | When you need course count minimum | 3 |
| `max_courses` | Maximum number of courses | When you need course count maximum | 5 |
| `min_level` | Minimum course level (e.g., 3000 for 3000+) | When you need level-based filtering | 3000 |
| `min_courses_at_level` | Number of courses required at or above level | Used with `min_level` | 2 |
| `tag` | Tag field name to check (e.g., has_lab, course_type) | When filtering by course attributes | has_lab |
| `tag_value` | Required tag value | Used with `tag` | true |
| `scope_subject_codes` | Limit constraints to specific subject codes | Optional for any constraint | "BIOS" |

**Note:** The `constraint_type` column is now optional and serves as documentation. The system intelligently creates constraints based on which columns contain values.

## Example: Biology B.S. BIOS Electives

### Example 1: Credits Constraint
Students must take between 10-15 credits from the elective list.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,min_credits,max_credits,scope_subject_codes
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,credits,10,15,BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"State University",true,"","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"State University",false,"","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 401,"State University",false,"","","",""
```

### Example 2: Course Count Constraint
Students must take between 3-5 courses from the elective list.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,min_courses,max_courses
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,courses,3,5
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"State University",true,"","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"State University",false,"","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 401,"State University",false,"","",""
```

### Example 3: Level Constraint
Students must take at least 2 courses at the 3000+ level.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,min_level,min_courses_at_level,scope_subject_codes
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,level,3000,2,BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"State University",true,"","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"State University",false,"","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 401,"State University",false,"","","",""
```

### Example 4: Tag Constraint
Students must have at least 2 courses with a lab component.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,tag,tag_value,min_courses,scope_subject_codes
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,tag,has_lab,true,2,BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"State University",true,"","","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"State University",false,"","","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 401,"State University",false,"","","","",""
```

### Example 5: Multiple Constraints (Combined)
You can add multiple rows with different constraint types for the same category. Each constraint will be applied.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,min_credits,min_courses,min_level,min_courses_at_level,tag,tag_value,scope_subject_codes
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,credits,10,"","","","","",BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,courses,"",3,"","","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,level,"","",3000,2,"","",BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,tag,"","","","",has_lab,true,BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"State University",true,"","","","","","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"State University",false,"","","","","","","",""
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 401,"State University",false,"","","","","","","",""
```

**Important Notes:**
- The first row specifies the constraint type and fills in only the relevant columns for that constraint
- For multiple constraints, add additional rows with different constraint types before listing the courses
- Courses follow after all constraint rows with empty constraint columns

## Constraint Types - Quick Reference

### 1. Credits Constraint
**What it does:** Requires a minimum and/or maximum number of credits to be completed.

**How to use:**
- Set `constraint_type` = `credits`
- Fill in `min_credits` and/or `max_credits`
- Example: Require between 10-15 credits

| constraint_type | min_credits | max_credits |
|-----------------|-------------|-------------|
| credits         | 10          | 15          |

### 2. Course Count Constraint
**What it does:** Requires a minimum and/or maximum number of courses to be completed.

**How to use:**
- Set `constraint_type` = `courses`
- Fill in `min_courses` and/or `max_courses`
- Example: Require 3-5 courses

| constraint_type | min_courses | max_courses |
|-----------------|-------------|-------------|
| courses         | 3           | 5           |

### 3. Level Constraint
**What it does:** Requires a certain number of courses at or above a specific level (e.g., 3000-level courses).

**How to use:**
- Set `constraint_type` = `level`
- Fill in `min_level` (the course level threshold, e.g., 3000)
- Fill in `min_courses_at_level` (how many courses must be at or above this level)
- Example: Require at least 2 courses at 3000-level or higher

| constraint_type | min_level | min_courses_at_level |
|-----------------|-----------|----------------------|
| level           | 3000      | 2                    |

### 4. Tag Constraint
**What it does:** Requires courses with a specific tag/attribute (e.g., has_lab, course_type).

**How to use:**
- Set `constraint_type` = `tag`
- Fill in `tag` (the field name to check, e.g., has_lab)
- Fill in `tag_value` (the required value, e.g., true)
- Fill in `min_courses` (how many courses must have this tag)
- Example: Require at least 2 courses with lab

| constraint_type | tag     | tag_value | min_courses |
|-----------------|---------|-----------|-------------|
| tag             | has_lab | true      | 2           |

### 5. Scope Filter (Optional for all constraints)
**What it does:** Limits the constraint to only apply to courses from specific subject codes.

**How to use:**
- Add `scope_subject_codes` with space-separated subject codes
- Works with any constraint type
- Example: Only count BIOS and BIO courses

| constraint_type | min_courses | scope_subject_codes |
|-----------------|-------------|---------------------|
| courses         | 3           | BIOS BIO            |

## Backend Processing

When the CSV is uploaded, the backend:

1. **Pass 1**: Creates/updates Program records
2. **Pass 2**: Validates course codes exist in Course table
3. **Pass 3**: Creates ProgramRequirement, RequirementGroup, and GroupCourseOption records
   - Reads `constraint_type` column from each row
   - When a `constraint_type` is specified, collects the relevant constraint parameters
   - Stores constraint data in `category_constraints` dictionary for later processing
4. **Pass 4**: Creates RequirementConstraint records from collected constraint data
   - For `constraint_type='credits'`: Creates constraint with `min_credits` and/or `max_credits`
   - For `constraint_type='courses'`: Creates constraint with `min_courses` and/or `max_courses`
   - For `constraint_type='level'`: Creates constraint with `min_level` and `min_courses_at_level`
   - For `constraint_type='tag'`: Creates constraint with `tag`, `tag_value`, and `min_courses`
5. **Pass 5**: Sets `is_current` flags for program versions

## Best Practices

### Simple Approach
For most requirements, you'll want to specify just one constraint type:

**Option A: Credit-based** (most common)
- Use when you want "students must complete X credits from these courses"
- Set `constraint_type=credits` and specify `min_credits`

**Option B: Course-count based**
- Use when you want "students must complete X courses from this list"
- Set `constraint_type=courses` and specify `min_courses`

**Option C: Level-based**
- Use when you want "students must take X upper-level courses"
- Set `constraint_type=level` and specify `min_level` and `min_courses_at_level`

### Advanced Usage
You can combine multiple constraints by adding separate rows with different constraint types. Each constraint will be validated independently.

### Scope Filtering
Use `scope_subject_codes` to limit which courses count toward the constraint. This is useful when:
- A category includes courses from multiple departments but the constraint only applies to one
- You want to ensure diversity across subject areas

## Migration from Legacy Format

If you have existing CSV files using the old format, they will still work. The backend supports both:

### Legacy Format
- `course_option` instead of `course_code`
- `courses_required` for group
- `credits_required` for category
- `credits_required_group` for group
- `description`, `group_description`, `option_notes`

### New Format
- `course_code` (cInstructions naming)
- Constraint columns embedded directly
- More flexible structure

## Benefits

1. **Simple and Intuitive**: Just type the constraint type you want (`credits`, `courses`, `level`, or `tag`) and fill in the corresponding columns
2. **Single Upload**: No need to upload requirements and constraints separately
3. **Less Redundancy**: Each constraint type has its own dedicated columns
4. **Clearer Intent**: Constraints are visible alongside the courses they constrain
5. **Easier Maintenance**: Update requirements and constraints together
6. **Better Validation**: Backend can validate constraints match the courses provided
7. **Flexible**: Add multiple constraints by including additional rows with different constraint types

---

## Appendix: Complete Reference Guide

### A. Requirement Types

| Type | Description | When to Use | Required Columns | Implementation Status |
|------|-------------|-------------|------------------|----------------------|
| `simple` | Single course or specific requirement | Exact course requirements (e.g., "BIOS 1010 is required") | `course_code` | **Fully Implemented** |
| `grouped` | Choose X courses from a list | Electives with options (e.g., "Choose 3 from 5 BIOS courses") | `group_name`, `courses_per_group`, `total_credits_per_group` | **Fully Implemented** |
| `conditional` | If/then logic for courses | **FUTURE FEATURE** - Transfer scenarios, prerequisite chains, alternate pathways | TBD | **Not Yet Implemented** |

#### Understanding Conditional Requirements (Future Feature)

**Current Status:** The `conditional` type is recognized by the system but currently behaves identically to `simple` requirements. This is a placeholder for future use where things like "take A before B are better handled by the backend.

**Planned Use Cases:**
1. **Transfer Student Scenarios**
   - "If student has CHEM 1110 from DCC, they satisfy CHEM 1010 requirement"
   - "Transfer students can substitute BIOS 2000-level courses for BIOS 1010"

2. **Prerequisite Chains**
   - "Must complete BIOS 1010 before taking any 3000-level BIOS courses"
   - "If CHEM 1110 is completed, CHEM 1010 is waived"

3. **Alternate Pathways**
   - "Complete either [Group A: 3 lab courses] OR [Group B: 2 research projects + 1 seminar]"
   - "Students with AP Biology credit skip BIOS 1010"

4. **Complex Logic**
   - "If GPA > 3.5 in BIOS courses, reduce required electives from 5 to 4"
   - "Math requirement satisfied by either [MATH 1950 + MATH 1960] OR [MATH 1110]"

**Current Recommendation:** Use `grouped` requirements with constraints for most complex scenarios. The grouped type with appropriate constraints can handle the majority of real-world academic requirements.

### B. Constraint Types

| Type | Description | Example Use Case | CSV Columns Needed |
|------|-------------|------------------|-------------------|
| **Credits** | Min/max credit limits | "10-15 credits required" | `min_credits`, `max_credits` |
| **Courses** | Min/max course count | "At least 3 courses" | `min_courses`, `max_courses` |
| **Level** | Minimum course level | "2 courses at 3000+ level" | `min_level`, `min_courses_at_level` |
| **Tag** | Filter by course attributes | "Require 2 lab courses" or "Max 7 research credits" | `tag`, `tag_value`, `min_courses` OR `max_credits` |

### C. Course Tags & Values

#### Tag: `has_lab`
**Field Type:** Boolean  
**Description:** Indicates if the course has a lab component

| Value | Meaning | CSV Format |
|-------|---------|------------|
| `true` | Course has a lab | `has_lab,true` |
| `false` | Course does not have a lab | `has_lab,false` |

**Example Constraint:**
```csv
tag,tag_value,min_courses
has_lab,true,2
```
*"Require at least 2 courses with labs"*

#### Tag: `course_type`
**Field Type:** String  
**Description:** Categorizes the course by instructional type

| Value | Description | CSV Format |
|-------|-------------|------------|
| `lecture` | Traditional lecture course (default) | `course_type,lecture` |
| `lecture_lab` | Combined lecture and lab | `course_type,lecture_lab` |
| `lab_only` | Laboratory-only course | `course_type,lab_only` |
| `research` | Research course | `course_type,research` |
| `seminar` | Seminar course | `course_type,seminar` |
| `independent_study` | Independent study course | `course_type,independent_study` |

**Example Constraints:**
```csv
tag,tag_value,min_courses
course_type,research,1
```
*"Require at least 1 research course"*

```csv
tag,tag_value,max_credits
course_type,research,7
```
*"Allow maximum 7 credits of research courses"*

**Special Note:** When filtering for `research` courses, the system automatically includes `seminar` and `independent_study` courses as they are treated similarly.

### D. Constraint Scope Filters

| Column | Description | Format | Example |
|--------|-------------|--------|---------|
| `scope_subject_codes` | Limit constraints to specific departments | Space-separated subject codes | `BIOS CHEM` |

**Example:**
```csv
min_credits,scope_subject_codes
10,BIOS
```
*"Require at least 10 credits from BIOS courses"*

### E. Grouped Requirement Fields

| Field | Description | Type | Example |
|-------|-------------|------|---------|
| `group_name` | Name of the course option group | String | "Upper-Level BIOS" |
| `courses_per_group` | Number of courses to choose from group | Integer | 3 |
| `total_credits_per_group` | Total credits required from group | Integer | 9 |

### F. Academic Calendar Fields

| Field | Valid Values | Notes |
|-------|--------------|-------|
| `semester` | `Fall`, `Spring`, `Summer` | Case-sensitive |
| `year` | 4-digit year | e.g., `2025` |
| `is_current` | `true`, `false` | Lowercase boolean |

### G. Course Level Specifications

**Format:** 4-digit number representing the course level

| Level | Description | Example Courses |
|-------|-------------|-----------------|
| `1000` | First-year undergraduate | BIOS 1010, CHEM 1110 |
| `2000` | Second-year undergraduate | BIOS 2030, CHEM 2250 |
| `3000` | Third-year undergraduate | BIOS 3010, CHEM 3110 |
| `4000` | Fourth-year undergraduate | BIOS 4350, CHEM 4990 |
| `5000` | Graduate level | BIOS 5250, CHEM 5310 |

**Usage in Constraints:**
```csv
min_level,min_courses_at_level
3000,2
```
*"Require 2 courses at 3000+ level"*

### H. Complete Column Reference

#### Always Required
- `program_name`
- `category`
- `requirement_type`
- `semester`
- `year`
- `is_current`

#### For Simple Requirements
- `course_code`

#### For Grouped Requirements
- `group_name` (first row of group)
- `courses_per_group` (first row of group)
- `total_credits_per_group` (first row of group)
- `course_code` (all rows in group)

#### For Constraints (Optional, first row only)
- `constraint_type` (optional documentation field)
- `min_credits` (for credit minimums)
- `max_credits` (for credit maximums)
- `min_courses` (for course count minimums or tag constraints)
- `max_courses` (for course count maximums)
- `min_level` (for level-based filtering)
- `min_courses_at_level` (number of courses at or above level)
- `tag` (field name: `has_lab` or `course_type`)
- `tag_value` (value to match: `true`/`false` for has_lab, or course type string)
- `scope_subject_codes` (limit to specific departments)
- `description` (optional text description)

---

## See Also

- Sample file: `docs/equic-csvs/sample-templates/program_requirements.csv`
- Backend route: `backend/routes/upload.py` - `/upload/requirements` endpoint
- Frontend component: `frontend/src/components/CSVUpload.jsx`
