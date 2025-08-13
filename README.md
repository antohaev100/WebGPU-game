# WebGPU 2D Shooter

A modern 2D shooter game built with WebGPU, TypeScript, and Web Workers for high-performance graphics and responsive gameplay.

## Features

- **WebGPU Rendering**: Utilizes modern GPU compute and graphics pipelines
- **Multi-threaded Architecture**: Separate workers for rendering and input processing
- **Modular Design**: Clean separation of concerns with TypeScript modules
- **Real-time Gameplay**: Fast-paced shooting with enemies, projectiles, and powerups
- **Modern Build System**: Vite-powered development with hot reload

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern browser with WebGPU support:
  - Chrome 113+ (recommended)
  - Edge 113+
  - Firefox Nightly (experimental)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open your browser to `http://localhost:5173` (or the port shown in console).

### Building for Production
```bash
npm run build
npm run preview
```

## Architecture

This project features a modular architecture designed for maintainability and performance:

```
src/
├── core/           # WebGPU device management
├── rendering/      # Shaders, buffers, pipelines
├── game/          # Game state and logic
├── workers/       # Web Workers for threading
├── utils/         # Common utilities
└── shaders/       # WGSL shader files
```

See [Architecture Documentation](./docs/architecture.md) for detailed information.

## Development

### Available Scripts

- `npm run dev` - Start development server (modular version)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - TypeScript type checking only
- `npm run dev:original` - Start development with original architecture

### Project Versions

The project includes both original and modular architectures:

- **Modular** (default): Clean, maintainable architecture with proper separation of concerns
- **Original**: Single-file approach, kept for reference and comparison

Switch between versions by changing the script source in `index.html`.

## Game Controls

- **WASD**: Move player
- **Mouse**: Aim (planned)
- **1/2/3**: Select powerup when prompted

## Technical Highlights

### WebGPU Features
- Compute shaders for game logic
- Indirect rendering for performance
- Multi-sample anti-aliasing (MSAA)
- Efficient buffer management

### Performance Optimizations
- Web Workers prevent main thread blocking
- SharedArrayBuffer for zero-copy state sharing
- GPU-based collision detection
- Batched rendering with indirect draws

### Modern Web Technologies
- TypeScript with strict type checking
- ES modules and tree shaking
- Vite for fast development and optimized builds
- WGSL shaders with proper import handling

## Browser Compatibility

### Supported Browsers
| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 113+ | Recommended, full support |
| Edge | 113+ | Full support |
| Firefox | Nightly | Experimental, may have issues |
| Safari | Future | WebGPU support planned |

### GPU Requirements
- DirectX 12 compatible GPU (Windows)
- Metal compatible GPU (macOS)
- Vulkan compatible GPU (Linux)

## Troubleshooting

### WebGPU Not Available
1. Update your browser to the latest version
2. Enable hardware acceleration in browser settings
3. Try enabling WebGPU in browser flags (`chrome://flags`)

### Performance Issues
1. Check GPU driver updates
2. Close other GPU-intensive applications
3. Set browser to use high-performance GPU in system settings

### Development Issues
See [Development Guide](./docs/development-guide.md) for detailed troubleshooting.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing architecture
4. Add tests for new functionality
5. Submit a pull request

See [Contributing Guidelines](./CONTRIBUTING.md) for detailed information.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## Acknowledgments

- WebGPU specification and implementations
- gl-matrix for mathematical operations
- Vite for excellent development experience
- TypeScript team for type safety
