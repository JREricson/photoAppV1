//getting content string for name and description
contentSearch = document.getElementById('photoSearch');

const searchPhotos = async (searchText) => {
   const photoRes = await fetch(`../api/photos/?search=${searchText}`);

   /*setting page data to zero*/

   photoSearch = document.getElementById('photoSearch');

   if (photoRes.ok) {
      let photoJSON = await photoRes.json();
      console.log(photoRes);
      console.log(photoJSON);

      /*generating img gallery contents from search results */
      photoGallery = document.getElementById('photoGallery');

      photoGallery.innerHTML = `<a href="/photos/5f1e7a4635d1a837f0898602/photo">
   <img class="justifiedGalImg" alt="" src="https://secure.img1-fg.wfcdn.com/im/18187842/resize-h800%5Ecompr-r85/4307/43074506/Hanging+Golden+Retriever+Puppy+Statue.jpg">
</a>`; //showResultsOnPage(photoJSON);
   } else {
      console.log('problem gettingJSON'); //TODO  -- better err handling
   }

   // return userJSON;
};

const showResultsOnPage = (photos) => {
   // TODO --fully test this function
   let html = '';
   if (photos.length > 0) {
      photos.forEach((photo) => {
         //note -- a more advanced version would allow for pagation

         html += `<a href="/photos/${photo._id}/photo">
   <img
      class="justifiedGalImg"
      alt="${photo.caption}"
      src="/uploads/${photo.fileName}"
   />
</a>`;
      });
   } else {
      //TODO unneeded???
      html = '';
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

// $('#photoGallery').justifiedGallery();

contentSearch.addEventListener('input', () => searchPhotos(contentSearch.value));