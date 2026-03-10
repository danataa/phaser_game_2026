import { GameData } from "../GameData";

export default class Intro extends Phaser.Scene {

  constructor() {
    super({ key: "Intro" });
  }

  create() {
    const { width, height } = this.scale;

    // Sfondo
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Titolo del gioco
    this.add
      .text(width / 2, height * 0.25, "PHASER GAME", {
        fontSize: "64px",
        color: "#ffffff",
        fontFamily: "Roboto",
        stroke: "#ff0000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Creazione bottoni
    this.createButton(width / 2, height * 0.45, "GIOCA", 0xe63946, () => {
      this.scene.start("GamePlay");
    });

    this.createButton(width / 2, height * 0.58, "OPZIONI", 0x457b9d, () => {
      console.log("Opzioni — scena non ancora implementata");
    });

    this.createButton(width / 2, height * 0.71, "CREDITS", 0x457b9d, () => {
      console.log("Credits — scena non ancora implementata");
    });
  }

  // Crea un bottone con sfondo colorato, testo e hover interattivo
  private createButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const btnWidth = 320;
    const btnHeight = 70;

    // Sfondo del bottone
    const bg = this.add
      .rectangle(x, y, btnWidth, btnHeight, color)
      .setInteractive({ useHandCursor: true });

    // Testo del bottone
    const text = this.add
      .text(x, y, label, {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "Roboto",
      })
      .setOrigin(0.5);

    // Effetto hover — schiarisce il bottone al passaggio del mouse
    bg.on("pointerover", () => {
      bg.setAlpha(0.8);
      text.setScale(1.05);
    });

    bg.on("pointerout", () => {
      bg.setAlpha(1);
      text.setScale(1);
    });

    // Effetto click — rimpicciolisce brevemente il bottone
    bg.on("pointerdown", () => {
      this.tweens.add({
        targets: [bg, text],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: onClick,
      });
    });
  }

  update(time: number, delta: number): void {}
}