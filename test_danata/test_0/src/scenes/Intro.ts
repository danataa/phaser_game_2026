export default class Intro extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;

  constructor() {
    super({
      key: "Intro",
    });

  }

  preload() {


  }

  create() {
    // Pulsante Start
    const startButton = this.add.text(this.cameras.main.centerX, 200, "START", {
      font: "32px Arial",
      color: "#fff",
      backgroundColor: "#222",
      padding: { x: 20, y: 10 },
      align: "center"
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.start("GamePlay");
      });

    // Pulsante Options
    const optionsButton = this.add.text(this.cameras.main.centerX, 270, "OPTIONS", {
      font: "32px Arial",
      color: "#fff",
      backgroundColor: "#222",
      padding: { x: 20, y: 10 },
      align: "center"
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        // Azione per options
        this.add.text(this.cameras.main.centerX, 400, "Opzioni non implementate", { font: "20px Arial", color: "#fff" }).setOrigin(0.5);
      });

    // Pulsante Credits
    const creditsButton = this.add.text(this.cameras.main.centerX, 340, "CREDITS", {
      font: "32px Arial",
      color: "#fff",
      backgroundColor: "#222",
      padding: { x: 20, y: 10 },
      align: "center"
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.add.text(this.cameras.main.centerX, 400, "Created by Yand", { font: "20px Arial", color: "#fff" }).setOrigin(0.5);
      });
  }

  update(time: number, delta: number): void {

  }

}

