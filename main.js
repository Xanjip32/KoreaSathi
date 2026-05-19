document.addEventListener('DOMContentLoaded', () => {

  const hamburger = document.getElementById('hamburger');
  const dropdownMenu = document.getElementById('dropdownMenu');

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    dropdownMenu.classList.remove('active');
  });

});