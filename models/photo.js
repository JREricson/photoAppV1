const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
   SubmittedByID: {
      type: String,
      required: true,
   },
   author: {
      type: String,
      required: true,
   },
   caption: {
      type: String,
      default: '',
   },
   description: {
      type: String,
      default: '',
   },
   dateSubmitted: {
      //TODO refacror all other code to submitted
      type: Date,
      default: Date.now,
   },
   fileLocation: {
      type: String,
      required: true,
   },
   fileName: {
      type: String,
      required: true,
   },
   dateTaken: {
      type: String, //TODO change to date
      required: false,
   },
   longitude: {
      type: String,
      required: false,
   },

   longitude: {
      type: String,
      default: '',
   },
   latitude: {
      type: String,
      default: '',
   },
   tags: {
      type: Array,
      default: [],
   },
   exifMetaData: {
      type: Object,
      required: false,
   },
});

const Photo = mongoose.model('Photo', PhotoSchema);
module.exports = Photo;
