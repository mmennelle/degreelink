# Course Transfer System - User Instructions

## Overview

The Course Transfer System is a comprehensive web application designed to help students and academic advisors plan course transfers between institutions, particularly from community colleges to universities. The system maps course equivalencies, tracks degree progress, and provides intelligent course suggestions to optimize transfer pathways.

**Primary Use Case**: Students transferring from Delgado Community College to the University of New Orleans (or other institutions) can use this system to plan their academic journey, ensure credits transfer properly, and track progress toward degree completion.

---

## Getting Started

### System Access
1. Open your web browser and navigate to the Course Transfer System
2. The system loads with the **Course Search** tab active by default
3. Choose your user mode in the top-right corner:
   - **Student Portal**: For individual students planning their transfers
   - **Advisor Portal**: For academic advisors managing multiple student plans

### User Modes

**Student Mode**:
- Search for courses and view transfer equivalencies
- Create and manage personal academic plans
- Track degree progress
- View course suggestions based on requirements

**Advisor Mode**:
- All student features, plus:
- CSV upload functionality for bulk data management
- Enhanced plan management tools

---

## Core Features & How to Use Them

### 1. Course Search & Discovery

**Accessing Course Search**:
- Click the **"Course Search"** tab in the navigation bar
- This is your starting point for finding courses and understanding transfer options

**How to Search**:
1. **Enter Search Terms**: Type course codes, titles, or keywords in the search box
   - Examples: "BIOL 101", "Introduction to Biology", "calculus"
2. **Filter by Institution** (optional): Specify which college or university
3. **Select a Plan** (optional): Choose from your existing plans to add courses directly
4. **Click "Search"** or press Enter

**Understanding Search Results**:
- Each course shows: Code, Title, Institution, Credits, Department
- **Requirement Category**: System automatically detects which degree requirement the course might fulfill
- **Filter by Requirement**: Use the dropdown to show only courses for specific requirements

**Viewing Course Details**:
- Click the **"Details"** button on any course
- View complete course description, prerequisites, and **transfer equivalencies**
- See which courses at other institutions are equivalent

**Transfer Equivalency Information**:
- **Green badges**: Direct equivalency (transfers exactly)
- **Yellow badges**: Partial equivalency (may have conditions)
- **Gray/Red**: No equivalent or does not transfer
- Each equivalency shows the target course and any special notes

### 2. Academic Plan Management

**Creating Your First Plan**:
1. Click the **"Academic Plans"** tab
2. Click **"Create New Plan"** (blue button)
3. Fill out the form:
   - **Your Name**: Enter your full name
   - **Email**: Optional, for notifications
   - **Plan Name**: Descriptive name (auto-generated suggestion available)
   - **Target Program**: Select your intended degree program
4. Click **"Create Plan"**

**Managing Multiple Plans**:
- View all your plans on the main Academic Plans page
- Each plan shows status, creation date, and number of courses
- Click on any plan to view details and make modifications
- Use the delete button (trash icon) to remove unwanted plans

**Adding Courses to Your Plan**:

*Method 1 - From Course Search*:
1. Search for courses using the Course Search tab
2. Select a plan from the dropdown in the search interface
3. Click **"Add to Plan"** next to any course

*Method 2 - From Plan Details*:
1. Open your plan by clicking on it
2. Click the **"Add Course"** button
3. Search and select courses in the modal window

*Method 3 - Bulk Addition*:
1. In Course Search, use checkboxes to select multiple courses
2. Click **"Add Selected Courses"** to add them all at once

**Course Assignment Details**:
When adding courses, you'll specify:
- **Requirement Category**: Which degree requirement this course fulfills
- **Semester & Year**: When you plan to take or took the course
- **Status**: Planned, In Progress, or Completed
- **Grade**: If completed, enter your grade
- **Notes**: Any additional information

**Smart Category Detection**:
The system automatically suggests requirement categories based on:
- Course code patterns (BIOL courses → Biology requirements)
- Degree program requirements
- Course catalog information

### 3. Progress Tracking & Degree Planning

**Understanding Your Progress**:
- Open any plan to see the **Progress Tracker** section below
- View overall completion percentage and credits earned
- See detailed breakdowns by requirement category

**Progress Elements**:
- **Overall Progress Bar**: Visual representation of degree completion
- **Credits Summary**: Earned/Required/Remaining credits
- **Requirement Status**: Green (complete), Yellow (in progress), Red (not started)
- **Course Lists**: See exactly which courses count toward each requirement

**Interpreting Requirements**:
- **Simple Requirements**: Need a specific number of credits in a category
- **Grouped Requirements**: Choose X courses from a defined list
- **Conditional Requirements**: Complex rules with multiple options

**Getting Course Suggestions**:
- The system analyzes your current plan and unmet requirements
- Suggests specific courses that would fulfill remaining requirements
- Prioritizes courses with known transfer equivalencies
- Shows both target institution and community college options

### 4. Working with Transfer Equivalencies

**Understanding Equivalency Types**:
- **Direct**: Course transfers exactly as equivalent
- **Partial**: Transfers but may not fulfill all the same requirements
- **Conditional**: Transfers under specific conditions
- **No Equivalent**: Course doesn't transfer for credit

**Finding Transfer Options**:
1. Search for courses at your current institution
2. View course details to see transfer options
3. Look for equivalent courses at your target institution
4. Add the appropriate course to your plan

**Special Cases**:
- **"1000NE" courses**: System placeholder for "No Equivalent"
- **Multiple equivalencies**: Some courses may transfer to several different courses
- **Institution-specific**: Equivalencies are specific to institution pairs

### 5. Plan Organization & Course Management

**Organizing Courses by Semester**:
- When adding courses, specify semester (Fall/Spring/Summer) and year
- View courses grouped by when you'll take them
- Easily identify course sequencing and prerequisites

**Updating Course Information**:
- Change course status as you progress (Planned → In Progress → Completed)
- Update requirement categories if needed
- Add grades when courses are completed
- Include notes for special circumstances

**Course Status Management**:
- **Planned**: Future courses you intend to take
- **In Progress**: Currently enrolled courses
- **Completed**: Finished courses (count toward degree progress)

**Removing Courses**:
- Click **"Remove"** next to any course in your plan
- Confirm the deletion (this cannot be undone)
- Progress calculations update automatically

---

## Advanced Features

### CSV Upload (Advisor Mode Only)

**Purpose**: Bulk import of course catalogs, equivalency mappings, and program requirements

**Upload Types**:

1. **Course Information**:
   - Upload course catalogs with codes, titles, credits, descriptions
   - Required columns: code, title, credits, institution
   - Optional: description, department, prerequisites

2. **Course Equivalencies**:
   - Map courses between institutions
   - Required: from_course_code, from_institution, to_course_code, to_institution
   - Optional: equivalency_type, notes, approved_by

3. **Program Requirements**:
   - Define degree requirements and grouping rules
   - Supports complex grouped requirements ("choose 2 from group A")
   - Required: program_name, category, credits_required, requirement_type

**Using CSV Upload**:
1. Switch to Advisor Mode
2. Click the **"CSV Upload"** tab
3. Select upload type from dropdown
4. Download sample CSV to see required format
5. Prepare your data using the sample as a template
6. Drag and drop your file or click to browse
7. Review upload results and any error messages

### Multi-Course Selection

**Selecting Multiple Courses**:
1. In Course Search, use checkboxes next to course names
2. Selected courses appear highlighted in blue
3. Click **"Add Selected Courses"** when ready

**Bulk Operations**:
- Apply same semester/year to all selected courses
- Apply same requirement category to all courses
- Apply same status to all courses
- Use "Apply to All" checkboxes in the add course modal

### Program Requirements & Grouping

**Understanding Complex Requirements**:
- Some degree programs have sophisticated requirement structures
- Example: "Choose 2 courses from Literature Group AND 1 course from Philosophy Group"
- The system handles these automatically when courses are added

**Grouped Requirements**:
- View available course options for each group
- System prevents over-fulfillment of requirements
- See progress toward both individual groups and overall categories

---

## Tips for Success

### For Students

**Planning Your Transfer**:
1. **Start Early**: Create your plan as soon as you know your target program
2. **Verify Equivalencies**: Always confirm transfer credits with your advisor
3. **Plan Sequentially**: Consider prerequisites when scheduling courses
4. **Monitor Progress**: Regularly check your degree progress tracker
5. **Use Both Institutions**: Look for courses at both your current and target schools

**Maximizing Credit Transfer**:
- Focus on courses with direct equivalencies
- Take higher-credit courses when possible
- Complete general education requirements first
- Avoid courses marked as "no equivalent" unless required

**Course Selection Strategy**:
- Use the requirement filter to find suitable courses
- Check prerequisite chains before enrolling
- Consider course availability and scheduling
- Plan for both fall and spring offerings

### For Advisors

**Managing Student Plans**:
- Create plans for students during advising sessions
- Use bulk course addition for common transfer pathways
- Review and approve student-created plans
- Update equivalency information as policies change

**Data Management**:
- Regularly update course catalogs via CSV upload
- Maintain current equivalency mappings
- Update program requirements when curricula change
- Use error reports from uploads to clean data

**Best Practices**:
- Encourage students to create multiple scenario plans
- Help students understand the difference between equivalency types
- Regular plan reviews to ensure accuracy
- Document special cases and exceptions in course notes

---

## Troubleshooting Common Issues

### Course Search Problems

**No results found**:
- Check spelling of search terms
- Try broader search terms (partial course codes)
- Verify institution name is correct
- Contact administrator if courses are missing

**Wrong equivalency information**:
- Equivalencies may be outdated or incomplete
- Always verify with official sources
- Report discrepancies to your advisor
- Check for multiple equivalency options

### Plan Management Issues

**Can't add course to plan**:
- Ensure you've selected a plan in the interface
- Check if course already exists in the plan
- Verify you have permission to modify the plan
- Try refreshing the page

**Progress not updating**:
- Ensure courses are marked as "Completed"
- Check that requirement categories are assigned correctly
- Verify course credits are properly entered
- Contact support if calculations seem wrong

**Missing course suggestions**:
- Complete more of your current requirements first
- Ensure your target program is properly configured
- Check that course catalogs are up to date
- Some requirements may not have automated suggestions

### Technical Issues

**Page loading slowly**:
- Large course catalogs may take time to search
- Clear browser cache if pages aren't updating
- Check internet connection
- Try refreshing the page

**Data not saving**:
- Ensure you complete all required fields
- Check for browser JavaScript errors
- Verify you're not in an incognito/private browsing mode
- Contact technical support if problems persist

---

## Support & Resources

### Getting Help

**For Students**:
- Contact your academic advisor for plan review
- Reach out to the registrar's office for official equivalency verification
- Use the system's built-in course suggestions as a starting point
- Check your institution's transfer credit policies

**For Advisors**:
- Contact system administrators for technical issues
- Report data accuracy problems for correction
- Request training sessions for new features
- Provide feedback for system improvements

### Important Notes

**Data Accuracy**:
- Course information and equivalencies are updated regularly but may not reflect the most recent changes
- Always verify transfer credits with official institutional sources
- Use this system as a planning tool, not a guarantee of credit transfer

**Plan Limitations**:
- Plans are for academic planning purposes only
- Official degree audits supersede system calculations
- Some special requirements may not be fully represented
- Complex degree programs may require advisor consultation

**Best Practices**:
- Save your work frequently
- Keep backup records of important plans
- Regular communication with advisors is essential
- Plan for contingencies and alternative pathways

---

## Conclusion

The Course Transfer System is designed to simplify the complex process of planning course transfers and tracking degree progress. By combining course search, equivalency mapping, and progress tracking in one interface, students and advisors can make informed decisions about academic pathways.

Remember that this system is a powerful planning tool, but official institutional policies and advisor guidance should always be consulted for final decisions about course transfers and degree requirements.

For technical support or questions about system features, contact your institution's academic support services.