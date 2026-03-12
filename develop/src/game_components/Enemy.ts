import Actor from "./Actor";
import Player from "./Player";


import MapManager from "./MapManager";
import * as EasyStar from "easystarjs";

// Classe base per tutti i nemici, insegue il player
export default class Enemy extends Actor {
    protected damage: number;
    protected target: Player | null;
    protected _isDead: boolean = false;
    protected _soulsValue: number;
    private _easystar: EasyStar.js;
    protected _mapManager: MapManager | null;
    private _path: { x: number; y: number }[];
    private _currentPathIndex: number;
    private _pathTimer: number;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, target: Player) {
        super(scene, x, y, texture);
        this.target = null;
        this._mapManager = null;
        this._easystar = new EasyStar.js();
        this._path = [];
        this._currentPathIndex = 0;
        this._pathTimer = 0;
        this.target = target;

        // Listener per distruggere il nemico al termine dell'animazione di morte
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim: Phaser.Animations.Animation) => {
            if (anim.key.includes('dead')) {
                this.destroy();
            }
        });
    }

    // --- Metodi generici ---

    // Imposta il danno che questo nemico infligge al player
    setDamage(value: number) {
        this.damage = value;
    }

    // Collega il MapManager e inizializza la griglia di pathfinding
    setMapManager(mapManager: MapManager) {
        this._mapManager = mapManager;
        this._initPathfinding();
    }

    // Riduce gli HP del player bersaglio
    attack() {
        if (this.target) {
            this.target.takeDamage(this.damage);
        }
    }

    // Override di takeDamage per gestire la morte del nemico
    takeDamage(amount: number) {
        super.takeDamage(amount);
        
        if (this.getHp <= 0 && !this._isDead) {
            this._isDead = true;
            this.setVelocity(0, 0);
            this.body.enable = false;
            this.scene.events.emit('update-score', this._soulsValue);
            this.startDeath();
        }
    }

    // Metodo da implementare nelle sottoclassi per avviare l'animazione di morte
    protected startDeath(): void {
        // Override nelle sottoclassi
    }

    // Ad ogni frame, muoviti verso il player seguendo il percorso
    update() {
        if (this._isDead) return;
        this.moveToPlayer();
    }




    // --- Pathfinding ---

    // Calcola il percorso verso il player ogni 1500ms e segue i waypoint
    moveToPlayer() {
        if (!this.target || !this._mapManager) return;

        const now = this.scene.time.now;

        // Ricalcola il percorso ogni 1500ms
        if (now - this._pathTimer >= 1500) {
            this._pathTimer = now;

            const start = this._worldToTile(this.x, this.y);
            const end = this._worldToTile(this.target.x, this.target.y);

            this._easystar.findPath(start.x, start.y, end.x, end.y, (path) => {
                if (path && path.length > 1) {
                    // Salta il primo punto (posizione corrente)
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
            // Nessun percorso disponibile, fermati
            this.move(new Phaser.Math.Vector2(0, 0));
        }
    }

    // Costruisce la griglia per EasyStar dai layer con collisioni
    private _initPathfinding() {
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

    // Converte coordinate mondo in coordinate tile
    private _worldToTile(worldX: number, worldY: number): { x: number; y: number } {
        const map = this._mapManager!.map;
        const scale = this._mapManager!.scale;
        return {
            x: Math.floor(worldX / (map.tileWidth * scale)),
            y: Math.floor(worldY / (map.tileHeight * scale))
        };
    }

    // Converte coordinate tile in coordinate mondo (centro del tile)
    private _tileToWorld(tileX: number, tileY: number): { x: number; y: number } {
        const map = this._mapManager!.map;
        const scale = this._mapManager!.scale;
        return {
            x: tileX * map.tileWidth * scale + (map.tileWidth * scale) / 2,
            y: tileY * map.tileHeight * scale + (map.tileHeight * scale) / 2
        };
    }
}