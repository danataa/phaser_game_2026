
import IEnemy from "./iEnemy";
import Enemy from "./Enemy";
import { enemyMovementTypes, enemySprite, hitDirection } from "../../Enums";

export default class EnemyCar
    extends Enemy
    implements IEnemy {


    private _shell: Phaser.GameObjects.Sprite;
    private _playerOnTop: boolean = false;
    private _isBroken: boolean = false;

    private _healthLevels: Array<{ direction: hitDirection, health: number }> = [
        { direction: hitDirection.left, health: 1 },
        { direction: hitDirection.left, health: 1 },
        { direction: hitDirection.right, health: 1 },
        { direction: hitDirection.both, health: 1 },
        { direction: hitDirection.left, health: 1 },
        { direction: hitDirection.right, health: 1 },
        { direction: hitDirection.right, health: 1 },
        { direction: hitDirection.left, health: 1 },
        { direction: hitDirection.left, health: 1 },
        { direction: hitDirection.right, health: 1 },
        { direction: hitDirection.both, health: 1 },
        { direction: hitDirection.both, health: 1 },
        { direction: hitDirection.both, health: 1 }
    ];
    private _currentHealth: number = 0;
    private _currentHealthLevel: number = 0;

    private _randomEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private _bigEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private _bigShellEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private _noEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private _gearEmitter1: Phaser.GameObjects.Particles.ParticleEmitter;
    private _gearEmitter2: Phaser.GameObjects.Particles.ParticleEmitter;
    private _plateEmitter: Phaser.GameObjects.Particles.ParticleEmitter;


    constructor(params: enemyConfig) {

        super(params);


        this._health = this._healthLevels[this._currentHealthLevel].health;

        this.name = "car";
        this.setFrame(12).setScale(1.75).setAlpha(1);
        this._body.setSize(140, 50).setOffset(35, 40).setImmovable(true);

        this._body.checkCollision.left = false;
        this._body.checkCollision.right = false;
        this._body.checkCollision.up = true;
        this._body.checkCollision.down = false;

        this._shell = this.scene.add.sprite(this.x, this.y, "car", 0).setScale(1.75).setOrigin(0.5, 0.5).setDepth(2);

        this._randomEmitter = this.scene.add.particles(0, 0, 'effects', {
            frame: [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            lifespan: 4000,
            speedY: { min: -250, max: -450 },
            speedX: { min: -100, max: 100 },
            scale: { start: 1.5, end: 1.5 },
            rotate: { start: 0, end: 360, random: true },
            gravityY: 1000,

            emitting: false
        }).setDepth(999);

        this._noEmitter = this.scene.add.particles(0, 0, 'effects', {
            frame: [0, 7, 15],
            lifespan: 4000,
            speedY: { min: -250, max: -450 },
            speedX: { min: -100, max: 100 },
            scale: { start: 1.5, end: 1.5 },
            rotate: { start: 0, end: 360, random: true },
            gravityY: 1000,

            emitting: false
        }).setDepth(999);

        this._bigEmitter = this.scene.add.particles(0, 0, 'effects', {
            frame: [5, 14, 15],
            lifespan: 4000,
            speedY: { min: -250, max: -450 },
            speedX: { min: -100, max: 100 },
            scale: { start: 1.5, end: 1.5 },
            rotate: { start: 0, end: 360, random: true },
            gravityY: 1000,

            emitting: false
        }).setDepth(999);

        this._bigShellEmitter = this.scene.add.particles(0, 0, 'effects', {
            frame: [24, 25],
            lifespan: 4000,
            speedY: { min: -250, max: -450 },
            speedX: { min: -100, max: 100 },
            scale: { start: 1.5, end: 1.5 },
            rotate: { start: 0, end: 360, random: true },
            gravityY: 1000,

            emitting: false
        }).setDepth(999);


        this._gearEmitter1 = this.scene.add.particles(0, 0, 'effects', {
            frame: [18],
            lifespan: 4000,
            speedY: -200,
            speedX: -100,
            scale: { start: 1.5, end: 1.5 },
            gravityY: 1000,

            emitting: false
        }).setDepth(999);

        this._gearEmitter2 = this.scene.add.particles(0, 0, 'effects', {
            frame: [18],
            lifespan: 4000,
            speedY: -200,
            speedX: 100,
            scale: { start: 1.5, end: 1.5 },
            gravityY: 1000,

            emitting: false
        }).setDepth(999);


        this._plateEmitter = this.scene.add.particles(0, 0, 'effects', {
            frame: [26],
            lifespan: 4000,
            speedY: { min: -250, max: -450 },
            speedX: { min: -100, max: 100 },
            scale: { start: 1.5, end: 1.8 },
            rotate: { start: 0, end: 360, random: true },
            gravityY: 1000,

            emitting: false
        }).setDepth(999);





    }

    create() { }


    update(time: number, delta: number): void {

        if (this.isTouching().up) {
            this._playerOnTop = true;
        } else {
            this._playerOnTop = false;
        }
    }

    hit(damage: number, direction: hitDirection, hitX: number, hitY: number): boolean {


      

        if (this._currentHealthLevel + 1 > this._healthLevels.length) {
            return false;
        }
        if (direction === this._healthLevels[this._currentHealthLevel].direction || this._healthLevels[this._currentHealthLevel].direction === hitDirection.both) {
            this._health -= damage;

            if (this._health <= 0) {

                this.crashAnimation(this._currentHealthLevel)
                this._currentHealthLevel++;
                if (this._healthLevels[this._currentHealthLevel] !== undefined) {
                    this._health = this._healthLevels[this._currentHealthLevel].health;
                }

            }

            this._randomEmitter.emitParticleAt(hitX, hitY, 5);
               this._scene.playSfx(Phaser.Math.RND.pick(["hitCar0", "hitCar1", "hitCar2"]), 0.5);
            return true;
        } else {

            this._noEmitter.emitParticleAt(hitX, hitY, 1);
               this._scene.playSfx("hit0", 0.5);
            return false;
        }

    }

    crashAnimation(crash: number) {

        switch (crash) {
            case 0:
                this._shell.setFrame(1);

                break;
            case 1:
                this._shell.setFrame(2);

                break;
            case 2:
                this._shell.setFrame(3);
                break;
            case 3:
                this._shell.setFrame(4);
                this._bigEmitter.emitParticleAt(this.x - 50, this.y - 50, 10);
                this._bigShellEmitter.emitParticleAt(this.x, this.y - 50, 2);
                this._bigEmitter.emitParticleAt(this.x + 50, this.y - 50, 10);
                break;
            case 4:
                this._shell.setFrame(5);
                break;
            case 5:
                this._shell.setFrame(6);
                break;

            case 6:
                this._shell.setFrame(7);

                break;
            case 7:
                this._shell.setFrame(8);
                this._bigShellEmitter.emitParticleAt(this.x + 100, this.y - 50, 1);
                break;
            case 8:
                this._shell.setFrame(9);

                this._bigShellEmitter.emitParticleAt(this.x, this.y - 50, 2);
                this._bigEmitter.emitParticleAt(this.x - 50, this.y - 50, 5);
                this._bigShellEmitter.emitParticleAt(this.x + 50, this.y - 50, 2);
                break;
            case 9:
                this._shell.setFrame(10);
                this._plateEmitter.emitParticleAt(this.x + 60, this.y, 1);
                break;
            case 10:
                this._shell.setFrame(11);


                this._bigShellEmitter.emitParticleAt(this.x - 100, this.y - 50, 2);
                break;
            case 11:
                this._shell.setFrame(12);


                let _parafango = this.scene.add.sprite(this.x, this.y, "car", 11).setScale(1.5).setOrigin(0.5, 0.5);
                this.scene.tweens.add({
                    targets: _parafango,
                    y: "-=10",

                    duration: 100,
                    ease: Phaser.Math.Easing.Linear,
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: _parafango,
                            y: "+=20",
                            alpha: 0,
                            scale: 1.7,
                            ease: Phaser.Math.Easing.Sine.Out,
                            duration: 300,
                            onComplete: () => {
                                _parafango.destroy();
                            }

                        });
                    }
                });

                this.setAlpha(0);
                break;
            case 12:

                this._gearEmitter1.setDepth(1000).emitParticleAt(this.x - 100, this.y, 1);
                this._gearEmitter1.setDepth(999).emitParticleAt(this.x - 150, this.y - 20, 1);
                this._gearEmitter2.setDepth(999).emitParticleAt(this.x + 150, this.y, 1);
                this._gearEmitter2.setDepth(999).emitParticleAt(this.x + 100, this.y - 20, 1);
                this._body.setSize(140, 35).setOffset(35, 65)

                this._shell.setFrame(13);
                this._isBroken = true;
                this.scene.cameras.main.shake(200, 0.01);
                break;
        }

    }

    isBroken(): boolean {
        return this._isBroken;
    }

    tweenToDown() {

        if (!this._playerOnTop) {
            this._playerOnTop = true;
            this.scene.tweens.add({
                targets: this._shell,
                y: "+=5",
                duration: 50,
                ease: Phaser.Math.Easing.Sine.InOut,
                yoyo: true,
                onComplete: () => {}
            });

        }
    }

    tweenToRight() {

        if (!this._playerOnTop) {
            this._playerOnTop = true;
            this.scene.tweens.add({
                targets: this._shell,
                x: "+=5",
                duration: 50,
                ease: Phaser.Math.Easing.Sine.InOut,
                yoyo: true,
                onComplete: () => {

                }
            });

        }
    }

    tweenToLeft() {

        if (!this._playerOnTop) {
            this._playerOnTop = true;
            this.scene.tweens.add({
                targets: this._shell,
                x: "-=5",
                duration: 50,
                ease: Phaser.Math.Easing.Sine.InOut,
                yoyo: true,
                onComplete: () => {

                }
            });

        }
    }
}


