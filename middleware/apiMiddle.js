// const User = require('../models/user');
// const Photo = require('../models/photo');

var middlewareObj = {};

middlewareObj.showApiInfoPage = (req, res) => {
   res.render('api/documentation');
};

/////////////////////
module.exports = middlewareObj;
