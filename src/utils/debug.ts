// src/utils/debug.ts
declare const __DEBUG__: boolean;

export const debugLog = __DEBUG__ ? 
  (...args: any[]) => console.log('[DEBUG]', performance.now().toFixed(2), ...args) :
  () => {}; // This becomes a no-op in production builds

export const debugGpuBuffer = __DEBUG__ ?
    async (device: GPUDevice, cpuReadBuffer: GPUBuffer, targetBuffer: GPUBuffer, from : number, to: number) => {
        // Create a read buffer if it doesn't exist
        if (!cpuReadBuffer) {
          cpuReadBuffer = device.createBuffer({
            size: (to - from) * 4, // Size in bytes
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
          });
        } else if (cpuReadBuffer.size < (to - from) * 4) {
          cpuReadBuffer.destroy();
          cpuReadBuffer = device.createBuffer({
            size: (to - from) * 4, // Size in bytes
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
          });
        }
        const commandEncoder = device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(
          targetBuffer, // source buffer
          from * 4, // source offset in bytes
          cpuReadBuffer, // destination buffer
          0, // destination offset
          (to - from) * 4 // size in bytes
        );
    
        // Submit the command buffer
        device.queue.submit([commandEncoder.finish()]);

        // Map the buffer to read from it
        await cpuReadBuffer.mapAsync(GPUMapMode.READ);

        // Read the data
        const mappedRange = cpuReadBuffer.getMappedRange();

        // Create appropriate views of the data
        const dataFloat = new Float32Array(mappedRange.slice(0));
        const dataUint = new Uint32Array(mappedRange.slice(0));

        // Log both representations of the data
        console.log("Buffer data (float):", dataFloat);
        console.log("Buffer data (uint):", dataUint);

        // Unmap when done
        cpuReadBuffer.unmap();
    } :
    async () => {}; // This becomes a no-op in production builds