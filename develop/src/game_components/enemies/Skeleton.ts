import Enemy from "../Enemy";
import Player from "../Player";

// Nemico di tipo scheletro con abilità di Carica Rapida (dash).
export default class Skeleton extends Enemy {
    // --- Configuration Properties (bilanciamento) ---
    private readonly _baseDamage: number = 20;
    private readonly _normalSpeed: number = 320;
    private readonly _baseHp: number = 90;
    private readonly _soulsReward: number = 25;
    protected readonly _dashSpeed: number = 600;
    protected readonly _dashRange: number = 400;
    private readonly _dashDuration: number = 420;
    private readonly _dashCooldownDuration: number = 2600;
    private readonly _attackRange: number = 50;
    private readonly _attackDelay: number = 520;

    // --- Runtime State ---
    protected _dashCooldown: boolean = false;
    private _isDashing: boolean = false;
    private _canAttack: boolean = true;
    private _isAttacking: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Player) {
        super(scene, x, y, "skeleton_idle", target);

        this._setBaseStats(
            this._baseDamage,
            this._baseHp,
            this._soulsReward,
        );
        this.setSpeed(this._normalSpeed);

        this.create();
    }

    // --- Getters ---
    get dashSpeed(): number {
        return this._dashSpeed;
    }

    get dashRange(): number {
        return this._dashRange;
    }

    get dashCooldownDuration(): number {
        return this._dashCooldownDuration;
    }

    // --- Phaser Lifecycle ---

    create(): void {
        this._createAnimations();
        this.setScale(2.25);
        this.body.setSize(40, 65).setOffset(44, 63);
    }

    /** Gestisce inseguimento, dash e animazioni dello skeleton. */
    update(): void {
        if (this._isDead || !this.target) return;

        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

        if (distance < this._attackRange) {
            this.setVelocity(0, 0);
            this._handleAttack();
        } else if (distance < this._dashRange && !this._dashCooldown && !this._isDashing) {
            this.performDash();
        } else if (!this._isDashing) {
            super.update();
        }

        if (!this._isDashing && !this._isAttacking) {
            if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
                this.anims.play("skeleton_walk", true);
                if (this.body.velocity.x > 0) {
                    this.setFlipX(false);
                } else if (this.body.velocity.x < 0) {
                    this.setFlipX(true);
                }
            } else {
                this.anims.play("skeleton_idle", true);
            }
        }
    }

    // --- Combat & State Logic ---

    /** Gestisce l'attacco melee con finestra di cooldown fissa. */
    private _handleAttack(): void {
        if (!this.target) return;

        if (this._canAttack && !this._isAttacking) {
            this._canAttack = false;
            this._isAttacking = true;
            this.anims.play("skeleton_attack", true);

            this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "skeleton_attack", () => {
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

    /** Esegue la carica rapida e gestisce durata/cooldown. */
    private performDash(): void {
        if (!this.target || !this.active) return;

        this._dashCooldown = true;
        this._isDashing = true;
        this.setTint(0xff0000);
        this.scene.physics.moveToObject(this, this.target, this._dashSpeed);

        this.scene.time.delayedCall(this._dashDuration, () => {
            if (!this.active || this._isDead) return;

            this.setVelocity(0, 0);
            this.clearTint();
            this._isDashing = false;

            this.scene.time.delayedCall(this._dashCooldownDuration, () => {
                if (!this.active || this._isDead) return;
                this._dashCooldown = false;
            });
        });
    }

    /** Avvia l'animazione di morte dello skeleton. */
    protected startDeath(): void {
        this._playDeathSfx();
        this.anims.play("skeleton_dead", true);
    }

    private _createAnimations(): void {
        if (!this.anims.exists("skeleton_idle")) {
            this.anims.create({
                key: "skeleton_idle",
                frames: this.anims.generateFrameNumbers("skeleton_idle", { start: 0, end: 6 }),
                frameRate: 6,
                repeat: -1,
            });
        }

        if (!this.anims.exists("skeleton_walk")) {
            this.anims.create({
                key: "skeleton_walk",
                frames: this.anims.generateFrameNumbers("skeleton_walk", { start: 0, end: 6 }),
                frameRate: 12,
                repeat: -1,
            });
        }

        if (!this.anims.exists("skeleton_attack")) {
            this.anims.create({
                key: "skeleton_attack",
                frames: this.anims.generateFrameNumbers("skeleton_attack", { start: 0, end: 3 }),
                frameRate: 5,
                repeat: 0,
            });
        }

        if (!this.anims.exists("skeleton_dead")) {
            this.anims.create({
                key: "skeleton_dead",
                frames: this.anims.generateFrameNumbers("skeleton_dead", { start: 0, end: 3 }),
                frameRate: 8,
                repeat: 0,
            });
        }
    }
}