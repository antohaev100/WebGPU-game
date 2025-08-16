/// <reference types="@webgpu/types" />

export interface TextureManager {
   msaaTextureView: GPUTextureView;
   depthTextureView: GPUTextureView;
}

export function createTextures(device: GPUDevice, canvas: OffscreenCanvas) : TextureManager {
    const textureManager: TextureManager = {
        msaaTextureView: {} as GPUTextureView,
        depthTextureView: {} as GPUTextureView,
    }
    let depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: 'depth24plus',
        sampleCount: 4,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    textureManager.depthTextureView = depthTexture.createView();
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    let msaaTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        sampleCount: 4, // Enable 4x MSAA
        format: presentationFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    textureManager.msaaTextureView = msaaTexture.createView();

    return textureManager;
}
