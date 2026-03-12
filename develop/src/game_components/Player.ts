import Phaser from "phaser";
import Actor from "./Actor";

/**
 * CLASSE PLAYER - Il tuo personaggio
 * 
 * Gestisce il movimento con i tasti WASD e gli attacchi con il click del mouse.
 * Raccoglie anime dai nemici uccisi e gestisce l'animazione.
 */
export default class Player extends Actor {
    // Tasti di movimento
    private _keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };

    // Statistiche di attacco
    private _dannoAttacco: number = 20;           // Quanti danni infligge ogni colpo
    private _raggioAttacco: number = 100;         // Distanza massima per colpire i nemici
    private _ultimoAttacco: number = 0;           // Timestamp dell'ultimo attacco
    private _cooldownAttacco: number = 600;       // Millisecondi di attesa tra gli attacchi
    private _stannoAttaccando: boolean = false;   // Flag: sto attaccando adesso?

    // Sistema anime
    private _anime: number = 0;                   // Numero di anime raccolte

    /**
     * Costruttore - Inizializza il player
     * Crea le animazioni e registra gli input
     */
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player_idle");
        this._createAnimations();
        this.setSpeed(500); // Il player è veloce per sfuggire ai nemici

        // Registra i tasti WASD per il movimento
        const kb = scene.input.keyboard!;
        this._keys = {
            W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),  // Su
            A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),  // Sinistra
            S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),  // Giù
            D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),  // Destra
        };

        // Click sinistro del mouse = attacco
        scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.button === 0) { // 0 = tasto sinistro
                this.attacca(scene.time.now);
            }
        });

        // Inizia con l'animazione di idle (fermo)
        this.anims.play("idle", true);
        
        // Hitbox più piccola per collisioni più precise
        this.setSize(32, 64);
        this.setOffset(16, 64);
        this.setOrigin(0, 0.5);
    }

    /**
     * Crea le animazioni del player
     * - idle: fermo
     * - walk: cammina
     * - attack: attacca
     */
    private _createAnimations(): void {
        // Animazione di idle (fermo)
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("player_idle", { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1, // Ripete per sempre
        });

        // Animazione di camminata
        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("player_walk", { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1, // Ripete per sempre
        });

        // Animazione di attacco
        this.anims.create({
            key: "attack",
            frames: this.anims.generateFrameNumbers("player_attack", { start: 0, end: 4 }),
            frameRate: 12,
            repeat: 0, // Una sola volta
        });
    }
        
    /**
     * Update - Chiamato ogni frame dal gioco
     * Legge l'input da tastiera e aggiorna il movimento
     */
    update(): void {
        const direction = new Phaser.Math.Vector2(0, 0);

        // Leggi movimento ORIZZONTALE (Sinistra/Destra)
        if (this._keys.A.isDown) {
            // Tasto A premuto: vai a sinistra
            direction.x = -1;
            this.setFlipX(true); // Gira il personaggio verso sinistra
            this.setOrigin(0.5, 0.5);
        } else if (this._keys.D.isDown) {
            // Tasto D premuto: vai a destra
            direction.x = 1;
            this.setFlipX(false); // Gira il personaggio verso destra
            this.setOrigin(0, 0.5);
        }

        // Aggiusta l'hitbox quando il personaggio è girato
        const bodyOffsetX = this.flipX ? this.width - 48 : 16;
        (this.body as Phaser.Physics.Arcade.Body).setOffset(bodyOffsetX, 64);

        // Leggi movimento VERTICALE (Su/Giù)
        if (this._keys.W.isDown) {
            direction.y = -1; // W = su
        } else if (this._keys.S.isDown) {
            direction.y = 1;  // S = giù
        }

        // Controlla se il player si sta muovendo
        const isMoving = direction.x !== 0 || direction.y !== 0;

        // Normalizza la direzione per evitare velocità diagonale più alta
        if (isMoving && !this._stannoAttaccando) {
            direction.normalize();
            this.anims.play("walk", true);  // Anima la camminata
        } else if (!this._stannoAttaccando) {
            this.anims.play("idle", true);  // Stai fermo
        }

        // Muovi il player nella direzione calcolata
        this.move(direction);
    }

    /**
     * Attacca i nemici nel raggio d'attacco
     * Emette un evento che gli nemici ascoltano
     * @param time - Timestamp attuale del gioco
     */
    private attacca(time: number): void {
        // Controlla il cooldown: puoi attaccare ogni 600ms
        if (time - this._ultimoAttacco < this._cooldownAttacco || this._stannoAttaccando) {
            return; // Troppo presto, non attaccare
        }

        this._ultimoAttacco = time; // Aggiorna il timestamp dell'ultimo attacco
        this._stannoAttaccando = true; // Stai attaccando adesso

        // Riproduci l'animazione di attacco
        this.anims.play("attack");

        // Emetti un evento con i dati dell'attacco
        // I nemici ascoltano questo evento e prendono danno
        this.scene.events.emit("player-attacca", {
            x: this.x,                  // Posizione X dell'attacco
            y: this.y,                  // Posizione Y dell'attacco
            danno: this._dannoAttacco,  // Quanto danno infliggi
            raggio: this._raggioAttacco, // A che distanza colpisci
            flipX: this.flipX,          // Direzione dell'attacco
        });

        console.log("⚔️ Attacco del player!");

        // Dopo 400ms l'animazione finisce e puoi attaccare di nuovo
        this.scene.time.delayedCall(400, () => {
            this._stannoAttaccando = false;
        });
    }

    /**
     * Raccogli anime dai nemici uccisi
     * Le anime aumentano le tue statistiche nel negozio
     * @param quantita - Numero di anime da raccogliere
     */
    public raccogliAnime(quantita: number): void {
        this._anime += quantita; // Aggiungi anime
        
        // Notifica il gioco che hai raccolto anime (per l'HUD)
        this.scene.events.emit("anime-raccolte", this._anime);
        
        console.log(`👻 Anime raccolte: ${this._anime}`);
    }

    /**
     * GETTER - Ottieni il numero di anime attuali
     */
    public get anime(): number {
        return this._anime;
    }
}

