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
    const wrappedContent = p.innerText.split(' ').map(word => {
      const charSpans = [...word].map(char => `<span class="char">${char}</span>`).join('');
      return `<span class="word">${charSpans}</span>`;
    }).join(' ');
    p.innerHTML = wrappedContent;
  });

  const allChars = document.querySelectorAll('.right p .char');
  const blob = document.querySelector('.blob-cursor');

  /* ===========================
     BLOB CURSOR INTERACTION
  ============================ */
  const handleMousemoveRetraction = (e) => {
    blob.style.opacity = 1;
    blob.style.left = `${e.clientX}px`;
    blob.style.top = `${e.clientY}px`;

    const blobRadius = 90;
    const influenceRadius = blobRadius + padding + 40;

    allChars.forEach(letter => {
      const rect = letter.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - e.clientX;
      const dy = rect.top + rect.height / 2 - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < influenceRadius) {
        const angle = Math.atan2(dy, dx);
        const targetDist = blobRadius + padding;
        const pushAmount = Math.max(0, targetDist - dist);

        const offsetX = Math.cos(angle) * pushAmount;
        const offsetY = Math.sin(angle) * pushAmount;

        letter.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      } else {
        letter.style.transform = 'translate(0, 0)';
      }
    });
  };

  document.addEventListener('mousemove', handleMousemoveRetraction);

  document.addEventListener('mouseleave', () => {
    blob.style.opacity = 0;
    allChars.forEach(letter => {
      letter.style.transform = 'translate(0, 0)';
    });
  });

  /* ===========================
     INTRO ANIMATION
  ============================ */
  const allWords = document.querySelectorAll('.right p .word');
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
});
