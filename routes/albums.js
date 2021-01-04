const express = require('express');
//const querystring = require('querystring');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');
//const fetch = require('node-fetch');

//middleware
// const authMidware = require('../middleware/authMiddle');
const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');
const photoMidware = require('../middleware/photoMiddle');

//mongoDB SchemaTypes
const User = require('../models/user');
const Photo = require('../models/photo');
const Album = require('../models/photoColelction');

//TODO -- will need middlea=ware varify photo ownership

//TODO -- move all photos to this route

// router.get('/', (req,res)=>{
//     res.render()

// })

//show album
router.get('/:albumID/', (req, res) => {
   //get album by id
   ///render a page of the user
   //if current user, they will have options
});

//Delete album
router.delete(
   '/:albumID',
   /* authMidware.checkUserPhotoOwner */ (req, res) => {
      //find album and delete
   },
);

//edit single album
router.get(
   '/:albumID/edit' /* authMidware.checkUserPhotoOwner, */,
   async (req, res) => {
      //photoMidware.renderPageWithUserAndPhoto(req, res, 'photos/edit');
   },
);

module.exports = router;
