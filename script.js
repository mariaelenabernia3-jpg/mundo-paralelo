document.addEventListener('DOMContentLoaded', () => {
    const ls = localStorage;
    const isFirstVisit = !ls.getItem('eg_introCompleted');
    let currentLanguage = ls.getItem('eg_language') || 'es';
    let masterVolume = ls.getItem('eg_masterVolume') || 0.8;
    let sfxVolume = ls.getItem('eg_sfxVolume') || 1.0;

    const gameText = {
        langTitle: { es: "Selecciona Idioma", en: "Select Language" },
        lore: { es: ["Qué sueño más extraño...", "Oh, dios... ¿qué es esto que estoy sintiendo?", "Mierda."], en: ["What a strange dream...", "Oh, god... what is this feeling?", "Shit."] },
        continuePrompt: { es: "[Toca para continuar]", en: "[Tap to continue]" },
        menuDialogue: { es: ["¿Qué coño...? ¿Dónde estoy?", "Y este menú...", "¿Estoy en un juego?"], en: ["What the hell...? Where am I?", "And this menu...", "Am I in a game?"] },
        newGame: { es: "Nueva Partida", en: "New Game" },
        loadGame: { es: "Cargar Partida", en: "Load Game" },
        options: { es: "Opciones", en: "Options" },
        credits: { es: "Créditos", en: "Credits" },
        optionsTitle: { es: "Opciones", en: "Options" },
        creditsTitle: { es: "Creador: DZM", en: "Creator: DZM" },
        close: { es: "Cerrar", en: "Close" },
        language: { es: "Idioma", en: "Language" },
        masterVolume: { es: "Volumen General", en: "Master Volume" },
        sfxVolume: { es: "Efectos", en: "SFX" },
        optionsTaunts: { es: ["¡Ey, deja de toquetear tanto y ven a ayudarme!", "Oye, me has dejado plantado...", "¿Acaso me estás ignorando?"], en: ["Hey, stop fiddling around and come help me!", "Hey, you left me hanging...", "Are you ignoring me?"] },
        creditsTaunts: { es: ["Creo que alguien te ha ganado, Kevin.", "¿A que es inteligente?", "Acaba de darle a jugar y ayúdame."], en: ["I think someone beat you to it, Kevin.", "Smart, aren't they?", "Just press play and help me."] },
        newGamePrompt: { es: "¡Vamos! A ver si salgo de aquí.", en: "Let's go! Let's see if I can get out of here." },
        saveSlotTitle: { es: "Seleccionar Ranura", en: "Select Slot" },
        loadSlotTitle: { es: "Cargar Partida", en: "Load Game" },
        emptySlot: { es: "Vacío", en: "Empty" },
        usedSlot: { es: "Partida Guardada", en: "Saved Game" },
        newGameDialogue: { es: "Eyy... ¿a dónde estoy yendo?", en: "Hey... where am I going?" },
        loading: { es: "Cargando...", en: "Loading..." }
    };

    // --- Selectores de UI y Audio ---
    const allUI = document.querySelectorAll('[data-text-key]');
    const langScreen = document.getElementById('language-selector');
    const loreScreen = document.getElementById('lore-screen');
    const preloader = document.getElementById('preloader');
    const mainMenu = document.getElementById('main-menu');
    const firstTimeDialogueBox = document.getElementById('first-time-dialogue');
    const optionsOverlay = document.getElementById('options-overlay');
    const creditsOverlay = document.getElementById('credits-overlay');
    const saveSlotsOverlay = document.getElementById('save-slots-overlay');
    const masterVolumeSlider = document.getElementById('master-volume');
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    const loadingScreen = document.getElementById('loading-screen');
    const loadingDialogue = document.getElementById('loading-dialogue');
    
    const glitchSound = document.getElementById('glitch-sound');
    const backgroundMusic = document.getElementById('background-music');
    const clickSound = document.getElementById('click-sound');

    // --- Función de Audio Mejorada para Clics ---
    const playClickSound = () => {
        if (clickSound) {
            const soundToPlay = clickSound.cloneNode();
            soundToPlay.volume = sfxVolume; // Usa la variable de volumen global de SFX
            soundToPlay.play().catch(e => console.error("Error al reproducir sonido de clic:", e));
        }
    };

    const playBackgroundMusic = () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play().catch(error => console.error("Error al reproducir música de fondo:", error));
        }
    };

    // --- Funciones Principales del Juego ---
    const updateUIText = () => { allUI.forEach(el => { const key = el.dataset.textKey; if (gameText[key]) el.textContent = gameText[key][currentLanguage]; }); };

    const setLanguage = (lang) => {
        currentLanguage = lang;
        ls.setItem('eg_language', lang);
        updateUIText();
    };
    
    const initGame = () => {
        langScreen.classList.remove('hidden');
    };

    // --- Secuencias de Introducción y Menú ---
    const runLoreSequence = () => {
        let loreIndex = 0;
        loreScreen.classList.remove('hidden');
        document.getElementById('lore-text').textContent = gameText.lore[currentLanguage][loreIndex];
        document.getElementById('continue-prompt').textContent = gameText.continuePrompt[currentLanguage];
        const advanceLore = () => {
            playClickSound();
            loreIndex++;
            if (loreIndex < gameText.lore[currentLanguage].length) {
                document.getElementById('lore-text').textContent = gameText.lore[currentLanguage][loreIndex];
            } else {
                loreScreen.removeEventListener('click', advanceLore);
                loreScreen.classList.add('hidden');
                ls.setItem('eg_introCompleted', 'true');
                runBootSequence();
            }
        };
        loreScreen.addEventListener('click', advanceLore);
    };
    
    const runBootSequence = () => {
        preloader.classList.remove('hidden');
        const bootTextEl = document.getElementById('boot-text');
        const bootMessages = ['Initializing...', 'Mounting reality...', 'WARNING: Sanity check failed.', 'Forcing start...'];
        let lineIndex = 0;
        const interval = setInterval(() => {
            if (lineIndex < bootMessages.length) {
                bootTextEl.innerHTML += `<p>${bootMessages[lineIndex]}</p>`;
                lineIndex++;
            } else {
                clearInterval(interval);
                setTimeout(showMainMenu, 1000);
            }
        }, 600);
    };

    const showMainMenu = () => {
        preloader.classList.add('hidden');
        mainMenu.style.display = 'block';
        playBackgroundMusic();
        if (isFirstVisit) runFirstTimeDialogue();
        setTimeout(startThemeCycle, 500);
    };

    const runFirstTimeDialogue = () => {
        firstTimeDialogueBox.classList.remove('hidden');
        const textEl = document.getElementById('first-time-text');
        const dialogueLines = gameText.menuDialogue[currentLanguage];
        let lineIndex = 0;
        const showNextLine = () => {
            if (lineIndex < dialogueLines.length) {
                textEl.textContent = dialogueLines[lineIndex];
                lineIndex++;
                setTimeout(showNextLine, 3000);
            } else {
                firstTimeDialogueBox.classList.add('hidden');
            }
        };
        showNextLine();
    };

    const showLoadingScreen = (dialogueText) => {
        mainMenu.style.display = 'none';
        saveSlotsOverlay.classList.add('hidden');
        loadingDialogue.textContent = dialogueText;
        loadingScreen.classList.remove('hidden');
        
        setTimeout(() => {
            window.location.href = 'game1.html';
        }, 4000);
    };
    
    const renderSaveSlots = (isNewGame) => {
        const title = document.getElementById('save-slots-title');
        title.textContent = isNewGame ? gameText.saveSlotTitle[currentLanguage] : gameText.loadSlotTitle[currentLanguage];
        const container = document.getElementById('slots-container');
        container.innerHTML = '';
        const saveSlots = JSON.parse(ls.getItem('eg_saveSlots')) || [null, null, null];
        
        saveSlots.forEach((slot, index) => {
            const slotEl = document.createElement('div');
            slotEl.classList.add('save-slot');
            const statusText = slot ? `${gameText.usedSlot[currentLanguage]} - ${slot}` : gameText.emptySlot[currentLanguage];
            if (slot) slotEl.classList.add('used');
            slotEl.innerHTML = `<span>Slot ${index + 1}</span><div class="slot-status">${statusText}</div>`;
            slotEl.addEventListener('click', () => {
                playClickSound();
                if (isNewGame) {
                    saveSlots[index] = new Date().toLocaleString();
                    ls.setItem('eg_saveSlots', JSON.stringify(saveSlots));
                    showLoadingScreen(gameText.newGameDialogue[currentLanguage]);
                } else if (slot) {
                    showLoadingScreen(gameText.loading[currentLanguage]);
                }
            });
            container.appendChild(slotEl);
        });
        saveSlotsOverlay.classList.remove('hidden');
    };

    // --- Efectos Visuales (Glitch y Temas) ---
    const body = document.body, glitchContainers = document.querySelectorAll('.glitch-container'), menuButtons = document.querySelectorAll('.menu-options button'), themes = ['theme-8bit', 'theme-cyberpunk', 'theme-medieval', 'theme-modern'];
    let currentThemeIndex = 0, themeInterval, textCorruptionInterval;
    const corruptText = (elements) => { const chars = 'ABCDEFGHIJKL0123456789!@#$'; elements.forEach(el => { if (!el.dataset.originalText) el.dataset.originalText = el.textContent; el.textContent = Array.from({ length: el.dataset.originalText.length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join(''); }); };
    const restoreText = (elements) => { elements.forEach(el => { if(el.dataset.originalText) el.textContent = gameText[el.dataset.textKey][currentLanguage]; }); };
    const changeTheme = () => {
        glitchSound.play();
        glitchContainers.forEach(el => el.classList.add('is-glitching'));
        textCorruptionInterval = setInterval(() => corruptText(menuButtons), 50);
        setTimeout(() => {
            glitchContainers.forEach(el => el.classList.remove('is-glitching'));
            clearInterval(textCorruptionInterval);
            restoreText(menuButtons);
            body.className = '';
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            body.classList.add(themes[currentThemeIndex]);
        }, 500);
    };
    const startThemeCycle = () => { if (!themeInterval) themeInterval = setInterval(changeTheme, 6000); };
    const stopThemeCycle = () => { clearInterval(themeInterval); themeInterval = null; };

    // --- Asignación de Eventos (Event Listeners) ---

    // Pantalla de Idioma
    document.querySelectorAll('#language-selector button').forEach(button => button.addEventListener('click', () => {
        playClickSound();
        setLanguage(button.dataset.lang);
        langScreen.classList.add('hidden');
        runLoreSequence();
    }));

    // Configuración de Volumen
    masterVolumeSlider.addEventListener('input', (e) => {
        masterVolume = e.target.value;
        ls.setItem('eg_masterVolume', masterVolume);
        backgroundMusic.volume = masterVolume;
    });
    sfxVolumeSlider.addEventListener('input', (e) => {
        sfxVolume = e.target.value;
        ls.setItem('eg_sfxVolume', sfxVolume);
        glitchSound.volume = sfxVolume;
    });

    // Botones del Menú Principal
    document.getElementById('new-game-btn').addEventListener('click', () => { playClickSound(); renderSaveSlots(true); });
    document.getElementById('load-game-btn').addEventListener('click', () => { playClickSound(); renderSaveSlots(false); });
    document.getElementById('options-btn').addEventListener('click', () => {
        playClickSound();
        document.getElementById('options-dialogue').textContent = gameText.optionsTaunts[currentLanguage][Math.floor(Math.random() * 3)];
        optionsOverlay.classList.remove('hidden');
    });
    document.getElementById('credits-btn').addEventListener('click', () => {
        playClickSound();
        document.getElementById('credits-dialogue').textContent = gameText.creditsTaunts[currentLanguage][Math.floor(Math.random() * 3)];
        creditsOverlay.classList.remove('hidden');
    });

    // Botones dentro de Overlays
    document.getElementById('close-options-btn').addEventListener('click', () => { playClickSound(); optionsOverlay.classList.add('hidden'); });
    document.getElementById('close-credits-btn').addEventListener('click', () => { playClickSound(); creditsOverlay.classList.add('hidden'); });
    document.getElementById('close-slots-btn').addEventListener('click', () => { playClickSound(); saveSlotsOverlay.classList.add('hidden'); });
    document.getElementById('lang-btn-es').addEventListener('click', () => { playClickSound(); setLanguage('es'); });
    document.getElementById('lang-btn-en').addEventListener('click', () => { playClickSound(); setLanguage('en'); });

    // --- Inicialización ---
    masterVolumeSlider.value = masterVolume;
    sfxVolumeSlider.value = sfxVolume;
    backgroundMusic.volume = masterVolume;
    glitchSound.volume = sfxVolume;
    
    updateUIText();
    initGame();
});