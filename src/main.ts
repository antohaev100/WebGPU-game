/// <reference types="@webgpu/types" />

import { GameStateManager, PowerupEffect } from './game/game-state';
const gameState = GameStateManager.getInstance();


async function initializeRenderThread() {    
    // Create an HTMLCanvasElement to display the result in the DOM
    const canvasElement = document.getElementById('myCanvas');
    if (!canvasElement) {
        console.error("Canvas element not found.");
        return;
    }
    
    // Set initial canvas size to match the viewport
    const setCanvasSize = () => {
        const canvas = canvasElement as HTMLCanvasElement;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gameState.setWidthHeightRatio(window.innerWidth / window.innerHeight)
    };
    
    // Set initial size
    setCanvasSize();

    const offscreenCanvas = (canvasElement as HTMLCanvasElement).transferControlToOffscreen();
    
    const renderThread = new Worker(new URL('./render.ts', import.meta.url), { type: 'module' });

    renderThread.postMessage({type: 'init', canvas: offscreenCanvas, buffer: gameState.getSharedBuffer()}, [offscreenCanvas]);

    window.addEventListener('resize', () => {
        gameState.setWidthHeightRatio(window.innerWidth / window.innerHeight);
        renderThread.postMessage({ type: 'resize', width: window.innerWidth, height: window.innerHeight });
    });

    let previousTimestamp = performance.now();
    let frameCount = 0;
    let fps = 0;
    const fpsElement = document.getElementById('fps') as HTMLDivElement;
    let fpsTimestamp = previousTimestamp;
    renderThread.onmessage = (event) => {
        if(event.data.type === 'frameDone') {
            const pendingPowerupSelection = gameState.getPendingPowerupSelection();
            const powerupControl = gameState.getPowerupControl();
            const powerupSelected = gameState.getPowerupSelected();
            if(pendingPowerupSelection != 0 && powerupControl == 0) {
                showPowerupOptions();
            } else if(powerupControl == 2) {
                console.log("Powerup selected: " + powerupSelected);
                selectPowerup();
            }

            // Calculate dt
            let timestamp = performance.now(); // Get the current timestamp
            let dt = (timestamp - previousTimestamp) / 1000; // Calculate dt as the time difference in seconds
            previousTimestamp = timestamp; // Update the previous timestamp
            gameState.setDeltaTime(dt);
            // Calculate FPS
            frameCount++;
            if (timestamp - fpsTimestamp >= 1000) {
                fps = frameCount;
                frameCount = 0;
                fpsTimestamp = timestamp;
                if (fpsElement) {
                    fpsElement.textContent = `FPS: ${fps}`;
                }
            }
        } 
    };
}

function initializeInputThread() {    
    const inputThread = new Worker(new URL('./input.ts', import.meta.url), { type: 'module' });

    inputThread.postMessage({ type: 'init', buffer: gameState.getSharedBuffer() });
    window.addEventListener('keydown', (event) => {
        inputThread.postMessage({ type: 'keydown', key: event.key });
    });
    
    window.addEventListener('keyup', (event) => {
        inputThread.postMessage({ type: 'keyup', key: event.key });
    });
}

// Global variables for powerup management
let optionsElement: HTMLElement | null;
let timerBar: HTMLElement | null;
let effects : number[] = new Array(3);
let values : number[] = new Array(3);
let descriptionElements: Array<HTMLElement | null> = [];
let selectionTimeoutId: ReturnType<typeof setTimeout> | null = null;
let selectionTimeMs = 5000; // 5 seconds to select

// Initialize powerup UI elements
function initPowerupUI() {
    optionsElement = document.getElementById('powerup-options');
    timerBar = document.getElementById('powerup-timer-bar');
    descriptionElements = [
        document.getElementById('powerup-desc-1'),
        document.getElementById('powerup-desc-2'),
        document.getElementById('powerup-desc-3')
    ];
}

function resetTimer() {
    if (timerBar) {
        timerBar.style.transition = '';
        timerBar.style.width = '100%';
    }
    if (optionsElement) {
        optionsElement.style.display = 'none';
    }
    if (selectionTimeoutId !== null) {
        clearTimeout(selectionTimeoutId);
        selectionTimeoutId = null;
    }
}


function showPowerupOptions() {
    for(let i = 0; i < 3; i++) {
        effects[i] = Math.floor(Math.random() * 4); //0 1 2 3
        switch (effects[i]) {
            case PowerupEffect.FireCount:
                values[i] = Math.floor(Math.random() * 3); // 0 to 2
                descriptionElements[i]!.textContent = `${values[i]} More Projectiles`;
                break;
            case PowerupEffect.Penetration:
                values[i] = Math.floor(Math.random() * 3); // 0 to 2
                descriptionElements[i]!.textContent = `${values[i]} More Penetration`;
                break;
            case PowerupEffect.Damage:
                values[i] = Math.floor(Math.random() * 26); // 0 to 25
                descriptionElements[i]!.textContent = `${values[i]} More Damage`;
                break;
            case PowerupEffect.FireRate:
                values[i] = Math.floor(Math.random() * 101); // 0 to 100
                descriptionElements[i]!.textContent = `${values[i]}ms Less Fire Cooldown`;
                break;
        }
    }

    // Show options panel
    if (optionsElement) {
        optionsElement.style.display = 'block';
    }
    
    // Start timer animation
    setTimeout(() => {
        if(timerBar) {
            void timerBar.offsetWidth;
            timerBar.style.transition = `width ${selectionTimeMs}ms linear`;
            timerBar.style.width = '0%';
        }
      }, 50);    
    
    gameState.decrementPendingPowerupSelection();
    gameState.setPowerupControl(1);

    // Set timeout for auto-selection if user doesn't choose in time
    selectionTimeoutId = setTimeout(() => {
        // Random selection if time runs out
        resetTimer();
        gameState.setPowerupControl(0);
    }, selectionTimeMs);
}

// Select powerup and apply it
function selectPowerup() {
    resetTimer();
    gameState.setSelectedPowerupEffect(effects[gameState.getPowerupSelected()]);
    gameState.setSelectedPowerupValue(values[gameState.getPowerupSelected()]);
    gameState.setPowerupControl(3);
}

document.addEventListener('DOMContentLoaded', () => {
    initPowerupUI();
    initializeRenderThread();
    initializeInputThread();
});