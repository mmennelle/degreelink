-- 1. English courses at both institutions
\echo '=== ENGLISH COURSES ==='
SELECT id, code, title, prerequisites, institution
FROM courses
WHERE subject_code = 'ENGL'
  AND institution IN ('University of New Orleans','Delgado Community College')
ORDER BY institution, code;

-- 2. Check if ANY course has prerequisite data
\echo '=== COURSES WITH NON-EMPTY PREREQUISITES ==='
SELECT COUNT(*) AS total_with_prereqs
FROM courses
WHERE prerequisites IS NOT NULL AND prerequisites != '';

SELECT id, code, title, prerequisites, institution
FROM courses
WHERE prerequisites IS NOT NULL AND prerequisites != ''
LIMIT 10;

-- 3. Check the prerequisite_links table (if it exists)
\echo '=== PREREQUISITE LINKS TABLE ==='
SELECT COUNT(*) FROM prerequisite_links;

-- 4. Show some prerequisite links
SELECT pl.id, c1.code AS course_code, c2.code AS prereq_code, pl.prerequisite_type, pl.is_corequisite
FROM prerequisite_links pl
JOIN courses c1 ON pl.course_id = c1.id
JOIN courses c2 ON pl.prerequisite_course_id = c2.id
LIMIT 20;

-- 5. Specifically check ENGL 1158 prerequisites
\echo '=== ENGL 1158 PREREQUISITES ==='
SELECT pl.id, c1.code AS course_code, c2.code AS prereq_code, pl.prerequisite_type, pl.is_corequisite
FROM prerequisite_links pl
JOIN courses c1 ON pl.course_id = c1.id
JOIN courses c2 ON pl.prerequisite_course_id = c2.id
WHERE c1.code IN ('ENGL 1158', 'ENGL 102', 'ENGL 1157', 'ENGL 101');

-- 6. Check plan_courses for plan 52 (current test plan)
\echo '=== PLAN 52 COURSES ==='
SELECT pc.id, c.code, c.institution, pc.requirement_category, pc.status, pc.constraint_violation, pc.constraint_violation_reason
FROM plan_courses pc
JOIN courses c ON pc.course_id = c.id
WHERE pc.plan_id = 52
ORDER BY pc.id;

-- 7. Check constraints
\echo '=== CONSTRAINTS ==='
SELECT rc.id, rc.requirement_id, pr.category AS req_category, rc.constraint_type, rc.parameters, rc.description, rc.scope
FROM requirement_constraints rc
JOIN program_requirements pr ON rc.requirement_id = pr.id
ORDER BY pr.program_id, pr.category;

-- 8. Check program requirements summary
\echo '=== PROGRAM REQUIREMENTS ==='
SELECT pr.id, p.name AS program, pr.category, pr.credits_required, pr.requirement_type
FROM program_requirements pr
JOIN programs p ON pr.program_id = p.id
ORDER BY p.id, pr.id;

-- 9. Check equivalencies for ENGL courses
\echo '=== ENGL EQUIVALENCIES ==='
SELECT e.id, c1.code AS from_code, c1.institution AS from_inst, c2.code AS to_code, c2.institution AS to_inst, e.equivalency_type
FROM equivalencies e
JOIN courses c1 ON e.from_course_id = c1.id
JOIN courses c2 ON e.to_course_id = c2.id
WHERE c1.subject_code = 'ENGL' OR c2.subject_code = 'ENGL'
ORDER BY c1.code
LIMIT 30;
