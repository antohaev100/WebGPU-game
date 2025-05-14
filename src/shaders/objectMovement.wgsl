const enemyTypeNum : u32 = 2u;
const maxEnemyNum : u32 = 1024u;
const playerMaxHp : f32 = 100.0;
const maxProjectiles : u32 = 1024u;
const maxPowerUps: u32 = 256u;

const borderWidth : f32 = 28.0;
const borderHeight : f32 = 12.0;
const hashmapWidth : i32 = 32;
const hashmapHeight : i32 = 16;
const maxObjectsInCell : u32 = 8u;
const hashmapTileWidth : f32 = borderWidth/f32(hashmapWidth);
const hashmapTileHeight : f32 = borderHeight/f32(hashmapHeight);

const PI : f32 = 3.14159265359;

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

struct Instance {
    pos : vec2<f32>,
    rot : mat2x2<f32>,
};

struct Instancebuffer {
    arr : array<Instance, 2 + 2 + maxEnemyNum * 3 + maxProjectiles + maxPowerUps>,
};

struct HashMap {
    count : array<array<atomic<u32>, hashmapWidth>, hashmapHeight>,
    arr : array<array<array<u32, maxObjectsInCell>, hashmapWidth>, hashmapHeight>,
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
@group(0) @binding(1) var<storage, read_write> instanceBuffer: Instancebuffer;
@group(0) @binding(2) var<uniform> uniforms: Uniform;
@group(0) @binding(3) var<storage, read_write> controlBuffer: ControlBuffer;
@group(0) @binding(4) var<storage, read_write> hashmap: HashMap;



fn playerinstance() {
    //---------------initialization------------------
    let pos : vec2<f32> = uniforms.playerPos;
    var playerInstance : Instance;
    playerInstance.pos = pos;
    playerInstance.rot = uniforms.playerRot;

    //---------------writing instance------------------
    instanceBuffer.arr[0].pos = round(pos);
    instanceBuffer.arr[1] = playerInstance;
    //---------------hp instances logic-------------------
    let size : f32 = objectBuffer.playerHp / playerMaxHp;
    if (size < 1.0) {
        let hpIndex : u32 = atomicAdd(&controlBuffer.writeCount.hp, 1); //add for drawing
        if(hpIndex < controlBuffer.readCount.hp){
            let instanceIndex : u32 = controlBuffer.instanceIndex.hp;
            var hpFill : Instance;
            var hpBar : Instance;
            hpFill.pos = pos + vec2<f32>(0.0, 0.3);
            hpBar.pos = pos + vec2<f32>((size-1)*0.3, 0.3);
            hpFill.rot = mat2x2<f32>(1.0, 0.0, 0.0, 1.0);
            hpBar.rot = mat2x2<f32>(size, 0.0, 0.0, 1.0);
            instanceBuffer.arr[2 + hpIndex] = hpFill;
            instanceBuffer.arr[instanceIndex + hpIndex] = hpBar;
        }
    }
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    //---------------initialization------------------
    let index : u32 = id.x;
    //---------------prep work for next frame------------------
    if(index == 0u){ //first index
        playerinstance();
    }
    //---------------enemy logic------------------
    //---------reading global to registers-------------------
    var objectHp : f32 = objectBuffer.hp[index];
    if(objectHp <= 0) {return;}
    objectBuffer.hp[index] = 0; //reset hp
    let objectTypeIndex : u32 = objectBuffer.index[index];
    var objectPos : Pos = objectBuffer.pos[index];
    let playerPos : vec2<f32> = uniforms.playerPos;
    let dt : f32 = uniforms.dt;
    var objectInstance : Instance;
        //---------------reading objecttype---------------
    let objectType : ObjectType = uniforms.objectType[objectTypeIndex];
    let pDst : f32 = length(playerPos - objectPos.current);
    {
        //----------------movement------------------
        let direction : vec2<f32> = normalize(playerPos - objectPos.current + vec2<f32>(0.0001, 0.0));
        let angle : f32 = atan2(-direction.y, direction.x);
        objectPos.next += select(direction*objectType.speed * dt, direction * (pDst-20.0), pDst > 20.0);
        let diff = (objectPos.current - objectPos.next);
        objectPos.current = select(objectPos.next, diff * pow(0.001, dt) + objectPos.next, length(diff) > 0.01);
        objectInstance.rot = mat2x2<f32>(cos(angle), cos(angle + PI / 2.0), sin(angle), sin(angle + PI / 2.0));
        objectInstance.pos = objectPos.current;
    }
    //---------------writing object------------------
    let aliveIndex : u32 = atomicAdd(&controlBuffer.writeCount.alive, 1);
    objectBuffer.hp[aliveIndex] = objectHp;
    objectBuffer.index[aliveIndex] = objectTypeIndex;
    objectBuffer.pos[aliveIndex] = objectPos;
    {   //instance logic
        let size = objectHp / objectType.maxhp;
            //---------------hp instances logic-------------------
        if (size < 1.0) {
            let hpIndex : u32 = atomicAdd(&controlBuffer.writeCount.hp, 1); //add for drawing
            if(hpIndex < controlBuffer.readCount.hp){
                let instanceIndex : u32 = controlBuffer.instanceIndex.hp;
                var hpFill : Instance;
                var hpBar : Instance;
                hpFill.pos = objectPos.current + vec2<f32>(0.0, 0.3);
                hpBar.pos = objectPos.current + vec2<f32>((size-1)*0.3, 0.3);
                hpFill.rot = mat2x2<f32>(1.0, 0.0, 0.0, 1.0);
                hpBar.rot = mat2x2<f32>(size, 0.0, 0.0, 1.0);
                instanceBuffer.arr[2 + hpIndex] = hpFill;
                instanceBuffer.arr[instanceIndex + hpIndex] = hpBar;
            }
        }
            //---------------writing instance------------------
        let enemyTypeIndex = atomicAdd(&controlBuffer.writeCount.enemy[objectTypeIndex], 1); //add for drawing
        if(enemyTypeIndex < controlBuffer.readCount.enemy[objectTypeIndex]) {
            let instanceIndex : u32 = controlBuffer.instanceIndex.enemy[objectTypeIndex];
            instanceBuffer.arr[instanceIndex + enemyTypeIndex] = objectInstance;
        }
    }
    //Insert hash
    let hashX : i32 = i32((objectPos.current.x - playerPos.x + borderWidth / 2.0) / hashmapTileWidth);
    let hashY : i32 = i32((objectPos.current.y - playerPos.y + borderHeight / 2.0) / hashmapTileHeight);
    if(hashX < hashmapWidth && hashY < hashmapHeight && hashX >= 0 && hashY >= 0){
        let hashIndex = atomicAdd(&hashmap.count[hashY][hashX], 1);
        if(hashIndex < maxObjectsInCell) {
            hashmap.arr[hashY][hashX][hashIndex] = aliveIndex;
        }
    }
}