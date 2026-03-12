import Phaser from "phaser";

/**
 * CLASSE BASE - Actor
 * 
 * Rappresenta qualsiasi personaggio nel gioco (player, nemici, ecc).
 * Fornisce funzionalità comuni come vita, velocità e movimento.
 * Tutti i personaggi ereditano da questa classe.
 */
export default class Actor extends Phaser.Physics.Arcade.Sprite {
    // Statistiche del personaggio
    private _hp: number;           // Punti vita attuali
    private _hpMax: number;        // Punti vita massimi
    private _speed: number;        // Velocità di movimento

    /**
     * Costruttore - Inizializza il personaggio
     * @param scene - La scena del gioco
     * @param x - Posizione X iniziale
     * @param y - Posizione Y iniziale
     * @param texture - Nome dell'immagine del personaggio
     */
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        
        // Aggiungi il personaggio alla scena e abilita la fisica
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Inizializza le statistiche
        this._hp = 100;
        this._hpMax = 100;
        this._speed = 100;
    }

    /**
     * Imposta la velocità di movimento del personaggio
     * @param value - Nuovo valore di velocità (pixel per second)
     */
    setSpeed(value: number) {
        this._speed = value;
    }

    /**
     * Imposta i punti vita del personaggio
     * @param value - Nuovo valore di vita (diventa sia HP attuale che massimo)
     */
    setHp(value: number) {
        this._hp = value;
        this._hpMax = value;
    }

    /**
     * Muove il personaggio nella direzione specificata
     * Utilizza la velocità impostata per calcolare lo spostamento
     * @param direction - Vector2 con la direzione desiderata (già normalizzato)
     */
    move(direction: Phaser.Math.Vector2) {
        // Moltiplica la direzione per la velocità per ottenere la velocità finale
        this.setVelocity(direction.x * this._speed, direction.y * this._speed);
    }

    /**
     * Il personaggio riceve danno
     * Riduce gli HP e se scendono a 0 il personaggio muore
     * @param amount - Quantità di danno da infliggere
     */
    takeDamage(amount: number) {
        // Sottrai il danno dagli HP, minimo 0
        this._hp = Math.max(this._hp - amount, 0);

        // Notifica la scena che la vita è cambiata (per aggiornare l'HUD)
        this.scene.events.emit("vita-cambiata", this._hp, this._hpMax);

        console.log(`❤️ HP rimasti: ${this._hp} / ${this._hpMax}`);

        // Se la vita scende a 0, il personaggio muore
        if (this._hp <= 0) {
            this.die();
        }
    }

    /**
     * Fa morire il personaggio
     * Emette un evento per notificare la scena
     */
    die() {
        this.emit("death");
    }

    // ===== GETTER - Metodi per ottenere le statistiche =====
    get hp(): number { return this._hp; }           // HP attuali
    get hpMax(): number { return this._hpMax; }     // HP massimi
    get speed(): number { return this._speed; }     // Velocità
}