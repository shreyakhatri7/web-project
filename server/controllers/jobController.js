// server/controllers/jobController.js
const db = require("../config/db"); // your MySQL connection

// POST /api/jobs
exports.postJob = (req, res) => {
  const { title, description, salary, vacancies } = req.body;

  if (!title || !description || !salary || !vacancies) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO jobs (title, description, salary, vacancies) VALUES (?, ?, ?, ?)";
  db.query(sql, [title, description, salary, vacancies], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Job posted successfully", jobId: result.insertId });
  });
};

// GET /api/jobs
exports.getJobs = (req, res) => {
  const sql = "SELECT * FROM jobs";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};
