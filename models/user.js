/*jshint esversion: 6 */
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   brandName: {
      type: String,
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
      default: Date.now,
   },

   allPhotos: {
      type: Array,
      default: [],
   },
   portfolios: {
      //an array of photo id arrays
      type: Array,
      default: [],
   },

   socialMediaAcnts: {
      type: Object,
      default: {},
   },
   website: {
      type: String,
      default: '',
   },

   bio: {
      type: String,
      default: '',
   },
   homeLocation: {
      type: String,
      required: false,
   },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
