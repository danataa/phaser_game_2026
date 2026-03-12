import Phaser from "phaser";
import Player from "../game_components/Player";
import MapManager from "../game_components/MapManager";
import Merchant from "../game_components/Merchant";
import WaveManager from "../game_components/WaveManager";

export default class GamePlay extends Phaser.Scene {

  // ================================
  // ATTRIBUTI
  // ================================
  private _player!: Player;
  private _mapManager!: MapManager;
  private _merchant!: Merchant;
  private _waveManager!: WaveManager;

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

    this._player = new Player(
      this,
      this._mapManager.widthInPixels / 2,
      this._mapManager.heightInPixels / 2
    );
    this._player.setScale(2);

    this._merchant = new Merchant(
      this,
      this._mapManager.widthInPixels / 2,
      this._mapManager.heightInPixels / 2 - 100
    );

    this._waveManager = new WaveManager(
      this,
      this._player,
      this._mapManager.widthInPixels,
      this._mapManager.heightInPixels
    );

    // Collisioni
    this.physics.add.collider(this._player, this._merchant);
    // Overlap (non sposta) per player-nemici — combattimento senza knockback
    this.physics.add.overlap(this._player, this._waveManager.nemici);

    this._mapManager.addCollider(this._player);

    // Zombie collidono con i muri
    this._mapManager.collidableLayers.forEach(layer => {
      this.physics.add.collider(this._waveManager.nemici, layer);
    });

    this._mapManager.setupCamera(this._player);

    // ================================
    // ATTACCO PLAYER
    // ================================
    this.events.on("player-attacca", (data: any) => {
      this._waveManager.nemici.getChildren().forEach((enemy) => {
        const zombie = enemy as any;
        const distanza = Phaser.Math.Distance.Between(
          zombie.x, zombie.y,
          data.x, data.y
        );

        if (distanza <= data.raggio) {
          zombie.takeDamage(data.danno);
          console.log(`💥 Nemico colpito a ${Math.round(distanza)}px di distanza!`);
        }
      });
    });

    // ================================
    // ANIME RACCOLTE
    // ================================
    this.events.on("anima-spawned", (data: any) => {
      this._player.raccogliAnime(data.anime);
    });

    // Riprendi fisica dopo pausa shop
    this.events.on("resume", () => {
      this.physics.resume();
      console.log("▶️ GamePlay ripreso");
    });

    // Ondata completata → apri shop dopo 3 secondi
    this.events.on("ondata-completata", () => {
      this.time.delayedCall(3000, () => {
        this._merchant.apriShop();
      });
    });

    // Avvia prima ondata dopo 2 secondi
    this.time.delayedCall(2000, () => {
      this._waveManager.avviaOndata();
    });

    this.scene.launch("Hud");
  }

  // ================================
  // UPDATE
  // ================================
  update(_time: number, _delta: number): void {
    this._player?.update();
    this._merchant?.update(this._player.x, this._player.y);
    this._waveManager?.update(_time);
  }
}