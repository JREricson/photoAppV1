const User = require('../models/user');
// const Photo = require('../models/photo');

var middlewareObj = {};

middlewareObj.showApiInfoPage = (req, res) => {
   res.render('api/documentation');
};
//based on https://www.youtube.com/watch?v=3IDlOI0D8-8
middlewareObj.userFuzzyAutoCompleteSearch = async (req, res) => {
   try {
      let userResults = await User.aggregate([
         {
            $search: {
               autocomplete: {
                  query: `${req.query.search}`,
                  path: 'name', // 'bio', 'website'],
                  fuzzy: { maxEdits: 2 },
               },
            },
         },
      ]).toArray();

      req.send(userResults);
   } catch (err) {
      console.log(err);

      //render server
   }
};
/////////////////////
module.exports = middlewareObj;
