import Phaser from "phaser";
import Actor from "./Actor";
import Enemy from "./Enemy";

// Personaggio controllato dal giocatore tramite WASD
export default class Player extends Actor {
    private _keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
        Q: Phaser.Input.Keyboard.Key;
    };
    private _keyE: Phaser.Input.Keyboard.Key;
    private _isAttacking: boolean = false;
    private readonly _meleeDamage: number = 25;
    private readonly _smashCooldownMs: number = 2000;
    private _canUseSmash: boolean = true;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player_idle");
        this._createAnimations();
        this.setSpeed(500);
        this.setHp(100);

        // Registra i tasti WASD per il movimento
        const kb = scene.input.keyboard!;
        this._keys = {
            W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            Q: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        };
        this._keyE = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // this.anims.play("idle", true);

        // Hitbox più piccola dello sprite per collisioni più precise
        this.setSize(32, 64);
        this.setOffset(16, 64);
        this.setOrigin(0, 0.5);
    }

    // Crea le animazioni idle, walk e attack dallo spritesheet
    private _createAnimations(): void {
            this.anims.create({
                key: "idle",
                frames: this.anims.generateFrameNumbers("player_idle", { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1,
            });

            this.anims.create({
                key: "walk",
                frames: this.anims.generateFrameNumbers("player_walk", { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1,
            });

            this.anims.create({
                key: "attack_mele",
                frames: this.anims.generateFrameNumbers("player_attack", { start: 0, end: 4 }),
                frameRate: 12,
                repeat: 0,
            });
            this.anims.create({
                key: "attack_smash",
                frames: this.anims.generateFrameNumbers("player_smash", { start: 0, end: 3 }),
                frameRate: 12,
                repeat: 0,
            });
        }
        
    // Legge l'input WASD, aggiorna direzione, animazione e hitbox
    update(): void {
        if (this._isAttacking) {
            this.setVelocity(0, 0);
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this._keys.Q)) {
            this.executeMelee();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this._keyE) && this._canUseSmash) {
            this.executeSmash();
            return;
        }

        const direction = new Phaser.Math.Vector2(0, 0);

        // Movimento orizzontale + flip dello sprite
        if (this._keys.A.isDown) {
            direction.x = -1;
            this.setFlipX(true);
            this.setOrigin(0.5, 0.5);
        } else if (this._keys.D.isDown) {
            direction.x = 1;
            this.setFlipX(false);
            this.setOrigin(0, 0.5);
        }

        // Riallinea la hitbox quando lo sprite è flippato
        const bodyOffsetX = this.flipX ? this.width - 48 : 16;
        (this.body as Phaser.Physics.Arcade.Body).setOffset(bodyOffsetX, 64);

        // Movimento verticale
        if (this._keys.W.isDown) {
            direction.y = -1;
        } else if (this._keys.S.isDown) {
            direction.y = 1;
        }

        const isMoving = direction.x !== 0 || direction.y !== 0;

        // Normalizza per evitare velocità diagonale maggiore
        if (isMoving) {
            direction.normalize();
            this.anims.play("walk", true);
        } else {
            this.anims.play("idle", true);
        }

        this.move(direction);
    }

    // Esegue un attacco melee con hitbox rettangolare davanti al player
    private executeMelee(): void {
        type SensorBody = Phaser.Physics.Arcade.Body & { isSensor?: boolean };
        const meleeWidth = 64;
        const meleeHeight = 44;
        const meleeOffsetX = this.flipX ? -48 : 48;

        this._isAttacking = true;
        this.setVelocity(0, 0);
        this.anims.play("attack_mele", true);

        const hitbox = this.scene.add.rectangle(this.x + meleeOffsetX, this.y, meleeWidth, meleeHeight, 0xffffff, 0);
        this.scene.physics.add.existing(hitbox);

        const hitboxBody = hitbox.body as SensorBody;
        hitboxBody.setAllowGravity(false);
        hitboxBody.setImmovable(true);
        hitboxBody.isSensor = true;

        const hitEnemies: Enemy[] = [];
        for (const enemy of this._getActiveEnemies()) {
            if (this.scene.physics.overlap(hitbox, enemy)) {
                enemy.takeDamage(this._meleeDamage);
                hitEnemies.push(enemy);
            }
        }

        if (hitEnemies.length > 0) {
            this._applyHitFeedback(hitEnemies);
        }

        this.scene.tweens.add({
            targets: hitbox,
            scaleX: 0,
            scaleY: 0,
            duration: 100,
            onComplete: () => {
                hitbox.destroy();
            },
        });

        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "attack_mele", () => {
            this._isAttacking = false;
        });
    }

    // Perk "Smash Attack": onda circolare con danno radiale e cooldown
    private executeSmash(): void {
        this._canUseSmash = false;
        this._isAttacking = true;
        this.setVelocity(0, 0);

        const radius = 120;
        const smashDamage = this._meleeDamage * 2;

        const smashHitbox = this.scene.add.rectangle(this.x, this.y, radius * 2, radius * 2, 0xffffff, 0);
        this.scene.physics.add.existing(smashHitbox);

        const smashBody = smashHitbox.body as Phaser.Physics.Arcade.Body;
        smashBody.setAllowGravity(false);
        smashBody.setImmovable(true);
        smashBody.setCircle(radius);
        this.anims.play("attack_smash", true);
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "attack_smash", () => {
            this._isAttacking = false;
        });


        const shockwave = this.scene.add.circle(this.x, this.y, 16, 0x88ccff, 0.45);
        this.scene.tweens.add({
            targets: shockwave,
            radius,
            alpha: 0,
            duration: 180,
            onComplete: () => {
                shockwave.destroy();
            },
        });
        this.scene.cameras.main.shake(200, 0.02);

        const hitEnemies = new Set<Enemy>();
        const overlapColliders: Phaser.Physics.Arcade.Collider[] = [];
        for (const enemy of this._getActiveEnemies()) {
            const collider = this.scene.physics.add.overlap(smashHitbox, enemy, () => {
                if (!enemy.active || hitEnemies.has(enemy)) return;
                enemy.takeDamage(smashDamage);
                hitEnemies.add(enemy);
            });
            overlapColliders.push(collider);
        }

        this.scene.time.delayedCall(100, () => {
            for (const collider of overlapColliders) {
                collider.destroy();
            }
            smashHitbox.destroy();

            if (hitEnemies.size > 0) {
                this._applyHitFeedback(Array.from(hitEnemies));
            }
        });

        this.scene.time.addEvent({
            delay: this._smashCooldownMs,
            callback: () => {
                this._canUseSmash = true;
            },
        });
    }

    private _getActiveEnemies(): Enemy[] {
        return this.scene.children.list.filter((gameObject): gameObject is Enemy => {
            return gameObject instanceof Enemy && gameObject.active;
        });
    }

    private _applyHitFeedback(enemies: Enemy[]): void {
        this.scene.cameras.main.shake(120, 0.01);
        for (const enemy of enemies) {
            enemy.setTint(0xff5555);
            this.scene.time.delayedCall(120, () => {
                if (enemy.active) {
                    enemy.clearTint();
                }
            });
        }
    }

    
}
