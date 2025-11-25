# Unified CSV Implementation Summary

## Date: January 2025

## Problem Statement
The system required two separate CSV uploads for program requirements:
1. Program Requirements CSV - listing courses and grouping rules
2. Requirement Constraints CSV - defining UNO-level constraints

This created redundancy (`credits_required` vs `min_credits`, `courses_required` vs `min_courses`) and required users to upload two coordinated files.

## Solution
Combined both CSVs into a single unified format where constraint columns are optional and only filled on the first row of each category.

## Changes Made

### 1. Backend - `backend/routes/upload.py`

#### Modified `/upload/requirements` Endpoint (Lines 340-635)

**Added:**
- `category_constraints` dictionary to track constraints per category
- Parsing of 8 constraint columns:
  - `min_credits`, `max_credits`
  - `min_courses`, `max_courses`
  - `min_level`, `min_courses_at_level`
  - `tag_requirement`, `scope_subject_codes`
- Changed validation from `course_option` to `course_code`
- Fourth pass to create `RequirementConstraint` records
- Constraint type detection:
  - Credits constraint: if `min_credits` or `max_credits` present
  - Courses constraint: if `min_courses` or `max_courses` present
  - Level constraint: if `min_level` or `min_courses_at_level` present
  - Tag constraint: if `tag_requirement` present (format: "tag:value:count")
  - Scope constraint: if `scope_subject_codes` present

**Updated Response:**
- Added `constraints_created` count to success response

**Backward Compatibility:**
- Still accepts legacy format with `course_option`, `courses_required`, `credits_required_group`
- Supports old column names for existing data files

### 2. Frontend - `frontend/src/components/CSVUpload.jsx`

#### Removed Constraints Upload Type
- Removed "Requirement Constraints" option from dropdown (line 328)
- Removed constraints case from switch statement (line 58-70)
- Updated type description to mention embedded constraints (line 333)

#### Updated Sample CSV (Lines 135-154)
- Changed from legacy format to unified format
- Shows constraint columns on first row
- Uses `course_code` instead of `course_option`
- Removed `constraints` sample CSV generation

#### Updated Instructions (Lines 196-220)
- Removed separate constraints section
- Added constraint columns to requirements instructions
- Noted constraints are optional and first-row only
- Added examples showing `tag_requirement` format

#### Updated Success Message (Lines 250-260)
- Shows `constraints_created` count if > 0
- Removed separate constraints success case

### 3. Documentation

#### Created `docs/UNIFIED_CSV_FORMAT.md`
Comprehensive documentation covering:
- Column definitions with examples
- Constraint types and how they're processed
- Backend processing flow (5 passes)
- Migration guide from legacy format
- Benefits of unified structure

#### Created `docs/equic-csvs/sample-templates/unified_program_requirements.csv`
Sample CSV showing:
- Biology B.S. program
- BIOS Electives with embedded constraints
- Humanities with grouped requirements
- Proper formatting of constraint columns

## Constraint Column Details

### Format

**First Row of Category** (with constraints):
```csv
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"State University",false,10,"",3,"",3000,2,has_lab:true:2,BIOS
```

**Subsequent Rows** (course listings):
```csv
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"State University",true,"","","","","","","",""
```

### Tag Requirement Format
`tag_name:tag_value:count`

Examples:
- `has_lab:true:2` - At least 2 courses must have labs
- `course_type:research:1` - At least 1 research course
- `course_type:seminar:1` - At least 1 seminar course

## Benefits

1. **Simplified Workflow**: One upload instead of two
2. **Reduced Redundancy**: Eliminated duplicate fields
3. **Better Context**: Constraints visible with the courses they constrain
4. **Easier Maintenance**: Update requirements and constraints together
5. **Clearer Intent**: Column names more intuitive (`course_code` vs `course_option`)

## Testing Required

1. **Upload Test**: Use `docs/equic-csvs/sample-templates/unified_program_requirements.csv`
2. **Real Data Test**: Convert user's `current_dcc_prog-reqs_associate_92525.csv` and `target_uno_prog-reqs_bachelors_92525.csv` to new format
3. **Constraint Validation**: Verify constraints are created correctly
4. **Backward Compatibility**: Ensure legacy format still works

## Migration Path

For users with existing CSV files:

### Option 1: Continue Using Legacy Format
- Old files will still work
- No changes needed
- Backend supports both formats

### Option 2: Convert to Unified Format
1. Remove `credits_required`, `courses_required`, `credits_required_group` columns
2. Rename `course_option` to `course_code`
3. Add constraint columns (optional)
4. Fill constraint values on first row of each category only

## Files Modified

1. `backend/routes/upload.py` - Requirements upload logic
2. `frontend/src/components/CSVUpload.jsx` - Upload UI and instructions
3. `docs/UNIFIED_CSV_FORMAT.md` - New documentation
4. `docs/equic-csvs/sample-templates/unified_program_requirements.csv` - New sample

## Known Limitations

1. Tag requirement format is rigid (must be exactly "tag:value:count")
2. All constraints for a category must be on the same first row
3. No validation that constraint columns are only on first row (extra values ignored)
4. Scope must use exact subject codes (no wildcard matching)

## Next Steps

1. Test with sample CSV
2. Convert user's real 92525 files if needed
3. Document constraint evaluation logic in `Plan._evaluate_grouped_requirement()`
4. Consider deprecating `/upload/constraints` endpoint in future version
