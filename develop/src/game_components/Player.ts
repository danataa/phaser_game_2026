import Phaser from "phaser";
import Actor from "./Actor";

// Personaggio controllato dal giocatore tramite WASD
export default class Player extends Actor {
    private _keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    private _anime: number = 0;
    private _hpMax: number = 100;
    private _atk: number = 10;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player_idle");
        this._createAnimations();
        this.setSpeed(500);
        this.setHp(100);

        // Registra i tasti WASD per il movimento
        const kb = scene.input.keyboard!;
        this._keys = {
            W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // this.anims.play("idle", true);

        // Hitbox più piccola dello sprite per collisioni più precise
        this.setSize(32, 64);
        this.setOffset(16, 64);
        this.setOrigin(0, 0.5);
    }

    // Crea le animazioni idle, walk e attack dallo spritesheet
    private _createAnimations(): void {
            this.anims.create({
                key: "idle",
                frames: this.anims.generateFrameNumbers("player_idle", { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1,
            });

            this.anims.create({
                key: "walk",
                frames: this.anims.generateFrameNumbers("player_walk", { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1,
            });

            this.anims.create({
                key: "attack",
                frames: this.anims.generateFrameNumbers("player_attack", { start: 0, end: 4 }),
                frameRate: 12,
                repeat: 0,
            });
        }
        
    // Legge l'input WASD, aggiorna direzione, animazione e hitbox
    update(): void {
        const direction = new Phaser.Math.Vector2(0, 0);

        // Movimento orizzontale + flip dello sprite
        if (this._keys.A.isDown) {
            direction.x = -1;
            this.setFlipX(true);
            this.setOrigin(0.5, 0.5);
        } else if (this._keys.D.isDown) {
            direction.x = 1;
            this.setFlipX(false);
            this.setOrigin(0, 0.5);
        }

        // Riallinea la hitbox quando lo sprite è flippato
        const bodyOffsetX = this.flipX ? this.width - 48 : 16;
        (this.body as Phaser.Physics.Arcade.Body).setOffset(bodyOffsetX, 64);

        // Movimento verticale
        if (this._keys.W.isDown) {
            direction.y = -1;
        } else if (this._keys.S.isDown) {
            direction.y = 1;
        }

        const isMoving = direction.x !== 0 || direction.y !== 0;

        // Normalizza per evitare velocità diagonale maggiore
        if (isMoving) {
            direction.normalize();
            this.anims.play("walk", true);
        } else {
            this.anims.play("idle", true);
        }

        this.move(direction);
    }

    // ============================
    // ANIME & UPGRADE SYSTEM
    // ============================
    public get anime(): number {
        return this._anime;
    }

    public raccogliAnime(amount: number): void {
        this._anime += amount;
        this.scene.events.emit("anime-cambiate", this._anime);
    }

    public spendi(amount: number): void {
        this._anime -= amount;
        this.scene.events.emit("anime-cambiate", this._anime);
    }

    public getAnime(): number {
        return this._anime;
    }

    public aumentaHp(amount: number): void {
        this._hpMax += amount;
        this.setHp(this.getHp + amount);
        this.scene.events.emit("vita-cambiata", this.getHp, this._hpMax);
    }

    public aumentaAtk(amount: number): void {
        this._atk = Math.floor(this._atk * (1 + amount / 100));
        this.scene.events.emit("danno-cambiato", this._atk);
    }

    public aumentaVelocita(amount: number): void {
        this.setSpeed(this.getSpeed + amount);
    }

    public getHpMax(): number {
        return this._hpMax;
    }

    public getAtk(): number {
        return this._atk;
    }

    public get getSpeed(): number {
        return (this as any).speed;
    }
}

