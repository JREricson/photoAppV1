//Schemas
const User = require('../models/user');

//for encription
const bcrypt = require('bcryptjs');
const passport = require('passport');

///
const photoMethods = require('./photoMethods');

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

   //encrypting password
   bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
         if (err) throw err; //TODO handle error
         newUser.password = hash;
         newUser.save().catch((err) => console.log(err));
      });
   });
   return newUser;
};

/////////////////////////////////////

userMethods.deleteUser = (user) => {
   //TODO include error checking
   //get photolist
   var photoList = user.allPhotos;

   //remove photos in list from database
   photoMethods.removeMultiplePhotosFromDBAndFS(photoList);

   //remove user
   userMethods.deleteUserOnly(user._id);
};

userMethods.deleteUserOnly = (userID) => {
   User.findByIdAndRemove(userID, function (err) {
      if (err) {
         console.log('error removing user \n' + err);
         // res.send('error -- contact admin');
      }
   });
};

userMethods.addPhotoToUserList = async (req, newPhotoId) => {
   req.user.allPhotos.push(newPhotoId);
   req.user.save();
};

userMethods.ASYNCremovephotosFromUserList = async (req, photoList) => {
   console.log(
      'attempting to remove photos from user list with id ',
      req.user._id,
   );
   console.log('photolist', photoList);
   await User.update(
      { _id: req.user._id },
      {
         $pull: { allPhotos: { $in: photoList } },
      },
   );
};

///////////////////////////

module.exports = userMethods;
