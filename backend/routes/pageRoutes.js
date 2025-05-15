// page routing
const express = require('express');
const router = express.Router();

// Routes for rendering pages
router.get("/", (req, res) => {
    res.set("Cache-Control", "no-store"); // Prevent caching
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
    res.render("jobs",{user: req.user});
})


router.get("/applications", (req, res) => {
    const jobId = req.query.jobId;
    
    if (!jobId) {
        // No jobId? Back to the job list you go.
        return res.redirect('/dashboard/client');
    }

    // Ideally, you'd pull applications tied to that jobId from your DB.
    // For now, we just send the jobId to the template
    res.render("applications", {
        jobId: jobId,
        // applications: getApplicationsForJob(jobId)
    });
});

router.get("/jobdetails", (req, res) => {
    const jobId = req.query.jobId;
    if (!jobId) {
        return res.redirect('/dashboard/freelancer/jobs');
    }
    
    res.render("jobDetails", { 
        jobId: jobId,
    });
});

router.get("/apply", (req, res) => {
    const jobId = req.query.jobId;
    if (!jobId) {
        return res.redirect('/dashboard/freelancer/jobs');
    }
    
    res.render("apply", { 
        jobId: jobId,
    });
});
// routes to dashboard per user type.
router.get("/dashboard/client", (req, res) => {
    res.render("clientDashboard", { user: req.user });
  });

router.get("/dashboard/freelancer/profile", (req,res) => {
    res.render("profile")
})
router.get("/dashboard/freelancer", (req, res) => res.render("freelancer_dashboard",{ user: req.user } ));
module.exports = router;
