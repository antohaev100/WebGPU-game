import { vec2 } from "gl-matrix";
import { mat4 } from "gl-matrix";

const PI = Math.PI;
let inputSA: Float32Array;
let inputSAUint: Uint32Array;
let pos: [number, number];
let nextPos : [number, number];
let angle = 0.0;
let nextAngle = 0.0;
let keysPressed: { [key: string]: boolean } = {};

function lerp(a: number, b: number, t: number, dt: number, mindiff: number): number {
    return Math.abs(a - b) > mindiff ? (a - b) * Math.pow(t, dt) + b : b;
}

function lerpDegrees(a: number, b: number, t: number, dt: number, mindiff: number): number {
    let diff = (b - a) % (2 * PI);
    if (diff > PI) diff -= 2 * PI;
    if (diff < -PI) diff += 2 * PI;
    return Math.abs(diff) > mindiff ? (-diff) * Math.pow(t, dt) + a + diff : a + diff;
}

self.addEventListener('message', (event) => {
    if (event.data.type === 'init') {
        inputSA = new Float32Array(event.data.buffer);
        inputSAUint = new Uint32Array(event.data.buffer);
        pos = [inputSA[4], inputSA[5]];
        nextPos = [inputSA[4], inputSA[5]];
        update();
    } else {
        const { type, key } = event.data;
        if (type === 'keydown') {
            keysPressed[key] = true;
        } else if (type === 'keyup') {
            keysPressed[key] = false;
        }
    }
});

let previousTimestamp = performance.now(); // Initialize previous timestamp
let timestamp = 0.0 // Initialize timestamp
let dt = 0.0 // Initialize dt
let speed = 0.0 // Initialize speed
let movement = vec2.create(); // Initialize movement vector
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
const vpMatrix = mat4.create();
let aspect: number = 0.0;

function update() {
    if(inputSAUint[25] == 1) {
        if(keysPressed['1']) {inputSAUint[26] = 0; inputSAUint[25] = 2; keysPressed['1'] = false;}
        else if(keysPressed['2']) {inputSAUint[26] = 1; inputSAUint[25] = 2; keysPressed['2'] = false;}
        else if(keysPressed['3']) {inputSAUint[26] = 2; inputSAUint[25] = 2; keysPressed['3'] = false;}
    }
    //-------------Calculate dt-------------------
    timestamp = performance.now(); // Get the current timestamp
    dt = (timestamp - previousTimestamp) / 1000; // Calculate dt as the time difference in seconds
    previousTimestamp = timestamp; // Update the previous timestamp
    //-------------calculate Movment-------------------
    movement.fill(0); // Reset movement vector
    if (keysPressed['w']) movement[1] -= 1;
    if (keysPressed['a']) movement[0] -= 1;
    if (keysPressed['s']) movement[1] += 1;
    if (keysPressed['d']) movement[0] += 1;
    movement = vec2.normalize(movement, movement);
    speed = 5 * dt;
    nextPos[0] += movement[0] * speed;
    nextPos[1] += movement[1] * speed;

    if(movement[0] != 0 || movement[1] != 0) {
        nextAngle = Math.atan2(-movement[1], movement[0]);
        angle = lerpDegrees(angle, nextAngle, 0.00001, dt, 0.01);
        inputSA[0] = Math.cos(angle);
        inputSA[1] = Math.cos(angle + PI / 2);
        inputSA[2] = Math.sin(angle);
        inputSA[3] = Math.sin(angle + PI / 2);
    }
    pos[0] = lerp(pos[0], nextPos[0], 0.001, dt, 0.01);
    pos[1] = lerp(pos[1], nextPos[1], 0.001, dt, 0.01);
    inputSA[4] = pos[0];
    inputSA[5] = pos[1];
    //-------------calculate VP-------------------
    mat4.lookAt(viewMatrix, [pos[0], 8, pos[1]+6], [pos[0], 0, pos[1]], [0, 1, 0]);
    if(aspect != inputSA[23]) {
        aspect = inputSA[23];
        mat4.perspective(projectionMatrix, Math.PI / 4, aspect, 0.1, 100.0);
    }
    mat4.multiply(vpMatrix, projectionMatrix, viewMatrix);
    inputSA.set(vpMatrix, 7);
    setTimeout(update, 1); // Schedule the next update
}