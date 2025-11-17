# CSV Authoring Guide for Grouped Requirements

This guide explains how to author program requirements using the grouped requirement system, particularly for complex degree programs like UNO's Biology BS.

## Overview

Grouped requirements allow you to define precise course options that satisfy specific program requirements. Unlike simple requirements that accept any course in a category, grouped requirements enforce literal course code matching.

## When to Use Grouped Requirements

Use `requirement_type='grouped'` when:
- Students must choose from a specific list of courses (e.g., "Choose 1 from ENGL 1157, ENGL 1158, ENGL 2122")
- You need to track multiple choice groups within a single requirement
- Zero-credit requirements need to be tracked (e.g., exit exams, advising sessions)
- You want auto-assignment of courses to specific requirement groups

## CSV Format

### program_requirements_formatted.csv

```csv
program_id,category,credits_required,description,requirement_type,is_flexible,priority_order,semester,year,is_current
1,Core Biology,12,Choose 4 core courses,grouped,false,1,,,true
1,Mathematics,6,Math sequence,simple,false,2,,,true
```

**Key fields:**
- `requirement_type`: Use `'grouped'` for grouped requirements, `'simple'` for traditional requirements
- `credits_required`: Total credits needed for the entire requirement (can be met across multiple groups)
- `priority_order`: Lower numbers = higher priority for auto-assignment conflicts

### requirement_groups.csv

```csv
requirement_id,group_name,courses_required,credits_required,min_credits_per_course,max_credits_per_course,description,is_required
1,Core Biology Group A,1,0,3,,Choose 1 from Biology core,true
1,Core Biology Group B,1,0,3,,Choose 1 from advanced Biology,true
2,Exit Exam,0,0,,,Complete exit exam,true
```

**Key fields:**
- `courses_required`: Number of courses needed from this group (use 0 for credit-only requirements)
- `credits_required`: Total credits needed from this group (use 0 for course-count-only requirements)
- `min_credits_per_course`, `max_credits_per_course`: Optional filters on course credit values

**Important:** At least one of `courses_required` or `credits_required` must be non-zero (unless it's a zero-credit requirement like an exit exam where both can be 0).

### group_course_options.csv

```csv
group_id,course_code,institution,is_preferred,notes
1,BIOS 1010,UNO,true,Recommended for first-year students
1,BIOS 1020,UNO,false,Alternative core course
2,BIOS 4010,UNO,true,Exit exam course
```

**Key fields:**
- `course_code`: Must match the Course.code format exactly (with spaces, e.g., "BIOS 1010" not "BIOS1010")
- `institution`: Optional; helps distinguish courses with same code at different institutions
- `is_preferred`: When `true`, auto-assignment will prefer this option if a course matches multiple groups
- `notes`: Optional metadata for advisors

## Auto-Assignment Rules

When a student adds a course to their plan, the system automatically assigns it to a requirement group using this priority:

1. **is_preferred match**: If the course matches multiple groups, prefer groups where `is_preferred=true`
2. **priority_order**: Among remaining matches, use the requirement with lowest `priority_order`
3. **Strictest requirement**: Among remaining matches, prefer groups with higher `courses_required` (more restrictive)
4. **First created**: If still tied, use the group created first (lowest ID)

**Logging:** Ambiguous matches (course matches multiple groups) are logged for data cleanup review.

## Best Practices

### 1. Separate Groups for Different Sequences

**DON'T** mix incompatible sequences in one group:
```csv
group_id,group_name,courses_required
1,Physics Sequence,2
```
```csv
group_id,course_code
1,PHYS 1031  # Algebra-based track
1,PHYS 1032
1,PHYS 1061  # Calculus-based track
1,PHYS 1062
```
Problem: Student could take PHYS 1031 + PHYS 1061 (incompatible mix).

**DO** create separate groups for each sequence:
```csv
group_id,group_name,courses_required
1,Physics Sequence A,2
2,Physics Sequence B,2
```
```csv
group_id,course_code
1,PHYS 1031
1,PHYS 1032
2,PHYS 1061
2,PHYS 1062
```

### 2. Use is_preferred for Recommended Paths

Mark preferred options to guide auto-assignment:
```csv
group_id,course_code,is_preferred,notes
1,MATH 1125,false,Traditional sequence
1,MATH 1126,false,Traditional sequence
1,MATH 2114,true,Recommended for STEM majors
1,MATH 2124,true,Recommended for STEM majors
```

### 3. Zero-Credit Requirements

For non-credit requirements (exit exams, advising, etc.):
```csv
requirement_id,category,credits_required,requirement_type
5,Exit Requirements,0,grouped
```
```csv
requirement_id,group_name,courses_required,credits_required
5,Exit Exam,0,0
```
```csv
group_id,course_code
5,BIOS 4010
```

### 4. Flexible Credit Requirements

When students need X credits from a pool of options:
```csv
requirement_id,group_name,courses_required,credits_required
7,Biology Electives,0,17
```
This allows any combination of courses totaling 17+ credits.

### 5. Course Count Requirements

When students need exactly N courses (regardless of credits):
```csv
requirement_id,group_name,courses_required,credits_required
8,Core Sciences,4,0
```
This requires exactly 4 courses, credits don't matter.

## Example: Complete Biology Core Requirement

```csv
# program_requirements_formatted.csv
program_id,category,credits_required,description,requirement_type,priority_order,is_current
1,Core Biology Courses,12,Complete 4 core biology courses,grouped,1,true

# requirement_groups.csv
requirement_id,group_name,courses_required,credits_required,min_credits_per_course,description
1,Foundational Biology,2,0,3,Choose 2 from foundational courses
1,Advanced Biology,2,0,3,Choose 2 from advanced courses

# group_course_options.csv
group_id,course_code,institution,is_preferred
1,BIOS 1010,UNO,true
1,BIOS 1020,UNO,true
1,BIOS 1030,UNO,false
2,BIOS 3010,UNO,false
2,BIOS 3020,UNO,false
2,BIOS 4010,UNO,true
```

## Validation Rules

The system enforces these rules:
1. Course codes in GroupCourseOption must exist in the courses table
2. Grouped requirements must have at least one group
3. Each group must have at least one course option (except zero-credit groups)
4. `courses_required` must be > 0 OR `credits_required` must be > 0 (both can't be NULL unless both are 0)
5. Course codes must use the normalized format with spaces (e.g., "BIOS 1010")

## Testing Your Requirements

After importing your CSV data, test with these scenarios:
1. **Partial completion**: Add some but not all required courses
2. **Multiple groups**: Verify courses auto-assign to correct groups
3. **Preferred options**: Check that `is_preferred` courses are chosen in conflicts
4. **Zero-credit groups**: Confirm they show as "met" when completed
5. **Legacy behavior**: Test "All Courses" view includes planned/in-progress courses

## Feature Flags

Enable grouped evaluation with environment variables:
```bash
PROGRESS_USE_GROUPED_EVALUATION=true
AUTO_ASSIGN_REQUIREMENT_GROUPS=true
```

Without these flags, the system falls back to legacy category-based matching.
