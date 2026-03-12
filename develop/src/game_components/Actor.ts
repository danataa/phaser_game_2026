import Phaser from "phaser";

// Classe base per tutti i personaggi del gioco (player e nemici)
export default class Actor extends Phaser.Physics.Arcade.Sprite {
    private hp: number;
    private speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        // Aggiunge lo sprite alla scena e abilita la fisica
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.hp = 100;
        this.speed = 100;
    }

    setSpeed(value: number) {
        this.speed = value;
    }
    
    setHp(value: number) {
        this.hp = value;
    }

    get getHp(): number {
        return this.hp;
    }
    
    // Muove l'attore nella direzione data, scalata per la velocità
    move(direction: Phaser.Math.Vector2) {
        this.setVelocity(direction.x * this.speed, direction.y * this.speed);
    }   

    // Riduce gli HP e verifica se l'attore è morto
    takeDamage(amount: number) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        }
    }

    // Emette l'evento "death" per notificare la scena
    die() {
        this.emit("death");
    }   
}