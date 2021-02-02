const deleteOptions = document.getElementById('deleteOptions');
const deleteOptionToggleBtn = document.getElementById('deleteOptionToggleBtn');

const toggleDeleteOptions = () => {
   if (deleteOptions.style.display == 'block') {
      deleteOptions.style.display = 'none';
      deleteOptionToggleBtn.innerHTML = 'DELETE ALBUM';
   } else {
      deleteOptions.style.display = 'block';
      deleteOptions.scrollIntoView();
      deleteOptionToggleBtn.innerHTML = 'Hide delete options';
   }
};
deleteOptionToggleBtn.addEventListener('click', toggleDeleteOptions);
