//note : much of the material in this file was based on the code in this video https://www.youtube.com/watch?v=ASuU4km3VHE
//and this one, https://www.youtube.com/watch?v=srPXMt1Q0nY

const aws = require('aws-sdk');
const multer = require('multer');

//const multerS3 = require('multer-s3');
const sharp = require('sharp');
var multerS3 = require('multer-s3-transform');
const s3 = new aws.S3();

aws.config.update({
   secretAccessKey: process.env.AWS_S_KEY,
   accessKeyId: process.env.AWS_ACCESS_KEY,
   region: process.env.AWS_REGION,
});
//rejecting files with filter
const fileFilter = (req, file, cb) => {
   if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/tiff' // TODO -- test tiff, jpegs,jpgs, and no exif data files
   ) {
      cb(null, true);
   } else {
      cb(new Error('invalid mimetype'), false);
   }
};
let fileName;
const s3Storage = {
   s3,
   bucket: process.env.AWS_BUCKET,
   // acl: 'public-read',
   metadata: function (req, file, cb) {
      cb(null, { owner_id: 'test' });
   },
   shouldTransform: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
   },
   transforms: [
      {
         id: 'original',

         key: function (req, file, cb) {
            fileName =
               file.fieldname +
               '-' +
               Date.now() +
               Math.floor(Math.random() * 100000) + //Todo--remove and keep name
               file.originalname;
            cb(null, fileName);
         },
         transform: function (req, file, cb) {
            cb(null, sharp().withMetadata());
         },
      },
      {
         id: 'thumb-200',
         key: function (req, file, cb) {
            cb(null, 'thumb-200/' + fileName);
         },
         transform: function (req, file, cb) {
            cb(null, sharp().resize({ width: 200 }).withMetadata());
         },
      },
      {
         id: 'thumb-2000',
         key: function (req, file, cb) {
            cb(null, 'thumb-2000/' + fileName);
         },
         transform: function (req, file, cb) {
            cb(null, sharp().resize({ width: 2000 }).withMetadata());
         },
      },
      {
         id: 'thumb-500',
         key: function (req, file, cb) {
            cb(null, 'thumb-500/' + fileName);
         },
         transform: function (req, file, cb) {
            cb(null, sharp().resize({ width: 500 }).withMetadata());
         },
      },
   ],
};

const pictureUpload = multer({
   fileFilter,
   storage: multerS3(s3Storage),
   limits: {
      fileSize: 1024 * 1024 * 10,
   },
});

module.exports = pictureUpload;
