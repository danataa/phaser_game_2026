import GamePlay from "../scenes/GamePlay";
import Player from "./Player";

export default class Cavaliere extends Player {

  private _ultimoAttacco: number = 0;
  private _cooldownAttacco: number = 800;
  private _ultimoScatto: number = 0;
  private _cooldownScatto: number = 3000;
  private _velocitaScatto: number = 400;
  private _durataScatto: number = 200;
  private _scattoAttivo: boolean = false;
  private _raggioAttacco: number = 40;
  private _morto: boolean = false;

  constructor(params: { scene: GamePlay; x: number; y: number }) {
    super(params);

    this.setTexture("knight_idle");
    this.setScale(0.8);
    this.setBodySize(40, 60);
    this.setOffset(44, 60);

    this.creaAnimazioni();
  }

  private creaAnimazioni(): void {
    if (!this.scene.anims.exists("knight_idle")) {
      this.scene.anims.create({
        key: "knight_idle",
        frames: this.scene.anims.generateFrameNumbers("knight_idle", { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.scene.anims.exists("knight_walk")) {
      this.scene.anims.create({
        key: "knight_walk",
        frames: this.scene.anims.generateFrameNumbers("knight_walk", { start: 0, end: 8 }),
        frameRate: 12,
        repeat: -1,
      });
    }
    if (!this.scene.anims.exists("knight_dead")) {
      this.scene.anims.create({
        key: "knight_dead",
        frames: this.scene.anims.generateFrameNumbers("knight_dead", { start: 0, end: 5 }),
        frameRate: 8,
        repeat: 0,
      });
    }
  }

  update(time: number, delta: number): void {
    if (this._morto) return;
    super.update(time, delta);
    this.aggiornaAnimazioneCavaliere();
  }

  private aggiornaAnimazioneCavaliere(): void {
    const inMovimento = this.body.velocity.x !== 0 || this.body.velocity.y !== 0;

    if (inMovimento) {
      if (this.body.velocity.x < 0) this.setFlipX(true);
      else if (this.body.velocity.x > 0) this.setFlipX(false);
      if (this.anims.currentAnim?.key !== "knight_walk") this.play("knight_walk");
    } else {
      if (this.anims.currentAnim?.key !== "knight_idle") this.play("knight_idle");
    }
  }

  public subisciDanno(amount: number): void {
    super.subisciDanno(amount);
    if (this.vita <= 0 && !this._morto) {
      this._morto = true;
      this.setVelocity(0);
      this.play("knight_dead");
      this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "knight_dead", () => {
        console.log("💀 Cavaliere morto!");
      });
    }
  }

  public scattoRapido(): void {
    if (this._scattoAttivo) return;

    const ora = this._scena.time.now;
    if (ora - this._ultimoScatto < this._cooldownScatto) {
      console.log("💨 Scatto non disponibile (in ricarica)");
      return;
    }

    this._ultimoScatto = ora;
    this._scattoAttivo = true;
    console.log("💨 Cavaliere scatta!");

    this.setTint(0x00aaff);
    const velocitaOriginale = this.velocita;
    this.velocita = this._velocitaScatto;

    this._scena.time.delayedCall(this._durataScatto, () => {
      this.velocita = velocitaOriginale;
      this.clearTint();
      this._scattoAttivo = false;
      console.log("💨 Scatto terminato");
    });
  }

  public attaccoRavvicinato(): void {
    const ora = this._scena.time.now;
    if (ora - this._ultimoAttacco < this._cooldownAttacco) {
      console.log("⚔️ Attacco non disponibile (in ricarica)");
      return;
    }

    this._ultimoAttacco = ora;
    console.log("⚔️ Cavaliere attacca!");

    const cerchio = this._scena.add.circle(this.x, this.y, this._raggioAttacco, 0xffaa00, 0.6);
    this._scena.tweens.add({
      targets: cerchio,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => cerchio.destroy()
    });

    this.infliggiDannoANemiciVicini(25, this._raggioAttacco);
  }

  private infliggiDannoANemiciVicini(danno: number, raggio: number): void {
    const nemici = this._scena.getNemici()?.getChildren() || [];
    nemici.forEach((obj: any) => {
      if (obj.active && obj.subisciDanno) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, obj.x, obj.y);
        if (dist <= raggio) obj.subisciDanno(danno);
      }
    });
  }
}