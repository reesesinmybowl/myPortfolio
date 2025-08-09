let padding = 30;

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

  function setupTypewriter() {
    if (!animatedTextContainer || !animatedWordInner) return null;

    // Measuring div
    const measuringDiv = document.createElement('div');
    measuringDiv.style.position = 'absolute';
    measuringDiv.style.visibility = 'hidden';
    measuringDiv.style.whiteSpace = 'nowrap';
    measuringDiv.style.zIndex = '-1';
    document.body.appendChild(measuringDiv);

    function syncMeasuringStyles() {
      const cs = getComputedStyle(animatedWordInner);
      measuringDiv.style.fontFamily = cs.fontFamily;
      measuringDiv.style.fontSize = cs.fontSize;
      measuringDiv.style.fontWeight = cs.fontWeight;
      measuringDiv.style.letterSpacing = cs.letterSpacing;
      measuringDiv.style.lineHeight = cs.lineHeight;
      measuringDiv.style.textTransform = cs.textTransform;
    }

    // include space in width calculation so gap is kept
    function getTextWidth(text) {
      measuringDiv.textContent = text + '\u00A0'; // non-breaking space
      return measuringDiv.offsetWidth;
    }

    function typeWord(word, callback) {
      let charIndex = 0;
      animatedTextContainer.classList.remove('is-deleting', 'is-empty');
      animatedWordInner.textContent = '';

      const typingInterval = setInterval(() => {
        if (charIndex < word.length) {
          animatedWordInner.textContent += word.charAt(charIndex);
          animatedTextContainer.style.width =
            `${getTextWidth(animatedWordInner.textContent)}px`;
          charIndex++;
        } else {
          clearInterval(typingInterval);
          callback && callback();
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
          animatedTextContainer.style.width =
            `${getTextWidth(animatedWordInner.textContent)}px`;
        } else {
          clearInterval(deletingInterval);
          animatedTextContainer.classList.add('is-empty');
          callback && callback();
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

    const start = () => {
      syncMeasuringStyles();
      animateTypewriter();
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start).catch(start);
    } else {
      start();
    }

    return true;
  }

  setupTypewriter();
});
