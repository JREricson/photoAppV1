//Schemas
const User = require('../models/user');

//for encription
const bcrypt = require('bcryptjs');
const passport = require('passport');

var userMethods = {};

/** createUser
 *
 * @param {*} name
 * @param {*} password
 * @param {*} email
 */
userMethods.createUser = async (name, password, email) => {
   const newUser = new User({
      name,
      email,
      password,
   });

   console.log(newUser);

   //encrypting password
   bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
         if (err) throw err; //TODO handle error
         newUser.password = hash;
         newUser
            .save()
            //  .then((user) => {
            //     req.flash(
            //        'success_msg',
            //        'You are now registered and can log in',
            //     );
            //     res.redirect('/login');
            //  })
            .catch((err) => console.log(err));
      });
   });
   return newUser;
};

module.exports = userMethods;
