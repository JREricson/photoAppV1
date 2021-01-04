const User = require('../models/user');
const Photo = require('../models/photo');

const path = require('path');

//used to extract photo details
var exifr = require('exifr');

//for encription
const bcrypt = require('bcryptjs');
const passport = require('passport');

//other middleware
const photoMidware = require('./photoMiddle');

var userMidware = {};

////////////
// create
////////////

userMidware.renderPage = (req, res, pagePath, objOfValToBeSent) => {
   //add other params to render with page

   ///Finding routes

   User.findById(req.params.id, (err, contentOwner) => {
      if (err) {
         console.log(err);
         res.status(404).render('404');
      } else {
         currentUser = req.user;
         let vals = { ...{ contentOwner, currentUser }, ...objOfValToBeSent };
         res.render(pagePath, vals); //add other params
      }
   });

   //Deleting routes
   //firste getting all of user's photos

   //removing photos

   //removing users
};
userMidware.deleteUserOnly = (userID) => {
   User.findByIdAndRemove(userID, function (err) {
      if (err) {
         console.log('error removing user \n' + err);
         // res.send('error -- contact admin');
      }
   });
};

userMidware.deleteUser = (user) => {
   //TODO include error checking
   //get photolist
   var photoList = user.allPhotos;

   //remove photos in list
   photoMidware.removePhotosOnly(photoList);

   //remove user
   userMidware.deleteUserOnly(user._id);
};

userMidware.addPhotoToUserList = async (req, newPhoto) => {
   await User.findByIdAndUpdate(
      req.user._id,
      { $push: { allPhotos: newPhoto._id } },
      (err, addedPhoto) => {
         if (err) {
            console.log('photo not added to user array');
            console.log(err);
         } else {
            console.log('++++++++++++++++++');
            console.log("added photo to user's photo list");
            console.log(req.user);
         }
      },
   );
};

///////////////////////
//actual middle
//////////////////

//multer uploads
//TODO move multer out of user js

userMidware.ASYNCgetProfile = async (req, res) => {
   const photoList = await photoMidware.ASYNCgetOwnerPhotoObjs(req, res, null);
   console.log('photoList is ', photoList.length);

   userMidware.renderPage(req, res, 'users/profile', { photoList });
};

userMidware.savephotosToDBandRenderEditPhotoPage = async (req, res, next) => {
   var errors = [];
   var newPhotos = [];
   var exifDataForID = [];

   //submitting errors if no files found
   if (req.files.length === 0) {
      errors.push('no files submitted');
      res.redirect(`/${req.params.id}/photos/upload`);
   }

   await Promise.all(
      req.files.map(async (img) => {
         var newPhoto = new Photo({
            author: req.user.name,
            SubmittedByID: req.user._id,
            fileName: img.filename,
            fileLocation: path.join(img.destination, img.filename),
            //TODO -- figure out best way to handle below
         });

         //TODO -- seperate out into steps incase no exif data present
         var exifData = await exifr
            .parse(path.join(img.destination, img.filename))
            .then((output) => {
               //TODO -- add other options not upto user
               newPhoto.dateTaken = output.DateTimeOriginal;
               newPhoto.exifMetaData = output;

               newPhoto
                  .save()
                  .then((photo) => {
                     newPhotos.push(photo);
                  })
                  .catch((err) => {
                     console.log(err);
                     errors.push('error saving photo to db');
                  });
               exifDataForID.push(output);
            })
            .catch((err) => {
               console.log(err);
               errors.push('error saving photo to db');
            });

         //adding photo to currrent users's photo collection
         await userMidware.addPhotoToUserList(req, newPhoto);
      }),
   );

   if (errors.length > 0) {
      res.send(errors);
   } else {
      userMidware.renderPage(req, res, 'users/editSubmitted', {
         newPhotos,
         exifDataForID,
      });
   }
};

userMidware.renderProfile = (req, res, next) => {
   //getting values from doc
   const {
      name,
      homeLocation,
      bio,
      personalSite,
      instagram,
      fiveHundredpix,
      flickr,
      github,
   } = req.body;

   //editing values for logging in user
   var socialMediaObj = {
      instagram: instagram,
      fiveHundredpix: fiveHundredpix,
      github: github,
      flickr: flickr,
   };

   User.findByIdAndUpdate(
      req.user._id,
      {
         name,
         bio,
         homeLocation,
         website: personalSite,
         socialMediaAcnts: { ...socialMediaObj },
      },

      (err, updatedUser) => {
         if (err) {
            console.log(err);
         } else {
            console.log('/////// updated Photo\n' + updatedUser);
         }
      },
   ),
      res.redirect(`/users/${req.params.id}/about`);
};

module.exports = userMidware;
