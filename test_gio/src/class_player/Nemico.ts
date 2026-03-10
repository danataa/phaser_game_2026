import GamePlay from "../scenes/GamePlay";

export default class Nemico extends Phaser.Physics.Arcade.Sprite {
  private _vita: number = 50;
  private _scena: GamePlay;

  constructor(params: { scene: GamePlay; x: number; y: number; texture: string }) {
    super(params.scene, params.x, params.y, params.texture);
    this._scena = params.scene;
    this._scena.add.existing(this);
    this._scena.physics.add.existing(this);
    this.setCollideWorldBounds(true);
  }

  public subisciDanno(amount: number): void {
    this._vita -= amount;
    console.log(`Nemico ha subito ${amount} danni, vita rimasta: ${this._vita}`);
    if (this._vita <= 0) {
      this.destroy();
      console.log("Nemico sconfitto!");
    } else {
      this.setTint(0xff0000);
      this._scena.time.delayedCall(200, () => this.clearTint());
    }
  }
}