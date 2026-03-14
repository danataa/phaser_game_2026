import Actor from "./Actor";
import Player from "./Player";
import MapManager from "./MapManager";
import * as EasyStar from "easystarjs";

// Classe base per tutti i nemici.
export default class Enemy extends Actor {
    private static _enemyGroup: Phaser.Physics.Arcade.Group | null = null;
    private static _enemyColliderRegistered: boolean = false;

    // --- Configuration Properties (bilanciamento e stato base) ---
    protected _damage: number = 0;
    protected _target: Player | null;
    protected _isDead: boolean = false;
    protected _soulsValue: number = 0;
    protected _pathRecalculateDelay: number = 1500;
    private _hpBarBackground: Phaser.GameObjects.Rectangle | null = null;
    private _hpBar: Phaser.GameObjects.Rectangle | null = null;
    private _hpBarWidth: number = 38;
    private _hpBarHeight: number = 5;
    private _hpBarOffsetY: number = 14;
    private _maxHpSnapshot: number = 0;

    // --- Pathfinding state ---
    protected _mapManager: MapManager | null;
    private _easystar: EasyStar.js;
    private _path: { x: number; y: number }[];
    private _currentPathIndex: number;
    private _pathTimer: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, target: Player) {
        super(scene, x, y, texture);
        this._target = null;
        this._mapManager = null;
        this._easystar = new EasyStar.js();
        this._path = [];
        this._currentPathIndex = 0;
        this._pathTimer = 0;
        this._target = target;
        (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        this._createHealthBar();

        // Listener per distruggere il nemico al termine dell'animazione di morte
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim: Phaser.Animations.Animation) => {
            if (anim.key.includes("dead")) {
                this.destroy();
            }
        });

        this.once(Phaser.GameObjects.Events.DESTROY, this._destroyHealthBar, this);
    }

    // --- Getters ---
    get damage(): number {
        return this._damage;
    }

    get target(): Player | null {
        return this._target;
    }

    get isDead(): boolean {
        return this._isDead;
    }

    get soulsValue(): number {
        return this._soulsValue;
    }

    // --- Phaser Lifecycle ---

    create(): void {
        // Hook disponibile per estensioni specifiche nelle sottoclassi.
    }

    /** Aggiorna il comportamento base di inseguimento. */
    update(): void {
        if (this._isDead) return;
        this.moveToPlayer();
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        this._syncHealthBar();
    }

    // --- Combat & State Logic ---

    setDamage(value: number): void {
        this._damage = value;
    }

    setHp(value: number): void {
        super.setHp(value);
        this._maxHpSnapshot = Math.max(this._maxHpSnapshot, Math.max(0, value));
        this._syncHealthBar();
    }

    setMapManager(mapManager: MapManager): void {
        this._mapManager = mapManager;
        this._initPathfinding();
    }

    attack(): void {
        if (this._target) {
            this._target.takeDamage(this._damage);
        }
    }

    /** Applica danno e gestisce la transizione di morte del nemico. */
    takeDamage(amount: number): void {
        super.takeDamage(amount);
        this._syncHealthBar();

        if (!this._isDead && this.active) {
            this.setTint(0xff0000);
            this.scene.time.delayedCall(120, () => {
                if (this.active && !this._isDead) {
                    this.clearTint();
                }
            });
        }

        if (this.getHp <= 0 && !this._isDead) {
            this._handleDeath();
        }
    }

    /** Avvia la specifica animazione di morte della sottoclasse. */
    protected startDeath(): void {
        // Override nelle sottoclassi
    }

    private _handleDeath(): void {
        // Cuore della logica di morte condivisa: stop, disable body, score, death animation.
        this._isDead = true;
        this._hideHealthBar();
        this.setVelocity(0, 0);
        this.body.enable = false;
        this.scene.events.emit("score-delta", this._soulsValue);
        this.startDeath();
    }

    /**
     * A compact hp bar above enemies gives immediate combat readability without
     * forcing players to inspect sprite-specific hit reactions.
     */
    private _createHealthBar(): void {
        this._hpBarBackground = this.scene.add.rectangle(
            this.x,
            this.y,
            this._hpBarWidth,
            this._hpBarHeight,
            0x7f1111,
            0.95,
        );
        this._hpBarBackground.setOrigin(0.5, 0.5);
        this._hpBarBackground.setDepth(20);

        this._hpBar = this.scene.add.rectangle(
            this.x,
            this.y,
            this._hpBarWidth,
            this._hpBarHeight,
            0x3cc35b,
            1,
        );
        this._hpBar.setOrigin(0, 0.5);
        this._hpBar.setDepth(21);
    }

    private _syncHealthBar(): void {
        if (!this._hpBarBackground || !this._hpBar) {
            return;
        }

        const topY = this.y - this.displayHeight * 0.5 - this._hpBarOffsetY;
        this._hpBarBackground.setPosition(this.x, topY);

        const leftX = this.x - this._hpBarWidth * 0.5;
        this._hpBar.setPosition(leftX, topY);

        const hpRatio = Phaser.Math.Clamp(
            this.getHp / Math.max(1, this._maxHpSnapshot),
            0,
            1,
        );

        this._hpBar.width = this._hpBarWidth * hpRatio;
        this._hpBarBackground.visible = this.active && !this._isDead;
        this._hpBar.visible = this.active && !this._isDead;
    }

    private _hideHealthBar(): void {
        if (this._hpBarBackground) {
            this._hpBarBackground.visible = false;
        }

        if (this._hpBar) {
            this._hpBar.visible = false;
        }
    }

    private _destroyHealthBar(): void {
        this._hpBarBackground?.destroy();
        this._hpBarBackground = null;
        this._hpBar?.destroy();
        this._hpBar = null;
    }

    // --- Pathfinding ---

    /** Calcola e segue il percorso verso il player. */
    moveToPlayer(): void {
        if (!this._target || !this._mapManager) return;

        const now = this.scene.time.now;

        if (now - this._pathTimer >= this._pathRecalculateDelay) {
            this._pathTimer = now;

            const start = this._worldToTile(this.x, this.y);
            const end = this._worldToTile(this._target.x, this._target.y);

            this._easystar.findPath(start.x, start.y, end.x, end.y, (path) => {
                if (path && path.length > 1) {
                    this._path = path.slice(1);
                    this._currentPathIndex = 0;
                }
            });
            this._easystar.calculate();
        }

        // Segue il percorso calcolato
        if (this._path.length > 0 && this._currentPathIndex < this._path.length) {
            const waypoint = this._path[this._currentPathIndex];
            const worldPos = this._tileToWorld(waypoint.x, waypoint.y);

            const dx = worldPos.x - this.x;
            const dy = worldPos.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 5) {
                this._currentPathIndex++;
            } else {
                const direction = new Phaser.Math.Vector2(dx, dy).normalize();
                this.move(direction);
            }
        } else {
            this.move(new Phaser.Math.Vector2(0, 0));
        }
    }

    private _initPathfinding(): void {
        const map = this._mapManager!.map;
        const grid: number[][] = [];

        for (let y = 0; y < map.height; y++) {
            const row: number[] = [];
            for (let x = 0; x < map.width; x++) {
                let walkable = true;
                for (const layer of this._mapManager!.collidableLayers) {
                    const tile = layer.getTileAt(x, y);
                    if (tile && tile.collides) {
                        walkable = false;
                        break;
                    }
                }
                row.push(walkable ? 0 : 1);
            }
            grid.push(row);
        }

        this._easystar.setGrid(grid);
        this._easystar.setAcceptableTiles([0]);
        this._easystar.enableDiagonals();
    }

    private _worldToTile(worldX: number, worldY: number): { x: number; y: number } {
        const map = this._mapManager!.map;
        const scale = this._mapManager!.scale;
        return {
            x: Math.floor(worldX / (map.tileWidth * scale)),
            y: Math.floor(worldY / (map.tileHeight * scale)),
        };
    }

    private _tileToWorld(tileX: number, tileY: number): { x: number; y: number } {
        const map = this._mapManager!.map;
        const scale = this._mapManager!.scale;
        return {
            x: tileX * map.tileWidth * scale + (map.tileWidth * scale) / 2,
            y: tileY * map.tileHeight * scale + (map.tileHeight * scale) / 2,
        };
    }

    static configureEnemyCollisions(scene: Phaser.Scene, enemyGroup: Phaser.Physics.Arcade.Group): void {
        if (Enemy._enemyGroup !== enemyGroup) {
            Enemy._enemyGroup = enemyGroup;
            Enemy._enemyColliderRegistered = false;
        }

        if (Enemy._enemyColliderRegistered || !Enemy._enemyGroup) {
            return;
        }

        scene.physics.add.overlap(
            Enemy._enemyGroup,
            Enemy._enemyGroup,
            (objA, objB) => {
                const enemyA = objA as Phaser.Physics.Arcade.Sprite;
                const enemyB = objB as Phaser.Physics.Arcade.Sprite;
                Enemy._applySoftSeparation(enemyA, enemyB);
            },
            (objA, objB) => {
                const enemyA = objA as Phaser.Physics.Arcade.Sprite;
                const enemyB = objB as Phaser.Physics.Arcade.Sprite;
                const bodyA = enemyA.body as Phaser.Physics.Arcade.Body | null;
                const bodyB = enemyB.body as Phaser.Physics.Arcade.Body | null;

                return !!(
                    enemyA !== enemyB &&
                    enemyA.active &&
                    enemyB.active &&
                    bodyA &&
                    bodyB &&
                    bodyA.enable &&
                    bodyB.enable
                );
            }
        );

        Enemy._enemyColliderRegistered = true;
    }

    private static _applySoftSeparation(
        enemyA: Phaser.Physics.Arcade.Sprite,
        enemyB: Phaser.Physics.Arcade.Sprite,
    ): void {
        const bodyA = enemyA.body as Phaser.Physics.Arcade.Body | null;
        const bodyB = enemyB.body as Phaser.Physics.Arcade.Body | null;

        if (!bodyA || !bodyB || !bodyA.enable || !bodyB.enable) {
            return;
        }

        let dx = enemyB.x - enemyA.x;
        let dy = enemyB.y - enemyA.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            distance = Math.sqrt(dx * dx + dy * dy);
            if (distance === 0) {
                return;
            }
        }

        const nx = dx / distance;
        const ny = dy / distance;
        const minDistance = (Math.min(bodyA.width, bodyA.height) + Math.min(bodyB.width, bodyB.height)) * 0.45;

        if (distance >= minDistance) {
            return;
        }

        const overlap = minDistance - distance;
        const separation = Math.min(overlap * 0.6, 4);

        enemyA.x -= nx * separation;
        enemyA.y -= ny * separation;
        enemyB.x += nx * separation;
        enemyB.y += ny * separation;

        const relativeVelocityX = bodyB.velocity.x - bodyA.velocity.x;
        const relativeVelocityY = bodyB.velocity.y - bodyA.velocity.y;
        const approachSpeed = relativeVelocityX * nx + relativeVelocityY * ny;

        if (approachSpeed < 0) {
            const correction = Math.min(-approachSpeed * 0.2, 35);
            bodyA.velocity.x -= nx * correction;
            bodyA.velocity.y -= ny * correction;
            bodyB.velocity.x += nx * correction;
            bodyB.velocity.y += ny * correction;
        }
    }
}
