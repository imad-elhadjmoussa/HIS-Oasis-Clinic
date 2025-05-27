// middleware/isAuthenticated.js
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // User is logged in
    }
    return res.status(401).json({ message: 'Unauthorized: Please log in.' });
}

module.exports = isAuthenticated;
