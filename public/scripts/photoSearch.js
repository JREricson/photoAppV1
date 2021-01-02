//getting content string for name and description
contentSearch = document.getElementById('photoSearch');
photoGallery = document.getElementById('photoGallery');
tagSearch = document.getElementById('tagSearch');

const searchPhotos = async (searchText) => {
   const photoRes = await fetch(`../api/photos/?search=${searchText}`);

   /*setting page data to zero*/

   photoSearch = document.getElementById('photoSearch');

   if (photoRes.ok) {
      let photoJSON = await photoRes.json();
      console.log(photoRes);
      console.log(photoJSON);

      /*generating img gallery contents from search results */

      photoGallery.innerHTML = generatePhotoHtml(photoJSON);

      /* `<a href="/photos/5f1e7a4635d1a837f0898602/photo">
   <img class="justifiedGalImg" alt="" src="https://secure.img1-fg.wfcdn.com/im/18187842/resize-h800%5Ecompr-r85/4307/43074506/Hanging+Golden+Retriever+Puppy+Statue.jpg">
</a>`; */
   } else {
      photoGallery.innerHTML = '<h2>Probelm getting results</h2>';
      console.log('problem gettingJSON');
   }
};

const runJG = async () => {
   // await searchPhotos(contentSearch.value);
   //    photoGallery.innerHTML = `<a href="/photos/5fea94768b0d71440422dc37/photo" class="jg-entry jg-entry-visible" >
   //     <img class="justifiedGalImg" alt="" src="/uploads/userImage-1609208954274_DSC0025.jpg" >
   //  </a>`;

   $('#photoGallery').justifiedGallery({
      rowHeight: Math.floor(vh / 3.3),
      lastRow: 'nojustify',
      margins: 20,
      lastRow: 'center',
   });
};

const generatePhotoHtml = (photoJSON) => {
   // TODO --fully test this function
   let html = '';

   if (
      photoJSON.photos.length > 0 &&
      Object.keys(photoJSON.errors).length === 0
   ) {
      photoJSON.photos.forEach((photo) => {
         //note -- a more advanced version would allow for pagation
         html += `<a href="/photos/${photo._id}/photo">
             <img
                class="justifiedGalImg"
                alt="${photo.caption}"
                src="/uploads/${photo.fileName}"
             />
          </a>`;
      });
   } else if (
      photoJSON.photos.length > 0 &&
      Object.keys(photoJSON.errors).length != 0
   ) {
      html = '<h2>Errors present in query</h2>';
   } else {
      html = '<h2>No results to display</h2>';
   }

   return html;
};

// photoGallery.innerHTML = `<a href="/photos/5f1e7a4635d1a837f0898602/photo">
//    <img class="justifiedGalImg" alt="" src="https://secure.img1-fg.wfcdn.com/im/18187842/resize-h800%5Ecompr-r85/4307/43074506/Hanging+Golden+Retriever+Puppy+Statue.jpg">
// </a>`;
// $(window).scroll(function () {
//    console.log('change detected');
// });

const vw = Math.max(
   document.documentElement.clientWidth || 0,
   window.innerWidth || 0,
);
const vh = Math.max(
   document.documentElement.clientHeight || 0,
   window.innerHeight || 0,
);
$('#photoGallery').justifiedGallery({
   rowHeight: Math.floor(vh / 3.3),
   lastRow: 'nojustify',
   margins: 20,
   lastRow: 'center',
});
// photoGallery.innerHTML = `<a href="/photos/5f1e7a4635d1a837f0898602/photo">
//    <img class="justifiedGalImg" alt="" src="https://secure.img1-fg.wfcdn.com/im/18187842/resize-h800%5Ecompr-r85/4307/43074506/Hanging+Golden+Retriever+Puppy+Statue.jpg">
// </a>`;

// test();

// photoGallery.addEventListener('change', () =>
//    console.log('html is now: ', photoGallery.innerHTML),
// );

contentSearch.addEventListener('input', async () => {
   await searchPhotos(contentSearch.value);
   //runJG();
});
