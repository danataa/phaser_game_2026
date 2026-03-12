import Phaser from "phaser";

// Gestisce tilemap, layer e collisioni della mappa di gioco
export default class MapManager {
  private _scene: Phaser.Scene;
  private _map: Phaser.Tilemaps.Tilemap;

  // Tileset
  private _tilesetMain: Phaser.Tilemaps.Tileset;
  private _tilesetDeco: Phaser.Tilemaps.Tileset;

  // Layer
  private _floorLayer: Phaser.Tilemaps.TilemapLayer;
  private _holesLayer: Phaser.Tilemaps.TilemapLayer;
  private _wallsLayer: Phaser.Tilemaps.TilemapLayer;
  private _accessoriesLayer: Phaser.Tilemaps.TilemapLayer;

  private _scale: number;

  constructor(scene: Phaser.Scene, scale: number = 4) {
    this._scene = scene;
    this._scale = scale;

    this._createMap();
    this._createLayers();
    this._setupCollisions();
    this._scaleLayers();
  }

  get map(): Phaser.Tilemaps.Tilemap {
    return this._map;
  }

  // Dimensioni della mappa in pixel (scalate)
  get widthInPixels(): number {
    return this._map.widthInPixels * this._scale;
  }

  get heightInPixels(): number {
    return this._map.heightInPixels * this._scale;
  }

  // Layer che bloccano il movimento (muri e buchi)
  get collidableLayers(): Phaser.Tilemaps.TilemapLayer[] {
    return [this._wallsLayer, this._holesLayer];
  }

  // Carica la tilemap e i tileset da Tiled
  private _createMap(): void {
    this._map = this._scene.make.tilemap({ key: "tilemap" });
    this._tilesetMain = this._map.addTilesetImage("mainlevbuild", "tileset_0")!;
    this._tilesetDeco = this._map.addTilesetImage("decorative", "tileset_1")!;
  }

  // Crea i layer della mappa (pavimento, buchi, muri, decorazioni)
  private _createLayers(): void {
    this._floorLayer = this._map.createLayer("floor", this._tilesetMain, 0, 0)!;
    this._holesLayer = this._map.createLayer("holes", this._tilesetMain, 0, 0)!;
    this._wallsLayer = this._map.createLayer("walls", this._tilesetMain, 0, 0)!;
    this._accessoriesLayer = this._map.createLayer(
      "accessories",
      [this._tilesetMain, this._tilesetDeco],
      0,
      0
    )!;
  }

  // Attiva le collisioni sui tile con proprietà "collide" in Tiled
  private _setupCollisions(): void {
    this._wallsLayer.setCollisionByProperty({ collide: true });
    this._holesLayer.setCollisionByProperty({ collide: true });
  }

  // Scala tutti i layer della mappa
  private _scaleLayers(): void {
    this._floorLayer.setScale(this._scale);
    this._holesLayer.setScale(this._scale);
    this._wallsLayer.setScale(this._scale);
    this._accessoriesLayer.setScale(this._scale);
  }

  // Aggiunge collisioni tra uno sprite e i layer solidi
  addCollider(target: Phaser.Physics.Arcade.Sprite): void {
    for (const layer of this.collidableLayers) {
      this._scene.physics.add.collider(target, layer);
    }
  }

  // Configura la camera per seguire il target entro i limiti della mappa
  setupCamera(target: Phaser.GameObjects.GameObject): void {
    const cam = this._scene.cameras.main;
    cam.setBounds(0, 0, this.widthInPixels, this.heightInPixels);
    cam.startFollow(target, true);
  }
}
