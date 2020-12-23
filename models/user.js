/*jshint esversion: 6 */
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


const UserSchema = new Schema({
   name: {
      type: String,
      index: true,
      required: true,
   },
   brandName: {
      type: String,
      index: true,
      deafault: '', 
   },
   email: {
      type: String,
      required: true,
   },

   password: {
      type: String,
      required: true,
   },
   dateJoined: {
      type: Date,
      index: true,
      default: Date.now,
      required: true,
   },

   allPhotos: {
      type: [ObjectId],
      index: true,
      default: [],
      required: true,
   },
   photoCollectionIds: {
      //an array of photo id arrays
      type: [ObjectId],
      default: [],
      required: true,
   },

   socialMediaAcnts: {
      type: Object,
      index: true,
      default: {},
      required: true,
   },
   website: {
      type: String,
      index: true,
      default: '',
     // required: true
   },

   bio: {
      type: String,
      index: true,
      default: '',
      //required: true,
   },
   homeLocation: {
      type: String,
      index: true,
   },
});

//UserSchema.index({ name: 'text', brandName: 'text' });

const User = mongoose.model('User', UserSchema);
module.exports = User;
