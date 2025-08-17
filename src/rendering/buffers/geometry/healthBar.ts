import type { Object3d, } from './geometry-manager';


export const healthBarFilling: Object3d = {
    vertices: [
        { position: [-0.3, 0.02, -0.05], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [0.3, 0.02, -0.05], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [-0.3, 0.02, 0.05], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [0.3, 0.02, 0.05], color: [0.8, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    ],
    indices: [
        [0, 2, 3], [0, 3, 1],
    ]
};

export const healthBarBackground: Object3d = {
    vertices: [
        { position: [-0.31, 0.01, -0.06], color: [0.0, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [0.31, 0.01, -0.06], color: [0.0, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [-0.31, 0.01, 0.06], color: [0.0, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [0.31, 0.01, 0.06], color: [0.0, 0.0, 0.0], normal: [0.0, 1.0, 0.0] },
    ],
    indices: [
        [0, 2, 3], [0, 3, 1],
    ]
};