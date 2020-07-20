const express = require('express');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');

//middleware
// const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');

//mongoDB SchemaTypes
const User = require('../models/user');
const Photo = require('../models/photo');

//TODO -- will need middlea=ware varify photo ownership

//TODO -- move all photos to this route

// router.get('/', (req,res)=>{
//     res.render()

// })

router.get('/:photoID/photo', (req, res) => {
   res.render('photos/photo');
});

module.exports = router;
