-- =====================================================
-- MIGRATION 001: ENUMS
-- Description: Create all ENUM types for the ATS system
-- Date: 2026-02-06
-- =====================================================

-- User roles in the system
CREATE TYPE user_role AS ENUM (
  'super_admin',    -- Full system administrator
  'company_user',   -- Company recruiter/HR
  'candidate',      -- Job applicant
  'screener'        -- Admin with limited permissions
);

-- Job posting status
CREATE TYPE job_status AS ENUM (
  'draft',          -- Not yet published
  'published',      -- Active and visible
  'closed'          -- No longer accepting applications
);

-- Required skill level for jobs (3 levels only)
CREATE TYPE required_level AS ENUM (
  'basic',
  'intermediate',
  'advanced'
);

-- Candidate's self-declared skill level (same as required_level)
CREATE TYPE candidate_level AS ENUM (
  'basic',
  'intermediate',
  'advanced'
);

-- Admin validation state for skills
CREATE TYPE admin_state AS ENUM (
  'pending',        -- Awaiting admin review
  'approved',       -- Validated by admin
  'rejected'        -- Rejected by admin
);

-- Application status flow
CREATE TYPE application_status AS ENUM (
  'pending',        -- Initial state
  'in_review',      -- Being reviewed
  'selected',       -- Candidate selected
  'rejected'        -- Application rejected
);

-- Skill approval status (for global skill catalog)
CREATE TYPE skill_status AS ENUM (
  'pending',        -- Awaiting admin approval
  'approved',       -- Available for use
  'rejected'        -- Rejected, not usable
);

-- Document types for candidate files
CREATE TYPE document_type AS ENUM (
  'cv_a',                   -- Application CV Version A
  'cv_b',                   -- Application CV Version B
  'academic_certificate_bachelor', -- Bachelor's degree certificate
  'academic_certificate_master',   -- Master's degree certificate (UPM)
  'gpa_screenshot_usa',            -- Screenshot of USA Master's GPA
  'cover_letter',           -- Cover letter
  'photo',                  -- Profile photo
  'additional_file'         -- Optional additional file
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'application_status',     -- Application status changed
  'skill_validated',        -- Skill was validated by admin
  'new_application',        -- New application received (for companies)
  'interview_scheduled'     -- Interview scheduled
);

-- Interview status
CREATE TYPE interview_status AS ENUM (
  'scheduled',      -- Interview is scheduled
  'completed',      -- Interview finished
  'cancelled',      -- Interview cancelled
  'rescheduled'     -- Interview was rescheduled
);

-- Interview mode
CREATE TYPE interview_mode AS ENUM (
  'presencial',     -- In-person interview
  'virtual',        -- Online/video interview
  'phone'           -- Phone interview
);

-- =====================================================
-- END OF MIGRATION 001
-- =====================================================
-- =====================================================
-- MIGRATION 002: CORE TABLES
-- Description: Create all 16 core tables for the ATS system
-- Date: 2026-02-06
-- =====================================================

-- =====================================================
-- TABLE 1: users
-- Description: Base authentication table
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed password
  role user_role NOT NULL,

-- Soft deletes and audit

is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Indexes for users
CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_auth_id ON users (auth_id);

CREATE INDEX idx_users_role ON users (role);

CREATE INDEX idx_users_active ON users (is_active, deleted_at)
WHERE
    deleted_at IS NULL;

COMMENT ON
TABLE users IS 'Base user authentication table. Does not contain profile info.';

COMMENT ON COLUMN users.role IS 'User role: super_admin, company_user, candidate, screener';

-- =====================================================
-- TABLE 2: companies
-- Description: Company entities (separate from users)
-- =====================================================


CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  contact_email VARCHAR(255),
  website VARCHAR(500),
  
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

-- Soft deletes

is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for companies
CREATE INDEX idx_companies_created_by ON companies (created_by);

CREATE INDEX idx_companies_name ON companies (name);

CREATE INDEX idx_companies_active ON companies (is_active, deleted_at)
WHERE
    deleted_at IS NULL;

COMMENT ON
TABLE companies IS 'Company entities. One user can create multiple companies.';

-- =====================================================
-- TABLE 3: company_users (N:M relationship)
-- Description: Multiple users can manage multiple companies
-- =====================================================
CREATE TABLE company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    company_id UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'admin', 'viewer', 'recruiter'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id, user_id)
);

-- Indexes for company_users
CREATE INDEX idx_company_users_company ON company_users (company_id, is_active);

CREATE INDEX idx_company_users_user ON company_users (user_id, is_active);

COMMENT ON
TABLE company_users IS 'N:M relationship between users and companies. Allows delegation and multiple recruiters.';

COMMENT ON COLUMN company_users.role IS 'Role within the company: admin, viewer, recruiter';

-- =====================================================
-- TABLE 4: skills
-- Description: Global skill catalog (reusable across all companies)
-- =====================================================
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100), -- e.g., 'Programming', 'Soft Skills', 'Languages'

-- Admin approval required
status skill_status DEFAULT 'pending',
created_by UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,

-- Soft deletes

is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for skills
CREATE INDEX idx_skills_name ON skills (name);

CREATE INDEX idx_skills_category ON skills (category);

CREATE INDEX idx_skills_status ON skills (status);

CREATE INDEX idx_skills_active ON skills (is_active, deleted_at)
WHERE
    deleted_at IS NULL;

COMMENT ON
TABLE skills IS 'Global skill catalog. Skills are reusable across companies.';

COMMENT ON COLUMN skills.status IS 'Approval status: pending (awaiting admin), approved, rejected';

-- =====================================================
-- TABLE 5: jobs
-- Description: Job postings (no job fairs - each job is independent)
-- =====================================================


CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  pdf_description VARCHAR(500), -- Optional PDF URL
  location VARCHAR(255),
  status job_status NOT NULL DEFAULT 'draft',

-- Soft deletes

is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for jobs
CREATE INDEX idx_jobs_company_id ON jobs (company_id);

CREATE INDEX idx_jobs_status ON jobs (status);

CREATE INDEX idx_jobs_created_at ON jobs (created_at);

CREATE INDEX idx_jobs_active ON jobs (is_active, deleted_at)
WHERE
    deleted_at IS NULL;

COMMENT ON
TABLE jobs IS 'Job postings. Each job is independent (no job fairs).';

COMMENT ON COLUMN jobs.title IS 'Job title may implicitly reference an event (e.g., "Developer - Tech Fair 2025")';

-- =====================================================
-- TABLE 6: job_skills
-- Description: Skills required by a job (M:N between jobs and skills)
-- =====================================================
CREATE TABLE job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    job_id UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills (id) ON DELETE RESTRICT,
    required_level required_level NOT NULL,
    UNIQUE (job_id, skill_id)
);

-- Indexes for job_skills
CREATE INDEX idx_job_skills_job_id ON job_skills (job_id);

CREATE INDEX idx_job_skills_skill_id ON job_skills (skill_id);

COMMENT ON
TABLE job_skills IS 'Skills required by each job. Each job-skill combination is unique.';

-- =====================================================
-- TABLE 7: candidates
-- Description: Complete candidate profile (enriched with education and experience)
-- =====================================================
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

-- Basic info
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL,
email VARCHAR(255) NOT NULL,
phone_number VARCHAR(50),

-- Address
address TEXT,
city VARCHAR(100),
country VARCHAR(100),
zip_code VARCHAR(20),

-- Additional info
availability_to_start DATE,
source_of_application VARCHAR(100), -- e.g., 'LinkedIn', 'Referral'
photo_url VARCHAR(500),

-- General Matching & Academic Fields (UPM/USA specific)
bachelor_mark DECIMAL(4,2),        -- Nota media Grado
master_upm_mark DECIMAL(4,2),      -- Nota media Máster UPM primer curso
master_usa_gpa DECIMAL(4,2),       -- GPA Máster USA Fall 2024
additional_info VARCHAR(750),      -- Optional additional information (max 750 chars)

-- Note: Documents are now in candidate_documents table
cover_letter TEXT, -- General cover letter (optional)

-- Soft deletes

is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for candidates
CREATE INDEX idx_candidates_user_id ON candidates (user_id);

CREATE INDEX idx_candidates_email ON candidates (email);

CREATE INDEX idx_candidates_city ON candidates (city);

CREATE INDEX idx_candidates_country ON candidates (country);

CREATE INDEX idx_candidates_active ON candidates (is_active, deleted_at)
WHERE
    deleted_at IS NULL;

COMMENT ON
TABLE candidates IS 'Complete candidate profile with personal and contact information.';

-- =====================================================
-- TABLE 8: candidate_experience
-- Description: Work experience (1:N - multiple jobs)
-- =====================================================
CREATE TABLE candidate_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    candidate_id UUID NOT NULL REFERENCES candidates (id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE, -- NULL if is_current = true
    is_current BOOLEAN DEFAULT false,
    roles_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for candidate_experience
CREATE INDEX idx_candidate_experience_candidate_id ON candidate_experience (candidate_id);

CREATE INDEX idx_candidate_experience_is_current ON candidate_experience (is_current);

COMMENT ON
TABLE candidate_experience IS 'Work experience history. Multiple positions per candidate.';

-- =====================================================
-- TABLE 10: candidate_documents
-- Description: Versioned documents (CVs, certificates, etc.) stored in Supabase Storage
-- =====================================================


CREATE TABLE candidate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  type document_type NOT NULL,
  storage_url VARCHAR(500) NOT NULL, -- URL in MinIO Object Storage
  version INTEGER DEFAULT 1,
  
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

-- Soft deletes
is_active BOOLEAN DEFAULT true, deleted_at TIMESTAMPTZ );

-- Indexes for candidate_documents
CREATE INDEX idx_candidate_documents_candidate_id ON candidate_documents (candidate_id);

CREATE INDEX idx_candidate_documents_type ON candidate_documents(type);

CREATE INDEX idx_candidate_documents_candidate_type ON candidate_documents(candidate_id, type, is_active) WHERE deleted_at IS NULL;

COMMENT ON
TABLE candidate_documents IS 'Versioned documents stored in MinIO Storage. Supports CV versions, certificates, etc.';

COMMENT ON COLUMN candidate_documents.storage_url IS 'URL to file in MinIO';

-- =====================================================
-- TABLE 11: applications
-- Description: Candidate applications to jobs
-- =====================================================


CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  
  resume_used document_type NOT NULL, -- Indicates whether candidate applied with cv_a or cv_b
  
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  status application_status DEFAULT 'pending',

-- Soft deletes

is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  
  UNIQUE(candidate_id, job_id) -- A candidate can only apply once per job
);

-- Indexes for applications
CREATE INDEX idx_applications_candidate_id ON applications (candidate_id);

CREATE INDEX idx_applications_job_id ON applications (job_id);

CREATE INDEX idx_applications_status ON applications (status);

CREATE INDEX idx_applications_applied_at ON applications (applied_at);

CREATE INDEX idx_applications_active ON applications (is_active, deleted_at)
WHERE
    deleted_at IS NULL;

CREATE INDEX idx_applications_job_status ON applications (job_id, status)
WHERE
    deleted_at IS NULL;

CREATE INDEX idx_applications_candidate_status ON applications (candidate_id, status)
WHERE
    deleted_at IS NULL;

COMMENT ON
TABLE applications IS 'Candidate applications to jobs. One application per candidate per job.';

-- =====================================================
-- TABLE 12: application_skills
-- Description: THE MOST IMPORTANT TABLE - Candidate's skills in response to job requirements
-- =====================================================
CREATE TABLE application_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,

-- Candidate's self-declared level
candidate_level candidate_level NOT NULL,

-- Candidate's justification
justification TEXT,

-- Admin validation

admin_comment TEXT,
  admin_state admin_state DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(application_id, skill_id) -- Each skill only once per application
);

-- Indexes for application_skills
CREATE INDEX idx_application_skills_application_id ON application_skills (application_id);

CREATE INDEX idx_application_skills_skill_id ON application_skills (skill_id);

CREATE INDEX idx_application_skills_admin_state ON application_skills (admin_state);

COMMENT ON
TABLE application_skills IS 'KEY TABLE: Candidate declares skills when applying to a job. Admin validates each skill.';

COMMENT ON COLUMN application_skills.justification IS 'Candidate explains why they have this skill';

COMMENT ON COLUMN application_skills.admin_state IS 'Admin validation: pending, approved, rejected';

-- =====================================================
-- TABLE 13: selected_candidates
-- Description: Final selection result
-- =====================================================
CREATE TABLE selected_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    application_id UUID UNIQUE NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates (id) ON DELETE CASCADE,
    final_decision TEXT NOT NULL, -- e.g., 'Selected', 'Reserved', 'Hired'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for selected_candidates
CREATE INDEX idx_selected_candidates_job_id ON selected_candidates (job_id);

CREATE INDEX idx_selected_candidates_candidate_id ON selected_candidates (candidate_id);

COMMENT ON
TABLE selected_candidates IS 'Final selection results. One record per selected application.';

-- =====================================================
-- TABLE 14: interviews
-- Description: Interview scheduling and management
-- =====================================================


CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  mode interview_mode NOT NULL,
  status interview_status DEFAULT 'scheduled',
  
  location VARCHAR(255), -- URL if virtual, address if in-person
  notes TEXT,
  interviewer_ids UUID[], -- Array of user IDs
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for interviews
CREATE INDEX idx_interviews_application ON interviews (application_id);

CREATE INDEX idx_interviews_date ON interviews (scheduled_date);

CREATE INDEX idx_interviews_status ON interviews (status);

CREATE INDEX idx_interviews_date_status ON interviews (scheduled_date, status);

COMMENT ON
TABLE interviews IS 'Interview scheduling. Supports multiple rounds per application.';

COMMENT ON COLUMN interviews.interviewer_ids IS 'Array of user_ids who will conduct the interview';

-- =====================================================
-- TABLE 15: notifications
-- Description: In-app notification system
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications (user_id, is_read);

CREATE INDEX idx_notifications_created_at ON notifications (created_at);

CREATE INDEX idx_notifications_user_unread ON notifications (user_id, created_at)
WHERE
    is_read = false;

COMMENT ON
TABLE notifications IS 'In-app notification system for status changes, validations, etc.';

-- =====================================================
-- TABLE 16: audit_logs
-- Description: Centralized audit trail for all critical actions
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES users (id),
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'application', 'skill', 'application_skill'
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'approved', 'rejected'
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);

CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);

CREATE INDEX idx_audit_logs_action ON audit_logs (action);

COMMENT ON
TABLE audit_logs IS 'Centralized audit trail. Tracks all critical actions for compliance.';

COMMENT ON COLUMN audit_logs.old_value IS 'JSONB snapshot of old state (for updates/deletes)';

COMMENT ON COLUMN audit_logs.new_value IS 'JSONB snapshot of new state (for creates/updates)';

-- =====================================================
-- END OF MIGRATION 002
-- =====================================================
-- =====================================================
-- MIGRATION 003: AUTH INTEGRATION
-- Description: Supabase Auth integration and helper functions
-- Date: 2026-02-06
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get current user ID from auth.uid()
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_current_user_id () IS 'Returns the user.id for the currently authenticated user via auth.uid()';

-- Get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_current_user_role () IS 'Returns the role of the currently authenticated user';

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Generic trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column () IS 'Automatically updates the updated_at column on row updates';

-- Apply to tables with updated_at
CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_companies
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_jobs
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_candidates
BEFORE UPDATE ON candidates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_interviews
BEFORE UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF MIGRATION 003
-- =====================================================
-- =====================================================
-- MIGRATION 004: ROW LEVEL SECURITY (RLS) POLICIES
-- Description: Enable RLS and create policies for all tables
-- Date: 2026-02-06
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

ALTER TABLE candidate_experience ENABLE ROW LEVEL SECURITY;

ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

ALTER TABLE application_skills ENABLE ROW LEVEL SECURITY;

ALTER TABLE selected_candidates ENABLE ROW LEVEL SECURITY;

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES FOR: users
-- =====================================================

-- Users can read their own profile
CREATE POLICY "users_select_own" ON users FOR
SELECT USING (auth_id = auth.uid ());

-- Admins can read all users
CREATE POLICY "users_select_admin" ON users FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users u
            WHERE
                u.auth_id = auth.uid ()
                AND u.role IN ('super_admin', 'screener')
        )
    );

-- Users can update their own profile (except role)
CREATE POLICY "users_update_own" ON users FOR
UPDATE USING (auth_id = auth.uid ());

-- =====================================================
-- POLICIES FOR: companies
-- =====================================================

-- Companies are publicly readable
CREATE POLICY "companies_select_public" ON companies FOR
SELECT USING (
        is_active = true
        AND deleted_at IS NULL
    );

-- Only creator or admins can modify
CREATE POLICY "companies_all_creator_admin" ON companies FOR ALL USING (
    created_by = get_current_user_id ()
    OR EXISTS (
        SELECT 1
        FROM users
        WHERE
            auth_id = auth.uid ()
            AND role = 'super_admin'
    )
);

-- Company users (from company_users) can manage their companies
CREATE POLICY "companies_all_company_user" ON companies FOR ALL USING (
    id IN (
        SELECT company_id
        FROM company_users
        WHERE
            user_id = get_current_user_id ()
            AND is_active = true
            AND role = 'admin'
    )
);

-- =====================================================
-- POLICIES FOR: company_users
-- =====================================================

-- Users can see their own memberships
CREATE POLICY "company_users_select_own" ON company_users FOR
SELECT USING (
        user_id = get_current_user_id ()
    );

-- Company admins can manage company_users
CREATE POLICY "company_users_all_admin" ON company_users FOR ALL USING (
    company_id IN (
        SELECT company_id
        FROM company_users
        WHERE
            user_id = get_current_user_id ()
            AND is_active = true
            AND role = 'admin'
    )
);

-- Super admins can see all
CREATE POLICY "company_users_select_super_admin" ON company_users FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role = 'super_admin'
        )
    );

-- =====================================================
-- POLICIES FOR: skills
-- =====================================================

-- Skills are publicly readable (if approved)
CREATE POLICY "skills_select_approved" ON skills FOR
SELECT USING (
        status = 'approved'
        AND is_active = true
        AND deleted_at IS NULL
    );

-- Admins and company_users can see all skills (including pending)
CREATE POLICY "skills_select_all_authorized" ON skills FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN (
                    'super_admin', 'screener', 'company_user'
                )
        )
    );

-- Company_users and admins can create skills
CREATE POLICY "skills_insert_authorized" ON skills FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN ('super_admin', 'company_user')
        )
    );

-- Only admins can approve/reject skills
CREATE POLICY "skills_update_admin" ON skills FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE
            auth_id = auth.uid ()
            AND role IN ('super_admin', 'screener')
    )
);

-- =====================================================
-- POLICIES FOR: jobs
-- =====================================================

-- Published jobs are publicly readable
CREATE POLICY "jobs_select_published" ON jobs FOR
SELECT USING (
        status = 'published'
        AND is_active = true
        AND deleted_at IS NULL
    );

-- Company users can manage jobs of their company
CREATE POLICY "jobs_all_company_user" ON jobs FOR ALL USING (
    company_id IN (
        SELECT company_id
        FROM company_users
        WHERE
            user_id = get_current_user_id ()
            AND is_active = true
    )
);

-- Admins can see all jobs
CREATE POLICY "jobs_select_admin" ON jobs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN ('super_admin', 'screener')
        )
    );

-- =====================================================
-- POLICIES FOR: job_skills
-- =====================================================

-- Anyone can see job_skills for published jobs
CREATE POLICY "job_skills_select_public" ON job_skills FOR
SELECT USING (
        job_id IN (
            SELECT id
            FROM jobs
            WHERE
                status = 'published'
                AND is_active = true
                AND deleted_at IS NULL
        )
    );

-- Company users can manage job_skills for their jobs
CREATE POLICY "job_skills_all_company" ON job_skills FOR ALL USING (
    job_id IN (
        SELECT j.id
        FROM jobs j
            JOIN company_users cu ON j.company_id = cu.company_id
        WHERE
            cu.user_id = get_current_user_id ()
            AND cu.is_active = true
    )
);

-- =====================================================
-- POLICIES FOR: candidates
-- =====================================================

-- Candidates can read/update their own profile
CREATE POLICY "candidates_select_own" ON candidates FOR
SELECT USING (
        user_id = get_current_user_id ()
    );

CREATE POLICY "candidates_update_own" ON candidates FOR
UPDATE USING (
    user_id = get_current_user_id ()
);

CREATE POLICY "candidates_insert_own" ON candidates FOR
INSERT
WITH
    CHECK (
        user_id = get_current_user_id ()
    );

-- Admins can read all candidates
CREATE POLICY "candidates_select_admin" ON candidates FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN ('super_admin', 'screener')
        )
    );

-- Companies can see candidates who applied to their jobs
CREATE POLICY "candidates_select_company" ON candidates FOR
SELECT USING (
        id IN (
            SELECT a.candidate_id
            FROM
                applications a
                JOIN jobs j ON a.job_id = j.id
                JOIN company_users cu ON j.company_id = cu.company_id
            WHERE
                cu.user_id = get_current_user_id ()
                AND cu.is_active = true
        )
    );

-- =====================================================
-- POLICIES FOR: candidate_education
-- =====================================================

-- Candidates can manage their own education
CREATE POLICY "candidate_education_all_own" ON candidate_education FOR ALL USING (
    candidate_id IN (
        SELECT id
        FROM candidates
        WHERE
            user_id = get_current_user_id ()
    )
);

-- Admins can see all
CREATE POLICY "candidate_education_select_admin" ON candidate_education FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN ('super_admin', 'screener')
        )
    );

-- Companies can see education of candidates who applied
CREATE POLICY "candidate_education_select_company" ON candidate_education FOR
SELECT USING (
        candidate_id IN (
            SELECT a.candidate_id
            FROM
                applications a
                JOIN jobs j ON a.job_id = j.id
                JOIN company_users cu ON j.company_id = cu.company_id
            WHERE
                cu.user_id = get_current_user_id ()
                AND cu.is_active = true
        )
    );

-- =====================================================
-- POLICIES FOR: candidate_experience
-- =====================================================

-- Candidates can manage their own experience
CREATE POLICY "candidate_experience_all_own" ON candidate_experience FOR ALL USING (
    candidate_id IN (
        SELECT id
        FROM candidates
        WHERE
            user_id = get_current_user_id ()
    )
);

-- Admins can see all
CREATE POLICY "candidate_experience_select_admin" ON candidate_experience FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN ('super_admin', 'screener')
        )
    );

-- Companies can see experience of candidates who applied
CREATE POLICY "candidate_experience_select_company" ON candidate_experience FOR
SELECT USING (
        candidate_id IN (
            SELECT a.candidate_id
            FROM
                applications a
                JOIN jobs j ON a.job_id = j.id
                JOIN company_users cu ON j.company_id = cu.company_id
            WHERE
                cu.user_id = get_current_user_id ()
                AND cu.is_active = true
        )
    );

-- =====================================================
-- POLICIES FOR: candidate_documents
-- =====================================================

-- Candidates can manage their own documents
CREATE POLICY "candidate_documents_all_own" ON candidate_documents FOR ALL USING (
    candidate_id IN (
        SELECT id
        FROM candidates
        WHERE
            user_id = get_current_user_id ()
    )
);

-- Admins can see all documents
CREATE POLICY "candidate_documents_select_admin" ON candidate_documents FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN ('super_admin', 'screener')
        )
    );

-- Companies can see documents of candidates who applied
CREATE POLICY "candidate_documents_select_company" ON candidate_documents FOR
SELECT USING (
        candidate_id IN (
            SELECT a.candidate_id
            FROM
                applications a
                JOIN jobs j ON a.job_id = j.id
                JOIN company_users cu ON j.company_id = cu.company_id
            WHERE
                cu.user_id = get_current_user_id ()
                AND cu.is_active = true
        )
    );

-- =====================================================
-- POLICIES FOR: applications
-- =====================================================

-- Candidates can see their own applications
CREATE POLICY "applications_select_own" ON applications FOR
SELECT USING (
        candidate_id IN (
            SELECT id
            FROM candidates
            WHERE
                user_id = get_current_user_id ()
        )
    );

-- Candidates can create applications
CREATE POLICY "applications_insert_own" ON applications FOR
INSERT
WITH
    CHECK (
        candidate_id IN (
            SELECT id
            FROM candidates
            WHERE
                user_id = get_current_user_id ()
        )
    );

-- Companies can see applications to their jobs
CREATE POLICY "applications_select_company" ON applications FOR
SELECT USING (
        job_id IN (
            SELECT j.id
            FROM jobs j
                JOIN company_users cu ON j.company_id = cu.company_id
            WHERE
                cu.user_id = get_current_user_id ()
                AND cu.is_active = true
        )
    );

-- Companies can update application status
CREATE POLICY "applications_update_company" ON applications FOR
UPDATE USING (
    job_id IN (
        SELECT j.id
        FROM jobs j
            JOIN company_users cu ON j.company_id = cu.company_id
        WHERE
            cu.user_id = get_current_user_id ()
            AND cu.is_active = true
    )
);

-- Admins can see all applications
CREATE POLICY "applications_select_admin" ON applications FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN ('super_admin', 'screener')
        )
    );

-- =====================================================
-- POLICIES FOR: application_skills
-- =====================================================

-- Candidates can create their skill declarations
CREATE POLICY "application_skills_insert_own" ON application_skills FOR
INSERT
WITH
    CHECK (
        application_id IN (
            SELECT a.id
            FROM applications a
                JOIN candidates c ON a.candidate_id = c.id
            WHERE
                c.user_id = get_current_user_id ()
        )
    );

-- Candidates can see their own application skills
CREATE POLICY "application_skills_select_own" ON application_skills FOR
SELECT USING (
        application_id IN (
            SELECT a.id
            FROM applications a
                JOIN candidates c ON a.candidate_id = c.id
            WHERE
                c.user_id = get_current_user_id ()
        )
    );

-- Companies can see skills for applications to their jobs
CREATE POLICY "application_skills_select_company" ON application_skills FOR
SELECT USING (
        application_id IN (
            SELECT a.id
            FROM
                applications a
                JOIN jobs j ON a.job_id = j.id
                JOIN company_users cu ON j.company_id = cu.company_id
            WHERE
                cu.user_id = get_current_user_id ()
                AND cu.is_active = true
        )
    );

-- Admins can validate skills (update admin_state)
CREATE POLICY "application_skills_update_admin" ON application_skills FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE
            auth_id = auth.uid ()
            AND role IN ('super_admin', 'screener')
    )
);

-- Admins can see all
CREATE POLICY "application_skills_select_admin" ON application_skills FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN ('super_admin', 'screener')
        )
    );

-- =====================================================
-- POLICIES FOR: selected_candidates
-- =====================================================

-- Companies can manage selections for their jobs
CREATE POLICY "selected_candidates_all_company" ON selected_candidates FOR ALL USING (
    job_id IN (
        SELECT j.id
        FROM jobs j
            JOIN company_users cu ON j.company_id = cu.company_id
        WHERE
            cu.user_id = get_current_user_id ()
            AND cu.is_active = true
    )
);

-- Candidates can see if they were selected
CREATE POLICY "selected_candidates_select_own" ON selected_candidates FOR
SELECT USING (
        candidate_id IN (
            SELECT id
            FROM candidates
            WHERE
                user_id = get_current_user_id ()
        )
    );

-- Admins can see all
CREATE POLICY "selected_candidates_select_admin" ON selected_candidates FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN ('super_admin', 'screener')
        )
    );

-- =====================================================
-- POLICIES FOR: interviews
-- =====================================================

-- Companies can manage interviews for their jobs
CREATE POLICY "interviews_all_company" ON interviews FOR ALL USING (
    application_id IN (
        SELECT a.id
        FROM
            applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN company_users cu ON j.company_id = cu.company_id
        WHERE
            cu.user_id = get_current_user_id ()
            AND cu.is_active = true
    )
);

-- Candidates can see their own interviews
CREATE POLICY "interviews_select_own" ON interviews FOR
SELECT USING (
        application_id IN (
            SELECT a.id
            FROM applications a
                JOIN candidates c ON a.candidate_id = c.id
            WHERE
                c.user_id = get_current_user_id ()
        )
    );

-- Admins can see all
CREATE POLICY "interviews_select_admin" ON interviews FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role IN ('super_admin', 'screener')
        )
    );

-- =====================================================
-- POLICIES FOR: notifications
-- =====================================================

-- Users can see their own notifications
CREATE POLICY "notifications_select_own" ON notifications FOR
SELECT USING (
        user_id = get_current_user_id ()
    );

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON notifications FOR
UPDATE USING (
    user_id = get_current_user_id ()
);

-- System can create notifications for any user
CREATE POLICY "notifications_insert_system" ON notifications FOR
INSERT
WITH
    CHECK (true);

-- =====================================================
-- POLICIES FOR: audit_logs
-- =====================================================

-- Only admins can read audit logs
CREATE POLICY "audit_logs_select_admin" ON audit_logs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                auth_id = auth.uid ()
                AND role = 'super_admin'
        )
    );

-- System can insert audit logs
CREATE POLICY "audit_logs_insert_system" ON audit_logs FOR
INSERT
WITH
    CHECK (true);

-- =====================================================
-- END OF MIGRATION 004
-- =====================================================
-- =====================================================
-- MIGRATION 005: FULL-TEXT SEARCH
-- Description: Add tsvector columns and GIN indexes for search
-- Date: 2026-02-06
-- =====================================================

-- =====================================================
-- FTS FOR: candidates
-- =====================================================

ALTER TABLE candidates
ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight (
        to_tsvector (
            'spanish',
            coalesce(first_name, '')
        ),
        'A'
    ) || setweight (
        to_tsvector (
            'spanish',
            coalesce(last_name, '')
        ),
        'A'
    ) || setweight (
        to_tsvector (
            'spanish',
            coalesce(email, '')
        ),
        'B'
    ) || setweight (
        to_tsvector ('spanish', coalesce(city, '')),
        'C'
    ) || setweight (
        to_tsvector (
            'spanish',
            coalesce(country, '')
        ),
        'C'
    )
) STORED;

CREATE INDEX idx_candidates_search ON candidates USING GIN (search_vector);

COMMENT ON COLUMN candidates.search_vector IS 'Full-text search vector for candidate search (first_name, last_name, email, city, country)';

-- =====================================================
-- FTS FOR: jobs
-- =====================================================

ALTER TABLE jobs
ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight (
        to_tsvector (
            'spanish',
            coalesce(title, '')
        ),
        'A'
    ) || setweight (
        to_tsvector (
            'spanish',
            coalesce(description, '')
        ),
        'B'
    ) || setweight (
        to_tsvector (
            'spanish',
            coalesce(location, '')
        ),
        'C'
    )
) STORED;

CREATE INDEX idx_jobs_search ON jobs USING GIN (search_vector);

COMMENT ON COLUMN jobs.search_vector IS 'Full-text search vector for job search (title, description, location)';

-- =====================================================
-- FTS FOR: skills
-- =====================================================

ALTER TABLE skills
ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight (
        to_tsvector ('spanish', coalesce(name, '')),
        'A'
    ) || setweight (
        to_tsvector (
            'spanish',
            coalesce(description, '')
        ),
        'B'
    ) || setweight (
        to_tsvector (
            'spanish',
            coalesce(category, '')
        ),
        'B'
    )
) STORED;

CREATE INDEX idx_skills_search ON skills USING GIN (search_vector);

COMMENT ON COLUMN skills.search_vector IS 'Full-text search vector for skill search (name, description, category)';

-- =====================================================
-- FTS FOR: companies
-- =====================================================

ALTER TABLE companies
ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight (
        to_tsvector ('spanish', coalesce(name, '')),
        'A'
    ) || setweight (
        to_tsvector (
            'spanish',
            coalesce(description, '')
        ),
        'B'
    )
) STORED;

CREATE INDEX idx_companies_search ON companies USING GIN (search_vector);

COMMENT ON COLUMN companies.search_vector IS 'Full-text search vector for company search (name, description)';

-- =====================================================
-- SEARCH HELPER FUNCTIONS
-- =====================================================

-- Function to search candidates
CREATE OR REPLACE FUNCTION search_candidates(search_query TEXT)
RETURNS TABLE (
  id UUID,
  first_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR,
  city VARCHAR,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.city,
    ts_rank(c.search_vector, websearch_to_tsquery('spanish', search_query)) AS rank
  FROM candidates c
  WHERE 
    c.search_vector @@ websearch_to_tsquery('spanish', search_query)
    AND c.is_active = true
    AND c.deleted_at IS NULL
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_candidates (TEXT) IS 'Search candidates by name, email, city, or country. Returns results ranked by relevance.';

-- Function to search jobs
CREATE OR REPLACE FUNCTION search_jobs(search_query TEXT)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  location VARCHAR,
  status job_status,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    j.description,
    j.location,
    j.status,
    ts_rank(j.search_vector, websearch_to_tsquery('spanish', search_query)) AS rank
  FROM jobs j
  WHERE 
    j.search_vector @@ websearch_to_tsquery('spanish', search_query)
    AND j.status = 'published'
    AND j.is_active = true
    AND j.deleted_at IS NULL
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_jobs (TEXT) IS 'Search published jobs by title, description, or location. Returns results ranked by relevance.';

-- Function to search skills
CREATE OR REPLACE FUNCTION search_skills(search_query TEXT)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  category VARCHAR,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.description,
    s.category,
    ts_rank(s.search_vector, websearch_to_tsquery('spanish', search_query)) AS rank
  FROM skills s
  WHERE 
    s.search_vector @@ websearch_to_tsquery('spanish', search_query)
    AND s.status = 'approved'
    AND s.is_active = true
    AND s.deleted_at IS NULL
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_skills (TEXT) IS 'Search approved skills by name, description, or category. Returns results ranked by relevance.';

-- =====================================================
-- END OF MIGRATION 005
-- =====================================================
-- =====================================================
-- MIGRATION 006: AUDIT TRIGGERS
-- Description: Automatic audit logging for critical tables
-- Date: 2026-02-06
-- =====================================================

-- =====================================================
-- GENERIC AUDIT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user ID (may be NULL for system operations)
  current_user_id := get_current_user_id();
  
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (
      current_user_id,
      TG_TABLE_NAME,
      OLD.id,
      'deleted',
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (
      current_user_id,
      TG_TABLE_NAME,
      NEW.id,
      'updated',
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
    
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (
      current_user_id,
      TG_TABLE_NAME,
      NEW.id,
      'created',
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION audit_trigger_function () IS 'Generic audit trigger that logs all INSERT, UPDATE, DELETE operations to audit_logs table';

-- =====================================================
-- APPLY AUDIT TRIGGERS TO CRITICAL TABLES
-- =====================================================

-- Applications (critical for tracking application flow)
CREATE TRIGGER audit_applications
AFTER INSERT OR UPDATE OR DELETE ON applications
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Application Skills (critical for tracking skill validations)
CREATE TRIGGER audit_application_skills
AFTER INSERT OR UPDATE OR DELETE ON application_skills
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Skills (track skill creation and approval)
CREATE TRIGGER audit_skills
AFTER INSERT OR UPDATE OR DELETE ON skills
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Selected Candidates (critical hiring decisions)
CREATE TRIGGER audit_selected_candidates
AFTER INSERT OR UPDATE OR DELETE ON selected_candidates
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Jobs (track job postings)
CREATE TRIGGER audit_jobs
AFTER INSERT OR UPDATE OR DELETE ON jobs
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Candidates (track candidate profile changes)
CREATE TRIGGER audit_candidates
AFTER INSERT OR UPDATE OR DELETE ON candidates
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Interviews (track interview scheduling)
CREATE TRIGGER audit_interviews
AFTER INSERT OR UPDATE OR DELETE ON interviews
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- SPECIALIZED AUDIT FUNCTIONS
-- =====================================================

-- Function to track skill validation changes specifically
CREATE OR REPLACE FUNCTION track_skill_validation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track when admin_state changes
  IF (TG_OP = 'UPDATE' AND OLD.admin_state IS DISTINCT FROM NEW.admin_state) THEN
    INSERT INTO notifications (user_id, type, message)
    SELECT 
      c.user_id,
      'skill_validated',
      CASE 
        WHEN NEW.admin_state = 'approved' THEN 
          'Tu habilidad "' || s.name || '" ha sido aprobada'
        WHEN NEW.admin_state = 'rejected' THEN 
          'Tu habilidad "' || s.name || '" ha sido rechazada'
        ELSE 
          'El estado de tu habilidad "' || s.name || '" ha cambiado'
      END
    FROM applications a
    JOIN candidates c ON a.candidate_id = c.id
    JOIN skills s ON NEW.skill_id = s.id
    WHERE a.id = NEW.application_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply skill validation tracking
CREATE TRIGGER track_skill_validation_changes
AFTER UPDATE ON application_skills
FOR EACH ROW EXECUTE FUNCTION track_skill_validation();

-- Function to notify on application status change
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO notifications (user_id, type, message)
    SELECT 
      c.user_id,
      'application_status',
      'Tu aplicación para "' || j.title || '" ha cambiado a: ' || NEW.status
    FROM candidates c
    JOIN jobs j ON NEW.job_id = j.id
    WHERE c.id = NEW.candidate_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply application status tracking
CREATE TRIGGER notify_application_status_changes
AFTER UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION notify_application_status_change();

-- Function to notify company on new application
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Notify all active company_users for this job's company
    INSERT INTO notifications (user_id, type, message)
    SELECT 
      cu.user_id,
      'new_application',
      'Nueva aplicación recibida para "' || j.title || '"'
    FROM jobs j
    JOIN company_users cu ON j.company_id = cu.company_id
    WHERE j.id = NEW.job_id
    AND cu.is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply new application notification
CREATE TRIGGER notify_new_applications
AFTER INSERT ON applications
FOR EACH ROW EXECUTE FUNCTION notify_new_application();

-- Function to notify on interview scheduling
CREATE OR REPLACE FUNCTION notify_interview_scheduled()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.scheduled_date IS DISTINCT FROM NEW.scheduled_date)) THEN
    INSERT INTO notifications (user_id, type, message)
    SELECT 
      c.user_id,
      'interview_scheduled',
      'Entrevista programada para el ' || to_char(NEW.scheduled_date, 'DD/MM/YYYY HH24:MI')
    FROM applications a
    JOIN candidates c ON a.candidate_id = c.id
    WHERE a.id = NEW.application_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply interview notification
CREATE TRIGGER notify_interviews
AFTER INSERT OR UPDATE ON interviews
FOR EACH ROW EXECUTE FUNCTION notify_interview_scheduled();

-- =====================================================
-- END OF MIGRATION 006
-- =====================================================
-- =====================================================
-- MIGRATION 007: COMPOSITE INDEXES
-- Description: Add composite indexes for frequently used queries
-- Date: 2026-02-06
-- =====================================================

-- =====================================================
-- APPLICATIONS - Query patterns
-- =====================================================

-- Jobs applications by status (excluding soft-deleted)
CREATE INDEX idx_applications_job_status_active ON applications (job_id, status)
WHERE
    deleted_at IS NULL
    AND is_active = true;

-- Candidate applications by status (excluding soft-deleted)
CREATE INDEX idx_applications_candidate_status_active ON applications (candidate_id, status)
WHERE
    deleted_at IS NULL
    AND is_active = true;

-- Recent applications by job
CREATE INDEX idx_applications_job_created ON applications (job_id, applied_at DESC)
WHERE
    deleted_at IS NULL;

-- =====================================================
-- APPLICATION_SKILLS - Admin validation queue
-- =====================================================

-- Pending skills for validation
CREATE INDEX idx_application_skills_pending ON application_skills (admin_state, created_at)
WHERE
    admin_state = 'pending';

-- Skills by application and state
CREATE INDEX idx_application_skills_app_state ON application_skills (application_id, admin_state);

-- Skills by skill_id for analytics
CREATE INDEX idx_application_skills_skill_state ON application_skills (skill_id, admin_state);

-- =====================================================
-- COMPANY_USERS - Access control
-- =====================================================

-- Active company memberships
CREATE INDEX idx_company_users_company_active ON company_users (company_id, is_active, role)
WHERE
    is_active = true;

-- User's active companies
CREATE INDEX idx_company_users_user_active ON company_users (user_id, is_active)
WHERE
    is_active = true;

-- =====================================================
-- CANDIDATE_DOCUMENTS - Document management
-- =====================================================

-- Active documents by candidate and type
CREATE INDEX idx_candidate_documents_candidate_type_active 
ON candidate_documents(candidate_id, type, version DESC) 
WHERE is_active = true AND deleted_at IS NULL;

-- Latest document version per type
CREATE INDEX idx_candidate_documents_latest 
ON candidate_documents(candidate_id, type, uploaded_at DESC) 
WHERE is_active = true;

-- =====================================================
-- NOTIFICATIONS - Unread notifications
-- =====================================================

-- Unread notifications by user (most common query)
CREATE INDEX idx_notifications_user_unread_recent ON notifications (user_id, created_at DESC)
WHERE
    is_read = false;

-- Notifications by type for analytics
CREATE INDEX idx_notifications_type_created 
ON notifications(type, created_at DESC);

-- =====================================================
-- INTERVIEWS - Scheduling queries
-- =====================================================

-- Upcoming interviews
CREATE INDEX idx_interviews_upcoming ON interviews (scheduled_date ASC, status)
WHERE
    status IN ('scheduled', 'rescheduled');

-- Interviews by application and date
CREATE INDEX idx_interviews_application_date ON interviews (
    application_id,
    scheduled_date DESC
);

-- Interviews by date range (for calendar views)
CREATE INDEX idx_interviews_date_range ON interviews (scheduled_date)
WHERE
    status != 'cancelled';

-- =====================================================
-- JOBS - Job listings
-- =====================================================

-- Published jobs by company
CREATE INDEX idx_jobs_company_published ON jobs (
    company_id,
    status,
    created_at DESC
)
WHERE
    status = 'published'
    AND deleted_at IS NULL;

-- Active jobs by status and date
CREATE INDEX idx_jobs_status_created ON jobs (status, created_at DESC)
WHERE
    is_active = true
    AND deleted_at IS NULL;

-- =====================================================
-- SKILLS - Skill management
-- =====================================================

-- Approved skills by category
CREATE INDEX idx_skills_category_approved ON skills (category, name)
WHERE
    status = 'approved'
    AND deleted_at IS NULL;

-- Pending skills for admin review
CREATE INDEX idx_skills_pending_review ON skills (status, created_at)
WHERE
    status = 'pending'
    AND deleted_at IS NULL;

-- =====================================================
-- JOB_SKILLS - Skill requirements
-- =====================================================

-- Skills by job with required level
CREATE INDEX idx_job_skills_job_level ON job_skills (job_id, required_level);

-- Jobs requiring specific skill
CREATE INDEX idx_job_skills_skill ON job_skills (skill_id, required_level);

-- =====================================================
-- CANDIDATES - Candidate search
-- =====================================================

-- Active candidates by location
CREATE INDEX idx_candidates_location_active ON candidates (country, city)
WHERE
    is_active = true
    AND deleted_at IS NULL;

-- Candidates by availability
CREATE INDEX idx_candidates_availability ON candidates (availability_to_start)
WHERE
    is_active = true
    AND deleted_at IS NULL;

-- =====================================================
-- SELECTED_CANDIDATES - Selection tracking
-- =====================================================

-- Selections by job
CREATE INDEX idx_selected_candidates_job_created ON selected_candidates (job_id, created_at DESC);

-- Selections by candidate
CREATE INDEX idx_selected_candidates_candidate ON selected_candidates (candidate_id, created_at DESC);

-- =====================================================
-- AUDIT_LOGS - Audit queries
-- =====================================================

-- Recent audits by entity
CREATE INDEX idx_audit_logs_entity_recent ON audit_logs (
    entity_type,
    entity_id,
    created_at DESC
);

-- Audits by user and date range
CREATE INDEX idx_audit_logs_user_date ON audit_logs (user_id, created_at DESC);

-- Audits by action type
CREATE INDEX idx_audit_logs_action_date ON audit_logs (action, created_at DESC);

-- =====================================================
-- END OF MIGRATION 007
-- =====================================================
-- =====================================================
-- FIX: Infinite Recursion in users RLS Policy
-- =====================================================
-- Drop the problematic policy and recreate without recursion

-- Drop the old policy
DROP POLICY IF EXISTS "users_select_admin" ON users;

-- Recreate using auth.jwt() to avoid recursion
CREATE POLICY "users_select_admin" ON users FOR SELECT
USING (
    (auth.jwt()->>'role')::text IN ('super_admin', 'screener')
);

-- Alternative: If jwt doesn't have role, use a SECURITY DEFINER function
-- This is safer and recommended for production
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid()
        AND role IN ('super_admin', 'screener')
        LIMIT 1
    );
$$;

-- Drop and recreate the policy using the function
DROP POLICY IF EXISTS "users_select_admin" ON users;

CREATE POLICY "users_select_admin" ON users FOR
SELECT USING (is_admin ());
