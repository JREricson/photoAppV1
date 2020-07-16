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
   dateSubmited: {
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
      type: String,
      required: false,
   },
   photoLocation: {
      type: String, //Change to GPS coord?
      required: false,
   },
   exifMetaData: {
      type: Object,
      required: false,
   },
});

const Photo = mongoose.model('Photo', PhotoSchema);
module.exports = Photo;
