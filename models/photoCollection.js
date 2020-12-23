/*jshint esversion: 6 */

const mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;

const UserSchema = new mongoose.Schema({
   col_Name: {
      type: String,
      index: true,
      required: true,
   },
   col_shortDescription: {
      type: String,
      default: '',
   },
   col_description: {
      type: String,
      default: '',
   },
   col_PhotoList: {
      type: [ObjectID],
      required: false,
   },
   col_PrimaryAuthor: {
      type: String,
      required: true,
   },
   col_AuthorIdList: {
      //stores list of contributing authors
      type: [ObjectID],
      required: true,
   },
   col_LastUpdate: {
      type: Date,
      required: true,
   },
   col_DateCreated: {
      type: Date,
      required: true,
   },
   col_UpdatedBy: {
      type: mongoose.ObjectIds,
      required: true,
   },
});

const photoCollection = mongoose.model(
   'photoCollection',
   PhotoCollectionSchema,
);
module.exports = photoCollection;
