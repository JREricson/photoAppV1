const User = require('../models/user');
const Photo = require('../models/photo');

const path = require('path');

//used to extract photo details
var exifr = require('exifr');

//for encription
const bcrypt = require('bcryptjs');
const passport = require('passport');

//other middleware/packages
const photoMidware = require('./photoMiddle');
const userMethods = require('../databaseFunctions/userMethods');

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

userMidware.ASYNCgetProfile = async (req, res) => {
   const photoList = await photoMidware.ASYNCgetOwnerPhotoObjs(req, res, null);
   console.log('photoList is ', photoList.length);

   userMidware.renderPage(req, res, 'users/profile', { photoList });
};

userMidware.savePhotosToDBandRenderEditPhotoPage = async (req, res, next) => {
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

         //adding photo to currrent users's photo collection
         //await userMethods.addPhotoToUserList(req, newPhoto._id);
         req.user.allPhotos.push(newPhoto._id);

         //adding exif data if present
         var exifData = await exifr
            .parse(path.join(img.destination, img.filename))
            .then((output) => {
               //TODO -- add other options not upto user
               newPhoto.dateTaken = output.DateTimeOriginal;
               newPhoto.exifMetaData = output;

               newPhoto.save();

               exifDataForID.push(output);
            })
            .catch((err) => {
               console.log(err);
               errors.push('error saving photo to db');
            });

         //adding photo to list to return to user
         newPhotos.push(newPhoto);
      }),
   );
   req.user.save();

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

userMidware.renderPhotoPage = async (req, res, next) => {
   const photoList = await photoMidware.ASYNCgetOwnerPhotoObjs(req, res, null);
   userMidware.renderPage(req, res, 'users/photos', { photoList });
};

module.exports = userMidware;
