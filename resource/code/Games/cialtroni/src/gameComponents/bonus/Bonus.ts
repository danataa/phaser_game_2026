import GamePlay from "../../scenes/GamePlay";
import IBonus from "./IBonus";
import { bonusTypes } from "../../Enums";



export default class Bonus
    extends Phaser.GameObjects.Sprite
    implements IBonus {

    protected _bonusData: bonusData;
    protected _scene: GamePlay;
    protected _type: bonusTypes;
    protected _config: bonusConfig;
    protected _body: Phaser.Physics.Arcade.Body;
    protected _isCollectable: boolean = false;
    protected _hasAnimation: boolean = true;
    protected _bonusAnimations: Array<{ texture: string, frames: Array<number>, animation: boolean }> = [

        { texture: "bonus", frames: [0, 1, 2, 3, 4, 5, 6, 7], animation: true }, //0 L
        { texture: "bonus", frames: [8, 9, 10, 11, 12, 13, 14, 15], animation: true }, //1 E
        { texture: "bonus", frames: [16, 17, 18, 19, 20, 21, 22, 23], animation: true }, //2 C
        { texture: "bonus", frames: [24, 25, 26, 27, 28, 29, 30, 31], animation: true }, //3 S
        { texture: "bonus", frames: [32, 33, 34, 35, 36, 37, 38, 39], animation: true }, //4 R
        { texture: "bonus", frames: [40, 41, 42, 43, 44, 45, 46, 47], animation: true }, //5 M
        { texture: "bonus", frames: [48, 49, 50, 51, 52, 53, 54, 55], animation: true }, //6 D
        { texture: "bonus", frames: [56, 57, 58, 59, 60, 61, 62, 63], animation: true }, //7 B
        { texture: "bonus", frames: [64, 65, 66, 67, 68, 69, 70, 71], animation: true }, //8 T green
        { texture: "bonus", frames: [72, 73, 74, 75, 76, 77, 78, 79], animation: true }, //9 P
        { texture: "bonus", frames: [80, 81, 82, 83, 84, 85, 86, 87], animation: true }, //10 W
        { texture: "bonus", frames: [88, 89, 90, 91, 92, 93, 94, 95], animation: true }, //11 B
        { texture: "bonus", frames: [96, 97, 98, 99, 100, 101, 102, 103], animation: true }, //12 V
        { texture: "bonus", frames: [104, 105, 106, 107, 108, 109, 110, 111], animation: true }, //13 T blue
        { texture: "bonus", frames: [112, 113, 114, 115, 116, 117, 118, 119], animation: true }, //14 I
        { texture: "bonus", frames: [120, 121, 122, 123, 124, 125, 126, 127], animation: true }, //15 N
        { texture: "bonus", frames: [128, 129, 130, 131, 132, 133, 134, 135], animation: true }, //16 G
        { texture: "bonus", frames: [136, 137, 138, 139, 140, 141, 142, 143], animation: true }, //17 F
        { texture: "bonus", frames: [144, 145, 146, 147, 148, 149, 150, 151], animation: true }, //18 R
        { texture: "static", frames: [4], animation: false }, //19 discharger
        { texture: "static", frames: [10], animation: false }, //20 static holder
        { texture: "effects", frames: [28, 29, 30, 35, 36, 37, 38, 39], animation: false }, //21 effects trash
        { texture: "effects", frames: [58], animation: false }, //22 effects canStrike
        { texture: "effects", frames: [43], animation: false }, //23 effects time
        { texture: "effects", frames: [42], animation: false }, //24 effects damage
        { texture: "effects", frames: [47, 48, 49, 50, 51, 52, 53], animation: false }, //25 effects health
        { texture: "effects", frames: [57], animation: false }, //26 invulnerability


    ];

    constructor(params: bonusConfig) {

        super(params.scene, params.x, params.y, params.key);

        this._config = params;
        this._bonusData = params.bonusData;
        this._scene = this._config.scene as GamePlay;
        this._scene.add.existing(this);
        this._scene.physics.world.enable(this);
        this._body = this.body as Phaser.Physics.Arcade.Body;
        this._type = bonusTypes.none;

        let _animFrames: Array<number> = [];

        switch (this._config.type) {
            case bonusTypes.ball:
                this.setTexture(this._bonusAnimations[11].texture);
                _animFrames = this._bonusAnimations[11].frames;
                this._type = bonusTypes.ball;
                break;
            case bonusTypes.laser:
                this.setTexture(this._bonusAnimations[0].texture);
                _animFrames = this._bonusAnimations[0].frames;
                this._type = bonusTypes.laser;
                break;
            case bonusTypes.score:
                this.setTexture(this._bonusAnimations[3].texture);
                _animFrames = this._bonusAnimations[3].frames;
                this._type = bonusTypes.score;
                break;
            case bonusTypes.enlarge:
                this.setTexture(this._bonusAnimations[1].texture);
                _animFrames = this._bonusAnimations[1].frames;
                this._type = bonusTypes.enlarge;
                break;

            case bonusTypes.fireRate:
                this.setTexture(this._bonusAnimations[17].texture);
                _animFrames = this._bonusAnimations[17].frames;
                this._type = bonusTypes.fireRate;
                break;
            case bonusTypes.speed:
                this.setTexture(this._bonusAnimations[3].texture);
                _animFrames = this._bonusAnimations[3].frames;
                this._type = bonusTypes.speed;
                break;
            case bonusTypes.shield:
                this.setTexture(this._bonusAnimations[14].texture);
                _animFrames = this._bonusAnimations[14].frames;
                this._type = bonusTypes.shield;
                break;
            case bonusTypes.invulnerability:
                //this.setTexture(this._bonusAnimations[14].texture);
                //_animFrames = this._bonusAnimations[14].frames;

                this.setTexture(this._bonusAnimations[26].texture);
                _animFrames = this._bonusAnimations[26].frames;
                 this.setFrame(_animFrames[0]);
                 this._hasAnimation = this._bonusAnimations[26].animation;
                 this.setScale(2)
                    this._body.setSize(30, 30).setOffset(10, 20);

                this._type = bonusTypes.invulnerability;
                break;
            case bonusTypes.missile:
                this.setTexture(this._bonusAnimations[5].texture);
                _animFrames = this._bonusAnimations[5].frames;
                this._type = bonusTypes.missile;
                break;
            case bonusTypes.side:
                this.setTexture(this._bonusAnimations[10].texture);
                _animFrames = this._bonusAnimations[10].frames;
                this._type = bonusTypes.side;
                break;
            case bonusTypes.rear:
                this.setTexture(this._bonusAnimations[18].texture);
                _animFrames = this._bonusAnimations[18].frames;
                this._type = bonusTypes.rear;
                break;
            case bonusTypes.orb:
                this.setTexture(this._bonusAnimations[9].texture);
                _animFrames = this._bonusAnimations[9].frames;
                this._type = bonusTypes.orb;
                break;

            case bonusTypes.trash:
                this.setTexture(this._bonusAnimations[21].texture);
                _animFrames = this._bonusAnimations[21].frames;
                this.setFrame(Phaser.Math.RND.pick(_animFrames));
                this._type = bonusTypes.trash;
                this._hasAnimation = this._bonusAnimations[21].animation;
                this.setScale(2)
                this._body.setSize(30, 30).setOffset(10, 20);

                break;

            case bonusTypes.discharger:
                this.setTexture(this._bonusAnimations[19].texture);
                _animFrames = this._bonusAnimations[19].frames;

                this.setFrame(_animFrames[0]);
                this._type = bonusTypes.discharger;
                this._hasAnimation = this._bonusAnimations[19].animation;
                break;

            case bonusTypes.holder:
                this.setTexture(this._bonusAnimations[20].texture);
                _animFrames = this._bonusAnimations[20].frames;
                this._type = bonusTypes.holder;
                this._hasAnimation = this._bonusAnimations[20].animation;
                break;

            case bonusTypes.time:
                this.setTexture(this._bonusAnimations[23].texture);
                _animFrames = this._bonusAnimations[23].frames;
                this._type = bonusTypes.time;
                this.setFrame(_animFrames[0]);
                this._hasAnimation = this._bonusAnimations[23].animation;
                this.setScale(2)
                this._body.setSize(30, 30).setOffset(10, 20);
                break;

            case bonusTypes.canStrike:
                this.setTexture(this._bonusAnimations[22].texture);
                _animFrames = this._bonusAnimations[22].frames;
                this.setFrame(_animFrames[0]);
                this._type = bonusTypes.canStrike;
                this._hasAnimation = this._bonusAnimations[22].animation;
                this._body.setSize(30, 30).setOffset(10, 20);
                this.setScale(2)
                break;

            case bonusTypes.damage:
                this.setTexture(this._bonusAnimations[24].texture);
                _animFrames = this._bonusAnimations[24].frames;
                this.setFrame(_animFrames[0]);
                this._type = bonusTypes.damage;
                this._hasAnimation = this._bonusAnimations[24].animation;
                this.setScale(2)
                this._body.setSize(30, 30).setOffset(10, 20);
                break;

            case bonusTypes.health:
                this.setTexture(this._bonusAnimations[25].texture);
                _animFrames = this._bonusAnimations[25].frames;
                this.setFrame(Phaser.Math.RND.pick(_animFrames));
                this._type = bonusTypes.health;
                this._hasAnimation = this._bonusAnimations[25].animation;
                this.setScale(2)
                this._body.setSize(30, 30).setOffset(10, 20);
                break;


        }



        if (this._bonusData.texture != null) {
            this.setTexture(this._bonusData.texture);
        }
        if (this._bonusData.frame != null) {
            this.setFrame(this._bonusData.frame);
        }

        if (!this._scene.anims.exists("bonus-" + this._type) && this._hasAnimation) {

            let _animConfig: Phaser.Types.Animations.Animation = {
                key: "bonus-" + this._type,
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: _animFrames }),
                frameRate: 10,
                randomFrame: true,
                repeat: -1
            }

            this.scene.anims.create(_animConfig);

        }

        if (this._type != bonusTypes.none && this._hasAnimation) {
            this.play("bonus-" + this._type, true);
        }

        this._scene.time.delayedCall(1000, () => {
            this._isCollectable = true;
        }, [], this);

    }

    update(time: number, delta: number): void { }


    getBonus(): void {

        if (!this._isCollectable) return;

        this._body.enable = false;

        this.setTintFill(0xffffff);
        this._scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 250,
            onComplete: () => {
                this.remove()
            }
        })
    }

    getType(): bonusTypes {
        return this._type;
    }

    isCollectable(): boolean {
        return this._isCollectable;
    }

    remove() {

        this._scene.removeFromBonusGroup(this);

    }


}


