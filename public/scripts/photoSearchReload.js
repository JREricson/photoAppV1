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
contentSearch = document.getElementById('photoSearch');
tagSearch = document.getElementById('tagSearch');

userSearch = document.getElementById('userSearch');
longSearch = document.getElementById('longSearch');
latSearch = document.getElementById('latSearch');
distSearch = document.getElementById('distSearch');
maxIso = document.getElementById('maxIso');
minIso = document.getElementById('minIso');
maxExp = document.getElementById('maxExp');
minExp = document.getElementById('minExp');
maxFStop = document.getElementById('maxFStop');
minFStop = document.getElementById('minFStop');

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
   'expTimeMin',
   'expTimeMax',
   'fNumberMin',
   'fNumberMax',
];

//search button
loadResults = document.getElementById('loadResults');

//used for hiding and showing power search options
powerSearchBtn = document.getElementById('powerSearchBtn');
powerSearch = document.getElementById('powerSearch');
powerSearch.style.display = 'none';

const ReloadWithQueryString = () => {
   queryString = generateQueryStringFromSearchFields();
   window.location.href = '/photos?' + queryString;
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
queryList.forEach((searchFeild) => {
   searchFeild.onkeydown = searchIfEnterPressed;
});

//vaildation methods would go here
