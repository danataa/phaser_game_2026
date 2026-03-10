export default class Intro extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;

  private bgMusic: Phaser.Sound.BaseSound;
  private optionsContainer: Phaser.GameObjects.Container;

  constructor() {
    super({
      key: "Intro",
    });

  }

  preload() {


  }

  create() {
    // Background Music
    /* if (!this.sound.get("music")) {
      this.bgMusic = this.sound.add("music", { loop: true, volume: 0.5 });
      this.bgMusic.play();
    } else {
      this.bgMusic = this.sound.get("music");
      if (!this.bgMusic.isPlaying) this.bgMusic.play();
    } */

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
        this.toggleOptions();
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
        this.add.text(this.cameras.main.centerX, 550, "Created by Yand", { font: "20px Arial", color: "#fff" }).setOrigin(0.5);
      });

    this.setupOptionsUI();
  }

  setupOptionsUI() {
    const bg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.8).setOrigin(0.5);
    const title = this.add.text(0, -70, "OPTIONS", { fontSize: "24px", color: "#ffffff" }).setOrigin(0.5);
    
    const volDown = this.add.text(-100, 0, "VOL -", { fontSize: "20px", color: "#ffffff", backgroundColor: "#333333", padding: {x:10, y:5} }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const volUp = this.add.text(0, 0, "VOL +", { fontSize: "20px", color: "#ffffff", backgroundColor: "#333333", padding: {x:10, y:5} }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const mute = this.add.text(100, 0, "MUTE", { fontSize: "20px", color: "#ffffff", backgroundColor: "#333333", padding: {x:10, y:5} }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    const close = this.add.text(0, 70, "CLOSE", { fontSize: "18px", color: "#ffffff", backgroundColor: "#666666", padding: {x:10, y:5} }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    volDown.on("pointerdown", () => {
      if (this.bgMusic) {
        let vol = (this.bgMusic as any).volume;
        vol = Math.max(0, vol - 0.1);
        (this.bgMusic as any).setVolume(vol);
      }
    });

    volUp.on("pointerdown", () => {
      if (this.bgMusic) {
        let vol = (this.bgMusic as any).volume;
        vol = Math.min(1, vol + 0.1);
        (this.bgMusic as any).setVolume(vol);
      }
    });

    mute.on("pointerdown", () => {
      this.sound.mute = !this.sound.mute;
      mute.setText(this.sound.mute ? "UNMUTE" : "MUTE");
      mute.setBackgroundColor(this.sound.mute ? "#ff0000" : "#333333");
    });

    close.on("pointerdown", () => {
      this.optionsContainer.setVisible(false);
    });

    this.optionsContainer = this.add.container(this.cameras.main.centerX, 450, [bg, title, volDown, volUp, mute, close]).setVisible(false);
  }

  toggleOptions() {
    this.optionsContainer.setVisible(!this.optionsContainer.visible);
  }

  update(time: number, delta: number): void {

  }

}

