import GamePlay from "../scenes/GamePlay";

export default class Player extends Phaser.Physics.Arcade.Sprite {

  // ================================
  // ATTRIBUTI
  // ================================
  protected _scena: GamePlay;
  protected _vita: number = 100;
  protected _vitaMassima: number = 100;
  protected _velocita: number = 150;
  protected _cursori: Phaser.Types.Input.Keyboard.CursorKeys;
  protected _tastoInterazione: Phaser.Input.Keyboard.Key;
  protected _inMovimento: boolean = false;
  protected _direzione: string = 'giu';
  protected _invulnerabile: boolean = false;

  // ================================
  // COSTRUTTORE
  // ================================
  constructor(params: { scene: GamePlay; x: number; y: number }) {
    super(params.scene, params.x, params.y, "player");

    this._scena = params.scene;
    this._scena.add.existing(this);
    this._scena.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setScale(0.5);

    this._cursori = this._scena.input.keyboard.createCursorKeys();
    this._tastoInterazione = this._scena.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
  }

  // ================================
  // CREATE
  // ================================
  create(): void {
    // Riservato per animazioni nelle sottoclassi
  }

  // ================================
  // UPDATE — chiamato ogni frame da GamePlay
  // ================================
  update(time: number, delta: number): void {
    this.gestisciMovimento();

    // SPACE per testare il danno
    if (Phaser.Input.Keyboard.JustDown(this._cursori.space)) {
      this.subisciDanno(10);
    }
  }

  // ================================
  // MOVIMENTO
  // ================================
  private gestisciMovimento(): void {
    this.setVelocity(0);
    this._inMovimento = false;

    if (this._cursori.left.isDown) {
      this.setVelocityX(-this._velocita);
      this._inMovimento = true;
      this._direzione = 'sinistra';
    } else if (this._cursori.right.isDown) {
      this.setVelocityX(this._velocita);
      this._inMovimento = true;
      this._direzione = 'destra';
    }

    if (this._cursori.up.isDown) {
      this.setVelocityY(-this._velocita);
      this._inMovimento = true;
      this._direzione = 'su';
    } else if (this._cursori.down.isDown) {
      this.setVelocityY(this._velocita);
      this._inMovimento = true;
      this._direzione = 'giu';
    }

    // Normalizziamo la velocità in diagonale
    if (this._inMovimento && this.body.velocity.x !== 0 && this.body.velocity.y !== 0) {
      this.body.velocity.normalize().scale(this._velocita);
    }
  }

  // ================================
  // DANNO E CURA
  // ================================
  public subisciDanno(amount: number): void {
    if (this._invulnerabile) return;
    this._vita = Math.max(this._vita - amount, 0);
    console.log(`❤️ Vita rimasta: ${this._vita}`);
    this._scena.events.emit('vita-cambiata', this._vita);
    if (this._vita <= 0) this.muori();
  }

  public cura(amount: number): void {
    this._vita = Math.min(this._vita + amount, this._vitaMassima);
    this._scena.events.emit('vita-cambiata', this._vita);
  }

  // ================================
  // MORTE
  // ================================
  private muori(): void {
    console.log("💀 Il giocatore è morto!");
    this.setVelocity(0);
    this.setActive(false);
    this.setVisible(false);
    this._scena.events.emit('giocatore-morto');
  }

  // ================================
  // GETTER E SETTER
  // ================================
  public get vita(): number { return this._vita; }
  public get vitaMassima(): number { return this._vitaMassima; }
  public get velocita(): number { return this._velocita; }
  public set velocita(valore: number) { this._velocita = valore; }
  public set invulnerabile(stato: boolean) { this._invulnerabile = stato; }
}