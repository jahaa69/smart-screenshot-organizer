// Toggle state management
let isAutoOrganizeEnabled = false;

// Get the toggle button element
const toggleButton = document.getElementById('toggleAutoOrganize');

// Add click event listener
toggleButton.addEventListener('click', function() {
    isAutoOrganizeEnabled = !isAutoOrganizeEnabled;
    
    // Update button appearance
    if (isAutoOrganizeEnabled) {
        toggleButton.classList.add('active');
        toggleButton.textContent = 'Auto-organize: ON';
    } else {
        toggleButton.classList.remove('active');
        toggleButton.textContent = 'Auto-organize: OFF';
    }
    
    // Save preference
    localStorage.setItem('autoOrganizeEnabled', isAutoOrganizeEnabled);
});

// Load saved preference on page load
window.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('autoOrganizeEnabled') === 'true';
    if (saved) {
        isAutoOrganizeEnabled = true;
        toggleButton.classList.add('active');
        toggleButton.textContent = 'Auto-organize: ON';
    }
});