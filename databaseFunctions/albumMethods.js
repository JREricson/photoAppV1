//Schemas
const User = require('../models/user');

const Album = require('../models/album');

///
const photoMethods = require('./photoMethods');

var albumMethods = {};

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
albumMethods.createNewAlbum = (user, albumName) => {
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

////////////
//read methods
////////////////
albumMethods.ASYNCfindAllAlbumsByUserId = async (userId) => {
   albums = await Album.find({
      alb_AuthorId: userId,
   });
   return albums;
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
albumMethods.updateAlbum = async (
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

//...................
albumMethods.getUserAlbums = async (albumIdList) => {
   let albumList = await Album.find({ $in: albumIdList });
   return albumList;
};

//////////////
module.exports = albumMethods;
