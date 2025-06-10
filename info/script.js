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


// --- ANIMATED TEXT SCRIPT (Typewriter Effect) ---
document.addEventListener('DOMContentLoaded', () => {
    const animatedTextContainer = document.querySelector('.animated-text');
    const animatedWordInner = document.querySelector('.animated-word-inner');
    const words = ['Interactive', 'Graphic', 'Motion']; // Words to cycle through
    let currentIndex = 0;

    const typingSpeed = 70;
    const deletingSpeed = 40;
    const wordDisplayTime = 3000;
    const pauseBeforeTyping = 300;

    if (!animatedTextContainer || !animatedWordInner) {
        console.warn("Animated text elements not found. Skipping typewriter script.");
        return;
    }

    const measuringDiv = document.createElement('div');
    measuringDiv.style.position = 'absolute';
    measuringDiv.style.visibility = 'hidden';
    measuringDiv.style.height = 'auto';
    measuringDiv.style.width = 'auto';
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
});


// --- About Page Text Distortion (Right Section) ---
document.addEventListener('DOMContentLoaded', () => {
    const right = document.querySelector('.right');
    const paragraphs = document.querySelectorAll('.right p');

    if (!right || paragraphs.length === 0) {
        return;
    }

    paragraphs.forEach(p => {
        const wrapped = p.innerText.split(' ').map(wordText => {
            if (wordText.trim() === '') return ''; 
            const letters = [...wordText].map(letter => `<span class="char">${letter}</span>`).join('');
            return `<span class="word">${letters}</span>`;
        }).join(' ');
        p.innerHTML = wrapped;
    });

    const letters = document.querySelectorAll('.char');
    const words = document.querySelectorAll('.word');

    // --- Removed: Word Burst on Click Logic ---
    // The event listener and its associated code for the burst effect have been removed.

    // --- Mousemove Distortion & Wiggle Logic ---
    document.addEventListener('mousemove', (e) => {
        const rect = right.getBoundingClientRect();
        const withinRight =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;

        let hoveredWordElement = null;
        if (withinRight) {
            let currentElement = e.target;
            while (currentElement && currentElement !== right) {
                if (currentElement.classList.contains('word')) {
                    hoveredWordElement = currentElement;
                    break;
                }
                currentElement = currentElement.parentElement;
            }
        }

        if (withinRight) {
            letters.forEach(letter => {
                const r = letter.getBoundingClientRect();
                const dx = r.left + r.width / 2 - e.clientX;
                const dy = r.top + r.height / 2 - e.clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const maxDist = 150;
                const maxFloat = 25;
                const maxRotate = 10;

                const proximity = Math.max(0, (maxDist - dist) / maxDist);

                const scale = 1 + proximity * 0.08;
                const blur = proximity * 0.7;

                let translateX = 0;
                let translateY = 0;
                let rotate = 0;

                if (dist > 0) {
                    translateX = (dx / dist) * proximity * maxFloat;
                    translateY = (dy / dist) * proximity * maxFloat;
                    rotate = (Math.random() - 0.5) * 2 * proximity * maxRotate; 
                }

                let wiggleX = 0;
                let wiggleY = 0;
                let wiggleRotation = 0;

                if (hoveredWordElement && hoveredWordElement.contains(letter)) {
                    const wiggleAmplitude = 5;
                    const wiggleRotationAmount = 5;

                    wiggleX = (Math.random() - 0.5) * 2 * wiggleAmplitude;
                    wiggleY = (Math.random() - 0.5) * 2 * wiggleAmplitude;
                    wiggleRotation = (Math.random() - 0.5) * 2 * wiggleRotationAmount;
                }

                letter.style.transform = `
                    translate(${translateX + wiggleX}px, ${translateY + wiggleY}px)
                    scale(${scale})
                    rotate(${rotate + wiggleRotation}deg)
                `;
                letter.style.filter = `blur(${blur}px)`;
            });
        } else {
            letters.forEach(letter => {
                letter.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
                letter.style.filter = 'blur(0)';
            });
        }
    });
});