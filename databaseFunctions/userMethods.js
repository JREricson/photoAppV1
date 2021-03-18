//Schemas
const User = require('../models/user');

//for encription
const bcrypt = require('bcryptjs');

///
const photoMethods = require('./photoMethods');
const albumMethods = require('./albumMethods');

var userMethods = {};

///////////////
//create methods
///////////////

/**
 *Creates a new user based on params. password
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

   //encrypting password
   encryptPasswordAndSaveUser(newUser);
   return newUser;
};

///////////////
//read methods
///////////////

///////////////
//update methods
///////////////

///////////////
//delete methods
///////////////

/**
 * Deletes user with userID from database
 * @param {*} userID
 */
userMethods.deleteUser = (userID) => {
   User.findByIdAndRemove(userID, function (err) {
      if (err) {
         console.log('error removing user \n' + err);
      }
   });
};

/////////////////////////////////////

//make sure not needed before delete
// userMethods.addPhotoToUserList = async (req, newPhotoId) => {
//    req.user.allPhotos.push(newPhotoId);
//    req.user.save();
// };

userMethods.ASYNCremovephotosFromUserList = async (userId, photoList) => {
   console.log('attempting to remove photos from user list with id ', userId);
   console.log('photolist', photoList);
   await User.updateOne(
      { _id: userId },
      {
         $pull: { allPhotos: { $in: photoList } },
      },
   );
};

/////////////////
//helper functions
/////////////////

/**
 * Changes password to encrypted password and saves user to database
 * @param {*} newUser
 */
const encryptPasswordAndSaveUser = (newUser) => {
   bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
         if (err) throw err;
         newUser.password = hash;
         newUser.save().catch((err) => console.log(err));
      });
   });
};

///////////////////////////

module.exports = userMethods;
