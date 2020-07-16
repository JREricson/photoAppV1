////////////
//packages
///////////
const express = require('express');
const router = express.Router();

//for encription
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Schemas
const User = require('../models/user');

//landing
router.get('/', (req, res) => res.render('auth/landing'));

//login
router.get('/login', (req, res) => res.render('auth/login'));

router.post('/login', (req, res, next) => {
   passport.authenticate('local', {
      successRedirect: `/users`, //TODO -- change route
      failureRedirect: '/login/',
      failureFlash: true,
   })(req, res, next);
});

//logout
router.get('/logout', (req, res) => {
   req.logout();
   req.flash('success_msg', 'you are now logged out');
   res.redirect('/login');
});

//Register
router.get('/register', (req, res) => res.render('auth/register'));

router.post('/register', (req, res) => {
   let errors = [];
   const { name, email, password, password2 } = req.body;

   //check required fields
   if (!name || !email || !password || !password2) {
      errors.push({
         msg: 'all fields are required',
      });
   }

   //check pw match
   if (password != password2) {
      errors.push({
         msg: 'password must be atleast 9 characters',
      });
   }

   //chack pw length
   if (password.length < 9) {
      errors.push({
         msg: 'all fields are required',
      });
   }

   if (errors.length > 0) {
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
            //rerendering page with saved valus
            res.render('auth/register', {
               errors,
               name,
               email,
               password,
               password2,
            });
         } else {
            //passed validation
            const newUser = new User({
               name,
               email,
               password,
            });

            console.log(newUser);

            //encrypting password
            //
            bcrypt.genSalt(10, (err, salt) => {
               bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err; //TODO handle error
                  newUser.password = hash;
                  newUser
                     .save()
                     .then((user) => {
                        req.flash(
                           'success_msg',
                           'You are now registered and can log in',
                        );
                        res.redirect('/login');
                     })
                     .catch((err) => console.log(err));
               });
            });
         }
      });
   }
});

router.get('/teapot', (req, res) => {
   res.status(418).send('I am a teapot---you found an easter egg!!');
});

module.exports = router;
