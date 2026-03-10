# Degree Link — 15-Minute Demo for Provost & Administration

**Presenter:** Mitchell Mennelle  
**Live App:** https://dlink.cs.uno.edu  
**Scenario:** A student transferring from Delgado Community College to UNO

---

## Pre-Demo Setup (do before the meeting)

1. Open https://dlink.cs.uno.edu in a browser (use Chrome, clear cache if needed)
2. Have a **second tab** ready with an existing plan code loaded (as a fallback)
3. Confirm the Biology B.S. program (or whichever program has constraints uploaded) is available in the program dropdown
4. Verify the QR code loads at https://dlink.cs.uno.edu/api/qr — have this ready in a tab or bookmark
5. Make sure you know which Delgado courses map cleanly. Good demo courses:

| Delgado Course | UNO Equivalent | Category | Why it's good for the demo |
|---|---|---|---|
| BIOL 101 (Gen Bio I) | BIOS 1053 | Core Science | Clean 1:1 equivalency |
| MATH 130 (College Algebra) | MATH 1125 | Mathematics | Prerequisite for Trig|
| MATH 131 (PRE-Calc TRIG) | MATH 1126| Mathematics | Shows prereq satisfied via equivalency |
| CMIN 214 (Intro to Programming) | CSCI 2000 | CS Core | Cross-discipline equivalency |

> **Tip:** Each course is added via a **different UI method** (+ Add Course button, Course Suggestions, Course Search tab, CCN Lookup) — practice the sequence so transitions feel smooth and each addition showcases something new. Adjust course codes to match what's actually loaded in your production database — verify the night before.

---

## Demo Script

### OPENING — The Problem (1–2 min)

**Before you speak — show the QR code.**

1. Navigate to **https://dlink.cs.uno.edu/api/qr** (or have it pre-loaded) and display it on the projector
2. Pause for 10–15 seconds while the audience scans

> "Before we start — if you'd like to follow along on your own device, scan this QR code. It'll take you to the live app. Everything I'm about to show you is running right now."

3. Once a few people have scanned, switch to the app's homescreen at **https://dlink.cs.uno.edu**

**What to say:**

> "Every semester, thousands of Louisiana community college students transfer to a four-year university and lose credits in the process — courses they already paid for and passed. I was one of them. When I transferred from Delgado to UNO, I lost 18 credit hours because the process depended on digging through PDF articulation matrices, emailing advisors back and forth, and hoping nothing fell through the cracks. There was no single place to see what would count before it was too late.
> Degree Link is the tool I wish I'd had..."

---

### ACT 1 — Navigate & Create a Plan (2 min)

**Steps:**

1. On the homescreen, click **"Student"** ("I am a current or prospective student")
2. On the next screen, click **"Academic Planning"** ("Create and track academic plans")
   - *This automatically opens the Create Plan modal*
3. Fill in:
   - **Name:** "Jordan Transfer Demo"
   - **Program:** Select the Biology B.S. (or the program with the richest constraint data)
   - **Transfer Institution:** Delgado Community College
   - **Target Institution:** University of New Orleans
   - **Starting Semester / Year:** Fall 2026
4. Click **"Create Plan"**
5. **Pause on the plan code screen** — briefly explain:

> "Jordan gets a unique 8-character code. No login required — they save this code and can come back anytime, from any device. They can also share it with their advisor."

6. Click through to the plan view

**What the audience sees:** An empty progress tracker with all the degree requirement categories laid out — color-coded bars all at 0%.

---

### ACT 2 — Add Transfer Courses & Watch Progress Fill (3–4 min)

**This is the "wow" moment. Go course by course — each one added a different way to showcase the breadth of the interface.**

> **Presenter note:** Four courses, four methods. Each transition should feel smooth and natural — you're not just adding courses, you're touring the app's capabilities. Avoid unnecessary clicking; know exactly where each button is.

**Step 1 — BIOL 101 via the "+ Add Course" Button** *(direct add)*
1. In the plan view, click the **"+ Add Course"** action button
2. The full-screen course search modal opens — type **"BIOL 101"** in the search bar
3. Find the Delgado BIOL 101 result — show that the system recognizes the **1:1 equivalency** to UNO's BIOS 1053
4. Click **"Add to Plan"**, assign it to the appropriate requirement category
5. **Point out:** the progress bar moves, credits tick up

> "Jordan took Bio I at Delgado. The system already knows that's equivalent to BIOS 1053 at UNO — it maps automatically from the statewide articulation matrix. One click and it counts."

**Step 2 — MATH 131 (Trig) via Course Suggestions** *(smart recommendations)*
1. Click on the **Mathematics** progress bar segment to open the requirement details
2. Click **"Course Suggestions"** to expand the suggestion list
3. Find **MATH 131 (Pre-Calc Trig)** in the suggestions

> "Instead of searching, the system can suggest courses that fit each requirement. These are pre-filtered to match the program's needs."

4. Click **"Add"** on MATH 131
5. **The prerequisite warning appears** — MATH 130 (College Algebra) is missing

> "Notice — the system flagged that Jordan hasn't completed the prerequisite for Trig. MATH 130, College Algebra, is required first. The prerequisite check works across institutions: Delgado's course codes are matched to UNO's requirements through the equivalency data."

6. Add the course anyway to show it appears with a warning indicator

**Step 3 — MATH 130 (College Algebra) via Course Search Tab** *(main search page)*
1. Navigate to the **"Course Search"** tab in the top navigation
2. Type **"MATH 130"** in the search bar and optionally filter by **Delgado** in the institution field
3. Find MATH 130 (College Algebra) in the results
4. Click **"Add to Plan"** directly from the search results

> "Now Jordan's added College Algebra — the prerequisite is satisfied. Three courses, and you can already see real progress toward the degree."

5. **Point out:** the prerequisite warning on MATH 131 is now resolved

**Step 4 — CMIN 214 (Intro to Programming) via CCN Lookup** *(cross-discipline, articulation system)*
1. While on the Course Search page, click the **"CCN"** sub-tab to switch to **Louisiana Articulation Lookup**
2. Select **"By Local Course"** mode
3. Enter **"CMIN 214"** and select **Delgado Community College** as the institution
4. Click **"Look Up"**
5. Show the CCN result — the statewide articulation data mapping CMIN 214 to equivalents across institutions, including **CSCI 2000** at UNO

> "This is the Louisiana Common Course Numbering system — the Board of Regents articulation matrix. A programming course at Delgado maps to Computer Science at UNO. Cross-discipline, cross-institution — the system handles it. This is how we cover over 8,000 courses across 27 institutions."

6. Add CMIN 214 to the plan from the results
7. Return to the plan view to show all four courses and updated progress bars

> "Four courses, four different ways to find and add them — and Jordan can already see exactly where they stand."

---

### ACT 3 — Constraints in Action (3–4 min)

**This is the technical differentiator. Click into a requirement category that has constraints.**

1. Click on a progress bar segment (e.g., **Upper-Level Biology Electives** or whichever category has level/credit constraints)
2. **Expand the Constraints section** in the modal

> "This is where Degree Link goes beyond a simple checklist. Degree programs have rules: 'You need at least 10 credits at the 3000-level or higher,' or 'At least 2 courses must include a lab.' The system tracks all of this automatically."

3. **Show a satisfied constraint** (green checkmark) vs an **unsatisfied constraint** (red warning)

4. **Demonstrate a constraint violation:**
   - Try adding a lower-level course (e.g., a 1000-level course) to a category that requires upper-level courses
   - **The warning modal appears** explaining the violation
   - Show the "Add Anyway" option — the course appears with an **orange background** and credits **don't count**

> "If a student adds a course that doesn't meet the constraint, we warn them immediately and the credits don't count toward that requirement. The student — or their advisor — can see exactly what's wrong and what they need instead."

5. **Show filtered suggestions:**

> "When we suggest courses, we pre-filter them to only show options that actually satisfy the constraints. If you need 3000-level courses, we won't suggest 1000-level ones."

---

### ACT 4 — Advisor Workflow (2 min)

**Quick pivot to the advisor perspective.**

1. Click the **Settings gear icon**
2. Show the advisor login (TOTP/authenticator app)
3. Once authenticated, show the **advisor-only tabs** that appear:
   - **Program Management** — where advisors upload program requirements via CSV
   - **Advisor Center** — where advisors can look up any student plan by code

> "Advisors authenticate with a standard authenticator app — Google Authenticator, Authy, etc. Once logged in, they can manage program requirements, upload new courses and equivalencies via CSV, and access any student plan by code. This means an advisor and a student can look at the same plan simultaneously."

4. Briefly show a CSV upload preview (don't actually upload — just show the interface)

> "Program requirements, constraints, course catalogs — they're all maintained through simple CSV files. No developer needed to update the system."

---

### ACT 5 — The Statewide Data (1 min)

> "The equivalency data in Degree Link comes from two places: Each institution and subsequently each department can upload data using the downloadable spreadsheet templates. and the Louisiana Board of Regents statewide articulation matrix — Currently there are over 8,000 courses across 27 institutions in the database. That means this system isn't just Delgado-to-UNO. It's any Louisiana community college to UNO, and it could expand to any institution pair in the state and potentially beyond"

*(If time: do a quick course search showing equivalencies across multiple institutions)*

---

### CLOSING — Impact & Next Steps (1–2 min)

> "To summarize what you've seen:
>
> 1. **Students** create a plan in 30 seconds — no login required — and immediately see how their transfer credits map to their degree.
> 2. **Equivalencies** are automatically recognized across institutions using official state data.
> 3. **Prerequisites** are validated across institutional boundaries.
> 4. **Constraints** — credit minimums, course levels, lab requirements — are enforced in real time with clear warnings.
> 5. **Advisors** manage everything through a secure portal with CSV uploads — no technical expertise required.
> 6. **It's live now** at dlink.cs.uno.edu."

**Potential talking points for Q&A:**
- Built at UNO by UNO CS — potential capstone/research showcase
- Expandable to any Louisiana institution (or beyond)
- No student data collected beyond the plan itself — privacy-friendly
- PDF export for advising appointments
- Could integrate with Banner/SIS in the future

---

## Timing Cheat Sheet

| Section | Duration | Running Total |
|---|---|---|
| QR Code & Opening — The Problem | 2 min | 2:00 |
| Navigate & Create a Plan | 2 min | 4:00 |
| Add Courses & Progress (4 methods) | 4 min | 8:00 |
| Constraints in Action | 3 min | 11:00 |
| Advisor Workflow | 2 min | 13:00 |
| Statewide Data | 0.5 min | 13:30 |
| Closing & Q&A Transition | 1.5 min | 15:00 |

---

## If Something Goes Wrong

| Problem | Recovery |
|---|---|
| App is slow or down | Switch to second browser tab with pre-loaded plan |
| QR code doesn't load | Say "We'll share the link after" and move on — type the URL verbally |
| Course search returns no results | Use the direct "Add Course" button with a known course code |
| Suggestions don't appear for a category | Switch to "+ Add Course" or Course Search tab instead — say "Let me show you another way to find courses" |
| CCN lookup returns no results | Switch to regular Course Search and search by code — describe CCN verbally |
| Prereq warning doesn't fire for MATH 131 | Describe the feature verbally — "Normally the system would flag this..." |
| Constraints don't display | Verbally describe them and click into a different category |
| Advisor login fails | Skip to describing the advisor features verbally — "Let me show you what advisors see..." and show a screenshot |
| You run over time | Cut Statewide Data section; compress closing to one sentence |

---

## Night-Before Checklist

- [ ] Verify dlink.cs.uno.edu is up and responsive
- [ ] Verify QR code loads at dlink.cs.uno.edu/api/qr and scans correctly on a phone
- [ ] Walk through the homescreen flow: Student → Academic Planning → Create Plan
- [ ] Create a fresh test plan and add all 4 demo courses — confirm equivalencies and prereq warning display
- [ ] **Rehearse the 4 add methods in order:** + Add Course button (BIOL 101), Course Suggestions (MATH 131), Course Search tab (MATH 130), CCN Lookup (CMIN 214)
- [ ] Confirm which program has the best constraint data (check for level, credit, and tag constraints)
- [ ] Note the exact Delgado course codes that produce clean equivalencies (search in app, not just the CSV)
- [ ] Confirm MATH 131 suggestions appear when clicking the Mathematics requirement bar
- [ ] Pre-load a backup plan with courses already added in a second browser tab
- [ ] Test the projector/screen resolution — make sure the UI is readable
- [ ] Increase browser zoom to 125-150% for projector visibility
- [ ] Disable browser notifications and close unrelated tabs
