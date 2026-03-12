// Schermata del menu principale, premi ENTER per giocare
export default class Menu extends Phaser.Scene {

  private _image1: Phaser.GameObjects.Image;
  private _enterKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "Menu" });
  }

  preload() {
  }

  create() {
    this.cameras.main.setBackgroundColor("#ffffff");

    // Logo centrato sullo schermo
    this._image1 = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "silent_production_logo");

    this._enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  update(time: number, delta: number): void {
    // Rotazione continua del logo
    this._image1.angle += 1;

    // ENTER per avviare il gioco
    if (Phaser.Input.Keyboard.JustDown(this._enterKey)) {
      this.scene.start("GamePlay");
    }
  }

}

