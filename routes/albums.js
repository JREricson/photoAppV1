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
const albumMidware = require('../middleware/albumMiddle');

//mongoDB SchemaTypes
const User = require('../models/user');
const Photo = require('../models/photo');
const Album = require('../models/album');

//show album
router.get('/:albumID/', albumMidware.ASYNCrenderAlbumPage);

//edit album
router.get('/:albumID/edit', albumMidware.ASYNCrenderEditAlbumPage); //TODO add authettication
router.put('/:albumID/edit', albumMidware.ASYNCpostFormDataFromEditAlbumPage);

//Delete album
router.delete(
   '/:albumID',
   /* authMidware.checkUserPhotoOwner, */
   albumMidware.ASYNCpostDeleteRequest,
);

module.exports = router;
