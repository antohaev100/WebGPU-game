/// <reference types="@webgpu/types" />

import { GAME_CONSTANTS } from "../../game";
import { type Buffers} from "../buffers";
import { ShaderManager, SHADER_DESCRIPTORS } from "../shaders" 

interface MultiFrameRenderPipelineStruct {
    pipe: GPURenderPipeline;
    bind: GPUBindGroup[];
}

interface ComputePipelineStruct {
    pipe: GPUComputePipeline;
    bind: GPUBindGroup;
}

interface MultiFrameComputePipelineStruct {
    pipe: GPUComputePipeline;
    bind: GPUBindGroup[];
}

export interface PipelineManagerStruct {
    render: MultiFrameRenderPipelineStruct;
    objectMovement: MultiFrameComputePipelineStruct;
    objectCollision: ComputePipelineStruct;
    resetHash: ComputePipelineStruct;
    spawnEnemy: ComputePipelineStruct;
    projectile: MultiFrameComputePipelineStruct;
    spawnProjectile: ComputePipelineStruct;
    preProcess: MultiFrameComputePipelineStruct;
    postProcess: MultiFrameComputePipelineStruct;
    powerup: MultiFrameComputePipelineStruct;
}

export function createPipelines(device: GPUDevice, buffers: Buffers) : PipelineManagerStruct {
    const shaderManager = ShaderManager.getInstance();
    shaderManager.initialize(device);
    shaderManager.registerShaders(SHADER_DESCRIPTORS);

    const pipelineManager: PipelineManagerStruct = {
        render:             { pipe: {} as GPURenderPipeline,    bind: new Array<GPUBindGroup>(GAME_CONSTANTS.FRAMES_IN_FLIGHT)  },
        objectMovement:     { pipe: {} as GPUComputePipeline,   bind: new Array<GPUBindGroup>(GAME_CONSTANTS.FRAMES_IN_FLIGHT)  },
        objectCollision:    { pipe: {} as GPUComputePipeline,   bind: {} as GPUBindGroup                                        },
        resetHash:          { pipe: {} as GPUComputePipeline,   bind: {} as GPUBindGroup                                        },
        spawnEnemy:         { pipe: {} as GPUComputePipeline,   bind: {} as GPUBindGroup                                        },
        projectile:         { pipe: {} as GPUComputePipeline,   bind: new Array<GPUBindGroup>(GAME_CONSTANTS.FRAMES_IN_FLIGHT)  },
        spawnProjectile:    { pipe: {} as GPUComputePipeline,   bind: {} as GPUBindGroup                                        },
        preProcess:         { pipe: {} as GPUComputePipeline,   bind: new Array<GPUBindGroup>(GAME_CONSTANTS.FRAMES_IN_FLIGHT)  },
        postProcess:        { pipe: {} as GPUComputePipeline,   bind: new Array<GPUBindGroup>(GAME_CONSTANTS.FRAMES_IN_FLIGHT)  },
        powerup:            { pipe: {} as GPUComputePipeline,   bind: new Array<GPUBindGroup>(GAME_CONSTANTS.FRAMES_IN_FLIGHT)  }
    };


    const powerupBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, //Powerupp Buffer
            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // instance buffer
            { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }, // uniform buffer
            { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // control buffer
            { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // gpu write buffer
        ],
    });
    const postProcessBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // indirect buffer
            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // control buffer
        ],
    });
    const preProcessBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // indirect buffer
            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // control buffer
            { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // gpu write buffer
        ],
    });
    const spawnProjectileBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },  // projectile buffer
            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }, // uniform buffer
            { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // control buffer
        ],
    });
    const projectileBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage'             } }, // projectile buffer
            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform'             } }, // uniform buffer
            { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage'             } }, // control buffer
            { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage'   } }, // hashmap buffer
            { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage'             } }, // object buffer
            { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage'             } }, // instance buffer
            { binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage'             } }, // powerup buffer
        ],
    });
    const spawnEnemyBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // object buffer
            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }, // add enemy buffer
            { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // control buffer
        ],
    });
    const resetHashBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // hashmap buffer
        ],
    });
    const objectCollisionBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage'             } }, // object buffer
            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform'             } }, // uniform buffer
            { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage'   } }, // hashmap buffer
        ],
    });
    const objectMovementBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // Object buffer
            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // instance buffer
            { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }, // uniform buffer
            { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // control buffer
            { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // hashmap buffer
        ],
    });
    const renderBindGroupLayout = device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // VP buffer
        ],
    });

    for(let i = 0; i < GAME_CONSTANTS.FRAMES_IN_FLIGHT; i++) {
        pipelineManager.powerup.bind[i] = device.createBindGroup({
            layout: powerupBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: buffers.powerup       } },
                { binding: 1, resource: { buffer: buffers.instance[i]   } },
                { binding: 2, resource: { buffer: buffers.uniform       } },
                { binding: 3, resource: { buffer: buffers.control       } },
                { binding: 4, resource: { buffer: buffers.gpuWrite      } }
            ],
        });
        pipelineManager.postProcess.bind[i] = device.createBindGroup({
            layout: postProcessBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: buffers.indirect[i]   } },
                { binding: 1, resource: { buffer: buffers.control       } },
            ],
        });
        pipelineManager.preProcess.bind[i] = device.createBindGroup({
            layout: preProcessBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: buffers.indirect[i]   } },
                { binding: 1, resource: { buffer: buffers.control       } },
                { binding: 2, resource: { buffer: buffers.gpuWrite      } },
            ],
        });
        pipelineManager.projectile.bind[i] = device.createBindGroup({
            layout: projectileBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: buffers.projectile    } },
                { binding: 1, resource: { buffer: buffers.uniform       } },
                { binding: 2, resource: { buffer: buffers.control       } },
                { binding: 3, resource: { buffer: buffers.hashMap       } },
                { binding: 4, resource: { buffer: buffers.object        } },
                { binding: 5, resource: { buffer: buffers.instance[i]   } },
                { binding: 6, resource: { buffer: buffers.powerup       } },
            ],
        });
        pipelineManager.objectMovement.bind[i] = device.createBindGroup({
            layout: objectMovementBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: buffers.object        } },
                { binding: 1, resource: { buffer: buffers.instance[i]   } },
                { binding: 2, resource: { buffer: buffers.uniform       } },
                { binding: 3, resource: { buffer: buffers.control       } },
                { binding: 4, resource: { buffer: buffers.hashMap       } },
            ],
        });
        pipelineManager.render.bind[i] = device.createBindGroup({
            layout: renderBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: buffers.VP[i] } },
            ],
        });
    }

    pipelineManager.spawnProjectile.bind = device.createBindGroup({
        layout: spawnProjectileBindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer: buffers.projectile    } },
            { binding: 1, resource: { buffer: buffers.uniform       } },
            { binding: 2, resource: { buffer: buffers.control       } },
        ],
    });
    pipelineManager.spawnEnemy.bind = device.createBindGroup({
        layout: spawnEnemyBindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer: buffers.object    } },
            { binding: 1, resource: { buffer: buffers.addEnemy  } },
            { binding: 2, resource: { buffer: buffers.control   } },
        ],
    });
    pipelineManager.resetHash.bind = device.createBindGroup({
        layout: resetHashBindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer: buffers.hashMap, size: 2048 } },
        ],
    });
    pipelineManager.objectCollision.bind = device.createBindGroup({
        layout: objectCollisionBindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer: buffers.object } },
            { binding: 1, resource: { buffer: buffers.uniform } },
            { binding: 2, resource: { buffer: buffers.hashMap } },
        ],
    });

    pipelineManager.powerup.pipe = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [powerupBindGroupLayout] }),
        compute: { module: shaderManager.getShaderModule('powerup'), entryPoint: 'main' },
    });

    pipelineManager.postProcess.pipe = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [postProcessBindGroupLayout] }),
        compute: { module: shaderManager.getShaderModule('postProcess'), entryPoint: 'main' },
    });

    pipelineManager.preProcess.pipe = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [preProcessBindGroupLayout] }),
        compute: { module: shaderManager.getShaderModule('preProcess'), entryPoint: 'main' },
    });

    pipelineManager.spawnProjectile.pipe = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [spawnProjectileBindGroupLayout] }),
        compute: { module: shaderManager.getShaderModule('spawnProjectile'), entryPoint: 'main' },
    });

    pipelineManager.projectile.pipe = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [projectileBindGroupLayout] }),
        compute: { module: shaderManager.getShaderModule('projectile'), entryPoint: 'main' },
    });

    pipelineManager.spawnEnemy.pipe = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [spawnEnemyBindGroupLayout] }),
        compute: { module: shaderManager.getShaderModule('spawnEnemy'), entryPoint: 'main' },
    });


    pipelineManager.resetHash.pipe = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [resetHashBindGroupLayout] }),
        compute: { module: shaderManager.getShaderModule('resetHash'), entryPoint: 'main' },
    });


    pipelineManager.objectCollision.pipe = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [objectCollisionBindGroupLayout] }),
        compute: { module: shaderManager.getShaderModule('objectCollision'), entryPoint: 'main' },
    });


    pipelineManager.objectMovement.pipe = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [objectMovementBindGroupLayout] }),
        compute: { module: shaderManager.getShaderModule('objectMovement'), entryPoint: 'main' },
    });


    pipelineManager.render.pipe = device.createRenderPipeline({
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
                        { shaderLocation: 0, offset: 0, format: 'float32x3' }, // Position
                        { shaderLocation: 1, offset: 3 * 4, format: 'float32x3' }, // Color
                        { shaderLocation: 2, offset: 6 * 4, format: 'float32x3' }, // Normal
                    ],
                },
                {
                    arrayStride: 6 * 4,
                    stepMode: 'instance',
                    attributes: [
                        { shaderLocation: 3, offset: 0, format: 'float32x2' }, // Model position
                        { shaderLocation: 4, offset: 2 * 4, format: 'float32x4' }, // Model rotation
                    ],
                },
            ],
        },
        fragment: {
            module: shaderManager.getShaderModule('fragment'),
            entryPoint: 'main',
            targets: [ { format: navigator.gpu.getPreferredCanvasFormat() } ]
        },
        primitive: { topology: 'triangle-list', cullMode: 'back', frontFace: 'ccw' },
        depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' },
        multisample: { count: 4 },
    });

    return pipelineManager;
}