-- ============================================================
-- Audit existing demo data in the production database
-- ============================================================

-- 1. Check which demo courses already exist
\echo '=== DEMO COURSES CHECK ==='
SELECT id, code, title, credits, institution, department, prerequisites
FROM courses
WHERE code IN (
  'BIOL 101', 'BIOL 102', 'BIOS 1053', 'BIOS 1063',
  'MATH 130', 'MATH 221', 'MATH 1125', 'MATH 2114',
  'CMIN 214', 'CSCI 2000',
  'ENGL 101', 'ENGL 102', 'ENGL 1157', 'ENGL 1158'
)
ORDER BY institution, code;

-- 2. Check Biology B.S. program
\echo '=== BIOLOGY BS PROGRAM ==='
SELECT id, name, degree_type, institution, total_credits_required
FROM programs
WHERE name ILIKE '%biology%' OR name ILIKE '%bio%';

-- 3. Check ALL programs
\echo '=== ALL PROGRAMS ==='
SELECT id, name, degree_type, institution, total_credits_required
FROM programs ORDER BY id;

-- 4. Check program requirements for any Bio program
\echo '=== BIO PROGRAM REQUIREMENTS ==='
SELECT pr.id, pr.program_id, pr.category, pr.credits_required, pr.requirement_type, pr.description, pr.is_current, pr.priority_order
FROM program_requirements pr
JOIN programs p ON pr.program_id = p.id
WHERE p.name ILIKE '%bio%'
ORDER BY pr.priority_order, pr.category;

-- 5. Check requirement groups
\echo '=== REQUIREMENT GROUPS ==='
SELECT rg.id, rg.requirement_id, rg.group_name, rg.courses_required, rg.credits_required,
       pr.category, pr.program_id
FROM requirement_groups rg
JOIN program_requirements pr ON rg.requirement_id = pr.id
ORDER BY pr.program_id, pr.category;

-- 6. Check existing equivalencies for demo courses
\echo '=== EQUIVALENCIES FOR DEMO COURSES ==='
SELECT e.id, c1.code AS from_code, c1.institution AS from_inst,
       c2.code AS to_code, c2.institution AS to_inst, e.equivalency_type
FROM equivalencies e
JOIN courses c1 ON e.from_course_id = c1.id
JOIN courses c2 ON e.to_course_id = c2.id
WHERE c1.code IN ('BIOL 101','BIOL 102','MATH 130','MATH 221','CMIN 214','ENGL 101','ENGL 102',
                   'BIOS 1053','BIOS 1063','MATH 1125','MATH 2114','CSCI 2000','ENGL 1157','ENGL 1158')
   OR c2.code IN ('BIOL 101','BIOL 102','MATH 130','MATH 221','CMIN 214','ENGL 101','ENGL 102',
                   'BIOS 1053','BIOS 1063','MATH 1125','MATH 2114','CSCI 2000','ENGL 1157','ENGL 1158')
ORDER BY c1.code;

-- 7. Check requirement_constraints table
\echo '=== REQUIREMENT CONSTRAINTS ==='
SELECT * FROM requirement_constraints LIMIT 20;

-- 8. Check prerequisites for all courses
\echo '=== COURSES WITH PREREQUISITES ==='
SELECT id, code, title, institution, prerequisites
FROM courses
WHERE prerequisites IS NOT NULL AND prerequisites != ''
ORDER BY code;

-- 9. Check group_course_options
\echo '=== GROUP COURSE OPTIONS (sample) ==='
SELECT gco.id, gco.group_id, gco.course_code, gco.institution, gco.is_preferred,
       rg.group_name, pr.category
FROM group_course_options gco
JOIN requirement_groups rg ON gco.group_id = rg.id
JOIN program_requirements pr ON rg.requirement_id = pr.id
ORDER BY pr.category, rg.group_name
LIMIT 50;

-- 10. Delgado courses count
\echo '=== DELGADO COURSES COUNT ==='
SELECT COUNT(*) AS delgado_courses FROM courses WHERE institution ILIKE '%delgado%';

-- 11. UNO courses count
\echo '=== UNO COURSES COUNT ==='
SELECT COUNT(*) AS uno_courses FROM courses WHERE institution ILIKE '%uno%' OR institution = 'UNO';

-- 12. Sample of Delgado biology courses
\echo '=== DELGADO BIO/SCIENCE COURSES ==='
SELECT id, code, title, credits, institution, department
FROM courses
WHERE institution ILIKE '%delgado%'
  AND (code LIKE 'BIOL%' OR code LIKE 'BIO %' OR code LIKE 'MATH%' OR code LIKE 'CMIN%' OR code LIKE 'ENGL%')
ORDER BY code;

-- 13. UNO bio/math courses
\echo '=== UNO BIO/MATH/ENGL/CSCI COURSES ==='
SELECT id, code, title, credits, institution, department
FROM courses
WHERE (institution ILIKE '%uno%' OR institution = 'UNO')
  AND (code LIKE 'BIOS%' OR code LIKE 'BIOL%' OR code LIKE 'MATH%' OR code LIKE 'CSCI%' OR code LIKE 'ENGL%')
ORDER BY code;

-- 14. Check institution names used
\echo '=== DISTINCT INSTITUTIONS ==='
SELECT DISTINCT institution, COUNT(*) as course_count
FROM courses
GROUP BY institution
ORDER BY course_count DESC;
