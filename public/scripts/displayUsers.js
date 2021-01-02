//performs a search when user enters input -- might be a better idea to have on a delay in a future version to limit
//calss to server

//holds limit for number of results to be returned

let loadMoreButton = document.getElementById('loadMore');
let userSearch = document.getElementById('userSearch');
let profileSearch = document.getElementById('profileSearch');
let userInfo = document.getElementById('userInfo');
let data = document.getElementById('variables');

// let page = data.dataset.page;
// let limit = data.dataset.limit;
loadMoreButton.style.display = 'none';

data.dataset.limit = 1; //TODO-set back to 25

userSearch.addEventListener('input', () => {
   data.dataset.searchType = 'name'; //searchs usernames only
   data.dataset.page = 0;
   //page = 0;
   userInfo.innerHTML = '';

   searchUsers();
});

profileSearch.addEventListener('input', () => {
   data.dataset.searchType = 'search'; //searches all searchable feilds
   data.dataset.page = 0;
   //page = 0;
   userInfo.innerHTML = '';

   searchUsers();
});

//calls users api to genterate list of users and add it to screen
const searchUsers = async () => {
   let searchText = '';
   //    loading type od search to do-- should be set by click listeners
   if (data.dataset.searchType === 'name') {
      searchText = userSearch.value;
   } else if (data.dataset.searchType === 'search') {
      searchText = profileSearch.value;
   }

   // fetching userObj from API
   const usersRes = await fetch(
      `../api/users/?${data.dataset.searchType}=${searchText}&page=${data.dataset.page}&limit=${data.dataset.limit}`,
   );
   console.log(
      `../api/users/?${data.dataset.searchType}=${searchText}&page=${data.dataset.page}&limit=${data.dataset.limit}`,
   );

   //if users data is good -- add users details to search results on screen
   if (usersRes.ok) {
      //contains entire JSON
      let userJSON = await usersRes.json();

      showResultsOnPage(userJSON.users);
   } else {
      console.log('problem gettingJSON'); //TODO  -- better err handling
   }

   // return userJSON;
};

const showResultsOnPage = async (users) => {
   // TODO --fully test this function
   let html = '';
   console.log('cur html', userInfo.innerHTML);

   if (users.length > 0) {
      users.forEach(async (user, ndx) => {
         //TODO -- test this with more data
         html += `<div class="card card-body">
         <h3> Name:  ${user.name}</h3>
         <h4> \Bio: ${user.bio}</h4>
         <h3> photoList ${user.allPhotos}</h3> <span class="photoHolder"> 
        `;

         if (user.allPhotos && user.allPhotos.length > 0) {
            // html += await generatePhotoImage(user.allPhotos[0]);

            for (i = 0; i < user.allPhotos.length && i < 3; i++) {
               html += await generatePhotoImage(user.allPhotos[i]);
            }
         } else {
            html += `<h3>${user.name} has not added any photos</h3>`;
         }

         html += ` </span> <h4>${ndx}</h4>
               <a href="/users/${user._id}/profile" class="btn btn-primary">View Profile</a>
               </div>`;

         userInfo.innerHTML += html;
      });

      //console.log('cur html', userInfo.innerHTML);
   }

   //Toggling show more button based on user list size
   if (users.length > 0) {
      loadMoreButton.style.display = ''; // = 'visible';
      //   loadMoreButtonHolder.innerHTML =
      //      '<button id="loadMore">Load more results</button>';
   } else {
      loadMoreButton.style.display = 'none';
      if (
         userInfo.innerHTML.length > 0 &&
         userInfo.innerHTML[userInfo.innerHTML.length - 2] === 'v'
      ) {
         // 'v' --> lazy way to account for async call
         userInfo.innerHTML +=
            ' <h2 class = "noResults" >No more results to display</h2>';
      } else {
         userInfo.innerHTML =
            ' <h2 class = "noResults" >no results found matching <h2>';
      }
      //  loadMoreButton.innerHTML = '<h1>No more results to display</h1>';
      //removes button there are no results
   }
};

//  ${generatePhotoGallery(user.allPhotos)}

const generatePhotoGallery = async (photoList) => {
   let html = '';

   if (photoList.length > 0) {
      photoList.forEach((id, ndx) => {
         //get photo from photo api

         //create justified gal element

         //limit to first 3 photos -- have css put all photos on same line
         console.log(id);
      });
   }
};

loadMoreButton.addEventListener('click', async () => {
   data.dataset.page++;
   console.log('page incremented' + data.dataset.page); //delete
   await searchUsers();
});

const generatePhotoImage = async (photoId) => {
   imgElement = '';

   //    if (user.allPhotos && user.allPhotos.length > 0) {
   //       for (i = 0; i < user.allPhotos.length && i < 3; i++) {
   //          let wait = 'arg';
   //          wait = await testf();

   //          imgElement += wait; //generatePhotoImage(user.allPhotos[i]);
   //          imgElement += ' <h1>!!!!!</h1> ';
   //       }
   //    }
   console.log('photoID ', photoId);
   let photoRes = await fetch(`../api/photos/?id=${photoId}`);
   //    let imgElement = '';

   if (photoRes.ok) {
      photoJSON = await photoRes.json();
      //       console.log('photo res ok');
      console.log(photoJSON);
      if (photoJSON.photos && photoJSON.photos.length > 0) {
         imgElement += `<img class="searchUserPhoto"  src="/uploads/${photoJSON.photos[0].fileName}"></img> `;
      }

      //       //html += ` <img class="searchUserPhoto" src="https://pocket-syndicated-images.s3.amazonaws.com/5f480254484fa.jpg" </img> `;
   } else {
      imgElement += '<h2>No photos added</h2>';
   }

   //return imgElement;
   return imgElement;
};
