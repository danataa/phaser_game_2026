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

  constructor(params: { scene: GamePlay; x: number; y: number }) {
    super(params);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }

  public scattoRapido(): void { //AUMENTARE VELOCITA PER BREVE TEMPO 
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
        if (dist <= raggio) {
          obj.subisciDanno(danno);
        }
      }
    });
  }
}