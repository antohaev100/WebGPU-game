const enemyTypeNum : u32 = 2u;


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

@group(0) @binding(0) var<storage, read_write> indirectBuffer: IndirectBuffer;
@group(0) @binding(1) var<storage, read_write> controlBuffer: ControlBuffer;

@compute @workgroup_size(1)
fn main() {
    //------------control buffer-----------------------
    let count : NonAtomicCount = controlBuffer.writeCount;
    let controlCount : Count = controlBuffer.readCount;
    indirectBuffer.drawhpFill.count = min(count.hp, controlCount.hp);
    indirectBuffer.drawhpBar.count = min(count.hp, controlCount.hp);
    indirectBuffer.drawObject[0].count = min(count.enemy[0], controlCount.enemy[0]);
    indirectBuffer.drawObject[1].count = min(count.enemy[1], controlCount.enemy[1]);
    indirectBuffer.drawProjectile.count = min(count.projectile, controlCount.projectile);
    indirectBuffer.drawPowerup.count = min(count.powerup, controlCount.powerup);

}