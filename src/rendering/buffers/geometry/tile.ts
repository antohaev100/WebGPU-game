import type { Object3d, } from './geometry-manager';



const tileWidth = 29;
const tileHeight = 13;
export const tile: Object3d = {
    vertices: [],
    indices: []
};
const baseTile: Object3d = {
    vertices: [
        { position: [-0.49 - (tileWidth-1)/2, 0.0, -0.49 - (tileHeight+3)/2], color: [0.8, 0.8, 0.8], normal: [0.0, 1.0, 0.0] },
        { position: [0.49 - (tileWidth-1)/2, 0.0, -0.49 - (tileHeight+3)/2], color: [0.8, 0.8, 0.8], normal: [0.0, 1.0, 0.0] },
        { position: [-0.49 - (tileWidth-1)/2, 0.0,  0.49 - (tileHeight+3)/2], color: [0.8, 0.8, 0.8], normal: [0.0, 1.0, 0.0] },
        { position: [0.49 - (tileWidth-1)/2, 0.0,  0.49 - (tileHeight+3)/2], color: [0.8, 0.8, 0.8], normal: [0.0, 1.0, 0.0] },
    ],
    indices: [
        [0, 2, 3], 
        [0, 3, 1],
    ]
};

let index = 0;
for(let i = 0; i < tileWidth; i++) { //width
    for(let j = 0; j < tileHeight; j++) { //height
        // Create vertices by mapping over the base vertices
        const newTile: Object3d = {
            vertices: baseTile.vertices.map(baseVertex => ({
                position: [
                    baseVertex.position[0] + i,
                    baseVertex.position[1],
                    baseVertex.position[2] + j
                ] as [number, number, number],
                color: [...baseVertex.color] as [number, number, number],
                normal: [...baseVertex.normal] as [number, number, number]
            })),
            indices: baseTile.indices.map(baseIndex => [
                baseIndex[0] + index * 4,
                baseIndex[1] + index * 4,
                baseIndex[2] + index * 4
            ])
        };
        index++;
        // Add the new tile to the main tile object
        tile.vertices.push(...newTile.vertices);
        tile.indices.push(...newTile.indices);
    }
}
