const User = require('../models/user');
const Photo = require('../models/photo');
const Album = require('../models/album');

const path = require('path');
var parentDir = __dirname;
const fetch = require('node-fetch');

//used to extract photo details
var exifr = require('exifr');

//for encription
const bcrypt = require('bcryptjs');
const passport = require('passport');

//other middleware/packages
const photoMidware = require('./photoMiddle');
const userMethods = require('../databaseFunctions/userMethods');
const albumMethods = require('../databaseFunctions/albumMethods');

const pictureUpload = require('../services/pictureUpload');

var userMidware = {};

//////////////////
//Routes
//////////////////

/**
 * Renders upload page
 * @param {*} req
 * @param {*} res
 */
userMidware.renderUploadPage = async (req, res) => {
   //getting all ablbums by user
   let albumIds = await albumMethods.ASYNCfindAllAlbumsFromUserId(req.user._id);
   userMidware.renderPageWithUser(req, res, 'users/upload', {
      albumIds: albumIds,
   });
};

/**
 * Renders profile. Sends user photoList and photoList to ejs page.
 * @param {*} req
 * @param {*} res
 */
userMidware.ASYNCgetProfile = async (req, res) => {
   const photoList = await photoMidware.ASYNCgetOwnerPhotoObjs(req, res, null);
   const albumList = await albumMethods.ASYNCfindAllAlbumsFromUserId(
      req.params.id,
   );
   // console.log('photoList is ', photoList.length);
   console.log('albumList is ', albumList);

   userMidware.renderPageWithUser(req, res, 'users/profile', {
      photoList,
      albumList,
   });
};

/**
 *  Renders user's about page
 * @param {*} req
 * @param {*} res
 */
userMidware.renderAboutPage = (req, res) => {
   userMidware.renderPageWithUser(req, res, 'users/about');
};

/**
 *  Renders page allowing user to edit photos
 * @param {*} req
 * @param {*} res
 */
userMidware.renderPhotoEditPage = (req, res) => {
   res.render('users/editSubmitted');
};

//////////////////
//helper functions
//////////////////

/**
 * Renders ejs page in pagePath. Finds the user that the page belongs
 *  to and adds that user as contentOwner. Addition vales can be sent to eje by including
 * them in the objOfValToBeSent
 * @param {*} req
 * @param {*} res
 * @param {*} pagePath path for  ejs file
 * @param {*} objOfValToBeSent object containing additional values to be sent to
 * ejs file
 */
userMidware.renderPageWithUser = (req, res, pagePath, objOfValToBeSent) => {
   User.findById(req.params.id, (err, contentOwner) => {
      if (err) {
         console.log(err);
         res.status(500).render('server error');
      } else {
         currentUser = req.user;
         let vals = {
            ...{ contentOwner, currentUser, parentDir },
            ...objOfValToBeSent,
         };
         res.render(pagePath, vals);
      }
   });
};

/**
 * Renders ejs page in pagePath. Finds the user that the page belongs
 *  to and adds that user as contentOwner. Renders 404 if no contentOwner. Addition vales can be sent to eje by including
 * them in the objOfValToBeSent
 * @param {*} req
 * @param {*} res
 * @param {*} pagePath path for  ejs file
 * @param {*} objOfValToBeSent object containing additional values to be sent to
 * ejs file
 */
userMidware.renderPageWithUserRedirectIfNoContentOwner = (
   req,
   res,
   pagePath,
   objOfValToBeSent,
) => {
   User.findById(req.params.id, (err, contentOwner) => {
      if (err) {
         console.log(err);
         res.status(500).render('server error');
      } else if (contentOwner) {
         currentUser = req.user;
         let vals = { ...{ contentOwner, currentUser }, ...objOfValToBeSent };
         res.render(pagePath, vals);
      } else {
         res.status(404).render('404');
      }
   });
};

//TODO - rename this function
userMidware.renderEditPhotoPage = async (req, res, next) => {
   var newPhotos = [];
   console.log('existing alb', req.body.existingAblums);

   const user = req.user;
   let albums = await userMidware.validatedAlbumsfromSubmittedAlbumIds(
      req.body.existingAblums,
      user,
   );

   console.log('cur alb list is', albums);

   //
   //TODO-add below back
   //userMidware.redrirectToUploadPageIfNoUploads(req.files.length, res, req);
   newAlbum = await userMidware.createNewAlbumIfNeeded(req);
   newAlbum && albums.push(newAlbum);

   await addPhotosToDB(req, user, albums, newPhotos);

   //TODO -- fix this, it is looking at albums before photo added
   let editedAlbums = await albumMethods.ASYNCrefreshAlbumList(albums);
   await albumMethods.addFirstPhotoAsCoverImageIfNonePresent(editedAlbums);

   //save all albums
   // await userMidware.ASYNCsaveAllAlbums(albums);
   console.log('album list is ', albums);

   await user.save();

   userMidware.redirectToEditPhotosPage(req, res, newPhotos);
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 *
 */

userMidware.renderProfile = (req, res, next) => {
   //getting values from doc
   const {
      name,
      homeLocation,
      bio,
      personalSite,
      instagram,
      fiveHundredpix,
      flickr,
      github,
   } = req.body;

   //editing values for logging in user
   var socialMediaObj = {
      instagram: instagram,
      fiveHundredpix: fiveHundredpix,
      github: github,
      flickr: flickr,
   };

   User.findByIdAndUpdate(
      //TODO change to updatee many
      req.user._id,
      {
         name,
         bio,
         homeLocation,
         website: personalSite,
         socialMediaAcnts: { ...socialMediaObj },
      },

      (err, updatedUser) => {
         if (err) {
            console.log(err);
         } else {
            // console.log('/////// updated updatedUser\n' + updatedUser);
         }
      },
   ),
      res.redirect(`/users/${req.params.id}/about`);
};

userMidware.renderPhotoPage = async (req, res, next) => {
   const photoList = await photoMidware.ASYNCgetOwnerPhotoObjs(req, res, null);
   userMidware.renderPageWithUser(req, res, 'users/photos', { photoList });
};

userMidware.renderUserAlbumsPage = async (req, res) => {
   try {
      let albumList = await albumMethods.ASYNCfindAllAlbumsFromUserId(
         req.params.id,
      );

      userMidware.renderPageWithUserRedirectIfNoContentOwner(
         req,
         res,
         'users/userAlbums',
         {
            albumList,
         },
      );
   } catch {
      res.status(404).render('404');
   }
};

//TODO - finsih or delete addPhotoToAlbums
userMidware.addPhotoToAlbums = (user, newAlbumName, albumList) => {
   //crates a new album if needed
   if (newAlbumName) {
      albumMethods.createNewAlbum = (user, newAlbumName);
      albumMethods.updateAlbum();
   }

   albumList.forEach((album) => {
      //add photos to album
   });
};

/**
 *
 * @param {*} albumIds
 * @param {*} user - the user that is logged in
 */
userMidware.validatedAlbumsfromSubmittedAlbumIds = async (albumIds, user) => {
   approvedAlbums = await Album.find({
      _id: { $in: albumIds },
      //ensuring ownership
      alb_AuthorId: user._id,
   });
   return approvedAlbums;
};

//todo make sure will not crah --validate alb ids
userMidware.ASYNCaddPhotoIdToAblums = async (albums, photoId) => {
   albums.forEach(async (album) => {
      let dateObj = { alb_LastUpdate: Date.now() };
      let photoIdObj = { alb_PhotoList: photoId }; //[`hotoList.${photoId}`] = true;
      await Album.updateOne(
         { _id: album._id },
         { $push: photoIdObj },
         { $set: dateObj },
      );

      // await album.save(); //TODO - make usre this is fine when working with several albums and additions
   });
};

userMidware.ASYNCsaveAllAlbums = async (albums) => {
   albums.forEach(async (album) => {
      await album.save();
   });
};

//TODO - edit to account for other eros such as wrong file type - maybe as middle ware
userMidware.redrirectToUploadPageIfNoUploads = (numOfFiles, res, req) => {
   if (numOfFiles === 0) {
      res.redirect(`/${req.params.id}/photos/upload`);
   }
};

userMidware.createNewAlbumIfNeeded = async (req) => {
   const user = req.user;
   let { newAlbumTitle, newAlbumDescription } = req.body;
   console.log('user is ', user);

   //TODO -- only do if check box cecked

   if (req.body.checkForNewAlbum /* box checked and other cond met */) {
      console.log(req.body.checkForNewAlbum);

      let curDate = Date.now();
      !newAlbumTitle && (newAlbumTitle = 'Untitled_' + curDate);

      let newAlbum = new Album({
         alb_AuthorName: user.name,
         alb_AuthorId: user._id,
         alb_Name: newAlbumTitle,
         alb_Description: newAlbumDescription,
         alb_DateCreated: curDate,
         alb_LastUpdate: curDate,
      });
      newAlbum && (await newAlbum.save());
      return newAlbum;
   } else return null; //TODO - check that this works
};

//todo- makes sep network calls. maybe have doneprior to sending

userMidware.extractExifDataAndSaveToPhoto = async (img, newPhoto) => {
   let imgUrl = new URL(img.location);
   //let imgBlob = await fetch(imgUrl).then((r) => r.blob());

   console.log(img.location);

   if (imgUrl) {
      await exifr
         .parse(imgUrl)
         .then((output) => {
            newPhoto.dateTaken = output.DateTimeOriginal;
            newPhoto.exifMetaData = output;
            // newPhoto.save();
         })
         .catch((err) => {
            console.log('exif error', err);
         });
   }
   return newPhoto;
};
/**
 *
 * @param {*} newAlbum
 * @return - { newAlbum: newAlbum._id -- or null if no new album}
 */
userMidware.createNewAlbumAndIdObj = (newAlbum) => {
   if (newAlbum) {
      return { newAlbum: newAlbum._id };
   } else {
      return { newAlbum: null };
   }
};

userMidware.redirectToEditPhotosPage = (req, res, newPhotos) => {
   let albumIdObj = userMidware.createNewAlbumAndIdObj(newAlbum);
   userMidware.renderPageWithUser(req, res, 'users/editSubmitted', {
      newPhotos,
      albumIdObj,
   });
};

userMidware.uploadImages = async (req, res) => {
   // req.body.userImage.forEach((file) => {
   //    console.log(file);
   // });
   console.log('files', req.body.files);
   console.log('body', req.body);

   const uploadArray = pictureUpload.array('userImage'); //can add limit -- array(fieldName: string, maxCount?: number)
   uploadArray(req, res, async (err) => {
      if (err) {
         console.log('err uploading', err);
         //TOTO-add redirect with flash msgs
      } else {
         console.log(req.files);
         userMidware.renderEditPhotoPage(req, res);
         //  await renameTestDB(req);
      }
      //next();
   });
};

// const renameTestDB = async (req) => {
//    console.log('file ar-------', req.files);
//    req.files.forEach((file) => {
//       console.log('file ar-------', file);
//       console.log('f, loc  ', file.location);
//    });
// };
module.exports = userMidware;
async function addPhotosToDB(req, user, albums, newPhotos) {
   console.log('adding pho to DB');
   console.log('files', req.files);
   await Promise.all(
      req.files.map(async (img, ndx) => {
         console.log('tran------->', img.transforms[0].location);
         let str = img.transforms[0].location;
         let lastSlash = str.lastIndexOf('/');

         let fileName = str.substring(lastSlash + 1);
         let fileLocation =
            `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/` +
            fileName;
         console.log('loc------->', fileLocation);
         console.log('key------->', fileName);

         let newPhotoParams = {
            author: user.name,
            submittedByID: user._id,
            fileName,
            fileLocation,
         };

         let exif = userMidware.getExifDataFromForm(req, img, ndx);
         const newPhotoParamsFromExif = userMidware.generateAditionalParamsFromExif(
            exif,
         );

         newPhotoParams = { ...newPhotoParams, ...newPhotoParamsFromExif };
         let newPhoto = new Photo(newPhotoParams);
         await newPhoto.save(); //adding photo to list to return to user;
         console.log('new photo:', newPhoto);
         //adding photo to currrent users's photo collection
         user.allPhotos.push(newPhoto._id);

         await userMidware.ASYNCaddPhotoIdToAblums(albums, newPhoto._id);

         newPhotos.push(newPhoto);
      }),
   );
}

userMidware.deleteUserAndAllUserItems = async (user) => {
   //TODO include error checking
   //get photolist
   var photoList = user.allPhotos;

   //remove photos in list from database
   await photoMethods.removeMultiplePhotosFromDBAndFS(photoList);

   //remove all albums
   await albumMethods.removeAllAlbumsWithUserId(user._id);

   //remove user
   await userMethods.deleteUser(user._id);
};

userMidware.getExifDataFromForm = (req, img, ndx) => {
   console.log('img', JSON.stringify(img));
   let exifFormData = JSON.parse(req.body.exifData);
   console.log('fromForm', JSON.stringify(req.body));

   if (
      img.originalname === exifFormData[ndx].fileName &&
      exifFormData[ndx].exif
   ) {
      const exif = exifFormData[ndx].exif;

      console.log('found exif', exifFormData[ndx].exif);
      return exif;
   } else {
      return null;
   }

   //check ndx and file nam
   //if(img.OriginalName==req){}

   //else{return null}
};
userMidware.generateAditionalParamsFromExif = (exif) => {
   let paramsFromExifData = {};
   if (exif) {
      paramsFromExifData = {
         ...paramsFromExifData,
         ...{
            exifMetaData: exif,
         },
      };

      if (exif.latitude && exif.longitude && exif.DateTimeOriginal) {
         paramsFromExifData = {
            ...paramsFromExifData,
            ...{
               dateTaken: exif.DateTimeOriginal,
               longitude: exif.longitude,
               latitude: exif.latitude,
               location_2dsphere: {
                  type: 'Point',
                  coordinates: [exif.longitude, exif.latitude],
               },
            },
         };
      }
   }
   console.log('ooooooooooooooo paramsFromExifData ', paramsFromExifData);

   return paramsFromExifData;
};

/**
 * Used to delete req.user and redirect to login page
 * @param {*} req
 * @param {*} res
 */
userMidware.deleteUserRoute = (req, res) => {
   userMidware.deleteUserAndAllUserItems(req.user);
   // TODO send push message
   res.redirect('/login');
};

/**
 * Renders Settings page
 * @param {*} req
 * @param {*} res
 */
userMidware.renderSettingsPage = (req, res) => {
   userMidware.renderPageWithUser(req, res, 'users/settings');
};

/**
 * Updates data from req and redirects to user's photos page
 * @param {*} req
 * @param {*} res
 */
userMidware.handlePutReqForPhotoUpdates = (req, res) => {
   photoMidware.updatePhotosFromEjsData(req); //TODO -- make Asyc???
   res.redirect(`/users/${req.params.id}/photos`);
};
