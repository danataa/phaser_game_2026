import Phaser from "phaser";

export default class Actor extends Phaser.Physics.Arcade.Sprite {
    private hp: number;
    private speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.hp = 100;
        this.speed = 200;
    }
    
    move(direction: Phaser.Math.Vector2) {
        this.setVelocity(direction.x * this.speed, direction.y * this.speed);
    }   

    takeDamage(amount: number) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.emit("death");
    }   
}