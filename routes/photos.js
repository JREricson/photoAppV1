const express = require('express');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');

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
      var photo = await middlewareObj.ASYNCgetPhotoObjFromId(
         req.params.photoID,
      );

      res.render();

      //res.render('photos/edit');
   },
);

module.exports = router;
