export default class Common {
    /** Frame-rate independent multiplier: 1.0 at 60 fps, clamped so tab-switch spikes cannot teleport objects. */
    static getFrameScale(deltaMs: number): number {
        return Math.min(deltaMs, 50) / (1000 / 60);
    }

    /**
     * Scene event emitters outlive scene restarts, so every custom event must be
     * dropped on create/shutdown or handlers of previous runs pile up.
     */
    static clearGameEvents(scene: Phaser.Scene): void {
        Object.values(GameEvent).forEach(e => scene.events.off(e));
    }

    static fillZeroPadding(number: number, size: number): string {
        let stringNumber = number.toString();

        while (stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber;
        }

        return stringNumber;
    }

    static isImgOutOfScreen(img: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite, screen: Phaser.Cameras.Scene2D.Camera): boolean {
        return (
            img.x + (img.width * img.scaleX) < 0 ||
            img.x > screen.width ||
            img.y + (img.height * img.scaleY) < 0 ||
            img.y > screen.height
        );
    };
    
    static getRandomEnumValue(objEnum: Object): any {
        return Object.values(objEnum)[
            Phaser.Math.Between(0, Object.keys(objEnum).length - 1)
        ];
    }
}

export enum GameEvent {
    MAP_SPEED_CHANGED = 'onMapSpeedChanged',
    VEHICLE_COLLIDED = 'onVehicleCollided',
    VEHICLE_DESTROYED = 'onVehicleDestroyed',
    PLAYER_COLLIDED = 'onPlayerCollided',
    COIN_COLLIDED = 'onCoinCollided',
    COIN_DESTROYED = 'onCoinDestroyed',
    SCORE_CHANGED = 'onScoreChanged'
};

export type Range = {
    from: number;
    to: number;
};

export enum Direction { 
    LEFT = 'left', 
    RIGHT = 'right', 
    UP = 'up', 
    DOWN = 'down', 
    FRONT = 'front', 
    BACK = 'back' 
};

export enum LayerIDX {
    GUI = 999
};
