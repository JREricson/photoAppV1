//Schemas
const User = require('../models/user');

const Album = require('../models/album');
const Photo = require('../models/photo');

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

albumMethods.addFirstPhotoAsCoverImageIfNonePresent = async (albumList) => {
   console.log('in adding cover func');
   albumList.forEach(async (album) => {
      if (!album.alb_coverPhoto.coverFileName) {
         console.log('no cover file name');
         if (Object.keys(album.alb_PhotoList).length > 0) {
            console.log(
               'first photoID is ',
               Object.keys(album.alb_PhotoList)[0],
            );
            let firstPhotoId = Object.keys(album.alb_PhotoList)[0];
            let photo = await Photo.findById(firstPhotoId);
            console.log('photo is', photo);
            if (photo) {
               console.log('updating album with photo');
               let upAlb = await Album.findByIdAndUpdate(album._id, {
                  alb_coverPhoto: {
                     coverID: photo._id,
                     coverFileName: photo.fileName,
                  },
               });
               console.log('updated alm is ', upAlb);
            }
         }
      }
   });
};

/** updateAlbum
 *
 * updates album based on params that correspond to fields in album schema
 *TODO -- add validation in fucntion
 * @param {*} userId -id of content owner
 * @param {*} albumID
 * @param {*} objOfItemsToUpdate - obj in form sent to mongo  update methods - can include {alb_Name: albumName,
      alb_shortDescription: albumShortDesc,
      alb_description: albumDesc,
      alb_PhotoList: photoList,
      alb_coverPhoto:}
 *
 * @return returns updated obj
 */
albumMethods.updateAlbum = async (userId, albumId, objOfItemsToUpdate) => {
   //TODO -- write method to validate ownership
   let validatedAlbumBool = await ASYNCisUserOwnerOfAlbum(userId, albumId);

   if (validatedAlbumBool) {
      //finding album and updating all info
      Album.findByIdAndUpdate(
         albumId,
         objOfItemsToUpdate,
         (err, updatedAlbum) => {
            //TODO -- Change to update many
            if (!updatedAlbum) {
               console.log('\n\n!!!!!!!could not update album'); //Delete
               console.log(err);
            } else {
               console.log('\n\n/////// updated album\n' + updatedAlbum); //Delete
               return updatedAlbum;
            }
         },
      );
   } else {
      return null;
   }
};

albumMethods.ASYNCisUserOwnerOfAlbum = async (userId, albumId) => {
   await Album.findById(albumId, (err, album) => {
      if (album.alb_AuthorId === userId) {
         console.log('passed validation');
         return true;
      }
      console.log('did not pass validation');
      return false;
   });
};

//...................
albumMethods.getAlbumsFromUserId = async (userId) => {
   let albumList = await Album.find({ alb_AuthorId: userId });
   return albumList;
};

//////////////
module.exports = albumMethods;
