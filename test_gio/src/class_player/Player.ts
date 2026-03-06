import GamePlay from "../scenes/GamePlay";

export default class Player extends Phaser.Physics.Arcade.Sprite {

  // ================================
  // ATTRIBUTI
  // ================================
  private _scene: GamePlay;
  private _health: number = 100;
  private _speed: number = 150;
  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private _tastoInterazione: Phaser.Input.Keyboard.Key;

  // ================================
  // COSTRUTTORE
  // ================================
  constructor(params: { scene: GamePlay; x: number; y: number }) {
    super(params.scene, params.x, params.y, "player");

    this._scene = params.scene;

    // Aggiungiamo il player alla scena e abilitiamo la fisica ARCADE
    this._scene.add.existing(this);
    this._scene.physics.add.existing(this);

    // Il player non può uscire dai bounds del mondo fisico
    this.setCollideWorldBounds(true);

    // Scala del personaggio
    this.setScale(0.5);

    // Input da tastiera
    this._cursors = this._scene.input.keyboard.createCursorKeys();
    this._tastoInterazione = this._scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
  }

  // ================================
  // CREATE — chiamato una volta dopo la costruzione
  // Usato per animazioni e setup aggiuntivi
  // ================================
  create(): void {
    // Esempio animazione idle (da configurare con i frame del tuo spritesheet):
    // this._scene.anims.create({
    //   key: "idle",
    //   frames: this._scene.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
    //   frameRate: 8,
    //   repeat: -1,
    // });
  }

  // ================================
  // UPDATE — chiamato ogni frame da GamePlay
  // ================================
  update(time: number, delta: number): void {
    this.gestisciMovimento();

    // Ogni volta che premi SPACE il player prende 10 danni
    if (Phaser.Input.Keyboard.JustDown(this._cursors.space)) {
      this.takeDamage(10);
    }
  }

  // ================================
  // MOVIMENTO
  // ================================
  private gestisciMovimento(): void {
    // Azzeriamo la velocità ad ogni frame: il player si ferma se nessun tasto è premuto
    this.setVelocity(0);

    if (this._cursors.left.isDown) {
      this.setVelocityX(-this._speed);
    } else if (this._cursors.right.isDown) {
      this.setVelocityX(this._speed);
    }

    if (this._cursors.up.isDown) {
      this.setVelocityY(-this._speed);
    } else if (this._cursors.down.isDown) {
      this.setVelocityY(this._speed);
    }
  }

  // ================================
  // ALTRI METODI — comportamenti del personaggio
  // ================================

  /**
   * Riduce la vita del player dell'importo specificato.
   * Stampa la vita rimasta in console ad ogni danno ricevuto.
   * Se la vita scende a zero o sotto, viene gestita la morte.
   */
  takeDamage(amount: number): void {
    this._health -= amount;
    console.log(`Vita rimasta: ${this._health}`);

    if (this._health <= 0) {
      console.log("Player è morto!");
      // TODO: logica di morte (respawn, game over, ecc.)
    }
  }

  // Getter per accedere alla vita dall'esterno (es. dalla HUD)
  get health(): number {
    return this._health;
  }
}