const express = require('express');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');

//middleware
// const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');

//mongoDB SchemaTypes
const User = require('../models/user');
const Photo = require('../models/photo');
const { query } = require('express');

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

///////////////////////////////////////////////
//photo route
///////////////////////////////////////////////
router.get('/photos', async (req, res) => {
   //creating an object that will hold all search queries to database
   //if there are queries present, they wll be added to the search object if there ar no errors
   searchObj = {};

   let query = req.query;

   //checking queries to pass
   //errorList list will keep track off errors encountered that are worthy of reporting to end user
   let { approvedQueries, errorList } = validatePhotoQueries(query);

   /*extracting search terms from query*/
   //search content = { ...{ name: query.name } } $text: { $search: searchQuery }

   let queryFunctions = [
      makeSearchObj,
      makeFNumberObj,
      makeISOObj,
      makeExposureObj,
      makeUserObj,
   ];
   let approvalKeys = [
      'search',
      'fStop',
      'iso',
      'exposure',
      'user' /* 'gps', 'date', 'tags'*/,
      ,
   ];
   let curSearchObj = {};
   queryFunctions.forEach((func, ndx) => {
      if (approvedQueries[approvalKeys[ndx]]) {
         console.log('----------->key found:', approvalKeys[ndx]);
         curSearchObj = func(query);
         //adding query if aproved
         searchObj = { ...searchObj, ...curSearchObj };
      }
   });

   //query.search && (searchObj = { ...{ $text: { $search: query.search } } });

   //search will fail and crash server without try catch

   /*search GPS */
   //need to create 2d sphere index in mongo for function to work
   if (query.lat && query.lon && query.dist) {
      let lat = parseFloat(query.lat),
         lon = parseFloat(query.lon);
      //turning km to m -- mongo searches my meters
      dist = parseFloat(query.dist) * 1000;

      gpsSearch = {
         location_2dsphere: {
            $near: {
               $geometry: {
                  type: 'Point',
                  //geoJSON uses long, lat format
                  coordinates: [lon, lat],
               },
               //searches by meter within coord
               $maxDistance: dist,
               // $minDistance: <distance in meters>
            },
         },
      };

      searchObj = {
         ...searchObj,
         ...gpsSearch,
      };
   }

   // {
   //    <location field>: {
   //      $near: {
   //        $geometry: {
   //           type: "Point" ,
   //           coordinates: [ <longitude> , <latitude> ]
   //        },
   //        $maxDistance: <distance in meters>,
   //        $minDistance: <distance in meters>
   //      }
   //    }
   // }

   //search tags

   if (query.tags) {
      searchtags = query.tags.split(' ');
      searchObj = { ...searchObj, ...{ tags: { $in: searchtags } } };
   }

   //search date

   //
   //accepted yyyy-mm-dd only for now
   let dateAfter = query.dateAfter,
      dateBefore = query.dateBefore;
   if (dateAfter || dateBefore) {
      try {
         //create seperate query for search for single date
         let endDate;
         let startDate;

         if (dateBefore === dateAfter) {
            //search single date
            console.log('singledate');
            startDate = createDateFromQuery(dateBefore);
            console.log(startDate);

            //creating end date 1 day after start date
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            console.log(startDate);
            console.log(endDate);
         } else {
            //searching for range between dates
            console.log('between dates\n');
            dateAfter && (startDate = createDateFromQuery(dateAfter));
            dateBefore && (endDate = createDateFromQuery(dateBefore));
         }
         //creating obj to hold date searches only if val is present
         let dateSearch = {};
         startDate && (dateSearch = { $gte: startDate });
         endDate && (dateSearch = { ...dateSearch, ...{ $lte: endDate } });
         //adding date search to search obj
         searchObj = {
            ...searchObj,
            ...{ dateTaken: dateSearch },
         };
      } catch {
         console.log('invalid date entered');
      }
   }

   //cast to date

   /*
finding all values with query
*/
   console.log('looking for============>' + JSON.stringify(searchObj));
   let photosObj;
   try {
      photosObj = await Photo.find(
         searchObj,

         // [andQueries]//searchQuery$text: { $search: 'j' }
      ).sort();
      res.json({ photos: photosObj, errors: errorList });
   } catch {
      console.log('problem with query');
      res.json('error occured');
   }

   // photosObj ? res.json(photosObj) : res.json('error occured');
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

/**
 * function used to create obj of min max values in search query
 * @param {*} min min val of query -- inclusive
 * @param {*} max max val of query -- inclusive
 * @returns object to be used in seach query
 */

function createMinMaxQuery(min, max) {
   let minNum = Number.parseFloat(min);
   let maxNum = Number.parseFloat(max);

   let queryObj = {};
   //only adding min or max search if present
   minNum && (queryObj = { ...{ $gte: minNum } });
   maxNum && (queryObj = { ...queryObj, ...{ $lte: maxNum } });

   return queryObj;
}

function createDateQuery(yearMin, yearMax, monthMax, monthMin, dayMax, dayMin) {
   //exact
   //date
   //y-m-d
   //just year
}

function createDateFromQuery(dateString) {
   try {
      let dateAr = dateString.split('-');
      let date = new Date(dateAr[0], dateAr[1] - 1, dateAr[2]);
      return date;
   } catch {
      return null;
   }
}

validatePhotoQueries = (query) => {
   let approvedQueries = {};
   let errorList = {};
   //stores of list of all validation functions
   let validationFunctions = [
      ValidateFNumber,
      ValidateISO,
      validateSearch,
      validateExposure,
      validateUser,
      validateGPS,
      validateDate,
      validateTags,
   ];

   //
   validationFunctions.forEach((func) => {
      let { approvedQuery, errorList: eList } = func(query);
      //adding query if aproved
      approvedQueries = { ...approvedQueries, ...approvedQuery };
      //adding errors to list for user
      errorList = { ...errorList, ...eList }; // run your function
   });

   console.log('final errorlist: ', errorList);
   console.log('approved queries: ', approvedQueries);

   /*validating tags*/

   return { approvedQueries, errorList };
};

/**
 * generates error list if conditions not met
 * misses some cases for example ?fNumberMin=27777fNumberMax=yuio, fNumberMin is parsed as 27777
 * @param {*} min  -- min value to look for
 * @param {*} max -- max value to look for
 * @param {*} minVal -- min accepted value
 * @param {*} maxVal -- max accepted value
 * @param {*} minName -- name of min val for error string
 * @param {*} maxName -- name of max val for error string
 */
errorListFromMaxMin = (query, minVal, maxVal, minName, maxName) => {
   //pulling query vaues from query if present
   let min = eval(`query.${minName}`),
      max = eval(`query.${maxName}`);

   console.log('in func', max, '-- ', min, maxName, minName);
   errors = [];
   //checking if NAN
   if (min || max) {
      if (min && isNaN(parseFloat(min))) {
         errors.push(`${minName} is NAN`);
      }
      if (max && isNaN(parseFloat(max))) {
         console.log('nan');
         errors.push(`${maxName} is NAN`);
      }

      ////check between num limits
      if (min && (min > maxVal || min < minVal)) {
         errors.push(
            `${minName} out of range, min val is ${minVal}, max val is ${maxVal}`,
         );
      }
      if (max && (max > maxVal || max < minVal)) {
         errors.push(
            `${maxName} out of range, min val is ${minVal}, max val is ${maxVal}`,
         );
      }
   }

   console.log('errors: ', errors);
   return errors;
};

ValidateFNumber = (query) => {
   let approvedQuery = {};
   let errorList = {};

   //code is only executed if one of queries present
   if (query.fNumberMax || query.fNumberMin) {
      //checking for errors
      errorList = errorListFromMaxMin(
         query,
         0,
         200,
         'fNumberMin',
         'fNumberMax',
      );
      //returning errors or approval
      if (errorList.length > 0) {
         errorList = { fStopErrors: errorList };
      } else {
         approvedQuery = { fStop: true };
      }
   }

   return { approvedQuery, errorList };
};

ValidateISO = (query) => {
   let approvedQuery = {};
   let errorList = {};
   if (query.isoMax || query.isoMin) {
      errorList = errorListFromMaxMin(query, 0, 50000, 'isoMin', 'isoMax');

      if (errorList.length > 0) {
         errorList = { isoErrors: errorList };
      } else {
         approvedQuery = { iso: true };
      }
   }

   return { approvedQuery, errorList };
};

validateExposure = (query) => {
   let approvedQuery = {};
   let errorList = {};
   if (query.expTimeMin || query.expTimeMax) {
      //note: expousre time is in seconds
      errorList = errorListFromMaxMin(
         query,
         0,
         10800,
         'expTimeMin',
         'expTimeMax',
      ); //given val of 3 hr

      if (errorList.length > 0) {
         errorList = { exposureErrors: errorList };
      } else {
         approvedQuery = { exposure: true };
      }
   }

   return { approvedQuery, errorList };
};

validateSearch = (query) => {
   errorList = {};
   approvedQuery = {};
   if (query.search) {
      //checking search is too long
      maxChar = 300;
      if (query.search && query.search.length > maxChar) {
         errorList = {
            searchErrors: [
               `search string needs to be less than ${maxChar} char`,
            ],
         };
      } else {
         approvedQuery = { search: true };
      }
   }
   return { approvedQuery, errorList };
};

validateUser = (query) => {
   errorList = {};
   approvedQuery = {};

   //checking user string is too long
   if (query.user) {
      maxChar = 60;
      if (query.user && query.user.length > maxChar) {
         errorList = {
            searchErrors: [`user string needs to be less than ${maxChar} char`],
         };
      } else {
         approvedQuery = { user: true };
      }
   }

   return { approvedQuery, errorList };
};

validateGPS = (query) => {
   errorList = {};
   approvedQuery = {};

   if (query.lat && query.lon && query.dist) {
      //lat in range?
      latErrorList = errorListFromMaxMin(query, -90, 90, 'lat', null);
      console.log('latErrorList:', latErrorList);

      //lon in rang?
      lonErrorList = errorListFromMaxMin(query, -180, 180, 'lon', null);

      //dist in range
      //todo make sure working properly -- 6400 should give all photos on earth
      distErrorList = errorListFromMaxMin(query, 0, 6400, 'dist', null); //diameter of earth is 6378km

      //adding all errors to single errorlist

      //checking user string is too long
      let allErrors = []
         .concat(latErrorList)
         .concat(lonErrorList)
         .concat(distErrorList);
      if (allErrors.length > 0) {
         errorList = {
            GPSErrors: allErrors,
         };
      } else {
         approvedQuery = { gps: true };
      }
   } else if (query.lat || query.lon || query.dist) {
      errorList = {
         GPSErrors: ['need lat, lon, and dist queries for GPS search'],
      };
   }

   return { approvedQuery, errorList };
};

validateTags = (query) => {
   //TODO -- this is a stub
   errorList = {};
   approvedQuery = {};
   if (query.tags) {
      approvedQuery = { tags: true };
   }

   return { approvedQuery, errorList };
};

validateDate = (query) => {
   let errorList = {};
   //let allErrors = [];
   let approvedQuery = {};
   let errorBefore = [];
   let errorAfter = [];

   let { dateAfter, dateBefore } = query;
   if (dateAfter || dateBefore) {
      //TODO-- add regex for validation ^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$
      let validDate = new RegExp(
         '^\\d{4}\\-(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])$',
      );
      //check date before
      if (dateBefore) {
         //testing before
         let beforeValid = validDate.test(dateBefore);

         if (!beforeValid) {
            errorBefore = [
               'dateBefore not valid --  enter in yyyy-mm-dd format',
            ];
         }
      }
      //check date after
      if (dateAfter) {
         //testing before
         let afterValid = validDate.test(dateAfter);

         if (!afterValid) {
            errorAfter = ['dateAfter not valid --  enter in yyyy-mm-dd format'];
         }
      }

      //adding all errors to single array
      let allErrors = [].concat(errorAfter).concat(errorBefore);

      //returnng errors if present or approved if not errors
      if (allErrors.length > 0) {
         errorList = {
            dateErrors: allErrors,
         };
      } else {
         approvedQuery = { date: true };
      }
   }

   return { approvedQuery, errorList };
};
/////////////////////////////////////
//query functions
//
//Note! -- all of these functions assume validation for query has passed
/////////////////////////////////////

/**
 * need to make $text index in database for function to work
 */
makeSearchObj = (query) => {
   curSearchObj = { $text: { $search: query.search } };
   return curSearchObj;
};

makeFNumberObj = (query) => {
   curSearchObj = {
      'exifMetaData.FNumber': createMinMaxQuery(
         query.fNumberMin,
         query.fNumberMax,
      ),
   };

   return curSearchObj;
};
makeISOObj = (query) => {
   curSearchObj = {
      'exifMetaData.ISO': createMinMaxQuery(query.isoMin, query.isoMax),
   };
   return curSearchObj;
};

makeExposureObj = (query) => {
   /*search exposureTime*/
   //accept num only-- TODO - autosuggest from  on frontend

   curSearchObj = {
      'exifMetaData.ExposureTime': createMinMaxQuery(
         query.expTimeMin,
         query.expTimeMax,
      ),
   };
   return curSearchObj;
};

makeUserObj = (query) => {
   /*search user*/
   curSearchObj = { author: { $regex: `${query.user}` } };
   return curSearchObj;
};

/////////////////////////////
/////////////////////////////
module.exports = router;
