import Enemy from "../Enemy";
import Player from "../Player";
import Fireball from "./Fireball";

// Nemico di tipo demon che attacca a distanza con fireball.
export default class Demon extends Enemy {
    // --- Configuration Properties (bilanciamento) ---
    private readonly _baseDamage: number = 30;
    private readonly _chaseSpeed: number = 350;
    private readonly _baseHp: number = 80;
    private readonly _soulsReward: number = 20;
    private readonly _shootRate: number = 3000;
    private readonly _detectionRange: number = 500;
    private readonly _targetOffsetX: number = 16;
    private readonly _targetOffsetY: number = 50;

    // --- Runtime State ---
    private _shootTimer: Phaser.Time.TimerEvent | null = null;
    private _isAttacking: boolean = false;
    private _timerInitialized: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Player) {
        super(scene, x, y, "demon_idle", target);

        this.setDamage(this._baseDamage);
        this.setSpeed(this._chaseSpeed);
        this.setHp(this._baseHp);
        this._soulsValue = this._soulsReward;

        this.create();
    }

    // --- Getters ---
    get shootRate(): number {
        return this._shootRate;
    }

    get detectionRange(): number {
        return this._detectionRange;
    }

    // --- Phaser Lifecycle ---

    create(): void {
        this._shootTimer = this.scene.time.addEvent({
            delay: this._shootRate,
            callback: this._shootFireball,
            callbackScope: this,
            loop: true,
        });

        this._createAnimations();
        this.setScale(1.5);
        this.body.setSize(40, 65).setOffset(44, 63);
    }

    /** Gestisce inseguimento, distanza di ingaggio e animazioni del demon. */
    update(): void {
        if (this._isDead) return;

        if (!this._timerInitialized) {
            this.create();
            this._timerInitialized = true;
        }

        if (this.target) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

            if (distance > this._detectionRange) {
                super.update();

                if (!this._isAttacking && (this.body.velocity.x !== 0 || this.body.velocity.y !== 0)) {
                    this.anims.play("demon_walk", true);
                    if (this.body.velocity.x > 0) {
                        this.setFlipX(false);
                    } else if (this.body.velocity.x < 0) {
                        this.setFlipX(true);
                    }
                } else if (!this._isAttacking) {
                    this.anims.play("demon_idle", true);
                }
            } else {
                this.setVelocity(0, 0);
                if (!this._isAttacking) {
                    this.anims.play("demon_idle", true);
                }

                if (this.target.x > this.x) {
                    this.setFlipX(false);
                } else {
                    this.setFlipX(true);
                }
            }
        }
    }

    // --- Combat & State Logic ---

    /** Avvia la morte del demon e ferma il timer di sparo. */
    protected startDeath(): void {
        this._playDeathSfx();
        if (this._shootTimer) {
            this._shootTimer.destroy();
            this._shootTimer = null;
        }

        this._isAttacking = false;
        this.anims.play("demon_dead", true);
    }

    /** Esegue il tiro della fireball verso il target al termine dell'animazione di attacco. */
    private _shootFireball(): void {
        if (this._isDead || !this.target || !this.active || this._isAttacking) return;

        this._isAttacking = true;
        this.anims.play("demon_attack", true);
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "demon_attack", () => {
            if (!this.active || this._isDead || !this.target) {
                this._isAttacking = false;
                return;
            }

            const angle = Phaser.Math.Angle.Between(
                this.x,
                this.y,
                this.target.x + this._targetOffsetX,
                this.target.y + this._targetOffsetY,
            );
            const collidableLayers = this._mapManager ? this._mapManager.collidableLayers : [];

            const fireball = new Fireball(this.scene, this.x, this.y, this.target, collidableLayers);
            fireball.launch(angle);

            this._isAttacking = false;
        });
    }

    private _createAnimations(): void {
        if (!this.anims.exists("demon_idle")) {
            this.anims.create({
                key: "demon_idle",
                frames: this.anims.generateFrameNumbers("demon_idle", { start: 0, end: 5 }),
                frameRate: 6,
                repeat: -1,
            });
        }

        if (!this.anims.exists("demon_walk")) {
            this.anims.create({
                key: "demon_walk",
                frames: this.anims.generateFrameNumbers("demon_walk", { start: 0, end: 7 }),
                frameRate: 12,
                repeat: -1,
            });
        }

        if (!this.anims.exists("demon_attack")) {
            this.anims.create({
                key: "demon_attack",
                frames: this.anims.generateFrameNumbers("demon_attack", { start: 0, end: 6 }),
                frameRate: 8,
                repeat: 0,
            });
        }

        if (!this.anims.exists("demon_dead")) {
            this.anims.create({
                key: "demon_dead",
                frames: this.anims.generateFrameNumbers("demon_dead", { start: 0, end: 9 }),
                frameRate: 8,
                repeat: 0,
            });
        }
    }
}