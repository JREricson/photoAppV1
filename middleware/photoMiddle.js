// TODO -- insconsistancies with id vs ID -- fix

const User = require('../models/user');
const Photo = require('../models/photo');

var middlewareObj = {};

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
         } else if (!contentOwner.allPhotos) {
            //I believe below should fix error in TODO above
            //rejecting promise in the event that the photo had been deleted during session
            reject;
         } else {
            photos = contentOwner.allPhotos; //TODO -- check to make sure there is a conent owner contentowner &&

            resolve(photos);
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
middlewareObj.ASYNCgetOwnerPhotoObjs = (req, res, idList) => {
   var photoList = [];
   var photoIDs;
   return new Promise(async (resolve, reject) => {
      //checking current user if no photo idList provided

      //console.log('checking for null id list');
      if (idList === null) {
         try {
            console.log(' ^^^^^^^^^^^^^null id list');
            photoIDs = await middlewareObj.ASYNCgetOwnerPhotoIds(req, res);
            //TODO handle errors
            //  console.log(' ids are : ' + photoIds);
         } catch {
            console.log('ERR-- could not get photo ids from user');
            reject; // TODO maybe resolve as null
         }
      } else {
         //list was provided
         photoIDs = idList;
      }
      //  console.log('--------------\ncur p list' + photoIds);

      photoIDs.forEach(async (photoID) => {
         var newPhoto = await middlewareObj.ASYNCgetPhotoObjFromId(photoID);
         //   console.log('new photo is: ' + newPhoto);
         //only adding photos that can be found
         if (newPhoto != null) {
            photoList.push(newPhoto);
         }
      });

      //   console.log('PhotoList is :' + photoList);

      resolve(photoList);
   });
};

middlewareObj.ASYNCgetPhotoObjFromId = (id) => {
   return new Promise((resolve, reject) => {
      Photo.findById(id, (err, foundPhoto) => {
         if (err) {
            console.log('ERR---could not find photo-- \n' + err);
            resolve(null);
         } else {
            //console.log('photoFound' + foundPhoto);
            resolve(foundPhoto);
         }
      });
   });
};
// middlewareObj.getUserPhotos = (req, res) => {
//    return new Promise((resolve, reject) => {
//       $.getJSON({
//          url: getLocationURL(user.location.split(',')),
//          success(weather) {
//             resolve({ user, weather: weather.query.results });
//          },
//          error: reject,
//       });
//    });
// };

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
      //console.log('??????????????desciption is: --- ' + description[0]);
      Photo.findByIdAndUpdate(
         id,
         {
            // author: req.user.name, TODO -- fix line
            description: description[ndx],
            caption: caption[ndx],
            dateTaken: dateTaken[ndx],
            tags: middlewareObj.getTagsFromString(tagString[ndx]),
            longitude: longitude[ndx],
            latitude: latitude[ndx],
         },
         (err, updatedPhoto) => {
            if (err) {
               console.log(err);
            }
         },
      );
      // console.log(id + '---' + description);
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
      coodLong = parseFloat(longitude);
      coordLat = parseFloat(latitude);
   } else {
      //woork around null value -- in pacific ocean
      coodLong = -139;
      coordLat = -30;

      updateObj = {
         ...updateObj,
         ...{
            location_2dsphere: {
               type: 'Point',
               //geoJSON stores as [long, lat]
               coordinates: [coodLong, coordLat],
            },
         },
      };
   }

   Photo.findByIdAndUpdate(
      photoId,
      updateObj,
      // {
      //    // author: req.user.name,
      //    description: description,
      //    caption: caption,
      //    dateTaken: dateTaken,
      //    tags: middlewareObj.getTagsFromString(tagString),
      //    longitude: longitude,
      //    latitude: latitude,
      // },
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

////////////////////
//method for removal
////////////////////
//\

/**
 * removePhotosOnly
 *
 * remove all photo obj from PhotoIDs
 * @param {*} photoIDList
 */
middlewareObj.removePhotosOnly = (photoIDList) => {
   photoIDList.forEach((photoID) => {
      middlewareObj.removePhotoOnly(photoID);
   });
};

//remove photo obj from PhotoID
middlewareObj.removePhotoOnly = (photoID) => {
   Photo.findByIdAndRemove(photoID, function (err) {
      if (err) {
         console.log('error removing photo \n' + err);
      }
   });
};

// TODO --  need to rewrite to include galleries or any other list

/**
 * should only get tho this point if there is a user defined (user has an empty all photos list by default)
 */
middlewareObj.removePhotoFromUsersLists = (photoID, user) => {
   if (user.allPhotos.includes(photoID)) {
      console.log('deleting' + photoID + 'from allPhotos');
      user.allPhotos.remove(photoID);
   } else {
      console.log(photoID + ' not found in allphotos');
   }
};

middlewareObj.removePhotoAndRefernences = (req, res) => {
   //removing photo from user's lists (allPhotos, galleries, etc)
   middlewareObj.removePhotoFromUsersLists(req.params.photoID, req.user);
   //removing photo
   middlewareObj.removePhotoOnly(req.params.photoID);
};

///////////////////////////////
//methods for rendering page

middlewareObj.renderPageWithUserAndPhoto = async (
   req,
   res,
   pagePath,
   objOfValToBeSent,
) => {
   //getting user and photo objs

   photo = await middlewareObj.ASYNCgetPhotoObjFromId(req.params.photoID);

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

module.exports = middlewareObj;
