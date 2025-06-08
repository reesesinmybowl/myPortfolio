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
