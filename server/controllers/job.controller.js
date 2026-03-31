/**
 * Job Controller
 * Member 2 - Student Module (Read/Search/Apply)
 * Public job browsing and search functionality
 */

const { pool } = require('../config/db');

const parseJsonSafe = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    // Keep legacy plain-text values readable instead of crashing the endpoint.
    return value;
  }
};

/**
 * Get all jobs with search and filters (for students/public)
 * GET /api/jobs
 */
const getAllJobs = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      job_type, 
      experience_level,
      min_salary,
      max_salary,
      page = 1, 
      limit = 10 
    } = req.query;

    let query = `
      SELECT j.*, e.company_name, e.company_logo, e.company_location,
             e.industry, e.is_verified as employer_verified
      FROM jobs j
      JOIN employers e ON j.employer_id = e.id
      WHERE j.status = 'active' AND j.is_approved = 1
    `;
    const params = [];

    // Search filter
    if (search) {
      query += ` AND (j.title LIKE ? OR j.description LIKE ? OR e.company_name LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Location filter
    if (location) {
      query += ` AND j.location LIKE ?`;
      params.push(`%${location}%`);
    }

    // Job type filter
    if (job_type) {
      query += ` AND j.job_type = ?`;
      params.push(job_type);
    }

    // Experience level filter
    if (experience_level) {
      query += ` AND j.experience_level = ?`;
      params.push(experience_level);
    }

    // Salary filters
    if (min_salary) {
      query += ` AND j.salary_max >= ?`;
      params.push(parseInt(min_salary));
    }
    if (max_salary) {
      query += ` AND j.salary_min <= ?`;
      params.push(parseInt(max_salary));
    }

    // Order by latest first
    query += ` ORDER BY j.created_at DESC`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [jobs] = await pool.query(query, params);

    // Parse JSON fields for each job
    jobs.forEach(job => {
      job.requirements = parseJsonSafe(job.requirements);
      job.responsibilities = parseJsonSafe(job.responsibilities);
      job.benefits = parseJsonSafe(job.benefits);
      job.skills_required = parseJsonSafe(job.skills_required);
    });

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM jobs j
      JOIN employers e ON j.employer_id = e.id
      WHERE j.status = 'active' AND j.is_approved = 1
    `;
    const countParams = [];

    if (search) {
      countQuery += ` AND (j.title LIKE ? OR j.description LIKE ? OR e.company_name LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (location) {
      countQuery += ` AND j.location LIKE ?`;
      countParams.push(`%${location}%`);
    }
    if (job_type) {
      countQuery += ` AND j.job_type = ?`;
      countParams.push(job_type);
    }
    if (experience_level) {
      countQuery += ` AND j.experience_level = ?`;
      countParams.push(experience_level);
    }
    if (min_salary) {
      countQuery += ` AND j.salary_max >= ?`;
      countParams.push(parseInt(min_salary));
    }
    if (max_salary) {
      countQuery += ` AND j.salary_min <= ?`;
      countParams.push(parseInt(max_salary));
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

/**
 * Get single job by ID
 * GET /api/jobs/:id
 */
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const [jobs] = await pool.query(
      `SELECT j.*, e.company_name, e.company_logo, e.company_location, 
              e.company_website, e.company_description, e.industry,
              e.company_size, e.is_verified as employer_verified
       FROM jobs j
       JOIN employers e ON j.employer_id = e.id
       WHERE j.id = ? AND j.status = 'active' AND j.is_approved = 1`,
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = jobs[0];

    // Parse JSON fields
    job.requirements = parseJsonSafe(job.requirements);
    job.responsibilities = parseJsonSafe(job.responsibilities);
    job.benefits = parseJsonSafe(job.benefits);
    job.skills_required = parseJsonSafe(job.skills_required);

    // Check if current user has applied (if authenticated and is a student)
    let hasApplied = false;
    let applicationStatus = null;
    
    if (req.user && req.user.role === 'student') {
      // Get student ID from user
      const [students] = await pool.query(
        'SELECT id FROM students WHERE user_id = ?',
        [req.user.id]
      );
      
      if (students.length > 0) {
        const [applications] = await pool.query(
          'SELECT status FROM applications WHERE job_id = ? AND student_id = ?',
          [id, students[0].id]
        );
        if (applications.length > 0) {
          hasApplied = true;
          applicationStatus = applications[0].status;
        }
      }
    }

    res.json({
      success: true,
      job: {
        ...job,
        hasApplied,
        applicationStatus
      }
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

/**
 * Get job filters/options for search
 * GET /api/jobs/filters
 */
const getJobFilters = async (req, res) => {
  try {
    const [jobTypes] = await pool.query(
      'SELECT DISTINCT job_type FROM jobs WHERE status = "active" AND is_approved = 1 AND job_type IS NOT NULL'
    );
    const [experienceLevels] = await pool.query(
      'SELECT DISTINCT experience_level FROM jobs WHERE status = "active" AND is_approved = 1 AND experience_level IS NOT NULL'
    );
    const [locations] = await pool.query(
      'SELECT DISTINCT location FROM jobs WHERE status = "active" AND is_approved = 1 AND location IS NOT NULL ORDER BY location'
    );
    const [industries] = await pool.query(
      `SELECT DISTINCT e.industry 
       FROM jobs j
       JOIN employers e ON j.employer_id = e.id
       WHERE j.status = "active" AND j.is_approved = 1 AND e.industry IS NOT NULL
       ORDER BY e.industry`
    );

    res.json({
      success: true,
      filters: {
        job_types: jobTypes.map(j => j.job_type),
        experience_levels: experienceLevels.map(e => e.experience_level),
        locations: locations.map(l => l.location),
        industries: industries.map(i => i.industry)
      }
    });
  } catch (error) {
    console.error('Get job filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job filters',
      error: error.message
    });
  }
};

module.exports = { getAllJobs, getJobById, getJobFilters };
