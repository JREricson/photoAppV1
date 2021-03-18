const express = require('express');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');

//middleware
const authMidware = require('../middleware/authMiddle');
const photoMidware = require('../middleware/photoMiddle');

//////////////
//routes
//////////////

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
   photoMidware.renderPhotoPage,
);

//show map page
router.get('/map', photoMidware.renderMapPage);

//view all photos
router.get('/', photoMidware.renderAllPhotosPage);

module.exports = router;
