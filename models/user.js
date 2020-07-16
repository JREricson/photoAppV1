/*jshint esversion: 6 */
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   brandName: {
      type: String,
      required: false,
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

   bio: {
      type: String,
      required: false,
   },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
