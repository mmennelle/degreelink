# Requirement Type Restructuring - Option A Implementation

## Overview
This document describes the comprehensive restructuring of requirement types to align with user expectations and enable proper course management for all requirement types.

## New Requirement Type Semantics

### SIMPLE
**Purpose:** Pool of courses with a credit goal  
**Behavior:** Students can choose ANY courses from the pool to meet the credit requirement  
**Use Case:** "Choose 15 credits from these biology electives"  
**Database:** Now uses RequirementGroup and GroupCourseOption tables (previously only category-based matching)

### GROUPED
**Purpose:** Subdivided pool with multiple mandatory groups  
**Behavior:** Students must satisfy ALL groups (each group has its own requirements)  
**Use Case:** "Complete 2 courses from Group A AND 3 courses from Group B"  
**Database:** Uses RequirementGroup and GroupCourseOption tables (unchanged)

### CONDITIONAL
**Purpose:** Sequential/prerequisite-based requirements  
**Behavior:** Courses must be completed in a specific order based on prerequisites  
**Use Case:** "Take MATH 101 before MATH 201"  
**Database:** Uses RequirementGroup and GroupCourseOption tables  
**Note:** Full prerequisite logic pending - currently treated as simple

## Changes Made

### 1. Backend Models (`backend/models/program.py`)

#### `_evaluate_simple_requirement()` - Lines 91-139
- **Before:** Matched ANY course with matching `requirement_category` field (no course list)
- **After:** Evaluates groups like grouped requirements, but allows choosing ANY courses from pool
- **Backward Compatibility:** Falls back to category-based matching if no groups defined

#### `_evaluate_grouped_requirement()` - Lines 141-168
- **Before:** Accumulated credits from all groups (partial credit)
- **After:** Enforces that ALL groups must be satisfied (no partial credit)
- **Key Change:** Only counts credits from satisfied groups, adds `all_groups_must_be_satisfied: True` flag

#### `_evaluate_conditional_requirement()` - Lines 170-178
- **Before:** Placeholder calling simple logic
- **After:** Documented placeholder with TODO for prerequisite chain validation
- **Future:** Will implement proper prerequisite ordering logic

### 2. CSV Upload Logic (`backend/routes/upload.py`)

#### Lines 683-685
- **Before:** Deleted groups when requirement type changed from grouped/conditional to simple
- **After:** Removed deletion logic - simple requirements now retain groups

#### Lines 726-738
- **Before:** Only created groups for `requirement_type in ['grouped', 'conditional']`
- **After:** Creates groups for `requirement_type in ['grouped', 'conditional', 'simple']`
- **Enhancement:** Auto-generates default group name for simple requirements if not provided

#### Preview Endpoint Lines 354-357
- **Before:** Only tracked groups for grouped/conditional types
- **After:** Tracks groups for all types including simple
- **Before:** Showed group deletion when converting to simple
- **After:** No deletion warnings - simple can have groups

### 3. Bulk Update Endpoint (`backend/routes/programs.py`)

#### Lines 323-383
- **Before:** Only updated groups for `requirement_type in ['grouped', 'conditional']`
- **After:** Updates groups for `requirement_type in ['grouped', 'conditional', 'simple']`
- **Enhancement:** Handles creation of new groups with `new-group-${timestamp}` IDs
- **Enhancement:** Handles creation of new options with `new-option-${timestamp}` IDs

### 4. Frontend Modal (`frontend/src/components/ProgramRequirementsEditModal.jsx`)

#### Component Header (Lines 1-22)
- **Added:** Comprehensive JSDoc explaining all three requirement types

#### Option ID Format (Lines 195, 232)
- **Before:** Used `new-${Date.now()}` for new options
- **After:** Uses `new-option-${Date.now()}` to match backend expectations

#### Functionality
- **No Breaking Changes:** Frontend already created virtual groups for simple requirements
- **Enhancement:** Backend now persists these groups instead of ignoring them

### 5. CSV Upload Interface (`frontend/src/components/CSVUpload.jsx`)

#### Sample CSV (Lines 205-224)
- **Updated:** New examples demonstrating all three requirement types
- **Simple Example:** Shows pool of elective courses with credit goal
- **Grouped Example:** Shows multiple mandatory groups (Theory AND Lab AND Advanced)
- **Conditional Example:** Shows sequential math courses (Calc I → II → III)

#### Instructions (Lines 267-271)
- **Updated:** Clear descriptions of each type in column documentation
- **Simple:** "pool of courses (choose any to meet credits)"
- **Grouped:** "all groups required"
- **Conditional:** "sequential/prerequisite"

#### Type Description (Lines 381-383)
- **Updated:** Brief summary of three types in upload UI

#### Upload Tips (Lines 584-591)
- **Updated:** Explains each type with concrete examples
- **Removed:** Old category-level vs group-level constraint terminology
- **Added:** Clear semantics for each requirement type

#### Examples Section (Lines 619-651)
- **Replaced:** Old category/group constraint examples
- **Added:** Three clear examples showing proper usage of each type
- **Simple:** 5 courses, choose any 15 credits
- **Grouped:** 3 groups, must complete all (2 Theory AND 2 Lab AND 3 Advanced)
- **Conditional:** 3 sequential courses (Calc I → II → III)

## Migration Path

### Existing Data
- **Simple Requirements WITHOUT Groups:** Continue to work via category-based matching (backward compatible)
- **Simple Requirements WITH Groups:** Now possible - courses will be evaluated from group pool
- **Grouped Requirements:** No changes - continue to work as before
- **Conditional Requirements:** No breaking changes - still treated as simple

### New Data
- **Simple Requirements:** Can now have groups and course lists
- **CSV Upload:** Automatically creates groups for simple requirements
- **UI Editing:** Can add/remove courses from simple requirements and they persist

## Testing Checklist

### Backend Tests
- [ ] Simple requirement with groups evaluates correctly
- [ ] Simple requirement without groups still uses category matching (backward compat)
- [ ] Grouped requirement enforces ALL groups satisfied
- [ ] Conditional requirement works (currently as simple)
- [ ] CSV upload creates groups for simple type
- [ ] Bulk update creates new groups for simple requirements
- [ ] Bulk update creates new options with new-option- prefix

### Frontend Tests
- [ ] Edit modal shows courses for simple requirements
- [ ] Can add courses to simple requirements
- [ ] Can delete courses from simple requirements
- [ ] Save persists changes for simple requirements
- [ ] Sample CSV downloads correctly
- [ ] Instructions display new semantics
- [ ] Examples show correct usage

### Integration Tests
- [ ] Upload simple requirement CSV with groups
- [ ] Edit simple requirement via UI
- [ ] Verify groups saved to database
- [ ] Verify evaluation logic works correctly
- [ ] Verify constraints work with simple requirements

## Benefits

1. **Consistency:** All requirement types now use the same database structure
2. **Flexibility:** Users can manage course lists for all types via UI
3. **Clarity:** Requirement types match user mental model
4. **No Data Loss:** Backward compatible with existing simple requirements
5. **Future-Ready:** Structure supports prerequisite logic for conditional type

## Future Enhancements

1. **Conditional Logic:** Implement actual prerequisite chain validation
2. **Constraint Migration:** Update constraint evaluation for new grouped semantics
3. **UI Indicators:** Visual distinction between requirement types in UI
4. **Validation:** Warn when creating grouped requirement with only one group
