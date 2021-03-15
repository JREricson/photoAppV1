const express = require('express');
const router = express.Router();
const { Mongoose, SchemaTypes } = require('mongoose');

//middleware
// const authMidware = require('../middleware/authMiddle');
const userMidware = require('../middleware/userMiddle');
const apiMidware = require('../middleware/apiMiddle');

//mongoDB SchemaTypes
const User = require('../models/user');
const Photo = require('../models/photo');
const { query } = require('express');

////////////////////////////////
//        user route
////////////////////////////////

router.get('/', apiMidware.showApiInfoPage);

router.get('/users/auto', apiMidware.userFuzzyAutoCompleteSearch);

router.get('/users', async (req, res) => {
   const query = req.query;

   //stores of list of all validation functions -- each returns an approval object and an error obj
   let validationFunctions = [
      validateID,
      validateSearch,
      validateBio,
      validateDate,
      validateName,
      validateHomeLocation,
      validateWebsite,
   ];

   //checking queries to pass -- any query that is not approved will be skipped
   //errorList list will keep track off errors encountered that are worthy of reporting to end user
   let { approvedQueries, errorList } = validateQueriesFromFuncList(
      query,
      validationFunctions,
   );
   console.log('------ user validate error list:', errorList);
   console.log('------ user validate aprovals:', approvedQueries);

   //defines functions used to generate queries that will be added to search obj
   let queryFunctions = [
      makeIdSearchObj,
      makeSearchObj, //doubleCheck if correct
      makeBioObj,
      makeDateObj,
      makeNameObj,
      makeHomeLocationObj,
      makeWebsiteObj,
   ];
   //this is a list of names for keys to be be approved -- must be in same order of corresponding function in above list
   let approvalKeys = [
      'id',
      'search',
      'bio',
      'date',
      'name',
      'homeLocation',
      'website',
   ];

   //adding queries to search if approved
   let curSearchObj = generateQueryObjAndErrors(
      query,
      queryFunctions,
      approvedQueries,
      approvalKeys,
   );
   searchObj = { ...searchObj, ...curSearchObj };
   console.log('cur search obj is:', searchObj);

   //setting pagation from queries
   //CAUTION! -- current implementation should be changed as it does not scale well to large searches, but fine for current version of app
   let { page, limit, errorList: pagationErrors } = validatePageAndLimit(query);
   errorList = { ...errorList, ...pagationErrors };
   console.log('page/lim ', page, '/', limit, pagationErrors);

   let usersToSend = [];

   // let approvedKeysFromUerObj = [
   //    '_id',
   //    'name',
   //    'allPhotos',
   //    'socialMediaAcnts',
   //    'website',
   //    'bio',
   //    'homeLocation',
   //    'dateJoined',
   //    'last',
   // ];

   //these are keys that the user is allowed to sort by
   let approvedSortKeys = {
      name: true,

      website: true,
      homeLocation: true,
      dateJoined: true,
   };

   //////////
   //sort method

   let { sortObj, sortErrors } = makeSortObj(query, approvedSortKeys); //this method also runs a validation on user input
   console.log('---------sort obj is: ', sortObj);
   console.log('---------sorterrors are: ', sortErrors);
   errorList = { ...errorList, ...sortErrors };

   let origUsersObj = await User.find(searchObj)
      .collation({ locale: 'en' }) //This can be changed to meet other languages should such a need arise
      .sort(sortObj)
      .skip(page * limit) //will ignore skip when both are null
      .limit(limit); // ignores limit if it is null

   // console.log('orig' + origUsersObj);

   /*pulling only neccesary info from user obj
   purpose to hide hidden info such as passwords or other private info
   */
   origUsersObj.forEach((user, ndx) => {
      let {
         _id,
         name,
         allPhotos,
         socialMediaAcnts,
         website,
         bio,
         homeLocation,
         dateJoined,
      } = user;

      filteredUser = {
         _id,
         name,
         allPhotos,
         socialMediaAcnts,
         website,
         bio,
         homeLocation,
         dateJoined,
      };
      //  console.log('filtered user is :', filteredUser);
      usersToSend.push(filteredUser);
   });
   // console.log(usersToSend);

   // /*adding a 'no users found' message to empty obj */
   // Object.getOwnPropertyNames(usersToSend).length == 0 &&
   //    (usersToSend = { err: 'no users found' }); //TODO--would it be better to send an empty obj?
   let returnJSON = { users: usersToSend, errors: errorList };

   //usersToSendJSON = JSON.parse(JSON.stringify(usersToSend)); //Question -- will work without this line -- is it needed?
   res.json(returnJSON);
});

///////////////////////////////////////////////
//               photo route
///////////////////////////////////////////////
/**
 *
 */
router.get('/photos', async (req, res) => {
   //creating an object that will hold all search queries to database
   //if there are queries present, they wll be added to the search object if there ar no errors
   searchObj = {};

   //extracting query
   let query = req.query;

   //stores of list of all validation functions -- each returns an approval object and an error obj
   let validationFunctions = [
      validateID,
      validateFNumber,
      validateISO,
      validateSearch,
      validateExposure,
      validateUser,
      validateGPS,
      validateDate,
      validateTags,
      validateCaption,
      validateDescription,
   ];

   //checking queries to pass -- any query that is not approved will be skipped
   //errorList list will keep track off errors encountered that are worthy of reporting to end user
   //approvedQueries will be added to generateQueryObjAndErrors function as param

   let { approvedQueries, errorList } = validateQueriesFromFuncList(
      query,
      validationFunctions,
   );

   //lists functions used to generate queries that will be added to search obj
   //will be added to generateQueryObjAndErrors function as param
   let queryFunctions = [
      makeIdSearchObj,
      makeSearchObj,
      makeFNumberObj,
      makeISOObj,
      makeExposureObj,
      makeUserObj,
      makeGPSObj,
      makeDateObj,
      makeTagsObj,
      makeCaptionObj,
      makeDescObj,
   ];
   //this is a list of names for keys to be be approved -- must be in same order of corresponding function in above list
   //will be added to generateQueryObjAndErrors function as param

   let approvalKeys = [
      'id',
      'search',
      'fStop',
      'iso',
      'exposure',
      'user',
      'gps',
      'date',
      'tags',
      'caption',
      'desc',
   ];

   //adding queries to search if approved
   let curSearchObj = generateQueryObjAndErrors(
      query,
      queryFunctions,
      approvedQueries,
      approvalKeys,
   );
   searchObj = { ...searchObj, ...curSearchObj };

   //setting pagation from queries
   //CAUTION! -- current implementation should be changed as it does not scale well to large searches, but fine for current version of app
   let { page, limit, errorList: pagationErrors } = validatePageAndLimit(query);
   errorList = { ...errorList, ...pagationErrors };
   console.log('page/lim ', page, '/', limit, pagationErrors);

   //these are keys that the user is allowed to sort by
   let approvedSortKeys = {
      author: true,
      dateSubmitted: true,
      dateTaken: true,
   };

   //////////
   //sort method

   let { sortObj, sortErrors } = makeSortObj(query, approvedSortKeys); //this method also runs a validation on user input
   console.log('---------sort obj is: ', sortObj);
   console.log('---------sorterrors are: ', sortErrors);
   errorList = { ...errorList, ...sortErrors };

   /*searching database with query and sending JSON back to user*/
   console.log('looking for============>' + JSON.stringify(searchObj));
   let photosObj;
   try {
      photosObj = await Photo.find(
         searchObj /*  {
         projection: { _id: 1, exifMetaData: 1, SubmittedByID: 1 },
      } */,
      )
         .collation({ locale: 'en' })
         .sort(sortObj)
         .skip(page * limit) //will ignore skip when both are null
         .limit(limit); // ignores limit if it is null

      res.json({ photos: photosObj, errors: errorList });
   } catch {
      console.log('probem with query');
      res.json({
         photos: {},
         errors: {
            'unknown errors': 'possible that query was not in excepted format',
         },
      }); //change response to be more compatable with ui????
   }

   // photosObj ? res.json(photosObj) : res.json('error occured');
});

////////////////////////////////
//        helper functions
////////////////////////////////

generateQueryObjAndErrors = (
   query,
   queryFunctions,
   approvedQueries,
   approvalKeys,
) => {
   curSearchObj = {};
   searchObj = {};

   queryFunctions.forEach((func, ndx) => {
      if (approvedQueries[approvalKeys[ndx]]) {
         console.log('----------->key found:', approvalKeys[ndx]);
         curSearchObj = func(query);
         //adding query if aproved
         console.log('cur searchobj is', curSearchObj);
         searchObj = { ...searchObj, ...curSearchObj };
      }
   });

   return searchObj;
};

/**
 * keyAndValApproved
 * @param {*} searchOrdering
 * @param {*} approvedKeysFromUserObj
 * @param {*} key
 * @param {*} val
 */
function keyAndValApproved(searchOrdering, approvedKeysFromUserObj, key, val) {
   approvedSortVals = { acnd: 1, dcnd: -1 };

   if (key in approvedKeysFromUserObj && val in Object.keys(approvedSortVals)) {
      searchOrdering[key] = approvedSortVals[sortObj[key]];
   }
}

/**
 * function used to create obj of min max values in search query
 * @param {*} min min val of query -- inclusive
 * @param {*} max max val of query -- inclusive
 * @returns object to be used in seach query
 */

const createMinMaxQuery = (min, max) => {
   let minNum = Number.parseFloat(min);
   let maxNum = Number.parseFloat(max);

   let queryObj = {};
   //only adding min or max search if present
   minNum && (queryObj = { ...{ $gte: minNum } });
   maxNum && (queryObj = { ...queryObj, ...{ $lte: maxNum } });

   return queryObj;
};

const createDateFromQuery = (dateString) => {
   try {
      let dateAr = dateString.split('-');
      let date = new Date(dateAr[0], dateAr[1] - 1, dateAr[2]);
      return date;
   } catch {
      return null;
   }
};

const validateQueriesFromFuncList = (query, validationFunctions) => {
   let approvedQueries = {};
   let errorList = {};

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
const errorListFromMaxMin = (query, minVal, maxVal, minName, maxName) => {
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
/**
 *
 * @param {*} query
 */

const validateFNumber = (query) => {
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

const validateISO = (query) => {
   let approvedQuery = {};
   let errorList = {};
   if (query.isoMax || query.isoMin) {
      errorList = errorListFromMaxMin(query, 0, 100000, 'isoMin', 'isoMax');

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
         10800, //given val of 3 hr
         'expTimeMin',
         'expTimeMax',
      );

      if (errorList.length > 0) {
         errorList = { exposureErrors: errorList };
      } else {
         approvedQuery = { exposure: true };
      }
   }

   return { approvedQuery, errorList };
};

const validateSearch = (query) => {
   //currently only validates length
   return validateLength(query.search, 'search', 100); //tODO check want this length?
};

const validateID = (query) => {
   return validateLength(query.id, 'id', 30); //ids are about 24 char
};

const validateCaption = (query) => {
   console.log('---=-==--=-=-caption validation');
   return validateLength(query.caption, 'caption', 100);
};

const validateUser = (query) => {
   return validateLength(query.user, 'user', 60);
};

const validateGPS = (query) => {
   errorList = {};
   approvedQuery = {};

   if (query.lat && query.lon && query.dist) {
      //lat in range?
      latErrorList = errorListFromMaxMin(query, -90, 90, 'lat', null);
      console.log('latErrorList:', latErrorList);

      //lon in rang?
      lonErrorList = errorListFromMaxMin(query, -180, 180, 'lon', null);

      //dist in range
      //todo make sure working properly -- s 40,007.863 km at eq is diameter of earth, 20,010
      distErrorList = errorListFromMaxMin(query, 0, 20100, 'dist', null);

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

const validateTags = (query) => {
   //TODO -- this is a stub
   return validateLength(query.tags, 'tags', 150);
};
const validateDescription = (query) => {
   //TODO -- this is a stub
   return validateLength(query.desc, 'desc', 100);
};

// validateSort = (query) => {
//    //TODO -- this is a stub
//    errorList = {};
//    approvedQuery = {};
//    if (query.tags) {
//       approvedQuery = { sort: true };
//    }

//    return { approvedQuery, sortOrder };
// };

/**
 * main reason for validation id to limit large queries
 */
const validatePageAndLimit = (query) => {
   console.log('in pagation function');
   let page = null;
   let limit = null;
   errorList = {};
   pageInt = parseInt(query.page);
   limitInt = parseInt(query.limit);
   if (pageInt <= 10000 && limitInt <= 500) {
      console.log('creating pagation');
      page = pageInt;
      limit = limitInt;
   } else {
      if (query.page || query.limit) {
         errorList = {
            pageLimits: [
               'need page and limit in interger format for pagation. limit must be <=500 and page must be <=10000',
            ],
         };
      }
   }
   return { page, limit, errorList };
};

validateDate = (query) => {
   let errorList = {};
   //let allErrors = [];
   let approvedQuery = {};
   let errorBefore = [];
   let errorAfter = [];

   let { dateAfter, dateBefore } = query;
   if (dateAfter || dateBefore) {
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

//general validation methods
validateLength = (queryParam, queryName, maxChar) => {
   errorList = [];
   approvedQuery = {};
   if (queryParam) {
      //checking search is too long
      if (queryParam && queryParam.length >= maxChar) {
         errorList[`${queryName}Errors`] = [
            `${queryName} string needs to be less than ${maxChar} char`,
         ];
      } else {
         approvedQuery[queryName] = true;
      }
   }
   return { approvedQuery, errorList };
};

///////////////////////////////////////////
//           user validation routes
///////////////////////////////////////////

validateBio = (query) => {
   return validateLength(query.bio, 'bio', 150);
};

validateName = (query) => {
   return validateLength(query.name, 'name', 60);
};
validateHomeLocation = (query) => {
   return validateLength(query.homeLocation, 'homeLocation', 60);
};
validateWebsite = (query) => {
   return validateLength(query.website, 'website', 30);
};

/////////////////////////////////////
//query functions (make<___>Obj functions)
//
//CAUTION! -- all of these functions assume validation for query has passed
/////////////////////////////////////

/**
 * need to make $text index in database for function to work
 */
// makeSearchObj = (query) => {
//    (curSearchObj = { $text: { $search: query.search } }),
//       { score: { $meta: 'textScore' } }; //used for sorting
//    return curSearchObj;
// };

makeSearchObj = (query, pathArray) => {
   curSearchObj = {
      $text: {
         $search: query.search,
      },
   };
   return curSearchObj;
};

makeSortObj = (query, approvedList) => {
   //sort method
   let sortObj = {};

   let sortErrors = {};
   let errorList = [];
   //let approvalErrors = [];

   /*Getting sorting conditions */
   /* CAUTION -- turning user obj string to obj -- be careful with it*/
   //takes in format &sort={"name":"a","dateJoined":"d"}
   if (query.sort) {
      try {
         console.log('-------', query.sort);
         var userSortObj = JSON.parse(query.sort);
         console.log('user.sort=====>', userSortObj);

         // //TODO check if approved

         let { sortObj: approvedSortObj, errors } = validateSearchObj(
            userSortObj,
            approvedList,
         );
         sortObj = approvedSortObj;
         errorList = errors;
      } catch {
         console.log('problem getting keys');
         errorList.push('cannot process sort');
      }
   }
   if (errorList.length > 0) {
      sortErrors['sortErrors'] = errorList;
   }

   console.log('sort errors in makesortobj', sortErrors);
   return { sortObj, sortErrors };
};

validateSearchObj = (userSortObj, approvedList) => {
   sortObj = {};
   errors = [];

   console.log('=========approved keys:', approvedList);
   for (let key in userSortObj) {
      if (approvedList[key]) {
         console.log(`${key} found in approve list`);
         if (userSortObj[key] === '1' || userSortObj[key] === '-1') {
            sortObj[key] = userSortObj[key];
            console.log('key approved');
         } else {
            errors.push(`improper order(${userSortObj[key]}) for key = ${key}`);
            console.log(`improper order for key = ${key}`);
         }
      } else {
         errors.push(`${key} is not approved`);
         console.log(`${key} is not approved`);
      }
      console.log('key ' + key + ' has value ' + userSortObj[key]);
   }

   console.log('errors in search validate are: ', errors);

   return { sortObj, errors };
};

const makeFNumberObj = (query) => {
   curSearchObj = {
      'exifMetaData.FNumber': createMinMaxQuery(
         query.fNumberMin,
         query.fNumberMax,
      ),
   };

   return curSearchObj;
};
const makeISOObj = (query) => {
   curSearchObj = {
      'exifMetaData.ISO': createMinMaxQuery(query.isoMin, query.isoMax),
   };
   return curSearchObj;
};

const makeExposureObj = (query) => {
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

const makeUserObj = (query) => {
   /*search user*/
   curSearchObj = {
      author: {
         $regex: `${query.user}`,
         $options: 'i', // i - ignore case
      },
   };
   return curSearchObj;
};

const makeNameObj = (query) => {
   /*search user*/
   curSearchObj = {
      name: {
         $regex: `${query.name}`,
         $options: 'i', // i - ignore case
      },
   };
   return curSearchObj;
};
const makeDescObj = (query) => {
   curSearchObj = {
      description: {
         $regex: `${query.desc}`,
         $options: 'i', // i - ignore case
      },
   };
   return curSearchObj;
};

const makeGPSObj = (query) => {
   let lat = parseFloat(query.lat),
      lon = parseFloat(query.lon);
   //turning m to km -- mongo searches my meters
   dist = parseFloat(query.dist) * 1000;

   curSearchObj = {
      location_2dsphere: {
         $near: {
            $geometry: {
               type: 'Point',
               //geoJSON uses long, lat format
               coordinates: [lon, lat],
            },
            //searches by meter within coord
            $maxDistance: dist,
         },
      },
   };
   //below is the "null value" used as a work around--a better work around miht be a GPS set flag
   curSearchObj['location_2dsphere.coordinates'] = {
      $not: { $eq: [-139, -30] },
   };

   return curSearchObj;
};

const makeDateObj = (query) => {
   //might entering 2020-11-32 might create a valid date obj --does not handle all improper dates
   //accepted yyyy-mm-dd only for now
   let dateAfter = query.dateAfter,
      dateBefore = query.dateBefore;

   try {
      //create seperate query for search for single date
      let endDate;
      let startDate;

      if (dateBefore === dateAfter) {
         //search single date
         console.log('singledate');
         startDate = createDateFromQuery(dateBefore);

         //creating end date 1 day after start date (gets 24 hr interval in searxh)
         endDate = new Date(startDate);
         endDate.setDate(endDate.getDate() + 1);
      } else {
         //searching for range between dates
         dateAfter && (startDate = createDateFromQuery(dateAfter));
         dateBefore && (endDate = createDateFromQuery(dateBefore));
      }
      //creating obj to hold date searches only if val is present
      let dateSearch = {};
      startDate && (dateSearch = { $gte: startDate });
      endDate && (dateSearch = { ...dateSearch, ...{ $lte: endDate } });
      //adding date search to search obj
      curSearchObj = { dateTaken: dateSearch };
   } catch {
      console.log('invalid date entered'); //TODO -send error to user
      curSearchObj = {};
   }
};

makeTagsObj = (query) => {
   searchtags = query.tags.split(' ');
   console.log(searchtags);
   curSearchObj = { tags: { $all: searchtags } };
   return curSearchObj;
};

makeIdSearchObj = (query) => {
   return { _id: query.id };
};

const makeCaptionObj = (query) => {
   console.log('---=-==--=-=-caption obj being made');
   return makeRegexSearchObj(query.caption, 'caption');
};

makeBioObj = (query) => {
   return makeRegexSearchObj(query.bio, 'bio');
};

makeHomeLocationObj = (query) => {
   return makeRegexSearchObj(query.homeLocation, 'HomeLocation');
};
makeWebsiteObj = (query) => {
   return makeRegexSearchObj(query.website, 'website');
};

const makeRegexSearchObj = (queryParam, queryName) => {
   curSearchObj = {};
   curSearchObj[queryName] = {
      $regex: `${queryParam}`,
      $options: 'i', // i - ignore case
   };

   return curSearchObj;
};

/////////////////////////////
/////////////////////////////
module.exports = router;
