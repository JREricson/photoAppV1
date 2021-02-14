//note based on code from https://codepen.io/JacobLett/pen/jOEpVxz

//let scroll = document.scrollTop();

const setNavbarColor = () => {
   let nav = document.getElementById('profileNav');
   nav.classList.remove('bg-dark');
   nav.classList.remove('navbar-dark');
   nav.style.backgroundColor = 'rgba(255, 255, 255,0.4';

   console.log('sc', scroll);
   window.addEventListener('scroll', () => {
      let scroll = window.pageYOffset;
      console.log(scroll);

      if (scroll >= 60) {
         //clearHeader, not clearheader - caps H
         nav.classList.add('bg-dark');
         nav.classList.add('navbar-dark');
         nav.style.backgroundColor = 'rgba(255, 255, 255)';
      } else {
         nav.classList.remove('bg-dark');
         nav.classList.remove('navbar-dark');
         nav.style.backgroundColor = 'rgba(255, 255, 255,0.4)';
      }
   });
};

setNavbarColor();

// $(document).ready(function () {
//    $(window).scroll(function () {
//       var scroll = $(window).scrollTop();

//       //>=, not <=
//       if (scroll >= 60) {
//          //clearHeader, not clearheader - caps H
//          $('.navbar').addClass('bg-light');
//       } else {
//          $('.navbar').removeClass('bg-light');
//       }
//    }); //missing );

//    // document ready
// });
