# Program Requirements Upload Guide
**For Academic Advisors and Program Administrators**

*Last Updated: November 25, 2025*

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Upload Process Overview](#upload-process-overview)
3. [Creating Your CSV File](#creating-your-csv-file)
4. [Understanding Constraints](#understanding-constraints)
5. [Confirmation and Editing](#confirmation-and-editing)
6. [Complete Examples](#complete-examples)
7. [Tips and Best Practices](#tips-and-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### What You'll Need
- A CSV (spreadsheet) file with your program requirements
- Advisor access to the Degree Link system (advisors have administrative privileges)
- An authenticator app (Google Authenticator, Authy, etc.) for secure login
- Basic knowledge of your program's course requirements

### Basic Steps
1. **Log in** using your authenticator app for secure access
2. **Prepare** your CSV file with program requirements
3. **Upload** the file through the admin interface
4. **Review** the preview showing what will be created or updated
5. **Edit** requirements directly in the confirmation screen (optional)
6. **Confirm** to save changes to the database
7. **Manage** existing requirements using the edit tools

---

## Upload Process Overview

### Step 0: Sign In as Advisor

Before you can upload program requirements, you need to authenticate:

1. **Click the Settings icon** (⚙️) in the top-right corner of the page
2. **Enter your whitelisted email address**
3. **Click "Request Code"**
4. **First-time setup:**
   - A QR code will appear - scan it with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
   - The app will start generating 6-digit codes that change every 30 seconds
5. **Enter the 6-digit code** from your authenticator app
6. **Click "Sign In"**

Your session will remain active for 1 hour. After that, you'll need to sign in again using a new code from your authenticator app.

**Note:** If you need to regenerate your authenticator secret (e.g., new phone), click the "Regenerate TOTP Secret" button and scan the new QR code.

### Step 1: Select Upload Type
In the admin interface, navigate to the **Upload** tab and select **"Program Requirements"** from the upload type dropdown.

### Step 2: Choose Your File
Click **"Choose File"** or drag and drop your CSV file into the upload area.

### Step 3: Preview Your Changes
The system will show you a detailed preview of:
- **New programs** being created
- **New requirements** being added
- **Updated requirements** that will be modified
- **Deleted groups** that will be removed
- **New constraints** being applied
- **Errors** that need to be fixed
- **Warnings** about potential issues

### Step 4: Review and Edit (Optional)
Before confirming, you can:
- Expand/collapse sections to see details
- Edit requirement fields directly
- Review all changes course-by-course
- Make corrections without re-uploading

### Step 5: Confirm Upload
Click **"Confirm Upload"** to save all changes to the database. The system will:
- Create new programs and requirements
- Update existing requirements
- Apply all constraints
- Set version flags appropriately

### Step 6: Manage Existing Requirements
After upload, you can:
- View all program versions in the management section
- Edit requirements directly in the interface
- Add or remove courses from requirement groups
- Modify constraints without re-uploading
- Delete entire requirements or individual courses

---

## Creating Your CSV File

### Required Columns

Every row in your CSV must have these columns:

| Column | What It Means | Example |
|--------|---------------|---------|
| `program_name` | The name of your degree program | "Biology B.S." |
| `category` | The requirement category | "BIOS Electives" |
| `requirement_type` | Type: `simple` or `grouped` | grouped |
| `semester` | The semester this version applies | Fall |
| `year` | The year this version applies | 2025 |
| `is_current` | Is this the active version? | true |

### For Grouped Requirements

When students can choose from multiple course options, add these columns:

| Column | What It Means | Example |
|--------|---------------|---------|
| `group_name` | Name of the course group | "Electives" |
| `course_code` | The specific course | "BIOS 301" |
| `institution` | Where the course is offered | "Delgado Community College" |
| `is_preferred` | Recommended option? | false |

### For Constraints (Optional)

Add rules about **how many** courses or credits students need:

| Column | What It Means | Example |
|--------|---------------|---------|
| `constraint_type` | The type of rule (optional label) | credits |
| `min_credits` | Minimum credits required | 10 |
| `max_credits` | Maximum credits allowed | 15 |
| `min_courses` | Minimum number of courses | 3 |
| `max_courses` | Maximum number of courses | 5 |
| `min_level` | Minimum course level (e.g., 3000 for upper-level) | 3000 |
| `min_courses_at_level` | How many courses at that level | 2 |
| `tag` | Course attribute to check | has_lab |
| `tag_value` | Required value for that attribute | true |
| `scope_subject_codes` | Limit to specific departments | BIOS |

**Important:** Constraint columns only need values on the **first row** of each category. Leave them empty for course listing rows.

---

## Understanding Constraints

### What Are Constraints?

Constraints are rules that define requirements like:
- "Students must complete at least 10 credits"
- "At least 3 courses are required"
- "2 courses must be upper-level (3000+)"
- "Must include 2 lab courses"

### Constraint Type 1: Credit Requirements

Use when you want to specify how many credits students need.

**Example:** Students must take between 10-15 credits from biology electives.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,min_credits,max_credits,scope_subject_codes
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"DCC",credits,10,15,BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"DCC",,,,
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"DCC",,,,
```

### Constraint Type 2: Course Count Requirements

Use when you want to specify how many courses students need.

**Example:** Students must take 3-5 courses from the elective list.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,min_courses,max_courses
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"DCC",courses,3,5
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"DCC",,,
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"DCC",,,
```

### Constraint Type 3: Course Level Requirements

Use when you need students to take upper-level courses.

**Example:** Students must take at least 2 courses at the 3000-level or higher.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,min_level,min_courses_at_level,scope_subject_codes
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"DCC",level,3000,2,BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"DCC",,,,
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 405,"DCC",,,,
```

**Understanding Course Levels:**
- **1000-level:** First-year courses
- **2000-level:** Second-year courses
- **3000-level:** Third-year courses (upper-level)
- **4000-level:** Fourth-year courses (upper-level)
- **5000-level:** Graduate courses

### Constraint Type 4: Course Attribute Requirements

Use when you need courses with specific characteristics (like lab courses).

**Example:** Students must take at least 2 courses with a lab component.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,tag,tag_value,min_courses,scope_subject_codes
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"DCC",tag,has_lab,true,2,BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"DCC",,,,,
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"DCC",,,,,
```

**Available Course Tags:**
- `has_lab` (values: `true` or `false`) - Course includes lab component
- `course_type` (values: `lecture`, `lecture_lab`, `lab_only`, `research`, `seminar`, `independent_study`)

### Multiple Constraints

You can apply multiple constraints to the same category by adding separate rows with different constraint types:

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,constraint_type,min_credits,min_level,min_courses_at_level,tag,tag_value,min_courses
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"DCC",credits,10,,,,,,
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"DCC",level,,3000,2,,,
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"DCC",tag,,,,has_lab,true,2
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"DCC",,,,,,
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"DCC",,,,,,
```

This requires: **10+ credits** AND **2 upper-level courses** AND **2 lab courses**.

---

## Confirmation and Editing

### Understanding the Preview Screen

After uploading your CSV, you'll see a confirmation screen with several sections:

#### 1. Upload Summary
Shows counts of:
- Total rows processed
- New programs being created
- New requirements being added
- Requirements being updated
- Groups being deleted
- Constraints being applied

#### 2. Errors and Warnings

**Errors (Red):** Must be fixed before upload
- Missing required columns
- Invalid course codes
- Invalid semester/year formats
- Data validation failures

**Warnings (Yellow):** Should be reviewed but won't block upload
- Courses marked for deletion
- Programs being updated
- Unusual constraint combinations

#### 3. Detailed Changes

Expandable sections showing:
- **New Programs:** Programs that will be created
- **New Requirements:** Requirements being added
- **Updated Requirements:** Requirements being modified
- **Deleted Groups:** Course groups being removed

### Editing in the Confirmation Screen

You can edit requirements directly before confirming:

1. **Click the Edit button** (pencil icon) next to any requirement
2. **Modify fields** such as:
   - Category name
   - Group name
   - Course codes
   - Constraint values
3. **Click Save** to apply your edits
4. **Review changes** in the preview
5. **Confirm upload** when satisfied

### Managing Existing Requirements

After upload, use the **Program Requirements Management** section to:

#### View Program Versions
- See all versions of each program (Fall 2024, Spring 2025, etc.)
- Identify which version is currently active
- View requirement summaries

#### Edit Requirements
Click the **Edit button** next to any program version to:
- **Add new requirements** to a category
- **Edit existing requirements** (change names, constraints)
- **Add courses** to requirement groups using search
- **Remove courses** from groups
- **Delete entire requirements**
- **Modify constraints** without re-uploading

#### Search and Add Courses
When editing:
1. Click **"Add Course"** in any requirement group
2. **Search** by course code or title
3. **Select** the course from results
4. **Mark as preferred** (optional) for recommended courses
5. **Save** to add the course to the group

---

## Complete Examples

### Example 1: Simple Core Requirement

Students must take one specific course.

```csv
program_name,category,requirement_type,semester,year,is_current,course_code,institution
"Biology B.S.","Core Courses",simple,Fall,2025,true,"BIOS 101","Delgado Community College"
"Biology B.S.","Core Courses",simple,Fall,2025,true,"BIOS 102","Delgado Community College"
"Biology B.S.","Core Courses",simple,Fall,2025,true,"CHEM 101","Delgado Community College"
```

### Example 2: Electives with Credit Requirements

Students must take 10-15 credits from a list of biology electives.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,min_credits,max_credits,scope_subject_codes
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 300,"Delgado Community College",false,credits,10,15,BIOS
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 301,"Delgado Community College",true,,,,
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 305,"Delgado Community College",false,,,,
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 401,"Delgado Community College",false,,,,
"Biology B.S.","BIOS Electives",grouped,Fall,2025,true,"Electives",BIOS 405,"Delgado Community College",false,,,,
```

**Note:** BIOS 301 is marked as preferred (`is_preferred=true`), meaning it's a recommended choice for students.

### Example 3: Upper-Level Requirement with Lab

Students must take at least 6 credits from upper-level biology courses, and at least 1 must have a lab.

```csv
program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,min_credits,min_level,min_courses_at_level,tag,tag_value,min_courses,scope_subject_codes
"Biology B.S.","Upper-Level BIOS",grouped,Fall,2025,true,"Advanced",BIOS 301,"Delgado Community College",false,credits,6,,,,,BIOS
"Biology B.S.","Upper-Level BIOS",grouped,Fall,2025,true,"Advanced",BIOS 301,"Delgado Community College",false,level,,3000,2,,,,BIOS
"Biology B.S.","Upper-Level BIOS",grouped,Fall,2025,true,"Advanced",BIOS 301,"Delgado Community College",false,tag,,,,has_lab,true,1,BIOS
"Biology B.S.","Upper-Level BIOS",grouped,Fall,2025,true,"Advanced",BIOS 305,"Delgado Community College",false,,,,,,,
"Biology B.S.","Upper-Level BIOS",grouped,Fall,2025,true,"Advanced",BIOS 401,"Delgado Community College",false,,,,,,,
"Biology B.S.","Upper-Level BIOS",grouped,Fall,2025,true,"Advanced",BIOS 405,"Delgado Community College",true,,,,,,,
```

This example requires:
- Minimum 6 credits total
- At least 2 courses at 3000-level or higher
- At least 1 course with a lab component
- All courses must be BIOS department

---

## Tips and Best Practices

### File Preparation

✅ **DO:**
- Use a spreadsheet program (Excel, Google Sheets) to create your CSV
- Keep institution names consistent across all rows
- Use the exact course codes from your course database
- Test with a small file first (one program, a few requirements)
- Save a backup before uploading

❌ **DON'T:**
- Use special characters in program or category names
- Mix tabs and commas in your file
- Leave required columns empty
- Forget to set `is_current=true` for active programs

### Constraint Best Practices

1. **Start Simple:** Begin with just credit or course count constraints
2. **Be Specific:** Use `scope_subject_codes` to target specific departments
3. **Test Logic:** Make sure multiple constraints don't conflict
4. **Document:** Use the `constraint_type` column to label your constraints

### Version Management

- **New Program Version:** Change the `semester` or `year` to create a new version
- **Update Current Version:** Use the same `semester` and `year`, keep `is_current=true`
- **Archive Old Version:** The system automatically sets previous versions to `is_current=false`

### Using the Edit Interface

- **Small Changes:** Use the web interface instead of re-uploading CSV
- **Adding Courses:** Use the search feature to find and add courses quickly
- **Removing Courses:** Click the trash icon next to any course
- **Bulk Updates:** Re-upload a CSV with the same `semester` and `year`

---

## Troubleshooting

### Common Errors and Solutions

#### Error: "Course code not found"
**Problem:** The course doesn't exist in the database  
**Solution:** Upload the course first using the Courses CSV upload

#### Error: "Missing required column"
**Problem:** Your CSV is missing a required column  
**Solution:** Check that you have all required columns (see Creating Your CSV File section)

#### Error: "Invalid semester value"
**Problem:** Semester must be exactly "Fall", "Spring", or "Summer"  
**Solution:** Fix capitalization and spelling

#### Error: "Invalid year format"
**Problem:** Year must be a 4-digit number  
**Solution:** Use format like "2025" not "25"

#### Warning: "Deleting existing groups"
**Problem:** The system will remove course groups that aren't in your CSV  
**Solution:** This is normal when updating requirements - make sure your CSV includes all desired courses

### Preview Shows Wrong Data

1. **Check file encoding:** Save CSV as UTF-8
2. **Verify column names:** Make sure headers match exactly (case-sensitive)
3. **Look for hidden characters:** Re-type any suspicious values
4. **Test with sample data:** Use one of the complete examples above

### Changes Not Appearing

1. **Verify is_current flag:** Should be `true` for active versions
2. **Check semester/year:** Make sure you're viewing the correct version
3. **Refresh the page:** Clear browser cache if needed
4. **Confirm upload succeeded:** Look for success message

### Need Help?

- **Documentation:** Review the UNIFIED_CSV_FORMAT.md file for technical details
- **Sample Files:** Check `docs/equic-csvs/` for example CSV files
- **Technical Support:** Contact your system administrator

---

## Quick Reference: Column Cheat Sheet

### Always Required
- `program_name` - Your degree program
- `category` - The requirement category
- `requirement_type` - `simple` or `grouped`
- `semester` - Fall, Spring, or Summer
- `year` - 4-digit year (e.g., 2025)
- `is_current` - `true` or `false`

### For Simple Requirements
- `course_code` - The required course

### For Grouped Requirements
- `group_name` - Name of the group
- `course_code` - Each course option
- `institution` - Where course is offered
- `is_preferred` - `true` or `false`

### For Constraints (First Row Only)
- `constraint_type` - Label (optional)
- `min_credits` - Minimum credits
- `max_credits` - Maximum credits
- `min_courses` - Minimum number of courses
- `max_courses` - Maximum number of courses
- `min_level` - Minimum course level (1000-5000)
- `min_courses_at_level` - How many at that level
- `tag` - Attribute name (has_lab, course_type)
- `tag_value` - Required value (true, false, or type)
- `scope_subject_codes` - Department codes (BIOS, CHEM, etc.)

---

*For technical implementation details, see: UNIFIED_CSV_FORMAT.md*

*For constraint implementation details, see: CONSTRAINT_IMPLEMENTATION.md*
