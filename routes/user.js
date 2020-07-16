/*jshint esversion: 6 */

const express = require('express');
const router = express.Router();
const path = require('path');

const multer = require('multer');
var exifr = require('exifr');

//middleware
const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');

// const exif = require('exif-js');

//////////////middle wear TODO -- bring to seperate file

//  async function extractExif(fileLocation) {
//   exifr
//   .parse('./uploads/userImage-1594674350552-_DSC0169.jpg')
//   .then((output) => {
//     return output;
//   })

// }

//multer uploads

var storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, './public/uploads');
   },
   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname;
      cb(null, file.fieldname + '-' + uniqueSuffix);
   },
});

//rejecting files with filter
const fileFilter = (req, file, cb) => {
   if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png'
   ) {
      cb(null, true);
   } else {
      cb(null, false);
   }
};

const upload = multer({
   storage: storage,
   limits: {
      fileSize: 1024 * 1024 * 20,
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

router.get('/:id/profile', (req, res) => {
   userMidware.renderPage(req, res, 'users/profile');
});

//TODO -- move to all users????
router.get('/', (req, res) => {
   User.find({}, (err, allUsers) => {
      if (err) {
         console.log(error);
      } else {
         res.render('users/users', {
            allUsers,
         });
      }
   });
});

////////////////////////
//User photo Routes
/////////////////////////

testFunc = () => {
   return new Promise((resolve, reject) => {
      setTimeout(() => {
         console.log('in test function');

         resolve();
      }, 1000);
   });

   resolve();
};

//upload routes
///////////////
router.get(
   '/:id/photos/upload',
   authMidware.isCurUserContentOwner,
   (req, res) => {
      userMidware.renderPage(req, res, 'users/upload');
   },
);

//TODO -- extract middleware //add curent user to photoDB
//add photos to users photos
//save photes references to list to be edited in redirect
router.post(
   '/:id/photos/upload',
   authMidware.isCurUserContentOwner,
   upload.array('userImage'), //TODO remname all userimage
   //TODO -- make sure no images are saved without being added database

   (postReq = async (req, res, next) => {
      var errors = [];
      var newPhotos = [];
      var exifDataForID = [];

      if (req.files.length === 0) {
         errors.push('no files submitted');
         res.redirect(`/${req.params.id}/photos/upload`);
      }

      //testFunc().then(console.log('testing then'));

      req.files.forEach((img) => {
         var newPhoto = new Photo({
            author: 'developer',
            SubmittedByID: 'none',
            fileName: img.filename,
            fileLocation: path.join(img.destination, img.filename),
         });

         var exifData = exifr
            .parse(path.join(img.destination, img.filename))
            .then((output) => {
               //TODO -- add other options not upto user
               newPhoto.dateTaken = output.DateTimeOriginal;
               newPhoto.exifMetaData = output;

               newPhoto
                  .save()
                  .then((photo) => {
                     // console.log(
                     //    `submitted img with location ${photo.fileLocation}`,
                     // );
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
      });

      await testFunc();
      ///make sure following only only comes up when async done
      if (errors.length > 0) {
         res.send(errors);
      } else {
         userMidware.renderPage(req, res, 'users/editSubmitted', {
            newPhotos,
            exifDataForID,
         });
         //res.render('users/editSubmitted', { newPhotos, exifDataForID }); //better way to do this??
      }
   }),
);

//edit upload routes
router.get('/:id/photos/upload/edit', (req, res) => {
   res.render('users/editSubmitted');
});

//temp routes
////////////
//////////

router.get('/:id/test', (req, res) => {
   res.send('test');
});

router.get(
   '/:id/photos',

   (req, res) => {
      userMidware.renderPage(req, res, 'users/photos');
      // User.findById(req.params.id, (err, profileOwner) => {
      //    if (err) {
      //       console.log(err);
      //       res.status(404).send('page not found');
      //    } else {
      //       currentUser = req.user;
      //       res.render('users/photos', { profileOwner, currentUser });
      //    }
      // });
      //getting Current user
      // while()
   },
);

router.put('/:id/photos', (req, res) => {
   var ndx = 0;

   const { testytest, author: authors } = req.body;

   res.redirect(`/users/${req.params.id}/photos`);

   // console.log('/////////in post req');
   // console.log('author' + ndx);

   // console.log(req.body);
   // console.log(testytest);
   // console.log(authors);

   // while()
});

module.exports = router;
