/*jshint esversion: 6 */

const mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;

const AlbumSchema = new mongoose.Schema({
   alb_AuthorName: {
      type: String,
      required: true,
   },
   alb_AuthorId: {
      type: [ObjectId],
      required: true,
   },
   alb_Name: {
      type: String,
      index: true,
      required: true,
   },
   alb_shortDescription: {
      type: String,
      default: '',
   },
   alb_description: {
      type: String,
      default: '',
   },
   alb_PhotoList: {
      //stored this way to be used as a hashmap
      type: { objectID: Boolean },
      default: {},
   },

   alb_LastUpdate: {
      type: Date,
      required: true,
   },
   alb_DateCreated: {
      type: Date,
      required: true,
   },

   alb_coverPhoto: {
      coverID: { type: ObjectId },
      coverFileName: { type: String },
      required: false,
   },
});

const album = mongoose.model('album', AlbumSchema);
module.exports = album;
