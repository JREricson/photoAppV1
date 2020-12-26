const mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;

const PhotoSchema = new Schema({
   SubmittedByID: {
      type: ObjectId,
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
      required: true,
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
      type: Date, //TODO change to date
      required: false,
   },
   longitude: {
      type: String,
      default: '',
   },

   location_2dsphere: {
      type: { type: String, default: 'Point' },
      //CAUTION -- stored as [long, lat] in geoJSON
      //work around for nt being able to index a null value
      coordinates: {
         type: [Number],
         default: [-139, -30], // null value is in the Pacific Ocean
      },
   },
   latitude: {
      type: String,
      default: '',
   },
   tags: {
      type: [String],
      default: [],
   },
   exifMetaData: {
      type: Object,
      required: false,
   },
});

const Photo = mongoose.model('Photo', PhotoSchema);
module.exports = Photo;
