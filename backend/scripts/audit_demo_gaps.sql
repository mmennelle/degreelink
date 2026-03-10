-- Targeted audit for demo gaps

\echo '=== UNO DEMO COURSES ==='
SELECT id, code, title, credits, institution, prerequisites
FROM courses
WHERE institution = 'University of New Orleans'
  AND code IN ('BIOS 1053','BIOS 1063','MATH 1125','MATH 2114','CSCI 2000','ENGL 1157','ENGL 1158')
ORDER BY code;

\echo '=== ALL GROUP COURSE OPTIONS FOR UNO BIO BS ==='
SELECT gco.id, gco.group_id, gco.course_code, gco.institution, gco.is_preferred,
       rg.group_name, rg.requirement_id, pr.category, pr.program_id, pr.credits_required
FROM group_course_options gco
JOIN requirement_groups rg ON gco.group_id = rg.id
JOIN program_requirements pr ON rg.requirement_id = pr.id
WHERE pr.program_id = 2
ORDER BY pr.category, rg.group_name, gco.course_code;

\echo '=== ALL GROUP COURSE OPTIONS FOR DELGADO BIO PROGRAM ==='
SELECT gco.id, gco.group_id, gco.course_code, gco.institution, gco.is_preferred,
       rg.group_name, rg.requirement_id, pr.category, pr.program_id, pr.credits_required
FROM group_course_options gco
JOIN requirement_groups rg ON gco.group_id = rg.id
JOIN program_requirements pr ON rg.requirement_id = pr.id
WHERE pr.program_id = 1
ORDER BY pr.category, rg.group_name, gco.course_code;

\echo '=== ALL REQUIREMENT GROUPS FOR BOTH PROGRAMS ==='
SELECT rg.id, rg.requirement_id, rg.group_name, rg.courses_required, rg.credits_required,
       pr.category, pr.program_id, pr.credits_required AS cat_credits
FROM requirement_groups rg
JOIN program_requirements pr ON rg.requirement_id = pr.id
ORDER BY pr.program_id, pr.category, rg.group_name;

\echo '=== CONSTRAINTS FOR UNO BIO BS ==='
SELECT rc.id, rc.requirement_id, rc.constraint_type, rc.params, rc.scope_filter,
       rc.description, pr.category, pr.program_id
FROM requirement_constraints rc
JOIN program_requirements pr ON rc.requirement_id = pr.id
WHERE pr.program_id = 2
ORDER BY pr.category;

\echo '=== CONSTRAINTS FOR DELGADO PROGRAM ==='
SELECT rc.id, rc.requirement_id, rc.constraint_type, rc.params, rc.scope_filter,
       rc.description, pr.category, pr.program_id
FROM requirement_constraints rc
JOIN program_requirements pr ON rc.requirement_id = pr.id
WHERE pr.program_id = 1
ORDER BY pr.category;

\echo '=== DIRECT EQUIVALENCIES BETWEEN DELGADO AND UNO ==='
SELECT e.id, c1.code AS from_code, c1.institution AS from_inst,
       c2.code AS to_code, c2.institution AS to_inst, e.equivalency_type
FROM equivalencies e
JOIN courses c1 ON e.from_course_id = c1.id
JOIN courses c2 ON e.to_course_id = c2.id
WHERE (c1.institution ILIKE '%delgado%' AND c2.institution = 'University of New Orleans')
   OR (c2.institution ILIKE '%delgado%' AND c1.institution = 'University of New Orleans')
ORDER BY c1.code;

\echo '=== BIOL 101/102 EQUIVALENCY CHAIN VIA CCN ==='
SELECT e.id, c1.code AS from_code, c1.institution AS from_inst,
       c2.code AS to_code, c2.institution AS to_inst, e.equivalency_type
FROM equivalencies e
JOIN courses c1 ON e.from_course_id = c1.id
JOIN courses c2 ON e.to_course_id = c2.id
WHERE c1.code IN ('BIOL 101','BIOL 102','BIOS 1053','BIOS 1063','CBIO 1013','CBIO 1023')
   OR c2.code IN ('BIOL 101','BIOL 102','BIOS 1053','BIOS 1063','CBIO 1013','CBIO 1023')
ORDER BY c1.institution, c1.code;

\echo '=== CSCI COURSES AT UNO ==='
SELECT id, code, title, credits, institution
FROM courses
WHERE institution = 'University of New Orleans'
  AND code LIKE 'CSCI%'
ORDER BY code
LIMIT 20;

\echo '=== REQUIREMENT IDS FOR UNO BIO BS ==='
SELECT pr.id, pr.category, pr.credits_required, pr.requirement_type, pr.description
FROM program_requirements pr
WHERE pr.program_id = 2
ORDER BY pr.id;
