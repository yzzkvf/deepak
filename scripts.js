// Initialize AOS for animations
AOS.init({
    duration: 800,
    once: true,
    offset: 50,
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

// Theme toggle logic
function initializeTheme() {
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const savedTheme = localStorage.getItem('theme');

    // Apply saved theme or default to dark mode
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleCheckbox.checked = true;
    }

    // Toggle theme on checkbox change
    themeToggleCheckbox.addEventListener('change', () => {
        document.body.classList.toggle('light-mode');
        const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
    });
}

// Calculate experience and initialize theme when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    calculateExperience();
    initializeTheme();
});

// Direct PDF Download Logic
document.getElementById('download-resume').addEventListener('click', function () {
    const link = document.createElement('a');
    link.href = 'resources/deepak_resume.pdf';
    link.download = 'deepak_resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});