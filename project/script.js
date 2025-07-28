document.addEventListener('DOMContentLoaded', () => {
  // === TYPEWRITER TEXT ===
  const animatedTextContainer = document.querySelector('.animated-text');
  const animatedWordInner = document.querySelector('.animated-word-inner');
  const words = ['Interactive', 'Graphic', 'Motion'];
  let currentIndex = 0;

  const typingSpeed = 70;
  const deletingSpeed = 40;
  const wordDisplayTime = 3000;
  const pauseBeforeTyping = 300;

  const measuringDiv = document.createElement('div');
  measuringDiv.style.position = 'absolute';
  measuringDiv.style.visibility = 'hidden';
  measuringDiv.style.whiteSpace = 'nowrap';
  measuringDiv.style.zIndex = '-1';

  const computedStyle = getComputedStyle(animatedWordInner);
  measuringDiv.style.fontFamily = computedStyle.fontFamily;
  measuringDiv.style.fontSize = computedStyle.fontSize;
  measuringDiv.style.fontWeight = computedStyle.fontWeight;
  measuringDiv.style.letterSpacing = computedStyle.letterSpacing;
  measuringDiv.style.lineHeight = computedStyle.lineHeight;
  measuringDiv.style.textTransform = computedStyle.textTransform;

  document.body.appendChild(measuringDiv);

  function getTextWidth(text) {
    measuringDiv.textContent = text + '\u200A|';
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

  if (animatedTextContainer && animatedWordInner) {
    animateTypewriter();
  }

  // === FADE-IN ANIMATION FOR PROJECTS ===
  const projectElements = document.querySelectorAll('.card video, .card img');

  projectElements.forEach((element, index) => {
    if (index > 0) {
      element.style.opacity = 0;
    }
  });

  function animateProject(element, index) {
    if (index === 0) return;

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const start = viewportHeight * 0.8;
    const end = viewportHeight * 0.2;

    let opacity = 0;

    if (rect.bottom > 0 && rect.top < viewportHeight) {
      const progress = 1 - (rect.top - end) / (start - end);
      opacity = Math.max(0, Math.min(1, progress));
    }

    element.style.opacity = opacity;

    if (element.tagName === 'VIDEO') {
      if (opacity > 0.1 && element.paused) {
        element.play().catch(() => {});
      } else if (opacity < 0.1 && !element.paused) {
        element.pause();
      }
    }
  }

  function onScroll() {
    window.requestAnimationFrame(() => {
      projectElements.forEach((el, i) => animateProject(el, i));
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', () => {
    projectElements.forEach((el, i) => animateProject(el, i));
  });
});
