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
      required: false,
   },
   dateTaken: {
      type: String,
      required: false,
   },
   photoLocation: {
      type: String, //Change to GPS coord?
      required: false,
   },
   metadataJSON: {
      type: JSON,
      required: false,
   },
});

const Photo = mongoose.model('Photo', PhotoSchema);
module.exports = Photo;
