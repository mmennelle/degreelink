# Advisor-Student Linking Feature

## Overview
This feature allows students to link their academic plans with advisors by providing the advisor's email during plan creation. Advisors can then access all plans associated with them through a dedicated Advisor Center page with powerful search and filtering capabilities.

## Implementation Summary

### Database Changes
- **New Column**: Added `advisor_email` to the `plans` table
- **Foreign Key**: Links to `advisor_auth.email` with `ON DELETE SET NULL` behavior
- **Index**: Created on `advisor_email` for efficient lookups
- **Migration**: `0400c4e9198b_add_advisor_email_to_plans_table.py`

### Backend Changes

#### 1. Plan Model (`backend/models/plan.py`)
- Added `advisor_email` column (String, nullable, indexed)
- Added foreign key relationship to `advisor_auth` table
- Added `advisor` relationship to `AdvisorAuth` model
- Updated `to_dict()` method to include `advisor_email`

#### 2. Plan Routes (`backend/routes/plans.py`)
**Create Plan Endpoint** (`POST /api/plans`):
- Accepts `advisor_email` in request body
- Validates and normalizes advisor email (lowercase, trimmed)
- Allows non-whitelisted advisor emails (they can be whitelisted later)
- Logs when plan is created with non-whitelisted advisor

**Update Plan Endpoint** (`PUT /api/plans/<id>`):
- Added `advisor_email` to allowed update fields
- Validates and normalizes advisor email on update

#### 3. Advisor Auth Routes (`backend/routes/advisor_auth.py`)
**New Endpoints**:

**GET /api/advisor-auth/advisor-center/plans**
- Returns all plans associated with authenticated advisor
- Requires active advisor session token
- Query parameters:
  - `search`: Search by student name, email, plan name, or plan code
  - `status`: Filter by plan status (draft, active, completed, etc.)
  - `program_id`: Filter by target program ID
  - `sort`: Sort field (created_at, updated_at, student_name, plan_name)
  - `order`: Sort order (asc, desc)
  - `limit`: Results per page (default 50, max 200)
  - `offset`: Pagination offset

**GET /api/advisor-auth/advisor-center/stats**
- Returns statistics for authenticated advisor
- Includes:
  - Total number of plans
  - Plans by status breakdown
  - Number of plans created in last 30 days

### Frontend Changes

#### 1. CreatePlanModal Component (`frontend/src/components/CreatePlanModal.jsx`)
- Added `advisor_email` field to form state
- Added advisor email input field with validation
- Email is optional during plan creation
- Validates email format if provided
- Includes helpful text: "Optional: Link this plan to your advisor for guidance"

#### 2. New AdvisorCenter Component (`frontend/src/components/AdvisorCenter.jsx`)
A comprehensive dashboard for advisors featuring:

**Statistics Dashboard**:
- Total plans count
- Recent plans (last 30 days)
- Status breakdown (draft, active, completed, etc.)

**Search & Filter**:
- Real-time search by student name, email, or plan name
- Filter by plan status
- Sort by multiple fields (recently updated, created, student name)
- Ascending/descending sort toggle

**Plans List**:
- Displays all associated plans with key information
- Shows student name, email, plan name
- Displays status badges with color coding
- Shows creation and update dates
- Click to open plan in new tab
- Displays plan codes for easy reference

**Pagination**:
- Supports large numbers of plans
- 20 plans per page
- Easy navigation between pages

#### 3. API Service (`frontend/src/services/api.js`)
Added two new methods:

**getAdvisorPlans(params)**:
- Fetches plans for authenticated advisor
- Supports all query parameters for search/filter/sort
- Includes advisor session token in headers

**getAdvisorStats()**:
- Fetches statistics for authenticated advisor
- Includes advisor session token in headers

## Usage Flow

### For Students:
1. Create a new plan using the Create Plan form
2. Optionally enter advisor's email in the "Advisor Email" field
3. Plan is created and linked to the advisor (if email provided)
4. Student can update advisor email later if needed

### For Advisors:
1. Log in to advisor portal using whitelisted email
2. Navigate to Advisor Center
3. View all plans where students have provided their email
4. Use search to find specific students or plans
5. Filter by status or program
6. Sort plans by various criteria
7. Click on any plan to view details in new tab

## Security Considerations

1. **Advisor Authentication Required**: All Advisor Center endpoints require valid session token
2. **Session Validation**: Tokens are checked for expiration on every request
3. **No Plan Modification**: Advisors can only view plans, not modify them
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse
5. **Data Privacy**: Only advisors see plans linked to their email

## Benefits

1. **Flexible**: Students can link to advisors even if not whitelisted yet
2. **Searchable**: Advisors can quickly find specific students or plans
3. **Organized**: Status filters help advisors prioritize work
4. **Efficient**: Pagination handles large numbers of plans
5. **Transparent**: Plan codes visible for easy reference
6. **User-Friendly**: Intuitive interface with clear visual feedback

## Future Enhancements

Potential improvements:
1. **Email Notifications**: Notify advisors when students link plans to them
2. **Bulk Actions**: Allow advisors to perform actions on multiple plans
3. **Notes/Comments**: Let advisors add notes to student plans
4. **Export**: Export plan lists to CSV or PDF
5. **Advanced Filters**: Filter by program, date ranges, course completion
6. **Plan Comparison**: Compare multiple student plans side-by-side
7. **Status Updates**: Allow advisors to mark plans with review status
8. **Direct Messaging**: Communication channel between student and advisor

## Testing

To test the feature:

1. **Create a plan with advisor email**:
   ```bash
   POST /api/plans
   {
     "student_name": "John Doe",
     "student_email": "john@example.com",
     "advisor_email": "advisor@example.com",
     "plan_name": "Fall 2025 Transfer Plan",
     "program_id": 1
   }
   ```

2. **Login as advisor**:
   ```bash
   POST /api/advisor-auth/request-code
   { "email": "advisor@example.com" }
   
   POST /api/advisor-auth/verify-code
   { "email": "advisor@example.com", "code": "123456" }
   ```

3. **Access Advisor Center**:
   - Navigate to `/advisor-center` (route needs to be added to frontend router)
   - Or directly call API: `GET /api/advisor-auth/advisor-center/plans`

4. **Test search and filters**:
   ```bash
   GET /api/advisor-auth/advisor-center/plans?search=john&status=draft&sort=updated_at&order=desc
   ```

## Database Migration

The migration has been created and applied:
```bash
flask db revision -m "Add advisor_email to plans table"
flask db upgrade
```

To rollback if needed:
```bash
flask db downgrade
```

## Notes

- Advisor email is **optional** when creating a plan
- Advisor email can be updated later via the plan update endpoint
- Advisors don't need to be whitelisted at the time of plan creation
- Plans are automatically linked when a student provides an advisor email
- If an advisor is removed from the whitelist, their associated plans set `advisor_email` to NULL (due to ON DELETE SET NULL)
