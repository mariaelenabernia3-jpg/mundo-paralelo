document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('platformerCanvas');
    const ctx = canvas.getContext('2d');

    const BASE_WIDTH = 800;
    const BASE_HEIGHT = 600;

    function resizeCanvas() {
        canvas.width = window.innerWidth;document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('platformerCanvas');
    const ctx = canvas.getContext('2d');

    const BASE_WIDTH = 800;
    const BASE_HEIGHT = 600;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- Asset Management ---
    const ASSET_SOURCES = {
        player: 'player_spritesheet.png', ground: 'suelo.png', decor1: '1.png', decor2: '2.png', 
        decor3: '3.png', decor4: '4.png', decor5: '5.png', decor6: '6.png', coin: 'Gold_21.png'
    };
    const assets = {};

    // --- Game State Management ---
    let gameState = 'SPLASH_SCREEN';
    let splashAlpha = 0;
    let splashPhase = 'FADING_IN';
    let splashHoldTimer = 0;
    const SPLASH_HOLD_DURATION = 120;

    // --- Constantes del Juego ---
    const GRAVITY = 0.5;
    const MOVE_SPEED = 5;
    const JUMP_FORCE = 15;
    const PLAYER_VISUAL_OFFSET_Y = 5; 
    const DECORATION_SIZE = 50;
    const COIN_SIZE = 35;

    // --- Constantes de Animación ---
    const FRAME_WIDTH = 33; const FRAME_HEIGHT = 42; const FRAME_SPEED = 4;        
    const IDLE_FRAME = 0; const JUMP_FRAME = 1; const WALK_CYCLE_START_FRAME = 2; const TOTAL_WALK_FRAMES = 4;

    // --- Game Objects ---
    let player, camera, platforms, decorations, coins, score, health;

    // --- Asset Loader Function ---
    function loadAssets(callback) {
        let loadedCount = 0; const totalAssets = Object.keys(ASSET_SOURCES).length;
        for (const key in ASSET_SOURCES) {
            const img = new Image();
            img.onload = () => {
                loadedCount++; assets[key] = img;
                if (loadedCount === totalAssets) { callback(); }
            };
            img.onerror = () => {
                console.error(`Error al cargar: ${ASSET_SOURCES[key]}`); loadedCount++;
                if (loadedCount === totalAssets) { callback(); }
            };
            img.src = ASSET_SOURCES[key];
        }
    }
    
    // --- Función para inicializar el juego ---
    function initializeGame() {
        score = 0; health = 100;
        player = {
            x: 100, y: 400, width: 45, height: 52, velocityX: 0, velocityY: 0,
            isJumping: false, currentFrame: IDLE_FRAME, frameTimer: 0, facingDirection: 'right'
        };
        camera = { x: 0, y: 0 };
        platforms = [
            { x: -1000, y: 590, width: 10000, height: 50 }, { x: 200, y: 450, width: 150, height: 20 },
            { x: 450, y: 350, width: 150, height: 20 }, { x: 700, y: 450, width: 200, height: 20 },
            { x: 1000, y: 400, width: 150, height: 20 }, { x: 1200, y: 300, width: 150, height: 20 },
            { x: 1400, y: 200, width: 50, height: 20 }, { x: 1600, y: 350, width: 250, height: 20 },
            { x: 1950, y: 280, width: 150, height: 20 }
        ];
        decorations = [
            { x: 495, y: 350 - DECORATION_SIZE, assetKey: 'decor1' }, { x: 600, y: 590 - DECORATION_SIZE, assetKey: 'decor2' },
            { x: 720, y: 450 - DECORATION_SIZE, assetKey: 'decor3' }, { x: 900, y: 590 - DECORATION_SIZE, assetKey: 'decor4' },
            { x: 1250, y: 300 - DECORATION_SIZE, assetKey: 'decor5' }, { x: 1620, y: 350 - DECORATION_SIZE, assetKey: 'decor6' },
        ];
        coins = [
            { x: 250, y: 400, isVisible: true, isBad: false }, 
            { x: 285, y: 400, isVisible: true, isBad: false }, // <-- ARREGLO: Faltaba una coma aquí
            { x: 500, y: 300, isVisible: true, isBad: false }, 
            { x: 535, y: 300, isVisible: true, isBad: false },
            { x: 800, y: 400, isVisible: true, isBad: true }, 
            { x: 1050, y: 350, isVisible: true, isBad: false }, 
            { x: 1250, y: 250, isVisible: true, isBad: false }, 
            { x: 1405, y: 150, isVisible: true, isBad: false }, 
            { x: 1700, y: 300, isVisible: true, isBad: false }, 
            { x: 1735, y: 300, isVisible: true, isBad: false },
        ];
        
        gameLoop();
    }

    // --- Sistema de Input (sin cambios) ---
    const keys = { ArrowLeft: false, ArrowRight: false, Space: false };
    window.addEventListener('keydown', (e) => { if (e.code in keys) keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); });
    window.addEventListener('keyup', (e) => { if (e.code in keys) keys[e.code] = false; });
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');
    const handleButtonPress = (key, isPressed) => { keys[key] = isPressed; };
    btnLeft.addEventListener('mousedown', () => handleButtonPress('ArrowLeft', true));
    btnLeft.addEventListener('mouseup', () => handleButtonPress('ArrowLeft', false));
    btnLeft.addEventListener('mouseleave', () => handleButtonPress('ArrowLeft', false));
    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); handleButtonPress('ArrowLeft', true); });
    btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); handleButtonPress('ArrowLeft', false); });
    btnRight.addEventListener('mousedown', () => handleButtonPress('ArrowRight', true));
    btnRight.addEventListener('mouseup', () => handleButtonPress('ArrowRight', false));
    btnRight.addEventListener('mouseleave', () => handleButtonPress('ArrowRight', false));
    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); handleButtonPress('ArrowRight', true); });
    btnRight.addEventListener('touchend', (e) => { e.preventDefault(); handleButtonPress('ArrowRight', false); });
    btnJump.addEventListener('mousedown', () => handleButtonPress('Space', true));
    btnJump.addEventListener('mouseup', () => handleButtonPress('Space', false));
    btnJump.addEventListener('mouseleave', () => handleButtonPress('Space', false));
    btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); handleButtonPress('Space', true); });
    btnJump.addEventListener('touchend', (e) => { e.preventDefault(); handleButtonPress('Space', false); });


    // --- Lógica de Actualización (Update) ---
    function updateSplashScreen() {
        const FADE_SPEED = 0.02;
        if (splashPhase === 'FADING_IN') {
            splashAlpha += FADE_SPEED;
            if (splashAlpha >= 1) { splashAlpha = 1; splashPhase = 'HOLDING'; }
        } else if (splashPhase === 'HOLDING') {
            splashHoldTimer++;
            if (splashHoldTimer >= SPLASH_HOLD_DURATION) { splashPhase = 'FADING_OUT'; }
        } else if (splashPhase === 'FADING_OUT') {
            splashAlpha -= FADE_SPEED;
            if (splashAlpha <= 0) { splashAlpha = 0; gameState = 'PLAYING'; }
        }
    }

    function updatePlaying() {
        let isMoving = false; let moveX = 0;
        if (keys.ArrowLeft) { moveX = -MOVE_SPEED; player.facingDirection = 'left'; isMoving = true; }
        if (keys.ArrowRight) { moveX = MOVE_SPEED; player.facingDirection = 'right'; isMoving = true; }
        player.x += moveX;
        for (const platform of platforms) {
            if (player.x < platform.x + platform.width && player.x + player.width > platform.x && player.y < platform.y + platform.height && player.y + player.height > platform.y) {
                if (moveX > 0) { player.x = platform.x - player.width; } else if (moveX < 0) { player.x = platform.x + platform.width; }
            }
        }
        if (keys.Space && !player.isJumping) { player.velocityY = -JUMP_FORCE; player.isJumping = true; }
        player.velocityY += GRAVITY; player.y += player.velocityY;
        let onPlatform = false;
        for (const platform of platforms) {
            if (player.x < platform.x + platform.width && player.x + player.width > platform.x) {
                if (player.velocityY >= 0 && player.y + player.height > platform.y && (player.y - player.velocityY) + player.height <= platform.y) {
                     player.y = platform.y - player.height; player.velocityY = 0; onPlatform = true;
                }
                else if (player.velocityY < 0 && player.y < platform.y + platform.height && (player.y - player.velocityY) >= platform.y + platform.height) {
                    player.y = platform.y + platform.height; player.velocityY = 0;
                }
            }
        }
        player.isJumping = !onPlatform;
        for (const coin of coins) {
            if (coin.isVisible && player.x < coin.x + COIN_SIZE && player.x + player.width > coin.x && player.y < coin.y + COIN_SIZE && player.y + player.height > coin.y) {
                coin.isVisible = false;
                if (coin.isBad) { health -= 25; } else { score += 10; }
            }
        }
        player.frameTimer++;
        if (player.frameTimer > FRAME_SPEED) {
            player.frameTimer = 0;
            if (player.isJumping) { player.currentFrame = JUMP_FRAME; } 
            else if (isMoving) {
                let currentWalkFrame = player.currentFrame - WALK_CYCLE_START_FRAME;
                if (currentWalkFrame < 0 || currentWalkFrame >= TOTAL_WALK_FRAMES) { currentWalkFrame = 0; }
                else { currentWalkFrame = (currentWalkFrame + 1) % TOTAL_WALK_FRAMES; }
                player.currentFrame = WALK_CYCLE_START_FRAME + currentWalkFrame;
            } else { player.currentFrame = IDLE_FRAME; }
        }
        camera.x = player.x - BASE_WIDTH / 3;
        if (camera.x < 0) { camera.x = 0; }
    }

    // --- Renderizado del Juego ---
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        const scale = canvas.height / BASE_HEIGHT;
        const offsetX = (canvas.width - BASE_WIDTH * scale) / 2;
        ctx.translate(offsetX, 0); ctx.scale(scale, scale);
        ctx.translate(-camera.x, -camera.y);
        const groundPattern = ctx.createPattern(assets.ground, 'repeat');
        ctx.fillStyle = groundPattern;
        for (const platform of platforms) {
            ctx.save(); ctx.translate(platform.x, platform.y); ctx.fillRect(0, 0, platform.width, platform.height); ctx.restore();
        }
        for (const decor of decorations) {
            const img = assets[decor.assetKey];
            if (img) { ctx.drawImage(img, decor.x, decor.y, DECORATION_SIZE, DECORATION_SIZE); }
        }
        for (const coin of coins) {
            if (coin.isVisible && assets.coin) {
                if (coin.isBad) { ctx.filter = 'hue-rotate(330deg) saturate(2)'; }
                ctx.drawImage(assets.coin, coin.x, coin.y, COIN_SIZE, COIN_SIZE);
                ctx.filter = 'none';
            }
        }
        ctx.save();
        const drawY = player.y + PLAYER_VISUAL_OFFSET_Y;
        const sx = player.currentFrame * FRAME_WIDTH; const sy = 0;
        if (player.facingDirection === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(assets.player, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, -player.x - player.width, drawY, player.width, player.height);
        } else {
            ctx.drawImage(assets.player, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, player.x, drawY, player.width, player.height);
        }
        ctx.restore();
        ctx.restore();

        if (gameState === 'SPLASH_SCREEN') {
            ctx.fillStyle = `rgba(0, 0, 0, ${splashAlpha * 0.7})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.save();
            ctx.globalAlpha = splashAlpha;
            ctx.textAlign = 'center';

            ctx.font = '90px monospace';
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.fillText('Acto 1', canvas.width / 2, canvas.height / 2);

            ctx.font = '45px monospace';
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = 'transparent';
            ctx.fillText('Plataformas', canvas.width / 2, canvas.height / 2 + 60);
            
            ctx.restore();
        } 
        else if (gameState === 'PLAYING') {
            ctx.fillStyle = 'white'; ctx.font = '40px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`Puntos: ${score}`, 20, 50);
            ctx.fillText(`Vida: ${health}`, 20, 90);
        }
    }

    // --- Bucle Principal del Juego ---
    function gameLoop() {
        if (gameState === 'SPLASH_SCREEN') {
            updateSplashScreen();
        } else {
            updatePlaying();
        }
        draw();
        requestAnimationFrame(gameLoop);
    }
    
    loadAssets(initializeGame);
});
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- Asset Management ---
    const ASSET_SOURCES = {
        player: 'player_spritesheet.png', ground: 'suelo.png', decor1: '1.png', decor2: '2.png', 
        decor3: '3.png', decor4: '4.png', decor5: '5.png', decor6: '6.png', coin: 'Gold_21.png'
    };
    const assets = {};

    // --- Game State Management ---
    let gameState = 'SPLASH_SCREEN';
    let splashAlpha = 0;
    let splashPhase = 'FADING_IN';
    let splashHoldTimer = 0;
    const SPLASH_HOLD_DURATION = 120;

    // --- Constantes del Juego ---
    const GRAVITY = 0.5;
    const MOVE_SPEED = 5;
    const JUMP_FORCE = 15;
    const PLAYER_VISUAL_OFFSET_Y = 5; 
    const DECORATION_SIZE = 50;
    const COIN_SIZE = 35;

    // --- Constantes de Animación ---
    const FRAME_WIDTH = 33; const FRAME_HEIGHT = 42; const FRAME_SPEED = 4;        
    const IDLE_FRAME = 0; const JUMP_FRAME = 1; const WALK_CYCLE_START_FRAME = 2; const TOTAL_WALK_FRAMES = 4;

    // --- Game Objects ---
    let player, camera, platforms, decorations, coins, score, health;

    // --- Asset Loader Function ---
    function loadAssets(callback) {
        let loadedCount = 0; const totalAssets = Object.keys(ASSET_SOURCES).length;
        for (const key in ASSET_SOURCES) {
            const img = new Image();
            img.onload = () => {
                loadedCount++; assets[key] = img;
                if (loadedCount === totalAssets) { callback(); }
            };
            img.onerror = () => {
                console.error(`Error al cargar: ${ASSET_SOURCES[key]}`); loadedCount++;
                if (loadedCount === totalAssets) { callback(); }
            };
            img.src = ASSET_SOURCES[key];
        }
    }
    
    // --- Función para inicializar el juego ---
    function initializeGame() {
        score = 0; health = 100;
        player = {
            x: 100, y: 400, width: 45, height: 52, velocityX: 0, velocityY: 0,
            isJumping: false, currentFrame: IDLE_FRAME, frameTimer: 0, facingDirection: 'right'
        };
        camera = { x: 0, y: 0 };
        platforms = [
            { x: -1000, y: 590, width: 10000, height: 50 }, { x: 200, y: 450, width: 150, height: 20 },
            { x: 450, y: 350, width: 150, height: 20 }, { x: 700, y: 450, width: 200, height: 20 },
            { x: 1000, y: 400, width: 150, height: 20 }, { x: 1200, y: 300, width: 150, height: 20 },
            { x: 1400, y: 200, width: 50, height: 20 }, { x: 1600, y: 350, width: 250, height: 20 },
            { x: 1950, y: 280, width: 150, height: 20 }
        ];
        decorations = [
            { x: 495, y: 350 - DECORATION_SIZE, assetKey: 'decor1' }, { x: 600, y: 590 - DECORATION_SIZE, assetKey: 'decor2' },
            { x: 720, y: 450 - DECORATION_SIZE, assetKey: 'decor3' }, { x: 900, y: 590 - DECORATION_SIZE, assetKey: 'decor4' },
            { x: 1250, y: 300 - DECORATION_SIZE, assetKey: 'decor5' }, { x: 1620, y: 350 - DECORATION_SIZE, assetKey: 'decor6' },
        ];
        coins = [
            { x: 250, y: 400, isVisible: true, isBad: false }, { x: 285 y: 400, isVisible: true, isBad: false },
            { x: 500, y: 300, isVisible: true, isBad: false }, { x: 535, y: 300, isVisible: true, isBad: false },
            { x: 800, y: 400, isVisible: true, isBad: true }, { x: 1050, y: 350, isVisible: true, isBad: false }, 
            { x: 1250, y: 250, isVisible: true, isBad: false }, { x: 1405, y: 150, isVisible: true, isBad: false }, 
            { x: 1700, y: 300, isVisible: true, isBad: false }, { x: 1735, y: 300, isVisible: true, isBad: false },
        ];
        
        gameLoop();
    }

    // --- Sistema de Input (sin cambios) ---
    const keys = { ArrowLeft: false, ArrowRight: false, Space: false };
    window.addEventListener('keydown', (e) => { if (e.code in keys) keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); });
    window.addEventListener('keyup', (e) => { if (e.code in keys) keys[e.code] = false; });
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');
    const handleButtonPress = (key, isPressed) => { keys[key] = isPressed; };
    btnLeft.addEventListener('mousedown', () => handleButtonPress('ArrowLeft', true));
    btnLeft.addEventListener('mouseup', () => handleButtonPress('ArrowLeft', false));
    btnLeft.addEventListener('mouseleave', () => handleButtonPress('ArrowLeft', false));
    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); handleButtonPress('ArrowLeft', true); });
    btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); handleButtonPress('ArrowLeft', false); });
    btnRight.addEventListener('mousedown', () => handleButtonPress('ArrowRight', true));
    btnRight.addEventListener('mouseup', () => handleButtonPress('ArrowRight', false));
    btnRight.addEventListener('mouseleave', () => handleButtonPress('ArrowRight', false));
    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); handleButtonPress('ArrowRight', true); });
    btnRight.addEventListener('touchend', (e) => { e.preventDefault(); handleButtonPress('ArrowRight', false); });
    btnJump.addEventListener('mousedown', () => handleButtonPress('Space', true));
    btnJump.addEventListener('mouseup', () => handleButtonPress('Space', false));
    btnJump.addEventListener('mouseleave', () => handleButtonPress('Space', false));
    btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); handleButtonPress('Space', true); });
    btnJump.addEventListener('touchend', (e) => { e.preventDefault(); handleButtonPress('Space', false); });


    // --- Lógica de Actualización (Update) ---
    function updateSplashScreen() {
        const FADE_SPEED = 0.02;
        if (splashPhase === 'FADING_IN') {
            splashAlpha += FADE_SPEED;
            if (splashAlpha >= 1) { splashAlpha = 1; splashPhase = 'HOLDING'; }
        } else if (splashPhase === 'HOLDING') {
            splashHoldTimer++;
            if (splashHoldTimer >= SPLASH_HOLD_DURATION) { splashPhase = 'FADING_OUT'; }
        } else if (splashPhase === 'FADING_OUT') {
            splashAlpha -= FADE_SPEED;
            if (splashAlpha <= 0) { splashAlpha = 0; gameState = 'PLAYING'; }
        }
    }

    function updatePlaying() {
        let isMoving = false; let moveX = 0;
        if (keys.ArrowLeft) { moveX = -MOVE_SPEED; player.facingDirection = 'left'; isMoving = true; }
        if (keys.ArrowRight) { moveX = MOVE_SPEED; player.facingDirection = 'right'; isMoving = true; }
        player.x += moveX;
        for (const platform of platforms) {
            if (player.x < platform.x + platform.width && player.x + player.width > platform.x && player.y < platform.y + platform.height && player.y + player.height > platform.y) {
                if (moveX > 0) { player.x = platform.x - player.width; } else if (moveX < 0) { player.x = platform.x + platform.width; }
            }
        }
        if (keys.Space && !player.isJumping) { player.velocityY = -JUMP_FORCE; player.isJumping = true; }
        player.velocityY += GRAVITY; player.y += player.velocityY;
        let onPlatform = false;
        for (const platform of platforms) {
            if (player.x < platform.x + platform.width && player.x + player.width > platform.x) {
                if (player.velocityY >= 0 && player.y + player.height > platform.y && (player.y - player.velocityY) + player.height <= platform.y) {
                     player.y = platform.y - player.height; player.velocityY = 0; onPlatform = true;
                }
                else if (player.velocityY < 0 && player.y < platform.y + platform.height && (player.y - player.velocityY) >= platform.y + platform.height) {
                    player.y = platform.y + platform.height; player.velocityY = 0;
                }
            }
        }
        player.isJumping = !onPlatform;
        for (const coin of coins) {
            if (coin.isVisible && player.x < coin.x + COIN_SIZE && player.x + player.width > coin.x && player.y < coin.y + COIN_SIZE && player.y + player.height > coin.y) {
                coin.isVisible = false;
                if (coin.isBad) { health -= 25; } else { score += 10; }
            }
        }
        player.frameTimer++;
        if (player.frameTimer > FRAME_SPEED) {
            player.frameTimer = 0;
            if (player.isJumping) { player.currentFrame = JUMP_FRAME; } 
            else if (isMoving) {
                let currentWalkFrame = player.currentFrame - WALK_CYCLE_START_FRAME;
                if (currentWalkFrame < 0 || currentWalkFrame >= TOTAL_WALK_FRAMES) { currentWalkFrame = 0; }
                else { currentWalkFrame = (currentWalkFrame + 1) % TOTAL_WALK_FRAMES; }
                player.currentFrame = WALK_CYCLE_START_FRAME + currentWalkFrame;
            } else { player.currentFrame = IDLE_FRAME; }
        }
        camera.x = player.x - BASE_WIDTH / 3;
        if (camera.x < 0) { camera.x = 0; }
    }

    // --- Renderizado del Juego ---
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // --- DIBUJAR MUNDO DEL JUEGO (SIEMPRE DETRÁS) ---
        ctx.save();
        const scale = canvas.height / BASE_HEIGHT;
        const offsetX = (canvas.width - BASE_WIDTH * scale) / 2;
        ctx.translate(offsetX, 0); ctx.scale(scale, scale);
        ctx.translate(-camera.x, -camera.y);
        const groundPattern = ctx.createPattern(assets.ground, 'repeat');
        ctx.fillStyle = groundPattern;
        for (const platform of platforms) {
            ctx.save(); ctx.translate(platform.x, platform.y); ctx.fillRect(0, 0, platform.width, platform.height); ctx.restore();
        }
        for (const decor of decorations) {
            const img = assets[decor.assetKey];
            if (img) { ctx.drawImage(img, decor.x, decor.y, DECORATION_SIZE, DECORATION_SIZE); }
        }
        for (const coin of coins) {
            if (coin.isVisible && assets.coin) {
                if (coin.isBad) { ctx.filter = 'hue-rotate(330deg) saturate(2)'; }
                ctx.drawImage(assets.coin, coin.x, coin.y, COIN_SIZE, COIN_SIZE);
                ctx.filter = 'none';
            }
        }
        ctx.save();
        const drawY = player.y + PLAYER_VISUAL_OFFSET_Y;
        const sx = player.currentFrame * FRAME_WIDTH; const sy = 0;
        if (player.facingDirection === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(assets.player, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, -player.x - player.width, drawY, player.width, player.height);
        } else {
            ctx.drawImage(assets.player, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, player.x, drawY, player.width, player.height);
        }
        ctx.restore();
        ctx.restore();

        // --- DIBUJAR INTERFAZ Y SUPERPOSICIONES ---
        if (gameState === 'SPLASH_SCREEN') {
            // Capa oscura semi-transparente que se desvanece
            ctx.fillStyle = `rgba(0, 0, 0, ${splashAlpha * 0.7})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Dibuja el texto con estilos mejorados
            ctx.save();
            ctx.globalAlpha = splashAlpha; // El texto aparece y desaparece
            ctx.textAlign = 'center';

            // Estilo para "Acto 1"
            ctx.font = '90px monospace';
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.fillText('Acto 1', canvas.width / 2, canvas.height / 2);

            // Estilo para "Plataformas"
            ctx.font = '45px monospace';
            ctx.fillStyle = '#FFD700'; // Color dorado
            ctx.shadowColor = 'transparent'; // Quitar sombra para el subtítulo
            ctx.fillText('Plataformas', canvas.width / 2, canvas.height / 2 + 60);
            
            ctx.restore();
        } 
        else if (gameState === 'PLAYING') {
            ctx.fillStyle = 'white'; ctx.font = '40px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`Puntos: ${score}`, 20, 50);
            ctx.fillText(`Vida: ${health}`, 20, 90);
        }
    }

    // --- Bucle Principal del Juego ---
    function gameLoop() {
        if (gameState === 'SPLASH_SCREEN') {
            updateSplashScreen();
        } else { // 'PLAYING'
            updatePlaying();
        }
        draw();
        requestAnimationFrame(gameLoop);
    }
    
    loadAssets(initializeGame);
});

