const express = require('express');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');

//middleware
// const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');

//mongoDB SchemaTypes
const User = require('../models/user');
const Photo = require('../models/photo');

// router.get('/users', (req, res) => {
//    var userJSON = { test: 'test' };

//    res.json(userJSON);
// });

router.get('/users', async (req, res) => {
   let nameOrder, dateSubOrder, date, sortOrder;

   let searchQuery = '';
   const query = req.query;
   let andQueries = {};
   let searchOrdering = {};
   let usersToSend = [];

   approvedKeys = [
      '_id',
      'name',
      'allPhotos',
      'socialMediaAcnts',
      'website',
      'bio',
      'homeLocation',
      'datejoined',
   ];

   /*getting sort order -- set to accending by defualt */

   // NOTE -- could sort on multiple param n a later version

   /* adding queries if present*/
   query.name && (andQueries = { ...{ name: query.name } });
   query.bio && (andQueries = { ...{ bio: query.bio } });
   query.search && (searchQuery = query.search);

   console.log('allQueries: ' + JSON.stringify(andQueries));

   //////////
   //sort method

   /*Getting sorting conditions */
   /* CAUTION -- turning user obj string to obj -- be careful with it*/
   //takes in format &sort={"name":"1","datjoined":"-1"}
   // if (query.sort) {
   //    try {
   //       console.log(query.sort);
   //       var sortObj = JSON.parse(query.sort);
   //       console.log(sortObj);

   //       for (let key in sortObj) {
   //          console.log('key ' + key + ' has value ' + sortObj[key]);

   //          // //TODO check if approved
   //          keyAndValApproved(searchOrdering, approvedKeys, key, val);
   //          //searchOrdering[key] = sortObj[key];
   //       }
   //       console.log('!!!!!no probs' + JSON.stringify(searchOrdering));
   //    } catch {
   //       console.log('problem getting keys');
   //    }
   // }

   //TODOs
   //date range submitted and posted
   //photos in radius of location
   //all searchable text -- with quotes
   //sort order -- date posted, date submitted, name, relevance, reverse order?

   let origUsersObj = await User.find(
      // { $text: { $search: 'j' } },
      {
         $text: { $search: searchQuery },
         //  $and: [andQueries]
      }, // [andQueries]//searchQuery$text: { $search: 'j' }
   ).sort();

   // console.log('orig' + origUsersObj);

   /*pulling only neccesary info from user obj*/
   origUsersObj.forEach((user, ndx) => {
      let {
         _id,
         name,
         allPhotos,
         socialMediaAcnts,
         website,
         bio,
         homeLocation,
         datejoined,
      } = user;

      filteredUser = {
         _id,
         name,
         allPhotos,
         socialMediaAcnts,
         website,
         bio,
         homeLocation,
         datejoined,
      };
      usersToSend.push(filteredUser);
   });
   console.log(usersToSend);

   // /*adding a 'no users found' message to empty obj */
   // Object.getOwnPropertyNames(usersToSend).length == 0 &&
   //    (usersToSend = { err: 'no users found' }); //TODO--would it be better to send an empty obj?

   usersToSendJSON = JSON.parse(JSON.stringify(usersToSend)); //Question -- will work without this line -- is it needed?
   res.json(usersToSendJSON);
});

router.get('/photos', async (req, res) => {
   let query = req.query;
   query.search && (searchQuery = query.search);

   let photosObj = await Photo.find(
      // { $text: { $search: 'j' } },
      {
         $text: { $search: searchQuery },
         //  $and: [andQueries]
      }, // [andQueries]//searchQuery$text: { $search: 'j' }
   ).sort();

   photosObj ? res.json(photosObj) : res.json('error occured');
});

///////////////////////
//helper functions
///////////////////////

/**
 * keyAndValApproved
 * @param {*} searchOrdering
 * @param {*} approvedKeys
 * @param {*} key
 * @param {*} val
 */
function keyAndValApproved(searchOrdering, approvedKeys, key, val) {
   approvedSortVals = { acnd: 1, dcnd: -1 };

   if (key in approvedKeys && val in Object.keys(approvedSortVals)) {
      searchOrdering[key] = approvedSortVals[sortObj[key]];
   }
}

module.exports = router;
