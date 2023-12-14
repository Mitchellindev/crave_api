const express = require('express');
const { userSignup, userLogin, forgetPassword, verificationCode, passwordReset,  } = require('../controllers/authController')
const { accountSettings, accountProfile, emailSettings, tutorProfile } = require('../controllers/accountController')
    // , , verificationCode, passwordReset, userLogout 
const {authenticateUser } = require('../middlewares/userMiddleware')
const { body, validationResult } = require('express-validator');
const { protect } = require('../middlewares/authMiddleware')
const { validateSignup, validateLogin } = require('./validations');

const router = express.Router()


router.get('/signup', (req, res) => {
    res.render('signup')
});


router.get('/login', (req, res) => {
    res.render('login')
});


router.get('/forget-password', (req, res) => {
    res.render('forgetPassword')
});


router.get('/verify-code', (req, res) => {
    res.render('verifyCode')
});


router.get('/reset-password', (req, res) => {
    res.render('resetPassword')
});


router.get('/landing-page', (req, res) => {
    res.render('landingPage')
});


router.get('/account-settings', (req, res) => {
    res.render('account')
});


router.get('/profile-customization', authenticateUser, (req, res) => {
    res.render('profile', { user: req.session.user })
});


router.get('/dashboard', authenticateUser, (req, res) => {
    res.render('dashboard', { user: req.session.user })
});

router.get('/account-settings', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/user/login');
   }

   // Access user information from the session
    const user = req.session.user;

    res.render('account-settings', { user })
});

  







router.post('/signup', validateSignup , userSignup)
router.post('/login',validateLogin, userLogin)
router.post('/forget-password', forgetPassword)
router.post('/verify-code', verificationCode)
router.post('/reset-password', passwordReset)
// router.post('/logout', userLogout)


//account-settings
router.post('/profile-customization', authenticateUser, accountProfile)
router.post('/account-settings', authenticateUser, accountSettings )
router.post('/email-settings', authenticateUser, emailSettings)
router.post('/tutor-profile', authenticateUser, tutorProfile)



module.exports = router