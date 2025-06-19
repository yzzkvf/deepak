// Initialize AOS for content animations on scroll
AOS.init({
    duration: 800,
    once: true,
    offset: 50,
    easing: 'ease-out-cubic',
});

// --- Page Content Functions ---

/**
 * Calculates the number of years from a start date to the current date
 * and updates the content of the 'years-experience' element.
 */
function calculateExperience() {
    const startDate = new Date(2011, 7, 1); // August 1, 2011
    const currentDate = new Date();
    let years = currentDate.getFullYear() - startDate.getFullYear();
    const m = currentDate.getMonth() - startDate.getMonth();
    if (m < 0 || (m === 0 && currentDate.getDate() < startDate.getDate())) {
        years--;
    }
    const experienceSpan = document.getElementById('years-experience');
    if (experienceSpan) {
        experienceSpan.textContent = years + '+';
    }
}

/**
 * Handles the click event for the resume download button,
 * creating a temporary link to trigger the download.
 */
function handleResumeDownload() {
    const link = document.createElement('a');
    link.href = 'resources/deepak_resume.pdf'; // Make sure this path is correct
    link.download = 'deepak_resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- Utility Function for Optimization ---

/**
 * Debounce function to limit how often a function gets called.
 * This is crucial for performance on events like window resizing.
 * @param {Function} func The function to debounce.
 * @param {number} wait The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};


// --- Fullscreen Canvas Space Animation ---

const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');

let stars = [];
let shootingStars = [];
let comets = [];
let galaxies = [];
let animationFrameId; // To hold the requestAnimationFrame ID

// Configuration for the animation elements
const config = {
    STAR_COUNT: 600, // Optimized for performance on various devices
    STAR_SPEED: 0.05,
    SHOOTING_STAR_SPAWN_RATE: 0.002,
    COMET_SPAWN_RATE: 0.0005,
    GALAXY_COUNT: 2,
};

// Sets canvas dimensions to fill the screen
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Represents a single star in the 3D starfield
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = (Math.random() - 0.5) * canvas.width;
        this.y = (Math.random() - 0.5) * canvas.height;
        this.z = Math.random() * canvas.width;
    }

    update() {
        this.z -= config.STAR_SPEED;
        if (this.z < 1) {
            this.reset();
        }
    }

    draw() {
        const sx = (this.x / this.z) * canvas.width / 2 + canvas.width / 2;
        const sy = (this.y / this.z) * canvas.height / 2 + canvas.height / 2;
        const radius = Math.max(0.1, (1 - this.z / canvas.width) * 2.5);

        // Only draw if the star is within the canvas bounds
        if (sx > 0 && sx < canvas.width && sy > 0 && sy < canvas.height) {
            ctx.beginPath();
            ctx.arc(sx, sy, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - this.z / canvas.width})`;
            ctx.fill();
        }
    }
}

// Represents an occasional, fast-moving shooting star
class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.2;
        this.len = Math.random() * 80 + 10;
        this.speed = Math.random() * 10 + 6;
        this.angle = Math.PI / 4 + (Math.random() * Math.PI / 4 - Math.PI / 8);
        this.life = 1; // Fades out
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
        this.life -= this.decay;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.len * Math.cos(this.angle), this.y - this.len * Math.sin(this.angle));
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x - this.len, this.y - this.len);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.life})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Represents a rare, slow-moving comet with a tail
class Comet {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = -canvas.width * 0.2;
        this.y = Math.random() * canvas.height * 0.4 + canvas.height * 0.1;
        this.vx = Math.random() * 2 + 1;
        this.vy = Math.random() * 0.5 + 0.25;
        this.radius = Math.random() * 2 + 1;
        this.alpha = 1; // Fades out
        this.decay = Math.random() * 0.005 + 0.005;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        // Comet Head
        const headGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        headGradient.addColorStop(0, `rgba(255, 229, 180, ${this.alpha})`);
        headGradient.addColorStop(1, `rgba(255, 229, 180, 0)`);
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Comet Tail
        const tailLength = this.radius * 20;
        const tailGradient = ctx.createLinearGradient(this.x, this.y, this.x - tailLength, this.y - tailLength * (this.vy / this.vx));
        tailGradient.addColorStop(0, `rgba(255, 229, 180, ${this.alpha * 0.4})`);
        tailGradient.addColorStop(1, `rgba(255, 229, 180, 0)`);
        ctx.strokeStyle = tailGradient;
        ctx.lineWidth = this.radius;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - tailLength, this.y - tailLength * (this.vy / this.vx));
        ctx.stroke();
    }
}

// Represents a distant, slowly rotating galaxy nebula
class Galaxy {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 100 + 150;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.0002;
    }

    update() {
        this.angle += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.04)");
        gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.03)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.01)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.restore();
    }
}

// Initializes or re-initializes all animation elements
function initSpace() {
    setupCanvas();
    galaxies = Array.from({ length: config.GALAXY_COUNT }, () => new Galaxy());
    stars = Array.from({ length: config.STAR_COUNT }, () => new Star());
    shootingStars = []; // Start empty
    comets = []; // Start empty
}

// The main animation loop
function animate() {
    // Clear the canvas for the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw all elements
    [...galaxies, ...stars, ...shootingStars, ...comets].forEach(element => {
        element.update();
        element.draw();
    });
    
    // Randomly spawn new elements
    if (Math.random() < config.SHOOTING_STAR_SPAWN_RATE) {
        shootingStars.push(new ShootingStar());
    }
    if (Math.random() < config.COMET_SPAWN_RATE) {
        comets.push(new Comet());
    }
    
    // Clean up off-screen/faded elements for performance
    shootingStars = shootingStars.filter(ss => ss.life > 0 && ss.x < canvas.width * 1.2);
    comets = comets.filter(c => c.alpha > 0 && c.x < canvas.width * 1.2);

    // Request the next frame
    animationFrameId = requestAnimationFrame(animate);
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Run initial setup functions
    calculateExperience();
    initSpace();
    animate();

    // Attach event listeners
    document.getElementById('download-resume').addEventListener('click', handleResumeDownload);
    
    // Disable right-click context menu across the page to deter casual inspection
    document.addEventListener('contextmenu', event => event.preventDefault());
});

// Use the debounced function for the resize event to optimize performance
window.addEventListener('resize', debounce(initSpace, 250));
