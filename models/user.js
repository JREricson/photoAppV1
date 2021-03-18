/*jshint esversion: 6 */
const mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId,
   textSearch = require('mongoose-text-search');

const UserSchema = new Schema({
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
      default: {},
      required: true,
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
   },
});

//adding indexes
UserSchema.plugin(textSearch);
UserSchema.index({
   name: 'text',
   brandName: 'text',
   website: 'text',
   bio: 'text',
   homeLocation: 'text',
});

////////////////////////
const User = mongoose.model('User', UserSchema);
module.exports = User;
