import { GameData } from "../GameData";

export default class GameOver extends Phaser.Scene {
    constructor() {
        super({
            key: "GameOver",
        });
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        this.add.image(width / 2, height / 2, "panel-border").setOrigin(0.5).setDisplaySize(500, 300);

        this.add.text(width / 2, height / 2 - 50, "GAME OVER", {
            fontSize: "64px",
            fontFamily: "Roboto",
            color: "#ff0000"
        }).setOrigin(0.5);

        const btn = this.add.image(width / 2, height / 2 + 50, "panel").setOrigin(0.5).setDisplaySize(200, 50);
        btn.setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height / 2 + 50, "RIPROVA", {
            fontSize: "18px",
            fontFamily: "Roboto",
            color: "#ffffff"
        }).setOrigin(0.5);

        btn.on("pointerdown", () => {
            this.scene.start("GamePlay");
            this.scene.start("Hud");
            this.scene.bringToTop("Hud");
        });

        const menuBtn = this.add.image(width / 2, height / 2 + 110, "panel").setOrigin(0.5).setDisplaySize(200, 50);
        menuBtn.setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height / 2 + 110, "MENU", {
            fontSize: "18px",
            fontFamily: "Roboto",
            color: "#ffffff"
        }).setOrigin(0.5);

        menuBtn.on("pointerdown", () => {
            this.scene.start("Intro");
        });
    }
}
