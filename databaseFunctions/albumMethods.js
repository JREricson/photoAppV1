//Schemas
const User = require('../models/user');

const mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;

const Album = require('../models/album');
const Photo = require('../models/photo');

///
const photoMethods = require('./photoMethods');

//const { delete } = require('../routes/user');

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
         //         if (Object.keys(album.alb_PhotoList).length > 0) {
         if (album.alb_PhotoList.length > 0) {
            console.log(
               'first photoID is ',
               //Object.keys(album.alb_PhotoList)[0],
               album.alb_PhotoList[0],
            );
            let firstPhotoId = album.alb_PhotoList[0];
            let photo = await Photo.findById(firstPhotoId);
            console.log('photo is', photo);
            if (photo) {
               console.log('updating album with photo');
               let updatedAlb = await Album.findByIdAndUpdate(album._id, {
                  alb_coverPhoto: {
                     coverID: photo._id,
                     coverFileName: photo.fileName, //TODO-change all ref back to fileName
                  },
               });
               console.log('updated alm is ', updatedAlb);
            }
         }
      } else {
         console.log(
            'there is a cover photo: ',
            album.alb_coverPhoto.coverFileName,
         );
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

albumMethods.removeAllAlbumsWithUserId = async (userId) => {
   console.log('attemping to delete all albums wth id:', userId);
   await Album.deleteMany({ alb_AuthorId: userId });
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
   console.log('attempting to delete photos from album(s) ');
   let photoListObj = {};
   // let photoIdList = [];

   // photoIdList.forEach((id) => {
   //    // photoListObj = { ...photoListObj, ...{ photoIdList: id } };
   //    photoIdList.push(id);
   //    console.log('da Is iz:', id);
   // });
   console.log('PhotoListObj', photoListObj);
   console.log('alb Id List', albumIdList);

   try {
      await Album.updateMany(
         { _id: { $in: albumIdList } },
         { $pull: { alb_PhotoList: { $in: photoIdList } } },
      );
   } catch {
      console.log('cannot delete');
   }
};

albumMethods.deletePhotosFromAlbumsAndPhotosAndFs = async (photoIdList) => {
   console.log('attempt to delete all photos from fs');

   let albumList = await albumMethods.createArrayOfAlbumsContainingPhotoIdInPhotoList(
      photoIdList,
   );
   let albumIdList = [];
   albumList &&
      albumList.forEach((album) => {
         albumIdList.push(album._id);
      });
   console.log('photo is found in these albums', albumIdList);

   await albumMethods.ASYNCremoveAllAlbumReferencesToPhotosInList(
      albumIdList,
      photoIdList,
   );

   await photoMethods.removeMultiplePhotosFromDBAndFS(photoIdList);

   //need to delete from user photo list
   //remove all album referneces
};

albumMethods.createArrayOfAlbumsContainingPhotoIdInPhotoList = async (
   photoIdList,
) => {
   console.log('creating alb list');
   let albums = await Album.find({
      alb_PhotoList: { $in: photoIdList },
   });
   //console.log('albums with Id:', albums);
   return albums;
};
albumMethods.createIdArrayForAlbumsContainingPhotoIdInPhotoList = async (
   photoIdList,
) => {
   let IdList = [];
   console.log('creating alb Id list');
   let albums = await Album.find({
      alb_PhotoList: { $in: photoIdList },
   });
   albums &&
      albums.forEach((album) => {
         IdList.push(album._id);
      });
   console.log('the list of all alb with photo in list is ', IdList);

   //console.log('albums with Id:', albums);
   return IdList;
};

albumMethods.ASYNCresetCoverPhotosOfAlbumsIfInPhotoList = async (
   photoIdList,
) => {
   let albums = await Album.find({
      'alb_coverPhoto.coverID': { $in: photoIdList },
   });
   console.log('album before removal of cover', albums);

   await albumMethods.ASYNCremoveCoverPhoto(albums);

   //delete below
   let editedAlbums = await albumMethods.ASYNCrefreshAlbumList(albums);

   console.log('album after removal of cover', editedAlbums);

   //delete above

   await albumMethods.addFirstPhotoAsCoverImageIfNonePresent(editedAlbums);
};

albumMethods.ASYNCremoveAllAlbumReferencesToPhotosInList = async (
   albumIdList,
   photoIdList,
) => {
   await albumMethods.deletePhotosFromAlbumsNotFromPhotosOrFs(
      albumIdList,
      photoIdList,
   );

   await albumMethods.ASYNCresetCoverPhotosOfAlbumsIfInPhotoList(photoIdList);
};

albumMethods.ASYNCremoveCoverPhoto = async (albumList) => {
   console.log(' in ASYNCremoveCoverPhoto');
   albumList.forEach(async (album) => {
      if (album.alb_coverPhoto.coverFileName) {
         console.log('attempting to remove za alb cover');
         await Album.updateOne(
            { _id: album._id },
            { $unset: { alb_coverPhoto: '' } },
         );
      }
   });
};

albumMethods.ASYNCrefreshAlbumList = async (albums) => {
   let albIdList = [];
   albums.forEach((album) => {
      albIdList.push(album._id);
   });

   let editedAlbums = await Album.find({
      _id: { $in: albIdList },
   });
   return editedAlbums;
};

albumMethods.ASYNCfindAndRemoveAllReferencesToPhotosInAlbum = async (
   albumId,
) => {
   let album = await Album.findById(albumId);
   let photoIdList = album.alb_PhotoList;
   console.log('removing all references to photos in list:', photoIdList);
   let albumIdList = await albumMethods.createIdArrayForAlbumsContainingPhotoIdInPhotoList(
      photoIdList,
   );
   console.log('lb id list izzzz :', albumIdList);

   await albumMethods.ASYNCremoveAllAlbumReferencesToPhotosInList(
      albumIdList,
      photoIdList,
   );
};

//////////////
module.exports = albumMethods;
