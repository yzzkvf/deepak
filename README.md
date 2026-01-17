# DSR-OS v2.0 // TUI Portfolio

> **"Terminals never die."**

A hardcore **Cyberpunk TUI (Text User Interface)** portfolio designed to look and feel like a secure mainframe terminal. Built with raw HTML, CSS, and Vanilla JavaScript—no heavy frameworks, just pure code.

## 🟢 System Features

### 1. Visual Identity
-   **TUI Aesthetics**: Monospace fonts (`Fira Code`, `VT323`), neon greens/ambers, and CRT scanline effects.
-   **Live HUD**: Animated headers with blinking status lights and system ID readouts.
-   **FaceID Scanner**: A pure CSS scanning animation over the profile picture.
-   **Terminal Chips**: Interactive skill tags with hover-glow effects and "physical" depth.

### 2. Security Protocols (Gamified)
-   **Encrypted Data**: Contact info and resume are "encrypted" by default.
-   **Security Clearance**: Users must solve a randomly generated sequence puzzle to unlock data.
-   **Active Monitoring**: 
    -   Scans visitor IP and Location using `ipapi` / `ipwho.is`.
    -   Displays "Target Identified: [City]" in the Agent Dock.
-   **Session Auto-Lock**: 
    -   Once authenticated, a **60-second timer** begins.
    -   When time expires, a custom **System Alert** locks the screen and re-encrypts all data.
-   **Source Protection**: Disables Right-Click, F12, and DevTools shortcuts to simulate a secure environment.

### 3. AI Agent Dock
A fixed "Command & Control" dock at the bottom right monitors system status:
-   **SENTINEL**: Tracks Visitor Location.
-   **CIPHER**: Manages Encryption & Session Timer.
-   **NEXUS**: Monitors Network/Download links.

### 4. Hidden Terminal 💻
Type `help` or `ls` anywhere on the screen (no input box needed) to summon the **Hidden Console Overlay**.
-   **Commands**: `help`, `ls`, `cat [file]`, `whoami`, `contact`, `resume`.
-   **Easter Eggs**: Try `cat about_me.txt`.

## 🛠️ Tech Stack

-   **Core**: HTML5, CSS3 (Custom Properties/Variables), Vanilla JavaScript (ES6+).
-   **Libraries**: 
    -   `AOS` (Animate On Scroll) for entry animations.
    -   `FontAwesome 6` for icons.
-   **APIs**: `ipapi.co` / `ipwho.is` for geolocation.

## 🚀 Deployment

This project is static-site ready.

1.  **GitHub Pages**: Push to a repo and enable Pages from settings.
2.  **Netlify/Vercel**: Drag and drop the folder.

## 📂 Project Structure

```bash
.
├── index.html       # Main DOM Structure (Semantic HTML)
├── styles.css       # The "Engine" (CSS Variables, Animations, Layout)
├── scripts.js       # The "Logic" (Agents, Security, Matrix Effects)
└── resources/       # Assets (Images, PDFs)
```

## ⚠️ Note on Local Testing

If opening `index.html` directly from your file system (`file://`), the **IP Scanner** may fail or show `:: ORIGIN_CLASSIFIED ::` due to browser CORS restrictions. Run via a local server (e.g., VS Code "Live Server") for full functionality.

---

**System Status**: `ONLINE` | **Security**: `MAXIMUM`
