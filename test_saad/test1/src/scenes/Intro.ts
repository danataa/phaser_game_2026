export default class Intro extends Phaser.Scene {
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
    // Background
    this.add.rectangle(0, 0, 1280, 800, 0x0a0a1a).setOrigin(0);

    // Titolo
    this.add.text(this.cameras.main.centerX, 90, "⚔ DUNGEON HUNT ⚔", {
      font: "48px Arial",
      color: "#ffaa00",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Background Music
    if (!this.sound.get("music")) {
      this.bgMusic = this.sound.add("music", { loop: true, volume: 0.5 });
      this.bgMusic.play();
    } else {
      this.bgMusic = this.sound.get("music");
      if (!(this.bgMusic as any).isPlaying) this.bgMusic.play();
    }

    const btnStyle = { font: "32px Arial", color: "#fff", backgroundColor: "#222244", padding: { x: 30, y: 12 }, align: "center" };

    // Pulsante Start
    const startButton = this.add.text(this.cameras.main.centerX, 220, "▶  INIZIA", btnStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#4444aa"); })
      .on("pointerout", function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#222244"); })
      .on("pointerdown", () => { this.scene.start("GamePlay"); });

    // Pulsante Options
    const optionsButton = this.add.text(this.cameras.main.centerX, 300, "⚙  OPTIONS", btnStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#4444aa"); })
      .on("pointerout", function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#222244"); })
      .on("pointerdown", () => { this.toggleOptions(); });

    // Pulsante Credits
    const creditsButton = this.add.text(this.cameras.main.centerX, 380, "★  CREDITS", btnStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#4444aa"); })
      .on("pointerout", function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#222244"); })
      .on("pointerdown", () => {
        this.add.text(this.cameras.main.centerX, 560, "Created by Yand", { font: "20px Arial", color: "#aaaaff" }).setOrigin(0.5);
      });

    // Istruzioni
    this.add.text(this.cameras.main.centerX, 480, "WASD/Frecce: Muovi  |  Click: Attacca  |  TAB: Cambia arma  |  SHIFT: Sprint  |  ESC: Pausa", {
      font: "16px Arial",
      color: "#888888",
    }).setOrigin(0.5);

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

