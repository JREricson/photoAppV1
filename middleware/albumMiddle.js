const User = require('../models/user');
const Photo = require('../models/photo');
const Album = require('../models/album');

const userMidware = require('../middleware/userMiddle');
const photoMethods = require('../databaseFunctions/photoMethods');

var middlewareObj = {};

middlewareObj.ASYNCrenderAlbumPage = async (req, res) => {
   Album.findById(req.params.albumID, async (err, album) => {
      if (err) {
         console.log(err);
         res.render('404');
      } else {
         console.log('alb is :', album);
         photosFound = await photoMethods.getPhotoListFromPhotoIds(
            Object.keys(album.alb_PhotoList),
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
      if (err) {
         console.log(err);
         res.render('404');
      } else {
         console.log('alb is :', album);
         photosFound = await photoMethods.getPhotoListFromPhotoIds(
            Object.keys(album.alb_PhotoList),
         );

         middlewareObj.renderPageWithCurrentUserAndContentOwner(
            req,
            res,
            album.alb_AuthorId,
            'albums/EditAlbum',
            { album, photosFound },
         );
      }
   });
};
middlewareObj.ASYNCsubmitFormDataFromEditPage = async (req, res) => {
   //update album

   //get albumid fr=rom page
   //get objOfItemsToUpdate from page
   albumMethods.updateAlbum(req.user._id, albumId, objOfItemsToUpdate);

   //add photos seperatly

   //redirect to album page
   res.redirect('albums/EditAlbum');
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
         //res.status(404).render('404');
      } else {
         currentUser = req.user;
         let vals = { ...{ contentOwner, currentUser }, ...objOfValToBeSent };
         res.render(pagePath, vals); //add other params
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

///////////////////
// helper functions
///////////////////

module.exports = middlewareObj;
