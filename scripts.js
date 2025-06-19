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

/**
 * Checks for WebGL support in the browser.
 * @returns {boolean} True if WebGL is supported, false otherwise.
 */
function supportsWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}


// --- Animation Systems (WebGL and 2D Fallback) ---

const canvas = document.getElementById('space-canvas');
let animationFrameId;

// --- WebGL 3D Space Experience ---
function initWebGLSpace() {
    if (typeof THREE === 'undefined') {
        console.error("Three.js is not loaded. Falling back to 2D.");
        init2DFallback();
        return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0007);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const starMaterials = [
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, opacity: 0.8, transparent: true }),
        new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, map: createStarTexture(), blending: THREE.AdditiveBlending, transparent: true, opacity: 0.5 })
    ];
    const starField1 = new THREE.Points(createStarGeometry(15000), starMaterials[0]);
    const starField2 = starField1.clone();
    const brightStarField1 = new THREE.Points(createStarGeometry(200), starMaterials[1]);
    const brightStarField2 = brightStarField1.clone();
    starField1.position.z = 0;
    starField2.position.z = -2000;
    brightStarField1.position.z = 0;
    brightStarField2.position.z = -2000;
    scene.add(starField1, starField2, brightStarField1, brightStarField2);
    
    let planets = [];
    let asteroids = [];
    let constellations = [];
    
    const clock = new THREE.Clock();
    let lastSpawnTime = { planet: 0, asteroid: 0, constellation: 0 };
    const SPAWN_INTERVAL = { planet: 25000, asteroid: 35000, constellation: 70000 };
    
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // ** GENTLE, SMOOTH AUTOMATIC CAMERA PAN (ACCESSIBILITY FOCUSED) **
        camera.position.x = Math.sin(time * 0.02) * 0.5;
        camera.position.y = Math.cos(time * 0.015) * 0.5;
        camera.lookAt(0, 0, 0);
        
        // ** SEAMLESS ENDLESS STARFIELD **
        starField1.position.z += delta * 20; // Slower speed
        starField2.position.z += delta * 20;
        if (starField1.position.z > 2000) starField1.position.z -= 4000;
        if (starField2.position.z > 2000) starField2.position.z -= 4000;
        
        brightStarField1.position.z = starField1.position.z;
        brightStarField2.position.z = starField2.position.z;

        // ** RARE, DYNAMIC OBJECT SPAWNING **
        if (time > lastSpawnTime.planet + SPAWN_INTERVAL.planet / 1000) {
            if (planets.length < 2) createAndAddPlanet(); // Reduced max planets
            lastSpawnTime.planet = time;
        }
        if (time > lastSpawnTime.asteroid + SPAWN_INTERVAL.asteroid / 1000) {
            if (asteroids.length < 1) createAndAddAsteroidBelt();
            lastSpawnTime.asteroid = time;
        }
        if (time > lastSpawnTime.constellation + SPAWN_INTERVAL.constellation / 1000) {
            if (constellations.length < 1) createAndAddConstellation();
            lastSpawnTime.constellation = time;
        }
        
        // ** UPDATE AND CLEANUP DYNAMIC OBJECTS **
        [...planets, ...asteroids, ...constellations].forEach(obj => {
            obj.position.add(obj.userData.velocity);
            obj.rotation.y += obj.userData.rotationSpeed;
            if(obj.position.z > camera.position.z + 500) {
                scene.remove(obj);
                if (planets.includes(obj)) planets = planets.filter(p => p !== obj);
                if (asteroids.includes(obj)) asteroids = asteroids.filter(a => a !== obj);
                if (constellations.includes(obj)) constellations = constellations.filter(c => c !== obj);
            }
        });

        renderer.render(scene, camera);
    }
    animate();

    function createStarGeometry(count) {
        const vertices = [];
        for (let i = 0; i < count; i++) {
            vertices.push(THREE.MathUtils.randFloatSpread(2000));
            vertices.push(THREE.MathUtils.randFloatSpread(2000));
            vertices.push(THREE.MathUtils.randFloatSpread(2000));
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        return geometry;
    }

    function createStarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(0.4, 'rgba(200,220,255,0.2)');
        gradient.addColorStop(1, 'rgba(200,220,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,64,64);
        return new THREE.CanvasTexture(canvas);
    }

    function createAndAddPlanet() {
        const planetType = Math.random();
        let planet;
        if (planetType < 0.4) planet = createRockyPlanet();
        else if (planetType < 0.8) planet = createGasGiant();
        else planet = createIcyPlanet();
        resetObjectPosition(planet);
        planets.push(planet);
        scene.add(planet);
    }
    
    function createRockyPlanet() {
        const size = THREE.MathUtils.randFloat(10, 30);
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const texture = new THREE.CanvasTexture(generateProceduralTexture('rocky'));
        const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
        return new THREE.Mesh(geometry, material);
    }

    function createGasGiant() {
        const size = THREE.MathUtils.randFloat(40, 70);
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const texture = new THREE.CanvasTexture(generateProceduralTexture('gas'));
        const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 });
        const planet = new THREE.Mesh(geometry, material);
        if (Math.random() > 0.5) {
            const ringGeom = new THREE.RingGeometry(size * 1.2, size * 1.8, 64);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.random() * Math.PI;
            planet.add(ring);
        }
        return planet;
    }
    
    function createIcyPlanet() {
        const size = THREE.MathUtils.randFloat(15, 40);
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const texture = new THREE.CanvasTexture(generateProceduralTexture('icy'));
        const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.2, metalness: 0.1 });
        return new THREE.Mesh(geometry, material);
    }

    function generateProceduralTexture(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (type === 'rocky') {
            const baseColor = new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.5, 0.4);
            ctx.fillStyle = `#${baseColor.getHexString()}`;
            ctx.fillRect(0, 0, 512, 256);
            for (let i = 0; i < 2000; i++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
                ctx.beginPath();
                ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (type === 'gas') {
            const c1 = new THREE.Color().setHSL(Math.random() * 0.1 + 0.1, 0.6, 0.6);
            const c2 = new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.5, 0.5);
            for(let i=0; i<15; i++) {
                ctx.fillStyle = i % 2 === 0 ? `#${c1.getHexString()}` : `#${c2.getHexString()}`;
                ctx.fillRect(0, i * (256/15), 512, 256/15);
            }
        } else { // icy
            const baseColor = new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.8, 0.8);
            ctx.fillStyle = `#${baseColor.getHexString()}`;
            ctx.fillRect(0, 0, 512, 256);
            for (let i = 0; i < 500; i++) {
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
                ctx.beginPath();
                ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 10, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        return canvas;
    }

    function createAndAddAsteroidBelt() {
        const count = 150;
        const belt = new THREE.Group();
        const baseGeometry = new THREE.IcosahedronGeometry(1, 0);

        for(let i=0; i < count; i++) {
            const geometry = baseGeometry.clone();
            const positionAttribute = geometry.getAttribute('position');
            const vertex = new THREE.Vector3();
            for (let j = 0; j < positionAttribute.count; j++){
                vertex.fromBufferAttribute(positionAttribute, j);
                vertex.x += Math.random() * 0.4 - 0.2;
                vertex.y += Math.random() * 0.4 - 0.2;
                vertex.z += Math.random() * 0.4 - 0.2;
                positionAttribute.setXYZ(j, vertex.x, vertex.y, vertex.z);
            }
            const material = new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL(0,0,Math.random()*0.3 + 0.2), roughness: 0.9});
            const asteroid = new THREE.Mesh(geometry, material);
            asteroid.position.set(THREE.MathUtils.randFloatSpread(80), THREE.MathUtils.randFloatSpread(80), THREE.MathUtils.randFloatSpread(80));
            asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            belt.add(asteroid);
        }
        resetObjectPosition(belt);
        asteroids.push(belt);
        scene.add(belt);
    }
    
    function createAndAddConstellation() {
        const group = new THREE.Group();
        const starCount = THREE.MathUtils.randInt(5, 10);
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0x99ccff, emissive: 0x99ccff, transparent: true, opacity: 0.7 });
        for (let i = 0; i < starCount; i++) {
            const starGeom = new THREE.SphereGeometry(Math.random() * 0.5 + 0.3, 8, 8);
            const star = new THREE.Mesh(starGeom, starMaterial);
            star.position.set(THREE.MathUtils.randFloatSpread(100), THREE.MathUtils.randFloatSpread(100), 0);
            group.add(star);
        }
        resetObjectPosition(group);
        constellations.push(group);
        scene.add(group);
    }


    function resetObjectPosition(obj) {
         obj.position.z = THREE.MathUtils.randFloat(-3000, -4000);
         obj.position.x = THREE.MathUtils.randFloatSpread(1500);
         obj.position.y = THREE.MathUtils.randFloatSpread(800);
         obj.userData.velocity = new THREE.Vector3(0, 0, THREE.MathUtils.randFloat(1.5, 4));
         obj.userData.rotationSpeed = Math.random() * 0.005;
    }

    window.addEventListener('resize', debounce(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, 250));
}

// --- 2D Canvas Fallback ---
function init2DFallback() {
    const ctx = canvas.getContext('2d');
    let stars = Array.from({ length: 600 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        alpha: Math.random(),
        speed: Math.random() * 0.2 + 0.1
    }));
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        stars.forEach(star => {
            star.x = Math.random() * canvas.width;
            star.y = Math.random() * canvas.height;
        });
    }
    resizeCanvas();

    function animate2D() {
        animationFrameId = requestAnimationFrame(animate2D);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        
        stars.forEach(star => {
            star.y -= star.speed;
            if (star.y < 0) {
                star.y = canvas.height;
                star.x = Math.random() * canvas.width;
            }
            ctx.globalAlpha = star.alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
    animate2D();
    
    window.addEventListener('resize', debounce(resizeCanvas, 250));
}


// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        calculateExperience();
        setupScratchCards();
        setupQuizModal();
        setupDevToolsDetection();
        runSecurityDeterrents();
        
        document.addEventListener('contextmenu', event => event.preventDefault());

        if (supportsWebGL()) {
            initWebGLSpace();
        } else {
            console.warn("WebGL not supported, falling back to 2D canvas animation.");
            init2DFallback();
        }
    } catch (error) {
        console.error("An error occurred during initialization:", error);
        document.body.style.backgroundColor = '#020204';
    }
});
