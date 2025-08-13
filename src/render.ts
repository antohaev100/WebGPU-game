/// <reference types="@webgpu/types" />
/// <reference lib="webworker" />

import { GameStateManager, PowerupEffect } from './game/game-state';
let gameState: GameStateManager;
import { ShaderManager } from './rendering/shaders/shader-manager';
import { SHADER_DESCRIPTORS } from './rendering/shaders/shader-registry';
const shaderManager = ShaderManager.getInstance();
//import vertexShaderCode from './shaders/vert.wgsl?raw';
//import fragmentShaderCode from './shaders/frag.wgsl?raw';
//import objectMovementShaderCode from './shaders/objectMovement.wgsl?raw';
//import objectCollisionShaderCode from './shaders/objectCollision.wgsl?raw';
//import resetHashShaderCode from './shaders/resetHash.wgsl?raw';
//import spawnEnemyShaderCode from './shaders/spawnEnemy.wgsl?raw';
//import projectileShaderCode from './shaders/projectiles.wgsl?raw';
//import spawnProjectileShaderCode from './shaders/spawnProjectiles.wgsl?raw';
//import preProcessShaderCode from './shaders/preProcess.wgsl?raw';
//import postProcessShaderCode from './shaders/postProcess.wgsl?raw';
//import powerupShaderCode from './shaders/powerup.wgsl?raw';
import { 
    objectTypeData, indirectData, vertexBufferData, indexBufferData,
} from './geometry';
const enemyTypeNum = objectTypeData.length / 4;
const drawNum = indirectData.length / 5;
const maxEnemyNum = 1024;
const maxProjectileNum = 1024;
const maxPowerupNum = 256;
const FIF = 2; //frames in flight

let device: GPUDevice;
let context: GPUCanvasContext;
let canvas: OffscreenCanvas;

let renderPipeline: GPURenderPipeline;
let objectMovementPipeline: GPUComputePipeline;
let objectCollisionPipeline: GPUComputePipeline;
let resetHashPipeline: GPUComputePipeline;
let spawnEnemyPipeline: GPUComputePipeline;
let projectilePipeline: GPUComputePipeline;
let spawnProjectilePipeline: GPUComputePipeline;
let preProcessPipeline: GPUComputePipeline;
let postProcessPipeline: GPUComputePipeline;
let powerupPipeline: GPUComputePipeline;

let preProcessBindGroup: GPUBindGroup[] = new Array(FIF);
let postProcessBindGroup: GPUBindGroup[] = new Array(FIF);
let renderBindGroup: GPUBindGroup[] = new Array(FIF);
let objectBindGroup: GPUBindGroup[] = new Array(FIF);
let projectileBindGroup: GPUBindGroup[] = new Array(FIF);
let powerupBindGroup: GPUBindGroup[] = new Array(FIF);
let objectCollisionBindGroup: GPUBindGroup;
let resetHashBindGroup: GPUBindGroup;
let spawnEnemyBindGroup: GPUBindGroup;
let spawnProjectileBindGroup: GPUBindGroup;

let vertexBuffer: GPUBuffer;
let indexBuffer: GPUBuffer;

let VPBuffer: GPUBuffer[] = new Array(FIF); //view projection buffer
let cpuWriteBuffer: GPUBuffer;
let gpuWriteBuffer: GPUBuffer;
let cpuReadBuffer: GPUBuffer;

let objectBuffer: GPUBuffer;
let addEnemyBuffer: GPUBuffer;
let hashMapBuffer: GPUBuffer;
let uniformBuffer: GPUBuffer;
let indirectBuffer: GPUBuffer[] = new Array(FIF);
let instanceBuffer: GPUBuffer[] = new Array(FIF);
let projectileBuffer: GPUBuffer;
let controlBuffer: GPUBuffer;
let powerupBuffer: GPUBuffer;

//let imageBitmap: ImageBitmap[] = new Array(FIF);

let msaaTexture: GPUTexture;
let msaaTextureView: GPUTextureView;
let depthTexture: GPUTexture;
let depthTextureView: GPUTextureView;

let cf = 0; //current frame
let nf = 1; //next frame
let spawnEnemies1 : boolean = false;
let spawnNum = 0;
const maxSpawnNum = 64;
let spawnProjectile : boolean = false;

let fireRate = 250; // 500ms
let damage = 50;
let fireCount = 3;
let penetration = 3;



function createBuffers() { 
    cpuReadBuffer = device.createBuffer({
        size: 4 * 4, // 4 int
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    const mappedReadData = cpuReadBuffer.getMappedRange();
    const mappedReadDataUint = new Uint32Array(mappedReadData);
    mappedReadDataUint.fill(0);
    cpuReadBuffer.unmap();
    gpuWriteBuffer = device.createBuffer({
        size: 4 * 4, // 4 int
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    powerupBuffer = device.createBuffer({
        size: (maxPowerupNum * (2+2)) * 4, //
        usage: GPUBufferUsage.STORAGE,
        mappedAtCreation: true,
    });
    const mappedPowerupData = powerupBuffer.getMappedRange();
    const mappedPowerupDataFloat = new Float32Array(mappedPowerupData);
    mappedPowerupDataFloat.fill(0);
    powerupBuffer.unmap();

    controlBuffer = device.createBuffer({
        size: 64, // 4x4 matrix
        usage: GPUBufferUsage.STORAGE,
        mappedAtCreation: true,
    });
    const mappedControlData = controlBuffer.getMappedRange();
    const mappedControlDataUint = new Uint32Array(mappedControlData);
    mappedControlDataUint.fill(0);
    controlBuffer.unmap();


    projectileBuffer = device.createBuffer({
        size: (maxProjectileNum * (1+4)) * 4, //
        usage: GPUBufferUsage.STORAGE, 
        mappedAtCreation: true,
    });
    const mappedProjectileData = projectileBuffer.getMappedRange();
    const mappedProjectileDataUint = new Uint32Array(mappedProjectileData);
    mappedProjectileDataUint.set([0, 0, 0], 1);
    mappedProjectileDataUint.fill(0, 4 + maxProjectileNum *4);
    projectileBuffer.unmap();


    addEnemyBuffer = device.createBuffer({
        size: (4) * (maxSpawnNum + 1) * 4, //
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    hashMapBuffer = device.createBuffer({
        size: (32 * 16 * (8 + 1)) * 4,
        usage: GPUBufferUsage.STORAGE,
    });

    cpuWriteBuffer = device.createBuffer({
        size: (23 + (maxSpawnNum+1)*4) * 4, // 32 32bit numbers
        usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
    });

    for(let i = 0; i < FIF; i++) {
        VPBuffer[i] = device.createBuffer({
            size: 4 * 4 * 4, // 4x4 matrix
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    const indirectDispatchData = new Uint32Array([
        1, 1, 1,
        0, 1, 1,
        0, 1, 1,
    ]);

    for(let i = 0; i < FIF; i++) {
        indirectBuffer[i] = device.createBuffer({
            size: indirectData.byteLength + indirectDispatchData.byteLength,
            usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.STORAGE,
            mappedAtCreation: true,
        });
        const mappedIndirectData = new Uint32Array(indirectBuffer[i].getMappedRange());
        mappedIndirectData.set(indirectData, 0);
        mappedIndirectData.set(indirectDispatchData, indirectData.length);
        indirectBuffer[i].unmap();
    }

    const playerStarterHp = new Float32Array([
        80,
    ]);
    
    objectBuffer = device.createBuffer({
        size: (4 + maxEnemyNum * (1+1+4)) * 4, //
        usage: GPUBufferUsage.STORAGE,
        mappedAtCreation: true,
    });
    const mappedRange = objectBuffer.getMappedRange();
    const mappedObjectDataFloat = new Float32Array(mappedRange);
    mappedObjectDataFloat.fill(0);
    mappedObjectDataFloat.set(playerStarterHp, 0);
    objectBuffer.unmap();
    
    const tileInstanceRotData = new Float32Array([1,0,0,1]);
    const tilePosData = new Float32Array([7,7]);
    //tilepos + player(obj,hpf,hpb)
    const instanceSize = (2 + (maxEnemyNum+1) * 2 + maxEnemyNum * enemyTypeNum + maxProjectileNum) * 6 * 4 + 672;
    for(let i = 0; i < FIF; i++) {
        instanceBuffer[i] = device.createBuffer({
            size: instanceSize, //vec2 *3
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const mappedInstanceData = new Float32Array(instanceBuffer[i].getMappedRange());
        mappedInstanceData.fill(0);
        mappedInstanceData.set(tilePosData, 0);
        mappedInstanceData.set(tileInstanceRotData, 2);
        instanceBuffer[i].unmap();
    }

    vertexBuffer = device.createBuffer({
        size: vertexBufferData.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    const mappedVertexData = new Float32Array(vertexBuffer.getMappedRange());
    mappedVertexData.set(vertexBufferData, 0);
    vertexBuffer.unmap();

    indexBuffer = device.createBuffer({
        size: indexBufferData.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true,
    });
    const mappedIndexData = new Uint16Array(indexBuffer.getMappedRange());
    mappedIndexData.set(indexBufferData, 0);
    indexBuffer.unmap();

    uniformBuffer = device.createBuffer({
        size: 8 * 4 + objectTypeData.byteLength + 8 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    const mappedUniformData = uniformBuffer.getMappedRange();
    const mappedUniformDataFloat = new Float32Array(mappedUniformData);
    const mappedUniformDataUint = new Uint32Array(mappedUniformData);
    mappedUniformDataFloat.set(objectTypeData, 8);
    mappedUniformDataUint.set([fireCount, penetration],8 + objectTypeData.length);
    mappedUniformDataFloat.set([damage, 20, 0.04], 8 + objectTypeData.length + 2);
    uniformBuffer.unmap();
}

function createPipelines() {
    // ---------------------------POWERUP PIPELINE--------------------------------
    const powerupBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {   // powerup buffer
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // instance buffer
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // uniform buffer
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'uniform',
                },
            },
            {   // control buffer
                binding: 3,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // gpu write buffer
                binding: 4,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
        ],
    });
    for(let i = 0; i < FIF; i++) {
        powerupBindGroup[i] = device.createBindGroup({
            layout: powerupBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: powerupBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: {
                        buffer: instanceBuffer[i],
                    },
                },
                {
                    binding: 2,
                    resource: {
                        buffer: uniformBuffer,
                    },
                },
                {
                    binding: 3,
                    resource: {
                        buffer: controlBuffer,
                    },
                },
                {
                    binding: 4,
                    resource: {
                        buffer: gpuWriteBuffer,
                    },
                },
            ],
        });
    }
    powerupPipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [powerupBindGroupLayout],
        }),
        compute: {
            module: shaderManager.getShaderModule('powerup'),
            entryPoint: 'main',
        },
    });
    
    //---------------------------POSTPROCESS PIPELINE--------------------------------
    const postProcessBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {   // indirect buffer
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // control buffer
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
        ],
    });
    for(let i = 0; i < FIF; i++) {
        postProcessBindGroup[i] = device.createBindGroup({
            layout: postProcessBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: indirectBuffer[i],
                    },
                },
                {
                    binding: 1,
                    resource: {
                        buffer: controlBuffer,
                    },
                },
            ],
        });
    }
    postProcessPipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [postProcessBindGroupLayout],
        }),
        compute: {
            module: shaderManager.getShaderModule('postProcess'),
            entryPoint: 'main',
        },
    });
    // ---------------------------PREPROCESS PIPELINE--------------------------------
    const preProcessBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {   // indirect buffer
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // control buffer
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // gpu write buffer
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
        ],
    });
    for(let i = 0; i < FIF; i++) {
        preProcessBindGroup[i] = device.createBindGroup({
            layout: preProcessBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: indirectBuffer[i],
                    },
                },
                {
                    binding: 1,
                    resource: {
                        buffer: controlBuffer,
                    },
                },
                {
                    binding: 2,
                    resource: {
                        buffer: gpuWriteBuffer,
                    },
                },
            ],
        });
    }
    preProcessPipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [preProcessBindGroupLayout],
        }),
        compute: {
            module: shaderManager.getShaderModule('preProcess'),
            entryPoint: 'main',
        },
    });

    // ---------------------------SPAWN PROJECTILE PIPELINE--------------------------------
    const spawnProjectileBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {   // projectile buffer
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // uniform buffer
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'uniform',
                },
            },
            {   // control buffer
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
        ],
    });
    spawnProjectileBindGroup = device.createBindGroup({
        layout: spawnProjectileBindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: projectileBuffer,
                },
            },
            {
                binding: 1,
                resource: {
                    buffer: uniformBuffer,
                },
            },
            {
                binding: 2,
                resource: {
                    buffer: controlBuffer,
                },
            },
        ],
    });
    spawnProjectilePipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [spawnProjectileBindGroupLayout],
        }),
        compute: {
            module: shaderManager.getShaderModule('spawnProjectile'),
            entryPoint: 'main',
        },
    });

    // ---------------------------PROJECTILE PIPELINE--------------------------------
    const projectileBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {   // projectile buffer
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // uniform buffer
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'uniform',
                },
            },
            {   // control buffer
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // hashmap buffer
                binding: 3,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'read-only-storage',
                },
            },
            {   // object buffer
                binding: 4,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // instance buffer
                binding: 5,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // powerup buffer
                binding: 6,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            }
        ],
    });
    for(let i = 0; i < FIF; i++) {
        projectileBindGroup[i] = device.createBindGroup({
            layout: projectileBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: projectileBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: {
                        buffer: uniformBuffer,
                    },
                },
                {
                    binding: 2,
                    resource: {
                        buffer: controlBuffer,
                    },
                },
                {
                    binding: 3,
                    resource: {
                        buffer: hashMapBuffer,
                    },
                },
                {
                    binding: 4,
                    resource: {
                        buffer: objectBuffer,
                    },
                },
                {
                    binding: 5,
                    resource: {
                        buffer: instanceBuffer[i],
                    },
                },
                {
                    binding: 6,
                    resource: {
                        buffer: powerupBuffer,
                    },
                },
            ],
        });
    }
    projectilePipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [projectileBindGroupLayout],
        }),
        compute: {
            module: shaderManager.getShaderModule('projectile'),
            entryPoint: 'main',
        },
    });
    // ---------------------------SPAWN ENEMY PIPELINE--------------------------------
    const spawnEnemyBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {   // object buffer
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // add enemy buffer
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'uniform',
                },
            },
            {   // control buffer
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
        ],
    });
    spawnEnemyBindGroup = device.createBindGroup({
        layout: spawnEnemyBindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: objectBuffer,
                },
            },
            {
                binding: 1,
                resource: {
                    buffer: addEnemyBuffer,
                },
            },
            {
                binding: 2,
                resource: {
                    buffer: controlBuffer,
                },
            },
        ],
    });
    
    spawnEnemyPipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [spawnEnemyBindGroupLayout],
        }),
        compute: {
            module: shaderManager.getShaderModule('spawnEnemy'),
            entryPoint: 'main',
        },
    });
    // ---------------------------RESET HASH PIPELINE--------------------------------
    const resetHashBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {   // hashmap buffer
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
        ],
    });
    resetHashBindGroup = device.createBindGroup({
        layout: resetHashBindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: hashMapBuffer,
                    size: 2048,
                },
            },
        ],
    });
    resetHashPipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [resetHashBindGroupLayout],
        }),
        compute: {
            module: shaderManager.getShaderModule('resetHash'),
            entryPoint: 'main',
        },
    });
    // ---------------------------OBJECT COLLISION PIPELINE--------------------------------
    const objectCollisionBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {   // object buffer
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // uniform buffer
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'uniform',
                },
            },
            {   // hashmap buffer
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'read-only-storage',
                },
            },
        ],
    });
    objectCollisionBindGroup = device.createBindGroup({
        layout: objectCollisionBindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: objectBuffer,
                },
            },
            {
                binding: 1,
                resource: {
                    buffer: uniformBuffer,
                },
            },
            {
                binding: 2,
                resource: {
                    buffer: hashMapBuffer,
                },
            },
        ],
    });
    objectCollisionPipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [objectCollisionBindGroupLayout],
        }),
        compute: {
            module: shaderManager.getShaderModule('objectCollision'),
            entryPoint: 'main',
        },
    });

    //---------------------------OBJECT COMPUTE PIPELINE--------------------------------
    const computeObjectBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {   // Object buffer
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // instance buffer
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // uniform buffer
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'uniform',
                },
            },
            {   // control buffer
                binding: 3,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
            {   // hashmap buffer
                binding: 4,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage',
                },
            },
        ],
    });
    for(let i = 0; i < FIF; i++) {
        objectBindGroup[i] = device.createBindGroup({
            layout: computeObjectBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: objectBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: {
                        buffer: instanceBuffer[i],
                    },
                },
                {
                    binding: 2,
                    resource: {
                        buffer: uniformBuffer,
                    },
                },
                {
                    binding: 3,
                    resource: {
                        buffer: controlBuffer,
                    },
                },
                {
                    binding: 4,
                    resource: {
                        buffer: hashMapBuffer,
                    },
                },
            ],
        });
    }

    objectMovementPipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [computeObjectBindGroupLayout],
        }),
        compute: {
            module: shaderManager.getShaderModule('objectMovement'),
            entryPoint: 'main',
        },
    });

    // ---------------------------RENDER PIPELINE--------------------------------
    const renderBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {   // VP buffer
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                },
            },
        ],
    });

    // Create pipeline
    renderPipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [renderBindGroupLayout],
        }),
        vertex: {
            module: shaderManager.getShaderModule('vertex'),
            entryPoint: 'main',
            buffers: [
                {
                    arrayStride: 9 * 4,
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x3', // Position
                        },
                        {
                            shaderLocation: 1,
                            offset: 3 * 4,
                            format: 'float32x3', // Color
                        },
                        {
                            shaderLocation: 2,
                            offset: 6 * 4,
                            format: 'float32x3', // Normal
                        },
                    ],
                },
                {
                    arrayStride: 6 * 4,
                    stepMode: 'instance',
                    attributes: [
                        {
                            shaderLocation: 3,
                            offset: 0,
                            format: 'float32x2', // Model position
                        },
                        {
                            shaderLocation: 4,
                            offset: 2 * 4,
                            format: 'float32x4', // Model rotation
                        },
                    ],
                },
            ],
        },
        fragment: {
            module: shaderManager.getShaderModule('fragment'),
            entryPoint: 'main',
            targets: [
                {
                    format: navigator.gpu.getPreferredCanvasFormat(),
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
            cullMode: 'back',
            frontFace: 'ccw',
        },
        depthStencil: {
            format: 'depth24plus',
            depthWriteEnabled: true,
            depthCompare: 'less',
        },
        multisample: {
            count: 4,
        },
    });

    for(let i = 0; i < FIF; i++) {
        renderBindGroup[i] = device.createBindGroup({
            layout: renderBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: VPBuffer[i],
                    },
                },
            ],
        });
    }
}

function createDepthTexture() {
    depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: 'depth24plus',
        sampleCount: 4,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    depthTextureView = depthTexture.createView();
}

function createMSAATexture() {
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    msaaTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        sampleCount: 4, // Enable 4x MSAA
        format: presentationFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    msaaTextureView = msaaTexture.createView();
}

function resizeCanvas( innerWidth: number, innerHeight: number) {
    //const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device: device,
        format: presentationFormat,
    });
    createMSAATexture();
    createDepthTexture();
}

async function initWebGPU() {
    if (!navigator.gpu) {
        console.error("WebGPU is not supported in this browser.");
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        console.error("Failed to get GPU adapter.");
        return;
    }

    device = await adapter.requestDevice({
        requiredFeatures: ['indirect-first-instance'],
    });
    if (!device) {
        console.error("Failed to get GPU device.");
        return;
    }

    shaderManager.initialize(device);
    shaderManager.registerShaders(SHADER_DESCRIPTORS);

    if (!canvas) {
        console.error("Canvas is not initialized.");
        return;
    }

    context = canvas.getContext('webgpu') as GPUCanvasContext;
    if (!context) {
        console.error("Failed to get WebGPU context on renderthread");
        return;
    }

    resizeCanvas(canvas.width, canvas.height);
    createBuffers();
    createPipelines();

    console.log("WebGPU initialized successfully.");
}



function randomSpawnPosition() {
    let random = Math.random() * 4;
    var pos = new Float32Array(2);
    if(random < 1) {
        pos[0] = 15;
        pos[1] = Math.random() * 30 - 15;
    } else if(random < 2) {
        pos[0] = -15;
        pos[1] = Math.random() * 30 - 15;
    } else if (random < 3) {
        pos[1] = 15;
        pos[0] = Math.random() * 30 - 15;
    } else {
        pos[1] = -15;
        pos[0] = Math.random() * 30 - 15;
    }
    const playerPos : [number, number] = gameState.getPlayerPosition();
    pos[0] += playerPos[0];
    pos[1] += playerPos[1];
    return pos;
}

function generateEnemies(n: number, spawnDataFloatView : Float32Array, spawnDataUintView: Uint32Array) {
    //posx2,nextposx2,rotx4
    spawnDataUintView[23] = n;
    for(let i = 0; i < n; i++) {
        let pos = randomSpawnPosition(); //hp index pos
        let index = i * 4 + 27;
        const type = Math.random() < 0.5 ? 0 : 1;
        const hp = objectTypeData[type * 4 + 3];
        spawnDataFloatView[index] = hp; 
        spawnDataUintView[index + 1] = type;
        spawnDataFloatView[index + 2] = pos[0];
        spawnDataFloatView[index + 3] = pos[1];
    }
}

async function debugGpuBuffer(buffer: GPUBuffer, from : number, to: number) {
    // Create a read buffer if it doesn't exist
  if (!cpuReadBuffer) {
    cpuReadBuffer = device.createBuffer({
      size: (to - from) * 4, // Size in bytes
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
  } else if (cpuReadBuffer.size < (to - from) * 4) {
    cpuReadBuffer.destroy();
    cpuReadBuffer = device.createBuffer({
      size: (to - from) * 4, // Size in bytes
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
  }
    const commandEncoder = device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(
      buffer, // source buffer
      from * 4, // source offset in bytes
      cpuReadBuffer, // destination buffer
      0, // destination offset
      (to - from) * 4 // size in bytes
    );
  
    // Submit the command buffer
    device.queue.submit([commandEncoder.finish()]);
  
    // Map the buffer to read from it
    await cpuReadBuffer.mapAsync(GPUMapMode.READ);
    
    // Read the data
    const mappedRange = cpuReadBuffer.getMappedRange();
    
    // Create appropriate views of the data
    const dataFloat = new Float32Array(mappedRange.slice(0));
    const dataUint = new Uint32Array(mappedRange.slice(0));
    
    // Log both representations of the data
    console.log("Buffer data (float):", dataFloat);
    console.log("Buffer data (uint):", dataUint);
    
    // Unmap when done
    cpuReadBuffer.unmap();
}

function preparePowerupData(effect: number, value : number, mappedRangeWriteUint: Uint32Array, mappedRangeWriteFloat: Float32Array) {
    console.log("effect: " + effect + " value: " + value);

    switch(effect) {
        case PowerupEffect.FireCount:
            fireCount += value;
            //console.log("FireCount increased from " + (fireCount - value) + " to " + fireCount);
            mappedRangeWriteUint[23] = fireCount;
            break;
        case PowerupEffect.Penetration:
            penetration += value;
            //console.log("Penetration increased from " + (penetration - value) + " to " + penetration);
            mappedRangeWriteUint[23] = penetration;
            break;
        case PowerupEffect.Damage:
            damage += value;
            //console.log("Damage increased from " + (damage - value) + " to " + damage);
            mappedRangeWriteFloat[23] = damage;
            break;
        case PowerupEffect.FireRate:
            if(fireRate - value > 50) {
                //console.log("FireRate decreased from " + (fireRate) + " to " + (fireRate - value));
                fireRate -= value;
            } else {
                //console.log("FireRate decreased from " + (fireRate) + " to " + 50);
                fireRate = 50;
            }
            break;
        default:
            break;
    }
}

function applyPowerup(effect: number, commandEncoder: GPUCommandEncoder, ) {
    switch(effect) {
        case PowerupEffect.FireCount:
            commandEncoder.copyBufferToBuffer(cpuWriteBuffer, 92, uniformBuffer, 64, 4);
            break;
        case PowerupEffect.Penetration:
            commandEncoder.copyBufferToBuffer(cpuWriteBuffer, 92, uniformBuffer, 68, 4);
            break;
        case PowerupEffect.Damage:
            commandEncoder.copyBufferToBuffer(cpuWriteBuffer, 92, uniformBuffer, 72, 4);
            break;
        default:
            break;
    }
}

let powerup : boolean = false;

async function updateUniformBuffer(commandEncoder: GPUCommandEncoder) {
    await cpuReadBuffer.mapAsync(GPUMapMode.READ);
    const mappedRangeRead = cpuReadBuffer.getMappedRange();
    const mappedRangeReadUint = new Uint32Array(mappedRangeRead);
    if(mappedRangeReadUint[0] != 0) {
        gameState.incrementPendingPowerupSelection(mappedRangeReadUint[0]);
    }
    cpuReadBuffer.unmap();
    await cpuWriteBuffer.mapAsync(GPUMapMode.WRITE);
    const mappedRangeWrite = cpuWriteBuffer.getMappedRange();
    const mappedRangeWriteFloat = new Float32Array(mappedRangeWrite);
    const mappedRangeWriteUint = new Uint32Array(mappedRangeWrite);
    mappedRangeWriteFloat.set(gameState.getCpuWriteSubArray());
    if(spawnEnemies1) {
        spawnNum = Math.floor(Math.random() * maxSpawnNum) + 1;
        generateEnemies(spawnNum, mappedRangeWriteFloat, mappedRangeWriteUint);
    } else if(gameState.getPowerupControl() == 3) {
        powerup = true;
        preparePowerupData(gameState.getSelectedPowerupEffect(), gameState.getSelectedPowerupValue(), mappedRangeWriteUint, mappedRangeWriteFloat);
    }
    cpuWriteBuffer.unmap();
    commandEncoder.copyBufferToBuffer(gpuWriteBuffer, 0, cpuReadBuffer, 0, 16);
    commandEncoder.copyBufferToBuffer(cpuWriteBuffer, 0, uniformBuffer, 0, 28);
    commandEncoder.copyBufferToBuffer(cpuWriteBuffer, 28, VPBuffer[cf], 0, 64);
    if(spawnEnemies1) {
        commandEncoder.copyBufferToBuffer(cpuWriteBuffer, 92, addEnemyBuffer, 0, (spawnNum+1) * 16);
    } else if(powerup) {
        applyPowerup(gameState.getSelectedPowerupEffect(), commandEncoder);
        powerup = false;
        gameState.setPowerupControl(0);
    }
}

//let debugtick = 0;
async function render() {
    nf = (cf + 1) % 2; //next frame
    // Create a command encoder
    //debugtick++;
    //if(debugtick % 500 == 0) {
    //    await debugGpuBuffer(projectileBuffer,1,4);
    //}
    
    const commandEncoder = device.createCommandEncoder();
    await updateUniformBuffer(commandEncoder);

    if(spawnEnemies1) {
        const spawnEnemyPass = commandEncoder.beginComputePass();
        spawnEnemyPass.setPipeline(spawnEnemyPipeline);
        spawnEnemyPass.setBindGroup(0, spawnEnemyBindGroup);
        spawnEnemyPass.dispatchWorkgroups(1);
        spawnEnemyPass.end();
        spawnEnemies1 = false;
    }

    if(spawnProjectile) {
        const spawnProjectilePass = commandEncoder.beginComputePass();
        spawnProjectilePass.setPipeline(spawnProjectilePipeline);
        spawnProjectilePass.setBindGroup(0, spawnProjectileBindGroup);
        spawnProjectilePass.dispatchWorkgroups(1);
        spawnProjectilePass.end();
        spawnProjectile = false;
    }

    const preProcessPass = commandEncoder.beginComputePass();
    preProcessPass.setPipeline(preProcessPipeline);
    preProcessPass.setBindGroup(0, preProcessBindGroup[cf]);
    preProcessPass.dispatchWorkgroups(1);
    preProcessPass.end();

    const powerupPass = commandEncoder.beginComputePass();
    powerupPass.setPipeline(powerupPipeline);
    powerupPass.setBindGroup(0, powerupBindGroup[cf]);
    powerupPass.dispatchWorkgroupsIndirect(indirectBuffer[cf], 184);
    powerupPass.end();

    const computePassObject = commandEncoder.beginComputePass();
    computePassObject.setPipeline(objectMovementPipeline);
    computePassObject.setBindGroup(0, objectBindGroup[cf]);
    computePassObject.dispatchWorkgroupsIndirect(indirectBuffer[cf], 160);
    computePassObject.end();

    const computePassObjectCollision = commandEncoder.beginComputePass();
    computePassObjectCollision.setPipeline(objectCollisionPipeline);
    computePassObjectCollision.setBindGroup(0, objectCollisionBindGroup);
    computePassObjectCollision.dispatchWorkgroupsIndirect(indirectBuffer[cf], 160);
    computePassObjectCollision.end();

    const computePassProjectile = commandEncoder.beginComputePass();
    computePassProjectile.setPipeline(projectilePipeline);
    computePassProjectile.setBindGroup(0, projectileBindGroup[cf]);
    computePassProjectile.dispatchWorkgroupsIndirect(indirectBuffer[cf], 172);
    computePassProjectile.end();

    const computePassResetHash = commandEncoder.beginComputePass();
    computePassResetHash.setPipeline(resetHashPipeline);
    computePassResetHash.setBindGroup(0, resetHashBindGroup);
    computePassResetHash.dispatchWorkgroups(1);
    computePassResetHash.end();

    const postProcessPass = commandEncoder.beginComputePass();
    postProcessPass.setPipeline(postProcessPipeline);
    postProcessPass.setBindGroup(0, postProcessBindGroup[cf]);
    postProcessPass.dispatchWorkgroups(1);
    postProcessPass.end();

    //render
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
            {
                view: msaaTextureView,
                resolveTarget: textureView,
                clearValue: [0.1, 0.1, 0.1, 1.0],
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
        depthStencilAttachment: {
            view: depthTextureView,
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
        },
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(renderPipeline);
    passEncoder.setBindGroup(0, renderBindGroup[cf]);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.setIndexBuffer(indexBuffer, 'uint16');
    passEncoder.setVertexBuffer(1, instanceBuffer[cf]);
    for (let i = 0; i < drawNum; i++) {
        passEncoder.drawIndexedIndirect(indirectBuffer[cf], i * 20);
    }
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    self.postMessage({ type: 'frameDone'});

    cf = nf;
    requestAnimationFrame(render);
}


self.addEventListener("message", async (event) => {
    if (event.data.type === 'resize') {
        resizeCanvas(event.data.width, event.data.height);
    } else if (event.data.type === 'init') {
        canvas = event.data.canvas;
        gameState = GameStateManager.createFromSharedBuffer(event.data.buffer);
        initWebGPU().then(() => {
            render();
        });
    } 
});

function scheduleNextEnemySpawn() {
    setTimeout(() => {
        spawnEnemies1 = true;
        // Schedule the next spawn with a new random interval
        scheduleNextEnemySpawn();
    }, Math.random() * 2000 + 2000);
}

function scheduleNextProjectileSpawn() {
    setTimeout(() => {
        spawnProjectile = true;
        // Schedule the next spawn with a new random interval
        scheduleNextProjectileSpawn();
    }, fireRate);
}

// Start the first spawn
scheduleNextEnemySpawn();
scheduleNextProjectileSpawn();

