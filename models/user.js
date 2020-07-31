/*jshint esversion: 6 */
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
   },

   allPhotos: {
      type: Array,
      index: true,
      default: [],
   },
   portfolios: {
      //an array of photo id arrays
      type: Array,
      default: [],
   },

   socialMediaAcnts: {
      type: Object,
      index: true,
      default: {},
   },
   website: {
      type: String,
      index: true,
      default: '',
   },

   bio: {
      type: String,
      index: true,
      default: '',
   },
   homeLocation: {
      type: String,
      index: true,
      required: false,
   },
});

//UserSchema.index({ name: 'text', brandName: 'text' });

const User = mongoose.model('User', UserSchema);
module.exports = User;
