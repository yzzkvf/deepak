// Initialize AOS for content animations on scroll
AOS.init({
    duration: 500,
    once: true,
    offset: 30,
    easing: 'steps(8)', // Retro feel
});

// --- TUI & Visual Effects ---

/**
 * Typewriter effect for text elements.
 */
function typeWriter(element, text, speed = 40, callback) {
    let i = 0;
    element.textContent = ''; // Clear existing
    element.innerHTML = ''; // Clear any children

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            // Append blinking cursor block
            const cursor = document.createElement('span');
            cursor.className = 'msg-cursor';
            cursor.style.display = 'inline-block';
            cursor.style.width = '10px';
            cursor.style.height = '1em';
            cursor.style.background = 'var(--color-terminal-green)';
            cursor.style.marginLeft = '5px';
            cursor.style.animation = 'blink 1s step-end infinite';
            element.appendChild(cursor);
            if (callback) callback();
        }
    }
    type();
}

/**
 * Calculates experience years
 */
function calculateExperience() {
    const startDate = new Date(2011, 7, 1);
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
 * SECURITY: Decodes Base64 string.
 */
function decode(str) {
    try {
        return atob(str);
    } catch (e) {
        console.error("Failed to decode:", e);
        return '';
    }
}

// --- TUI Decryption Logic ---

let isAuthenticated = false; // Global Auth State
let pendingDecryptionTarget = null;
let pendingActionType = null; // 'reveal' or 'download'

function setupDecryptionEvents() {
    document.querySelectorAll('.encrypted-container').forEach(container => {
        container.addEventListener('click', () => {
            // Unlocking logic if already authenticated
            if (isAuthenticated && !container.classList.contains('decrypted')) {
                decryptAndReveal(container, container.dataset.value);
                return;
            }
            if (container.classList.contains('decrypted')) return;

            pendingDecryptionTarget = container;
            pendingActionType = 'reveal';
            openQuizModal();
        });
    });

    const downloadBtn = document.getElementById('show-quiz-button');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (isAuthenticated) {
                // Instant download if authenticated
                if (Agents && Agents.nexus) {
                    Agents.nexus.activate('DOWNLOADING...');
                    setTimeout(() => Agents.nexus.idle(), 3000);
                }
                triggerDownload();
                return;
            }
            pendingDecryptionTarget = null;
            pendingActionType = 'download';
            openQuizModal();
        });
    }
}

function setupSourceProtection() {
    // Disable Right Click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // Disable Keyboard Shortcuts for DevTools & Source
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U (View Source)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
            e.preventDefault();
            return false;
        }

        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }

        // Mac Command alternatives (Cmd+Option+I/J/U)
        if (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });

    // Disable Image Dragging
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });
}

function triggerDownload() {
    const link = document.createElement('a');
    link.href = 'resources/deepak_resume.pdf';
    link.download = 'Deepak_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function decryptAndReveal(container, trueValue) {
    const textSpan = container.querySelector('.encrypted-text');
    const icon = container.querySelector('i');
    const decoded = decode(trueValue);

    // Decrypt Effect
    let iterations = 0;
    const chars = 'XYZ0123456789!@#$%^&*()';
    const interval = setInterval(() => {
        textSpan.textContent = textSpan.textContent.split('')
            .map((letter, index) => {
                if (index < iterations) {
                    return decoded[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

        if (iterations >= decoded.length) {
            clearInterval(interval);
            textSpan.textContent = decoded;
            container.classList.add('decrypted');

            // Interaction enable
            if (container.dataset.type === 'mailto') {
                container.onclick = () => window.location.href = `mailto:${decoded}`;
                container.title = "Click to send mail";
            } else if (container.dataset.type === 'tel') {
                container.onclick = () => window.location.href = `tel:${decoded}`;
                container.title = "Click to call";
            }

            if (icon) icon.className = "fas fa-unlock fa-fw text-green";
        }

        iterations += 1 / 2;
    }, 50);
}

// --- Quiz Modal Logic ---

function setupQuizModal() {
    const modal = document.getElementById('quiz-modal');
    const closeBtn = document.getElementById('close-quiz-button');
    const submitBtn = document.getElementById('submit-quiz-button');
    const answerInput = document.getElementById('quiz-answer');
    const feedback = document.getElementById('quiz-feedback');

    let q1, n, expected;

    window.openQuizModal = function () {
        if (isAuthenticated) return;

        q1 = Math.floor(Math.random() * 20);
        n = Math.floor(Math.random() * 10) + 1;
        let seq = [q1, q1 + n, q1 + 2 * n];
        expected = q1 + 3 * n;

        const promptText = document.querySelector('#quiz-modal p');
        if (promptText) promptText.textContent = `Security Sequence: ${seq.join(', ')}, [ ? ]`;

        modal.classList.remove('modal-hidden');
        modal.classList.add('modal-visible');
        answerInput.value = '';
        feedback.textContent = '';
        answerInput.focus();
    };

    function closeModal() {
        modal.classList.remove('modal-visible');
        modal.classList.add('modal-hidden');
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });

    function checkAnswer() {
        // Backdoor: type 'admin' or 'recruit'
        const val = answerInput.value.toLowerCase().trim();

        // VISUAL: Trigger Cipher Agent
        if (Agents && Agents.cipher) Agents.cipher.activate('CRACKING...');

        setTimeout(() => {
            if (parseInt(val) === expected || val === 'recruit' || val === 'admin') {
                isAuthenticated = true; // Set Global Auth
                feedback.style.color = '#4af626';
                feedback.textContent = 'ACCESS GRANTED. SYSTEM UNLOCKED.';

                if (Agents && Agents.cipher) Agents.cipher.idle('ACCESS GRANTED');
                if (Agents && Agents.sentinel) {
                    Agents.sentinel.activate('VERIFIED');
                    setTimeout(() => Agents.sentinel.idle(), 2000);
                }

                // Start Session Timer
                startSessionTimer();

                setTimeout(() => {
                    closeModal();

                    // Unlock ALL encrypted items AUTOMATICALLY
                    document.querySelectorAll('.encrypted-container').forEach(c => {
                        if (!c.classList.contains('decrypted')) {
                            decryptAndReveal(c, c.dataset.value);
                        }
                    });

                    // Perform the specific triggered action
                    if (pendingActionType === 'download') {
                        if (Agents && Agents.nexus) {
                            Agents.nexus.activate('DOWNLOADING...');
                            setTimeout(() => Agents.nexus.idle(), 3000);
                        }
                        triggerDownload();
                    }
                }, 600);
            } else {
                feedback.style.color = '#ff3333';
                feedback.textContent = 'ACCESS DENIED.';
                if (Agents && Agents.cipher) Agents.cipher.alert('FAILURE');
                if (Agents && Agents.sentinel) Agents.sentinel.alert('BREACH DETECTED');
            }
        }, 500); // Effect delay
    }
}

// --- Easter Eggs & Features ---

function printConsoleWelcome() {
    console.clear();
    const style = 'color: #4af626; font-family: monospace; font-size: 14px; font-weight: bold;';
    const logo = `
  _____   _____  _____  
 |  __ \\ / ____||  __ \\ 
 | |  | | (___  | |__) |
 | |  | |\\___ \\ |  _  / 
 | |__| |____) || | \\ \\ 
 |_____/|_____/ |_|  \\_\\
                        
    `;
    console.log(`%c${logo}`, style);
    console.log('%cWelcome to the source code.', style);
    console.log('%cLooking for something specific? Try typing "help" in the main window (no input focus needed).', 'color: #e6e6e6; font-family: monospace;');
    console.log('%cSystem Status: SECURE | ONLINE', 'color: #4af626; font-family: monospace;');
}

function initHiddenTerminal() {
    const overlay = document.getElementById('terminal-overlay');
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');

    let buffer = '';

    // Global listener for "help" or "ls" typing
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input field (honeypot, quiz, or terminal itself)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // Simple buffer for cheat codes
        if (e.key.length === 1) {
            buffer += e.key.toLowerCase();
            if (buffer.length > 10) buffer = buffer.slice(-10); // keep last 10 chars

            if (buffer.endsWith('help') || buffer.endsWith('ls')) {
                toggleTerminal(true);
                buffer = '';
            }
        }
    });

    function toggleTerminal(show) {
        if (show) {
            overlay.classList.add('open');
            input.focus();
        } else {
            overlay.classList.remove('open');
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim().toLowerCase();
            processCommand(cmd);
            input.value = ''; // clear
        } else if (e.key === 'Escape') {
            toggleTerminal(false);
        }
    });

    function processCommand(cmd) {
        let response = '';
        const args = cmd.split(' ');

        // Print command
        const cmdLine = document.createElement('div');
        cmdLine.innerHTML = `<span class="text-amber">visitor@dsr-portfolio:~$</span> ${cmd}`;
        output.appendChild(cmdLine);

        // Process
        switch (args[0]) {
            case 'help':
                response = `Available commands:
  help       Show this help message
  ls         List system files
  cat [file] Read file content
  whoami     Display current user info
  contact    Request contact decryption
  resume     Request resume download
  clear      Clear terminal
  exit       Close terminal
  
  * Note: Sensitive data requires security clearance pattern verification.`;
                break;
            case 'ls':
                response = `total 42
drwxr-xr-x  2 deepak  staff   64 Jan 17 21:00  .
drwxr-xr-x  5 deepak  staff  160 Jan 17 21:00  ..
-rw-r--r--  1 deepak  staff  2KB Jan 17 21:00  about_me.txt
-rw-r--r--  1 deepak  staff  4KB Jan 17 21:00  skills.json
-rw-r--r--  1 deepak  staff  1KB Jan 17 21:00  contact.enc
-rwxr-xr-x  1 deepak  staff  5MB Jan 17 21:00  deepak_resume.pdf`;
                break;
            case 'cat':
                if (!args[1]) {
                    response = 'usage: cat [file]';
                } else if (args[1] === 'contact.enc') {
                    response = 'Accessing encrypted file... Security Clearance Required.';
                    // Trigger UI auth for contact info
                    document.querySelectorAll('.encrypted-container')[0].click();
                } else if (args[1] === 'deepak_resume.pdf') {
                    response = 'Initiating binary download... Security Clearance Required.';
                    document.getElementById('show-quiz-button').click();
                } else if (args[1] === 'about_me.txt') {
                    response = 'Deepak Samuel Rajan. Full Stack Developer. Kotlin expert. Dubai Police Veteran.';
                } else if (args[1] === 'skills.json') {
                    response = '{ "core": ["Kotlin", "Java", "Swift"], "status": "Ready to Hire" }';
                } else {
                    response = `cat: ${args[1]}: No such file or directory`;
                }
                break;
            case 'whoami':
                response = 'visitor (guest privilege)\nScanning... Location: Internet.\nStatus: Hiring Manager / curious dev?';
                break;
            case 'clear':
                output.innerHTML = '';
                return;
            case 'exit':
                toggleTerminal(false);
                return;
            case 'contact':
                response = 'Initiating decryption protocols... Check main UI.';
                // We click the first one to trigger the modal, user can decrypt others after
                const contact = document.querySelector('.encrypted-container:not(.decrypted)');
                if (contact) contact.click();
                else response = 'Contact info already decrypted.';
                break;
            case 'resume':
                response = 'Initiating download...';
                document.getElementById('show-quiz-button').click();
                break;
            default:
                if (cmd !== '') response = `bash: ${cmd}: command not found`;
        }

        if (response) {
            const resDiv = document.createElement('div');
            resDiv.className = 'text-green';
            resDiv.style.whiteSpace = 'pre-wrap';
            resDiv.textContent = response;
            output.appendChild(resDiv);
        }

        // Scroll to bottom
        overlay.scrollTop = overlay.scrollHeight;
    }
}


// --- AI Agent System ---

const Agents = {
    sentinel: null,
    cipher: null,
    nexus: null,

    init() {
        this.sentinel = new Agent('sentinel', 'SCANNING...', 'SYSTEM SECURE');
        this.cipher = new Agent('cipher', 'DECRYPTING...', 'IDLE');
        this.nexus = new Agent('nexus', 'UPLINK ACTIVE', 'ONLINE');

        // Initial Sentinel Scan
        this.sentinel.activate();
        setTimeout(() => {
            this.sentinel.idle();
        }, 2000);
    }
};

class Agent {
    constructor(id, activeText, idleText) {
        this.id = id;
        this.element = document.getElementById(`agent-${id}`);
        this.statusElement = this.element ? this.element.querySelector('.agent-status') : null;
        this.activeText = activeText;
        this.idleText = idleText;
    }

    activate(textOverride = null) {
        if (!this.element) return;
        this.element.classList.add('active');
        this.element.classList.remove('alert');
        if (this.statusElement) this.statusElement.textContent = textOverride || this.activeText;
    }

    idle(textOverride = null) {
        if (!this.element) return;
        this.element.classList.remove('active');
        this.element.classList.remove('alert');
        if (this.statusElement) this.statusElement.textContent = textOverride || this.idleText;
    }

    alert(text) {
        if (!this.element) return;
        this.element.classList.add('active'); // Pulse
        this.element.classList.add('alert'); // Red
        if (this.statusElement) this.statusElement.textContent = text;
        setTimeout(() => this.idle(), 3000);
    }
}

// --- Active Monitoring & Session Control ---

/**
 * Fetches visitor IP and Location data.
 * Uses multiple fallbacks to ensure display.
 */
async function fetchVisitorIntel() {
    const intelWidget = document.getElementById('visitor-intel');
    const intelData = document.getElementById('intel-data');

    // Visual scanning effect before fetch
    if (intelWidget) intelWidget.classList.remove('hidden');

    const textUpdate = (text, isError = false) => {
        if (intelData) {
            intelData.textContent = text;
            intelData.classList.remove('blink');
            intelData.style.color = isError ? 'var(--color-terminal-amber)' : 'var(--color-terminal-green)';
        }
    };

    // List of free IP APIs to try
    const services = [
        'https://ipapi.co/json/',
        'https://ipwho.is/'
    ];

    for (const service of services) {
        try {
            const response = await fetch(service);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            const ip = data.ip || 'UNKNOWN';
            const city = data.city || 'Unknown';

            textUpdate(`IDENTITY: ${ip} // LOC: ${city.toUpperCase()}`);

            // Update Sentinel
            if (Agents && Agents.sentinel) {
                Agents.sentinel.activeText = `TARGET: ${city.toUpperCase()}`;
                Agents.sentinel.activate();
                setTimeout(() => Agents.sentinel.idle('MONITORING'), 5000);
            }

            return; // Success, exit function
        } catch (err) {
            console.warn(`Fetch failed for ${service}:`, err);
            // Loop continues to next service
        }
    }

    // Fallback if all APIs fail (likely AdBlock or Local File execution)
    textUpdate(':: ORIGIN_CLASSIFIED ::', true);
    if (Agents && Agents.sentinel) Agents.sentinel.idle('TARGET: UNKNOWN');
}

/**
 * Starts the 60s security session timer.
 */
let sessionInterval;
function startSessionTimer() {
    let timeLeft = 60;

    // Clear any existing timer
    if (sessionInterval) clearInterval(sessionInterval);

    // Update Nexus (Network)
    if (Agents && Agents.nexus) Agents.nexus.activate('SECURE_LINK ESTABLISHED');

    sessionInterval = setInterval(() => {
        timeLeft--;

        // Update Cipher Agent with countdown
        if (Agents && Agents.cipher) {
            Agents.cipher.activeText = `SESSION: ${timeLeft}s`;
            Agents.cipher.activate();
            // Pulse red when low time
            if (timeLeft < 10) Agents.cipher.element.classList.add('alert');
        }

        if (timeLeft <= 0) {
            clearInterval(sessionInterval);
            lockContent();
        }
    }, 1000);
}

/**
 * Custom TUI Alert
 */
function showSystemAlert(msg) {
    const alertModal = document.getElementById('system-alert');
    const msgElem = document.getElementById('system-alert-msg');
    const closeBtn = document.getElementById('close-alert-button');

    if (alertModal && msgElem) {
        msgElem.textContent = msg;
        alertModal.classList.remove('modal-hidden');
        alertModal.classList.add('modal-visible');

        closeBtn.onclick = () => {
            alertModal.classList.remove('modal-visible');
            alertModal.classList.add('modal-hidden');
        };
    }
}

/**
 * Re-locks the system after timeout.
 */
function lockContent() {
    isAuthenticated = false;

    // Visual Feedback - Custom TUI Modal
    showSystemAlert('SESSION EXPIRED: Security measures re-engaged.');

    // Re-lock all containers
    document.querySelectorAll('.encrypted-container').forEach(container => {
        container.classList.remove('decrypted');
        const textSpan = container.querySelector('.encrypted-text');
        const icon = container.querySelector('i');

        // Restore encrypted look
        textSpan.textContent = '[ ENCRYPTED_DATA ]';
        textSpan.style.color = '#ff3333';
        if (icon) icon.className = "fas fa-lock fa-fw";

        // Remove interaction handlers
        container.onclick = null;
        container.title = "";
    });

    // Reset Agents
    if (Agents.cipher) Agents.cipher.alert('SESSION TERMINATED');
    if (Agents.nexus) Agents.nexus.idle('OFFLINE');
    if (Agents.sentinel) Agents.sentinel.activeText = "SCANNING...";

    // Clean reset of onclick handlers
    // We reload the Setup to re-bind the original "Click to unlock" listeners
    // This is safer than trying to manually reconstruct them
    setupDecryptionEvents();
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        calculateExperience();
        setupDecryptionEvents();
        setupSourceProtection();
        setupQuizModal();
        printConsoleWelcome();
        initHiddenTerminal();

        // Initialize Agents
        Agents.init();

        // Start Surveillance immediately
        fetchVisitorIntel();

        // Title Typing Animation 
        const titleElement = document.querySelector('h1');
        if (titleElement) {
            const originalTitle = titleElement.textContent;
            typeWriter(titleElement, originalTitle, 50);
        }

        // Initialize Matrix Scramble
        initScrollDecryption();

    } catch (error) {
        console.error("Init Error:", error);
    }
});

/**
 * Matrix/Hacker Scramble Effect
 */
function initScrollDecryption() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const scrambleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                if (!element.dataset.scrambled) {
                    new HackerScramble(element);
                    element.dataset.scrambled = "true"; // Ensure it runs once
                }
                scrambleObserver.unobserve(element);
            }
        });
    }, observerOptions);

    // Target text elements (excluding h1 which has typewriter)
    document.querySelectorAll('p, h2, h3, h4, li, span.skill-tag').forEach(el => {
        // Skip if inside specific interactive containers to avoid breaking them
        if (el.closest('.encrypted-container') || el.closest('#terminal-output') || el.closest('#agent-dock')) return;

        // Skip empty elements
        if (el.textContent.trim().length === 0) return;

        scrambleObserver.observe(el);
    });
}

class HackerScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.originalText = el.textContent;
        this.update = this.update.bind(this);
        this.frame = 0;
        this.queue = [];

        // Create the queue of resolving characters
        for (let i = 0; i < this.originalText.length; i++) {
            const char = this.originalText[i];
            this.queue.push({
                from: i,
                to: i + 1,
                start: Math.floor(Math.random() * 40),
                char: char
            });
        }

        cancelAnimationFrame(this.frameRequest);
        this.update();
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, char } = this.queue[i];

            if (this.frame >= start) {
                complete++;
                output += char;
            } else {
                output += this.chars[Math.floor(Math.random() * this.chars.length)];
            }
        }

        this.el.textContent = output;

        if (complete === this.queue.length) {
            // Done
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}
