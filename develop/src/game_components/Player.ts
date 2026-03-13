import Phaser from "phaser";
import Actor from "./Actor";
import Enemy from "./Enemy";
import type Perk from "./perks/Perk";

// Personaggio controllato dal giocatore tramite WASD
export default class Player extends Actor {
    // --- Configuration Properties ---
    private readonly _maxHp: number = 100;
    private readonly _baseAttackDamage: number = 25;
    private readonly _baseAttackRange: number = 56;
    private readonly _baseAttackWidth: number = 64;
    private readonly _baseAttackHeight: number = 44;
    private readonly _dashDirectionEpsilon: number = 0.0001;
    private readonly _dashOverlayAlpha: number = 0.45;
    private readonly _dashOverlayTint: number = 0xffdd44;

    // --- Input & State ---
    private _keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
        Q: Phaser.Input.Keyboard.Key;
        E: Phaser.Input.Keyboard.Key;
    };

    // --- Perk Slots ---
    private _perkSlotQ: Perk | null = null;
    private _perkSlotE: Perk | null = null;

    // --- Combat State ---
    private _isAttacking: boolean = false;
    private _isDashing: boolean = false;
    private _lastMoveDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player_idle");
        this._createAnimations();
        this.setSpeed(500);
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

        // this.anims.play("idle", true);

        // Hitbox più piccola dello sprite per collisioni più precise
        this.setSize(32, 64);
        this.setOffset(16, 64);
        this.setOrigin(0, 0.5);

        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this._onPointerDown, this);
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this._onPointerDown, this);
        });
    }

    get maxHp(): number {
        return this._maxHp;
    }

    get perkSlotQ(): Perk | null {
        return this._perkSlotQ;
    }

    get perkSlotE(): Perk | null {
        return this._perkSlotE;
    }

    setPerkSlotQ(perk: Perk | null): void {
        this._perkSlotQ = perk;
    }

    setPerkSlotE(perk: Perk | null): void {
        this._perkSlotE = perk;
    }

    setPerk(slot: "Q" | "E", perk: Perk | null): void {
        if (slot === "Q") {
            this.setPerkSlotQ(perk);
            return;
        }
        this.setPerkSlotE(perk);
    }

    healByPercent(healPercent: number): void {
        const clampedPercent = Phaser.Math.Clamp(healPercent, 0, 1);
        const healAmount = Math.ceil(this._maxHp * clampedPercent);
        const nextHp = Math.min(this.getHp + healAmount, this._maxHp);
        this.setHp(nextHp);
    }

    get isDashing(): boolean {
        return this._isDashing;
    }

    get isAttacking(): boolean {
        return this._isAttacking;
    }

    get lastMoveDirection(): Phaser.Math.Vector2 {
        return this._lastMoveDirection.clone();
    }

    /**
     * Il perk deve leggere una direzione deterministica nello stesso frame di input.
     * Usiamo priorita': velocita' reale -> WASD corrente -> ultima direzione/facing.
     */
    getDashDirectionSnapshot(): Phaser.Math.Vector2 {
        const body = this.body as Phaser.Physics.Arcade.Body;
        const direction = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y);

        if (direction.lengthSq() <= this._dashDirectionEpsilon) {
            direction.copy(this._getCurrentInputDirection());
        }

        if (direction.lengthSq() <= this._dashDirectionEpsilon) {
            direction.copy(this._lastMoveDirection);
        }

        if (direction.lengthSq() <= this._dashDirectionEpsilon) {
            direction.set(this.flipX ? -1 : 1, 0);
        }

        return direction.normalize();
    }

    /**
     * Applica il dash come impulso fisico continuo (non teleport) per mantenere
     * collisioni affidabili e coerenza con il sistema Arcade durante la finestra di scatto.
     */
    startDash(direction: Phaser.Math.Vector2, dashPower: number, dashDurationMs: number): boolean {
        if (this._isDashing || this._isAttacking || dashPower <= 0 || dashDurationMs <= 0) {
            return false;
        }

        const dashDirection = direction.clone();
        if (dashDirection.lengthSq() <= this._dashDirectionEpsilon) {
            return false;
        }

        dashDirection.normalize();
        this._lastMoveDirection = dashDirection.clone();

        const body = this.body as Phaser.Physics.Arcade.Body;
        const originalDragX = body.drag.x;
        const originalDragY = body.drag.y;
        const originalUseDamping = body.useDamping;

        this._isDashing = true;
        body.setDrag(0, 0);
        body.useDamping = false;
        this.setVelocity(dashDirection.x * dashPower, dashDirection.y * dashPower);
        this._spawnDashOverlay(dashDurationMs);

        this.scene.time.delayedCall(dashDurationMs, () => {
            if (!this.active) {
                return;
            }

            this.setVelocity(0, 0);
            body.setDrag(originalDragX, originalDragY);
            body.useDamping = originalUseDamping;
            this._isDashing = false;
        });

        return true;
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

    private _onPointerDown(pointer: Phaser.Input.Pointer): void {
        if (pointer.button !== 0 || this._isAttacking || this._isDashing) {
            return;
        }

        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this._executeBaseAttack(worldPoint.x, worldPoint.y);
    }
        
    // Legge l'input WASD, aggiorna direzione, animazione e hitbox
    update(): void {
        if (this._isAttacking) {
            this.setVelocity(0, 0);
            return;
        }

        if (this._isDashing) {
            return;
        }

        const direction = this._getCurrentInputDirection();
        const isMoving = direction.lengthSq() > 0;

        if (isMoving) {
            direction.normalize();
            this._lastMoveDirection = direction.clone();
        }

        if (Phaser.Input.Keyboard.JustDown(this._keys.Q) && this._perkSlotQ) {
            this._perkSlotQ.execute();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this._keys.E) && this._perkSlotE) {
            this._perkSlotE.execute();
            return;
        }

        // Movimento orizzontale + flip dello sprite
        if (direction.x < 0) {
            this._applyHorizontalFacing(true);
        } else if (direction.x > 0) {
            this._applyHorizontalFacing(false);
        }

        // Animazione + movimento
        if (isMoving) {
            this.anims.play("walk", true);
        } else {
            this.anims.play("idle", true);
        }

        this.move(direction);
    }

    private _getCurrentInputDirection(): Phaser.Math.Vector2 {
        const direction = new Phaser.Math.Vector2(0, 0);
        const left = this._keys.A.isDown;
        const right = this._keys.D.isDown;
        const up = this._keys.W.isDown;
        const down = this._keys.S.isDown;

        if (left !== right) {
            direction.x = left ? -1 : 1;
        }

        if (up !== down) {
            direction.y = up ? -1 : 1;
        }

        return direction;
    }

    private _spawnDashOverlay(durationMs: number): void {
        const overlay = this.scene.add.sprite(this.x, this.y, this.texture.key, this.frame.name);
        overlay.setScale(this.scaleX, this.scaleY);
        overlay.setOrigin(this.originX, this.originY);
        overlay.setFlipX(this.flipX);
        overlay.setFlipY(this.flipY);
        overlay.setDepth(this.depth + 1);
        overlay.setTint(this._dashOverlayTint);
        overlay.setAlpha(this._dashOverlayAlpha);

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0,
            duration: durationMs,
            ease: "Sine.Out",
            onUpdate: () => {
                overlay.setPosition(this.x, this.y);
            },
            onComplete: () => {
                overlay.destroy();
            },
        });
    }

    // Esegue un attacco base verso la posizione target nel mondo
    private _executeBaseAttack(targetX: number, targetY: number): void {
        type SensorBody = Phaser.Physics.Arcade.Body & { isSensor?: boolean };

        const attackDirection = new Phaser.Math.Vector2(targetX - this.x, targetY - this.y);
        if (attackDirection.lengthSq() <= this._dashDirectionEpsilon) {
            attackDirection.set(this.flipX ? -1 : 1, 0);
        }
        attackDirection.normalize();
        if (attackDirection.x !== 0) {
            // Allinea facing/origin/offset con la stessa logica del movimento A-D
            // per evitare snap di posizione al termine dell'animazione.
            this._applyHorizontalFacing(attackDirection.x < 0);
        }

        const meleeOffsetX = attackDirection.x * this._baseAttackRange;
        const meleeOffsetY = attackDirection.y * this._baseAttackRange;

        this._isAttacking = true;
        this.setVelocity(0, 0);
        this.anims.play("attack_mele", true);

        const hitbox = this.scene.add.rectangle(
            this.x + meleeOffsetX,
            this.y + meleeOffsetY,
            this._baseAttackWidth,
            this._baseAttackHeight,
            0xffffff,
            0,
        );
        this.scene.physics.add.existing(hitbox);

        const hitboxBody = hitbox.body as SensorBody;
        hitboxBody.setAllowGravity(false);
        hitboxBody.setImmovable(true);
        hitboxBody.isSensor = true;

        const hitEnemies: Enemy[] = [];
        for (const enemy of this._getActiveEnemies()) {
            if (this.scene.physics.overlap(hitbox, enemy)) {
                enemy.takeDamage(this._baseAttackDamage);
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

    /**
     * Manteniamo in un solo punto la sincronizzazione tra flip, origin e offset body.
     * Questo evita shift visivi quando il facing cambia fuori dal loop di movimento.
     */
    private _applyHorizontalFacing(facingLeft: boolean): void {
        this.setFlipX(facingLeft);
        this.setOrigin(facingLeft ? 0.5 : 0, 0.5);

        const bodyOffsetX = this.flipX ? this.width - 48 : 16;
        (this.body as Phaser.Physics.Arcade.Body).setOffset(bodyOffsetX, 64);
    }

    getActiveEnemies(): Enemy[] {
        return this._getActiveEnemies();
    }

    applyHitFeedback(enemies: Enemy[]): void {
        this._applyHitFeedback(enemies);
    }

    /**
     * Il perk AOE applica l'impatto al termine di `attack_smash` per sincronizzare
     * feedback visivo e momento del danno, evitando hit "anticipate" rispetto al colpo.
     */
    performSmashAttack(onImpact: () => void): void {
        if (this._isAttacking) {
            return;
        }

        this._isAttacking = true;
        this.setVelocity(0, 0);

        const animationCompleteEvent = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "attack_smash";
        this.once(animationCompleteEvent, () => {
            onImpact();
            this._isAttacking = false;
        });

        this.anims.play("attack_smash", true);
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
