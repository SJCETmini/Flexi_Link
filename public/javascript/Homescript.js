const primaryHeader = document.querySelector(".primary-header");
const navToggle = document.querySelector(".mobile-nav-toggle");
const primaryNav = document.querySelector(".primary-navigation");

navToggle.addEventListener("click", () => {
  primaryNav.hasAttribute("data-visible")
    ? navToggle.setAttribute("aria-expanded", false)
    : navToggle.setAttribute("aria-expanded", true);
  primaryNav.toggleAttribute("data-visible");
  primaryHeader.toggleAttribute("data-overlay");

  navToggle.firstElementChild.classList.contains("fa-bars")?
  navToggle.firstElementChild.classList.replace("fa-bars","fa-xmark"):
  navToggle.firstElementChild.classList.replace("fa-xmark","fa-bars");
});

// LOADER

window.addEventListener('load', function () {
  const loader = document.getElementsByClassName('loader')[0];
  const header = document.getElementById('header');

  setTimeout(function () {
      loader.style.display = 'none';
      header.classList.remove('navbar-hidden');
  }, 3000); 
});