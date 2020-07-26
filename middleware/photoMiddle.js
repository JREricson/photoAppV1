// TODO -- insconsistancies with id vs ID -- fix

const User = require('../models/user');
const Photo = require('../models/photo');

var middlewareObj = {};

middlewareObj.updatePhotos = (req, res, photos, objOfThingsToUpdate) => {};

/////////////////////
//Methods for finding information

//TODO possibility that photo ID might not link to image if photo obj is deleted-- need to account for this
middlewareObj.ASYNCgetOwnerPhotoIds = (req, res) => {
   return new Promise((resolve, reject) => {
      User.findById(req.params.id, (err, contentOwner) => {
         if (err) {
            console.log(err);
            reject;
         } else {
            photos = contentOwner.allPhotos;
            console.log('🧉 ////////////\n ' + JSON.stringify(photos, null, 2));
            resolve(photos); //might be why wrapped
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
         console.log('🧉 ////////////\n ' + JSON.stringify(photos, null, 2));
         return photos; //might be why wrapped
      }
   });
};

//set idList to null to use find from current user
middlewareObj.ASYNCgetOwnerPhotoObjs = (req, res, idList) => {
   var photoList = [];
   var photoIds;
   return new Promise(async (resolve, reject) => {
      //checking current user if no photo idList provided

      console.log('checking for null id list');
      if (idList === null) {
         try {
            console.log(' ^^^^^^^^^^^^^null id list');
            photoIds = await middlewareObj.ASYNCgetOwnerPhotoIds(req, res);
            //TODO handle errors
            console.log(' ids are : ' + photoIds);
         } catch {
            console.log('ERR-- could not get photo ids from user');
            reject; // TODO maybe resolve as null
         }
      } else {
         //list was provided
         photoIds = idList;
      }
      console.log('--------------\ncur p list' + photoIds);

      photoIds.forEach(async (photoId) => {
         var newPhoto = await middlewareObj.ASYNCgetPhotoObjFromId(photoId);
         console.log('new photo is: ' + newPhoto);
         //only adding photos that can be found
         if (newPhoto != null) {
            photoList.push(newPhoto);
         }
      });

      console.log('PhotoList is :' + photoList);

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

/////////////////
//method for removal

//remove all photo obj from PhotoIDs
middlewareObj.removePhotosOnly = (photoIdList) => {
   photoIdList.forEach((photoId) => {
      middlewareObj.removePhotoOnly(photoId);
   });
};
//remove photo obj from PhotoID
middlewareObj.removePhotoOnly = (photoId) => {
   Photo.findByIdAndRemove(photoId, function (err) {
      if (err) {
         console.log('error removing photo \n' + err);
      }
   });
};

// TODO --  need to rewrite to inclde galleries or any other list

/**
 * should oly get tho this point if there is a user defined (user has an empty all photos list by default)
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
      // err && console.log(err);
      res.status(404).render('404');
   }
};

module.exports = middlewareObj;
