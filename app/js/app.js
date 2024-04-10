let title1 = document.querySelector('.title1');
let dropdownOpen1 = document.querySelector('.dropdown-open-1');

title1.addEventListener('click', function() {
  if (dropdownOpen1.style.display === 'none' || dropdownOpen1.style.display === '') {
    dropdownOpen1.style.display = 'block';
  } else {
    dropdownOpen1.style.display = 'none';
  }
});