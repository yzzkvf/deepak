// Initialize AOS for animations
AOS.init({
    duration: 800,
    once: true,
    offset: 50,
    easing: 'ease-out-cubic', // More fluid animation curve
});

// Calculate and display years of experience
function calculateExperience() {
    const startDate = new Date(2011, 7, 1); // August 1, 2011 (Month is 0-indexed)
    const currentDate = new Date();
    let years = currentDate.getFullYear() - startDate.getFullYear();
    let months = currentDate.getMonth() - startDate.getMonth();
    let days = currentDate.getDate() - startDate.getDate();

    // Adjust years if current month/day is before start month/day
    if (months < 0 || (months === 0 && days < 0)) {
        years--;
    }

    const experienceSpan = document.getElementById('years-experience');
    if (experienceSpan) {
        experienceSpan.textContent = years + '+';
    }
}

// Direct PDF Download Logic
document.getElementById('download-resume').addEventListener('click', function () {
    const link = document.createElement('a');
    link.href = 'resources/deepak_resume.pdf';
    link.download = 'deepak_resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- Global Stargaze Background Animation Logic ---
const stargazeBackground = document.getElementById('stargaze-background');
const numStaticStars = 200; // Increased static stars for denser field
const maxShootingStars = 3; // Max concurrent shooting stars

// Function to create a static star within the global background
function createStaticStar() {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 1.8 + 0.5; // Size between 0.5px and 2.3px
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    // Position stars randomly across the horizontal, and ensure they start above or within the viewport
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${-20 + Math.random() * 120}%`; // From -20% to 100% of viewport height to ensure full coverage

    const travelDuration = (Math.random() * 15) + 5; // Between 5s and 20s for travel
    const twinkleDuration = (Math.random() * 3) + 2; // Between 2s and 5s for twinkle

    star.style.animation = `
        twinkle ${twinkleDuration}s infinite alternate,
        star-travel ${travelDuration}s linear infinite
    `;
    
    star.style.transformOrigin = 'center center';
    // Use negative animation delay to ensure stars are already distributed across the path when loaded
    star.style.animationDelay = `-${Math.random() * travelDuration}s`; 

    stargazeBackground.appendChild(star);
}

// Initialize static stars for the global background
function initStaticStars() {
    // Clear any existing stars before re-initializing (e.g., on resize)
    stargazeBackground.innerHTML = ''; 
    for (let i = 0; i < numStaticStars; i++) {
        createStaticStar();
    }
}

// Function to create a shooting star
function createShootingStar() {
    if (document.querySelectorAll('.shooting-star').length >= maxShootingStars) {
        return;
    }

    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    stargazeBackground.appendChild(shootingStar);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Start from top or left edge, biased towards top-left for down-right movement
    let startX, startY;
    const entrySide = Math.random();
    if (entrySide < 0.6) { // More likely to start from top
        startX = Math.random() * viewportWidth * 0.8;
        startY = -50;
    } else { // Start from left
        startX = -50;
        startY = Math.random() * viewportHeight * 0.8;
    }

    const length = Math.random() * 300 + 150; // Length between 150px and 450px
    const duration = Math.random() * 2 + 2; // Duration between 2s and 4s for slower, smoother streak
    const angle = Math.random() * (Math.PI / 6) + (Math.PI / 6); // Angle between 30 and 60 degrees

    shootingStar.style.width = `${length}px`;
    shootingStar.style.height = `2px`;
    shootingStar.style.position = 'absolute';
    shootingStar.style.transformOrigin = '0% 50%';
    shootingStar.style.left = `${startX}px`;
    shootingStar.style.top = `${startY}px`;
    // Use the custom spring-ease CSS variable for animation timing
    shootingStar.style.transition = `transform ${duration}s var(--spring-ease), opacity ${duration}s ease-out`;
    shootingStar.style.opacity = 1;

    setTimeout(() => {
        const endX = startX + Math.cos(angle) * (viewportWidth + viewportHeight);
        const endY = startY + Math.sin(angle) * (viewportWidth + viewportHeight);

        shootingStar.style.transform = `translate(${endX - startX}px, ${endY - startY}px) rotate(${angle}rad)`;
        shootingStar.style.opacity = 0;
    }, 10);

    shootingStar.addEventListener('transitionend', () => {
        shootingStar.remove();
    }, { once: true });
}

// Periodically create shooting stars
function initShootingStars() {
    if (window.shootingStarInterval) {
        clearInterval(window.shootingStarInterval);
    }
    window.shootingStarInterval = setInterval(() => {
        createShootingStar();
    }, Math.random() * 4000 + 3000); // Spawn every 3 to 7 seconds
}


// --- Scroll Effects Logic (Simpler with sticky header) ---
// We can use JS for more subtle parallax on the main content sections.
function handleContentParallax() {
    document.querySelectorAll('.pastel-section').forEach(section => {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Only apply effect when section is mostly in view
        if (rect.top < viewportHeight * 0.9 && rect.bottom > viewportHeight * 0.1) {
            // Calculate a progress based on its position in the viewport
            // 0 when bottom of element hits viewport top, 1 when top of element hits viewport bottom
            const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
            
            // Subtle Y translation for parallax
            const translateY = (scrollProgress - 0.5) * 20; // from -10px to +10px
            
            // Subtle opacity adjustment for a soft fade-in/out
            const opacity = Math.max(0.7, 1 - Math.abs(scrollProgress - 0.5) * 1.2); // Fade to 0.7 when far

            section.style.transform = `translateY(${translateY}px) translateZ(0)`; // translateZ(0) for hardware acceleration
            section.style.opacity = opacity.toFixed(2);
        } else {
            // Reset transform/opacity when fully out of view to ensure consistency and performance
            section.style.transform = `translateY(0px) translateZ(0)`;
            section.style.opacity = 1;
        }
    });
}


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    calculateExperience();
    initStaticStars(); // Initialize stars for the global background
    initShootingStars(); // Initialize shooting stars

    // Initial call for scroll effects
    handleContentParallax();
});

window.addEventListener('scroll', handleContentParallax);
window.addEventListener('resize', () => {
    handleContentParallax();
    // Re-initialize stars on resize to distribute them correctly
    initStaticStars();
    initShootingStars(); // Re-initialize shooting stars on resize
});
