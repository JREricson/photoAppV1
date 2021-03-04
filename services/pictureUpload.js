//note : much of the material in this file was based on the code in this video https://www.youtube.com/watch?v=ASuU4km3VHE
//and this one, https://www.youtube.com/watch?v=srPXMt1Q0nY

const aws = require('aws-sdk');
const multer = require('multer');

const multerS3 = require('multer-s3');
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

const s3Storage = {
   s3,
   bucket: process.env.AWS_BUCKET,
   // acl: 'public-read',
   metadata: function (req, file, cb) {
      cb(null, { owner_id: 'test' });
   },
   key: function (req, file, cb) {
      const uniqueSuffix =
         Date.now() + Math.floor(Math.random() * 100000) + file.originalname;
      cb(null, file.fieldname + '-' + uniqueSuffix);
   },
};

const pictureUpload = multer({
   fileFilter,
   storage: multerS3(s3Storage),
   limits: {
      fileSize: 1024 * 1024 * 10,
   },
});

module.exports = pictureUpload;
