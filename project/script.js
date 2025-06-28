document.addEventListener('DOMContentLoaded', () => {

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
    measuringDiv.style.zIndex = '-1'; // Ensure it doesn't interfere with layout

    // Inherit relevant font styles for accurate measurement
    const computedStyle = getComputedStyle(animatedWordInner);
    measuringDiv.style.fontFamily = computedStyle.fontFamily;
    measuringDiv.style.fontSize = computedStyle.fontSize;
    measuringDiv.style.fontWeight = computedStyle.fontWeight;
    measuringDiv.style.letterSpacing = computedStyle.letterSpacing;
    measuringDiv.style.lineHeight = computedStyle.lineHeight;
    measuringDiv.style.textTransform = computedStyle.textTransform; // Include text-transform if applicable
    document.body.appendChild(measuringDiv);

    // Function to measure text width, now correctly accounting for the cursor
    function getTextWidth(text) {
        // Append a thin space (\u200A) and the cursor character ('|')
        // This makes sure the calculated width of the container includes space for the cursor.
        measuringDiv.textContent = text + '\u200A|';
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
                // Dynamically adjust container width as characters are typed, including cursor width
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
                // Dynamically adjust container width as characters are deleted, including cursor width
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
    // --- END ANIMATED TEXT SCRIPT ---


    // --- PROJECT SMOOTH SCROLL ANIMATION SCRIPT ---
    // Select all project elements (videos and images) within the card class
    const projectElements = document.querySelectorAll('.card video, .card img');

    // Initialize opacity for all project elements *except the first one*
    projectElements.forEach((element, index) => {
        if (index > 0) { // All elements after the first one
            element.style.opacity = 0; // Start hidden for animation
        }
    });

    /**
     * Updates the animation of a project element based on its visibility in the viewport.
     * @param {HTMLElement} element - The project element (video or image) to animate.
     * @param {number} index - The index of the element in the projectElements NodeList.
     */
    function animateProject(element, index) {
        // Skip animation for the first project
        if (index === 0) {
            return;
        }

        const rect = element.getBoundingClientRect(); // Get element's position relative to viewport
        const viewportHeight = window.innerHeight;

        // Define the animation zone for vertical fade
        // Animation starts when the element's bottom is at 80% of viewport height (coming from bottom)
        // Animation ends when the element's top is at 20% of viewport height (going to top)
        const animationStartLine = viewportHeight * 0.8;
        const animationEndLine = viewportHeight * 0.2;

        let opacity = 0;

        // Check if the element is within the general viewport area
        if (rect.bottom > 0 && rect.top < viewportHeight) {
            // Calculate progress for fade-in/out
            // When rect.top is at animationStartLine, progress is 0.
            // When rect.top is at animationEndLine, progress is 1.
            // When rect.top is between these lines, it interpolates.
            const progress = 1 - (rect.top - animationEndLine) / (animationStartLine - animationEndLine);
            opacity = Math.max(0, Math.min(1, progress)); // Clamp opacity between 0 and 1
        }

        element.style.opacity = opacity;

        // Pause/Play video based on visibility to optimize performance (only for video elements)
        if (element.tagName === 'VIDEO') { // Check if the element is a video
            if (opacity > 0.1 && element.paused) { // Play if largely visible and paused
                element.play().catch(e => {
                    // console.error("Video play failed:", e); // Common if autoplay is blocked
                });
            } else if (opacity < 0.1 && !element.paused) { // Pause if mostly hidden and playing
                element.pause();
            }
        }
    }

    let ticking = false;

    /**
     * Handles the scroll event, throttling updates using requestAnimationFrame.
     */
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                projectElements.forEach((element, index) => animateProject(element, index));
                ticking = false;
            });
            ticking = true;
        }
    }

    // Initial animation update on load
    window.addEventListener('load', () => {
        projectElements.forEach((element, index) => animateProject(element, index));
    });

    // Listen for scroll events
    window.addEventListener('scroll', onScroll, { passive: true });

    // Also update on resize to re-calculate viewport dimensions
    window.addEventListener('resize', onScroll, { passive: true });
    // --- END PROJECT SMOOTH SCROLL ANIMATION SCRIPT ---

});
