const photo = document.getElementById('photoData'); //.photos;
photoJSON = JSON.parse(photo.dataset.photo);

// TODO--do better job at handling empty list--right now only running script if a first element
console.log(photoJSON.latitude);

if (photoJSON.latitude && photoJSON.longitude) {
   var mymap = L.map('photoPageMap').setView(
      [photoJSON.latitude, photoJSON.longitude],
      4,
      {
         //the last num is the zoom, the two in brackets are the coords
         zoomControl: false,
      },
   );
   mymap.scrollWheelZoom.disable();

   L.marker([photoJSON.latitude, photoJSON.longitude])
      .addTo(mymap)
      .on('click', function () {
         console.log('click!');
      });
   L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution:
         '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
   }).addTo(mymap);
} else {
   console.log('cannot get lon/lat');
}

function displayImage() {
   console.log('ClickyClick!');
}
