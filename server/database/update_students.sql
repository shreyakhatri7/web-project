-- Add new student fields to existing database
-- Run this if you already have the database created

USE internship_portal;

-- Add new columns to students table
ALTER TABLE students 
ADD COLUMN university VARCHAR(255) AFTER phone,
ADD COLUMN major VARCHAR(255) AFTER university,
ADD COLUMN graduation_year VARCHAR(4) AFTER major,
ADD COLUMN gpa DECIMAL(3,2) AFTER graduation_year;

-- Add indexes for new fields
ALTER TABLE students 
ADD INDEX idx_graduation_year (graduation_year),
ADD INDEX idx_university (university);

-- Show updated table structure
DESCRIBE students;