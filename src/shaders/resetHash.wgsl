const hashmapWidth : u32 = 32u;
const hashmapHeight : u32 = 16u;
const indicesPerThread : u32 = 2u;

struct HashMap {
    count : array<array<u32, indicesPerThread>, hashmapWidth * hashmapHeight / indicesPerThread>,
    //arr : array<array<array<u32, maxObjectsInCell>, hashmapWidth>, hashmapHeight>,  (size limit)
};

@group(0) @binding(0) var<storage, read_write> hashmap: HashMap;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    for(var i = 0u; i < indicesPerThread; i = i + 1u) {
        hashmap.count[id.x][i] = 0u;
    }
}