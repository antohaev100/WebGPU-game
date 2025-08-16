interface Vertex {
    position: [number, number, number]; //xyz
    color: [number, number, number]; //rgb
    normal: [number, number, number]; //xyz
}
const vertexLength = 9;

type TriangleIndices = [number, number, number];
const triangleIndicesLength = 3;

interface IndirectStruct {
    indexCount: number;
    instanceCount: number;
    firstIndex: number;
    baseVertex: number;
    firstInstance: number;
}

const vertexBuffer: Vertex[] = [];
const indexBuffer: TriangleIndices[] = [];
const indirect: IndirectStruct[] = [];
let oldVertexLength = 0;
let oldIndexLength = 0;

function AddObject(vertices: Vertex[], indices: TriangleIndices[], startingInstanceCount: number, firstInstanceIndex: number) {
    indirect.push({
        indexCount: indices.length * triangleIndicesLength,
        instanceCount: startingInstanceCount,
        firstIndex: oldIndexLength,
        baseVertex: oldVertexLength,
        firstInstance: firstInstanceIndex
    });
    oldVertexLength = vertexBuffer.push(...vertices);
    oldIndexLength = indexBuffer.push(...indices) * triangleIndicesLength;
}

function verticesToFloat32Array(vertices: Vertex[]): Float32Array {
    const array = new Float32Array(vertices.length * vertexLength);
    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        array.set(v.position, i * vertexLength);
        array.set(v.color, i * vertexLength + 3);
        array.set(v.normal, i * vertexLength + 6);
    }
    return array;
}

function triangleIndicesToUint16Array(indices: TriangleIndices[]): Uint16Array {
    const array = new Uint16Array(indices.length * triangleIndicesLength);
    for (let i = 0; i < indices.length; i++) {
        const [a, b, c] = indices[i];
        array.set([a, b, c], i * triangleIndicesLength);
    }
    return array;
}

function indirectToUint32Array(indirect: IndirectStruct[]): Uint32Array {
    const array = new Uint32Array(indirect.length * 5);
    for (let i = 0; i < indirect.length; i++) {
        const { indexCount, instanceCount, firstIndex, baseVertex, firstInstance } = indirect[i];
        array.set([indexCount, instanceCount, firstIndex, baseVertex, firstInstance], i * 5);
    }
    return array;
}

const tileWidth = 29;
const tileHeight = 13;

const baseTileVertices: Vertex[] = [
    { position: [-0.49 - (tileWidth-1)/2, 0.0, -0.49 - (tileHeight+3)/2], color: [0.8, 0.8, 0.8], normal: [0.0, 1.0, 0.0] },
    { position: [0.49 - (tileWidth-1)/2, 0.0, -0.49 - (tileHeight+3)/2], color: [0.8, 0.8, 0.8], normal: [0.0, 1.0, 0.0] },
    { position: [-0.49 - (tileWidth-1)/2, 0.0,  0.49 - (tileHeight+3)/2], color: [0.8, 0.8, 0.8], normal: [0.0, 1.0, 0.0] },
    { position: [0.49 - (tileWidth-1)/2, 0.0,  0.49 - (tileHeight+3)/2], color: [0.8, 0.8, 0.8], normal: [0.0, 1.0, 0.0] },
];

const baseTileIndices: TriangleIndices[] = [
    [0, 2, 3], 
    [0, 3, 1],
];

const tileVertices: Vertex[] = [];
const tileIndices: TriangleIndices[] = [];
let index = 0;
for(let i = 0; i < tileWidth; i++) { //width
    for(let j = 0; j < tileHeight; j++) { //height
        // Create vertices by mapping over the base vertices
        const newTileVertices: Vertex[] = baseTileVertices.map(baseVertex => ({
            position: [
                baseVertex.position[0] + i,
                baseVertex.position[1],
                baseVertex.position[2] + j
            ] as [number, number, number],
            color: [...baseVertex.color] as [number, number, number],
            normal: [...baseVertex.normal] as [number, number, number]
        }));
        
        // Create indices by mapping over the base indices
        const newTileIndices: TriangleIndices[] = baseTileIndices.map(baseIndex => [
            baseIndex[0] + index * 4,
            baseIndex[1] + index * 4,
            baseIndex[2] + index * 4
        ] as TriangleIndices);
        tileVertices.push(...newTileVertices);
        tileIndices.push(...newTileIndices);
        index++;
    }
}

const playerVertices: Vertex[] = [
    //top
    { position: [-0.1, 1.0, -0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 1.0, 0.0] },
    { position: [0.1, 1.0, -0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [-0.1, 1.0, 0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 1.0, 0.0] },
    { position: [0.1, 1.0, 0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    //x+ side
    { position: [0.1, 1.0, -0.1], color: [0.0, 0.0, 0.8], normal: [1.0, 0.0, 0.0] },
    { position: [0.1, 1.0, 0.1], color: [0.0, 0.0, 0.8], normal: [1.0, 0.0, 0.0] },
    { position: [0.1, 0.0, -0.1], color: [0.0, 0.0, 0.8], normal: [1.0, 0.0, 0.0] },
    { position: [0.1, 0.0, 0.1], color: [0.0, 0.0, 0.8], normal: [1.0, 0.0, 0.0] },
    //x- side
    { position: [-0.1, 1.0, -0.1], color: [0.0, 0.0, 0.8], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.1, 1.0, 0.1], color: [0.0, 0.0, 0.8], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.1, 0.0, -0.1], color: [0.0, 0.0, 0.8], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.1, 0.0, 0.1], color: [0.0, 0.0, 0.8], normal: [-1.0, 0.0, 0.0] },
    //z+ side
    { position: [-0.1, 1.0, 0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 0.0, -1.0] },
    { position: [0.1, 1.0, 0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 0.0, -1.0] },
    { position: [-0.1, 0.0, 0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 0.0, -1.0] },
    { position: [0.1, 0.0, 0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 0.0, -1.0] },
    //z- side
    { position: [-0.1, 1.0, -0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 0.0, -1.0] },
    { position: [0.1, 1.0, -0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 0.0, -1.0] },
    { position: [-0.1, 0.0, -0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 0.0, -1.0] },
    { position: [0.1, 0.0, -0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 0.0, -1.0] },
];

const playerIndices: TriangleIndices[] = [
    [0, 2, 3], [0, 3, 1],      // top
    [4, 5, 7], [4, 7, 6],      // x+ side
    [8, 10, 11], [8, 11, 9],   // x- side
    [12, 14, 15], [12, 15, 13],// z+ side
    [16, 17, 19], [16, 19, 18] // z- side
];


const enemyVertices1: Vertex[] = [
    //top
    { position: [-0.1, 1.0, -0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.1, 1.0, -0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 1.0, 0.0] },
    { position: [-0.1, 1.0, 0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.1, 1.0, 0.1], color: [0.0, 0.0, 0.8], normal: [0.0, 1.0, 0.0] },
    //x+ side
    { position: [0.1, 1.0, -0.1], color: [0.8, 0.0, 0.0], normal: [1.0, 0.0, 0.0] },
    { position: [0.1, 1.0, 0.1], color: [0.8, 0.0, 0.0], normal: [1.0, 0.0, 0.0] },
    { position: [0.1, 0.0, -0.1], color: [0.8, 0.0, 0.0], normal: [1.0, 0.0, 0.0] },
    { position: [0.1, 0.0, 0.1], color: [0.8, 0.0, 0.0], normal: [1.0, 0.0, 0.0] },
    //x- side
    { position: [-0.1, 1.0, -0.1], color: [0.8, 0.0, 0.0], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.1, 1.0, 0.1], color: [0.8, 0.0, 0.0], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.1, 0.0, -0.1], color: [0.8, 0.0, 0.0], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.1, 0.0, 0.1], color: [0.8, 0.0, 0.0], normal: [-1.0, 0.0, 0.0] },
    //z+ side
    { position: [-0.1, 1.0, 0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [0.1, 1.0, 0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [-0.1, 0.0, 0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [0.1, 0.0, 0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 0.0, -1.0] },
    //z- side
    { position: [-0.1, 1.0, -0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [0.1, 1.0, -0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [-0.1, 0.0, -0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [0.1, 0.0, -0.1], color: [0.8, 0.0, 0.0], normal: [0.0, 0.0, -1.0] },
];

const enemyIndices1: TriangleIndices[] = [
    [0, 2, 3], [0, 3, 1],       // top
    [4, 5, 7], [4, 7, 6],       // x+ side
    [8, 10, 11], [8, 11, 9],    // x- side
    [12, 14, 15], [12, 15, 13], // z+ side
    [16, 17, 19], [16, 19, 18], // z- side
];

const healthBarFillingVertices: Vertex[] = [
    { position: [-0.3, 0.02, -0.05], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.3, 0.02, -0.05], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [-0.3, 0.02, 0.05], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.3, 0.02, 0.05], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
];

const healthBarFillingIndices: TriangleIndices[] = [
    [0, 2, 3], [0, 3, 1],
];

const healthBarBackgroundVertices: Vertex[] = [
    { position: [-0.31, 0.01, -0.06], color: [0.0, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.31, 0.01, -0.06], color: [0.0, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [-0.31, 0.01, 0.06], color: [0.0, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.31, 0.01, 0.06], color: [0.0, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
];

const healthBarBackgroundIndices: TriangleIndices[] = [
    [0, 2, 3], [0, 3, 1],
];

export const objectTypeData = new Float32Array([
    //dmg, radius/size, speed, maxhp
    100, 0.1, 3, 100, //enemy1
    200, 0.2, 2, 200, //enemy2
]);

const enemyVertices2: Vertex[] = [
    //top
    { position: [-0.2, 0.8, -0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.2, 0.8, -0.2], color: [0.0, 0.0, 0.8], normal: [0.0, 1.0, 0.0] },
    { position: [-0.2, 0.8, 0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.2, 0.8, 0.2], color: [0.0, 0.0, 0.8], normal: [0.0, 1.0, 0.0] },
    //x+ side
    { position: [0.2, 0.8, -0.2], color: [0.8, 0.4, 0.0], normal: [1.0, 0.0, 0.0] },
    { position: [0.2, 0.8, 0.2], color: [0.8, 0.4, 0.0], normal: [1.0, 0.0, 0.0] },
    { position: [0.2, 0.0, -0.2], color: [0.8, 0.4, 0.0], normal: [1.0, 0.0, 0.0] },
    { position: [0.2, 0.0, 0.2], color: [0.8, 0.4, 0.0], normal: [1.0, 0.0, 0.0] },
    //x- side
    { position: [-0.2, 0.8, -0.2], color: [0.8, 0.4, 0.0], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.2, 0.8, 0.2], color: [0.8, 0.4, 0.0], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.2, 0.0, -0.2], color: [0.8, 0.4, 0.0], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.2, 0.0, 0.2], color: [0.8, 0.4, 0.0], normal: [-1.0, 0.0, 0.0] },
    //z+ side
    { position: [-0.2, 0.8, 0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [0.2, 0.8, 0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [-0.2, 0.0, 0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [0.2, 0.0, 0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
    //z- side
    { position: [-0.2, 0.8, -0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [0.2, 0.8, -0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [-0.2, 0.0, -0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
    { position: [0.2, 0.0, -0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
];

const enemyIndices2: TriangleIndices[] = [
    [0, 2, 3], [0, 3, 1],       // top
    [4, 5, 7], [4, 7, 6],       // x+ side
    [8, 10, 11], [8, 11, 9],    // x- side
    [12, 14, 15], [12, 15, 13], // z+ side
    [16, 17, 19], [16, 19, 18], // z- side
];

const projectileVertices: Vertex[] = [
    { position: [-0.10, 0.5, -0.02], color: [0.4, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.10, 0.5, -0.02], color: [0.4, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [-0.10, 0.5, 0.02], color: [0.4, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.10, 0.5, 0.02], color: [0.4, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
];

const projectileIndices: TriangleIndices[] = [
    [0, 2, 3], [0, 3, 1],
];

const powerupVertices: Vertex[] = [
    //top
    { position: [-0.05, 0.55, -0.05], color: [0.2, 0.8, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.05, 0.55, -0.05], color: [0.0, 0.0, 0.2], normal: [0.0, 1.0, 0.0] },
    { position: [-0.05, 0.55, 0.05], color: [0.2, 0.8, 0.0], normal: [0.0, 1.0, 0.0] },
    { position: [0.05, 0.55, 0.05], color: [0.0, 0.0, 0.2], normal: [0.0, 1.0, 0.0] },
    //x+ side
    { position: [0.05, 0.55, -0.05], color: [0.2, 0.8, 0.2], normal: [1.0, 0.0, 0.0] },
    { position: [0.05, 0.55, 0.05], color: [0.2, 0.8, 0.2], normal: [1.0, 0.0, 0.0] },
    { position: [0.05, 0.45, -0.05], color: [0.2, 0.8, 0.2], normal: [1.0, 0.0, 0.0] },
    { position: [0.05, 0.45, 0.05], color: [0.2, 0.8, 0.2], normal: [1.0, 0.0, 0.0] },
    //x- side
    { position: [-0.05, 0.55, -0.05], color: [0.2, 0.8, 0.2], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.05, 0.55, 0.05], color: [0.2, 0.8, 0.2], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.05, 0.45, -0.05], color: [0.2, 0.8, 0.2], normal: [-1.0, 0.0, 0.0] },
    { position: [-0.05, 0.45, 0.05], color: [0.2, 0.8, 0.2], normal: [-1.0, 0.0, 0.0] },
    //z+ side
    { position: [-0.05, 0.55, 0.05], color: [0.2, 0.8, 0.2], normal: [0.0, 0.0, -1.0] },
    { position: [0.05, 0.55, 0.05], color: [0.2, 0.8, 0.2], normal: [0.0, 0.0, -1.0] },
    { position: [-0.05, 0.45, 0.05], color: [0.2, 0.8, 0.2], normal: [0.0, 0.0, -1.0] },
    { position: [0.05, 0.45, 0.05], color: [0.2, 0.8, 0.2], normal: [0.0, 0.0, -1.0] },
    //z- side
    { position: [-0.05, 0.55, -0.05], color: [0.2, 0.8, 0.2], normal: [0.0, 0.0, -1.0] },
    { position: [0.05, 0.55, -0.05], color: [0.2, 0.8, 0.2], normal: [0.0, 0.0, -1.0] },
    { position: [-0.05, 0.45, -0.05], color: [0.2, 0.8, 0.2], normal: [0.0, 0.0, -1.0] },
    { position: [0.05, 0.45, -0.05], color: [0.2, 0.8, 0.2], normal: [0.0, 0.0, -1.0] },
];

const powerupIndices: TriangleIndices[] = [
    [0, 2, 3], [0, 3, 1],       // top
    [4, 5, 7], [4, 7, 6],       // x+ side
    [8, 10, 11], [8, 11, 9],    // x- side
    [12, 14, 15], [12, 15, 13], // z+ side
    [16, 17, 19], [16, 19, 18], // z- side
];

AddObject(tileVertices, tileIndices, 1, 0);
AddObject(playerVertices, playerIndices, 1, 1);
AddObject(healthBarBackgroundVertices, healthBarBackgroundIndices, 0, 2);
AddObject(healthBarFillingVertices, healthBarFillingIndices, 0, 0);
AddObject(enemyVertices1, enemyIndices1, 0, 0);
AddObject(enemyVertices2, enemyIndices2, 0, 0);
AddObject(projectileVertices, projectileIndices, 0, 0);
AddObject(powerupVertices, powerupIndices, 0, 0);

export const vertexBufferData = new Float32Array(verticesToFloat32Array(vertexBuffer));
export const indexBufferData = new Uint16Array(triangleIndicesToUint16Array(indexBuffer));
export const indirectData = new Uint32Array(indirectToUint32Array(indirect));

export const drawNum = indirect.length