//code adapted from here
//https://stackoverflow.com/questions/38170366/leaflet-adjust-popup-to-picture-size/38172374#38172374
////////////////////////
// document.querySelector(".leaflet-popup-pane").addEventListener("load", function (event) {
// 	var target = event.target,
//   		tagName = target.tagName,
//       popup = map._popup;

//   console.log("got load event from " + tagName);

//   if (tagName === "IMG" && popup) {
//   	popup.update();
//   }
// }, true);
///////////////////

const photos = document.getElementById('photoData'); //.photos;
photosJSON = JSON.parse(photos.dataset.photos);

//TODO -- viewpost variables do not seem to be working as intended

// TODO--do better job at handling empty list--right now only running script if a first element
if (photosJSON[0]) {
   //setting viewport variables (https://stackoverflow.com/questions/1248081/how-to-get-the-browser-viewport-dimensions)
   const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0,
   );
   const vh = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0,
   );

   console.log('DEBUG: vh is ' + vh);

   var mymap = L.map('mapid').setView([20, 0], 2, {
      //the last num is the zoom, the two in brackets are the coords
      zoomControl: false,
   });
   mymap.scrollWheelZoom.disable();

   //console.log(photosJSON[0]._id);
   photosJSON.forEach((photo) => {
      if (
         photo.latitude &&
         photo.latitude.length > 0 &&
         photo.longitude &&
         photo.longitude.length > 0
      ) {
         // TODO--currently no safeguards against improper GPS coords
         //TODO -- seperate styles

         function generatePopupString(photo, viewPortH, viewPortW) {
            const vw = Math.max(
               document.documentElement.clientWidth || 0,
               window.innerWidth || 0,
            );
            const vh = Math.max(
               document.documentElement.clientHeight || 0,
               window.innerHeight || 0,
            );

            let maxWidth = Math.floor(vw * 0.5);
            let maxHeight = Math.floor(vh * 0.4);

            console.log('max width:' + maxWidth);
            returnString =
               //img with link
               '<a href="../../../photos/' +
               photo._id +
               '/photo"><img style="max-width:' +
               maxWidth +
               'px;max-height:' +
               maxHeight +
               'px" src="/resources/photos/' + //TODO would want to change to a thumbnail
               photo.fileName +
               '/thumb/200"/> <a/>' +
               //photo caption
               '<h3>' +
               photo.caption +
               '</h3>' +
               //author with link
               '<a href="/users/' +
               photo.submittedByID +
               '/profile"><h4>submitted by ' +
               photo.author +
               '</h4></a>' +
               //GPS
               '<p>GPS: ' +
               photo.latitude +
               ',' +
               photo.longitude;
            console.log(returnString);
            return returnString;
         }

         //TODO -- could extract this as a partial or make int a function// TODO could include city location in future
         let photoPin = L.marker([photo.latitude, photo.longitude])
            .bindPopup(generatePopupString(photo, vh, vw), {
               maxWidth: 'auto',
            })

            .addTo(mymap);
         // .on('click'); //displayImage function can be added here

         // photoPin.photoID = photo._id;
      } else {
         console.log('cannot get lon/lat');
      }

      //console.log(photo);
   });

   // function displayImage(e) {
   //    alert('click' + this.photoID);
   // }

   L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution:
         '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
   }).addTo(mymap);
}
