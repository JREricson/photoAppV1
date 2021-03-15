//performs a search when user enters input -- might be a better idea to have on a delay in a future version to limit
//calss to server

//holds limit for number of results to be returned

let loadMoreButton = document.getElementById('loadMore');
let userSearch = document.getElementById('userSearch');
let profileSearch = document.getElementById('profileSearch');
let userInfo = document.getElementById('userInfo');
let data = document.getElementById('variables');
let done = true;
const TIMER_MAX = 1000;
let timer = TIMER_MAX;

const userSearchClickListener = async () => {
   data.dataset.searchType = 'name';
   data.dataset.page = 0;

   await setCountDown();
};

const setCountDown = async () => {
   if (timer == TIMER_MAX) {
      console.log('timer st.');
      while (timer != 0) {
         timer--;
      }
      userInfo.innerHTML = '';
      await searchUsers();
      timer = TIMER_MAX;
   } else {
      timer = TIMER_MAX;
   }
};

// let page = data.dataset.page;
// let limit = data.dataset.limit;
loadMoreButton.style.display = 'none';

data.dataset.limit = 20;

userSearch.addEventListener('input', userSearchClickListener);

profileSearch.addEventListener('input', async () => {
   data.dataset.searchType = 'search'; //searches all searchable feilds
   data.dataset.page = 0;

   userInfo.innerHTML = '';

   await setCountDown();
});

//calls users api to genterate list of users and add it to screen
const searchUsers = async () => {
   //delayfunc();

   let searchText = '';
   //    loading type od search to do-- should be set by click listeners
   if (data.dataset.searchType === 'name') {
      searchText = userSearch.value;
   } else if (data.dataset.searchType === 'search') {
      searchText = profileSearch.value;
   }
   if (searchText !== '') {
      // fetching userObj from API
      const usersRes = await fetch(
         `../api/users/?${data.dataset.searchType}=${searchText}&page=${data.dataset.page}&limit=${data.dataset.limit}`,
      );

      //if users data is good -- add users details to search results on screen
      if (usersRes.ok) {
         //contains entire JSON
         let userJSON = await usersRes.json();
         if (data.dataset.page == 0) {
            userInfo.innerHTML = '';
         }
         await showResultsOnPage(userJSON.users);
      } else {
         console.log('problem gettingJSON'); //TODO  -- better err handling
      }
   } else {
      userInfo.innerHTML = '';
   }
   done = true;
   // return userJSON;
};

const showResultsOnPage = async (users) => {
   let html = '';

   for (const user of users) {
      await generateSeachHtml(user);
   }

   //console.log('cur html', userInfo.innerHTML);

   //Toggling show more button based on user list size
   if (users.length > 0) {
      loadMoreButton.style.display = ''; // = 'visible';
   } else {
      loadMoreButton.style.display = 'none';

      userInfo.innerHTML += ' <h2 class = "noResults" >no results found  <h2>';
   }
};

loadMoreButton.addEventListener('click', async () => {
   data.dataset.page++;
   console.log('page incremented' + data.dataset.page); //delete
   await searchUsers();
});

const generateSeachHtml = async (user) => {
   console.log('html func');
   //TODO -- test this with more data
   html = `<div class="card card-body">
<h3> Name:  ${user.name}</h3>
<h4> \Bio: ${user.bio}</h4>
 <span class="photoHolder"> 
`;

   if (user.allPhotos && user.allPhotos.length > 0) {
      for (i = 0; i < user.allPhotos.length && i < 3; i++) {
         html += await generatePhotoImage(user.allPhotos[i]);
      }
   } else {
      html += `<h3>${user.name} has not added any photos</h3>`;
   }

   html += ` </span> 
      <a href="/users/${user._id}/profile" class="btn btn-primary">View Profile</a>
      </div>`;

   userInfo.innerHTML += html;
};

const generatePhotoImage = async (photoId) => {
   imgElement = '';

   console.log('photoID ', photoId);
   let photoRes = await fetch(`../api/photos/?id=${photoId}`);

   if (photoRes.ok) {
      photoJSON = await photoRes.json();
      console.log(photoJSON);
      if (photoJSON.photos && photoJSON.photos.length > 0) {
         imgElement += `<img class="searchUserPhoto"  src="resources/photos/${photoJSON.photos[0].fileName}/thumb/200"></img> `;
      }
   } else {
      imgElement += '<h2>No photos added</h2>';
   }

   return imgElement;
};
