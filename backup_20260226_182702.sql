--
-- PostgreSQL database dump
--

\restrict VOHhl2tF4WXCdxgZpXVjzss20WNceQlrARaberbo32l7r5dfwqKJ1AKXWGANfW8

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: advisor_auth; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.advisor_auth (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    access_code character varying(6),
    code_expires_at timestamp without time zone,
    is_active boolean NOT NULL,
    last_login timestamp without time zone,
    session_token character varying(64),
    session_expires_at timestamp without time zone,
    failed_attempts integer NOT NULL,
    last_attempt timestamp without time zone,
    locked_until timestamp without time zone,
    added_at timestamp without time zone NOT NULL,
    added_by character varying(255),
    otp_secret character varying(32)
);


ALTER TABLE public.advisor_auth OWNER TO ct_user;

--
-- Name: advisor_auth_id_seq; Type: SEQUENCE; Schema: public; Owner: ct_user
--

CREATE SEQUENCE public.advisor_auth_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.advisor_auth_id_seq OWNER TO ct_user;

--
-- Name: advisor_auth_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ct_user
--

ALTER SEQUENCE public.advisor_auth_id_seq OWNED BY public.advisor_auth.id;


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO ct_user;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    subject_code character varying(20) NOT NULL,
    course_number character varying(20) NOT NULL,
    course_number_numeric integer,
    course_level integer,
    title character varying(200) NOT NULL,
    description text,
    credits integer NOT NULL,
    institution character varying(100) NOT NULL,
    department character varying(100),
    prerequisites text,
    has_lab boolean NOT NULL,
    course_type character varying(50) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.courses OWNER TO ct_user;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: ct_user
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO ct_user;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ct_user
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: equivalencies; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.equivalencies (
    id integer NOT NULL,
    from_course_id integer NOT NULL,
    to_course_id integer NOT NULL,
    equivalency_type character varying(50),
    notes text,
    approved_by character varying(100),
    approved_date timestamp without time zone,
    created_at timestamp without time zone
);


ALTER TABLE public.equivalencies OWNER TO ct_user;

--
-- Name: equivalencies_id_seq; Type: SEQUENCE; Schema: public; Owner: ct_user
--

CREATE SEQUENCE public.equivalencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equivalencies_id_seq OWNER TO ct_user;

--
-- Name: equivalencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ct_user
--

ALTER SEQUENCE public.equivalencies_id_seq OWNED BY public.equivalencies.id;


--
-- Name: group_course_options; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.group_course_options (
    id integer NOT NULL,
    group_id integer NOT NULL,
    course_code character varying(20) NOT NULL,
    institution character varying(100),
    is_preferred boolean,
    notes text
);


ALTER TABLE public.group_course_options OWNER TO ct_user;

--
-- Name: group_course_options_id_seq; Type: SEQUENCE; Schema: public; Owner: ct_user
--

CREATE SEQUENCE public.group_course_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_course_options_id_seq OWNER TO ct_user;

--
-- Name: group_course_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ct_user
--

ALTER SEQUENCE public.group_course_options_id_seq OWNED BY public.group_course_options.id;


--
-- Name: plan_courses; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.plan_courses (
    id integer NOT NULL,
    plan_id integer NOT NULL,
    course_id integer NOT NULL,
    semester character varying(50),
    year integer,
    status character varying(50),
    grade character varying(10),
    credits integer,
    requirement_category character varying(100),
    requirement_group_id integer,
    notes text,
    constraint_violation boolean,
    constraint_violation_reason text
);


ALTER TABLE public.plan_courses OWNER TO ct_user;

--
-- Name: plan_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: ct_user
--

CREATE SEQUENCE public.plan_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plan_courses_id_seq OWNER TO ct_user;

--
-- Name: plan_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ct_user
--

ALTER SEQUENCE public.plan_courses_id_seq OWNED BY public.plan_courses.id;


--
-- Name: plans; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.plans (
    id integer NOT NULL,
    student_name character varying(200) NOT NULL,
    student_email character varying(200),
    program_id integer NOT NULL,
    current_program_id integer,
    plan_name character varying(200) NOT NULL,
    plan_code character varying(8) NOT NULL,
    status character varying(50),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    advisor_email character varying(255),
    program_version_semester character varying(50),
    program_version_year integer,
    catalog_year_locked_at timestamp without time zone
);


ALTER TABLE public.plans OWNER TO ct_user;

--
-- Name: plans_id_seq; Type: SEQUENCE; Schema: public; Owner: ct_user
--

CREATE SEQUENCE public.plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plans_id_seq OWNER TO ct_user;

--
-- Name: plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ct_user
--

ALTER SEQUENCE public.plans_id_seq OWNED BY public.plans.id;


--
-- Name: program_requirements; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.program_requirements (
    id integer NOT NULL,
    program_id integer NOT NULL,
    category character varying(100) NOT NULL,
    credits_required integer NOT NULL,
    description text,
    requirement_type character varying(50),
    is_flexible boolean,
    priority_order integer,
    semester character varying(50),
    year integer,
    is_current boolean
);


ALTER TABLE public.program_requirements OWNER TO ct_user;

--
-- Name: program_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: ct_user
--

CREATE SEQUENCE public.program_requirements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.program_requirements_id_seq OWNER TO ct_user;

--
-- Name: program_requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ct_user
--

ALTER SEQUENCE public.program_requirements_id_seq OWNED BY public.program_requirements.id;


--
-- Name: programs; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.programs (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    degree_type character varying(50) NOT NULL,
    institution character varying(100) NOT NULL,
    total_credits_required integer NOT NULL,
    description text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.programs OWNER TO ct_user;

--
-- Name: programs_id_seq; Type: SEQUENCE; Schema: public; Owner: ct_user
--

CREATE SEQUENCE public.programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.programs_id_seq OWNER TO ct_user;

--
-- Name: programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ct_user
--

ALTER SEQUENCE public.programs_id_seq OWNED BY public.programs.id;


--
-- Name: requirement_constraints; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.requirement_constraints (
    id integer NOT NULL,
    requirement_id integer NOT NULL,
    constraint_type character varying(50) NOT NULL,
    params text NOT NULL,
    scope_filter text,
    description text,
    priority integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.requirement_constraints OWNER TO ct_user;

--
-- Name: requirement_constraints_id_seq; Type: SEQUENCE; Schema: public; Owner: ct_user
--

CREATE SEQUENCE public.requirement_constraints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.requirement_constraints_id_seq OWNER TO ct_user;

--
-- Name: requirement_constraints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ct_user
--

ALTER SEQUENCE public.requirement_constraints_id_seq OWNED BY public.requirement_constraints.id;


--
-- Name: requirement_groups; Type: TABLE; Schema: public; Owner: ct_user
--

CREATE TABLE public.requirement_groups (
    id integer NOT NULL,
    requirement_id integer NOT NULL,
    group_name character varying(100) NOT NULL,
    courses_required integer NOT NULL,
    credits_required integer,
    min_credits_per_course integer,
    max_credits_per_course integer,
    description text,
    is_required boolean
);


ALTER TABLE public.requirement_groups OWNER TO ct_user;

--
-- Name: requirement_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: ct_user
--

CREATE SEQUENCE public.requirement_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.requirement_groups_id_seq OWNER TO ct_user;

--
-- Name: requirement_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ct_user
--

ALTER SEQUENCE public.requirement_groups_id_seq OWNED BY public.requirement_groups.id;


--
-- Name: advisor_auth id; Type: DEFAULT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.advisor_auth ALTER COLUMN id SET DEFAULT nextval('public.advisor_auth_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: equivalencies id; Type: DEFAULT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.equivalencies ALTER COLUMN id SET DEFAULT nextval('public.equivalencies_id_seq'::regclass);


--
-- Name: group_course_options id; Type: DEFAULT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.group_course_options ALTER COLUMN id SET DEFAULT nextval('public.group_course_options_id_seq'::regclass);


--
-- Name: plan_courses id; Type: DEFAULT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.plan_courses ALTER COLUMN id SET DEFAULT nextval('public.plan_courses_id_seq'::regclass);


--
-- Name: plans id; Type: DEFAULT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.plans ALTER COLUMN id SET DEFAULT nextval('public.plans_id_seq'::regclass);


--
-- Name: program_requirements id; Type: DEFAULT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.program_requirements ALTER COLUMN id SET DEFAULT nextval('public.program_requirements_id_seq'::regclass);


--
-- Name: programs id; Type: DEFAULT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.programs ALTER COLUMN id SET DEFAULT nextval('public.programs_id_seq'::regclass);


--
-- Name: requirement_constraints id; Type: DEFAULT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.requirement_constraints ALTER COLUMN id SET DEFAULT nextval('public.requirement_constraints_id_seq'::regclass);


--
-- Name: requirement_groups id; Type: DEFAULT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.requirement_groups ALTER COLUMN id SET DEFAULT nextval('public.requirement_groups_id_seq'::regclass);


--
-- Data for Name: advisor_auth; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.advisor_auth (id, email, access_code, code_expires_at, is_active, last_login, session_token, session_expires_at, failed_attempts, last_attempt, locked_until, added_at, added_by, otp_secret) FROM stdin;
3	vassil@cs.uno.edu	\N	\N	f	\N	\N	\N	0	\N	\N	2025-11-21 17:46:41.992591	admin	\N
4	rdalto@dcc.edu	\N	\N	f	\N	\N	\N	0	\N	\N	2025-11-21 17:47:18.846858	admin	\N
5	arosen@dcc.edu	\N	\N	f	\N	\N	\N	0	\N	\N	2025-11-21 17:47:53.299878	admin	\N
2	wschluch@uno.edu	476416	2025-12-02 16:51:56.320338	t	2025-12-02 16:37:55.118559	4rDrqrQ_ofwzYH13m96LJ6ovMdrQkGLWFgU56PW3_qTGjQVcntgC6VEkXNGeItRL	2025-12-02 17:37:55.118519	0	\N	\N	2025-11-21 17:46:20.548306	admin	ZNFWT73LKGPDCJYWJDYVTCC2DOSZCCG5
1	mmennell@uno.edu	853580	2026-02-10 19:36:15.198783	f	2026-02-10 19:21:32.923238	\N	\N	0	2026-01-13 18:34:17.860627	\N	2025-11-21 16:48:22.105075	system_initialization	P2ZOCRTD5IIR43WWRZPRFGAITKABO5F7
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.alembic_version (version_num) FROM stdin;
c5d6e7f8g9h0
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.courses (id, code, subject_code, course_number, course_number_numeric, course_level, title, description, credits, institution, department, prerequisites, has_lab, course_type, created_at, updated_at) FROM stdin;
1	ASLS 101	ASLS	101	101	1000	AMERICAN SIGN LANGUAGE I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.66055	2025-11-20 22:14:35.660583
2	ENGL 101	ENGL	101	101	1000	ENGLISH COMPOSITION I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.668064	2025-11-20 22:14:35.668074
3	ENGL 102	ENGL	102	102	1000	ENGLISH COMPOSITION II		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.674088	2025-11-20 22:14:35.674098
4	ENGL 110	ENGL	110	110	1000	INTENSIVE ENGLISH COMPOSITION I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.679548	2025-11-20 22:14:35.679557
5	ENGL 112	ENGL	112	112	1000	WRITING FOR BUSINESS AND INDUSTRY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.68447	2025-11-20 22:14:35.684477
6	ENGL 205	ENGL	205	205	2000	INTRODUCTION TO SHORT STORY AND NOVEL		5	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.689499	2025-11-20 22:14:35.689507
7	ENGL 206	ENGL	206	206	2000	INTRODUCTION TO POETRY AND DRAMA		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.694044	2025-11-20 22:14:35.69405
8	ENGL 207	ENGL	207	207	2000	INTRODUCTION TO LITERATURE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.698582	2025-11-20 22:14:35.698589
9	ENGL 211	ENGL	211	211	2000	AMERICAN LITERATURE TO 1865		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.703049	2025-11-20 22:14:35.703056
10	ENGL 212	ENGL	212	212	2000	AMERICAN LITERATURE AFTER 1865		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.70749	2025-11-20 22:14:35.707496
11	ENGL 221	ENGL	221	221	2000	BRITISH LITERATURE TO 1798		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.712335	2025-11-20 22:14:35.712342
12	ENGL 222	ENGL	222	222	2000	BRITISH LITERATURE AFTER 1798		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.716703	2025-11-20 22:14:35.716709
13	ENGL 231	ENGL	231	231	2000	WORLD LITERATURE I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.720957	2025-11-20 22:14:35.720963
14	ENGL 232	ENGL	232	232	2000	WORLD LITERATURE II		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.725066	2025-11-20 22:14:35.725072
15	ENGL 235	ENGL	235	235	2000	Major World Writers		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.729174	2025-11-20 22:14:35.72918
16	ENGL 240	ENGL	240	240	2000	CURRENT TOPICS IN LITERATURE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.733225	2025-11-20 22:14:35.733231
17	ENGL 241	ENGL	241	241	2000	CURRENT TOPICS IN LITERATURE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.737263	2025-11-20 22:14:35.737269
18	ENGL 243	ENGL	243	243	2000	ETHNIC LITERATURE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.741262	2025-11-20 22:14:35.741268
19	ENGL 244	ENGL	244	244	2000	AFRICAN-AMERICAN WRITERS		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.745315	2025-11-20 22:14:35.74532
20	ENGL 245	ENGL	245	245	2000	Introduction to Women�s Literature		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.749299	2025-11-20 22:14:35.749305
21	ENGL 251	ENGL	251	251	2000	CREATIVE WRITING		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.777751	2025-11-20 22:14:35.777762
22	ENGL 253	ENGL	253	253	2000	THE BIBLE AS LITERATURE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.783722	2025-11-20 22:14:35.783731
23	CMST 130	CMST	130	130	1000	FUNDAMENTALS OF COMMUNICATION		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.789499	2025-11-20 22:14:35.789509
24	CMST 230	CMST	230	230	2000	PUBLIC SPEAKING		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.794701	2025-11-20 22:14:35.794709
25	FNAR 120	FNAR	120	120	1000	ART APPRECIATION		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.799702	2025-11-20 22:14:35.79971
26	FNAR 121	FNAR	121	121	1000	Introduction to Visual Arts		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.804398	2025-11-20 22:14:35.804406
27	FNAR 125	FNAR	125	125	1000	ART HISTORY SURVEY I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.808957	2025-11-20 22:14:35.808965
28	FNAR 126	FNAR	126	126	1000	ART HISTORY SURVEY II		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.813213	2025-11-20 22:14:35.813219
29	FNAR 127	FNAR	127	127	1000	CONTEMPORARY ART		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.817711	2025-11-20 22:14:35.817719
30	FNAR 158	FNAR	158	158	1000	THREE-DIMENSIONAL DESIGN		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.822097	2025-11-20 22:14:35.822104
31	MUSC 105	MUSC	105	105	1000	MUSIC APPRECIATION		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.826237	2025-11-20 22:14:35.826243
32	MUSC 108	MUSC	108	108	1000	Pop Music: Legends of Performance, Culture, and Business		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.830319	2025-11-20 22:14:35.830325
33	MUSC 137	MUSC	137	137	1000	JAZZ APPRECIATION		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.834435	2025-11-20 22:14:35.834441
34	THEA 101	THEA	101	101	1000	INTRODUCTION TO THE THEATRE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.8386	2025-11-20 22:14:35.838606
35	THEA 207	THEA	207	207	2000	CLASSICAL THEATRE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.842932	2025-11-20 22:14:35.842939
36	THEA 209	THEA	209	209	2000	Modern Theatre		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.846803	2025-11-20 22:14:35.84681
37	ARCH 180	ARCH	180	180	1000	HISTORY AND THEORY OF ARCHITECTURE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.850735	2025-11-20 22:14:35.850741
38	FREN 101	FREN	101	101	1000	ELEMENTARY FRENCH I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.854708	2025-11-20 22:14:35.854714
39	FREN 102	FREN	102	102	1000	ELEMENTARY FRENCH II		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.85872	2025-11-20 22:14:35.858725
40	FREN 125	FREN	125	125	1000	FRENCH CULTURE AROUND THE WORLD		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.862694	2025-11-20 22:14:35.862699
41	FREN 201	FREN	201	201	2000	INTERMEDIATE FRENCH I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.866035	2025-11-20 22:14:35.866041
42	FREN 202	FREN	202	202	2000	INTERMEDIATE FRENCH II		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.870363	2025-11-20 22:14:35.870369
43	FREN 225	FREN	225	225	2000	PERSPECTIVES ON CONTEMPORARY FRENCH CULTURE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.873807	2025-11-20 22:14:35.873813
44	HIST 101	HIST	101	101	1000	EARLY WESTERN CIVILIZATION		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.877822	2025-11-20 22:14:35.877827
45	HIST 102	HIST	102	102	1000	MODERN WESTERN CIVILIZATION		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.881825	2025-11-20 22:14:35.881831
46	HIST 103	HIST	103	103	1000	WORLD HISTORY I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.885808	2025-11-20 22:14:35.885814
47	HIST 105	HIST	105	105	1000	WORLD HISTORY II		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.889654	2025-11-20 22:14:35.88966
48	HIST 141	HIST	141	141	1000	AFRICAN-AMERICAN HISTORY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.893688	2025-11-20 22:14:35.893694
49	HIST 205	HIST	205	205	2000	AMERICAN HISTORY TO 1865		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.897663	2025-11-20 22:14:35.897669
50	HIST 206	HIST	206	206	2000	AMERICAN HISTORY AFTER 1865		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.901505	2025-11-20 22:14:35.901511
51	HIST 240	HIST	240	240	2000	SPECIAL TOPICS IN HISTORY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.905398	2025-11-20 22:14:35.905404
52	HIST 241	HIST	241	241	2000	SPECIAL TOPICS IN HISTORY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.909428	2025-11-20 22:14:35.909433
53	HIST 242	HIST	242	242	2000	American Womens History		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.913436	2025-11-20 22:14:35.913442
54	HIST 260	HIST	260	260	2000	LOUISIANA HISTORY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.917837	2025-11-20 22:14:35.917843
55	HUMA 105	HUMA	105	105	1000	HUMANITIES THROUGH THE ARTS		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.922069	2025-11-20 22:14:35.922075
56	HUMA 150	HUMA	150	150	1000	STRUCTURE OF WESTERN THOUGHT: ANCIENT GREECE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.925994	2025-11-20 22:14:35.925999
57	HUMA 211	HUMA	211	211	2000	Humanities I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.930034	2025-11-20 22:14:35.93004
58	HUMA 212	HUMA	212	212	2000	Humanities II		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.934055	2025-11-20 22:14:35.934061
59	HUMA 220	HUMA	220	220	2000	MODERNISM IN THE ARTS		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.938079	2025-11-20 22:14:35.938085
60	HUMA 260	HUMA	260	260	2000	ACTIVISM AND CHANGE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.942121	2025-11-20 22:14:35.942126
61	PHIL 101	PHIL	101	101	1000	INTRODUCTION TO PHILOSOPHY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.946246	2025-11-20 22:14:35.946251
62	PHIL 175	PHIL	175	175	1000	SOCIAL ETHICS		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.950045	2025-11-20 22:14:35.950051
63	SPAN 101	SPAN	101	101	1000	ELEMENTARY SPANISH I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.954322	2025-11-20 22:14:35.954328
64	SPAN 102	SPAN	102	102	1000	ELEMENTARY SPANISH II		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.958329	2025-11-20 22:14:35.958334
65	SPAN 201	SPAN	201	201	2000	INTERMEDIATE SPANISH I		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.962064	2025-11-20 22:14:35.96207
66	SPAN 202	SPAN	202	202	2000	INTERMEDIATE SPANISH II		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:35.966004	2025-11-20 22:14:35.96601
67	SPAN 204	SPAN	204	204	2000	CIVILIZATION AND CULTURES OF HISPANOAMERICA		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:35.969975	2025-11-20 22:14:35.96998
68	ANTH 160	ANTH	160	160	1000	CULTURAL ANTHROPOLOGY		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:35.973871	2025-11-20 22:14:35.973877
69	ANTH 165	ANTH	165	165	1000	PHYSICAL ANTHROPOLOGY		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:35.97763	2025-11-20 22:14:35.977636
70	ANTH 181	ANTH	181	181	1000	GEOGRAPHY		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:35.981557	2025-11-20 22:14:35.981583
71	ANTH 200	ANTH	200	200	2000	MUSIC AS CULTURE		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:35.98553	2025-11-20 22:14:35.985536
72	ANTH 205	ANTH	205	205	2000	PHYSICAL GEOGRAPHY		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:35.989397	2025-11-20 22:14:35.989403
73	ECON 201	ECON	201	201	2000	MACROECONOMICS		3	Delgado Community College	School of Business		f	lecture	2025-11-20 22:14:35.993188	2025-11-20 22:14:35.993193
74	ECON 202	ECON	202	202	2000	MICROECONOMICS		3	Delgado Community College	School of Business		f	lecture	2025-11-20 22:14:35.997097	2025-11-20 22:14:35.997103
75	POLI 180	POLI	180	180	1000	AMERICAN GOVERNMENT		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.001041	2025-11-20 22:14:36.001047
76	PSYC 112	PSYC	112	112	1000	HUMAN SEXUALITY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.00505	2025-11-20 22:14:36.005055
77	PSYC 127	PSYC	127	127	1000	GENERAL PSYCHOLOGY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.009054	2025-11-20 22:14:36.00906
78	PSYC 217	PSYC	217	217	2000	PSYCHOLOGY OF ADJUSTMENT		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.013035	2025-11-20 22:14:36.01304
79	PSYC 225	PSYC	225	225	2000	CHILD PSYCHOLOGY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.017022	2025-11-20 22:14:36.017027
80	PSYC 226	PSYC	226	226	2000	HUMAN GROWTH AND DEVELOPMENT		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.021002	2025-11-20 22:14:36.021008
81	PSYC 235	PSYC	235	235	2000	EDUCATIONAL PSYCHOLOGY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.024987	2025-11-20 22:14:36.024993
82	PSYC 240	PSYC	240	240	2000	ABNORMAL PSYCHOLOGY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.028991	2025-11-20 22:14:36.028997
83	PSYC 245	PSYC	245	245	2000	SOCIAL PSYCHOLOGY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.033229	2025-11-20 22:14:36.033235
84	SOCI 151	SOCI	151	151	1000	INTRODUCTORY SOCIOLOGY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.037149	2025-11-20 22:14:36.037155
85	SOCI 153	SOCI	153	153	1000	INTRODUCTION TO SOCIAL WELFARE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.041015	2025-11-20 22:14:36.041021
86	SOCI 155	SOCI	155	155	1000	Social Problems		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.045	2025-11-20 22:14:36.045006
87	SOCI 250	SOCI	250	250	2000	STUDIES IN CULTURAL DIVERSITY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.049051	2025-11-20 22:14:36.049057
88	SOCI 255	SOCI	255	255	2000	MARRIAGE AND THE FAMILY		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.053011	2025-11-20 22:14:36.053016
89	SOCI 257	SOCI	257	257	2000	SOCIAL GERONTOLOGY: AGING AND THE LIFE CYCLE		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.057007	2025-11-20 22:14:36.057013
90	BIOL 101	BIOL	101	101	1000	General Biology I (non-science majors)		3	Delgado Community College	School of Liberal Arts, Social Sciences, and Education		f	lecture	2025-11-20 22:14:36.060935	2025-11-20 22:14:36.06094
91	BIOL 102	BIOL	102	102	1000	General Biology II (non-science majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.064632	2025-11-20 22:14:36.064637
92	BIOL 107	BIOL	107	107	1000	General Biology I Lab (non-science majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.068414	2025-11-20 22:14:36.06842
93	BIOL 108	BIOL	108	108	1000	General Biology II Lab (non-science majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.0718	2025-11-20 22:14:36.071805
94	BIOL 114	BIOL	114	114	1000	Nutrition		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.07618	2025-11-20 22:14:36.076185
95	BIOL 120	BIOL	120	120	1000	Introductory Plant Biology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.079982	2025-11-20 22:14:36.079987
96	BIOL 121	BIOL	121	121	1000	Introductory Plant Biology Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.083627	2025-11-20 22:14:36.083633
97	BIOL 141	BIOL	141	141	1000	General Biology I (Science Majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.087478	2025-11-20 22:14:36.087484
98	BIOL 142	BIOL	142	142	1000	General Biology II (Science Majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.091375	2025-11-20 22:14:36.091381
99	BIOL 143	BIOL	143	143	1000	General Biology I Lab (Science Majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.095207	2025-11-20 22:14:36.095212
100	BIOL 144	BIOL	144	144	1000	General Biology II Lab (Science Majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.098991	2025-11-20 22:14:36.098996
101	BIOL 161	BIOL	161	161	1000	Introductory Anatomy and Physiology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.102887	2025-11-20 22:14:36.102892
102	BIOL 163	BIOL	163	163	1000	Introductory Anatomy and Physiology Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.106467	2025-11-20 22:14:36.106472
103	BIOL 179	BIOL	179	179	1000	Independent Studies in Biology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.110346	2025-11-20 22:14:36.110351
104	BIOL 180	BIOL	180	180	1000	Biological Issues		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.114254	2025-11-20 22:14:36.11426
105	BIOL 184	BIOL	184	184	1000	Biological Issues		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.118461	2025-11-20 22:14:36.118467
106	BIOL 201	BIOL	201	201	2000	Botany I		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.122912	2025-11-20 22:14:36.12292
107	BIOL 203	BIOL	203	203	2000	Botany I Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.127275	2025-11-20 22:14:36.127281
108	BIOL 204	BIOL	204	204	2000	Plant Taxonomy		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.131215	2025-11-20 22:14:36.13122
109	BIOL 205	BIOL	205	205	2000	Plant Taxonomy Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.134969	2025-11-20 22:14:36.134974
110	BIOL 207	BIOL	207	207	2000	Comparative Anatomy		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.138752	2025-11-20 22:14:36.138757
111	BIOL 209	BIOL	209	209	2000	Comparative Anatomy Lab		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.142593	2025-11-20 22:14:36.142598
112	BIOL 210	BIOL	210	210	2000	General Microbiology (Science Majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.146438	2025-11-20 22:14:36.146443
113	BIOL 211	BIOL	211	211	2000	Microbiology of Human Pathogens		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.150331	2025-11-20 22:14:36.150337
114	BIOL 212	BIOL	212	212	2000	General Microbiology Lab (Science Majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.154234	2025-11-20 22:14:36.154239
115	BIOL 213	BIOL	213	213	2000	Introduction to Food and Water Microbiology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.158149	2025-11-20 22:14:36.158155
116	BIOL 231	BIOL	231	231	2000	Introduction to Biological Evolution		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.161953	2025-11-20 22:14:36.161959
117	BIOL 235	BIOL	235	235	2000	Forensic Biology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.165733	2025-11-20 22:14:36.165738
118	BIOL 236	BIOL	236	236	2000	Forensic Biology Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.16966	2025-11-20 22:14:36.169666
119	BIOL 245	BIOL	245	245	2000	Genetics		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.173689	2025-11-20 22:14:36.173695
120	BIOL 246	BIOL	246	246	2000	Genetics Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.177698	2025-11-20 22:14:36.177704
121	BIOL 251	BIOL	251	251	2000	Human Anatomy and Physiology I		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.181713	2025-11-20 22:14:36.181719
122	BIOL 252	BIOL	252	252	2000	Human Anatomy and Physiology II		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.185631	2025-11-20 22:14:36.185637
123	BIOL 253	BIOL	253	253	2000	Human Anatomy and Physiology I Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.189509	2025-11-20 22:14:36.189515
124	BIOL 254	BIOL	254	254	2000	Human Anatomy and Physiology II Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.193491	2025-11-20 22:14:36.193497
125	BIOL 265	BIOL	265	265	2000	Cell Biology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.197687	2025-11-20 22:14:36.197692
126	BIOL 266	BIOL	266	266	2000	Cell Biology Lab		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.201666	2025-11-20 22:14:36.201672
127	BIOL 271	BIOL	271	271	2000	Pathophysiology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.205546	2025-11-20 22:14:36.205552
128	BIOL 272	BIOL	272	272	2000	Natural History of the Vertebrates		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.209512	2025-11-20 22:14:36.209517
129	BIOL 273	BIOL	273	273	2000	Natural History of the Vertebrates Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.213499	2025-11-20 22:14:36.213504
130	BIOL 279	BIOL	279	279	2000	Advanced Independent Studies in Biology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.217406	2025-11-20 22:14:36.217412
131	BIOL 281	BIOL	281	281	2000	Introduction to Ecology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.221386	2025-11-20 22:14:36.221391
132	BIOL 283	BIOL	283	283	2000	Introduction to Ecology Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.225288	2025-11-20 22:14:36.225293
133	BIOL 296	BIOL	296	296	2000	Biological Internship		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	research	2025-11-20 22:14:36.229388	2025-11-20 22:14:36.229394
134	BIOL 297	BIOL	297	297	2000	Biological Internship		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	research	2025-11-20 22:14:36.233286	2025-11-20 22:14:36.233291
135	BIOL 298	BIOL	298	298	2000	Biological Internship		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	research	2025-11-20 22:14:36.237205	2025-11-20 22:14:36.237211
136	BIOL 299	BIOL	299	299	2000	Biological Internship		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	research	2025-11-20 22:14:36.241057	2025-11-20 22:14:36.241063
137	BTEC 274	BTEC	274	274	2000	Introduction to Nucleic Acids		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.24504	2025-11-20 22:14:36.245046
138	BTEC 275	BTEC	275	275	2000	Introduction to Protein Expression and Analysis		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.248852	2025-11-20 22:14:36.248858
139	BTEC 280	BTEC	280	280	2000	Microscopy Techniques		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.252775	2025-11-20 22:14:36.25278
140	BTEC 282	BTEC	282	282	2000	Introduction to Molecular and Genetic Biology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.256512	2025-11-20 22:14:36.256518
141	BTEC 284	BTEC	284	284	2000	Biomolecules		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.260522	2025-11-20 22:14:36.260528
142	BTEC 285	BTEC	285	285	2000	Bioinformatics and Bioethics		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.26422	2025-11-20 22:14:36.264225
143	BTEC 286	BTEC	286	286	2000	Cell Culture Techniques Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.267998	2025-11-20 22:14:36.268004
144	CHEM 100	CHEM	100	100	1000	Chemistry in Society		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.271959	2025-11-20 22:14:36.271964
145	CHEM 101	CHEM	101	101	1000	Chemistry I (non-science majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.275962	2025-11-20 22:14:36.275968
146	CHEM 102	CHEM	102	102	1000	Chemistry II (non-science majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.279684	2025-11-20 22:14:36.279689
147	CHEM 107	CHEM	107	107	1000	Chemistry I Lab (non-science majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.286101	2025-11-20 22:14:36.286111
148	CHEM 108	CHEM	108	108	1000	Chemistry II Lab (non-science majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.291017	2025-11-20 22:14:36.291026
149	CHEM 141	CHEM	141	141	1000	Chemistry I (Science Majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.294871	2025-11-20 22:14:36.294878
150	CHEM 142	CHEM	142	142	1000	Chemistry II (Science Majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.298323	2025-11-20 22:14:36.298332
151	CHEM 143	CHEM	143	143	1000	Chemistry I Lab (Science Majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.303097	2025-11-20 22:14:36.303107
152	CHEM 144	CHEM	144	144	1000	Chemistry II Lab (Science Majors)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.30839	2025-11-20 22:14:36.308399
153	CHEM 201	CHEM	201	201	2000	Introduction to Organic and Biochemistry		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.31304	2025-11-20 22:14:36.313047
154	CHEM 203	CHEM	203	203	2000	Introduction to Organic and Biochemistry Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.317668	2025-11-20 22:14:36.317676
155	CHEM 221	CHEM	221	221	2000	Organic Chemistry I		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.322198	2025-11-20 22:14:36.322205
156	CHEM 222	CHEM	222	222	2000	Organic Chemistry II		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.326864	2025-11-20 22:14:36.326871
157	CHEM 223	CHEM	223	223	2000	Organic Chemistry Lab I		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.331655	2025-11-20 22:14:36.331664
158	CHEM 224	CHEM	224	224	2000	Organic Chemistry Lab II		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.336643	2025-11-20 22:14:36.33665
159	CHEM 241	CHEM	241	241	2000	Analytical Chemistry (Quantitative Analysis)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.34105	2025-11-20 22:14:36.341056
160	CHEM 243	CHEM	243	243	2000	Analytical Chemistry Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.345329	2025-11-20 22:14:36.345335
161	CHEM 291	CHEM	291	291	2000	Fundamentals of Biochemistry		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.349708	2025-11-20 22:14:36.349714
162	CHTC 261	CHTC	261	261	2000	Instrumental Analysis		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.353765	2025-11-20 22:14:36.353771
163	CHTC 271	CHTC	271	271	2000	Applied Instrumental Analysis I		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.35781	2025-11-20 22:14:36.357816
164	CHTC 272	CHTC	272	272	2000	Applied Instrumental Analysis II		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.361727	2025-11-20 22:14:36.361733
165	CHTC 273	CHTC	273	273	2000	Applied Instrumental Analysis III		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.36592	2025-11-20 22:14:36.365926
166	CHTC 274	CHTC	274	274	2000	Applied Instrumental Analysis IV		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.370064	2025-11-20 22:14:36.370069
167	CHTC 281	CHTC	281	281	2000	Applied Organic Chemistry Lab		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.374232	2025-11-20 22:14:36.374238
168	MATH 020	MATH	020	20	2000	Contemporary Math Corequisite		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.37824	2025-11-20 22:14:36.378245
169	MATH 030	MATH	030	30	3000	College Algebra Corequisite		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.382293	2025-11-20 22:14:36.382299
170	MATH 113	MATH	113	113	1000	Algebra for Technology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.386112	2025-11-20 22:14:36.386118
171	MATH 114	MATH	114	114	1000	Geometry and Trigonometry for Technology		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.390291	2025-11-20 22:14:36.390297
172	MATH 120	MATH	120	120	1000	Contemporary Math		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.394358	2025-11-20 22:14:36.394364
173	MATH 123	MATH	123	123	1000	Math for Elementary Teachers		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.398236	2025-11-20 22:14:36.398242
174	MATH 124	MATH	124	124	1000	Geometry for Elementary Teachers		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.402273	2025-11-20 22:14:36.402278
175	MATH 128	MATH	128	128	1000	Applied Algebra		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.406039	2025-11-20 22:14:36.406045
176	MATH 130	MATH	130	130	1000	College Algebra		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.409036	2025-11-20 22:14:36.409041
177	MATH 131	MATH	131	131	1000	Trigonometry		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.412851	2025-11-20 22:14:36.412856
178	MATH 133	MATH	133	133	1000	Intensive College Algebra		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.416595	2025-11-20 22:14:36.4166
179	MATH 140	MATH	140	140	1000	Precalculus		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.420329	2025-11-20 22:14:36.420334
180	MATH 151	MATH	151	151	1000	Finite Math		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.423933	2025-11-20 22:14:36.423938
181	MATH 171	MATH	171	171	1000	Introduction to Data and Decision Science		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.427946	2025-11-20 22:14:36.427951
182	MATH 203	MATH	203	203	2000	Statistics I		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.43163	2025-11-20 22:14:36.431635
183	MATH 205	MATH	205	205	2000	Statistics II		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.435189	2025-11-20 22:14:36.435194
184	MATH 207	MATH	207	207	2000	Biostatistics		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.438912	2025-11-20 22:14:36.438917
185	MATH 220	MATH	220	220	2000	Applied Calculus		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.442668	2025-11-20 22:14:36.442673
186	MATH 221	MATH	221	221	2000	Calculus I		4	Delgado Community College	School of Science, Technology, Engineering, and Math		t	lecture_lab	2025-11-20 22:14:36.446432	2025-11-20 22:14:36.446437
187	MATH 222	MATH	222	222	2000	Calculus II		4	Delgado Community College	School of Science, Technology, Engineering, and Math		t	lecture_lab	2025-11-20 22:14:36.450281	2025-11-20 22:14:36.450286
188	MATH 223	MATH	223	223	2000	Calculus III		4	Delgado Community College	School of Science, Technology, Engineering, and Math		t	lecture_lab	2025-11-20 22:14:36.454153	2025-11-20 22:14:36.454158
189	MATH 265	MATH	265	265	2000	Differential Equations		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.457988	2025-11-20 22:14:36.457993
190	MATH 285	MATH	285	285	2000	Linear Algebra		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.461714	2025-11-20 22:14:36.461719
191	PHYS 101	PHYS	101	101	1000	Introduction to Concepts in Physics		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.465411	2025-11-20 22:14:36.465416
192	PHYS 107	PHYS	107	107	1000	Introduction to Concepts in Physics Laboratory		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.46921	2025-11-20 22:14:36.469216
193	PHYS 141	PHYS	141	141	1000	Physics I (Algebra/Trigonometry Based)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.473027	2025-11-20 22:14:36.473033
194	PHYS 142	PHYS	142	142	1000	Physics II (Algebra/Trigonometry Based)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.47699	2025-11-20 22:14:36.476996
195	PHYS 143	PHYS	143	143	1000	Physics I Lab (Algebra/Trigonometry Based)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.480783	2025-11-20 22:14:36.480788
196	PHYS 144	PHYS	144	144	1000	Physics II Lab (Algebra/Trigonometry Based)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.484651	2025-11-20 22:14:36.484656
197	PHYS 221	PHYS	221	221	2000	Physics I (Calculus Based)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.488264	2025-11-20 22:14:36.488269
198	PHYS 223	PHYS	223	223	2000	Physics I Lab (Calculus Based)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.492669	2025-11-20 22:14:36.492674
199	PHYS 224	PHYS	224	224	2000	Physics II Lab (Calculus Based)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.496413	2025-11-20 22:14:36.496418
200	PHYS 226	PHYS	226	226	2000	Physics III Lab (Calculus Based)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.499274	2025-11-20 22:14:36.499279
201	PHYS 228	PHYS	228	228	2000	Physics II (Calculus Based)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.502267	2025-11-20 22:14:36.502274
202	PHYS 229	PHYS	229	229	2000	Physics III (Calculus Based)		3	Delgado Community College	School of Science, Technology, Engineering, and Math		f	lecture	2025-11-20 22:14:36.504392	2025-11-20 22:14:36.504396
203	ENEE 5533	ENEE	5533	5533	5000	Digital Control System Design		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:14:58.750488	2025-11-20 22:14:58.750498
204	ACCT 2100	ACCT	2100	2100	2000	Principles of Accounting		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.755875	2025-11-20 22:14:58.75588
205	ACCT 2130	ACCT	2130	2130	2000	Management Accounting		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.759804	2025-11-20 22:14:58.759809
206	ACCT 3090	ACCT	3090	3090	3000	Internship in Accounting		3	University Of New Orleans	College of Business Administration		f	research	2025-11-20 22:14:58.763679	2025-11-20 22:14:58.763684
207	ACCT 3091	ACCT	3091	3091	3000	Internship in Accounting		3	University Of New Orleans	College of Business Administration		f	research	2025-11-20 22:14:58.767517	2025-11-20 22:14:58.767523
208	ACCT 3120	ACCT	3120	3120	3000	Accounting Lab		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.771285	2025-11-20 22:14:58.771291
209	ACCT 3121	ACCT	3121	3121	3000	Intermediate Accounting I		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.775051	2025-11-20 22:14:58.775056
210	ACCT 3122	ACCT	3122	3122	3000	Intermediate Accounting II		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.778984	2025-11-20 22:14:58.778989
211	ACCT 3123	ACCT	3123	3123	3000	Adv Financial Accounting		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.782949	2025-11-20 22:14:58.782954
212	ACCT 3124	ACCT	3124	3124	3000	Governmental Accounting		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.786812	2025-11-20 22:14:58.786817
213	ACCT 3131	ACCT	3131	3131	3000	Cost Accounting I		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.790673	2025-11-20 22:14:58.790679
214	ACCT 3141	ACCT	3141	3141	3000	Accounting Info Systems		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.794739	2025-11-20 22:14:58.794745
215	ACCT 3152	ACCT	3152	3152	3000	Tax Accounting I		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.798724	2025-11-20 22:14:58.79873
216	ACCT 3161	ACCT	3161	3161	3000	Auditing		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.802717	2025-11-20 22:14:58.802722
217	ACCT 3191	ACCT	3191	3191	3000	Independent Study		3	University Of New Orleans	College of Business Administration		f	research	2025-11-20 22:14:58.806727	2025-11-20 22:14:58.806733
218	ACCT 3999	ACCT	3999	3999	3000	Senior Honors Thesis		3	University Of New Orleans	College of Business Administration		f	research	2025-11-20 22:14:58.810686	2025-11-20 22:14:58.810691
219	ACCT 4110	ACCT	4110	4110	4000	CPA Review		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.814689	2025-11-20 22:14:58.814694
220	ACCT 4142	ACCT	4142	4142	4000	IT Auditing & Advanced Accounting Information Systems		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.818739	2025-11-20 22:14:58.818745
221	ACCT 4152	ACCT	4152	4152	4000	Tax Accounting II		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.822745	2025-11-20 22:14:58.822751
222	ACCT 4153	ACCT	4153	4153	4000	Individual Tax Planning		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.826491	2025-11-20 22:14:58.826497
223	ACCT 4154	ACCT	4154	4154	4000	Estate & Gift Taxation		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.83038	2025-11-20 22:14:58.830385
224	ACCT 4162	ACCT	4162	4162	4000	Advanced Auditing		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.834286	2025-11-20 22:14:58.834291
225	ACCT 4167	ACCT	4167	4167	4000	Internal Auditing		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.838337	2025-11-20 22:14:58.838342
226	ACCT 4168	ACCT	4168	4168	4000	Operational Auditing		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.842327	2025-11-20 22:14:58.842333
227	ACCT 4190	ACCT	4190	4190	4000	Contemporary Accounting Topics		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.845991	2025-11-20 22:14:58.845996
228	ACCT 4195	ACCT	4195	4195	4000	Internship Internal Auditing		3	University Of New Orleans	College of Business Administration		f	research	2025-11-20 22:14:58.849858	2025-11-20 22:14:58.849863
229	ACCT 5110	ACCT	5110	5110	5000	CPA Review		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.853771	2025-11-20 22:14:58.853777
230	ACCT 5142	ACCT	5142	5142	5000	IT Auditing & Advanced Accounting Information Systems		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.857791	2025-11-20 22:14:58.857796
231	ACCT 5152	ACCT	5152	5152	5000	Tax Accounting II		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.861809	2025-11-20 22:14:58.861815
232	ACCT 5153	ACCT	5153	5153	5000	Individual Tax Planning		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.865833	2025-11-20 22:14:58.865838
233	ACCT 5154	ACCT	5154	5154	5000	Estate & Gift Taxation		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.869824	2025-11-20 22:14:58.86983
234	ACCT 5162	ACCT	5162	5162	5000	Advanced Auditing		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.873841	2025-11-20 22:14:58.873846
235	ACCT 5167	ACCT	5167	5167	5000	Internal Auditing		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.877802	2025-11-20 22:14:58.877807
236	ACCT 5168	ACCT	5168	5168	5000	Operational Auditing		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.881826	2025-11-20 22:14:58.881832
237	ACCT 5180	ACCT	5180	5180	5000	Oil & Gas Accounting		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.885836	2025-11-20 22:14:58.885841
238	ACCT 5190	ACCT	5190	5190	5000	Contemporary Accounting Topics		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.889634	2025-11-20 22:14:58.889639
239	ACCT 5400	ACCT	5400	5400	5000	Intro to Fin Acct		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.893649	2025-11-20 22:14:58.893655
240	ACCT 6125	ACCT	6125	6125	6000	Studies in Accounting Theory		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.897678	2025-11-20 22:14:58.897684
241	ACCT 6130	ACCT	6130	6130	6000	Adv Acct Analy Decision Making		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.901551	2025-11-20 22:14:58.901556
242	ACCT 6131	ACCT	6131	6131	6000	Accounting in Health Care		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.905598	2025-11-20 22:14:58.905603
243	ACCT 6133	ACCT	6133	6133	6000	Study in Managerial Accounting		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.909605	2025-11-20 22:14:58.90961
244	ACCT 6143	ACCT	6143	6143	6000	Sem Accounting Info System		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.91364	2025-11-20 22:14:58.913645
245	ACCT 6151	ACCT	6151	6151	6000	Federal Tax Practice		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.917674	2025-11-20 22:14:58.91768
246	ACCT 6153	ACCT	6153	6153	6000	Tax Corp & Shareholders		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.921846	2025-11-20 22:14:58.921851
247	ACCT 6156	ACCT	6156	6156	6000	Adv Tax of Partners		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.925836	2025-11-20 22:14:58.925841
248	ACCT 6159	ACCT	6159	6159	6000	International Taxation		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.929833	2025-11-20 22:14:58.929839
249	ACCT 6163	ACCT	6163	6163	6000	Seminar in Auditing		3	University Of New Orleans	College of Business Administration		f	seminar	2025-11-20 22:14:58.933832	2025-11-20 22:14:58.933838
250	ACCT 6167	ACCT	6167	6167	6000	Internal Auditing Concepts		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.937643	2025-11-20 22:14:58.937648
251	ACCT 6168	ACCT	6168	6168	6000	Internal/Operational Auditing		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.941448	2025-11-20 22:14:58.941453
252	ACCT 6169	ACCT	6169	6169	6000	Fraud Examination		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.945499	2025-11-20 22:14:58.945504
253	ACCT 6173	ACCT	6173	6173	6000	State & Local Taxation		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.949542	2025-11-20 22:14:58.949547
254	ACCT 6185	ACCT	6185	6185	6000	Strategic Business Planning		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.953399	2025-11-20 22:14:58.953405
255	ACCT 6190	ACCT	6190	6190	6000	Contemporary Tax Acct Topics		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.957644	2025-11-20 22:14:58.95765
256	ACCT 6191	ACCT	6191	6191	6000	Sem Contemporary Acct Topics		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.961717	2025-11-20 22:14:58.961723
257	ACCT 6192	ACCT	6192	6192	6000	Special Topic Accounting		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.965734	2025-11-20 22:14:58.965739
258	ACCT 6194	ACCT	6194	6194	6000	Internship in Accounting		3	University Of New Orleans	College of Business Administration		f	research	2025-11-20 22:14:58.969742	2025-11-20 22:14:58.969748
259	ACCT 6195	ACCT	6195	6195	6000	Directed Study		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.973714	2025-11-20 22:14:58.97372
260	ACCT 7040	ACCT	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:14:58.977843	2025-11-20 22:14:58.977849
261	AERO 1001	AERO	1001	1001	1000	Foundations USAF I		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:58.981892	2025-11-20 22:14:58.981898
262	AERO 1002	AERO	1002	1002	1000	Foundations USAF II		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:58.9861	2025-11-20 22:14:58.986106
263	AERO 1041	AERO	1041	1041	1000	Foundations USAF I Lab		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:58.990337	2025-11-20 22:14:58.990343
264	AERO 1042	AERO	1042	1042	1000	Foundations USAF II Lab		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:58.994433	2025-11-20 22:14:58.994439
265	AERO 1201	AERO	1201	1201	1000	Evolut. of USAF Air and Space		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:58.998483	2025-11-20 22:14:58.998488
266	AERO 1202	AERO	1202	1202	1000	Dev. of Air Power II		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.002517	2025-11-20 22:14:59.002523
267	AERO 1241	AERO	1241	1241	1000	Development of Air Power I Lab		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.006592	2025-11-20 22:14:59.006598
268	AERO 1242	AERO	1242	1242	1000	Development Air Power II Lab		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.010738	2025-11-20 22:14:59.010744
269	AERO 3001	AERO	3001	3001	3000	Leadership Studies I		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.014838	2025-11-20 22:14:59.014843
270	AERO 3002	AERO	3002	3002	3000	Leadership Studies II		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.018483	2025-11-20 22:14:59.018489
271	AERO 3041	AERO	3041	3041	3000	Leadership Studies I Lab		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.022522	2025-11-20 22:14:59.022527
272	AERO 3042	AERO	3042	3042	3000	Leadership Studies II Lab		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.026407	2025-11-20 22:14:59.026412
273	AERO 3401	AERO	3401	3401	3000	National Security Affairs I		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.030512	2025-11-20 22:14:59.030518
274	AERO 3402	AERO	3402	3402	3000	Nat Security Affairs II		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.0343	2025-11-20 22:14:59.034307
275	AERO 3441	AERO	3441	3441	3000	Nat Security Affairs I Lab		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.038432	2025-11-20 22:14:59.038438
276	AERO 3442	AERO	3442	3442	3000	Nat Security Affairs II Lab		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.042628	2025-11-20 22:14:59.042633
277	ANTH 1010	ANTH	1010	1010	1000	Peoples of the World		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.046547	2025-11-20 22:14:59.046555
278	ANTH 1020	ANTH	1020	1020	1000	Fads Fallacies & Human Origins		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.05073	2025-11-20 22:14:59.050736
279	ANTH 1030	ANTH	1030	1030	1000	America as a Foreign Culture		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.054826	2025-11-20 22:14:59.054832
280	ANTH 2051	ANTH	2051	2051	2000	Human Origins		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.058684	2025-11-20 22:14:59.05869
281	ANTH 2052	ANTH	2052	2052	2000	Cultural Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.062781	2025-11-20 22:14:59.062787
282	ANTH 2232	ANTH	2232	2232	2000	World Archeology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.067089	2025-11-20 22:14:59.067095
283	ANTH 2992	ANTH	2992	2992	2000	Independent Work		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.071312	2025-11-20 22:14:59.071317
284	ANTH 2993	ANTH	2993	2993	2000	Independent Work		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.075382	2025-11-20 22:14:59.075388
285	ANTH 3090	ANTH	3090	3090	3000	Special Topics Cultural Anth		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.079393	2025-11-20 22:14:59.079399
286	ANTH 3095	ANTH	3095	3095	3000	New Orleans Public Culture		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.083622	2025-11-20 22:14:59.083628
287	ANTH 3201	ANTH	3201	3201	3000	Field Methods Archeology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.087984	2025-11-20 22:14:59.08799
288	ANTH 3215	ANTH	3215	3215	3000	North American Archeology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.092367	2025-11-20 22:14:59.092374
289	ANTH 3220	ANTH	3220	3220	3000	Archaeology of New Orleans		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.096442	2025-11-20 22:14:59.096448
290	ANTH 3240	ANTH	3240	3240	3000	Archaeology of the African Diaspora		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.100484	2025-11-20 22:14:59.100489
291	ANTH 3295	ANTH	3295	3295	3000	Lab Techniques Field Arch		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.10451	2025-11-20 22:14:59.104516
292	ANTH 3301	ANTH	3301	3301	3000	Doing Ethnography		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.10847	2025-11-20 22:14:59.108475
293	ANTH 3315	ANTH	3315	3315	3000	Caribbean Peoples & Cultures		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.112844	2025-11-20 22:14:59.112849
294	ANTH 3320	ANTH	3320	3320	3000	Amazonia:People,Culture,Nature		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.116817	2025-11-20 22:14:59.116824
295	ANTH 3330	ANTH	3330	3330	3000	Latin America		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.12078	2025-11-20 22:14:59.120786
296	ANTH 3340	ANTH	3340	3340	3000	People & Culture Europe		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.124638	2025-11-20 22:14:59.124644
297	ANTH 3351	ANTH	3351	3351	3000	People & Culture Africa		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.12861	2025-11-20 22:14:59.128615
298	ANTH 3370	ANTH	3370	3370	3000	People & Culture Pacific		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.132635	2025-11-20 22:14:59.132641
299	ANTH 3401	ANTH	3401	3401	3000	Folklore		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.136669	2025-11-20 22:14:59.136674
300	ANTH 3402	ANTH	3402	3402	3000	Storytelling and Culture		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.140698	2025-11-20 22:14:59.140703
301	ANTH 3750	ANTH	3750	3750	3000	Food and Culture		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.144695	2025-11-20 22:14:59.144701
302	ANTH 3896	ANTH	3896	3896	3000	Senior Honors Thesis		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	research	2025-11-20 22:14:59.148759	2025-11-20 22:14:59.148765
303	ANTH 4070	ANTH	4070	4070	4000	Qualitative Research		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	research	2025-11-20 22:14:59.152542	2025-11-20 22:14:59.152548
304	ANTH 4075	ANTH	4075	4075	4000	Life History, Identity & Autonomy		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.156764	2025-11-20 22:14:59.15677
305	ANTH 4090	ANTH	4090	4090	4000	Advanced Topics in Cultural Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.16135	2025-11-20 22:14:59.161357
306	ANTH 4330	ANTH	4330	4330	4000	Gender & Power in Latin America		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.165642	2025-11-20 22:14:59.165648
307	ANTH 4440	ANTH	4440	4440	4000	Religion Magic and Witchcraft		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.169746	2025-11-20 22:14:59.169752
308	ANTH 4666	ANTH	4666	4666	4000	Shamanism, Curing and Healing		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.173501	2025-11-20 22:14:59.173506
309	ANTH 4721	ANTH	4721	4721	4000	Cultural Resources Management: Theory & Practice		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.177255	2025-11-20 22:14:59.17726
310	ANTH 4765	ANTH	4765	4765	4000	Ethnicity in Contemporary Society		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.181229	2025-11-20 22:14:59.181234
311	ANTH 4766	ANTH	4766	4766	4000	Sex and Gender		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.18527	2025-11-20 22:14:59.185276
312	ANTH 4768	ANTH	4768	4768	4000	Anthropology and Policy		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.189499	2025-11-20 22:14:59.189504
313	ANTH 4772	ANTH	4772	4772	4000	Applied Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.193522	2025-11-20 22:14:59.193527
314	ANTH 4775	ANTH	4775	4775	4000	Urban Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.197487	2025-11-20 22:14:59.197493
315	ANTH 4780	ANTH	4780	4780	4000	Film and Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.201519	2025-11-20 22:14:59.201525
316	ANTH 4790	ANTH	4790	4790	4000	Internship in Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	research	2025-11-20 22:14:59.20563	2025-11-20 22:14:59.205635
317	ANTH 4801	ANTH	4801	4801	4000	History of Anthropological Theory		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.209716	2025-11-20 22:14:59.209722
318	ANTH 4825	ANTH	4825	4825	4000	Contemporary Archaeological Theory		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.213823	2025-11-20 22:14:59.213829
319	ANTH 4888	ANTH	4888	4888	4000	Anthropology of the Body		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.217912	2025-11-20 22:14:59.217918
320	ANTH 4990	ANTH	4990	4990	4000	Independent Study		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	research	2025-11-20 22:14:59.221896	2025-11-20 22:14:59.221902
321	ANTH 4991	ANTH	4991	4991	4000	Advanced Field Research in Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	research	2025-11-20 22:14:59.225803	2025-11-20 22:14:59.225809
322	ANTH 4995	ANTH	4995	4995	4000	Anthropology of Contemporary Issues		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.229938	2025-11-20 22:14:59.229944
323	ANTH 5070	ANTH	5070	5070	5000	Qualitative Research		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	research	2025-11-20 22:14:59.234229	2025-11-20 22:14:59.234235
324	ANTH 5075	ANTH	5075	5075	5000	Life History, Identity & Autonomy		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.238267	2025-11-20 22:14:59.238274
325	ANTH 5090	ANTH	5090	5090	5000	Advanced Topics in Cultural Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.242336	2025-11-20 22:14:59.242342
326	ANTH 5330	ANTH	5330	5330	5000	Gender & Power in Latin America		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.246456	2025-11-20 22:14:59.246462
327	ANTH 5440	ANTH	5440	5440	5000	Religion Magic and Witchcraft		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.250448	2025-11-20 22:14:59.250453
328	ANTH 5666	ANTH	5666	5666	5000	Shamanism, Curing and Healing		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.254376	2025-11-20 22:14:59.254381
329	ANTH 5721	ANTH	5721	5721	5000	Cultural Resources Management: Theory & Practice		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.258347	2025-11-20 22:14:59.258353
330	ANTH 5723	ANTH	5723	5723	5000	Historic Site Archaeology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.262331	2025-11-20 22:14:59.262337
331	ANTH 5765	ANTH	5765	5765	5000	Ethnicity in Contemp Society		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.266301	2025-11-20 22:14:59.266306
332	ANTH 5766	ANTH	5766	5766	5000	Sex and Gender		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.270249	2025-11-20 22:14:59.270254
333	ANTH 5767	ANTH	5767	5767	5000	Race & Racism		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.273868	2025-11-20 22:14:59.273874
334	ANTH 5768	ANTH	5768	5768	5000	Anthropology and Policy		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.277971	2025-11-20 22:14:59.277976
335	ANTH 5772	ANTH	5772	5772	5000	Applied Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.281828	2025-11-20 22:14:59.281833
336	ANTH 5775	ANTH	5775	5775	5000	Urban Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.285819	2025-11-20 22:14:59.285825
337	ANTH 5777	ANTH	5777	5777	5000	Transnational Processes		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.289819	2025-11-20 22:14:59.289825
338	ANTH 5780	ANTH	5780	5780	5000	Film and Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.293726	2025-11-20 22:14:59.293731
339	ANTH 5790	ANTH	5790	5790	5000	Internship in Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	research	2025-11-20 22:14:59.29769	2025-11-20 22:14:59.297695
340	ANTH 5801	ANTH	5801	5801	5000	Hist of Anthropological Theory		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.301684	2025-11-20 22:14:59.301692
341	ANTH 5825	ANTH	5825	5825	5000	Contemp Archaeological Theory		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.305776	2025-11-20 22:14:59.305782
342	ANTH 5888	ANTH	5888	5888	5000	Anthropology of the Body		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.309847	2025-11-20 22:14:59.309853
343	ANTH 5990	ANTH	5990	5990	5000	Independent Study		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	research	2025-11-20 22:14:59.313794	2025-11-20 22:14:59.313799
344	ANTH 5991	ANTH	5991	5991	5000	Advanced Field Research in Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	research	2025-11-20 22:14:59.317663	2025-11-20 22:14:59.317668
345	ANTH 5995	ANTH	5995	5995	5000	Anthro of Contemporary Issues		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.321677	2025-11-20 22:14:59.321682
346	ANTH 6052	ANTH	6052	6052	6000	Adv Cultural Anthropology		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.325715	2025-11-20 22:14:59.32572
347	ANTH 6091	ANTH	6091	6091	6000	Adv Res Problems in Urbn Anth		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.329716	2025-11-20 22:14:59.329722
348	ANTH 6201	ANTH	6201	6201	6000	Analysis Tech Writing CRM		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.333775	2025-11-20 22:14:59.333781
349	ANTH 6301	ANTH	6301	6301	6000	Material Culture		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.337539	2025-11-20 22:14:59.337545
350	ANTH 6801	ANTH	6801	6801	6000	Cultr & Soc Theory		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:14:59.341752	2025-11-20 22:14:59.341758
351	ARTS 1000	ARTS	1000	1000	1000	Intro to the Arts		3	University Of New Orleans	School of Arts		f	lecture	2025-11-20 22:14:59.345892	2025-11-20 22:14:59.345899
352	AANDS 1119	AANDS	1119	1119	1000	Structures of Western Thought		3	University Of New Orleans	University of NO		f	lecture	2025-11-20 22:14:59.349658	2025-11-20 22:14:59.349663
353	AANDS 1120	AANDS	1120	1120	1000	Northnestern Thought		3	University Of New Orleans	University of NO		f	lecture	2025-11-20 22:14:59.353345	2025-11-20 22:14:59.353351
354	AANDS 1160	AANDS	1160	1160	1000	Scientific Writing		3	University Of New Orleans	University of NO		f	lecture	2025-11-20 22:14:59.357009	2025-11-20 22:14:59.357015
355	AANDS 1161	AANDS	1161	1161	1000	Business Writing		3	University Of New Orleans	University of NO		f	lecture	2025-11-20 22:14:59.361036	2025-11-20 22:14:59.361041
356	AANDS 2900	AANDS	2900	2900	2000	Euro Civil Field based Learning		3	University Of New Orleans	University of NO		f	lecture	2025-11-20 22:14:59.365124	2025-11-20 22:14:59.365148
357	AANDS 2999	AANDS	2999	2999	2000	Forms of Inquiry		3	University Of New Orleans	University of NO		f	lecture	2025-11-20 22:14:59.3694	2025-11-20 22:14:59.369406
358	AANDS 3099	AANDS	3099	3099	3000	Honors Colloquium		3	University Of New Orleans	University of NO		f	seminar	2025-11-20 22:14:59.373751	2025-11-20 22:14:59.373757
359	AANDS 3999	AANDS	3999	3999	3000	Senior Honors Thesis		3	University Of New Orleans	University of NO		f	research	2025-11-20 22:14:59.377719	2025-11-20 22:14:59.377725
360	AANDS 4000	AANDS	4000	4000	4000	Honors Thesis Workshop		3	University Of New Orleans	University of NO		f	research	2025-11-20 22:14:59.381468	2025-11-20 22:14:59.381474
361	AADM 3300	AADM	3300	3300	3000	Basic Overview of Theatre for		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.385044	2025-11-20 22:14:59.385049
362	AADM 3301	AADM	3301	3301	3000	Basic Overview of Visual Arts		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.388683	2025-11-20 22:14:59.388689
363	AADM 3302	AADM	3302	3302	3000	Basic Overview of Music for Ar		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.392359	2025-11-20 22:14:59.392364
364	AADM 4300	AADM	4300	4300	4000	Basic Concepts of Development		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.39652	2025-11-20 22:14:59.396526
365	AADM 4302	AADM	4302	4302	4000	Basics of Arts Marketing		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.400746	2025-11-20 22:14:59.400752
366	AADM 4303	AADM	4303	4303	4000	Technology for Arts Administra		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.404863	2025-11-20 22:14:59.404869
367	AADM 4304	AADM	4304	4304	4000	Economic Context of the Arts		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.408943	2025-11-20 22:14:59.408949
368	AADM 4305	AADM	4305	4305	4000	Arts and the Law		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.413112	2025-11-20 22:14:59.413118
369	AADM 4310	AADM	4310	4310	4000	Cultural and Arts Institutions		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.417231	2025-11-20 22:14:59.417236
370	AADM 6090	AADM	6090	6090	6000	Arts Adm Ind Study		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.421329	2025-11-20 22:14:59.421335
371	AADM 6200	AADM	6200	6200	6000	Arts Organizations & Business		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.425254	2025-11-20 22:14:59.42526
372	AADM 6223	AADM	6223	6223	6000	Nonprofit Finance		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.429315	2025-11-20 22:14:59.429321
373	AADM 6246	AADM	6246	6246	6000	Arts Tech Overview		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.433323	2025-11-20 22:14:59.433328
374	AADM 6501	AADM	6501	6501	6000	Development for Arts Orgs		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.437316	2025-11-20 22:14:59.437321
375	AADM 6502	AADM	6502	6502	6000	Arts Admn Legal & Bus Appl		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.441319	2025-11-20 22:14:59.441325
376	AADM 6503	AADM	6503	6503	6000	Marketing the Arts		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.445214	2025-11-20 22:14:59.445219
377	AADM 6506	AADM	6506	6506	6000	Musical Overview Arts Administ		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.449203	2025-11-20 22:14:59.449209
378	AADM 6507	AADM	6507	6507	6000	Research in the Arts		3	University Of New Orleans	School of the Arts		f	research	2025-11-20 22:14:59.453265	2025-11-20 22:14:59.45327
379	AADM 6508	AADM	6508	6508	6000	Arts Leadership		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.457167	2025-11-20 22:14:59.457172
380	AADM 6509	AADM	6509	6509	6000	Arts Educ for Admin		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.461026	2025-11-20 22:14:59.461031
381	AADM 6601	AADM	6601	6601	6000	Writing & Pres for Art Adm		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.465082	2025-11-20 22:14:59.465088
382	AADM 6605	AADM	6605	6605	6000	Seminar in Arts Administration		3	University Of New Orleans	School of the Arts		f	seminar	2025-11-20 22:14:59.469237	2025-11-20 22:14:59.469242
383	AADM 6607	AADM	6607	6607	6000	Public Arts Policy		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.473282	2025-11-20 22:14:59.473288
384	AADM 6609	AADM	6609	6609	6000	Arts and Community		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.47734	2025-11-20 22:14:59.477346
385	AADM 6610	AADM	6610	6610	6000	Public Relations in the Arts		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.48222	2025-11-20 22:14:59.48223
386	AADM 6611	AADM	6611	6611	6000	Branding in the Arts		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.487884	2025-11-20 22:14:59.487893
387	AADM 6620	AADM	6620	6620	6000	Fundraising Event Planning		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.493747	2025-11-20 22:14:59.493757
388	AADM 6621	AADM	6621	6621	6000	Grant Writing		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.499051	2025-11-20 22:14:59.499059
389	AADM 6690	AADM	6690	6690	6000	AADM Special Topics		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.504104	2025-11-20 22:14:59.504113
390	AADM 6900	AADM	6900	6900	6000	Practicum in Arts Admin		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.508652	2025-11-20 22:14:59.508659
391	AADM 6990	AADM	6990	6990	6000	Internship Arts Administration		3	University Of New Orleans	School of the Arts		f	research	2025-11-20 22:14:59.513289	2025-11-20 22:14:59.513296
392	AADM 7000	AADM	7000	7000	7000	Thesis Research		3	University Of New Orleans	School of the Arts		f	research	2025-11-20 22:14:59.517995	2025-11-20 22:14:59.518002
393	AADM 7040	AADM	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	School of the Arts		f	lecture	2025-11-20 22:14:59.522546	2025-11-20 22:14:59.522553
394	AVIA 1010	AVIA	1010	1010	1000	Introduction to Aviation		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:14:59.527111	2025-11-20 22:14:59.527117
395	AVIA 1020	AVIA	1020	1020	1000	Aviation Weather		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:14:59.531375	2025-11-20 22:14:59.531382
396	AVIA 1110	AVIA	1110	1110	1000	Private Pilot Ground		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:14:59.535749	2025-11-20 22:14:59.535755
397	AVIA 1120	AVIA	1120	1120	1000	Private Pilot Flight		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:14:59.539756	2025-11-20 22:14:59.539762
398	AVIA 2110	AVIA	2110	2110	2000	Instrument Pilot Ground		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:14:59.543817	2025-11-20 22:14:59.543823
399	AVIA 2120	AVIA	2120	2120	2000	Instrument Pilot Flight		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:14:59.547821	2025-11-20 22:14:59.547827
400	BIOS 1001	BIOS	1001	1001	1000	Freshman Bio Seminar		3	University Of New Orleans	College of Sciences		f	seminar	2025-11-20 22:14:59.551899	2025-11-20 22:14:59.551906
401	BIOS 1002	BIOS	1002	1002	1000	Biology Freshman Learning Comm		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.555949	2025-11-20 22:14:59.555955
402	BIOS 1053	BIOS	1053	1053	1000	Human Biol Nnci		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.559819	2025-11-20 22:14:59.559825
403	BIOS 1063	BIOS	1063	1063	1000	Biodiversity Nnci		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.563796	2025-11-20 22:14:59.563801
404	BIOS 1071	BIOS	1071	1071	1000	Biology II Laboratory		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.567808	2025-11-20 22:14:59.567814
405	BIOS 1073	BIOS	1073	1073	1000	Biology II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.571833	2025-11-20 22:14:59.571838
406	BIOS 1081	BIOS	1081	1081	1000	Biology I Laboratory		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.575807	2025-11-20 22:14:59.575812
407	BIOS 1083	BIOS	1083	1083	1000	Biology I		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.579794	2025-11-20 22:14:59.5798
408	BIOS 1301	BIOS	1301	1301	1000	Human Anatomy & Phys Lab		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.583829	2025-11-20 22:14:59.583835
409	BIOS 1303	BIOS	1303	1303	1000	Human Anatomy & Phys		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.588518	2025-11-20 22:14:59.588523
410	BIOS 1311	BIOS	1311	1311	1000	Human Anatomy & Phys Lab		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.592472	2025-11-20 22:14:59.592477
411	BIOS 1313	BIOS	1313	1313	1000	Human Anatomy & Phys II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.596489	2025-11-20 22:14:59.596494
412	BIOS 2002	BIOS	2002	2002	2000	Internship in Biology		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:14:59.600483	2025-11-20 22:14:59.600489
413	BIOS 2014	BIOS	2014	2014	2000	Population Genetics Evol Ecol		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.60445	2025-11-20 22:14:59.604456
414	BIOS 2082	BIOS	2082	2082	2000	UGRAD Teaching Apprenticeship		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.6084	2025-11-20 22:14:59.608405
415	BIOS 2090	BIOS	2090	2090	2000	Soph Special Topics Bio		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.612452	2025-11-20 22:14:59.612457
416	BIOS 2092	BIOS	2092	2092	2000	Sophomore Research		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:14:59.61648	2025-11-20 22:14:59.616486
417	BIOS 2114	BIOS	2114	2114	2000	Cell & Molecular Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.620632	2025-11-20 22:14:59.620638
418	BIOS 2313	BIOS	2313	2313	2000	Nutrition		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.624649	2025-11-20 22:14:59.624654
419	BIOS 2553	BIOS	2553	2553	2000	Evolution		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.628498	2025-11-20 22:14:59.628504
420	BIOS 2663	BIOS	2663	2663	2000	Environmental Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.632441	2025-11-20 22:14:59.632446
421	BIOS 2741	BIOS	2741	2741	2000	Micro & Human Dis Lab		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.636509	2025-11-20 22:14:59.636515
422	BIOS 2743	BIOS	2743	2743	2000	Micro Human Disease Lec		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.6406	2025-11-20 22:14:59.640605
423	BIOS 2904	BIOS	2904	2904	2000	Introduction Marine Zoology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.644581	2025-11-20 22:14:59.644587
424	BIOS 2914	BIOS	2914	2914	2000	Introduction Marine Science		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.648631	2025-11-20 22:14:59.648637
425	BIOS 3091	BIOS	3091	3091	3000	Undergraduate Seminar		3	University Of New Orleans	College of Sciences		f	seminar	2025-11-20 22:14:59.652766	2025-11-20 22:14:59.652772
426	BIOS 3092	BIOS	3092	3092	3000	Independent Research		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:14:59.656843	2025-11-20 22:14:59.656849
427	BIOS 3113	BIOS	3113	3113	3000	Immunology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.660996	2025-11-20 22:14:59.661002
428	BIOS 3284	BIOS	3284	3284	3000	Histology & Cytology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.665045	2025-11-20 22:14:59.665051
429	BIOS 3354	BIOS	3354	3354	3000	Vertebrate Physiology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.669088	2025-11-20 22:14:59.669093
430	BIOS 3373	BIOS	3373	3373	3000	Neurobiology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.673269	2025-11-20 22:14:59.673275
431	BIOS 3453	BIOS	3453	3453	3000	Genetics		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.677225	2025-11-20 22:14:59.67723
432	BIOS 3490	BIOS	3490	3490	3000	Spec Topics Phys & Cell Bio		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.681096	2025-11-20 22:14:59.681102
433	BIOS 3590	BIOS	3590	3590	3000	Spec Topics Organismic Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.685046	2025-11-20 22:14:59.685052
434	BIOS 3651	BIOS	3651	3651	3000	General Ecology Laboratory		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.689055	2025-11-20 22:14:59.689061
435	BIOS 3653	BIOS	3653	3653	3000	General Ecology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.693042	2025-11-20 22:14:59.693047
436	BIOS 3854	BIOS	3854	3854	3000	General Botany		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.696943	2025-11-20 22:14:59.696948
437	BIOS 3924	BIOS	3924	3924	3000	Marine Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.70079	2025-11-20 22:14:59.700796
438	BIOS 3953	BIOS	3953	3953	3000	General Parasitology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.70463	2025-11-20 22:14:59.704635
439	BIOS 4010	BIOS	4010	4010	4000	Senior Comprehensive Exam		0	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.708501	2025-11-20 22:14:59.708506
440	BIOS 4091	BIOS	4091	4091	4000	Senior Honors Thesis		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:14:59.712583	2025-11-20 22:14:59.71259
441	BIOS 4103	BIOS	4103	4103	4000	Biochemistry I		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.716507	2025-11-20 22:14:59.716512
442	BIOS 4113	BIOS	4113	4113	4000	Biochemistry II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.72043	2025-11-20 22:14:59.720435
443	BIOS 4114	BIOS	4114	4114	4000	Biochemistry and Molecular Biology Laboratory		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.724429	2025-11-20 22:14:59.724435
444	BIOS 4153	BIOS	4153	4153	4000	Molecular Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.728515	2025-11-20 22:14:59.728521
445	BIOS 4173	BIOS	4173	4173	4000	Molecular Biotechnology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.732345	2025-11-20 22:14:59.73235
446	BIOS 4213	BIOS	4213	4213	4000	Cell Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.736012	2025-11-20 22:14:59.736018
447	BIOS 4314	BIOS	4314	4314	4000	Comparative Vertebrate Anatomy		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.739633	2025-11-20 22:14:59.739638
448	BIOS 4353	BIOS	4353	4353	4000	Comparative Animal Physiology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.743389	2025-11-20 22:14:59.743394
449	BIOS 4413	BIOS	4413	4413	4000	Developmental Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.747249	2025-11-20 22:14:59.747254
450	BIOS 4453	BIOS	4453	4453	4000	Human Genomics		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.751656	2025-11-20 22:14:59.751661
451	BIOS 4454	BIOS	4454	4454	4000	Genomics & Bioinformatics		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.755672	2025-11-20 22:14:59.755678
452	BIOS 4490	BIOS	4490	4490	4000	Spec Topics Phys & Cell Bio		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.759899	2025-11-20 22:14:59.759904
453	BIOS 4516	BIOS	4516	4516	4000	Environmental Writing		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.764005	2025-11-20 22:14:59.76401
454	BIOS 4524	BIOS	4524	4524	4000	Evolutionary Mechanisms		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.768323	2025-11-20 22:14:59.768328
455	BIOS 4534	BIOS	4534	4534	4000	Conservation Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.772651	2025-11-20 22:14:59.772657
456	BIOS 4543	BIOS	4543	4543	4000	Habitats Org Biodiv		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.776999	2025-11-20 22:14:59.777005
457	BIOS 4590	BIOS	4590	4590	4000	Spec Topics Organismic Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.781146	2025-11-20 22:14:59.781153
458	BIOS 4644	BIOS	4644	4644	4000	Animal Behavior		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.785502	2025-11-20 22:14:59.785509
459	BIOS 4713	BIOS	4713	4713	4000	Advanced Microbiology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.788714	2025-11-20 22:14:59.788721
460	BIOS 4723	BIOS	4723	4723	4000	Virology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.791721	2025-11-20 22:14:59.791726
461	BIOS 4844	BIOS	4844	4844	4000	Plant Taxonomy		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.794473	2025-11-20 22:14:59.794478
462	BIOS 4914	BIOS	4914	4914	4000	Biology of Fishes		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.79745	2025-11-20 22:14:59.797456
463	BIOS 4933	BIOS	4933	4933	4000	Marine Ecology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.800766	2025-11-20 22:14:59.800771
464	BIOS 4974	BIOS	4974	4974	4000	Entomology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.806114	2025-11-20 22:14:59.806119
465	BIOS 5103	BIOS	5103	5103	5000	Biochemistry I		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.809713	2025-11-20 22:14:59.809718
466	BIOS 5113	BIOS	5113	5113	5000	Biochemistry II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.813616	2025-11-20 22:14:59.813621
467	BIOS 5114	BIOS	5114	5114	5000	Biochemistry and Molecular Biology Laboratory		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.817637	2025-11-20 22:14:59.817642
468	BIOS 5153	BIOS	5153	5153	5000	Molecular Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.821581	2025-11-20 22:14:59.821588
469	BIOS 5173	BIOS	5173	5173	5000	Molecular Biotechnology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.825803	2025-11-20 22:14:59.825808
470	BIOS 5213	BIOS	5213	5213	5000	Cell Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.829965	2025-11-20 22:14:59.82997
471	BIOS 5314	BIOS	5314	5314	5000	Comparative Vertebrate Anatomy		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.833808	2025-11-20 22:14:59.833813
472	BIOS 5353	BIOS	5353	5353	5000	Comparative Animal Physiology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.837942	2025-11-20 22:14:59.837948
473	BIOS 5413	BIOS	5413	5413	5000	Developmental Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.842096	2025-11-20 22:14:59.842101
474	BIOS 5453	BIOS	5453	5453	5000	Human Genomics		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.846482	2025-11-20 22:14:59.846487
475	BIOS 5454	BIOS	5454	5454	5000	Genomics & Bioinformatics		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.85101	2025-11-20 22:14:59.851015
476	BIOS 5490	BIOS	5490	5490	5000	Spec Topics Phys & Cell Bio		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.855973	2025-11-20 22:14:59.855979
477	BIOS 5516	BIOS	5516	5516	5000	Environmental Writing		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.860474	2025-11-20 22:14:59.86048
478	BIOS 5524	BIOS	5524	5524	5000	Evolutionary Mechanisms		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.865165	2025-11-20 22:14:59.865172
479	BIOS 5534	BIOS	5534	5534	5000	Conservation Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.869858	2025-11-20 22:14:59.869864
480	BIOS 5543	BIOS	5543	5543	5000	Habitats Org Biodiv		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.874606	2025-11-20 22:14:59.874613
481	BIOS 5590	BIOS	5590	5590	5000	Spec Topics Organismic Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.879243	2025-11-20 22:14:59.879249
482	BIOS 5644	BIOS	5644	5644	5000	Animal Behavior		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.883962	2025-11-20 22:14:59.883969
483	BIOS 5713	BIOS	5713	5713	5000	Advanced Microbiology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.888685	2025-11-20 22:14:59.888692
484	BIOS 5723	BIOS	5723	5723	5000	Virology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.893519	2025-11-20 22:14:59.893526
485	BIOS 5844	BIOS	5844	5844	5000	Plant Taxonomy		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.898346	2025-11-20 22:14:59.898353
486	BIOS 5914	BIOS	5914	5914	5000	Biology of Fishes		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.903245	2025-11-20 22:14:59.903251
487	BIOS 5934	BIOS	5934	5934	5000	Marine Invertebrate Zoology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.908826	2025-11-20 22:14:59.908833
488	BIOS 5974	BIOS	5974	5974	5000	Entomology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.913958	2025-11-20 22:14:59.913964
489	BIOS 6002	BIOS	6002	6002	6000	Internship Health Professions		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:14:59.918962	2025-11-20 22:14:59.918968
490	BIOS 6003	BIOS	6003	6003	6000	M.S. Capstone Project in BIO		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.923869	2025-11-20 22:14:59.923875
491	BIOS 6013	BIOS	6013	6013	6000	Topics Biochemistry & Physio		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.928849	2025-11-20 22:14:59.928856
492	BIOS 6022	BIOS	6022	6022	6000	Scientific Communication		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.934006	2025-11-20 22:14:59.934013
493	BIOS 6023	BIOS	6023	6023	6000	Topics in Cell & Molec Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.939659	2025-11-20 22:14:59.939669
494	BIOS 6052	BIOS	6052	6052	6000	Systematics & Evol Seminar		3	University Of New Orleans	College of Sciences		f	seminar	2025-11-20 22:14:59.944603	2025-11-20 22:14:59.944609
495	BIOS 6053	BIOS	6053	6053	6000	Topics in Systematics & Evol		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.948654	2025-11-20 22:14:59.948661
496	BIOS 6062	BIOS	6062	6062	6000	Ecology & Evolution Seminar		3	University Of New Orleans	College of Sciences		f	seminar	2025-11-20 22:14:59.952637	2025-11-20 22:14:59.952644
497	BIOS 6063	BIOS	6063	6063	6000	Topics in Ecology & Envir Sci		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.956252	2025-11-20 22:14:59.956258
498	BIOS 6073	BIOS	6073	6073	6000	Spec Topics Organismal Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.959749	2025-11-20 22:14:59.959754
499	BIOS 6090	BIOS	6090	6090	6000	Biological Problems		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.963665	2025-11-20 22:14:59.96367
500	BIOS 6091	BIOS	6091	6091	6000	Graduate Seminar		3	University Of New Orleans	College of Sciences		f	seminar	2025-11-20 22:14:59.967888	2025-11-20 22:14:59.967893
501	BIOS 6093	BIOS	6093	6093	6000	Topics in Integrative Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.972105	2025-11-20 22:14:59.97211
502	BIOS 6096	BIOS	6096	6096	6000	Integrative Biology Seminar		3	University Of New Orleans	College of Sciences		f	seminar	2025-11-20 22:14:59.976423	2025-11-20 22:14:59.976429
503	BIOS 6113	BIOS	6113	6113	6000	Advanced Cell Biology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.980906	2025-11-20 22:14:59.980911
504	BIOS 6713	BIOS	6713	6713	6000	Medical Microbiology		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.985409	2025-11-20 22:14:59.985415
505	BIOS 7000	BIOS	7000	7000	7000	Thesis Research		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:14:59.990256	2025-11-20 22:14:59.990262
506	BIOS 7040	BIOS	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:14:59.994812	2025-11-20 22:14:59.994819
507	BIOS 7050	BIOS	7050	7050	7000	Dissertation Research		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:14:59.999662	2025-11-20 22:14:59.999668
508	BA 1000	BA	1000	1000	1000	Intro Business Administration		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.003931	2025-11-20 22:15:00.003938
509	BA 1001	BA	1001	1001	1000	Intro to Entrepreneurship		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.008243	2025-11-20 22:15:00.008249
510	BA 2780	BA	2780	2780	2000	App Software for Business		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.01266	2025-11-20 22:15:00.012666
511	BA 3010	BA	3010	3010	3000	Legal Environment of Business		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.017098	2025-11-20 22:15:00.017105
512	BA 3021	BA	3021	3021	3000	Business Law		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.021519	2025-11-20 22:15:00.021526
513	BA 3080	BA	3080	3080	3000	Corporate Social Responsblty		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.025904	2025-11-20 22:15:00.02591
562	CHEM 4311	CHEM	4311	4311	4000	Physical Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.227814	2025-11-20 22:15:00.22782
514	BA 3090	BA	3090	3090	3000	Internship in Entrepreneurship		3	University Of New Orleans	College of Business Administration		f	research	2025-11-20 22:15:00.030239	2025-11-20 22:15:00.030245
515	BA 3091	BA	3091	3091	3000	Indep Study Entrepreneurship		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.034745	2025-11-20 22:15:00.034751
516	BA 3200	BA	3200	3200	3000	Leadership and Entrepreneurship		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.038875	2025-11-20 22:15:00.038881
517	BA 4048	BA	4048	4048	4000	International Business Law		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.043157	2025-11-20 22:15:00.043162
518	BA 4056	BA	4056	4056	4000	Business Planning		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.04738	2025-11-20 22:15:00.047386
519	BA 5048	BA	5048	5048	5000	International Business Law		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.051556	2025-11-20 22:15:00.051583
520	BA 5056	BA	5056	5056	5000	Business Planning		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.055776	2025-11-20 22:15:00.055782
521	BA 6011	BA	6011	6011	6000	HRM in Health Care Settings		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.059985	2025-11-20 22:15:00.05999
522	BA 6097	BA	6097	6097	6000	Spec Topic Business Admin		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.064038	2025-11-20 22:15:00.064044
523	BA 6780	BA	6780	6780	6000	Survey Decision Making Tools		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.067455	2025-11-20 22:15:00.06746
524	BA 7040	BA	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	College of Business Administration		f	lecture	2025-11-20 22:15:00.071587	2025-11-20 22:15:00.071593
525	CHEM 1000	CHEM	1000	1000	1000	Freshman Seminar Chem Majors		3	University Of New Orleans	College of Sciences		f	seminar	2025-11-20 22:15:00.075733	2025-11-20 22:15:00.075739
526	CHEM 1001	CHEM	1001	1001	1000	Lights, Camera, ACTION		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.079812	2025-11-20 22:15:00.079818
527	CHEM 1002	CHEM	1002	1002	1000	Life, Universe and Everything		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.083912	2025-11-20 22:15:00.083918
528	CHEM 1003	CHEM	1003	1003	1000	Fundamentals of Environmental Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.087814	2025-11-20 22:15:00.08782
529	CHEM 1007	CHEM	1007	1007	1000	General Chemistry I Lab		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.091811	2025-11-20 22:15:00.091817
530	CHEM 1008	CHEM	1008	1008	1000	Gen Chem Lab II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.095794	2025-11-20 22:15:00.0958
531	CHEM 1012	CHEM	1012	1012	1000	Introductory Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.099725	2025-11-20 22:15:00.09973
532	CHEM 1017	CHEM	1017	1017	1000	General Chemistry I		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.103683	2025-11-20 22:15:00.103689
533	CHEM 1018	CHEM	1018	1018	1000	General Chemistry II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.107681	2025-11-20 22:15:00.107687
534	CHEM 1110	CHEM	1110	1110	1000	Intro Forensic Sci		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.111683	2025-11-20 22:15:00.111688
535	CHEM 2000	CHEM	2000	2000	2000	Soph Seminar Chem Majors		3	University Of New Orleans	College of Sciences		f	seminar	2025-11-20 22:15:00.115689	2025-11-20 22:15:00.115695
536	CHEM 2017	CHEM	2017	2017	2000	Organic Chem Lab 1		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.119704	2025-11-20 22:15:00.119709
537	CHEM 2025	CHEM	2025	2025	2000	Analytical Chemistry Laboratory		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.123632	2025-11-20 22:15:00.123637
538	CHEM 2117	CHEM	2117	2117	2000	Analytical Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.127737	2025-11-20 22:15:00.127743
539	CHEM 2217	CHEM	2217	2217	2000	Organic Chemistry I		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.131863	2025-11-20 22:15:00.131869
540	CHEM 2310	CHEM	2310	2310	2000	Chemical Computing		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.135896	2025-11-20 22:15:00.135901
541	CHEM 2710	CHEM	2710	2710	2000	Introduction to Cosmetic Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.1413	2025-11-20 22:15:00.141309
542	CHEM 3018	CHEM	3018	3018	3000	Org Chem Lab II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.146164	2025-11-20 22:15:00.146174
543	CHEM 3027	CHEM	3027	3027	3000	Advanced Synthesis Lab		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:15:00.150473	2025-11-20 22:15:00.150481
544	CHEM 3091	CHEM	3091	3091	3000	Chemistry Internship		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:15:00.15502	2025-11-20 22:15:00.155027
545	CHEM 3092	CHEM	3092	3092	3000	Undergrd Teach Appr		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.159451	2025-11-20 22:15:00.159457
546	CHEM 3094	CHEM	3094	3094	3000	Undergraduate Research		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:15:00.163808	2025-11-20 22:15:00.163814
547	CHEM 3096	CHEM	3096	3096	3000	Directed Study		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.168014	2025-11-20 22:15:00.16802
548	CHEM 3099	CHEM	3099	3099	3000	Senior Honors Thesis		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:15:00.171941	2025-11-20 22:15:00.171947
549	CHEM 3110	CHEM	3110	3110	3000	Forensic Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.176171	2025-11-20 22:15:00.176177
550	CHEM 3218	CHEM	3218	3218	3000	Organic Chemistry II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.180262	2025-11-20 22:15:00.180267
551	CHEM 3310	CHEM	3310	3310	3000	Principles of Phys Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.184319	2025-11-20 22:15:00.184324
552	CHEM 3411	CHEM	3411	3411	3000	Desc Inorganic Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.188267	2025-11-20 22:15:00.188273
553	CHEM 3510	CHEM	3510	3510	3000	Foundations of Biochemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.192165	2025-11-20 22:15:00.192171
554	CHEM 3610	CHEM	3610	3610	3000	Materials Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.196072	2025-11-20 22:15:00.196077
555	CHEM 3710	CHEM	3710	3710	3000	Medicinal Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.199891	2025-11-20 22:15:00.199896
556	CHEM 4000	CHEM	4000	4000	4000	Senior Comprehensive Exam		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.203674	2025-11-20 22:15:00.203679
557	CHEM 4028	CHEM	4028	4028	4000	Physical & Inorganic Chem Lab		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.207581	2025-11-20 22:15:00.207586
558	CHEM 4030	CHEM	4030	4030	4000	Lab Meth Instrumental Analysis		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.211443	2025-11-20 22:15:00.211448
559	CHEM 4110	CHEM	4110	4110	4000	Instrumental Analysis		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.215358	2025-11-20 22:15:00.215363
560	CHEM 4210	CHEM	4210	4210	4000	Intermediate Organic Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.219184	2025-11-20 22:15:00.219189
561	CHEM 4310	CHEM	4310	4310	4000	Physical Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.223169	2025-11-20 22:15:00.223174
563	CHEM 4410	CHEM	4410	4410	4000	Advanced Phys Inorg Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.231941	2025-11-20 22:15:00.231947
564	CHEM 4510	CHEM	4510	4510	4000	Biochemistry I		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.236124	2025-11-20 22:15:00.236147
565	CHEM 4511	CHEM	4511	4511	4000	Biochemistry II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.240319	2025-11-20 22:15:00.240325
566	CHEM 4810	CHEM	4810	4810	4000	Environmental Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.244623	2025-11-20 22:15:00.244629
567	CHEM 5028	CHEM	5028	5028	5000	Physical & Inorganic Chem Lab		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.248896	2025-11-20 22:15:00.248901
568	CHEM 5030	CHEM	5030	5030	5000	Lab Meth Instrumental Analysis		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.252958	2025-11-20 22:15:00.252964
569	CHEM 5110	CHEM	5110	5110	5000	Instrumental Analysis		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.257126	2025-11-20 22:15:00.257151
570	CHEM 5210	CHEM	5210	5210	5000	Intermediate Organic Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.261048	2025-11-20 22:15:00.261054
571	CHEM 5310	CHEM	5310	5310	5000	Physical Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.265349	2025-11-20 22:15:00.265355
572	CHEM 5311	CHEM	5311	5311	5000	Physical Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.269312	2025-11-20 22:15:00.269318
573	CHEM 5410	CHEM	5410	5410	5000	Advanced Phys Inorg Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.273042	2025-11-20 22:15:00.273047
574	CHEM 5510	CHEM	5510	5510	5000	Biochemistry I		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.276958	2025-11-20 22:15:00.276964
575	CHEM 5511	CHEM	5511	5511	5000	Biochemistry II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.280997	2025-11-20 22:15:00.281003
576	CHEM 5810	CHEM	5810	5810	5000	Environmental Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.284847	2025-11-20 22:15:00.284852
577	CHEM 6007	CHEM	6007	6007	6000	Experimental Chem Teachers III		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.288848	2025-11-20 22:15:00.288853
578	CHEM 6090	CHEM	6090	6090	6000	Spec Readings Adv Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.29276	2025-11-20 22:15:00.292765
579	CHEM 6091	CHEM	6091	6091	6000	Spec Readings Adv Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.296621	2025-11-20 22:15:00.296626
580	CHEM 6092	CHEM	6092	6092	6000	Spec Readings Adv Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.30053	2025-11-20 22:15:00.300535
581	CHEM 6093	CHEM	6093	6093	6000	Spec Readings Adv Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.304512	2025-11-20 22:15:00.304518
582	CHEM 6095	CHEM	6095	6095	6000	Seminar		3	University Of New Orleans	College of Sciences		f	seminar	2025-11-20 22:15:00.308514	2025-11-20 22:15:00.30852
583	CHEM 6096	CHEM	6096	6096	6000	Dir Studies Adv Chem		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.312379	2025-11-20 22:15:00.312384
584	CHEM 6113	CHEM	6113	6113	6000	Physical Methods in Analytical Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.31626	2025-11-20 22:15:00.316265
585	CHEM 6115	CHEM	6115	6115	6000	Spec Top Analytical Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.320201	2025-11-20 22:15:00.320206
586	CHEM 6117	CHEM	6117	6117	6000	Advanced Mass Spectrometry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.324027	2025-11-20 22:15:00.324033
587	CHEM 6211	CHEM	6211	6211	6000	Synthetic Organic Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.328061	2025-11-20 22:15:00.328067
588	CHEM 6214	CHEM	6214	6214	6000	Advances in Organic Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.331991	2025-11-20 22:15:00.331996
589	CHEM 6316	CHEM	6316	6316	6000	Special Topics Physical Chem		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.335934	2025-11-20 22:15:00.335939
590	CHEM 6496	CHEM	6496	6496	6000	Spec Topics Adv Inorg Chem		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.339748	2025-11-20 22:15:00.339753
591	CHEM 6610	CHEM	6610	6610	6000	Characterization of Materials		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.343667	2025-11-20 22:15:00.343672
592	CHEM 6620	CHEM	6620	6620	6000	Intro Micro Mat Char		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.347594	2025-11-20 22:15:00.347599
593	CHEM 6621	CHEM	6621	6621	6000	Advan Micro Mat Char		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.351549	2025-11-20 22:15:00.351554
594	CHEM 6696	CHEM	6696	6696	6000	Special Topics Materials Chem		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.355588	2025-11-20 22:15:00.355593
595	CHEM 6710	CHEM	6710	6710	6000	Medicinal Chemistry		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.359583	2025-11-20 22:15:00.359588
596	CHEM 7000	CHEM	7000	7000	7000	Thesis Research		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:15:00.363465	2025-11-20 22:15:00.36347
597	CHEM 7025	CHEM	7025	7025	7000	Proc & Prob in Chemical Res		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.36732	2025-11-20 22:15:00.367325
598	CHEM 7040	CHEM	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.371593	2025-11-20 22:15:00.3716
599	CHEM 7050	CHEM	7050	7050	7000	Dissertation Research		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:15:00.375802	2025-11-20 22:15:00.375808
600	CHIN 1001	CHIN	1001	1001	1000	Basic Chinese I		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:15:00.379745	2025-11-20 22:15:00.379751
601	CHIN 1002	CHIN	1002	1002	1000	Basic Chinese II		3	University Of New Orleans	College of Liberal Arts, Education and Human Development		f	lecture	2025-11-20 22:15:00.383717	2025-11-20 22:15:00.383723
602	ENCE 2302	ENCE	2302	2302	2000	Civil Eng Comp & Gr Lecture		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.387505	2025-11-20 22:15:00.38751
603	ENCE 2303	ENCE	2303	2303	2000	Program Graphics Lab		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.391478	2025-11-20 22:15:00.391483
604	ENCE 2310	ENCE	2310	2310	2000	Elem Surveying Measurements		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.395526	2025-11-20 22:15:00.395531
605	ENCE 2311	ENCE	2311	2311	2000	Mechanics of Materials Lab		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.399592	2025-11-20 22:15:00.399598
606	ENCE 2350	ENCE	2350	2350	2000	Statics		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.403672	2025-11-20 22:15:00.403678
607	ENCE 2351	ENCE	2351	2351	2000	Mechanics of Materials		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.407704	2025-11-20 22:15:00.40771
608	ENCE 3093	ENCE	3093	3093	3000	Spec Prob in Civil Engineering		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.411795	2025-11-20 22:15:00.411801
609	ENCE 3318	ENCE	3318	3318	3000	Fluid Mechanics		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.415974	2025-11-20 22:15:00.415979
610	ENCE 3326	ENCE	3326	3326	3000	Environmental Engineering Lab		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.41997	2025-11-20 22:15:00.419976
611	ENCE 3327	ENCE	3327	3327	3000	Intro to Environmental Engr		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.423799	2025-11-20 22:15:00.423805
612	ENCE 3340	ENCE	3340	3340	3000	Geotechnical Engineering		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.427816	2025-11-20 22:15:00.427822
613	ENCE 3341	ENCE	3341	3341	3000	Soil Mechanics Laboratory		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.431855	2025-11-20 22:15:00.431861
614	ENCE 3356	ENCE	3356	3356	3000	Structural Analysis		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.435869	2025-11-20 22:15:00.435875
615	ENCE 3390	ENCE	3390	3390	3000	Basic Project Management		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.439868	2025-11-20 22:15:00.439874
616	ENCE 3391	ENCE	3391	3391	3000	Construction Pr Management		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.443876	2025-11-20 22:15:00.443881
617	ENCE 3900	ENCE	3900	3900	3000	Senior Honors Thesis		3	University Of New Orleans	College of Engineering		f	research	2025-11-20 22:15:00.447905	2025-11-20 22:15:00.44791
618	ENCE 4096	ENCE	4096	4096	4000	Independent Study in Civ Eng		3	University Of New Orleans	College of Engineering		f	research	2025-11-20 22:15:00.45191	2025-11-20 22:15:00.451916
619	ENCE 4097	ENCE	4097	4097	4000	Special Topics Civil Engr		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.455616	2025-11-20 22:15:00.455621
620	ENCE 4313	ENCE	4313	4313	4000	Remote Pilot & Drone App		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.459753	2025-11-20 22:15:00.459759
621	ENCE 4316	ENCE	4316	4316	4000	Sustainability Principles		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.463819	2025-11-20 22:15:00.463825
622	ENCE 4318	ENCE	4318	4318	4000	Hydraulic Engineering Systems		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.467881	2025-11-20 22:15:00.467887
623	ENCE 4319	ENCE	4319	4319	4000	Fluid Mech & Hyd Engr Lab		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.471895	2025-11-20 22:15:00.4719
624	ENCE 4321	ENCE	4321	4321	4000	Hydrology		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.476383	2025-11-20 22:15:00.476388
625	ENCE 4322	ENCE	4322	4322	4000	Water Supply & Sewer Systems		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.480434	2025-11-20 22:15:00.48044
626	ENCE 4323	ENCE	4323	4323	4000	Design Water/Wastewater Syst		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.484517	2025-11-20 22:15:00.484523
627	ENCE 4325	ENCE	4325	4325	4000	Waste Management		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.488812	2025-11-20 22:15:00.488818
628	ENCE 4328	ENCE	4328	4328	4000	Air Pollution Contrl		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.492978	2025-11-20 22:15:00.492984
629	ENCE 4330	ENCE	4330	4330	4000	Groundwater Engineering		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.49707	2025-11-20 22:15:00.497076
630	ENCE 4340	ENCE	4340	4340	4000	Foundation Engineering		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.501366	2025-11-20 22:15:00.501371
631	ENCE 4358	ENCE	4358	4358	4000	Structural Steel Design		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.505657	2025-11-20 22:15:00.505662
632	ENCE 4359	ENCE	4359	4359	4000	Structural Concrete Design		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.509957	2025-11-20 22:15:00.509963
633	ENCE 4363	ENCE	4363	4363	4000	Struc Des Wood Masn Alum Plast		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.514534	2025-11-20 22:15:00.51454
634	ENCE 4364	ENCE	4364	4364	4000	Steel Bridge Design & Construc		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.518903	2025-11-20 22:15:00.518908
635	ENCE 4386	ENCE	4386	4386	4000	Principles Transp & Hwy Engr		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.523017	2025-11-20 22:15:00.523022
636	ENCE 4390	ENCE	4390	4390	4000	Sr Civil Engr Design Project		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.527424	2025-11-20 22:15:00.52743
637	ENCE 4399	ENCE	4399	4399	4000	Civil Envir Engr Seminar		3	University Of New Orleans	College of Engineering		f	seminar	2025-11-20 22:15:00.531794	2025-11-20 22:15:00.5318
638	ENCE 4723	ENCE	4723	4723	4000	Ocean & Coastal Engineering		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.536204	2025-11-20 22:15:00.53621
639	ENCE 5096	ENCE	5096	5096	5000	Independent Study in Civ Eng		3	University Of New Orleans	College of Engineering		f	research	2025-11-20 22:15:00.54086	2025-11-20 22:15:00.540866
640	ENCE 5097	ENCE	5097	5097	5000	Special Topics Civil Engr		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.545047	2025-11-20 22:15:00.545053
641	ENCE 5313	ENCE	5313	5313	5000	Remote Pilot & Drone App		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.549507	2025-11-20 22:15:00.549513
642	ENCE 5318	ENCE	5318	5318	5000	Hydraulic Engineering Systems		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.553865	2025-11-20 22:15:00.553871
643	ENCE 5319	ENCE	5319	5319	5000	Fluid Mech & Hyd Engr Lab		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.558313	2025-11-20 22:15:00.558318
644	ENCE 5321	ENCE	5321	5321	5000	Hydrology		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.562669	2025-11-20 22:15:00.562675
645	ENCE 5322	ENCE	5322	5322	5000	Water Supply & Sewer Systems		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.566935	2025-11-20 22:15:00.566941
646	ENCE 5323	ENCE	5323	5323	5000	Design Water/Wastewater Syst		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.571107	2025-11-20 22:15:00.571112
647	ENCE 5325	ENCE	5325	5325	5000	Waste Management		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.575541	2025-11-20 22:15:00.575547
648	ENCE 5328	ENCE	5328	5328	5000	Air Pollution Contrl		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.579927	2025-11-20 22:15:00.579932
649	ENCE 5330	ENCE	5330	5330	5000	Groundwater Engineering		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.584503	2025-11-20 22:15:00.58451
650	ENCE 5340	ENCE	5340	5340	5000	Foundation Engineering		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.589034	2025-11-20 22:15:00.58904
651	ENCE 5358	ENCE	5358	5358	5000	Structural Steel Design		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.593637	2025-11-20 22:15:00.593644
652	ENCE 5359	ENCE	5359	5359	5000	Structural Concrete Design		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.598096	2025-11-20 22:15:00.598102
653	ENCE 5363	ENCE	5363	5363	5000	Struc Des Wood Masn Alum Plast		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.602685	2025-11-20 22:15:00.602691
654	ENCE 5364	ENCE	5364	5364	5000	Steel Bridge Design & Construc		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.607215	2025-11-20 22:15:00.607222
655	ENCE 5386	ENCE	5386	5386	5000	Principles Transp & Hwy Engr		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.611734	2025-11-20 22:15:00.611741
656	ENCE 5723	ENCE	5723	5723	5000	Ocean & Coastal Engineering		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.616125	2025-11-20 22:15:00.61615
657	ENCE 6095	ENCE	6095	6095	6000	Ind Special Project in Civ Eng		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.620249	2025-11-20 22:15:00.620255
658	ENCE 6096	ENCE	6096	6096	6000	Independent Study		3	University Of New Orleans	College of Engineering		f	research	2025-11-20 22:15:00.625035	2025-11-20 22:15:00.625041
659	ENCE 6097	ENCE	6097	6097	6000	Adv Spec Topics Civil Engr		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.629856	2025-11-20 22:15:00.629863
660	ENCE 6313	ENCE	6313	6313	6000	Water Chemistry Lecture		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.634789	2025-11-20 22:15:00.634796
661	ENCE 6314	ENCE	6314	6314	6000	Water Chemistry Lab		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.639644	2025-11-20 22:15:00.63965
662	ENCE 6322	ENCE	6322	6322	6000	Hydr & Environmental Modeling		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.644411	2025-11-20 22:15:00.644418
663	ENCE 6323	ENCE	6323	6323	6000	Sediment Transport		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.649053	2025-11-20 22:15:00.64906
664	ENCE 6325	ENCE	6325	6325	6000	Solid Waste Management		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.653683	2025-11-20 22:15:00.653689
665	ENCE 6329	ENCE	6329	6329	6000	Design Coastal Hydraulic		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.658212	2025-11-20 22:15:00.658218
666	ENCE 6332	ENCE	6332	6332	6000	Water Trmt Process & Design		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.662705	2025-11-20 22:15:00.662711
667	ENCE 6333	ENCE	6333	6333	6000	Wastewater Trmt Proc & Design		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.667253	2025-11-20 22:15:00.667259
668	ENCE 6334	ENCE	6334	6334	6000	Sediment Transport		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.671724	2025-11-20 22:15:00.67173
669	ENCE 6335	ENCE	6335	6335	6000	Pollution Prevention		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.676518	2025-11-20 22:15:00.676525
670	ENCE 6337	ENCE	6337	6337	6000	Air Pol Metrlgy Atmos Disp Mdl		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.681323	2025-11-20 22:15:00.681329
671	ENCE 6340	ENCE	6340	6340	6000	Mechanical Behavior of Soils		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.686193	2025-11-20 22:15:00.686199
672	ENCE 6342	ENCE	6342	6342	6000	Dewatering & Grndwater Control		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.690769	2025-11-20 22:15:00.690776
673	ENCE 6347	ENCE	6347	6347	6000	Ground Improvement		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.695641	2025-11-20 22:15:00.695648
674	ENCE 6349	ENCE	6349	6349	6000	Deep Foundations		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.700354	2025-11-20 22:15:00.700361
675	ENCE 6350	ENCE	6350	6350	6000	Matrix Meth Structural Engr		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.705206	2025-11-20 22:15:00.705212
676	ENCE 6353	ENCE	6353	6353	6000	Adv Mechanics of Materials		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.709866	2025-11-20 22:15:00.709873
677	ENCE 6355	ENCE	6355	6355	6000	Theory Plates & Shells		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.714546	2025-11-20 22:15:00.714553
678	ENCE 6357	ENCE	6357	6357	6000	Geosynthetics		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.71927	2025-11-20 22:15:00.719276
679	ENCE 6358	ENCE	6358	6358	6000	Adv Steel Design		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.723896	2025-11-20 22:15:00.723902
680	ENCE 6361	ENCE	6361	6361	6000	Prestressed Concrete Design		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.729025	2025-11-20 22:15:00.729033
681	ENCE 6382	ENCE	6382	6382	6000	Geotechnical Instrumentatiom		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.733971	2025-11-20 22:15:00.733978
682	ENCE 6383	ENCE	6383	6383	6000	Soil Shear Strength		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.738657	2025-11-20 22:15:00.738664
683	ENCE 6390	ENCE	6390	6390	6000	Project Management		3	University Of New Orleans	College of Engineering		f	lecture	2025-11-20 22:15:00.743416	2025-11-20 22:15:00.743423
684	CSCI 1000	CSCI	1000	1000	1000	Introduction to Computers		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.747826	2025-11-20 22:15:00.747832
685	CSCI 1205	CSCI	1205	1205	1000	Intro to Programming in C++		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.752285	2025-11-20 22:15:00.752291
686	CSCI 1220	CSCI	1220	1220	1000	Computational Data Analysis Python & R		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.756751	2025-11-20 22:15:00.756758
687	CSCI 1581	CSCI	1581	1581	1000	Software Design Lab I		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.760944	2025-11-20 22:15:00.760949
688	CSCI 1583	CSCI	1583	1583	1000	Software Design and Development I		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.765154	2025-11-20 22:15:00.765161
689	CSCI 1584	CSCI	1584	1584	1000	Software Design and Development I: Python		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.769167	2025-11-20 22:15:00.769173
690	CSCI 1585	CSCI	1585	1585	1000	Software Design and Development I Lab: Python		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.773446	2025-11-20 22:15:00.773452
691	CSCI 1621	CSCI	1621	1621	1000	Cybersecurity for All		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.777691	2025-11-20 22:15:00.777697
692	CSCI 2025	CSCI	2025	2025	2000	Data Structures & Applications		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.781842	2025-11-20 22:15:00.781848
693	CSCI 2120	CSCI	2120	2120	2000	Software Design and Development II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.785906	2025-11-20 22:15:00.785912
694	CSCI 2121	CSCI	2121	2121	2000	Software Design & Development Lab II		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.789855	2025-11-20 22:15:00.78986
695	CSCI 2125	CSCI	2125	2125	2000	Data Structures		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.793731	2025-11-20 22:15:00.793736
696	CSCI 2450	CSCI	2450	2450	2000	Machine Structure and Assembly Language Programming		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.797754	2025-11-20 22:15:00.79776
697	CSCI 2467	CSCI	2467	2467	2000	Systems Programming Concepts		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.801763	2025-11-20 22:15:00.801768
698	CSCI 3080	CSCI	3080	3080	3000	Ethics in Computing Profession		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.805773	2025-11-20 22:15:00.805778
699	CSCI 3090	CSCI	3090	3090	3000	Undergraduate Seminar		3	University Of New Orleans	College of Sciences		f	seminar	2025-11-20 22:15:00.809808	2025-11-20 22:15:00.809814
700	CSCI 3097	CSCI	3097	3097	3000	Problems in Computer Science		3	University Of New Orleans	College of Sciences		f	lecture	2025-11-20 22:15:00.813891	2025-11-20 22:15:00.813897
701	CSCI 3099	CSCI	3099	3099	3000	Senior Honors Thesis		3	University Of New Orleans	College of Sciences		f	research	2025-11-20 22:15:00.817757	2025-11-20 22:15:00.817763
702	CSCI 3102	CSCI	3102	3102	3000	Intro to Theory of Computation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.821926	2025-11-20 22:15:00.821932
703	CSCI 3150	CSCI	3150	3150	3000	File Structures & Network Prog		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.825997	2025-11-20 22:15:00.826004
704	CSCI 3220	CSCI	3220	3220	3000	Python for Data Science & Artificial Intelligence		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.829774	2025-11-20 22:15:00.829779
705	CSCI 3301	CSCI	3301	3301	3000	Computer Design & Organization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.833461	2025-11-20 22:15:00.833466
706	CSCI 4000	CSCI	4000	4000	4000	Comprehensive Exam		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.837619	2025-11-20 22:15:00.837624
707	CSCI 4101	CSCI	4101	4101	4000	Analysis of Algorithms		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.841974	2025-11-20 22:15:00.84198
708	CSCI 4125	CSCI	4125	4125	4000	Data Models and DBS Syst		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.845978	2025-11-20 22:15:00.845983
709	CSCI 4130	CSCI	4130	4130	4000	Intro Cryptography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.850118	2025-11-20 22:15:00.850125
710	CSCI 4208	CSCI	4208	4208	4000	Developing Advanced Web Applic		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.854604	2025-11-20 22:15:00.85461
711	CSCI 4210	CSCI	4210	4210	4000	Introduction to Software Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.858913	2025-11-20 22:15:00.858919
712	CSCI 4311	CSCI	4311	4311	4000	Computer Networks & Telecomm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.863419	2025-11-20 22:15:00.863425
713	CSCI 4401	CSCI	4401	4401	4000	Principles Operating Systems I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.86789	2025-11-20 22:15:00.867897
714	CSCI 4402	CSCI	4402	4402	4000	Principles Operating Systms II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.872058	2025-11-20 22:15:00.872064
715	CSCI 4452	CSCI	4452	4452	4000	Cloud Computing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.876175	2025-11-20 22:15:00.876181
716	CSCI 4460	CSCI	4460	4460	4000	Network Op & Defense		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.880382	2025-11-20 22:15:00.880387
717	CSCI 4501	CSCI	4501	4501	4000	Programming Language Structure		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.884535	2025-11-20 22:15:00.88454
718	CSCI 4525	CSCI	4525	4525	4000	Intro to Artificial Intelligen		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.888783	2025-11-20 22:15:00.888789
719	CSCI 4535	CSCI	4535	4535	4000	Natural Language Processing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.893017	2025-11-20 22:15:00.893022
720	CSCI 4567	CSCI	4567	4567	4000	Bioinformatics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.897072	2025-11-20 22:15:00.897078
721	CSCI 4568	CSCI	4568	4568	4000	Bioinformatics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.901492	2025-11-20 22:15:00.901498
722	CSCI 4587	CSCI	4587	4587	4000	Machine Learning I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.906363	2025-11-20 22:15:00.906369
723	CSCI 4588	CSCI	4588	4588	4000	Machine Learning II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.910744	2025-11-20 22:15:00.91075
724	CSCI 4595	CSCI	4595	4595	4000	Topics in Bioinformatics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.914992	2025-11-20 22:15:00.914997
725	CSCI 4621	CSCI	4621	4621	4000	Intro Cyber Security		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.919395	2025-11-20 22:15:00.919401
726	CSCI 4622	CSCI	4622	4622	4000	Reverse Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.923539	2025-11-20 22:15:00.923544
727	CSCI 4623	CSCI	4623	4623	4000	Digital Forensics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.928103	2025-11-20 22:15:00.928109
728	CSCI 4627	CSCI	4627	4627	4000	Industrial Control Systems (ICS) Cybersecurity		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.932637	2025-11-20 22:15:00.932643
729	CSCI 4631	CSCI	4631	4631	4000	Principles Computer Graphics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.93703	2025-11-20 22:15:00.937036
730	CSCI 4632	CSCI	4632	4632	4000	Principles of Image Processing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.941465	2025-11-20 22:15:00.941471
731	CSCI 4650	CSCI	4650	4650	4000	Competition Programming		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.945899	2025-11-20 22:15:00.945906
732	CSCI 4661	CSCI	4661	4661	4000	Mobile Apps Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.950285	2025-11-20 22:15:00.950291
733	CSCI 4670	CSCI	4670	4670	4000	Game Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.954221	2025-11-20 22:15:00.954228
734	CSCI 4675	CSCI	4675	4675	4000	Adv Game Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.958733	2025-11-20 22:15:00.958739
735	CSCI 4990	CSCI	4990	4990	4000	Special Topics CSCI		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.963017	2025-11-20 22:15:00.963023
736	CSCI 5101	CSCI	5101	5101	5000	Analysis of Algorithms		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.96738	2025-11-20 22:15:00.967386
737	CSCI 5125	CSCI	5125	5125	5000	Data Models and DBS Syst		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.9718	2025-11-20 22:15:00.971806
738	CSCI 5130	CSCI	5130	5130	5000	Intro Cryptography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.976069	2025-11-20 22:15:00.976075
739	CSCI 5208	CSCI	5208	5208	5000	Developing Advanced Web Applic		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.980505	2025-11-20 22:15:00.980511
740	CSCI 5210	CSCI	5210	5210	5000	Introduction to Software Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.985105	2025-11-20 22:15:00.985111
741	CSCI 5311	CSCI	5311	5311	5000	Computer Networks & Telecomm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.989757	2025-11-20 22:15:00.989763
742	CSCI 5401	CSCI	5401	5401	5000	Principles Operating Systems I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.994124	2025-11-20 22:15:00.994145
743	CSCI 5402	CSCI	5402	5402	5000	Principles Operating Systms II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:00.99861	2025-11-20 22:15:00.998615
744	CSCI 5452	CSCI	5452	5452	5000	Cloud Computing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.002946	2025-11-20 22:15:01.002952
745	CSCI 5460	CSCI	5460	5460	5000	Network Op & Defense		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.007233	2025-11-20 22:15:01.007239
746	CSCI 5501	CSCI	5501	5501	5000	Programming Language Structure		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.011989	2025-11-20 22:15:01.011995
747	CSCI 5525	CSCI	5525	5525	5000	Intro to Artificial Intelligen		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.016864	2025-11-20 22:15:01.01687
748	CSCI 5535	CSCI	5535	5535	5000	Natural Language Processing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.021651	2025-11-20 22:15:01.021657
749	CSCI 5567	CSCI	5567	5567	5000	Bioinformatics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.026184	2025-11-20 22:15:01.02619
750	CSCI 5568	CSCI	5568	5568	5000	Bioinformatics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.03077	2025-11-20 22:15:01.030776
751	CSCI 5587	CSCI	5587	5587	5000	Machine Learning I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.035229	2025-11-20 22:15:01.035236
752	CSCI 5588	CSCI	5588	5588	5000	Machine Learning II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.039969	2025-11-20 22:15:01.039975
753	CSCI 5595	CSCI	5595	5595	5000	Topics in Bioinformatics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.044585	2025-11-20 22:15:01.044592
754	CSCI 5621	CSCI	5621	5621	5000	Intro Cyber Security		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.049173	2025-11-20 22:15:01.04918
755	CSCI 5622	CSCI	5622	5622	5000	Reverse Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.053753	2025-11-20 22:15:01.053759
756	CSCI 5623	CSCI	5623	5623	5000	Digital Forensics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.058691	2025-11-20 22:15:01.058697
757	CSCI 5631	CSCI	5631	5631	5000	Principles Computer Graphics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.063402	2025-11-20 22:15:01.063409
758	CSCI 5632	CSCI	5632	5632	5000	Principles of Image Processing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.068083	2025-11-20 22:15:01.06809
759	CSCI 5661	CSCI	5661	5661	5000	Mobile Apps Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.072897	2025-11-20 22:15:01.072903
760	CSCI 5670	CSCI	5670	5670	5000	Game Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.077815	2025-11-20 22:15:01.077821
761	CSCI 5675	CSCI	5675	5675	5000	Adv Game Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.082437	2025-11-20 22:15:01.082444
762	CSCI 5990	CSCI	5990	5990	5000	Special Topics CSCI		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.087477	2025-11-20 22:15:01.087484
763	CSCI 6090	CSCI	6090	6090	6000	Advanced Problems in Comp Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.092471	2025-11-20 22:15:01.092478
764	CSCI 6101	CSCI	6101	6101	6000	Theory of Algrthm & Complexity		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.097472	2025-11-20 22:15:01.09748
765	CSCI 6110	CSCI	6110	6110	6000	Appl Combinatorics & Grph Thry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.102722	2025-11-20 22:15:01.102729
766	CSCI 6120	CSCI	6120	6120	6000	Theory of Computation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.107759	2025-11-20 22:15:01.107766
767	CSCI 6140	CSCI	6140	6140	6000	Formal Languages		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.113023	2025-11-20 22:15:01.113029
768	CSCI 6220	CSCI	6220	6220	6000	Software Testing & QA		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.117974	2025-11-20 22:15:01.117981
769	CSCI 6250	CSCI	6250	6250	6000	Big Data Analytics and Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.12268	2025-11-20 22:15:01.122687
770	CSCI 6350	CSCI	6350	6350	6000	Dev of Distributed Software		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.127421	2025-11-20 22:15:01.127428
771	CSCI 6363	CSCI	6363	6363	6000	Agile Software Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.132386	2025-11-20 22:15:01.132392
772	CSCI 6401	CSCI	6401	6401	6000	Concurrent Programming		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.137046	2025-11-20 22:15:01.137053
773	CSCI 6450	CSCI	6450	6450	6000	Principles Distributed Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.141819	2025-11-20 22:15:01.141825
774	CSCI 6452	CSCI	6452	6452	6000	Cloud Computing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.146802	2025-11-20 22:15:01.146809
775	CSCI 6454	CSCI	6454	6454	6000	Parallel & Sci Computing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.151948	2025-11-20 22:15:01.151954
776	CSCI 6521	CSCI	6521	6521	6000	Advanced Machine Learning I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.157161	2025-11-20 22:15:01.157171
777	CSCI 6522	CSCI	6522	6522	6000	Advanced Machine Learning II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.162435	2025-11-20 22:15:01.162444
778	CSCI 6587	CSCI	6587	6587	6000	Adv Mach Lrng Bioinformatics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.166658	2025-11-20 22:15:01.166665
779	CSCI 6588	CSCI	6588	6588	6000	Adv Mach Lrng Bioin II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.17171	2025-11-20 22:15:01.171717
780	CSCI 6595	CSCI	6595	6595	6000	Adv. Topics in Bioinformatics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.176394	2025-11-20 22:15:01.1764
781	CSCI 6603	CSCI	6603	6603	6000	Prog Lang Security		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.181311	2025-11-20 22:15:01.181317
782	CSCI 6621	CSCI	6621	6621	6000	Network Security		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.186064	2025-11-20 22:15:01.18607
783	CSCI 6625	CSCI	6625	6625	6000	Network Penetration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.190612	2025-11-20 22:15:01.190618
784	CSCI 6627	CSCI	6627	6627	6000	Industrial Control Systems Security		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.195374	2025-11-20 22:15:01.19538
785	CSCI 6633	CSCI	6633	6633	6000	Computer Vision		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.200341	2025-11-20 22:15:01.200348
786	CSCI 6634	CSCI	6634	6634	6000	Data Visualization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.205476	2025-11-20 22:15:01.205483
787	CSCI 6635	CSCI	6635	6635	6000	Pattern Recognition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.210411	2025-11-20 22:15:01.210417
788	CSCI 6640	CSCI	6640	6640	6000	Computational Geometry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.215503	2025-11-20 22:15:01.21551
789	CSCI 6645	CSCI	6645	6645	6000	Planning Algorithms in AI		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.220706	2025-11-20 22:15:01.220713
790	CSCI 6650	CSCI	6650	6650	6000	Intelligent Agents		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.225713	2025-11-20 22:15:01.22572
791	CSCI 6663	CSCI	6663	6663	6000	Software security		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.230828	2025-11-20 22:15:01.230835
792	CSCI 6990	CSCI	6990	6990	6000	Topics in Adv Comp Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.235975	2025-11-20 22:15:01.235981
793	CSCI 7000	CSCI	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.240948	2025-11-20 22:15:01.240955
794	CSCI 7040	CSCI	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.246227	2025-11-20 22:15:01.246235
795	CSCI 7050	CSCI	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.251489	2025-11-20 22:15:01.251496
796	COEN 1	COEN	1	1	1000	Coop Educ for Engr Majors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.256207	2025-11-20 22:15:01.256215
797	COBA 1	COBA	1	1	1000	Coop Educ for Bus Adm Majors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.260858	2025-11-20 22:15:01.260869
798	COLA 1	COLA	1	1	1000	Coop Educ for Lib Arts Majors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.265411	2025-11-20 22:15:01.265418
799	COSC 1	COSC	1	1	1000	Coop Educ for Science Majors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.269816	2025-11-20 22:15:01.269823
800	EDGC 6090	EDGC	6090	6090	6000	Independent Resrch Educ Found		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.27425	2025-11-20 22:15:01.274256
801	EDGC 6330	EDGC	6330	6330	6000	Career Counsln & Life Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.278454	2025-11-20 22:15:01.27846
802	EDGC 6400	EDGC	6400	6400	6000	Theories of Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.282553	2025-11-20 22:15:01.282581
803	EDGC 6420	EDGC	6420	6420	6000	Life Span Human Gro		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.286781	2025-11-20 22:15:01.286787
804	EDGC 6430	EDGC	6430	6430	6000	Counseling Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.290902	2025-11-20 22:15:01.290908
805	EDGC 6435	EDGC	6435	6435	6000	Substance Abuse Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.29502	2025-11-20 22:15:01.295026
806	EDGC 6439	EDGC	6439	6439	6000	Advanced Counseling Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.299461	2025-11-20 22:15:01.299467
807	EDGC 6440	EDGC	6440	6440	6000	Advanced Counseling Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.303697	2025-11-20 22:15:01.303702
808	EDGC 6445	EDGC	6445	6445	6000	Telemental Health Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.307838	2025-11-20 22:15:01.307844
809	EDGC 6450	EDGC	6450	6450	6000	Group Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.311926	2025-11-20 22:15:01.311932
810	EDGC 6452	EDGC	6452	6452	6000	Intro Multiculturl Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.315905	2025-11-20 22:15:01.315911
811	EDGC 6460	EDGC	6460	6460	6000	Supervsd Experience Group Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.320172	2025-11-20 22:15:01.320178
812	EDGC 6469	EDGC	6469	6469	6000	Introduction to Sexuality Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.324205	2025-11-20 22:15:01.324211
813	EDGC 6530	EDGC	6530	6530	6000	Student Services High Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.328353	2025-11-20 22:15:01.328359
814	EDGC 6535	EDGC	6535	6535	6000	Diagnosis/Treatment Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.332532	2025-11-20 22:15:01.332538
815	EDGC 6540	EDGC	6540	6540	6000	Clincal Mental Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.336801	2025-11-20 22:15:01.336806
816	EDGC 6550	EDGC	6550	6550	6000	School Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.340943	2025-11-20 22:15:01.340949
817	EDGC 6630	EDGC	6630	6630	6000	Analysis of the Individual		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.345108	2025-11-20 22:15:01.345113
818	EDGC 6660	EDGC	6660	6660	6000	Crisis Intervention Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.349285	2025-11-20 22:15:01.349291
819	EDGC 6810	EDGC	6810	6810	6000	Supervision in Counselor Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.353484	2025-11-20 22:15:01.35349
820	EDGC 6830	EDGC	6830	6830	6000	Couns Children & Adolescents		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.357771	2025-11-20 22:15:01.357776
821	EDGC 6840	EDGC	6840	6840	6000	Family Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.361841	2025-11-20 22:15:01.361846
822	EDGC 6850	EDGC	6850	6850	6000	Ethical & Professional Issues		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.365833	2025-11-20 22:15:01.365839
823	EDGC 6852	EDGC	6852	6852	6000	Adv Multicultural Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.369851	2025-11-20 22:15:01.369856
824	EDGC 6860	EDGC	6860	6860	6000	Introduction to Play Therapy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.373918	2025-11-20 22:15:01.373923
825	EDGC 6870	EDGC	6870	6870	6000	Advanced Play Therapy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.377991	2025-11-20 22:15:01.377997
826	EDGC 6880	EDGC	6880	6880	6000	Adv Counseling Intervention		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.382221	2025-11-20 22:15:01.382227
827	EDGC 6896	EDGC	6896	6896	6000	Mast Practicum Coun		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.386362	2025-11-20 22:15:01.386367
828	EDGC 6897	EDGC	6897	6897	6000	Master�s Internship in Counseling		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.390512	2025-11-20 22:15:01.390517
829	EDGC 6898	EDGC	6898	6898	6000	Doc Practicum Coun		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.394735	2025-11-20 22:15:01.39474
830	EDGC 6899	EDGC	6899	6899	6000	Doc Internship Coun		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.398869	2025-11-20 22:15:01.398875
831	EDGC 6950	EDGC	6950	6950	6000	Advanced Ethical, Legal, & Professional Issues in Counselor Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.403056	2025-11-20 22:15:01.403062
832	EDGC 6991	EDGC	6991	6991	6000	Doctoral Prac Coun Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.407334	2025-11-20 22:15:01.407339
833	EDGC 6993	EDGC	6993	6993	6000	Spec Topics in Couns Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.411624	2025-11-20 22:15:01.41163
834	EDGC 6995	EDGC	6995	6995	6000	Ind Study Counselor Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.415904	2025-11-20 22:15:01.41591
835	EDGC 6996	EDGC	6996	6996	6000	Adv Supervision in Counseling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.420113	2025-11-20 22:15:01.420119
836	EDGC 6997	EDGC	6997	6997	6000	Res Sem in Counselor Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.42445	2025-11-20 22:15:01.424456
837	EDGC 6998	EDGC	6998	6998	6000	Consultation in Counselor Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.428896	2025-11-20 22:15:01.428902
838	EDGC 7040	EDGC	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.433223	2025-11-20 22:15:01.43323
839	EDGC 7050	EDGC	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.437711	2025-11-20 22:15:01.437717
840	EDCI 2204	EDCI	2204	2204	2000	Intro to Secondary Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.441819	2025-11-20 22:15:01.441824
841	EDCI 3140	EDCI	3140	3140	3000	Matrl Meth Elem School Math		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.445907	2025-11-20 22:15:01.445913
842	EDCI 3150	EDCI	3150	3150	3000	Matrl Meth Elem School Science		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.44988	2025-11-20 22:15:01.449886
843	EDCI 3152	EDCI	3152	3152	3000	Sci Elem Teachers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.454111	2025-11-20 22:15:01.454117
844	EDCI 3160	EDCI	3160	3160	3000	Matrl Meth Elem Sch Soc Stdies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.458323	2025-11-20 22:15:01.458329
845	EDCI 3310	EDCI	3310	3310	3000	Dev Resp Curr Adolescents		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.462466	2025-11-20 22:15:01.462472
846	EDCI 3311	EDCI	3311	3311	3000	Field Exp: Dev Resp		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.466655	2025-11-20 22:15:01.46666
847	EDCI 3340	EDCI	3340	3340	3000	Methods Dev Alg/Geom Thinking		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.470803	2025-11-20 22:15:01.470809
848	EDCI 3400	EDCI	3400	3400	3000	Foundations of Literacy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.47509	2025-11-20 22:15:01.475096
849	EDCI 3410	EDCI	3410	3410	3000	Instruc for Early Literacy Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.479343	2025-11-20 22:15:01.479349
850	EDCI 3425	EDCI	3425	3425	3000	Literacy Instruc for Cont Lrng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.483496	2025-11-20 22:15:01.483502
851	EDCI 3440	EDCI	3440	3440	3000	Pract in Corrective Reading		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.487608	2025-11-20 22:15:01.487613
852	EDCI 3500	EDCI	3500	3500	3000	Obs & Asmt Early Childhood CR		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.491835	2025-11-20 22:15:01.491841
853	EDCI 3510	EDCI	3510	3510	3000	Facilit Play PrK		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.495945	2025-11-20 22:15:01.495951
854	EDCI 3520	EDCI	3520	3520	3000	Classroom Mgt PrK		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.500333	2025-11-20 22:15:01.500338
855	EDCI 3530	EDCI	3530	3530	3000	Curricula Dev PrK		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.504521	2025-11-20 22:15:01.504527
856	EDCI 3540	EDCI	3540	3540	3000	Develop Logioath PrK		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.50881	2025-11-20 22:15:01.508816
857	EDCI 3980	EDCI	3980	3980	3000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.512906	2025-11-20 22:15:01.512911
858	EDCI 3999	EDCI	3999	3999	3000	Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.516891	2025-11-20 22:15:01.516896
859	EDCI 4140	EDCI	4140	4140	4000	Teaching Elem Math		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.520464	2025-11-20 22:15:01.52047
860	EDCI 4201	EDCI	4201	4201	4000	Field Exp: Subj Area		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.523453	2025-11-20 22:15:01.523459
861	EDCI 4220	EDCI	4220	4220	4000	Matrl Meth in Sec Sch English		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.526412	2025-11-20 22:15:01.526418
862	EDCI 4221	EDCI	4221	4221	4000	Mat & Meth Engl II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.529419	2025-11-20 22:15:01.529424
863	EDCI 4240	EDCI	4240	4240	4000	Secondary Math Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.531918	2025-11-20 22:15:01.531922
864	EDCI 4241	EDCI	4241	4241	4000	Sec Math Methods II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.534255	2025-11-20 22:15:01.534259
865	EDCI 4250	EDCI	4250	4250	4000	Materials & Meth Sec Sch Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.536624	2025-11-20 22:15:01.536628
866	EDCI 4251	EDCI	4251	4251	4000	Mat & Meth Sec Sc II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.539595	2025-11-20 22:15:01.539599
867	EDCI 4260	EDCI	4260	4260	4000	Meth of Sec Social Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.542113	2025-11-20 22:15:01.542117
868	EDCI 4261	EDCI	4261	4261	4000	Mat & Meth Soc St II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.544931	2025-11-20 22:15:01.544934
869	EDCI 4400	EDCI	4400	4400	4000	Foundations of Literacy Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.547479	2025-11-20 22:15:01.547482
870	EDCI 4421	EDCI	4421	4421	4000	Linguistic Applic Rgang Art		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.550255	2025-11-20 22:15:01.550259
871	EDCI 4423	EDCI	4423	4423	4000	Rgang Arts in Mult Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.553403	2025-11-20 22:15:01.553406
872	EDCI 4425	EDCI	4425	4425	4000	Matrl Meth Teach Eng Sec Lang		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.556626	2025-11-20 22:15:01.55663
873	EDCI 4432	EDCI	4432	4432	4000	Disciplinary Literacy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.559604	2025-11-20 22:15:01.559608
874	EDCI 4540	EDCI	4540	4540	4000	Classroom Mgt PrK		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.562838	2025-11-20 22:15:01.562842
875	EDCI 4545	EDCI	4545	4545	4000	Dev of Lgath Knowledge		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.566221	2025-11-20 22:15:01.566225
876	EDCI 4595	EDCI	4595	4595	4000	Practicum Early Childhood Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.569479	2025-11-20 22:15:01.569483
877	EDCI 4620	EDCI	4620	4620	4000	Curr & Instr for Multicul Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.572875	2025-11-20 22:15:01.572878
878	EDCI 4660	EDCI	4660	4660	4000	Global Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.576367	2025-11-20 22:15:01.576371
879	EDCI 4993	EDCI	4993	4993	4000	Special Topics Curr & Instruc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.579511	2025-11-20 22:15:01.579514
880	EDCI 5140	EDCI	5140	5140	5000	Teaching Elem Math		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.583156	2025-11-20 22:15:01.58316
881	EDCI 5204	EDCI	5204	5204	5000	Teaching, Learning and Curriculum Development in the Secondary Classroom		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.586694	2025-11-20 22:15:01.586698
882	EDCI 5220	EDCI	5220	5220	5000	Matrl Meth in Sec Sch English		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.590429	2025-11-20 22:15:01.590433
883	EDCI 5221	EDCI	5221	5221	5000	Methods Secondary Engl II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.594292	2025-11-20 22:15:01.594296
884	EDCI 5240	EDCI	5240	5240	5000	Secondary Math Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.598355	2025-11-20 22:15:01.598359
885	EDCI 5241	EDCI	5241	5241	5000	Math Secondary II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.602354	2025-11-20 22:15:01.60236
886	EDCI 5250	EDCI	5250	5250	5000	Materials & Meth Sec Sch Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.606519	2025-11-20 22:15:01.606524
887	EDCI 5251	EDCI	5251	5251	5000	Materials & Methods Science II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.610789	2025-11-20 22:15:01.610794
888	EDCI 5260	EDCI	5260	5260	5000	Meth of Sec Social Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.615048	2025-11-20 22:15:01.615054
889	EDCI 5261	EDCI	5261	5261	5000	Secondary Social Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.619444	2025-11-20 22:15:01.61945
890	EDCI 5423	EDCI	5423	5423	5000	Rgang Arts in Mult Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.623859	2025-11-20 22:15:01.623865
891	EDCI 5425	EDCI	5425	5425	5000	Matrl Meth Teach Eng Sec Lang		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.628079	2025-11-20 22:15:01.628085
892	EDCI 5432	EDCI	5432	5432	5000	Disciplinary Literacy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.632544	2025-11-20 22:15:01.632551
893	EDCI 5540	EDCI	5540	5540	5000	Developing a Studetentered Learning Community in the Classroom		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.637079	2025-11-20 22:15:01.637085
894	EDCI 5545	EDCI	5545	5545	5000	Dev of Lgath Knowledge		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.641619	2025-11-20 22:15:01.641625
895	EDCI 5595	EDCI	5595	5595	5000	Practicum Early Childhood Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.646096	2025-11-20 22:15:01.646102
896	EDCI 5620	EDCI	5620	5620	5000	Curr & Instr for Multicul Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.65065	2025-11-20 22:15:01.650656
897	EDCI 5660	EDCI	5660	5660	5000	Global Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.655166	2025-11-20 22:15:01.655172
898	EDCI 5991	EDCI	5991	5991	5000	Special Topics Curr & Instruc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.659734	2025-11-20 22:15:01.65974
899	EDCI 5993	EDCI	5993	5993	5000	Special Topics Curr & Instruc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.664238	2025-11-20 22:15:01.664244
900	EDCI 6020	EDCI	6020	6020	6000	Writing Institute		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.668867	2025-11-20 22:15:01.668873
901	EDCI 6060	EDCI	6060	6060	6000	Action Research in Education		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.673656	2025-11-20 22:15:01.673662
902	EDCI 6100	EDCI	6100	6100	6000	Children�s Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.678521	2025-11-20 22:15:01.678528
903	EDCI 6140	EDCI	6140	6140	6000	Elementary Math Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.68341	2025-11-20 22:15:01.683417
904	EDCI 6150	EDCI	6150	6150	6000	Curriculum Evaluation and Integrated Methodology for Elementary Science and Social Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.688245	2025-11-20 22:15:01.688252
905	EDCI 6204	EDCI	6204	6204	6000	Princ of Teaching & Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.693057	2025-11-20 22:15:01.693064
906	EDCI 6220	EDCI	6220	6220	6000	Studies Tch Eng Sec Schools		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.69786	2025-11-20 22:15:01.697866
907	EDCI 6240	EDCI	6240	6240	6000	Studies Tch Math Sec Schools		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.702703	2025-11-20 22:15:01.70271
908	EDCI 6250	EDCI	6250	6250	6000	Studies Tch Science Sec Schs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.707334	2025-11-20 22:15:01.707341
909	EDCI 6260	EDCI	6260	6260	6000	Studies Tch Soc St Sec Schools		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.712152	2025-11-20 22:15:01.712159
910	EDCI 6300	EDCI	6300	6300	6000	C&I Young Adolescent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.716717	2025-11-20 22:15:01.716723
911	EDCI 6400	EDCI	6400	6400	6000	Foundations of Literacy Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.721226	2025-11-20 22:15:01.721232
912	EDCI 6410	EDCI	6410	6410	6000	Early Literacy Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.726035	2025-11-20 22:15:01.726042
913	EDCI 6421	EDCI	6421	6421	6000	Linguistic Applic Rgang Art		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.730466	2025-11-20 22:15:01.730472
914	EDCI 6423	EDCI	6423	6423	6000	Rgang Arts in Mult Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.735259	2025-11-20 22:15:01.735266
915	EDCI 6425	EDCI	6425	6425	6000	Matrl Meth Teach Eng Sec Lang		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.740102	2025-11-20 22:15:01.740109
916	EDCI 6430	EDCI	6430	6430	6000	Info Lit Content Lrn		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.744855	2025-11-20 22:15:01.744861
917	EDCI 6434	EDCI	6434	6434	6000	Developmental Reading		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.749721	2025-11-20 22:15:01.749727
918	EDCI 6436	EDCI	6436	6436	6000	Diagnostic and Remedial Readng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.754375	2025-11-20 22:15:01.754382
919	EDCI 6490	EDCI	6490	6490	6000	Sem in Readiganguage Arts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.759259	2025-11-20 22:15:01.759265
920	EDCI 6493	EDCI	6493	6493	6000	Practicum Diagnostic Remed Rdg		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.764057	2025-11-20 22:15:01.764064
921	EDCI 6500	EDCI	6500	6500	6000	Foundation Child Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.769783	2025-11-20 22:15:01.769792
922	EDCI 6510	EDCI	6510	6510	6000	Adv Curr Design Erly Chldhood		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.774655	2025-11-20 22:15:01.774663
923	EDCI 6530	EDCI	6530	6530	6000	Survy & Msrment K		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.778697	2025-11-20 22:15:01.778705
924	EDCI 6540	EDCI	6540	6540	6000	Stdy Prog Early Childhood Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.782602	2025-11-20 22:15:01.782609
925	EDCI 6550	EDCI	6550	6550	6000	Effectve Parenting Child Behav		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.786223	2025-11-20 22:15:01.786228
926	EDCI 6600	EDCI	6600	6600	6000	Foundations of Curric Develop		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.789286	2025-11-20 22:15:01.789291
927	EDCI 6610	EDCI	6610	6610	6000	Elementary School Curriculum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.792405	2025-11-20 22:15:01.79241
928	EDCI 6620	EDCI	6620	6620	6000	Secondary School Curriculum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.795123	2025-11-20 22:15:01.795146
929	EDCI 6658	EDCI	6658	6658	6000	College Curriculum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.797386	2025-11-20 22:15:01.797391
930	EDCI 6675	EDCI	6675	6675	6000	Assessment in Higher Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.799743	2025-11-20 22:15:01.799748
931	EDCI 6710	EDCI	6710	6710	6000	Nonfiction Across Curriculum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.803708	2025-11-20 22:15:01.803712
932	EDCI 6720	EDCI	6720	6720	6000	Teaching Information Literacy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.807074	2025-11-20 22:15:01.807078
933	EDCI 6755	EDCI	6755	6755	6000	Cont Applicat Instr Strategies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.810482	2025-11-20 22:15:01.810486
934	EDCI 6758	EDCI	6758	6758	6000	College Teaching		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.815769	2025-11-20 22:15:01.81578
935	EDCI 6793	EDCI	6793	6793	6000	Grad Spec Topics Curr & Instr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.822852	2025-11-20 22:15:01.822862
936	EDCI 6800	EDCI	6800	6800	6000	Instruction & Assess		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.829204	2025-11-20 22:15:01.829213
937	EDCI 6900	EDCI	6900	6900	6000	Intro Doctoral Readings C&I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.834852	2025-11-20 22:15:01.83486
938	EDCI 6902	EDCI	6902	6902	6000	Topical Doc Reading Curriculum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.840312	2025-11-20 22:15:01.840321
939	EDCI 6905	EDCI	6905	6905	6000	Research Critique Curr & Instr		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.845954	2025-11-20 22:15:01.845961
940	EDCI 6910	EDCI	6910	6910	6000	Directed Group Doctoral Study		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.85135	2025-11-20 22:15:01.851358
941	EDCI 6980	EDCI	6980	6980	6000	Independent Study Curr & Instr		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.856729	2025-11-20 22:15:01.856737
942	EDCI 6990	EDCI	6990	6990	6000	Doctoral Seminar Curr & Instr		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:01.862118	2025-11-20 22:15:01.862126
943	EDCI 6992	EDCI	6992	6992	6000	Doctoral Res Sem Curric Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.86706	2025-11-20 22:15:01.867067
944	EDCI 6995	EDCI	6995	6995	6000	Practicum in Instruction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.872331	2025-11-20 22:15:01.872339
945	EDCI 7000	EDCI	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.877386	2025-11-20 22:15:01.877393
946	EDCI 7040	EDCI	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.882377	2025-11-20 22:15:01.882383
947	EDCI 7050	EDCI	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.887654	2025-11-20 22:15:01.88766
948	EES 1000	EES	1000	1000	1000	Dynamic Earth		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.892218	2025-11-20 22:15:01.892225
949	EES 1001	EES	1001	1001	1000	Dynamic Earth Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.896754	2025-11-20 22:15:01.896761
950	EES 1002	EES	1002	1002	1000	Intro to Environ Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.90111	2025-11-20 22:15:01.901116
951	EES 1003	EES	1003	1003	1000	Intro to Env Sciences Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.905549	2025-11-20 22:15:01.905556
952	EES 1006	EES	1006	1006	1000	Dinosaurs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.909882	2025-11-20 22:15:01.909888
953	EES 1008	EES	1008	1008	1000	Geology of New Orleans and LA		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.914192	2025-11-20 22:15:01.914198
954	EES 2004	EES	2004	2004	2000	Earth & Env Thru Time		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.918344	2025-11-20 22:15:01.918349
955	EES 2005	EES	2005	2005	2000	Earth and Env Time Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.922317	2025-11-20 22:15:01.922322
956	EES 2051	EES	2051	2051	2000	Geomorphology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.92611	2025-11-20 22:15:01.926116
957	EES 2096	EES	2096	2096	2000	Special Topics in Geology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.930395	2025-11-20 22:15:01.930401
958	EES 2097	EES	2097	2097	2000	Independent Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.934619	2025-11-20 22:15:01.934626
959	EES 2105	EES	2105	2105	2000	Environmental Toxicology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.938504	2025-11-20 22:15:01.938509
960	EES 2510	EES	2510	2510	2000	Environmental Science & Policy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.942717	2025-11-20 22:15:01.942723
961	EES 2700	EES	2700	2700	2000	Earth Materials		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.946926	2025-11-20 22:15:01.946932
962	EES 3010	EES	3010	3010	3000	Methods in Environmental Sciences		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.951382	2025-11-20 22:15:01.951388
963	EES 3091	EES	3091	3091	3000	Ind Studisarth and Env Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.955727	2025-11-20 22:15:01.955733
964	EES 3096	EES	3096	3096	3000	Spec Topisarth and Env Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.959725	2025-11-20 22:15:01.95973
965	EES 3100	EES	3100	3100	3000	Analysis of Earth Structure		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.963883	2025-11-20 22:15:01.963889
966	EES 3310	EES	3310	3310	3000	Ign Met Sed Petrology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.968153	2025-11-20 22:15:01.968159
967	EES 3400	EES	3400	3400	3000	Intro Petroleum Geol		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.972328	2025-11-20 22:15:01.972334
968	EES 3700	EES	3700	3700	3000	Geological Time		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.976345	2025-11-20 22:15:01.976351
969	EES 3730	EES	3730	3730	3000	Introductory Geochemistry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.980354	2025-11-20 22:15:01.980359
970	EES 3740	EES	3740	3740	3000	Principles of Paleontology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.984461	2025-11-20 22:15:01.984467
971	EES 3991	EES	3991	3991	3000	Undergraduate Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.988701	2025-11-20 22:15:01.988707
972	EES 4000	EES	4000	4000	4000	Statistic Method Earth Env Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:01.992885	2025-11-20 22:15:01.992891
973	EES 4090	EES	4090	4090	4000	Senior Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:01.997019	2025-11-20 22:15:01.997025
974	EES 4091	EES	4091	4091	4000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.001226	2025-11-20 22:15:02.001232
975	EES 4096	EES	4096	4096	4000	Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.005096	2025-11-20 22:15:02.005102
976	EES 4098	EES	4098	4098	4000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.009406	2025-11-20 22:15:02.009412
977	EES 4099	EES	4099	4099	4000	Senior Smarth and Env Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.013741	2025-11-20 22:15:02.013747
978	EES 4105	EES	4105	4105	4000	Ecotoxicology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.018095	2025-11-20 22:15:02.018102
979	EES 4110	EES	4110	4110	4000	Introduction to Geophysics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.022613	2025-11-20 22:15:02.022619
980	EES 4115	EES	4115	4115	4000	Toxicology and Human Health		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.027062	2025-11-20 22:15:02.027068
981	EES 4120	EES	4120	4120	4000	Gravity & Magnetics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.031396	2025-11-20 22:15:02.031401
982	EES 4125	EES	4125	4125	4000	Toxicology of Metals		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.03574	2025-11-20 22:15:02.035745
983	EES 4150	EES	4150	4150	4000	Geophysical Field Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.040051	2025-11-20 22:15:02.040057
984	EES 4152	EES	4152	4152	4000	Appl Seismic Acquis & Process		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.044278	2025-11-20 22:15:02.044284
985	EES 4160	EES	4160	4160	4000	Seismic Stratigraphy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.048748	2025-11-20 22:15:02.048755
986	EES 4161	EES	4161	4161	4000	Gulf Coast Geology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.053107	2025-11-20 22:15:02.053113
987	EES 4165	EES	4165	4165	4000	Geophysical Explore & Interp		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.057436	2025-11-20 22:15:02.057442
988	EES 4520	EES	4520	4520	4000	Estuarine Envir Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.061803	2025-11-20 22:15:02.061809
989	EES 4550	EES	4550	4550	4000	Coastal Geomorphology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.066047	2025-11-20 22:15:02.066052
990	EES 4560	EES	4560	4560	4000	Env Geol Coastal LA		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.070497	2025-11-20 22:15:02.070502
991	EES 4711	EES	4711	4711	4000	IntroXay Crystallography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.07455	2025-11-20 22:15:02.074556
992	EES 4720	EES	4720	4720	4000	Global Tectonics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.079045	2025-11-20 22:15:02.079051
993	EES 4730	EES	4730	4730	4000	Environmental Geochemistry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.083219	2025-11-20 22:15:02.083224
994	EES 4735	EES	4735	4735	4000	Hydrogeology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.0876	2025-11-20 22:15:02.087606
995	EES 4750	EES	4750	4750	4000	Principles of Stratigraphy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.091906	2025-11-20 22:15:02.091912
996	EES 4800	EES	4800	4800	4000	Advanced Stratigraphy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.096595	2025-11-20 22:15:02.096602
997	EES 4840	EES	4840	4840	4000	Structural Geology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.100989	2025-11-20 22:15:02.100995
998	EES 4900	EES	4900	4900	4000	Coastal Processes		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.105385	2025-11-20 22:15:02.105391
999	EES 4925	EES	4925	4925	4000	Intro to Physical Oceanography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.110096	2025-11-20 22:15:02.110102
1000	EES 4949	EES	4949	4949	4000	Natural Resource Mgt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.114542	2025-11-20 22:15:02.114548
1001	EES 5000	EES	5000	5000	5000	Statistic Method Earth Env Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.119058	2025-11-20 22:15:02.119064
1002	EES 5091	EES	5091	5091	5000	Independent Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.123676	2025-11-20 22:15:02.123683
1003	EES 5096	EES	5096	5096	5000	Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.128025	2025-11-20 22:15:02.128031
1004	EES 5105	EES	5105	5105	5000	Ecotoxicology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.132619	2025-11-20 22:15:02.132625
1005	EES 5110	EES	5110	5110	5000	Introduction to Geophysics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.137212	2025-11-20 22:15:02.137221
1006	EES 5115	EES	5115	5115	5000	Tox and Human Health		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.141859	2025-11-20 22:15:02.141866
1007	EES 5120	EES	5120	5120	5000	Gravity & Magnetics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.146192	2025-11-20 22:15:02.146198
1008	EES 5125	EES	5125	5125	5000	Toxicology of Metals		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.150718	2025-11-20 22:15:02.150724
1009	EES 5150	EES	5150	5150	5000	Geophysical Field Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.155206	2025-11-20 22:15:02.155212
1010	EES 5152	EES	5152	5152	5000	Appl Seismic Acquis & Process		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.159805	2025-11-20 22:15:02.159811
1011	EES 5160	EES	5160	5160	5000	Seismic Stratigraphy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.164655	2025-11-20 22:15:02.164663
1012	EES 5161	EES	5161	5161	5000	Gulf Coast Geology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.169329	2025-11-20 22:15:02.169336
1013	EES 5165	EES	5165	5165	5000	Geophysical Explore & Interp		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.173962	2025-11-20 22:15:02.173968
1014	EES 5520	EES	5520	5520	5000	Estuarine Envir Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.178822	2025-11-20 22:15:02.178828
1015	EES 5550	EES	5550	5550	5000	Coastal Geomorphology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.183584	2025-11-20 22:15:02.183591
1016	EES 5560	EES	5560	5560	5000	Env Geol Coastal LA		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.188158	2025-11-20 22:15:02.188164
1017	EES 5711	EES	5711	5711	5000	IntroXay Crystallography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.192812	2025-11-20 22:15:02.192818
1018	EES 5720	EES	5720	5720	5000	Global Tectonics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.197384	2025-11-20 22:15:02.19739
1019	EES 5730	EES	5730	5730	5000	Environmental Geochemistry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.202119	2025-11-20 22:15:02.202125
1020	EES 5735	EES	5735	5735	5000	Hydrogeology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.206936	2025-11-20 22:15:02.206943
1021	EES 5750	EES	5750	5750	5000	Principles of Stratigraphy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.211869	2025-11-20 22:15:02.211875
1022	EES 5800	EES	5800	5800	5000	Advanced Stratigraphy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.216637	2025-11-20 22:15:02.216643
1023	EES 5840	EES	5840	5840	5000	Structural Geology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.221433	2025-11-20 22:15:02.22144
1024	EES 5900	EES	5900	5900	5000	Coastal Processes		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.226304	2025-11-20 22:15:02.226311
1025	EES 5925	EES	5925	5925	5000	Intro Phys Oceanogry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.231156	2025-11-20 22:15:02.231162
1026	EES 5949	EES	5949	5949	5000	Natural Resource Mgt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.236001	2025-11-20 22:15:02.236008
1027	EES 6015	EES	6015	6015	6000	Tox Coastal Organism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.240827	2025-11-20 22:15:02.240834
1028	EES 6090	EES	6090	6090	6000	Graduate Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:02.245629	2025-11-20 22:15:02.245635
1029	EES 6095	EES	6095	6095	6000	M.S. Project in EES		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.250236	2025-11-20 22:15:02.250243
1030	EES 6096	EES	6096	6096	6000	Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.255063	2025-11-20 22:15:02.25507
1031	EES 6097	EES	6097	6097	6000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.263418	2025-11-20 22:15:02.263425
1032	EES 6265	EES	6265	6265	6000	Surf Process & Environ Dynam		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.268436	2025-11-20 22:15:02.268444
1033	EES 6640	EES	6640	6640	6000	Sequence Strat		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.27348	2025-11-20 22:15:02.273487
1034	EES 6658	EES	6658	6658	6000	Low Temperature Geochemistry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.278484	2025-11-20 22:15:02.278491
1035	EES 6760	EES	6760	6760	6000	Coastal Restoration & Managmnt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.283439	2025-11-20 22:15:02.283445
1036	EES 6762	EES	6762	6762	6000	Aquatic Sciences		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.28835	2025-11-20 22:15:02.288357
1037	EES 6770	EES	6770	6770	6000	Basin Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.293238	2025-11-20 22:15:02.293244
1038	EES 6810	EES	6810	6810	6000	Geophysical Data Processing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.298287	2025-11-20 22:15:02.298294
1039	EES 6840	EES	6840	6840	6000	Reflection Seismology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.303639	2025-11-20 22:15:02.303646
1040	EES 7000	EES	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.30885	2025-11-20 22:15:02.308857
1041	EES 7040	EES	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.313629	2025-11-20 22:15:02.313635
1042	EES 7050	EES	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.318395	2025-11-20 22:15:02.318402
1043	ECON 1203	ECON	1203	1203	1000	Principles of Microeconomics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.322916	2025-11-20 22:15:02.322923
1044	ECON 1204	ECON	1204	1204	1000	Principles of Macroeconomics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.327114	2025-11-20 22:15:02.32712
1045	ECON 1330	ECON	1330	1330	1000	Financial Literacy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.331458	2025-11-20 22:15:02.331464
1046	ECON 2000	ECON	2000	2000	2000	Engineering Economics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.335836	2025-11-20 22:15:02.335842
1047	ECON 2221	ECON	2221	2221	2000	Money & Banking		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.34019	2025-11-20 22:15:02.340196
1048	ECON 3000	ECON	3000	3000	3000	Managerial Economics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.344545	2025-11-20 22:15:02.344551
1049	ECON 3292	ECON	3292	3292	3000	Internship Busines & Economics		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.348871	2025-11-20 22:15:02.348877
1050	ECON 3999	ECON	3999	3999	3000	Special Topics in Economics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.353114	2025-11-20 22:15:02.35312
1051	ECON 4250	ECON	4250	4250	4000	Health Care Economics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.357172	2025-11-20 22:15:02.357178
1052	ECON 4261	ECON	4261	4261	4000	International Trade Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.361336	2025-11-20 22:15:02.361342
1053	ECON 4291	ECON	4291	4291	4000	UGRD Directed Individual Study		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.365377	2025-11-20 22:15:02.365382
1054	ECON 4306	ECON	4306	4306	4000	International Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.369432	2025-11-20 22:15:02.369438
1055	ECON 4400	ECON	4400	4400	4000	Econ Foundation for Managers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.373052	2025-11-20 22:15:02.373057
1056	ECON 5261	ECON	5261	5261	5000	International Trade Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.375854	2025-11-20 22:15:02.375859
1057	ECON 5306	ECON	5306	5306	5000	International Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.37863	2025-11-20 22:15:02.378635
1058	ECON 6200	ECON	6200	6200	6000	Managerial Economics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.381317	2025-11-20 22:15:02.381322
1059	ECON 6203	ECON	6203	6203	6000	Microeconomic Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.384007	2025-11-20 22:15:02.384011
1060	ECON 6204	ECON	6204	6204	6000	Macroeconomic Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.386061	2025-11-20 22:15:02.386065
1061	ECON 6207	ECON	6207	6207	6000	Seminar in Microeconomics		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:02.388159	2025-11-20 22:15:02.388163
1062	ECON 6250	ECON	6250	6250	6000	Health Care Economics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.390909	2025-11-20 22:15:02.390913
1063	ECON 6292	ECON	6292	6292	6000	Directed Individual Study		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.394095	2025-11-20 22:15:02.394098
1064	ECON 6294	ECON	6294	6294	6000	Internship in Economics		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.397366	2025-11-20 22:15:02.39737
1065	ECON 6295	ECON	6295	6295	6000	Special Topic Economics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.400623	2025-11-20 22:15:02.400627
1066	ECON 7040	ECON	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.403819	2025-11-20 22:15:02.403822
1067	ECON 7050	ECON	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.407289	2025-11-20 22:15:02.407293
1068	ECON 7051	ECON	7051	7051	7000	Dissertation Workshop		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.41066	2025-11-20 22:15:02.410664
1069	COED 1	COED	1	1	1000	Coop Educ for Educ Majors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.413871	2025-11-20 22:15:02.413875
1070	EDUC 1001	EDUC	1001	1001	1000	Peervice Teaching		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.417191	2025-11-20 22:15:02.417195
1071	EDUC 1010	EDUC	1010	1010	1000	Intro to Teaching		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.420371	2025-11-20 22:15:02.420375
1072	EDUC 2100	EDUC	2100	2100	2000	Child & Adolescent Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.423649	2025-11-20 22:15:02.423652
1073	EDUC 2200	EDUC	2200	2200	2000	Principles Teaching Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.427027	2025-11-20 22:15:02.427031
1074	EDUC 2204	EDUC	2204	2204	2000	Intro Secondary Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.43043	2025-11-20 22:15:02.430434
1075	EDUC 2206	EDUC	2206	2206	2000	Intro to Tech in the Classroom		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.433722	2025-11-20 22:15:02.433727
1076	EDUC 3000	EDUC	3000	3000	3000	Mt Needs of All Learners II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.437312	2025-11-20 22:15:02.437317
1077	EDUC 3001	EDUC	3001	3001	3000	Tier III Assess ECE		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.440975	2025-11-20 22:15:02.44098
1078	EDUC 3002	EDUC	3002	3002	3000	Tier III Assess Elem		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.444511	2025-11-20 22:15:02.444515
1079	EDUC 3003	EDUC	3003	3003	3000	Tier III Assess IN/M		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.448105	2025-11-20 22:15:02.448109
1080	EDUC 3004	EDUC	3004	3004	3000	Tier III Assess Mus		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.451912	2025-11-20 22:15:02.451917
1081	EDUC 3005	EDUC	3005	3005	3000	Tier III Assess Eng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.455773	2025-11-20 22:15:02.455778
1082	EDUC 3006	EDUC	3006	3006	3000	Tier III Assess Math		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.459615	2025-11-20 22:15:02.45962
1083	EDUC 3007	EDUC	3007	3007	3000	Tier III Assess Sci		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.463552	2025-11-20 22:15:02.463557
1084	EDUC 3008	EDUC	3008	3008	3000	Tier III Assess SSt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.467504	2025-11-20 22:15:02.46751
1085	EDUC 3100	EDUC	3100	3100	3000	Diff Curriculum & Instruc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.471737	2025-11-20 22:15:02.471743
1086	EDUC 3110	EDUC	3110	3110	3000	Developing a Studetentered Learning Environment in the Classroom		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.47575	2025-11-20 22:15:02.475756
1087	EDUC 3120	EDUC	3120	3120	3000	Data for Teachers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.479678	2025-11-20 22:15:02.479684
1088	EDUC 3130	EDUC	3130	3130	3000	Literacy Instruction for Learners with Dyslexia and Diverse Needs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.483551	2025-11-20 22:15:02.483556
1089	EDUC 3982	EDUC	3982	3982	3000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.487652	2025-11-20 22:15:02.487657
1090	EDUC 4000	EDUC	4000	4000	4000	Mtg Needs of All Learners III		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.491696	2025-11-20 22:15:02.491702
1091	EDUC 4813	EDUC	4813	4813	4000	Cap Internshi Grades K		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.495746	2025-11-20 22:15:02.495752
1092	EDUC 4823	EDUC	4823	4823	4000	Cap Internshi Grades1		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.499858	2025-11-20 22:15:02.499864
1093	EDUC 4833	EDUC	4833	4833	4000	Cap Internshi Grades4		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.504026	2025-11-20 22:15:02.504031
1094	EDUC 4843	EDUC	4843	4843	4000	Cap Internshi Grades62		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.508668	2025-11-20 22:15:02.508674
1095	EDUC 4853	EDUC	4853	4853	4000	Cap Internshi Special Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.514247	2025-11-20 22:15:02.514256
1096	EDUC 4910	EDUC	4910	4910	4000	Student Teaching Grades  5		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.520085	2025-11-20 22:15:02.520095
1097	EDUC 4911	EDUC	4911	4911	4000	Residency I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.525374	2025-11-20 22:15:02.525383
1098	EDUC 4912	EDUC	4912	4912	4000	Residency II: Elementary Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.530891	2025-11-20 22:15:02.530899
1099	EDUC 4920	EDUC	4920	4920	4000	Student Teaching Grades  12		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.536388	2025-11-20 22:15:02.536396
1100	EDUC 4921	EDUC	4921	4921	4000	Res I: Secondary Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.541556	2025-11-20 22:15:02.541588
1101	EDUC 4922	EDUC	4922	4922	4000	Res II: Secondary Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.546451	2025-11-20 22:15:02.546459
1102	EDUC 4930	EDUC	4930	4930	4000	Student Teachin GradesK2		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.551261	2025-11-20 22:15:02.551269
1103	EDUC 4940	EDUC	4940	4940	4000	Student Teaching Grades  8		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.556181	2025-11-20 22:15:02.556188
1104	EDUC 4950	EDUC	4950	4950	4000	Student Teaching Grades P 3		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.560715	2025-11-20 22:15:02.560722
1105	EDUC 4960	EDUC	4960	4960	4000	Student Teach Sped		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.565226	2025-11-20 22:15:02.565233
1106	EDUC 4970	EDUC	4970	4970	4000	Student Teach M/M1		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.569955	2025-11-20 22:15:02.569962
1107	EDUC 5100	EDUC	5100	5100	5000	Differentiated Curr & Instruc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.574536	2025-11-20 22:15:02.574542
1108	EDUC 5813	EDUC	5813	5813	5000	Cap Internshi Grades K		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.579199	2025-11-20 22:15:02.579205
1109	EDUC 5823	EDUC	5823	5823	5000	Cap Internshi Grades1		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.583611	2025-11-20 22:15:02.583617
1110	EDUC 5833	EDUC	5833	5833	5000	Cap Internshi Grades4		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.587939	2025-11-20 22:15:02.587946
1111	EDUC 5843	EDUC	5843	5843	5000	Cap Internshi Grades62		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.592476	2025-11-20 22:15:02.592481
1112	EDUC 5853	EDUC	5853	5853	5000	Cap Internshi Special Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.596985	2025-11-20 22:15:02.596991
1113	EDUC 5863	EDUC	5863	5863	5000	Internship M/M1		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.6015	2025-11-20 22:15:02.601506
1114	EDUC 5873	EDUC	5873	5873	5000	Internship M/M4		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.606025	2025-11-20 22:15:02.606031
1115	EDUC 5883	EDUC	5883	5883	5000	Internship M/M62		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.6106	2025-11-20 22:15:02.610606
1116	EDUC 5910	EDUC	5910	5910	5000	Student Teaching Grades  5		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.615066	2025-11-20 22:15:02.615072
1117	EDUC 5920	EDUC	5920	5920	5000	Student Teaching Grades  12		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.61959	2025-11-20 22:15:02.619596
1118	EDUC 5940	EDUC	5940	5940	5000	Student Teaching Grades  8		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.62412	2025-11-20 22:15:02.624126
1119	EDUC 5950	EDUC	5950	5950	5000	Student Teaching Grades P 3		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.628589	2025-11-20 22:15:02.628595
1120	EDUC 5960	EDUC	5960	5960	5000	Student Teach Sped		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.633079	2025-11-20 22:15:02.633086
1121	EDUC 5970	EDUC	5970	5970	5000	Student Teach M/M1		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.637587	2025-11-20 22:15:02.637593
1122	EDUC 5980	EDUC	5980	5980	5000	Student Teach M/M4		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.64206	2025-11-20 22:15:02.642067
1123	EDUC 5990	EDUC	5990	5990	5000	Student teach M/M62		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.646648	2025-11-20 22:15:02.646654
1124	EDUC 6001	EDUC	6001	6001	6000	MAT Assessment ECE		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.6512	2025-11-20 22:15:02.651207
1125	EDUC 6002	EDUC	6002	6002	6000	MAT Assessment Elem		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.655972	2025-11-20 22:15:02.655978
1126	EDUC 6003	EDUC	6003	6003	6000	MAT Assessment Int/M		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.660773	2025-11-20 22:15:02.660779
1127	EDUC 6005	EDUC	6005	6005	6000	MAT Assessment Eng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.665502	2025-11-20 22:15:02.665508
1128	EDUC 6006	EDUC	6006	6006	6000	MAT Assessment Math		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.670215	2025-11-20 22:15:02.670222
1129	EDUC 6007	EDUC	6007	6007	6000	MAT Assess�t Science		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.67482	2025-11-20 22:15:02.674826
1130	EDUC 6008	EDUC	6008	6008	6000	MAT Assess�t Soc St		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.679224	2025-11-20 22:15:02.679231
1131	EDUC 6009	EDUC	6009	6009	6000	MAT Assess Sig Dis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.684252	2025-11-20 22:15:02.684259
1132	EDUC 6010	EDUC	6010	6010	6000	MAT Assess Early Int		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.688917	2025-11-20 22:15:02.688923
1133	EDUC 6011	EDUC	6011	6011	6000	MAT Assess Hear Impd		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.693585	2025-11-20 22:15:02.693592
1134	EDUC 6130	EDUC	6130	6130	6000	Literacy Instruction for Learners with Dyslexia and Diverse Needs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.698176	2025-11-20 22:15:02.698183
1135	EDUC 6210	EDUC	6210	6210	6000	Human Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.703063	2025-11-20 22:15:02.70307
1136	EDUC 6310	EDUC	6310	6310	6000	Res I: Elem Ed Stud Teach		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.707919	2025-11-20 22:15:02.707926
1137	EDUC 6311	EDUC	6311	6311	6000	Res I: Elem Ed Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.712659	2025-11-20 22:15:02.712665
1138	EDUC 6320	EDUC	6320	6320	6000	Res II: Elem Ed Stud Teaching		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.717235	2025-11-20 22:15:02.717241
1139	EDUC 6321	EDUC	6321	6321	6000	Res II: Elem Ed Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.721909	2025-11-20 22:15:02.721915
1140	EDUC 6330	EDUC	6330	6330	6000	Res I: Sec Ed Stud Teaching		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.726514	2025-11-20 22:15:02.726521
1141	EDUC 6331	EDUC	6331	6331	6000	Res I: Sec Ed Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.732325	2025-11-20 22:15:02.732335
1142	EDUC 6340	EDUC	6340	6340	6000	Res II: Sec Ed Stud Teaching		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.737486	2025-11-20 22:15:02.737496
1143	EDUC 6341	EDUC	6341	6341	6000	Res II: Sec Ed Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.742075	2025-11-20 22:15:02.742081
1144	EDUC 6982	EDUC	6982	6982	6000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.74568	2025-11-20 22:15:02.745687
1145	EDFR 5990	EDFR	5990	5990	5000	Special Topics in Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.749113	2025-11-20 22:15:02.749119
1146	EDFR 6675	EDFR	6675	6675	6000	Assessment in Higher Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.752119	2025-11-20 22:15:02.752125
1147	EDFR 6700	EDFR	6700	6700	6000	Educational Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.754788	2025-11-20 22:15:02.754793
1148	EDFR 6705	EDFR	6705	6705	6000	Quant & Qual Research Design		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.757396	2025-11-20 22:15:02.7574
1149	EDFR 6710	EDFR	6710	6710	6000	Descriptive Statistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.760008	2025-11-20 22:15:02.760013
1150	EDFR 6715	EDFR	6715	6715	6000	Intro to Qual Resrch Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.763372	2025-11-20 22:15:02.763376
1151	EDFR 6720	EDFR	6720	6720	6000	Appl Regr & Analy Covariance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.766641	2025-11-20 22:15:02.766645
1152	EDFR 6721	EDFR	6721	6721	6000	Qualitative Research Data Col		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.769866	2025-11-20 22:15:02.76987
1153	EDFR 6725	EDFR	6725	6725	6000	Multivariate Statistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.773252	2025-11-20 22:15:02.773256
1154	EDFR 6731	EDFR	6731	6731	6000	Qualitative Research Data Anlz		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.776433	2025-11-20 22:15:02.776437
1155	EDFR 6991	EDFR	6991	6991	6000	Practicum in Educ Evaluation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.781095	2025-11-20 22:15:02.781105
1156	EDFR 6993	EDFR	6993	6993	6000	Spec Topics in Educ Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.785871	2025-11-20 22:15:02.785879
1157	EDAD 3530	EDAD	3530	3530	3000	College Student Serv As A Prof		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.789947	2025-11-20 22:15:02.789955
1158	EDAD 6530	EDAD	6530	6530	6000	Student Services High Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.794345	2025-11-20 22:15:02.794353
1159	EDAD 6535	EDAD	6535	6535	6000	College Student Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.798233	2025-11-20 22:15:02.798239
1160	EDAD 6550	EDAD	6550	6550	6000	The Academic Profession		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.802029	2025-11-20 22:15:02.802035
1161	EDAD 6600	EDAD	6600	6600	6000	Amer College & University		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.805968	2025-11-20 22:15:02.805974
1162	EDAD 6605	EDAD	6605	6605	6000	Community & Technical Colleges		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.809707	2025-11-20 22:15:02.809713
1163	EDAD 6610	EDAD	6610	6610	6000	Legal Aspects of Higher Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.813517	2025-11-20 22:15:02.813522
1164	EDAD 6615	EDAD	6615	6615	6000	Financial Mang in Higher Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.81761	2025-11-20 22:15:02.817615
1165	EDAD 6620	EDAD	6620	6620	6000	History & Philosophy of Higher Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.821359	2025-11-20 22:15:02.821364
1166	EDAD 6630	EDAD	6630	6630	6000	Student Choice in Higher Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.825334	2025-11-20 22:15:02.82534
1167	EDAD 6640	EDAD	6640	6640	6000	College Teaching		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.828938	2025-11-20 22:15:02.828943
1168	EDAD 6650	EDAD	6650	6650	6000	College Curriculum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.832773	2025-11-20 22:15:02.832778
1169	EDAD 6675	EDAD	6675	6675	6000	Current Issues in Higher Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.836857	2025-11-20 22:15:02.836862
1170	EDAD 6681	EDAD	6681	6681	6000	Org & Ldrship in Higher Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.840859	2025-11-20 22:15:02.840865
1171	EDAD 6683	EDAD	6683	6683	6000	Students in Higher Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.844853	2025-11-20 22:15:02.844858
1172	EDAD 6684	EDAD	6684	6684	6000	Teach Lrn Curr in Higher Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.848871	2025-11-20 22:15:02.848876
1173	EDAD 6693	EDAD	6693	6693	6000	Diversity in Higher Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.852928	2025-11-20 22:15:02.852933
1174	EDAD 6695	EDAD	6695	6695	6000	Professional Seminar in Higher Education		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:02.856869	2025-11-20 22:15:02.856875
1175	EDAD 6800	EDAD	6800	6800	6000	School Leadership		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.860993	2025-11-20 22:15:02.860999
1176	EDAD 6805	EDAD	6805	6805	6000	Lead Lrng Envir		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.864963	2025-11-20 22:15:02.86497
1177	EDAD 6810	EDAD	6810	6810	6000	School Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.868921	2025-11-20 22:15:02.868927
1178	EDAD 6812	EDAD	6812	6812	6000	Lead Curr Instruct Assessment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.872919	2025-11-20 22:15:02.872924
1179	EDAD 6816	EDAD	6816	6816	6000	Scholased Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.876919	2025-11-20 22:15:02.876925
1180	EDAD 6840	EDAD	6840	6840	6000	Org & GovernanceK2 Schools		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.880839	2025-11-20 22:15:02.880844
1181	EDAD 6845	EDAD	6845	6845	6000	School/Community Relationships		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.884912	2025-11-20 22:15:02.884917
1182	EDAD 6850	EDAD	6850	6850	6000	Supervision of Instruction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.888757	2025-11-20 22:15:02.888763
1183	EDAD 6860	EDAD	6860	6860	6000	Principalship		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.892783	2025-11-20 22:15:02.892788
1184	EDAD 6875	EDAD	6875	6875	6000	School Improvement		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.896828	2025-11-20 22:15:02.896834
1185	EDAD 6890	EDAD	6890	6890	6000	Seminar in Educational Admin		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:02.90092	2025-11-20 22:15:02.900925
1186	EDAD 6895	EDAD	6895	6895	6000	Intern in School Leadership		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.904917	2025-11-20 22:15:02.904923
1187	EDAD 6900	EDAD	6900	6900	6000	Doc Poeminar I Ed Admin		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.909123	2025-11-20 22:15:02.909147
1188	EDAD 6905	EDAD	6905	6905	6000	Doc Poeminar II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.913147	2025-11-20 22:15:02.913153
1189	EDAD 6910	EDAD	6910	6910	6000	Strategic Approaches Educ Admn		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.917216	2025-11-20 22:15:02.917221
1190	EDAD 6920	EDAD	6920	6920	6000	Org Theories in Educ Admin		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.921338	2025-11-20 22:15:02.921343
1191	EDAD 6930	EDAD	6930	6930	6000	Leader Behavior in Educ Admin		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.925475	2025-11-20 22:15:02.92548
1192	EDAD 6940	EDAD	6940	6940	6000	Power & Politics in Educ Admin		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.929641	2025-11-20 22:15:02.929647
1193	EDAD 6950	EDAD	6950	6950	6000	Educ Policy Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.933903	2025-11-20 22:15:02.933909
1194	EDAD 6960	EDAD	6960	6960	6000	Concept PK16+ Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.938349	2025-11-20 22:15:02.938355
1195	EDAD 6980	EDAD	6980	6980	6000	Independent Study Educ Admin		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.942846	2025-11-20 22:15:02.942852
1196	EDAD 6991	EDAD	6991	6991	6000	Selected Topics in Educ Adm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.947508	2025-11-20 22:15:02.947514
1197	EDAD 6992	EDAD	6992	6992	6000	Selected Topics in Educ Adm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.951719	2025-11-20 22:15:02.951725
1198	EDAD 6993	EDAD	6993	6993	6000	Selected Topics in Educ Adm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.955815	2025-11-20 22:15:02.955821
1199	EDAD 6997	EDAD	6997	6997	6000	Research Seminar in Educ Adm		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.959899	2025-11-20 22:15:02.959905
1200	EDAD 7040	EDAD	7040	7040	7000	Examination or Thesis Only		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.964013	2025-11-20 22:15:02.964019
1201	EDAD 7050	EDAD	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:02.968167	2025-11-20 22:15:02.968173
1202	ENEE 1530	ENEE	1530	1530	1000	Engineering Software Tools		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.972148	2025-11-20 22:15:02.972153
1203	ENEE 2500	ENEE	2500	2500	2000	Basic Electrical Circuits		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.977843	2025-11-20 22:15:02.977853
1204	ENEE 2510	ENEE	2510	2510	2000	Circuits Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.983435	2025-11-20 22:15:02.983444
1205	ENEE 2530	ENEE	2530	2530	2000	EE Software Tools		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.988731	2025-11-20 22:15:02.988739
1206	ENEE 2550	ENEE	2550	2550	2000	Circuits I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.994163	2025-11-20 22:15:02.994172
1207	ENEE 2551	ENEE	2551	2551	2000	Circuits II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:02.999236	2025-11-20 22:15:02.999243
1208	ENEE 2582	ENEE	2582	2582	2000	Digital System Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.00432	2025-11-20 22:15:03.004328
1209	ENEE 2586	ENEE	2586	2586	2000	Digital Systems Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.009121	2025-11-20 22:15:03.009148
1210	ENEE 3093	ENEE	3093	3093	3000	Ind Special Lab in Elec Eng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.013787	2025-11-20 22:15:03.013794
1211	ENEE 3094	ENEE	3094	3094	3000	Ind Special Lab in Elec Eng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.018364	2025-11-20 22:15:03.01837
1212	ENEE 3501	ENEE	3501	3501	3000	Basic Electrical Machinery		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.02303	2025-11-20 22:15:03.023037
1213	ENEE 3511	ENEE	3511	3511	3000	Energy Conversion Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.027626	2025-11-20 22:15:03.027632
1214	ENEE 3512	ENEE	3512	3512	3000	Microprocessor Design Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.03211	2025-11-20 22:15:03.032117
1215	ENEE 3514	ENEE	3514	3514	3000	Computer Architecture Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.03654	2025-11-20 22:15:03.036546
1216	ENEE 3517	ENEE	3517	3517	3000	Engr Electronics Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.040882	2025-11-20 22:15:03.040888
1217	ENEE 3518	ENEE	3518	3518	3000	Electrical Engr Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.045172	2025-11-20 22:15:03.045177
1218	ENEE 3521	ENEE	3521	3521	3000	Electric Machinery		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.049333	2025-11-20 22:15:03.049339
1219	ENEE 3522	ENEE	3522	3522	3000	Elec Power Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.053553	2025-11-20 22:15:03.053558
1220	ENEE 3530	ENEE	3530	3530	3000	Cont & Discrete Sig Syst Analy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.057776	2025-11-20 22:15:03.057782
1221	ENEE 3533	ENEE	3533	3533	3000	Classical Control Sys Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.062063	2025-11-20 22:15:03.062069
1222	ENEE 3535	ENEE	3535	3535	3000	Communication System Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.066306	2025-11-20 22:15:03.066312
1223	ENEE 3540	ENEE	3540	3540	3000	Engineering Electronics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.070386	2025-11-20 22:15:03.070392
1224	ENEE 3543	ENEE	3543	3543	3000	Engineering Electronic Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.074369	2025-11-20 22:15:03.074375
1225	ENEE 3560	ENEE	3560	3560	3000	Engineering Electromagnetics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.078523	2025-11-20 22:15:03.078528
1226	ENEE 3571	ENEE	3571	3571	3000	Cloud Technology Foundations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.082366	2025-11-20 22:15:03.082371
1227	ENEE 3572	ENEE	3572	3572	3000	Prob Meth Signal Sys Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.086385	2025-11-20 22:15:03.086391
1228	ENEE 3574	ENEE	3574	3574	3000	Communication Sys Design Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.09024	2025-11-20 22:15:03.090245
1229	ENEE 3582	ENEE	3582	3582	3000	Digital Design Using Micros		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.09421	2025-11-20 22:15:03.094216
1230	ENEE 3583	ENEE	3583	3583	3000	Computer System Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.098247	2025-11-20 22:15:03.098253
1231	ENEE 3587	ENEE	3587	3587	3000	Microcontroller Interfacing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.102337	2025-11-20 22:15:03.102343
1232	ENEE 3900	ENEE	3900	3900	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:03.106372	2025-11-20 22:15:03.106378
1233	ENEE 4091	ENEE	4091	4091	4000	Senior Elec Eng Design Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.110419	2025-11-20 22:15:03.110424
1234	ENEE 4092	ENEE	4092	4092	4000	Senior Elec Eng Design Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.11433	2025-11-20 22:15:03.114337
1235	ENEE 4096	ENEE	4096	4096	4000	Undergraduate Ind Study		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.118303	2025-11-20 22:15:03.118308
1236	ENEE 4097	ENEE	4097	4097	4000	Spec Topic in Elec Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.122161	2025-11-20 22:15:03.122166
1237	ENEE 4130	ENEE	4130	4130	4000	Wind Power Generation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.125997	2025-11-20 22:15:03.126002
1238	ENEE 4131	ENEE	4131	4131	4000	Rel Avail Mainten Engr System		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.129671	2025-11-20 22:15:03.129676
1239	ENEE 4522	ENEE	4522	4522	4000	Power System Planning & Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.133784	2025-11-20 22:15:03.13379
1240	ENEE 4524	ENEE	4524	4524	4000	Pwr Sys Dynam & Ctrl		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.137931	2025-11-20 22:15:03.137936
1241	ENEE 4526	ENEE	4526	4526	4000	Protective Relaying Power Syst		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.141759	2025-11-20 22:15:03.141764
1242	ENEE 4533	ENEE	4533	4533	4000	Digital Control System Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.145619	2025-11-20 22:15:03.145624
1243	ENEE 4534	ENEE	4534	4534	4000	Process Control Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.149551	2025-11-20 22:15:03.149557
1244	ENEE 4535	ENEE	4535	4535	4000	Intro Digital Signal Proccess		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.153471	2025-11-20 22:15:03.153476
1245	ENEE 4536	ENEE	4536	4536	4000	Embed Multimedia Sys		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.157428	2025-11-20 22:15:03.157434
1246	ENEE 4543	ENEE	4543	4543	4000	Powrlectronics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.161387	2025-11-20 22:15:03.161392
1247	ENEE 4544	ENEE	4544	4544	4000	Radio Frequency Circuit Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.16539	2025-11-20 22:15:03.165395
1248	ENEE 4554	ENEE	4554	4554	4000	Analog Digital Filter Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.169444	2025-11-20 22:15:03.169449
1249	ENEE 4562	ENEE	4562	4562	4000	Engineering Optics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.17342	2025-11-20 22:15:03.173425
1250	ENEE 4566	ENEE	4566	4566	4000	Intro Optical Networks		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.177169	2025-11-20 22:15:03.177174
1251	ENEE 4575	ENEE	4575	4575	4000	Data & Computer Communications		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.18104	2025-11-20 22:15:03.181046
1252	ENEE 4581	ENEE	4581	4581	4000	Introduction to Data Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.18504	2025-11-20 22:15:03.185046
1253	ENEE 4583	ENEE	4583	4583	4000	Deep Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.189026	2025-11-20 22:15:03.189032
1254	ENEE 4584	ENEE	4584	4584	4000	Computer Vision Applications in Deep Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.193004	2025-11-20 22:15:03.19301
1255	ENEE 4585	ENEE	4585	4585	4000	HDL Chip Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.196886	2025-11-20 22:15:03.196892
1256	ENEE 4595	ENEE	4595	4595	4000	Modern Wireless Comm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.200762	2025-11-20 22:15:03.200767
1257	ENEE 5097	ENEE	5097	5097	5000	Special Topics in Elec Eng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.204607	2025-11-20 22:15:03.204612
1258	ENEE 5130	ENEE	5130	5130	5000	Wind Power Generation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.208583	2025-11-20 22:15:03.208589
1259	ENEE 5131	ENEE	5131	5131	5000	Rel Avail Mainten Engr System		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.212546	2025-11-20 22:15:03.212552
1260	ENEE 5522	ENEE	5522	5522	5000	Power System Planning & Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.216579	2025-11-20 22:15:03.216586
1261	ENEE 5524	ENEE	5524	5524	5000	Pwr Sys Dynam & Ctrl		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.220678	2025-11-20 22:15:03.220683
1262	ENEE 5526	ENEE	5526	5526	5000	Protective Relaying Power Syst		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.22472	2025-11-20 22:15:03.224726
1263	ENEE 5534	ENEE	5534	5534	5000	Process Control Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.228702	2025-11-20 22:15:03.228707
1264	ENEE 5535	ENEE	5535	5535	5000	Intro Digital Signal Proccess		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.232727	2025-11-20 22:15:03.232732
1265	ENEE 5536	ENEE	5536	5536	5000	Embed Multimedia Sys		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.236679	2025-11-20 22:15:03.236685
1266	ENEE 5543	ENEE	5543	5543	5000	Powrlectronics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.240515	2025-11-20 22:15:03.24052
1267	ENEE 5544	ENEE	5544	5544	5000	Radio Frequency Circuit Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.244589	2025-11-20 22:15:03.244595
1268	ENEE 5554	ENEE	5554	5554	5000	Analog Digital Filter Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.24851	2025-11-20 22:15:03.248516
1269	ENEE 5562	ENEE	5562	5562	5000	Engineering Optics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.25249	2025-11-20 22:15:03.252496
1270	ENEE 5566	ENEE	5566	5566	5000	Intro Optical Networks		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.25655	2025-11-20 22:15:03.256556
1271	ENEE 5575	ENEE	5575	5575	5000	Data & Computer Communications		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.26059	2025-11-20 22:15:03.260595
1272	ENEE 5583	ENEE	5583	5583	5000	Deep Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.264699	2025-11-20 22:15:03.264704
1273	ENEE 5584	ENEE	5584	5584	5000	Computer Vision Applications in Deep Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.268685	2025-11-20 22:15:03.268691
1274	ENEE 5585	ENEE	5585	5585	5000	HDL Chip Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.272677	2025-11-20 22:15:03.272683
1275	ENEE 5595	ENEE	5595	5595	5000	Modern Wireless Comm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.27672	2025-11-20 22:15:03.276726
1276	ENEE 6001	ENEE	6001	6001	6000	Electrical Engr Grad Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:03.280539	2025-11-20 22:15:03.280545
1277	ENEE 6095	ENEE	6095	6095	6000	Ind Special Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.284979	2025-11-20 22:15:03.284985
1278	ENEE 6096	ENEE	6096	6096	6000	Adv Special Topics in Elec Eng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.289069	2025-11-20 22:15:03.289075
1279	ENEE 6097	ENEE	6097	6097	6000	Advanced Spec Topic		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.293202	2025-11-20 22:15:03.293208
1280	ENEE 6098	ENEE	6098	6098	6000	Advanced Spec Topic		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.297488	2025-11-20 22:15:03.297494
1281	ENEE 6522	ENEE	6522	6522	6000	Computrided Analysis of Large Power Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.301535	2025-11-20 22:15:03.30154
1282	ENEE 6523	ENEE	6523	6523	6000	Elec Machines and Drives		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.305606	2025-11-20 22:15:03.305612
1283	ENEE 6525	ENEE	6525	6525	6000	Optim Contol Meth Pwr Sys Oper		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.309586	2025-11-20 22:15:03.309592
1284	ENEE 6530	ENEE	6530	6530	6000	Linear Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.313589	2025-11-20 22:15:03.313595
1285	ENEE 6533	ENEE	6533	6533	6000	Adv Rand Var & Stoch Processes		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.317497	2025-11-20 22:15:03.317503
1286	ENEE 6538	ENEE	6538	6538	6000	Signal Detection		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.321325	2025-11-20 22:15:03.321331
1287	ENEE 6564	ENEE	6564	6564	6000	Polarization Optics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.325346	2025-11-20 22:15:03.325351
1288	ENEE 6565	ENEE	6565	6565	6000	Introduction to Lasers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.329044	2025-11-20 22:15:03.329049
1289	ENEE 6570	ENEE	6570	6570	6000	Optimization Technique in Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.333041	2025-11-20 22:15:03.333047
1290	ENEE 6581	ENEE	6581	6581	6000	Digital Image Process		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.337257	2025-11-20 22:15:03.337262
1291	ENEE 6582	ENEE	6582	6582	6000	Computer Vision		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.341486	2025-11-20 22:15:03.341491
1292	ENEE 6583	ENEE	6583	6583	6000	Neural Networks		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.345758	2025-11-20 22:15:03.345764
1293	ENEE 6585	ENEE	6585	6585	6000	Wireless Sensor Networks		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.349693	2025-11-20 22:15:03.349698
1294	ENGR 1000	ENGR	1000	1000	1000	Introduction to Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.353727	2025-11-20 22:15:03.353733
1295	ENGR 3090	ENGR	3090	3090	3000	Senior Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:03.357699	2025-11-20 22:15:03.357705
1296	ENGR 7000	ENGR	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:03.361823	2025-11-20 22:15:03.36183
1297	ENGR 7040	ENGR	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.365974	2025-11-20 22:15:03.36598
1298	ENAS 7025	ENAS	7025	7025	7000	Eng & Appl Sci Research Sem		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:03.370124	2025-11-20 22:15:03.370148
1299	ENAS 7040	ENAS	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.37437	2025-11-20 22:15:03.374375
1300	ENAS 7050	ENAS	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:03.378602	2025-11-20 22:15:03.378607
1301	ENMG 4471	ENMG	4471	4471	4000	Quality Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.382782	2025-11-20 22:15:03.382788
1302	ENMG 5471	ENMG	5471	5471	5000	Quality Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.386634	2025-11-20 22:15:03.386639
1303	ENMG 6095	ENMG	6095	6095	6000	Ind Capstone Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.390642	2025-11-20 22:15:03.390648
1304	ENMG 6096	ENMG	6096	6096	6000	Independent Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.394554	2025-11-20 22:15:03.39459
1305	ENMG 6097	ENMG	6097	6097	6000	Spec Topics in Engr Mgmt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.398781	2025-11-20 22:15:03.398787
1306	ENMG 6101	ENMG	6101	6101	6000	Engineering Management 1		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.402849	2025-11-20 22:15:03.402855
1307	ENMG 6102	ENMG	6102	6102	6000	Engineering Management II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.406804	2025-11-20 22:15:03.40681
1308	ENMG 6103	ENMG	6103	6103	6000	Technology Entrepreneurship		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.410812	2025-11-20 22:15:03.410818
1309	ENMG 6111	ENMG	6111	6111	6000	Quant Analysis Engr Mgmt I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.41477	2025-11-20 22:15:03.414775
1310	ENMG 6112	ENMG	6112	6112	6000	Quant Analysis Engr Mgmt II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.418816	2025-11-20 22:15:03.418821
1311	ENMG 6120	ENMG	6120	6120	6000	Project Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.422931	2025-11-20 22:15:03.422936
1312	ENMG 6150	ENMG	6150	6150	6000	Systems Analysis for Mgmt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.426866	2025-11-20 22:15:03.426872
1313	ENMG 6160	ENMG	6160	6160	6000	Innovation Concepts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.430869	2025-11-20 22:15:03.430875
1314	ENMG 6401	ENMG	6401	6401	6000	Sem Organizational Behavior		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.434842	2025-11-20 22:15:03.434848
1315	ENMG 7000	ENMG	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:03.438872	2025-11-20 22:15:03.438878
1316	ENMG 7040	ENMG	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.442818	2025-11-20 22:15:03.442823
1317	ENGL 100	ENGL	100	100	1000	Intensive Engl Intl		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.446786	2025-11-20 22:15:03.446792
1318	ENGL 1001	ENGL	1001	1001	1000	English Composition Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.450903	2025-11-20 22:15:03.450908
1319	ENGL 1002	ENGL	1002	1002	1000	ENGL Nnative		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.454783	2025-11-20 22:15:03.454788
1320	ENGL 1003	ENGL	1003	1003	1000	English Comp Supplement		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.458655	2025-11-20 22:15:03.45866
1321	ENGL 1004	ENGL	1004	1004	1000	Engl Supplemental Support I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.46266	2025-11-20 22:15:03.462665
1322	ENGL 1157	ENGL	1157	1157	1000	English Composition 1		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.4667	2025-11-20 22:15:03.466705
1323	ENGL 1158	ENGL	1158	1158	1000	English Composition 2		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.470863	2025-11-20 22:15:03.470869
1324	ENGL 1159	ENGL	1159	1159	1000	English Composition 2 Honors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.475003	2025-11-20 22:15:03.475008
1325	ENGL 2031	ENGL	2031	2031	2000	Surv Am Lit before Civil War		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.478961	2025-11-20 22:15:03.478966
1326	ENGL 2032	ENGL	2032	2032	2000	Surv of Am Lit after Civil War		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.48299	2025-11-20 22:15:03.482995
1327	ENGL 2041	ENGL	2041	2041	2000	Major American Writers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.486958	2025-11-20 22:15:03.486964
1328	ENGL 2043	ENGL	2043	2043	2000	New Orleans Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.490614	2025-11-20 22:15:03.49062
1329	ENGL 2071	ENGL	2071	2071	2000	Afomerican Literature I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.49463	2025-11-20 22:15:03.494635
1330	ENGL 2072	ENGL	2072	2072	2000	Afomerican Literature II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.498339	2025-11-20 22:15:03.498345
1331	ENGL 2090	ENGL	2090	2090	2000	Special Studies Lit & Language		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.502375	2025-11-20 22:15:03.502381
1332	ENGL 2091	ENGL	2091	2091	2000	Spec Studies in Lit Diversity		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.506392	2025-11-20 22:15:03.506397
1333	ENGL 2151	ENGL	2151	2151	2000	Intro Nnictional Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.510442	2025-11-20 22:15:03.510447
1334	ENGL 2152	ENGL	2152	2152	2000	Technical Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.514424	2025-11-20 22:15:03.51443
1335	ENGL 2154	ENGL	2154	2154	2000	Intro Creative Writing Nonfic		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.518527	2025-11-20 22:15:03.518533
1336	ENGL 2155	ENGL	2155	2155	2000	Intro to Professional Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.522636	2025-11-20 22:15:03.522641
1337	ENGL 2160	ENGL	2160	2160	2000	Intro Creative Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.526628	2025-11-20 22:15:03.526633
1338	ENGL 2161	ENGL	2161	2161	2000	Introduction to Writing Fict		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.530523	2025-11-20 22:15:03.530529
1339	ENGL 2163	ENGL	2163	2163	2000	Intro to Creative Writ Poetry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.534658	2025-11-20 22:15:03.534663
1340	ENGL 2200	ENGL	2200	2200	2000	Introduction to Playwriting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.538709	2025-11-20 22:15:03.538715
1341	ENGL 2208	ENGL	2208	2208	2000	Reading Drama		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.542674	2025-11-20 22:15:03.542679
1342	ENGL 2218	ENGL	2218	2218	2000	Reading Creative Nonfiction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.546843	2025-11-20 22:15:03.546849
1343	ENGL 2228	ENGL	2228	2228	2000	Reading Poetry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.551108	2025-11-20 22:15:03.551114
1344	ENGL 2238	ENGL	2238	2238	2000	Reading Fiction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.555047	2025-11-20 22:15:03.555052
1345	ENGL 2258	ENGL	2258	2258	2000	Interpreting Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.559053	2025-11-20 22:15:03.559058
1346	ENGL 2279	ENGL	2279	2279	2000	Literature of Ancient Greece		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.562872	2025-11-20 22:15:03.562877
1347	ENGL 2311	ENGL	2311	2311	2000	American Film as Literary Art		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.566827	2025-11-20 22:15:03.566832
1348	ENGL 2312	ENGL	2312	2312	2000	International Film As Lit Art		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.570698	2025-11-20 22:15:03.570704
1349	ENGL 2341	ENGL	2341	2341	2000	Survey British Literature I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.57467	2025-11-20 22:15:03.574676
1350	ENGL 2342	ENGL	2342	2342	2000	Survey British Literature II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.579044	2025-11-20 22:15:03.57905
1351	ENGL 2377	ENGL	2377	2377	2000	Bible As Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.583046	2025-11-20 22:15:03.583051
1352	ENGL 2378	ENGL	2378	2378	2000	Intro to Women�s Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.587001	2025-11-20 22:15:03.587007
1353	ENGL 2392	ENGL	2392	2392	2000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.590947	2025-11-20 22:15:03.590952
1354	ENGL 2521	ENGL	2521	2521	2000	Intro to Shakespeare		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.594858	2025-11-20 22:15:03.594864
1355	ENGL 3381	ENGL	3381	3381	3000	Intro to Contemporary Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.59881	2025-11-20 22:15:03.598815
1356	ENGL 3382	ENGL	3382	3382	3000	Methods in Research & Writing		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:03.602641	2025-11-20 22:15:03.602646
1357	ENGL 3394	ENGL	3394	3394	3000	Seminar in English		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:03.606667	2025-11-20 22:15:03.606673
1358	ENGL 3399	ENGL	3399	3399	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:03.610687	2025-11-20 22:15:03.610692
1359	ENGL 4030	ENGL	4030	4030	4000	Colonial & Early Nat Amer Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.614797	2025-11-20 22:15:03.614802
1360	ENGL 4031	ENGL	4031	4031	4000	The American Renaissance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.618899	2025-11-20 22:15:03.618904
1361	ENGL 4032	ENGL	4032	4032	4000	American Realism & Naturalism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.623343	2025-11-20 22:15:03.623349
1362	ENGL 4033	ENGL	4033	4033	4000	American Modernism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.627392	2025-11-20 22:15:03.627397
1363	ENGL 4034	ENGL	4034	4034	4000	Contemporary Amer Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.631456	2025-11-20 22:15:03.631462
1364	ENGL 4043	ENGL	4043	4043	4000	New Orleans Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.635466	2025-11-20 22:15:03.635472
1365	ENGL 4045	ENGL	4045	4045	4000	Southern Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.639549	2025-11-20 22:15:03.639554
1366	ENGL 4070	ENGL	4070	4070	4000	Spec Top Women, Lit, Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.643742	2025-11-20 22:15:03.643748
1367	ENGL 4091	ENGL	4091	4091	4000	American Movements I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.647837	2025-11-20 22:15:03.647842
1368	ENGL 4092	ENGL	4092	4092	4000	American Movements II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.651876	2025-11-20 22:15:03.651883
1369	ENGL 4093	ENGL	4093	4093	4000	Studies in Black Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.656077	2025-11-20 22:15:03.656082
1370	ENGL 4152	ENGL	4152	4152	4000	Technical Editing and Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.660395	2025-11-20 22:15:03.660401
1371	ENGL 4154	ENGL	4154	4154	4000	Adv Creative Nonfic Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.664362	2025-11-20 22:15:03.664368
1372	ENGL 4155	ENGL	4155	4155	4000	Professional Editing & Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.668365	2025-11-20 22:15:03.668371
1373	ENGL 4156	ENGL	4156	4156	4000	Environmental Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.672296	2025-11-20 22:15:03.672302
1374	ENGL 4158	ENGL	4158	4158	4000	Legal Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.676235	2025-11-20 22:15:03.67624
1375	ENGL 4161	ENGL	4161	4161	4000	Advanced Fiction Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.680421	2025-11-20 22:15:03.680426
1376	ENGL 4163	ENGL	4163	4163	4000	Advanced Poetry Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.684626	2025-11-20 22:15:03.684634
1377	ENGL 4190	ENGL	4190	4190	4000	Spec Topics in Prof. Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.688603	2025-11-20 22:15:03.688608
1378	ENGL 4200	ENGL	4200	4200	4000	Advanced Playwriting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.69292	2025-11-20 22:15:03.692926
1379	ENGL 4231	ENGL	4231	4231	4000	Literary Criticism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.696883	2025-11-20 22:15:03.696889
1380	ENGL 4240	ENGL	4240	4240	4000	Young Adult Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.700961	2025-11-20 22:15:03.700967
1381	ENGL 4378	ENGL	4378	4378	4000	Adv Studies in Women & Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.705002	2025-11-20 22:15:03.705008
1382	ENGL 4380	ENGL	4380	4380	4000	Studies in Irish Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.708942	2025-11-20 22:15:03.708948
1383	ENGL 4391	ENGL	4391	4391	4000	Special Topics Language & Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.712813	2025-11-20 22:15:03.712818
1384	ENGL 4392	ENGL	4392	4392	4000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:03.716805	2025-11-20 22:15:03.716811
1385	ENGL 4398	ENGL	4398	4398	4000	Internship in English		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:03.720737	2025-11-20 22:15:03.720742
1386	ENGL 4401	ENGL	4401	4401	4000	Lit England Later Middle Ages		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.72464	2025-11-20 22:15:03.724646
1387	ENGL 4421	ENGL	4421	4421	4000	Chaucer		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.728502	2025-11-20 22:15:03.728507
1388	ENGL 4521	ENGL	4521	4521	4000	Shakespeare		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.732263	2025-11-20 22:15:03.732268
1389	ENGL 4522	ENGL	4522	4522	4000	Shakespeare		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.736115	2025-11-20 22:15:03.736121
1390	ENGL 4601	ENGL	4601	4601	4000	English Literature of 17 Cent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.740268	2025-11-20 22:15:03.740274
1391	ENGL 4616	ENGL	4616	4616	4000	Drama of Shakespearean Age		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.744241	2025-11-20 22:15:03.744247
1392	ENGL 4621	ENGL	4621	4621	4000	Milton		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.748339	2025-11-20 22:15:03.748345
1393	ENGL 4701	ENGL	4701	4701	4000	Early 18th Century Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.752379	2025-11-20 22:15:03.752385
1394	ENGL 4702	ENGL	4702	4702	4000	Later 18th Century Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.756519	2025-11-20 22:15:03.756524
1395	ENGL 4715	ENGL	4715	4715	4000	18th Century English Novel		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.760466	2025-11-20 22:15:03.760472
1396	ENGL 4801	ENGL	4801	4801	4000	Prose Poetry Romantic Period		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.764432	2025-11-20 22:15:03.764438
1397	ENGL 4802	ENGL	4802	4802	4000	Later Romantic Writers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.768405	2025-11-20 22:15:03.768411
1398	ENGL 4807	ENGL	4807	4807	4000	Earlier Victorian Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.772363	2025-11-20 22:15:03.772368
1399	ENGL 4808	ENGL	4808	4808	4000	Later Victorian Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.776387	2025-11-20 22:15:03.776392
1400	ENGL 4815	ENGL	4815	4815	4000	19th Century English Novel		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.780408	2025-11-20 22:15:03.780414
1401	ENGL 4913	ENGL	4913	4913	4000	Early 20th Century Poetry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.784469	2025-11-20 22:15:03.784475
1402	ENGL 4915	ENGL	4915	4915	4000	The Modern Novel		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.788533	2025-11-20 22:15:03.788538
1403	ENGL 4916	ENGL	4916	4916	4000	20th Century Drama		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.792499	2025-11-20 22:15:03.792505
1404	ENGL 4917	ENGL	4917	4917	4000	The Contemporary Novel		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.795483	2025-11-20 22:15:03.795489
1405	ENGL 4918	ENGL	4918	4918	4000	Creative Nonfiction Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.799241	2025-11-20 22:15:03.799247
1406	ENGL 5030	ENGL	5030	5030	5000	Colonial & Early Nat Amer Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.803113	2025-11-20 22:15:03.803118
1407	ENGL 5031	ENGL	5031	5031	5000	The American Renaissance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.806833	2025-11-20 22:15:03.806839
1408	ENGL 5032	ENGL	5032	5032	5000	American Realism & Naturalism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.810222	2025-11-20 22:15:03.810229
1409	ENGL 5033	ENGL	5033	5033	5000	American Modernism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.814078	2025-11-20 22:15:03.814084
1410	ENGL 5034	ENGL	5034	5034	5000	Contemporary Amer Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.817884	2025-11-20 22:15:03.817889
1411	ENGL 5043	ENGL	5043	5043	5000	New Orleans Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.821596	2025-11-20 22:15:03.821601
1412	ENGL 5045	ENGL	5045	5045	5000	Southern Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.825179	2025-11-20 22:15:03.825184
1413	ENGL 5070	ENGL	5070	5070	5000	Spec Top Women, Lit, Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.828748	2025-11-20 22:15:03.828753
1414	ENGL 5091	ENGL	5091	5091	5000	American Movements I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.832419	2025-11-20 22:15:03.832424
1415	ENGL 5092	ENGL	5092	5092	5000	American Movements II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.836094	2025-11-20 22:15:03.836099
1416	ENGL 5093	ENGL	5093	5093	5000	Studies in Black Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.839744	2025-11-20 22:15:03.839749
1417	ENGL 5152	ENGL	5152	5152	5000	Technical Editing and Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.843454	2025-11-20 22:15:03.843461
1418	ENGL 5154	ENGL	5154	5154	5000	Adv Creative Nonfic Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.84717	2025-11-20 22:15:03.847175
1419	ENGL 5155	ENGL	5155	5155	5000	Professional Editing & Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.852253	2025-11-20 22:15:03.852263
1420	ENGL 5156	ENGL	5156	5156	5000	Environmental Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.857896	2025-11-20 22:15:03.857906
1421	ENGL 5158	ENGL	5158	5158	5000	Legal Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.863035	2025-11-20 22:15:03.863043
1422	ENGL 5161	ENGL	5161	5161	5000	Advanced Fiction Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.868788	2025-11-20 22:15:03.868796
1423	ENGL 5163	ENGL	5163	5163	5000	Advanced Poetry Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.873465	2025-11-20 22:15:03.873472
1424	ENGL 5190	ENGL	5190	5190	5000	Spec Topics in Prof. Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.878095	2025-11-20 22:15:03.878102
1425	ENGL 5240	ENGL	5240	5240	5000	Young Adult Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.882893	2025-11-20 22:15:03.882899
1426	ENGL 5378	ENGL	5378	5378	5000	Adv Studies in Women & Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.887366	2025-11-20 22:15:03.887373
1427	ENGL 5380	ENGL	5380	5380	5000	Studies in Irish Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.891785	2025-11-20 22:15:03.89179
1428	ENGL 5391	ENGL	5391	5391	5000	Special Topics Language & Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.896109	2025-11-20 22:15:03.896115
1429	ENGL 5401	ENGL	5401	5401	5000	Lit England Later Middle Ages		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.900503	2025-11-20 22:15:03.90051
1430	ENGL 5421	ENGL	5421	5421	5000	Chaucer		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.904751	2025-11-20 22:15:03.904757
1431	ENGL 5521	ENGL	5521	5521	5000	Shakespeare		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.908856	2025-11-20 22:15:03.908862
1432	ENGL 5522	ENGL	5522	5522	5000	Shakespeare		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.912964	2025-11-20 22:15:03.91297
1433	ENGL 5601	ENGL	5601	5601	5000	English Literature of 17 Cent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.917312	2025-11-20 22:15:03.917318
1434	ENGL 5616	ENGL	5616	5616	5000	Drama of Shakespearean Age		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.921518	2025-11-20 22:15:03.921524
1435	ENGL 5621	ENGL	5621	5621	5000	Milton		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.925766	2025-11-20 22:15:03.925772
1436	ENGL 5701	ENGL	5701	5701	5000	Early 18th Century Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.930157	2025-11-20 22:15:03.930163
1437	ENGL 5702	ENGL	5702	5702	5000	Later 18th Century Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.934388	2025-11-20 22:15:03.934394
1438	ENGL 5715	ENGL	5715	5715	5000	18th Century English Novel		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.938503	2025-11-20 22:15:03.938508
1439	ENGL 5801	ENGL	5801	5801	5000	Prose Poetry Romantic Period		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.942745	2025-11-20 22:15:03.942751
1440	ENGL 5802	ENGL	5802	5802	5000	Later Romantic Writers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.946989	2025-11-20 22:15:03.946995
1441	ENGL 5807	ENGL	5807	5807	5000	Earlier Victorian Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.951317	2025-11-20 22:15:03.951323
1442	ENGL 5808	ENGL	5808	5808	5000	Later Victorian Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.955498	2025-11-20 22:15:03.955503
1443	ENGL 5815	ENGL	5815	5815	5000	19th Century English Novel		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.959721	2025-11-20 22:15:03.959727
1444	ENGL 5913	ENGL	5913	5913	5000	Early 20th Century Poetry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.96385	2025-11-20 22:15:03.963856
1445	ENGL 5915	ENGL	5915	5915	5000	The Modern Novel		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.968896	2025-11-20 22:15:03.968905
1446	ENGL 5916	ENGL	5916	5916	5000	20th Century Drama		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.974716	2025-11-20 22:15:03.974725
1447	ENGL 5917	ENGL	5917	5917	5000	The Contemporary Novel		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.980533	2025-11-20 22:15:03.980542
1448	ENGL 5918	ENGL	5918	5918	5000	Creative Nonfiction Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.985858	2025-11-20 22:15:03.985866
1449	ENGL 6001	ENGL	6001	6001	6000	Studies in Am Lit Before 1865		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.991236	2025-11-20 22:15:03.991245
1450	ENGL 6007	ENGL	6007	6007	6000	Studies in Am Lit Since 1865		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:03.996518	2025-11-20 22:15:03.996526
1451	ENGL 6090	ENGL	6090	6090	6000	Spec Studies in American Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.001651	2025-11-20 22:15:04.001658
1452	ENGL 6151	ENGL	6151	6151	6000	Writing Institute		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.006301	2025-11-20 22:15:04.006308
1453	ENGL 6153	ENGL	6153	6153	6000	UNO Publishing Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.01116	2025-11-20 22:15:04.011168
1454	ENGL 6154	ENGL	6154	6154	6000	Nniction Writing Workshop		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.015748	2025-11-20 22:15:04.015755
1455	ENGL 6155	ENGL	6155	6155	6000	Profess Writing & Editing Prac		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.020116	2025-11-20 22:15:04.020122
1456	ENGL 6156	ENGL	6156	6156	6000	Writing in Process		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.024481	2025-11-20 22:15:04.024487
1457	ENGL 6161	ENGL	6161	6161	6000	Writing Fiction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.028884	2025-11-20 22:15:04.028891
1458	ENGL 6163	ENGL	6163	6163	6000	Writing Poetry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.03324	2025-11-20 22:15:04.033246
1459	ENGL 6171	ENGL	6171	6171	6000	Intensive Fiction Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.037432	2025-11-20 22:15:04.037439
1460	ENGL 6173	ENGL	6173	6173	6000	Intensive Poetry Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.041897	2025-11-20 22:15:04.041903
1461	ENGL 6174	ENGL	6174	6174	6000	Inten Nnic Writing Workshop		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.046081	2025-11-20 22:15:04.046086
1462	ENGL 6190	ENGL	6190	6190	6000	Special Topics in Creative Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.050324	2025-11-20 22:15:04.05033
1463	ENGL 6191	ENGL	6191	6191	6000	Remote Fiction Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.054536	2025-11-20 22:15:04.054542
1464	ENGL 6193	ENGL	6193	6193	6000	Remote Poetry Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.058893	2025-11-20 22:15:04.058899
1465	ENGL 6194	ENGL	6194	6194	6000	Remote Nnic Writing Wkshp		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.063097	2025-11-20 22:15:04.063103
1466	ENGL 6198	ENGL	6198	6198	6000	Writers at Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.067344	2025-11-20 22:15:04.067349
1467	ENGL 6200	ENGL	6200	6200	6000	Seminar in Playwriting		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:04.071592	2025-11-20 22:15:04.071597
1468	ENGL 6230	ENGL	6230	6230	6000	Premodern Sources of Engl Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.07569	2025-11-20 22:15:04.075696
1469	ENGL 6231	ENGL	6231	6231	6000	Literary Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.079748	2025-11-20 22:15:04.079753
1470	ENGL 6232	ENGL	6232	6232	6000	Studies in Rhetoric and Compos		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.083844	2025-11-20 22:15:04.08385
1471	ENGL 6240	ENGL	6240	6240	6000	Nonfiction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.087769	2025-11-20 22:15:04.087775
1472	ENGL 6243	ENGL	6243	6243	6000	Poetry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.091918	2025-11-20 22:15:04.091924
1473	ENGL 6245	ENGL	6245	6245	6000	The Novel		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.095833	2025-11-20 22:15:04.095838
1474	ENGL 6246	ENGL	6246	6246	6000	Drama		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.099848	2025-11-20 22:15:04.099853
1475	ENGL 6247	ENGL	6247	6247	6000	The Short Story		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.10384	2025-11-20 22:15:04.103845
1476	ENGL 6280	ENGL	6280	6280	6000	Intro Grad Studies in English		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.107836	2025-11-20 22:15:04.107842
1477	ENGL 6281	ENGL	6281	6281	6000	Intr to Composition Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.111834	2025-11-20 22:15:04.111839
1478	ENGL 6282	ENGL	6282	6282	6000	Composition Pedagogy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.115831	2025-11-20 22:15:04.115837
1479	ENGL 6370	ENGL	6370	6370	6000	Studies in Comparative Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.119937	2025-11-20 22:15:04.119943
1480	ENGL 6390	ENGL	6390	6390	6000	Spec Studies in Language & Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.123848	2025-11-20 22:15:04.123854
1481	ENGL 6397	ENGL	6397	6397	6000	Directed Study		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.12782	2025-11-20 22:15:04.127825
1482	ENGL 6398	ENGL	6398	6398	6000	Internship in English		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.13184	2025-11-20 22:15:04.131846
1483	ENGL 6400	ENGL	6400	6400	6000	Studies Engl Lit Before 1500		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.135847	2025-11-20 22:15:04.135852
1484	ENGL 6500	ENGL	6500	6500	6000	Studies in Engl Lit 16th Cent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.13985	2025-11-20 22:15:04.139855
1485	ENGL 6520	ENGL	6520	6520	6000	Studies in Shakespeare		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.143817	2025-11-20 22:15:04.143822
1486	ENGL 6700	ENGL	6700	6700	6000	Studies in Engl Lit 18th Cent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.147791	2025-11-20 22:15:04.147796
1487	ENGL 6801	ENGL	6801	6801	6000	Studies in the Romantic Period		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.151773	2025-11-20 22:15:04.151778
1488	ENGL 6807	ENGL	6807	6807	6000	Studies in Victorian Period		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.155361	2025-11-20 22:15:04.155367
1489	ENGL 6900	ENGL	6900	6900	6000	Studies Engl Lit 20th Century		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.158867	2025-11-20 22:15:04.158872
1490	ENGL 6941	ENGL	6941	6941	6000	The Craft of Fiction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.16244	2025-11-20 22:15:04.162445
1491	ENGL 6943	ENGL	6943	6943	6000	The Craft of Poetry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.166067	2025-11-20 22:15:04.166071
1492	ENGL 6944	ENGL	6944	6944	6000	The Craft of Nonfiction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.169793	2025-11-20 22:15:04.169798
1493	ENGL 6946	ENGL	6946	6946	6000	The Craft of Drama		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.173612	2025-11-20 22:15:04.173617
1494	ENGL 7000	ENGL	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.1774	2025-11-20 22:15:04.177405
1495	ENGL 7040	ENGL	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.181587	2025-11-20 22:15:04.181592
1496	FTA 1000	FTA	1000	1000	1000	Theatre Appreciation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.185495	2025-11-20 22:15:04.1855
1497	FTA 1001	FTA	1001	1001	1000	Film Appreciation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.189532	2025-11-20 22:15:04.189537
1498	FTA 1005	FTA	1005	1005	1000	Introduction to Theatre Arts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.193596	2025-11-20 22:15:04.193602
1499	FTA 1100	FTA	1100	1100	1000	Methods & Matrls of Stagecraft		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.197445	2025-11-20 22:15:04.197451
1500	FTA 1110	FTA	1110	1110	1000	Basic Visual Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.201281	2025-11-20 22:15:04.201287
1501	FTA 1300	FTA	1300	1300	1000	ActingIeginning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.205231	2025-11-20 22:15:04.205236
1502	FTA 1310	FTA	1310	1310	1000	Stage Makeup		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.209223	2025-11-20 22:15:04.209229
1503	FTA 1620	FTA	1620	1620	1000	Intro to Film Arts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.213107	2025-11-20 22:15:04.213112
1504	FTA 1665	FTA	1665	1665	1000	Beginning Film Postproduction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.217099	2025-11-20 22:15:04.217104
1505	FTA 1800	FTA	1800	1800	1000	Theatre Practicum I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.221062	2025-11-20 22:15:04.221068
1506	FTA 2000	FTA	2000	2000	2000	Field Research in Arts		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.225014	2025-11-20 22:15:04.225019
1507	FTA 2060	FTA	2060	2060	2000	3D Animation Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.229356	2025-11-20 22:15:04.229362
1508	FTA 2090	FTA	2090	2090	2000	Special Topic ilm & Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.233425	2025-11-20 22:15:04.233431
1509	FTA 2091	FTA	2091	2091	2000	Special Topic ilm & Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.237467	2025-11-20 22:15:04.237472
1510	FTA 2092	FTA	2092	2092	2000	Special Topic ilm & Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.24152	2025-11-20 22:15:04.241525
1511	FTA 2100	FTA	2100	2100	2000	Intro to Lighting Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.245517	2025-11-20 22:15:04.245522
1512	FTA 2110	FTA	2110	2110	2000	Introduction to Scenic Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.249649	2025-11-20 22:15:04.249654
1513	FTA 2160	FTA	2160	2160	2000	Costume Crafts & Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.253653	2025-11-20 22:15:04.253659
1514	FTA 2200	FTA	2200	2200	2000	Introduction to Playwriting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.257692	2025-11-20 22:15:04.257698
1515	FTA 2250	FTA	2250	2250	2000	Intro. to Screenwriting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.261682	2025-11-20 22:15:04.261687
1516	FTA 2260	FTA	2260	2260	2000	Writing Short Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.265682	2025-11-20 22:15:04.265688
1517	FTA 2270	FTA	2270	2270	2000	Introduction to Video Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.269658	2025-11-20 22:15:04.269664
1518	FTA 2320	FTA	2320	2320	2000	Script Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.273597	2025-11-20 22:15:04.273602
1519	FTA 2330	FTA	2330	2330	2000	Acting II Intermediate		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.2776	2025-11-20 22:15:04.277606
1520	FTA 2380	FTA	2380	2380	2000	Stage Directing  Beginning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.281414	2025-11-20 22:15:04.281419
1521	FTA 2510	FTA	2510	2510	2000	Beginning Film Prod		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.284924	2025-11-20 22:15:04.28493
1522	FTA 2570	FTA	2570	2570	2000	Beginning Film Acting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.288725	2025-11-20 22:15:04.28873
1523	FTA 2650	FTA	2650	2650	2000	Oral Communications		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.292624	2025-11-20 22:15:04.292629
1524	FTA 2950	FTA	2950	2950	2000	Stage Management Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.296481	2025-11-20 22:15:04.296486
1525	FTA 3060	FTA	3060	3060	3000	Intermed 3D Animation Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.300512	2025-11-20 22:15:04.300517
1526	FTA 3090	FTA	3090	3090	3000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.304918	2025-11-20 22:15:04.304924
1527	FTA 3099	FTA	3099	3099	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.308809	2025-11-20 22:15:04.308814
1528	FTA 3400	FTA	3400	3400	3000	Cul Diversity Film & Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.312751	2025-11-20 22:15:04.312756
1529	FTA 3460	FTA	3460	3460	3000	Intro Documentary		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.31668	2025-11-20 22:15:04.316686
1530	FTA 3510	FTA	3510	3510	3000	Intermediate Film Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.320839	2025-11-20 22:15:04.320844
1531	FTA 3511	FTA	3511	3511	3000	Equipment Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.325005	2025-11-20 22:15:04.32501
1532	FTA 3520	FTA	3520	3520	3000	Interm Film Post Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.32896	2025-11-20 22:15:04.328966
1533	FTA 3800	FTA	3800	3800	3000	Production Practicum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.33306	2025-11-20 22:15:04.333065
1534	FTA 4080	FTA	4080	4080	4000	Adv Summer Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.337231	2025-11-20 22:15:04.337237
1535	FTA 4081	FTA	4081	4081	4000	Adv Summer Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.341255	2025-11-20 22:15:04.341261
1536	FTA 4090	FTA	4090	4090	4000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.345125	2025-11-20 22:15:04.345149
1537	FTA 4091	FTA	4091	4091	4000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.349153	2025-11-20 22:15:04.349158
1538	FTA 4092	FTA	4092	4092	4000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.353119	2025-11-20 22:15:04.353124
1539	FTA 4093	FTA	4093	4093	4000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.357185	2025-11-20 22:15:04.357191
1540	FTA 4094	FTA	4094	4094	4000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.361029	2025-11-20 22:15:04.361034
1541	FTA 4095	FTA	4095	4095	4000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.365291	2025-11-20 22:15:04.365297
1542	FTA 4096	FTA	4096	4096	4000	Special Topics FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.369386	2025-11-20 22:15:04.369392
1543	FTA 4097	FTA	4097	4097	4000	Film Workshop		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.373451	2025-11-20 22:15:04.373456
1544	FTA 4110	FTA	4110	4110	4000	Scene Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.377505	2025-11-20 22:15:04.37751
1545	FTA 4120	FTA	4120	4120	4000	Scene Painting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.38189	2025-11-20 22:15:04.381896
1546	FTA 4125	FTA	4125	4125	4000	Dev. of Style and Form		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.385393	2025-11-20 22:15:04.385398
1547	FTA 4135	FTA	4135	4135	4000	Rendering Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.389288	2025-11-20 22:15:04.389293
1548	FTA 4140	FTA	4140	4140	4000	Costume Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.393252	2025-11-20 22:15:04.393257
1549	FTA 4150	FTA	4150	4150	4000	Development of Fashion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.397226	2025-11-20 22:15:04.397231
1550	FTA 4160	FTA	4160	4160	4000	Lighting Crafts & Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.401008	2025-11-20 22:15:04.401013
1551	FTA 4170	FTA	4170	4170	4000	Lighting Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.404949	2025-11-20 22:15:04.404954
1552	FTA 4200	FTA	4200	4200	4000	Advanced Playwriting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.408757	2025-11-20 22:15:04.408762
1553	FTA 4251	FTA	4251	4251	4000	Advanced Screenwriting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.41251	2025-11-20 22:15:04.412515
1554	FTA 4300	FTA	4300	4300	4000	Advanced Voice for the Actor		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.416456	2025-11-20 22:15:04.416461
1555	FTA 4301	FTA	4301	4301	4000	Voice Stylization for Screen		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.420303	2025-11-20 22:15:04.420309
1556	FTA 4330	FTA	4330	4330	4000	Acting Styles		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.424179	2025-11-20 22:15:04.424185
1557	FTA 4333	FTA	4333	4333	4000	Combat Stage & Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.428035	2025-11-20 22:15:04.42804
1558	FTA 4335	FTA	4335	4335	4000	Audition Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.431813	2025-11-20 22:15:04.431819
1559	FTA 4345	FTA	4345	4345	4000	Digital Auditions		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.435721	2025-11-20 22:15:04.435727
1560	FTA 4380	FTA	4380	4380	4000	Stage Directing I Advanced		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.439701	2025-11-20 22:15:04.439707
1561	FTA 4400	FTA	4400	4400	4000	Development of Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.443699	2025-11-20 22:15:04.443704
1562	FTA 4450	FTA	4450	4450	4000	Modern Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.447675	2025-11-20 22:15:04.447681
1563	FTA 4455	FTA	4455	4455	4000	Contemporary Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.451597	2025-11-20 22:15:04.451602
1564	FTA 4460	FTA	4460	4460	4000	Adv Documentary Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.455442	2025-11-20 22:15:04.455447
1565	FTA 4500	FTA	4500	4500	4000	Film Development & Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.459333	2025-11-20 22:15:04.459338
1566	FTA 4530	FTA	4530	4530	4000	Adv Proj in Film Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.463193	2025-11-20 22:15:04.463199
1567	FTA 4540	FTA	4540	4540	4000	History of Cinema I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.466793	2025-11-20 22:15:04.466798
1568	FTA 4541	FTA	4541	4541	4000	History of Cinema II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.470703	2025-11-20 22:15:04.470708
1569	FTA 4542	FTA	4542	4542	4000	History of Documentary Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.47475	2025-11-20 22:15:04.474755
1570	FTA 4545	FTA	4545	4545	4000	Film Theory & Criticism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.478703	2025-11-20 22:15:04.478708
1571	FTA 4550	FTA	4550	4550	4000	Cinematography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.482778	2025-11-20 22:15:04.482783
1572	FTA 4551	FTA	4551	4551	4000	Spring Film Crew		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.486843	2025-11-20 22:15:04.486849
1573	FTA 4555	FTA	4555	4555	4000	Spring Film Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.490805	2025-11-20 22:15:04.49081
1574	FTA 4560	FTA	4560	4560	4000	Film Festivals		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.494829	2025-11-20 22:15:04.494835
1575	FTA 4565	FTA	4565	4565	4000	Digitl Theory Appl Film/Video		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.499067	2025-11-20 22:15:04.499073
1576	FTA 4566	FTA	4566	4566	4000	Sound I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.503045	2025-11-20 22:15:04.50305
1577	FTA 4567	FTA	4567	4567	4000	Sound II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.507009	2025-11-20 22:15:04.507015
1578	FTA 4568	FTA	4568	4568	4000	Special Topics Visual Effects		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.511027	2025-11-20 22:15:04.511032
1579	FTA 4570	FTA	4570	4570	4000	Advanced Film Acting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.515147	2025-11-20 22:15:04.515153
1580	FTA 4575	FTA	4575	4575	4000	Advanced Film Postproduction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.519348	2025-11-20 22:15:04.519354
1581	FTA 4580	FTA	4580	4580	4000	Film Directing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.523374	2025-11-20 22:15:04.52338
1582	FTA 4591	FTA	4591	4591	4000	Film Styles & Genres		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.527673	2025-11-20 22:15:04.527679
1583	FTA 4600	FTA	4600	4600	4000	Producing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.531687	2025-11-20 22:15:04.531693
1584	FTA 4750	FTA	4750	4750	4000	Survey of Cinematography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.535688	2025-11-20 22:15:04.535693
1585	FTA 4830	FTA	4830	4830	4000	Advanced Stage Movement		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.539536	2025-11-20 22:15:04.539541
1586	FTA 4900	FTA	4900	4900	4000	Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.543637	2025-11-20 22:15:04.543642
1587	FTA 5080	FTA	5080	5080	5000	Adv Summer Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.547643	2025-11-20 22:15:04.547649
1588	FTA 5081	FTA	5081	5081	5000	Adv Summer Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.551665	2025-11-20 22:15:04.55167
1589	FTA 5090	FTA	5090	5090	5000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.555694	2025-11-20 22:15:04.555699
1590	FTA 5091	FTA	5091	5091	5000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.559734	2025-11-20 22:15:04.55974
1591	FTA 5092	FTA	5092	5092	5000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.563704	2025-11-20 22:15:04.56371
1592	FTA 5093	FTA	5093	5093	5000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.567709	2025-11-20 22:15:04.567714
1593	FTA 5094	FTA	5094	5094	5000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.571837	2025-11-20 22:15:04.571843
1594	FTA 5095	FTA	5095	5095	5000	Special Topics in FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.576183	2025-11-20 22:15:04.576191
1595	FTA 5096	FTA	5096	5096	5000	Special Topics FT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.580304	2025-11-20 22:15:04.58031
1596	FTA 5110	FTA	5110	5110	5000	Scene Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.584259	2025-11-20 22:15:04.584264
1597	FTA 5120	FTA	5120	5120	5000	Scene Painting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.588274	2025-11-20 22:15:04.588279
1598	FTA 5125	FTA	5125	5125	5000	Dev. of Style and Form		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.592267	2025-11-20 22:15:04.592272
1599	FTA 5135	FTA	5135	5135	5000	Rendering Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.59622	2025-11-20 22:15:04.596226
1600	FTA 5140	FTA	5140	5140	5000	Costume Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.600112	2025-11-20 22:15:04.600117
1601	FTA 5150	FTA	5150	5150	5000	Development of Fashion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.603931	2025-11-20 22:15:04.603936
1602	FTA 5160	FTA	5160	5160	5000	Lighting Crafts & Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.60785	2025-11-20 22:15:04.607855
1603	FTA 5170	FTA	5170	5170	5000	Lighting Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.611529	2025-11-20 22:15:04.611535
1604	FTA 5200	FTA	5200	5200	5000	Advanced Playwriting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.615671	2025-11-20 22:15:04.615676
1605	FTA 5251	FTA	5251	5251	5000	Advanced Screenwriting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.620795	2025-11-20 22:15:04.620801
1606	FTA 5300	FTA	5300	5300	5000	Advanced Voice for the Actor		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.624771	2025-11-20 22:15:04.624776
1607	FTA 5301	FTA	5301	5301	5000	Voice Stylization for Screen		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.628723	2025-11-20 22:15:04.628728
1608	FTA 5330	FTA	5330	5330	5000	Acting Styles		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.632664	2025-11-20 22:15:04.63267
1609	FTA 5333	FTA	5333	5333	5000	Combat Stage & Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.636544	2025-11-20 22:15:04.636549
1610	FTA 5335	FTA	5335	5335	5000	Audition Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.640362	2025-11-20 22:15:04.640367
1611	FTA 5345	FTA	5345	5345	5000	Digital Auditions		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.643967	2025-11-20 22:15:04.643973
1612	FTA 5380	FTA	5380	5380	5000	Stage Directing I Advanced		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.647783	2025-11-20 22:15:04.647788
1613	FTA 5400	FTA	5400	5400	5000	Development of Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.651645	2025-11-20 22:15:04.65165
1614	FTA 5450	FTA	5450	5450	5000	Modern Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.655547	2025-11-20 22:15:04.655553
1615	FTA 5455	FTA	5455	5455	5000	Contemporary Theatre		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.659442	2025-11-20 22:15:04.659447
1616	FTA 5460	FTA	5460	5460	5000	Adv Documentary Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.663451	2025-11-20 22:15:04.663457
1617	FTA 5500	FTA	5500	5500	5000	Film Development & Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.667417	2025-11-20 22:15:04.667423
1618	FTA 5530	FTA	5530	5530	5000	Adv Proj in Film Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.671374	2025-11-20 22:15:04.67138
1619	FTA 5540	FTA	5540	5540	5000	History of Cinema I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.675416	2025-11-20 22:15:04.675421
1620	FTA 5541	FTA	5541	5541	5000	History of Cinema II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.679446	2025-11-20 22:15:04.679451
1621	FTA 5542	FTA	5542	5542	5000	History of Documentary Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.683515	2025-11-20 22:15:04.683521
1622	FTA 5545	FTA	5545	5545	5000	Film Theory & Criticism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.687981	2025-11-20 22:15:04.687989
1623	FTA 5550	FTA	5550	5550	5000	Cinematography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.691935	2025-11-20 22:15:04.691941
1624	FTA 5551	FTA	5551	5551	5000	Spring Film Crew		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.695819	2025-11-20 22:15:04.695824
1625	FTA 5555	FTA	5555	5555	5000	Spring Film Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.699706	2025-11-20 22:15:04.699711
1626	FTA 5560	FTA	5560	5560	5000	Film Festivals		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.703655	2025-11-20 22:15:04.70366
1627	FTA 5565	FTA	5565	5565	5000	Digitl Theory Appl Film/Video		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.707689	2025-11-20 22:15:04.707695
1628	FTA 5566	FTA	5566	5566	5000	Sound I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.711701	2025-11-20 22:15:04.711707
1629	FTA 5567	FTA	5567	5567	5000	Sound II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.715799	2025-11-20 22:15:04.715805
1630	FTA 5568	FTA	5568	5568	5000	Special Topics Visual Effects		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.719871	2025-11-20 22:15:04.719877
1631	FTA 5570	FTA	5570	5570	5000	Advanced Film Acting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.723997	2025-11-20 22:15:04.724003
1632	FTA 5575	FTA	5575	5575	5000	Advanced Film Postproduction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.728243	2025-11-20 22:15:04.728249
1633	FTA 5580	FTA	5580	5580	5000	Film Directing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.732386	2025-11-20 22:15:04.732392
1634	FTA 5591	FTA	5591	5591	5000	Film Styles & Genres		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.736431	2025-11-20 22:15:04.736437
1635	FTA 5600	FTA	5600	5600	5000	Producing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.740667	2025-11-20 22:15:04.740672
1636	FTA 5830	FTA	5830	5830	5000	Advanced Stage Movement		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.744675	2025-11-20 22:15:04.744681
1637	FTA 5900	FTA	5900	5900	5000	Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.748792	2025-11-20 22:15:04.748798
1638	FTA 6001	FTA	6001	6001	6000	Practicum in Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.752834	2025-11-20 22:15:04.752839
1639	FTA 6005	FTA	6005	6005	6000	Graduate Studies Orientation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.756738	2025-11-20 22:15:04.756744
1640	FTA 6020	FTA	6020	6020	6000	Form & Idea in Media		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.760986	2025-11-20 22:15:04.760992
1641	FTA 6040	FTA	6040	6040	6000	Performance and Direction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.764443	2025-11-20 22:15:04.764448
1642	FTA 6060	FTA	6060	6060	6000	Concept, Conflict & Character		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.76793	2025-11-20 22:15:04.767935
1643	FTA 6090	FTA	6090	6090	6000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.77131	2025-11-20 22:15:04.771316
1644	FTA 6150	FTA	6150	6150	6000	Development of Fashion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.774197	2025-11-20 22:15:04.774202
1645	FTA 6200	FTA	6200	6200	6000	Seminar in Playwriting		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:04.777308	2025-11-20 22:15:04.777313
1646	FTA 6207	FTA	6207	6207	6000	Intense Seminar Playwriting		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:04.780478	2025-11-20 22:15:04.780483
1647	FTA 6209	FTA	6209	6209	6000	Remote Seminar Playwriting		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:04.783029	2025-11-20 22:15:04.783034
1648	FTA 6220	FTA	6220	6220	6000	Screenwriting for Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.785346	2025-11-20 22:15:04.785351
1649	FTA 6240	FTA	6240	6240	6000	Writing the Thesis Script		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.787997	2025-11-20 22:15:04.788001
1650	FTA 6250	FTA	6250	6250	6000	Seminar in Screenwriting		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:04.790602	2025-11-20 22:15:04.790606
1651	FTA 6257	FTA	6257	6257	6000	Intense Seminar Screenwriting		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:04.792853	2025-11-20 22:15:04.792857
1652	FTA 6259	FTA	6259	6259	6000	Remote Seminar Screenwriting		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:04.794928	2025-11-20 22:15:04.794931
1653	FTA 6330	FTA	6330	6330	6000	Acting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.79721	2025-11-20 22:15:04.797214
1654	FTA 6380	FTA	6380	6380	6000	Stage Directing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.799555	2025-11-20 22:15:04.799559
1655	FTA 6510	FTA	6510	6510	6000	Narr Film Prod		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.801631	2025-11-20 22:15:04.801634
1656	FTA 6511	FTA	6511	6511	6000	Equipment Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.803559	2025-11-20 22:15:04.803588
1657	FTA 6520	FTA	6520	6520	6000	Narr Film Post Prod		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.805545	2025-11-20 22:15:04.805548
1658	FTA 6550	FTA	6550	6550	6000	Graduate Cinematography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.807534	2025-11-20 22:15:04.807538
1659	FTA 6560	FTA	6560	6560	6000	Direct Docum Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.809483	2025-11-20 22:15:04.809487
1660	FTA 6565	FTA	6565	6565	6000	Digital Theory Application		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.811447	2025-11-20 22:15:04.811451
1661	FTA 6580	FTA	6580	6580	6000	Directing the Narrative Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.813423	2025-11-20 22:15:04.813427
1662	FTA 6900	FTA	6900	6900	6000	Graduate Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.815375	2025-11-20 22:15:04.815378
1663	FTA 6910	FTA	6910	6910	6000	Studio I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.817391	2025-11-20 22:15:04.817395
1664	FTA 6911	FTA	6911	6911	6000	Studio II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.819533	2025-11-20 22:15:04.819537
1665	FTA 6912	FTA	6912	6912	6000	Studio III		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.821971	2025-11-20 22:15:04.821974
1666	FTA 6950	FTA	6950	6950	6000	Thesis Studio		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.824455	2025-11-20 22:15:04.824459
1667	FTA 7000	FTA	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.826786	2025-11-20 22:15:04.826789
1668	FTA 7040	FTA	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.829007	2025-11-20 22:15:04.829011
1669	FIN 1330	FIN	1330	1330	1000	Personal Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.831195	2025-11-20 22:15:04.831199
1670	FIN 2302	FIN	2302	2302	2000	Introduction to Investing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.833296	2025-11-20 22:15:04.833299
1671	FIN 2335	FIN	2335	2335	2000	Principles of Real Estate		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.835473	2025-11-20 22:15:04.835477
1672	FIN 3099	FIN	3099	3099	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.837621	2025-11-20 22:15:04.837624
1673	FIN 3300	FIN	3300	3300	3000	Principles of Financial Mgmt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.840002	2025-11-20 22:15:04.840006
1674	FIN 3301	FIN	3301	3301	3000	Small Business Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.842536	2025-11-20 22:15:04.84254
1675	FIN 3302	FIN	3302	3302	3000	Investments		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.844671	2025-11-20 22:15:04.844675
1676	FIN 3303	FIN	3303	3303	3000	Financial Institutions		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.84726	2025-11-20 22:15:04.847264
1677	FIN 3321	FIN	3321	3321	3000	Bank Administration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.849208	2025-11-20 22:15:04.849211
1678	FIN 3325	FIN	3325	3325	3000	Principles of Real Estate		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.851448	2025-11-20 22:15:04.851451
1679	FIN 3368	FIN	3368	3368	3000	Real Estate Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.853887	2025-11-20 22:15:04.85389
1680	FIN 3391	FIN	3391	3391	3000	UGRD Directed Individual Study		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.856645	2025-11-20 22:15:04.856651
1681	FIN 3392	FIN	3392	3392	3000	Internship in Finance		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.859464	2025-11-20 22:15:04.859468
1682	FIN 4304	FIN	4304	4304	4000	Finance Capstone		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.86201	2025-11-20 22:15:04.862013
1683	FIN 4306	FIN	4306	4306	4000	International Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.864942	2025-11-20 22:15:04.864946
1684	FIN 4307	FIN	4307	4307	4000	Portfolio Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.868096	2025-11-20 22:15:04.8681
1685	FIN 4308	FIN	4308	4308	4000	Derivatives Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.871161	2025-11-20 22:15:04.871164
1686	FIN 4310	FIN	4310	4310	4000	Personal Financial Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.874405	2025-11-20 22:15:04.874409
1687	FIN 4311	FIN	4311	4311	4000	Ins Plan & Risk Mgt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.877845	2025-11-20 22:15:04.877849
1688	FIN 4312	FIN	4312	4312	4000	Retirement Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.881153	2025-11-20 22:15:04.881157
1689	FIN 4332	FIN	4332	4332	4000	Studetanaged Investment Fund		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.884368	2025-11-20 22:15:04.884372
1690	FIN 4370	FIN	4370	4370	4000	Real Estate Feasibility and Site Location Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.887534	2025-11-20 22:15:04.887538
1691	FIN 4394	FIN	4394	4394	4000	Internship in Finance		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.890238	2025-11-20 22:15:04.890242
1692	FIN 4400	FIN	4400	4400	4000	Fin Foundations for Managers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.893591	2025-11-20 22:15:04.893595
1693	FIN 5306	FIN	5306	5306	5000	International Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.896748	2025-11-20 22:15:04.896751
1694	FIN 5307	FIN	5307	5307	5000	Portfolio Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.900001	2025-11-20 22:15:04.900004
1695	FIN 5308	FIN	5308	5308	5000	Derivatives Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.903231	2025-11-20 22:15:04.903234
1696	FIN 5310	FIN	5310	5310	5000	Personal Financial Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.906223	2025-11-20 22:15:04.906227
1697	FIN 5311	FIN	5311	5311	5000	Ins Plan & Risk Mgt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.909865	2025-11-20 22:15:04.90987
1698	FIN 5312	FIN	5312	5312	5000	Retirement Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.913317	2025-11-20 22:15:04.913321
1699	FIN 5322	FIN	5322	5322	5000	Money & Capital Markets		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.916618	2025-11-20 22:15:04.916622
1700	FIN 5332	FIN	5332	5332	5000	Student Managed Investment Fund		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.920182	2025-11-20 22:15:04.920186
1701	FIN 5355	FIN	5355	5355	5000	Life & Health Insurance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.923556	2025-11-20 22:15:04.923581
1702	FIN 6300	FIN	6300	6300	6000	Financial Administration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.927278	2025-11-20 22:15:04.927282
1703	FIN 6302	FIN	6302	6302	6000	Investments		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.930868	2025-11-20 22:15:04.930873
1704	FIN 6303	FIN	6303	6303	6000	Financial Markets & Inst		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.934363	2025-11-20 22:15:04.934367
1705	FIN 6310	FIN	6310	6310	6000	Entrepreneurial Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.938033	2025-11-20 22:15:04.938038
1706	FIN 6311	FIN	6311	6311	6000	Theory of Corporate Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.941871	2025-11-20 22:15:04.941876
1707	FIN 6312	FIN	6312	6312	6000	Investment Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.945676	2025-11-20 22:15:04.945681
1708	FIN 6313	FIN	6313	6313	6000	Financial Markets & Institutns		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.949491	2025-11-20 22:15:04.949496
1709	FIN 6314	FIN	6314	6314	6000	Seminar in Corporate Finance		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:04.952954	2025-11-20 22:15:04.952959
1710	FIN 6315	FIN	6315	6315	6000	Seminar in Investments		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:04.956669	2025-11-20 22:15:04.956674
1711	FIN 6318	FIN	6318	6318	6000	Derivative Securities		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.960505	2025-11-20 22:15:04.96051
1712	FIN 6319	FIN	6319	6319	6000	Sem International Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.964329	2025-11-20 22:15:04.964334
1713	FIN 6321	FIN	6321	6321	6000	Commercial Bank Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.968222	2025-11-20 22:15:04.968227
1714	FIN 6350	FIN	6350	6350	6000	Health Care Financial Mgmt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.972231	2025-11-20 22:15:04.972236
1715	FIN 6391	FIN	6391	6391	6000	Directed Independent Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.976227	2025-11-20 22:15:04.976232
1716	FIN 6394	FIN	6394	6394	6000	Internship in Finance		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.980195	2025-11-20 22:15:04.9802
1717	FIN 6395	FIN	6395	6395	6000	Spec Topics in Finance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.98391	2025-11-20 22:15:04.983916
1718	FIN 6635	FIN	6635	6635	6000	Sem Fin Econ Anly Real Estate		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.987768	2025-11-20 22:15:04.987773
1719	FIN 7050	FIN	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.991709	2025-11-20 22:15:04.991715
1720	FIN 7051	FIN	7051	7051	7000	Dissertation Workshop		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:04.995517	2025-11-20 22:15:04.995522
1721	FA 100	FA	100	100	1000	CORE STUDIO I Objects / Materials / Environment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:04.999523	2025-11-20 22:15:05.005099
1722	FA 101	FA	101	101	1000	Art Appreciation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.009634	2025-11-20 22:15:05.00964
1723	FA 150	FA	150	150	1000	Introduction to Art and Visual Culture		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.014647	2025-11-20 22:15:05.014657
1724	FA 200	FA	200	200	2000	CORE STUDIO VTime / Motion / Narrative		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.019622	2025-11-20 22:15:05.028655
1725	FA 220	FA	220	220	2000	Art History Survey II: Fourteenth Century to the Present		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.032193	2025-11-20 22:15:05.035536
1726	FA 255	FA	255	255	2000	Introduction to Digital Art Video & Animation"		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.038189	2025-11-20 22:15:05.038194
1727	FA 260	FA	260	260	2000	Ceramics: Form and Processes		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.040969	2025-11-20 22:15:05.040975
1728	FA 290	FA	290	290	2000	Introduction to Computer Graphics in Fine Arts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.043696	2025-11-20 22:15:05.043701
1729	FA 299	FA	299	299	2000	Theory and Practice of Art History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.046048	2025-11-20 22:15:05.046052
1730	FA 324	FA	324	324	3000	Images of Disaster		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.048043	2025-11-20 22:15:05.048048
1731	FA 329	FA	329	329	3000	Independent Study in Art History		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.050097	2025-11-20 22:15:05.054146
1732	FA 330	FA	330	330	3000	Drawing Techniques and Concept		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.056075	2025-11-20 22:15:05.056079
1733	FA 333	FA	333	333	3000	The Body in Art: Gender Sexuality and Cultural Identity"		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.058093	2025-11-20 22:15:05.058097
1734	FA 345	FA	345	345	3000	Photography I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.060122	2025-11-20 22:15:05.060146
1735	FA 351	FA	351	351	3000	Greek and Roman Monuments		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.062162	2025-11-20 22:15:05.062166
1736	FA 353	FA	353	353	3000	The Art of Quattrocento in Italy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.064212	2025-11-20 22:15:05.064216
1737	FA 355	FA	355	355	3000	Digital Art Video and Animation I"		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.066231	2025-11-20 22:15:05.066235
1738	FA 359	FA	359	359	3000	AApecial Topics Fine Arts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.06823	2025-11-20 22:15:05.068234
1739	FA 365	FA	365	365	3000	Sculpture and Extended Media I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.070244	2025-11-20 22:15:05.070248
1740	FA 375	FA	375	375	3000	Painting I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.072258	2025-11-20 22:15:05.072261
1741	FA 385	FA	385	385	3000	Printmaking I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.074265	2025-11-20 22:15:05.074269
1742	FA 399	FA	399	399	3000	Peolumbian Art		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.076326	2025-11-20 22:15:05.07633
1743	FA 400	FA	400	400	4000	Interdisciplinary Design Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.078337	2025-11-20 22:15:05.078341
1744	FA 421	FA	421	421	4000	African Art		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.080394	2025-11-20 22:15:05.080398
1745	FA 423	FA	423	423	4000	High Renaissance/Mannerism Ita		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.082386	2025-11-20 22:15:05.084406
1746	FA 424	FA	424	424	4000	Art of 19th Century		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.086335	2025-11-20 22:15:05.090808
1747	FA 426	FA	426	426	4000	Contemporary Art: Postmodernism and Beyond (190resent)		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.095653	2025-11-20 22:15:05.100337
1748	FA 427	FA	427	427	4000	Prospect New Orleans		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.104213	2025-11-20 22:15:05.115827
1749	FA 428	FA	428	428	4000	Modern/Postmodern		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.119749	2025-11-20 22:15:05.119754
1750	FA 429	FA	429	429	4000	Art at NOMA		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.123275	2025-11-20 22:15:05.12328
1751	FA 430	FA	430	430	4000	Figure Drawing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.126824	2025-11-20 22:15:05.126829
1752	FA 441	FA	441	441	4000	Contemporary Art and Social Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.130502	2025-11-20 22:15:05.130507
1753	FA 444	FA	444	444	4000	Photography II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.134118	2025-11-20 22:15:05.134123
1754	FA 445	FA	445	445	4000	Photography III		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.137849	2025-11-20 22:15:05.137854
1755	FA 454	FA	454	454	4000	Digital Art Video and Animation II"		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.141703	2025-11-20 22:15:05.141708
1756	FA 455	FA	455	455	4000	Digital Art Video and Animation III"		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.145973	2025-11-20 22:15:05.145978
1757	FA 459	FA	459	459	4000	Senior Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.149757	2025-11-20 22:15:05.153474
1758	FA 464	FA	464	464	4000	Sculpture and Extended Media II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.157175	2025-11-20 22:15:05.157182
1759	FA 465	FA	465	465	4000	Sculpture and Extended Media III		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.160898	2025-11-20 22:15:05.160903
1760	FA 474	FA	474	474	4000	Painting II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.164732	2025-11-20 22:15:05.164737
1761	FA 475	FA	475	475	4000	Painting III		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.168983	2025-11-20 22:15:05.168989
1762	FA 484	FA	484	484	4000	Printmaking II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.17291	2025-11-20 22:15:05.172915
1763	FA 485	FA	485	485	4000	Printmaking III		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.176731	2025-11-20 22:15:05.176736
1764	FA 499	FA	499	499	4000	Art Research Capstone		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.180525	2025-11-20 22:15:05.18053
1765	FA 521	FA	521	521	5000	African Art		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.184433	2025-11-20 22:15:05.184438
1766	FA 524	FA	524	524	5000	Art of 19th Century		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.188311	2025-11-20 22:15:05.188319
1767	FA 526	FA	526	526	5000	Contemporary Art: Postmodernism and Beyond (190resent)		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.192284	2025-11-20 22:15:05.196485
1768	FA 527	FA	527	527	5000	Prospect New Orleans		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.200428	2025-11-20 22:15:05.211638
1769	FA 528	FA	528	528	5000	Modern/Postmodern		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.216745	2025-11-20 22:15:05.216756
1770	FA 541	FA	541	541	5000	Contemporary Art and Social Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.221241	2025-11-20 22:15:05.22125
1771	FA 610	FA	610	610	6000	Indep Research in Art History		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.225859	2025-11-20 22:15:05.225868
1772	FA 620	FA	620	620	6000	Graduate Printmaking		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.229774	2025-11-20 22:15:05.241358
1773	FA 630	FA	630	630	6000	Art Colloquium		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:05.245928	2025-11-20 22:15:05.245938
1774	FA 640	FA	640	640	6000	Critique Group		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.251358	2025-11-20 22:15:05.251372
1775	FA 660	FA	660	660	6000	Major Studio II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.257001	2025-11-20 22:15:05.261646
1776	FA 670	FA	670	670	6000	Minor Studio		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.265561	2025-11-20 22:15:05.265602
1777	FA 679	FA	679	679	6000	Independent Studio Practice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.269718	2025-11-20 22:15:05.269724
1778	FA 690	FA	690	690	6000	Exhibition Design and Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.273987	2025-11-20 22:15:05.273993
1779	FA 699	FA	699	699	6000	Professional Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.278265	2025-11-20 22:15:05.282537
1780	FA 700	FA	700	700	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.286597	2025-11-20 22:15:05.286603
1781	FA 704	FA	704	704	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.29033	2025-11-20 22:15:05.290336
1782	FREN 1001	FREN	1001	1001	1000	Basic French I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.294198	2025-11-20 22:15:05.294205
1783	FREN 1002	FREN	1002	1002	1000	Basic French II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.298299	2025-11-20 22:15:05.298305
1784	FREN 2001	FREN	2001	2001	2000	Intermediate French I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.302445	2025-11-20 22:15:05.302451
1785	FREN 2002	FREN	2002	2002	2000	Intermediate French II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.306515	2025-11-20 22:15:05.30652
1786	FREN 3002	FREN	3002	3002	3000	Practical French Phonetics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.310484	2025-11-20 22:15:05.31049
1787	FREN 3005	FREN	3005	3005	3000	Romance Linguistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.314525	2025-11-20 22:15:05.314531
1788	FREN 3031	FREN	3031	3031	3000	French Conversation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.318636	2025-11-20 22:15:05.318642
1789	FREN 3041	FREN	3041	3041	3000	Advanced French Grammar		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.32273	2025-11-20 22:15:05.322736
1790	FREN 3042	FREN	3042	3042	3000	Advanced French Comp & Syntax		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.326741	2025-11-20 22:15:05.326746
1791	FREN 3090	FREN	3090	3090	3000	Advanced Practical French		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.330836	2025-11-20 22:15:05.330841
1792	FREN 3100	FREN	3100	3100	3000	Survey French Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.33484	2025-11-20 22:15:05.334846
1793	FREN 3191	FREN	3191	3191	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.339199	2025-11-20 22:15:05.339204
1794	FREN 3192	FREN	3192	3192	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.343401	2025-11-20 22:15:05.343406
1795	FREN 3193	FREN	3193	3193	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.347601	2025-11-20 22:15:05.347608
1796	FREN 3197	FREN	3197	3197	3000	Oral Proficiency		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.351493	2025-11-20 22:15:05.351499
1797	FREN 3199	FREN	3199	3199	3000	Indep Work Honors Students		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.355985	2025-11-20 22:15:05.355991
1798	FREN 3205	FREN	3205	3205	3000	Read French Culture & Thought		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.36008	2025-11-20 22:15:05.360085
1799	FREN 3403	FREN	3403	3403	3000	Spec Topic French Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.364046	2025-11-20 22:15:05.364051
1800	FREN 3404	FREN	3404	3404	3000	Spec Topics French Civilizatn		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.367858	2025-11-20 22:15:05.367863
1801	FREN 3406	FREN	3406	3406	3000	Romance Cult New Orl		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.371538	2025-11-20 22:15:05.371543
1802	FREN 3500	FREN	3500	3500	3000	Tutorial for Graduating Majors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.375402	2025-11-20 22:15:05.375407
1803	FREN 4015	FREN	4015	4015	4000	History of French Language		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.379293	2025-11-20 22:15:05.379298
1804	FREN 4041	FREN	4041	4041	4000	Problems Grammatical Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.383108	2025-11-20 22:15:05.383113
1805	FREN 4110	FREN	4110	4110	4000	Medieval French Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.386883	2025-11-20 22:15:05.386888
1806	FREN 4132	FREN	4132	4132	4000	17th Cent French Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.390752	2025-11-20 22:15:05.390757
1807	FREN 4140	FREN	4140	4140	4000	18th C French Lierature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.394633	2025-11-20 22:15:05.394638
1808	FREN 4154	FREN	4154	4154	4000	19th Century French Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.398559	2025-11-20 22:15:05.398584
1809	FREN 4162	FREN	4162	4162	4000	French Lit of 20th Century		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.402678	2025-11-20 22:15:05.402684
1810	FREN 4201	FREN	4201	4201	4000	French Civilization I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.406726	2025-11-20 22:15:05.406732
1811	FREN 4202	FREN	4202	4202	4000	French Civilization II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.410676	2025-11-20 22:15:05.410681
1812	FREN 4265	FREN	4265	4265	4000	Contemporary French Culture		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.414517	2025-11-20 22:15:05.414522
1813	FREN 4400	FREN	4400	4400	4000	Children�s Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.418258	2025-11-20 22:15:05.418264
1814	FREN 5015	FREN	5015	5015	5000	History of French Language		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.422052	2025-11-20 22:15:05.422058
1815	FREN 5041	FREN	5041	5041	5000	Problems Grammatical Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.426096	2025-11-20 22:15:05.426101
1816	FREN 5110	FREN	5110	5110	5000	Medieval French Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.430197	2025-11-20 22:15:05.430203
1817	FREN 5132	FREN	5132	5132	5000	17th Cent French Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.434234	2025-11-20 22:15:05.43424
1818	FREN 5140	FREN	5140	5140	5000	18th C French Lierature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.438377	2025-11-20 22:15:05.438382
1819	FREN 5154	FREN	5154	5154	5000	19th Century French Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.442317	2025-11-20 22:15:05.442322
1820	FREN 5162	FREN	5162	5162	5000	French Lit of 20th Century		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.446354	2025-11-20 22:15:05.446359
1821	FREN 5201	FREN	5201	5201	5000	French Civilization I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.450362	2025-11-20 22:15:05.450368
1822	FREN 5202	FREN	5202	5202	5000	French Civilization II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.454353	2025-11-20 22:15:05.454358
1823	FREN 5265	FREN	5265	5265	5000	Contemporary French Culture		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.458358	2025-11-20 22:15:05.458363
1824	FREN 5400	FREN	5400	5400	5000	Children�s Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.462377	2025-11-20 22:15:05.462383
1825	FREN 6001	FREN	6001	6001	6000	French Stylistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.466439	2025-11-20 22:15:05.466444
1826	FREN 6003	FREN	6003	6003	6000	Commentaire De Texte		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.470425	2025-11-20 22:15:05.47043
1827	FREN 6041	FREN	6041	6041	6000	Theory & Practice Translation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.474286	2025-11-20 22:15:05.474291
1828	FREN 6097	FREN	6097	6097	6000	Studies in French Linguistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.478343	2025-11-20 22:15:05.478348
1829	FREN 6190	FREN	6190	6190	6000	Studies Medieval French Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.482375	2025-11-20 22:15:05.482381
1830	FREN 6195	FREN	6195	6195	6000	Studies in 20th and 21st Century French Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.486435	2025-11-20 22:15:05.48644
1831	FREN 6197	FREN	6197	6197	6000	Studies in French Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.490442	2025-11-20 22:15:05.490447
1832	FREN 6205	FREN	6205	6205	6000	French Thought		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.49473	2025-11-20 22:15:05.494735
1833	FREN 6265	FREN	6265	6265	6000	Contemp French Society & Inst		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.498804	2025-11-20 22:15:05.49881
1834	FREN 6295	FREN	6295	6295	6000	Studies in French Cult & Civ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.502896	2025-11-20 22:15:05.502902
1835	FREN 6397	FREN	6397	6397	6000	Directed Study		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.506901	2025-11-20 22:15:05.506906
1836	FREN 7000	FREN	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.511155	2025-11-20 22:15:05.511161
1837	FREN 7040	FREN	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.515439	2025-11-20 22:15:05.515445
1838	GEOG 1001	GEOG	1001	1001	1000	World Regional Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.51953	2025-11-20 22:15:05.519536
1839	GEOG 1002	GEOG	1002	1002	1000	World Regional Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.52368	2025-11-20 22:15:05.523686
1840	GEOG 1356	GEOG	1356	1356	1000	Human Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.527937	2025-11-20 22:15:05.527943
1841	GEOG 1600	GEOG	1600	1600	1000	Environmental Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.532073	2025-11-20 22:15:05.532079
1842	GEOG 2151	GEOG	2151	2151	2000	Elements Physical Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.536076	2025-11-20 22:15:05.536082
1843	GEOG 2158	GEOG	2158	2158	2000	Conservation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.540213	2025-11-20 22:15:05.540219
1844	GEOG 2254	GEOG	2254	2254	2000	Elements Economic Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.544077	2025-11-20 22:15:05.544083
1845	GEOG 2356	GEOG	2356	2356	2000	Cultural Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.547886	2025-11-20 22:15:05.547892
1846	GEOG 3190	GEOG	3190	3190	3000	Spec Top Region Geog		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.55185	2025-11-20 22:15:05.551856
1847	GEOG 3850	GEOG	3850	3850	3000	Geography Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.55581	2025-11-20 22:15:05.555816
1848	GEOG 3895	GEOG	3895	3895	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.559714	2025-11-20 22:15:05.559719
1849	GEOG 4150	GEOG	4150	4150	4000	Geog of Hazards & Disasters		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.563974	2025-11-20 22:15:05.563979
1850	GEOG 4158	GEOG	4158	4158	4000	Environmental Impact Assessmnt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.56798	2025-11-20 22:15:05.567986
1851	GEOG 4310	GEOG	4310	4310	4000	Political Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.571921	2025-11-20 22:15:05.571927
1852	GEOG 4514	GEOG	4514	4514	4000	Climatology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.575858	2025-11-20 22:15:05.575864
1853	GEOG 4530	GEOG	4530	4530	4000	Biogeography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.579744	2025-11-20 22:15:05.579749
1854	GEOG 4610	GEOG	4610	4610	4000	Urban Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.58368	2025-11-20 22:15:05.583685
1855	GEOG 4615	GEOG	4615	4615	4000	Cultural Ecology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.58768	2025-11-20 22:15:05.587685
1856	GEOG 4805	GEOG	4805	4805	4000	Fundamentals of Mapping & GIS		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.591672	2025-11-20 22:15:05.591677
1857	GEOG 4810	GEOG	4810	4810	4000	Introduction to Remote Sensing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.595701	2025-11-20 22:15:05.595706
1858	GEOG 4820	GEOG	4820	4820	4000	Rem Sens II: Image Processing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.599653	2025-11-20 22:15:05.599658
1859	GEOG 4830	GEOG	4830	4830	4000	GIS Theories and Concepts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.60367	2025-11-20 22:15:05.603675
1860	GEOG 4832	GEOG	4832	4832	4000	Adv Techniques GIS		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.607688	2025-11-20 22:15:05.607694
1861	GEOG 4901	GEOG	4901	4901	4000	Field Methods in Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.61141	2025-11-20 22:15:05.611415
1862	GEOG 4990	GEOG	4990	4990	4000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.61545	2025-11-20 22:15:05.615456
1863	GEOG 5150	GEOG	5150	5150	5000	Geog of Hazards & Disasters		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.619451	2025-11-20 22:15:05.619456
1864	GEOG 5158	GEOG	5158	5158	5000	Environmental Impact Assessmnt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.623474	2025-11-20 22:15:05.62348
1865	GEOG 5310	GEOG	5310	5310	5000	Political Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.627609	2025-11-20 22:15:05.627615
1866	GEOG 5514	GEOG	5514	5514	5000	Climatology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.631495	2025-11-20 22:15:05.631501
1867	GEOG 5530	GEOG	5530	5530	5000	Biogeography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.635435	2025-11-20 22:15:05.63544
1868	GEOG 5610	GEOG	5610	5610	5000	Urban Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.639364	2025-11-20 22:15:05.639369
1869	GEOG 5615	GEOG	5615	5615	5000	Cultural Ecology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.643259	2025-11-20 22:15:05.643264
1870	GEOG 5805	GEOG	5805	5805	5000	Fundamentals of Mapping & GIS		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.647332	2025-11-20 22:15:05.647338
1871	GEOG 5810	GEOG	5810	5810	5000	Introduction to Remote Sensing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.651076	2025-11-20 22:15:05.651081
1872	GEOG 5820	GEOG	5820	5820	5000	Rem Sens II: Image Processing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.655358	2025-11-20 22:15:05.655363
1873	GEOG 5830	GEOG	5830	5830	5000	GIS Theories and Concepts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.659333	2025-11-20 22:15:05.659339
1874	GEOG 5832	GEOG	5832	5832	5000	Adv Techniques GIS		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.663175	2025-11-20 22:15:05.66318
1875	GEOG 5901	GEOG	5901	5901	5000	Field Methods in Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.667202	2025-11-20 22:15:05.667208
1876	GEOG 6530	GEOG	6530	6530	6000	Sem Environmental Geography		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.67104	2025-11-20 22:15:05.671046
1877	GEOG 6801	GEOG	6801	6801	6000	Advanced Quant Meth		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.6749	2025-11-20 22:15:05.674905
1878	GEOG 6990	GEOG	6990	6990	6000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.67885	2025-11-20 22:15:05.678856
1879	GEOG 7000	GEOG	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.682841	2025-11-20 22:15:05.682847
1880	GEOG 7040	GEOG	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.686869	2025-11-20 22:15:05.686875
1881	GER 1001	GER	1001	1001	1000	Basic German I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.691209	2025-11-20 22:15:05.691215
1882	GER 1002	GER	1002	1002	1000	Basic German II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.695263	2025-11-20 22:15:05.695268
1883	GER 2001	GER	2001	2001	2000	Intermediate German I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.69921	2025-11-20 22:15:05.699216
1884	GER 2002	GER	2002	2002	2000	Intermediate German II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.703225	2025-11-20 22:15:05.703231
1885	GER 3002	GER	3002	3002	3000	German Phonetics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.70742	2025-11-20 22:15:05.707427
1886	GER 3101	GER	3101	3101	3000	Survey of German Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.711487	2025-11-20 22:15:05.711492
1887	GER 3191	GER	3191	3191	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.715529	2025-11-20 22:15:05.715534
1888	GER 3192	GER	3192	3192	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.719481	2025-11-20 22:15:05.719486
1889	GER 3193	GER	3193	3193	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.723537	2025-11-20 22:15:05.723542
1890	GER 3402	GER	3402	3402	3000	German Lit in Translation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.727626	2025-11-20 22:15:05.727632
1891	HCM 1000	HCM	1000	1000	1000	Intro to Health Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.73169	2025-11-20 22:15:05.731696
1892	HCM 2000	HCM	2000	2000	2000	The US Healthcare System		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.735744	2025-11-20 22:15:05.73575
1893	HCM 3010	HCM	3010	3010	3000	Healthcare Organizational Leadership and Improvement		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.739742	2025-11-20 22:15:05.739748
1894	HCM 3020	HCM	3020	3020	3000	Healthcare Information Technology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.743697	2025-11-20 22:15:05.743702
1895	HCM 3030	HCM	3030	3030	3000	Community Health Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.747677	2025-11-20 22:15:05.747683
1896	HCM 3040	HCM	3040	3040	3000	Health Reimbursement		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.751752	2025-11-20 22:15:05.751758
1897	HCM 3091	HCM	3091	3091	3000	Independent Hlth Care Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.755876	2025-11-20 22:15:05.755882
1898	HCM 4010	HCM	4010	4010	4000	Healthcare Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.759973	2025-11-20 22:15:05.759979
1899	HCM 4012	HCM	4012	4012	4000	Organizational Behavior in Health Care		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.764007	2025-11-20 22:15:05.764013
1900	HCM 4016	HCM	4016	4016	4000	Intro to Health Informatics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.768256	2025-11-20 22:15:05.768261
1901	HCM 4070	HCM	4070	4070	4000	Future of Healthcare		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.772322	2025-11-20 22:15:05.772328
1902	HCM 4094	HCM	4094	4094	4000	Healthcare Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:05.776297	2025-11-20 22:15:05.776303
1903	HCM 4480	HCM	4480	4480	4000	Healthcare Capstone		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.780318	2025-11-20 22:15:05.780323
1904	HCM 5012	HCM	5012	5012	5000	Org Behavior in Health Care		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.784255	2025-11-20 22:15:05.784261
1905	HCM 5016	HCM	5016	5016	5000	Intro to Health Informatics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.788066	2025-11-20 22:15:05.788072
1906	HCM 6010	HCM	6010	6010	6000	Health Care Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.792102	2025-11-20 22:15:05.792107
1907	HCM 6013	HCM	6013	6013	6000	Strategic Issue Health Care		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.796119	2025-11-20 22:15:05.796143
1908	HCM 6015	HCM	6015	6015	6000	Health Care Law and Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.800235	2025-11-20 22:15:05.800241
1909	EDHS 1110	EDHS	1110	1110	1000	Personal Health & Wellnes		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.804164	2025-11-20 22:15:05.804169
1910	EDHS 2400	EDHS	2400	2400	2000	Medical Terminology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.807975	2025-11-20 22:15:05.80798
1911	EDHS 2700	EDHS	2700	2700	2000	Drug Use and Abuse		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.811844	2025-11-20 22:15:05.811849
1912	EDHS 4111	EDHS	4111	4111	4000	Epidem Principles Health Promo		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.815808	2025-11-20 22:15:05.815813
1913	EDHS 4190	EDHS	4190	4190	4000	Curr Problems Health Promotion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.820148	2025-11-20 22:15:05.820155
1914	EDHS 4200	EDHS	4200	4200	4000	Health Promotion Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.824114	2025-11-20 22:15:05.824119
1915	EDHS 4202	EDHS	4202	4202	4000	Community Health Promotion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.828208	2025-11-20 22:15:05.828213
1916	EDHS 4301	EDHS	4301	4301	4000	Methods of Health Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.832008	2025-11-20 22:15:05.832014
1917	EDHS 4302	EDHS	4302	4302	4000	Plan Eval Health Prom Programs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.836082	2025-11-20 22:15:05.836087
1918	EDHS 4610	EDHS	4610	4610	4000	Nutritional Health & Fitness		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.840017	2025-11-20 22:15:05.840023
1919	EDHS 4701	EDHS	4701	4701	4000	Emotional Health		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.843977	2025-11-20 22:15:05.843982
1920	EDHS 4702	EDHS	4702	4702	4000	Death and Dying		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.848263	2025-11-20 22:15:05.848268
1921	EDHS 4703	EDHS	4703	4703	4000	Stress Mgmt for Health Promo		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.852157	2025-11-20 22:15:05.852162
1922	EDHS 4704	EDHS	4704	4704	4000	Health Issues of Aging		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.85624	2025-11-20 22:15:05.856246
1923	EDHS 4705	EDHS	4705	4705	4000	Gender and Health		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.860297	2025-11-20 22:15:05.860302
1924	EDHS 4706	EDHS	4706	4706	4000	Social Mrktg for Health Comm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.86416	2025-11-20 22:15:05.864166
1925	EDHS 4801	EDHS	4801	4801	4000	Educ for Healthier Sexuality		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.867937	2025-11-20 22:15:05.867942
1926	EDHS 4900	EDHS	4900	4900	4000	Exercise & Mental Health		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.872037	2025-11-20 22:15:05.872043
1927	EDHS 4998	EDHS	4998	4998	4000	Practicum Health Promotion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.876034	2025-11-20 22:15:05.87604
1928	EDHS 5111	EDHS	5111	5111	5000	Epidem Principles Health Promo		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.880232	2025-11-20 22:15:05.880237
1929	EDHS 5190	EDHS	5190	5190	5000	Curr Problems Health Promotion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.883972	2025-11-20 22:15:05.883977
1930	EDHS 5200	EDHS	5200	5200	5000	Health Promotion Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.887597	2025-11-20 22:15:05.887602
1931	EDHS 5202	EDHS	5202	5202	5000	Community Health Promotion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.891245	2025-11-20 22:15:05.89125
1932	EDHS 5301	EDHS	5301	5301	5000	Methods of Health Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.895151	2025-11-20 22:15:05.895156
1933	EDHS 5302	EDHS	5302	5302	5000	Plan Eval Health Prom Programs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.898908	2025-11-20 22:15:05.898913
1934	EDHS 5610	EDHS	5610	5610	5000	Nutritional Health & Fitness		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.90268	2025-11-20 22:15:05.902685
1935	EDHS 5701	EDHS	5701	5701	5000	Emotional Health		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.906609	2025-11-20 22:15:05.906615
1936	EDHS 5702	EDHS	5702	5702	5000	Death and Dying		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.910817	2025-11-20 22:15:05.910822
1937	EDHS 5703	EDHS	5703	5703	5000	Stress Mgmt for Health Promo		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.914753	2025-11-20 22:15:05.914759
1938	EDHS 5704	EDHS	5704	5704	5000	Health Issues of Aging		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.918597	2025-11-20 22:15:05.918602
1939	EDHS 5705	EDHS	5705	5705	5000	Gender and Health		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.922538	2025-11-20 22:15:05.922543
1940	EDHS 5706	EDHS	5706	5706	5000	Social Mrktg for Health Comm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.926451	2025-11-20 22:15:05.926456
1941	EDHS 5801	EDHS	5801	5801	5000	Educ for Healthier Sexuality		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.930306	2025-11-20 22:15:05.930311
1942	EDHS 5900	EDHS	5900	5900	5000	Exercise & Mental Health		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.934023	2025-11-20 22:15:05.934028
1943	EDHS 5998	EDHS	5998	5998	5000	Practicum Health Promotion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.938036	2025-11-20 22:15:05.938041
1944	HIST 1001	HIST	1001	1001	1000	World History I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.942054	2025-11-20 22:15:05.94206
1945	HIST 1002	HIST	1002	1002	1000	World History II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.946228	2025-11-20 22:15:05.946233
1946	HIST 1010	HIST	1010	1010	1000	Intro Africnmerican History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.950275	2025-11-20 22:15:05.95028
1947	HIST 2000	HIST	2000	2000	2000	Environmental History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.954352	2025-11-20 22:15:05.954357
1948	HIST 2050	HIST	2050	2050	2000	Historical Catastrophes		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.958357	2025-11-20 22:15:05.958363
1949	HIST 2201	HIST	2201	2201	2000	History of Asian Civilizations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.962372	2025-11-20 22:15:05.962378
1950	HIST 2202	HIST	2202	2202	2000	Modern Asian History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.966375	2025-11-20 22:15:05.96638
1951	HIST 2362	HIST	2362	2362	2000	Modern Britain		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.970431	2025-11-20 22:15:05.970437
1952	HIST 2400	HIST	2400	2400	2000	Intro to Latin American Hist		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.974485	2025-11-20 22:15:05.974491
1953	HIST 2501	HIST	2501	2501	2000	US History I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.978524	2025-11-20 22:15:05.978529
1954	HIST 2502	HIST	2502	2502	2000	US History II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.982458	2025-11-20 22:15:05.982464
1955	HIST 2520	HIST	2520	2520	2000	History of American Sports		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.986505	2025-11-20 22:15:05.986511
1956	HIST 2587	HIST	2587	2587	2000	Women in American History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.990516	2025-11-20 22:15:05.990522
1957	HIST 2601	HIST	2601	2601	2000	History of Louisiana		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.994336	2025-11-20 22:15:05.994342
1958	HIST 2603	HIST	2603	2603	2000	History of New Orleans		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:05.998332	2025-11-20 22:15:05.998338
1959	HIST 2701	HIST	2701	2701	2000	Africa to 1830		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.002356	2025-11-20 22:15:06.002361
1960	HIST 2702	HIST	2702	2702	2000	Africa 180resent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.006298	2025-11-20 22:15:06.006304
1961	HIST 2991	HIST	2991	2991	2000	Special Studies History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.010225	2025-11-20 22:15:06.010231
1962	HIST 3002	HIST	3002	3002	3000	Historical Thought and Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.014252	2025-11-20 22:15:06.014257
1963	HIST 3225	HIST	3225	3225	3000	The War in Vietnam		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.018184	2025-11-20 22:15:06.018189
1964	HIST 3551	HIST	3551	3551	3000	African American History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.021914	2025-11-20 22:15:06.021919
1965	HIST 3552	HIST	3552	3552	3000	African American History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.02635	2025-11-20 22:15:06.026356
1966	HIST 3595	HIST	3595	3595	3000	AApecial Topics History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.030528	2025-11-20 22:15:06.030534
1967	HIST 3603	HIST	3603	3603	3000	History of New Orleans Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.034743	2025-11-20 22:15:06.034749
1968	HIST 3992	HIST	3992	3992	3000	Special Studies in History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.038706	2025-11-20 22:15:06.038711
1969	HIST 3995	HIST	3995	3995	3000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.042722	2025-11-20 22:15:06.042727
1970	HIST 3999	HIST	3999	3999	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.046837	2025-11-20 22:15:06.046843
1971	HIST 4003	HIST	4003	4003	4000	Modern Military History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.050948	2025-11-20 22:15:06.050954
1972	HIST 4008	HIST	4008	4008	4000	Public History Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.055096	2025-11-20 22:15:06.055101
1973	HIST 4009	HIST	4009	4009	4000	World & Global Histories		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.05933	2025-11-20 22:15:06.059336
1974	HIST 4100	HIST	4100	4100	4000	Atlantic History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.063337	2025-11-20 22:15:06.063343
1975	HIST 4105	HIST	4105	4105	4000	Women & Amer Slavery		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.067433	2025-11-20 22:15:06.067439
1976	HIST 4213	HIST	4213	4213	4000	Japan 194 Present		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.07158	2025-11-20 22:15:06.071587
1977	HIST 4221	HIST	4221	4221	4000	Modern Southeast Asia		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.075755	2025-11-20 22:15:06.075761
1978	HIST 4231	HIST	4231	4231	4000	Modern India		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.079682	2025-11-20 22:15:06.079687
1979	HIST 4330	HIST	4330	4330	4000	French Revolution & Napoleon		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.083712	2025-11-20 22:15:06.083718
1980	HIST 4343	HIST	4343	4343	4000	Revolutionary Europe 179848		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.087793	2025-11-20 22:15:06.087799
1981	HIST 4344	HIST	4344	4344	4000	Imperial Europe, 188918		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.09197	2025-11-20 22:15:06.091976
1982	HIST 4345	HIST	4345	4345	4000	Europe: Shdw of War, 198945		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.096056	2025-11-20 22:15:06.096062
1983	HIST 4346	HIST	4346	4346	4000	Postwar Europe, 195resent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.100323	2025-11-20 22:15:06.100329
1984	HIST 4364	HIST	4364	4364	4000	Modern Ireland		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.104688	2025-11-20 22:15:06.104693
1985	HIST 4366	HIST	4366	4366	4000	The British Empire		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.108691	2025-11-20 22:15:06.108696
1986	HIST 4368	HIST	4368	4368	4000	Modern France		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.112683	2025-11-20 22:15:06.112688
1987	HIST 4371	HIST	4371	4371	4000	Modern Germany, 179resent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.11667	2025-11-20 22:15:06.116675
1988	HIST 4373	HIST	4373	4373	4000	Hapsburg Empire		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.12073	2025-11-20 22:15:06.120735
1989	HIST 4376	HIST	4376	4376	4000	Modern & Contemporary Russia		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.125015	2025-11-20 22:15:06.125021
1990	HIST 4383	HIST	4383	4383	4000	European Intellectual Trad		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.129058	2025-11-20 22:15:06.129064
1991	HIST 4502	HIST	4502	4502	4000	Revolutionry Period Am History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.133164	2025-11-20 22:15:06.13317
1992	HIST 4506	HIST	4506	4506	4000	Civil War & Reconstruction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.13716	2025-11-20 22:15:06.137165
1993	HIST 4510	HIST	4510	4510	4000	Recent American History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.141245	2025-11-20 22:15:06.141251
1994	HIST 4511	HIST	4511	4511	4000	Recent American History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.145335	2025-11-20 22:15:06.14534
1995	HIST 4531	HIST	4531	4531	4000	Seeing History through Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.149343	2025-11-20 22:15:06.149348
1996	HIST 4543	HIST	4543	4543	4000	US Urban History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.15335	2025-11-20 22:15:06.153355
1997	HIST 4565	HIST	4565	4565	4000	US Military History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.157376	2025-11-20 22:15:06.157382
1998	HIST 4570	HIST	4570	4570	4000	World War II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.161427	2025-11-20 22:15:06.161432
1999	HIST 4575	HIST	4575	4575	4000	Cold War Era		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.165472	2025-11-20 22:15:06.165477
2000	HIST 4581	HIST	4581	4581	4000	Diplomatic History of the US		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.169367	2025-11-20 22:15:06.169372
2001	HIST 4595	HIST	4595	4595	4000	North American Indigenous History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.173415	2025-11-20 22:15:06.17342
2002	HIST 4800	HIST	4800	4800	4000	Historical Thought & Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.17759	2025-11-20 22:15:06.177596
2003	HIST 4885	HIST	4885	4885	4000	Select Topics in Public History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.181703	2025-11-20 22:15:06.181709
2004	HIST 4991	HIST	4991	4991	4000	Special Studies in History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.185684	2025-11-20 22:15:06.185689
2005	HIST 5001	HIST	5001	5001	5000	City & Civilization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.189494	2025-11-20 22:15:06.189499
2006	HIST 5003	HIST	5003	5003	5000	Modern Military History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.193296	2025-11-20 22:15:06.193302
2007	HIST 5008	HIST	5008	5008	5000	Public History Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.197317	2025-11-20 22:15:06.197322
2008	HIST 5009	HIST	5009	5009	5000	World & Global Histories		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.20096	2025-11-20 22:15:06.200965
2009	HIST 5100	HIST	5100	5100	5000	Atlantic History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.204768	2025-11-20 22:15:06.204774
2010	HIST 5105	HIST	5105	5105	5000	Women & Amer Slavery		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.208776	2025-11-20 22:15:06.208781
2011	HIST 5213	HIST	5213	5213	5000	Japan 194 Present		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.212733	2025-11-20 22:15:06.212738
2012	HIST 5221	HIST	5221	5221	5000	Modern Southeast Asia		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.216682	2025-11-20 22:15:06.216688
2013	HIST 5231	HIST	5231	5231	5000	Modern India		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.220307	2025-11-20 22:15:06.220312
2014	HIST 5303	HIST	5303	5303	5000	Roman History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.22423	2025-11-20 22:15:06.224236
2015	HIST 5307	HIST	5307	5307	5000	High Middle Ages		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.229885	2025-11-20 22:15:06.229894
2016	HIST 5330	HIST	5330	5330	5000	French Revolution & Napoleon		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.235201	2025-11-20 22:15:06.23521
2017	HIST 5343	HIST	5343	5343	5000	Revolutionary Europe 179848		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.24067	2025-11-20 22:15:06.240678
2018	HIST 5344	HIST	5344	5344	5000	Imperial Europe, 188918		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.24525	2025-11-20 22:15:06.245256
2019	HIST 5345	HIST	5345	5345	5000	Europe: Shdw of War, 198945		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.249932	2025-11-20 22:15:06.249938
2020	HIST 5346	HIST	5346	5346	5000	Postwar Europe, 195resent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.254452	2025-11-20 22:15:06.254458
2021	HIST 5361	HIST	5361	5361	5000	Tudor England		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.259076	2025-11-20 22:15:06.259082
2022	HIST 5364	HIST	5364	5364	5000	Modern Ireland		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.263442	2025-11-20 22:15:06.263449
2023	HIST 5366	HIST	5366	5366	5000	The British Empire		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.267828	2025-11-20 22:15:06.267834
2024	HIST 5367	HIST	5367	5367	5000	Age of Louis XIV		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.272072	2025-11-20 22:15:06.272078
2025	HIST 5368	HIST	5368	5368	5000	Modern France		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.27655	2025-11-20 22:15:06.276556
2026	HIST 5371	HIST	5371	5371	5000	Modern Germany, 179resent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.28078	2025-11-20 22:15:06.280786
2027	HIST 5373	HIST	5373	5373	5000	Hapsburg Empire		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.284842	2025-11-20 22:15:06.284848
2028	HIST 5376	HIST	5376	5376	5000	Modern & Contemporary Russia		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.288895	2025-11-20 22:15:06.2889
2029	HIST 5383	HIST	5383	5383	5000	European Intellectual Trad		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.292892	2025-11-20 22:15:06.292897
2030	HIST 5403	HIST	5403	5403	5000	History of Mexico		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.296944	2025-11-20 22:15:06.29695
2031	HIST 5502	HIST	5502	5502	5000	Revolutionry Period Am History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.301119	2025-11-20 22:15:06.301125
2032	HIST 5506	HIST	5506	5506	5000	Civil War & Reconstruction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.305081	2025-11-20 22:15:06.305087
2033	HIST 5510	HIST	5510	5510	5000	Recent American History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.309099	2025-11-20 22:15:06.309105
2034	HIST 5511	HIST	5511	5511	5000	Recent American History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.313031	2025-11-20 22:15:06.313037
2035	HIST 5521	HIST	5521	5521	5000	The New South		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.317034	2025-11-20 22:15:06.317039
2036	HIST 5531	HIST	5531	5531	5000	Seeing History through Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.321358	2025-11-20 22:15:06.321363
2037	HIST 5543	HIST	5543	5543	5000	US Urban History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.325384	2025-11-20 22:15:06.325389
2038	HIST 5552	HIST	5552	5552	5000	Black Movements & Messiahs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.329402	2025-11-20 22:15:06.329407
2039	HIST 5555	HIST	5555	5555	5000	The Civil Rights Era		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.333363	2025-11-20 22:15:06.333368
2040	HIST 5565	HIST	5565	5565	5000	US Military History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.337374	2025-11-20 22:15:06.33738
2041	HIST 5570	HIST	5570	5570	5000	World War II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.341387	2025-11-20 22:15:06.341393
2042	HIST 5575	HIST	5575	5575	5000	Cold War Era		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.345406	2025-11-20 22:15:06.345411
2043	HIST 5581	HIST	5581	5581	5000	Diplomatic History of the US		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.349436	2025-11-20 22:15:06.349442
2044	HIST 5885	HIST	5885	5885	5000	Select Topics in Public History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.353412	2025-11-20 22:15:06.353418
2045	HIST 5991	HIST	5991	5991	5000	Special Studies in History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.357462	2025-11-20 22:15:06.357467
2046	HIST 6001	HIST	6001	6001	6000	Historical Writing and Thought		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.36152	2025-11-20 22:15:06.361526
2047	HIST 6002	HIST	6002	6002	6000	Methods & Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.365741	2025-11-20 22:15:06.365747
2048	HIST 6005	HIST	6005	6005	6000	Grad History Forum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.369818	2025-11-20 22:15:06.369823
2049	HIST 6008	HIST	6008	6008	6000	Intro Public History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.373897	2025-11-20 22:15:06.373903
2050	HIST 6101	HIST	6101	6101	6000	Histories of Space and Place		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.37797	2025-11-20 22:15:06.377975
2051	HIST 6301	HIST	6301	6301	6000	Seminar in European History		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:06.381973	2025-11-20 22:15:06.381978
2052	HIST 6501	HIST	6501	6501	6000	Seminar in American History		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:06.385614	2025-11-20 22:15:06.38562
2053	HIST 6601	HIST	6601	6601	6000	Seminar in Special Topics		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:06.389656	2025-11-20 22:15:06.389661
2054	HIST 6603	HIST	6603	6603	6000	Research in New Orleans Hist		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.393659	2025-11-20 22:15:06.393665
2055	HIST 6803	HIST	6803	6803	6000	Seminar Urban Hist		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:06.397652	2025-11-20 22:15:06.397657
2056	HIST 6992	HIST	6992	6992	6000	History Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.40168	2025-11-20 22:15:06.401686
2057	HIST 6995	HIST	6995	6995	6000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.405694	2025-11-20 22:15:06.4057
2058	HIST 7000	HIST	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.409603	2025-11-20 22:15:06.409608
2059	HIST 7040	HIST	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.413735	2025-11-20 22:15:06.41374
2060	HRT 1098	HRT	1098	1098	1000	Introduction to HRT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.417776	2025-11-20 22:15:06.417782
2061	HRT 2000	HRT	2000	2000	2000	Intro to HRT Administration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.42193	2025-11-20 22:15:06.421936
2062	HRT 2020	HRT	2020	2020	2000	Hotel Operations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.425987	2025-11-20 22:15:06.425993
2063	HRT 2030	HRT	2030	2030	2000	Prin of Food Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.429908	2025-11-20 22:15:06.429914
2064	HRT 2035	HRT	2035	2035	2000	Principles of Food Production Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.433635	2025-11-20 22:15:06.433641
2065	HRT 2050	HRT	2050	2050	2000	Principles of Travel/Tourism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.437642	2025-11-20 22:15:06.437648
2066	HRT 2070	HRT	2070	2070	2000	Introduction to Conventions		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.441545	2025-11-20 22:15:06.441551
2067	HRT 3002	HRT	3002	3002	3000	HRT Work Experience		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.445663	2025-11-20 22:15:06.445668
2068	HRT 3011	HRT	3011	3011	3000	Tourism & Hospitality Marketng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.449689	2025-11-20 22:15:06.449694
2069	HRT 3016	HRT	3016	3016	3000	Legal Envirn in Hosp Industry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.453702	2025-11-20 22:15:06.453708
2070	HRT 3017	HRT	3017	3017	3000	Servc Orgn Mgmt in Hospitality		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.4577	2025-11-20 22:15:06.457705
2071	HRT 3031	HRT	3031	3031	3000	Baking and Pastry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.461738	2025-11-20 22:15:06.461744
2072	HRT 3140	HRT	3140	3140	3000	Cost Control Hosp Operations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.465765	2025-11-20 22:15:06.465771
2073	HRT 3141	HRT	3141	3141	3000	Management Beverage Service		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.469719	2025-11-20 22:15:06.469725
2074	HRT 3145	HRT	3145	3145	3000	Layout & Design Hosp Facility		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.473717	2025-11-20 22:15:06.473722
2075	HRT 3150	HRT	3150	3150	3000	Tourism Planning & Operations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.477818	2025-11-20 22:15:06.477824
2076	HRT 3240	HRT	3240	3240	3000	Club Mgmt & Operations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.481995	2025-11-20 22:15:06.482001
2077	HRT 3290	HRT	3290	3290	3000	Hospitality Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.48608	2025-11-20 22:15:06.486086
2078	HRT 3295	HRT	3295	3295	3000	Indep Study in HRT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.49031	2025-11-20 22:15:06.490316
2079	HRT 4000	HRT	4000	4000	4000	Policy Issues Tourism & Hosp		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.494409	2025-11-20 22:15:06.494415
2080	HRT 4150	HRT	4150	4150	4000	Mtg, Event & Conv Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.498523	2025-11-20 22:15:06.498529
2081	HRT 4230	HRT	4230	4230	4000	Advanced Food Service Mgmt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.50273	2025-11-20 22:15:06.502736
2082	HRT 4250	HRT	4250	4250	4000	International Tourism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.506707	2025-11-20 22:15:06.506713
2083	HRT 4290	HRT	4290	4290	4000	Special Topics in HRT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.510963	2025-11-20 22:15:06.510968
2084	HRT 4319	HRT	4319	4319	4000	Wines of the World		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.514963	2025-11-20 22:15:06.514969
2085	HRT 5150	HRT	5150	5150	5000	Mtg, Event & Conv Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.519169	2025-11-20 22:15:06.519175
2086	HRT 5160	HRT	5160	5160	5000	Theories of Casino Gaming		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.523246	2025-11-20 22:15:06.523252
2087	HRT 5250	HRT	5250	5250	5000	International Tourism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.527307	2025-11-20 22:15:06.527313
2088	HRT 5290	HRT	5290	5290	5000	Special Topics in HRT		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.531243	2025-11-20 22:15:06.53125
2089	HRT 5319	HRT	5319	5319	5000	Wines of the World		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.534925	2025-11-20 22:15:06.534931
2090	HRT 6001	HRT	6001	6001	6000	Survey of Hospitality & Touris		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.538908	2025-11-20 22:15:06.538914
2091	HRT 6102	HRT	6102	6102	6000	Technology Tourism & Hosp Mgt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.54284	2025-11-20 22:15:06.542846
2092	HRT 6200	HRT	6200	6200	6000	Hosp & Tourism Ops Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.546839	2025-11-20 22:15:06.546844
2093	HRT 6202	HRT	6202	6202	6000	Hosp and Tourism Research Meth		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.550803	2025-11-20 22:15:06.550809
2094	HRT 6203	HRT	6203	6203	6000	Marketing App for Hosp & Tour		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.554815	2025-11-20 22:15:06.55482
2095	HRT 6204	HRT	6204	6204	6000	Hospitality & Tourism Intern		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.559046	2025-11-20 22:15:06.559051
2096	HRT 6205	HRT	6205	6205	6000	Change Mang for Hosp & Tourism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.563038	2025-11-20 22:15:06.563044
2097	HRT 6207	HRT	6207	6207	6000	Work Experience HTM		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.567029	2025-11-20 22:15:06.567034
2098	HRT 6250	HRT	6250	6250	6000	Tourism Destination Developmnt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.571042	2025-11-20 22:15:06.571048
2099	HRT 6300	HRT	6300	6300	6000	Hospitality & Tourism Rev Mgt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.575057	2025-11-20 22:15:06.575063
2100	HRT 6301	HRT	6301	6301	6000	Hosp & Tour Indus Strtg Mang		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.57929	2025-11-20 22:15:06.579295
2101	HRT 6491	HRT	6491	6491	6000	Indep Study in Hosp & Tourism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.583446	2025-11-20 22:15:06.583452
2102	HRT 6495	HRT	6495	6495	6000	Spec Top Hospitality & Touris		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.587489	2025-11-20 22:15:06.587495
2103	HRT 7000	HRT	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.591681	2025-11-20 22:15:06.591687
2104	HRT 7040	HRT	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.59595	2025-11-20 22:15:06.595956
2105	EDHP 1090	EDHP	1090	1090	1000	Aerobic/Anaerobic Activities		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.601465	2025-11-20 22:15:06.601474
2106	EDHP 2110	EDHP	2110	2110	2000	Found of Hum Perf & Hlth Promo		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.606916	2025-11-20 22:15:06.606926
2107	EDHP 2170	EDHP	2170	2170	2000	Meas & Eval Hum Perf/Hlth Prom		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.611991	2025-11-20 22:15:06.611999
2108	EDHP 2320	EDHP	2320	2320	2000	Meth PE/Health Elem School		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.617066	2025-11-20 22:15:06.617074
2109	EDHP 3200	EDHP	3200	3200	3000	Kinesiology & Biomechanics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.622814	2025-11-20 22:15:06.622823
2110	EDHP 3201	EDHP	3201	3201	3000	Physiology of Exercise		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.627656	2025-11-20 22:15:06.627664
2111	EDHP 3210	EDHP	3210	3210	3000	Motor Development & Motr Learn		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.631916	2025-11-20 22:15:06.631926
2112	EDHP 3330	EDHP	3330	3330	3000	Exercise Physiol Lab Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.636662	2025-11-20 22:15:06.636669
2113	EDHP 4222	EDHP	4222	4222	4000	Physical Fitness Programming		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.641474	2025-11-20 22:15:06.641481
2114	EDHP 4225	EDHP	4225	4225	4000	Cardiac Rehabilitation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.645819	2025-11-20 22:15:06.645826
2115	EDHP 4480	EDHP	4480	4480	4000	Eval Treatment Sport Injuries		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.650061	2025-11-20 22:15:06.650068
2116	EDHP 4524	EDHP	4524	4524	4000	Sport Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.654584	2025-11-20 22:15:06.654591
2117	EDHP 4990	EDHP	4990	4990	4000	Special Topics in Human Performance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.658941	2025-11-20 22:15:06.658947
2118	EDHP 4998	EDHP	4998	4998	4000	Practicum Human Performance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.663405	2025-11-20 22:15:06.663411
2119	EDHP 5222	EDHP	5222	5222	5000	Physical Fitness Programming		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.66761	2025-11-20 22:15:06.667616
2120	EDHP 5524	EDHP	5524	5524	5000	Sport Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.671398	2025-11-20 22:15:06.671404
2121	EDHP 5990	EDHP	5990	5990	5000	Special Topics in Human Performance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.674994	2025-11-20 22:15:06.675
2122	EDHP 5998	EDHP	5998	5998	5000	Practicum Human Performance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.678592	2025-11-20 22:15:06.678598
2123	HUMS 1090	HUMS	1090	1090	1000	Classical Myth & Art		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.681884	2025-11-20 22:15:06.681889
2124	HUMS 2090	HUMS	2090	2090	2000	Spec Topics in Hums		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.684971	2025-11-20 22:15:06.684977
2125	HUMS 4090	HUMS	4090	4090	4000	Special Topics in Humanities		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.688228	2025-11-20 22:15:06.688236
2126	HUMS 5090	HUMS	5090	5090	5000	Special Topics in Humanities		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.691434	2025-11-20 22:15:06.69144
2127	IDS 1001	IDS	1001	1001	1000	Introductory Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:06.694936	2025-11-20 22:15:06.69494
2128	IDS 1002	IDS	1002	1002	1000	Making Connections: Introduction to Integrative Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.697237	2025-11-20 22:15:06.697242
2129	IDS 2001	IDS	2001	2001	2000	Portfolio Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.699666	2025-11-20 22:15:06.69967
2130	IDS 3001	IDS	3001	3001	3000	Intro to IDS		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.701856	2025-11-20 22:15:06.701859
2131	IDS 3002	IDS	3002	3002	3000	Information Literacy and Scholarly Discourse		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.703741	2025-11-20 22:15:06.703745
2132	IDS 3096	IDS	3096	3096	3000	Internship in IDS		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.70565	2025-11-20 22:15:06.705654
2133	IDS 4091	IDS	4091	4091	4000	Capstone Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:06.707502	2025-11-20 22:15:06.707506
2134	IS 306	IS	306	306	3000	Model United Nations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.7096	2025-11-20 22:15:06.709604
2135	IS 409	IS	409	409	4000	Senior Exit Course		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.711526	2025-11-20 22:15:06.71153
2136	IS 499	IS	499	499	4000	Honors Internship IS		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.713422	2025-11-20 22:15:06.718248
2137	ITAL 1001	ITAL	1001	1001	1000	Basic Italian I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.720451	2025-11-20 22:15:06.720454
2138	ITAL 1002	ITAL	1002	1002	1000	Basic Italian II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.723063	2025-11-20 22:15:06.723067
2139	ITAL 2001	ITAL	2001	2001	2000	Intermediate Italian I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.725992	2025-11-20 22:15:06.725996
2140	ITAL 3191	ITAL	3191	3191	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.728619	2025-11-20 22:15:06.728623
2141	ITAL 3192	ITAL	3192	3192	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.731515	2025-11-20 22:15:06.731519
2142	ITAL 3193	ITAL	3193	3193	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.734484	2025-11-20 22:15:06.734488
2143	JAPN 1001	JAPN	1001	1001	1000	Basic Japanese I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.737368	2025-11-20 22:15:06.737372
2144	JAPN 1002	JAPN	1002	1002	1000	Basic Japanese II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.740721	2025-11-20 22:15:06.740725
2145	JAPN 2001	JAPN	2001	2001	2000	Intermediate Japanese I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.744081	2025-11-20 22:15:06.744085
2146	JAPN 2002	JAPN	2002	2002	2000	Intermediate Japanese II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.747402	2025-11-20 22:15:06.747406
2147	JAPN 3191	JAPN	3191	3191	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.750444	2025-11-20 22:15:06.750448
2148	JAPN 3192	JAPN	3192	3192	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.753906	2025-11-20 22:15:06.75391
2149	JAPN 3193	JAPN	3193	3193	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.757297	2025-11-20 22:15:06.757301
2150	JOUR 2700	JOUR	2700	2700	2000	Introduction to Journalism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.760661	2025-11-20 22:15:06.760665
2151	JOUR 2790	JOUR	2790	2790	2000	Special Topics in Journalism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.764023	2025-11-20 22:15:06.764027
2152	JOUR 3760	JOUR	3760	3760	3000	Educational Journalism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.767337	2025-11-20 22:15:06.767341
2153	JOUR 4398	JOUR	4398	4398	4000	Internship in Journalism		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.771044	2025-11-20 22:15:06.771048
2154	JOUR 4700	JOUR	4700	4700	4000	Advanced Journalism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.774472	2025-11-20 22:15:06.774476
2155	JOUR 4710	JOUR	4710	4710	4000	Feature Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.777978	2025-11-20 22:15:06.777983
2156	JOUR 5700	JOUR	5700	5700	5000	Advanced Journalism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.781429	2025-11-20 22:15:06.781434
2157	JOUR 5710	JOUR	5710	5710	5000	Feature Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.785192	2025-11-20 22:15:06.785196
2158	JOUR 5792	JOUR	5792	5792	5000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.788875	2025-11-20 22:15:06.788879
2159	JOUR 6700	JOUR	6700	6700	6000	Special Studies in Print Journalism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.79273	2025-11-20 22:15:06.792735
2160	JUST 6810	JUST	6810	6810	6000	Theories of Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.796627	2025-11-20 22:15:06.796633
2161	JUST 6820	JUST	6820	6820	6000	Justice and Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.800643	2025-11-20 22:15:06.800648
2162	JUST 6830	JUST	6830	6830	6000	Justice Research I		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.804508	2025-11-20 22:15:06.804513
2163	JUST 6840	JUST	6840	6840	6000	Justice Research II		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.808412	2025-11-20 22:15:06.808417
2164	JUST 6900	JUST	6900	6900	6000	Special Topics in Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.812361	2025-11-20 22:15:06.812366
2165	JUST 6980	JUST	6980	6980	6000	Independent Study in Justice Studies		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.816419	2025-11-20 22:15:06.816424
2166	JUST 6990	JUST	6990	6990	6000	Justice Practicum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.820495	2025-11-20 22:15:06.820501
2167	JUST 7030	JUST	7030	7030	7000	Justice Prospectus		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.824486	2025-11-20 22:15:06.828333
2168	JUST 7050	JUST	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.832226	2025-11-20 22:15:06.832231
2169	LAT 1011	LAT	1011	1011	1000	Introductory Latin Reading I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.835881	2025-11-20 22:15:06.835887
2170	LAT 1012	LAT	1012	1012	1000	Introductory Latin Reading II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.839874	2025-11-20 22:15:06.83988
2171	LAT 2011	LAT	2011	2011	2000	Intermediate Latin Reading I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.84386	2025-11-20 22:15:06.843866
2172	EDLS 3100	EDLS	3100	3100	3000	Children�s Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.847961	2025-11-20 22:15:06.847967
2173	EDLS 4200	EDLS	4200	4200	4000	Young Adult Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.85206	2025-11-20 22:15:06.852066
2174	EDLS 5200	EDLS	5200	5200	5000	Young Adult Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.855931	2025-11-20 22:15:06.855936
2175	EDLS 6545	EDLS	6545	6545	6000	Literature for Gifted/Talented		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.859946	2025-11-20 22:15:06.859952
2176	EDLS 6650	EDLS	6650	6650	6000	Teaching Information Literacy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.864095	2025-11-20 22:15:06.8641
2177	EDLS 6710	EDLS	6710	6710	6000	Nonfiction Across Curriculum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.868035	2025-11-20 22:15:06.86804
2178	MANG 2472	MANG	2472	2472	2000	Business Communicatio Oral		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.872214	2025-11-20 22:15:06.872219
2179	MANG 2790	MANG	2790	2790	2000	Business Communication		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.876279	2025-11-20 22:15:06.876285
2180	MANG 3070	MANG	3070	3070	3000	Managing the Family Business		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.880264	2025-11-20 22:15:06.880269
2181	MANG 3071	MANG	3071	3071	3000	Franchise Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.884513	2025-11-20 22:15:06.884518
2182	MANG 3090	MANG	3090	3090	3000	Internship in Management		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.889259	2025-11-20 22:15:06.889264
2183	MANG 3099	MANG	3099	3099	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:06.893269	2025-11-20 22:15:06.893275
2184	MANG 3401	MANG	3401	3401	3000	Intro to Mgmt & Org Behavior		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.897171	2025-11-20 22:15:06.897176
2185	MANG 3402	MANG	3402	3402	3000	Operations and Systems Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.901068	2025-11-20 22:15:06.901073
2186	MANG 3467	MANG	3467	3467	3000	Human Resource Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.90663	2025-11-20 22:15:06.906639
2187	MANG 3491	MANG	3491	3491	3000	Directed Study Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.911489	2025-11-20 22:15:06.911498
2188	MANG 3595	MANG	3595	3595	3000	AApecial Topics Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.916034	2025-11-20 22:15:06.916042
2189	MANG 3778	MANG	3778	3778	3000	Management Information Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.920554	2025-11-20 22:15:06.920587
2190	MANG 3788	MANG	3788	3788	3000	Business Applicatn Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.925557	2025-11-20 22:15:06.925595
2191	MANG 4400	MANG	4400	4400	4000	Survey Management Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.932169	2025-11-20 22:15:06.932183
2192	MANG 4424	MANG	4424	4424	4000	Leadership in Organizations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.937082	2025-11-20 22:15:06.937092
2193	MANG 4446	MANG	4446	4446	4000	International Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.941715	2025-11-20 22:15:06.941722
2194	MANG 4450	MANG	4450	4450	4000	Disaster Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.945504	2025-11-20 22:15:06.945511
2195	MANG 4468	MANG	4468	4468	4000	HRM Strategy & Compensatn Syst		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.94938	2025-11-20 22:15:06.949386
2196	MANG 4469	MANG	4469	4469	4000	Staffing & Developing HR		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.952787	2025-11-20 22:15:06.952793
2197	MANG 4470	MANG	4470	4470	4000	Employment Law for Managers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.95637	2025-11-20 22:15:06.956376
2198	MANG 4471	MANG	4471	4471	4000	Quality Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.959855	2025-11-20 22:15:06.959861
2199	MANG 4472	MANG	4472	4472	4000	Supply Chain Managment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.963257	2025-11-20 22:15:06.963262
2200	MANG 4474	MANG	4474	4474	4000	Purchasing and Logistics Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.966697	2025-11-20 22:15:06.966702
2201	MANG 4480	MANG	4480	4480	4000	Business Policies & Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.970185	2025-11-20 22:15:06.97019
2202	MANG 4487	MANG	4487	4487	4000	Org Behaviour		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.973552	2025-11-20 22:15:06.973557
2203	MANG 4497	MANG	4497	4497	4000	Current Topics in Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.977168	2025-11-20 22:15:06.977173
2204	MANG 4710	MANG	4710	4710	4000	Innovation Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.980743	2025-11-20 22:15:06.980748
2205	MANG 4720	MANG	4720	4720	4000	Cybersecurity Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.984378	2025-11-20 22:15:06.984383
2206	MANG 4730	MANG	4730	4730	4000	Bus Info Syst Anly & Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.988124	2025-11-20 22:15:06.988147
2207	MANG 4750	MANG	4750	4750	4000	Bus. Intelligence & Analytics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.991711	2025-11-20 22:15:06.991716
2208	MANG 4760	MANG	4760	4760	4000	Managing Electronic Commerce		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.995393	2025-11-20 22:15:06.995398
2209	MANG 4771	MANG	4771	4771	4000	Business Analytics in Practice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:06.999093	2025-11-20 22:15:06.999098
2210	MANG 5400	MANG	5400	5400	5000	Survey Management Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.002935	2025-11-20 22:15:07.002941
2211	MANG 5407	MANG	5407	5407	5000	Innovation Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.006731	2025-11-20 22:15:07.006736
2212	MANG 5420	MANG	5420	5420	5000	Organizational Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.010606	2025-11-20 22:15:07.010611
2213	MANG 5424	MANG	5424	5424	5000	Leadership in Organizations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.014447	2025-11-20 22:15:07.014452
2214	MANG 5446	MANG	5446	5446	5000	International Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.018295	2025-11-20 22:15:07.0183
2215	MANG 5450	MANG	5450	5450	5000	Disaster Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.022191	2025-11-20 22:15:07.022196
2216	MANG 5468	MANG	5468	5468	5000	HRM Strategy & Compensatn Syst		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.025955	2025-11-20 22:15:07.025961
2217	MANG 5469	MANG	5469	5469	5000	Staffing & Developing HR		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.029449	2025-11-20 22:15:07.029454
2218	MANG 5470	MANG	5470	5470	5000	Employment Law for Managers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.033221	2025-11-20 22:15:07.033227
2219	MANG 5471	MANG	5471	5471	5000	Quality Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.037069	2025-11-20 22:15:07.037075
2220	MANG 5472	MANG	5472	5472	5000	Supply Chain Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.040675	2025-11-20 22:15:07.040681
2221	MANG 5497	MANG	5497	5497	5000	Current Topics in Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.044702	2025-11-20 22:15:07.044707
2222	MANG 5730	MANG	5730	5730	5000	Bus Info Syst Anal		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.048597	2025-11-20 22:15:07.048602
2223	MANG 5750	MANG	5750	5750	5000	Bus. Intelligence & Analytics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.052384	2025-11-20 22:15:07.052389
2224	MANG 6401	MANG	6401	6401	6000	Sem Organizational Behavior		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.056258	2025-11-20 22:15:07.056263
2225	MANG 6424	MANG	6424	6424	6000	Sport Leadership and Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.060168	2025-11-20 22:15:07.060173
2226	MANG 6425	MANG	6425	6425	6000	Small Group Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.063963	2025-11-20 22:15:07.063969
2227	MANG 6446	MANG	6446	6446	6000	International Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.068104	2025-11-20 22:15:07.06811
2228	MANG 6467	MANG	6467	6467	6000	Managing Human Resources		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.072205	2025-11-20 22:15:07.072211
2229	MANG 6469	MANG	6469	6469	6000	Staffing & Developing HRM		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.07629	2025-11-20 22:15:07.076296
2230	MANG 6470	MANG	6470	6470	6000	Employment Law for Managers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.080266	2025-11-20 22:15:07.080272
2231	MANG 6472	MANG	6472	6472	6000	Project Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.084093	2025-11-20 22:15:07.084098
2232	MANG 6476	MANG	6476	6476	6000	Operations Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.087882	2025-11-20 22:15:07.087888
2233	MANG 6480	MANG	6480	6480	6000	Seminar Business Policies		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:07.09146	2025-11-20 22:15:07.091465
2234	MANG 6491	MANG	6491	6491	6000	Ind Study in Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.095265	2025-11-20 22:15:07.095271
2235	MANG 6494	MANG	6494	6494	6000	Internship in Management		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.099017	2025-11-20 22:15:07.099023
2236	MANG 6497	MANG	6497	6497	6000	Spec Topic Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.102822	2025-11-20 22:15:07.102828
2237	MANG 6710	MANG	6710	6710	6000	Innovation Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.106842	2025-11-20 22:15:07.106848
2238	MANG 6760	MANG	6760	6760	6000	Managing Electronic Commerce		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.111015	2025-11-20 22:15:07.111021
2239	MKT 3501	MKT	3501	3501	3000	Principles of Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.115074	2025-11-20 22:15:07.11508
2240	MKT 3505	MKT	3505	3505	3000	Consumer Behavior		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.119114	2025-11-20 22:15:07.119119
2241	MKT 3510	MKT	3510	3510	3000	Intro to Marketing Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.123018	2025-11-20 22:15:07.123023
2242	MKT 3515	MKT	3515	3515	3000	Personal Selling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.127029	2025-11-20 22:15:07.127034
2243	MKT 3526	MKT	3526	3526	3000	Legal Environment of Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.131034	2025-11-20 22:15:07.131039
2244	MKT 3530	MKT	3530	3530	3000	Sales Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.135063	2025-11-20 22:15:07.135068
2245	MKT 3540	MKT	3540	3540	3000	Integrated Marketing Comm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.138758	2025-11-20 22:15:07.138764
2246	MKT 3552	MKT	3552	3552	3000	Retailing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.1427	2025-11-20 22:15:07.142706
2247	MKT 3580	MKT	3580	3580	3000	Digital Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.146728	2025-11-20 22:15:07.146734
2248	MKT 3590	MKT	3590	3590	3000	Topic Seminar in Marketing		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:07.150696	2025-11-20 22:15:07.150702
2249	MKT 3591	MKT	3591	3591	3000	Indep Study in Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.154386	2025-11-20 22:15:07.154391
2250	MKT 3599	MKT	3599	3599	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.158331	2025-11-20 22:15:07.158336
2251	MKT 4400	MKT	4400	4400	4000	Marketing Found for Managers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.162489	2025-11-20 22:15:07.162494
2252	MKT 4535	MKT	4535	4535	4000	Services Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.166546	2025-11-20 22:15:07.166551
2253	MKT 4536	MKT	4536	4536	4000	Health Care Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.170693	2025-11-20 22:15:07.170698
2254	MKT 4546	MKT	4546	4546	4000	Int�l Marketing Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.174664	2025-11-20 22:15:07.174669
2255	MKT 4575	MKT	4575	4575	4000	Logistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.17875	2025-11-20 22:15:07.178756
2256	MKT 4580	MKT	4580	4580	4000	Marketing Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.182349	2025-11-20 22:15:07.182355
2257	MKT 4585	MKT	4585	4585	4000	Marketing Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.186247	2025-11-20 22:15:07.186252
2258	MKT 4590	MKT	4590	4590	4000	Marketing Strategy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.189725	2025-11-20 22:15:07.189731
2259	MKT 4700	MKT	4700	4700	4000	Marketing Analytics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.193996	2025-11-20 22:15:07.194002
2260	MKT 5535	MKT	5535	5535	5000	Services Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.197914	2025-11-20 22:15:07.19792
2261	MKT 5536	MKT	5536	5536	5000	Health Care Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.201809	2025-11-20 22:15:07.201814
2262	MKT 5546	MKT	5546	5546	5000	Int�l Marketing Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.205783	2025-11-20 22:15:07.205789
2263	MKT 5575	MKT	5575	5575	5000	Logistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.209644	2025-11-20 22:15:07.209649
2264	MKT 5700	MKT	5700	5700	5000	Marketing Analytics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.213418	2025-11-20 22:15:07.213423
2265	MKT 6503	MKT	6503	6503	6000	Strategic Marketing Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.217424	2025-11-20 22:15:07.217429
2266	MKT 6510	MKT	6510	6510	6000	Adv Analysis Consumer Behavior		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.221379	2025-11-20 22:15:07.221385
2267	MKT 6526	MKT	6526	6526	6000	Sport Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.225434	2025-11-20 22:15:07.225439
2268	MKT 6535	MKT	6535	6535	6000	Advanced Services Mkt Mgt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.229394	2025-11-20 22:15:07.2294
2269	MKT 6536	MKT	6536	6536	6000	Seminar Hlth Care Mang		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:07.233015	2025-11-20 22:15:07.23302
2270	MKT 6546	MKT	6546	6546	6000	Adv Sem International Markting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.236554	2025-11-20 22:15:07.236559
2271	MKT 6555	MKT	6555	6555	6000	Marketing Research Methods		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.240293	2025-11-20 22:15:07.240298
2272	MKT 6575	MKT	6575	6575	6000	Logistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.243953	2025-11-20 22:15:07.24396
2273	MKT 6591	MKT	6591	6591	6000	Independent Study in Marketing		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.247942	2025-11-20 22:15:07.247947
2274	MKT 6594	MKT	6594	6594	6000	Internship in Marketing		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.251854	2025-11-20 22:15:07.251859
2275	MKT 6595	MKT	6595	6595	6000	Special Topics in Marketing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.255685	2025-11-20 22:15:07.25569
2276	MATH 1002	MATH	1002	1002	1000	Mathematics Freshman Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.259755	2025-11-20 22:15:07.259761
2277	MATH 1003	MATH	1003	1003	1000	Applied Algebra Support		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.26371	2025-11-20 22:15:07.263715
2278	MATH 1006	MATH	1006	1006	1000	Survey Math Supplement Support		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.267734	2025-11-20 22:15:07.267739
2279	MATH 1011	MATH	1011	1011	1000	Survey of Math Thought Support		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.271809	2025-11-20 22:15:07.271815
2280	MATH 1012	MATH	1012	1012	1000	Surv of Math II Support		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.275746	2025-11-20 22:15:07.275751
2281	MATH 1013	MATH	1013	1013	1000	Math Elem Teach Supp		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.279671	2025-11-20 22:15:07.279677
2282	MATH 1014	MATH	1014	1014	1000	Intro Stat Sci Supp		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.283502	2025-11-20 22:15:07.283508
2283	MATH 1015	MATH	1015	1015	1000	Applied Algebra Support		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.287513	2025-11-20 22:15:07.287519
2284	MATH 1021	MATH	1021	1021	1000	Prob Solv/Number Rel Elem Tchr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.29172	2025-11-20 22:15:07.291726
2285	MATH 1023	MATH	1023	1023	1000	Prob Solv Geometry Elem Tchrs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.295695	2025-11-20 22:15:07.2957
2286	MATH 1025	MATH	1025	1025	1000	Precalc Alg Support		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.299811	2025-11-20 22:15:07.299817
2287	MATH 1031	MATH	1031	1031	1000	Survey Mathematical Thought I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.303815	2025-11-20 22:15:07.30382
2288	MATH 1032	MATH	1032	1032	1000	Survey Mathematical Thought II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.307814	2025-11-20 22:15:07.307819
2289	MATH 1042	MATH	1042	1042	1000	Survey of Math Thought II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.311857	2025-11-20 22:15:07.311863
2290	MATH 1043	MATH	1043	1043	1000	Math Teacher Supp Support		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.315796	2025-11-20 22:15:07.315802
2291	MATH 1044	MATH	1044	1044	1000	Intro to Stats for Science		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.319764	2025-11-20 22:15:07.319769
2292	MATH 1045	MATH	1045	1045	1000	Precalc Algebra Supplement		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.323789	2025-11-20 22:15:07.323795
2293	MATH 1047	MATH	1047	1047	1000	Intro to Business Stats		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.327794	2025-11-20 22:15:07.3278
2294	MATH 1085	MATH	1085	1085	1000	Intro Bus Stat Supp		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.331785	2025-11-20 22:15:07.33179
2295	MATH 1115	MATH	1115	1115	1000	Applied Algebra		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.33554	2025-11-20 22:15:07.335545
2296	MATH 1125	MATH	1125	1125	1000	Precalculus Algebra		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.339329	2025-11-20 22:15:07.339335
2297	MATH 1126	MATH	1126	1126	1000	Precalculus Trigonometry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.343255	2025-11-20 22:15:07.34326
2298	MATH 2103	MATH	2103	2103	2000	Applied Calculus		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.347203	2025-11-20 22:15:07.347209
2299	MATH 2114	MATH	2114	2114	2000	Calculus I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.351231	2025-11-20 22:15:07.351237
2300	MATH 2124	MATH	2124	2124	2000	Calculus II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.355236	2025-11-20 22:15:07.355242
2301	MATH 2134	MATH	2134	2134	2000	Calculus III		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.359239	2025-11-20 22:15:07.359244
2302	MATH 2221	MATH	2221	2221	2000	Elem Differential Equations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.363311	2025-11-20 22:15:07.363317
2303	MATH 2314	MATH	2314	2314	2000	Elementary Statistical Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.367299	2025-11-20 22:15:07.367305
2304	MATH 2785	MATH	2785	2785	2000	Elementary Statistics for Business and Economics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.371669	2025-11-20 22:15:07.371675
2305	MATH 2998	MATH	2998	2998	2000	Independent Study: Readings		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.375699	2025-11-20 22:15:07.375704
2306	MATH 3099	MATH	3099	3099	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.37983	2025-11-20 22:15:07.379836
2307	MATH 3221	MATH	3221	3221	3000	Meth in Differential Equations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.383887	2025-11-20 22:15:07.383893
2308	MATH 3400	MATH	3400	3400	3000	Geometry		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.38794	2025-11-20 22:15:07.387946
2309	MATH 3511	MATH	3511	3511	3000	Intro to Linear Algebra		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.39203	2025-11-20 22:15:07.392035
2310	MATH 3512	MATH	3512	3512	3000	Introduction Abstract Algebra		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.396116	2025-11-20 22:15:07.396122
2311	MATH 3721	MATH	3721	3721	3000	Intro to Discrete Structures		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.40022	2025-11-20 22:15:07.400226
2312	MATH 3900	MATH	3900	3900	3000	Undergraduate Oral Examination		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.406026	2025-11-20 22:15:07.406035
2313	MATH 4101	MATH	4101	4101	4000	Advanced Calculus		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.411763	2025-11-20 22:15:07.411772
2314	MATH 4102	MATH	4102	4102	4000	Advanced Calculus		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.417479	2025-11-20 22:15:07.417488
2315	MATH 4221	MATH	4221	4221	4000	Intermed Ordinary Diff Equats		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.422907	2025-11-20 22:15:07.422915
2316	MATH 4224	MATH	4224	4224	4000	Partial Diff Equations I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.428282	2025-11-20 22:15:07.42829
2317	MATH 4230	MATH	4230	4230	4000	Finite Element Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.43309	2025-11-20 22:15:07.433097
2318	MATH 4270	MATH	4270	4270	4000	Intro to Optimization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.437593	2025-11-20 22:15:07.4376
2319	MATH 4301	MATH	4301	4301	4000	Analysis Variance & Exp Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.442112	2025-11-20 22:15:07.442118
2320	MATH 4304	MATH	4304	4304	4000	Intro to Regression Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.446349	2025-11-20 22:15:07.446355
2321	MATH 4311	MATH	4311	4311	4000	Intro Mathematical Statistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.451324	2025-11-20 22:15:07.451333
2322	MATH 4312	MATH	4312	4312	4000	Intro Mathematical Statistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.457082	2025-11-20 22:15:07.457092
2323	MATH 4373	MATH	4373	4373	4000	Data Analytics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.462715	2025-11-20 22:15:07.462723
2324	MATH 4385	MATH	4385	4385	4000	Statistical Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.468016	2025-11-20 22:15:07.468024
2325	MATH 4410	MATH	4410	4410	4000	Introduction to Quantum Nonlocality and Quantum Computing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.473185	2025-11-20 22:15:07.473193
2326	MATH 4411	MATH	4411	4411	4000	Intro to Complex Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.478259	2025-11-20 22:15:07.478266
2327	MATH 4511	MATH	4511	4511	4000	Linear Algebra		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.482967	2025-11-20 22:15:07.482974
2328	MATH 4611	MATH	4611	4611	4000	Topology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.487769	2025-11-20 22:15:07.487777
2329	MATH 4801	MATH	4801	4801	4000	Actuarial Prob I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.492452	2025-11-20 22:15:07.492458
2330	MATH 4802	MATH	4802	4802	4000	Actuarial Prob II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.497052	2025-11-20 22:15:07.497058
2331	MATH 4803	MATH	4803	4803	4000	Financial Math I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.50171	2025-11-20 22:15:07.50172
2332	MATH 4804	MATH	4804	4804	4000	Financial Math II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.50617	2025-11-20 22:15:07.506177
2333	MATH 4990	MATH	4990	4990	4000	Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.510557	2025-11-20 22:15:07.510586
2334	MATH 4998	MATH	4998	4998	4000	Selected Readings in Math		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.514654	2025-11-20 22:15:07.51466
2335	MATH 5101	MATH	5101	5101	5000	Advanced Calculus		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.519113	2025-11-20 22:15:07.519119
2336	MATH 5102	MATH	5102	5102	5000	Advanced Calculus		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.523251	2025-11-20 22:15:07.523257
2337	MATH 5221	MATH	5221	5221	5000	Intermed Ordinary Diff Equats		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.527338	2025-11-20 22:15:07.527344
2338	MATH 5224	MATH	5224	5224	5000	Partial Diff Equations I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.531433	2025-11-20 22:15:07.531439
2339	MATH 5230	MATH	5230	5230	5000	Finite Element Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.535412	2025-11-20 22:15:07.535418
2340	MATH 5270	MATH	5270	5270	5000	Intro to Optimization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.539472	2025-11-20 22:15:07.539478
2341	MATH 5280	MATH	5280	5280	5000	Math Modeling Continuous Systm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.543677	2025-11-20 22:15:07.543683
2342	MATH 5301	MATH	5301	5301	5000	Analysis Variance & Exp Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.547909	2025-11-20 22:15:07.547914
2343	MATH 5304	MATH	5304	5304	5000	Intro to Regression Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.551739	2025-11-20 22:15:07.551744
2344	MATH 5311	MATH	5311	5311	5000	Intro Mathematical Statistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.555756	2025-11-20 22:15:07.555761
2345	MATH 5312	MATH	5312	5312	5000	Intro Mathematical Statistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.559687	2025-11-20 22:15:07.559692
2346	MATH 5373	MATH	5373	5373	5000	Data Analytics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.564406	2025-11-20 22:15:07.564412
2347	MATH 5385	MATH	5385	5385	5000	Statistical Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.568969	2025-11-20 22:15:07.568975
2348	MATH 5410	MATH	5410	5410	5000	Intro to Quantum Nonlocality and Quantum Computing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.573236	2025-11-20 22:15:07.573242
2349	MATH 5411	MATH	5411	5411	5000	Intro to Complex Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.577409	2025-11-20 22:15:07.577415
2350	MATH 5511	MATH	5511	5511	5000	Linear Algebra		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.581607	2025-11-20 22:15:07.581612
2351	MATH 5611	MATH	5611	5611	5000	Topology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.585667	2025-11-20 22:15:07.585673
2352	MATH 5801	MATH	5801	5801	5000	Actuarial Prob I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.589716	2025-11-20 22:15:07.589722
2353	MATH 5802	MATH	5802	5802	5000	Actuarial Prob II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.593828	2025-11-20 22:15:07.593834
2354	MATH 5803	MATH	5803	5803	5000	Financial Math I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.597881	2025-11-20 22:15:07.597886
2355	MATH 5804	MATH	5804	5804	5000	Financial Math II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.601773	2025-11-20 22:15:07.601778
2356	MATH 5990	MATH	5990	5990	5000	Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.605778	2025-11-20 22:15:07.605784
2357	MATH 5991	MATH	5991	5991	5000	Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.609818	2025-11-20 22:15:07.609824
2358	MATH 5992	MATH	5992	5992	5000	Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.613849	2025-11-20 22:15:07.613855
2359	MATH 6201	MATH	6201	6201	6000	Introduction to Applied Math		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.617805	2025-11-20 22:15:07.617811
2360	MATH 6221	MATH	6221	6221	6000	Adv Differential Equations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.621718	2025-11-20 22:15:07.621723
2361	MATH 6224	MATH	6224	6224	6000	Partial Differential Eqs II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.625588	2025-11-20 22:15:07.625594
2362	MATH 6230	MATH	6230	6230	6000	Adv Finite Element Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.629459	2025-11-20 22:15:07.629464
2363	MATH 6242	MATH	6242	6242	6000	Functional Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.633531	2025-11-20 22:15:07.633536
2364	MATH 6270	MATH	6270	6270	6000	Advanced Optimization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.637748	2025-11-20 22:15:07.637754
2365	MATH 6300	MATH	6300	6300	6000	Statistical Programming SAS		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.64185	2025-11-20 22:15:07.641856
2366	MATH 6301	MATH	6301	6301	6000	Applied Statistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.645932	2025-11-20 22:15:07.645937
2367	MATH 6303	MATH	6303	6303	6000	Multivariate Statistical Analy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.649693	2025-11-20 22:15:07.649698
2368	MATH 6304	MATH	6304	6304	6000	Regression Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.653677	2025-11-20 22:15:07.653682
2369	MATH 6311	MATH	6311	6311	6000	Mathematical Statistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.657532	2025-11-20 22:15:07.657537
2370	MATH 6312	MATH	6312	6312	6000	Mathematical Statistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.661547	2025-11-20 22:15:07.661552
2371	MATH 6331	MATH	6331	6331	6000	Categorical Data Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.665599	2025-11-20 22:15:07.665605
2372	MATH 6341	MATH	6341	6341	6000	Linear Statistical Models		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.669646	2025-11-20 22:15:07.669652
2373	MATH 6351	MATH	6351	6351	6000	Time Series Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.67377	2025-11-20 22:15:07.673776
2374	MATH 6362	MATH	6362	6362	6000	Reliability Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.677828	2025-11-20 22:15:07.677834
2375	MATH 6370	MATH	6370	6370	6000	Statistical Consulting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.681898	2025-11-20 22:15:07.681903
2376	MATH 6373	MATH	6373	6373	6000	Advanced Data Analytics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.68584	2025-11-20 22:15:07.685845
2377	MATH 6375	MATH	6375	6375	6000	Advanced Statistical Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.689628	2025-11-20 22:15:07.689634
2378	MATH 6382	MATH	6382	6382	6000	Statistical Analy Surv Data		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.69279	2025-11-20 22:15:07.692795
2379	MATH 6385	MATH	6385	6385	6000	Longitudinal Data Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.695689	2025-11-20 22:15:07.695694
2380	MATH 6450	MATH	6450	6450	6000	Measure & Integration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.698259	2025-11-20 22:15:07.698264
2381	MATH 6490	MATH	6490	6490	6000	Topics in Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.70088	2025-11-20 22:15:07.700884
2382	MATH 6998	MATH	6998	6998	6000	Advanced Readings in Math		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.703401	2025-11-20 22:15:07.703404
2383	MATH 7000	MATH	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.705448	2025-11-20 22:15:07.705452
2384	MATH 7040	MATH	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.707536	2025-11-20 22:15:07.70754
2385	MATH 7050	MATH	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.709589	2025-11-20 22:15:07.709593
2386	ENME 1781	ENME	1781	1781	1000	Computer Aided Engr Graphics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.711637	2025-11-20 22:15:07.711641
2387	ENME 2711	ENME	2711	2711	2000	Mater & Process Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.713804	2025-11-20 22:15:07.713808
2388	ENME 2740	ENME	2740	2740	2000	Structs & Prop of Materials		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.715856	2025-11-20 22:15:07.71586
2389	ENME 2750	ENME	2750	2750	2000	Dynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.717867	2025-11-20 22:15:07.71787
2390	ENME 2770	ENME	2770	2770	2000	Engineering Thermodynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.719891	2025-11-20 22:15:07.719894
2391	ENME 2785	ENME	2785	2785	2000	Intro Manufacturing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.7219	2025-11-20 22:15:07.721904
2392	ENME 3020	ENME	3020	3020	3000	Engineering Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.723898	2025-11-20 22:15:07.723902
2393	ENME 3093	ENME	3093	3093	3000	Independent Special Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.725967	2025-11-20 22:15:07.72597
2394	ENME 3711	ENME	3711	3711	3000	Thermal Sciences Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.727968	2025-11-20 22:15:07.727971
2395	ENME 3716	ENME	3716	3716	3000	Fluid Mechanics Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.729973	2025-11-20 22:15:07.729977
2396	ENME 3720	ENME	3720	3720	3000	Fluid Mechanics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.73248	2025-11-20 22:15:07.732483
2397	ENME 3734	ENME	3734	3734	3000	Machine Elements		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.735774	2025-11-20 22:15:07.735778
2398	ENME 3735	ENME	3735	3735	3000	Mechanism Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.739024	2025-11-20 22:15:07.739028
2399	ENME 3771	ENME	3771	3771	3000	Heat Transfer		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.742314	2025-11-20 22:15:07.742318
2400	ENME 3776	ENME	3776	3776	3000	Intermed Engr Thermodynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.745655	2025-11-20 22:15:07.745658
2401	ENME 3780	ENME	3780	3780	3000	Intro to Comp Solid Mechanics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.748774	2025-11-20 22:15:07.748778
2402	ENME 3900	ENME	3900	3900	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.752065	2025-11-20 22:15:07.752068
2403	ENME 4023	ENME	4023	4023	4000	Intermed Engineering Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.755325	2025-11-20 22:15:07.755329
2404	ENME 4096	ENME	4096	4096	4000	Independent Study in Mech Eng		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.758609	2025-11-20 22:15:07.758612
2405	ENME 4097	ENME	4097	4097	4000	Special Topic in Mech Eng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.761709	2025-11-20 22:15:07.761713
2406	ENME 4721	ENME	4721	4721	4000	Gas Dynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.764915	2025-11-20 22:15:07.764919
2407	ENME 4723	ENME	4723	4723	4000	Ocean & Coastal Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.768252	2025-11-20 22:15:07.768256
2408	ENME 4724	ENME	4724	4724	4000	Fluid Flow Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.771431	2025-11-20 22:15:07.771435
2409	ENME 4728	ENME	4728	4728	4000	Intro Computat Fluid Dynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.774796	2025-11-20 22:15:07.774799
2410	ENME 4733	ENME	4733	4733	4000	Machine Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.778173	2025-11-20 22:15:07.778177
2411	ENME 4734	ENME	4734	4734	4000	Rel Avail Mainten Engr System		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.781479	2025-11-20 22:15:07.781483
2412	ENME 4741	ENME	4741	4741	4000	Corrosion Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.784944	2025-11-20 22:15:07.784949
2413	ENME 4753	ENME	4753	4753	4000	Process Control Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.788547	2025-11-20 22:15:07.788551
2414	ENME 4754	ENME	4754	4754	4000	Mech Vibration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.792073	2025-11-20 22:15:07.792077
2415	ENME 4765	ENME	4765	4765	4000	Intro Petroleum Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.795639	2025-11-20 22:15:07.795644
2416	ENME 4771	ENME	4771	4771	4000	Intermediate Heat Transfer		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.799311	2025-11-20 22:15:07.799316
2417	ENME 4772	ENME	4772	4772	4000	Internal Combustion Engines		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.803004	2025-11-20 22:15:07.803009
2418	ENME 4773	ENME	4773	4773	4000	Energy Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.806734	2025-11-20 22:15:07.806739
2419	ENME 4774	ENME	4774	4774	4000	Gas Turbine Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.810467	2025-11-20 22:15:07.810472
2420	ENME 4777	ENME	4777	4777	4000	Design Thermlluid Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.814269	2025-11-20 22:15:07.814274
2421	ENME 4786	ENME	4786	4786	4000	Additive Manufacturing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.818072	2025-11-20 22:15:07.818077
2422	ENME 5023	ENME	5023	5023	5000	Intermed Engineering Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.821833	2025-11-20 22:15:07.821838
2423	ENME 5097	ENME	5097	5097	5000	Special Topic in Mech Eng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.82569	2025-11-20 22:15:07.825695
2424	ENME 5721	ENME	5721	5721	5000	Gas Dynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.829547	2025-11-20 22:15:07.829553
2425	ENME 5723	ENME	5723	5723	5000	Ocean & Coastal Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.833466	2025-11-20 22:15:07.833471
2426	ENME 5724	ENME	5724	5724	5000	Fluid Flow Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.837504	2025-11-20 22:15:07.83751
2427	ENME 5725	ENME	5725	5725	5000	Incompressible Aerodynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.841511	2025-11-20 22:15:07.841516
2428	ENME 5728	ENME	5728	5728	5000	Intro Computat Fluid Dynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.845522	2025-11-20 22:15:07.845527
2429	ENME 5734	ENME	5734	5734	5000	Rel Avail Mainten Engr System		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.849504	2025-11-20 22:15:07.849509
2430	ENME 5741	ENME	5741	5741	5000	Corrosion Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.853355	2025-11-20 22:15:07.85336
2431	ENME 5753	ENME	5753	5753	5000	Process Control Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.856959	2025-11-20 22:15:07.856965
2432	ENME 5754	ENME	5754	5754	5000	Mech Vibration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.860803	2025-11-20 22:15:07.860808
2433	ENME 5771	ENME	5771	5771	5000	Intermediate Heat Transfer		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.864454	2025-11-20 22:15:07.864459
2434	ENME 5772	ENME	5772	5772	5000	Internal Combustion Engines		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.868406	2025-11-20 22:15:07.868411
2435	ENME 5773	ENME	5773	5773	5000	Energy Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.872083	2025-11-20 22:15:07.872088
2436	ENME 5774	ENME	5774	5774	5000	Gas Turbine Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.875707	2025-11-20 22:15:07.875712
2437	ENME 5786	ENME	5786	5786	5000	Additive Manufacturing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.879605	2025-11-20 22:15:07.87961
2438	ENME 6024	ENME	6024	6024	6000	Boundary Value Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.883454	2025-11-20 22:15:07.883459
2439	ENME 6026	ENME	6026	6026	6000	Model in Mechanics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.887313	2025-11-20 22:15:07.887318
2440	ENME 6028	ENME	6028	6028	6000	Finite Element Methods Engr An		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.891116	2025-11-20 22:15:07.891121
2441	ENME 6058	ENME	6058	6058	6000	Computational Mechanics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.897339	2025-11-20 22:15:07.897349
2442	ENME 6090	ENME	6090	6090	6000	Research Seminar		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:07.903353	2025-11-20 22:15:07.903363
2443	ENME 6095	ENME	6095	6095	6000	Independent Special Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.909374	2025-11-20 22:15:07.909383
2444	ENME 6096	ENME	6096	6096	6000	Ind Spec Topics Mech Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.916399	2025-11-20 22:15:07.91641
2445	ENME 6097	ENME	6097	6097	6000	Adv Spec Topics Mech Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.921451	2025-11-20 22:15:07.921459
2446	ENME 6354	ENME	6354	6354	6000	Theory of Elasticity		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.926288	2025-11-20 22:15:07.926295
2447	ENME 6355	ENME	6355	6355	6000	Theory Plates & Shells		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.930834	2025-11-20 22:15:07.93084
2448	ENME 6357	ENME	6357	6357	6000	Fracture Mechanics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.935315	2025-11-20 22:15:07.935322
2449	ENME 6362	ENME	6362	6362	6000	Aerospace Composite Structures		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.939545	2025-11-20 22:15:07.939552
2450	ENME 6364	ENME	6364	6364	6000	Advanced Composite Materials		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.943979	2025-11-20 22:15:07.943986
2451	ENME 6724	ENME	6724	6724	6000	Viscous Flow		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.948486	2025-11-20 22:15:07.948492
2452	ENME 6727	ENME	6727	6727	6000	Turbulence		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.95282	2025-11-20 22:15:07.952826
2453	ENME 6728	ENME	6728	6728	6000	Adv Computatnl Fluid Dynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.957041	2025-11-20 22:15:07.957047
2454	ENME 6753	ENME	6753	6753	6000	Advanced Continuum Mechanics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.961098	2025-11-20 22:15:07.961104
2455	ENME 6755	ENME	6755	6755	6000	Advanced Vibrations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.965285	2025-11-20 22:15:07.965291
2456	ENME 6756	ENME	6756	6756	6000	Theory of Plasticity		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.969264	2025-11-20 22:15:07.96927
2457	ENME 6770	ENME	6770	6770	6000	Advanced Thermodynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.973398	2025-11-20 22:15:07.973403
2458	ENME 6772	ENME	6772	6772	6000	Convection Heat Transfer		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.977529	2025-11-20 22:15:07.977535
2459	MILS 1001	MILS	1001	1001	1000	Intro to Army & Critical Think		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.981787	2025-11-20 22:15:07.981793
2460	MILS 1002	MILS	1002	1002	1000	Found.of Agile & Adoptv Leadrs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.985924	2025-11-20 22:15:07.985929
2461	MILS 2001	MILS	2001	2001	2000	Leadership and Decision Making		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.989902	2025-11-20 22:15:07.989908
2462	MILS 2002	MILS	2002	2002	2000	Army Doctrine and Team Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.993924	2025-11-20 22:15:07.99393
2463	MILS 2530	MILS	2530	2530	2000	Military History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:07.997991	2025-11-20 22:15:07.997996
2464	MILS 3001	MILS	3001	3001	3000	Training Management & Warfight		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.002065	2025-11-20 22:15:08.002071
2465	MILS 3002	MILS	3002	3002	3000	App Leadership in Small Unit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.006281	2025-11-20 22:15:08.006287
2466	MILS 4001	MILS	4001	4001	4000	The Army Officer & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.010305	2025-11-20 22:15:08.010311
2467	MILS 4002	MILS	4002	4002	4000	Company Grade Leadership & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.014123	2025-11-20 22:15:08.014149
2468	MILS 5001	MILS	5001	5001	5000	The Army Officer & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.018267	2025-11-20 22:15:08.018273
2469	MILS 5002	MILS	5002	5002	5000	Company Grade Leadership & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.022296	2025-11-20 22:15:08.022301
2470	MUS 1000	MUS	1000	1000	1000	Music Appreciation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.026343	2025-11-20 22:15:08.026348
2471	MUS 1003	MUS	1003	1003	1000	Early Jazz		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.030257	2025-11-20 22:15:08.030263
2472	MUS 1005	MUS	1005	1005	1000	Intro to Music Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.034295	2025-11-20 22:15:08.0343
2473	MUS 1100	MUS	1100	1100	1000	Fundamentals of Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.03819	2025-11-20 22:15:08.038196
2474	MUS 1101	MUS	1101	1101	1000	Theoretical Foundations I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.042227	2025-11-20 22:15:08.042233
2475	MUS 1102	MUS	1102	1102	1000	Theoretical Foundations II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.046244	2025-11-20 22:15:08.046249
2476	MUS 1103	MUS	1103	1103	1000	Elementary Musicianship		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.050368	2025-11-20 22:15:08.050373
2477	MUS 1104	MUS	1104	1104	1000	Elementary Musicianship		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.054166	2025-11-20 22:15:08.054171
2478	MUS 1105	MUS	1105	1105	1000	Music Theory I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.057541	2025-11-20 22:15:08.057546
2479	MUS 1106	MUS	1106	1106	1000	Music Theory II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.061499	2025-11-20 22:15:08.061505
2480	MUS 1111	MUS	1111	1111	1000	Music Notation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.065483	2025-11-20 22:15:08.065488
2481	MUS 1200	MUS	1200	1200	1000	Appld Lessons Nonmajors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.069381	2025-11-20 22:15:08.069386
2482	MUS 1401	MUS	1401	1401	1000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.073185	2025-11-20 22:15:08.073191
2483	MUS 1402	MUS	1402	1402	1000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.077196	2025-11-20 22:15:08.077201
2484	MUS 1405	MUS	1405	1405	1000	Piano Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.081191	2025-11-20 22:15:08.081197
2485	MUS 1406	MUS	1406	1406	1000	Piano Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.085198	2025-11-20 22:15:08.085204
2486	MUS 1407	MUS	1407	1407	1000	Piano Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.08928	2025-11-20 22:15:08.089285
2487	MUS 1408	MUS	1408	1408	1000	Piano Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.093258	2025-11-20 22:15:08.093263
2488	MUS 1411	MUS	1411	1411	1000	Piano for Everyone		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.097276	2025-11-20 22:15:08.097281
2489	MUS 1412	MUS	1412	1412	1000	Piano for Everyone II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.101289	2025-11-20 22:15:08.101295
2490	MUS 1431	MUS	1431	1431	1000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.105285	2025-11-20 22:15:08.105291
2491	MUS 1432	MUS	1432	1432	1000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.109385	2025-11-20 22:15:08.109391
2492	MUS 1501	MUS	1501	1501	1000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.113347	2025-11-20 22:15:08.113353
2493	MUS 1502	MUS	1502	1502	1000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.117304	2025-11-20 22:15:08.117309
2494	MUS 1505	MUS	1505	1505	1000	Voice Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.121373	2025-11-20 22:15:08.121379
2495	MUS 1507	MUS	1507	1507	1000	Voice Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.125528	2025-11-20 22:15:08.125534
2496	MUS 1508	MUS	1508	1508	1000	Voice Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.129536	2025-11-20 22:15:08.129542
2497	MUS 1511	MUS	1511	1511	1000	Voice Class Nnusic Majors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.1334	2025-11-20 22:15:08.133405
2498	MUS 1512	MUS	1512	1512	1000	Voice Class Nnusic Majors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.137481	2025-11-20 22:15:08.137486
2499	MUS 1531	MUS	1531	1531	1000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.141431	2025-11-20 22:15:08.141436
2500	MUS 1532	MUS	1532	1532	1000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.145654	2025-11-20 22:15:08.14566
2501	MUS 1601	MUS	1601	1601	1000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.149826	2025-11-20 22:15:08.149831
2502	MUS 1602	MUS	1602	1602	1000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.153784	2025-11-20 22:15:08.15379
2503	MUS 1611	MUS	1611	1611	1000	Guitar for Everyone		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.157802	2025-11-20 22:15:08.157807
2504	MUS 1612	MUS	1612	1612	1000	Guitar for Everyone		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.161846	2025-11-20 22:15:08.161852
2505	MUS 1631	MUS	1631	1631	1000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.165903	2025-11-20 22:15:08.165909
2506	MUS 1632	MUS	1632	1632	1000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.170045	2025-11-20 22:15:08.17005
2507	MUS 1701	MUS	1701	1701	1000	Applied Woodwind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.174004	2025-11-20 22:15:08.174009
2508	MUS 1702	MUS	1702	1702	1000	Applied Woodwind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.177609	2025-11-20 22:15:08.177615
2509	MUS 1711	MUS	1711	1711	1000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.181537	2025-11-20 22:15:08.181542
2510	MUS 1712	MUS	1712	1712	1000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.185637	2025-11-20 22:15:08.185643
2511	MUS 1721	MUS	1721	1721	1000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.189702	2025-11-20 22:15:08.189708
2512	MUS 1722	MUS	1722	1722	1000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.193653	2025-11-20 22:15:08.193659
2513	MUS 1731	MUS	1731	1731	1000	Applied Woodwind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.197749	2025-11-20 22:15:08.197755
2514	MUS 1732	MUS	1732	1732	1000	Applied Woodwind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.201694	2025-11-20 22:15:08.2017
2515	MUS 1741	MUS	1741	1741	1000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.205661	2025-11-20 22:15:08.205666
2516	MUS 1742	MUS	1742	1742	1000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.209616	2025-11-20 22:15:08.209621
2517	MUS 1781	MUS	1781	1781	1000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.213582	2025-11-20 22:15:08.213588
2518	MUS 1782	MUS	1782	1782	1000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.217558	2025-11-20 22:15:08.217584
2519	MUS 1811	MUS	1811	1811	1000	Intro to Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.221696	2025-11-20 22:15:08.221702
2520	MUS 1900	MUS	1900	1900	1000	Student Recital		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.225767	2025-11-20 22:15:08.225773
2521	MUS 1901	MUS	1901	1901	1000	Chamber Ensemble		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.229872	2025-11-20 22:15:08.229878
2522	MUS 1902	MUS	1902	1902	1000	University Jazz Band		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.234062	2025-11-20 22:15:08.234068
2523	MUS 1904	MUS	1904	1904	1000	UNO Chorus		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.238082	2025-11-20 22:15:08.238088
2524	MUS 1905	MUS	1905	1905	1000	University Chorale		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.242373	2025-11-20 22:15:08.242389
2525	MUS 1907	MUS	1907	1907	1000	Piano Accompaniment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.246882	2025-11-20 22:15:08.246888
2526	MUS 1908	MUS	1908	1908	1000	Wind Ensemble		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.250903	2025-11-20 22:15:08.250909
2527	MUS 1910	MUS	1910	1910	1000	University Orchestra		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.254879	2025-11-20 22:15:08.254885
2528	MUS 2000	MUS	2000	2000	2000	Field Research in Arts		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:08.25881	2025-11-20 22:15:08.258816
2529	MUS 2001	MUS	2001	2001	2000	Special Topisusic		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.26291	2025-11-20 22:15:08.262916
2530	MUS 2006	MUS	2006	2006	2000	Jazz History		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.266998	2025-11-20 22:15:08.267004
2531	MUS 2101	MUS	2101	2101	2000	Music Theory III		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.270713	2025-11-20 22:15:08.270718
2532	MUS 2103	MUS	2103	2103	2000	Advanced Musicianship		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.274719	2025-11-20 22:15:08.274725
2533	MUS 2109	MUS	2109	2109	2000	Jazz Harmony and Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.278665	2025-11-20 22:15:08.27867
2534	MUS 2110	MUS	2110	2110	2000	Jazz Harmony and Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.282465	2025-11-20 22:15:08.28247
2535	MUS 2201	MUS	2201	2201	2000	History of Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.286446	2025-11-20 22:15:08.286452
2536	MUS 2202	MUS	2202	2202	2000	History of Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.290438	2025-11-20 22:15:08.290444
2537	MUS 2401	MUS	2401	2401	2000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.294438	2025-11-20 22:15:08.294444
2538	MUS 2402	MUS	2402	2402	2000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.298369	2025-11-20 22:15:08.298374
2539	MUS 2406	MUS	2406	2406	2000	Advanced Piano Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.302248	2025-11-20 22:15:08.302254
2540	MUS 2431	MUS	2431	2431	2000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.306383	2025-11-20 22:15:08.306388
2541	MUS 2432	MUS	2432	2432	2000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.310275	2025-11-20 22:15:08.31028
2542	MUS 2501	MUS	2501	2501	2000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.31404	2025-11-20 22:15:08.314045
2543	MUS 2502	MUS	2502	2502	2000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.318024	2025-11-20 22:15:08.318029
2544	MUS 2531	MUS	2531	2531	2000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.322	2025-11-20 22:15:08.322006
2545	MUS 2532	MUS	2532	2532	2000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.325901	2025-11-20 22:15:08.325906
2546	MUS 2601	MUS	2601	2601	2000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.329966	2025-11-20 22:15:08.329971
2547	MUS 2602	MUS	2602	2602	2000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.334064	2025-11-20 22:15:08.334069
2548	MUS 2605	MUS	2605	2605	2000	Jazz Keyboard Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.33807	2025-11-20 22:15:08.338076
2549	MUS 2606	MUS	2606	2606	2000	Jazz Keyboard Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.342291	2025-11-20 22:15:08.342296
2550	MUS 2631	MUS	2631	2631	2000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.346364	2025-11-20 22:15:08.34637
2551	MUS 2632	MUS	2632	2632	2000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.350606	2025-11-20 22:15:08.350611
2552	MUS 2701	MUS	2701	2701	2000	Applied Woodwind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.354751	2025-11-20 22:15:08.354757
2553	MUS 2702	MUS	2702	2702	2000	Applied Woodwind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.358789	2025-11-20 22:15:08.358795
2554	MUS 2711	MUS	2711	2711	2000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.362902	2025-11-20 22:15:08.362908
2555	MUS 2712	MUS	2712	2712	2000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.366951	2025-11-20 22:15:08.366957
2556	MUS 2721	MUS	2721	2721	2000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.37091	2025-11-20 22:15:08.370915
2557	MUS 2722	MUS	2722	2722	2000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.374932	2025-11-20 22:15:08.374938
2558	MUS 2731	MUS	2731	2731	2000	Applied Woodwind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.37897	2025-11-20 22:15:08.378976
2559	MUS 2732	MUS	2732	2732	2000	Applied Woodwind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.382929	2025-11-20 22:15:08.382935
2560	MUS 2741	MUS	2741	2741	2000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.386789	2025-11-20 22:15:08.386794
2561	MUS 2742	MUS	2742	2742	2000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.390802	2025-11-20 22:15:08.390808
2562	MUS 2781	MUS	2781	2781	2000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.394789	2025-11-20 22:15:08.394794
2563	MUS 2782	MUS	2782	2782	2000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.398605	2025-11-20 22:15:08.39861
2564	MUS 2801	MUS	2801	2801	2000	Applied Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.402548	2025-11-20 22:15:08.402554
2565	MUS 2802	MUS	2802	2802	2000	Applied Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.406501	2025-11-20 22:15:08.406506
2566	MUS 3011	MUS	3011	3011	3000	Music Theory IV		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.410413	2025-11-20 22:15:08.410418
2567	MUS 3013	MUS	3013	3013	3000	Advanced Musicianship		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.414401	2025-11-20 22:15:08.414406
2568	MUS 3091	MUS	3091	3091	3000	Spec Topics in Great Composers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.418427	2025-11-20 22:15:08.418433
2569	MUS 3099	MUS	3099	3099	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:08.422476	2025-11-20 22:15:08.422482
2570	MUS 3111	MUS	3111	3111	3000	Conducting I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.426375	2025-11-20 22:15:08.42638
2571	MUS 3112	MUS	3112	3112	3000	Conducting II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.429942	2025-11-20 22:15:08.429947
2572	MUS 3150	MUS	3150	3150	3000	Music Theory Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.433804	2025-11-20 22:15:08.433809
2573	MUS 3200	MUS	3200	3200	3000	Appld Lessons Non Maj		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.437801	2025-11-20 22:15:08.437806
2574	MUS 3207	MUS	3207	3207	3000	History of Hip Hop Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.44149	2025-11-20 22:15:08.441495
2575	MUS 3211	MUS	3211	3211	3000	Music History I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.445438	2025-11-20 22:15:08.445443
2576	MUS 3212	MUS	3212	3212	3000	Music History II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.449746	2025-11-20 22:15:08.449751
2577	MUS 3250	MUS	3250	3250	3000	Music History Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.453764	2025-11-20 22:15:08.453769
2578	MUS 3401	MUS	3401	3401	3000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.45786	2025-11-20 22:15:08.457866
2579	MUS 3402	MUS	3402	3402	3000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.461773	2025-11-20 22:15:08.461778
2580	MUS 3431	MUS	3431	3431	3000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.464792	2025-11-20 22:15:08.464797
2581	MUS 3432	MUS	3432	3432	3000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.467586	2025-11-20 22:15:08.467591
2582	MUS 3451	MUS	3451	3451	3000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.470218	2025-11-20 22:15:08.470223
2583	MUS 3452	MUS	3452	3452	3000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.472942	2025-11-20 22:15:08.472947
2584	MUS 3501	MUS	3501	3501	3000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.475591	2025-11-20 22:15:08.475596
2585	MUS 3502	MUS	3502	3502	3000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.477629	2025-11-20 22:15:08.477632
2586	MUS 3531	MUS	3531	3531	3000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.479611	2025-11-20 22:15:08.479614
2587	MUS 3532	MUS	3532	3532	3000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.481647	2025-11-20 22:15:08.481651
2588	MUS 3551	MUS	3551	3551	3000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.483641	2025-11-20 22:15:08.483645
2589	MUS 3552	MUS	3552	3552	3000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.485671	2025-11-20 22:15:08.485675
2590	MUS 3601	MUS	3601	3601	3000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.487676	2025-11-20 22:15:08.48768
2591	MUS 3602	MUS	3602	3602	3000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.489669	2025-11-20 22:15:08.489672
2592	MUS 3631	MUS	3631	3631	3000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.491615	2025-11-20 22:15:08.491619
2593	MUS 3632	MUS	3632	3632	3000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.493585	2025-11-20 22:15:08.493589
2594	MUS 3651	MUS	3651	3651	3000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.495715	2025-11-20 22:15:08.495719
2595	MUS 3652	MUS	3652	3652	3000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.497666	2025-11-20 22:15:08.497669
2596	MUS 3701	MUS	3701	3701	3000	Applied Woodwinds		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.499641	2025-11-20 22:15:08.499645
2597	MUS 3702	MUS	3702	3702	3000	Applied Woodwinds		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.501586	2025-11-20 22:15:08.501591
2598	MUS 3705	MUS	3705	3705	3000	Jazz Improvisation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.503554	2025-11-20 22:15:08.503557
2599	MUS 3706	MUS	3706	3706	3000	Jazz Improvisation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.50682	2025-11-20 22:15:08.506823
2600	MUS 3711	MUS	3711	3711	3000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.510042	2025-11-20 22:15:08.510046
2601	MUS 3712	MUS	3712	3712	3000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.513282	2025-11-20 22:15:08.513286
2602	MUS 3721	MUS	3721	3721	3000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.517187	2025-11-20 22:15:08.517191
2603	MUS 3722	MUS	3722	3722	3000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.520241	2025-11-20 22:15:08.520245
2604	MUS 3731	MUS	3731	3731	3000	Applied Woodwinds		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.523622	2025-11-20 22:15:08.523626
2605	MUS 3732	MUS	3732	3732	3000	Applied Woodwinds		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.526888	2025-11-20 22:15:08.526892
2606	MUS 3741	MUS	3741	3741	3000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.530169	2025-11-20 22:15:08.530173
2607	MUS 3742	MUS	3742	3742	3000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.53335	2025-11-20 22:15:08.533354
2608	MUS 3751	MUS	3751	3751	3000	Applied Woodwind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.536625	2025-11-20 22:15:08.536629
2609	MUS 3752	MUS	3752	3752	3000	Applied Woodwind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.539433	2025-11-20 22:15:08.539437
2610	MUS 3761	MUS	3761	3761	3000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.542759	2025-11-20 22:15:08.542763
2611	MUS 3762	MUS	3762	3762	3000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.546031	2025-11-20 22:15:08.546035
2612	MUS 3771	MUS	3771	3771	3000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.549516	2025-11-20 22:15:08.549521
2613	MUS 3772	MUS	3772	3772	3000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.552896	2025-11-20 22:15:08.5529
2614	MUS 3781	MUS	3781	3781	3000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.556334	2025-11-20 22:15:08.556338
2615	MUS 3782	MUS	3782	3782	3000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.56	2025-11-20 22:15:08.560004
2616	MUS 3801	MUS	3801	3801	3000	Applied Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.563586	2025-11-20 22:15:08.563591
2617	MUS 3802	MUS	3802	3802	3000	Applied Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.567281	2025-11-20 22:15:08.567286
2618	MUS 3950	MUS	3950	3950	3000	Half Recital in Performance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.570976	2025-11-20 22:15:08.570981
2619	MUS 3960	MUS	3960	3960	3000	Half Recital in Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.574798	2025-11-20 22:15:08.574803
2620	MUS 3990	MUS	3990	3990	3000	Full Recital		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.578779	2025-11-20 22:15:08.578784
2621	MUS 4001	MUS	4001	4001	4000	Special Topics in Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.582732	2025-11-20 22:15:08.582737
2622	MUS 4101	MUS	4101	4101	4000	Contrapuntal Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.586479	2025-11-20 22:15:08.586484
2623	MUS 4102	MUS	4102	4102	4000	20th Century Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.590372	2025-11-20 22:15:08.590377
2624	MUS 4103	MUS	4103	4103	4000	Digital Music Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.594054	2025-11-20 22:15:08.594059
2625	MUS 4104	MUS	4104	4104	4000	Advanced Digital Music Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.597949	2025-11-20 22:15:08.597954
2626	MUS 4105	MUS	4105	4105	4000	Advanced Orchestration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.601866	2025-11-20 22:15:08.601872
2627	MUS 4106	MUS	4106	4106	4000	Audio Recording		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.605785	2025-11-20 22:15:08.60579
2628	MUS 4107	MUS	4107	4107	4000	Post Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.609696	2025-11-20 22:15:08.609701
2629	MUS 4109	MUS	4109	4109	4000	Adv Jazz Harmony and Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.61371	2025-11-20 22:15:08.613715
2630	MUS 4110	MUS	4110	4110	4000	Adv Jazz Harmony and Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.617686	2025-11-20 22:15:08.617691
2631	MUS 4111	MUS	4111	4111	4000	Conducting III		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.62179	2025-11-20 22:15:08.621796
2632	MUS 4112	MUS	4112	4112	4000	Conducting IV		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.625917	2025-11-20 22:15:08.625922
2633	MUS 4150	MUS	4150	4150	4000	Senior Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.629867	2025-11-20 22:15:08.629872
2634	MUS 4203	MUS	4203	4203	4000	Studies in Baroque Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.633384	2025-11-20 22:15:08.63339
2635	MUS 4204	MUS	4204	4204	4000	Studies Mus of Classical Era		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.63732	2025-11-20 22:15:08.637325
2636	MUS 4205	MUS	4205	4205	4000	Studies Mus of Romantic Era		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.641286	2025-11-20 22:15:08.641291
2637	MUS 4206	MUS	4206	4206	4000	20th Century Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.645238	2025-11-20 22:15:08.645243
2638	MUS 4207	MUS	4207	4207	4000	Seminar in Jazz History		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:08.649173	2025-11-20 22:15:08.649178
2639	MUS 4208	MUS	4208	4208	4000	Aesthetics of Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.653318	2025-11-20 22:15:08.653324
2640	MUS 4310	MUS	4310	4310	4000	Vocal Pedagogy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.657422	2025-11-20 22:15:08.657427
2641	MUS 4311	MUS	4311	4311	4000	Piano Pedagogy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.661434	2025-11-20 22:15:08.66144
2642	MUS 4312	MUS	4312	4312	4000	Instrumental Music Pedagogy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.665298	2025-11-20 22:15:08.665304
2643	MUS 4598	MUS	4598	4598	4000	Composing for Adv Game Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.669259	2025-11-20 22:15:08.669265
2644	MUS 4705	MUS	4705	4705	4000	Advanced Jazz Improvisation I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.673404	2025-11-20 22:15:08.673409
2645	MUS 4706	MUS	4706	4706	4000	Advanced Jazz Improvisation II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.677531	2025-11-20 22:15:08.677537
2646	MUS 4801	MUS	4801	4801	4000	Applied Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.681651	2025-11-20 22:15:08.681656
2647	MUS 4802	MUS	4802	4802	4000	Applied Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.685826	2025-11-20 22:15:08.685831
2648	MUS 4806	MUS	4806	4806	4000	Jazz Composition and Arranging		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.68986	2025-11-20 22:15:08.689866
2649	MUS 4807	MUS	4807	4807	4000	Jazz Arranging/Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.693883	2025-11-20 22:15:08.693889
2650	MUS 4818	MUS	4818	4818	4000	Seminar in Choral Repertory		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:08.697827	2025-11-20 22:15:08.697833
2651	MUS 4900	MUS	4900	4900	4000	Internship in Music		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:08.701678	2025-11-20 22:15:08.701683
2652	MUS 4901	MUS	4901	4901	4000	Chamber Ensemble		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.705722	2025-11-20 22:15:08.705728
2653	MUS 4902	MUS	4902	4902	4000	University Jazz Band		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.709708	2025-11-20 22:15:08.709714
2654	MUS 4904	MUS	4904	4904	4000	UNO Chorus		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.71386	2025-11-20 22:15:08.713866
2655	MUS 4905	MUS	4905	4905	4000	University Chorale		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.717926	2025-11-20 22:15:08.717931
2656	MUS 4907	MUS	4907	4907	4000	Piano Accompaniment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.722034	2025-11-20 22:15:08.72204
2657	MUS 4908	MUS	4908	4908	4000	Wind Ensemble		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.726003	2025-11-20 22:15:08.726009
2658	MUS 4910	MUS	4910	4910	4000	University Orchestra		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.729918	2025-11-20 22:15:08.729923
2659	MUS 4911	MUS	4911	4911	4000	Popular Music Ensemble		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.733841	2025-11-20 22:15:08.733846
2660	MUS 5001	MUS	5001	5001	5000	Special Topics in Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.737792	2025-11-20 22:15:08.737797
2661	MUS 5101	MUS	5101	5101	5000	Contrapuntal Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.741673	2025-11-20 22:15:08.741678
2662	MUS 5102	MUS	5102	5102	5000	20th Century Techniques		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.745775	2025-11-20 22:15:08.745781
2663	MUS 5103	MUS	5103	5103	5000	Digital Music Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.749783	2025-11-20 22:15:08.749788
2664	MUS 5104	MUS	5104	5104	5000	Advanced Digital Music Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.753769	2025-11-20 22:15:08.753775
2665	MUS 5105	MUS	5105	5105	5000	Advanced Orchestration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.757693	2025-11-20 22:15:08.757698
2666	MUS 5106	MUS	5106	5106	5000	Audio Recording		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.761676	2025-11-20 22:15:08.761681
2667	MUS 5107	MUS	5107	5107	5000	Post Production		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.765987	2025-11-20 22:15:08.765992
2668	MUS 5109	MUS	5109	5109	5000	Adv Jazz Harmony and Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.769962	2025-11-20 22:15:08.769967
2669	MUS 5110	MUS	5110	5110	5000	Adv Jazz Harmony and Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.773956	2025-11-20 22:15:08.773962
2670	MUS 5203	MUS	5203	5203	5000	Studies in Baroque Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.778152	2025-11-20 22:15:08.778158
2671	MUS 5204	MUS	5204	5204	5000	Studies Mus of Classical Era		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.782219	2025-11-20 22:15:08.782225
2672	MUS 5205	MUS	5205	5205	5000	Studies Mus of Romantic Era		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.786218	2025-11-20 22:15:08.786223
2673	MUS 5206	MUS	5206	5206	5000	20th Century Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.7903	2025-11-20 22:15:08.790306
2674	MUS 5208	MUS	5208	5208	5000	Aesthetics of Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.794296	2025-11-20 22:15:08.794302
2675	MUS 5310	MUS	5310	5310	5000	Vocal Pedagogy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.798232	2025-11-20 22:15:08.798237
2676	MUS 5311	MUS	5311	5311	5000	Piano Pedagogy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.802106	2025-11-20 22:15:08.802112
2677	MUS 5312	MUS	5312	5312	5000	Instrumental Music Pedagogy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.806324	2025-11-20 22:15:08.80633
2678	MUS 5315	MUS	5315	5315	5000	Practical Music Business		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.810427	2025-11-20 22:15:08.810433
2679	MUS 5598	MUS	5598	5598	5000	Composing for Adv Game Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.814593	2025-11-20 22:15:08.814599
2680	MUS 5705	MUS	5705	5705	5000	Advanced Jazz Improvisation I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.818517	2025-11-20 22:15:08.818522
2681	MUS 5706	MUS	5706	5706	5000	Advanced Jazz Improvisation II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.822639	2025-11-20 22:15:08.822644
2682	MUS 5806	MUS	5806	5806	5000	Jazz Composition and Arranging		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.826747	2025-11-20 22:15:08.826752
2683	MUS 5807	MUS	5807	5807	5000	Jazz Arranging/Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.830507	2025-11-20 22:15:08.830513
2684	MUS 5818	MUS	5818	5818	5000	Seminar in Choral Repertory		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:08.833818	2025-11-20 22:15:08.833823
2685	MUS 5900	MUS	5900	5900	5000	Internship in Music		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:08.837816	2025-11-20 22:15:08.837821
2686	MUS 5901	MUS	5901	5901	5000	Chamber Ensemble		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.841789	2025-11-20 22:15:08.841794
2687	MUS 5902	MUS	5902	5902	5000	University Jazz Band		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.845604	2025-11-20 22:15:08.845609
2688	MUS 5904	MUS	5904	5904	5000	UNO Chorus		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.84941	2025-11-20 22:15:08.849415
2689	MUS 5905	MUS	5905	5905	5000	University Chorale		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.853313	2025-11-20 22:15:08.853318
2690	MUS 5907	MUS	5907	5907	5000	Piano Accompaniment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.857195	2025-11-20 22:15:08.8572
2691	MUS 5908	MUS	5908	5908	5000	Wind Ensemble		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.861185	2025-11-20 22:15:08.86119
2692	MUS 5910	MUS	5910	5910	5000	University Orchestra		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.864842	2025-11-20 22:15:08.864848
2693	MUS 6000	MUS	6000	6000	6000	Directed Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:08.868375	2025-11-20 22:15:08.86838
2694	MUS 6001	MUS	6001	6001	6000	Directed Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:08.872359	2025-11-20 22:15:08.872365
2695	MUS 6002	MUS	6002	6002	6000	Directed Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:08.875975	2025-11-20 22:15:08.87598
2696	MUS 6101	MUS	6101	6101	6000	Analytical Studies Baroq/Class		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.879742	2025-11-20 22:15:08.879746
2697	MUS 6102	MUS	6102	6102	6000	Analyt Studies Rom/20th Cen		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.883624	2025-11-20 22:15:08.883629
2698	MUS 6111	MUS	6111	6111	6000	Seminar Choral Conducting		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:08.887618	2025-11-20 22:15:08.887623
2699	MUS 6112	MUS	6112	6112	6000	Seminar Instrumental Conduct		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:08.891497	2025-11-20 22:15:08.891503
2700	MUS 6200	MUS	6200	6200	6000	Music Research Methods & Mater		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:08.8954	2025-11-20 22:15:08.895405
2701	MUS 6300	MUS	6300	6300	6000	Seminar in Jazz History		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:08.899493	2025-11-20 22:15:08.899498
2702	MUS 6401	MUS	6401	6401	6000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.903417	2025-11-20 22:15:08.903423
2703	MUS 6402	MUS	6402	6402	6000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.907251	2025-11-20 22:15:08.907256
2704	MUS 6431	MUS	6431	6431	6000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.911214	2025-11-20 22:15:08.91122
2705	MUS 6432	MUS	6432	6432	6000	Applied Keyboard		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.915026	2025-11-20 22:15:08.915032
2706	MUS 6501	MUS	6501	6501	6000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.919007	2025-11-20 22:15:08.919013
2707	MUS 6502	MUS	6502	6502	6000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.923006	2025-11-20 22:15:08.923012
2708	MUS 6531	MUS	6531	6531	6000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.926866	2025-11-20 22:15:08.926871
2709	MUS 6532	MUS	6532	6532	6000	Applied Voice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.93099	2025-11-20 22:15:08.930996
2710	MUS 6601	MUS	6601	6601	6000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.935319	2025-11-20 22:15:08.935324
2711	MUS 6602	MUS	6602	6602	6000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.939211	2025-11-20 22:15:08.939216
2712	MUS 6631	MUS	6631	6631	6000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.943337	2025-11-20 22:15:08.943342
2713	MUS 6632	MUS	6632	6632	6000	Applied Strings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.947297	2025-11-20 22:15:08.947302
2714	MUS 6701	MUS	6701	6701	6000	Applied Woodwinds		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.951252	2025-11-20 22:15:08.951258
2715	MUS 6702	MUS	6702	6702	6000	Applied Woodwinds		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.955286	2025-11-20 22:15:08.955291
2716	MUS 6705	MUS	6705	6705	6000	Advanced Improv I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.959349	2025-11-20 22:15:08.959354
2717	MUS 6706	MUS	6706	6706	6000	Advanced Improv II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.963309	2025-11-20 22:15:08.963315
2718	MUS 6711	MUS	6711	6711	6000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.967297	2025-11-20 22:15:08.967302
2719	MUS 6712	MUS	6712	6712	6000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.971226	2025-11-20 22:15:08.971232
2720	MUS 6721	MUS	6721	6721	6000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.975164	2025-11-20 22:15:08.97517
2721	MUS 6722	MUS	6722	6722	6000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.979279	2025-11-20 22:15:08.979285
2722	MUS 6731	MUS	6731	6731	6000	Applied Woodwinds		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.983403	2025-11-20 22:15:08.983409
2723	MUS 6732	MUS	6732	6732	6000	Applied Woodwinds		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.98752	2025-11-20 22:15:08.987526
2724	MUS 6741	MUS	6741	6741	6000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.991555	2025-11-20 22:15:08.991583
2725	MUS 6742	MUS	6742	6742	6000	Applied Brass		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.995733	2025-11-20 22:15:08.995739
2726	MUS 6781	MUS	6781	6781	6000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:08.999745	2025-11-20 22:15:08.99975
2727	MUS 6782	MUS	6782	6782	6000	Applied Percussion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.00379	2025-11-20 22:15:09.003796
2728	MUS 6801	MUS	6801	6801	6000	Applied Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.007806	2025-11-20 22:15:09.007812
2729	MUS 6802	MUS	6802	6802	6000	Applied Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.011808	2025-11-20 22:15:09.011814
2730	MUS 6831	MUS	6831	6831	6000	Applied Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.015838	2025-11-20 22:15:09.015844
2731	MUS 6832	MUS	6832	6832	6000	Applied Composition		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.019869	2025-11-20 22:15:09.019875
2732	MUS 6900	MUS	6900	6900	6000	Graduate Colloquium		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:09.02433	2025-11-20 22:15:09.024335
2733	MUS 6950	MUS	6950	6950	6000	Half Recital		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.028779	2025-11-20 22:15:09.028785
2734	MUS 6990	MUS	6990	6990	6000	Graduate Recital		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.0329	2025-11-20 22:15:09.032906
2735	MUS 7000	MUS	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.036959	2025-11-20 22:15:09.036964
2736	MUS 7040	MUS	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.041125	2025-11-20 22:15:09.041153
2737	NSE 2000A	NSE	2000A	2000	2000	NSE Outgoing Student		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.045037	2025-11-20 22:15:09.045042
2738	NSE 2000B	NSE	2000B	2000	2000	NSE Outgoing Student		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.04909	2025-11-20 22:15:09.049096
2739	NAME 1170	NAME	1170	1170	1000	Intro to Naval Arch		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.053089	2025-11-20 22:15:09.053095
2740	NAME 1175	NAME	1175	1175	1000	Naval Arch Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.057115	2025-11-20 22:15:09.057121
2741	NAME 2130	NAME	2130	2130	2000	Intro to Marine Eng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.061373	2025-11-20 22:15:09.061379
2742	NAME 2160	NAME	2160	2160	2000	Hydrostatics and Stability		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.065384	2025-11-20 22:15:09.06539
2743	NAME 3120	NAME	3120	3120	3000	Ship Hull Strength		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.06936	2025-11-20 22:15:09.069366
2744	NAME 3131	NAME	3131	3131	3000	Marine Engines		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.073521	2025-11-20 22:15:09.073527
2745	NAME 3135	NAME	3135	3135	3000	Marine Electromech		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.077429	2025-11-20 22:15:09.077434
2746	NAME 3150	NAME	3150	3150	3000	Ship Resistance & Propulsion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.081291	2025-11-20 22:15:09.081296
2747	NAME 3155	NAME	3155	3155	3000	Mar Hydro Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.085298	2025-11-20 22:15:09.085303
2748	NAME 3160	NAME	3160	3160	3000	Offshore & Ship Dynamics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.089207	2025-11-20 22:15:09.089212
2749	NAME 3171	NAME	3171	3171	3000	Marine Design Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.093204	2025-11-20 22:15:09.09321
2750	NAME 3900	NAME	3900	3900	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.097285	2025-11-20 22:15:09.09729
2751	NAME 4095	NAME	4095	4095	4000	NAME Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.10134	2025-11-20 22:15:09.101346
2752	NAME 4096	NAME	4096	4096	4000	Special Topics in Naval Arch		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.105615	2025-11-20 22:15:09.105621
2753	NAME 4097	NAME	4097	4097	4000	Special Topics in Marine Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.109753	2025-11-20 22:15:09.109759
2754	NAME 4120	NAME	4120	4120	4000	Ship Struct Analysis & Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.113699	2025-11-20 22:15:09.113705
2755	NAME 4121	NAME	4121	4121	4000	Analy/Des Float Offshore Struc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.117774	2025-11-20 22:15:09.11778
2756	NAME 4122	NAME	4122	4122	4000	Intro to Marine Composites		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.121798	2025-11-20 22:15:09.121804
2757	NAME 4131	NAME	4131	4131	4000	Rel Avail Mainten Engr System		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.125902	2025-11-20 22:15:09.125908
2758	NAME 4136	NAME	4136	4136	4000	Marine Piping System		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.129863	2025-11-20 22:15:09.129868
2759	NAME 4138	NAME	4138	4138	4000	Ship Control Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.133909	2025-11-20 22:15:09.133915
2760	NAME 4141	NAME	4141	4141	4000	Curved Surface Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.137816	2025-11-20 22:15:09.137822
2761	NAME 4151	NAME	4151	4151	4000	Small Craft Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.141827	2025-11-20 22:15:09.141833
2762	NAME 4160	NAME	4160	4160	4000	Ship Hydrodynamics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.145877	2025-11-20 22:15:09.145884
2763	NAME 4162	NAME	4162	4162	4000	Offshore Struct & Ship Dyn II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.149863	2025-11-20 22:15:09.149869
2764	NAME 4170	NAME	4170	4170	4000	Marine Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.153799	2025-11-20 22:15:09.153805
2765	NAME 4171	NAME	4171	4171	4000	Admiralty Law for Engineers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.157774	2025-11-20 22:15:09.15778
2766	NAME 4175	NAME	4175	4175	4000	Marine Design Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.161706	2025-11-20 22:15:09.161711
2767	NAME 4723	NAME	4723	4723	4000	Ocean & Coastal Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.165725	2025-11-20 22:15:09.16573
2768	NAME 4728	NAME	4728	4728	4000	Intro Computat Fluid Dynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.169668	2025-11-20 22:15:09.169674
2769	NAME 5095	NAME	5095	5095	5000	NAME Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.173676	2025-11-20 22:15:09.173682
2770	NAME 5096	NAME	5096	5096	5000	Special Topics in Naval Arch		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.177743	2025-11-20 22:15:09.177749
2771	NAME 5097	NAME	5097	5097	5000	Special Topics in Marine Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.181796	2025-11-20 22:15:09.181802
2772	NAME 5120	NAME	5120	5120	5000	Ship Struct Analysis & Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.185852	2025-11-20 22:15:09.185857
2773	NAME 5121	NAME	5121	5121	5000	Analy/Des Float Offshore Struc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.189903	2025-11-20 22:15:09.189908
2774	NAME 5122	NAME	5122	5122	5000	Intro to Marine Composites		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.194099	2025-11-20 22:15:09.194104
2775	NAME 5131	NAME	5131	5131	5000	Rel Avail Mainten Engr System		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.198335	2025-11-20 22:15:09.198341
2776	NAME 5136	NAME	5136	5136	5000	Marine Piping System		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.202463	2025-11-20 22:15:09.202469
2777	NAME 5138	NAME	5138	5138	5000	Ship Control Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.20661	2025-11-20 22:15:09.206616
2778	NAME 5141	NAME	5141	5141	5000	Curved Surface Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.210649	2025-11-20 22:15:09.210654
2779	NAME 5151	NAME	5151	5151	5000	Small Craft Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.214633	2025-11-20 22:15:09.214638
2780	NAME 5160	NAME	5160	5160	5000	Ship Hydrodynamics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.218478	2025-11-20 22:15:09.218484
2781	NAME 5162	NAME	5162	5162	5000	Offshore Struct & Ship Dyn II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.222636	2025-11-20 22:15:09.222642
2782	NAME 5171	NAME	5171	5171	5000	Admiralty Law for Engineers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.226732	2025-11-20 22:15:09.226738
2783	NAME 5175	NAME	5175	5175	5000	Marine Design Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.230879	2025-11-20 22:15:09.230885
2784	NAME 5723	NAME	5723	5723	5000	Ocean & Coastal Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.234958	2025-11-20 22:15:09.234964
2785	NAME 5728	NAME	5728	5728	5000	Intro Computat Fluid Dynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.238923	2025-11-20 22:15:09.238928
2786	NAME 6080	NAME	6080	6080	6000	Systems Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.24295	2025-11-20 22:15:09.242956
2787	NAME 6093	NAME	6093	6093	6000	Independent Study Naval Arch		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.246983	2025-11-20 22:15:09.246989
2788	NAME 6097	NAME	6097	6097	6000	Adv Spec Topics in Marine Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.251014	2025-11-20 22:15:09.251019
2789	NAME 6098	NAME	6098	6098	6000	Adv Spec Topics in Marine Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.254858	2025-11-20 22:15:09.254863
2790	NAME 6121	NAME	6121	6121	6000	Marine Structural Vibrations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.25854	2025-11-20 22:15:09.258546
2791	NAME 6125	NAME	6125	6125	6000	Advanced Offshore Engineering		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.262626	2025-11-20 22:15:09.262632
2792	NAME 6130	NAME	6130	6130	6000	Nuclear Marine Propulsion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.266697	2025-11-20 22:15:09.266702
2793	NAME 6138	NAME	6138	6138	6000	Autonomy of Ocean Vehicles		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.270659	2025-11-20 22:15:09.270664
2794	NAME 6145	NAME	6145	6145	6000	Hull Shape Optimization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.274742	2025-11-20 22:15:09.274747
2795	NAME 6160	NAME	6160	6160	6000	Numer Methods in Hydrodynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.278731	2025-11-20 22:15:09.278736
2796	NAME 6164	NAME	6164	6164	6000	Adv Ship/Ofhore Plf Motions		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.282648	2025-11-20 22:15:09.282653
2797	NAME 6166	NAME	6166	6166	6000	Prob Ship/Ofhore Plf Dynam		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.286412	2025-11-20 22:15:09.286417
2798	NAME 6168	NAME	6168	6168	6000	High Speed Hydrodynamics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.290484	2025-11-20 22:15:09.290489
2799	NAME 6175	NAME	6175	6175	6000	Design Fixed Offshore Platform		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.294595	2025-11-20 22:15:09.294601
2800	NAVS 1010	NAVS	1010	1010	1000	Intro to Naval Science & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.298779	2025-11-20 22:15:09.298785
2801	NAVS 1020	NAVS	1020	1020	1000	Seapower & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.302717	2025-11-20 22:15:09.302723
2802	NAVS 1021	NAVS	1021	1021	1000	Seapower Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.306454	2025-11-20 22:15:09.306459
2803	NAVS 2010	NAVS	2010	2010	2000	Naval Ship Systems I & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.310615	2025-11-20 22:15:09.310621
2804	NAVS 2200	NAVS	2200	2200	2000	Leadership & Management & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.314542	2025-11-20 22:15:09.314548
2805	NAVS 3010	NAVS	3010	3010	3000	Naval Ship Systems II & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.3187	2025-11-20 22:15:09.318706
2806	NAVS 3011	NAVS	3011	3011	3000	Nav Ship Systems II Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.322728	2025-11-20 22:15:09.322734
2807	NAVS 3050	NAVS	3050	3050	3000	Maneuver Warfare		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.326774	2025-11-20 22:15:09.326779
2808	NAVS 3100	NAVS	3100	3100	3000	Navigation I & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.330825	2025-11-20 22:15:09.330831
2809	NAVS 3101	NAVS	3101	3101	3000	Navigation I Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.334913	2025-11-20 22:15:09.334919
2810	NAVS 3110	NAVS	3110	3110	3000	Naval OPS Analysis & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.339096	2025-11-20 22:15:09.339101
2811	NAVS 3120	NAVS	3120	3120	3000	Evolution of Warfare		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.342425	2025-11-20 22:15:09.34243
2812	NAVS 3200	NAVS	3200	3200	3000	Leadership and Ethics & Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.345489	2025-11-20 22:15:09.345494
2813	NAVS 3201	NAVS	3201	3201	3000	Leader & Ethics Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.348328	2025-11-20 22:15:09.348333
2814	ORGL 3000	ORGL	3000	3000	3000	Intro to Org Leadership		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.351118	2025-11-20 22:15:09.351122
2815	ORGL 3110	ORGL	3110	3110	3000	Professional Writing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.353345	2025-11-20 22:15:09.353349
2816	ORGL 3140	ORGL	3140	3140	3000	Div. & Intercultural Understan		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.355618	2025-11-20 22:15:09.355622
2817	ORGL 3170	ORGL	3170	3170	3000	Concepts & Tech of Org Comm		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.357806	2025-11-20 22:15:09.357811
2818	ORGL 3210	ORGL	3210	3210	3000	Principles of Team Leadership		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.360047	2025-11-20 22:15:09.360051
2819	ORGL 3240	ORGL	3240	3240	3000	Quantitative & Qualitative Ana		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.362062	2025-11-20 22:15:09.362067
2820	ORGL 3270	ORGL	3270	3270	3000	Laws and Ethics Applied to Org		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.36403	2025-11-20 22:15:09.364034
2821	ORGL 3340	ORGL	3340	3340	3000	Critical Thinking and Analytic		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.365976	2025-11-20 22:15:09.36598
2822	ORGL 3350	ORGL	3350	3350	3000	Issues in Organizational Effec		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.367966	2025-11-20 22:15:09.36797
2823	ORGL 3370	ORGL	3370	3370	3000	Strat. Plan.Within Org Culture		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.369916	2025-11-20 22:15:09.36992
2824	PHIL 1000	PHIL	1000	1000	1000	Introduction to Philosophy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.371922	2025-11-20 22:15:09.371927
2825	PHIL 1050	PHIL	1050	1050	1000	Analytical Reasoning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.3739	2025-11-20 22:15:09.373904
2826	PHIL 1101	PHIL	1101	1101	1000	Introduction to Logic		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.375858	2025-11-20 22:15:09.375862
2827	PHIL 2096	PHIL	2096	2096	2000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.377857	2025-11-20 22:15:09.377861
2828	PHIL 2201	PHIL	2201	2201	2000	Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.379828	2025-11-20 22:15:09.379832
2829	PHIL 2207	PHIL	2207	2207	2000	Philosophy of Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.38179	2025-11-20 22:15:09.381794
2830	PHIL 2215	PHIL	2215	2215	2000	Social & Political Philosophy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.383756	2025-11-20 22:15:09.38376
2831	PHIL 2222	PHIL	2222	2222	2000	Philosophy of Sex and Love		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.385706	2025-11-20 22:15:09.38571
2832	PHIL 2244	PHIL	2244	2244	2000	Engineering Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.387669	2025-11-20 22:15:09.387672
2833	PHIL 2311	PHIL	2311	2311	2000	Hist Ancient & Medieval Phil		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.389646	2025-11-20 22:15:09.38965
2834	PHIL 2312	PHIL	2312	2312	2000	History Modern Philosophy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.391631	2025-11-20 22:15:09.391635
2835	PHIL 2314	PHIL	2314	2314	2000	American Philosophy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.393606	2025-11-20 22:15:09.39361
2836	PHIL 2411	PHIL	2411	2411	2000	Philosophy of Language		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.395549	2025-11-20 22:15:09.395553
2837	PHIL 2450	PHIL	2450	2450	2000	Philosophy of Mind		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.397555	2025-11-20 22:15:09.397558
2838	PHIL 2700	PHIL	2700	2700	2000	Religions of the World		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.399538	2025-11-20 22:15:09.399542
2839	PHIL 3001	PHIL	3001	3001	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.40154	2025-11-20 22:15:09.401544
2840	PHIL 3030	PHIL	3030	3030	3000	Individual Senior Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:09.403491	2025-11-20 22:15:09.403494
2841	PHIL 3101	PHIL	3101	3101	3000	Advanced Logic		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.405482	2025-11-20 22:15:09.405486
2842	PHIL 3232	PHIL	3232	3232	3000	Medical Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.407392	2025-11-20 22:15:09.407396
2843	PHIL 3260	PHIL	3260	3260	3000	Philosophy and Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.40938	2025-11-20 22:15:09.409384
2844	PHIL 3301	PHIL	3301	3301	3000	Philosophy of Plato		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.411339	2025-11-20 22:15:09.411343
2845	PHIL 3302	PHIL	3302	3302	3000	Philosophy of Aristotle		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.413326	2025-11-20 22:15:09.41333
2846	PHIL 3331	PHIL	3331	3331	3000	Continental Rationalism 17th C		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.417919	2025-11-20 22:15:09.417929
2847	PHIL 3332	PHIL	3332	3332	3000	British Empiricism & 18th Cen		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.42289	2025-11-20 22:15:09.422899
2848	PHIL 3333	PHIL	3333	3333	3000	Philosophy of Kant		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.427873	2025-11-20 22:15:09.427882
2849	PHIL 3334	PHIL	3334	3334	3000	German Idealism & 19th Century		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.432285	2025-11-20 22:15:09.432293
2850	PHIL 3350	PHIL	3350	3350	3000	Darwin & Evolution		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.436877	2025-11-20 22:15:09.436885
2851	PHIL 3400	PHIL	3400	3400	3000	Metaphysics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.441217	2025-11-20 22:15:09.441224
2852	PHIL 3401	PHIL	3401	3401	3000	Theories of Knowledge		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.445009	2025-11-20 22:15:09.445016
2853	PHIL 3415	PHIL	3415	3415	3000	Phenomenology & Continental		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.448475	2025-11-20 22:15:09.448481
2854	PHIL 3422	PHIL	3422	3422	3000	Analytic Philosophy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.451702	2025-11-20 22:15:09.451708
2855	PHIL 3450	PHIL	3450	3450	3000	Philosophical Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.455474	2025-11-20 22:15:09.455479
2856	PHIL 3480	PHIL	3480	3480	3000	Philosophy of Religion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.459046	2025-11-20 22:15:09.459054
2857	PHIL 3500	PHIL	3500	3500	3000	Philosophy of Wittgenstein		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.462621	2025-11-20 22:15:09.462626
2858	PHIL 3511	PHIL	3511	3511	3000	Existentialism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.46646	2025-11-20 22:15:09.466465
2859	PHIL 3580	PHIL	3580	3580	3000	Public Disagreement and Civic Virtue		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.47039	2025-11-20 22:15:09.470395
2860	PHIL 4027	PHIL	4027	4027	4000	Philosophy of Heidegger		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.474064	2025-11-20 22:15:09.474069
2861	PHIL 4042	PHIL	4042	4042	4000	Philosophy of Comedy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.477665	2025-11-20 22:15:09.47767
2862	PHIL 4094	PHIL	4094	4094	4000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.481164	2025-11-20 22:15:09.481169
2863	PHIL 4095	PHIL	4095	4095	4000	Special Topics in Philosophy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.484676	2025-11-20 22:15:09.484681
2864	PHIL 4200	PHIL	4200	4200	4000	Health Promotion Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.488345	2025-11-20 22:15:09.48835
2865	PHIL 4201	PHIL	4201	4201	4000	Advanced Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.492202	2025-11-20 22:15:09.492207
2866	PHIL 4205	PHIL	4205	4205	4000	Environmental Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.496147	2025-11-20 22:15:09.496153
2867	PHIL 4215	PHIL	4215	4215	4000	Adv Soc & Pol Phil		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.500014	2025-11-20 22:15:09.50002
2868	PHIL 4250	PHIL	4250	4250	4000	Philosophy of Art		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.503826	2025-11-20 22:15:09.503831
2869	PHIL 4430	PHIL	4430	4430	4000	Philosophy of Natural Sciences		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.507774	2025-11-20 22:15:09.507779
2870	PHIL 4580	PHIL	4580	4580	4000	Economic Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.511975	2025-11-20 22:15:09.51198
2871	PHIL 4581	PHIL	4581	4581	4000	Political Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.516552	2025-11-20 22:15:09.516557
2872	PHIL 5027	PHIL	5027	5027	5000	Philosophy of Heidegger		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.520514	2025-11-20 22:15:09.52052
2873	PHIL 5042	PHIL	5042	5042	5000	Philosophy of Comedy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.524541	2025-11-20 22:15:09.524547
2874	PHIL 5094	PHIL	5094	5094	5000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.528809	2025-11-20 22:15:09.528814
2875	PHIL 5095	PHIL	5095	5095	5000	Special Topics in Philosophy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.532766	2025-11-20 22:15:09.532771
2876	PHIL 5200	PHIL	5200	5200	5000	Health Promotion Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.536716	2025-11-20 22:15:09.536721
2877	PHIL 5205	PHIL	5205	5205	5000	Environmental Ethics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.540738	2025-11-20 22:15:09.540744
2878	PHIL 5250	PHIL	5250	5250	5000	Philosophy of Art		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.544685	2025-11-20 22:15:09.54469
2879	PHYS 1001	PHYS	1001	1001	1000	Introduction to Physics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.548775	2025-11-20 22:15:09.54878
2880	PHYS 1002	PHYS	1002	1002	1000	Introduction to Physics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.552825	2025-11-20 22:15:09.552831
2881	PHYS 1005	PHYS	1005	1005	1000	Introductory Astronomy I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.556894	2025-11-20 22:15:09.5569
2882	PHYS 1006	PHYS	1006	1006	1000	Introductory Astronomy II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.560805	2025-11-20 22:15:09.560812
2883	PHYS 1007	PHYS	1007	1007	1000	Introductory Astronomy Lab I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.564829	2025-11-20 22:15:09.564834
2884	PHYS 1008	PHYS	1008	1008	1000	Introductory Astronomy Lab II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.568812	2025-11-20 22:15:09.568817
2885	PHYS 1010	PHYS	1010	1010	1000	Physics of Music		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.572838	2025-11-20 22:15:09.572844
2886	PHYS 1011	PHYS	1011	1011	1000	Physics of Music Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.577103	2025-11-20 22:15:09.57711
2887	PHYS 1031	PHYS	1031	1031	1000	General Physics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.581367	2025-11-20 22:15:09.581373
2888	PHYS 1032	PHYS	1032	1032	1000	General Physics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.585442	2025-11-20 22:15:09.585448
2889	PHYS 1033	PHYS	1033	1033	1000	General Physics Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.589309	2025-11-20 22:15:09.589314
2890	PHYS 1034	PHYS	1034	1034	1000	General Physics Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.593221	2025-11-20 22:15:09.593227
2891	PHYS 1061	PHYS	1061	1061	1000	Physics Sci Engr I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.59716	2025-11-20 22:15:09.597165
2892	PHYS 1062	PHYS	1062	1062	1000	Physics Sci Engr II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.601027	2025-11-20 22:15:09.601032
2893	PHYS 1063	PHYS	1063	1063	1000	Physics Lab for Science & Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.605006	2025-11-20 22:15:09.605011
2894	PHYS 1065	PHYS	1065	1065	1000	Physics Lab for Science & Engr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.608928	2025-11-20 22:15:09.608933
2895	PHYS 1066	PHYS	1066	1066	1000	Physics Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.612728	2025-11-20 22:15:09.612734
2896	PHYS 2191	PHYS	2191	2191	2000	Special Problems in Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.616404	2025-11-20 22:15:09.616409
2897	PHYS 3064	PHYS	3064	3064	3000	Modern Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.620296	2025-11-20 22:15:09.620302
2898	PHYS 3094	PHYS	3094	3094	3000	Undergraduate Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.624199	2025-11-20 22:15:09.624204
2899	PHYS 3191	PHYS	3191	3191	3000	Special Problems in Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.628119	2025-11-20 22:15:09.628124
2900	PHYS 3198	PHYS	3198	3198	3000	Undergraduate Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:09.631885	2025-11-20 22:15:09.63189
2901	PHYS 3301	PHYS	3301	3301	3000	Classical Mechanics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.635643	2025-11-20 22:15:09.635649
2902	PHYS 4010	PHYS	4010	4010	4000	Physics of Music 2		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.639661	2025-11-20 22:15:09.639666
2903	PHYS 4014	PHYS	4014	4014	4000	Physics of Music 2 Laboratory: Acoustics, Music, and Electronics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.643412	2025-11-20 22:15:09.643418
2904	PHYS 4160	PHYS	4160	4160	4000	Advanced Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.646982	2025-11-20 22:15:09.646987
2905	PHYS 4191	PHYS	4191	4191	4000	Spec Problems in Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.65077	2025-11-20 22:15:09.650776
2906	PHYS 4194	PHYS	4194	4194	4000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.654626	2025-11-20 22:15:09.654632
2907	PHYS 4195	PHYS	4195	4195	4000	Special Topics Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.658698	2025-11-20 22:15:09.658704
2908	PHYS 4196	PHYS	4196	4196	4000	Special Topics Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.662724	2025-11-20 22:15:09.662729
2909	PHYS 4197	PHYS	4197	4197	4000	Special Topics Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.666673	2025-11-20 22:15:09.666679
2910	PHYS 4198	PHYS	4198	4198	4000	Special Topics Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.670656	2025-11-20 22:15:09.670661
2911	PHYS 4201	PHYS	4201	4201	4000	Introd Mathematical Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.674652	2025-11-20 22:15:09.674658
2912	PHYS 4202	PHYS	4202	4202	4000	Introd Mathematical Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.678622	2025-11-20 22:15:09.678627
2913	PHYS 4205	PHYS	4205	4205	4000	Applications Fourier Transform		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.682589	2025-11-20 22:15:09.682598
2914	PHYS 4211	PHYS	4211	4211	4000	Intro to Computational Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.686529	2025-11-20 22:15:09.686534
2915	PHYS 4302	PHYS	4302	4302	4000	Classical Mechanics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.690539	2025-11-20 22:15:09.690544
2916	PHYS 4322	PHYS	4322	4322	4000	Introduction to Acoustics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.694469	2025-11-20 22:15:09.694474
2917	PHYS 4381	PHYS	4381	4381	4000	Appl Seismic Acquis & Process		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.6986	2025-11-20 22:15:09.698605
2918	PHYS 4401	PHYS	4401	4401	4000	Quantum Mechanics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.702558	2025-11-20 22:15:09.702585
2919	PHYS 4402	PHYS	4402	4402	4000	Quantum Mechanics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.706585	2025-11-20 22:15:09.706591
2920	PHYS 4501	PHYS	4501	4501	4000	Electricity & Magnetism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.710548	2025-11-20 22:15:09.710553
2921	PHYS 4503	PHYS	4503	4503	4000	Electricity & Magnetism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.714424	2025-11-20 22:15:09.714429
2922	PHYS 4507	PHYS	4507	4507	4000	Gravity & Magnetics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.718391	2025-11-20 22:15:09.718396
2923	PHYS 4521	PHYS	4521	4521	4000	Modern Optics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.722354	2025-11-20 22:15:09.722359
2924	PHYS 4601	PHYS	4601	4601	4000	Thermodynamics & Stat Mechancs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.726375	2025-11-20 22:15:09.726381
2925	PHYS 4801	PHYS	4801	4801	4000	Nuclear & Reactor Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.730466	2025-11-20 22:15:09.730472
2926	PHYS 4901	PHYS	4901	4901	4000	Condensed Matter & Matrls Phys		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.734335	2025-11-20 22:15:09.734341
2927	PHYS 4902	PHYS	4902	4902	4000	Materials Science Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.738153	2025-11-20 22:15:09.738158
2928	PHYS 5010	PHYS	5010	5010	5000	Physics of Music 2		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.741895	2025-11-20 22:15:09.741901
2929	PHYS 5014	PHYS	5014	5014	5000	Physics of Music 2 Laboratory: Acoustics, Music, and Electronics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.74605	2025-11-20 22:15:09.746055
2930	PHYS 5091	PHYS	5091	5091	5000	Spec Topics Physics Teachers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.750033	2025-11-20 22:15:09.750038
2931	PHYS 5160	PHYS	5160	5160	5000	Advanced Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.754092	2025-11-20 22:15:09.754097
2932	PHYS 5191	PHYS	5191	5191	5000	Spec Problems in Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.758025	2025-11-20 22:15:09.758031
2933	PHYS 5195	PHYS	5195	5195	5000	Special Topics Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.762023	2025-11-20 22:15:09.762029
2934	PHYS 5196	PHYS	5196	5196	5000	Special Topics Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.766023	2025-11-20 22:15:09.766029
2935	PHYS 5197	PHYS	5197	5197	5000	Special Topics Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.769605	2025-11-20 22:15:09.769611
2936	PHYS 5198	PHYS	5198	5198	5000	Special Topics Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.772595	2025-11-20 22:15:09.7726
2937	PHYS 5201	PHYS	5201	5201	5000	Introd Mathematical Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.775531	2025-11-20 22:15:09.775536
2938	PHYS 5202	PHYS	5202	5202	5000	Introd Mathematical Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.777934	2025-11-20 22:15:09.777939
2939	PHYS 5205	PHYS	5205	5205	5000	Applications Fourier Transform		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.780329	2025-11-20 22:15:09.780333
2940	PHYS 5211	PHYS	5211	5211	5000	Intro to Computational Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.782853	2025-11-20 22:15:09.782858
2941	PHYS 5302	PHYS	5302	5302	5000	Classical Mechanics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.785632	2025-11-20 22:15:09.785638
2942	PHYS 5322	PHYS	5322	5322	5000	Introduction to Acoustics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.788009	2025-11-20 22:15:09.788013
2943	PHYS 5381	PHYS	5381	5381	5000	Appl Seismic Acquis & Process		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.790181	2025-11-20 22:15:09.790185
2944	PHYS 5401	PHYS	5401	5401	5000	Quantum Mechanics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.792161	2025-11-20 22:15:09.792165
2945	PHYS 5402	PHYS	5402	5402	5000	Quantum Mechanics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.794177	2025-11-20 22:15:09.794181
2946	PHYS 5501	PHYS	5501	5501	5000	Electricity & Magnetism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.796123	2025-11-20 22:15:09.796143
2947	PHYS 5503	PHYS	5503	5503	5000	Electricity & Magnetism		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.798208	2025-11-20 22:15:09.798212
2948	PHYS 5507	PHYS	5507	5507	5000	Gravity & Magnetics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.800189	2025-11-20 22:15:09.800193
2949	PHYS 5521	PHYS	5521	5521	5000	Modern Optics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.802206	2025-11-20 22:15:09.802209
2950	PHYS 5601	PHYS	5601	5601	5000	Thermodynamics & Stat Mechancs		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.804233	2025-11-20 22:15:09.804237
2951	PHYS 5801	PHYS	5801	5801	5000	Nuclear & Reactor Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.806243	2025-11-20 22:15:09.806247
2952	PHYS 5901	PHYS	5901	5901	5000	Condensed Matter & Matrls Phys		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.808253	2025-11-20 22:15:09.808257
2953	PHYS 5902	PHYS	5902	5902	5000	Materials Science Laboratory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.810265	2025-11-20 22:15:09.810269
2954	PHYS 6191	PHYS	6191	6191	6000	Selected Topics in Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.812291	2025-11-20 22:15:09.812295
2955	PHYS 6192	PHYS	6192	6192	6000	Selected Topics in Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.81429	2025-11-20 22:15:09.814294
2956	PHYS 6193	PHYS	6193	6193	6000	Selected Topics in Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.816324	2025-11-20 22:15:09.816328
2957	PHYS 6194	PHYS	6194	6194	6000	Selected Topics in Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.818308	2025-11-20 22:15:09.818312
2958	PHYS 6195	PHYS	6195	6195	6000	Selected Topics Physics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.820449	2025-11-20 22:15:09.820453
2959	PHYS 6198	PHYS	6198	6198	6000	Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:09.822439	2025-11-20 22:15:09.822443
2960	PHYS 6205	PHYS	6205	6205	6000	Digital Filtering Image Proc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.824477	2025-11-20 22:15:09.824481
2961	PHYS 6206	PHYS	6206	6206	6000	Image Restoration & Enhancemnt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.826467	2025-11-20 22:15:09.82647
2962	PHYS 6207	PHYS	6207	6207	6000	Digtl Filt & Spect Analysis I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.828513	2025-11-20 22:15:09.828517
2963	PHYS 6208	PHYS	6208	6208	6000	Dig Filt & Spect Analysis II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.830544	2025-11-20 22:15:09.830548
2964	PHYS 6209	PHYS	6209	6209	6000	Intro Wavelets		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.832581	2025-11-20 22:15:09.832585
2965	PHYS 6210	PHYS	6210	6210	6000	Wavelet Applications		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.834609	2025-11-20 22:15:09.834613
2966	PHYS 6301	PHYS	6301	6301	6000	Classical Mechanics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.836742	2025-11-20 22:15:09.836746
2967	PHYS 6325	PHYS	6325	6325	6000	Underwater Acous Syst Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.839898	2025-11-20 22:15:09.839901
2968	PHYS 6331	PHYS	6331	6331	6000	Principles of Ocean Physics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.843098	2025-11-20 22:15:09.843102
2969	PHYS 6332	PHYS	6332	6332	6000	Principles of Ocean Physics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.846362	2025-11-20 22:15:09.846366
2970	PHYS 6401	PHYS	6401	6401	6000	Quantum Mechanics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.849961	2025-11-20 22:15:09.849965
2971	PHYS 6402	PHYS	6402	6402	6000	Quantum Mechanics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.853235	2025-11-20 22:15:09.853239
2972	PHYS 6501	PHYS	6501	6501	6000	Electromagnetic Theory I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.856367	2025-11-20 22:15:09.856371
2973	PHYS 7000	PHYS	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.859477	2025-11-20 22:15:09.859481
2974	PHYS 7025	PHYS	7025	7025	7000	Research Methods in Physics		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.862635	2025-11-20 22:15:09.862638
2975	PHYS 7040	PHYS	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.865776	2025-11-20 22:15:09.86578
2976	PHYS 7050	PHYS	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.869066	2025-11-20 22:15:09.86907
2977	POLI 1010	POLI	1010	1010	1000	Contemporary Issues Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.874469	2025-11-20 22:15:09.874473
2978	POLI 2151	POLI	2151	2151	2000	US Govt & Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.877785	2025-11-20 22:15:09.877789
2979	POLI 2157	POLI	2157	2157	2000	Public Policy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.881099	2025-11-20 22:15:09.881103
2980	POLI 2200	POLI	2200	2200	2000	Law, Politics, and Society in the U.S.		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.884265	2025-11-20 22:15:09.884269
2981	POLI 2450	POLI	2450	2450	2000	Issues in Criminal Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.887454	2025-11-20 22:15:09.887457
2982	POLI 2600	POLI	2600	2600	2000	Intro Comparative Government		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.890415	2025-11-20 22:15:09.890419
2983	POLI 2700	POLI	2700	2700	2000	Introduction to World Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.893933	2025-11-20 22:15:09.893937
2984	POLI 2900	POLI	2900	2900	2000	Methods of Political Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.897424	2025-11-20 22:15:09.897428
2985	POLI 2993	POLI	2993	2993	2000	Special Topics in Poli Science		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.901024	2025-11-20 22:15:09.901029
2986	POLI 3580	POLI	3580	3580	3000	Public Disagreement and Civic Virtue		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.904593	2025-11-20 22:15:09.904598
2987	POLI 3680	POLI	3680	3680	3000	Politics & the Cinema		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.9082	2025-11-20 22:15:09.908205
2988	POLI 3995	POLI	3995	3995	3000	Independent Readings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.911861	2025-11-20 22:15:09.911866
2989	POLI 3998	POLI	3998	3998	3000	Internship Political Science		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:09.915547	2025-11-20 22:15:09.915551
2990	POLI 4170	POLI	4170	4170	4000	Politics of Public Policy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.919331	2025-11-20 22:15:09.919336
2991	POLI 4310	POLI	4310	4310	4000	US State Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.923078	2025-11-20 22:15:09.923083
2992	POLI 4410	POLI	4410	4410	4000	American Constitutional Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.928805	2025-11-20 22:15:09.928815
2993	POLI 4420	POLI	4420	4420	4000	American Civil Rights and Liberties		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.934678	2025-11-20 22:15:09.934687
2994	POLI 4440	POLI	4440	4440	4000	Urban Judicial Process		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.941515	2025-11-20 22:15:09.941526
2995	POLI 4580	POLI	4580	4580	4000	Economic Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.947266	2025-11-20 22:15:09.947276
2996	POLI 4581	POLI	4581	4581	4000	Political Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.95244	2025-11-20 22:15:09.952448
2997	POLI 4600	POLI	4600	4600	4000	Political Parties & Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.957365	2025-11-20 22:15:09.957374
2998	POLI 4601	POLI	4601	4601	4000	Voters and Elections		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.961341	2025-11-20 22:15:09.961348
2999	POLI 4621	POLI	4621	4621	4000	Public Opinion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.964744	2025-11-20 22:15:09.964751
3000	POLI 4630	POLI	4630	4630	4000	The U.S. Presidency		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.968159	2025-11-20 22:15:09.968166
3001	POLI 4640	POLI	4640	4640	4000	US Congress & People		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.970744	2025-11-20 22:15:09.970748
3002	POLI 4650	POLI	4650	4650	4000	Southern Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.97319	2025-11-20 22:15:09.973195
3003	POLI 4653	POLI	4653	4653	4000	Political Socialization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.975626	2025-11-20 22:15:09.975631
3004	POLI 4670	POLI	4670	4670	4000	Women and Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.978301	2025-11-20 22:15:09.978305
3005	POLI 4700	POLI	4700	4700	4000	Latin Am Govts & Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.980379	2025-11-20 22:15:09.980383
3006	POLI 4710	POLI	4710	4710	4000	Politics of Developing Areas		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.98234	2025-11-20 22:15:09.982344
3007	POLI 4770	POLI	4770	4770	4000	Modern Political Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.984288	2025-11-20 22:15:09.984291
3008	POLI 4780	POLI	4780	4780	4000	Comparative Democratization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.986296	2025-11-20 22:15:09.9863
3009	POLI 4790	POLI	4790	4790	4000	Media and Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.988382	2025-11-20 22:15:09.988386
3010	POLI 4800	POLI	4800	4800	4000	Concepts & Patrn Intl Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.990357	2025-11-20 22:15:09.99036
3011	POLI 4820	POLI	4820	4820	4000	International Organization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.992379	2025-11-20 22:15:09.992383
3012	POLI 4850	POLI	4850	4850	4000	International Political Economy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.994353	2025-11-20 22:15:09.994356
3013	POLI 4860	POLI	4860	4860	4000	International Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.996322	2025-11-20 22:15:09.996325
3014	POLI 4870	POLI	4870	4870	4000	American Foreign Policy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:09.998303	2025-11-20 22:15:09.998307
3015	POLI 4885	POLI	4885	4885	4000	Issues in Conflict & Diplomacy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.000263	2025-11-20 22:15:10.000266
3016	POLI 4990	POLI	4990	4990	4000	Special Topics in Poli Science		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.002291	2025-11-20 22:15:10.002295
3017	POLI 4991	POLI	4991	4991	4000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.004267	2025-11-20 22:15:10.004271
3018	POLI 4999	POLI	4999	4999	4000	Political Science Overview		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.006253	2025-11-20 22:15:10.006256
3019	POLI 5170	POLI	5170	5170	5000	Politics of Public Policy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.008235	2025-11-20 22:15:10.008238
3020	POLI 5310	POLI	5310	5310	5000	US State Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.010197	2025-11-20 22:15:10.010201
3021	POLI 5410	POLI	5410	5410	5000	American Constitutional Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.012167	2025-11-20 22:15:10.012171
3022	POLI 5420	POLI	5420	5420	5000	Am Const & Civil Liberties		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.014121	2025-11-20 22:15:10.014125
3023	POLI 5440	POLI	5440	5440	5000	Urban Judicial Process		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.016112	2025-11-20 22:15:10.016116
3024	POLI 5600	POLI	5600	5600	5000	Political Parties & Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.01806	2025-11-20 22:15:10.018063
3025	POLI 5601	POLI	5601	5601	5000	Voters and Elections		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.020034	2025-11-20 22:15:10.020038
3026	POLI 5621	POLI	5621	5621	5000	Public Opinion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.022754	2025-11-20 22:15:10.022758
3027	POLI 5630	POLI	5630	5630	5000	The U.S. Presidency		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.026209	2025-11-20 22:15:10.026213
3028	POLI 5640	POLI	5640	5640	5000	US Congress & People		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.029344	2025-11-20 22:15:10.029347
3029	POLI 5650	POLI	5650	5650	5000	Southern Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.032609	2025-11-20 22:15:10.032613
3030	POLI 5653	POLI	5653	5653	5000	Political Socialization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.035645	2025-11-20 22:15:10.035648
3031	POLI 5670	POLI	5670	5670	5000	Women and Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.038821	2025-11-20 22:15:10.038825
3032	POLI 5700	POLI	5700	5700	5000	Latin Am Govts & Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.042077	2025-11-20 22:15:10.042081
3033	POLI 5710	POLI	5710	5710	5000	Politics of Developing Areas		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.0454	2025-11-20 22:15:10.045404
3034	POLI 5770	POLI	5770	5770	5000	Modern Political Systems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.048673	2025-11-20 22:15:10.048677
3035	POLI 5780	POLI	5780	5780	5000	Comparative Democratization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.051785	2025-11-20 22:15:10.051789
3036	POLI 5800	POLI	5800	5800	5000	Concepts & Patrn Intl Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.055054	2025-11-20 22:15:10.055058
3037	POLI 5820	POLI	5820	5820	5000	International Organization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.058283	2025-11-20 22:15:10.058287
3038	POLI 5850	POLI	5850	5850	5000	International Political Economy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.063123	2025-11-20 22:15:10.063152
3039	POLI 5860	POLI	5860	5860	5000	International Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.06894	2025-11-20 22:15:10.068949
3040	POLI 5870	POLI	5870	5870	5000	American Foreign Policy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.0749	2025-11-20 22:15:10.074909
3041	POLI 5885	POLI	5885	5885	5000	Issues in Conflict & Diplomacy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.08165	2025-11-20 22:15:10.081658
3042	POLI 5970	POLI	5970	5970	5000	Media and Politics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.086272	2025-11-20 22:15:10.08628
3043	POLI 5990	POLI	5990	5990	5000	Special Topics in Poli Science		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.090968	2025-11-20 22:15:10.090974
3044	POLI 6001	POLI	6001	6001	6000	Intro Political Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.095249	2025-11-20 22:15:10.095255
3045	POLI 6002	POLI	6002	6002	6000	Methods Political Research I		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.099303	2025-11-20 22:15:10.099309
3046	POLI 6003	POLI	6003	6003	6000	Methods Political Research II		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.10382	2025-11-20 22:15:10.103827
3047	POLI 6420	POLI	6420	6420	6000	Appellate Courts Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:10.108348	2025-11-20 22:15:10.108355
3048	POLI 6650	POLI	6650	6650	6000	Seminar Women & Politics		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:10.112752	2025-11-20 22:15:10.112758
3049	POLI 6680	POLI	6680	6680	6000	Sem Legislative Behavior		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.116971	2025-11-20 22:15:10.116978
3050	POLI 6720	POLI	6720	6720	6000	Sem Developed Political Syst		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.121221	2025-11-20 22:15:10.121227
3051	POLI 6790	POLI	6790	6790	6000	Comparative Media		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.125393	2025-11-20 22:15:10.125399
3052	POLI 6810	POLI	6810	6810	6000	IR Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.12951	2025-11-20 22:15:10.129516
3053	POLI 6885	POLI	6885	6885	6000	Sem in International Conflict		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.133533	2025-11-20 22:15:10.133539
3054	POLI 6910	POLI	6910	6910	6000	Spec Topics Sem Poli		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.138836	2025-11-20 22:15:10.138846
3055	POLI 6990	POLI	6990	6990	6000	Independent Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.144622	2025-11-20 22:15:10.144631
3056	POLI 7000	POLI	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.150738	2025-11-20 22:15:10.150747
3057	POLI 7040	POLI	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.156066	2025-11-20 22:15:10.156075
3058	POLI 7050	POLI	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.161494	2025-11-20 22:15:10.161502
3059	PSYC 1000	PSYC	1000	1000	1000	General Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.166485	2025-11-20 22:15:10.166492
3060	PSYC 1009	PSYC	1009	1009	1000	General Psychology Honors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.171392	2025-11-20 22:15:10.1714
3061	PSYC 1500	PSYC	1500	1500	1000	Personal Adjustment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.176396	2025-11-20 22:15:10.176404
3062	PSYC 1520	PSYC	1520	1520	1000	Human Sexual Behavior		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.181333	2025-11-20 22:15:10.18134
3063	PSYC 2091	PSYC	2091	2091	2000	Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.185962	2025-11-20 22:15:10.185969
3064	PSYC 2100	PSYC	2100	2100	2000	Foundations of Developmental Psyc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.190681	2025-11-20 22:15:10.190688
3065	PSYC 2110	PSYC	2110	2110	2000	Child Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.195002	2025-11-20 22:15:10.195008
3066	PSYC 2120	PSYC	2120	2120	2000	Adolescent Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.199646	2025-11-20 22:15:10.199652
3067	PSYC 2200	PSYC	2200	2200	2000	Educational Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.20477	2025-11-20 22:15:10.204777
3068	PSYC 2310	PSYC	2310	2310	2000	Intro to Statistics for Behav		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.209341	2025-11-20 22:15:10.209348
3069	PSYC 2321	PSYC	2321	2321	2000	Introduction to Neuroscience		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.213803	2025-11-20 22:15:10.21381
3070	PSYC 2340	PSYC	2340	2340	2000	Foundations of Emotion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.217842	2025-11-20 22:15:10.217848
3071	PSYC 2380	PSYC	2380	2380	2000	Foundations of Cognitive Psyc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.222068	2025-11-20 22:15:10.222074
3072	PSYC 2400	PSYC	2400	2400	2000	Foundations of Social Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.226354	2025-11-20 22:15:10.22636
3073	PSYC 2460	PSYC	2460	2460	2000	Moral Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.230523	2025-11-20 22:15:10.230528
3074	PSYC 2500	PSYC	2500	2500	2000	Data Analysis in Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.234712	2025-11-20 22:15:10.234717
3075	PSYC 2520	PSYC	2520	2520	2000	Drugs and Behavior		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.238786	2025-11-20 22:15:10.238791
3076	PSYC 2600	PSYC	2600	2600	2000	Abnormal Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.24284	2025-11-20 22:15:10.242846
3077	PSYC 3090	PSYC	3090	3090	3000	Ind Resrch in Psyc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.24691	2025-11-20 22:15:10.246916
3078	PSYC 3095	PSYC	3095	3095	3000	Field Experience in Applied Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.25098	2025-11-20 22:15:10.250986
3079	PSYC 3099	PSYC	3099	3099	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.255118	2025-11-20 22:15:10.255124
3080	PSYC 3130	PSYC	3130	3130	3000	Adult Development & Aging		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.259182	2025-11-20 22:15:10.259188
3081	PSYC 3300	PSYC	3300	3300	3000	Research Methods and Statistics		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.263157	2025-11-20 22:15:10.263163
3082	PSYC 3320	PSYC	3320	3320	3000	Foundations of Biopsychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.267202	2025-11-20 22:15:10.267207
3083	PSYC 3340	PSYC	3340	3340	3000	Psych of Eating		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.271254	2025-11-20 22:15:10.271259
3084	PSYC 3510	PSYC	3510	3510	3000	Intro to Forensic Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.275234	2025-11-20 22:15:10.275239
3085	PSYC 4000	PSYC	4000	4000	4000	Psychology Comprehensive Exam		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.279381	2025-11-20 22:15:10.279387
3086	PSYC 4010	PSYC	4010	4010	4000	History Modern Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.28355	2025-11-20 22:15:10.283556
3087	PSYC 4091	PSYC	4091	4091	4000	Spec Topics in Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.287416	2025-11-20 22:15:10.287421
3088	PSYC 4310	PSYC	4310	4310	4000	Intermediate Statistics for Behavioral Science		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.291638	2025-11-20 22:15:10.291644
3089	PSYC 4320	PSYC	4320	4320	4000	Physiological Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.295772	2025-11-20 22:15:10.295778
3090	PSYC 4330	PSYC	4330	4330	4000	Comparative Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.299552	2025-11-20 22:15:10.299557
3091	PSYC 4350	PSYC	4350	4350	4000	Psychology of Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.303526	2025-11-20 22:15:10.303532
3092	PSYC 4365	PSYC	4365	4365	4000	Sensation & Perception		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.307658	2025-11-20 22:15:10.307664
3093	PSYC 4510	PSYC	4510	4510	4000	Personality		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.31177	2025-11-20 22:15:10.311775
3094	PSYC 4530	PSYC	4530	4530	4000	Psychopathology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.315863	2025-11-20 22:15:10.315869
3095	PSYC 4540	PSYC	4540	4540	4000	Mood Disorders		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.319885	2025-11-20 22:15:10.31989
3096	PSYC 4550	PSYC	4550	4550	4000	Clinical Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.323921	2025-11-20 22:15:10.323927
3097	PSYC 4600	PSYC	4600	4600	4000	Psychological Tests & Measrmnt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.327962	2025-11-20 22:15:10.327968
3098	PSYC 4700	PSYC	4700	4700	4000	Psychology of Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.332101	2025-11-20 22:15:10.332106
3099	PSYC 5010	PSYC	5010	5010	5000	History Modern Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.336263	2025-11-20 22:15:10.336269
3100	PSYC 5091	PSYC	5091	5091	5000	Spec Topics in Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.340307	2025-11-20 22:15:10.340312
3101	PSYC 5100	PSYC	5100	5100	5000	Foundations of Developmental Psyc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.344196	2025-11-20 22:15:10.344202
3102	PSYC 5310	PSYC	5310	5310	5000	Intermediate Stats Behavioral		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.348319	2025-11-20 22:15:10.348324
3103	PSYC 5320	PSYC	5320	5320	5000	Physiological Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.352276	2025-11-20 22:15:10.352281
3104	PSYC 5330	PSYC	5330	5330	5000	Comparative Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.356274	2025-11-20 22:15:10.35628
3105	PSYC 5350	PSYC	5350	5350	5000	Psychology of Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.360201	2025-11-20 22:15:10.360206
3106	PSYC 5365	PSYC	5365	5365	5000	Sensation & Perception		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.364288	2025-11-20 22:15:10.364294
3107	PSYC 5510	PSYC	5510	5510	5000	Personality		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.36838	2025-11-20 22:15:10.368385
3108	PSYC 5530	PSYC	5530	5530	5000	Psychopathology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.372507	2025-11-20 22:15:10.372513
3109	PSYC 5540	PSYC	5540	5540	5000	Mood Disorders		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.376739	2025-11-20 22:15:10.376745
3110	PSYC 5550	PSYC	5550	5550	5000	Clinical Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.380907	2025-11-20 22:15:10.380913
3111	PSYC 5600	PSYC	5600	5600	5000	Psychological Tests & Measrmnt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.384767	2025-11-20 22:15:10.384773
3112	PSYC 5700	PSYC	5700	5700	5000	Personnel & Indust Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.389386	2025-11-20 22:15:10.389392
3113	PSYC 6050	PSYC	6050	6050	6000	Sem in Professional Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.393965	2025-11-20 22:15:10.393972
3114	PSYC 6090	PSYC	6090	6090	6000	Ind Research in Psychology		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.398432	2025-11-20 22:15:10.398439
3115	PSYC 6091	PSYC	6091	6091	6000	Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:10.403035	2025-11-20 22:15:10.403041
3116	PSYC 6101	PSYC	6101	6101	6000	Fund Appl Dev Psychology I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.407541	2025-11-20 22:15:10.407548
3117	PSYC 6102	PSYC	6102	6102	6000	Fund Appl Dev Psychology II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.41199	2025-11-20 22:15:10.411996
3118	PSYC 6170	PSYC	6170	6170	6000	Prob in Scmot Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.416105	2025-11-20 22:15:10.416111
3119	PSYC 6191	PSYC	6191	6191	6000	Practicum Develop Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.420352	2025-11-20 22:15:10.420358
3120	PSYC 6195	PSYC	6195	6195	6000	Adv Sem Appl Devel Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.424364	2025-11-20 22:15:10.42437
3121	PSYC 6311	PSYC	6311	6311	6000	Advanced Statistics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.429478	2025-11-20 22:15:10.429488
3122	PSYC 6312	PSYC	6312	6312	6000	Advanced Statistics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.434467	2025-11-20 22:15:10.434476
3123	PSYC 6350	PSYC	6350	6350	6000	Advanced Learning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.439489	2025-11-20 22:15:10.439497
3124	PSYC 6395	PSYC	6395	6395	6000	Advanced Seminar in Statistics		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:10.444671	2025-11-20 22:15:10.444679
3125	PSYC 6400	PSYC	6400	6400	6000	Social Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.45075	2025-11-20 22:15:10.450759
3126	PSYC 6500	PSYC	6500	6500	6000	Sem Psyc Interventions		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.456812	2025-11-20 22:15:10.456821
3127	PSYC 6550	PSYC	6550	6550	6000	Psychopathology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.462721	2025-11-20 22:15:10.46273
3128	PSYC 6610	PSYC	6610	6610	6000	Measurement of Intelligence		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.468059	2025-11-20 22:15:10.468069
3129	PSYC 6620	PSYC	6620	6620	6000	Dev Assessmnt Psychopathology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.472623	2025-11-20 22:15:10.472631
3130	PSYC 6630	PSYC	6630	6630	6000	Autism and ADOS Assessment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.477057	2025-11-20 22:15:10.477065
3131	PSYC 6801	PSYC	6801	6801	6000	Fund Appl Biopsychology I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.481055	2025-11-20 22:15:10.481061
3132	PSYC 6802	PSYC	6802	6802	6000	Fund Appl Biopsychology II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.48465	2025-11-20 22:15:10.484656
3133	PSYC 6810	PSYC	6810	6810	6000	Psychopharmacology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.488266	2025-11-20 22:15:10.488273
3134	PSYC 6820	PSYC	6820	6820	6000	Psychophysiology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.491281	2025-11-20 22:15:10.491286
3135	PSYC 6891	PSYC	6891	6891	6000	Practicum Appl Biopsychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.494241	2025-11-20 22:15:10.494246
3136	PSYC 6895	PSYC	6895	6895	6000	Adv Sem Appl Biopsychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.497202	2025-11-20 22:15:10.497207
3137	PSYC 7000	PSYC	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.499882	2025-11-20 22:15:10.499886
3138	PSYC 7010	PSYC	7010	7010	7000	Teaching of Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.50219	2025-11-20 22:15:10.502195
3139	PSYC 7040	PSYC	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.504488	2025-11-20 22:15:10.504493
3140	PSYC 7050	PSYC	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.506794	2025-11-20 22:15:10.506799
3141	PSYC 7191	PSYC	7191	7191	7000	Internship Appl Dev Psychology		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.508997	2025-11-20 22:15:10.509001
3142	PSYC 7891	PSYC	7891	7891	7000	Internship Appl Biopsychology		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.510986	2025-11-20 22:15:10.510989
3143	PADM 4220	PADM	4220	4220	4000	Nonprofit Sector		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.513418	2025-11-20 22:15:10.513422
3144	PADM 4221	PADM	4221	4221	4000	Collaboration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.516074	2025-11-20 22:15:10.516079
3145	PADM 4222	PADM	4222	4222	4000	Legal Ethical / Issues		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.518636	2025-11-20 22:15:10.51864
3146	PADM 4223	PADM	4223	4223	4000	Fin Adm & Dev Nonprft		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.521444	2025-11-20 22:15:10.521448
3147	PADM 4224	PADM	4224	4224	4000	Nonprofit Leadership		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.524312	2025-11-20 22:15:10.524315
3148	PADM 4800	PADM	4800	4800	4000	Spec Studisrban Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.527165	2025-11-20 22:15:10.527169
3149	PADM 4810	PADM	4810	4810	4000	Environ Justice in Urbn Envmts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.53	2025-11-20 22:15:10.530004
3150	PADM 4900	PADM	4900	4900	4000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.533251	2025-11-20 22:15:10.533255
3151	PADM 5220	PADM	5220	5220	5000	Nonprofit Sector		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.536303	2025-11-20 22:15:10.536308
3152	PADM 5221	PADM	5221	5221	5000	Collaboration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.539226	2025-11-20 22:15:10.53923
3153	PADM 5222	PADM	5222	5222	5000	Legal Ethical / Issues		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.542388	2025-11-20 22:15:10.542392
3154	PADM 5223	PADM	5223	5223	5000	Financial Administration & Dev Nonprft		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.544884	2025-11-20 22:15:10.544888
3155	PADM 5224	PADM	5224	5224	5000	Nonprofit Leadership		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.548243	2025-11-20 22:15:10.548246
3156	PADM 5800	PADM	5800	5800	5000	Spec Studisrban Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.551398	2025-11-20 22:15:10.551401
3157	PADM 5810	PADM	5810	5810	5000	Environ Justice in Urbn Envmts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.554633	2025-11-20 22:15:10.554637
3158	PADM 6001	PADM	6001	6001	6000	Research Method Public Administration		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.557884	2025-11-20 22:15:10.557887
3159	PADM 6010	PADM	6010	6010	6000	Profession of Public Admin		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.561039	2025-11-20 22:15:10.561043
3160	PADM 6020	PADM	6020	6020	6000	Bureaucracy and Democracy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.564148	2025-11-20 22:15:10.564152
3161	PADM 6110	PADM	6110	6110	6000	Public Budgeting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.567342	2025-11-20 22:15:10.567345
3162	PADM 6130	PADM	6130	6130	6000	U.S. Disaster Policy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.570373	2025-11-20 22:15:10.570377
3163	PADM 6160	PADM	6160	6160	6000	Law and Ethics of Public Admin		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.573843	2025-11-20 22:15:10.573847
3164	PADM 6180	PADM	6180	6180	6000	HR Admin in the Public Sector		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.577283	2025-11-20 22:15:10.577287
3165	PADM 6201	PADM	6201	6201	6000	Program Evaluation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.580865	2025-11-20 22:15:10.580869
3166	PADM 6401	PADM	6401	6401	6000	Administrative Behavior		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.584466	2025-11-20 22:15:10.58447
3167	PADM 6410	PADM	6410	6410	6000	Tech in Public Organizations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.588062	2025-11-20 22:15:10.588067
3168	PADM 6501	PADM	6501	6501	6000	Criminal Justice Administration		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.591604	2025-11-20 22:15:10.591609
3169	PADM 6900	PADM	6900	6900	6000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.595516	2025-11-20 22:15:10.595521
3170	PADM 6901	PADM	6901	6901	6000	MPA Capstone		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.599327	2025-11-20 22:15:10.599332
3171	PADM 7000	PADM	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.603192	2025-11-20 22:15:10.603197
3172	PADM 7040	PADM	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.6072	2025-11-20 22:15:10.607205
3173	PPEL 3000	PPEL	3000	3000	3000	Foundations of Public Policy, Ethics, and Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.611089	2025-11-20 22:15:10.611095
3174	PPEL 3200	PPEL	3200	3200	3000	Leadership and Entrepreneurship		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.615403	2025-11-20 22:15:10.615409
3175	PPEL 3580	PPEL	3580	3580	3000	Public Disagreement and Civic Virtue		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.619665	2025-11-20 22:15:10.61967
3176	PPEL 3900	PPEL	3900	3900	3000	Current Topics in Public Policy, Ethics, and Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.62375	2025-11-20 22:15:10.623756
3177	PPEL 3910	PPEL	3910	3910	3000	Public Policy, Ethics, and Law Capstone		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.627841	2025-11-20 22:15:10.627847
3178	PPEL 4580	PPEL	4580	4580	4000	Economic Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.631913	2025-11-20 22:15:10.631919
3179	PPEL 4581	PPEL	4581	4581	4000	Political Justice		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.635816	2025-11-20 22:15:10.635822
3180	QMBE 2786	QMBE	2786	2786	2000	Intermed Bus & Econ Stat		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.639803	2025-11-20 22:15:10.639809
3181	QMBE 2787	QMBE	2787	2787	2000	Bus & Econ Stat Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.643856	2025-11-20 22:15:10.643862
3182	QMBE 5400	QMBE	5400	5400	5000	Statistics for Managers		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.647958	2025-11-20 22:15:10.647963
3183	QMBE 6280	QMBE	6280	6280	6000	Math in Financial Economics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.651812	2025-11-20 22:15:10.651818
3184	QMBE 6281	QMBE	6281	6281	6000	Econometrics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.655816	2025-11-20 22:15:10.655821
3185	QMBE 6282	QMBE	6282	6282	6000	Econometrics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.659637	2025-11-20 22:15:10.659642
3186	QMBE 6283	QMBE	6283	6283	6000	Sem in Math & Statistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.663645	2025-11-20 22:15:10.66365
3187	QMBE 6295	QMBE	6295	6295	6000	Spec Topic Quant Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.668106	2025-11-20 22:15:10.668111
3188	ROML 3405	ROML	3405	3405	3000	Romance Literature and Film		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.672108	2025-11-20 22:15:10.672113
3189	ROML 4005	ROML	4005	4005	4000	Greek & Roman Myth		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.676039	2025-11-20 22:15:10.676044
3190	ROML 5005	ROML	5005	5005	5000	Greek & Roman Myth		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.680016	2025-11-20 22:15:10.680022
3191	ROML 6003	ROML	6003	6003	6000	Applied Romance Linguistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.684022	2025-11-20 22:15:10.684027
3192	ROML 6005	ROML	6005	6005	6000	Romance Linguistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.688097	2025-11-20 22:15:10.688102
3193	ROML 6105	ROML	6105	6105	6000	Research Romance Literatures		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.692289	2025-11-20 22:15:10.692295
3194	ROML 6205	ROML	6205	6205	6000	Comparative Romance Cultures		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.696121	2025-11-20 22:15:10.696145
3195	ROML 6207	ROML	6207	6207	6000	Early Modern Romance Cultures		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.699926	2025-11-20 22:15:10.699931
3196	ROML 6282	ROML	6282	6282	6000	Foreign Lang Ped and Practicum		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.704171	2025-11-20 22:15:10.704177
3197	ROML 6398	ROML	6398	6398	6000	Internship in Romance Languages		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.707926	2025-11-20 22:15:10.707932
3198	SOC 1051	SOC	1051	1051	1000	Introductory Sociology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.711779	2025-11-20 22:15:10.711784
3199	SOC 2098	SOC	2098	2098	2000	Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.71568	2025-11-20 22:15:10.715685
3200	SOC 2273	SOC	2273	2273	2000	Society and the Person		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.719648	2025-11-20 22:15:10.719653
3201	SOC 2707	SOC	2707	2707	2000	Social Statistics I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.72362	2025-11-20 22:15:10.723626
3202	SOC 2708	SOC	2708	2708	2000	Methods in Social Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.727614	2025-11-20 22:15:10.727619
3203	SOC 2871	SOC	2871	2871	2000	Environment As Social Problem		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.731537	2025-11-20 22:15:10.731542
3204	SOC 2962	SOC	2962	2962	2000	Current Social Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.735496	2025-11-20 22:15:10.735502
3205	SOC 2994	SOC	2994	2994	2000	Multicult & Div in the US		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.739471	2025-11-20 22:15:10.739476
3206	SOC 3091	SOC	3091	3091	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.743506	2025-11-20 22:15:10.743512
3207	SOC 3092	SOC	3092	3092	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.747321	2025-11-20 22:15:10.747327
3208	SOC 3093	SOC	3093	3093	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.751314	2025-11-20 22:15:10.751319
3209	SOC 3094	SOC	3094	3094	3000	Independent Field Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.755412	2025-11-20 22:15:10.755418
3210	SOC 3095	SOC	3095	3095	3000	Independent Field Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.759427	2025-11-20 22:15:10.759432
3211	SOC 3096	SOC	3096	3096	3000	Internship Sociology		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.763478	2025-11-20 22:15:10.763484
3212	SOC 3097	SOC	3097	3097	3000	Internship in Sociology		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.767599	2025-11-20 22:15:10.767604
3213	SOC 3099	SOC	3099	3099	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.771795	2025-11-20 22:15:10.771801
3214	SOC 4070	SOC	4070	4070	4000	Spec Top Women, Lit, Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.775881	2025-11-20 22:15:10.775887
3215	SOC 4080	SOC	4080	4080	4000	Persp Wom Gender Sex		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.779881	2025-11-20 22:15:10.779886
3216	SOC 4086	SOC	4086	4086	4000	Sociological Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.784116	2025-11-20 22:15:10.784122
3217	SOC 4094	SOC	4094	4094	4000	Social Change		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.788336	2025-11-20 22:15:10.788342
3218	SOC 4098	SOC	4098	4098	4000	Selected Topics Sociology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.792493	2025-11-20 22:15:10.792498
3219	SOC 4101	SOC	4101	4101	4000	Social Organization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.796659	2025-11-20 22:15:10.796664
3220	SOC 4103	SOC	4103	4103	4000	Racial Issues		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.800769	2025-11-20 22:15:10.800774
3221	SOC 4104	SOC	4104	4104	4000	The Family		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.804897	2025-11-20 22:15:10.804903
3222	SOC 4107	SOC	4107	4107	4000	Sociology of Gender		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.808952	2025-11-20 22:15:10.808958
3223	SOC 4113	SOC	4113	4113	4000	Aging and Death		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.813118	2025-11-20 22:15:10.813124
3224	SOC 4124	SOC	4124	4124	4000	Social Stratification		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.817094	2025-11-20 22:15:10.8171
3225	SOC 4150	SOC	4150	4150	4000	Sociology of Pop Culture		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.821534	2025-11-20 22:15:10.82154
3226	SOC 4216	SOC	4216	4216	4000	Advanced Social Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.825754	2025-11-20 22:15:10.82576
3227	SOC 4219	SOC	4219	4219	4000	Social Deviance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.829602	2025-11-20 22:15:10.829607
3228	SOC 4788	SOC	4788	4788	4000	Social Statistics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.83348	2025-11-20 22:15:10.833486
3229	SOC 4871	SOC	4871	4871	4000	Sociology of Environment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.837341	2025-11-20 22:15:10.837347
3230	SOC 4875	SOC	4875	4875	4000	Soc of Disaster		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.841334	2025-11-20 22:15:10.84134
3231	SOC 4881	SOC	4881	4881	4000	The Urban Community		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.845472	2025-11-20 22:15:10.845478
3232	SOC 4882	SOC	4882	4882	4000	Urb Issues Plng & Soc Policy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.849609	2025-11-20 22:15:10.849615
3233	SOC 4903	SOC	4903	4903	4000	Population Issues		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.853713	2025-11-20 22:15:10.853718
3234	SOC 4911	SOC	4911	4911	4000	Drugs & Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.857813	2025-11-20 22:15:10.857819
3235	SOC 4921	SOC	4921	4921	4000	Criminology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.861785	2025-11-20 22:15:10.86179
3236	SOC 4954	SOC	4954	4954	4000	Juvenile Delinquency		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.865427	2025-11-20 22:15:10.865433
3237	SOC 5070	SOC	5070	5070	5000	Spec Top Women, Lit, Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.869551	2025-11-20 22:15:10.869557
3238	SOC 5080	SOC	5080	5080	5000	Persp Wom Gender Sex		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.873705	2025-11-20 22:15:10.87371
3239	SOC 5086	SOC	5086	5086	5000	Sociological Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.877774	2025-11-20 22:15:10.877779
3240	SOC 5094	SOC	5094	5094	5000	Social Change		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.881714	2025-11-20 22:15:10.88172
3241	SOC 5098	SOC	5098	5098	5000	Selected Topics Sociology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.88577	2025-11-20 22:15:10.885776
3242	SOC 5101	SOC	5101	5101	5000	Social Organization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.889525	2025-11-20 22:15:10.88953
3243	SOC 5103	SOC	5103	5103	5000	Racial Issues		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.893446	2025-11-20 22:15:10.893451
3244	SOC 5104	SOC	5104	5104	5000	The Family		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.897433	2025-11-20 22:15:10.897439
3245	SOC 5107	SOC	5107	5107	5000	Sociology of Gender		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.901689	2025-11-20 22:15:10.901695
3246	SOC 5113	SOC	5113	5113	5000	Aging and Death		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.905434	2025-11-20 22:15:10.90544
3247	SOC 5124	SOC	5124	5124	5000	Social Stratification		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.909367	2025-11-20 22:15:10.909372
3248	SOC 5150	SOC	5150	5150	5000	Sociology of Pop Culture		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.913335	2025-11-20 22:15:10.913341
3249	SOC 5216	SOC	5216	5216	5000	Advanced Social Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.917278	2025-11-20 22:15:10.917284
3250	SOC 5219	SOC	5219	5219	5000	Social Deviance		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.921357	2025-11-20 22:15:10.921363
3251	SOC 5788	SOC	5788	5788	5000	Social Statistics II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.925503	2025-11-20 22:15:10.925509
3252	SOC 5871	SOC	5871	5871	5000	Sociology of Environment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.929777	2025-11-20 22:15:10.929783
3253	SOC 5875	SOC	5875	5875	5000	Soc of Disaster		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.933856	2025-11-20 22:15:10.933862
3254	SOC 5881	SOC	5881	5881	5000	The Urban Community		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.937773	2025-11-20 22:15:10.937779
3255	SOC 5882	SOC	5882	5882	5000	Urb Issues Plng & Soc Policy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.941679	2025-11-20 22:15:10.941685
3256	SOC 5903	SOC	5903	5903	5000	Population Issues		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.945412	2025-11-20 22:15:10.945417
3257	SOC 5911	SOC	5911	5911	5000	Drugs & Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.949436	2025-11-20 22:15:10.949441
3258	SOC 5921	SOC	5921	5921	5000	Criminology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.953607	2025-11-20 22:15:10.953613
3259	SOC 5954	SOC	5954	5954	5000	Juvenile Delinquency		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.957708	2025-11-20 22:15:10.957713
3260	SOC 6098	SOC	6098	6098	6000	Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.961781	2025-11-20 22:15:10.961787
3261	SOC 6105	SOC	6105	6105	6000	Sem Complex Org & Bureaucracy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.965887	2025-11-20 22:15:10.965893
3262	SOC 6107	SOC	6107	6107	6000	Socl Perspectives on Gender		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.969913	2025-11-20 22:15:10.969919
3263	SOC 6396	SOC	6396	6396	6000	Ind Readings Sociology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.974018	2025-11-20 22:15:10.974024
3264	SOC 6397	SOC	6397	6397	6000	Ind Readings Sociology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.9781	2025-11-20 22:15:10.978106
3265	SOC 6398	SOC	6398	6398	6000	Ind Readings Sociology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.982122	2025-11-20 22:15:10.982146
3266	SOC 6573	SOC	6573	6573	6000	Social Psychology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.986307	2025-11-20 22:15:10.986312
3267	SOC 6783	SOC	6783	6783	6000	Advanced Sociological Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.990292	2025-11-20 22:15:10.990297
3268	SOC 6784	SOC	6784	6784	6000	Meth of Sociological Investign		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:10.99445	2025-11-20 22:15:10.994456
3269	SOC 6785	SOC	6785	6785	6000	Sem Research Applications		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:10.998715	2025-11-20 22:15:10.998721
3270	SOC 6788	SOC	6788	6788	6000	Qualitatv Methods in Sociology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.002761	2025-11-20 22:15:11.002767
3271	SOC 6813	SOC	6813	6813	6000	Urban Sociology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.006851	2025-11-20 22:15:11.006857
3272	SOC 6816	SOC	6816	6816	6000	Sem Sexualities		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.010941	2025-11-20 22:15:11.010947
3273	SOC 6871	SOC	6871	6871	6000	Adv Environmental Sociology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.014935	2025-11-20 22:15:11.014941
3274	SOC 7000	SOC	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.018985	2025-11-20 22:15:11.01899
3275	SOC 7040	SOC	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.023302	2025-11-20 22:15:11.023307
3276	SPAN 1001	SPAN	1001	1001	1000	Basic Spanish I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.027493	2025-11-20 22:15:11.027499
3277	SPAN 1002	SPAN	1002	1002	1000	Basic Spanish II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.031928	2025-11-20 22:15:11.031934
3278	SPAN 2001	SPAN	2001	2001	2000	Intermediate Spanish I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.036281	2025-11-20 22:15:11.036286
3279	SPAN 2002	SPAN	2002	2002	2000	Intermediate Spanish II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.040347	2025-11-20 22:15:11.040352
3280	SPAN 3002	SPAN	3002	3002	3000	Phonetics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.044505	2025-11-20 22:15:11.04451
3281	SPAN 3005	SPAN	3005	3005	3000	Romance Linguistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.048727	2025-11-20 22:15:11.048733
3282	SPAN 3031	SPAN	3031	3031	3000	Spanish Conversation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.052784	2025-11-20 22:15:11.052789
3283	SPAN 3041	SPAN	3041	3041	3000	Advanced Spanish Grammar		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.056886	2025-11-20 22:15:11.056892
3284	SPAN 3042	SPAN	3042	3042	3000	Advanced Spanish Comp & Syntax		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.06093	2025-11-20 22:15:11.060936
3285	SPAN 3055	SPAN	3055	3055	3000	Analysis & Interpret Span Lit		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.064954	2025-11-20 22:15:11.06496
3286	SPAN 3100	SPAN	3100	3100	3000	Survey Spanish Literature I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.069059	2025-11-20 22:15:11.069065
3287	SPAN 3101	SPAN	3101	3101	3000	Survey Spanish Literature II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.073284	2025-11-20 22:15:11.07329
3288	SPAN 3191	SPAN	3191	3191	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.077417	2025-11-20 22:15:11.077422
3289	SPAN 3192	SPAN	3192	3192	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.08158	2025-11-20 22:15:11.081586
3290	SPAN 3193	SPAN	3193	3193	3000	Independent Work		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.085725	2025-11-20 22:15:11.085731
3291	SPAN 3194	SPAN	3194	3194	3000	Internship in Spanish		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.089626	2025-11-20 22:15:11.089631
3292	SPAN 3195	SPAN	3195	3195	3000	Internship in Spanish		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.093721	2025-11-20 22:15:11.093727
3293	SPAN 3196	SPAN	3196	3196	3000	Internship in Spanish		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.097756	2025-11-20 22:15:11.097762
3294	SPAN 3197	SPAN	3197	3197	3000	Oral Proficiency		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.101797	2025-11-20 22:15:11.101802
3295	SPAN 3271	SPAN	3271	3271	3000	Spanihmerican Civilization		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.105799	2025-11-20 22:15:11.105804
3296	SPAN 3402	SPAN	3402	3402	3000	Spanihmerican Lit in Trans		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.109918	2025-11-20 22:15:11.109924
3297	SPAN 3406	SPAN	3406	3406	3000	Romance Cult New Orl		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.113683	2025-11-20 22:15:11.113689
3298	SPAN 3500	SPAN	3500	3500	3000	Tutorial for Graduating Majors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.11781	2025-11-20 22:15:11.117816
3299	SPAN 4007	SPAN	4007	4007	4000	Spanish Dialectology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.121727	2025-11-20 22:15:11.121732
3300	SPAN 4015	SPAN	4015	4015	4000	History of Spanish Language		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.125695	2025-11-20 22:15:11.1257
3301	SPAN 4031	SPAN	4031	4031	4000	Advanced Spanish Conversation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.129681	2025-11-20 22:15:11.129686
3302	SPAN 4041	SPAN	4041	4041	4000	Problems Grammatical Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.133757	2025-11-20 22:15:11.133764
3303	SPAN 4051	SPAN	4051	4051	4000	Business Spanish		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.137713	2025-11-20 22:15:11.137719
3304	SPAN 4070	SPAN	4070	4070	4000	Introduction to the Fields of Translation and Interpreting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.141714	2025-11-20 22:15:11.141719
3305	SPAN 4122	SPAN	4122	4122	4000	Span Lit Golden Age		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.1457	2025-11-20 22:15:11.145705
3306	SPAN 4171	SPAN	4171	4171	4000	Translation and Interpreting in the Healthcare Setting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.149695	2025-11-20 22:15:11.1497
3307	SPAN 4173	SPAN	4173	4173	4000	Translation and Interpreting in the Legal Setting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.153512	2025-11-20 22:15:11.153517
3308	SPAN 4180	SPAN	4180	4180	4000	Modern Lit in Span		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.157635	2025-11-20 22:15:11.15764
3309	SPAN 4201	SPAN	4201	4201	4000	Spanish Civilization I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.161772	2025-11-20 22:15:11.161778
3310	SPAN 4202	SPAN	4202	4202	4000	Spanish Civilization II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.165775	2025-11-20 22:15:11.16578
3311	SPAN 4203	SPAN	4203	4203	4000	Spanihmerican Civiliztn I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.169674	2025-11-20 22:15:11.16968
3312	SPAN 5007	SPAN	5007	5007	5000	Spanish Dialectology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.17379	2025-11-20 22:15:11.173795
3313	SPAN 5015	SPAN	5015	5015	5000	History of Spanish Language		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.177888	2025-11-20 22:15:11.177894
3314	SPAN 5031	SPAN	5031	5031	5000	Advanced Spanish Conversation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.181925	2025-11-20 22:15:11.181931
3315	SPAN 5041	SPAN	5041	5041	5000	Problems Grammatical Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.185806	2025-11-20 22:15:11.185812
3316	SPAN 5051	SPAN	5051	5051	5000	Business Spanish		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.189778	2025-11-20 22:15:11.189784
3317	SPAN 5070	SPAN	5070	5070	5000	Introduction to the Fields of Translation and Interpreting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.193558	2025-11-20 22:15:11.193586
3318	SPAN 5122	SPAN	5122	5122	5000	Span Lit Golden Age		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.197725	2025-11-20 22:15:11.197731
3319	SPAN 5171	SPAN	5171	5171	5000	Translation and Interpreting in the Healthcare Setting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.201816	2025-11-20 22:15:11.201822
3320	SPAN 5173	SPAN	5173	5173	5000	Translation and Interpreting in the Legal Setting		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.206113	2025-11-20 22:15:11.206119
3321	SPAN 5180	SPAN	5180	5180	5000	Modern Lit in Span		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.210328	2025-11-20 22:15:11.210334
3322	SPAN 5201	SPAN	5201	5201	5000	Spanish Civilization I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.214464	2025-11-20 22:15:11.21447
3323	SPAN 5202	SPAN	5202	5202	5000	Spanish Civilization II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.218421	2025-11-20 22:15:11.218427
3324	SPAN 5203	SPAN	5203	5203	5000	Spanihmerican Civiliztn I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.222479	2025-11-20 22:15:11.222485
3325	SPAN 6007	SPAN	6007	6007	6000	Spanish Linguistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.226496	2025-11-20 22:15:11.226502
3326	SPAN 6097	SPAN	6097	6097	6000	Studies Spanish Linguistics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.230603	2025-11-20 22:15:11.230609
3327	SPAN 6190	SPAN	6190	6190	6000	Std Medieval Span Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.234739	2025-11-20 22:15:11.234745
3328	SPAN 6191	SPAN	6191	6191	6000	Studies Golden Age Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.238905	2025-11-20 22:15:11.238911
3329	SPAN 6197	SPAN	6197	6197	6000	Studies Spnmer Lit Aft 1810		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.242953	2025-11-20 22:15:11.242959
3330	SPAN 6198	SPAN	6198	6198	6000	Studies Spanish Literature		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.247012	2025-11-20 22:15:11.247017
3331	SPAN 6205	SPAN	6205	6205	6000	Spanish Thought		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.251002	2025-11-20 22:15:11.251007
3332	SPAN 6265	SPAN	6265	6265	6000	Contemp Hispanic Soc & Inst		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.255001	2025-11-20 22:15:11.255006
3333	SPAN 6295	SPAN	6295	6295	6000	Studies Hispanic Culture & Civ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.258697	2025-11-20 22:15:11.258702
3334	SPAN 6397	SPAN	6397	6397	6000	Directed Study		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.262645	2025-11-20 22:15:11.26265
3335	SPAN 7000	SPAN	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.266606	2025-11-20 22:15:11.266612
3336	SPAN 7040	SPAN	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.271032	2025-11-20 22:15:11.271037
3337	EDSP 1001	EDSP	1001	1001	1000	Basic Sign Language I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.275304	2025-11-20 22:15:11.275309
3338	EDSP 2001	EDSP	2001	2001	2000	Intermediate Sign Language I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.279453	2025-11-20 22:15:11.279459
3339	EDSP 3610	EDSP	3610	3610	3000	Intro Students M/M		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.283594	2025-11-20 22:15:11.283599
3340	EDSP 3612	EDSP	3612	3612	3000	Intro to Spec Ed: Principles		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.28774	2025-11-20 22:15:11.287746
3341	EDSP 3620	EDSP	3620	3620	3000	Methods Students M/M		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.291796	2025-11-20 22:15:11.291802
3342	EDSP 3640	EDSP	3640	3640	3000	Transition Spec Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.29582	2025-11-20 22:15:11.295826
3343	EDSP 3650	EDSP	3650	3650	3000	Prac in Positive Behavior		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.29985	2025-11-20 22:15:11.299856
3344	EDSP 3660	EDSP	3660	3660	3000	Practicum Inclusive		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.303887	2025-11-20 22:15:11.303892
3345	EDSP 3982	EDSP	3982	3982	3000	Ind Study Spec Educ & Hab Serv		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.307781	2025-11-20 22:15:11.307787
3346	EDSP 4010	EDSP	4010	4010	4000	Intro Instruc Issues Sevr Dis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.311944	2025-11-20 22:15:11.31195
3347	EDSP 4060	EDSP	4060	4060	4000	Behavior Mod Appl Settings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.316043	2025-11-20 22:15:11.316049
3348	EDSP 4420	EDSP	4420	4420	4000	Foundations Deaf Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.320058	2025-11-20 22:15:11.320064
3349	EDSP 4440	EDSP	4440	4440	4000	Sign Language I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.323898	2025-11-20 22:15:11.323904
3350	EDSP 4450	EDSP	4450	4450	4000	Sign Language II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.327814	2025-11-20 22:15:11.327819
3351	EDSP 4510	EDSP	4510	4510	4000	Intro to Gifted/Talented		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.331801	2025-11-20 22:15:11.331807
3352	EDSP 4730	EDSP	4730	4730	4000	Residency I: Elem Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.335862	2025-11-20 22:15:11.335868
3353	EDSP 4740	EDSP	4740	4740	4000	Res II: Elem E Spec Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.339868	2025-11-20 22:15:11.339874
3354	EDSP 4775	EDSP	4775	4775	4000	Tests/Meas Except Individuals		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.343884	2025-11-20 22:15:11.34389
3355	EDSP 4776	EDSP	4776	4776	4000	Tests/Meas Ind W Exceptionalt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.347791	2025-11-20 22:15:11.347797
3356	EDSP 4820	EDSP	4820	4820	4000	Introduction to Braille		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.35172	2025-11-20 22:15:11.351725
3357	EDSP 4830	EDSP	4830	4830	4000	Mobility Trn Visually Impaired		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.355724	2025-11-20 22:15:11.35573
3358	EDSP 5010	EDSP	5010	5010	5000	Intro Instruc Issues Sevr Dis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.359795	2025-11-20 22:15:11.359801
3359	EDSP 5060	EDSP	5060	5060	5000	Behavior Mod Appl Settings		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.363886	2025-11-20 22:15:11.363892
3360	EDSP 5420	EDSP	5420	5420	5000	Foundations Deaf Education		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.367953	2025-11-20 22:15:11.367958
3361	EDSP 5440	EDSP	5440	5440	5000	Sign Language I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.372305	2025-11-20 22:15:11.372311
3362	EDSP 5450	EDSP	5450	5450	5000	Sign Language II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.37642	2025-11-20 22:15:11.376425
3363	EDSP 5510	EDSP	5510	5510	5000	Intro to Gifted/Talented		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.380589	2025-11-20 22:15:11.380595
3364	EDSP 5775	EDSP	5775	5775	5000	Tests/Meas Except Individuals		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.384534	2025-11-20 22:15:11.38454
3365	EDSP 5776	EDSP	5776	5776	5000	Tests/Meas Ind W Exceptionalt		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.38869	2025-11-20 22:15:11.388695
3366	EDSP 5810	EDSP	5810	5810	5000	Structure Foundation of Eye		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.392782	2025-11-20 22:15:11.392788
3367	EDSP 5820	EDSP	5820	5820	5000	Introduction to Braille		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.396839	2025-11-20 22:15:11.396845
3368	EDSP 5830	EDSP	5830	5830	5000	Mobility Trn Visually Impaired		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.400746	2025-11-20 22:15:11.400752
3369	EDSP 5990	EDSP	5990	5990	5000	Spec Topics in SpEd/Habil		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.4048	2025-11-20 22:15:11.404806
3370	EDSP 6000	EDSP	6000	6000	6000	Comm Lit Signif Dis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.408885	2025-11-20 22:15:11.40889
3371	EDSP 6010	EDSP	6010	6010	6000	Mang Beh Except Populations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.413093	2025-11-20 22:15:11.413098
3372	EDSP 6030	EDSP	6030	6030	6000	Hlth/Physical Consid Sv Dis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.417173	2025-11-20 22:15:11.417178
3373	EDSP 6040	EDSP	6040	6040	6000	Instructional Issues Sv Dis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.421169	2025-11-20 22:15:11.421175
3374	EDSP 6050	EDSP	6050	6050	6000	Adv Instructional Issue Sv Dis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.425327	2025-11-20 22:15:11.425332
3375	EDSP 6060	EDSP	6060	6060	6000	Action Research in Education		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.429388	2025-11-20 22:15:11.429394
3376	EDSP 6085	EDSP	6085	6085	6000	Found Erly Chld Intr		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.433582	2025-11-20 22:15:11.433589
3377	EDSP 6090	EDSP	6090	6090	6000	Family & Community Partnership		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.437795	2025-11-20 22:15:11.4378
3378	EDSP 6110	EDSP	6110	6110	6000	Res I Elem Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.441803	2025-11-20 22:15:11.441809
3379	EDSP 6111	EDSP	6111	6111	6000	Res I: Elem Ed Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.444948	2025-11-20 22:15:11.444954
3380	EDSP 6120	EDSP	6120	6120	6000	Res II: Elem Ed Spec Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.447678	2025-11-20 22:15:11.447682
3381	EDSP 6121	EDSP	6121	6121	6000	Res II: Elem E Spec Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.451461	2025-11-20 22:15:11.451465
3382	EDSP 6130	EDSP	6130	6130	6000	Res I: Early Int Student Teach		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.455158	2025-11-20 22:15:11.455163
3383	EDSP 6131	EDSP	6131	6131	6000	Res I: Early Interv Intern		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.4588	2025-11-20 22:15:11.458805
3384	EDSP 6140	EDSP	6140	6140	6000	Res II: Early Int Stud Teach		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.462505	2025-11-20 22:15:11.46251
3385	EDSP 6141	EDSP	6141	6141	6000	Res II: Early Interv Intern		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.466184	2025-11-20 22:15:11.466189
3386	EDSP 6160	EDSP	6160	6160	6000	Res I: Second E Inclusion		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.469876	2025-11-20 22:15:11.469881
3387	EDSP 6161	EDSP	6161	6161	6000	Res I: Sec E Inc Intern		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.473684	2025-11-20 22:15:11.473689
3388	EDSP 6170	EDSP	6170	6170	6000	Res II: Secondary E Spec Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.477433	2025-11-20 22:15:11.477438
3389	EDSP 6171	EDSP	6171	6171	6000	Res II: Sec E Sp Ed Intern		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.481239	2025-11-20 22:15:11.481244
3390	EDSP 6210	EDSP	6210	6210	6000	Indiv with Autism I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.484965	2025-11-20 22:15:11.48497
3391	EDSP 6220	EDSP	6220	6220	6000	Indiv With Autism II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.488733	2025-11-20 22:15:11.488738
3392	EDSP 6420	EDSP	6420	6420	6000	Educational Audiology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.492614	2025-11-20 22:15:11.492619
3393	EDSP 6440	EDSP	6440	6440	6000	Lang Dev & Instr Strat Deaf		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.496442	2025-11-20 22:15:11.496447
3394	EDSP 6445	EDSP	6445	6445	6000	Com Meth Litrcy D/HH		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.500473	2025-11-20 22:15:11.500479
3395	EDSP 6460	EDSP	6460	6460	6000	Teach Speech & Speechreading		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.504302	2025-11-20 22:15:11.504307
3396	EDSP 6480	EDSP	6480	6480	6000	Curriculum Dev for Deaf		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.508016	2025-11-20 22:15:11.508021
3397	EDSP 6510	EDSP	6510	6510	6000	Social Emotional Needs Gifted		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.511869	2025-11-20 22:15:11.511874
3398	EDSP 6530	EDSP	6530	6530	6000	Creative Thinking		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.515685	2025-11-20 22:15:11.51569
3399	EDSP 6540	EDSP	6540	6540	6000	Educ Strat for Gift/Talented		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.519747	2025-11-20 22:15:11.519753
3400	EDSP 6545	EDSP	6545	6545	6000	Literature for Gifted/Talented		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.523798	2025-11-20 22:15:11.523803
3401	EDSP 6550	EDSP	6550	6550	6000	Gifted Talentd:CurrDev Prg Org		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.527884	2025-11-20 22:15:11.52789
3402	EDSP 6555	EDSP	6555	6555	6000	Disab Chld Early Interv Prog		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.531792	2025-11-20 22:15:11.531798
3403	EDSP 6560	EDSP	6560	6560	6000	Comm & Literacy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.535789	2025-11-20 22:15:11.535794
3404	EDSP 6610	EDSP	6610	6610	6000	Adv Meth Lrn/Behav Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.539817	2025-11-20 22:15:11.539822
3405	EDSP 6625	EDSP	6625	6625	6000	Adv Trans Plan Stu with Disab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.543879	2025-11-20 22:15:11.543885
3406	EDSP 6775	EDSP	6775	6775	6000	Indiv Intelligence Testing		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.547868	2025-11-20 22:15:11.547873
3407	EDSP 6780	EDSP	6780	6780	6000	Psych Assess Indiv with Excep		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.551791	2025-11-20 22:15:11.551796
3408	EDSP 6781	EDSP	6781	6781	6000	Consult/Collab in Spec Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.555705	2025-11-20 22:15:11.555711
3409	EDSP 6785	EDSP	6785	6785	6000	Diag/Prescrp Strg Ind W/Except		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.559722	2025-11-20 22:15:11.559728
3410	EDSP 6945	EDSP	6945	6945	6000	Practicum Hearing Impaired Std		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.563977	2025-11-20 22:15:11.563983
3411	EDSP 6950	EDSP	6950	6950	6000	Practicum Gifted/Talented		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.56807	2025-11-20 22:15:11.568075
3412	EDSP 6962	EDSP	6962	6962	6000	Student Teaching Special Educ		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.572004	2025-11-20 22:15:11.57201
3413	EDSP 6964	EDSP	6964	6964	6000	Fundamentals of Technology		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.575977	2025-11-20 22:15:11.575983
3414	EDSP 6970	EDSP	6970	6970	6000	Pract Psycho Educ Diagnosis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.580022	2025-11-20 22:15:11.580027
3415	EDSP 6980	EDSP	6980	6980	6000	Practicum Visual Impairment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.584121	2025-11-20 22:15:11.584146
3416	EDSP 6981	EDSP	6981	6981	6000	Contemp Issues In Ed		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.588089	2025-11-20 22:15:11.588095
3417	EDSP 6982	EDSP	6982	6982	6000	Ind Study Spec Ed & Habil Svc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.592279	2025-11-20 22:15:11.592285
3418	EDSP 6985	EDSP	6985	6985	6000	Internship Spec Ed & Habil Svc		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.596388	2025-11-20 22:15:11.596394
3419	EDSP 6990	EDSP	6990	6990	6000	Sel Topics Spec Ed & Habil Svc		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.600548	2025-11-20 22:15:11.600554
3420	EDSP 7010	EDSP	7010	7010	7000	Doctoral Sem Leadrship Roles		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.604711	2025-11-20 22:15:11.604717
3421	EDSP 7040	EDSP	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.60886	2025-11-20 22:15:11.608866
3422	EDSP 7050	EDSP	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.612859	2025-11-20 22:15:11.612864
3423	TRNS 4020	TRNS	4020	4020	4000	Intermodal Freight Transport		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.616793	2025-11-20 22:15:11.616798
3424	TRNS 4061	TRNS	4061	4061	4000	Introduction to Transportation Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.62084	2025-11-20 22:15:11.620846
3425	TRNS 5060	TRNS	5060	5060	5000	Active Transportation Planning, Policy and Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.624873	2025-11-20 22:15:11.624879
3426	TRNS 6000	TRNS	6000	6000	6000	Spec Topics in Transportation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.628953	2025-11-20 22:15:11.628958
3427	TRNS 6010	TRNS	6010	6010	6000	Transportation Seminar		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:11.632706	2025-11-20 22:15:11.632711
3428	TRNS 6100	TRNS	6100	6100	6000	Environment and Energy		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.636719	2025-11-20 22:15:11.636724
3429	TRNS 6200	TRNS	6200	6200	6000	Transport Policy & Admin		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.640633	2025-11-20 22:15:11.640639
3430	TRNS 6300	TRNS	6300	6300	6000	Applied Techniques for Transportation Professionals		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.644836	2025-11-20 22:15:11.644842
3431	TRNS 6800	TRNS	6800	6800	6000	Transportation Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.648903	2025-11-20 22:15:11.648908
3432	TRNS 6900	TRNS	6900	6900	6000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.652898	2025-11-20 22:15:11.652903
3433	TRNS 6901	TRNS	6901	6901	6000	Transportation Capstone I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.656869	2025-11-20 22:15:11.656875
3434	TRNS 6902	TRNS	6902	6902	6000	Transportation Capstone II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.660895	2025-11-20 22:15:11.660901
3435	TRNS 7000	TRNS	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.664978	2025-11-20 22:15:11.664984
3436	TRNS 7040	TRNS	7040	7040	7000	Examination or Thesis Only		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.669042	2025-11-20 22:15:11.669048
3437	UNIV 1001	UNIV	1001	1001	1000	University Success		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.673203	2025-11-20 22:15:11.673209
3438	UNIV 1003	UNIV	1003	1003	1000	Academic Success		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.677023	2025-11-20 22:15:11.677028
3439	UNIV 3002	UNIV	3002	3002	3000	Leadership and Mentors		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.681011	2025-11-20 22:15:11.681017
3440	MURP 4005	MURP	4005	4005	4000	Intro Neighborhood Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.684999	2025-11-20 22:15:11.685004
3441	MURP 4010	MURP	4010	4010	4000	Policies and Politics of Historic Preservation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.688986	2025-11-20 22:15:11.688991
3442	MURP 4030	MURP	4030	4030	4000	Social Policy Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.69311	2025-11-20 22:15:11.693115
3443	MURP 4050	MURP	4050	4050	4000	Urb Land Use Plan & Plan Makng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.697282	2025-11-20 22:15:11.697288
3444	MURP 4062	MURP	4062	4062	4000	Applied Trans Plan		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.701378	2025-11-20 22:15:11.701384
3445	MURP 4063	MURP	4063	4063	4000	Land Use Trans Plan		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.705624	2025-11-20 22:15:11.70563
3446	MURP 4071	MURP	4071	4071	4000	Historic Preservation Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.709345	2025-11-20 22:15:11.709352
3447	MURP 4081	MURP	4081	4081	4000	GIS for the Planning Profession		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.713372	2025-11-20 22:15:11.713377
3448	MURP 4140	MURP	4140	4140	4000	Environmental Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.717326	2025-11-20 22:15:11.717332
3449	MURP 4145	MURP	4145	4145	4000	Coastal Zone Planning & Admin		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.721261	2025-11-20 22:15:11.721267
3450	MURP 4200	MURP	4200	4200	4000	American City Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.725278	2025-11-20 22:15:11.725283
3451	MURP 4500	MURP	4500	4500	4000	Energy Pln for Cit & Regions		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.729119	2025-11-20 22:15:11.729125
3452	MURP 4710	MURP	4710	4710	4000	Urbanism & Urban Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.733012	2025-11-20 22:15:11.733017
3453	MURP 4750	MURP	4750	4750	4000	Design & Mgmt of Urban Parks		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.736995	2025-11-20 22:15:11.737001
3454	MURP 4800	MURP	4800	4800	4000	Spec Studisrban Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.741034	2025-11-20 22:15:11.74104
3455	MURP 4820	MURP	4820	4820	4000	Tourism for Urban & Reg Plan		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.744936	2025-11-20 22:15:11.744942
3456	MURP 4900	MURP	4900	4900	4000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.748687	2025-11-20 22:15:11.748692
3457	MURP 5005	MURP	5005	5005	5000	Intro Neighborhood Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.752721	2025-11-20 22:15:11.752727
3458	MURP 5010	MURP	5010	5010	5000	Policies and Politics of Historic Preservation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.756784	2025-11-20 22:15:11.756789
3459	MURP 5030	MURP	5030	5030	5000	Social Policy Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.760831	2025-11-20 22:15:11.760837
3460	MURP 5050	MURP	5050	5050	5000	Urb Land Use Plan & Plan Makng		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.764907	2025-11-20 22:15:11.764912
3461	MURP 5062	MURP	5062	5062	5000	Applied Trans Plan		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.768925	2025-11-20 22:15:11.76893
3462	MURP 5063	MURP	5063	5063	5000	Land Use Trans Plan		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.773049	2025-11-20 22:15:11.773055
3463	MURP 5070	MURP	5070	5070	5000	Dev Impact Assessment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.777292	2025-11-20 22:15:11.777298
3464	MURP 5071	MURP	5071	5071	5000	Historic Preservation Law		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.781442	2025-11-20 22:15:11.781448
3465	MURP 5081	MURP	5081	5081	5000	GIS for the Planning Profession		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.78564	2025-11-20 22:15:11.785646
3466	MURP 5140	MURP	5140	5140	5000	Environmental Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.789651	2025-11-20 22:15:11.789656
3467	MURP 5145	MURP	5145	5145	5000	Coastal Zone Planning & Admin		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.793612	2025-11-20 22:15:11.793617
3468	MURP 5200	MURP	5200	5200	5000	American City Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.797755	2025-11-20 22:15:11.797761
3469	MURP 5500	MURP	5500	5500	5000	Energy Pln for Cit & Regions		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.801773	2025-11-20 22:15:11.801778
3470	MURP 5660	MURP	5660	5660	5000	Negot & Mediation for Planners		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.805832	2025-11-20 22:15:11.805838
3471	MURP 5710	MURP	5710	5710	5000	Urbanism & Urban Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.810284	2025-11-20 22:15:11.81029
3472	MURP 5750	MURP	5750	5750	5000	Design & Mgmt of Urban Parks		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.814425	2025-11-20 22:15:11.81443
3473	MURP 5800	MURP	5800	5800	5000	Spec Studisrban Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.818388	2025-11-20 22:15:11.818394
3474	MURP 5820	MURP	5820	5820	5000	Tourism for Urban & Reg Plan		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.822556	2025-11-20 22:15:11.822583
3475	MURP 6010	MURP	6010	6010	6000	Plan Neigh & Smaller Community		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.826426	2025-11-20 22:15:11.826432
3476	MURP 6020	MURP	6020	6020	6000	Analytic Methods for Planners		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.830367	2025-11-20 22:15:11.830372
3477	MURP 6030	MURP	6030	6030	6000	Social Policy Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.834354	2025-11-20 22:15:11.83436
3478	MURP 6051	MURP	6051	6051	6000	Housing and Comm Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.838522	2025-11-20 22:15:11.838528
3479	MURP 6071	MURP	6071	6071	6000	Zonigand Use Regulation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.84275	2025-11-20 22:15:11.842756
3480	MURP 6100	MURP	6100	6100	6000	Transit Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.846797	2025-11-20 22:15:11.846803
3481	MURP 6121	MURP	6121	6121	6000	Urban & Regional Analysis II		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.850775	2025-11-20 22:15:11.850781
3482	MURP 6130	MURP	6130	6130	6000	Urban Dev:Social Perspective		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.854853	2025-11-20 22:15:11.854859
3483	MURP 6140	MURP	6140	6140	6000	Citizen Participation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.859039	2025-11-20 22:15:11.859045
3484	MURP 6175	MURP	6175	6175	6000	Dev Finance for Planners		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.863116	2025-11-20 22:15:11.863121
3485	MURP 6180	MURP	6180	6180	6000	Site Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.867022	2025-11-20 22:15:11.867027
3486	MURP 6401	MURP	6401	6401	6000	Urban Public Works Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.870977	2025-11-20 22:15:11.870983
3487	MURP 6450	MURP	6450	6450	6000	Local Economic Development		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.874896	2025-11-20 22:15:11.874901
3488	MURP 6500	MURP	6500	6500	6000	Urban Plan Prac in Dev Nations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.878832	2025-11-20 22:15:11.878837
3489	MURP 6520	MURP	6520	6520	6000	Comparative Planning & Urb Dev		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.882479	2025-11-20 22:15:11.882484
3490	MURP 6601	MURP	6601	6601	6000	Sem Urban Planning Models		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.886481	2025-11-20 22:15:11.886486
3491	MURP 6605	MURP	6605	6605	6000	Sem Land Use Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.890273	2025-11-20 22:15:11.890278
3492	MURP 6620	MURP	6620	6620	6000	History & Theory Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.894279	2025-11-20 22:15:11.894284
3493	MURP 6650	MURP	6650	6650	6000	Recreational Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.898249	2025-11-20 22:15:11.898254
3494	MURP 6710	MURP	6710	6710	6000	Urbanism and Urban Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.902168	2025-11-20 22:15:11.902173
3495	MURP 6720	MURP	6720	6720	6000	Practicum in Urban & Regional Planning		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.906222	2025-11-20 22:15:11.906228
3496	MURP 6721	MURP	6721	6721	6000	Practicum Planning Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.91001	2025-11-20 22:15:11.910015
3497	MURP 6800	MURP	6800	6800	6000	Planning Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.91365	2025-11-20 22:15:11.913655
3498	MURP 6900	MURP	6900	6900	6000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.916521	2025-11-20 22:15:11.916526
3499	MURP 7000	MURP	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.919318	2025-11-20 22:15:11.919323
3500	MURP 7040	MURP	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.922109	2025-11-20 22:15:11.922114
3501	ENCM 1000	ENCM	1000	1000	1000	Introduction to Urban Construction Management		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.924888	2025-11-20 22:15:11.924893
3502	ENCM 2100	ENCM	2100	2100	2000	Construction Graphics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.927218	2025-11-20 22:15:11.927222
3503	ENCM 2300	ENCM	2300	2300	2000	Urban Architectural Design in Construction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.929263	2025-11-20 22:15:11.929267
3504	ENCM 2311	ENCM	2311	2311	2000	Construction Materials Lab		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.931258	2025-11-20 22:15:11.931262
3505	ENCM 2350	ENCM	2350	2350	2000	Structure I		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.933291	2025-11-20 22:15:11.933295
3506	ENCM 3130	ENCM	3130	3130	3000	Urban Construction Techniques & Methods		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.935302	2025-11-20 22:15:11.935306
3507	ENCM 3200	ENCM	3200	3200	3000	Construction Codes, Documents, and Specifications		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.937303	2025-11-20 22:15:11.937306
3508	ENCM 3340	ENCM	3340	3340	3000	Soils and Equipment		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.939265	2025-11-20 22:15:11.939269
3509	ENCM 3350	ENCM	3350	3350	3000	Advanced Structures		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.941259	2025-11-20 22:15:11.941263
3510	ENCM 3600	ENCM	3600	3600	3000	Construction Estimating		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.943239	2025-11-20 22:15:11.943242
3511	ENCM 3620	ENCM	3620	3620	3000	Construction Scheduling		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.945173	2025-11-20 22:15:11.945176
3512	ENCM 3800	ENCM	3800	3800	3000	Construction Finance and Feasibility		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.94716	2025-11-20 22:15:11.947164
3513	ENCM 4500	ENCM	4500	4500	4000	MEP Construction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.949084	2025-11-20 22:15:11.949088
3514	ENCM 4600	ENCM	4600	4600	4000	Construction Safety Regulations		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.951068	2025-11-20 22:15:11.951072
3515	ENCM 4610	ENCM	4610	4610	4000	Historic Structures Restoration and Preservation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.953044	2025-11-20 22:15:11.953049
3516	ENCM 4630	ENCM	4630	4630	4000	Construction Law and Contracts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.956367	2025-11-20 22:15:11.956371
3517	ENCM 4640	ENCM	4640	4640	4000	Sustainable Construction Techniques and Green Building		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.959607	2025-11-20 22:15:11.959611
3518	ENCM 4700	ENCM	4700	4700	4000	Computer Applications in Construction		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.963076	2025-11-20 22:15:11.963079
3519	ENCM 4800	ENCM	4800	4800	4000	Urban Construction Management Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.966291	2025-11-20 22:15:11.966295
3520	ENCM 4900	ENCM	4900	4900	4000	Capstone Project		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.969828	2025-11-20 22:15:11.969831
3521	URBN 1000	URBN	1000	1000	1000	Introduction to Cities		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.97381	2025-11-20 22:15:11.973816
3522	URBN 2000	URBN	2000	2000	2000	The New Orleans Region		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.977279	2025-11-20 22:15:11.977283
3523	URBN 2100	URBN	2100	2100	2000	Globalization and Mobility		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.980549	2025-11-20 22:15:11.980553
3524	URBN 2890	URBN	2890	2890	2000	Urbn Special Topics		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.98367	2025-11-20 22:15:11.983674
3525	URBN 2999	URBN	2999	2999	2000	Public Service		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.986908	2025-11-20 22:15:11.986911
3526	URBN 3002	URBN	3002	3002	3000	Introduction to Urban Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.990108	2025-11-20 22:15:11.990112
3527	URBN 3150	URBN	3150	3150	3000	The Suburbs and Car Culture		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.99335	2025-11-20 22:15:11.993354
3528	URBN 3710	URBN	3710	3710	3000	Fundamentals of Urban Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:11.996601	2025-11-20 22:15:11.996605
3529	URBN 3998	URBN	3998	3998	3000	Planning Internship		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:11.999838	2025-11-20 22:15:11.999842
3530	URBN 3999	URBN	3999	3999	3000	Senior Honors Thesis		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:12.003245	2025-11-20 22:15:12.003248
3531	URBN 4002	URBN	4002	4002	4000	The Shape of the City		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.006478	2025-11-20 22:15:12.006481
3532	URBN 4003	URBN	4003	4003	4000	The Post World War II City		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.009806	2025-11-20 22:15:12.00981
3533	URBN 4005	URBN	4005	4005	4000	The Everyday City		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.013214	2025-11-20 22:15:12.013218
3534	URBN 4060	URBN	4060	4060	4000	Active Transportation Planning, Policy, and Design		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.016744	2025-11-20 22:15:12.016748
3535	URBN 4100	URBN	4100	4100	4000	Gentrification Hist Dist		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.020406	2025-11-20 22:15:12.020411
3536	URBN 4140	URBN	4140	4140	4000	Citizen Participation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.024021	2025-11-20 22:15:12.024026
3537	URBN 4145	URBN	4145	4145	4000	Green Infrastructure		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.027669	2025-11-20 22:15:12.027674
3538	URBN 4150	URBN	4150	4150	4000	Planning for Hazards		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.03155	2025-11-20 22:15:12.031555
3539	URBN 4510	URBN	4510	4510	4000	Cities of the Global South		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.035437	2025-11-20 22:15:12.035441
3540	URBN 4670	URBN	4670	4670	4000	Grantwriting for Planners		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.039287	2025-11-20 22:15:12.039292
3541	URBN 4800	URBN	4800	4800	4000	Spec Studisrban Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.043222	2025-11-20 22:15:12.043227
3542	URBN 4810	URBN	4810	4810	4000	Environ Justice in Urbn Envmts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.047019	2025-11-20 22:15:12.047024
3543	URBN 4900	URBN	4900	4900	4000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:12.051015	2025-11-20 22:15:12.05102
3544	URBN 5002	URBN	5002	5002	5000	The Shape of the City		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.054846	2025-11-20 22:15:12.054851
3545	URBN 5003	URBN	5003	5003	5000	The Post World War II City		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.058696	2025-11-20 22:15:12.058701
3546	URBN 5005	URBN	5005	5005	5000	The Everyday City		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.06268	2025-11-20 22:15:12.062686
3547	URBN 5100	URBN	5100	5100	5000	Gentrification in Historic Districts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.066685	2025-11-20 22:15:12.06669
3548	URBN 5140	URBN	5140	5140	5000	Citizen Participation		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.070806	2025-11-20 22:15:12.070812
3549	URBN 5145	URBN	5145	5145	5000	Green Infrastructure		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.074919	2025-11-20 22:15:12.074925
3550	URBN 5150	URBN	5150	5150	5000	Planning for Hazards		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.079095	2025-11-20 22:15:12.0791
3551	URBN 5510	URBN	5510	5510	5000	Cities of the Global South		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.083272	2025-11-20 22:15:12.083278
3552	URBN 5670	URBN	5670	5670	5000	Grantwriting for Planners		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.087402	2025-11-20 22:15:12.087407
3553	URBN 5800	URBN	5800	5800	5000	Spec Studisrban Problems		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.091556	2025-11-20 22:15:12.091583
3554	URBN 5810	URBN	5810	5810	5000	Environ Justice in Urbn Envmts		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.095709	2025-11-20 22:15:12.095714
3555	URBN 6000	URBN	6000	6000	6000	Seminal Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:12.099771	2025-11-20 22:15:12.099777
3556	URBN 6005	URBN	6005	6005	6000	Statistics for Urban Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.103801	2025-11-20 22:15:12.103807
3557	URBN 6165	URBN	6165	6165	6000	Urban Public Policy Analysis		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.107859	2025-11-20 22:15:12.107865
3558	URBN 6510	URBN	6510	6510	6000	Ubural Issues Dev Countries		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.11193	2025-11-20 22:15:12.111936
3559	URBN 6900	URBN	6900	6900	6000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:12.115991	2025-11-20 22:15:12.115997
3560	URBN 7000	URBN	7000	7000	7000	Thesis Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:12.120287	2025-11-20 22:15:12.120292
3561	URBN 7040	URBN	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.124482	2025-11-20 22:15:12.124488
3562	DURB 6803	DURB	6803	6803	6000	Seminar Urban Hist		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:12.128529	2025-11-20 22:15:12.128535
3563	DURB 6830	DURB	6830	6830	6000	Urban Theory		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.132542	2025-11-20 22:15:12.132548
3564	DURB 6850	DURB	6850	6850	6000	Seminar Urban Studies		3	University Of New Orleans	PLACEHOLDER		f	seminar	2025-11-20 22:15:12.136541	2025-11-20 22:15:12.136546
3565	DURB 6900	DURB	6900	6900	6000	Independent Study		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:12.14061	2025-11-20 22:15:12.140615
3566	DURB 7020	DURB	7020	7020	7000	Research Design Seminar		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:12.144539	2025-11-20 22:15:12.144545
3567	DURB 7030	DURB	7030	7030	7000	Research Design Practicum		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:12.148699	2025-11-20 22:15:12.148704
3568	DURB 7040	DURB	7040	7040	7000	Examination or Report Only		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.152932	2025-11-20 22:15:12.152937
3569	DURB 7050	DURB	7050	7050	7000	Dissertation Research		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:12.157028	2025-11-20 22:15:12.157034
3570	WGS 2010	WGS	2010	2010	2000	Introduction Women�s Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.16111	2025-11-20 22:15:12.161116
3571	WGS 3090	WGS	3090	3090	3000	Internship in Women�s Studies		3	University Of New Orleans	PLACEHOLDER		f	research	2025-11-20 22:15:12.164998	2025-11-20 22:15:12.165004
3572	WGS 3091	WGS	3091	3091	3000	Ind Read & Res Wm/Gdr Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.169328	2025-11-20 22:15:12.169333
3573	WGS 3092	WGS	3092	3092	3000	Ind Read & Res Wm/Gdr Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.173488	2025-11-20 22:15:12.173493
3574	WGS 3093	WGS	3093	3093	3000	Ind Read & Res Wm/Gdr Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.177635	2025-11-20 22:15:12.177641
3575	WGS 4070	WGS	4070	4070	4000	Spec Top Women, Lit, Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.18181	2025-11-20 22:15:12.181816
3576	WGS 4080	WGS	4080	4080	4000	Fem Theory Gen & Sex		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.185886	2025-11-20 22:15:12.185891
3577	WGS 4090	WGS	4090	4090	4000	Variable Topics Womens Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.189913	2025-11-20 22:15:12.189919
3578	WGS 5070	WGS	5070	5070	5000	Spec Top Women, Lit, Society		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.193902	2025-11-20 22:15:12.193907
3579	WGS 5090	WGS	5090	5090	5000	Variable Topics Womens Studies		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.197945	2025-11-20 22:15:12.197951
3580	GHUM 1000	GHUM	1000	1000	1000	General Humanities Elective		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.202093	2025-11-20 22:15:12.202099
3581	ENGL 1000NE	ENGL	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.206329	2025-11-20 22:15:12.206335
3582	ENGL 2000NE	ENGL	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.210399	2025-11-20 22:15:12.210405
3583	ENGL 3000NE	ENGL	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.214344	2025-11-20 22:15:12.21435
3584	ENGL 4000NE	ENGL	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.218236	2025-11-20 22:15:12.218241
3585	ENGL 5000NE	ENGL	5000NE	5000	5000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.222075	2025-11-20 22:15:12.222081
3586	ENGL 6000NE	ENGL	6000NE	6000	6000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.226104	2025-11-20 22:15:12.226109
3587	ENGL 7000NE	ENGL	7000NE	7000	7000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.230257	2025-11-20 22:15:12.230263
3588	MATH 1000NE	MATH	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.234268	2025-11-20 22:15:12.234273
3589	MATH 2000NE	MATH	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.238362	2025-11-20 22:15:12.238368
3590	MATH 3000NE	MATH	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.242482	2025-11-20 22:15:12.242487
3591	MATH 4000NE	MATH	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.246645	2025-11-20 22:15:12.246651
3592	MATH 5000NE	MATH	5000NE	5000	5000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.250744	2025-11-20 22:15:12.25075
3593	MATH 6000NE	MATH	6000NE	6000	6000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.25467	2025-11-20 22:15:12.254675
3594	MATH 7000NE	MATH	7000NE	7000	7000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.258659	2025-11-20 22:15:12.258665
3595	PHIL 1000NE	PHIL	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.262678	2025-11-20 22:15:12.262683
3596	PHIL 2000NE	PHIL	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.266702	2025-11-20 22:15:12.266708
3597	PHIL 3000NE	PHIL	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.270815	2025-11-20 22:15:12.270821
3598	PHIL 4000NE	PHIL	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.274849	2025-11-20 22:15:12.274854
3599	PHIL 5000NE	PHIL	5000NE	5000	5000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.278926	2025-11-20 22:15:12.278932
3600	PHIL 6000NE	PHIL	6000NE	6000	6000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.282944	2025-11-20 22:15:12.282951
3601	PHIL 7000NE	PHIL	7000NE	7000	7000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.28692	2025-11-20 22:15:12.286926
3602	SCI 1000NE	SCI	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.290885	2025-11-20 22:15:12.290891
3603	SCI 2000NE	SCI	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.294813	2025-11-20 22:15:12.294821
3604	SCI 3000NE	SCI	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.298835	2025-11-20 22:15:12.29884
3605	SCI 4000NE	SCI	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.302806	2025-11-20 22:15:12.302812
3606	SCI 5000NE	SCI	5000NE	5000	5000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.306875	2025-11-20 22:15:12.30688
3607	SCI 6000NE	SCI	6000NE	6000	6000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.310802	2025-11-20 22:15:12.310807
3608	SCI 7000NE	SCI	7000NE	7000	7000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.314965	2025-11-20 22:15:12.31497
3609	BIOS 1000NE	BIOS	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.318928	2025-11-20 22:15:12.318933
3610	BIOS 2000NE	BIOS	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.32306	2025-11-20 22:15:12.323066
3611	BIOS 3000NE	BIOS	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.327171	2025-11-20 22:15:12.327177
3612	BIOS 4000NE	BIOS	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.331314	2025-11-20 22:15:12.331319
3613	BIOS 5000NE	BIOS	5000NE	5000	5000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.335206	2025-11-20 22:15:12.335212
3614	BIOS 6000NE	BIOS	6000NE	6000	6000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.339019	2025-11-20 22:15:12.339025
3615	BIOS 7000NE	BIOS	7000NE	7000	7000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.34301	2025-11-20 22:15:12.343015
3616	CHEM 1000NE	CHEM	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.346849	2025-11-20 22:15:12.346854
3617	CHEM 2000NE	CHEM	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.350806	2025-11-20 22:15:12.350811
3618	CHEM 3000NE	CHEM	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.354814	2025-11-20 22:15:12.35482
3619	CHEM 4000NE	CHEM	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.358892	2025-11-20 22:15:12.358898
3620	CHEM 5000NE	CHEM	5000NE	5000	5000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.36294	2025-11-20 22:15:12.362946
3621	CHEM 6000NE	CHEM	6000NE	6000	6000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.366891	2025-11-20 22:15:12.366897
3622	CHEM 7000NE	CHEM	7000NE	7000	7000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.370833	2025-11-20 22:15:12.370838
3623	PHYS 1000NE	PHYS	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.374887	2025-11-20 22:15:12.374893
3624	PHYS 2000NE	PHYS	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.379029	2025-11-20 22:15:12.379036
3625	PHYS 3000NE	PHYS	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.383101	2025-11-20 22:15:12.383107
3626	PHYS 4000NE	PHYS	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.386987	2025-11-20 22:15:12.386993
3627	PHYS 5000NE	PHYS	5000NE	5000	5000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.390987	2025-11-20 22:15:12.390992
3628	PHYS 6000NE	PHYS	6000NE	6000	6000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.395087	2025-11-20 22:15:12.395093
3629	PHYS 7000NE	PHYS	7000NE	7000	7000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.399124	2025-11-20 22:15:12.39915
3630	MUSC 1000NE	MUSC	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.403322	2025-11-20 22:15:12.403327
3631	MUSC 2000NE	MUSC	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.407443	2025-11-20 22:15:12.407448
3632	FTCA 1000NE	FTCA	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.411608	2025-11-20 22:15:12.411614
3633	FTCA 2000NE	FTCA	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.415744	2025-11-20 22:15:12.415749
3634	HIST 1000NE	HIST	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.419793	2025-11-20 22:15:12.419798
3635	HIST 2000NE	HIST	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.423933	2025-11-20 22:15:12.423939
3636	HIST 3000NE	HIST	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.427904	2025-11-20 22:15:12.427909
3637	HIST 4000NE	HIST	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.431823	2025-11-20 22:15:12.431828
3638	HIST 5000NE	HIST	5000NE	5000	5000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.435843	2025-11-20 22:15:12.435848
3639	HIST 6000NE	HIST	6000NE	6000	6000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.439918	2025-11-20 22:15:12.439924
3640	HIST 7000NE	HIST	7000NE	7000	7000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.44395	2025-11-20 22:15:12.443956
3641	SOC 1000NE	SOC	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.449121	2025-11-20 22:15:12.449157
3642	SOC 2000NE	SOC	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.454179	2025-11-20 22:15:12.454188
3643	SOC 3000NE	SOC	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.458166	2025-11-20 22:15:12.458174
3644	SOC 4000NE	SOC	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.461932	2025-11-20 22:15:12.461939
3645	FREN 1000NE	FREN	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.465408	2025-11-20 22:15:12.465413
3646	FREN 2000NE	FREN	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.468056	2025-11-20 22:15:12.468061
3647	FREN 3000NE	FREN	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.47068	2025-11-20 22:15:12.470685
3648	FREN 4000NE	FREN	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.473319	2025-11-20 22:15:12.473324
3649	HUMS 1000NE	HUMS	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.476931	2025-11-20 22:15:12.476935
3650	HUMS 2000NE	HUMS	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.480306	2025-11-20 22:15:12.48031
3651	HUMS 3000NE	HUMS	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.483797	2025-11-20 22:15:12.4838
3652	HUMS 4000NE	HUMS	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.487533	2025-11-20 22:15:12.487537
3653	FA 1010	FA	1010	1010	1000	Fine Arts Appreciation		3	University Of New Orleans	Arts		f	lecture	2025-11-20 22:15:12.490756	2025-11-20 22:15:12.490759
3654	FA 1000NE	FA	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.493658	2025-11-20 22:15:12.493662
3655	FA 2000NE	FA	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.496983	2025-11-20 22:15:12.496987
3656	FA 3000NE	FA	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.50061	2025-11-20 22:15:12.500614
3657	FA 4000NE	FA	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.503941	2025-11-20 22:15:12.503945
3658	SPAN 1000NE	SPAN	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDE		f	lecture	2025-11-20 22:15:12.507541	2025-11-20 22:15:12.507546
3659	SPAN 2000NE	SPAN	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.511284	2025-11-20 22:15:12.511288
3660	SPAN 3000NE	SPAN	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.514629	2025-11-20 22:15:12.514634
3661	SPAN 4000NE	SPAN	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.518228	2025-11-20 22:15:12.518233
3662	ARCH 1000NE	ARCH	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.521913	2025-11-20 22:15:12.521917
3663	AMTH 1000NE	AMTH	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.527846	2025-11-20 22:15:12.52785
3664	AMTH 2000NE	AMTH	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.531722	2025-11-20 22:15:12.531727
3665	AMTH 3000NE	AMTH	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.535518	2025-11-20 22:15:12.535523
3666	AMTH 4000NE	AMTH	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.539597	2025-11-20 22:15:12.539602
3667	ANTH 1000NE	ANTH	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.543548	2025-11-20 22:15:12.543553
3668	ANTH 2000NE	ANTH	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.547254	2025-11-20 22:15:12.547259
3669	ANTH 3000NE	ANTH	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.551296	2025-11-20 22:15:12.551301
3670	ANTH 4000NE	ANTH	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.555354	2025-11-20 22:15:12.555359
3671	PSYC 1000NE	PSYC	1000NE	1000	1000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.559408	2025-11-20 22:15:12.559413
3672	PSYC 2000NE	PSYC	2000NE	2000	2000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.563496	2025-11-20 22:15:12.563501
3673	PSYC 3000NE	PSYC	3000NE	3000	3000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.567654	2025-11-20 22:15:12.567659
3674	PSYC 4000NE	PSYC	4000NE	4000	4000	No equivalent		3	University Of New Orleans	PLACEHOLDER		f	lecture	2025-11-20 22:15:12.571391	2025-11-20 22:15:12.571396
\.


--
-- Data for Name: equivalencies; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.equivalencies (id, from_course_id, to_course_id, equivalency_type, notes, approved_by, approved_date, created_at) FROM stdin;
1	2	1322	direct			2025-11-20 22:15:22.764921	2025-11-20 22:15:22.764932
2	3	1323	direct			2025-11-20 22:15:22.776874	2025-11-20 22:15:22.776884
3	4	1322	direct			2025-11-20 22:15:22.787291	2025-11-20 22:15:22.7873
4	176	2296	direct			2025-11-20 22:15:22.795853	2025-11-20 22:15:22.795859
5	177	2297	direct			2025-11-20 22:15:22.801195	2025-11-20 22:15:22.801201
6	182	2303	direct			2025-11-20 22:15:22.80615	2025-11-20 22:15:22.806156
7	182	2304	direct			2025-11-20 22:15:22.811296	2025-11-20 22:15:22.811301
8	186	2299	direct			2025-11-20 22:15:22.816356	2025-11-20 22:15:22.816361
9	26	3654	direct			2025-11-20 22:15:22.822088	2025-11-20 22:15:22.822093
10	27	3655	direct			2025-11-20 22:15:22.828973	2025-11-20 22:15:22.828977
11	28	3655	direct			2025-11-20 22:15:22.838455	2025-11-20 22:15:22.838465
12	29	3655	direct			2025-11-20 22:15:22.847636	2025-11-20 22:15:22.847642
13	30	3654				2025-11-20 22:15:22.855436	2025-11-20 22:15:22.855446
14	31	2470	direct			2025-11-20 22:15:22.864521	2025-11-20 22:15:22.864529
15	32	3630				2025-11-20 22:15:22.872975	2025-11-20 22:15:22.872984
16	33	2471	direct			2025-11-20 22:15:22.882533	2025-11-20 22:15:22.882544
17	34	1496	direct			2025-11-20 22:15:22.891243	2025-11-20 22:15:22.89125
18	35	3633				2025-11-20 22:15:22.899341	2025-11-20 22:15:22.899349
19	36	3633				2025-11-20 22:15:22.904357	2025-11-20 22:15:22.904362
20	6	1344	direct			2025-11-20 22:15:22.908942	2025-11-20 22:15:22.908948
21	7	1341	direct			2025-11-20 22:15:22.915187	2025-11-20 22:15:22.915192
22	7	1343	direct			2025-11-20 22:15:22.924604	2025-11-20 22:15:22.924613
23	9	1325	direct			2025-11-20 22:15:22.932149	2025-11-20 22:15:22.932157
24	10	1326	direct			2025-11-20 22:15:22.939007	2025-11-20 22:15:22.939014
25	11	1349	direct			2025-11-20 22:15:22.945173	2025-11-20 22:15:22.945179
26	12	1350	direct			2025-11-20 22:15:22.951512	2025-11-20 22:15:22.951517
27	13	3582	direct			2025-11-20 22:15:22.95682	2025-11-20 22:15:22.956825
28	14	3580	direct			2025-11-20 22:15:22.96326	2025-11-20 22:15:22.963264
29	18	3582				2025-11-20 22:15:22.973168	2025-11-20 22:15:22.973178
30	19	1329	direct			2025-11-20 22:15:22.984155	2025-11-20 22:15:22.984164
31	19	1330	direct			2025-11-20 22:15:22.994709	2025-11-20 22:15:22.994719
32	22	1351	direct			2025-11-20 22:15:23.004703	2025-11-20 22:15:23.004713
33	37	3662				2025-11-20 22:15:23.013116	2025-11-20 22:15:23.013152
34	1	3337	direct			2025-11-20 22:15:23.020526	2025-11-20 22:15:23.020533
35	23	3580	direct			2025-11-20 22:15:23.026665	2025-11-20 22:15:23.026671
36	24	1523	direct			2025-11-20 22:15:23.032047	2025-11-20 22:15:23.032053
37	8	3580	direct			2025-11-20 22:15:23.037882	2025-11-20 22:15:23.037887
38	15	3580	direct			2025-11-20 22:15:23.075054	2025-11-20 22:15:23.075061
39	16	3582	direct			2025-11-20 22:15:23.081583	2025-11-20 22:15:23.081591
40	17	3582	direct			2025-11-20 22:15:23.089225	2025-11-20 22:15:23.089234
41	20	1352	direct			2025-11-20 22:15:23.111052	2025-11-20 22:15:23.111057
42	38	1782	direct			2025-11-20 22:15:23.120159	2025-11-20 22:15:23.120165
43	39	1783	direct			2025-11-20 22:15:23.126072	2025-11-20 22:15:23.126079
44	40	3645				2025-11-20 22:15:23.131688	2025-11-20 22:15:23.131694
45	41	1784	direct			2025-11-20 22:15:23.138047	2025-11-20 22:15:23.138053
46	42	1785	direct			2025-11-20 22:15:23.144094	2025-11-20 22:15:23.144099
47	43	3646				2025-11-20 22:15:23.150751	2025-11-20 22:15:23.150756
48	44	3580	direct			2025-11-20 22:15:23.160876	2025-11-20 22:15:23.160888
49	45	3580	direct			2025-11-20 22:15:23.171052	2025-11-20 22:15:23.17106
50	46	1944	direct			2025-11-20 22:15:23.177831	2025-11-20 22:15:23.177836
51	47	1945	direct			2025-11-20 22:15:23.185491	2025-11-20 22:15:23.1855
52	48	1946	direct			2025-11-20 22:15:23.193476	2025-11-20 22:15:23.193484
53	49	1953	direct			2025-11-20 22:15:23.20106	2025-11-20 22:15:23.201067
54	50	1954	direct			2025-11-20 22:15:23.208406	2025-11-20 22:15:23.208411
55	51	3635				2025-11-20 22:15:23.214787	2025-11-20 22:15:23.214794
56	52	3635				2025-11-20 22:15:23.219912	2025-11-20 22:15:23.219917
57	53	3634				2025-11-20 22:15:23.22504	2025-11-20 22:15:23.225044
58	54	1957	direct			2025-11-20 22:15:23.234791	2025-11-20 22:15:23.234801
59	55	3654				2025-11-20 22:15:23.244771	2025-11-20 22:15:23.244782
60	56	352	direct			2025-11-20 22:15:23.254211	2025-11-20 22:15:23.25422
61	56	3649				2025-11-20 22:15:23.264542	2025-11-20 22:15:23.26455
62	57	3580	direct			2025-11-20 22:15:23.27384	2025-11-20 22:15:23.273846
63	58	3580	direct			2025-11-20 22:15:23.280248	2025-11-20 22:15:23.280253
64	59	3654				2025-11-20 22:15:23.288236	2025-11-20 22:15:23.288243
65	60	3650				2025-11-20 22:15:23.297822	2025-11-20 22:15:23.297832
66	61	2824	direct			2025-11-20 22:15:23.30607	2025-11-20 22:15:23.306075
67	62	3595	direct			2025-11-20 22:15:23.312309	2025-11-20 22:15:23.312314
68	63	3276	direct			2025-11-20 22:15:23.318591	2025-11-20 22:15:23.318596
69	64	3277	direct			2025-11-20 22:15:23.3244	2025-11-20 22:15:23.324404
70	65	3278	direct			2025-11-20 22:15:23.330846	2025-11-20 22:15:23.33085
71	66	3279	direct			2025-11-20 22:15:23.337618	2025-11-20 22:15:23.337628
72	67	3659				2025-11-20 22:15:23.346383	2025-11-20 22:15:23.346387
73	68	3664	direct			2025-11-20 22:15:23.352406	2025-11-20 22:15:23.35241
74	69	3668	direct			2025-11-20 22:15:23.358798	2025-11-20 22:15:23.358806
75	70	1838	direct			2025-11-20 22:15:23.367326	2025-11-20 22:15:23.367337
76	70	1839	direct			2025-11-20 22:15:23.376329	2025-11-20 22:15:23.376338
77	71	3668				2025-11-20 22:15:23.383461	2025-11-20 22:15:23.383467
78	72	1842	direct			2025-11-20 22:15:23.392055	2025-11-20 22:15:23.392063
79	73	1044	direct			2025-11-20 22:15:23.398643	2025-11-20 22:15:23.398648
80	74	1043	direct			2025-11-20 22:15:23.407515	2025-11-20 22:15:23.407524
81	75	2978	direct			2025-11-20 22:15:23.415358	2025-11-20 22:15:23.415366
82	76	3671				2025-11-20 22:15:23.422189	2025-11-20 22:15:23.422195
83	77	3059	direct			2025-11-20 22:15:23.428585	2025-11-20 22:15:23.428592
84	78	3672				2025-11-20 22:15:23.435045	2025-11-20 22:15:23.43505
85	79	3065	direct			2025-11-20 22:15:23.444552	2025-11-20 22:15:23.444594
86	80	3064	direct			2025-11-20 22:15:23.452102	2025-11-20 22:15:23.45211
87	81	3067	direct			2025-11-20 22:15:23.459635	2025-11-20 22:15:23.45964
88	82	3672				2025-11-20 22:15:23.466431	2025-11-20 22:15:23.466437
89	83	3072	direct			2025-11-20 22:15:23.472543	2025-11-20 22:15:23.472548
90	84	3198	direct			2025-11-20 22:15:23.481427	2025-11-20 22:15:23.481437
91	86	3204	direct			2025-11-20 22:15:23.489445	2025-11-20 22:15:23.489453
92	87	3198	direct			2025-11-20 22:15:23.49581	2025-11-20 22:15:23.495816
93	88	3198	direct			2025-11-20 22:15:23.50201	2025-11-20 22:15:23.502017
94	89	3642				2025-11-20 22:15:23.508099	2025-11-20 22:15:23.508104
95	97	407	direct			2025-11-20 22:15:23.514316	2025-11-20 22:15:23.514322
96	150	533	direct			2025-11-20 22:15:23.521589	2025-11-20 22:15:23.521594
97	99	406	direct			2025-11-20 22:15:23.531253	2025-11-20 22:15:23.531266
98	152	530	direct			2025-11-20 22:15:23.542593	2025-11-20 22:15:23.542603
99	98	405	direct			2025-11-20 22:15:23.55134	2025-11-20 22:15:23.551345
100	155	539	direct			2025-11-20 22:15:23.558865	2025-11-20 22:15:23.558872
101	100	404	direct			2025-11-20 22:15:23.56612	2025-11-20 22:15:23.56615
102	157	536	direct			2025-11-20 22:15:23.573073	2025-11-20 22:15:23.573082
103	149	532	direct			2025-11-20 22:15:23.583059	2025-11-20 22:15:23.583068
104	156	3617				2025-11-20 22:15:23.592166	2025-11-20 22:15:23.592174
105	151	529	direct			2025-11-20 22:15:23.600103	2025-11-20 22:15:23.600107
106	158	3617				2025-11-20 22:15:23.610023	2025-11-20 22:15:23.610032
107	193	2887	direct			2025-11-20 22:15:23.619415	2025-11-20 22:15:23.619424
108	197	2891	direct			2025-11-20 22:15:23.62815	2025-11-20 22:15:23.628158
109	194	2888	direct			2025-11-20 22:15:23.636105	2025-11-20 22:15:23.636111
110	113	422	direct			2025-11-20 22:15:23.643225	2025-11-20 22:15:23.643231
111	112	422	direct			2025-11-20 22:15:23.649523	2025-11-20 22:15:23.649528
112	114	421	direct			2025-11-20 22:15:23.655557	2025-11-20 22:15:23.655595
113	125	417	direct			2025-11-20 22:15:23.663486	2025-11-20 22:15:23.663496
114	126	417	direct			2025-11-20 22:15:23.672448	2025-11-20 22:15:23.672455
115	121	409	direct			2025-11-20 22:15:23.681975	2025-11-20 22:15:23.681984
116	122	411	direct			2025-11-20 22:15:23.691496	2025-11-20 22:15:23.691504
117	94	418	direct			2025-11-20 22:15:23.699904	2025-11-20 22:15:23.699912
\.


--
-- Data for Name: group_course_options; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.group_course_options (id, group_id, course_code, institution, is_preferred, notes) FROM stdin;
1	1	ENGL 101	Delgado Community College	f	\N
2	1	ENGL 102	Delgado Community College	f	\N
3	2	ENGL 110	Delgado Community College	f	\N
4	3	MATH 130	Delgado Community College	f	\N
5	4	MATH 131	Delgado Community College	f	\N
6	4	MATH 203	Delgado Community College	f	\N
7	4	MATH 221	Delgado Community College	f	\N
8	5	FNAR 121	Delgado Community College	f	\N
9	5	FNAR 125	Delgado Community College	f	\N
10	5	FNAR 126	Delgado Community College	f	\N
11	5	FNAR 127	Delgado Community College	f	\N
12	5	FNAR 158	Delgado Community College	f	\N
13	5	MUSC 105	Delgado Community College	f	\N
14	5	MUSC 108	Delgado Community College	f	\N
15	5	MUSC 137	Delgado Community College	f	\N
16	5	THEA 101	Delgado Community College	f	\N
17	5	THEA 207	Delgado Community College	f	\N
18	5	THEA 209	Delgado Community College	f	\N
19	6	ENGL 205	Delgado Community College	f	\N
20	6	ENGL 206	Delgado Community College	f	\N
21	6	ENGL 211	Delgado Community College	f	\N
22	6	ENGL 212	Delgado Community College	f	\N
23	6	ENGL 221	Delgado Community College	f	\N
24	6	ENGL 222	Delgado Community College	f	\N
25	6	ENGL 231	Delgado Community College	f	\N
26	6	ENGL 232	Delgado Community College	f	\N
27	6	ENGL 243	Delgado Community College	f	\N
28	6	ENGL 244	Delgado Community College	f	\N
29	6	ENGL 253	Delgado Community College	f	\N
30	7	ARCH 180	Delgado Community College	f	\N
31	7	ASLS 101	Delgado Community College	f	\N
32	7	CMST 130	Delgado Community College	f	\N
33	7	CMST 230	Delgado Community College	f	\N
34	7	ENGL 207	Delgado Community College	f	\N
35	7	ENGL 211	Delgado Community College	f	\N
36	7	ENGL 212	Delgado Community College	f	\N
37	7	ENGL 221	Delgado Community College	f	\N
38	7	ENGL 222	Delgado Community College	f	\N
39	7	ENGL 235	Delgado Community College	f	\N
40	7	ENGL 240	Delgado Community College	f	\N
41	7	ENGL 241	Delgado Community College	f	\N
42	7	ENGL 243	Delgado Community College	f	\N
43	7	ENGL 244	Delgado Community College	f	\N
44	7	ENGL 245	Delgado Community College	f	\N
45	7	ENGL 253	Delgado Community College	f	\N
46	7	FREN 101	Delgado Community College	f	\N
47	7	FREN 102	Delgado Community College	f	\N
48	7	FREN 125	Delgado Community College	f	\N
49	7	FREN 201	Delgado Community College	f	\N
50	7	FREN 202	Delgado Community College	f	\N
51	7	FREN 225	Delgado Community College	f	\N
52	7	HIST 101	Delgado Community College	f	\N
53	7	HIST 102	Delgado Community College	f	\N
54	7	HIST 103	Delgado Community College	f	\N
55	7	HIST 105	Delgado Community College	f	\N
56	7	HIST 141	Delgado Community College	f	\N
57	7	HIST 205	Delgado Community College	f	\N
58	7	HIST 206	Delgado Community College	f	\N
59	7	HIST 240	Delgado Community College	f	\N
60	7	HIST 241	Delgado Community College	f	\N
61	7	HIST 242	Delgado Community College	f	\N
62	7	HIST 260	Delgado Community College	f	\N
63	7	HUMA 105	Delgado Community College	f	\N
64	7	HUMA 150	Delgado Community College	f	\N
65	7	HUMA 211	Delgado Community College	f	\N
66	7	HUMA 212	Delgado Community College	f	\N
67	7	HUMA 220	Delgado Community College	f	\N
68	7	HUMA 260	Delgado Community College	f	\N
69	7	PHIL 101	Delgado Community College	f	\N
70	7	PHIL 175	Delgado Community College	f	\N
71	7	SPAN 101	Delgado Community College	f	\N
72	7	SPAN 102	Delgado Community College	f	\N
73	7	SPAN 201	Delgado Community College	f	\N
74	7	SPAN 202	Delgado Community College	f	\N
75	7	SPAN 204	Delgado Community College	f	\N
76	8	ANTH 160	Delgado Community College	f	\N
77	8	ANTH 165	Delgado Community College	f	\N
78	8	ANTH 181	Delgado Community College	f	\N
79	8	ANTH 200	Delgado Community College	f	\N
80	8	ANTH 205	Delgado Community College	f	\N
81	8	ECON 201	Delgado Community College	f	\N
82	8	ECON 202	Delgado Community College	f	\N
83	8	POLI 180	Delgado Community College	f	\N
84	8	PSYC 112	Delgado Community College	f	\N
85	8	PSYC 127	Delgado Community College	f	\N
86	8	PSYC 217	Delgado Community College	f	\N
87	8	PSYC 225	Delgado Community College	f	\N
88	8	PSYC 226	Delgado Community College	f	\N
89	8	PSYC 235	Delgado Community College	f	\N
90	8	PSYC 240	Delgado Community College	f	\N
91	8	PSYC 245	Delgado Community College	f	\N
92	8	SOCI 151	Delgado Community College	f	\N
93	8	SOCI 155	Delgado Community College	f	\N
94	8	SOCI 250	Delgado Community College	f	\N
95	8	SOCI 255	Delgado Community College	f	\N
96	8	SOCI 257	Delgado Community College	f	\N
97	9	BIOL 141	Delgado Community College	f	\N
98	10	CHEM 142	Delgado Community College	t	\N
99	10	CHEM 144	Delgado Community College	f	\N
100	10	CHEM 221	Delgado Community College	f	\N
101	10	CHEM 223	Delgado Community College	f	\N
102	10	CHEM 222	Delgado Community College	f	\N
103	10	CHEM 224	Delgado Community College	f	\N
104	10	PHYS 141	Delgado Community College	f	\N
105	10	PHYS 221	Delgado Community College	f	\N
106	10	PHYS 142	Delgado Community College	f	\N
107	9	BIOL 143	Delgado Community College	t	\N
108	9	BIOL 142	Delgado Community College	f	\N
109	9	BIOL 144	Delgado Community College	f	\N
110	9	CHEM 141	Delgado Community College	f	\N
111	9	CHEM 143	Delgado Community College	f	\N
112	11	BIOL 211	Delgado Community College	f	\N
113	11	BIOL 210	Delgado Community College	f	\N
114	11	BIOL 212	Delgado Community College	f	\N
115	11	BIOL 265	Delgado Community College	f	\N
116	11	BIOL 266	Delgado Community College	f	\N
117	11	BIOL 251	Delgado Community College	f	\N
118	11	BIOL 252	Delgado Community College	f	\N
119	11	BIOL 114	Delgado Community College	f	\N
120	12	ENGL 1157	University Of New Orleans	f	\N
121	12	ENGL 1158	University Of New Orleans	f	\N
122	12	ENGL 1159	University Of New Orleans	f	\N
123	13	MATH 1125	University Of New Orleans	f	\N
124	13	MATH 1126	University Of New Orleans	f	\N
125	14	BIOS 1083	University Of New Orleans	f	\N
126	14	BIOS 1073	University Of New Orleans	f	\N
127	14	CHEM 1017	University Of New Orleans	f	\N
128	15	ENGL 2041	University Of New Orleans	f	\N
129	15	ENGL 2043	University Of New Orleans	f	\N
130	15	ENGL 2071	University Of New Orleans	f	\N
131	15	ENGL 2072	University Of New Orleans	f	\N
132	15	ENGL 2090	University Of New Orleans	f	\N
133	15	ENGL 2091	University Of New Orleans	f	\N
134	15	ENGL 2208	University Of New Orleans	f	\N
135	15	ENGL 2218	University Of New Orleans	f	\N
136	15	ENGL 2228	University Of New Orleans	f	\N
137	15	ENGL 2238	University Of New Orleans	f	\N
138	15	ENGL 2311	University Of New Orleans	f	\N
139	15	ENGL 2312	University Of New Orleans	f	\N
140	15	ENGL 2341	University Of New Orleans	f	\N
141	15	ENGL 2377	University Of New Orleans	f	\N
142	15	ENGL 2378	University Of New Orleans	f	\N
143	15	ENGL 2521	University Of New Orleans	f	\N
144	15	FTA 2650	University Of New Orleans	f	\N
145	15	FREN 1001	University Of New Orleans	f	\N
146	15	FREN 1002	University Of New Orleans	f	\N
147	15	GER 1001	University Of New Orleans	f	\N
148	15	GER 1002	University Of New Orleans	f	\N
149	15	HIST 1001	University Of New Orleans	f	\N
150	15	HIST 1002	University Of New Orleans	f	\N
151	15	HIST 2501	University Of New Orleans	f	\N
152	15	HIST 2502	University Of New Orleans	f	\N
153	15	JAPN 1001	University Of New Orleans	f	\N
154	15	JAPN 1002	University Of New Orleans	f	\N
155	15	LAT 1011	University Of New Orleans	f	\N
156	15	LAT 1012	University Of New Orleans	f	\N
157	15	PHIL 1000	University Of New Orleans	f	\N
158	15	PHIL 2201	University Of New Orleans	f	\N
159	15	SPAN 1001	University Of New Orleans	f	\N
160	15	SPAN 1002	University Of New Orleans	f	\N
161	15	WGS 2010	University Of New Orleans	f	\N
162	16	CHEM 1007	University Of New Orleans	f	\N
163	16	CHEM 1008	University Of New Orleans	f	\N
164	16	CHEM 1018	University Of New Orleans	f	\N
165	16	CHEM 2217	University Of New Orleans	f	\N
166	16	CHEM 3218	University Of New Orleans	f	\N
167	16	MATH 2314	University Of New Orleans	f	\N
168	17	PHYS 1031	University Of New Orleans	f	\N
169	17	PHYS 1033	University Of New Orleans	f	\N
170	17	PHYS 1032	University Of New Orleans	f	\N
171	17	PHYS 1034	University Of New Orleans	f	\N
172	18	ANTH 1010	University Of New Orleans	f	\N
173	18	ANTH 2052	University Of New Orleans	f	\N
174	18	ECON 1203	University Of New Orleans	f	\N
175	18	ECON 1330	University Of New Orleans	f	\N
176	18	GEOG 10001	University Of New Orleans	f	\N
177	18	GEOG 1002	University Of New Orleans	f	\N
178	18	POLI 2151	University Of New Orleans	f	\N
179	18	PSYC 1000	University Of New Orleans	f	\N
180	18	SOC 1051	University Of New Orleans	f	\N
181	18	SOC 2962	University Of New Orleans	f	\N
182	18	URBN 1000	University Of New Orleans	f	\N
183	19	FA 1010	University Of New Orleans	f	\N
184	20	BIOS 1071	University Of New Orleans	f	\N
185	20	BIOS 1081	University Of New Orleans	f	\N
186	20	BIOS 2014	University Of New Orleans	f	\N
187	20	BIOS 2114	University Of New Orleans	f	\N
188	20	BIOS 4010	University Of New Orleans	f	\N
189	21	BIOS 3113	University Of New Orleans	f	\N
190	21	BIOS 3284	University Of New Orleans	f	\N
191	21	BIOS 3373	University Of New Orleans	f	\N
192	21	BIOS 3354	University Of New Orleans	f	\N
193	21	BIOS 3453	University Of New Orleans	f	\N
194	21	BIOS 3490	University Of New Orleans	f	\N
195	21	BIOS 3491	University Of New Orleans	f	\N
196	21	BIOS 3492	University Of New Orleans	f	\N
197	21	BIOS 3493	University Of New Orleans	f	\N
198	21	BIOS 3494	University Of New Orleans	f	\N
199	21	BIOS 3495	University Of New Orleans	f	\N
200	21	BIOS 3496	University Of New Orleans	f	\N
201	21	BIOS 3497	University Of New Orleans	f	\N
202	21	BIOS 3498	University Of New Orleans	f	\N
203	21	BIOS 3499	University Of New Orleans	f	\N
204	21	BIOS 3500	University Of New Orleans	f	\N
205	21	BIOS 3501	University Of New Orleans	f	\N
206	21	BIOS 3502	University Of New Orleans	f	\N
207	21	BIOS 3503	University Of New Orleans	f	\N
208	21	BIOS 3504	University Of New Orleans	f	\N
209	21	BIOS 3505	University Of New Orleans	f	\N
210	21	BIOS 3506	University Of New Orleans	f	\N
211	21	BIOS 3507	University Of New Orleans	f	\N
212	21	BIOS 3508	University Of New Orleans	f	\N
213	21	BIOS 3509	University Of New Orleans	f	\N
214	21	BIOS 3510	University Of New Orleans	f	\N
215	21	BIOS 3511	University Of New Orleans	f	\N
216	21	BIOS 3512	University Of New Orleans	f	\N
217	21	BIOS 3513	University Of New Orleans	f	\N
218	21	BIOS 3514	University Of New Orleans	f	\N
219	21	BIOS 3515	University Of New Orleans	f	\N
220	21	BIOS 3516	University Of New Orleans	f	\N
221	21	BIOS 3517	University Of New Orleans	f	\N
222	21	BIOS 3518	University Of New Orleans	f	\N
223	22	BIOS 2741	University Of New Orleans	f	\N
224	22	BIOS 3354	University Of New Orleans	f	\N
225	22	BIOS 3651	University Of New Orleans	f	\N
226	22	BIOS 3653	University Of New Orleans	f	\N
227	22	BIOS 3854	University Of New Orleans	f	\N
228	22	BIOS 3924	University Of New Orleans	f	\N
229	22	BIOS 4114	University Of New Orleans	f	\N
230	22	BIOS 4314	University Of New Orleans	f	\N
231	22	BIOS 4454	University Of New Orleans	f	\N
232	22	BIOS 4524	University Of New Orleans	f	\N
233	22	BIOS 4534	University Of New Orleans	f	\N
234	22	BIOS 4644	University Of New Orleans	f	\N
235	22	BIOS 4844	University Of New Orleans	f	\N
236	22	BIOS 4914	University Of New Orleans	f	\N
237	22	BIOS 4974	University Of New Orleans	f	\N
238	23	BIOS 2002	University Of New Orleans	f	\N
239	23	BIOS 2082	University Of New Orleans	f	\N
240	23	BIOS 2090	University Of New Orleans	f	\N
241	23	BIOS 2092	University Of New Orleans	f	\N
242	23	BIOS 2313	University Of New Orleans	f	\N
243	23	BIOS 2553	University Of New Orleans	f	\N
244	23	BIOS 2663	University Of New Orleans	f	\N
245	23	BIOS 2743	University Of New Orleans	f	\N
246	23	BIOS 2741	University Of New Orleans	f	\N
247	23	BIOS 2904	University Of New Orleans	f	\N
248	24	BIOS 2092	University Of New Orleans	f	\N
249	24	BIOS 3091	University Of New Orleans	f	\N
250	24	BIOS 3092	University Of New Orleans	f	\N
251	24	BIOS 4091	University Of New Orleans	f	\N
252	25	BIOS 4103	University Of New Orleans	f	\N
253	25	BIOS 4113	University Of New Orleans	f	\N
254	25	BIOS 4114	University Of New Orleans	f	\N
255	25	BIOS 4153	University Of New Orleans	f	\N
256	25	BIOS 4213	University Of New Orleans	f	\N
257	25	BIOS 4314	University Of New Orleans	f	\N
258	25	BIOS 4353	University Of New Orleans	f	\N
259	25	BIOS 4413	University Of New Orleans	f	\N
260	25	BIOS 4453	University Of New Orleans	f	\N
261	25	BIOS 4454	University Of New Orleans	f	\N
262	25	BIOS 4490	University Of New Orleans	f	\N
263	25	BIOS 4516	University Of New Orleans	f	\N
264	25	BIOS 4524	University Of New Orleans	f	\N
265	25	BIOS 4534	University Of New Orleans	f	\N
266	25	BIOS 4543	University Of New Orleans	f	\N
267	25	BIOS 4590	University Of New Orleans	f	\N
268	25	BIOS 4644	University Of New Orleans	f	\N
269	25	BIOS 4713	University Of New Orleans	f	\N
270	25	BIOS 4723	University Of New Orleans	f	\N
271	25	BIOS 4844	University Of New Orleans	f	\N
272	25	BIOS 4914	University Of New Orleans	f	\N
273	25	BIOS 4933	University Of New Orleans	f	\N
\.


--
-- Data for Name: plan_courses; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.plan_courses (id, plan_id, course_id, semester, year, status, grade, credits, requirement_category, requirement_group_id, notes, constraint_violation, constraint_violation_reason) FROM stdin;
1	8	529	Fall	2025	completed	\N	3	Other Major Requirements	16		f	\N
2	9	1327	Fall	2025	completed	\N	3	Humanities	15		f	\N
3	10	97	Fall	2025	planned	\N	3	Free Electives	\N		f	\N
4	10	99	Fall	2025	planned	\N	3	Free Electives	\N		f	\N
5	10	176	Fall	2025	planned	\N	3	Mathematics	\N		f	\N
6	10	149	Fall	2025	planned	\N	3	Free Electives	\N		f	\N
7	10	151	Fall	2025	planned	\N	3	Free Electives	\N		f	\N
8	10	2	Fall	2025	planned	\N	3	English	\N		f	\N
9	8	1327	Fall	2026	planned	\N	3	Humanities	15		f	\N
10	8	1329	Fall	2026	planned	\N	3	Humanities	15		f	\N
18	1	149	Fall	2026	completed	\N	3	Free Electives	\N		f	\N
19	1	150	Fall	2026	completed	\N	3	Free Electives	\N		f	\N
20	1	151	Fall	2026	completed	\N	3	Free Electives	\N		f	\N
21	1	152	Fall	2026	completed	\N	3	Free Electives	\N		f	\N
22	1	153	Fall	2026	completed	\N	3	Free Electives	\N		f	\N
23	1	147	Fall	2026	completed	\N	3	Free Electives	\N		f	\N
24	1	113	Fall	2026	completed	\N	3	Biology Electives	\N		f	\N
25	1	112	Fall	2026	completed	\N	3	Biology Electives	\N		f	\N
26	1	114	Fall	2026	completed	\N	3	Biology Electives	\N		f	\N
27	1	2	Fall	2026	completed	\N	3	English Composition	\N		f	\N
28	1	3	Fall	2026	completed	\N	3	English Composition	\N		f	\N
29	1	4	Fall	2026	completed	\N	3	English Composition	\N		f	\N
30	1	176	Fall	2026	completed	\N	3	Math/Analytical Reasoning	\N		f	\N
31	1	177	Fall	2026	completed	\N	3	Math/Analytical Reasoning	\N		f	\N
32	1	26	Fall	2026	completed	\N	3	Fine Arts	\N		f	\N
33	1	6	Fall	2026	completed	\N	5	Humanities	\N		f	\N
34	1	68	Fall	2026	completed	\N	3	Social/Behavioral Sciences	\N		f	\N
35	1	71	Fall	2026	completed	\N	3	Social/Behavioral Sciences	\N		f	\N
36	1	97	Fall	2026	completed	\N	3	Biological Sciences Major Reqs	\N		f	\N
37	1	100	Fall	2026	completed	\N	3	Biological Sciences Major Reqs	\N		f	\N
38	9	2	Fall	2026	planned	\N	3	English Composition	\N		f	\N
39	9	69	Spring	2026	in_progress	\N	3	Social/Behavioral Sciences	\N		f	\N
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.plans (id, student_name, student_email, program_id, current_program_id, plan_name, plan_code, status, created_at, updated_at, advisor_email, program_version_semester, program_version_year, catalog_year_locked_at) FROM stdin;
8	Mitch mennellelle	m@m.com	2	1	Mitch's Fall 2026 Plan	H9FRWW9N	draft	2025-11-26 05:41:54.114717	2025-11-26 05:41:54.11473	mmennell@uno.edu	Fall	2025	2025-11-26 05:41:54.114717
10	Wendy Schluchter	wschluch@yahoo.com	2	1	Wendy's Fall 2026 Plan	LFFABCZZ	draft	2025-12-02 16:38:44.702202	2025-12-02 16:38:44.702213	wschluch@uno.edu	Fall	2025	2025-12-02 16:38:44.702202
1	Mitchell Test	mpmennel@uno.edu	2	1	Demo Fall 2026 Plan	JL62YSHE	draft	2025-11-25 16:51:20.760275	2026-02-02 14:23:58.956553	mmennell@uno.edu	Fall	2025	2025-11-25 16:51:20.760275
9	Nnn sas	mpmennel@uno.edu	2	1	inprog demo Fall 2026 Plan	FK2NVMTX	draft	2025-11-27 06:45:11.838378	2026-02-02 14:26:00.836176	mmennell@uno.edu	Fall	2025	2025-11-27 06:45:11.838378
\.


--
-- Data for Name: program_requirements; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.program_requirements (id, program_id, category, credits_required, description, requirement_type, is_flexible, priority_order, semester, year, is_current) FROM stdin;
1	1	English Composition	0	\N	grouped	f	0	Fall	2025	t
2	1	Math/Analytical Reasoning	0	\N	grouped	f	0	Fall	2025	t
3	1	Fine Arts	3	\N	simple	f	0	Fall	2025	t
4	1	Humanities	3	\N	grouped	f	0	Fall	2025	t
5	1	Social/Behavioral Sciences	6	\N	simple	f	0	Fall	2025	t
6	1	Biological Sciences Major Reqs	0	\N	simple	f	0	Fall	2025	t
7	1	Biology Electives	9	\N	simple	f	0	Fall	2025	t
8	2	English	6	At least 6 Credits	simple	f	0	Fall	2025	t
9	2	Mathematics	6	At least 6 Credits	simple	f	0	Fall	2025	t
10	2	Science	9	At least 9 Credits	simple	f	0	Fall	2025	t
11	2	Humanities	9	At least 9 Credits	simple	f	0	Fall	2025	t
12	2	Other Major Requirements	11	At least 11 Credits	simple	f	0	Fall	2025	t
13	2	Physics	8	At least 8 Credits	simple	f	0	Fall	2025	t
14	2	Social Sciences	6	At least 6 Credits	simple	f	0	Fall	2025	t
15	2	Arts	3	At least 3 Credits	simple	f	0	Fall	2025	t
16	2	Core Major Requirements	15	\N	grouped	f	0	Fall	2025	t
\.


--
-- Data for Name: programs; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.programs (id, name, degree_type, institution, total_credits_required, description, created_at, updated_at) FROM stdin;
1	Transfer Degree A.S - Bio Concentration	AS	Delgado Community College	120	Imported program: Transfer Degree A.S - Bio Concentration	2025-11-20 22:15:36.207027	2025-11-20 22:15:36.207036
2	Biology B.S	BS	University Of New Orleans	120	Imported program: Biology B.S	2025-11-20 22:15:44.982945	2025-11-20 22:15:44.982957
\.


--
-- Data for Name: requirement_constraints; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.requirement_constraints (id, requirement_id, constraint_type, params, scope_filter, description, priority, created_at, updated_at) FROM stdin;
1	1	credits	{"credits_max": 6}	{"group_name": "English Comp Group 1", "subject_codes": ["ENGL"]}		0	2025-11-20 22:15:36.92652	2025-11-20 22:15:36.926526
2	1	credits	{"credits_max": 3}	{"group_name": "English Comp Group 2", "subject_codes": ["ENGL"]}		0	2025-11-20 22:15:36.926528	2025-11-20 22:15:36.92653
3	2	credits	{"credits_max": 3}	{"group_name": "Math Group 1", "subject_codes": ["MATH"]}		0	2025-11-20 22:15:36.926532	2025-11-20 22:15:36.926533
4	2	credits	{"credits_max": 3}	{"group_name": "Math Group 2", "subject_codes": ["MATH"]}		0	2025-11-20 22:15:36.926535	2025-11-20 22:15:36.926536
5	3	credits	{"credits_min": 3}	{"group_name": "Fine Arts Group 1"}		0	2025-11-20 22:15:36.926538	2025-11-20 22:15:36.92654
6	4	credits	{"credits_min": 3}	{"group_name": "Humanities Group 1"}		0	2025-11-20 22:15:36.926541	2025-11-20 22:15:36.926543
7	4	min_courses_at_level	{"level": 2000}	{"group_name": "Humanities Group 1"}		0	2025-11-20 22:15:36.926545	2025-11-20 22:15:36.926546
8	4	credits	{"credits_min": 6}	{"group_name": "Humanities Group 2"}		0	2025-11-20 22:15:36.926548	2025-11-20 22:15:36.926549
9	5	credits	{"credits_min": 6}	{"group_name": "S/B Group 1"}		0	2025-11-20 22:15:36.926551	2025-11-20 22:15:36.926552
10	6	credits	{"credits_min": 18}	{"group_name": "Bio Recommended"}		0	2025-11-20 22:15:36.926554	2025-11-20 22:15:36.926555
11	7	credits	{"credits_min": 9}	{"group_name": "Bio Elective"}		0	2025-11-20 22:15:36.926557	2025-11-20 22:15:36.926559
12	8	credits	{"credits_min": 6}	\N	At least 6 Credits	0	2025-11-20 22:15:45.871954	2025-11-20 22:15:45.871961
13	9	credits	{"credits_min": 6}	{"group_name": "Math Group 1"}	At least 6 Credits	0	2025-11-20 22:15:45.871964	2025-11-20 22:15:45.871966
14	10	credits	{"credits_min": 9}	{"group_name": "Biol Group 1"}	At least 9 Credits	0	2025-11-20 22:15:45.871968	2025-11-20 22:15:45.87197
15	11	credits	{"credits_min": 9}	{"group_name": "Humanities group 1"}	At least 9 Credits	0	2025-11-20 22:15:45.871972	2025-11-20 22:15:45.871974
16	12	credits	{"credits_min": 11}	{"group_name": "Other Major reqs 1"}	At least 11 Credits	0	2025-11-20 22:15:45.871976	2025-11-20 22:15:45.871978
17	13	credits	{"credits_min": 8}	{"group_name": "Physics"}	At least 8 Credits	0	2025-11-20 22:15:45.87198	2025-11-20 22:15:45.871982
18	14	credits	{"credits_min": 6}	{"group_name": "Social Sciencies"}	At least 6 Credits	0	2025-11-20 22:15:45.871984	2025-11-20 22:15:45.871986
19	15	credits	{"credits_min": 3}	{"group_name": "Arts 1"}	At least 3 Credits	0	2025-11-20 22:15:45.871988	2025-11-20 22:15:45.87199
20	16	credits	{"credits_min": 15}	{"group_name": "Major Required Courses"}		0	2025-11-20 22:15:45.871992	2025-11-20 22:15:45.871994
21	16	credits	{"credits_min": 25}	{"group_name": "Biology Electives"}		0	2025-11-20 22:15:45.871996	2025-11-20 22:15:45.871998
22	16	credits	{"credits_min": 15}	{"group_name": "Biology Lab", "subject_codes": ["BIOS"]}		0	2025-11-20 22:15:45.872	2025-11-20 22:15:45.872002
23	16	min_tag_courses	{"tag": "TRUE", "courses": 1}	{"group_name": "Biology Lab", "subject_codes": ["BIOS"], "tag_field": "has_lab"}		0	2025-11-20 22:15:45.872004	2025-11-20 22:15:45.872006
24	16	credits	{"credits_min": 9}	{"group_name": "Biology 2000"}		0	2025-11-20 22:15:45.872008	2025-11-20 22:15:45.87201
25	16	min_courses_at_level	{"level": 2000}	{"group_name": "Biology 2000"}		0	2025-11-20 22:15:45.872012	2025-11-20 22:15:45.872014
26	16	credits	{"credits_min": 7}	{"group_name": "Biology Research/Apprectice"}		0	2025-11-20 22:15:45.872016	2025-11-20 22:15:45.872017
27	16	min_courses_at_level	{"level": 2000}	{"group_name": "Biology Research/Apprectice"}		0	2025-11-20 22:15:45.872019	2025-11-20 22:15:45.872021
28	16	credits	{"credits_min": 15}	{"group_name": "Biology 4000"}		0	2025-11-20 22:15:45.872023	2025-11-20 22:15:45.872025
29	16	min_courses_at_level	{"level": 4000}	{"group_name": "Biology 4000"}		0	2025-11-20 22:15:45.872027	2025-11-20 22:15:45.872029
\.


--
-- Data for Name: requirement_groups; Type: TABLE DATA; Schema: public; Owner: ct_user
--

COPY public.requirement_groups (id, requirement_id, group_name, courses_required, credits_required, min_credits_per_course, max_credits_per_course, description, is_required) FROM stdin;
1	1	English Comp Group 1	0	\N	0	\N	\N	t
2	1	English Comp Group 2	0	\N	0	\N	\N	t
3	2	Math Group 1	0	\N	0	\N	\N	t
4	2	Math Group 2	0	\N	0	\N	\N	t
5	3	Fine Arts Group 1	0	3	0	\N	\N	t
6	4	Humanities Group 1	0	3	0	\N	\N	t
7	4	Humanities Group 2	0	6	0	\N	\N	t
8	5	S/B Group 1	0	6	0	\N	\N	t
9	6	Bio Required	0	\N	0	\N	\N	t
10	6	Bio Recommended	0	18	0	\N	\N	t
11	7	Bio Elective	0	9	0	\N	\N	t
12	8	English - All Options	0	6	0	\N	\N	t
13	9	Math Group 1	0	6	0	\N	\N	t
14	10	Biol Group 1	0	9	0	\N	\N	t
15	11	Humanities group 1	0	9	0	\N	\N	t
16	12	Other Major reqs 1	0	11	0	\N	\N	t
17	13	Physics	0	8	0	\N	\N	t
18	14	Social Sciencies	0	6	0	\N	\N	t
19	15	Arts 1	0	3	0	\N	\N	t
20	16	Major Required Courses	0	15	0	\N	\N	t
21	16	Biology Electives	0	25	0	\N	\N	t
22	16	Biology Lab	0	15	0	\N	\N	t
23	16	Biology 2000	0	9	0	\N	\N	t
24	16	Biology Research/Apprectice	0	7	0	\N	\N	t
25	16	Biology 4000	0	15	0	\N	\N	t
\.


--
-- Name: advisor_auth_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ct_user
--

SELECT pg_catalog.setval('public.advisor_auth_id_seq', 5, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ct_user
--

SELECT pg_catalog.setval('public.courses_id_seq', 3674, true);


--
-- Name: equivalencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ct_user
--

SELECT pg_catalog.setval('public.equivalencies_id_seq', 117, true);


--
-- Name: group_course_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ct_user
--

SELECT pg_catalog.setval('public.group_course_options_id_seq', 273, true);


--
-- Name: plan_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ct_user
--

SELECT pg_catalog.setval('public.plan_courses_id_seq', 39, true);


--
-- Name: plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ct_user
--

SELECT pg_catalog.setval('public.plans_id_seq', 33, true);


--
-- Name: program_requirements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ct_user
--

SELECT pg_catalog.setval('public.program_requirements_id_seq', 16, true);


--
-- Name: programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ct_user
--

SELECT pg_catalog.setval('public.programs_id_seq', 2, true);


--
-- Name: requirement_constraints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ct_user
--

SELECT pg_catalog.setval('public.requirement_constraints_id_seq', 29, true);


--
-- Name: requirement_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ct_user
--

SELECT pg_catalog.setval('public.requirement_groups_id_seq', 25, true);


--
-- Name: advisor_auth advisor_auth_pkey; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.advisor_auth
    ADD CONSTRAINT advisor_auth_pkey PRIMARY KEY (id);


--
-- Name: advisor_auth advisor_auth_session_token_key; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.advisor_auth
    ADD CONSTRAINT advisor_auth_session_token_key UNIQUE (session_token);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: equivalencies equivalencies_pkey; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.equivalencies
    ADD CONSTRAINT equivalencies_pkey PRIMARY KEY (id);


--
-- Name: group_course_options group_course_options_pkey; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.group_course_options
    ADD CONSTRAINT group_course_options_pkey PRIMARY KEY (id);


--
-- Name: plan_courses plan_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.plan_courses
    ADD CONSTRAINT plan_courses_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: program_requirements program_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.program_requirements
    ADD CONSTRAINT program_requirements_pkey PRIMARY KEY (id);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: requirement_constraints requirement_constraints_pkey; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.requirement_constraints
    ADD CONSTRAINT requirement_constraints_pkey PRIMARY KEY (id);


--
-- Name: requirement_groups requirement_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.requirement_groups
    ADD CONSTRAINT requirement_groups_pkey PRIMARY KEY (id);


--
-- Name: equivalencies unique_equivalency; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.equivalencies
    ADD CONSTRAINT unique_equivalency UNIQUE (from_course_id, to_course_id);


--
-- Name: courses uq_subject_course_institution; Type: CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT uq_subject_course_institution UNIQUE (subject_code, course_number, institution);


--
-- Name: ix_advisor_auth_email; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE UNIQUE INDEX ix_advisor_auth_email ON public.advisor_auth USING btree (email);


--
-- Name: ix_courses_code; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_courses_code ON public.courses USING btree (code);


--
-- Name: ix_courses_course_number; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_courses_course_number ON public.courses USING btree (course_number);


--
-- Name: ix_courses_subject_code; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_courses_subject_code ON public.courses USING btree (subject_code);


--
-- Name: ix_equivalencies_from_course_id; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_equivalencies_from_course_id ON public.equivalencies USING btree (from_course_id);


--
-- Name: ix_equivalencies_to_course_id; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_equivalencies_to_course_id ON public.equivalencies USING btree (to_course_id);


--
-- Name: ix_group_course_options_course_code; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_group_course_options_course_code ON public.group_course_options USING btree (course_code);


--
-- Name: ix_group_course_options_group_id; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_group_course_options_group_id ON public.group_course_options USING btree (group_id);


--
-- Name: ix_plan_courses_constraint_violation; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_plan_courses_constraint_violation ON public.plan_courses USING btree (constraint_violation);


--
-- Name: ix_plan_courses_course_id; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_plan_courses_course_id ON public.plan_courses USING btree (course_id);


--
-- Name: ix_plan_courses_plan_id; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_plan_courses_plan_id ON public.plan_courses USING btree (plan_id);


--
-- Name: ix_plan_courses_requirement_category; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_plan_courses_requirement_category ON public.plan_courses USING btree (requirement_category);


--
-- Name: ix_plan_courses_requirement_group_id; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_plan_courses_requirement_group_id ON public.plan_courses USING btree (requirement_group_id);


--
-- Name: ix_plan_courses_status; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_plan_courses_status ON public.plan_courses USING btree (status);


--
-- Name: ix_plans_advisor_email; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_plans_advisor_email ON public.plans USING btree (advisor_email);


--
-- Name: ix_plans_plan_code; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE UNIQUE INDEX ix_plans_plan_code ON public.plans USING btree (plan_code);


--
-- Name: ix_program_requirements_category; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_program_requirements_category ON public.program_requirements USING btree (category);


--
-- Name: ix_program_requirements_is_current; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_program_requirements_is_current ON public.program_requirements USING btree (is_current);


--
-- Name: ix_program_requirements_program_id; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_program_requirements_program_id ON public.program_requirements USING btree (program_id);


--
-- Name: ix_requirement_constraints_constraint_type; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_requirement_constraints_constraint_type ON public.requirement_constraints USING btree (constraint_type);


--
-- Name: ix_requirement_constraints_requirement_id; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_requirement_constraints_requirement_id ON public.requirement_constraints USING btree (requirement_id);


--
-- Name: ix_requirement_groups_requirement_id; Type: INDEX; Schema: public; Owner: ct_user
--

CREATE INDEX ix_requirement_groups_requirement_id ON public.requirement_groups USING btree (requirement_id);


--
-- Name: equivalencies equivalencies_from_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.equivalencies
    ADD CONSTRAINT equivalencies_from_course_id_fkey FOREIGN KEY (from_course_id) REFERENCES public.courses(id);


--
-- Name: equivalencies equivalencies_to_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.equivalencies
    ADD CONSTRAINT equivalencies_to_course_id_fkey FOREIGN KEY (to_course_id) REFERENCES public.courses(id);


--
-- Name: group_course_options group_course_options_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.group_course_options
    ADD CONSTRAINT group_course_options_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.requirement_groups(id);


--
-- Name: plan_courses plan_courses_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.plan_courses
    ADD CONSTRAINT plan_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: plan_courses plan_courses_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.plan_courses
    ADD CONSTRAINT plan_courses_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: plan_courses plan_courses_requirement_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.plan_courses
    ADD CONSTRAINT plan_courses_requirement_group_id_fkey FOREIGN KEY (requirement_group_id) REFERENCES public.requirement_groups(id);


--
-- Name: plans plans_advisor_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_advisor_email_fkey FOREIGN KEY (advisor_email) REFERENCES public.advisor_auth(email);


--
-- Name: plans plans_current_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_current_program_id_fkey FOREIGN KEY (current_program_id) REFERENCES public.programs(id);


--
-- Name: plans plans_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id);


--
-- Name: program_requirements program_requirements_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.program_requirements
    ADD CONSTRAINT program_requirements_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id);


--
-- Name: requirement_constraints requirement_constraints_requirement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.requirement_constraints
    ADD CONSTRAINT requirement_constraints_requirement_id_fkey FOREIGN KEY (requirement_id) REFERENCES public.program_requirements(id);


--
-- Name: requirement_groups requirement_groups_requirement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ct_user
--

ALTER TABLE ONLY public.requirement_groups
    ADD CONSTRAINT requirement_groups_requirement_id_fkey FOREIGN KEY (requirement_id) REFERENCES public.program_requirements(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO ct_user;
GRANT USAGE ON SCHEMA public TO grafana_readonly;


--
-- Name: TABLE advisor_auth; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.advisor_auth TO grafana_readonly;


--
-- Name: TABLE alembic_version; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.alembic_version TO grafana_readonly;


--
-- Name: TABLE courses; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.courses TO grafana_readonly;


--
-- Name: TABLE equivalencies; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.equivalencies TO grafana_readonly;


--
-- Name: TABLE group_course_options; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.group_course_options TO grafana_readonly;


--
-- Name: TABLE plan_courses; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.plan_courses TO grafana_readonly;


--
-- Name: TABLE plans; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.plans TO grafana_readonly;


--
-- Name: TABLE program_requirements; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.program_requirements TO grafana_readonly;


--
-- Name: TABLE programs; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.programs TO grafana_readonly;


--
-- Name: TABLE requirement_constraints; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.requirement_constraints TO grafana_readonly;


--
-- Name: TABLE requirement_groups; Type: ACL; Schema: public; Owner: ct_user
--

GRANT SELECT ON TABLE public.requirement_groups TO grafana_readonly;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO ct_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO ct_user;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT ON TABLES TO grafana_readonly;


--
-- PostgreSQL database dump complete
--

\unrestrict VOHhl2tF4WXCdxgZpXVjzss20WNceQlrARaberbo32l7r5dfwqKJ1AKXWGANfW8

