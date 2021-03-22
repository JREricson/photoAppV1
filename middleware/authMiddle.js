// const User = require('../models/user');
// const Photo = require('../models/photo');

var middlewareObj = {};

middlewareObj.isCurUserContentOwner = function (req, res, next) {
   if (req.isAuthenticated()) {
      if (req.user._id.equals(req.params.id)) {
         next();
      } else {
         req.flash('you need to be logged in as the owner to go there');
         res.redirect('/login');
      }
   } else {
      req.flash('you need to be logged in as the owner to go there');
      res.redirect('/login');
   }
};

middlewareObj.isLoggedIn = function (req, res, next) {
   if (req.isAuthenticated()) {
      return next();
   } else {
      //req.flash('error', 'please login first'); TODO -- get flash to work
      res.redirect('/login');
   }
};

middlewareObj.checkUserPhotoOwner = (req, res, next) => {
   //TODO -- test routes with postman

   //checking if cur user
   if (req.user) {
      //checking if user owns photo
      if (req.user) {
         next();
      } else {
         res.redirect('/login'); //TODO -- check route
      }
   } else {
      res.redirect('/login'); //TODO -- check route
   }
};

/////////////////////
module.exports = middlewareObj;
