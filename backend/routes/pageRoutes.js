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

// routes to dashboard per user type.
router.get("/dashboard/client", (req, res) => {
    res.render("Client", { user: req.user });
  });
  router.get("/dashboard/freelancer", (req, res) => res.render("freelancer_dashboard"));
module.exports = router;
