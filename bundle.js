// Maker Bundle functionality
document.addEventListener('DOMContentLoaded', function() {
    const claimBundleBtn = document.getElementById('claim-maker-bundle');
    
    if (claimBundleBtn) {
        claimBundleBtn.addEventListener('click', function() {
            // Store bundle in localStorage
            const makerBundle = {
                name: 'THE MAKER BUNDLE',
                price: 5158, // Original total: 1999 + 2299 + 2149 = 6447, with 20% off = 5157.60
                quantity: 1,
                grind: 'FINE',
                description: 'Bundle includes: BLACKOUT NITRO (340g), THE ARCHITECT (340g), VOLTAGE V2 (340g). Save 20%!',
                items: [
                    'BLACKOUT NITRO (340g)',
                    'THE ARCHITECT (340g)',
                    'VOLTAGE V2 (340g)'
                ],
                isBundle: true,
                image: './img/nathan-dumlao-Y3AqmbmtLQI-unsplash.jpg'
            };
            
            // Get existing cart or create new one
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // Check if bundle already exists
            const bundleExists = cart.some(item => item.isBundle && item.name === 'THE MAKER BUNDLE');
            
            if (bundleExists) {
                // Increase quantity
                cart = cart.map(item => {
                    if (item.isBundle && item.name === 'THE MAKER BUNDLE') {
                        return { ...item, quantity: item.quantity + 1 };
                    }
                    return item;
                });
            } else {
                // Add new bundle
                cart.push(makerBundle);
            }
            
            // Save cart
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart badge
            updateCartBadge();
            
            // Show confirmation
            showAddedToCartNotification();
            
            // Redirect to cart after a short delay with transition
            setTimeout(() => {
                // Trigger page transition
                const overlay = document.querySelector('.page-transition-overlay');
                if (overlay) {
                    overlay.classList.add('active');
                }
                
                setTimeout(() => {
                    window.location.href = 'cart.html';
                }, 300);
            }, 800);
        });
    }
});

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    document.querySelectorAll('.cart-badge').forEach(badge => {
        badge.textContent = totalItems;
        if (totalItems > 0) {
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });
}

function showAddedToCartNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 right-6 bg-[#8B6F47] text-white px-6 py-4 brutalist-border-heavy shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 font-["Space_Grotesk"] font-black uppercase text-sm';
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined">check_circle</span>
            <span>ADDED TO CART!</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize cart badge on page load
updateCartBadge();
