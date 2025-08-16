/// <reference types="@webgpu/types" />

export interface CoreManager {
    device: GPUDevice;
    context: GPUCanvasContext;
    canvas: OffscreenCanvas;
}

export async function createCore(canvas : OffscreenCanvas): Promise<CoreManager | undefined> {
    const coreManager: CoreManager = {
        device: {} as GPUDevice,
        context: {} as GPUCanvasContext,
        canvas: canvas
    };

    if (!navigator.gpu) {
        console.error("WebGPU is not supported in this browser.");
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        console.error("Failed to get GPU adapter.");
        return;
    }

    coreManager.device = await adapter.requestDevice({
        requiredFeatures: ['indirect-first-instance'],
    });
    if (!coreManager.device) {
        console.error("Failed to get GPU device.");
        return;
    }

    if (!coreManager.canvas) {
        console.error("Canvas is not initialized.");
        return;
    }

    coreManager.context = coreManager.canvas.getContext('webgpu') as GPUCanvasContext;
    if (!coreManager.context) {
        console.error("Failed to get WebGPU context on renderthread");
        return;
    }

    return coreManager;
}