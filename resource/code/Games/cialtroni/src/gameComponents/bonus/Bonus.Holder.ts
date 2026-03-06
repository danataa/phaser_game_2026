
import IBonus from "./IBonus";
import Bonus from "./Bonus";
import { bonusTypes, bulletDirection, enemyMovementTypes, enemySprite, hitDirection } from "../../Enums";
import GamePlayBeat from "../../scenes/GamePlayBeat";
import EnergyBar from "../others/EnergyBar";


export default class BonusHolder

    extends Bonus
    implements IBonus {

    _scene: GamePlayBeat;
    private _energyBar: EnergyBar;
    private _currentFrame: number = 0;
    private _crashEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private _hitEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private _maxHits: number;
    private _currentHits: number
    private _bonusType: bonusTypes

    private _holderObjects: Array<{
        key: string,
        texture: string,
        energyBar: { offset: { x: number, y: number } },
        body: { w: number, h: number, ox: number, oy: number },
        crashFramesEmitter: Array<number>, hitFramesEmitter: Array<number>
    }> =

        [

            {
                key: "barrel",
                texture: "static-enemy",
                energyBar: { offset: { x: -25, y: -50 } },
                body: { w: 71, h: 91, ox: 0, oy: 5 },
                crashFramesEmitter: [3, 4],
                hitFramesEmitter: [54, 55]
            },
            {
                key: "barrel",
                texture: "static-enemy",
                energyBar: { offset: { x: -25, y: -60 } },
                body: { w: 71, h: 91, ox: 0, oy: 5 },
                crashFramesEmitter: [13, 14],
                hitFramesEmitter: [47,48,49,50,51,52,53]
            },

            {
                key: "barrel",
                texture: "static-enemy",
                energyBar: { offset: { x: -25, y: -60 } },
                body: { w: 71, h: 91, ox: 0, oy: 5 },
                crashFramesEmitter: [18, 19],
                hitFramesEmitter: [44,45,46]
            }

        ];

    private _holderObject: {
        key: string,
        texture: string,
        energyBar: { offset: { x: number, y: number } },
        body: { w: number, h: number, ox: number, oy: number },
        crashFramesEmitter: Array<number>,
        hitFramesEmitter: Array<number>
    };

    constructor(params: bonusConfig) {

        super(params);

        this._energyBar = params.bonusData.energyBar;
        this._maxHits = params.bonusData.maxHits;
        this._currentHits = 0;
        this._bonusType = <bonusTypes>params.bonusData.type;

        let _frameIndex: number = 0;
        //decido quale grafica usare in base al frame passato nei dati
        //ed in base al frame imposto quale holderO
        switch (params.bonusData.frame) {
            case 0:
                _frameIndex = 0;
                this._currentFrame = 0;
                break;
            case 10:
                _frameIndex = 1;
                this._currentFrame = 10;
                break;
            case 15:
                _frameIndex = 2;
                this._currentFrame = 15;
                break;
        }

        this._holderObject = this._holderObjects[_frameIndex];

        this._crashEmitter = this.scene.add.particles(0, 0, 'static', {
            frame: this._holderObject.crashFramesEmitter,
            lifespan: 4000,
            speedY: { min: -250, max: -450 },
            speedX: { min: -100, max: 100 },
            scale: { start: 1, end: 1.1 },
            rotate: { start: 0, end: 360, random: true },
            gravityY: 1000,
            emitting: false
        }).setDepth(999);

        this._hitEmitter = this.scene.add.particles(0, 0, 'effects', {
            frame: this._holderObject.hitFramesEmitter,
            lifespan: 4000,
            speedY: { min: -250, max: -450 },
            speedX: { min: -100, max: 100 },
            scale: { start: 1, end: 1.1 },
            rotate: { start: 0, end: 360, random: true },
            gravityY: 1000,
            emitting: false
        }).setDepth(999);

        this.setAlpha(1).setName("holder");
        this._body
            .setGravityY(1000)
            .setCollideWorldBounds(true, 0, 0, false)
            .setImmovable(true)

        this._body.setSize(this._holderObject.body.w, this._holderObject.body.h)
            .setOffset(this._holderObject.body.ox, this._holderObject.body.oy)

    }


    getEnergyBar(): EnergyBar {
        return this._energyBar;
    }

    hit(): void {

        this._scene.playSfx(Phaser.Math.RND.pick(["hitMetal0", "hitMetal1", "hitMetal2"]), 0.5);

        this._currentHits++;

        let _maxFrame: number = this._currentHits;

        this._energyBar.updatePercentage(100 / this._maxHits);
        if (this._currentHits < this._maxHits) {

            this.setTintFill(0xffffff);
            this.scene.time.delayedCall(100, () => {
                this.clearTint();
            }, [], this);

            //l'asset ha solo 3 frame di danno
            // quindi limito il frame massimo a 3
            if (_maxFrame > 2) _maxFrame = 2;
            this.setFrame(this._currentFrame + _maxFrame);
            this._hitEmitter.emitParticleAt(this.x, this.y, 4);


        } else {


            this.setVisible(false);
            this._energyBar.setVisible(false);
            this._scene.removeFromBonusGroup(this);
            this._scene.generateBonus(this.x, this.y - 20, this._bonusType);
            this._crashEmitter.emitParticleAt(this.x, this.y, 2);
             this._hitEmitter.emitParticleAt(this.x, this.y, 4);

            this._scene.playSfx("hitGround", 0.5);
        }

    }


    update(time: number, delta: number): void {

        if (this._energyBar !== undefined) {
            this._energyBar.updatePosition(this.x + this._holderObject.energyBar.offset.x, this.y + this._holderObject.energyBar.offset.y, this.depth);
        }
    }














}