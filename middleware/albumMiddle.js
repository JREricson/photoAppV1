const User = require('../models/user');
const Photo = require('../models/photo');
const Album = require('../models/album');

var middlewareObj = {};

/////////////
//create methods
//////////////

/** createNewAlbum
 *
 * -creates new album - sets date created, last updated, name, and author
 * -adds newly created album to the albumlist of the content owner
 * @param {*} user - the user object for the owner of the new album
 * @param {*} albumName  - name for new album
 *
 * @return - returns the album just created
 */
middlewareObj.createNewAlbum = (user, albumName) => {
   let curDate = Date.now();
   let newAlbum = new Album({
      alb_Author: { authorName: user.name, authorId: user._id },
      alb_Name: albumName,
      alb_DateCreated: curDate,
      alb_LastUpdate: curDate,
   });
   //adding new album to user's album list
   user.albumIds[newAlbum._id] = true;

   return newAlbum;
};

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

/////////////
//update methods
//////////////

/** updateAlbum
 *
 * updates album based on params that correspond to fields in album schema
 *!!CAUTION!! --  make sure user is owner of photos if getting info from front end
 * @param {*} userId -id of content owner
 * @param {*} albumID
 * @param {*} albumName
 * @param {*} albumShortDesc
 * @param {*} albumDesc
 * @param {*} photoList
 * @param {*} coverPhotoId
 * @param {*} coverPhotoFilename
 *
 * @return returns updated obj
 */
middlewareObj.updateAlbum = async (
   userId,
   albumID,
   albumName,
   albumShortDesc,
   albumDesc,
   photoList,
   coverPhotoId,
   coverPhotoFilename,
) => {
   //finding album from ID if not included
   !albumObj && (albumObj = await albumObjmiddlewareObj.findAlbumById(albumID));
   //updateObj holds all info to be updated--written this way so it canbe extracted as a function if there are more complicated updates
   let updateObj = {
      alb_Author: { authorName: albumName, authorId: userId },
      alb_Name: albumName,
      alb_shortDescription: albumShortDesc,
      alb_description: albumDesc,
      alb_PhotoList: photoList,
      alb_LastUpdate: Date.now(),
      alb_coverPhoto: {
         coverID: coverPhotoId,
         coverFileName: coverPhotoFilename,
      },
   };
   //finding album and updating all info
   Album.findByIdAndUpdate(albumID, updateObj, (err, updatedAlbum) => {
      if (!updatedAlbum) {
         console.log('\n\n!!!!!!!could not update album'); //Delete
         console.log(err);
      } else {
         console.log('\n\n/////// updated album\n' + updatedAlbum); //Delete
         return updatedAlbum;
      }
   });
   //will return null if no album made
   return null;
};

////////////////
// destroy methods
////////////////

/** removeAlbumOnly
 * removes the Album from the user's Album collection. All photos in the album remain in the user's photo collection
 * @param {*} albumId - id of photo to be removed
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
 * removes the Album from the user's Album collection. All photos in the album are removed from the user's photo collection
 * @param {*} albumId //ID of album to remove
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
