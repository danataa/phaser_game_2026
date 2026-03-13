import Phaser from "phaser";
import Actor from "./Actor";
import Enemy from "./Enemy";
import type { IPerk } from "./Perks";

// Personaggio controllato dal giocatore tramite WASD
export default class Player extends Actor {
    private _keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
        Q: Phaser.Input.Keyboard.Key;
        E: Phaser.Input.Keyboard.Key;
    };
    private _equippedPerks: IPerk[] = [];
    private readonly _maxPerkSlots: number = 2;
    private readonly _baseMoveSpeed: number = 500;
    private readonly _maxHp: number = 100;
    private _lastMoveDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
    private _isDashing: boolean = false;
    private _dashTimer: Phaser.Time.TimerEvent | null = null;
    private _currentWave: number = 1;
    private readonly _perkCostWaveMultiplier: number = 0.15;
    private readonly _perkEffectWaveMultiplier: number = 0.08;
    private readonly _meleeDamage: number = 25;
    private readonly _basicAttackHitboxLifetimeMs: number = 100;
    private readonly _basicAttackCooldownMs: number = 260;
    private playerSouls: number = 0;
    private _canUseBasicAttack: boolean = true;
    private _isBasicAttacking: boolean = false;
    private _wasRightMouseDown: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player_idle");
        this._createAnimations();
        this.setSpeed(this._baseMoveSpeed);
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

        this.scene.events.on("update-score", this._onUpdateScore, this);
        if (this.scene.input.mouse) {
            this.scene.input.mouse.disableContextMenu();
        }
        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this._onPointerDown, this);

        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim: Phaser.Animations.Animation) => {
            if (anim.key === "attack_mele") {
                this._isBasicAttacking = false;
            }
        });

        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.events.off("update-score", this._onUpdateScore, this);
            this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this._onPointerDown, this);
            if (this._dashTimer) {
                this._dashTimer.remove(false);
                this._dashTimer = null;
            }
        });

        // this.anims.play("idle", true);

        // Hitbox più piccola dello sprite per collisioni più precise
        this.setSize(32, 64);
        this.setOffset(32, 64);
        this.setOrigin(0, 0.5);
    }

    public get getPlayerSouls(): number {
        return this.playerSouls;
    }

    public get equippedPerks(): readonly IPerk[] {
        return this._equippedPerks;
    }

    public get baseAttackDamage(): number {
        return this._meleeDamage;
    }

    public setCurrentWave(wave: number): void {
        this._currentWave = Math.max(1, Math.floor(wave));
    }

    public buyPerk(newPerk: IPerk): { purchased: boolean; finalCost: number; replacedPerk: IPerk | null } {
        const waveOffset = Math.max(0, this._currentWave - 1);
        const costMultiplier = 1 + waveOffset * this._perkCostWaveMultiplier;
        const effectivenessMultiplier = 1 + waveOffset * this._perkEffectWaveMultiplier;
        const finalCost = Math.ceil(newPerk.baseCost * costMultiplier);

        if (this.playerSouls < finalCost) {
            return { purchased: false, finalCost, replacedPerk: null };
        }

        this.playerSouls -= finalCost;
        newPerk.setEffectivenessMultiplier(effectivenessMultiplier);

        let replacedPerk: IPerk | null = null;
        if (this._equippedPerks.length >= this._maxPerkSlots) {
            replacedPerk = this._equippedPerks.shift() ?? null;
        }

        this._equippedPerks.push(newPerk);
        return { purchased: true, finalCost, replacedPerk };
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
        if (this._isDashing) {
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this._keys.Q)) {
            this._activatePerkSlot(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this._keys.E)) {
            this._activatePerkSlot(1);
        }

        const pointer = this.scene.input.activePointer;
        const isRightMouseDown = pointer.rightButtonDown();
        if (isRightMouseDown && !this._wasRightMouseDown) {
            this.executeMelee();
        }
        this._wasRightMouseDown = isRightMouseDown;

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
            if (!this._isBasicAttacking) {
                this.anims.play("walk", true);
            }
        } else {
            if (!this._isBasicAttacking) {
                this.anims.play("idle", true);
            }
        }

        this.move(direction);
    }

    private _onPointerDown(pointer: Phaser.Input.Pointer): void {
        const isRightClick =
            pointer.rightButtonDown() ||
            pointer.button === 2 ||
            ((pointer.buttons & 2) !== 0) ||
            (!!pointer.event && "button" in pointer.event && (pointer.event as MouseEvent).button === 2);

        if (!isRightClick) {
            return;
        }

        this.executeMelee();
    }

    private executeMelee(): void {
        if (!this.active || !this.body || !this._canUseBasicAttack || this._isDashing) {
            return;
        }

        type SensorBody = Phaser.Physics.Arcade.Body & { isSensor?: boolean };
        const playerBody = this.body as Phaser.Physics.Arcade.Body;
        const meleeOffsetX = this.flipX ? -playerBody.width : playerBody.width;
        const hitboxX = playerBody.center.x + meleeOffsetX;
        const hitboxY = playerBody.center.y;

        this._canUseBasicAttack = false;
        this._isBasicAttacking = true;
        this.anims.play("attack_mele", true);

        const meleeHitbox = this.scene.add.rectangle(
            hitboxX,
            hitboxY,
            playerBody.width,
            playerBody.height,
            0xff0000,
            0,
        );
        meleeHitbox.setSize(playerBody.width, playerBody.height);
        meleeHitbox.setOrigin(0.5, 0.5);
        meleeHitbox.setStrokeStyle(2, 0xff0000);
        this.scene.physics.add.existing(meleeHitbox);

        const meleeBody = meleeHitbox.body as SensorBody;
        meleeBody.setAllowGravity(false);
        meleeBody.setImmovable(true);
        meleeBody.isSensor = true;

        const hitEnemies: Enemy[] = [];
        for (const enemy of this.getActiveEnemies()) {
            if (this.scene.physics.overlap(meleeHitbox, enemy)) {
                enemy.takeDamage(this._meleeDamage);
                hitEnemies.push(enemy);
            }
        }

        if (hitEnemies.length > 0) {
            this._applyHitFeedback(hitEnemies);
        }

        this.scene.time.delayedCall(this._basicAttackHitboxLifetimeMs, () => {
            if (meleeHitbox.active) {
                meleeHitbox.destroy();
            }
        });

        this.scene.time.delayedCall(this._basicAttackCooldownMs, () => {
            this._canUseBasicAttack = true;
        });
    }

    public dashInCurrentDirection(speedMultiplier: number, durationMs: number): void {
        if (this._isDashing || !this.body) {
            return;
        }

        const dashDirection = this._lastMoveDirection.clone();
        if (dashDirection.lengthSq() === 0) {
            dashDirection.set(this.flipX ? -1 : 1, 0);
        }
        dashDirection.normalize();

        const dashBody = this.body as Phaser.Physics.Arcade.Body;
        this._isDashing = true;
        dashBody.setVelocity(
            dashDirection.x * this._baseMoveSpeed * speedMultiplier,
            dashDirection.y * this._baseMoveSpeed * speedMultiplier,
        );

        if (this._dashTimer) {
            this._dashTimer.remove(false);
        }

        this._dashTimer = this.scene.time.delayedCall(durationMs, () => {
            this._isDashing = false;
            if (this.active && this.body) {
                (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
            }
            this._dashTimer = null;
        });
    }

    public healByPercentOfCurrent(percentage: number): number {
        const clampedPercentage = Math.max(0, percentage);
        const currentHp = this.getHp;
        const healAmount = currentHp * clampedPercentage;
        const nextHp = Phaser.Math.Clamp(currentHp + healAmount, 0, this._maxHp);
        this.setHp(nextHp);
        return nextHp - currentHp;
    }

    public getActiveEnemies(): Enemy[] {
        return this.scene.children.list.filter((gameObject): gameObject is Enemy => {
            if (!(gameObject instanceof Enemy) || !gameObject.active) {
                return false;
            }

            const enemyBody = gameObject.body as Phaser.Physics.Arcade.Body | null;
            return !!enemyBody && enemyBody.enable;
        });
    }

    public triggerPerkFeedback(): void {
        this.scene.cameras.main.shake(100, 0.01);
        this.setTintFill(0xffffff);
        this.scene.time.delayedCall(90, () => {
            if (this.active) {
                this.clearTint();
            }
        });
    }

    private _activatePerkSlot(index: number): void {
        const perk = this._equippedPerks[index];
        if (!perk) {
            return;
        }

        perk.activate(this);
    }

    private _onUpdateScore(souls: number): void {
        this.playerSouls += souls;
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
