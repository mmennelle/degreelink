# Degree Link — 15-Minute Demo for Provost & Administration

**Presenter:** Mitchell Mennelle  
**Live App:** https://dlink.cs.uno.edu  
**Scenario:** A student transferring from Delgado Community College to UNO

---

## Pre-Demo Setup (do before the meeting)

1. Open https://dlink.cs.uno.edu in a browser (use Chrome, clear cache if needed)
2. Have a **second tab** ready with an existing plan code loaded (as a fallback)
3. Confirm the Biology B.S. program (or whichever program has constraints uploaded) is available in the program dropdown
4. Make sure you know which Delgado courses map cleanly. Good demo courses:

| Delgado Course | UNO Equivalent | Category | Why it's good for the demo |
|---|---|---|---|
| BIOL 101 (Gen Bio I) | BIOS 1053 | Core Science | Clean 1:1 equivalency |
| BIOL 102 (Gen Bio II) | BIOS 1063 | Core Science | Shows progress bar filling |
| MATH 130 (College Algebra) | MATH 1125 | Mathematics | Prerequisite for Calc |
| MATH 221 (Calculus I) | MATH 2114 | Mathematics | Shows prereq satisfied via equivalency |
| CMIN 214 (Intro to Programming) | CSCI 2000 | CS Core | Cross-discipline equivalency |
| ENGL 101 / ENGL 102 | (Gen Ed English) | Gen Ed | Familiar to any audience |

> **Tip:** Walk through adding these courses in the order above during the demo. Adjust course codes to match what's actually loaded in your production database — verify the night before.

---

## Demo Script

### OPENING — The Problem (1–2 min)

**What to say:**

>Every semester, thousands of Louisiana community college students transfer to a four-year university and lose credits in the process — courses they already paid for and passed. I was one of them. When I transferred from Delgado to UNO, I lost 18 credit hours because the process depended on digging through PDF articulation matrices, emailing advisors back and forth, and hoping nothing fell through the cracks. There was no single place to see what would count before it was too late.
Degree Link is the tool I wish I'd had...
>

*(Open dlink.cs.uno.edu on the projector)*

---

### ACT 1 — Create a Plan (2 min)

**Steps:**
1. Click **"Create New Plan"**
2. Fill in:
   - **Name:** "Jordan Transfer Demo"
   - **Program:** Select the Biology B.S. (or the program with the richest constraint data)
   - **Transfer Institution:** Delgado Community College
   - **Target Institution:** University of New Orleans
   - **Starting Semester / Year:** Fall 2026
3. Click **"Create Plan"**
4. **Pause on the plan code screen** — briefly explain:

> "Jordan gets a unique 8-character code. No login required — they save this code and can come back anytime, from any device. They can also share it with their advisor."

5. Click through to the plan view

**What the audience sees:** An empty progress tracker with all the degree requirement categories laid out — color-coded bars all at 0%.

---

### ACT 2 — Add Transfer Courses & Watch Progress Fill (3–4 min)

**This is the "wow" moment. Go course by course.**

**Step 1 — Add General Biology I (Delgado: BIOL 101)**
1. Click on the **Core Science** progress bar (or use "Add Course")
2. Search for the Delgado biology course
3. Show that the system recognizes the **equivalency** to UNO's BIOS 1053
4. Add it to the plan
5. **Point out:** the progress bar moves, credits tick up

> "Jordan took Bio I at Delgado. The system already knows that's equivalent to BIOS 1053 at UNO — it maps automatically from the statewide articulation matrix and via the imported program data from each institution."

**Step 2 — Add College Algebra (Delgado: MATH 130)**
1. Add the math course
2. Progress bar updates again

> "Two courses added, and Jordan can already see concrete progress toward the degree."

**Step 3 — Add Calculus I (Delgado: MATH 221)**
1. Add Calculus I
2. **Call out the prerequisite system:**

> "Notice — the system checked that Jordan completed College Algebra before Calculus. If that prerequisite hadn't been satisfied, it would flag a warning. And it works across institutions: Delgado's MATH 130 satisfies UNO's prerequisite for Calc, because they're equivalent."

**Step 4 — Add one more course (Intro to Programming or Gen Bio II)**
- Keep momentum, show the bars filling further

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
| Opening — The Problem | 1.5 min | 1:30 |
| Create a Plan | 2 min | 3:30 |
| Add Courses & Progress | 3.5 min | 7:00 |
| Constraints in Action | 3.5 min | 10:30 |
| Advisor Workflow | 2 min | 12:30 |
| Statewide Data | 1 min | 13:30 |
| Closing & Q&A Transition | 1.5 min | 15:00 |

---

## If Something Goes Wrong

| Problem | Recovery |
|---|---|
| App is slow or down | Switch to second browser tab with pre-loaded plan |
| Course search returns no results | Use the direct "Add Course" button with a known course code |
| Constraints don't display | Verbally describe them and click into a different category |
| Advisor login fails | Skip to describing the advisor features verbally — "Let me show you what advisors see..." and show a screenshot |
| You run over time | Cut Statewide Data section; compress closing to one sentence |

---

## Night-Before Checklist

- [ ] Verify dlink.cs.uno.edu is up and responsive
- [ ] Create a fresh test plan and add 2-3 courses — confirm equivalencies display
- [ ] Confirm which program has the best constraint data (check for level, credit, and tag constraints)
- [ ] Note the exact Delgado course codes that produce clean equivalencies (search in app, not just the CSV)
- [ ] Pre-load a backup plan with courses already added in a second browser tab
- [ ] Test the projector/screen resolution — make sure the UI is readable
- [ ] Increase browser zoom to 125-150% for projector visibility
- [ ] Disable browser notifications and close unrelated tabs
