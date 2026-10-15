import Common, { LayerIDX } from '../_common/common'
import HUD from '../HUD';

export enum AppendFrom { LEFT, RIGHT };

export default class ScoreHUD extends HUD {
    protected readonly scoreLabel: Phaser.GameObjects.BitmapText;

    private readonly fontSize: number;
    private readonly fontPadding: number;

    protected readonly zeroPadding: number;

    private readonly baseText: string;
    private readonly appendFrom: AppendFrom;

    private baseScale: number = 1;

    constructor(scene: Phaser.Scene, baseText: string = 'SCORE', appendFrom: AppendFrom = AppendFrom.LEFT, color: number = 0x000000, fontSize: number = 38, fontPadding: number = 50, zeroPadding: number = 6) {
        super(scene, new Phaser.Geom.Rectangle(0, 0, scene.game.config.width as number, fontSize + fontPadding), color, 1.0, LayerIDX.GUI);

        this.fontSize = fontSize;
        this.fontPadding = fontPadding;
        this.zeroPadding = zeroPadding;

        this.baseText = baseText;
        this.appendFrom = appendFrom;

        this.scoreLabel = this.scene.add.bitmapText(
            this.fontPadding,
            this.fontPadding,
            'font',
            `NO ${this.baseText}`,
            this.fontSize
        );

        this.scoreLabel.setDepth(LayerIDX.GUI + 1);
        this.scoreLabel.setOrigin(0, 0);

        this.updateScore(0, this.zeroPadding);

        this.realignLabel();
    }

    public updateScore(score: number, zeroPadding?: number) {
        if (!this.scoreLabel || !this.scoreLabel.active) {
            return;
        }

        this.scoreLabel.text = `${this.baseText} ${Common.fillZeroPadding(score, zeroPadding ?? this.zeroPadding)}`;
        this.realignLabel();
    }

    /** Subtle pop when score jumps (e.g. coin pickup). */
    public punchScore(): void {
        if (!this.scoreLabel || !this.scoreLabel.active) {
            return;
        }

        this.scene.tweens.killTweensOf(this.scoreLabel);
        this.scoreLabel.setScale(this.baseScale);
        this.scoreLabel.clearTint();

        this.scene.tweens.add({
            targets: this.scoreLabel,
            scale: this.baseScale * 1.08,
            duration: 70,
            yoyo: true,
            ease: 'Sine.easeOut'
        });
    }

    private realignLabel(): void {
        if (!this.scoreLabel || !this.scoreLabel.active) {
            return;
        }

        if (this.appendFrom === AppendFrom.RIGHT) {
            this.scoreLabel.setOrigin(1, 0);
            this.scoreLabel.setPosition(
                (this.scene.game.config.width as number) - this.fontPadding,
                this.fontPadding
            );
        } else {
            this.scoreLabel.setOrigin(0, 0);
            this.scoreLabel.setPosition(this.fontPadding, this.fontPadding);
        }
    }
};

/**
 * ScoreHUD extended by change score handling
 */
export class ScoreHUDExtended extends ScoreHUD {
    private readonly onScoreChangedHandler: (totalScore: number, changedByValue?: number) => void;

    constructor(scene: Phaser.Scene, baseText: string = 'SCORE', appendFrom: AppendFrom = AppendFrom.LEFT, color: number = 0x000000, fontSize: number = 38, fontPadding: number = 50, zeroPadding: number = 6) {
        super(scene, baseText, appendFrom, color, fontSize, fontPadding, zeroPadding);

        this.onScoreChangedHandler = (totalScore: number, changedByValue?: number) => {
            this.handleScoreChanged(totalScore, changedByValue);
        };

        // Prior runs left handlers bound to destroyed labels — clear channel first.
        this.scene.events.off('onScoreChanged');
        this.scene.events.on('onScoreChanged', this.onScoreChangedHandler);
    }

    private handleScoreChanged(totalScore: number, changedByValue?: number): void {
        this.updateScore(totalScore, this.zeroPadding);

        // Punch only on meaningful jumps (coins), not every drive tick.
        if (changedByValue !== undefined && changedByValue >= 20) {
            this.punchScore();
        }
    }
};
