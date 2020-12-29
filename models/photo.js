const mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;
textSearch = require('mongoose-text-search');

const PhotoSchema = new Schema({
   SubmittedByID: {
      type: ObjectId,
      required: true,
   },
   author: {
      type: String,
      required: true,
      //   text: true,
   },
   caption: {
      type: String,
      default: '',
      //text: true,
   },
   description: {
      type: String,
      default: '',
      // text: true,
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

   //    var ModelSchema = new Schema({
   //       type : { type: String, index: true },
   //       loc  : { type: [Number], index: '2dsphere' }
   //   });

   location_2dsphere: {
      type: { type: String, default: 'Point' },
      //CAUTION -- stored as [long, lat] in geoJSON
      //work around for nt being able to index a null value
      coordinates: {
         type: [Number],
         default: [-139, -30], // null value is in the Pacific Ocean
      },

      //index: { type: '2dsphere' },
   },
   latitude: {
      type: String,
      default: '',
   },
   tags: {
      type: [String],
      default: [],
      // text: true,
   },
   exifMetaData: {
      type: Object,
      required: false,
   },
});

PhotoSchema.plugin(textSearch);

//adding indexes
PhotoSchema.index({ location_2dsphere: '2dsphere' });
PhotoSchema.index(
   { tags: 'text' },
   { author: 'text' },
   { description: 'text' },
   { caption: 'text' },
);

const Photo = mongoose.model('Photo', PhotoSchema);
module.exports = Photo;
