import Player from "../game_components/Player";
import MapManager from "../game_components/MapManager";
import Zombie from "../game_components/enemies/Zombie";

// Scena principale di gioco: crea la mappa e il player
export default class GamePlay extends Phaser.Scene {

  private _player: Player;
  private _zombie: Zombie

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

    /* Esempio di creazione nemici */

    // this._zombie = new Zombie(
    //   this,                                                  <-- scena corrente
    //   this._mapManager.widthInPixels / 2 ,                   <-- posizione X (centro mappa)
    //   this._mapManager.heightInPixels / 2,                   <-- posizione Y (centro mappa)
    //   this._player,                                          <-- target (player)
    // );
    // this._zombie.setMapManager(this._mapManager);            <-- assegna il map manager al nemico per pathfinding (pathfinding = AI di movimento)
    // this._mapManager.addCollider(this._zombie);              <-- aggiunge il nemico al sistema di collisioni della mappa
  }

  update(_time: number, _delta: number): void {
    this._player?.update();
    this._zombie.update();
  }
}
