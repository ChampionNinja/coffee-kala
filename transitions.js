// Page Transition System
(function() {
    'use strict';
    
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
    
    // Fade in on page load
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
    });
    
    // Handle all internal links
    function handleLinkClick(e) {
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        // Skip if it's an external link, anchor, or special link
        if (!href || 
            href.startsWith('#') || 
            href.startsWith('http') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            link.target === '_blank') {
            return;
        }
        
        // Prevent default navigation
        e.preventDefault();
        
        // Show transition overlay
        overlay.classList.add('active');
        
        // Navigate after animation
        setTimeout(function() {
            window.location.href = href;
        }, 300);
    }
    
    // Attach to all links
    function attachTransitions() {
        const links = document.querySelectorAll('a[href]');
        links.forEach(function(link) {
            // Remove existing listener if any
            link.removeEventListener('click', handleLinkClick);
            // Add new listener
            link.addEventListener('click', handleLinkClick);
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachTransitions);
    } else {
        attachTransitions();
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            overlay.classList.remove('active');
        }
    });
    
    // Remove overlay on page show
    window.addEventListener('pageshow', function() {
        overlay.classList.remove('active');
    });
    
})();
