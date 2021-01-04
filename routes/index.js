////////////
//packages
///////////
const express = require('express');
const router = express.Router();

//midleware
const indexMidware = require('../middleware/indexMiddle');

//landing
router.get('/', (req, res) => res.render('auth/landing'));

//login
router.get('/login', (req, res) => res.render('auth/login'));
router.post('/login', indexMidware.loginPost);

//logout
router.get('/logout', indexMidware.logout);

//Register
router.get('/register', (req, res) => res.render('auth/register'));
router.post('/register', indexMidware.registerPost);

//easter egg
router.get('/teapot', indexMidware.teapot);

module.exports = router;
