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

router.get('/:photoID/photo', async (req, res) => {
   currentUser = req.user;
   photo = await photoMidware.ASYNCgetPhotoObjFromId(req.params.photoID);
   console.log(photo);

   res.render('photos/photo', { currentUser, photo }); //add p
});

module.exports = router;
