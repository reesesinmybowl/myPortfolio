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

    // Configuration for typing/deleting speeds and pauses
    const typingSpeed = 70; // Milliseconds per character
    const deletingSpeed = 40; // Milliseconds per character
    const wordDisplayTime = 3000; // Milliseconds to display a word before deleting
    const pauseBeforeTyping = 300; // Milliseconds pause after deleting and before typing next

    // Create a temporary element to measure word widths accurately
    const measuringDiv = document.createElement('div');
    measuringDiv.style.position = 'absolute';
    measuringDiv.style.visibility = 'hidden';
    measuringDiv.style.height = 'auto';
    measuringDiv.style.width = 'auto';
    measuringDiv.style.whiteSpace = 'nowrap';

    // Inherit relevant font styles for accurate measurement
    const computedStyle = getComputedStyle(animatedWordInner);
    measuringDiv.style.fontFamily = computedStyle.fontFamily;
    measuringDiv.style.fontSize = computedStyle.fontSize;
    measuringDiv.style.fontWeight = computedStyle.fontWeight;
    measuringDiv.style.letterSpacing = computedStyle.letterSpacing;
    measuringDiv.style.lineHeight = computedStyle.lineHeight; 
    document.body.appendChild(measuringDiv);

    // Function to measure text width
    function getTextWidth(text) {
        measuringDiv.textContent = text;
        return measuringDiv.offsetWidth;
    }

    // --- Typing Function ---
    function typeWord(word, callback) {
        let charIndex = 0;
        animatedTextContainer.classList.remove('is-deleting', 'is-empty'); // Show cursor, not empty
        animatedWordInner.textContent = ''; // Start fresh

        const typingInterval = setInterval(() => {
            if (charIndex < word.length) {
                animatedWordInner.textContent += word.charAt(charIndex);
                // Dynamically adjust container width as characters are typed
                animatedTextContainer.style.width = `${getTextWidth(animatedWordInner.textContent)}px`;
                charIndex++;
            } else {
                clearInterval(typingInterval);
                callback(); // Call callback when typing is complete
            }
        }, typingSpeed);
    }

    // --- Deleting Function ---
    function deleteWord(callback) {
        let text = animatedWordInner.textContent;
        animatedTextContainer.classList.add('is-deleting'); // Hide cursor while deleting

        const deletingInterval = setInterval(() => {
            if (text.length > 0) {
                text = text.slice(0, -1); // Remove last character
                animatedWordInner.textContent = text;
                // Dynamically adjust container width as characters are deleted
                animatedTextContainer.style.width = `${getTextWidth(animatedWordInner.textContent)}px`;
            } else {
                clearInterval(deletingInterval);
                animatedTextContainer.classList.add('is-empty'); // Add class when empty
                callback(); // Call callback when deleting is complete
            }
        }, deletingSpeed);
    }

    // --- Main Animation Loop ---
    function animateTypewriter() {
        const currentWord = words[currentIndex];

        // 1. Type the current word
        typeWord(currentWord, () => {
            // 2. Pause after typing
            setTimeout(() => {
                // 3. Delete the current word
                deleteWord(() => {
                    // 4. Pause after deleting, then move to the next word
                    setTimeout(() => {
                        currentIndex = (currentIndex + 1) % words.length; // Move to next word
                        animateTypewriter(); // Start the cycle again for the next word
                    }, pauseBeforeTyping);
                });
            }, wordDisplayTime);
        });
    }

    // Initial call to start the typewriter animation
    if (animatedTextContainer && animatedWordInner) {
        animateTypewriter();
    } else {
        console.warn("Animated text elements not found. Skipping typewriter script.");
    }
});
// --- END ANIMATED TEXT SCRIPT ---