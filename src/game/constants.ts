interface GameConstants {
    MAX_ENEMY_NUM: number;
    MAX_PROJECTILE_NUM: number;
    MAX_POWERUP_NUM: number;
    MAX_SPAWN_NUM: number;
    FRAMES_IN_FLIGHT: number;
    DEFAULT_FIRE_RATE: number;
    DEFAULT_DAMAGE: number;
    DEFAULT_FIRE_COUNT: number;
    DEFAULT_PENETRATION: number;
}

export const GAME_CONSTANTS: GameConstants = {
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

interface EnemyTypeStruct {
    damage: number;
    radius: number;
    speed: number;
    maxHp: number;
}

export const enemyTypes: EnemyTypeStruct[] = [
    { damage: 100, radius: 0.1, speed: 3, maxHp: 100 }, //enemy1
    { damage: 200, radius: 0.2, speed: 2, maxHp: 200 }, //enemy2
];