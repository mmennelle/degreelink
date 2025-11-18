# Scope Subject Codes Delimiter Change

## Issue
Using commas as delimiters for `scope_subject_codes` in CSV files was problematic because commas are the column separator in CSV format. This would cause values to be pushed into different cells unless carefully quoted.

## Solution
Changed the delimiter from **comma** (`,`) to **whitespace** (` `) for the `scope_subject_codes` field.

### Old Format (Problematic)
```csv
scope_subject_codes
"BIOS,CHEM"
```
- Required quotes around the value
- Commas conflict with CSV structure
- Easy to forget quotes and break parsing

### New Format (Improved)
```csv
scope_subject_codes
BIOS CHEM
```
- No quotes needed (though still allowed)
- Natural whitespace delimiter
- No conflict with CSV column separators
- Simpler and cleaner

## Changes Made

### Backend (`backend/routes/upload.py`)

**Line 999: Requirements upload endpoint**
```python
# OLD:
subject_list = [s.strip() for s in scope_subjects.split(',') if s.strip()]

# NEW:
subject_list = [s.strip() for s in scope_subjects.split() if s.strip()]
```

**Line 830: Constraints upload endpoint**
```python
# OLD:
subject_codes = [s.strip() for s in scope_subjects.split(',') if s.strip()]

# NEW:
subject_codes = [s.strip() for s in scope_subjects.split() if s.strip()]
```

**Technical Note:** Python's `.split()` without arguments splits on any whitespace and automatically handles multiple spaces, tabs, and leading/trailing whitespace.

### Frontend (`frontend/src/components/CSVUpload.jsx`)

**Line 298: Column description**
```javascript
// OLD:
{ name: 'scope_subject_codes', description: 'Limit to subjects (comma-separated: "BIOS,CHEM")', required: false }

// NEW:
{ name: 'scope_subject_codes', description: 'Limit to subjects (space-separated: "BIOS CHEM")', required: false }
```

### Documentation

**`docs/UNIFIED_CSV_FORMAT.md`:**
- Updated Section D (Constraint Scope Filters)
- Updated Section 5 (Scope Filter examples)
- Changed format from `"BIOS,CHEM"` to `BIOS CHEM`
- Updated table showing comma-separated → space-separated

## Examples

### Single Subject (No Change Needed)
```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,description,min_credits,scope_subject_codes
"Biology B.S.","Electives",simple,Fall,2025,true,"Options",BIOS 301,"State U",false,credits,"10 cr min",10,BIOS
```

### Multiple Subjects (Now Simpler)
```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,description,min_credits,scope_subject_codes
"Biology B.S.","Science Electives",simple,Fall,2025,true,"Options",BIOS 301,"State U",false,credits,"15 cr min",15,BIOS CHEM PHYS
```

### With Tabs (Also Works)
```csv
scope_subject_codes
BIOS	CHEM	PHYS
```
All whitespace is treated the same way.

## Backward Compatibility

### Breaking Change
❗ **This is a breaking change** for any existing CSV files that use comma-separated subject codes like `"BIOS,CHEM"`.

### Migration Guide
If you have existing CSV files with comma-separated values:

**Before:**
```csv
scope_subject_codes
"BIOS,CHEM,PHYS"
```

**After:**
```csv
scope_subject_codes
BIOS CHEM PHYS
```

**Quick Fix:** Global find/replace in your CSV files:
1. Find: `"([A-Z]+),([A-Z]+)"`
2. Replace: `$1 $2`
3. Remove extra quotes if needed

### Existing Data
Existing constraints in the database are **not affected** - only CSV uploads use this parsing logic. The database stores subject codes as a JSON array internally.

## Benefits

1. **CSV-Friendly:** No more conflicts with CSV column separators
2. **Simpler Syntax:** No quotes required for multiple values
3. **More Readable:** `BIOS CHEM` is cleaner than `"BIOS,CHEM"`
4. **Flexible:** Works with any whitespace (spaces, tabs, multiple spaces)
5. **Standard Pattern:** Many CSV formats use whitespace for multi-value fields

## Testing

### Test Data Compatibility
The existing test file `backend/tests/test_csv_constraints.py` already uses single subject codes like `BIOS` without commas, so all tests continue to pass without modification.

### Manual Testing
To test multiple subjects:
```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,min_credits,scope_subject_codes
"Test Program","Science",simple,Fall,2025,true,"Options",BIOS 101,"Test U",false,credits,10,BIOS CHEM BIO
```

Upload this and verify:
1. Constraint is created
2. `scope_filter` JSON contains: `{"subject_codes": ["BIOS", "CHEM", "BIO"]}`
3. Constraint evaluation only counts courses from those three subjects

## Future Considerations

### Alternative Delimiters Considered
- **Comma** `,` - Conflicts with CSV (rejected)
- **Semicolon** `;` - Less natural, would still need quotes
- **Pipe** `|` - Uncommon, harder to type
- **Whitespace** ` ` - **Selected** - Natural, CSV-friendly

### Potential Future Enhancement
Could add support for **both** formats for backward compatibility:
```python
# Try comma-separated first, fall back to whitespace
if ',' in scope_subjects:
    subject_list = [s.strip() for s in scope_subjects.split(',') if s.strip()]
else:
    subject_list = [s.strip() for s in scope_subjects.split() if s.strip()]
```

But this adds complexity and the whitespace approach is superior, so keeping it simple for now.

## Related Files Updated
- ✅ `backend/routes/upload.py` (2 locations)
- ✅ `frontend/src/components/CSVUpload.jsx` (1 location)
- ✅ `docs/UNIFIED_CSV_FORMAT.md` (2 sections)
- ⚠️  Sample CSV files not updated (they use single values, already compatible)
- ⚠️  Test files not updated (they use single values, already compatible)
