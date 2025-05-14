const maxProjectiles : u32 = 1024u;
const enemyTypeNum: u32 = 2u;
const maxEnemyNum : u32 = 1024u;
const maxPowerUps: u32 = 256u;

const borderWidth : f32 = 28.0;
const borderHeight : f32 = 12.0;
const hashmapWidth : i32 = 32;
const hashmapHeight : i32 = 16;
const maxObjectsInCell : u32 = 8u;
const hashmapTileWidth : f32 = borderWidth/f32(hashmapWidth);
const hashmapTileHeight : f32 = borderHeight/f32(hashmapHeight);

const PI : f32 = 3.14159265359;


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
    pos : vec2<f32>,
    direction : f32,
    lastHitIndex : u32, 
};


struct ProjectileBuffer {
    data : array<ProjectileData, maxProjectiles>,
    penetration : array<u32, maxProjectiles>,
};


struct HashMap {
    count : array<array<u32, hashmapWidth>, hashmapHeight>,
    arr : array<array<array<u32, maxObjectsInCell>, hashmapWidth>, hashmapHeight>,
};

struct Pos {
    current : vec2<f32>,
    next : vec2<f32>,
};

struct Object {
    padding : array<f32, 4>,
    hp : array<f32, maxEnemyNum>,
    index : array<u32, maxEnemyNum>,
    pos : array<Pos, maxEnemyNum>,
};

struct Instance {
    pos : vec2<f32>,
    rot : mat2x2<f32>,
}

struct Instancebuffer {
    arr : array<Instance, 2 + 2 + maxEnemyNum * 3 + maxProjectiles + maxPowerUps>,
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

struct PowerupBuffer {
    vel : array<vec2<f32>, maxPowerUps>,
    pos : array<vec2<f32>, maxPowerUps>,
};

@group(0) @binding(0) var<storage, read_write> projectileData: ProjectileBuffer;
@group(0) @binding(1) var<uniform> uniforms: Uniform;
@group(0) @binding(2) var<storage, read_write> controlBuffer: ControlBuffer;
@group(0) @binding(3) var<storage, read> hashmap: HashMap;
@group(0) @binding(4) var<storage, read_write> objectBuffer: Object;
@group(0) @binding(5) var<storage, read_write> instanceBuffer: Instancebuffer;
@group(0) @binding(6) var<storage, read_write> powerupBuffer: PowerupBuffer;

// Add to the top of your projectiles.wgsl
fn hash1D(p: f32) -> f32 {
  return fract(sin(p * 78.233) * 43758.5453);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    //---------------initialization------------------
    let index : u32 = id.x;
    //---------------read data------------------
    let penetration : u32 = projectileData.penetration[index];
    if(penetration == 0u){return;}
    projectileData.penetration[index] = 0u; //reset penetration
    var data = projectileData.data[index];
    //---------------update data------------------
    let speed : f32 = uniforms.projectile.speed * uniforms.dt;
    data.pos += vec2<f32>(speed * cos(data.direction), speed * -sin(data.direction));

    let playerPos : vec2<f32> = uniforms.playerPos;
    var hashX : i32 = i32((data.pos.x - playerPos.x + borderWidth / 2.0) / hashmapTileWidth);
    var hashY : i32 = i32((data.pos.y - playerPos.y + borderHeight / 2.0) / hashmapTileHeight);

    //check if in bounds
    if(hashX < hashmapWidth && hashY < hashmapHeight && hashX >= 0 && hashY >= 0){
        //move search cell to top left corner of the search area aswell as avoiding out of bounds
        let writeIndex = atomicAdd(&controlBuffer.writeCount.projectile, 1u); //add for drawing
        //---------------write instance------------------
        if(writeIndex < controlBuffer.readCount.projectile){
            var instance : Instance;
            instance.pos = data.pos;
            instance.rot = mat2x2<f32>(cos(data.direction), cos(data.direction + PI / 2.0), sin(data.direction), sin(data.direction + PI / 2.0));
            let instanceIndex : u32 = controlBuffer.instanceIndex.projectile;
            instanceBuffer.arr[instanceIndex + writeIndex] = instance;
        }
        if(hashX != 0){
            hashX -= select(1, 2, hashX == hashmapWidth - 1);
        }
        if(hashY != 0){
            hashY -= select(1, 2, hashY == hashmapHeight - 1);
        }
        //check for hits
        for(var i : i32 = hashY; i < 3 + hashY; i++){
            for(var j : i32 = hashX; j < 3 + hashX; j++){
                for(var k : u32 = 0u; k < hashmap.count[i][j]; k++){
                    let otherIndex : u32 = hashmap.arr[i][j][k];
                    if(otherIndex != data.lastHitIndex){
                        let otherObjectPos : vec2<f32> = objectBuffer.pos[otherIndex].current;
                        let otherObjectType : ObjectType = uniforms.objectType[objectBuffer.index[otherIndex]];
                        let dst : f32 = length(otherObjectPos - data.pos);
                        if(dst < uniforms.projectile.radius + otherObjectType.radius) {
                            //hit
                            let objectHp : f32 = objectBuffer.hp[otherIndex];
                            if(objectHp > 0.0){
                                let newHp : f32 = objectHp - uniforms.projectile.dmg;
                                if(newHp <= 0.0){
                                    if (hash1D(f32(index) + uniforms.dt) < 0.2) {
                                        let powerupIndex = atomicAdd(&controlBuffer.writeCount.powerup, 1u);
                                        if (powerupIndex < maxPowerUps) {
                                            powerupBuffer.pos[powerupIndex] = otherObjectPos;
                                            powerupBuffer.vel[powerupIndex] = vec2<f32>(0.0);
                                        }
                                    }
                                }
                                objectBuffer.hp[otherIndex] = newHp;
                                data.lastHitIndex = otherIndex;
                                projectileData.data[writeIndex] = data;
                                projectileData.penetration[writeIndex] = penetration - 1u;
                                return;
                            }
                        }
                    }
                }
            }
        }
        //no hits
        projectileData.data[writeIndex] = data;
        projectileData.penetration[writeIndex] = penetration;
        return;
    }
}