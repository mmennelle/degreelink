-- ============================================================
-- Demo Data Setup for Provost Presentation
-- Run against: course_transfer database on production
-- ============================================================

BEGIN;

-- ============================================================
-- 1. MATH 2114 prerequisite on MATH 1125
--    Demo ACT 2 Step 3: "Calculus requires Algebra"
--    Enables the cross-institutional prerequisite validation demo
-- ============================================================
UPDATE courses 
SET prerequisites = 'MATH 1125' 
WHERE id = 2299 
  AND code = 'MATH 2114' 
  AND institution = 'University of New Orleans';

-- Verify
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM courses WHERE id = 2299 AND prerequisites = 'MATH 1125'
  ) THEN RAISE EXCEPTION 'MATH 2114 prerequisite update failed';
  END IF;
END $$;

-- ============================================================
-- 2. Add BIOS 1053 and BIOS 1063 to Science group (Biol Group 1)
--    group_id=14, requirement_id=10 (Science, 9cr, UNO Bio BS)
--    These are the non-science-major intro bio courses at UNO
--    that BIOL 101/102 from Delgado map to via CCN
-- ============================================================
INSERT INTO group_course_options (group_id, course_code, institution, is_preferred)
SELECT 14, 'BIOS 1053', 'University Of New Orleans', false
WHERE NOT EXISTS (
  SELECT 1 FROM group_course_options 
  WHERE group_id = 14 AND course_code = 'BIOS 1053'
);

INSERT INTO group_course_options (group_id, course_code, institution, is_preferred)
SELECT 14, 'BIOS 1063', 'University Of New Orleans', false
WHERE NOT EXISTS (
  SELECT 1 FROM group_course_options 
  WHERE group_id = 14 AND course_code = 'BIOS 1063'
);

-- ============================================================
-- 3. Add MATH 2114 to Mathematics group (Math Group 1)
--    group_id=13, requirement_id=9 (Mathematics, 6cr, UNO Bio BS)
--    Currently only has MATH 1125 and MATH 1126
-- ============================================================
INSERT INTO group_course_options (group_id, course_code, institution, is_preferred)
SELECT 13, 'MATH 2114', 'University Of New Orleans', false
WHERE NOT EXISTS (
  SELECT 1 FROM group_course_options 
  WHERE group_id = 13 AND course_code = 'MATH 2114'
);

-- ============================================================
-- 4. Add direct equivalencies for BIOL 101→BIOS 1053, BIOL 102→BIOS 1063
--    These already work via CCN mediation (CBIO 1013/1023),
--    but direct equivalencies make the demo faster and more reliable
-- ============================================================

-- BIOL 101 (Delgado, id=90) → BIOS 1053 (UNO, id=402)
INSERT INTO equivalencies (from_course_id, to_course_id, equivalency_type)
SELECT 90, 402, 'direct'
WHERE NOT EXISTS (
  SELECT 1 FROM equivalencies 
  WHERE from_course_id = 90 AND to_course_id = 402
);

-- BIOL 102 (Delgado, id=91) → BIOS 1063 (UNO, id=403)
INSERT INTO equivalencies (from_course_id, to_course_id, equivalency_type)
SELECT 91, 403, 'direct'
WHERE NOT EXISTS (
  SELECT 1 FROM equivalencies 
  WHERE from_course_id = 91 AND to_course_id = 403
);

-- ============================================================
-- 5. Add CSCI 2000 "Introduction to Computer Science" at UNO
--    Demo: cross-discipline equivalency from CMIN 214 (Delgado)
-- ============================================================
INSERT INTO courses (code, subject_code, course_number, course_number_numeric, course_level,
                     title, credits, institution, department, has_lab, course_type)
SELECT 'CSCI 2000', 'CSCI', '2000', 2000, 2000,
       'Introduction to Computer Science', 3, 
       'University of New Orleans', 'Computer Science', false, 'lecture'
WHERE NOT EXISTS (
  SELECT 1 FROM courses 
  WHERE code = 'CSCI 2000' AND institution = 'University of New Orleans'
);

-- ============================================================
-- 6. Add equivalency CMIN 214 (Delgado, id=6679) → CSCI 2000 (UNO)
-- ============================================================
INSERT INTO equivalencies (from_course_id, to_course_id, equivalency_type)
SELECT 6679, c.id, 'direct'
FROM courses c 
WHERE c.code = 'CSCI 2000' AND c.institution = 'University of New Orleans'
AND NOT EXISTS (
  SELECT 1 FROM equivalencies e 
  WHERE e.from_course_id = 6679 AND e.to_course_id = c.id
);

-- ============================================================
-- 7. Add BIOL 101 and BIOL 102 to Delgado's program groups
--    so they appear in course suggestions for the Delgado program too
--    Add to Bio Elective (group_id=11) since they're non-science versions
-- ============================================================
INSERT INTO group_course_options (group_id, course_code, institution, is_preferred)
SELECT 11, 'BIOL 101', 'Delgado Community College', false
WHERE NOT EXISTS (
  SELECT 1 FROM group_course_options 
  WHERE group_id = 11 AND course_code = 'BIOL 101'
);

INSERT INTO group_course_options (group_id, course_code, institution, is_preferred)
SELECT 11, 'BIOL 102', 'Delgado Community College', false
WHERE NOT EXISTS (
  SELECT 1 FROM group_course_options 
  WHERE group_id = 11 AND course_code = 'BIOL 102'
);

COMMIT;

-- ============================================================
-- Verification queries
-- ============================================================
\echo '=== VERIFICATION: MATH 2114 prerequisite ==='
SELECT id, code, title, prerequisites FROM courses WHERE id = 2299;

\echo '=== VERIFICATION: Science group now includes BIOS 1053/1063 ==='
SELECT gco.id, gco.group_id, gco.course_code, gco.institution, rg.group_name, pr.category
FROM group_course_options gco
JOIN requirement_groups rg ON gco.group_id = rg.id
JOIN program_requirements pr ON rg.requirement_id = pr.id
WHERE rg.id = 14
ORDER BY gco.course_code;

\echo '=== VERIFICATION: Math group now includes MATH 2114 ==='
SELECT gco.id, gco.group_id, gco.course_code, gco.institution, rg.group_name, pr.category
FROM group_course_options gco
JOIN requirement_groups rg ON gco.group_id = rg.id
JOIN program_requirements pr ON rg.requirement_id = pr.id
WHERE rg.id = 13
ORDER BY gco.course_code;

\echo '=== VERIFICATION: Direct equivalencies for BIOL 101/102 ==='
SELECT e.id, c1.code AS from_code, c1.institution AS from_inst,
       c2.code AS to_code, c2.institution AS to_inst, e.equivalency_type
FROM equivalencies e
JOIN courses c1 ON e.from_course_id = c1.id
JOIN courses c2 ON e.to_course_id = c2.id
WHERE (c1.id IN (90, 91) AND c2.institution = 'University of New Orleans')
ORDER BY c1.code;

\echo '=== VERIFICATION: CSCI 2000 at UNO ==='
SELECT id, code, title, credits, institution FROM courses 
WHERE code = 'CSCI 2000' AND institution = 'University of New Orleans';

\echo '=== VERIFICATION: CMIN 214 → CSCI 2000 equivalency ==='
SELECT e.id, c1.code AS from_code, c1.institution AS from_inst,
       c2.code AS to_code, c2.institution AS to_inst, e.equivalency_type
FROM equivalencies e
JOIN courses c1 ON e.from_course_id = c1.id
JOIN courses c2 ON e.to_course_id = c2.id
WHERE c1.id = 6679;

\echo '=== VERIFICATION: All prerequisites in system ==='
SELECT id, code, title, institution, prerequisites
FROM courses WHERE prerequisites IS NOT NULL AND prerequisites != ''
ORDER BY code;
