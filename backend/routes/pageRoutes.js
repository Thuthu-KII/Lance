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

module.exports = router;
