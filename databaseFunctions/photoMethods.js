const User = require('../models/user');
const Photo = require('../models/photo');

//const deleteFilesFromS3 = require('../services/deleteFilesFromS3');
var photoMethods = {};

/////////////
//create methods
//////////////

/////////////
//read methods
//////////////

/**
 * Creates list of photo objects corresponding to ids in photoIds
 * @param {*} photoIds
 * @returns List of photo objects
 */
photoMethods.getPhotoListFromPhotoIds = async (photoIds) => {
   console.log('photo ids in album are', photoIds);
   photoList = await Photo.find({ _id: { $in: photoIds } });

   return photoList;
};

/**
 * Creates photo objects corresponding to photoId
 * @param {*} photoId
 * @returns photo object
 */
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

/////////////
//update methods
//////////////

/////////////
//delete methods
//////////////

/**
 * Used to delete multiple photos from AWS S3 file system and from database
 * @param {*} photoIDList
 */
photoMethods.removeMultiplePhotosFromDBAndFS = async (photoIDList) => {
   let photoList = await Photo.find({
      _id: { $in: photoIDList },
   });

   let keyList = [];

   //extract to method
   photoList.forEach((photo) => {
      //errorList = { ...errorList, ...eList };;
      keyList.push({ Key: photo.fileName });
      //extract below to function
      keyList.push({ Key: 'thumb-200/' + photo.fileName });
      keyList.push({ Key: 'thumb-500/' + photo.fileName });
      keyList.push({ Key: 'thumb-2000/' + photo.fileName });
      console.log('removing photo :', photo.fileName);
   });

   //console.log('keyObj: ', JSON.stringify(keyObj));
   console.log('keyList: ', keyList);

   //extract to method
   photoIDList.forEach(async (id) => {
      console.log('trying to delete from db');
      await Photo.findByIdAndDelete(id);
   });

   deleteFilesFromS3('photoappuploads', keyList);
};

/////////////
//helper methods
//////////////

/**
 * Used to create GeoJSON object.
 * By default, Lon = -139.3145 and Lat = -30,
 * this is a work around fot geoJSON not accepting a null on mongo requiring
 * it in all objects for index to work.
 * Caution! no validation against improper GeoJSON lat/lon inputs
 * @param {*} latitude
 * @param {*} longitude
 * @returns GeoJSON
 */
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
      coordLong = -139.3145;
      coordLat = -30;
   }

   if (isNaN(coordLong) || isNaN(coordLat)) {
      coordLong = -139.3145;
      coordLat = -30;
   }

   obj = {
      location_2dsphere: {
         type: 'Point',
         //geoJSON stored as [long, lat]
         coordinates: [coordLong, coordLat],
      },
   };
   return obj;
};

////////////////////
//validation methods
////////////////////

/**
 * Used to validate if user with userId owns photos referenced in photoIdList.
 * !Caution! ids with improper format may fail to cast properly.
 * @param {*} userId
 * @param {*} photoIdList
 * @returns boolean (all photos belong to user ? T : F)
 */
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
         if (photo.submittedByID.toString() !== userId.toString()) {
            console.log('id not the same');
            returnBool = false;
         }
      });
   }

   return returnBool;
};

/////////////

//move to user methods

/**
 * Removes photoID from user object and saves it to the database
 * @param {*} photoID
 * @param {*} user user schema object
 */
photoMethods.removePhotoFromUsersLists = async (photoID, user) => {
   if (user.allPhotos.includes(photoID)) {
      user.allPhotos.pull(photoID);
      user.save();
   } else {
      console.log(photoID + ' not found in allphotos');
   }
};

//

////////////////////////////////
module.exports = photoMethods;

//move to awsS3 services
const aws = require('aws-sdk');

const s3 = new aws.S3();

aws.config.update({
   secretAccessKey: process.env.AWS_S_KEY,
   accessKeyId: process.env.AWS_ACCESS_KEY,
   region: process.env.AWS_REGION,
});
/**
 * ties methods to S3
 * @param {*} bucket
 * @param {*} keyList
 */
const deleteFilesFromS3 = (bucket, keyList) => {
   let params = {
      Bucket: bucket,
      Delete: {
         Objects: keyList,
         Quiet: false,
      },
   };
   s3.deleteObjects(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log(data);
   });
};
