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

/**
 * generates list of all albums
 * @param {*} userId
 * @returns list of album IDs
 */
albumMethods.ASYNCfindAllAlbumsFromUserId = async (userId) => {
   let albums = await Album.find({
      alb_AuthorId: userId,
   });
   return albums;
};

/**
 * Creates list of album objects that have a photo ID in photoIdList
 * @param {*} photoIdList
 * @returns list of album objects
 */
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

/**
 * Creates list of album ids that have a photo ID in photoIdList
 * @param {*} photoIdList
 * @returns list of album ids
 */
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

/**
 * Pulls upto date album objects from database. purpose: used if albums have changed and object list is not currentS
 * @param {*} albums list of album objects
 * @returns list of album objects
 */
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
/////////////
//update methods
//////////////

//TODO see if can clean up with less findbyId methods

/**
 * Used to make first photo in album, the cover photo if there is no current cover photo.
 * @param {*} albumList a list of Album objs
 */
albumMethods.addFirstPhotoAsCoverImageIfNonePresent = async (albumList) => {
   console.log('in adding cover func');
   albumList.forEach(async (album) => {
      if (!album.alb_CoverPhoto.coverFileName) {
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
                  alb_CoverPhoto: {
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
            album.alb_CoverPhoto.coverFileName,
         );
      }
   });
};
////////////////////////////////////////////
//update methods that remove data/references
////////////////////////////////////////////

/**
 * Removes any reference to photos in photoIdList from albums referenced in albumIdList. (Removes cover photo if in photoIdList and removes photos from album photolist)
 * @param {*} albumIdList
 * @param {*} photoIdList
 */
albumMethods.ASYNCremoveAllAlbumReferencesToPhotosInList = async (
   albumIdList,
   photoIdList,
) => {
   await albumMethods.deletePhotoIdsFromAlbumsInList(albumIdList, photoIdList);

   await albumMethods.ASYNCresetCoverPhotosOfAlbumsIfInPhotoList(photoIdList);
};

/**
 * Removes Ids in photoIdList from all albums in albumIdList
 * Does NOT delete photo objs
 * @param {*} albumIdList list of albums to remove photos from
 * @param {*} photoIdList list of Ids to Remove
 */
albumMethods.deletePhotoIdsFromAlbumsInList = async (
   albumIdList,
   photoIdList,
) => {
   console.log('attempting to delete photos from album(s) ');
   let photoListObj = {};

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

/**
 * Removes any reference to photos in photoIdList from album with albumId. (Removes cover photo if in photoIdList and removes photos from album photolist)
 * @param {*} albumId
 */
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
/**
 * Removes the cover photo for any album in albumList
 * @param {*} albumList list of album objects
 */
albumMethods.ASYNCremoveCoverPhoto = async (albumList) => {
   console.log(' in ASYNCremoveCoverPhoto');
   albumList.forEach(async (album) => {
      if (album.alb_CoverPhoto.coverFileName) {
         console.log('attempting to remove za alb cover');
         await Album.updateOne(
            { _id: album._id },
            { $unset: { alb_CoverPhoto: '' } },
         );
      }
   });
};

/////////////
//delete methods
//////////////

//todo rewrite with scess failure options
/**
 * Used to remove all albums belonging to a user. Does NOT delete photos in the album
 * @param {*} userId
 */
albumMethods.removeAllAlbumsWithUserId = async (userId) => {
   console.log('attemping to delete all albums wth id:', userId);
   await Album.deleteMany({ alb_AuthorId: userId });
};

/////////////
//validation methods
//////////////

/**
 * Checks that user is the owner of the album. Originally made to safe guard againstpost  requests.
 * @param {*} userId
 * @param {*} albumId
 * @returns ownership boolean
 */
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

///////////////////////////////
//Todo -- go through func below check working properly
///////////////////////////////
/////////////////////////////

/**
 * Checks if a photoID in photoIdList is the cover of an album. If it is, the first photo in the list is changed to the album cover
 * @param {*} photoIdList
 */
albumMethods.ASYNCresetCoverPhotosOfAlbumsIfInPhotoList = async (
   photoIdList,
) => {
   let albums = await Album.find({
      'alb_CoverPhoto.coverID': { $in: photoIdList },
   });
   console.log('album before removal of cover', albums);

   await albumMethods.ASYNCremoveCoverPhoto(albums);
   let editedAlbums = await albumMethods.ASYNCrefreshAlbumList(albums);
   //delete below
   //

   console.log('album after removal of cover', editedAlbums);

   //delete above

   await albumMethods.addFirstPhotoAsCoverImageIfNonePresent(editedAlbums);
};

//...................

//Todo-- move to album middle
//Note! this function couples albumMethods with photoMethods
/**
 * removes all Photos in list from database, S3 file system, and references to ids
 * @param {*} photoIdList
 */
albumMethods.deletePhotosFromAlbumsAndDbAndFs = async (photoIdList) => {
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

//////////////
module.exports = albumMethods;

//method below not used -- will be removed of not used in future
/* 
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
 */
