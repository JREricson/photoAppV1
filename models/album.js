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
      type: ObjectId,
      required: true,
   },
   alb_Name: {
      type: String,
      index: true,
      required: true,
   },
   alb_shortDescription: {
      //TODO refractor to be constistant wth cap
      type: String,
      default: '',
   },
   alb_description: {
      //TODO refractor to be constistant wth cap
      type: String,
      default: '',
   },
   alb_PhotoList: {
      type: [ObjectId],
      default: [],
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
      //TODO refractor to be constistant wth cap
      coverID: { type: ObjectId },
      coverFileName: { type: String },
      required: false,
   },
});

const album = mongoose.model('album', AlbumSchema);
module.exports = album;
