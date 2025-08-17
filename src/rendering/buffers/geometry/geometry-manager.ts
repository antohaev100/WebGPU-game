import { tile } from './tile';
import { enemy1 } from './enemy1';
import { enemy2 } from './enemy2';
import { healthBarBackground, healthBarFilling } from './healthBar';
import { player } from './player';
import { powerup } from './powerup';
import { projectile } from './projectile';

interface Vertex {
    position: [number, number, number]; //xyz
    color: [number, number, number]; //rgb
    normal: [number, number, number]; //xyz
}
const vertexLength = 9;

type TriangleIndices = [number, number, number];
const triangleIndicesLength = 3;

export interface Object3d {
    vertices: Vertex[];
    indices: TriangleIndices[];
}

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

function AddObject(object: Object3d, startingInstanceCount: number, firstInstanceIndex: number) {
    indirect.push({
        indexCount: object.indices.length * triangleIndicesLength,
        instanceCount: startingInstanceCount,
        firstIndex: oldIndexLength,
        baseVertex: oldVertexLength,
        firstInstance: firstInstanceIndex
    });
    oldVertexLength = vertexBuffer.push(...object.vertices);
    oldIndexLength = indexBuffer.push(...object.indices) * triangleIndicesLength;
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

AddObject(tile, 1, 0);
AddObject(player, 1, 1);
AddObject(healthBarBackground, 0, 2);
AddObject(healthBarFilling, 0, 0);
AddObject(enemy1, 0, 0);
AddObject(enemy2, 0, 0);
AddObject(projectile, 0, 0);
AddObject(powerup, 0, 0);

export const vertexBufferData = new Float32Array(verticesToFloat32Array(vertexBuffer));
export const indexBufferData = new Uint16Array(triangleIndicesToUint16Array(indexBuffer));
export const indirectData = new Uint32Array(indirectToUint32Array(indirect));

export const drawNum = indirect.length;