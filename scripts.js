// Initialize AOS for content animations on scroll
AOS.init({
    duration: 800,
    once: true,
    offset: 50,
    easing: 'ease-out-cubic',
});

// --- Page Content & Security Functions ---

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
 * Handles the actual resume download after the quiz is solved.
 */
function handleResumeDownload() {
    const link = document.createElement('a');
    link.href = 'resources/deepak_resume.pdf'; // Make sure this path is correct
    link.download = 'deepak_resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * SECURITY: Decodes Base64 string.
 * @param {string} str The Base64 encoded string.
 * @returns {string} The decoded string.
 */
function decode(str) {
    try {
        return atob(str);
    } catch (e) {
        console.error("Failed to decode string:", e);
        return '';
    }
}

/**
 * SECURITY: Sets up the scratch-to-reveal functionality for contact info.
 * The link only becomes active after a certain percentage is revealed.
 */
function setupScratchCards() {
    document.querySelectorAll('.scratch-container').forEach(container => {
        const canvas = container.querySelector('.scratch-canvas');
        const content = container.querySelector('.scratch-content');
        const textSpan = content.querySelector('.contact-text');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        
        textSpan.textContent = decode(content.dataset.value);
        ctx.fillStyle = '#1C1C1E';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        container.dataset.revealed = 'false';

        const checkRevealPercentage = () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixelData = imageData.data;
            let transparentPixels = 0;
            for (let i = 3; i < pixelData.length; i += 4) {
                if (pixelData[i] === 0) {
                    transparentPixels++;
                }
            }
            const percentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
            if (percentage > 50) {
                container.dataset.revealed = 'true';
                canvas.style.transition = 'opacity 0.5s';
                canvas.style.opacity = '0';
            }
        };

        const scratch = (x, y) => {
            if (!isDrawing) return;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
        };
        
        const startScratching = (e) => {
            isDrawing = true;
            const rect = e.target.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            scratch(x, y);
        };

        const doScratch = (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const rect = e.target.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            scratch(x, y);
        };

        const stopScratching = () => {
            if (isDrawing) {
                isDrawing = false;
                checkRevealPercentage();
            }
        };

        canvas.addEventListener('mousedown', startScratching);
        canvas.addEventListener('mousemove', doScratch);
        canvas.addEventListener('mouseup', stopScratching);
        canvas.addEventListener('mouseleave', stopScratching);
        
        canvas.addEventListener('touchstart', startScratching, { passive: true });
        canvas.addEventListener('touchmove', doScratch, { passive: false });
        canvas.addEventListener('touchend', stopScratching);

        container.addEventListener('click', (e) => {
            if (container.dataset.revealed !== 'true') {
                 e.preventDefault();
                 return;
            }
            const type = content.dataset.type;
            const value = decode(content.dataset.value);
            if (type === 'tel') window.location.href = `tel:${value}`;
            if (type === 'mailto') window.location.href = `mailto:${value}`;
        });
    });
}

/**
 * Sets up and manages the quiz modal for resume download with random math puzzles.
 */
function setupQuizModal() {
    const modal = document.getElementById('quiz-modal');
    const showButton = document.getElementById('show-quiz-button');
    const closeButton = document.getElementById('close-quiz-button');
    const submitButton = document.getElementById('submit-quiz-button');
    const answerInput = document.getElementById('quiz-answer');
    const feedback = document.getElementById('quiz-feedback');
    const questionText = modal.querySelector('p');
    
    let currentAnswer = null;

    const puzzles = [
        { question: "What is 7 * 8?", answer: "56" },
        { question: "What is 12 + 19?", answer: "31" },
        { question: "What is 100 - 45?", answer: "55" },
        { question: "What is 5 * 5 + 10?", answer: "35" },
        { question: "What is (10 - 2) * 4?", answer: "32" },
    ];

    const openModal = () => {
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        questionText.textContent = randomPuzzle.question;
        currentAnswer = randomPuzzle.answer;
        
        modal.classList.remove('modal-hidden');
        modal.classList.add('modal-visible');
        answerInput.focus();
    };

    const closeModal = () => {
        modal.classList.remove('modal-visible');
        setTimeout(() => modal.classList.add('modal-hidden'), 300);
        feedback.textContent = '';
        answerInput.value = '';
    };

    const checkAnswer = () => {
        if (answerInput.value.trim() === currentAnswer) {
            feedback.textContent = 'Correct! Downloading...';
            feedback.style.color = '#22c55e';
            setTimeout(() => {
                handleResumeDownload();
                closeModal();
            }, 1000);
        } else {
            feedback.textContent = 'Not quite. Give it another try!';
            feedback.style.color = '#ef4444';
            answerInput.value = '';
            answerInput.focus();
        }
    };
    
    showButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    submitButton.addEventListener('click', checkAnswer);
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
    answerInput.addEventListener('keyup', (event) => {
        if(event.key === 'Enter') checkAnswer();
    });
}


/**
 * SECURITY: Detects if the browser's developer tools are opened.
 */
function setupDevToolsDetection() {
    const threshold = 160;
    let devtoolsOpen = false;

    const checkDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if (widthThreshold || heightThreshold) {
            if (!devtoolsOpen) {
                console.log('%cHOLD UP!', 'color: yellow; font-size: 24px; font-weight: bold;');
                console.log('%cThis site is protected. If you have questions about my work, please feel free to reach out directly.', 'color: white; font-size: 16px;');
                devtoolsOpen = true;
            }
        } else {
            devtoolsOpen = false;
        }
    };

    setInterval(checkDevTools, 1000);
    
    window.addEventListener('keydown', event => {
        if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(event.key.toUpperCase()))) {
            setTimeout(() => checkDevTools(), 500);
        }
    });
}

/**
 * SECURITY: Canvas fingerprinting as a deterrent.
 */
function runSecurityDeterrents() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const txt = 'Protected by DSR';
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText(txt, 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText(txt, 4, 17);
        const dataUrl = canvas.toDataURL();
    } catch(e) {
        // Fail silently
    }
}


// --- Utility Function for Optimization ---

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


// --- WebGL 3D Space Experience ---

let scene, camera, renderer, starField1, starField2, planets = [], asteroids = [];
const clock = new THREE.Clock();

function initWebGLSpace() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0007);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.z = 5;

    // Renderer setup
    const canvas = document.getElementById('space-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Create Starfields for seamless looping
    const starGeometry = createStarGeometry(15000);
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    starField1 = new THREE.Points(starGeometry, starMaterial);
    starField2 = new THREE.Points(starGeometry, starMaterial);
    starField2.position.z = -2000;
    scene.add(starField1, starField2);
    
    // ** Planets and Asteroids will now be spawned over time in the animation loop **
    
    animateWebGL();
}

function createStarGeometry(count) {
     const starVertices = [];
    for (let i = 0; i < count; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starVertices.push(x, y, z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    return geometry;
}

function createPlanet() {
    const planetType = Math.random();
    let planet;

    if (planetType < 0.33) {
        planet = createRockyPlanet();
    } else if (planetType < 0.66) {
        planet = createGasGiant();
    } else {
        planet = createIcyPlanet();
    }

    resetPlanetPosition(planet);
    planets.push(planet);
    scene.add(planet);
}

function createRockyPlanet() {
    const size = THREE.MathUtils.randFloat(10, 30);
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const texture = new THREE.CanvasTexture(generateRockyTexture());
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
    return new THREE.Mesh(geometry, material);
}

function createGasGiant() {
    const size = THREE.MathUtils.randFloat(40, 70);
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const texture = new THREE.CanvasTexture(generateGasGiantTexture());
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 });
    const planet = new THREE.Mesh(geometry, material);

    const ringGeom = new THREE.RingGeometry(size * 1.2, size * 1.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0xcccccc, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    planet.add(ring);
    
    return planet;
}

function createIcyPlanet() {
    const size = THREE.MathUtils.randFloat(15, 40);
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const texture = new THREE.CanvasTexture(generateIcyTexture());
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.2, metalness: 0.1 });
    return new THREE.Mesh(geometry, material);
}

function generateRockyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const baseColor = new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.5, 0.4);
    ctx.fillStyle = `#${baseColor.getHexString()}`;
    ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
    }
    return canvas;
}

function generateGasGiantTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const baseColor1 = new THREE.Color().setHSL(Math.random() * 0.1 + 0.1, 0.6, 0.6);
    const baseColor2 = new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.5, 0.5);
    
    for(let i=0; i<15; i++) {
        ctx.fillStyle = i % 2 === 0 ? `#${baseColor1.getHexString()}` : `#${baseColor2.getHexString()}`;
        ctx.fillRect(0, i * (256/15), 512, 256/15);
    }
    return canvas;
}

function generateIcyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const baseColor = new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.8, 0.8);
    ctx.fillStyle = `#${baseColor.getHexString()}`;
    ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 500; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 10, 0, Math.PI * 2);
        ctx.fill();
    }
    return canvas;
}

function createAsteroidBelt() {
    const count = 200; // Create smaller clusters
    const belt = new THREE.Group();
    for(let i=0; i < count; i++) {
        const size = THREE.MathUtils.randFloat(0.5, 3);
        const geometry = new THREE.DodecahedronGeometry(size, 0);
        const material = new THREE.MeshStandardMaterial({color: 0x888888, roughness: 0.9});
        const asteroid = new THREE.Mesh(geometry, material);
        
        asteroid.position.set(
            THREE.MathUtils.randFloatSpread(50), 
            THREE.MathUtils.randFloatSpread(50), 
            THREE.MathUtils.randFloatSpread(50)
        );
        asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        belt.add(asteroid);
    }
    
    // Position the entire cluster far away
    belt.position.z = THREE.MathUtils.randFloat(-1500, -2000);
    belt.position.x = THREE.MathUtils.randFloatSpread(800);
    belt.position.y = THREE.MathUtils.randFloatSpread(400);
    belt.userData.velocity = new THREE.Vector3(0, 0, THREE.MathUtils.randFloat(0.8, 2.5));
    
    asteroids.push(belt);
    scene.add(belt);
}

function resetPlanetPosition(planet) {
     planet.position.z = THREE.MathUtils.randFloat(-1800, -2500); // Start further back
     planet.position.x = THREE.MathUtils.randFloatSpread(1200);
     planet.position.y = THREE.MathUtils.randFloatSpread(700);
     planet.userData.velocity = new THREE.Vector3(0, 0, THREE.MathUtils.randFloat(0.5, 2));
}


function animateWebGL() {
    requestAnimationFrame(animateWebGL);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Automatic camera pan for a cinematic feel
    camera.position.x += Math.sin(time * 0.05) * 0.02;
    camera.position.y += Math.cos(time * 0.04) * 0.02;
    camera.lookAt(scene.position);
    
    // Animate starfields for seamless travel
    starField1.position.z += delta * 100;
    starField2.position.z += delta * 100;
    if (starField1.position.z > 2000) starField1.position.z -= 4000;
    if (starField2.position.z > 2000) starField2.position.z -= 4000;

    // ** RARELY SPAWN NEW OBJECTS **
    if (Math.random() < 0.001 && planets.length < 4) createPlanet();
    if (Math.random() < 0.0005 && asteroids.length < 2) createAsteroidBelt();

    // Move planets and asteroids
    [...planets, ...asteroids].forEach(obj => {
        obj.position.add(obj.userData.velocity);
        obj.rotation.y += 0.002;
        if(obj.position.z > camera.position.z + 500) {
            // Instead of resetting, just remove it. New ones will be spawned.
            scene.remove(obj);
            if (planets.includes(obj)) planets = planets.filter(p => p !== obj);
            if (asteroids.includes(obj)) asteroids = asteroids.filter(a => a !== obj);
        }
    });

    renderer.render(scene, camera);
}


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    calculateExperience();
    initWebGLSpace();
    setupScratchCards();
    setupQuizModal();
    setupDevToolsDetection();
    runSecurityDeterrents();
    
    document.addEventListener('contextmenu', event => event.preventDefault());
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
