const User = require('../models/user');
const Photo = require('../models/photo');
const Album = require('../models/album');

const userMethods = require('../databaseFunctions/userMethods');
const photoMethods = require('../databaseFunctions/photoMethods');
const albumMethods = require('../databaseFunctions/albumMethods');
const { all } = require('../routes/user');

var middlewareObj = {};

middlewareObj.ASYNCrenderAlbumPage = async (req, res) => {
   Album.findById(req.params.albumID, async (err, album) => {
      if (err) {
         console.log(err);
         res.status(500).send('Server error');
      } else {
         console.log('alb is :', album);
         photosFound = await photoMethods.getPhotoListFromPhotoIds(
            album.alb_PhotoList,
         );
         middlewareObj.renderPageWithCurrentUserAndContentOwner(
            req,
            res,
            album.alb_AuthorId,
            'albums/album',
            { album, photosFound },
         );
      }
   });
};

middlewareObj.ASYNCrenderEditAlbumPage = async (req, res) => {
   //TODO - code here is almost same as in display  album page -- extract
   Album.findById(req.params.albumID, async (err, album) => {
      const user = req.user;
      if (err) {
         console.log(err);
         res.render('404');
      } else {
         console.log('alb is :', album);
         photosFound = await photoMethods.getPhotoListFromPhotoIds(
            album.alb_PhotoList,
         );

         middlewareObj.renderPageWithCurrentUserAndContentOwner(
            req,
            res,
            album.alb_AuthorId,
            'albums/EditAlbum',
            { album, photosFound, user },
         );
      }
   });
};
middlewareObj.ASYNCpostFormDataFromEditAlbumPage = async (req, res) => {
   let albumOwnershipVerified = !(await middlewareObj.ASYNCnoUserOrWrongUser(
      req,
      res,
   ));
   console.log('albumOwnershipVerified: ', albumOwnershipVerified);

   !albumOwnershipVerified && console.log('albumOwnership not Verified');

   if (albumOwnershipVerified) {
      console.log('albumOwnership  Verified');
      let idsVerifiedBool = await middlewareObj.ASYNCCheckIfIdsAreValid(req); //TODO - still need to write method
      if (idsVerifiedBool) {
         console.log('ids are varified');
         await middlewareObj.ASYNCupdateAllFromFormData(req);
      }

      !idsVerifiedBool && console.log('ids not valid');
   }

   res.redirect('edit');
};

middlewareObj.ASYNCpostDeleteRequest = async (req, res) => {
   let redirectPage = `/albums/${req.params.albumID}/edit`;
   console.log('Attempting to delete photos');
   let conditionsMet = middlewareObj.checkConditionsMet(req);
   if (conditionsMet) {
      console.log('condition met');
      console.log('delmode :', req.deleteOption);
      await middlewareObj.ASYNChandleDeleteRequest(req);

      if (req.user) {
         redirectPage = `/users/${req.user._id}/albums`;
      }
   } else {
      console.log('conditions not met');
   }

   res.redirect(redirectPage); //TODO - doble check path
};

middlewareObj.renderPageWithCurrentUserAndContentOwner = (
   req,
   res,
   albumOwnerId,
   pagePath,
   objOfValToBeSent,
) => {
   User.findById(albumOwnerId, (err, contentOwner) => {
      if (err) {
         console.log(err);
         res.status(500).render('server error');
      } else {
         if (contentOwner) {
            console.log('za ownah iz, ', contentOwner);
            currentUser = req.user;
            let vals = {
               ...{ contentOwner, currentUser },
               ...objOfValToBeSent,
            };
            res.render(pagePath, vals);
         } else {
            res.status(404).render('404');
         }
      }
   });
};

//TODO - move below to album methods

/////////////
//Read methods
//////////////

/** findAlbumById
 * returns the album obj of corresponding ID
 * @param {*} albumID
 * @return album to obj corresponding to ID
 */
middlewareObj.findAlbumById = (albumID) => {
   Album.findById(albumID, (err, albumObj) => {
      if (err) {
         console.log(err);
         return null;
      } else return albumObj;
   });
};

////////////////
// destroy methods
////////////////

/** removeAlbumOnly
 * removes the Album from the user's Album collection. All photos in the album remain in the user's photo collection
 * @param {*} albumId -
 *  @param {*} user -
 */
middlewareObj.removeAlbumOnly = (user, albumId) => {
   unsetObj = {};
   let albumStr = `albumIds[${albumId}]`;

   unsetObj[albumStr] = 1;
   try {
      //TODO -- make sure try catch works with db
      //removing album from user's album list

      //User.update({ _id: user._id }, { $unset: { field: 1 } }, (cb = () => {}));

      User.update(
         { _id: user._id },
         // { $unset: { `albumIds.${albumId}`: 1 } },
         { $unset: unsetObj },
         false,
         true,
      );
      //removing the album

      Album.findByIdAndRemove(albumId, (err) => {
         if (err) {
            console.log('error removing album \n' + err);
         }
      });
   } catch {
      //failed to remove album
   }
};

/** removeAlbumAndPhotosInList
 * Removes the Album from the user's Album collection.
 * All photos in the album are removed from the user's photo collection
 * @param {*} albumId
 */
middlewareObj.removeAlbumAndPhotosInList = (photoList, albumId) => {
   //delete each photo in album
   Photo.update({}, { $pull: { _id: { $in: photoList } } });

   middlewareObj.removeAlbumOnly(albumId);
};

/**
 *re
 * @param {*} req
 * @param {*} res TODO delte res
 * @return - returns true if no user or user logged in is not owner
 */
middlewareObj.ASYNCnoUserOrWrongUser = async (req, res) => {
   let returnBool = false;
   if (req.user) {
      let userIsOwner = await albumMethods.ASYNCisUserOwnerOfAlbum(
         req.user._id,
         req.params.albumID,
      );
      console.log('userIsOwner: ', userIsOwner);
      !userIsOwner && (returnBool = true);
      !userIsOwner && console.log('user is not content owner');
      userIsOwner && console.log('user is content owner');
      console.log('the user is', req.user);
   } else {
      console.log('no user');
      returnBool = true;
   }
   return returnBool;
};

middlewareObj.convertStringToArrayIfNotArray = (obj) => {
   if (typeof obj === 'string') {
      return [obj];
   } else if (Array.isArray(obj)) {
      console.log('already n array');
      return obj;
   } else {
      console.log('neither str or arr');
      return null;
   }
};
middlewareObj.ASYNCverifyPhotosInListThenDelete = async (req) => {
   let photoIdsToDelete = req.body.photoIdsToDelete;
   if (photoIdsToDelete) {
      console.log('attempting to delete files');
      let photoIdArrayToDelete = middlewareObj.convertStringToArrayIfNotArray(
         photoIdsToDelete,
      );

      let photoOwnershipVerified = await photoMethods.ASYNCverififyPhotoOwnership(
         req.user._id,
         photoIdArrayToDelete,
      );
      !photoOwnershipVerified && console.log('NOT approved to delete files');
      //deleteing albums in list
      if (photoOwnershipVerified) {
         console.log('approved to delete files');
         await albumMethods.deletePhotosFromAlbumsAndDbAndFs(
            photoIdArrayToDelete,
         );
         await albumMethods.ASYNCresetCoverPhotosOfAlbumsIfInPhotoList(
            photoIdArrayToDelete,
         );
      }

      //Todo - actually delete them
   }
};
/**
 * NOTE: should only get to this point if user is verified
 * @param {*} req
 */
middlewareObj.ASYNCchangeAlbumCoverToUsersSelectionOrFirstPhotoInListIfEmpty = async (
   req,
) => {
   //TODO -- only excecute if alb id not in delete or remove list
   let {
      photoIdForAlbumCover,
      photoIdsToDelete,
      photoIdsToRemoveFromAlbum,
   } = req.body;
   let inRemovalLists = middlewareObj.iteminLists(photoIdForAlbumCover, [
      photoIdsToDelete,
      photoIdsToRemoveFromAlbum,
   ]);
   console.log('InRemovalLists:', inRemovalLists);
   if (!inRemovalLists) {
      let albumId = req.params.albumID;
      console.log('in editing cover photo func');
      if (photoIdForAlbumCover) {
         console.log('looking for photo with id:', photoIdForAlbumCover);
         let photo = await Photo.findById(photoIdForAlbumCover);
         if (photo) {
            //Todo extract to seperate method
            console.log('PHOTO was found, attempiting to update cover');
            await Album.findByIdAndUpdate(albumId, {
               alb_CoverPhoto: {
                  coverID: photo._id,
                  coverFileName: photo.fileName, //TODO-makefileurl
               },
            });
         } else {
            //Todo extract to seperate method
            console.log(
               'could not find photo, attempting to et photo to first in album list',
            );
            let album = await Album.findById(albumId);
            console.log('cannot find  photo in collection');
            await albumMethods.addFirstPhotoAsCoverImageIfNonePresent([album]);
            console.log('alb_CoverPhoto is ', album.alb_CoverPhoto);
         }
      }
      console.log('aLB iD IS ', albumId);
   }
};

//TODO extract below to Album methods
middlewareObj.ASYNCupdateNameAndDescription = async (req) => {
   let { albumName, albumDescription } = req.body;
   let albumId = req.params.albumID;
   console.log('body', req.body);

   console.log('in update album name and desc method');
   console.log('updating album : ', albumId);
   let updateObj = {};
   console.log('user desc and name: ', albumDescription, ' ', albumName);

   albumName && (updateObj['alb_Name'] = albumName);
   albumDescription && (updateObj['alb_Description'] = albumDescription);
   console.log('update obj is', updateObj);
   if (albumName || albumDescription) {
      console.log('attempting to update alb');
      await Album.findByIdAndUpdate(albumId, updateObj);
   }
};
/**
 * used to check if Ids are valid  -- important if improper casting of Ids can crash app
 * @param {*} req
 */
middlewareObj.ASYNCCheckIfIdsAreValid = async (req) => {
   //This is a STUB
   return true;
};
middlewareObj.ASYNCupdateAllFromFormData = async (req) => {
   await middlewareObj.ASYNCverifyPhotosInListThenDelete(req);
   await middlewareObj.ASYNCverifyPhotosInListThenRemoveFromAlbum(req);
   await middlewareObj.ASYNCchangeAlbumCoverToUsersSelectionOrFirstPhotoInListIfEmpty(
      req,
   );
   await middlewareObj.ASYNCupdateNameAndDescription(req);
};

middlewareObj.ASYNCverifyPhotosInListThenRemoveFromAlbum = async (req) => {
   let { photoIdsToDelete, photoIdsToRemoveFromAlbum } = req.body;
   if (photoIdsToRemoveFromAlbum) {
      console.log('attempting to dlete photos from album');
      photoIdsToRemoveFromAlbum = middlewareObj.convertStringToArrayIfNotArray(
         photoIdsToRemoveFromAlbum,
      );

      photoIdsToRemoveFromAlbum = middlewareObj.removeDuplicatesInDeleteList(
         photoIdsToDelete,
         photoIdsToRemoveFromAlbum,
      );

      console.log(
         'list of photos to remove from list',
         photoIdsToRemoveFromAlbum,
      );

      let photoOwnershipVerified = await photoMethods.ASYNCverififyPhotoOwnership(
         req.user._id,
         photoIdsToRemoveFromAlbum,
      );
      //removing albums in list
      if (photoOwnershipVerified) {
         console.log('approved to remove files');

         await albumMethods.ASYNCremoveAllAlbumReferencesToPhotosInList(
            [req.params.albumID],
            photoIdsToRemoveFromAlbum,
         );
      }
   }

   // const C =A.filter(n => !B.includes(n))  //https://stackoverflow.com/a/53092728/7173655
   //removing duplicate folists
};
middlewareObj.removeDuplicatesInDeleteList = (
   photoIdsToDelete,
   photoIdsToRemoveFromAlbum,
) => {
   if (photoIdsToDelete) {
      console.log('old list', photoIdsToRemoveFromAlbum);
      console.log('removing these from list', photoIdsToDelete);
      photoIdsToDelete = middlewareObj.convertStringToArrayIfNotArray(
         photoIdsToDelete,
      );
      photoIdsToRemoveFromAlbum = photoIdsToRemoveFromAlbum.filter(
         (n) => !photoIdsToDelete.includes(n), //taken from https://stackoverflow.com/a/53092728/7173655
      );
   }
   return photoIdsToRemoveFromAlbum;
};

middlewareObj.iteminLists = (item, listOfLists) => {
   let retBool = false;
   listOfLists.forEach((list) => {
      if (list && list.includes(item)) {
         console.log('item in list-- !!!!!!!!!!!!!!!! ');
         retBool = true;
      }
   });
   return retBool;
};

middlewareObj.checkConditionsMet = (req) => {
   const { confirmDeleteText, deleteOption } = req.body;
   console.log(req.body);

   if (confirmDeleteText.toUpperCase() === 'DELETE' && deleteOption) {
      return true;
   } else {
      return false;
   }
};

middlewareObj.ASYNChandleDeleteRequest = async (req) => {
   let { deleteOption } = req.body;
   if (deleteOption === 'deleteAlbumAndPhotos') {
      albumMethods.ASYNCfindAndRemoveAllReferencesToPhotosInAlbum(
         req.params.albumID,
      );

      let album = await Album.findByIdAndRemove(req.params.albumID);
      console.log('removing this album:\n', album);

      album &&
         photoMethods.removeMultiplePhotosFromDBAndFS(album.alb_PhotoList);

      album &&
         userMethods.ASYNCremovephotosFromUserList(
            req.user._id,
            album.alb_PhotoList,
         );
   } else if (deleteOption === 'deleteAlbumOnly') {
      console.log('deleting dat alb');
      let album = await Album.findByIdAndRemove(req.params.albumID);
      console.log('only deleteing dis album', album);
   } else {
      console.log('gr, del mode is', deleteOption);
   }
};
module.exports = middlewareObj;

///////////////////
// helper functions
///////////////////
