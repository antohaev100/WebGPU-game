/// <reference types="@webgpu/types" />

// Initialize global variables in a SharedArrayBuffer
const sharedBuffer = new SharedArrayBuffer(32 * 4);
const sharedArrayFloat = new Float32Array(sharedBuffer);
const sharedArrayUint = new Uint32Array(sharedBuffer);


sharedArrayFloat[0] = 1.0; // playerRotMat[0]
sharedArrayFloat[1] = 0.0; // playerRotMat[1]
sharedArrayFloat[2] = 0.0; // playerRotMat[2]
sharedArrayFloat[3] = 1.0; // playerRotMat[3]
sharedArrayFloat[4] = 7.0; // playerPosition x
sharedArrayFloat[5] = 7.0; // playerPosition z
sharedArrayFloat[6] = 8.33; // dt

sharedArrayFloat[7] = 0; // vp[0]
sharedArrayFloat[8] = 0; // vp[1]
sharedArrayFloat[9] = 0; // vp[2]
sharedArrayFloat[10] = 0; // vp[3]
sharedArrayFloat[11] = 0; // vp[4]
sharedArrayFloat[12] = 0; // vp[5]
sharedArrayFloat[13] = 0; // vp[6]
sharedArrayFloat[14] = 0; // vp[7]
sharedArrayFloat[15] = 0; // vp[8]
sharedArrayFloat[16] = 0; // vp[9]
sharedArrayFloat[17] = 0; // vp[10]
sharedArrayFloat[18] = 0; // vp[11]
sharedArrayFloat[19] = 0; // vp[12]
sharedArrayFloat[20] = 0; // vp[13]
sharedArrayFloat[21] = 0; // vp[14]
sharedArrayFloat[22] = 0; // vp[15]

sharedArrayFloat[23] = 1; // widthHeightRatio

sharedArrayUint[24] = 0; // pending powerup selection
sharedArrayUint[25] = 0; // powerup control varaible
sharedArrayUint[26] = 0; // powerup selected (0 or option number)
sharedArrayUint[27] = 0; // selected powerup effect (enum)
sharedArrayUint[28] = 0; // selected powerup value


async function initializeRenderThread() {
    // Check if WebGPU is supported
    if (!navigator.gpu) {
      console.log("WebGPU is not supported.");
      return;
    }
  
    // Create an HTMLCanvasElement to display the result in the DOM
    const canvasElement = document.getElementById('myCanvas');
    if (!canvasElement) {
        console.error("Canvas element not found.");
        return;
    }
    const offscreenCanvas = (canvasElement as HTMLCanvasElement).transferControlToOffscreen();

    const renderThread = new Worker(new URL('./render.ts', import.meta.url));

    //TODO: check
    renderThread.postMessage({type: 'init', canvas: offscreenCanvas, buffer: sharedBuffer}, [offscreenCanvas]);

    window.addEventListener('resize', () => {
        sharedArrayFloat[23] = canvasElement.clientWidth / canvasElement.clientHeight;
        renderThread.postMessage({ type: 'resize', width: canvasElement.clientWidth, height: canvasElement.clientHeight });
    });

    let previousTimestamp = performance.now();
    let frameCount = 0;
    let fps = 0;
    const fpsElement = document.getElementById('fps') as HTMLDivElement;
    let fpsTimestamp = previousTimestamp;
    renderThread.onmessage = (event) => {
        if(event.data.type === 'frameDone') {
            if(sharedArrayUint[24] != 0 && sharedArrayUint[25] == 0) {
                showPowerupOptions();
            } else if(sharedArrayUint[25] == 2) {
                console.log("Powerup selected: " + sharedArrayUint[26]);
                selectPowerup()
            }

            // Calculate dt
            let timestamp = performance.now(); // Get the current timestamp
            let dt = (timestamp - previousTimestamp) / 1000; // Calculate dt as the time difference in seconds
            previousTimestamp = timestamp; // Update the previous timestamp
            sharedArrayFloat[6] = dt;
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
    const inputThread = new Worker(new URL('./input.ts', import.meta.url));
    inputThread.postMessage({ type: 'init', buffer: sharedBuffer });
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
enum PowerupEffect {
    FireCount = 0,
    Penetration = 1,
    Damage = 2,
    FireRate = 3,
}
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
    //if (selectionTimeoutId !== null) {
    //    clearTimeout(selectionTimeoutId);
    //    selectionTimeoutId = null;
    //    if (timerBar) {
    //        timerBar.style.transition = '';
    //        timerBar.style.width = '100%';
    //    }
    //}

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
    sharedArrayUint[24] -= 1; // decrement pending powerup
    sharedArrayUint[25] = 1;

    // Set timeout for auto-selection if user doesn't choose in time
    selectionTimeoutId = setTimeout(() => {
        // Random selection if time runs out
        resetTimer();
        sharedArrayUint[25] = 0;
    }, selectionTimeMs);
}

// Select powerup and apply it
function selectPowerup() {
    resetTimer();
    sharedArrayUint[27] = effects[sharedArrayUint[26]]; // selected powerup effect (enum)
    sharedArrayUint[28] = values[sharedArrayUint[26]]; // selected powerup value
    sharedArrayUint[25] = 3; // set powerup control to 3
}

document.addEventListener('DOMContentLoaded', () => {
    initPowerupUI();
    initializeRenderThread();
    initializeInputThread();
});