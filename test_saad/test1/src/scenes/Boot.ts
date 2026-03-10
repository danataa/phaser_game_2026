import { GameData } from "../GameData";

export default class Boot extends Phaser.Scene {
  constructor() {
    super({ key: "Boot" });
  }

  preload() {
    this.cameras.main.setBackgroundColor("#05050f");
    this.load.image("logo", "assets/images/phaser.png");
  }

  create() {
    this.scene.stop("Boot");
    this.scene.start("Preloader");
  }

  update() {}
}
