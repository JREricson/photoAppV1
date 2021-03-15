/*jshint esversion: 6 */
const mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId,
   textSearch = require('mongoose-text-search');

const UserSchema = new Schema({
   name: {
      type: String,
      // index: true,
      required: true,
      //text: true, //creates text index
   },
   brandName: {
      type: String,
      // index: true,
      deafault: '',
      // text: true,
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
      //index: true,
      default: Date.now,
      required: true,
   },

   allPhotos: {
      type: [ObjectId],
      index: true,
      default: [],
      required: true,
   },

   socialMediaAcnts: {
      type: Object,
      //index: true,
      default: {},
      required: true,
      // text: true,
   },
   website: {
      type: String,
      //index: true,
      default: '',
      // required: true
      // text: true,
   },

   bio: {
      type: String,
      //index: true,
      default: '',
      //required: true,
      // text: true,
   },
   homeLocation: {
      type: String,
   },
});

//UserSchema.index({ name: 'text', brandName: 'text' });
UserSchema.plugin(textSearch);
UserSchema.index({
   name: 'text',
   brandName: 'text',
   website: 'text',
   bio: 'text',
   homeLocation: 'text',
});
const User = mongoose.model('User', UserSchema);
module.exports = User;
