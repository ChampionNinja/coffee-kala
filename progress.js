// Progress Bar Animation
function animateProgress() {
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    
    if (!progressBar || !progressPercentage) return;
    
    let currentProgress = 0;
    const targetProgress = 82;
    const duration = 300000; // 5 minutes (300,000 milliseconds)
    const startTime = Date.now();
    
    function updateProgress() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        currentProgress = Math.floor(eased * targetProgress);
        
        progressBar.style.width = currentProgress + '%';
        progressPercentage.textContent = currentProgress + '% COMPLETE';
        
        if (progress < 1) {
            requestAnimationFrame(updateProgress);
        }
    }
    
    // Start animation after a short delay
    setTimeout(() => {
        updateProgress();
    }, 500);
}

// Run animation when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateProgress);
} else {
    animateProgress();
}
