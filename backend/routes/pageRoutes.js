// page routing
const express = require('express');
const router = express.Router();

// Routes for rendering pages
router.get("/", (req, res) => {
    res.render("homepage");
});
router.get("/login", (req, res) => {
    res.render("login");
});
router.get("/contacts", (req, res) => {
    res.render("contacts");
});
// added a page route for jobs view , demo jobs though.
router.get("/dashboard/freelancer/jobs", (req,res) => {
    res.render("jobs")
})

router.get("/jobdetails", (req, res) => {
    const jobId = req.query.jobId;
    if (!jobId) {
        // If no jobId is provided, redirect back to jobs page
        return res.redirect('/dashboard/freelancer/jobs');
    }
    
    // In a real application, you would fetch the job details from your database here
    // For now, we'll just pass the jobId to the view
    res.render("jobDetails", { 
        jobId: jobId,
        // You would typically pass the entire job object here
        // job: getJobFromDatabase(jobId)
    });
});
// routes to dashboard per user type.
router.get("/dashboard/freelancer/profile", (req,res) => {
    res.render("profile")
})
router.get("/dashboard/client", (req, res) => {
    res.render("Client", { user: req.user });
  });
// checking 
router.get("/dashboard/freelancer", (req, res) => res.render("freelancer_dashboard"));
module.exports = router;
