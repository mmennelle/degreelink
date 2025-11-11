# CSV Template Guide - Phase 2 Updates

## Overview
The CSV templates have been updated to support Phase 2 "UNO-level constraints" functionality. This includes course attributes (labs, course types) and requirement-level constraints.

## Updated Templates

### 1. courses_formatted.csv

**New Fields:**
- `has_lab` (boolean): Whether the course includes a laboratory component
  - Values: `true` or `false`
  - Example: `true` for courses with lab sections
  
- `course_type` (string): The type of course delivery
  - Valid values:
    - `lecture` - Standard lecture course (default)
    - `lecture_lab` - Combined lecture and lab in one course
    - `lab_only` - Laboratory-only course
    - `research` - Independent research/thesis
    - `seminar` - Seminar-style course
    - `independent_study` - Self-directed study

**Example Rows:**
```csv
code,title,description,credits,institution,department,prerequisites,has_lab,course_type
BIOS 3010,Cell Biology,Cellular structure and function with lab,4,University of New Orleans,Biological Sciences,BIOS 2114,true,lecture_lab
BIOS 3200,Ecology,Ecological principles and interactions,3,University of New Orleans,Biological Sciences,BIOS 1083,false,lecture
BIOS 4990,Research in Biology,Independent research project,3,University of New Orleans,Biological Sciences,BIOS 3010,false,research
BIOS 1071,General Biology I Lab,Laboratory for introductory biology,1,University of New Orleans,Biological Sciences,,true,lab_only
```

### 2. requirement_constraints_formatted.csv (NEW)

This template defines constraints that apply to grouped requirements.

**Fields:**
- `program_name` - Name of the program (must match program in program_requirements)
- `requirement_category` - Category name (must match a grouped requirement)
- `constraint_type` - Type of constraint (see types below)
- `description` - Human-readable description of the constraint
- `min_credits` - Minimum credits (for min_level_credits)
- `max_credits` - Maximum credits (for max_tag_credits)
- `min_level` - Minimum course level (e.g., 3000)
- `min_courses` - Minimum number of courses (for min_tag_courses)
- `max_courses` - Maximum number of courses (for max_tag_courses)
- `tag` - Course attribute to check (e.g., has_lab, course_type)
- `tag_value` - Value the tag must match (e.g., true, research)
- `scope_subject_codes` - Comma-separated subject codes to limit scope (e.g., "BIOS")

**Constraint Types:**

1. **min_level_credits** - Requires minimum credits at or above a course level
   - Uses: `min_credits`, `min_level`, `scope_subject_codes`
   - Example: "At least 10 credits at 3000+ level"

2. **min_tag_courses** - Requires minimum number of courses with a specific attribute
   - Uses: `min_courses`, `tag`, `tag_value`, `scope_subject_codes`
   - Example: "At least 2 courses with labs"

3. **max_tag_credits** - Limits maximum credits from courses with a specific attribute
   - Uses: `max_credits`, `tag`, `tag_value`, `scope_subject_codes`
   - Example: "Maximum 7 credits of research courses"

4. **min_courses_at_level** - Requires minimum number of courses at a specific level
   - Uses: `min_courses`, `min_level`, `scope_subject_codes`
   - Example: "At least 3 courses at 4000+ level"

**Example Constraints:**
```csv
program_name,requirement_category,constraint_type,description,min_credits,max_credits,min_level,min_courses,max_courses,tag,tag_value,scope_subject_codes
BS Biological Sciences,BIOS Electives,min_level_credits,At least 10 credits must be at 3000+ level,10,,3000,,,,,"BIOS"
BS Biological Sciences,BIOS Electives,min_tag_courses,At least 2 courses must have labs,,,,,2,has_lab,true,"BIOS"
BS Biological Sciences,BIOS Electives,max_tag_credits,Maximum 7 credits of research courses,,7,,,,,course_type,research,"BIOS"
```

### 3. program_requirements_formatted.csv

**Updates:**
- Added example BIOS Electives requirement with multiple course options
- This requirement will work with the constraints defined in requirement_constraints_formatted.csv

**Example BIOS Electives Requirement:**
```csv
program_name,category,credits_required,requirement_type,group_name,courses_required,credits_required_group,course_option,institution,is_preferred,description,group_description,option_notes
BS Biological Sciences,BIOS Electives,17,grouped,Upper Level BIOS,0,17,BIOS 3010,University of New Orleans,False,Biology electives at 3000+ level with constraints,Choose BIOS courses at 3000+ level,Cell Biology with lab
BS Biological Sciences,BIOS Electives,17,grouped,Upper Level BIOS,0,17,BIOS 3200,University of New Orleans,False,Biology electives at 3000+ level with constraints,Choose BIOS courses at 3000+ level,Ecology
BS Biological Sciences,BIOS Electives,17,grouped,Upper Level BIOS,0,17,BIOS 4990,University of New Orleans,False,Biology electives at 3000+ level with constraints,Choose BIOS courses at 3000+ level,Research in Biology
```

## Usage Workflow

1. **Update courses_formatted.csv**
   - Add `has_lab` and `course_type` values for all courses
   - For existing courses, default to `false` and `lecture` if unsure
   - Lab courses should have `has_lab=true`
   - Research courses should have `course_type=research`

2. **Define program requirements** in program_requirements_formatted.csv
   - Create grouped requirements that will have constraints
   - Include all course options in the group

3. **Add constraints** in requirement_constraints_formatted.csv
   - Define constraints for requirements that need them
   - Multiple constraints can apply to the same requirement
   - All constraints must be satisfied for the requirement to be "met"

4. **Import via CSV Upload**
   - Upload courses first
   - Upload program requirements second
   - Upload requirement constraints last (ensures requirements exist)

## Real-World Example: UNO Biology B.S.

The UNO Biology program requires 17 credits of BIOS electives at the 3000+ level with these constraints:
- At least 10 credits must be at 3000+ level
- At least 2 courses must have laboratory components
- Maximum 7 credits can be research courses

This is implemented using:
1. BIOS courses with proper `has_lab` and `course_type` values
2. A grouped "BIOS Electives" requirement with all eligible courses
3. Three constraints on that requirement

## Migration from Old Format

If you have existing CSV files without the new fields:

**For courses:**
- Add `,false,lecture` to the end of each row
- Update specific courses that have labs or special types

**For program requirements:**
- No changes needed unless adding new constrained requirements
- Create corresponding entries in requirement_constraints_formatted.csv for any requirements needing constraints

## Validation

When importing, the system will validate:
- `course_type` must be one of the valid values
- `has_lab` must be `true` or `false`
- Constraint types must match defined types
- Referenced requirements must exist
- Scope subject codes should match actual course codes
