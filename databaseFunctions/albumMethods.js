//Schemas
const User = require('../models/user');

const mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;

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
   !albumName && (albumName = 'Untitled_' + curDate);
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

//TODO see if can clean up with less findbyId methods
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
               let updatedAlb = await Album.findByIdAndUpdate(album._id, {
                  alb_coverPhoto: {
                     coverID: photo._id,
                     coverFileName: photo.fileName,
                  },
               });
               console.log('updated alm is ', updatedAlb);
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
   // let validatedAlbumBool = await albumMethods.ASYNCisUserOwnerOfAlbum(userId, albumId);

   //finding album and updating all info
   Album.findByIdAndUpdate(albumId, objOfItemsToUpdate, (err, updatedAlbum) => {
      //TODO -- Change to update many
      if (!updatedAlbum) {
         console.log('\n\n!!!!!!!could not update album'); //Delete
         console.log(err);
      } else {
         console.log('\n\n/////// updated album\n' + updatedAlbum); //Delete
         return updatedAlbum;
      }
   });
};

albumMethods.ASYNCisUserOwnerOfAlbum = async (userId, albumId) => {
   let returnBool = false;
   await Album.findById(albumId, (err, album) => {
      console.log(
         'alb auth ID/usId, ',
         album.alb_AuthorId.toString(),
         ' ',
         userId.toString(),
      );
      if (album.alb_AuthorId.toString() === userId.toString()) {
         console.log('album passed ownership validation');
         returnBool = true;
      } else {
         console.log('album did not pass ownership validation');
      }
   });
   return returnBool;
};

//...................
albumMethods.getAlbumsFromUserId = async (userId) => {
   let albumList = await Album.find({ alb_AuthorId: userId });
   return albumList;
};

albumMethods.deletePhotosFromAlbumsNotFromPhotosOrFs = async (
   albumIdList,
   photoIdList,
) => {
   console.log('attempting to delete photos  from album ');
   let unsetObj = {};

   photoIdList.forEach((id) => {
      //let photoIdRemovalStr = `alb_PhotoList[${id}]`;
      let photoIdRemovalStr = `alb_PhotoList.${id}`;
      unsetObj[photoIdRemovalStr] = '';
   });
   console.log('unsetObj', unsetObj);
   console.log('alb Id List', albumIdList);

   try {
      await Album.updateMany(
         { _id: { $in: albumIdList } },
         {
            $unset: unsetObj,
         },
      );
   } catch {
      console.log('cannot delete');
   }
};

albumMethods.deletePhotosFromAlbumsAndPhotosAndFs = async (photoIdList) => {
   console.log('attempt to delete all photos from fs');

   let albumIdList = await albumMethods.createArrayOfAlbumsContainingPhotoIdInPhotoList(
      photoIdList,
   );

   /*    //TODO -this only removes from one!
   await albumMethods.deletePhotosFromMulAlbumsNotFromPhotosOrFs(
      albumIdList,
      photoIdList,
   );
   await photoMethods.removeMultiplePhotosFromDBAndFS(photoIdList);
 */
   //need to delete from user photo list
   //remove all album referneces
};

albumMethods.createArrayOfAlbumsContainingPhotoIdInPhotoList = async (
   photoIdList,
) => {
   console.log('creating alb list');
   let albums = await Album.find({
      _id: '601207cd6309c70a4ca43d5e',
   });
   console.log('albums with Id:', albums);
   return albums;
};

//////////////
module.exports = albumMethods;
