const express = require('express');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');

//middleware
// const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');

//mongoDB SchemaTypes
const User = require('../models/user');
const Photo = require('../models/photo');
const { isEmptyObject } = require('jquery');

// router.get('/users', (req, res) => {
//    var userJSON = { test: 'test' };

//    res.json(userJSON);
// });

module.exports = router;

router.get('/users', async (req, res) => {
   query = req.query;
   andQueries = {};

   /* adding queries if present*/
   query.name && (andQueries = { ...{ name: query.name } });
   query.bio && (andQueries = { ...{ bio: query.bio } });

   //degugging
   console.log('qo is :' + JSON.stringify(andQueries));
   //    if (req.query.test) {
   //       console.log(req.query.test);
   //    }

   //    objToFind

   let origUsersObj = await User.find({ $and: [andQueries] });
   console.log('users are: \n' + origUsersObj);
   let usersToSend = {};

   /*pulling only neccesary info from user obj*/
   origUsersObj.forEach((user, ndx) => {
      let {
         name,
         allPhotos,
         socialMediaAcnts,
         website,
         bio,
         homeLocation,
         datejoined,
      } = user;
      usersToSend = {
         ...{
            name,
            allPhotos,
            socialMediaAcnts,
            website,
            bio,
            homeLocation,
            datejoined,
         },
      };
   });

   /*adding a 'no users found' message to empty obj */
   Object.getOwnPropertyNames(usersToSend).length == 0 &&
      (usersToSend = { err: 'no users found' }); //would it be better to send an empty obj?

   res.json(usersToSend);
});

router.get('/photos', async (req, res) => {
   let photosObj = await Photo.find();
   photosObj ? res.json(photosObj) : res.json('error occured');
});
