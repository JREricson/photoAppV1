const User = require('../models/user');
const Photo = require('../models/photo');

//other middleware
const photoMidware = require('./photoMiddle');

var middlewareObj = {};

middlewareObj.renderPage = (req, res, pagePath, objOfValToBeSent) => {
   //add other params to render with page

   ///Finding routes

   User.findById(req.params.id, (err, contentOwner) => {
      if (err) {
         console.log(err);
         res.status(404).render('404');
      } else {
         currentUser = req.user;
         let vals = { ...{ contentOwner, currentUser }, ...objOfValToBeSent };
         res.render(pagePath, vals); //add other params
      }
   });

   //Deleting routes
   //firste getting all of user's photos

   //removing photos

   //removing users
};
middlewareObj.deleteUserOnly = (userID) => {
   User.findByIdAndRemove(userID, function (err) {
      if (err) {
         console.log('error removing user \n' + err);
         // res.send('error -- contact admin');
      }
   });
};

middlewareObj.deleteUser = (user) => {
   //TODO include error checking
   //get photolist
   var photoList = user.allPhotos;

   //remove photos in list
   photoMidware.removePhotosOnly(photoList);

   //remove user
   middlewareObj.deleteUserOnly(user._id);
};

module.exports = middlewareObj;
