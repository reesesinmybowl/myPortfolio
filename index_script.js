let padding = 30;

document.addEventListener('DOMContentLoaded', () => {
  /* ===========================
     TYPEWRITER ANIMATION
  ============================ */
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
    Object.assign(measuringDiv.style, {
      position: 'absolute',
      visibility: 'hidden',
      whiteSpace: 'nowrap',
      zIndex: '-1'
    });
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

    const getTextWidth = (text) => {
      measuringDiv.textContent = text;
      return measuringDiv.offsetWidth;
    };

    const typeWord = (word, callback) => {
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
    };

    const deleteWord = (callback) => {
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
    };

    const animateTypewriter = () => {
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
    };

    animateTypewriter();
  }

  /* ===========================
     SPLIT TEXT INTO WORDS/CHARS
  ============================ */
  const paragraphs = document.querySelectorAll('.right p');
  paragraphs.forEach(p => {
    if (p.dataset.splitDone === '1') return; // guard if rerun
    const wrappedContent = p.innerText.split(' ').map(word => {
      const charSpans = [...word].map(char => `<span class="char">${char}</span>`).join('');
      return `<span class="word">${charSpans}</span>`;
    }).join(' ');
    p.innerHTML = wrappedContent;
    p.dataset.splitDone = '1';
  });

  const allChars = document.querySelectorAll('.right p .char');
  const blob = document.querySelector('.blob-cursor');

  /* ===========================
     EMAIL CLICK FUNCTIONALITY
  ============================ */
  const contactLink = document.querySelector('.contact-swap');
  const emailPopup = document.getElementById('emailPopup');
  const emailAddress = 'nikl2229us@gmail.com';

  if (contactLink) {
    contactLink.addEventListener('click', (e) => {
      e.preventDefault(); // stop default mailto
      navigator.clipboard.writeText(emailAddress).then(() => {
        // Show email text
        contactLink.classList.add('show-email');
        // Show popup
        emailPopup.classList.add('visible');
        setTimeout(() => {
          emailPopup.classList.remove('visible');
        }, 1200);
      });
    });
  }

  /* ===========================
     GSAP LOAD-IN ANIMATION
     (respects prefers-reduced-motion)
  ============================ */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  if (!reduceMotion && hasGSAP) {
    // Start state (no FOUC)
    gsap.set(['.left', '.bottom'], { opacity: 0, y: 20 });
    gsap.set('.text-behind-img', { opacity: 0, scale: 0.92, transformOrigin: '50% 50%' });
    gsap.set('.right p .char', { opacity: 0, y: 14 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.left', { opacity: 1, y: 0, duration: 0.8 })
      .to('.right p .char', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: {
          each: 0.008,
          from: 'start'
        }
      }, '-=0.45')
      .to('.text-behind-img', { opacity: 1, scale: 1, duration: 0.9 }, '-=0.45')
      .to('.bottom', { opacity: 1, y: 0, duration: 0.7 }, '-=0.55');

    // Optional: softly fade in blob on desktop when user moves mouse
    const showBlob = () => {
      if (!blob) return;
      blob.style.opacity = '1';
      window.removeEventListener('mousemove', showBlob);
    };
    window.addEventListener('mousemove', showBlob, { once: true });
  }
});
