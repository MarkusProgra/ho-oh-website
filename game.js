/**
 * Ho Oh Galaxy - Interactive 3D Space Experience
 */

// ============================================
// Configuration
// ============================================
const CONFIG = {
    playerSpeed: 1.5,           // 3x faster base speed
    playerMaxSpeed: 8.0,        // 4x faster max speed
    playerAcceleration: 0.08,   // Faster acceleration
    playerFriction: 0.92,       // Slightly less friction for smoother movement
    mouseSensitivity: 0.002,
    galaxySize: 1500,
    fogDensity: 0.0005          // Less fog = better performance
};

// ============================================
// Zone Data
// ============================================
const ZONE_DATA = [
    {
        id: 'home',
        name: 'Ho-Oh Labs HQ',
        title: 'Welcome to Ho-Oh Labs',
        description: 'Building apps that transform lives and help society.',
        position: { x: 0, y: 0, z: 0 },
        radius: 40,
        color: 0xf89f44,
        url: 'indexWeb.html',
        icon: '🏠'
    },
    {
        id: 'about',
        name: 'Mission Control',
        title: 'Innovation with Purpose',
        description: 'Technology can be a force for good.',
        position: { x: -200, y: 40, z: -150 },
        radius: 50,
        color: 0xf15033,
        url: 'indexWeb.html#about',
        icon: '✨'
    },
    {
        id: 'pipoll',
        name: 'Pipoll',
        title: 'The Human Stock Market',
        description: 'Track habits, build streaks, watch your value rise.',
        position: { x: 300, y: -60, z: -250 },
        radius: 60,
        color: 0x8c64e1,
        url: 'https://pipoll.live',
        icon: '📈'
    },
    {
        id: 'altaria',
        name: 'Altaria Temple',
        title: 'AI Spiritual Companion',
        description: 'Fitness tracker for your soul.',
        position: { x: -350, y: 100, z: 300 },
        radius: 55,
        color: 0x0ac4d8,
        url: 'https://www.altaria.app/',
        icon: '🕊️'
    },
    {
        id: 'founders',
        name: 'Founders Deck',
        title: 'The Minds Behind Ho-Oh Labs',
        description: 'Oliver - The Architect. Markus - The Builder.',
        position: { x: 250, y: -80, z: 350 },
        radius: 50,
        color: 0xff9dd7,
        url: 'indexWeb.html#founders',
        icon: '👥'
    },
    {
        id: 'contact',
        name: 'Comm Relay',
        title: 'Get in Touch',
        description: 'Email: contact@ho-oh-lab.com',
        position: { x: 400, y: 0, z: 0 },
        radius: 45,
        color: 0x44ff88,
        url: 'mailto:contact@ho-oh-lab.com',
        icon: '📬'
    },
    {
        id: 'galaxy',
        name: 'Galaxy Portal',
        title: 'Welcome to the Galaxy',
        description: 'Explore all stations and collect stars!',
        position: { x: 0, y: 200, z: -400 },
        radius: 50,
        color: 0x00ffff,
        url: null,
        icon: '🌌'
    },
    {
        id: 'projects',
        name: 'Projects Hub',
        title: 'Our Amazing Projects',
        description: 'From faith to finance, tools that transform lives.',
        position: { x: -500, y: 0, z: 0 },
        radius: 50,
        color: 0xff6600,
        url: 'indexWeb.html#projects',
        icon: '🚀'
    }
];

// ============================================
// Game State
// ============================================
let scene, camera, renderer;
let player = null;
let keys = {};
let mouseLocked = false;
let joystick = { x: 0, y: 0, active: false };
let viewJoystick = { x: 0, y: 0, active: false };
let verticalMove = 0; // For up/down buttons
let worldObjects = [];
let zoneMarkers = [];
let asteroids = [];
let collectibleStars = [];
let activeZone = null;
let popupUrl = null;
let score = 0;
let collectedCount = 0;
let minimapCanvas, minimapCtx;
let gameRunning = false;
let startClicked = false;

// ============================================
// Initialize on DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', onStartClicked);
    }

    // Zone indicator click/tap to open web
    const zoneIndicator = document.getElementById('zone-indicator');
    if (zoneIndicator) {
        zoneIndicator.addEventListener('click', () => {
            if (popupUrl) {
                window.open(popupUrl, '_blank');
            } else {
                // Deep space - go to main web
                window.open('indexWeb.html', '_blank');
            }
        });
    }
});

function onStartClicked() {
    if (startClicked) return;
    startClicked = true;

    const startScreen = document.getElementById('start-screen');
    const hud = document.getElementById('hud');

    if (startScreen) startScreen.classList.add('hidden');
    if (hud) hud.classList.add('active');

    initGame();
}

// ============================================
// Game Initialization
// ============================================
function initGame() {
    if (gameRunning) return;
    gameRunning = true;

    // Initialize player
    player = {
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(),
        rotation: { x: 0, y: 0 }
    };

    // Setup Three.js
    const container = document.getElementById('canvas-container');
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);
    scene.fog = new THREE.FogExp2(0x000005, CONFIG.fogDensity);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    camera.position.copy(player.position);

    renderer = new THREE.WebGLRenderer({
        antialias: false, // Disabled for performance - galaxy particles provide enough visual quality
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5 for performance
    container.appendChild(renderer.domElement);

    // Create world
    createStarfield();
    createGalaxy();
    createZones();
    createAsteroids();
    createCollectibleStars(50);

    // Setup controls
    setupControls();
    setupMobileControls();

    // Setup minimap
    initMinimap();

    // Handle resize
    window.addEventListener('resize', onWindowResize);

    // Start game loop
    animate();

    // Show welcome notification
    showNotification('Welcome!', 'Explore the galaxy and collect 50 stars!');
}

// ============================================
// World Creation
// ============================================
function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const count = 2000; // Reduced from 5000 for performance
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
        const r = 1000 + Math.random() * 1000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i] = r * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = r * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ size: 2, color: 0xffffff, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(geometry, material));
}

function createGalaxy() {
    const geometry = new THREE.BufferGeometry();
    const count = 8000; // Reduced from 20000 for performance
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 100 + Math.random() * 1200;
        const armAngle = (Math.floor(Math.random() * 4) * Math.PI / 2) + (radius * 0.005);

        positions[i] = Math.cos(angle + armAngle) * radius;
        positions[i + 1] = (Math.random() - 0.5) * (50 + radius * 0.15);
        positions[i + 2] = Math.sin(angle + armAngle) * radius;

        const color = new THREE.Color().setHSL(0.08 + Math.random() * 0.08, 0.8, 0.6);
        colors[i] = color.r; colors[i + 1] = color.g; colors[i + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.5, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true
    });
    const galaxy = new THREE.Points(geometry, material);
    galaxy.rotation.x = Math.PI / 4;
    scene.add(galaxy);
    worldObjects.push(galaxy);
}

function createZones() {
    ZONE_DATA.forEach(zone => {
        const group = new THREE.Group();
        group.position.set(zone.position.x, zone.position.y, zone.position.z);

        // Core - use MeshBasicMaterial for performance
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(8, 16, 16), // Reduced segments for performance
            new THREE.MeshBasicMaterial({
                color: zone.color, transparent: true, opacity: 0.9
            })
        );
        group.add(core);

        // Rings - simplified geometry and material
        const rings = [];
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(15 + i * 8, 1 + i * 0.5, 8, 32), // Reduced segments
                new THREE.MeshBasicMaterial({
                    color: zone.color, transparent: true, opacity: 0.6 - i * 0.15
                })
            );
            ring.rotation.x = Math.PI / 2 + (i * 0.3);
            group.add(ring);
            rings.push(ring);
        }

        // Icon sprite (keep this - it's important for visuals)
        const sprite = createTextSprite(zone.icon);
        sprite.position.y = 25;
        group.add(sprite);

        scene.add(group);
        worldObjects.push(group);
        zoneMarkers.push({ mesh: group, data: zone, core, rings });
    });
}

function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.font = 'Bold 160px Futura, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(248, 159, 68, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText(text, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(12, 12, 1);
    return sprite;
}

function createAsteroids() {
    // Reduced from 40 to 15 for performance
    for (let i = 0; i < 15; i++) {
        const asteroid = new THREE.Mesh(
            new THREE.DodecahedronGeometry(2 + Math.random() * 4, 0),
            new THREE.MeshBasicMaterial({ color: 0x4a4a5a }) // BasicMaterial is faster than StandardMaterial
        );
        const angle = Math.random() * Math.PI * 2;
        const radius = 100 + Math.random() * 300;
        asteroid.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 100, Math.sin(angle) * radius);
        asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        asteroid.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            }
        };
        scene.add(asteroid);
        asteroids.push(asteroid);
    }
}

function createCollectibleStars(count) {
    const geometry = new THREE.OctahedronGeometry(3, 0);
    // Use MeshBasicMaterial for better performance (no lighting calculations)
    const material = new THREE.MeshBasicMaterial({
        color: 0xffd700, transparent: true, opacity: 0.9
    });

    for (let i = 0; i < count; i++) {
        const star = new THREE.Mesh(geometry, material.clone());
        const angle = Math.random() * Math.PI * 2;
        const radius = 200 + Math.random() * 1000;
        star.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 300, Math.sin(angle) * radius);
        star.userData = {
            rotationSpeed: { x: 0.02, y: 0.02, z: 0.02 },
            baseY: star.position.y,
            floatSpeed: 1 + Math.random(),
            collected: false,
            pulsePhase: Math.random() * Math.PI * 2
        };
        // Removed PointLight - too expensive for 50 stars
        scene.add(star);
        collectibleStars.push(star);
    }
}

// ============================================
// Controls
// ============================================
function setupControls() {
    document.addEventListener('keydown', (e) => { keys[e.code] = true; });
    document.addEventListener('keyup', (e) => { keys[e.code] = false; });

    document.addEventListener('mousemove', (e) => {
        if (mouseLocked && player) {
            player.rotation.y -= e.movementX * CONFIG.mouseSensitivity;
            player.rotation.x -= e.movementY * CONFIG.mouseSensitivity;
            player.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, player.rotation.x));
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('#hud, #info-popup, #notification, .mobile-btn, #joystick-zone')) return;
        if (gameRunning && !mouseLocked) {
            document.body.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        mouseLocked = document.pointerLockElement === document.body;
    });

    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Enter to activate popup or go to web from deep space
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
            if (popupUrl) {
                window.open(popupUrl, '_blank');
            } else if (!activeZone) {
                // Deep space - go to main web
                window.open('indexWeb.html', '_blank');
            }
        }
    });
}

function setupMobileControls() {
    // Movement Joystick (left side)
    const zone = document.getElementById('joystick-zone');
    const knob = document.getElementById('joystick-knob');
    if (zone && knob) {
        let center = { x: 0, y: 0 };

        zone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            joystick.active = true;
            const rect = zone.getBoundingClientRect();
            center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            updateJoystick(touch, center, knob, (x, y) => { joystick.x = x; joystick.y = y; });
        }, { passive: false });

        zone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (joystick.active) {
                for (let t of e.changedTouches) {
                    updateJoystick(t, center, knob, (x, y) => { joystick.x = x; joystick.y = y; });
                    break;
                }
            }
        }, { passive: false });

        const endTouch = (e) => {
            e.preventDefault();
            joystick.active = false;
            joystick.x = 0;
            joystick.y = 0;
            knob.style.transform = 'translate(-50%, -50%)';
        };

        zone.addEventListener('touchend', endTouch);
        zone.addEventListener('touchcancel', endTouch);
    }

    // View Joystick (right side - controls camera rotation)
    const viewZone = document.getElementById('view-joystick-zone');
    const viewKnob = document.getElementById('view-joystick-knob');
    if (viewZone && viewKnob) {
        let viewCenter = { x: 0, y: 0 };

        viewZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            viewJoystick.active = true;
            const rect = viewZone.getBoundingClientRect();
            viewCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            updateJoystick(touch, viewCenter, viewKnob, (x, y) => { viewJoystick.x = x; viewJoystick.y = y; });
        }, { passive: false });

        viewZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (viewJoystick.active) {
                for (let t of e.changedTouches) {
                    updateJoystick(t, viewCenter, viewKnob, (x, y) => { viewJoystick.x = x; viewJoystick.y = y; });
                    break;
                }
            }
        }, { passive: false });

        const endViewTouch = (e) => {
            e.preventDefault();
            viewJoystick.active = false;
            viewJoystick.x = 0;
            viewJoystick.y = 0;
            viewKnob.style.transform = 'translate(-50%, -50%)';
        };

        viewZone.addEventListener('touchend', endViewTouch);
        viewZone.addEventListener('touchcancel', endViewTouch);
    }

    // Helper function for joystick handling
    function updateJoystick(touch, center, knobElement, setValues) {
        const maxDist = 50;
        let dx = touch.clientX - center.x;
        let dy = touch.clientY - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }
        const normX = dx / maxDist;
        const normY = dy / maxDist;
        setValues(normX, normY);
        knobElement.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }

    // Vertical movement buttons (up/down)
    const upBtn = document.getElementById('mobile-up');
    const downBtn = document.getElementById('mobile-down');

    if (upBtn) {
        upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); verticalMove = 1; });
        upBtn.addEventListener('touchend', (e) => { e.preventDefault(); verticalMove = 0; });
    }
    if (downBtn) {
        downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); verticalMove = -1; });
        downBtn.addEventListener('touchend', (e) => { e.preventDefault(); verticalMove = 0; });
    }

    // Interact button
    const interact = document.getElementById('mobile-interact');
    if (interact) {
        interact.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (popupUrl) window.open(popupUrl, '_blank');
        });
    }
}

// ============================================
// Game Loop
// ============================================
function animate() {
    requestAnimationFrame(animate);

    if (!gameRunning || !player || !camera || !renderer || !scene) return;

    updatePlayer();
    updateView();
    updateCamera();
    updateZones();
    updateAsteroids();
    updateCollectibleStars();
    updateMinimap();
    updateUI();

    renderer.render(scene, camera);
}

function updatePlayer() {
    let moveX = 0, moveY = 0, moveZ = 0;

    if (keys['KeyW']) moveZ = -1;
    if (keys['KeyS']) moveZ = 1;
    if (keys['KeyA']) moveX = -1;
    if (keys['KeyD']) moveX = 1;
    if (keys['Space']) moveY = 1;
    if (keys['ShiftLeft'] || keys['ShiftRight']) moveY = -1;

    if (joystick.active) {
        moveX = joystick.x;
        moveZ = joystick.y;
    }

    // Vertical movement from buttons (mobile)
    if (verticalMove !== 0) {
        moveY = verticalMove;
    }

    if (moveX || moveY || moveZ) {
        const dir = new THREE.Vector3(moveX, moveY, moveZ).normalize();
        const cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);
        cameraDir.y = 0;
        cameraDir.normalize();

        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDir, new THREE.Vector3(0, 1, 0));

        const moveDir = new THREE.Vector3();
        moveDir.addScaledVector(cameraDir, -moveZ);
        moveDir.addScaledVector(cameraRight, moveX);
        moveDir.y = moveY;

        player.velocity.x += moveDir.x * CONFIG.playerSpeed * CONFIG.playerAcceleration;
        player.velocity.y += moveDir.y * CONFIG.playerSpeed * CONFIG.playerAcceleration;
        player.velocity.z += moveDir.z * CONFIG.playerSpeed * CONFIG.playerAcceleration;
    }

    player.velocity.multiplyScalar(CONFIG.playerFriction);

    const speed = player.velocity.length();
    if (speed > CONFIG.playerMaxSpeed) {
        player.velocity.multiplyScalar(CONFIG.playerMaxSpeed / speed);
    }

    player.position.add(player.velocity);

    const boundary = CONFIG.galaxySize * 0.8;
    player.position.x = Math.max(-boundary, Math.min(boundary, player.position.x));
    player.position.y = Math.max(-boundary, Math.min(boundary, player.position.y));
    player.position.z = Math.max(-boundary, Math.min(boundary, player.position.z));
}

// Update view from view joystick
function updateView() {
    if (viewJoystick.active && player) {
        // View joystick controls camera rotation
        const viewSpeed = 0.04;
        player.rotation.y -= viewJoystick.x * viewSpeed;
        player.rotation.x -= viewJoystick.y * viewSpeed;
        player.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, player.rotation.x));
    }
}

function updateCamera() {
    camera.position.copy(player.position);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(player.rotation.x, player.rotation.y, 0, 'YXZ'));
    camera.quaternion.copy(quaternion);
}

function updateZones() {
    const time = Date.now() * 0.001;

    zoneMarkers.forEach(zone => {
        zone.core.rotation.y = time * 0.5;
        zone.core.rotation.z = time * 0.3;
        zone.rings.forEach((ring, i) => {
            ring.rotation.x += 0.01 * (i + 1);
            ring.rotation.y += 0.005 * (i + 1);
        });

        const dist = player.position.distanceTo(zone.mesh.position);
        if (dist < zone.data.radius && activeZone !== zone.data) {
            activeZone = zone.data;
            updateZoneIndicator(zone.data);
            showInfoPopup(zone.data);
        }
    });

    // Optimized zone check - early exit
    let inZone = false;
    for (let z of ZONE_DATA) {
        const dx = player.position.x - z.position.x;
        const dy = player.position.y - z.position.y;
        const dz = player.position.z - z.position.z;
        if (dx*dx + dy*dy + dz*dz < z.radius * z.radius) {
            inZone = true;
            break;
        }
    }

    if (!inZone && activeZone) {
        activeZone = null;
        updateZoneIndicator(null);
        hideInfoPopup();
    }
}

function updateAsteroids() {
    asteroids.forEach(a => {
        a.rotation.x += a.userData.rotationSpeed.x;
        a.rotation.y += a.userData.rotationSpeed.y;
        a.rotation.z += a.userData.rotationSpeed.z;
    });
}

function updateCollectibleStars() {
    const time = Date.now() * 0.001;

    collectibleStars.forEach(star => {
        if (star.userData.collected) return;

        star.rotation.x += star.userData.rotationSpeed.x;
        star.rotation.y += star.userData.rotationSpeed.y;
        star.rotation.z += star.userData.rotationSpeed.z;
        star.position.y = star.userData.baseY + Math.sin(time * star.userData.floatSpeed + star.userData.pulsePhase) * 8;

        // Simple scale pulse instead of emissive (works with BasicMaterial)
        const pulse = (Math.sin(time * 3 + star.userData.pulsePhase) + 1) / 2;
        const scale = 1 + pulse * 0.3;
        star.scale.set(scale, scale, scale);

        if (player.position.distanceTo(star.position) < 10) {
            collectStar(star);
        }
    });
}

function collectStar(star) {
    star.userData.collected = true;
    collectedCount++;
    score += 100;

    let opacity = 0.9;
    const animate = () => {
        opacity -= 0.05;
        star.scale.multiplyScalar(1.2);
        star.material.opacity = opacity;
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            star.visible = false;
        }
    };
    animate();

    updateScoreDisplay();
    showNotification('Star Collected!', `+100 points | Total: ${score}`);
}

// ============================================
// UI Updates
// ============================================
function updateZoneIndicator(zone) {
    const nameEl = document.getElementById('zone-name');
    const hintEl = document.getElementById('zone-hint');
    if (nameEl) {
        if (zone) {
            // Near a planet - show "Approaching: X"
            nameEl.textContent = `Approaching: ${zone.name}`;
            nameEl.className = '';
            nameEl.style.background = 'none';
            nameEl.style.webkitBackgroundClip = 'unset';
            nameEl.style.webkitTextFillColor = `#${zone.color.toString(16).padStart(6, '0')}`;
            // Hide hint when near planet
            if (hintEl) hintEl.style.display = 'none';
        } else {
            // Deep space - show "Go to Web" in gradient
            nameEl.textContent = 'Go to Web';
            nameEl.className = 'go-to-web-indicator';
            // Show hint
            if (hintEl) hintEl.style.display = 'block';
        }
    }
}

function updateUI() {
    // Altitude
    const altEl = document.getElementById('altitude-value');
    if (altEl) altEl.textContent = Math.round(player.position.y);

    // Speed
    const speed = player.velocity.length();
    const speedFill = document.getElementById('speed-fill');
    if (speedFill) speedFill.style.width = `${(speed / CONFIG.playerMaxSpeed) * 100}%`;
}

function updateScoreDisplay() {
    const scoreEl = document.getElementById('score-value');
    const countEl = document.getElementById('star-count');
    if (scoreEl) scoreEl.textContent = score.toLocaleString();
    if (countEl) countEl.textContent = collectedCount;
}

function showInfoPopup(zone) {
    popupUrl = zone.url;
    const popup = document.getElementById('info-popup');
    const title = document.getElementById('popup-title');
    const content = document.getElementById('popup-content');
    if (popup && title && content) {
        title.textContent = zone.title;
        content.textContent = zone.description;
        popup.classList.add('active');
    }
}

function hideInfoPopup() {
    popupUrl = null;
    const popup = document.getElementById('info-popup');
    if (popup) popup.classList.remove('active');
}

function showNotification(title, content) {
    const notif = document.getElementById('notification');
    const titleEl = document.getElementById('notification-title');
    const contentEl = document.getElementById('notification-content');
    if (notif && titleEl && contentEl) {
        titleEl.textContent = title;
        contentEl.textContent = content;
        notif.classList.add('show');
        setTimeout(() => notif.classList.remove('show'), 3000);
    }
}

// ============================================
// Minimap
// ============================================
function initMinimap() {
    minimapCanvas = document.getElementById('minimap');
    if (!minimapCanvas) return;
    minimapCtx = minimapCanvas.getContext('2d');

    const container = document.getElementById('minimap-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    minimapCanvas.width = rect.width * dpr;
    minimapCanvas.height = rect.height * dpr;
    minimapCtx.scale(dpr, dpr);
}

function updateMinimap() {
    if (!minimapCtx || !player) return;

    const width = minimapCanvas.width / (window.devicePixelRatio || 1);
    const height = minimapCanvas.height / (window.devicePixelRatio || 1);
    const scale = width / (CONFIG.galaxySize * 2);
    const mapRange = CONFIG.galaxySize;

    minimapCtx.fillStyle = 'rgba(10, 10, 10, 0.95)';
    minimapCtx.fillRect(0, 0, width, height);

    ZONE_DATA.forEach(zone => {
        const x = (zone.position.x + mapRange) * scale;
        const y = (zone.position.z + mapRange) * scale;
        const r = zone.radius * scale;

        minimapCtx.beginPath();
        minimapCtx.arc(x, y, r, 0, Math.PI * 2);
        minimapCtx.fillStyle = `rgba(${hexToRgb(zone.color)}, 0.15)`;
        minimapCtx.fill();
        minimapCtx.strokeStyle = `rgba(${hexToRgb(zone.color)}, 0.6)`;
        minimapCtx.stroke();

        minimapCtx.beginPath();
        minimapCtx.arc(x, y, 4, 0, Math.PI * 2);
        minimapCtx.fillStyle = `rgb(${hexToRgb(zone.color)})`;
        minimapCtx.fill();
    });

    const playerX = (player.position.x + mapRange) * scale;
    const playerZ = (player.position.z + mapRange) * scale;

    minimapCtx.save();
    minimapCtx.translate(playerX, playerZ);
    minimapCtx.rotate(-player.rotation.y);
    minimapCtx.beginPath();
    minimapCtx.moveTo(0, -8);
    minimapCtx.lineTo(-5, 5);
    minimapCtx.lineTo(5, 5);
    minimapCtx.closePath();
    minimapCtx.fillStyle = '#f89f44';
    minimapCtx.fill();
    minimapCtx.restore();
}

function hexToRgb(hex) {
    return `${(hex >> 16) & 255}, ${(hex >> 8) & 255}, ${hex & 255}`;
}

// ============================================
// Window Resize
// ============================================
function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    initMinimap();
}

// Console info
console.log('%c HO OH GALAXY ', 'background: linear-gradient(135deg, #f89f44, #f15033); color: #0a0a0a; font-size: 20px; font-weight: bold; padding: 10px 20px;');
console.log('Controls: WASD move, Space/Shift up/down, Mouse look, Click to lock pointer');
