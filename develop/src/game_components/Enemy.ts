import Actor from "./Actor";
import Player from "./Player";

// Classe base per tutti i nemici, insegue il player
export default class Enemy extends Actor {
    private damage: number;
    private target: Player | null;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.damage = 10;
        this.target = null;
    }

    // Imposta il player come bersaglio da inseguire
    setTarget(player: Player) {
        this.target = player;
    }

    // Calcola la direzione verso il player e si muove
    update() {
        if (this.target) {
            const direction = new Phaser.Math.Vector2(
                this.target.x - this.x,
                this.target.y - this.y
            ).normalize();
            this.move(direction);
        }
    }  
}