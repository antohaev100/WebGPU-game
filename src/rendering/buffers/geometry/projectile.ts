import type { Object3d, } from './geometry-manager';

export const projectile: Object3d = {
    vertices: [
        { position: [-0.10, 0.5, -0.02], color: [0.4, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [0.10, 0.5, -0.02], color: [0.4, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [-0.10, 0.5, 0.02], color: [0.4, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
        { position: [0.10, 0.5, 0.02], color: [0.4, 0.4, 0.0], normal: [0.0, 1.0, 0.0] },
    ],
    indices: [
        [0, 2, 3], [0, 3, 1],
    ]
};