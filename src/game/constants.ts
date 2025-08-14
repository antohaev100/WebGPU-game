export const GAME_CONSTANTS = {
    // Buffer sizes
    MAX_ENEMY_NUM: 1024,
    MAX_PROJECTILE_NUM: 1024,
    MAX_POWERUP_NUM: 256,
    MAX_SPAWN_NUM: 64,
    
    // Frame settings
    FRAMES_IN_FLIGHT: 2,
    
    // Game balance
    DEFAULT_FIRE_RATE: 250,
    DEFAULT_DAMAGE: 50,
    DEFAULT_FIRE_COUNT: 3,
    DEFAULT_PENETRATION: 3,
} as const;

export type GameConstants = typeof GAME_CONSTANTS;