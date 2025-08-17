/// <reference types="@webgpu/types" />

import { indirectData, vertexBufferData, indexBufferData } from './geometry';
import { GAME_CONSTANTS, enemyTypes} from '../../game';
const enemyTypeNum = enemyTypes.length;


export interface Buffers {
    vertex:     GPUBuffer;
    index:      GPUBuffer;
    VP:         GPUBuffer[];
    cpuWrite:   GPUBuffer;
    gpuWrite:   GPUBuffer;
    cpuRead:    GPUBuffer;
    object:     GPUBuffer;
    addEnemy:   GPUBuffer;
    hashMap:    GPUBuffer;
    uniform:    GPUBuffer;
    indirect:   GPUBuffer[];
    instance:   GPUBuffer[];
    projectile: GPUBuffer;
    control:    GPUBuffer;
    powerup:    GPUBuffer;
}

export function createBuffers(device: GPUDevice): Buffers { 
        const buffers: Buffers = {
        vertex:     {} as GPUBuffer,
        index:      {} as GPUBuffer,
        VP:         new Array(GAME_CONSTANTS.FRAMES_IN_FLIGHT),
        cpuWrite:   {} as GPUBuffer,
        gpuWrite:   {} as GPUBuffer,
        cpuRead:    {} as GPUBuffer,
        object:     {} as GPUBuffer,
        addEnemy:   {} as GPUBuffer,
        hashMap:    {} as GPUBuffer,
        uniform:    {} as GPUBuffer,
        indirect:   new Array(GAME_CONSTANTS.FRAMES_IN_FLIGHT),
        instance:   new Array(GAME_CONSTANTS.FRAMES_IN_FLIGHT),
        projectile: {} as GPUBuffer,
        control:    {} as GPUBuffer,
        powerup:    {} as GPUBuffer,
    };
    buffers.cpuRead = device.createBuffer({
        size: 4 * 4, // 4 int
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    new Uint32Array(buffers.cpuRead.getMappedRange()).fill(0);
    buffers.cpuRead.unmap();
    
    buffers.gpuWrite = device.createBuffer({
        size: 4 * 4, // 4 int
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    buffers.powerup = device.createBuffer({
        size: (GAME_CONSTANTS.MAX_POWERUP_NUM * (2+2)) * 4, //
        usage: GPUBufferUsage.STORAGE,
        mappedAtCreation: true,
    });
    const mappedPowerupData = buffers.powerup.getMappedRange();
    const mappedPowerupDataFloat = new Float32Array(mappedPowerupData);
    mappedPowerupDataFloat.fill(0);
    buffers.powerup.unmap();

    buffers.control = device.createBuffer({
        size: 64, // 4x4 matrix
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true,
    });
    const mappedControlData = buffers.control.getMappedRange();
    const mappedControlDataUint = new Uint32Array(mappedControlData);
    mappedControlDataUint.fill(0);
    buffers.control.unmap();


    buffers.projectile = device.createBuffer({
        size: (GAME_CONSTANTS.MAX_PROJECTILE_NUM * (1+4)) * 4, //
        usage: GPUBufferUsage.STORAGE, 
        mappedAtCreation: true,
    });
    const mappedProjectileData = buffers.projectile.getMappedRange();
    const mappedProjectileDataUint = new Uint32Array(mappedProjectileData);
    mappedProjectileDataUint.set([0, 0, 0], 1);
    mappedProjectileDataUint.fill(0, 4 + GAME_CONSTANTS.MAX_PROJECTILE_NUM *4);
    buffers.projectile.unmap();


    buffers.addEnemy = device.createBuffer({
        size: (4) * (GAME_CONSTANTS.MAX_SPAWN_NUM + 1) * 4, //
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    buffers.hashMap = device.createBuffer({
        size: (32 * 16 * (8 + 1)) * 4,
        usage: GPUBufferUsage.STORAGE,
    });

    buffers.cpuWrite = device.createBuffer({
        size: (23 + (GAME_CONSTANTS.MAX_SPAWN_NUM+1)*4) * 4, // 32 32bit numbers
        usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
    });

    for(let i = 0; i < GAME_CONSTANTS.FRAMES_IN_FLIGHT; i++) {
        buffers.VP[i] = device.createBuffer({
            size: 4 * 4 * 4, // 4x4 matrix
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    const indirectDispatchData = new Uint32Array([
        1, 1, 1,
        0, 1, 1,
        0, 1, 1,
    ]);

    for(let i = 0; i < GAME_CONSTANTS.FRAMES_IN_FLIGHT; i++) {
        buffers.indirect[i] = device.createBuffer({
            size: indirectData.byteLength + indirectDispatchData.byteLength,
            usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.STORAGE,
            mappedAtCreation: true,
        });
        const mappedIndirectData = new Uint32Array(buffers.indirect[i].getMappedRange());
        mappedIndirectData.set(indirectData, 0);
        mappedIndirectData.set(indirectDispatchData, indirectData.length);
        buffers.indirect[i].unmap();
    }

    const playerStarterHp = new Float32Array([
        80,
    ]);

    buffers.object = device.createBuffer({
        size: (4 + GAME_CONSTANTS.MAX_ENEMY_NUM * (1+1+4)) * 4, //
        usage: GPUBufferUsage.STORAGE,
        mappedAtCreation: true,
    });
    const mappedRange = buffers.object.getMappedRange();
    const mappedObjectDataFloat = new Float32Array(mappedRange);
    mappedObjectDataFloat.fill(0);
    mappedObjectDataFloat.set(playerStarterHp, 0);
    buffers.object.unmap();

    const tileInstanceRotData = new Float32Array([1,0,0,1]);
    const tilePosData = new Float32Array([7,7]);
    //tilepos + player(obj,hpf,hpb)
    const instanceSize = (2 + (GAME_CONSTANTS.MAX_ENEMY_NUM+1) * 2 + GAME_CONSTANTS.MAX_ENEMY_NUM * enemyTypeNum + GAME_CONSTANTS.MAX_PROJECTILE_NUM) * 6 * 4 + 672;
    for(let i = 0; i < GAME_CONSTANTS.FRAMES_IN_FLIGHT; i++) {
        buffers.instance[i] = device.createBuffer({
            size: instanceSize, //vec2 *3
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const mappedInstanceData = new Float32Array(buffers.instance[i].getMappedRange());
        mappedInstanceData.fill(0);
        mappedInstanceData.set(tilePosData, 0);
        mappedInstanceData.set(tileInstanceRotData, 2);
        buffers.instance[i].unmap();
    }

    buffers.vertex = device.createBuffer({
        size: vertexBufferData.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    const mappedVertexData = new Float32Array(buffers.vertex.getMappedRange());
    mappedVertexData.set(vertexBufferData, 0);
    buffers.vertex.unmap();

    buffers.index = device.createBuffer({
        size: indexBufferData.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true,
    });
    const mappedIndexData = new Uint16Array(buffers.index.getMappedRange());
    mappedIndexData.set(indexBufferData, 0);
    buffers.index.unmap();

    const enemyTypesData = new Float32Array(enemyTypes.length * 4);
    for (let i = 0; i < enemyTypes.length; i++) {
        enemyTypesData.set([
            enemyTypes[i].damage,
            enemyTypes[i].radius,
            enemyTypes[i].speed,
            enemyTypes[i].maxHp,
        ], i * 4);
    }

    buffers.uniform = device.createBuffer({
        size: 8 * 4 + enemyTypesData.byteLength + 8 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    const mappedUniformData = buffers.uniform.getMappedRange();
    const mappedUniformDataFloat = new Float32Array(mappedUniformData);
    const mappedUniformDataUint = new Uint32Array(mappedUniformData);
    mappedUniformDataFloat.set(enemyTypesData, 8);
    mappedUniformDataUint.set([GAME_CONSTANTS.DEFAULT_FIRE_COUNT, GAME_CONSTANTS.DEFAULT_PENETRATION],8 + enemyTypesData.length);
    mappedUniformDataFloat.set([GAME_CONSTANTS.DEFAULT_DAMAGE, 20, 0.04], 8 + enemyTypesData.length + 2);
    buffers.uniform.unmap();
    return buffers;
}