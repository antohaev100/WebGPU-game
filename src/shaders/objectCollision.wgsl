const enemyTypeNum : u32 = 2u;
const maxEnemyNum : u32 = 1024u;
const playerRadius : f32 = 0.1;

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

struct HashMap {
    count : array<array<u32, hashmapWidth>, hashmapHeight>,
    arr : array<array<array<u32, maxObjectsInCell>, hashmapWidth>, hashmapHeight>,
};


@group(0) @binding(0) var<storage, read_write> objectBuffer: Object;
@group(0) @binding(1) var<uniform> uniforms: Uniform;
@group(0) @binding(2) var<storage, read> hashmap: HashMap;


@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    //---------------initialization------------------
    let index : u32 = id.x;
    //---------------enemy logic------------------
    //---------reading global to registers-------------------
    var objectHp : f32 = objectBuffer.hp[index];
    if(objectHp <= 0) {return;}
    let objectTypeIndex : u32 = objectBuffer.index[index];
    var objectPos : Pos = objectBuffer.pos[index];
    let playerPos : vec2<f32> = uniforms.playerPos;
    let dt : f32 = uniforms.dt;
    //---------------reading objecttype---------------
    let objectType : ObjectType = uniforms.objectType[objectTypeIndex];
    //---------------collision logic---------------
    let pDst : f32 = length(playerPos - objectPos.current);
    if(pDst < playerRadius + objectType.radius) {
        objectHp -= 100 * dt;
        objectBuffer.hp[index] = objectHp;
    }
    var hashX : i32 = i32((objectPos.current.x - playerPos.x + borderWidth / 2.0) / hashmapTileWidth);
    var hashY : i32 = i32((objectPos.current.y - playerPos.y + borderHeight / 2.0) / hashmapTileHeight);
    //check if in bounds
    if(hashX < hashmapWidth && hashY < hashmapHeight && hashX >= 0 && hashY >= 0){
        //move search cell to top left corner of the search area aswell as avoiding out of bounds
        if(hashX != 0){
            hashX -= select(1, 2, hashX == hashmapWidth - 1);
        }
        if(hashY != 0){
            hashY -= select(1, 2, hashY == hashmapHeight - 1);
        }
        //check for collision with other objects in adjacent cells
        for(var i : i32 = hashY; i < 3 + hashY; i++){
            for(var j : i32 = hashX; j < 3 + hashX; j++){
                for(var k : u32 = 0u; k < hashmap.count[i][j]; k++){
                    let otherIndex : u32 = hashmap.arr[i][j][k];
                    if(otherIndex != index){
                        let otherObjectPos : Pos = objectBuffer.pos[otherIndex];
                        let otherObjectType : ObjectType = uniforms.objectType[objectBuffer.index[otherIndex]];
                        let dst : f32 = length(otherObjectPos.current - objectPos.current);
                        if(dst < objectType.radius + otherObjectType.radius) {
                            let relativeDst : vec2<f32> = (objectPos.current - otherObjectPos.current) / 2.0;
                            objectBuffer.pos[index].next = objectPos.next + relativeDst;
                            objectBuffer.pos[otherIndex].next = otherObjectPos.next - relativeDst;
                            return;
                        }
                    }
                }
            }
        }
    }

}