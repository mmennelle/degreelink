# Requirement Type Restructuring - Option A Implementation

## Overview
This document describes the comprehensive restructuring of requirement types and the implementation of course-level prerequisites.

## Requirement Type Changes (November 2025)

### IMPORTANT: `conditional` Requirement Type Removed

The `conditional` requirement type has been **removed** from the system. Prerequisites are now handled at the **course level** rather than the program requirement level.

See [PREREQUISITE_IMPLEMENTATION.md](docs/PREREQUISITE_IMPLEMENTATION.md) for complete details on the new prerequisite system.

## Current Requirement Type Semantics

### SIMPLE
**Purpose:** Pool of courses with a credit goal  
**Behavior:** Students can choose ANY courses from the pool to meet the credit requirement  
**Use Case:** "Choose 15 credits from these biology electives"  
**Database:** Uses RequirementGroup and GroupCourseOption tables

### GROUPED
**Purpose:** Subdivided pool with multiple mandatory groups  
**Behavior:** Students must satisfy ALL groups (each group has its own requirements)  
**Use Case:** "Complete 2 courses from Group A AND 3 courses from Group B"  
**Database:** Uses RequirementGroup and GroupCourseOption tables

### Prerequisites (Course-Level)
**Purpose:** Define course dependencies and sequential requirements  
**Behavior:** Students must complete prerequisite courses before taking dependent courses  
**Use Case:** "MATH 152 requires MATH 151 as prerequisite"  
**Database:** Stored in Course.prerequisites field (comma-separated course codes)  
**Implementation:** See `backend/services/prerequisite_service.py`

## Changes Made

### 1. Backend Models (`backend/models/program.py`)

#### `evaluate_completion()` - Lines 79-85
- **Removed:** `conditional` case from requirement type evaluation
- **Current:** Only handles `simple` and `grouped` types

#### `_evaluate_simple_requirement()` - Lines 91-139
- **Before:** Matched ANY course with matching `requirement_category` field (no course list)
- **After:** Evaluates groups like grouped requirements, but allows choosing ANY courses from pool
- **Backward Compatibility:** Falls back to category-based matching if no groups defined

#### `_evaluate_grouped_requirement()` - Lines 141-168
- **Before:** Accumulated credits from all groups (partial credit)
- **After:** Enforces that ALL groups must be satisfied (no partial credit)
- **Key Change:** Only counts credits from satisfied groups, adds `all_groups_must_be_satisfied: True` flag

#### `_evaluate_conditional_requirement()` - REMOVED
- **Previous:** Placeholder method that called simple logic
- **Current:** Method removed entirely; prerequisites now handled by PrerequisiteService

### 2. Prerequisite Service (`backend/services/prerequisite_service.py`)

**NEW:** Comprehensive prerequisite validation service

Key features:
- Parses prerequisite strings from Course.prerequisites field
- Handles transitive equivalencies (if A=B and B required for D, A satisfies prerequisite)
- Uses BFS to resolve equivalency chains
- Validates prerequisites against student's completed courses

See [PREREQUISITE_IMPLEMENTATION.md](docs/PREREQUISITE_IMPLEMENTATION.md) for details.

### 3. API Endpoints (`backend/routes/prerequisites.py`)

**NEW:** Prerequisite validation endpoints

- `GET /api/prerequisites/check/<course_code>` - Check if student can take a course
- `GET /api/prerequisites/details/<course_code>` - Get prerequisite details with equivalents
- `GET /api/prerequisites/validate-plan/<plan_id>` - Validate all prerequisites in a plan
- `GET /api/prerequisites/suggest-next-courses/<plan_id>` - Suggest courses based on prerequisites

### 4. CSV Upload Logic (`backend/routes/upload.py`)

#### Lines 550-565
- **Added:** Validation to reject `conditional` requirement type
- **Error Message:** Explains that prerequisites are now course-level

#### Lines 355, 385, 685, 713
- **Updated:** Removed `conditional` from requirement type checks
- **Changed:** `['grouped', 'conditional', 'simple']` → `['grouped', 'simple']`

#### Lines 683-685
- **Before:** Deleted groups when requirement type changed from grouped/conditional to simple
- **After:** Removed deletion logic - simple requirements now retain groups

#### Lines 726-738
- **Before:** Only created groups for `requirement_type in ['grouped', 'conditional']`
- **After:** Creates groups for `requirement_type in ['grouped', 'simple']`
- **Enhancement:** Auto-generates default group name for simple requirements if not provided

#### Preview Endpoint Lines 354-357
- **Before:** Only tracked groups for grouped/conditional types
- **After:** Tracks groups for simple and grouped types
- **Before:** Showed group deletion when converting to simple
- **After:** No deletion warnings - simple can have groups

### 5. Bulk Update Endpoint (`backend/routes/programs.py`)

#### Lines 265-279
- **Before:** Only returned groups for grouped/conditional types
- **After:** Returns groups for ALL requirement types including simple

#### Lines 323-383
- **Before:** Only updated groups for `requirement_type in ['grouped', 'conditional']`
- **After:** Updates groups for `requirement_type in ['grouped', 'simple']`
- **Enhancement:** Handles creation of new groups with `new-group-${timestamp}` IDs
- **Enhancement:** Handles creation of new options with `new-option-${timestamp}` IDs

#### Lines 368-380 - NEW Deletion Logic
- **Added:** Compares incoming option IDs with existing options
- **Added:** Deletes options not present in update request
- **Fix:** Course deletion now persists to database

### 6. Frontend Modal (`frontend/src/components/ProgramRequirementsEditModal.jsx`)

#### Component Header (Lines 1-19)
- **Updated:** Removed conditional type from JSDoc
- **Updated:** Explains prerequisites are now course-level

#### Requirement Type Dropdown (Lines 385-392)
- **Before:** Three options: simple, grouped, conditional
- **After:** Two options: simple, grouped

#### Option ID Format (Lines 195, 232)
- **Before:** Used `new-${Date.now()}` for new options
- **After:** Uses `new-option-${Date.now()}` to match backend expectations

#### Functionality
- **No Breaking Changes:** Frontend already created virtual groups for simple requirements
- **Enhancement:** Backend now persists these groups instead of ignoring them

### 5. CSV Upload Interface (`frontend/src/components/CSVUpload.jsx`)

### 7. Frontend CSV Upload Component (`frontend/src/components/CSVUpload.jsx`)

#### Sample CSV (Lines 205-221)
- **Updated:** Removed conditional examples
- **Simple Example:** Shows pool of elective courses with credit goal
- **Grouped Example:** Shows multiple mandatory groups (Theory AND Lab AND Advanced)

#### Instructions (Lines 267-273)
- **Updated:** Changed description to mention two types: simple and grouped
- **Removed:** Reference to conditional type
- **Added:** Note about prerequisites being course-level

#### Type Description (Lines 381-383)
- **Updated:** Changed from "three types" to "two types"
- **Updated:** Added note about course-level prerequisites

#### Upload Tips (Lines 580-588)
- **Updated:** Explains simple and grouped types
- **Removed:** Conditional type bullet point
- **Added:** Explanation that prerequisites are in courses CSV

#### Examples Section (Lines 635-650)
- **Replaced:** Conditional example with course-level prerequisite explanation
- **Updated:** Now shows how to specify prerequisites in courses CSV
- **Simple:** 5 courses, choose any 15 credits
- **Grouped:** 3 groups, must complete all (2 Theory AND 2 Lab AND 3 Advanced)
- **Prerequisites:** Demonstrated via courses CSV format

### 8. Frontend Upload Confirmation Modal (`frontend/src/components/UploadConfirmationModal.jsx`)

#### Requirement Type Dropdowns (Lines 235-247, 325-337)
- **Before:** Three options: simple, grouped, conditional
- **After:** Two options: simple, grouped
- **Removed:** `<option value="conditional">Conditional</option>` from both new and updated requirement sections

## Migration Path

### Existing Data
- **Simple Requirements WITHOUT Groups:** Continue to work via category-based matching (backward compatible)
- **Simple Requirements WITH Groups:** Now possible - courses will be evaluated from group pool
## Migration Path

### Existing Data (Backward Compatibility)
- **Simple Requirements without groups:** Continue to work - use category-based matching as before
- **Simple Requirements with groups:** Now fully supported in UI and evaluation
- **Grouped Requirements:** No changes - continue to work as before
- **Conditional Requirements:** **BREAKING CHANGE** - Type removed, must be converted to simple/grouped

### Converting Conditional to Course-Level Prerequisites

**Before (Conditional Requirement):**
```csv
program_name,category,requirement_type,course_code
"Biology B.S.","Math Sequence",conditional,MATH 151
"Biology B.S.","Math Sequence",conditional,MATH 152
"Biology B.S.","Math Sequence",conditional,MATH 251
```

**After (Simple Requirement + Course Prerequisites):**

**Requirements CSV:**
```csv
program_name,category,requirement_type,course_code
"Biology B.S.","Math Sequence",simple,MATH 151
"Biology B.S.","Math Sequence",simple,MATH 152
"Biology B.S.","Math Sequence",simple,MATH 251
```

**Courses CSV:**
```csv
code,title,prerequisites
MATH 151,Calculus I,
MATH 152,Calculus II,MATH 151
MATH 251,Calculus III,MATH 152
```

### New Data
- **Simple Requirements:** Can have groups and course lists
- **CSV Upload:** Automatically creates groups for simple requirements
- **UI Editing:** Can add/remove courses from simple requirements and they persist
- **Prerequisites:** Specified per-course, validated with equivalency support

## Testing Checklist

### Backend Tests
- [x] Simple requirement with groups evaluates correctly
- [x] Simple requirement without groups still uses category matching (backward compat)
- [x] Grouped requirement enforces ALL groups satisfied
- [x] Conditional requirement type rejected in CSV upload
- [x] CSV upload creates groups for simple type
- [x] Bulk update creates new groups for simple requirements
- [x] Bulk update creates new options with new-option- prefix
- [x] Course deletion persists to database
- [x] Prerequisites parse correctly from course field
- [x] Transitive equivalencies resolve correctly
- [x] Cross-institution prerequisites validate

### Frontend Tests
- [x] Edit modal shows courses for simple requirements
- [x] Can add courses to simple requirements
- [x] Can delete courses from simple requirements
- [x] Save persists changes for simple requirements
- [x] Sample CSV downloads correctly (without conditional examples)
- [x] Instructions display new semantics
- [x] Examples show correct usage
- [x] Conditional option removed from dropdowns

### Integration Tests
- [x] Upload simple requirement CSV with groups
- [x] Edit simple requirement via UI
- [x] Verify groups saved to database
- [x] Verify evaluation logic works correctly
- [x] Verify constraints work with simple requirements
- [x] Prerequisites validated via API endpoints
- [x] Suggest next courses based on prerequisites

## Benefits

1. **Consistency:** All requirement types now use the same database structure
2. **Flexibility:** Users can manage course lists for all types via UI
3. **Clarity:** Requirement types match user mental model
4. **No Data Loss:** Backward compatible with existing simple requirements
5. **Accurate Prerequisites:** Course-level prerequisites with equivalency support
6. **Cross-Institution Support:** Prerequisites work across equivalent courses at different schools
7. **Scalability:** BFS algorithm handles complex equivalency chains efficiently

## Future Enhancements

1. **Conditional Logic:** Implement actual prerequisite chain validation
2. **Constraint Migration:** Update constraint evaluation for new grouped semantics
3. **UI Indicators:** Visual distinction between requirement types in UI
4. **Validation:** Warn when creating grouped requirement with only one group
