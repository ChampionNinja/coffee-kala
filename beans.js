// Coffee Bean 3D Model Loading and Management

let loadedBeanGeometry = null;
let loadedBeanMaterial = null;

// Load the real coffee bean model
function loadBeanModel(callback) {
    console.log('Loading coffee bean model...');
    
    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('./Coffee bean/');
    
    mtlLoader.load('218_Coffee Bean.mtl', (materials) => {
        console.log('✓ MTL materials loaded');
        materials.preload();
        
        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('./Coffee bean/');
        
        objLoader.load('218_Coffee Bean.obj', (object) => {
            console.log('✓ OBJ model loaded');
            
            // Extract geometry and material from loaded model
            object.traverse((child) => {
                if (child.isMesh) {
                    loadedBeanGeometry = child.geometry;
                    
                    // Create enhanced material for cinematic look
                    const texture = child.material.map;
                    
                    loadedBeanMaterial = new THREE.MeshStandardMaterial({
                        map: texture,
                        roughness: 0.75,
                        metalness: 0.05,
                        color: 0x8B6F47, // Warm roasted coffee tone
                        emissive: 0x1a0f08,
                        emissiveIntensity: 0.1
                    });
                    
                    console.log('✓ Bean geometry and material extracted');
                }
            });
            
            console.log('✓ Coffee bean model loaded successfully');
            if (callback) callback();
        }, 
        (xhr) => {
            console.log(`Loading OBJ: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
        },
        (error) => {
            console.error('❌ Error loading coffee bean OBJ:', error);
        });
    }, 
    (xhr) => {
        console.log(`Loading MTL: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
    },
    (error) => {
        console.error('❌ Error loading coffee bean MTL:', error);
    });
}

// Create bean instance with the loaded model
function createBeanInstance() {
    if (!loadedBeanGeometry || !loadedBeanMaterial) {
        console.error('Bean model not loaded yet');
        return null;
    }
    
    const mesh = new THREE.Mesh(
        loadedBeanGeometry.clone(),
        loadedBeanMaterial.clone()
    );
    
    return mesh;
}

// Initialize multiple beans in the scene
function initBeans(scene) {
    const beans = [];
    const beanCount = 25; // Increased from 6 to 25
    
    // Wait for model to load, then create beans
    loadBeanModel(() => {
        for (let i = 0; i < beanCount; i++) {
            const bean = createBeanInstance();
            if (!bean) continue;
            
            // Create depth layers for cinematic composition
            const depth = Math.random();
            const layerZ = depth * 18 - 6; // -6 to 12 (wider depth range)
            
            // Radial distribution to avoid center clustering
            // Create "safe zone" in center for typography
            const angle = Math.random() * Math.PI * 2;
            const minRadius = 6; // Minimum distance from center
            const maxRadius = 18; // Maximum distance from center
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            
            // Some beans closer to edges, some in mid-range
            const radiusVariation = Math.pow(Math.random(), 0.7); // Bias toward outer areas
            const finalRadius = minRadius + radiusVariation * (maxRadius - minRadius);
            
            bean.position.set(
                Math.cos(angle) * finalRadius,
                (Math.random() - 0.5) * 16, // -8 to 8 (wider vertical spread)
                layerZ
            );
            
            // Random rotation for natural look
            bean.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            // Vary scale with more range - some small, some medium
            const depthScale = 0.5 + depth * 0.5; // 0.5 to 1.0
            const randomScale = 0.03 + Math.random() * 0.10; // 0.03 to 0.13 (smaller)
            const finalScale = randomScale * depthScale;
            bean.scale.setScalar(finalScale);
            
            // Keep beans fully opaque
            if (bean.material) {
                bean.material.transparent = false;
                bean.material.opacity = 1.0;
                bean.material.depthWrite = true;
            }
            
            // Store animation data
            bean.userData = {
                originalPosition: bean.position.clone(),
                velocity: new THREE.Vector3(0, 0, 0),
                rotationSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.025, // Increased from 0.008 to 0.025
                    (Math.random() - 0.5) * 0.035, // Increased from 0.012 to 0.035
                    (Math.random() - 0.5) * 0.020  // Increased from 0.006 to 0.020
                ),
                floatOffset: Math.random() * Math.PI * 2,
                floatSpeed: 0.0008 + Math.random() * 0.0015, // Increased from 0.0003-0.0011 to 0.0008-0.0023
                floatAmplitude: 0.8 + Math.random() * 1.2,    // Increased from 0.2-0.6 to 0.8-2.0
                depth: depth
            };
            
            scene.add(bean);
            beans.push(bean);
        }
        
        console.log(`${beans.length} coffee beans initialized`);
    });
    
    return beans;
}

// Animate beans - enhanced floating motion
function animateBeans(beans) {
    const time = Date.now();
    
    beans.forEach((bean) => {
        if (!bean.userData) return;
        
        // Enhanced rotation - more visible spinning
        bean.rotation.x += bean.userData.rotationSpeed.x;
        bean.rotation.y += bean.userData.rotationSpeed.y;
        bean.rotation.z += bean.userData.rotationSpeed.z;
        
        // Enhanced floating motion with individual amplitude
        const floatY = Math.sin(time * bean.userData.floatSpeed + bean.userData.floatOffset) * bean.userData.floatAmplitude;
        const floatX = Math.cos(time * bean.userData.floatSpeed * 0.7 + bean.userData.floatOffset) * bean.userData.floatAmplitude * 0.8; // Increased from 0.6 to 0.8
        const floatZ = Math.sin(time * bean.userData.floatSpeed * 0.5 + bean.userData.floatOffset) * bean.userData.floatAmplitude * 0.5; // Increased from 0.3 to 0.5
        
        // Apply velocity (from interaction) with less damping for more movement
        bean.userData.velocity.multiplyScalar(0.92); // Reduced from 0.94 to 0.92 for more sustained movement
        
        // Combine floating and interaction
        bean.position.x = bean.userData.originalPosition.x + floatX + bean.userData.velocity.x;
        bean.position.y = bean.userData.originalPosition.y + floatY + bean.userData.velocity.y;
        bean.position.z = bean.userData.originalPosition.z + floatZ + bean.userData.velocity.z;
    });
}
