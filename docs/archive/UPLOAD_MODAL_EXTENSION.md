# Upload Confirmation Modal Extension

## Overview
Extended the upload confirmation modal to support preview/confirmation flow for **all CSV upload types** (courses, equivalencies, and requirements), providing a consistent user experience across the application.

## Changes Made

### Backend Changes

#### 1. New Preview Endpoints (`backend/routes/upload.py`)

**Courses Preview Endpoint**
- Route: `POST /api/upload/courses/preview`
- Returns:
  ```json
  {
    "courses": {
      "new": [...],
      "updated": [...],
      "unchanged": [...]
    },
    "errors": [...],
    "warnings": [...]
  }
  ```
- Features:
  - Validates CSV structure and required fields
  - Checks for existing courses using `Course._split_code()`
  - Detects actual changes (title, credits, prerequisites)
  - Provides detailed change descriptions for updated courses

**Equivalencies Preview Endpoint**
- Route: `POST /api/upload/equivalencies/preview`
- Returns:
  ```json
  {
    "equivalencies": {
      "new": [...],
      "updated": [...],
      "unchanged": [...]
    },
    "errors": [...],
    "warnings": [...]
  }
  ```
- Features:
  - Validates course existence for both from/to courses
  - Handles special "1000NE" (No Equivalent) course
  - Detects changes in equivalency type
  - Provides formatted display strings (`from_course`, `to_course`)

### Frontend Changes

#### 2. API Service Updates (`frontend/src/services/api.js`)

Added new preview methods:
```javascript
previewCourses(file)
previewEquivalencies(file)
```

Both methods:
- Accept a File object
- Return preview data structure
- Include authentication headers
- Use FormData for file upload

#### 3. CSV Upload Component (`frontend/src/components/CSVUpload.jsx`)

**Updated `handleFileUpload()`**
- Now calls preview endpoint for ALL upload types (not just requirements)
- Shows confirmation modal for courses and equivalencies uploads
- Uses switch statement to route to correct API method:
  ```javascript
  switch (uploadType) {
    case 'requirements': previewData = await ApiService.previewRequirements(file);
    case 'courses': previewData = await ApiService.previewCourses(file);
    case 'equivalencies': previewData = await ApiService.previewEquivalencies(file);
  }
  ```

**Updated `handleConfirmUpload()`**
- Handles confirmation for all three upload types
- Only refreshes program versions for requirements uploads
- Supports edited data for requirements (courses/equivalencies don't need editing)

**Modal Integration**
- Passes `uploadType` prop to `UploadConfirmationModal`
- Enables type-specific rendering and behavior

#### 4. Upload Confirmation Modal (`frontend/src/components/UploadConfirmationModal.jsx`)

**New Props**
- Added `uploadType` prop (defaults to 'requirements')

**Enhanced State Management**
- Added expanded section states for courses and equivalencies
- Made `editedData` requirements-specific (courses/equivalencies show read-only previews)

**Dynamic Title**
- `getTitle()` method returns appropriate title based on upload type:
  - "Confirm Requirements Upload"
  - "Confirm Courses Upload"
  - "Confirm Equivalencies Upload"

**Type-Specific Summary Display**
- **Requirements**: Shows programs_new, requirements_new/updated, groups_new/deleted, unchanged count
- **Courses**: Shows courses_new, courses_updated, courses_unchanged, total count
- **Equivalencies**: Shows equivalencies_new, equivalencies_updated, equivalencies_unchanged, total count

**New Preview Sections**

*Courses Preview* (when `uploadType === 'courses'`):
- **New Courses Section**: Expandable list showing:
  - Course code and title
  - Institution
  - Credits
  - Prerequisites (if present)
  
- **Updated Courses Section**: Expandable list showing:
  - All course details
  - **Change summary** highlighting what changed (title, credits, prerequisites)

*Equivalencies Preview* (when `uploadType === 'equivalencies'`):
- **New Equivalencies Section**: Expandable list showing:
  - From course → To course mapping
  - Equivalency type
  - Notes (if present)
  
- **Updated Equivalencies Section**: Expandable list showing:
  - Equivalency mapping
  - **Change summary** (e.g., "type: direct → partial")
  - Notes

**Conditional Rendering**
- Wrapped requirements-specific sections in `{uploadType === 'requirements' && ...}`
- Added dedicated sections for courses and equivalencies
- Shared error/warning display for all types
- Maintained editing functionality exclusively for requirements

**Updated `handleConfirm()`**
- For requirements: passes edited data to parent
- For courses/equivalencies: calls confirm without edited data (read-only preview)

## Data Flow

### Requirements Upload Flow (Existing + Enhanced)
1. User selects requirements CSV
2. `previewRequirements()` → Returns programs/requirements/groups structure
3. Modal shows editable preview with inline editing
4. User can modify requirements before confirming
5. Confirm uploads with edited data
6. Refreshes program versions

### Courses Upload Flow (New)
1. User selects courses CSV
2. `previewCourses()` → Returns new/updated/unchanged courses
3. Modal shows **read-only** preview (no inline editing needed)
4. User reviews new and updated courses with change highlights
5. Confirm uploads courses as-is
6. No program version refresh

### Equivalencies Upload Flow (New)
1. User selects equivalencies CSV
2. `previewEquivalencies()` → Returns new/updated/unchanged equivalencies
3. Modal shows **read-only** preview of mappings
4. User reviews equivalency changes
5. Confirm uploads equivalencies as-is
6. No program version refresh

## Benefits

### Consistency
- Unified UX pattern across all CSV upload types
- Same preview/confirm workflow users already know from requirements

### Safety
- Users can review **all** uploads before committing
- Prevents accidental overwrites of courses/equivalencies
- Shows exactly what will change (new/updated/unchanged)

### Clarity
- Clear visualization of changes before they happen
- Detailed change summaries for updated records
- Errors and warnings displayed prominently

### Flexibility
- Requirements maintain inline editing capability
- Courses/equivalencies use simpler read-only preview (appropriate for their use case)
- Modal adapts to data structure automatically

## Technical Notes

### Backend Preview Endpoints
- Both preview endpoints are **idempotent** (no database changes)
- Use existing Course/Equivalency query patterns
- Return consistent error/warning structures
- Handle edge cases (missing courses, invalid data)

### Frontend Modal Design
- Single component handles all three types (DRY principle)
- Conditional rendering based on `uploadType` prop
- Shared UI components (errors, warnings, expandable sections)
- Type-specific summary metrics and data display

### Data Structures
- **Courses**: Simple new/updated/unchanged lists with course info
- **Equivalencies**: Simple new/updated/unchanged lists with mapping info
- **Requirements**: Complex nested structure with programs/requirements/groups
- All types include `errors` and `warnings` arrays

## Future Enhancements

Potential improvements:
1. Add batch delete preview for courses/equivalencies
2. Enable inline editing for courses (if needed)
3. Add "Compare" view showing before/after for updated records
4. Export preview summary to PDF/CSV for record-keeping
5. Add preview caching to avoid re-uploading files

## Testing Recommendations

1. **Test all three upload types**:
   - Upload courses CSV → Verify preview shows correctly
   - Upload equivalencies CSV → Verify mappings display
   - Upload requirements CSV → Verify existing editing still works

2. **Test error handling**:
   - Upload invalid CSV → Verify errors display
   - Upload CSV with missing courses → Verify appropriate errors
   - Upload requirements with errors → Verify can't confirm

3. **Test edge cases**:
   - CSV with only unchanged records → Verify "No changes" message
   - CSV with mix of new/updated/unchanged → Verify all sections show
   - Cancel upload → Verify modal closes and state resets

4. **Test UI/UX**:
   - Expand/collapse sections → Verify smooth transitions
   - Long lists of items → Verify scrolling works
   - Dark mode → Verify all colors/contrast work
