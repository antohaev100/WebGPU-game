# WebGPU 2D Shooter

A high-performance 2D shooter game showcasing modern web technologies including WebGPU, compute shaders, and multi-threaded architecture. This project serves as an educational example demonstrating GPU-accelerated game development in the browser.

> **📚 Educational Project Notice**  
> This project is created purely for educational purposes. While I've made the code freely available for learning and experimentation, please note that I may not respond to GitHub messages or pull requests. Feel free to fork, study, and build upon this codebase for your own learning journey!

## ✨ Features

- **WebGPU Rendering**: Modern GPU compute and graphics pipelines
- **Multi-threaded Architecture**: Web Workers for smooth performance
- **GPU Game Logic**: Compute shaders handle physics, collision, and AI
- **Real-time Combat**: Enemy waves, projectiles with penetration, powerup system
- **Spatial Hashing**: Efficient collision detection on GPU
- **Educational Focus**: Well-commented code demonstrating WebGPU concepts

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Chrome 113+** or **Edge 113+** (WebGPU support)

### Installation
```bash
git clone <repository-url>
cd WebGPU-game
npm install
npm run dev
# Open http://localhost:5173
```

### Building
```bash
npm run build
npm run preview
```

## � Game Controls

| Input | Action |
|-------|--------|
| **WASD** | Move player |
| **1/2/3** | Select powerup when prompted |

## 🏗️ Project Architecture

The game uses a sophisticated multi-threaded architecture with GPU-accelerated game logic:

```
Main Thread                    Render Worker (WebGPU)
├── UI & Input                 ├── Device Management  
├── Powerup Selection          ├── Compute Shaders
└── State Coordination         └── Rendering Pipeline
      │                              │
      └─── SharedArrayBuffer ────────┘
```

### Key Technologies
- **WebGPU**: Modern graphics API with compute shader support
- **Web Workers**: Prevent main thread blocking during rendering
- **SharedArrayBuffer**: Zero-copy data sharing between threads
- **WGSL**: WebGPU Shading Language for compute shaders
- **TypeScript**: Type-safe development with strict checking

### File Structure
```
src/
├── main.ts                 # Main thread entry point
├── render.ts              # WebGPU render worker
├── input.ts               # Input handling
├── game/                  # Game state and constants
├── rendering/             # WebGPU rendering system
│   ├── buffers/           # GPU buffer management
│   ├── core/              # Device initialization
│   ├── pipelines/         # Shader compilation
│   └── texture/           # Texture management
├── shaders/               # WGSL compute & render shaders
└── utils/                 # Debug and utility functions
```

## � Game Systems

### Enemy System
Two enemy types with different behaviors:
- **Type 1**: Fast, low health (HP: 100, Speed: 3, Damage: 100)
- **Type 2**: Slow, high health (HP: 200, Speed: 2, Damage: 200)

### Powerup System
Four upgrade types with randomized values:
- **🔫 Fire Count**: More projectiles per shot (0-2 additional)
- **⚡ Penetration**: Bullets pierce more enemies (0-2 additional)
- **💥 Damage**: Increased bullet damage (0-25 additional)
- **🏹 Fire Rate**: Faster shooting (0-100ms reduction)

### GPU Compute Pipeline
Game logic runs entirely on GPU through compute shaders:

1. **Pre-processing**: Reset counters, setup frame data
2. **Object Movement**: Update positions, enemy AI
3. **Collision Detection**: Spatial hash-based collision
4. **Projectile Physics**: Bullet movement, penetration
5. **Powerup Logic**: Collection and magnetic attraction
6. **Spawning**: Dynamic enemy/projectile creation
7. **Post-processing**: Prepare rendering data

### Collision Detection
Uses spatial hashing on GPU for efficient collision queries:
- 32x16 grid covering game world
- Up to 8 objects per cell
- Parallel collision detection in compute shaders

## �️ Development

### Available Scripts
```bash
npm run dev          # Development server
npm run dev:debug    # Development with debug logging
npm run build        # Production build
npm run preview      # Preview production build
```

### Modifying the Game

**Change Game Balance** (easy):
```typescript
// In src/game/constants.ts
export const GAME_CONSTANTS = {
    DEFAULT_FIRE_RATE: 100,      // Faster shooting
    DEFAULT_DAMAGE: 100,         // More damage
    DEFAULT_FIRE_COUNT: 5,       // More bullets
};
```

**Add Visual Effects** (intermediate):
```typescript
// In src/main.ts - Screen shake on damage
function addScreenShake(intensity: number) {
    const offset = Math.random() * intensity;
    // Modify view matrix with offset
}
```

**Modify Shaders** (advanced):
```wgsl
// In src/shaders/objectMovement.wgsl
// Add rotation to enemies based on movement
let rotation = atan2(velocity.y, velocity.x);
```

### Key APIs

**GameStateManager** - Shared state management:
```typescript
const gameState = GameStateManager.getInstance();
gameState.getPlayerPosition();
gameState.setPlayerPosition([x, y]);
gameState.getPendingPowerupSelection();
```

**Buffer Management** - GPU data handling:
```typescript
interface Buffers {
    vertex: GPUBuffer;          // Geometry data
    object: GPUBuffer;          // Game objects
    projectile: GPUBuffer;      // Bullets
    control: GPUBuffer;         // Atomic counters
    hashmap: GPUBuffer;         // Spatial hash
}
```

## 🌐 Browser Support

| Browser | Version | WebGPU Status | Performance |
|---------|---------|---------------|-------------|
| **Chrome** | 113+ | ✅ Stable | Excellent |
| **Edge** | 113+ | ✅ Stable | Excellent |
| **Firefox** | Nightly | ⚠️ Experimental | Variable |
| **Safari** | Future | ❌ In Development | N/A |

### Hardware Requirements
- **GPU**: DirectX 12 (Windows), Metal (macOS), or Vulkan (Linux) compatible
- **RAM**: 4GB+ recommended
- **Note**: Integrated graphics work but dedicated GPU recommended

## � Troubleshooting

### WebGPU Not Available
1. Update to Chrome 113+ or Edge 113+
2. Enable hardware acceleration in browser settings
3. Update GPU drivers
4. Try `chrome://flags` → Enable "Unsafe WebGPU"

### Performance Issues
1. Close other GPU-intensive applications
2. Set browser to use high-performance GPU
3. Check task manager for high CPU/GPU usage

### Development Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Debug mode for detailed logging
npm run dev:debug
```

## 🎓 Learning Path

### Beginner (New to Graphics Programming)
1. Study `src/main.ts` and `src/game/constants.ts`
2. Modify game constants (enemy stats, fire rate)
3. Add console.log to understand game flow
4. Change UI elements and timing

### Intermediate (Some Web Development Experience)
1. Explore `src/rendering/` folder structure
2. Study buffer management in `src/rendering/buffers/`
3. Understand WebGPU pipeline creation
4. Add new visual effects or object types

### Advanced (Graphics Programming Background)
1. Study compute shaders in `src/shaders/`
2. Understand spatial hashing implementation
3. Modify shader algorithms (movement, collision)
4. Implement new parallel algorithms

### Key Concepts to Learn
- **GPU Programming**: Parallel processing vs sequential
- **WebGPU Pipeline**: Command encoding, bind groups, buffers
- **Compute Shaders**: WGSL syntax, workgroups, memory barriers
- **Game Architecture**: Multi-threading, state management
- **Spatial Data Structures**: Hash grids, collision optimization

## 📚 Related Technologies

After mastering this project, explore:
- **Three.js**: High-level 3D graphics library
- **Babylon.js**: Game engine with WebGPU support
- **WebAssembly**: High-performance web applications
- **WebXR**: Virtual and augmented reality

## 🤝 Contributing

This project welcomes educational improvements:
- Documentation clarifications
- Code comments and examples
- Bug fixes and browser compatibility
- Learning resources and tutorials

**Note**: Focus on educational value over complex features. Keep changes beginner-friendly.

## 📄 License

MIT License - Feel free to use, modify, and learn from this code.

**Summary**: You can use this code for any purpose, including commercial projects, with no warranty provided.

---

**Happy Learning!** 🚀

*The best way to understand WebGPU is by experimenting. Start with small changes and gradually work up to shader modifications.*
