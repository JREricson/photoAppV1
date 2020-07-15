/*jshint esversion: 6 */

const express = require('express');
const router = express.Router();
const path = require('path');

const bcrypt = require('bcryptjs');
const passport = require('passport');

const multer = require('multer');
var exifr = require('exifr');
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
      cb(null, './uploads');
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

//Login
router.get('/login', (req, res) => res.render('login'));

//Register
router.get('/register', (req, res) => res.render('register'));

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
      res.render('register', {
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
            res.render('register', {
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
                        res.redirect('/users/login');
                     })
                     .catch((err) => console.log(err));
               });
            });
         }
      });
   }
});

// Login
router.post('/login', (req, res, next) => {
   passport.authenticate('local', {
      successRedirect: '/', //TODO -- change route
      failureRedirect: '/users/login',
      failureFlash: true,
   })(req, res, next);
});

//logout
router.get('/logout', (req, res) => {
   req.logout();
   req.flash('success_msg', 'you are now logged out');
   res.redirect('/users/login');
});

router.get('/:id', (req, res) => {
   res.render('users/profile');
});

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
         console.log('test');

         resolve();
      }, 1000);
   });

   resolve();
};

//upload routes
///////////////
router.get('/:id/photos/upload', (req, res) => {
   res.render('users/upload');
});

//TODO -- extract middleware //add curent user to photoDB
//add photos to users photos
//save photes references to list to be edited in redirect
router.post(
   '/:id/photos/upload',
   upload.array('userImage'), //TODO remname all userimage
   //TODO -- make sure no images are saved without being added database

   (postReq = async (req, res, next) => {
      var errors = [];
      var newPhotos = [];
      var exifDataForID = [];

      if (req.files.length === 0) {
         errors.push('no files submitted');
         res.redirect('/:id/photos/upload');
      }

      //testFunc().then(console.log('testing then'));

      req.files.forEach((img) => {
         var newPhoto = new Photo({
            author: 'developer',
            SubmittedByID: 'none',
            fileLocation: path.join(img.destination, img.filename),
         });

         newPhotos.push(Photo.findById(newPhoto._id));

         var exifData = exifr
            .parse(path.join(img.destination, img.filename))
            .then((output) => {
               //TODO -- add other options not upto user
               newPhoto.dateTaken = output.DateTimeOriginal;
               newPhoto.exifMetaData = output;

               newPhoto
                  .save()
                  .then((photo) => {
                     console.log(
                        `submitted img with location ${newPhoto.fileLocation}`,
                     );
                  })
                  .catch((err) => {
                     console.log(err);
                     errors.push('error saving photo to db');
                  });

               // console.log(
               //    '////////printing original' + JSON.stringify(output),
               // );

               exifDataForID.push(output);
               console.log(
                  '////////printing exifdata' + JSON.stringify(exifDataForID),
               );
            })

            .catch((err) => {
               console.log(err);
               errors.push('error saving photo to db');
            });

         // console.log(
         //    '////////printing exifdata' + JSON.stringify(exifDataForID),
         // );

         // console.log('//////////////// exif data\n' + exifData);
      });

      await testFunc();
      ///make sure following only only comes up when async done
      if (errors.length > 0) {
         res.send(errors);
      } else {
         res.render('users/editSubmitted', { newPhotos, exifDataForID }); //better way to do this??
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
   exifr
      .parse('./uploads/userImage-1594674350552-_DSC0169.jpg')
      .then((output) => {
         console.log(output);
         console.log('Camera:', output.Make, output.Model);
      });
   res.send('test');
});

module.exports = router;
