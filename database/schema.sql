-- ============================================
-- Job Portal Database Schema
-- Unified Schema for All Team Members
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS job_portal;
USE job_portal;

-- ============================================
-- Users Table (Central auth for all roles)
-- Member 1 - Authentication & Core User Management
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'employer', 'admin') NOT NULL DEFAULT 'student',
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- ============================================
-- Students Table (ISA relationship with users)
-- Member 2 - Student Module
-- ============================================
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    education JSON,        -- Store education history as JSON array
    skills JSON,           -- Store skills as JSON array
    resume_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- Employers Table (ISA relationship with users)
-- Member 3 - Employer Module
-- ============================================
CREATE TABLE IF NOT EXISTS employers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_description TEXT,
    company_logo VARCHAR(500),
    company_website VARCHAR(255),
    company_location VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),      -- e.g., '1-50', '51-200', '201-500', '500+'
    contact_name VARCHAR(200),
    contact_phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_company_name (company_name),
    INDEX idx_industry (industry),
    INDEX idx_verified (is_verified)
);

-- ============================================
-- Admins Table (ISA relationship with users)
-- Member 4 - Admin Module
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    permissions JSON,      -- Array of permission strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ============================================
-- Jobs Table
-- Member 3 - Employer Module (CRUD)
-- Member 2 - Student Module (Read/Apply)
-- Member 4 - Admin Module (Manage/Remove)
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    job_type ENUM('full-time', 'part-time', 'contract', 'internship', 'remote') DEFAULT 'full-time',
    experience_level ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive') DEFAULT 'entry',
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    requirements JSON,      -- Array of requirement strings
    responsibilities JSON,  -- Array of responsibility strings
    benefits JSON,          -- Array of benefit strings
    skills_required JSON,   -- Array of required skills
    deadline DATE,
    vacancies INT DEFAULT 1,
    status ENUM('active', 'closed', 'draft', 'pending') DEFAULT 'pending',
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE,
    INDEX idx_employer (employer_id),
    INDEX idx_status (status),
    INDEX idx_approved (is_approved),
    INDEX idx_job_type (job_type),
    INDEX idx_experience_level (experience_level),
    INDEX idx_location (location),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (title, description)
);

-- ============================================
-- Applications Table
-- Member 2 - Student (Apply/Withdraw)
-- Member 3 - Employer (Accept/Reject)
-- Member 4 - Admin (View All)
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    student_id INT NOT NULL,
    cover_letter TEXT,
    resume_url VARCHAR(500),
    status ENUM('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    employer_notes TEXT,             -- Recruiter notes (not visible to student)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, student_id),
    INDEX idx_status (status),
    INDEX idx_student_id (student_id),
    INDEX idx_job_id (job_id),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- Activity Logs Table (For Admin reporting)
-- Member 4 - Admin Module
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),      -- 'user', 'job', 'application'
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- Sample Data for Testing
-- ============================================

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, role, status) VALUES
('admin@jobportal.com', '$2a$10$xIx7Y3J3BE33zXHhLCh.veqJGxuBNCB03v6tu8uT30qd50NfrNC7O', 'admin', 'active');

INSERT INTO admins (user_id, first_name, last_name, permissions) VALUES
(1, 'System', 'Admin', '["manage_users", "manage_jobs", "manage_employers", "view_reports"]');

-- Insert sample employer user (password: employer123)
INSERT INTO users (email, password, role, status) VALUES
('employer@techcorp.com', '$2a$10$PW6QNrXmXtdVUi5lceklZeQ88J/PZLfjXjlSi8aVK73wnw2K9cn52', 'employer', 'active');

INSERT INTO employers (user_id, company_name, company_description, company_location, industry, company_size, contact_name, is_verified) VALUES
(2, 'Tech Corp', 'A leading technology company specializing in software development', 'San Francisco, CA', 'Technology', '201-500', 'John Smith', TRUE);

-- Insert sample student user (password: student123)
INSERT INTO users (email, password, role, status) VALUES
('student@example.com', '$2a$10$dPZG1CFcVcWRvKcMk6yfw.J1zy6e.4.wCICD8JTnyvU3RTTDkZ3Hy', 'student', 'active');

INSERT INTO students (user_id, first_name, last_name, bio) VALUES
(3, 'Demo', 'Student', 'A passionate computer engineering student looking for opportunities.');

-- Insert sample jobs
INSERT INTO jobs (employer_id, title, description, location, job_type, experience_level, salary_min, salary_max, requirements, responsibilities, benefits, skills_required, deadline, vacancies, status, is_approved) VALUES
(1, 'Software Engineer', 'We are looking for a talented software engineer to join our team.', 'San Francisco, CA', 'full-time', 'mid', 80000, 120000, 
 '["Bachelor''s degree in Computer Science", "3+ years of experience", "Strong problem-solving skills"]',
 '["Design and develop software applications", "Collaborate with teams", "Write clean code"]',
 '["Health insurance", "401(k)", "Flexible hours"]',
 '["JavaScript", "Python", "React", "Node.js"]',
 DATE_ADD(CURDATE(), INTERVAL 30 DAY), 2, 'active', TRUE),

(1, 'Frontend Developer Intern', 'Great opportunity for students to learn frontend development.', 'San Francisco, CA', 'internship', 'entry', 1500, 2500,
 '["Currently pursuing CS degree", "Basic HTML/CSS/JS knowledge"]',
 '["Build UI components", "Learn from senior developers"]',
 '["Mentorship", "Flexible schedule", "Potential full-time offer"]',
 '["React", "JavaScript", "CSS", "HTML"]',
 DATE_ADD(CURDATE(), INTERVAL 15 DAY), 3, 'active', TRUE);

-- Success message
SELECT 'Database schema created successfully!' AS message;
