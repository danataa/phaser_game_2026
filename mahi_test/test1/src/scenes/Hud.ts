import { GameData } from "../GameData";

export default class Hud extends Phaser.Scene {
    private killsText: Phaser.GameObjects.Text;
    private timeText: Phaser.GameObjects.Text;
    private upgradeText: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: "Hud",
        });
    }

    create() {
        const { width, height } = this.scale;

        this.killsText = this.add.text(20, 20, "KILLS: 0", {
            fontSize: "24px",
            fontFamily: "Roboto",
            color: "#ffffff"
        });

        this.timeText = this.add.text(width / 2, 20, "TIME: 00:00", {
            fontSize: "24px",
            fontFamily: "Roboto",
            color: "#ffffff"
        }).setOrigin(0.5, 0);

        this.upgradeText = this.add.text(width - 20, 20, "NEXT UPGRADE: 30", {
            fontSize: "24px",
            fontFamily: "Roboto",
            color: "#ffffff"
        }).setOrigin(1, 0);

        const gameplay = this.scene.get("GamePlay");
        gameplay.events.on("updateHud", (data: any) => {
            this.killsText.setText(`KILLS: ${data.kills}`);
            
            const minutes = Math.floor(data.time / 60);
            const seconds = data.time % 60;
            this.timeText.setText(`TIME: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            
            this.upgradeText.setText(`NEXT UPGRADE: ${data.nextUpgrade}`);
        });
    }
}
