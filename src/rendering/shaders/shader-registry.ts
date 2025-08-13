import type { ShaderDescriptor } from './shader-manager';

// Import all shader sources
import vertexShaderCode from '../../shaders/vert.wgsl?raw';
import fragmentShaderCode from '../../shaders/frag.wgsl?raw';
import objectMovementShaderCode from '../../shaders/objectMovement.wgsl?raw';
import objectCollisionShaderCode from '../../shaders/objectCollision.wgsl?raw';
import resetHashShaderCode from '../../shaders/resetHash.wgsl?raw';
import spawnEnemyShaderCode from '../../shaders/spawnEnemy.wgsl?raw';
import projectileShaderCode from '../../shaders/projectiles.wgsl?raw';
import spawnProjectileShaderCode from '../../shaders/spawnProjectiles.wgsl?raw';
import preProcessShaderCode from '../../shaders/preProcess.wgsl?raw';
import postProcessShaderCode from '../../shaders/postProcess.wgsl?raw';
import powerupShaderCode from '../../shaders/powerup.wgsl?raw';

export const SHADER_DESCRIPTORS: ShaderDescriptor[] = [
    {
        name: 'vertex',
        source: vertexShaderCode,
        stage: 'vertex'
    },
    {
        name: 'fragment',
        source: fragmentShaderCode,
        stage: 'fragment'
    },
    {
        name: 'objectMovement',
        source: objectMovementShaderCode,
        stage: 'compute'
    },
    {
        name: 'objectCollision',
        source: objectCollisionShaderCode,
        stage: 'compute'
    },
    {
        name: 'resetHash',
        source: resetHashShaderCode,
        stage: 'compute'
    },
    {
        name: 'spawnEnemy',
        source: spawnEnemyShaderCode,
        stage: 'compute'
    },
    {
        name: 'projectile',
        source: projectileShaderCode,
        stage: 'compute'
    },
    {
        name: 'spawnProjectile',
        source: spawnProjectileShaderCode,
        stage: 'compute'
    },
    {
        name: 'preProcess',
        source: preProcessShaderCode,
        stage: 'compute'
    },
    {
        name: 'postProcess',
        source: postProcessShaderCode,
        stage: 'compute'
    },
    {
        name: 'powerup',
        source: powerupShaderCode,
        stage: 'compute'
    }
];

export const ShaderNames = {
    VERTEX: 'vertex',
    FRAGMENT: 'fragment',
    OBJECT_MOVEMENT: 'objectMovement',
    OBJECT_COLLISION: 'objectCollision',
    RESET_HASH: 'resetHash',
    SPAWN_ENEMY: 'spawnEnemy',
    PROJECTILE: 'projectile',
    SPAWN_PROJECTILE: 'spawnProjectile',
    PRE_PROCESS: 'preProcess',
    POST_PROCESS: 'postProcess',
    POWERUP: 'powerup'
} as const;

export type ShaderName = typeof ShaderNames[keyof typeof ShaderNames];
