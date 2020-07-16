const express = require('express');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');

//middleware
// const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');

//mongoDB SchemaTypes
const User = require('../models/user');
const Photo = require('../models/photo');

router.get('/photos', (req, res) => {
   Photo.find({}, {}, { sort: { created_at: 1 } }, (err, photosFound) => {
      if (photosFound) {
         res.render('allusers/allPhotos', { photosFound });
      } else {
         console.log(err);
         res.redirect(back); //TODO handle error properly
      }
   });
});

module.exports = router;
