// Initialize AOS for content animations
AOS.init({
    duration: 800,
    once: true,
    offset: 50,
    easing: 'ease-out-cubic',
});

// --- Legacy Functions (Kept for page content) ---

// Calculate and display years of experience
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

// Direct PDF Download Logic
document.getElementById('download-resume').addEventListener('click', function () {
    const link = document.createElement('a');
    link.href = 'resources/deepak_resume.pdf';
    link.download = 'deepak_resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});


// --- NEW - Fullscreen Canvas Space Animation ---

const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');

let stars = [];
let shootingStars = [];
let comets = [];

// Configuration
const config = {
    STAR_COUNT: 800,
    STAR_SPEED: 0.05,
    SHOOTING_STAR_SPAWN_RATE: 0.002, // Lower value = rarer
    COMET_SPAWN_RATE: 0.0005,      // Even rarer
};

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// A single star in the starfield
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        // Start stars in 3D space
        this.x = (Math.random() - 0.5) * canvas.width;
        this.y = (Math.random() - 0.5) * canvas.height;
        this.z = Math.random() * canvas.width; // Z distance
        this.pz = this.z; // Previous Z for motion blur trail
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

        // Check if star is on screen
        if (sx > 0 && sx < canvas.width && sy > 0 && sy < canvas.height) {
            ctx.beginPath();
            ctx.arc(sx, sy, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - this.z / canvas.width})`;
            ctx.fill();
        }
    }
}


// An occasional shooting star
class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.2; // Start near the top
        this.len = Math.random() * 80 + 10;
        this.speed = Math.random() * 10 + 6;
        this.angle = Math.PI / 4 + (Math.random() * Math.PI / 4 - Math.PI / 8); // ~45 degrees
        this.life = 1; // 1 to 0
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
        this.life -= this.decay;
        if (this.life <= 0) {
            this.reset();
        }
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

// A rare, slow-moving comet
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
        this.alpha = 1;
        this.decay = Math.random() * 0.005 + 0.005;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        if (this.alpha <= 0) {
            this.reset();
        }
    }

    draw() {
        // Comet Head
        ctx.beginPath();
        const headGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        headGradient.addColorStop(0, `rgba(255, 229, 180, ${this.alpha})`); // Brighter core
        headGradient.addColorStop(1, `rgba(255, 229, 180, 0)`);
        ctx.fillStyle = headGradient;
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


function initSpace() {
    setupCanvas();
    stars = [];
    shootingStars = [];
    comets = [];

    for (let i = 0; i < config.STAR_COUNT; i++) {
        stars.push(new Star());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw stars
    for (const star of stars) {
        star.update();
        star.draw();
    }

    // Update and draw shooting stars
    for (const ss of shootingStars) {
        ss.update();
        ss.draw();
    }

    // Update and draw comets
    for (const comet of comets) {
        comet.update();
        comet.draw();
    }

    // Spawn new shooting stars randomly
    if (Math.random() < config.SHOOTING_STAR_SPAWN_RATE) {
        shootingStars.push(new ShootingStar());
    }

    // Spawn new comets randomly
    if (Math.random() < config.COMET_SPAWN_RATE) {
        comets.push(new Comet());
    }
    
    // Clean up dead shooting stars and comets
    shootingStars = shootingStars.filter(ss => ss.life > 0 && ss.x < canvas.width * 1.2);
    comets = comets.filter(c => c.alpha > 0 && c.x < canvas.width * 1.2);


    requestAnimationFrame(animate);
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    calculateExperience();
    initSpace();
    animate();
});

window.addEventListener('resize', initSpace);
