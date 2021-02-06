//holds the photo
// photoGallery = document.getElementById('photoGallery');
// const vw = Math.max(
//    document.documentElement.clientWidth || 0,
//    window.innerWidth || 0,
// );
// const vh = Math.max(
//    document.documentElement.clientHeight || 0,
//    window.innerHeight || 0,
// );
// $('#photoGallery').justifiedGallery({
//    rowHeight: Math.floor(vh / 3.3),
//    lastRow: 'nojustify',
//    margins: 20,
//    lastRow: 'center',
// });

//make above seperate script
//search fields
const contentSearch = document.getElementById('photoSearch');
const tagSearch = document.getElementById('tagSearch');

const userSearch = document.getElementById('userSearch');
const longSearch = document.getElementById('longSearch');
const latSearch = document.getElementById('latSearch');
const distSearch = document.getElementById('distSearch');
const maxIso = document.getElementById('maxIso');
const minIso = document.getElementById('minIso');
const maxExp = document.getElementById('maxExp');
const minExp = document.getElementById('minExp');
const maxFStop = document.getElementById('maxFStop');
const minFStop = document.getElementById('minFStop');
const caption = document.getElementById('caption');
const desc = document.getElementById('desc');

const photoQuery = document.getElementById('photoQuery'); //.photos;
const query = JSON.parse(photoQuery.dataset.query);
const routePath = photoQuery.dataset.path;

let queryList = [
   contentSearch,
   tagSearch,
   userSearch,
   longSearch,
   latSearch,
   distSearch,
   maxIso,
   minIso,
   maxExp,
   minExp,
   maxFStop,
   minFStop,
   caption,
   desc,
];
let queryKeyList = [
   'search',
   'tags',
   'user',
   'lon',
   'lat',
   'dist',
   'maxIso',
   'minIso',
   'expTimeMax',
   'expTimeMin',
   'fNumberMax',
   'fNumberMin',
   'caption',
   'desc',
];

//search button
loadResults = document.getElementById('loadResults');

//used for hiding and showing power search options
powerSearchBtn = document.getElementById('powerSearchBtn');
powerSearch = document.getElementById('powerSearch');
powerSearch.style.display = 'none';

const ReloadWithQueryString = () => {
   queryString = generateQueryStringFromSearchFields();
   // window.location.href = '/photos?' + queryString;
   window.location.href = routePath + queryString;
};

loadResults.addEventListener('click', ReloadWithQueryString);

const generateQueryStringFromSearchFields = () => {
   queryString = '';

   queryList.forEach((query, ndx) => {
      if (query.value.length > 0) {
         queryString += `${queryKeyList[ndx]}=${query.value}&`;
      }
   });
   return queryString.slice(0, -1);
};

const togglePowerSearch = () => {
   if (powerSearch.style.display == 'block') {
      powerSearch.style.display = 'none';
      powerSearchBtn.innerHTML = 'Show Power Search Options';
   } else {
      powerSearch.style.display = 'block';
      powerSearchBtn.innerHTML = 'Hide Power Search Options';
   }
};
powerSearchBtn.addEventListener('click', togglePowerSearch);

/**
 * searches if ener is hit --to be added to search fields
 * @param {*} event
 */
const searchIfEnterPressed = (event) => {
   if (event.keyCode == 13) {
      ReloadWithQueryString();
   }
};

//adding enter listener to search fields
queryList.forEach((searchField) => {
   searchField.onkeydown = searchIfEnterPressed;
});

/**
 *
 * @param {*} ndx
 */
const showPowerSearchIfNeeded = (ndx) => {
   if (ndx > 0) {
      if (powerSearch.style.display != 'block') {
         powerSearch.style.display = 'block';
         powerSearchBtn.innerHTML = 'Hide Power Search Options';
      }
   }
};

//generting search fields from query
queryList.forEach((searchField, ndx) => {
   if (query) {
      let queryKey = queryKeyList[ndx];
      if (query[queryKey]) {
         showPowerSearchIfNeeded(ndx);
         searchField.value = query[queryKey];
      }
   }
});

//vaildation methods would go here
