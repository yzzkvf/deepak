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

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        calculateExperience();
        setupDecryptionEvents();
        setupSourceProtection(); // Activate Security
        setupQuizModal();
        printConsoleWelcome();
        initHiddenTerminal();

        // Initialize Agents
        Agents.init();

        // Title Typing Animation
        const titleElement = document.querySelector('h1');
        if (titleElement) {
            const originalTitle = titleElement.textContent;
            typeWriter(titleElement, originalTitle, 50);
        }

    } catch (error) {
        console.error("Init Error:", error);
    }
});
