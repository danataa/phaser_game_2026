import { GameData } from "../GameData";

// Scena di fine partita
export default class GameOver extends Phaser.Scene {

  constructor() {
    super({ key: "GameOver" });
  }

  create() {
    console.log("GameOver");
  }
}
