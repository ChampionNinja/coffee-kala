// Main Three.js Scene Setup
// Note: beans.js and interaction.js are loaded separately and expose global functions

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScene);
} else {
    initScene();
}

function initScene() {
    const container = document.getElementById('canvas-container');
    
    if (!container) {
        console.error('Canvas container not found!');
        return;
    }
    
    // Check if mobile device
    const isMobile = window.innerWidth < 769;
    
    if (isMobile) {
        console.log('Mobile device detected - skipping 3D bean rendering for performance');
        // Hide desktop 3D elements
        const desktop3D = document.querySelector('.desktop-hero-3d');
        if (desktop3D) {
            desktop3D.style.display = 'none';
        }
        return; // Exit early on mobile
    }
    
    console.log('Desktop device detected - initializing 3D bean experience');

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Cinematic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xE8DCC8, 0.5);
    scene.add(ambientLight);

    // Key light - warm espresso tone from top-right
    const keyLight = new THREE.DirectionalLight(0xffca98, 1.4);
    keyLight.position.set(10, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Fill light - soft cream from left
    const fillLight = new THREE.PointLight(0xD4C4B0, 0.7);
    fillLight.position.set(-10, 5, 5);
    scene.add(fillLight);

    // Rim light - highlight edges from behind
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(-6, -8, -10);
    scene.add(rimLight);

    // Accent light - warm glow from bottom
    const accentLight = new THREE.PointLight(0xd4a574, 0.4);
    accentLight.position.set(0, -10, 3);
    scene.add(accentLight);

    // Atmospheric fog for depth
    scene.fog = new THREE.Fog(0xE8DCC8, 18, 40);

    // Initialize beans and interaction
    let beans = [];
    let textInteractionReady = false;

    initInteraction();

    // Load beans after model is ready
    setTimeout(() => {
        beans = initBeans(scene);
        console.log('initBeans called, waiting for beans to load...');
        
        // Check periodically if beans are loaded
        let checkCount = 0;
        const checkBeansInterval = setInterval(() => {
            checkCount++;
            
            if (beans.length > 0) {
                console.log(`✓ ${beans.length} beans loaded and ready!`);
                
                // Initialize text interaction after beans are confirmed loaded
                if (typeof initTextInteraction === 'function') {
                    initTextInteraction(scene, camera);
                    textInteractionReady = true;
                    console.log('✓ Text interaction ready');
                }
                
                clearInterval(checkBeansInterval);
            } else if (checkCount % 10 === 0) {
                console.log(`Still waiting for beans... (${checkCount * 100}ms)`);
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkBeansInterval);
            if (beans.length === 0) {
                console.error('❌ Beans failed to load after 10 seconds. Check console for errors.');
                console.log('Scene children:', scene.children.length);
            }
        }, 10000);
    }, 100);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (beans.length > 0) {
            animateBeans(beans);
            updateInteraction(beans);
            
            // Update text interaction
            if (textInteractionReady && typeof updateTextInteractionDramatic === 'function') {
                updateTextInteractionDramatic(beans); // Use dramatic version for more visible effect
            }
        }
        
        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Start animation
    animate();

    // Expose for debugging
    window.coffeeScene = { scene, camera, renderer, beans };
}
