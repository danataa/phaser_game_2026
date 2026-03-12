import Phaser from "phaser";
import Player from "../Player";

// Proiettile lanciato dal Demon verso il player.
export default class Fireball extends Phaser.Physics.Arcade.Sprite {
    // --- Configuration Properties (bilanciamento) ---
    private readonly _damage: number = 20;
    private readonly _projectileSpeed: number = 500;
    private readonly _autoDestroyDelay: number = 1500;

    // --- Runtime State ---
    private readonly _target: Player;
    private readonly _collidableLayers: Phaser.Tilemaps.TilemapLayer[];

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        target: Player,
        collidableLayers: Phaser.Tilemaps.TilemapLayer[]
    ) {
        super(scene, x, y, "demon_bullet");
        this._target = target;
        this._collidableLayers = collidableLayers;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.create();
    }

    // --- Getters ---
    get damage(): number {
        return this._damage;
    }

    get projectileSpeed(): number {
        return this._projectileSpeed;
    }

    get autoDestroyDelay(): number {
        return this._autoDestroyDelay;
    }

    // --- Phaser Lifecycle ---

    create(): void {
        this.setScale(2);
        this.setSize(16, 16);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);

        this.scene.time.delayedCall(this._autoDestroyDelay, () => {
            if (this.active) {
                this.destroy();
            }
        });

        this._setupColliders();
    }

    update(): void {
        // Nessuna logica per frame necessaria.
    }

    // --- Combat & State Logic ---

    /** Lancia la fireball lungo l'angolo specificato. */
    launch(angle: number): void {
        this.scene.physics.velocityFromRotation(angle, this._projectileSpeed, this.body.velocity);
        this.setRotation(angle);
    }

    private _setupColliders(): void {
        this.scene.physics.add.collider(this, this._target, () => {
            if (this.active) {
                this._target.takeDamage(this._damage);
                this.destroy();
            }
        });

        for (const layer of this._collidableLayers) {
            this.scene.physics.add.collider(this, layer, () => {
                if (this.active) {
                    this.destroy();
                }
            });
        }
    }
}