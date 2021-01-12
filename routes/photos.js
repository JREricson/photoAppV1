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

// router.get('/', (req,res)=>{
//     res.render()

// })

//show photo
router.get('/:photoID/photo', (req, res) => {
   photoMidware.renderPageWithUserAndPhoto(req, res, 'photos/photo');
});

//Delete photo
router.delete(
   '/:photoID',
   authMidware.checkUserPhotoOwner,
   photoMidware.removePhotoAndRefernences,
   (req, res) => {
      res.redirect(`/users/${req.user._id}/profile`); // TODO decide on better redirect
   },
);

//edit single photo
router.get(
   '/:photoID/edit',
   authMidware.checkUserPhotoOwner,
   async (req, res) => {
      photoMidware.renderPageWithUserAndPhoto(req, res, 'photos/edit');
   },
);

//show map page
router.get('/map', photoMidware.renderMapPage);

//view all photos

router.get('/', photoMidware.loadAllPhotosPage);

module.exports = router;
