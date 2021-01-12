// TODO -- insconsistancies with id vs ID -- fix

const User = require('../models/user');
const Photo = require('../models/photo');

var middlewareObj = {};

const fetch = require('node-fetch');
const querystring = require('querystring');
const { findById } = require('../models/user');

const photoMethods = require('../databaseFunctions/photoMethods');

middlewareObj.updatePhotos = (req, res, photos, objOfThingsToUpdate) => {};

//////////////////////////////////
//Methods for finding information
//////////////////////////////////

//TODO possibility that photo ID might not link to image if photo obj is deleted-- need to account for this
middlewareObj.ASYNCgetOwnerPhotoIds = (req, res) => {
   return new Promise((resolve, reject) => {
      User.findById(req.params.id, (err, contentOwner) => {
         if (err) {
            console.log(err);
            reject;
         } else if (!contentOwner) {
            res.render('404');
            //I believe below should fix error in TODO above
            //rejecting promise in the event that the photo had been deleted during session
            reject;
         } else if (contentOwner) {
            photos = contentOwner.allPhotos;
            console.log('photos from midware -->', photos.length);
            resolve(photos);
         } else {
            reject;
         }
      });
   });
};

middlewareObj.getPageOwnerPhotoIds = (req, res) => {
   User.findById(req.params.id, (err, contentOwner) => {
      if (err) {
         console.log(err);
         return null;
      } else {
         photos = contentOwner.allPhotos;
         return photos; //might be why wrapped
      }
   });
};

//set idList to null to use find from current user

middlewareObj.ASYNCgetOwnerPhotoObjs = async (req, res, idList) => {
   var photoList = [];
   var photoIds;
   //checking current user if no photo idList provided
   if (idList === null) {
      try {
         photoIds = await middlewareObj.ASYNCgetOwnerPhotoIds(req, res);
      } catch {
         console.log('ERR-- could not get photo ids from user');
         return null; // TODO maybe resolve as null
      }
   } else {
      //list was provided
      photoIds = idList;
   }

   photoList = await photoMethods.getPhotoListFromPhotoIds(photoIds);

   console.log(
      'PhotoList is(from ASYNCgetOwnerPhotoObjs ) :' + photoList.length,
   );

   return photoList;
};

//////////////////
//methods for updating
middlewareObj.updatePhotosFromEjsData = (req) => {
   const { photoId } = req.body;

   if (Array.isArray(photoId)) {
      //body parser will make a list if more than one-- checking for list first
      middlewareObj.updateAllPhotos(req);
   } else {
      //ejs should have returned a single item and not an array
      try {
         console.log('\n\n!!!!!!!!!!!!updating single');
         middlewareObj.updateSinglePhoto(req);
      } catch {
         console.log('err updating files');
      }
   }
};

middlewareObj.updateAllPhotos = (req) => {
   const {
      photoId,
      description,
      caption,
      dateTaken,
      longitude,
      latitude,
      tagString,
   } = req.body;

   photoId.forEach((id, ndx) => {
      updateObj = {
         // author: req.user.name, TODO -- fix line
         description: description[ndx],
         caption: caption[ndx],
         dateTaken: dateTaken[ndx],
         tags: middlewareObj.getTagsFromString(tagString[ndx]),
         longitude: longitude[ndx],
         latitude: latitude[ndx],
      };

      (updateObj = {
         ...updateObj,
         ...photoMethods.makeGeoJSONObj(latitude, longitude),
      }),
         Photo.findByIdAndUpdate(id, updateObj, (err, updatedPhoto) => {
            if (err) {
               console.log(err);
            }
         });
   });
};

middlewareObj.updateSinglePhoto = (req) => {
   const {
      photoId,
      description,
      caption,
      dateTaken,
      longitude,
      latitude,
      tagString,
   } = req.body;

   console.log('///za caption is' + caption);

   let updateObj = {
      // author: req.user.name,
      description: description,
      caption: caption,
      dateTaken: dateTaken,
      tags: middlewareObj.getTagsFromString(tagString),
      longitude: longitude,
      latitude: latitude,
   };

   //adding location_2dsphere only if long and lat are present
   let coordLong, coordLat;
   if (latitude && longitude) {
      coordLong = parseFloat(longitude);
      coordLat = parseFloat(latitude);
   } else {
      //work around null value -- in pacific ocean
      coordLong = -139;
      coordLat = -30;
   }

   (updateObj = {
      ...updateObj,
      ...photoMethods.makeGeoJSONObj(latitude, longitude),
   }),
      Photo.findByIdAndUpdate(
         photoId,
         updateObj,

         (err, updatedPhoto) => {
            if (!updatedPhoto) {
               console.log('\n\n!!!!!!!could not update'); //Delete
               console.log(err);
            } else {
               console.log('\n\n/////// updated Photo\n' + updatedPhoto); //Delete
            }
         },
      );
};

////////////////////////////////
//methods for photo components
//////////////////////////////////

middlewareObj.getTagsFromString = (tagString) => {
   /*splitting string -- note - the boolean filter gets rid of empty strings */
   let tagList = tagString.split(/[ ,;]+/).filter(Boolean);
   /*removing gross # that users will probably add, can add other items here as well if the need arrises*/
   return tagList;
};

// TODO --  need to rewrite to include galleries or any other list

///////////////////////////////
//methods for rendering page

middlewareObj.renderMapPage = async (req, res) => {
   //esentialy same code as all photos page -- TODO refactor!!!!
   searchObj = {};

   console.log('query is:', querystring.stringify(req.query));

   //TODO-- make env variable
   let server = 'http://localhost:3001';

   //getting photo obj from api
   let photoRes = await fetch(
      `${server}/api/photos/?${querystring.stringify(req.query)}`,
   );
   //will be photo objs sent to user-- empty by default
   let photosFound = {};
   //if ok, generating JSON
   if (photoRes.ok) {
      photoJSON = await photoRes.json();

      //only sending photos if there are no errors -- API skips over queries that generate errors when returning results
      if (photoJSON.photos && Object.keys(photoJSON.errors).length === 0) {
         photosFound = photoJSON.photos;
         console.log('---------->>>photosFound', photosFound);
      }
   } else {
      photosFound = {}; //await Photo.find(searchObj);
      console.log('problem getting photos');
   }

   res.render('photos/map', { photosFound });
};

middlewareObj.renderPageWithUserAndPhoto = async (
   req,
   res,
   pagePath,
   objOfValToBeSent,
) => {
   //getting user and photo objs
   console.log('photo id is ', req.params.photoID);
   let photo = await photoMethods.ASYNCgetPhotoObjFromId(req.params.photoID);
   console.log('photo is: ', photo);

   if (photo) {
      //photo found so rendering page with values for ejs doc
      currentUser = req.user;
      let vals = { ...{ photo, currentUser }, ...objOfValToBeSent };

      res.render(pagePath, vals);
   } else {
      //send 404 if no photo with ID
      res.status(404).render('404');
   }
};

middlewareObj.loadAllPhotosPage = async (req, res) => {
   var query = req.query;

   searchObj = {};

   console.log('query is:', querystring.stringify(req.query));

   //TODO-- make env variable
   let server = 'http://localhost:3001';

   //getting photo obj from api
   let photoRes = await fetch(
      `${server}/api/photos/?${querystring.stringify(req.query)}`,
   );
   //will be photo objs sent to user-- empty by default
   let photosFound = {};
   //if ok, generating JSON
   if (photoRes.ok) {
      photoJSON = await photoRes.json();
      //  console.log('photoJSON %%%%%%%%%%%%%%%%%%%%%%%=>', photoJSON);
      //only sending photos if there are no errors -- API skips over queries that generate errors when returning results
      if (photoJSON.photos && Object.keys(photoJSON.errors).length === 0) {
         photosFound = photoJSON.photos;
         console.log('---------->>>photosFound', photosFound);
      }
   } else {
      photosFound = {}; //await Photo.find(searchObj);
      console.log('problem getting photos');
      // imgElement += '<h2>No photos added</h2>';
   }

   //////////////////////

   /*search criteria will be added to searchObj if found in query*/
   // query.search && (searchObj['$text'] = { $search: query.search }); ////
   // query.search && (searchObj['$tags'] = { $search: query.tags }); ////

   //console.log('searchObj is now ' + searchObj);

   // let photosList = await Photo.find(searchObj);
   res.render('photos/allPhotos', { photosFound });
};

middlewareObj.removePhotoAndRefernences = (req, res, next) => {
   //removing photo from user's lists (allPhotos, galleries, etc)
   photoMethods.removePhotoFromUsersLists(req.params.photoID, req.user);

   console.log('req.user is', req.user);
   //removing photo
   photoMethods.removeSinglePhotoFromDBAndFS(req.params.photoID);
   next();
};

////////////////////////////////
module.exports = middlewareObj;
