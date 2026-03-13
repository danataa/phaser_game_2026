import Phaser from "phaser";
import MapManager from "../game_components/MapManager";
import Merchant from "../game_components/Merchant";
import Player from "../game_components/Player";
import WaveManager from "../game_components/WaveManager";
import PerkAOE from "../game_components/perks/PerkAOE";
import PerkDash from "../game_components/perks/PerkDash";

// Scena principale di gioco: crea la mappa e il player.
export default class GamePlay extends Phaser.Scene {
    private _player: Player;
    private _merchant: Merchant;
    private _waveManager: WaveManager;
    private _mapManager: MapManager;
    private _enemyGroup: Phaser.Physics.Arcade.Group;

    constructor() {
        super({ key: "GamePlay" });
    }

    get player(): Player {
        return this._player;
    }

    get merchant(): Merchant {
        return this._merchant;
    }

    get waveManager(): WaveManager {
        return this._waveManager;
    }

    get mapManager(): MapManager {
        return this._mapManager;
    }

    create(): void {
        this._mapManager = new MapManager(this);

        this._player = new Player(
            this,
            this._mapManager.widthInPixels / 2,
            this._mapManager.heightInPixels / 2,
        );
        this._player.setScale(2);

        /**
         * We keep one default perk per slot to preserve controls continuity while
         * still allowing the shop to replace temporary perks explicitly.
         */
        this._player.setPerkSlotQ(new PerkAOE(this._player, 120, 50, 2000));
        this._player.setPerkSlotE(new PerkDash(this._player, 1800, 110, 1200));

        this._mapManager.addCollider(this._player);
        this._mapManager.setupCamera(this._player);

        this._merchant = new Merchant(
            this,
            this._mapManager.widthInPixels / 2,
            this._mapManager.heightInPixels / 2,
        );
        this._mapManager.addCollider(this._merchant);
        this.physics.add.collider(this._player, this._merchant);

        this._enemyGroup = this.physics.add.group({ runChildUpdate: true });
        this._waveManager = new WaveManager(this, this._enemyGroup);

        this.events.on("update-score", this._onUpdateScore, this);
        this.events.on("wave-complete", this._onWaveComplete, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._onShutdown, this);

        this._waveManager.startWave(1);
    }

    update(): void {
        this._player?.update();
        this._merchant?.update(this._player.x, this._player.y);
        this._waveManager?.update();
    }

    private _onUpdateScore(soulsValue: number): void {
        this._player.raccogliAnime(soulsValue);
    }

    /**
     * We place the shop between waves to couple economy progression and combat
     * pacing, then start the next wave only after the player exits the shop.
     */
    private _onWaveComplete(completedWave: number): void {
        const nextWave = completedWave + 1;
        this._merchant.refreshStock(nextWave);
        this._merchant.apriShopEsterno();

        this.events.once("shop-chiuso", () => {
            this.time.delayedCall(400, () => {
                this._waveManager.startWave(nextWave);
            });
        });
    }

    private _onShutdown(): void {
        this.events.off("update-score", this._onUpdateScore, this);
        this.events.off("wave-complete", this._onWaveComplete, this);
        this._waveManager.stop();
    }
}
