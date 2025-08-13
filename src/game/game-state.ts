export enum PowerupEffect {
    FireCount = 0,
    Penetration = 1,
    Damage = 2,
    FireRate = 3,
}

export interface GameState {
    // Player state
    playerRotMat: [number, number, number, number];
    playerPosition: [number, number];
    
    // Timing
    deltaTime: number;
    
    // View projection matrix (16 elements)
    viewProjectionMatrix: Float32Array;
    
    // Display
    widthHeightRatio: number;
    
    // Powerup system
    pendingPowerupSelection: number;
    powerupControl: number;
    powerupSelected: number;
    selectedPowerupEffect: PowerupEffect;
    selectedPowerupValue: number;
}

export class GameStateManager {
    private static instance: GameStateManager;
    private sharedBuffer: SharedArrayBuffer;
    private floatView: Float32Array;
    private uintView: Uint32Array;

    private constructor() {
        // Initialize shared buffer (32 * 4 bytes = 128 bytes)
        this.sharedBuffer = new SharedArrayBuffer(32 * 4);
        this.floatView = new Float32Array(this.sharedBuffer);
        this.uintView = new Uint32Array(this.sharedBuffer);
        
        this.initializeDefaults();
    }

    static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }
    
    static createFromSharedBuffer(buffer: SharedArrayBuffer): GameStateManager {
        const instance = new GameStateManager();
        instance.setSharedBuffer(buffer);
        return instance;
    }


    private initializeDefaults(): void {
        // Player rotation matrix (identity)
        this.floatView[0] = 1.0; // playerRotMat[0]
        this.floatView[1] = 0.0; // playerRotMat[1]
        this.floatView[2] = 0.0; // playerRotMat[2]
        this.floatView[3] = 1.0; // playerRotMat[3]
        
        // Player position
        this.floatView[4] = 7.0; // playerPosition x
        this.floatView[5] = 7.0; // playerPosition z
        
        // Delta time
        this.floatView[6] = 8.33; // dt (assuming 120fps initially)
        
        // View projection matrix (indices 7-22)
        for (let i = 7; i <= 22; i++) {
            this.floatView[i] = 0.0;
        }
        
        // Width/height ratio
        this.floatView[23] = 1.0;
        
        // Powerup system
        this.uintView[24] = 0; // pending powerup selection
        this.uintView[25] = 0; // powerup control variable
        this.uintView[26] = 0; // powerup selected
        this.uintView[27] = 0; // selected powerup effect
        this.uintView[28] = 0; // selected powerup value
    }

    setSharedBuffer(buffer: SharedArrayBuffer): void {
        this.sharedBuffer = buffer;
        this.floatView = new Float32Array(this.sharedBuffer);
        this.uintView = new Uint32Array(this.sharedBuffer);
    }

    getSharedBuffer(): SharedArrayBuffer {
        return this.sharedBuffer;
    }

    getFloatView(): Float32Array {
        return this.floatView;
    }

    getUintView(): Uint32Array {
        return this.uintView;
    }

    getCpuWriteSubArray(): Float32Array {
        return this.floatView.subarray(0, 23);
    }

    // Player state accessors
    getPlayerRotationMatrix(): [number, number, number, number] {
        return [this.floatView[0], this.floatView[1], this.floatView[2], this.floatView[3]];
    }

    setPlayerRotationMatrix(rotMat: [number, number, number, number]): void {
        this.floatView[0] = rotMat[0];
        this.floatView[1] = rotMat[1];
        this.floatView[2] = rotMat[2];
        this.floatView[3] = rotMat[3];
    }

    getPlayerPosition(): [number, number] {
        return [this.floatView[4], this.floatView[5]];
    }

    setPlayerPosition(position: [number, number]): void {
        this.floatView[4] = position[0];
        this.floatView[5] = position[1];
    }

    getDeltaTime(): number {
        return this.floatView[6];
    }

    setDeltaTime(dt: number): void {
        this.floatView[6] = dt;
    }

    getViewProjectionMatrix(): Float32Array {
        return this.floatView.subarray(7, 23);
    }

    setViewProjectionMatrix(matrix: Float32Array): void {
        this.floatView.set(matrix, 7);
    }

    getWidthHeightRatio(): number {
        return this.floatView[23];
    }

    setWidthHeightRatio(ratio: number): void {
        this.floatView[23] = ratio;
    }

    // Powerup system accessors
    getPendingPowerupSelection(): number {
        return this.uintView[24];
    }

    setPendingPowerupSelection(count: number): void {
        this.uintView[24] = count;
    }

    decrementPendingPowerupSelection(): void {
        this.uintView[24]--;
    }

    incrementPendingPowerupSelection(increment: number): void {
        this.uintView[24] += increment;
    }

    getPowerupControl(): number {
        return this.uintView[25];
    }

    setPowerupControl(control: number): void {
        this.uintView[25] = control;
    }

    getPowerupSelected(): number {
        return this.uintView[26];
    }

    setPowerupSelected(selection: number): void {
        this.uintView[26] = selection;
    }

    getSelectedPowerupEffect(): PowerupEffect {
        return this.uintView[27] as PowerupEffect;
    }

    setSelectedPowerupEffect(effect: PowerupEffect): void {
        this.uintView[27] = effect;
    }

    getSelectedPowerupValue(): number {
        return this.uintView[28];
    }

    setSelectedPowerupValue(value: number): void {
        this.uintView[28] = value;
    }

    // Utility methods
    getCurrentState(): GameState {
        return {
            playerRotMat: this.getPlayerRotationMatrix(),
            playerPosition: this.getPlayerPosition(),
            deltaTime: this.getDeltaTime(),
            viewProjectionMatrix: this.getViewProjectionMatrix(),
            widthHeightRatio: this.getWidthHeightRatio(),
            pendingPowerupSelection: this.getPendingPowerupSelection(),
            powerupControl: this.getPowerupControl(),
            powerupSelected: this.getPowerupSelected(),
            selectedPowerupEffect: this.getSelectedPowerupEffect(),
            selectedPowerupValue: this.getSelectedPowerupValue(),
        };
    }
}
