// Text Interaction - Letters change color when beans pass behind them

let letterElements = [];
let camera, scene;

function initTextInteraction(sceneRef, cameraRef) {
    scene = sceneRef;
    camera = cameraRef;
    
    console.log('Initializing text interaction...');
    
    // Split text into individual letters
    const heroLines = document.querySelectorAll('.hero-line');
    
    if (heroLines.length === 0) {
        console.error('No .hero-line elements found!');
        return;
    }
    
    console.log(`Found ${heroLines.length} hero lines`);
    
    heroLines.forEach(line => {
        const text = line.getAttribute('data-text');
        console.log(`Processing line: "${text}"`);
        line.innerHTML = ''; // Clear existing text
        
        // Create span for each character
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.className = 'hero-letter';
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.transition = 'color 0.3s ease, text-shadow 0.3s ease';
            span.style.position = 'relative';
            
            // Store original styles
            span.dataset.originalColor = '#25160e'; // primary color
            
            line.appendChild(span);
            
            // Only track non-space characters
            if (char !== ' ') {
                letterElements.push(span);
            }
        }
    });
    
    console.log(`✓ Text interaction initialized with ${letterElements.length} letters`);
}

function updateTextInteraction(beans) {
    if (!camera || letterElements.length === 0) return;
    
    // Reset all letters to default
    letterElements.forEach(letter => {
        letter.style.color = letter.dataset.originalColor;
        letter.style.textShadow = 'none';
        letter.dataset.beanNearby = 'false';
    });
    
    // Check each bean's position relative to letters
    beans.forEach(bean => {
        if (!bean.visible) return;
        
        // Get bean's screen position
        const beanPos = bean.position.clone();
        beanPos.project(camera);
        
        // Convert to screen coordinates
        const beanScreenX = (beanPos.x * 0.5 + 0.5) * window.innerWidth;
        const beanScreenY = (-(beanPos.y * 0.5) + 0.5) * window.innerHeight;
        const beanDepth = beanPos.z; // Z-depth (0 to 1, closer = smaller value)
        
        // Only consider beans that are in front of text (z < 0.5 means closer to camera)
        if (beanDepth > 0.6) return;
        
        // Check each letter
        letterElements.forEach(letter => {
            const rect = letter.getBoundingClientRect();
            const letterCenterX = rect.left + rect.width / 2;
            const letterCenterY = rect.top + rect.height / 2;
            
            // Calculate distance from bean to letter center
            const dx = beanScreenX - letterCenterX;
            const dy = beanScreenY - letterCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Influence radius based on letter size and bean depth
            const baseRadius = Math.max(rect.width, rect.height) * 1.5;
            const depthMultiplier = 1 - (beanDepth * 0.5); // Closer beans have more influence
            const influenceRadius = baseRadius * depthMultiplier;
            
            if (distance < influenceRadius) {
                // Calculate influence strength (0 to 1)
                const strength = 1 - (distance / influenceRadius);
                
                // Change color based on strength
                // Interpolate between original color and coffee brown
                const originalColor = { r: 37, g: 22, b: 14 }; // #25160e
                const beanColor = { r: 139, g: 111, b: 71 }; // #8B6F47
                
                const r = Math.round(originalColor.r + (beanColor.r - originalColor.r) * strength);
                const g = Math.round(originalColor.g + (beanColor.g - originalColor.g) * strength);
                const b = Math.round(originalColor.b + (beanColor.b - originalColor.b) * strength);
                
                letter.style.color = `rgb(${r}, ${g}, ${b})`;
                
                // Add subtle glow effect
                const glowIntensity = strength * 8;
                letter.style.textShadow = `
                    0 0 ${glowIntensity}px rgba(139, 111, 71, ${strength * 0.6}),
                    0 0 ${glowIntensity * 2}px rgba(139, 111, 71, ${strength * 0.3})
                `;
                
                letter.dataset.beanNearby = 'true';
            }
        });
    });
}

// Alternative: More dramatic color shift
function updateTextInteractionDramatic(beans) {
    if (!camera || letterElements.length === 0) return;
    
    // Reset all letters to default
    letterElements.forEach(letter => {
        letter.style.color = letter.dataset.originalColor;
        letter.style.textShadow = 'none';
        letter.style.transform = 'scale(1)';
    });
    
    let beansDetected = 0;
    
    // Check each bean's position relative to letters
    beans.forEach(bean => {
        if (!bean.visible) return;
        
        // Get bean's screen position
        const beanPos = bean.position.clone();
        beanPos.project(camera);
        
        // Convert to screen coordinates
        const beanScreenX = (beanPos.x * 0.5 + 0.5) * window.innerWidth;
        const beanScreenY = (-(beanPos.y * 0.5) + 0.5) * window.innerHeight;
        const beanDepth = beanPos.z;
        
        // Consider ALL beans (removed depth filter to see if it works)
        // if (beanDepth > 0.6) return;
        
        beansDetected++;
        
        // Check each letter
        letterElements.forEach(letter => {
            const rect = letter.getBoundingClientRect();
            const letterCenterX = rect.left + rect.width / 2;
            const letterCenterY = rect.top + rect.height / 2;
            
            const dx = beanScreenX - letterCenterX;
            const dy = beanScreenY - letterCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Much larger influence radius for testing
            const baseRadius = Math.max(rect.width, rect.height) * 3.0; // Increased from 1.8 to 3.0
            const depthMultiplier = 1.5; // Fixed multiplier for testing
            const influenceRadius = baseRadius * depthMultiplier;
            
            if (distance < influenceRadius) {
                const strength = Math.pow(1 - (distance / influenceRadius), 1.2); // Adjusted curve
                
                // More dramatic color shift - to warm orange/brown
                const originalColor = { r: 37, g: 22, b: 14 };
                const highlightColor = { r: 255, g: 202, b: 152 }; // #FFCA98 - secondary-container
                
                const r = Math.round(originalColor.r + (highlightColor.r - originalColor.r) * strength);
                const g = Math.round(originalColor.g + (highlightColor.g - originalColor.g) * strength);
                const b = Math.round(originalColor.b + (highlightColor.b - originalColor.b) * strength);
                
                letter.style.color = `rgb(${r}, ${g}, ${b})`;
                
                // Stronger glow
                const glowIntensity = strength * 20; // Increased from 15
                letter.style.textShadow = `
                    0 0 ${glowIntensity}px rgba(139, 111, 71, ${strength * 0.9}),
                    0 0 ${glowIntensity * 2}px rgba(139, 111, 71, ${strength * 0.6}),
                    0 0 ${glowIntensity * 3}px rgba(255, 202, 152, ${strength * 0.4})
                `;
                
                // Subtle scale effect
                const scale = 1 + (strength * 0.08); // Increased from 0.05
                letter.style.transform = `scale(${scale})`;
            }
        });
    });
    
    // Debug: log every 60 frames (once per second at 60fps)
    if (Math.random() < 0.016) {
        console.log(`Text interaction: ${beansDetected} beans checked, ${letterElements.length} letters`);
    }
}
