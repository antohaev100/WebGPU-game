const maxPowerUps: u32 = 256u;
const enemyTypeNum : u32 = 2u;
const playerRadius : f32 = 0.1;
const despawnDistance : f32 = 40.0;
const magneticRadius : f32 = 3.0;
const maxEnemyNum : u32 = 1024u;
const maxProjectiles : u32 = 1024u;
const powerupSpeed : f32 = 20.0;
const powerupSlowdown : f32 = 0.3;

struct AtomicCount {
    alive : atomic<u32>,
    hp : atomic<u32>,
    enemy : array<atomic<u32>, enemyTypeNum>,
    projectile : atomic<u32>,
    powerup : atomic<u32>,
};

struct Count {
    hp : u32,
    enemy : array<u32, enemyTypeNum>,
    projectile : u32,
    powerup : u32,
};

struct ControlBuffer {
    writeCount : AtomicCount,
    readCount : Count,
    instanceIndex : Count,
};

struct Instance {
    pos : vec2<f32>,
    rot : mat2x2<f32>,
};

struct Instancebuffer {
    arr : array<Instance, 2 + 2 + maxEnemyNum * 3 + maxProjectiles + maxPowerUps>,
};

struct ObjectType {
    dmg : f32,
    radius : f32,
    speed : f32,
    maxhp : f32,
};

struct ProjectileUniform {
    firecount : u32, //number of projectiles to fire
    penetration : u32, //number of enemies projectile can hit before being destroyed
    dmg : f32, //damage of projectile
    speed : f32, //speed of projectile
    radius : f32, //radius of projectile
    padding1 : f32,
    padding2 : f32,
    padding3 : f32,
};

struct Uniform {
    playerRot : mat2x2<f32>,
    playerPos: vec2<f32>,
    dt : f32,
    padding : u32,
    objectType : array<ObjectType, enemyTypeNum>,
    projectile : ProjectileUniform,
};

struct PowerupBuffer {
    vel : array<vec2<f32>, maxPowerUps>,
    pos : array<vec2<f32>, maxPowerUps>,
};

struct GPUWriteBuffer {
    powerup : atomic<u32>,
    padding : array<u32, 3>,
};

@group(0) @binding(0) var<storage, read_write> powerupBuffer: PowerupBuffer;
@group(0) @binding(1) var<storage, read_write> instanceBuffer: Instancebuffer;
@group(0) @binding(2) var<uniform> uniforms: Uniform;
@group(0) @binding(3) var<storage, read_write> controlBuffer: ControlBuffer;
@group(0) @binding(4) var<storage, read_write> gpuWriteBuffer: GPUWriteBuffer;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    //---------------initialization------------------
    let index : u32 = id.x;
    var pos : vec2<f32> = powerupBuffer.pos[index];
    if(pos.x == 0.0 && pos.y == 0.0) {return;}
    powerupBuffer.pos[index] = vec2<f32>(0.0, 0.0);
    let playerPos : vec2<f32> = uniforms.playerPos;
    let toPlayer = playerPos - pos;
    let dst = length(toPlayer);
    if(dst < playerRadius*2.0) {
        atomicAdd(&gpuWriteBuffer.powerup, 1u);
    } else if(dst < despawnDistance) {
        let dt : f32 = uniforms.dt;
        var vel : vec2<f32> = powerupBuffer.vel[index];
        vel -= vel * powerupSlowdown * dt;
        if(dst < magneticRadius){
            vel += toPlayer / dst * 1/dst * dt * powerupSpeed;
        }
        pos += vel * dt;
        let writeIndex : u32 = atomicAdd(&controlBuffer.writeCount.powerup, 1u);
        powerupBuffer.vel[writeIndex] = vel;
        powerupBuffer.pos[writeIndex] = pos;
        if(writeIndex < controlBuffer.readCount.powerup){
            var instance : Instance;
            instance.pos = pos;
            // With this calculation:
            let angle = atan2(vel.y, vel.x);
            instance.rot = mat2x2<f32>(
                cos(angle), sin(angle),
                -sin(angle), cos(angle)
            );
            let instanceIndex : u32 = controlBuffer.instanceIndex.powerup;
            instanceBuffer.arr[instanceIndex + writeIndex] = instance;
        }
    }
}