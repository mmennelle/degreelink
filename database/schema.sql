CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    institution VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    prerequisites TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_institution ON courses(institution);

CREATE TABLE programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    degree_type VARCHAR(50) NOT NULL,
    institution VARCHAR(100) NOT NULL,
    total_credits_required INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE program_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    credits_required INTEGER NOT NULL,
    description TEXT,
    required_courses TEXT,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

CREATE TABLE equivalencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_course_id INTEGER NOT NULL,
    to_course_id INTEGER NOT NULL,
    equivalency_type VARCHAR(50) DEFAULT 'direct',
    notes TEXT,
    approved_by VARCHAR(100),
    approved_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_course_id) REFERENCES courses(id),
    FOREIGN KEY (to_course_id) REFERENCES courses(id),
    UNIQUE(from_course_id, to_course_id)
);

CREATE TABLE plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name VARCHAR(200) NOT NULL,
    student_email VARCHAR(200),
    program_id INTEGER NOT NULL,
    plan_name VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

CREATE TABLE plan_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    semester VARCHAR(50),
    year INTEGER,
    status VARCHAR(50) DEFAULT 'planned',
    grade VARCHAR(10),
    credits INTEGER,
    requirement_category VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Sample CSV formats for upload

-- courses.csv format:
-- code,title,description,credits,institution,department,prerequisites
-- "BIOL 101","Introduction to Biology","Fundamental principles of biology",4,"City Community College","Biology",""
-- "MATH 151","Calculus I","Limits and derivatives",4,"City Community College","Mathematics","MATH 141"

-- equivalencies.csv format:
-- from_course_code,from_institution,to_course_code,to_institution,equivalency_type,notes,approved_by
-- "BIOL 101","City Community College","BIO 1010","State University","direct","Direct transfer","Dr. Smith"
-- "MATH 151","City Community College","MATH 1210","State University","direct","Same content","Dr. Johnson"