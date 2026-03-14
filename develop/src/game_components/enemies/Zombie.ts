import Enemy from "../Enemy";
import Player from "../Player";

// Nemico di tipo zombie.
export default class Zombie extends Enemy {
    // --- Configuration Properties (bilanciamento) ---
    private readonly _baseDamage: number = 18;
    private readonly _chaseSpeed: number = 180;
    private readonly _baseHp: number = 140;
    private readonly _soulsReward: number = 10;
    private readonly _attackRange: number = 50;
    private readonly _attackDelay: number = 900;

    // --- Runtime State ---
    private _canAttack: boolean = true;
    private _isAttacking: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Player) {
        super(scene, x, y, "zombie_idle", target);

        this._setBaseStats(
            this._baseDamage,
            this._baseHp,
            this._soulsReward,
        );
        this.setSpeed(this._chaseSpeed);

        this.create();
    }

    // --- Getters ---
    get chaseSpeed(): number {
        return this._chaseSpeed;
    }

    get attackRange(): number {
        return this._attackRange;
    }

    get attackDelay(): number {
        return this._attackDelay;
    }

    // --- Phaser Lifecycle ---

    create(): void {
        this._createAnimations();
        this.setScale(1.5);
        this.body.setSize(40, 65).setOffset(44, 63);
    }

    /** Gestisce inseguimento, attacco e animazioni dello zombie. */
    update(): void {
        if (this._isDead) return;
        super.update();

        if (this.target && Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < this._attackRange) {
            this.setVelocity(0, 0);
            this._handleAttack();
        } else if (!this._isAttacking) {
            if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
                this.anims.play("zombie_walk", true);
                if (this.body.velocity.x > 0) {
                    this.setFlipX(false);
                } else if (this.body.velocity.x < 0) {
                    this.setFlipX(true);
                }
            } else {
                this.anims.play("zombie_idle", true);
            }
        }
    }

    // --- Combat & State Logic ---

    /** Avvia l'animazione di morte dello zombie. */
    protected startDeath(): void {
        this._playDeathSfx();
        this.anims.play("zombie_dead", true);
    }

    /** Gestisce l'attacco melee con delay fisso tra un colpo e il successivo. */
    private _handleAttack(): void {
        if (!this.target) return;

        if (this._canAttack && !this._isAttacking) {
            this._canAttack = false;
            this._isAttacking = true;
            this.anims.play("zombie_attack", true);

            this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "zombie_attack", () => {
                if (this.target && this.active) {
                    this.target.takeDamage(this.damage);
                }

                this.scene.time.delayedCall(this._attackDelay, () => {
                    this._canAttack = true;
                    this._isAttacking = false;
                });
            });
        }
    }

    private _createAnimations(): void {
        if (!this.anims.exists("zombie_idle")) {
            this.anims.create({
                key: "zombie_idle",
                frames: this.anims.generateFrameNumbers("zombie_idle", { start: 0, end: 5 }),
                frameRate: 6,
                repeat: -1,
            });
        }

        if (!this.anims.exists("zombie_walk")) {
            this.anims.create({
                key: "zombie_walk",
                frames: this.anims.generateFrameNumbers("zombie_walk", { start: 0, end: 9 }),
                frameRate: 12,
                repeat: -1,
            });
        }

        if (!this.anims.exists("zombie_attack")) {
            this.anims.create({
                key: "zombie_attack",
                frames: this.anims.generateFrameNumbers("zombie_attack", { start: 0, end: 3 }),
                frameRate: 5,
                repeat: 0,
            });
        }

        if (!this.anims.exists("zombie_dead")) {
            this.anims.create({
                key: "zombie_dead",
                frames: this.anims.generateFrameNumbers("zombie_dead", { start: 0, end: 4 }),
                frameRate: 8,
                repeat: 0,
            });
        }
    }
}