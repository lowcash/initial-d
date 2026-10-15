import { Range } from './common'

export default class TypeGuardHelper {
    static isRange(obj: Range | any): obj is Range {
        return (obj as Range).from !== undefined && (obj as Range).to !== undefined;
    }
    
    static isSprite(obj: Phaser.Physics.Arcade.Sprite | any): obj is Phaser.Physics.Arcade.Sprite {
        return (obj as Phaser.Physics.Arcade.Sprite) !== undefined;
    }
}
