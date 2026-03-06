export default class Intro extends Phaser.Scene {

  private _image1: Phaser.GameObjects.Image;



  constructor() {
    super({
      key: "Intro",
    });

  }

  preload() {


  }
  create() {

    //setta il background di sfondo a bianco
    this.cameras.main.setBackgroundColor("#000000");
    console.log("Intro scene created");


    this._image1 = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "phaser")

    this.input.on("pointerdown", () => {
      //fermiamo la scena corrente
      this.scene.stop("Intro");
      //richiamiamo il metodo start della scena Preloader per
      //passare alla scena successiva
      this.scene.start("GamePlay");
    } );

  }

  update(time: number, delta: number): void {

   

  }

}

