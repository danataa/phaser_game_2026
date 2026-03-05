import { GameData } from "../GameData";

export default class UpgradeScene extends Phaser.Scene {
    private upgrades: any[] = [
        { id: "radius", name: "Raggio trasmutazione +20%", description: "Aumenta il raggio dell'abilità" },
        { id: "frequency", name: "Frequenza trasmutazione +20%", description: "Riduce il tempo di ricarica" },
        { id: "speed", name: "Velocità movimento +15%", description: "Muoviti più velocemente" },
        { id: "shield", name: "Scudo", description: "Blocca il prossimo colpo" }
    ];

    constructor() {
        super({ key: "UpgradeScene" });
    }

    create() {
        const { width, height } = this.scale;

        // Background overlay
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

        // Panel
        this.add.image(width / 2, height / 2, "panel-border").setOrigin(0.5).setDisplaySize(600, 400);

        this.add.text(width / 2, height / 2 - 150, "SCEGLI UN UPGRADE", {
            fontSize: "32px",
            fontFamily: "Roboto",
            color: "#ffffff"
        }).setOrigin(0.5);

        // Get 3 random upgrades
        const selectedUpgrades = Phaser.Utils.Array.Shuffle([...this.upgrades]).slice(0, 3);

        selectedUpgrades.forEach((upgrade, index) => {
            const x = width / 2;
            const y = height / 2 - 50 + (index * 80);

            const btn = this.add.image(x, y, "panel").setOrigin(0.5).setDisplaySize(400, 60);
            btn.setInteractive({ useHandCursor: true });

            this.add.text(x, y, upgrade.name, {
                fontSize: "20px",
                fontFamily: "Roboto",
                color: "#ffffff"
            }).setOrigin(0.5);

            btn.on("pointerdown", () => {
                this.scene.resume("GamePlay", { upgrade: upgrade.id });
                this.scene.stop();
            });

            btn.on("pointerover", () => btn.setTint(0xcccccc));
            btn.on("pointerout", () => btn.clearTint());
        });
    }
}
