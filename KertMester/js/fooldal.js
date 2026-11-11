const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');

document.querySelectorAll('.shot-open').forEach((button) => {
  button.addEventListener('click', () => {
    lightboxImg.src = button.dataset.src;
    lightboxImg.alt = button.dataset.title;
    lightboxTitle.textContent = `${button.dataset.title} (mintakép)`;
    lightbox.showModal();
  });
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.close();
});
