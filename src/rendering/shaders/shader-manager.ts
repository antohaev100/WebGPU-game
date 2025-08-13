/// <reference types="@webgpu/types" />

export interface ShaderDescriptor {
    name: string;
    source: string;
    stage: 'vertex' | 'fragment' | 'compute';
}

export class ShaderManager {
    private static instance: ShaderManager;
    private device: GPUDevice | null = null;
    private shaderModules = new Map<string, GPUShaderModule>();
    private shaderSources = new Map<string, string>();

    private constructor() {}

    static getInstance(): ShaderManager {
        if (!ShaderManager.instance) {
            ShaderManager.instance = new ShaderManager();
        }
        return ShaderManager.instance;
    }

    initialize(device: GPUDevice) {
        this.device = device;
    }

    registerShader(descriptor: ShaderDescriptor): void {
        this.shaderSources.set(descriptor.name, descriptor.source);
    }

    registerShaders(descriptors: ShaderDescriptor[]): void {
        descriptors.forEach(descriptor => this.registerShader(descriptor));
    }

    getShaderModule(name: string): GPUShaderModule {
        if (!this.device) {
            throw new Error("ShaderManager not initialized. Call initialize() first.");
        }

        // Return cached module if it exists
        if (this.shaderModules.has(name)) {
            return this.shaderModules.get(name)!;
        }

        // Get shader source
        const source = this.shaderSources.get(name);
        if (!source) {
            throw new Error(`Shader '${name}' not found. Make sure to register it first.`);
        }

        // Create and cache shader module
        try {
            const module = this.device.createShaderModule({
                label: name,
                code: source,
            });
            this.shaderModules.set(name, module);
            return module;
        } catch (error) {
            console.error(`Failed to create shader module '${name}':`, error);
            throw error;
        }
    }

    hasShader(name: string): boolean {
        return this.shaderSources.has(name);
    }

    getShaderSource(name: string): string | undefined {
        return this.shaderSources.get(name);
    }

    getAllShaderNames(): string[] {
        return Array.from(this.shaderSources.keys());
    }

    clearCache(): void {
        this.shaderModules.clear();
    }

    destroy(): void {
        this.clearCache();
        this.shaderSources.clear();
    }
}
