////////////
//packages
///////////
const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');

//landing

router.get('/photos/:photoKey', (req, res) => {
   aws.config.update({
      secretAccessKey: process.env.AWS_S_KEY,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      region: process.env.AWS_REGION,
   });
   let s3 = new aws.S3();

   s3.getObject(
      {
         Bucket: process.env.AWS_BUCKET,
         Key: req.params.photoKey,
      },
      (err, data) => {
         if (err) {
            console.log(err, err.stack);
            res.send(err);
         } else {
            returnImg(res, data);
         }
      },
   );
});

router.get('/photos/:photoKey/thumb/:size', (req, res) => {
   aws.config.update({
      secretAccessKey: process.env.AWS_S_KEY,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      region: process.env.AWS_REGION,
   });
   let s3 = new aws.S3();

   s3.getObject(
      {
         Bucket: process.env.AWS_BUCKET + '/thumb-' + req.params.size,
         Key: req.params.photoKey,
      },
      (err, data) => {
         if (err) {
            console.log(err, err.stack);
            res.send(err);
         } else {
            returnImg(res, data);
         }
      },
   );
});

const returnImg = (res, data) => {
   res.contentType('image/jpeg');
   res.end(data.Body, 'binary');
};

module.exports = router;
