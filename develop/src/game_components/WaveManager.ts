import Phaser from "phaser";
import Zombie from "./enemies/Zombie";

// Gestisce le ondate di nemici
export default class WaveManager {

  // ================================
  // ATTRIBUTI
  // ================================
  private _scene: Phaser.Scene;
  private _player: Phaser.Physics.Arcade.Sprite;
  private _mapWidth: number;
  private _mapHeight: number;

  private _nemici!: Phaser.Physics.Arcade.Group;

  private _ondataCorrente: number = 1;
  private _nemiciPerOndata: number = 5;
  private _nemiciRimasti: number = 0;
  private _ondataAttiva: boolean = false;
  private _delaySpawn: number = 800; // ms tra spawn dei nemici

  // ================================
  // COSTRUTTORE
  // ================================
  constructor(
    scene: Phaser.Scene,
    player: Phaser.Physics.Arcade.Sprite,
    mapWidth: number,
    mapHeight: number
  ) {
    this._scene = scene;
    this._player = player;
    this._mapWidth = mapWidth;
    this._mapHeight = mapHeight;

    this._nemici = scene.physics.add.group();

    scene.events.on("nemico-morto", (data: any) => {
      this.onNemicoMorto(data);
    });

    console.log("✅ WaveManager pronto");
  }

  // ================================
  // AVVIA ONDATA
  // ================================
  public avviaOndata(): void {
    if (this._ondataAttiva) return;

    this._ondataAttiva = true;
    this._nemiciRimasti = this._nemiciPerOndata;

    console.log(`🌊 Ondata ${this._ondataCorrente} — ${this._nemiciPerOndata} nemici`);

    this._scene.events.emit("ondata-cambiata", this._ondataCorrente);

    for (let i = 0; i < this._nemiciPerOndata; i++) {
      this._scene.time.delayedCall(i * this._delaySpawn, () => {
        this.spawnaZombie();
      });
    }
  }

  // ================================
  // SPAWNA ZOMBIE
  // ================================
  private spawnaZombie(): void {
    const pos = this.getPosizioneBordo();
    const zombie = new Zombie(this._scene, pos.x, pos.y, this._player, this._ondataCorrente);
    this._nemici.add(zombie);

    // Zombie non si sovrappongono tra loro
    this._scene.physics.add.collider(zombie, this._nemici);

    console.log(`👹 Zombie spawnato (Ondata ${this._ondataCorrente}) in (${Math.round(pos.x)}, ${Math.round(pos.y)})`);
  }

  // ================================
  // POSIZIONE BORDO CASUALE
  // ================================
  private getPosizioneBordo(): { x: number; y: number } {
    const bordo = Phaser.Math.Between(0, 3);
    const margine = 100;

    switch (bordo) {
      case 0: return { x: Phaser.Math.Between(margine, this._mapWidth - margine), y: margine };
      case 1: return { x: Phaser.Math.Between(margine, this._mapWidth - margine), y: this._mapHeight - margine };
      case 2: return { x: margine, y: Phaser.Math.Between(margine, this._mapHeight - margine) };
      case 3: return { x: this._mapWidth - margine, y: Phaser.Math.Between(margine, this._mapHeight - margine) };
      default: return { x: this._mapWidth / 2, y: this._mapHeight / 2 };
    }
  }

  // ================================
  // NEMICO MORTO
  // ================================
  private onNemicoMorto(data: any): void {
    this._nemiciRimasti--;

    this._scene.events.emit("anima-spawned", { x: data.x, y: data.y, anime: data.anime });

    console.log(`💀 Nemici rimasti: ${this._nemiciRimasti} | Anime rilasciate: ${data.anime}`);

    if (this._nemiciRimasti <= 0) {
      this.ondataCompletata();
    }
  }

  // ================================
  // ONDATA COMPLETATA
  // ================================
  private ondataCompletata(): void {
    this._ondataAttiva = false;
    console.log(`✅ Ondata ${this._ondataCorrente} completata!`);

    this._scene.events.emit("ondata-completata", this._ondataCorrente);

    this._ondataCorrente++;
    // Ondate più sfidanti: +50% nemici per ondata
    this._nemiciPerOndata = Math.floor(this._nemiciPerOndata * 1.5);
    // Diminuisci delay tra spawn (max 300ms) per ondata
    this._delaySpawn = Math.max(this._delaySpawn - 100, 300);

    console.log(`⏳ Prossima ondata: ${this._ondataCorrente} — ${this._nemiciPerOndata} nemici (spawn ogni ${this._delaySpawn}ms)`);
  }

  // ================================
  // UPDATE
  // ================================
  public update(time: number): void {
    this._nemici.getChildren().forEach((obj) => {
      const zombie = obj as Zombie;
      if (zombie.active) zombie.update(time);
    });
  }

  // ================================
  // GETTER
  // ================================
  public get nemici(): Phaser.Physics.Arcade.Group {
    return this._nemici;
  }

  public get ondataCorrente(): number {
    return this._ondataCorrente;
  }
}