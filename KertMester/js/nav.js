document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navCloseBtn = document.getElementById("navCloseBtn");
  const siteNav = document.getElementById("siteNav");
  const navOverlay = document.getElementById("navOverlay");
  const navLinks = siteNav.querySelectorAll("[data-nav]");

  let lastFocused = null;

  function openNav() {
    lastFocused = document.activeElement;

    siteNav.classList.add("is-open");
    navOverlay.classList.add("is-visible");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    siteNav.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => navCloseBtn.focus(), 300);
  }

  function closeNav() {
    siteNav.classList.remove("is-open");
    navOverlay.classList.remove("is-visible");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    siteNav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lastFocused) lastFocused.focus();
  }

  hamburgerBtn.addEventListener("click", () => {
    const isOpen = siteNav.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });

  navCloseBtn.addEventListener("click", closeNav);
  navOverlay.addEventListener("click", closeNav);

  navLinks.forEach((link) => link.addEventListener("click", closeNav));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && siteNav.classList.contains("is-open")) {
      closeNav();
    }
  });
});
