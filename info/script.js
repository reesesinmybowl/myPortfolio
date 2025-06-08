// === BLOB CURSOR SETUP ===
const blob = document.createElement('div');
blob.classList.add('blob-cursor');
document.body.appendChild(blob);

// === TARGET TEXT ===
const right = document.querySelector('.right');
const paragraphs = document.querySelectorAll('.right p');

// Wrap each word and each letter inside <span>
paragraphs.forEach(p => {
  const wrapped = p.innerText.split(' ').map(word => {
    const letters = [...word].map(letter => `<span class="char">${letter}</span>`).join('');
    return `<span class="word">${letters}</span>`;
  }).join(' ');
  p.innerHTML = wrapped;
});

const letters = document.querySelectorAll('.char');

// === INTERACTION LOGIC ===
document.addEventListener('mousemove', (e) => {
  const rect = right.getBoundingClientRect();
  const withinRight =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  if (withinRight) {
    blob.style.opacity = 1;
    blob.style.top = `${e.clientY}px`;
    blob.style.left = `${e.clientX}px`;

    letters.forEach(letter => {
      const r = letter.getBoundingClientRect();
      const dx = r.left + r.width / 2 - e.clientX;
      const dy = r.top + r.height / 2 - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const maxDist = 150;
      const proximity = Math.max(0, (maxDist - dist) / maxDist);

      const scale = 1 + proximity * 1.0;
      const blur = proximity * 2.0;

      letter.style.transform = `scale(${scale})`;
      letter.style.filter = `blur(${blur}px)`;
    });
  } else {
    blob.style.opacity = 0;
    letters.forEach(letter => {
      letter.style.transform = 'scale(1)';
      letter.style.filter = 'blur(0)';
    });
  }
});
