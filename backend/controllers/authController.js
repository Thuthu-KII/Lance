//Controllers will hold the logic that handles requests, and they will be imported into the route files.
//  For instance, for authentication, the logic is moved into authController.js
// handles logic for auth and check if user us logged in
// Middleware to check if user is logged in

function isLogged(req, res, next) {
    req.user ? next() : res.sendStatus(401);  // Allow if logged in, else 401
}

module.exports = { isLogged };
