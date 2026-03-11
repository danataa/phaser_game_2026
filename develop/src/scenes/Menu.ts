export default class Menu extends Phaser.Scene {

  private _image1: Phaser.GameObjects.Image;



  constructor() {
    super({ key: "Menu" });

  }

  preload() {


  }
  create() {

    //setta il background di sfondo a bianco
    this.cameras.main.setBackgroundColor("#ffffff");


    this._image1 = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "silent_production_logo");

  }

  update(time: number, delta: number): void {

    this._image1.angle += 1;

  }

}

