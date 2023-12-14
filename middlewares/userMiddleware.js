const authenticateUser = (req, res, next) => {
    if (req.session.user && req.session.user._id) {
        // User is authenticated
        next();
    } else {
        res.redirect('/user/login'); // Redirect to the login page if not authenticated
    }
};


module.exports = { authenticateUser }