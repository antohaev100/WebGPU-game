import type { Object3d, } from './geometry-manager';

export const enemy2: Object3d = {
    vertices: [
        //top
        { position: [-0.2, 0.8, -0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [0.2, 0.8, -0.2], color: [0.0, 0.0, 0.8], normal: [0.0, 1.0, 0.0] },
        { position: [-0.2, 0.8, 0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [0.2, 0.8, 0.2], color: [0.0, 0.0, 0.8], normal: [0.0, 1.0, 0.0] },
        //x+ side
        { position: [0.2, 0.8, -0.2], color: [0.8, 0.4, 0.0], normal: [1.0, 0.0, 0.0] },
        { position: [0.2, 0.8, 0.2], color: [0.8, 0.4, 0.0], normal: [1.0, 0.0, 0.0] },
        { position: [0.2, 0.0, -0.2], color: [0.8, 0.4, 0.0], normal: [1.0, 0.0, 0.0] },
        { position: [0.2, 0.0, 0.2], color: [0.8, 0.4, 0.0], normal: [1.0, 0.0, 0.0] },
        //x- side
        { position: [-0.2, 0.8, -0.2], color: [0.8, 0.4, 0.0], normal: [-1.0, 0.0, 0.0] },
        { position: [-0.2, 0.8, 0.2], color: [0.8, 0.4, 0.0], normal: [-1.0, 0.0, 0.0] },
        { position: [-0.2, 0.0, -0.2], color: [0.8, 0.4, 0.0], normal: [-1.0, 0.0, 0.0] },
        { position: [-0.2, 0.0, 0.2], color: [0.8, 0.4, 0.0], normal: [-1.0, 0.0, 0.0] },
        //z+ side
        { position: [-0.2, 0.8, 0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
        { position: [0.2, 0.8, 0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
        { position: [-0.2, 0.0, 0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
        { position: [0.2, 0.0, 0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
        //z- side
        { position: [-0.2, 0.8, -0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
        { position: [0.2, 0.8, -0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
        { position: [-0.2, 0.0, -0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
        { position: [0.2, 0.0, -0.2], color: [0.8, 0.4, 0.0], normal: [0.0, 0.0, -1.0] },
    ],
    indices: [
        [0, 2, 3], [0, 3, 1],       // top
        [4, 5, 7], [4, 7, 6],       // x+ side
        [8, 10, 11], [8, 11, 9],    // x- side
        [12, 14, 15], [12, 15, 13], // z+ side
        [16, 17, 19], [16, 19, 18], // z- side
    ]
};