import Phaser from "phaser";

export default class WaveManager {
  private _scene: Phaser.Scene;
  private _ondataInCorso: boolean = false;
  private _ondataCorrente: number = 0;
  private _tastoAvvio: Phaser.Input.Keyboard.Key;
  private _tastoTermina: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this._scene = scene;
    this._tastoAvvio = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.V);
    this._tastoTermina = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    console.log("🌊 WaveManager creato — Premi V per avviare, B per terminare");
  }

  public update(): void {
    // Se premi V, avvia l'ondata
    if (Phaser.Input.Keyboard.JustDown(this._tastoAvvio)) {
      this.avviaOndata();
    }

    // Se premi B, termina l'ondata
    if (Phaser.Input.Keyboard.JustDown(this._tastoTermina)) {
      this.terminaOndata();
    }
  }

  /** Avvia un'ondata di nemici */
  public avviaOndata(): void {
    if (this._ondataInCorso) {
      console.warn("⚠️ Un'ondata è già in corso!");
      return;
    }

    this._ondataInCorso = true;
    this._ondataCorrente++;
    console.log(`🌊 ONDATA ${this._ondataCorrente} AVVIATA! Premi V per fermarla.`);
    
    // TODO: Generare nemici in base all'ondata
    // TODO: Implementare logica di verifica fine ondata (nemici sconfitti = ondata finita)
  }

  /** Termina l'ondata attuale (da chiamare quando nemici = 0) */
  public terminaOndata(): void {
    if (!this._ondataInCorso) return;

    this._ondataInCorso = false;
    console.log(`✅ Ondata ${this._ondataCorrente} TERMINATA! Puoi accedere al negozio.`);
  }

  /** Verifica se un'ondata è in corso */
  public isOndataActive(): boolean {
    return this._ondataInCorso;
  }

  /** Getter ondata attuale */
  public get ondataCorrente(): number {
    return this._ondataCorrente;
  }
}