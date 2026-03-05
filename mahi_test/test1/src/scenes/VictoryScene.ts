import { GameData } from "../GameData";

export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "VictoryScene" });
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        this.add.image(width / 2, height / 2, "panel-border").setOrigin(0.5).setDisplaySize(500, 300);

        this.add.text(width / 2, height / 2 - 50, "VITTORIA!", {
            fontSize: "64px",
            fontFamily: "Roboto",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 30, "Hai sopravvissuto per 10 minuti!", {
            fontSize: "24px",
            fontFamily: "Roboto",
            color: "#ffffff"
        }).setOrigin(0.5);

        const btn = this.add.image(width / 2, height / 2 + 100, "panel").setOrigin(0.5).setDisplaySize(200, 50);
        btn.setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height / 2 + 100, "MENU PRINCIPALE", {
            fontSize: "18px",
            fontFamily: "Roboto",
            color: "#ffffff"
        }).setOrigin(0.5);

        btn.on("pointerdown", () => {
            this.scene.start("Intro");
        });
    }
}
