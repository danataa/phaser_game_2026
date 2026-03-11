import Actor from "./Actor";
import Player from "./Player";

export default class Enemy extends Actor {
    private damage: number;
    private target: Player | null;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.damage = 10;
        this.target = null;
    }

    setTarget(player: Player) {
        this.target = player;
    }

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