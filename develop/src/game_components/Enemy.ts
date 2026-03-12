import Actor from "./Actor";
import Player from "./Player";
import MapManager from "./MapManager";
import * as EasyStar from "easystarjs";

// Classe base per tutti i nemici.
export default class Enemy extends Actor {
    // --- Configuration Properties (bilanciamento e stato base) ---
    protected _damage: number = 0;
    protected _target: Player | null;
    protected _isDead: boolean = false;
    protected _soulsValue: number = 0;
    protected _pathRecalculateDelay: number = 1500;

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

        // Listener per distruggere il nemico al termine dell'animazione di morte
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim: Phaser.Animations.Animation) => {
            if (anim.key.includes("dead")) {
                this.destroy();
            }
        });
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

    // --- Combat & State Logic ---

    setDamage(value: number): void {
        this._damage = value;
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
        this.setVelocity(0, 0);
        this.body.enable = false;
        this.scene.events.emit("update-score", this._soulsValue);
        this.startDeath();
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
}