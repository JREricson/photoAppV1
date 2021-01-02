const express = require('express');
const querystring = require('querystring');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');
const fetch = require('node-fetch');

//middleware
// const authMidware = require('../middleware/authMiddle');
const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');
const photoMidware = require('../middleware/photoMiddle');

//mongoDB SchemaTypes
const User = require('../models/user');
const Photo = require('../models/photo');

//TODO -- will need middlea=ware varify photo ownership

//TODO -- move all photos to this route

// router.get('/', (req,res)=>{
//     res.render()

// })

//show photo
router.get('/:photoID/photo', (req, res) => {
   photoMidware.renderPageWithUserAndPhoto(req, res, 'photos/photo');
});

//Delete photo
router.delete('/:photoID', authMidware.checkUserPhotoOwner, (req, res) => {
   console.log('The ID is ' + req.params.photoID);
   photoMidware.removePhotoAndRefernences(req, res); //TODO -- better error checking??? need to include req and res????
   res.redirect('/'); // TODO decide on better redirect
});

//edit single photo
router.get(
   '/:photoID/edit',
   authMidware.checkUserPhotoOwner,
   async (req, res) => {
      //TODO -- maybe add a list of current photos to send, incase need to update more than one

      photoMidware.renderPageWithUserAndPhoto(req, res, 'photos/edit');
   },
);

//view all photos

router.get('/', async (req, res) => {
   var query = req.query;

   //setting values for pagation
   // query['page'] = 0;
   // query['limit'] = 5; //sett to something more resonable
   //scipt on page wil upload more

   searchObj = {};

   console.log('query is:', querystring.stringify(req.query));

   //TODO-- make env variable
   let server = 'http://localhost:3001';

   //getting photo obj from api
   let photoRes = await fetch(
      `${server}/api/photos/?${querystring.stringify(req.query)}`,
   );
   //will be photo objs sent to user-- empty by default
   let photosFound = {};
   //if ok, generating JSON
   if (photoRes.ok) {
      photoJSON = await photoRes.json();
      console.log('photoJSON %%%%%%%%%%%%%%%%%%%%%%%=>', photoJSON);
      //only sending photos if there are no errors -- API skips over queries that generate errors when returning results
      if (photoJSON.photos && Object.keys(photoJSON.errors).length === 0) {
         photosFound = photoJSON.photos;
         console.log('---------->>>photosFound', photosFound);
      }
   } else {
      photosFound = {}; //await Photo.find(searchObj);
      console.log('problem getting photos');
      // imgElement += '<h2>No photos added</h2>';
   }

   //////////////////////

   /*search criteria will be added to searchObj if found in query*/
   // query.search && (searchObj['$text'] = { $search: query.search }); ////
   // query.search && (searchObj['$tags'] = { $search: query.tags }); ////

   //console.log('searchObj is now ' + searchObj);

   // let photosList = await Photo.find(searchObj);
   res.render('photos/allPhotos', { photosFound });
});

module.exports = router;
