// Global dark mode functionality
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;

    // Function to apply theme
    const applyTheme = (theme) => {
        htmlElement.setAttribute('data-theme', theme);
        if (darkModeToggle) {
            darkModeToggle.setAttribute('aria-pressed', theme === 'dark');
        }
        localStorage.setItem('globalTheme', theme); // Use a global key
    };

    // Check for saved theme on load
    const savedTheme = localStorage.getItem('globalTheme');
    // Check for system preference if no saved theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Initialize theme
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('light'); // Default to light always
    }

    // Toggle button event listener
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            // Re-render charts after theme change if they exist
            if (typeof renderCharts === 'function') {
                setTimeout(renderCharts, 100);
            }
        });
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Only change if no theme was explicitly set by the user via toggle
        if (!localStorage.getItem('globalTheme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
            if (typeof renderCharts === 'function') {
                setTimeout(renderCharts, 100);
            }
        }
    });
}); 