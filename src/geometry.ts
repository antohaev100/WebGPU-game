const tileWidth = 29;
const tileHeight = 13;

const baseTileVertices = new Float32Array([ //base at bot left
    // x, y, z, r, g, b, nx, ny, nz
    -0.49 - (tileWidth-1)/2, 0.0, -0.49 - (tileHeight+3)/2, 0.8, 0.8, 0.8, 0.0, 1.0, 0.0, 
     0.49 - (tileWidth-1)/2, 0.0, -0.49 - (tileHeight+3)/2, 0.8, 0.8, 0.8, 0.0, 1.0, 0.0,
    -0.49 - (tileWidth-1)/2, 0.0,  0.49 - (tileHeight+3)/2, 0.8, 0.8, 0.8, 0.0, 1.0, 0.0,
     0.49 - (tileWidth-1)/2, 0.0,  0.49 - (tileHeight+3)/2, 0.8, 0.8, 0.8, 0.0, 1.0, 0.0,
]);

const baseTileIndices = new Uint16Array([
    0, 2, 3, 0, 3, 1,
]);

const tileVertices = new Float32Array(tileWidth * tileHeight * 4 * 9);
const tileIndices = new Uint16Array(tileWidth * tileHeight * 6);
const vl = baseTileVertices.length;
const il = baseTileIndices.length;
let index = 0;
for(let i = 0; i < tileWidth; i++) { //width
    for(let j = 0; j < tileHeight; j++) { //height
        let vOffset = vl * index;
        let iOffset = il * index;
        tileVertices.set(baseTileVertices, vOffset);
        tileIndices.set(baseTileIndices, iOffset);
        for(let k = 0; k < 4; k++) {
            tileVertices[0 + 9*k + vOffset] += i; //x
            tileVertices[2 + 9*k + vOffset] += j; //z
        }
        for(let k = 0; k < 6; k++) {
            tileIndices[k + iOffset] += index * 4;
        }
        index++;
    }
}


const playerVertices = new Float32Array([
    // x, y, z, r, g, b, nx, ny, nz
    //top
    -0.1, 1.0, -0.1, 0.0, 0.0, 0.8, 0.0, 1.0, 0.0,
     0.1, 1.0, -0.1, 0.8, 0.0, 0.0, 0.0, 1.0, 0.0,
    -0.1, 1.0,  0.1, 0.0, 0.0, 0.8, 0.0, 1.0, 0.0,
     0.1, 1.0,  0.1, 0.8, 0.0, 0.0, 0.0, 1.0, 0.0,
    //x+ side
    0.1, 1.0, -0.1, 0.0, 0.0, 0.8, 1.0, 0.0, 0.0,
    0.1, 1.0,  0.1, 0.0, 0.0, 0.8, 1.0, 0.0, 0.0,
    0.1, 0.0, -0.1, 0.0, 0.0, 0.8, 1.0, 0.0, 0.0,
    0.1, 0.0,  0.1, 0.0, 0.0, 0.8, 1.0, 0.0, 0.0,
    //x- side
    -0.1, 1.0, -0.1, 0.0, 0.0, 0.8, -1.0, 0.0, 0.0,
    -0.1, 1.0,  0.1, 0.0, 0.0, 0.8, -1.0, 0.0, 0.0,
    -0.1, 0.0, -0.1, 0.0, 0.0, 0.8, -1.0, 0.0, 0.0,
    -0.1, 0.0,  0.1, 0.0, 0.0, 0.8, -1.0, 0.0, 0.0,
    //z+ side
    -0.1, 1.0,  0.1, 0.0, 0.0, 0.8, 0.0, 0.0, -1.0,
     0.1, 1.0,  0.1, 0.0, 0.0, 0.8, 0.0, 0.0, -1.0,
    -0.1, 0.0,  0.1, 0.0, 0.0, 0.8, 0.0, 0.0, -1.0,
     0.1, 0.0,  0.1, 0.0, 0.0, 0.8, 0.0, 0.0, -1.0,
    //z- side
    -0.1, 1.0, -0.1, 0.0, 0.0, 0.8, 0.0, 0.0, -1.0,
     0.1, 1.0, -0.1, 0.0, 0.0, 0.8, 0.0, 0.0, -1.0,
    -0.1, 0.0, -0.1, 0.0, 0.0, 0.8, 0.0, 0.0, -1.0,
     0.1, 0.0, -0.1, 0.0, 0.0, 0.8, 0.0, 0.0, -1.0,
]);

const playerIndices = new Uint16Array([
    //top
    0, 2, 3, 0, 3, 1,
    //x+ side
    4, 5, 7, 4, 7, 6,
    //x- side
    8, 10, 11, 8, 11, 9,
    //z+ side
    12, 14, 15, 12, 15, 13,
    //z- side
    16, 17, 19, 16, 19, 18,
]);

const enemyVertices1 = new Float32Array([
    // x, y, z, r, g, b, nx, ny, nz
    //top
    -0.1, 1.0, -0.1, 0.8, 0.0, 0.0, 0.0, 1.0, 0.0,
     0.1, 1.0, -0.1, 0.0, 0.0, 0.8, 0.0, 1.0, 0.0,
    -0.1, 1.0,  0.1, 0.8, 0.0, 0.0, 0.0, 1.0, 0.0,
     0.1, 1.0,  0.1, 0.0, 0.0, 0.8, 0.0, 1.0, 0.0,
    //x+ side
    0.1, 1.0, -0.1, 0.8, 0.0, 0.0, 1.0, 0.0, 0.0,
    0.1, 1.0,  0.1, 0.8, 0.0, 0.0, 1.0, 0.0, 0.0,
    0.1, 0.0, -0.1, 0.8, 0.0, 0.0, 1.0, 0.0, 0.0,
    0.1, 0.0,  0.1, 0.8, 0.0, 0.0, 1.0, 0.0, 0.0,
    //x- side
    -0.1, 1.0, -0.1, 0.8, 0.0, 0.0, -1.0, 0.0, 0.0,
    -0.1, 1.0,  0.1, 0.8, 0.0, 0.0, -1.0, 0.0, 0.0,
    -0.1, 0.0, -0.1, 0.8, 0.0, 0.0, -1.0, 0.0, 0.0,
    -0.1, 0.0,  0.1, 0.8, 0.0, 0.0, -1.0, 0.0, 0.0,
    //z+ side
    -0.1, 1.0,  0.1, 0.8, 0.0, 0.0, 0.0, 0.0, -1.0,
     0.1, 1.0,  0.1, 0.8, 0.0, 0.0, 0.0, 0.0, -1.0,
    -0.1, 0.0,  0.1, 0.8, 0.0, 0.0, 0.0, 0.0, -1.0,
     0.1, 0.0,  0.1, 0.8, 0.0, 0.0, 0.0, 0.0, -1.0,
    //z- side
    -0.1, 1.0, -0.1, 0.8, 0.0, 0.0, 0.0, 0.0, -1.0,
     0.1, 1.0, -0.1, 0.8, 0.0, 0.0, 0.0, 0.0, -1.0,
    -0.1, 0.0, -0.1, 0.8, 0.0, 0.0, 0.0, 0.0, -1.0,
     0.1, 0.0, -0.1, 0.8, 0.0, 0.0, 0.0, 0.0, -1.0,
]);

const enemyIndices1 = new Uint16Array([
    //top
    0, 2, 3, 0, 3, 1,
    //x+ side
    4, 5, 7, 4, 7, 6,
    //x- side
    8, 10, 11, 8, 11, 9,
    //z+ side
    12, 14, 15, 12, 15, 13,
    //z- side
    16, 17, 19, 16, 19, 18,
]);

const healthBarFillingVertices = new Float32Array([
    // x, y, z, r, g, b, nx, ny, nz
    -0.3, 0.02, -0.05, 0.8, 0.0, 0.0, 0.0, 1.0, 0.0, 
     0.3, 0.02, -0.05, 0.8, 0.0, 0.0, 0.0, 1.0, 0.0,
    -0.3, 0.02,  0.05, 0.8, 0.0, 0.0, 0.0, 1.0, 0.0,
     0.3, 0.02,  0.05, 0.8, 0.0, 0.0, 0.0, 1.0, 0.0,
]);

const healthBarFillingIndices = new Uint16Array([
    0, 2, 3, 0, 3, 1,
]);

const healthBarBackgroundVertices = new Float32Array([
    // x, y, z, r, g, b, nx, ny, nz
    -0.31, 0.01, -0.06, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 
     0.31, 0.01, -0.06, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
    -0.31, 0.01,  0.06, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
     0.31, 0.01,  0.06, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
]);

const healthBarBackgroundIndices = new Uint16Array([
    0, 2, 3, 0, 3, 1,
]);

export const objectTypeData = new Float32Array([
    //dmg, radius/size, speed, maxhp
    100, 0.1, 3, 100, //enemy1
    200, 0.2, 2, 200, //enemy2
]);

const enemyVertices2 = new Float32Array([
    // x, y, z, r, g, b, nx, ny, nz
    //top
    -0.2, 0.8, -0.2, 0.8, 0.4, 0.0, 0.0, 1.0, 0.0,
     0.2, 0.8, -0.2, 0.0, 0.0, 0.8, 0.0, 1.0, 0.0,
    -0.2, 0.8,  0.2, 0.8, 0.4, 0.0, 0.0, 1.0, 0.0,
     0.2, 0.8,  0.2, 0.0, 0.0, 0.8, 0.0, 1.0, 0.0,
    //x+ side
    0.2, 0.8, -0.2, 0.8, 0.4, 0.0, 1.0, 0.0, 0.0,
    0.2, 0.8,  0.2, 0.8, 0.4, 0.0, 1.0, 0.0, 0.0,
    0.2, 0.0, -0.2, 0.8, 0.4, 0.0, 1.0, 0.0, 0.0,
    0.2, 0.0,  0.2, 0.8, 0.4, 0.0, 1.0, 0.0, 0.0,
    //x- side
    -0.2, 0.8, -0.2, 0.8, 0.4, 0.0, -1.0, 0.0, 0.0,
    -0.2, 0.8,  0.2, 0.8, 0.4, 0.0, -1.0, 0.0, 0.0,
    -0.2, 0.0, -0.2, 0.8, 0.4, 0.0, -1.0, 0.0, 0.0,
    -0.2, 0.0,  0.2, 0.8, 0.4, 0.0, -1.0, 0.0, 0.0,
    //z+ side
    -0.2, 0.8,  0.2, 0.8, 0.4, 0.0, 0.0, 0.0, -1.0,
     0.2, 0.8,  0.2, 0.8, 0.4, 0.0, 0.0, 0.0, -1.0,
    -0.2, 0.0,  0.2, 0.8, 0.4, 0.0, 0.0, 0.0, -1.0,
     0.2, 0.0,  0.2, 0.8, 0.4, 0.0, 0.0, 0.0, -1.0,
    //z- side
    -0.2, 0.8, -0.2, 0.8, 0.4, 0.0, 0.0, 0.0, -1.0,
     0.2, 0.8, -0.2, 0.8, 0.4, 0.0, 0.0, 0.0, -1.0,
    -0.2, 0.0, -0.2, 0.8, 0.4, 0.0, 0.0, 0.0, -1.0,
     0.2, 0.0, -0.2, 0.8, 0.4, 0.0, 0.0, 0.0, -1.0,
]);

const enemyIndices2 = new Uint16Array([
    //top
    0, 2, 3, 0, 3, 1,
    //x+ side
    4, 5, 7, 4, 7, 6,
    //x- side
    8, 10, 11, 8, 11, 9,
    //z+ side
    12, 14, 15, 12, 15, 13,
    //z- side
    16, 17, 19, 16, 19, 18,
]);

const projectileVertices = new Float32Array([
    // x, y, z, r, g, b, nx, ny, nz
    -0.10, 0.5, -0.02, 0.4, 0.4, 0.0, 0.0, 1.0, 0.0, 
     0.10, 0.5, -0.02, 0.4, 0.4, 0.0, 0.0, 1.0, 0.0,
    -0.10, 0.5,  0.02, 0.4, 0.4, 0.0, 0.0, 1.0, 0.0,
     0.10, 0.5,  0.02, 0.4, 0.4, 0.0, 0.0, 1.0, 0.0,
]);

const projectileIndices = new Uint16Array([
    0, 2, 3, 0, 3, 1,
]);

const powerupVertices = new Float32Array([
    // x, y, z, r, g, b, nx, ny, nz
    //top
    -0.05, 0.55, -0.05, 0.2, 0.8, 0.0, 0.0, 1.0, 0.0,
     0.05, 0.55, -0.05, 0.0, 0.0, 0.2, 0.0, 1.0, 0.0,
    -0.05, 0.55,  0.05, 0.2, 0.8, 0.0, 0.0, 1.0, 0.0,
     0.05, 0.55,  0.05, 0.0, 0.0, 0.2, 0.0, 1.0, 0.0,
    //x+ side
    0.05, 0.55, -0.05, 0.2, 0.8, 0.2, 1.0, 0.0, 0.0,
    0.05, 0.55,  0.05, 0.2, 0.8, 0.2, 1.0, 0.0, 0.0,
    0.05, 0.45, -0.05, 0.2, 0.8, 0.2, 1.0, 0.0, 0.0,
    0.05, 0.45,  0.05, 0.2, 0.8, 0.2, 1.0, 0.0, 0.0,
    //x- side
    -0.05, 0.55, -0.05, 0.2, 0.8, 0.2, -1.0, 0.0, 0.0,
    -0.05, 0.55,  0.05, 0.2, 0.8, 0.2, -1.0, 0.0, 0.0,
    -0.05, 0.45, -0.05, 0.2, 0.8, 0.2, -1.0, 0.0, 0.0,
    -0.05, 0.45,  0.05, 0.2, 0.8, 0.2, -1.0, 0.0, 0.0,
    //z+ side
    -0.05, 0.55,  0.05, 0.2, 0.8, 0.2, 0.0, 0.0, -1.0,
     0.05, 0.55,  0.05, 0.2, 0.8, 0.2, 0.0, 0.0, -1.0,
    -0.05, 0.45,  0.05, 0.2, 0.8, 0.2, 0.0, 0.0, -1.0,
     0.05, 0.45,  0.05, 0.2, 0.8, 0.2, 0.0, 0.0, -1.0,
    //z- side
    -0.05, 0.55, -0.05, 0.2, 0.8, 0.2, 0.0, 0.0, -1.0,
     0.05, 0.55, -0.05, 0.2, 0.8, 0.2, 0.0, 0.0, -1.0,
    -0.05, 0.45, -0.05, 0.2, 0.8, 0.2, 0.0, 0.0, -1.0,
     0.05, 0.45, -0.05, 0.2, 0.8, 0.2, 0.0, 0.0, -1.0,
]);

const powerupIndices = new Uint16Array([
    //top
    0, 2, 3, 0, 3, 1,
    //x+ side
    4, 5, 7, 4, 7, 6,
    //x- side
    8, 10, 11, 8, 11, 9,
    //z+ side
    12, 14, 15, 12, 15, 13,
    //z- side
    16, 17, 19, 16, 19, 18,
]);

const enemyTypeNum = 2; //number of enemy types
export const vertexBufferData = new Float32Array(tileVertices.length + healthBarBackgroundVertices.length + healthBarFillingVertices.length + playerVertices.length + enemyVertices1.length + enemyVertices2.length + projectileVertices.length + powerupVertices.length);
export const indexBufferData = new Uint16Array(tileIndices.length + healthBarBackgroundIndices.length + healthBarFillingIndices.length + playerIndices.length + enemyIndices1.length + enemyIndices2.length + projectileIndices.length + powerupIndices.length);
const vertexBufferOffsets = new Uint32Array(4+enemyTypeNum+2);
const indexBufferOffsets = new Uint32Array(4+enemyTypeNum+2);
const firstIndices = new Uint16Array(4+enemyTypeNum+2);
const baseVertex = new Uint16Array(4+enemyTypeNum+2);

vertexBufferOffsets[0] = 0;
indexBufferOffsets[0] = 0;
firstIndices[0] = 0;
baseVertex[0] = 0;

//tile
vertexBufferData.set(tileVertices, vertexBufferOffsets[0]);
indexBufferData.set(tileIndices, indexBufferOffsets[0]);
vertexBufferOffsets[1] = vertexBufferOffsets[0] + tileVertices.length;
indexBufferOffsets[1] = indexBufferOffsets[0] + tileIndices.length;
firstIndices[1] = tileIndices.length + firstIndices[0];
baseVertex[1] = (tileVertices.length / 9) + baseVertex[0];

//player
vertexBufferData.set(playerVertices, vertexBufferOffsets[1]);
indexBufferData.set(playerIndices, indexBufferOffsets[1]);
vertexBufferOffsets[2] = vertexBufferOffsets[1] + playerVertices.length;
indexBufferOffsets[2] = indexBufferOffsets[1] + playerIndices.length;
firstIndices[2] = playerIndices.length + firstIndices[1];
baseVertex[2] = (playerVertices.length / 9) + baseVertex[1];

//hp bar
vertexBufferData.set(healthBarBackgroundVertices, vertexBufferOffsets[2]);
indexBufferData.set(healthBarBackgroundIndices, indexBufferOffsets[2]);
vertexBufferOffsets[3] = healthBarBackgroundVertices.length + vertexBufferOffsets[2];
indexBufferOffsets[3] = healthBarBackgroundIndices.length + indexBufferOffsets[2];
firstIndices[3] = healthBarBackgroundIndices.length + firstIndices[2];
baseVertex[3] = (healthBarBackgroundVertices.length / 9) + baseVertex[2];

//hp fill
vertexBufferData.set(healthBarFillingVertices, vertexBufferOffsets[3]);
indexBufferData.set(healthBarFillingIndices, indexBufferOffsets[3]);
vertexBufferOffsets[4] = vertexBufferOffsets[3] + healthBarFillingVertices.length;
indexBufferOffsets[4] = indexBufferOffsets[3] + healthBarFillingIndices.length;
firstIndices[4] = healthBarFillingIndices.length + firstIndices[3];
baseVertex[4] = (healthBarFillingVertices.length / 9) + baseVertex[3];

//enemy1
vertexBufferData.set(enemyVertices1, vertexBufferOffsets[4]);
indexBufferData.set(enemyIndices1, indexBufferOffsets[4]);
vertexBufferOffsets[5] = vertexBufferOffsets[4] + enemyVertices1.length;
indexBufferOffsets[5] = indexBufferOffsets[4] + enemyIndices1.length;
firstIndices[5] = enemyIndices1.length + firstIndices[4];
baseVertex[5] = (enemyVertices1.length / 9) + baseVertex[4];

//enemy2
vertexBufferData.set(enemyVertices2, vertexBufferOffsets[5]);
indexBufferData.set(enemyIndices2, indexBufferOffsets[5]);
vertexBufferOffsets[6] = vertexBufferOffsets[5] + enemyVertices2.length;
indexBufferOffsets[6] = indexBufferOffsets[5] + enemyIndices2.length;
firstIndices[6] = enemyIndices2.length + firstIndices[5];
baseVertex[6] = (enemyVertices2.length / 9) + baseVertex[5];

//projectile
vertexBufferData.set(projectileVertices, vertexBufferOffsets[6]);
indexBufferData.set(projectileIndices, indexBufferOffsets[6]);
vertexBufferOffsets[7] = vertexBufferOffsets[6] + projectileVertices.length;
indexBufferOffsets[7] = indexBufferOffsets[6] + projectileIndices.length;
firstIndices[7] = projectileIndices.length + firstIndices[6];
baseVertex[7] = (projectileVertices.length / 9) + baseVertex[6];

//powerup
vertexBufferData.set(powerupVertices, vertexBufferOffsets[7]);
indexBufferData.set(powerupIndices, indexBufferOffsets[7]);



export const indirectData = new Uint32Array([
    //indexCount,                       instanceCount,  firstIndex,       baseVertex,        firstInstance
    tileIndices.length,                 1,              firstIndices[0],  baseVertex[0],     0,        //(tiles)
    playerIndices.length,               1,              firstIndices[1],  baseVertex[1],     1,      //(player)
    healthBarBackgroundIndices.length,  0,              firstIndices[2],  baseVertex[2],     2,       //(health bar background)
    healthBarFillingIndices.length,     0,              firstIndices[3],  baseVertex[3],     0,       //(health bar filling)
    enemyIndices1.length,               0,              firstIndices[4],  baseVertex[4],     0,       //(enemytype0)
    enemyIndices2.length,               0,              firstIndices[5],  baseVertex[5],     0,       //(enemytype1)
    projectileIndices.length,           0,              firstIndices[6],  baseVertex[6],     0,        //(projectile)       
    powerupIndices.length,              0,              firstIndices[7],  baseVertex[7],     0,        //(powerup)
]);