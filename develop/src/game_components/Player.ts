import Phaser from "phaser";
import Actor from "./Actor";
import Enemy from "./Enemy";
import type Perk from "./perks/Perk";

type HpUpdateTrigger =
    | "init"
    | "damage"
    | "heal"
    | "critical-enter"
    | "critical-exit";

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
    private readonly _defaultSfxVolume: number = 0.7;
    private readonly _criticalHpThreshold: number = 20;

    // --- Input & State ---
    private _keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
        Q: Phaser.Input.Keyboard.Key;
        E: Phaser.Input.Keyboard.Key;
    };
    private _anime: number = 0;
    private _hpMax: number = 100;
    private _atk: number = this._baseAttackDamage;

    // --- Perk Slots ---
    private _perkSlotQ: Perk | null = null;
    private _perkSlotE: Perk | null = null;

    // --- Combat State ---
    private _isAttacking: boolean = false;
    private _isDashing: boolean = false;
    private _hasPlayedDeathSfx: boolean = false;
    private _isCriticalHpActive: boolean = false;
    private _lastMoveDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player_idle");
        this._createAnimations();
        this.setSpeed(500);
        this.setHp(this._hpMax);

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

        // Hitbox più piccola dello sprite per collisioni più precise
        this.setSize(32, 64);
        this.setOffset(16, 64);
        this.setOrigin(0, 0.5);

        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this._onPointerDown, this);
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this._onPointerDown, this);
        });

        this._emitHpUpdate("init");
    }

    get maxHp(): number {
        return this._maxHp;
    }

    get maxHpConfigured(): number {
        return this._maxHp;
    }

    get dashOverlayAlpha(): number {
        return this._dashOverlayAlpha;
    }

    get dashOverlayTint(): number {
        return this._dashOverlayTint;
    }

    get baseAttackDamage(): number {
        return this._baseAttackDamage;
    }

    get baseAttackRange(): number {
        return this._baseAttackRange;
    }

    get perkSlotQ(): Perk | null {
        return this._perkSlotQ;
    }

    get perkSlotE(): Perk | null {
        return this._perkSlotE;
    }

    setPerkSlotQ(perk: Perk | null): void {
        this._perkSlotQ = perk;
        this.scene.events.emit("perk-equipped", "Q", perk);
    }

    setPerkSlotE(perk: Perk | null): void {
        this._perkSlotE = perk;
        this.scene.events.emit("perk-equipped", "E", perk);
    }

    setPerk(slot: "Q" | "E", perk: Perk | null): void {
        if (slot === "Q") {
            this.setPerkSlotQ(perk);
            return;
        }
        this.setPerkSlotE(perk);
    }

    /**
     * Shop temporary perks fill the first free slot to avoid replacing controls
     * unexpectedly during movement-heavy phases.
     */
    equipPerk(perk: Perk): "Q" | "E" {
        if (!this._perkSlotQ) {
            this._perkSlotQ = perk;
            this.scene.events.emit("perk-equipped", "Q", perk);
            return "Q";
        }

        if (!this._perkSlotE) {
            this._perkSlotE = perk;
            this.scene.events.emit("perk-equipped", "E", perk);
            return "E";
        }

        this._perkSlotQ = perk;
        this.scene.events.emit("perk-equipped", "Q", perk);
        return "Q";
    }

    healByPercent(healPercent: number): void {
        const clampedPercent = Phaser.Math.Clamp(healPercent, 0, 1);
        const healAmount = Math.ceil(this._hpMax * clampedPercent);
        const nextHp = Math.min(this.getHp + healAmount, this._hpMax);
        this.setHp(nextHp);
        this._emitHpUpdate("heal");
    }

    /**
     * `setTintFill` rende il feedback di cura robusto su texture dettagliate,
     * dove un tint moltiplicativo puo' risultare poco leggibile.
     */
    playHealVisualFeedback(): void {
        const overlay = this.scene.add.sprite(this.x, this.y, this.texture.key, this.frame.name);
        overlay.setScale(this.scaleX, this.scaleY);
        overlay.setOrigin(this.originX, this.originY);
        overlay.setFlipX(this.flipX);
        overlay.setFlipY(this.flipY);
        overlay.setDepth(this.depth + 1);
        overlay.setTint(0x00ff00);
        overlay.setAlpha(0.45);

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0,
            duration: 320,
            ease: "Sine.Out",
            onUpdate: () => {
                if (!this.active || !overlay.active) {
                    return;
                }

                overlay.setPosition(this.x, this.y);
                overlay.setFlipX(this.flipX);
                overlay.setFlipY(this.flipY);
                overlay.setFrame(this.frame.name);
            },
            onComplete: () => {
                overlay.destroy();
            },
        });
    }

    /**
     * HUD and combat logics consume hp changes from a single event channel to
     * avoid diverging state between healing perks and enemy damage ticks.
     */
    takeDamage(amount: number): void {
        const previousHp = this.getHp;
        super.takeDamage(amount);
        if (this.getHp < 0) {
            this.setHp(0);
        }

        /**
         * The one-shot guard avoids stacked death SFX when multiple damage
         * sources resolve in the same frame at zero HP.
         */
        if (
            previousHp > 0 &&
            this.getHp === 0 &&
            !this._hasPlayedDeathSfx
        ) {
            const hasPlayerDeadSfx = this.scene.cache.audio.exists(
                "player_dead",
            );
            if (hasPlayerDeadSfx) {
                try {
                    this.scene.sound.play("player_dead", {
                        volume: this._defaultSfxVolume,
                    });
                } catch (_error) {
                    console.warn("Audio player_dead non disponibile.");
                }
            }
            this._hasPlayedDeathSfx = true;
        }

        this._emitHpUpdate("damage");
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

        this._playSfx("player_attack");

        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this._executeBaseAttack(worldPoint.x, worldPoint.y);
    }
        
    // Legge l'input WASD, aggiorna direzione, animazione e hitbox
    update(): void {
        this._updateCriticalHpState();

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
        const body = this.body as Phaser.Physics.Arcade.Body;
        const playerCenterX = body?.center.x ?? this.x;
        const playerCenterY = body?.center.y ?? this.y;
        const isMouseLeft = targetX < playerCenterX;

        // Allinea facing/origin/offset con la stessa logica del movimento A-D
        // per evitare snap di posizione al termine dell'animazione.
        this._applyHorizontalFacing(isMouseLeft);

        const meleeOffsetX = isMouseLeft ? -this._baseAttackRange : this._baseAttackRange;
        const meleeOffsetY = 0;

        this._isAttacking = true;
        this.setVelocity(0, 0);
        this.anims.play("attack_mele", true);

        const hitbox = this.scene.add.rectangle(
            playerCenterX + meleeOffsetX,
            playerCenterY + meleeOffsetY,
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
                enemy.takeDamage(this._atk);
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

    /**
     * Un payload unico evita divergenze tra HUD e gameplay quando piu' sistemi
     * aggiornano gli HP nello stesso intervallo di frame.
     */
    private _emitHpUpdate(trigger: HpUpdateTrigger): void {
        const isCriticalHp = this.getHp <= this._criticalHpThreshold;
        this.scene.events.emit("vita-cambiata", this.getHp, this._hpMax);
        this.scene.events.emit(
            "update-hp",
            this.getHp,
            this._hpMax,
            {
                isCriticalHp,
                trigger,
            },
        );
    }

    /**
     * Il gate interno garantisce il trigger one-shot al passaggio sotto soglia
     * e previene spam audio quando gli HP restano in area critica.
     */
    private _updateCriticalHpState(): void {
        if (this.getHp <= this._criticalHpThreshold) {
            if (this._isCriticalHpActive) {
                return;
            }

            this._isCriticalHpActive = true;
            this._playLowHealthSfx();
            this._emitHpUpdate("critical-enter");
            return;
        }

        if (!this._isCriticalHpActive) {
            return;
        }

        this._isCriticalHpActive = false;
        this._emitHpUpdate("critical-exit");
    }

    /**
     * L'helper centralizza fallback e volume per mantenere coerente il mix SFX
     * in tutti i trigger gameplay del player.
     */
    private _playSfx(key: string): void {
        if (!this.scene.cache.audio.exists(key)) {
            return;
        }

        try {
            this.scene.sound.play(key, {
                volume: this._defaultSfxVolume,
            });
        } catch (_error) {
            console.warn("Audio " + key + " non disponibile.");
        }
    }

    /**
     * Supportiamo entrambe le varianti del nome per evitare regressioni dovute
     * a typo legacy tra `player_lowHealt` e `player_lowHealth`.
     */
    private _playLowHealthSfx(): void {
        if (this.scene.cache.audio.exists("player_lowHealt")) {
            this._playSfx("player_lowHealt");
            return;
        }

        this._playSfx("player_lowHealth");
    }

    get anime(): number {
        return this._anime;
    }

    get hpMax(): number {
        return this._hpMax;
    }

    get atk(): number {
        return this._atk;
    }

    /**
     * We clamp souls to non-negative values to keep UI and purchases deterministic
     * even when multiple score events arrive in the same frame.
     */
    raccogliAnime(amount: number): void {
        const nextAnime = Math.max(0, this._anime + Math.max(0, amount));
        this._anime = nextAnime;
        this.scene.events.emit("anime-cambiate", this._anime);
        this.scene.events.emit("update-score", this._anime);
    }

    spendi(amount: number): boolean {
        const safeAmount = Math.max(0, amount);

        if (this._anime < safeAmount) {
            return false;
        }

        this._anime -= safeAmount;
        this.scene.events.emit("anime-cambiate", this._anime);
        this.scene.events.emit("update-score", this._anime);
        return true;
    }

    /**
     * Permanent upgrades only touch long-term stats so slot perks on Q/E remain
     * temporary tools and never replace movement or base input handling.
     */
    aumentaHp(amount: number): void {
        const delta = Math.max(0, amount);
        this._hpMax += delta;
        this.setHp(Math.min(this.getHp + delta, this._hpMax));
        this._emitHpUpdate("heal");
    }

    aumentaAtk(amountPercent: number): void {
        const percent = Math.max(0, amountPercent);
        this._atk = Math.floor(this._atk * (1 + percent / 100));
        this.scene.events.emit("danno-cambiato", this._atk);
    }

    aumentaVelocita(amount: number): void {
        const delta = Math.max(0, amount);
        this.setSpeed(this.speed + delta);
    }

    getHpMax(): number {
        return this._hpMax;
    }

    getAtk(): number {
        return this._atk;
    }
}
