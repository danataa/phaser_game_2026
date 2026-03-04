import { GameData } from "../GameData";

export default class GamePlay extends Phaser.Scene {

  private _mainCamera!: Phaser.Cameras.Scene2D.Camera;
  private _player!: Phaser.Physics.Arcade.Sprite;
  private _cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Dimensioni reali in pixel dell'immagine TileMap.png
  private readonly MAP_WIDTH: number = 560;
  private readonly MAP_HEIGHT: number = 560;

  constructor() {
    super({ key: "GamePlay" });
  }

  create() {
    // Riferimento alla camera principale
    this._mainCamera = this.cameras.main;

    // Sfondo della scena — TileMap.png come immagine statica ancorata in alto a sinistra
    this.add.image(0, 0, "tilemap").setOrigin(0);

    // Limiti della camera — impedisce alla camera di mostrare aree fuori dalla mappa
    this._mainCamera.setBounds(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);

    // Limiti del mondo fisico — impedisce al player di uscire dalla mappa
    this.physics.world.setBounds(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);

    // Creiamo il player al centro della mappa con la fisica ARCADE
    this._player = this.physics.add.sprite(this.MAP_WIDTH / 2, this.MAP_HEIGHT / 2, "player");
    this._player.setCollideWorldBounds(true); // Il player non può uscire dai bounds del mondo
    this._player.setScale(0.5);              // Ridimensioniamo il player al 50%

    // La camera segue il player con un leggero effetto smooth (lerp 0.1)
    this._mainCamera.startFollow(this._player, true, 0.1, 0.1);

    // Zoom automatico: la mappa riempie sempre tutto lo schermo indipendentemente dalla risoluzione
    this._mainCamera.setZoom(Math.max(
      this.scale.width / this.MAP_WIDTH,
      this.scale.height / this.MAP_HEIGHT
    ));

    // Inizializziamo i cursori direzionali (frecce + WASD)
    this._cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // Ad ogni frame azzeriamo la velocità (movimento solo se tasto premuto)
    this._player.setVelocity(0);

    if (this._cursors.left.isDown) {
      this._player.setVelocityX(-100);
    } else if (this._cursors.right.isDown) {
      this._player.setVelocityX(100);
    }

    if (this._cursors.up.isDown) {
      this._player.setVelocityY(-100);
    } else if (this._cursors.down.isDown) {
      this._player.setVelocityY(100);
    }
  }
}