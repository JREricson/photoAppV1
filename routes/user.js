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

router.get('/:id/photos/upload', (req, res) => {
   res.render('users/upload');
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

//single file
// router.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
//    const file = req.file;
//    if (!file) {
//       const error = new Error('Please upload a file');
//       error.httpStatusCode = 400;
//       return next(error);
//    }
//    res.send(file);
// });

// //uploading a file
// router.post('/uploadphoto', upload.single('picture'), (req, res) => {
//    var img = fs.readFileSync(req.file.path);
//    var encode_image = img.toString('base64');
//    // Define a JSONobject for the image attributes for saving to database

//    var finalImg = {
//       contentType: req.file.mimetype,
//       image: new Buffer(encode_image, 'base64'),
//    };
//    db.collection('quotes').insertOne(finalImg, (err, result) => {
//       console.log(result);

//       if (err) return console.log(err);

//       console.log('saved to database');
//       res.redirect('/');
//    });
// });

//Uploading multiple files
// router.post(
//    '/uploadmultiple',
//    upload.array('myFiles', 12),
//    (req, res, next) => {
//       const files = req.files;
//       if (!files) {
//          const error = new Error('Please choose files');
//          error.httpStatusCode = 400;
//          return next(error);
//       }

//       res.send(files);
//    },
// );

// router.get('/:id/photos', (req, res) => {
//    db.collection('mycollection')
//       .find()
//       .toArray((err, result) => {
//          const imgArray = result.map((element) => element._id);
//          console.log(imgArray);

//          if (err) return console.log(err);
//          res.send(imgArray);
//       });
// });

// router.get('/photo/:photoID', (req, res) => {
//    var filename = req.params.photoID;

//    db.collection('mycollection').findOne(
//       { _id: ObjectId(filename) },
//       (err, result) => {
//          if (err) return console.log(err);

//          res.contentType('image/jpeg');
//          res.send(result.image.buffer);
//       },
//    );
// });

///////////////
//////////////

//TODO -- extract middleware
router.post(
   '/:id/photos/upload',
   upload.array('userImage'),
   //TODO -- make sure no images are save without being added database

   (req, res, next) => {
      const newPhoto = new Photo({
         author: 'developer',
         SubmittedByID: 'none',
         fileLocation: path.join(req.file.destination, req.file.filename),
      });
      var exifData = exifr
         .parse(path.join(req.file.destination, '/', req.file.filename)) //TODO fix
         .then((output) => {
            newPhoto.dateTaken = output.DateTimeOriginal;

            newPhoto
               .save()
               .then((photo) => {
                  console.log('submitted');
                  res.send('success');
               })
               .catch((err) => {
                  console.log(err);
                  res.send('failed');
               });
         });

      console.log('//////////////// exif data\n' + exifData);

      res.send('sent');
      //get submitter, date

      // const photo = new Photo({
      //    author: 'developer',
      //    SubmittedByID: 'none',
      // });
   },
);

//////////////////////////
///multiple uploads
/////////////////////////
//TODO -- extract middleware

router.get('/:id/photos/uploads', (req, res) => {
   res.render('users/upload');
});

router.post(
   '/:id/photos/uploads',
   upload.array('userImage'),
   //TODO -- make sure no images are save without being added database

   (req, res, next) => {
      const newPhoto = new Photo({
         author: 'developer',
         SubmittedByID: 'none',
         fileLocation: path.join(req.file.destination, req.file.filename),
      });
      var exifData = exifr
         .parse(path.join(req.file.destination, '/', req.file.filename)) //TODO fix
         .then((output) => {
            newPhoto.dateTaken = output.DateTimeOriginal;

            newPhoto
               .save()
               .then((photo) => {
                  console.log('submitted');
                  res.send('success');
               })
               .catch((err) => {
                  console.log(err);
                  res.send('failed');
               });
         });

      console.log('//////////////// exif data\n' + exifData);

      res.send('sent');
      //get submitter, date

      // const photo = new Photo({
      //    author: 'developer',
      //    SubmittedByID: 'none',
      // });
   },
);

module.exports = router;
