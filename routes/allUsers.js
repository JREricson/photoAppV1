const express = require('express');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');

//middleware
// const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');

//mongoDB SchemaTypes
const User = require('../models/user');
const Photo = require('../models/photo'); // $text: { $search: 'j' }
const { query } = require('express');

router.get('/photos', async (req, res) => {
   var query = req.query;

   searchObj = {};

   /*search criteria will be added to searchObj if found in query*/
   query.search && (searchObj['$text'] = { $search: query.search }); ////
  // query.search && (searchObj['$tags'] = { $search: query.tags }); ////

   console.log('searchObj is now ' + searchObj);

   let photosFound = await Photo.find(searchObj);
   res.render('allusers/allPhotos', { photosFound });

   // Photo.find(

   //    {},
   //    {},
   //    { sort: { created_at: 1 } },
   //    (err, photosFound) => {
   //       if (photosFound) {
   //          res.render('allusers/allPhotos', { photosFound });
   //       } else {
   //          console.log(err);
   //          res.redirect(back); //TODO handle error properly
   //       }
   //    },
   // );
});

module.exports = router;
