import GamePlay from "./GamePlay";

// Scena overlay per l'interfaccia utente (HUD)
export default class Hud extends Phaser.Scene {

  constructor() {
    super({ key: "Hud" });
  }

  create() {
    console.log("HUD");
  }
}
