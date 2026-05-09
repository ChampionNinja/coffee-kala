// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Quantity controls
    const quantityControls = document.querySelectorAll('.quantity-control');
    
    quantityControls.forEach(control => {
        const minusBtn = control.querySelector('.quantity-minus');
        const plusBtn = control.querySelector('.quantity-plus');
        const display = control.querySelector('.quantity-display');
        
        minusBtn.addEventListener('click', () => {
            let currentValue = parseInt(display.textContent);
            if (currentValue > 1) {
                display.textContent = String(currentValue - 1).padStart(2, '0');
                updateCartTotals();
                saveCartToStorage();
            }
        });
        
        plusBtn.addEventListener('click', () => {
            let currentValue = parseInt(display.textContent);
            if (currentValue < 99) {
                display.textContent = String(currentValue + 1).padStart(2, '0');
                updateCartTotals();
                saveCartToStorage();
            }
        });
    });
    
    // Grind calibration selection
    const grindButtons = document.querySelectorAll('.grind-option');
    
    grindButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active state from siblings
            const siblings = button.parentElement.querySelectorAll('.grind-option');
            siblings.forEach(sibling => {
                sibling.classList.remove('bg-primary', 'text-on-primary');
                sibling.classList.add('bg-white', 'text-primary');
            });
            
            // Add active state to clicked button
            button.classList.remove('bg-white', 'text-primary');
            button.classList.add('bg-primary', 'text-on-primary');
            
            saveCartToStorage();
        });
    });
    
    // Remove item functionality
    const removeButtons = document.querySelectorAll('.remove-item');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cartItem = button.closest('.cart-item');
            cartItem.style.opacity = '0';
            cartItem.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                cartItem.remove();
                updateCartTotals();
                updateCartCount();
                saveCartToStorage();
            }, 300);
        });
    });
    
    // Form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                cardholderName: document.getElementById('cardholder-name').value,
                cardNumber: document.getElementById('card-number').value,
                expiryDate: document.getElementById('expiry-date').value,
                cvv: document.getElementById('cvv').value,
                address: document.getElementById('delivery-address').value
            };
            
            // Basic validation
            if (!formData.cardholderName || !formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.address) {
                alert('Please fill in all fields');
                return;
            }
            
            // Store order data in sessionStorage
            sessionStorage.setItem('orderData', JSON.stringify({
                items: getCartItems(),
                total: document.querySelector('.total-amount').textContent,
                ...formData
            }));
            
            // Redirect to thank you page
            window.location.href = 'thankyou.html';
        });
    }
});

function updateCartTotals() {
    const cartItems = document.querySelectorAll('.cart-item');
    let subtotal = 0;
    
    cartItems.forEach(item => {
        const price = parseFloat(item.dataset.price);
        const quantity = parseInt(item.querySelector('.quantity-display').textContent);
        subtotal += price * quantity;
    });
    
    const shipping = 150;
    const taxRate = 0.18;
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;
    
    // Update display
    document.querySelector('.subtotal-amount').textContent = `₹${subtotal.toFixed(2)}`;
    document.querySelector('.tax-amount').textContent = `₹${tax.toFixed(2)}`;
    document.querySelector('.total-amount').textContent = `₹${total.toFixed(2)}`;
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Update all cart badges
    document.querySelectorAll('.cart-badge').forEach(badge => {
        badge.textContent = count;
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'block';
        }
    });
    
    // Show empty cart message if no items
    if (count === 0) {
        const cartContainer = document.querySelector('.cart-items-container');
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="bg-white brutalist-border-heavy hard-shadow-md p-12 text-center">
                    <span class="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">shopping_cart</span>
                    <h3 class="font-['Space_Grotesk'] text-2xl font-black uppercase mb-2">Your Cart is Empty</h3>
                    <p class="text-on-surface-variant mb-6">Add some high-voltage brews to get started</p>
                    <a href="index.html" class="inline-block bg-primary text-on-primary font-label-bold px-8 py-4 brutalist-border-heavy hard-shadow-md active-press uppercase">
                        Browse Shop
                    </a>
                </div>
            `;
        }
        
        // Hide summary section
        const summarySection = document.querySelector('.cart-summary-section');
        if (summarySection) {
            summarySection.style.display = 'none';
        }
    }
}

function getCartItems() {
    const cartItems = document.querySelectorAll('.cart-item');
    const items = [];
    
    cartItems.forEach(item => {
        const name = item.querySelector('.item-name').textContent;
        const price = parseFloat(item.dataset.price);
        const quantity = parseInt(item.querySelector('.quantity-display').textContent);
        const grind = item.querySelector('.grind-option.bg-primary').textContent;
        
        items.push({ name, price, quantity, grind });
    });
    
    return items;
}

function loadCartFromStorage() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        return; // Keep the default 2 items if no cart in storage
    }
    
    // Clear existing cart items
    const cartContainer = document.querySelector('.cart-items-container');
    if (!cartContainer) return;
    
    cartContainer.innerHTML = '';
    
    // Add items from localStorage
    cart.forEach(item => {
        const cartItemHTML = createCartItemHTML(item);
        cartContainer.insertAdjacentHTML('beforeend', cartItemHTML);
    });
    
    // Re-attach event listeners
    attachCartEventListeners();
    
    // Update totals
    updateCartTotals();
    
    // Update cart badge
    updateCartCount();
}

function createCartItemHTML(item) {
    const isBundle = item.isBundle || false;
    const itemDescription = isBundle 
        ? `Bundle includes: ${item.items.join(', ')}`
        : item.description || 'Premium coffee blend';
    
    const imageUrl = item.image || getDefaultImage(item.name);
    
    return `
        <div class="bg-white brutalist-border-heavy hard-shadow-md p-6 flex flex-col md:flex-row gap-6 cart-item transition-all duration-300" data-price="${item.price}">
            <div class="w-full md:w-48 h-48 border-2 border-black shrink-0 bg-surface overflow-hidden">
                <img class="w-full h-full object-cover" src="${imageUrl}" alt="${item.name}" />
            </div>
            <div class="flex-grow flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-['Space_Grotesk'] text-[20px] md:text-[24px] uppercase font-black item-name">${item.name}</h3>
                        <span class="font-label-bold text-[14px] bg-secondary-container text-on-secondary-container px-2 py-1 brutalist-border">₹${item.price.toLocaleString()}</span>
                    </div>
                    <p class="font-['Inter'] text-[14px] text-on-surface-variant mb-4">${itemDescription}</p>
                    
                    ${!isBundle ? `
                    <!-- Grind Calibration -->
                    <div class="mb-4">
                        <span class="font-label-bold text-[10px] block uppercase mb-2 tracking-widest">Grind Calibration</span>
                        <div class="flex border-2 border-black">
                            <button class="grind-option ${item.grind === 'COARSE' ? 'bg-primary text-on-primary' : 'bg-white text-primary'} px-4 py-2 font-label-bold text-[12px] uppercase hover:bg-primary-container transition-colors">COARSE</button>
                            <button class="grind-option ${item.grind === 'FINE' ? 'bg-primary text-on-primary' : 'bg-white text-primary'} px-4 py-2 font-label-bold text-[12px] border-l-2 border-black uppercase hover:bg-stone-100 transition-colors">FINE</button>
                            <button class="grind-option ${item.grind === 'ESPRESSO' ? 'bg-primary text-on-primary' : 'bg-white text-primary'} px-4 py-2 font-label-bold text-[12px] border-l-2 border-black uppercase hover:bg-stone-100 transition-colors">ESPRESSO</button>
                        </div>
                    </div>
                    ` : `
                    <div class="mb-4">
                        <span class="font-label-bold text-[10px] block uppercase mb-2 tracking-widest">Bundle Grind: ${item.grind}</span>
                        <div class="flex border-2 border-black">
                            <button class="grind-option ${item.grind === 'COARSE' ? 'bg-primary text-on-primary' : 'bg-white text-primary'} px-4 py-2 font-label-bold text-[12px] uppercase hover:bg-primary-container transition-colors">COARSE</button>
                            <button class="grind-option ${item.grind === 'FINE' ? 'bg-primary text-on-primary' : 'bg-white text-primary'} px-4 py-2 font-label-bold text-[12px] border-l-2 border-black uppercase hover:bg-stone-100 transition-colors">FINE</button>
                            <button class="grind-option ${item.grind === 'ESPRESSO' ? 'bg-primary text-on-primary' : 'bg-white text-primary'} px-4 py-2 font-label-bold text-[12px] border-l-2 border-black uppercase hover:bg-stone-100 transition-colors">ESPRESSO</button>
                        </div>
                    </div>
                    `}
                </div>
                
                <div class="flex justify-between items-end pt-4 border-t-2 border-outline-variant">
                    <div class="flex items-center gap-1 quantity-control">
                        <button class="quantity-minus w-10 h-10 border-2 border-black flex items-center justify-center font-bold hover:bg-primary hover:text-on-primary transition-colors">-</button>
                        <div class="quantity-display w-14 h-10 border-y-2 border-black flex items-center justify-center font-label-bold">${String(item.quantity).padStart(2, '0')}</div>
                        <button class="quantity-plus w-10 h-10 border-2 border-black flex items-center justify-center font-bold hover:bg-primary hover:text-on-primary transition-colors">+</button>
                    </div>
                    <button class="remove-item font-label-bold text-[12px] uppercase underline text-on-surface-variant hover:text-primary transition-colors">Remove</button>
                </div>
            </div>
        </div>
    `;
}

function getDefaultImage(itemName) {
    const imageMap = {
        'BLACKOUT NITRO': './img/fatih-mehmet-yildiz-4KqHNQ3sJ6g-unsplash.jpg',
        'THE ARCHITECT': './img/nathan-dumlao-XOhI_kW_TaM-unsplash.jpg',
        'VOLTAGE V2': './img/ante-samarzija-lsmu0rUhUOk-unsplash.jpg',
        'THE MAKER BUNDLE': './img/nathan-dumlao-Y3AqmbmtLQI-unsplash.jpg'
    };
    return imageMap[itemName] || './img/nathan-dumlao-XOhI_kW_TaM-unsplash.jpg';
}

function attachCartEventListeners() {
    // Quantity controls
    const quantityControls = document.querySelectorAll('.quantity-control');
    
    quantityControls.forEach(control => {
        const minusBtn = control.querySelector('.quantity-minus');
        const plusBtn = control.querySelector('.quantity-plus');
        const display = control.querySelector('.quantity-display');
        
        minusBtn.addEventListener('click', () => {
            let currentValue = parseInt(display.textContent);
            if (currentValue > 1) {
                display.textContent = String(currentValue - 1).padStart(2, '0');
                updateCartTotals();
                saveCartToStorage();
            }
        });
        
        plusBtn.addEventListener('click', () => {
            let currentValue = parseInt(display.textContent);
            if (currentValue < 99) {
                display.textContent = String(currentValue + 1).padStart(2, '0');
                updateCartTotals();
                saveCartToStorage();
            }
        });
    });
    
    // Grind calibration selection
    const grindButtons = document.querySelectorAll('.grind-option');
    
    grindButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active state from siblings
            const siblings = button.parentElement.querySelectorAll('.grind-option');
            siblings.forEach(sibling => {
                sibling.classList.remove('bg-primary', 'text-on-primary');
                sibling.classList.add('bg-white', 'text-primary');
            });
            
            // Add active state to clicked button
            button.classList.remove('bg-white', 'text-primary');
            button.classList.add('bg-primary', 'text-on-primary');
            
            saveCartToStorage();
        });
    });
    
    // Remove item functionality
    const removeButtons = document.querySelectorAll('.remove-item');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cartItem = button.closest('.cart-item');
            cartItem.style.opacity = '0';
            cartItem.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                cartItem.remove();
                updateCartTotals();
                updateCartCount();
                saveCartToStorage();
            }, 300);
        });
    });
}

function saveCartToStorage() {
    const cartItems = document.querySelectorAll('.cart-item');
    const cart = [];
    
    cartItems.forEach(item => {
        const name = item.querySelector('.item-name').textContent;
        const price = parseFloat(item.dataset.price);
        const quantity = parseInt(item.querySelector('.quantity-display').textContent);
        const grindBtn = item.querySelector('.grind-option.bg-primary');
        const grind = grindBtn ? grindBtn.textContent : 'FINE';
        
        cart.push({ name, price, quantity, grind });
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
}
