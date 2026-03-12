import Player from "../game_components/Player";
import MapManager from "../game_components/MapManager";

// Scena principale di gioco: crea la mappa e il player
export default class GamePlay extends Phaser.Scene {

  private _player: Player;
  private _mapManager: MapManager;

  constructor() {
    super({ key: "GamePlay" });
  }

  init() {}

  create() {
    this._mapManager = new MapManager(this);

    // Posiziona il player al centro della mappa
    this._player = new Player(this, this._mapManager.widthInPixels / 2, this._mapManager.heightInPixels / 2);
    this._player.setScale(2);

    this._mapManager.addCollider(this._player);
    this._mapManager.setupCamera(this._player);
  }

  update(_time: number, _delta: number): void {
    this._player?.update();
  }
}
