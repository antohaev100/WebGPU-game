import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isDebug = mode === 'debug';
  
  return {
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    preview: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp', 
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    worker: {
      format: 'es'
    },
    optimizeDeps: {
      exclude: ['@webgpu/types']
    },
    build: {
      target: 'es2022'
    },
    assetsInclude: ['**/*.wgsl'],
    define: {
      __DEBUG__: isDebug,
      __PROD__: mode === 'production',
    },
    esbuild: {
      // Remove debug code in production builds
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    }
  }
})