import Player from "../game_components/Player";
import MapManager from "../game_components/MapManager";
import WaveManager from "../game_components/WaveManager";

// Scena principale di gioco: crea la mappa e il player
export default class GamePlay extends Phaser.Scene {

  private _player: Player;

  private _waveManager: WaveManager;
  private _enemyGroup: Phaser.Physics.Arcade.Group;

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

    this._enemyGroup = this.physics.add.group({ runChildUpdate: true });

    this._waveManager = new WaveManager(this, this._enemyGroup);
    this.events.on("wave-complete", this._onWaveComplete, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._onShutdown, this);
    this._waveManager.startWave(1);

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
    // this._zombie.update();                                   <-- aggiorna il comportamento del nemico (inseguimento, attacco, ecc.)
  }

  private _onWaveComplete(completedWave: number): void {
    this.time.delayedCall(2000, () => {
      this._waveManager.startWave(completedWave + 1);
    });
  }

  private _onShutdown(): void {
    this.events.off("wave-complete", this._onWaveComplete, this);
    this._waveManager.stop();
  }
}
