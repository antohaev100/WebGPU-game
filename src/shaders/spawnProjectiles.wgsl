const maxProjectiles : u32 = 1024;
const enemyTypeNum: u32 = 2u;
const maxEnemyNum : u32 = 1024u;

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

struct ProjectileData {
    pos : vec2<f32>, //pos of projectile
    direction : f32, //direction of projectile
    lastHitIndex : u32, //Needs to be <= 0 to register hit. get set to 0.1 when hit, and then decremented speed*dt each frame
};


struct ProjectileBuffer {
    data : array<ProjectileData, maxProjectiles>,
    penetration : array<u32, maxProjectiles>,
};

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

@group(0) @binding(0) var<storage, read_write> projectileData: ProjectileBuffer;
@group(0) @binding(1) var<uniform> uniforms: Uniform;
@group(0) @binding(2) var<storage, read_write> controlBuffer: ControlBuffer;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    //---------------initialization------------------
    let index : u32 = global_id.x;
    let firecount : u32 = uniforms.projectile.firecount;
    if(index >= firecount) {return;}
    let writeIndex : u32 = atomicAdd(&controlBuffer.writeCount.projectile, 1u);
    if(writeIndex >= maxProjectiles) {return;}
    var writeData : ProjectileData;
    writeData.pos = uniforms.playerPos;
    writeData.direction = atan2(uniforms.playerRot[1][0], uniforms.playerRot[0][0]) + f32(i32(firecount/2u) - i32(index)) * 0.04;
    writeData.lastHitIndex = maxEnemyNum;
    projectileData.data[writeIndex] = writeData;
    projectileData.penetration[writeIndex] = uniforms.projectile.penetration;
}