// === EKKO VIDEO HOVER ===
const ekko = document.querySelector('.ekko video');
const ekkoCard = document.querySelector('.ekko');

if (ekko && ekkoCard) {
  ekkoCard.addEventListener('mouseenter', () => ekko.play());
  ekkoCard.addEventListener('mouseleave', () => {
    ekko.pause();
    ekko.currentTime = 0;
  });
}

// === MOTEL VIDEO HOVER ===
const motel = document.querySelector('.motel video');
const motelCard = document.querySelector('.motel');

if (motel && motelCard) {
  motelCard.addEventListener('mouseenter', () => motel.play());
  motelCard.addEventListener('mouseleave', () => {
    motel.pause();
    motel.currentTime = 0;
  });
}

// === FILTER BUTTONS ===
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.card').forEach(card => {
      if (filter === 'all') {
        card.style.display = 'block';
      } else {
        card.style.display = card.classList.contains(filter) ? 'block' : 'none';
      }
    });
  });
});