import Phaser from "phaser";
import Actor from "../Actor";

// Nemico base — lento, attacca in mischia
export default class Zombie extends Actor {

  // ================================
  // ATTRIBUTI
  // ================================
  private _player: Phaser.Physics.Arcade.Sprite;
  private _dannoContatto: number = 10;
  private _ultimoAttacco: number = 0;
  private _cooldownAttacco: number = 1000;
  private _raggioAttacco: number = 60;

  // Moltiplicatori di difficoltà per ondata
  private _ondataCorrente: number = 1;
  private _animeRilasciate: number = 5;

  // ================================
  // COSTRUTTORE
  // ================================
  constructor(scene: Phaser.Scene, x: number, y: number, player: Phaser.Physics.Arcade.Sprite, ondata: number = 1) {

    // Placeholder grafico
    if (!scene.textures.exists("zombie_placeholder")) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0x5a7a4a);
      gfx.fillRect(0, 0, 32, 48);
      gfx.fillStyle(0x7a9a6a);
      gfx.fillCircle(16, 10, 12);
      gfx.fillStyle(0xff0000);
      gfx.fillCircle(10, 8, 3);
      gfx.fillCircle(22, 8, 3);
      gfx.generateTexture("zombie_placeholder", 32, 48);
      gfx.destroy();
    }

    super(scene, x, y, "zombie_placeholder");

    this._player = player;
    this._ondataCorrente = ondata;

    // Difficoltà crescente per ondata
    const moltiplicatore = 0.8 + (ondata - 1) * 0.25; // Ondata 1: 0.8x (400), Ondata 2: 1.05x (525), Ondata 3: 1.3x (650)
    const velocita = 500 * moltiplicatore;
    const danno = Math.floor(10 + (ondata - 1) * 2);
    const hp = Math.floor(30 + (ondata - 1) * 15); // Ridotto: 30 -> 45 -> 60
    this._animeRilasciate = 5 + (ondata - 1) * 2;

    this.setSpeed(velocita);
    this.setHp(hp);
    this._dannoContatto = danno;
    this.setScale(4);
    this.setCollideWorldBounds(true);

    // Physics: massa nulla per non spingere il player
    (this.body as Phaser.Physics.Arcade.Body).setMass(0);
  }

  // ================================
  // UPDATE
  // ================================
  update(time: number): void {
    if (!this.active) return;

    const distanza = Phaser.Math.Distance.Between(
      this.x, this.y,
      this._player.x, this._player.y
    );

    // Insegui sempre il player — niente evasione
    this.inseguiPlayer();

    // Attacco
    if (distanza <= this._raggioAttacco) {
      this.attacca(time);
    }
  }

  // ================================
  // INSEGUI PLAYER
  // ================================
  private inseguiPlayer(): void {
    const direzione = new Phaser.Math.Vector2(
      this._player.x - this.x,
      this._player.y - this.y
    ).normalize();

    this.move(direzione);
    this.setFlipX(direzione.x < 0);
  }

  // ================================
  // ATTACCO
  // ================================
  private attacca(time: number): void {
    if (time - this._ultimoAttacco < this._cooldownAttacco) return;
    this._ultimoAttacco = time;

    (this._player as any).takeDamage(this._dannoContatto);

    // Flash rosso
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => {
      if (this.active) this.clearTint();
    });
  }

  // ================================
  // RICEVI DANNO (dal player)
  // ================================
  public takeDamage(danno: number): void {
    // Riduci HP
    const nuoveHP = Math.max(this.hp - danno, 0);
    (this as any)._hp = nuoveHP;

    console.log(`👹 Zombie colpito! HP rimasti: ${nuoveHP}`);

    // Flash bianco quando colpito
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });

    if (nuoveHP <= 0) {
      this.die();
    }
  }

  // ================================
  // MORTE
  // ================================
  die(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.scene.events.emit("nemico-morto", {
          x: this.x,
          y: this.y,
          anime: this._animeRilasciate,
        });
        this.destroy();
      }
    });
  }
}