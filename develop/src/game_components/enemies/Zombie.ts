import Enemy from "../Enemy";

// Nemico di tipo zombie 
export default class Zombie extends Enemy {
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "zombie_idle");
        this.setDamage(20);
        this.setScale(1.5);
        this.body.setSize(40, 65).setOffset(44, 63); 
        this.setSpeed(300);
    }

    // Override del metodo update per gestire le animazioni specifiche dello zombie
    update() {
        super.update();
        
        if(this.body.velocity.x > 0 || this.body.velocity.y > 0) {
            this.anims.play("zombie_walk", true);
        } else {
            this.anims.play("zombie_idle", true);
        }
    }

}