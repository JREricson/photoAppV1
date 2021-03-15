const User = require('../models/user');
// const Photo = require('../models/photo');

var middlewareObj = {};

middlewareObj.showApiInfoPage = (req, res) => {
   res.render('api/documentation');
};
//based on https://www.youtube.com/watch?v=3IDlOI0D8-8
middlewareObj.userFuzzyAutoCompleteSearch = async (req, res) => {
   try {
      let userResults;
      if (req.query.search) {
         userResults = await User.aggregate([
            {
               $search: {
                  index: 'userFuzzyAuto',

                  autocomplete: {
                     query: `${req.query.search}`,
                     path: ['bio'],
                     fuzzy: { maxEdits: 2 },
                  },

                  // compound: {
                  //    should: [

                  //          autocomplete: {
                  //             query: `${req.query.search}`,
                  //             path: 'bio',
                  //             fuzzy: { maxEdits: 2 },
                  //          },
                  //          autocomplete: {
                  //             query: `${req.query.search}`,
                  //             path: 'website',
                  //             fuzzy: { maxEdits: 2 },
                  //          },
                  //       },
                  //    ],
                  // },
               },
            },
         ]); //.toArray();
      } else {
         userResults = [];
      }

      res.send(userResults);
   } catch (err) {
      console.log(err);

      //render server
   }
};
/////////////////////
module.exports = middlewareObj;
