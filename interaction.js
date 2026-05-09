// Disturbance Field Interaction System

let mouse = new THREE.Vector2();
let smoothMouse = new THREE.Vector2();
let prevMouse = new THREE.Vector2();
let mouseVelocity = new THREE.Vector2();

// Parallax layers
let layerBg, layerFg;

function initInteraction() {
    layerBg = document.getElementById('layer-bg');
    layerFg = document.getElementById('layer-fg');
    window.addEventListener('mousemove', onMouseMove);
}

function onMouseMove(event) {
    // Normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Calculate velocity
    mouseVelocity.x = mouse.x - prevMouse.x;
    mouseVelocity.y = mouse.y - prevMouse.y;
    
    prevMouse.copy(mouse);
}

function updateInteraction(beans) {
    // Smooth mouse movement with inertia
    smoothMouse.x += (mouse.x - smoothMouse.x) * 0.12; // Increased from 0.08 for more responsive parallax
    smoothMouse.y += (mouse.y - smoothMouse.y) * 0.12;
    
    // Update 2D parallax layers with more movement
    if (layerBg) {
        layerBg.style.transform = `translate(${smoothMouse.x * -50}px, ${smoothMouse.y * 50}px)`; // Increased from -30/30
    }
    if (layerFg) {
        layerFg.style.transform = `translate(${smoothMouse.x * 90}px, ${smoothMouse.y * -90}px)`; // Increased from 60/-60
    }
    
    // Disturbance field for 3D beans
    beans.forEach((bean) => {
        if (!bean.userData) return;
        
        // Calculate distance from cursor to bean in screen space
        const beanScreenPos = new THREE.Vector3();
        beanScreenPos.copy(bean.position);
        
        // Convert to normalized screen coordinates
        const beanX = beanScreenPos.x / 20; // Normalize by scene width
        const beanY = beanScreenPos.y / 12; // Normalize by scene height
        
        const dx = smoothMouse.x - beanX;
        const dy = smoothMouse.y - beanY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Disturbance parameters
        const disturbanceRadius = 1.5; // Increased from 1.0 - larger influence radius
        const repulsionStrength = 0.25; // Increased from 0.12 - stronger push
        
        if (distance < disturbanceRadius) {
            // Calculate repulsion force (inverse square falloff for natural feel)
            const force = Math.pow(1 - distance / disturbanceRadius, 2.5);
            
            // Direction away from cursor
            const angle = Math.atan2(dy, dx);
            const pushX = -Math.cos(angle) * force * repulsionStrength;
            const pushY = -Math.sin(angle) * force * repulsionStrength;
            
            // Apply force to velocity
            bean.userData.velocity.x += pushX;
            bean.userData.velocity.y += pushY;
            
            // Add rotation disturbance based on depth
            const rotationInfluence = force * 0.035 * (1 + bean.userData.depth); // Increased from 0.015
            bean.userData.rotationSpeed.x += (Math.random() - 0.5) * rotationInfluence;
            bean.userData.rotationSpeed.y += (Math.random() - 0.5) * rotationInfluence;
            bean.userData.rotationSpeed.z += (Math.random() - 0.5) * rotationInfluence * 0.5;
        }
        
        // Gentle return to original position (spring-like behavior)
        const returnStrength = 0.012; // Reduced from 0.015 for slower return
        const returnDamping = 0.03; // Reduced from 0.05 for more sustained movement
        
        bean.userData.velocity.x += (bean.userData.originalPosition.x - bean.position.x) * returnStrength;
        bean.userData.velocity.y += (bean.userData.originalPosition.y - bean.position.y) * returnStrength;
        bean.userData.velocity.z += (bean.userData.originalPosition.z - bean.position.z) * returnStrength;
        
        // Apply additional damping to velocity
        bean.userData.velocity.multiplyScalar(1 - returnDamping);
        
        // Dampen rotation speed less aggressively for more visible spinning
        bean.userData.rotationSpeed.x *= 0.98; // Increased from 0.96
        bean.userData.rotationSpeed.y *= 0.98; // Increased from 0.96
        bean.userData.rotationSpeed.z *= 0.98; // Increased from 0.96
    });
    
    // Decay velocity
    mouseVelocity.multiplyScalar(0.9);
}
