const exifData = document.getElementById('exifData');

document
   .getElementById('uploadFormText')
   .addEventListener('change', async (e) => {
      let files = Array.from(e.target.files);

      exifs = [];
      await Promise.all(
         files.map(async (file, ndx) => {
            let exif = await loadExifData(file);
            exifs.push({ ndx, exif, fileName: file.name });
            //console.log(ex);
         }),
      );
      console.log(exifs);
      console.log(JSON.stringify(exifs));
      document.getElementById('exifData').value = JSON.stringify(exifs);
      console.log(document.getElementById('exifData').value);

      //let exifs = await Promise.all(files.map(exifr.parse))
      // let dates = exifs.map((exif) => exif.DateTimeOriginal.toGMTString());
      //console.log(`${files.length} photos taken on:`, dates);
   });

/**
 *
 * @param {*} file
 */
const loadExifData = async (file) => {
   let exif;
   try {
      exif = await exifr.parse(file);
   } catch (err) {
      console.log(err);
   }
   return exif;
};

//</script>
