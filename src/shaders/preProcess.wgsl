const enemyTypeNum : u32 = 2u;
const maxEnemyNum : u32 = 1024u;
const maxProjectiles : u32 = 1024u;
const maxPowerUps: u32 = 256u;

struct DispatchCall {
    x: u32, 
    y: u32,
    z: u32,
};

struct DrawCommand {
    pad1: u32,
    count : u32,
    pad2: array<u32,2>,
    first : u32,
};

struct IndirectBuffer {
    draw : array<DrawCommand, 2>,
    drawhpFill : DrawCommand,
    drawhpBar : DrawCommand,
    drawObject : array<DrawCommand, enemyTypeNum>,
    drawProjectile : DrawCommand,
    drawPowerup : DrawCommand,
    dispatchObject : DispatchCall,
    dispatchProjectile : DispatchCall,
    dispatchPowerup : DispatchCall,
};

struct NonAtomicCount {
    alive : u32,
    hp : u32,
    enemy : array<u32, enemyTypeNum>,
    projectile : u32,
    powerup : u32,
};

struct Count {
    hp : u32,
    enemy : array<u32, enemyTypeNum>,
    projectile : u32,
    powerup : u32,
};

struct ControlBuffer {
    writeCount : NonAtomicCount,
    readCount : Count,
    instanceIndex : Count,
};

struct GPUWriteBuffer {
    powerup : u32,
    padding : array<u32, 3>,
};

@group(0) @binding(0) var<storage, read_write> indirectBuffer: IndirectBuffer;
@group(0) @binding(1) var<storage, read_write> controlBuffer: ControlBuffer;
@group(0) @binding(2) var<storage, read_write> gpuWriteBuffer: GPUWriteBuffer;

@compute @workgroup_size(1)
fn main() {
    gpuWriteBuffer.powerup = 0u;
    //------------control buffer-----------------------
    var count : NonAtomicCount = controlBuffer.writeCount;
    count.alive = min(count.alive, maxEnemyNum);
    count.projectile = min(count.projectile, maxProjectiles);
    count.powerup = min(count.powerup, maxPowerUps);
    controlBuffer.writeCount.alive = 0u;
    controlBuffer.writeCount.hp = 0u;
    controlBuffer.writeCount.enemy[0] = 0u;
    controlBuffer.writeCount.enemy[1] = 0u;
    controlBuffer.writeCount.projectile = 0u;
    controlBuffer.writeCount.powerup = 0u;
    controlBuffer.readCount.hp = count.hp;
    controlBuffer.readCount.enemy[0] = count.enemy[0];
    controlBuffer.readCount.enemy[1] = count.enemy[1];
    controlBuffer.readCount.projectile = count.projectile;
    controlBuffer.readCount.powerup = count.powerup;
    var firstInstanceIndex : u32 = 2u + count.hp; // 2 for tile and player
    controlBuffer.instanceIndex.hp = firstInstanceIndex;
    indirectBuffer.drawhpBar.first = firstInstanceIndex;
    firstInstanceIndex += count.hp;
    controlBuffer.instanceIndex.enemy[0] = firstInstanceIndex;
    indirectBuffer.drawObject[0].first = firstInstanceIndex;
    firstInstanceIndex += count.enemy[0];
    controlBuffer.instanceIndex.enemy[1] = firstInstanceIndex;
    indirectBuffer.drawObject[1].first = firstInstanceIndex;
    firstInstanceIndex += count.enemy[1];
    controlBuffer.instanceIndex.projectile = firstInstanceIndex;
    indirectBuffer.drawProjectile.first = firstInstanceIndex;
    firstInstanceIndex += count.projectile;
    controlBuffer.instanceIndex.powerup = firstInstanceIndex;
    indirectBuffer.drawPowerup.first = firstInstanceIndex;

    //------------indirect buffer-----------------------
    indirectBuffer.dispatchObject.x = max(u32(ceil(f32(count.alive) / 64.0)), 1u);
    indirectBuffer.dispatchProjectile.x = u32(ceil(f32(count.projectile) / 64.0));
    indirectBuffer.dispatchPowerup.x = u32(ceil(f32(count.powerup) / 64.0));

}