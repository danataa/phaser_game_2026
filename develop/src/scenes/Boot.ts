import { GameData } from "../GameData";

// Prima scena caricata: imposta lo sfondo e avvia il Preloader
export default class Boot extends Phaser.Scene {

  constructor() {
    super({ key: "Boot" });
  }

  init() {
  }

  preload() {
  }

  create() {
    this.cameras.main.setBackgroundColor(GameData.globals.bgColor);
    this.scene.stop("Boot");
    this.scene.start("Preloader");
  }

  update(time: number, delta: number): void {
  }

}
