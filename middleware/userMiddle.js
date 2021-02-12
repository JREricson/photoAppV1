const User = require('../models/user');
const Photo = require('../models/photo');
const Album = require('../models/album');

const path = require('path');

//used to extract photo details
var exifr = require('exifr');

//for encription
const bcrypt = require('bcryptjs');
const passport = require('passport');

//other middleware/packages
const photoMidware = require('./photoMiddle');
const userMethods = require('../databaseFunctions/userMethods');
const albumMethods = require('../databaseFunctions/albumMethods');

var userMidware = {};

//////////////////////////
// page rendering methods
/////////////////////////////

userMidware.renderPageWithUser = (req, res, pagePath, objOfValToBeSent) => {
   User.findById(req.params.id, (err, contentOwner) => {
      if (err) {
         console.log(err);
         res.status(500).render('server error');
      } else {
         currentUser = req.user;
         let vals = { ...{ contentOwner, currentUser }, ...objOfValToBeSent };
         res.render(pagePath, vals);
      }
   });
};

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

userMidware.renderUploadPage = async (req, res) => {
   //getting all ablbums by user
   let albumIds = await albumMethods.ASYNCfindAllAlbumsByUserId(req.user._id);
   userMidware.renderPageWithUser(req, res, 'users/upload', {
      albumIds: albumIds,
   });
};

userMidware.ASYNCgetProfile = async (req, res) => {
   const photoList = await photoMidware.ASYNCgetOwnerPhotoObjs(req, res, null);
   const albumList = await albumMethods.ASYNCfindAllAlbumsByUserId(
      req.params.id,
   );
   // console.log('photoList is ', photoList.length);
   console.log('albumList is ', albumList);

   userMidware.renderPageWithUser(req, res, 'users/profile', {
      photoList,
      albumList,
   });
};

//TODO - rename this function
userMidware.savePhotosToDBandRenderEditPhotoPage = async (req, res, next) => {
   var newPhotos = [];
   console.log('existing alb', req.body.existingAblums);

   const user = req.user;
   let albums = await userMidware.validatedAlbumsfromSubmittedAlbumIds(
      req.body.existingAblums,
      user,
   );

   console.log('cur alb list is', albums);

   userMidware.redrirectToUploadPageIfNoUploads(req.files.length, res, req);
   newAlbum = await userMidware.createNewAlbumIfNeeded(req);
   newAlbum && albums.push(newAlbum);

   await Promise.all(
      req.files.map(async (img) => {
         var newPhoto = new Photo({
            author: user.name,
            SubmittedByID: user._id,
            fileName: img.filename,
            fileLocation: path.join(img.destination, img.filename),
         });

         //adding photo to currrent users's photo collection
         user.allPhotos.push(newPhoto._id);

         await userMidware.ASYNCaddPhotoIdToAblums(albums, newPhoto._id);
         await userMidware.extractExifDataAndSaveToPhoto(img, newPhoto);

         //adding photo to list to return to user
         newPhotos.push(newPhoto);
      }),
   );

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
      let albumList = await albumMethods.getAlbumsFromUserId(req.params.id);

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
         alb_description: newAlbumDescription,
         alb_DateCreated: curDate,
         alb_LastUpdate: curDate,
      });
      newAlbum && (await newAlbum.save());
      return newAlbum;
   } else return null; //TODO - check that this works
};

userMidware.extractExifDataAndSaveToPhoto = async (img, newPhoto) => {
   await exifr
      .parse(path.join(img.destination, img.filename))
      .then((output) => {
         newPhoto.dateTaken = output.DateTimeOriginal;
         newPhoto.exifMetaData = output;
         newPhoto.save();
      })
      .catch((err) => {
         console.log(err);
      });
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

module.exports = userMidware;
