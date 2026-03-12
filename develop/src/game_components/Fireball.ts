import Phaser from "phaser";
import Player from "./Player";

// Proiettile lanciato dal Demon verso il player
export default class Fireball extends Phaser.Physics.Arcade.Sprite {
    private readonly _damage: number = 20;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        target: Player,
        collidableLayers: Phaser.Tilemaps.TilemapLayer[]
    ) {
        super(scene, x, y, "demon_bullet");
        this.setScale(2);
        
        // Aggiungi alla scena e abilita la fisica
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // I proiettili non devono essere influenzati dalla gravita.
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);

        // Distruggi il proiettile dopo 1.5 secondi per evitare che viaggi all'infinito
        this.scene.time.delayedCall(1500, () => {
            if (this.active) {
                this.destroy();
            }
        });

        // Distruggi il proiettile quando colpisce il player.
        this.scene.physics.add.collider(this, target, () => {
            if (this.active) {
                target.takeDamage(this._damage);
                this.destroy();
            }
        });

        // Distruggi il proiettile quando colpisce muri/ostacoli della tilemap.
        for (const layer of collidableLayers) {
            this.scene.physics.add.collider(this, layer, () => {
                if (this.active) {
                    this.destroy();
                }
            });
        }
        
        // Imposta una hitbox appropriata
        this.setSize(16, 16);
    }
}