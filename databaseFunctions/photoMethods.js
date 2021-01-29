const User = require('../models/user');
const Photo = require('../models/photo');
const fs = require('fs');
var photoMethods = {};

photoMethods.getPhotoListFromPhotoIds = async (photoIds) => {
   photoList = await Photo.find({ _id: { $in: photoIds } });

   return photoList;
};

photoMethods.ASYNCgetPhotoObjFromId = async (photoId) => {
   let foundPhoto = await Photo.findById(photoId);
   if (!foundPhoto) {
      console.log('ERR---could not find photo-- \n');
      return null;
   } else {
      console.log('photos is', foundPhoto);
      return foundPhoto;
   }
};

photoMethods.makeGeoJSONObj = (latitude, longitude) => {
   // TODO fix nan issue with this
   //adding location_2dsphere only if long and lat are present
   let coordLong, coordLat;
   if (latitude && longitude) {
      coordLong = parseFloat(longitude);
      coordLat = parseFloat(latitude);
   } else {
      //work around null value -- in pacific ocean-- need to account for this in later searches
      //does not allow null value if indexed
      coordLong = -139;
      coordLat = -30;
   }

   if (isNaN(coordLong) || isNaN(coordLat)) {
      coordLong = -139;
      coordLat = -30;
   }

   obj = {
      location_2dsphere: {
         type: 'Point',
         //geoJSON stores as [long, lat]
         coordinates: [coordLong, coordLat],
      },
   };
   return obj;
};

////////////////////
//method for removal
////////////////////
//\

/**
 * removeMultiplePhotosFromDBAndFS
 *
 * remove all photo obj from PhotoIDs
 * @param {*} photoIDList
 */
photoMethods.removeMultiplePhotosFromDBAndFS = async (photoIDList) => {
   let pathList = [];
   let photoList = await Photo.find(
      {
         _id: { $in: photoIDList },
      } /* , (err, photos) => {
      photos.forEach((photo) => {
         pathList.push(photo.fileLocation);
         console.log('photo :', photo.fileLocation);
      });
   } */,
   );

   console.log('photolist is:', photoList);
   photoList.forEach((photo) => {
      pathList.push(photo.fileLocation);
      console.log('photo :', photo);
   });
   console.log('pathlist: ', pathList);

   //remove from file system
   photoList = [];

   //    Photo.deleteMany({ _id: { $in: photoIDList } }); does not work?
   photoIDList.forEach(async (id) => {
      console.log('trying to delete from db');
      await Photo.findByIdAndDelete(id);
   });

   pathList.forEach((path) => {
      //maybe do async
      fs.unlink(path, (err) => {
         console.log('trying to remove file at: ', path);
         if (err) {
            console.error('cannnot remove file,: ', err);
         }
      });
   });
   // console.log('deleting photos in list :', photoIDList);
   //remove from database
};

//remove photo obj from PhotoID
photoMethods.removeSinglePhotoFromDBAndFS = async (photoID) => {
   //removing photo from db and finding photo info

   let photo = await Photo.findById(photoID);

   Photo.findByIdAndRemove(photoID, function (err) {
      if (err) {
         console.log('error removing photo \n' + err);
      }
   });

   console.log('photo===========> ', photo);

   //removing photo from db
   fs.unlink(photo.fileLocation, (err) => {
      if (err) {
         console.error('cannnot remove file,: ', err);
      }
   });

   photoMethods.removePhotoFromFileSystem = (photopath) => {
      //stub
   };
};

/**
 * should only get tho this point if there is a user defined (user has an empty all photos list by default)
 */
photoMethods.removePhotoFromUsersLists = async (photoID, user) => {
   if (user.allPhotos.includes(photoID)) {
      user.allPhotos.pull(photoID);
      user.save();
   } else {
      console.log(photoID + ' not found in allphotos');
   }
};

photoMethods.ASYNCverififyPhotoOwnership = async (userId, photoIdList) => {
   let returnBool = true;

   //TODO --   account for IDs that may cause app to crash with improper casting
   //console.log('list of photos to delete', photoIdList);
   let photos = await Photo.find({ _id: { $in: photoIdList } });

   if (!userId) {
      console.log('no user ID');
      returnBool = false;
   } else {
      photos.forEach((photo) => {
         console.log('id=========================================', photo);
         if (photo.SubmittedByID.toString() !== userId.toString()) {
            console.log('id not the same');
            returnBool = false;
         }
      });
   }

   return returnBool;
};

////////////////////////////////
module.exports = photoMethods;
