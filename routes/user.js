/*jshint esversion: 6 */

const express = require('express');
const router = express.Router();
const path = require('path');

const multer = require('multer');
//var exifr = require('exifr');

//middleware
const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');
const photoMidware = require('../middleware/photoMiddle');

//
const userMethods = require('../databaseFunctions/userMethods');

//multer uploads
//TODO move multer out of user js
var storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, './public/uploads');
   },
   filename: function (req, file, cb) {
      const uniqueSuffix =
         Date.now() + Math.floor(Math.random() * 100000) + file.originalname; //IMPROVE -- use crypto generate unique string
      cb(null, file.fieldname + '-' + uniqueSuffix);
   },
});

//rejecting files with filter
const fileFilter = (req, file, cb) => {
   if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/tiff' // TODO -- test tiff, jpegs,jpgs, and no exif data files
   ) {
      cb(null, true);
   } else {
      cb(null, false);
   }
};

const upload = multer({
   storage: storage,
   limits: {
      fileSize: 1024 * 1024 * 10,
   },
   fileFilter: fileFilter,
});

//Shemas
const User = require('../models/user');
const Photo = require('../models/photo');
const { Mongoose } = require('mongoose');
const { resolve } = require('path');

/////////////////
//routes
/////////////////

router.get('/:id/profile', userMidware.ASYNCgetProfile);

router.get('/', (req, res) => {
   res.render('users/users');
});

////////////////////////
//User photo Routes
/////////////////////////

//upload routes
///////////////
router.get(
   '/:id/photos/upload',
   authMidware.isCurUserContentOwner,
   userMidware.renderUploadPage,
);

router.post(
   '/:id/photos/upload',
   authMidware.isCurUserContentOwner,
   //putting photos from into an array
   upload.array('userImage'),
   //TODO -- make sure no images are saved without being added database
   userMidware.savePhotosToDBandRenderEditPhotoPage,
);

//edit upload routes
// TODO -- add validation incase user does not exist
router.get('/:id/photos/upload/edit', (req, res) => {
   res.render('users/editSubmitted');
});

router.get(
   '/:id/about',

   (req, res) => {
      userMidware.renderPageWithUser(req, res, 'users/about');
   },
);

// TODO--this
router.get('/:id/albums', userMidware.renderUserAlbumsPage);

router.get('/:id/photos', userMidware.renderPhotoPage);

router.put('/:id/photos', authMidware.isCurUserContentOwner, (req, res) => {
   photoMidware.updatePhotosFromEjsData(req); //TODO -- make Asyc???
   res.redirect(`/users/${req.params.id}/photos`);
});

router.get('/:id/settings', authMidware.isCurUserContentOwner, (req, res) => {
   userMidware.renderPageWithUser(req, res, 'users/settings');
});

//Delete user
router.delete('/:id', authMidware.isCurUserContentOwner, (req, res) => {
   userMethods.deleteUser(req.user);
   res.redirect('/login'); // TODO makesure no errors with
});

//edit user details

router.put(
   '/:id/profile',
   authMidware.isCurUserContentOwner,
   userMidware.renderProfile,
);

module.exports = router;
