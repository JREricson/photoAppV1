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
      ///TODO make sure following only only comes up when async done
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
   res.send(
      '{"Make":"Sony","Model":"E5823","Orientation":"Rotate 90 CW","XResolution":72,"YResolution":72,"ResolutionUnit":"inches","Software":"32.4.A.1.54_0_f500","ModifyDate":"2019-02-03T05:41:04.000Z","YCbCrPositioning":1,"ExposureTime":0.05,"FNumber":2,"ISO":800,"ExifVersion":"2.2","DateTimeOriginal":"2019-02-03T05:41:04.000Z","CreateDate":"2019-02-03T05:41:04.000Z","ComponentsConfiguration":{"0":1,"1":2,"2":3,"3":0},"ShutterSpeedValue":4.32,"ExposureCompensation":0,"MeteringMode":"Pattern","LightSource":"Unknown","Flash":"Flash did not fire, compulsory flash mode","FocalLength":4.23,"SubSecTime":"759784","SubSecTimeOriginal":"759784","SubSecTimeDigitized":"759784","FlashpixVersion":"1.0","ColorSpace":1,"ExifImageWidth":3840,"ExifImageHeight":2160,"CustomRendered":"Normal","ExposureMode":"Auto","WhiteBalance":"Auto","DigitalZoomRatio":1,"SceneCaptureType":"Standard","SubjectDistanceRange":"Unknown","GPSVersionID":"2.2.0.0","GPSLatitudeRef":"N","GPSLatitude":[17,23,42.999],"GPSLongitudeRef":"E","GPSLongitude":[104,48,17.413],"GPSAltitudeRef":{"0":0},"GPSAltitude":188,"GPSTimeStamp":"8:38:35","GPSStatus":"A","GPSMapDatum":"WGS-84","GPSDateStamp":"2019:02:02","latitude":17.3952775,"longitude":104.80483694444445}',
   );
});

router.get(
   '/:id/photos',

   (req, res) => {
      userMidware.renderPage(req, res, 'users/photos');
   },
);

router.put('/:id/photos', (req, res) => {
   //getting data from doc
   const {
      author: authors,
      description: descriptions,
      photoId: photoIds,
   } = req.body;

   //adding data to photo obj

   try {
      //body parser will make a list if more than one-- checking for list first
      photoIds.forEach((id, ndx) => {
         console.log('??????????????desciption is: --- ' + descriptions[0]);
         Photo.findByIdAndUpdate(
            id,
            { description: descriptions[0] },
            (err, updatedPhoto) => {
               if (err) {
                  console.log(err);
               } else {
                  console.log('/////// updated Photo\n' + updatedPhoto);
               }
            },
         );
         console.log(id + '---' + descriptions);
      });
   } catch (err) {
      //TODO -handling error in best way???
      //now checking as if single var, and not a list
      if (err instanceof TypeError) {
         try {
            Photo.findByIdAndUpdate(
               photoIds,
               { description: descriptions },
               (err, updatedPhoto) => {
                  if (err) {
                     console.log(err);
                  } else {
                     console.log('/////// updated Photo\n' + updatedPhoto);
                  }
               },
            );
         } catch {
            console.log(err);
         }
      }
   }

   console.log(photoIds);

   //findOneAndUpdate

   //TODO remove test

   console.log(req.body);
   //need to find indiv photo
   //get all compeonets to that photo
   //save to photo db

   res.redirect(`/users/${req.params.id}/photos`);
});

module.exports = router;
