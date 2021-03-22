const aws = require('aws-sdk');

const s3 = new aws.S3();

aws.config.update({
   secretAccessKey: process.env.AWS_S_KEY,
   accessKeyId: process.env.AWS_ACCESS_KEY,
   region: process.env.AWS_REGION,
});

const deleteFilesFromS3 = (bucket, keyObj) => {
   let params = {
      Bucket: bucket,
      Delete: {
         Objects: [keyObj],
         Quiet: false,
      },
   };
   s3.deleteObjects(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log(data);
   });
};

module.exports = deleteFilesFromS3;
