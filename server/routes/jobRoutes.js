const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

// POST /api/jobs
router.post("/", jobController.postJob);

// GET /api/jobs
router.get("/", jobController.getJobs);

module.exports = router; // ✅ must export router
