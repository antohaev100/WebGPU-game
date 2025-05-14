const maxEnemyNum : u32 = 1024u;
const maxSpawnNum : u32 = 64u;
const enemyTypeNum : u32 = 2u;

struct Pos {
    current : vec2<f32>,
    next : vec2<f32>,
};

struct Object {
    playerHp : f32,
    padding : array<f32,3>,
    hp : array<f32, maxEnemyNum>,
    index : array<u32, maxEnemyNum>,
    pos : array<Pos, maxEnemyNum>,
};

struct Spawn {
    hp : f32,
    index : u32,
    pos : vec2<f32>,
};

struct SpawnBuffer {
    spawnCount : u32,
    padding1 : u32,
    padding2 : u32,
    padding3 : u32,
    spawn : array<Spawn, maxSpawnNum>,
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


@group(0) @binding(0) var<storage, read_write> objectBuffer: Object;
@group(0) @binding(1) var<uniform> spawnBuffer: SpawnBuffer;
@group(0) @binding(2) var<storage, read_write> controlBuffer: ControlBuffer;


@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let index : u32 = id.x;
    if(index >= spawnBuffer.spawnCount) {return;}
    let writeIndex : u32 = atomicAdd(&controlBuffer.writeCount.alive, 1u);
    if(writeIndex >= maxEnemyNum) {return;}
    let spawn : Spawn = spawnBuffer.spawn[index];
    atomicAdd(&controlBuffer.writeCount.enemy[spawn.index], 1u);
    objectBuffer.hp[writeIndex] = spawn.hp;
    objectBuffer.index[writeIndex] = spawn.index;
    objectBuffer.pos[writeIndex].current = spawn.pos;
    objectBuffer.pos[writeIndex].next = spawn.pos;
}