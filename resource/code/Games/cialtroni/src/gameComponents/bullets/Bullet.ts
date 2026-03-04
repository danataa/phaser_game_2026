
import IBullet from "./iBullet";
import { bulletDirection } from "../../Enums";
import GamePlay from "../../scenes/GamePlay";

export default class Bullet
    extends Phaser.Physics.Arcade.Sprite
    implements IBullet {

    protected _direction: bulletDirection = bulletDirection.up;
    protected _scene: GamePlay
    protected _params: bulletConfig;
    protected _health: number = 0;
    protected _config: bulletConfig;
    protected _body: Phaser.Physics.Arcade.Body;
    protected _parentPosition: { x: number, y: number } = { x: 0, y: 0 };
    protected _hidden: boolean = false;

    constructor(params: bulletConfig) {

        super(params.scene, params.x, params.y, params.key, params.frame);
        this._config = params;
        this._scene = <GamePlay>params.scene;
        this._params = params;
        if (params.health != null) this._health = params.health;
        this.scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this._body = this.body as Phaser.Physics.Arcade.Body;
        this.setOrigin(0.5, 0.5).setDepth(100);

        this.setDirection(params.direction);
        this.scene.add.existing(this);
        this.setAlpha(0);

        if (params.hidden == null) {
            this.scene.tweens.add({
                targets: this,
                alpha: 1,
                ease: 'Linear',
                duration: 250,
                repeat: 0,
                yoyo: false
            });
        }


        if (params.bulletData != null && params.bulletData.removeAfter != null) {
            this._scene.time.delayedCall(params.bulletData.removeAfter, () => {
                this.remove();
                if (params.bulletData != null && params.bulletData.removeCallback != null) {
                    params.bulletData.removeCallback();
                }
            }, null, this);
        }



        if (params.frame != null) {
            this.setFrame(params.frame);
        }

        if (params.name != null) {
            this.setName(params.name);
        }

        if (params.body != null) {
            switch (params.body.shape) {
                case "circle":
                    this._body.setCircle(params.body.radius, params.body.ox, params.body.oy);
                    break;
                case "square":
                    this._body.setSize(params.body.w, params.body.h);
                    this._body.setOffset(params.body.ox, params.body.oy);
                    break;
            }
        }

        if (params.scale != null) {
            this.setScale(params.scale.x, params.scale.y);
        }

        if (params.bulletData != null && params.bulletData.parentPosition != null) {
            this._parentPosition = params.bulletData.parentPosition;
        }


        if (params.bulletData != null && params.bulletData.animation != null && this._scene.anims.exists(params.bulletData.animation)) {

            this.play(params.bulletData.animation);
        }

    }

    update(time: number, delta: number): void {

        if (!this.scene.cameras.main.worldView.contains(this.x, this.y)) {
            this.remove();
        }

        if (this._config.bulletData.rotation != null) {
            this.rotation += this._config.bulletData.rotation;
        }
    }

    setDirection(direction: bulletDirection) {
        this._direction = direction;
    }

    getDirection(): bulletDirection {
        return this._direction;
    }

    remove(): void {

        this._scene.removeFromBulletGroup(this);

        if (this._config.bulletData.removeEmitter != null) {
            this._config.bulletData.removeEmitter.explode(10, this.x, this.y);
        }

    }

    getDamage(): number {
        return this._params.damage;
    }


    updateHealth(amount: number) {



    }


    getParentPosition(): { x: number, y: number } {
        return this._parentPosition;
    }



}


