const mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId,
   textSearch = require('mongoose-text-search');

const PhotoSchema = new Schema({
   submittedByID: {
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
      type: Date,
      required: false,
   },
   longitude: {
      type: String,
      default: '',
   },
   location_2dsphere: {
      type: { type: String, default: 'Point' },
      //defaults  given as work around for nt being able to index a null value
      coordinates: {
         type: [Number],
         //stored as [lon, lat] in geoJSON
         default: [-139.3145, -30], // null value is in the Pacific Ocean
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

//adding indexes
PhotoSchema.plugin(textSearch);
PhotoSchema.index(
   { tags: 'text' },
   { author: 'text' },
   { description: 'text' },
   { caption: 'text' },
   { location_2dsphere: '2dsphere' },
);

///////////////////////////////
const Photo = mongoose.model('Photo', PhotoSchema);
module.exports = Photo;
