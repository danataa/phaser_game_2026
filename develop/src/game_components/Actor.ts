import Phaser from "phaser";

// Classe base per tutti i personaggi del gioco (player e nemici)
export default class Actor extends Phaser.Physics.Arcade.Sprite {
    private _hp: number;
    private _speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        // Aggiunge lo sprite alla scena e abilita la fisica
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this._hp = 100;
        this._speed = 100;
    }

    setSpeed(value: number) {
        this._speed = value;
    }
    
    setHp(value: number) {
        this._hp = value;
    }

    get getHp(): number {
        return this._hp;
    }

    get speed(): number {
        return this._speed;
    }
    
    // Muove l'attore nella direzione data, scalata per la velocità
    move(direction: Phaser.Math.Vector2) {
        this.setVelocity(direction.x * this._speed, direction.y * this._speed);
    }   

    // Riduce gli HP e verifica se l'attore è morto
    takeDamage(amount: number) {
        this._hp -= amount;
        if (this._hp <= 0) {
            this.die();
        }
    }

    // Emette l'evento "death" per notificare la scena
    die() {
        this.emit("death");
    }   
}