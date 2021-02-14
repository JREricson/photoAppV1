//for encription
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Schemas
const User = require('../models/user');

//
const userMethods = require('../databaseFunctions/userMethods');
const userMidware = require('../middleware/userMiddle');

var indexMidware = {};

/** Logout
 *
 * @param {*} req
 * @param {*} res
 */
indexMidware.logout = (req, res) => {
   req.logout();
   req.flash('success_msg', 'You are now logged out');
   res.redirect('/login');
};

/** loginPost
 *
 * logs user in if authenticated
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
indexMidware.loginPost = async (req, res, next) => {
   await passport.authenticate('local', {
      successRedirect: `/users/`, //${req.user._id}/profile`, //TODO -- change route
      failureRedirect: '/login/',
      failureFlash: true,
   })(req, res, next);
};

/** registerPost
 * -gets data from user and regiseters user if conditions met
 *
 * @param {*} req
 * @param {*} res
 */
indexMidware.registerPost = (req, res) => {
   const { name, email, password, password2 } = req.body;

   //errors -- will hold a list of all caught errors in registration precess
   let errors = [];

   errors = getValidationErrors(name, email, password, password2);

   if (errors.length > 0) {
      //rendering page with user info to put in fields and errors for flash images
      res.render('auth/register', {
         errors,
         name,
         email,
         password,
         password2,
      });
   } else {
      User.findOne({ email: email }).then((user) => {
         if (user) {
            errors.push({ msg: 'Email is already registered' });
            //rerendering page with saved values
            res.render('auth/register', {
               errors,
               name,
               email,
               password,
               password2,
            });
         } else {
            //passed validation
            //creating new user
            userMethods.createUser(name, password, email).then((user) => {
               req.flash(
                  'success_msg',
                  'You are now registered and can log in',
               );
               res.redirect('/login');
            });
         }
      });
   }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */
indexMidware.teapot = (req, res) => {
   res.status(418).send('I am a teapot---you found an easter egg!!');
};

/////////////////
//helper functions
/////////////////
const getValidationErrors = (name, email, password, password2) => {
   errors = [];

   //check required fields
   if (!name || !email || !password || !password2) {
      errors.push({
         msg: 'all fields are required',
      });
   }

   //check pw match
   if (password != password2) {
      errors.push({
         msg: 'password must be at least 9 characters',
      });
   }

   //chack pw length
   if (password.length < 9) {
      errors.push({
         msg: 'all fields are required',
      });
   }
   return errors;
};

indexMidware.renderRegisterPage = (req, res) => {
   userMidware.renderPageWithUser(req, res, 'auth/register');
};

indexMidware.renderLoginPage = (req, res) => {
   userMidware.renderPageWithUser(req, res, 'auth/login');
};

indexMidware.renderLandingPage = (req, res) => {
   userMidware.renderPageWithUser(req, res, 'auth/landing');
};

/////////////////////
module.exports = indexMidware;

//   errors.push(getValidationErrors(name, email, password, password2));
