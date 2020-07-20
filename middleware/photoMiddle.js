const User = require('../models/user');
const Photo = require('../models/photo');

var middlewareObj = {};

middlewareObj.updatePhotos = (req, res, photos, objOfThingsToUpdate) => {};

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
            console.log(' null id list');
            photoIds = await middlewareObj.ASYNCgetOwnerPhotoIds(req, res);
            //TODO handle errors
            console.log(' ids are : ' + photoIds);
         } catch {
            console.log('ERR-- could not get photo ids from user');
            reject;
         }
      } else {
         //list was provided
         photoIds = idList;
      }
      //console.log('cur p list' + photoIds);

      photoIds.forEach(async (photoId) => {
         var newPhoto = await middlewareObj.ASYNCgetPhotoObjFromId(photoId);
         console.log('new photo is: ' + newPhoto);
         //only adding photos that can be found
         if (newPhoto != null) {
            photoList.push(newPhoto);
         }
      });

      console.log('PhotosList is :' + photoList);

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

module.exports = middlewareObj;
