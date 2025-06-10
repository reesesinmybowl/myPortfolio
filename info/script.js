// === FILTER BUTTONS (Index Page Only) ===
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

// === TYPEWRITER EFFECT (Left Sidebar) ===
document.addEventListener('DOMContentLoaded', () => {
  const animatedTextContainer = document.querySelector('.animated-text');
  const animatedWordInner = document.querySelector('.animated-word-inner');
  const words = ['Interactive', 'Graphic', 'Motion'];
  let currentIndex = 0;

  const typingSpeed = 70;
  const deletingSpeed = 40;
  const wordDisplayTime = 3000;
  const pauseBeforeTyping = 300;

  if (animatedTextContainer && animatedWordInner) {
    const measuringDiv = document.createElement('div');
    measuringDiv.style.position = 'absolute';
    measuringDiv.style.visibility = 'hidden';
    measuringDiv.style.whiteSpace = 'nowrap';
    measuringDiv.style.zIndex = '-1';
    document.body.appendChild(measuringDiv);

    const computedStyle = getComputedStyle(animatedWordInner);
    Object.assign(measuringDiv.style, {
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      letterSpacing: computedStyle.letterSpacing,
      lineHeight: computedStyle.lineHeight,
      textTransform: computedStyle.textTransform
    });

    function getTextWidth(text) {
      measuringDiv.textContent = text;
      return measuringDiv.offsetWidth;
    }

    function typeWord(word, callback) {
      let charIndex = 0;
      animatedTextContainer.classList.remove('is-deleting', 'is-empty');
      animatedWordInner.textContent = '';

      const typingInterval = setInterval(() => {
        if (charIndex < word.length) {
          animatedWordInner.textContent += word.charAt(charIndex);
          animatedTextContainer.style.width = `${getTextWidth(animatedWordInner.textContent)}px`;
          charIndex++;
        } else {
          clearInterval(typingInterval);
          callback();
        }
      }, typingSpeed);
    }

    function deleteWord(callback) {
      let text = animatedWordInner.textContent;
      animatedTextContainer.classList.add('is-deleting');

      const deletingInterval = setInterval(() => {
        if (text.length > 0) {
          text = text.slice(0, -1);
          animatedWordInner.textContent = text;
          animatedTextContainer.style.width = `${getTextWidth(animatedWordInner.textContent)}px`;
        } else {
          clearInterval(deletingInterval);
          animatedTextContainer.classList.add('is-empty');
          callback();
        }
      }, deletingSpeed);
    }

    function animateTypewriter() {
      const currentWord = words[currentIndex];
      typeWord(currentWord, () => {
        setTimeout(() => {
          deleteWord(() => {
            setTimeout(() => {
              currentIndex = (currentIndex + 1) % words.length;
              animateTypewriter();
            }, pauseBeforeTyping);
          });
        }, wordDisplayTime);
      });
    }

    animateTypewriter();
  }
});

// === ABOUT PAGE TEXT ANIMATION + BLOB CURSOR (INTENSIFIED EFFECT) ===
document.addEventListener('DOMContentLoaded', () => {
  const right = document.querySelector('.right');
  const paragraphs = document.querySelectorAll('.right p');

  if (!right || paragraphs.length === 0) return;

  paragraphs.forEach(p => {
    const wrappedContent = p.innerText.split(' ').map(word => {
      const charSpans = [...word].map(char => `<span class="char">${char}</span>`).join('');
      return `<span class="word">${charSpans}</span>`;
    }).join(' ');
    p.innerHTML = wrappedContent;
  });

  const allWords = document.querySelectorAll('.right p .word');
  const allChars = document.querySelectorAll('.right p .char');

  // === BLOB CURSOR ===
  const blob = document.createElement('div');
  blob.className = 'blob-cursor';
  document.body.appendChild(blob);

  const style = document.createElement('style');
  style.textContent = `
    .blob-cursor {
      position: fixed;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: white;
      mix-blend-mode: difference;
      pointer-events: none;
      transform: translate(-50%, -50%);
      z-index: 10;
      opacity: 0;
      transition: opacity 0.2s ease;
    }`;
  document.head.appendChild(style);

  function handleMousemoveDistortion(e) {
    blob.style.opacity = 1;
    blob.style.left = `${e.clientX}px`;
    blob.style.top = `${e.clientY}px`;

    allChars.forEach(letter => {
      const r = letter.getBoundingClientRect();
      const dx = r.left + r.width / 2 - e.clientX;
      const dy = r.top + r.height / 2 - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const maxDist = 200;
      const proximity = Math.max(0, (maxDist - dist) / maxDist);

      const scale = 1 + proximity * 0.4;
      const blur = proximity * 2;

      const wiggleX = (Math.random() - 0.5) * proximity * 15;
      const wiggleY = (Math.random() - 0.5) * proximity * 15;
      const rotate = (Math.random() - 0.5) * proximity * 20;

      letter.style.transform = `
        translate(${wiggleX}px, ${wiggleY}px)
        scale(${scale})
        rotate(${rotate}deg)
      `;
      letter.style.filter = `blur(${blur}px)`;
    });
  }

  document.addEventListener('mousemove', handleMousemoveDistortion);

  document.addEventListener('mouseleave', () => {
    blob.style.opacity = 0;
    allChars.forEach(letter => {
      letter.style.transform = 'scale(1) translate(0, 0) rotate(0deg)';
      letter.style.filter = 'blur(0)';
    });
  });

  const introTimeline = gsap.timeline({
    delay: 0.5,
    onComplete: () => {
      gsap.set(allWords, { clearProps: 'transform,opacity' });
      gsap.set(paragraphs, { clearProps: 'visibility,opacity' });
    }
  });

  introTimeline.to(paragraphs, {
    opacity: 1,
    visibility: 'visible',
    duration: 0.01
  }, 0);

  introTimeline.from(allWords, {
    y: '100%',
    opacity: 0,
    stagger: 0.04,
    duration: 0.7,
    ease: 'power3.out'
  }, '<0.1');
});
