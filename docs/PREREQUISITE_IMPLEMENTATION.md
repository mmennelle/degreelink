# Course Prerequisite System

## Overview

Prerequisites are handled at the **course level**, allowing for flexible and accurate prerequisite validation that respects equivalencies across institutions.

## System Design

### Requirement Types

**Available types:**
- `simple` = pool of courses (choose any to meet credit goal)
- `grouped` = multiple mandatory subdivisions (must satisfy ALL groups)

Prerequisites are specified per-course in the Course model, not as a requirement type.

### Course-Level Prerequisites

**Course Model** (`backend/models/course.py`):
```python
class Course(db.Model):
    # ... other fields ...
    prerequisites = db.Column(db.Text)  # Comma-separated list of course codes
```

**CSV Format** (courses CSV):
```csv
code,title,description,credits,institution,department,prerequisites,has_lab,course_type
MATH 152,Calculus II,,3,State University,Math,MATH 151,false,lecture
MATH 251,Calculus III,,3,State University,Math,MATH 152,false,lecture
CSCI 2001,Data Structures,,3,State University,CS,"CSCI 1583, MATH 151",false,lecture
```

### 3. Prerequisite Validation Service

**Location:** `backend/services/prerequisite_service.py`

**Key Features:**

#### Parse Prerequisites
Handles various formats:
- `"MATH 101"` → single prerequisite
- `"MATH 101, BIOL 200"` → multiple prerequisites (AND logic)
- `"MATH101"` → normalizes to `"MATH 101"`

#### Transitive Equivalency Support
If Course A at School 1 = Course B at School 2 (equivalent), and Course B is a prerequisite for Course D, then Course A satisfies the prerequisite for Course D.

**Example:**
```
School 1: MATH 101 (Calc I)
School 2: CALC 1 (Calc I)
Equivalency: MATH 101 = CALC 1

School 2: CALC 2 requires CALC 1
Student completed: MATH 101 at School 1

Result: Student CAN take CALC 2 because MATH 101 is equivalent to CALC 1
```

#### Transitive Chain Resolution
Uses BFS (Breadth-First Search) to find all transitively equivalent courses:
- If A = B and B = C, then A, B, and C are all equivalent
- Prerequisites can be satisfied by any course in the equivalency chain

### API Endpoints

**Location:** `backend/routes/prerequisites.py`

#### Check Prerequisites for a Course
```
GET /api/prerequisites/check/<course_code>?plan_id=123
```

Returns:
```json
{
  "can_take": true,
  "missing_prerequisites": [],
  "satisfied_prerequisites": ["MATH 101"],
  "all_prerequisites": ["MATH 101"]
}
```

#### Get Prerequisite Details
```
GET /api/prerequisites/details/<course_code>
```

Returns:
```json
{
  "course_code": "MATH 201",
  "course_title": "Calculus II",
  "found": true,
  "prerequisites": ["MATH 101"],
  "prerequisite_details": [
    {
      "required_code": "MATH 101",
      "equivalent_codes": ["MATH 101", "CALC 1"]
    }
  ]
}
```

#### Validate All Prerequisites in a Plan
```
GET /api/prerequisites/validate-plan/<plan_id>
```

Returns list of courses with prerequisite violations.

#### Suggest Next Courses
```
GET /api/prerequisites/suggest-next-courses/<plan_id>?limit=20
```

Returns courses the student can take based on completed prerequisites.

## CSV Format

### Requirements CSV
```csv
program_name,category,requirement_type,group_name,course_code
"Biology B.S.","Math Sequence",simple,"Math Options",MATH 151
"Biology B.S.","Math Sequence",simple,"Math Options",MATH 152
"Biology B.S.","Math Sequence",simple,"Math Options",MATH 251
```

### Courses CSV with Prerequisites
```csv
code,title,prerequisites
MATH 151,Calculus I,
MATH 152,Calculus II,MATH 151
MATH 251,Calculus III,MATH 152
```

## Usage

### Backend Integration

**Import the service:**
```python
from backend.services.prerequisite_service import PrerequisiteService
```

**Validate prerequisites:**
```python
# Check if a student can take a course
PrerequisiteService.validate_prerequisites(course_code, completed_courses, institution)

# Get prerequisite details for display
PrerequisiteService.get_prerequisite_details(course_code)
```

### Frontend Integration

**Check prerequisites:**
```javascript
GET /api/prerequisites/check/<course_code>?plan_id=123
```

**Display prerequisite information:**
- Show warning indicators for courses with unmet prerequisites
- Use prerequisite details endpoint for informational displays

**Get course suggestions:**
```javascript
GET /api/prerequisites/suggest-next-courses/<plan_id>
```

## Testing

**Test File:** `backend/tests/test_prerequisites.py`

**Coverage:**
- Direct prerequisites (Course A requires Course B)
- Transitive equivalencies (A=B, B required for D → A satisfies prerequisite)
- Cross-institution chains
- Multiple prerequisites (AND logic)
- Missing prerequisites detection
- Courses with no prerequisites
- Non-existent course handling

**Run Tests:**
```bash
cd backend
pytest tests/test_prerequisites.py -v
```

## Validation Rules

### Upload Validation

**Requirements CSV:**
- `requirement_type` must be `simple` or `grouped`
- If `conditional` is specified, upload will fail with error message:
  ```
  'conditional' requirement type is no longer supported.
  Prerequisites are now handled at the course level via the 
  'prerequisites' field in courses. Please use 'simple' or 'grouped'
  requirement types.
  ```

**Courses CSV:**
- `prerequisites` field is optional
- Format: comma-separated course codes
- Example: `"MATH 101, CSCI 1583"`

### Runtime Validation

**Prerequisite Checking:**
1. Parse prerequisite string into individual course codes
2. For each required prerequisite:
   - Find all transitively equivalent courses
   - Check if student has completed any equivalent course
3. Return aggregated results

## Architecture

### Service Layer
```
backend/services/prerequisite_service.py
└── PrerequisiteService (static methods)
    ├── parse_prerequisites()
    ├── get_equivalent_courses()
    ├── get_all_transitive_equivalents()
    ├── check_prerequisite_satisfied()
    ├── validate_prerequisites()
    └── get_prerequisite_details()
```

### API Layer
```
backend/routes/prerequisites.py
└── Blueprint: /api/prerequisites
    ├── GET /check/<course_code>
    ├── GET /details/<course_code>
    ├── GET /validate-plan/<plan_id>
    └── GET /suggest-next-courses/<plan_id>
```

### Data Models
```
Course
├── prerequisites: Text (comma-separated course codes)
└── Used by: PrerequisiteService

Equivalency
├── from_course_id → Course
└── to_course_id → Course
    Used for: Transitive equivalency resolution

PlanCourse
├── status: 'completed', 'in_progress', 'planned'
└── Used for: Determining which prerequisites are satisfied
```

## Examples

### Example 1: Simple Prerequisite
```python
# Student completed MATH 101
# Want to check if they can take MATH 201

result = PrerequisiteService.validate_prerequisites(
    'MATH 201',
    completed_courses=[plan_course_with_math101]
)

# result = {
#     'can_take': True,
#     'satisfied_prerequisites': ['MATH 101'],
#     'missing_prerequisites': [],
#     'all_prerequisites': ['MATH 101']
# }
```

### Example 2: Cross-Institution Equivalency
```python
# Student completed CALC 1 at School 2
# CALC 1 is equivalent to MATH 101 at School 1
# Want to check if they can take MATH 201 at School 1

result = PrerequisiteService.validate_prerequisites(
    'MATH 201',  # Requires MATH 101
    completed_courses=[plan_course_with_calc1]
)

# result = {
#     'can_take': True,  # Because CALC 1 = MATH 101
#     'satisfied_prerequisites': ['MATH 101'],
#     'missing_prerequisites': [],
#     'all_prerequisites': ['MATH 101']
# }
```

### Example 3: Missing Prerequisites
```python
# Student has no completed courses
# Want to check if they can take MATH 301

result = PrerequisiteService.validate_prerequisites(
    'MATH 301',  # Requires MATH 201
    completed_courses=[]
)

# result = {
#     'can_take': False,
#     'satisfied_prerequisites': [],
#     'missing_prerequisites': ['MATH 201'],
#     'all_prerequisites': ['MATH 201']
# }
```

## Benefits

1. **Flexibility:** Prerequisites are defined per-course, not per-program
2. **Accuracy:** Respects equivalencies automatically
3. **Scalability:** BFS algorithm handles complex equivalency chains
4. **Maintainability:** Centralized service for all prerequisite logic
5. **User Experience:** Can provide detailed prerequisite information and suggestions

## Future Enhancements

Potential additions:
- OR logic for prerequisites (A OR B)
- Minimum grade requirements
- Corequisites (must take simultaneously)
- Prerequisite waivers/overrides
- Recommendation engine based on prerequisite chains
