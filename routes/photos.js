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
   //checking that photoExists
   Photo.findById(req.params.photoID, async (err, photoFound) => {
      //TODO -- bring to middleware

      if (photoFound) {
         currentUser = req.user;
         photo = await photoMidware.ASYNCgetPhotoObjFromId(req.params.photoID);

         res.render('photos/photo', { currentUser, photo });
      } else {
         err && console.log(err);

         res.status(404).render('404');
      }
   });
});

//Delete photo
router.delete('/:photoID', authMidware.checkUserPhotoOwner, (req, res) => {
   console.log('The ID is ' + req.params.photoID);
   photoMidware.removePhotoAndRefernences(req, res); //TODO -- better error checking??? need to include req and res????
   res.redirect('/'); // TODO decide on better redirect
});

module.exports = router;
