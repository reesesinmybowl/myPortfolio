const right = document.querySelector('.right');
const paragraphs = document.querySelectorAll('.right p');

// Wrap each word and each letter inside it
paragraphs.forEach(p => {
  const wrapped = p.innerText.split(' ').map(word => {
    const letters = [...word].map(letter => `<span class="char">${letter}</span>`).join('');
    return `<span class="word">${letters}</span>`;
  }).join(' ');
  p.innerHTML = wrapped;
});

const letters = document.querySelectorAll('.char');

// Hover effect on mousemove
document.addEventListener('mousemove', (e) => {
  const rect = right.getBoundingClientRect();
  const withinRight =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  if (withinRight) {
    letters.forEach(letter => {
      const r = letter.getBoundingClientRect();
      const dx = r.left + r.width / 2 - e.clientX;
      const dy = r.top + r.height / 2 - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const maxDist = 150;
      const proximity = Math.max(0, (maxDist - dist) / maxDist);

      const scale = 1 + proximity * 0.2;
      const blur = proximity * 1.5;

      letter.style.transform = `scale(${scale})`;
      letter.style.filter = `blur(${blur}px)`;
    });
  } else {
    letters.forEach(letter => {
      letter.style.transform = 'scale(1)';
      letter.style.filter = 'blur(0)';
    });
  }
});
