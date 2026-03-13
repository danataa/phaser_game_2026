import Phaser from "phaser";
import Actor from "./Actor";
import Enemy from "./Enemy";

type PlayerPerkType = "dash" | "heal" | "smash";

interface BasePerkConfig {
    type: PlayerPerkType;
    animeCost: number;
}

interface DashPerkConfig extends BasePerkConfig {
    type: "dash";
    speedMultiplier: number;
    durationMs: number;
}

interface HealPerkConfig extends BasePerkConfig {
    type: "heal";
    healPercent: number;
}

interface SmashPerkConfig extends BasePerkConfig {
    type: "smash";
    radius: number;
    damageMultiplier: number;
    shakeDurationMs: number;
    shakeIntensity: number;
    flashDurationMs: number;
}

type PlayerPerkConfig = DashPerkConfig | HealPerkConfig | SmashPerkConfig;

// Personaggio controllato dal giocatore tramite WASD
export default class Player extends Actor {
    private static readonly MAX_PERK_SLOTS: number = 2;
    private _keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
        Q: Phaser.Input.Keyboard.Key;
        E: Phaser.Input.Keyboard.Key;
    };
    private _isAttacking: boolean = false;
    private _isDashing: boolean = false;
    private readonly _meleeDamage: number = 25;
    private readonly _baseSpeed: number = 500;
    private readonly _maxHp: number = 100;
    private readonly _bulletSpeed: number = 900;
    private readonly _recoilDistance: number = 8;
    private readonly _shotSoundKey: string = "shot";
    private readonly _bullets: Phaser.Physics.Arcade.Group;
    private _hasWarnedMissingShotSound: boolean = false;
    private readonly _lastMoveDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
    private readonly _equippedPerks: PlayerPerkConfig[] = [];
    private readonly _onPointerDown = (pointer: Phaser.Input.Pointer): void => {
        if (pointer.button !== 0 || !this.active) {
            return;
        }
        this.fireBasicAttack();
    };
    private readonly _perkCatalog: Record<PlayerPerkType, PlayerPerkConfig> = {
        dash: {
            type: "dash",
            animeCost: 30,
            speedMultiplier: 2.8,
            durationMs: 200,
        },
        heal: {
            type: "heal",
            animeCost: 40,
            healPercent: 0.1,
        },
        smash: {
            type: "smash",
            animeCost: 60,
            radius: 120,
            damageMultiplier: 2,
            shakeDurationMs: 220,
            shakeIntensity: 0.03,
            flashDurationMs: 100,
        },
    };

    private readonly _smashCooldownMs: number = 2000;
    private _canUseSmash: boolean = true;
    public playerSouls: number = 0;
    private readonly _onUpdateScore: (souls: number) => void;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player_idle");
        this._createAnimations();
        this.setSpeed(this._baseSpeed);
        this.setHp(this._maxHp);

        // Registra i tasti WASD per il movimento
        const kb = scene.input.keyboard!;
        this._keys = {
            W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            Q: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            E: kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        };

        this._onUpdateScore = (souls: number) => {
            this.playerSouls += souls;
        };
        this.scene.events.on("update-score", this._onUpdateScore);
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.events.off("update-score", this._onUpdateScore);
        });

        // this.anims.play("idle", true);

        // Hitbox più piccola dello sprite per collisioni più precise
        this.setSize(32, 64);
        this.setOffset(16, 64);
        this.setOrigin(0, 0.5);

        this._bullets = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 80,
            runChildUpdate: false,
        });
        scene.input.on(Phaser.Input.Events.POINTER_DOWN, this._onPointerDown);
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            scene.input.off(Phaser.Input.Events.POINTER_DOWN, this._onPointerDown);
        });
    }

    public get getPlayerSouls(): number {
        return this.playerSouls;
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
        this._updateAimToPointer();
        this._cleanupBulletsOutsideWorldView();

        if (this._isAttacking) {
            this.setVelocity(0, 0);
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this._keys.Q)) {
            this._activatePerkSlot(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this._keys.E)) {
            this._activatePerkSlot(1);
        }

        if (this._isAttacking || this._isDashing) {
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
            this._lastMoveDirection.copy(direction);
            this.anims.play("walk", true);
        } else {
            this.anims.play("idle", true);
        }

        this.move(direction);
    }

    private fireBasicAttack(): void {
        if (this._isAttacking) {
            return;
        }

        const bullet = this._bullets.get(this.x, this.y, "demon_bullet", 0) as Phaser.Physics.Arcade.Image | null;
        if (!bullet) {
            return;
        }

        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(this.x, this.y);
        bullet.setRotation(this.rotation);

        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
        bulletBody.enable = true;
        bulletBody.setAllowGravity(false);
        bulletBody.setVelocity(0, 0);
        this.scene.physics.velocityFromRotation(this.rotation, this._bulletSpeed, bulletBody.velocity);

        this.x -= Math.cos(this.rotation) * this._recoilDistance;
        this.y -= Math.sin(this.rotation) * this._recoilDistance;

        if (this.scene.cache.audio.exists(this._shotSoundKey)) {
            this.scene.sound.play(this._shotSoundKey);
        } else if (!this._hasWarnedMissingShotSound) {
            this._hasWarnedMissingShotSound = true;
            console.warn("[Player] Missing audio key 'shot' for basic attack.");
        }
    }

    addPerk(newPerk: PlayerPerkType): boolean {
        const perkConfig = this._perkCatalog[newPerk];
        const availableAnime = Number(this.scene.registry.get("anime") ?? 0);
        if (availableAnime < perkConfig.animeCost) {
            return false;
        }

        this.scene.registry.set("anime", availableAnime - perkConfig.animeCost);
        if (this._equippedPerks.length === Player.MAX_PERK_SLOTS) {
            this._equippedPerks.shift();
        }
        this._equippedPerks.push(perkConfig);
        return true;
    }

    private _activatePerkSlot(slotIndex: number): void {
        const perk = this._equippedPerks[slotIndex];
        if (!perk) {
            return;
        }

        switch (perk.type) {
            case "dash":
                this._executeDash(perk);
                break;
            case "heal":
                this._executeHeal(perk);
                break;
            case "smash":
                this._executeSmash(perk);
                break;
        }
    }

    private _executeDash(perk: DashPerkConfig): void {
        if (this._isDashing || this._isAttacking) {
            return;
        }
        const dashDirection = this._getDashDirection();
        this._isDashing = true;
        this.setVelocity(
            dashDirection.x * this._baseSpeed * perk.speedMultiplier,
            dashDirection.y * this._baseSpeed * perk.speedMultiplier
        );
        this.scene.time.delayedCall(perk.durationMs, () => {
            this._isDashing = false;
        });
    }

    private _executeHeal(perk: HealPerkConfig): void {
        const healedHp = Math.min(this.getHp + this._maxHp * perk.healPercent, this._maxHp);
        this.setHp(healedHp);
    }

    private _executeSmash(perk: SmashPerkConfig): void {
        this._isAttacking = true;
        this.setVelocity(0, 0);

        const smashHitbox = this.scene.add.circle(this.x, this.y, perk.radius, 0xffffff, 0);
        this.scene.physics.add.existing(smashHitbox);

        const smashBody = smashHitbox.body as Phaser.Physics.Arcade.Body;
        smashBody.setAllowGravity(false);
        smashBody.setImmovable(true);
        smashBody.setCircle(perk.radius);
        smashBody.setOffset(-perk.radius, -perk.radius);

        const smashDamage = this._meleeDamage * perk.damageMultiplier;
        const hitEnemies: Enemy[] = [];
        for (const enemy of this._getActiveEnemies()) {
            if (this.scene.physics.overlap(smashHitbox, enemy)) {
                enemy.takeDamage(smashDamage);
                hitEnemies.push(enemy);
            }
        }

        smashHitbox.destroy();

        if (hitEnemies.length > 0) {
            this._applyHitFeedback(hitEnemies);
        }

        this.scene.cameras.main.shake(perk.shakeDurationMs, perk.shakeIntensity);
        this.setTintFill(0xffffff);
        this.scene.time.delayedCall(perk.flashDurationMs, () => {
            if (this.active) {
                this.clearTint();
            }
        });

        this.anims.play("attack_smash", true);
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "attack_smash", () => {
            this._isAttacking = false;
        });
    }

    private _getDashDirection(): Phaser.Math.Vector2 {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body.speed > 0) {
            return body.velocity.clone().normalize();
        }
        if (this._lastMoveDirection.lengthSq() > 0) {
            return this._lastMoveDirection.clone().normalize();
        }
        return new Phaser.Math.Vector2(this.flipX ? -1 : 1, 0);
    }

    private _updateAimToPointer(): void {
        const pointer = this.scene.input.activePointer;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
        this.setRotation(angle);
    }

    private _cleanupBulletsOutsideWorldView(): void {
        const worldView = this.scene.cameras.main.worldView;
        for (const child of this._bullets.getChildren()) {
            const bullet = child as Phaser.Physics.Arcade.Image;
            if (!bullet.active) {
                continue;
            }

            if (!worldView.contains(bullet.x, bullet.y)) {
                bullet.destroy();
            }
        }
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
