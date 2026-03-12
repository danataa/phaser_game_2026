import Player from "../game_components/Player";
import MapManager from "../game_components/MapManager";
import Merchant from "../game_components/Merchant";

// Scena principale di gioco: crea la mappa, il player e il merchant
export default class GamePlay extends Phaser.Scene {

  // ================================
  // ATTRIBUTI
  // ================================
  private _player!: Player;
  private _mapManager!: MapManager;
  private _merchant!: Merchant;

  constructor() {
    super({ key: "GamePlay" });
  }

  // ================================
  // INIT
  // ================================
  init() {}

  // ================================
  // CREATE
  // ================================
  create() {
    this._mapManager = new MapManager(this);

    // Posiziona il player al centro della mappa
    this._player = new Player(
      this,
      this._mapManager.widthInPixels / 2,
      this._mapManager.heightInPixels / 2
    );
    this._player.setScale(2);

    // 🖼️ TODO: posizionare il merchant in un punto fisso della mappa
    this._merchant = new Merchant(
      this,
      this._mapManager.widthInPixels / 2,
      this._mapManager.heightInPixels / 2 - 100
    );

    // Collisione tra player e merchant
    this.physics.add.collider(this._player, this._merchant);

    this._mapManager.addCollider(this._player);
    this._mapManager.setupCamera(this._player);

    // ✅ Quando GamePlay riprende dopo la pausa dello shop
    // riattiviamo la fisica manualmente
    this.events.on("resume", () => {
      this.physics.resume();
      console.log("▶️ GamePlay ripreso");
    });
    this.scene.launch("Hud"); // ✅ lancia HUD in overlay
  }

  // ================================
  // UPDATE
  // ================================
  update(_time: number, _delta: number): void {
    this._player?.update();

    // Passiamo la posizione del player al merchant ogni frame
    this._merchant?.update(this._player.x, this._player.y);
  }
}