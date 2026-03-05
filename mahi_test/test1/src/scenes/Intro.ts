import { GameData } from "../GameData";

export default class Intro extends Phaser.Scene {
    constructor() {
        super({
            key: "Intro",
        });
    }

    create() {
        const { width, height } = this.scale;
        
        this.cameras.main.setBackgroundColor("#000000");

        this.add.image(width / 2, height / 2 - 100, "phaser").setScale(1.5);

        this.add.text(width / 2, height / 2 + 50, "SURVIVOR QUEST", {
            fontSize: "64px",
            fontFamily: "Roboto",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const startBtn = this.add.image(width / 2, height / 2 + 180, "panel").setOrigin(0.5).setDisplaySize(300, 70);
        startBtn.setInteractive({ useHandCursor: true });
        
        this.add.text(width / 2, height / 2 + 180, "INIZIA GIOCO", {
            fontSize: "28px",
            fontFamily: "Roboto",
            color: "#ffffff"
        }).setOrigin(0.5);

        startBtn.on("pointerdown", () => {
            this.scene.start("GamePlay");
            this.scene.start("Hud");
            this.scene.bringToTop("Hud");
        });

        startBtn.on("pointerover", () => startBtn.setTint(0xcccccc));
        startBtn.on("pointerout", () => startBtn.clearTint());

        this.add.text(width / 2, height - 30, "WASD per muoverti | Sopravvivi 10 minuti", {
            fontSize: "16px",
            fontFamily: "Roboto",
            color: "#888888"
        }).setOrigin(0.5);
    }
}
