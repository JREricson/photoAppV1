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
   alb_ShortDescription: {
      type: String,
      default: '',
   },
   alb_Description: {
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
   alb_CoverPhoto: {
      coverID: { type: ObjectId },
      coverFileName: { type: String },
      required: false,
   },
});
/////////////////////////////////
const album = mongoose.model('album', AlbumSchema);
module.exports = album;
