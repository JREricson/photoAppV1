////////////
//packages
///////////
const express = require('express');
const router = express.Router();

//middleware
const indexMidware = require('../middleware/indexMiddle');

//landing
router.get('/', indexMidware.renderLandingPage);

//login
router.get('/login', indexMidware.renderLoginPage);
router.post('/login', indexMidware.loginPost);

//logout
router.get('/logout', indexMidware.logout);

//Register
router.get('/register', indexMidware.renderRegisterPage);
router.post('/register', indexMidware.registerPost);

//why not?
router.get('/teapot', indexMidware.teapot);

module.exports = router;
