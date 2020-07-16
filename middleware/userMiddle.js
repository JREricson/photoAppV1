const User = require('../models/user');
const Photo = require('../models/photo');

var middlewareObj = {};

middlewareObj.renderPage = (req, res, pagePath, objOfValToBeSent) => {
   //add other params to render with page

   User.findById(req.params.id, (err, contentOwner) => {
      if (err) {
         console.log(err);
         res.status(404).send('page not found'); //TODO render 404
      } else {
         currentUser = req.user;
         let vals = { ...{ contentOwner, currentUser }, ...objOfValToBeSent };
         res.render(pagePath, vals); //add other params
      }
   });
};

module.exports = middlewareObj;
