import GamePlay from "../scenes/GamePlay";
import Player from "./Player";

export default class Chierico extends Player {

  private _ultimaGuarigione: number = 0;
  private _cooldownGuarigione: number = 5000;
  private _ultimoScudo: number = 0;
  private _cooldownScudo: number = 8000;
  private _durataScudo: number = 3000;
  private _scudoAttivo: boolean = false;
  private _ultimoCerchio: number = 0;
  private _cooldownCerchio: number = 6000;
  private _raggioCerchio: number = 80;

  constructor(params: { scene: GamePlay; x: number; y: number }) {
    super(params);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }

  public abilitaGuarigione(): void {
    const ora = this._scena.time.now;
    if (ora - this._ultimaGuarigione < this._cooldownGuarigione) {
      console.log("❤️ Guarigione in ricarica");
      return;
    }
    this._ultimaGuarigione = ora;
    console.log("❤️ Chierico si cura!");
    this.cura(20);

    this.setTint(0x00ff00);
    this._scena.time.delayedCall(500, () => this.clearTint());
  }

  public scudoDivino(): void {
    if (this._scudoAttivo) return;

    const ora = this._scena.time.now;
    if (ora - this._ultimoScudo < this._cooldownScudo) {
      console.log("🛡️ Scudo in ricarica");
      return;
    }

    this._ultimoScudo = ora;
    this._scudoAttivo = true;
    this.invulnerabile = true;
    console.log("🛡️ Scudo divino attivato!");

    this.setTint(0xffff00);

    this._scena.time.delayedCall(this._durataScudo, () => {
      this.clearTint();
      this.invulnerabile = false;
      this._scudoAttivo = false;
      console.log("🛡️ Scudo terminato");
    });
  }

  public cerchioDiFuoco(): void {
    const ora = this._scena.time.now;
    if (ora - this._ultimoCerchio < this._cooldownCerchio) {
      console.log("🔥 Cerchio di fuoco in ricarica");
      return;
    }
    this._ultimoCerchio = ora;
    console.log("🔥 Cerchio di fuoco!");

    const cerchio = this._scena.add.circle(this.x, this.y, this._raggioCerchio, 0xff5500, 0.5);
    this._scena.tweens.add({
      targets: cerchio,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      onComplete: () => cerchio.destroy()
    });

    this.infliggiDannoANemiciNelRaggio(30, this._raggioCerchio);
  }

  private infliggiDannoANemiciNelRaggio(danno: number, raggio: number): void {
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