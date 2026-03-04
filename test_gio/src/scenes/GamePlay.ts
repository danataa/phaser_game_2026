import { GameData } from "../GameData";

export default class GamePlay extends Phaser.Scene {
  private _cameraPrincipale!: Phaser.Cameras.Scene2D.Camera;
  private _giocatore!: Phaser.Physics.Arcade.Sprite;
  private _cursori!: Phaser.Types.Input.Keyboard.CursorKeys;
  private _tastoInterazione!: Phaser.Input.Keyboard.Key;
  private _oggettoInterattivo!: Phaser.Physics.Arcade.Sprite | null;

  // dimensioni mappa
  private readonly LARGHEZZA_MAPPA = 560;
  private readonly ALTEZZA_MAPPA = 560;

  // distanza massima dal giocatore per consentire l'interazione (pixel)
  private readonly INTERACTION_RANGE = 48;

  constructor() {
    super({ key: "GamePlay" }); // nome della scena invariato
  }

  create() {
    // costruisce prima il giocatore; la camera deve seguire un oggetto valido
    this.creaGiocatore();
    this.configuraCamera();
    this.configuraInput();
    this.creaQuadratoInterattivo(200, 200);
  }

  /**
   * Configura la telecamera principale, lo sfondo e i limiti del mondo.
   * - imposta bounds della camera e del mondo fisico secondo la mappa
   * - aggiunge l'immagine della tilemap e la fissa in alto a sinistra
   * - avvia il follow del player con smoothing e calcola un zoom scalabile
   *
   * Questa funzione può essere riutilizzata in altre scene che usano
   * una mappa rettangolare e hanno un personaggio da seguire.
   */
  private configuraCamera() {
    this._cameraPrincipale = this.cameras.main;
    // aggiunge lo sfondo della mappa e lo manda dietro tutti gli altri oggetti
    this.add.image(0, 0, "tilemap").setOrigin(0).setDepth(-1);
    this._cameraPrincipale.setBounds(0, 0, this.LARGHEZZA_MAPPA, this.ALTEZZA_MAPPA);
    this.physics.world.setBounds(0, 0, this.LARGHEZZA_MAPPA, this.ALTEZZA_MAPPA);

    this._cameraPrincipale.startFollow(this._giocatore, true, 0.1, 0.1);
    this._cameraPrincipale.setZoom(Math.max(
      this.scale.width / this.LARGHEZZA_MAPPA,
      this.scale.height / this.ALTEZZA_MAPPA
    ));
  }

  /**
   * Crea il giocatore come sprite arcade al centro della mappa.
   * Imposta il bounds del mondo in modo che il player non lo superi e
   * applica un semplice scaling.
   *
   * Può essere sostituito o esteso per utilizzare animazioni, hitbox,
   * o fisica diversa (ad es. Matter) in altre scene.
   */
  private creaGiocatore() {
    const { LARGHEZZA_MAPPA, ALTEZZA_MAPPA } = this;
    this._giocatore = this.physics.add.sprite(LARGHEZZA_MAPPA / 2, ALTEZZA_MAPPA / 2, "player");
    this._giocatore.setCollideWorldBounds(true);
    this._giocatore.setScale(0.5);
  }

  /**
   * Inizializza gli input da tastiera usati dalla scena.
   * - cursors per il movimento (frecce + WASD)
   * - tasto di interazione (E) per eventi su oggetti.
   *
   * Modificare qui per aggiungere altri comandi o gestire gamepad/tocco.
   */
  private configuraInput() {
    this._cursori = this.input.keyboard.createCursorKeys();
    this._tastoInterazione = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  /**
   * Crea un oggetto 'quadrato' statico in una posizione specificata.
   * L'oggetto usa una texture generata al volo, lo aggiunge al sistema di
   * fisica arcade e imposta un callback di overlap con il player.
   *
   * È un esempio di come inserire un oggetto interattivo; possono essere
   * chiamate più volte con coordinate diverse o facilmente sostituite con
   * sprite più complessi o group di oggetti.
   */
  private creaQuadratoInterattivo(x: number, y: number) {
    const size = 32;
    const gfx = this.add.graphics();
    gfx.fillStyle(0x00ff00);
    gfx.fillRect(0, 0, size, size);
    gfx.generateTexture('square', size, size);
    gfx.destroy();

    this._oggettoInterattivo = this.physics.add.staticSprite(x, y, 'square');
    if (this._oggettoInterattivo) {
      // il quadrato non si muove quando viene spinto dal giocatore
      this._oggettoInterattivo.setImmovable(true);

      // usa `collider` per bloccare il player sul contatto
      this.physics.add.collider(this._giocatore, this._oggettoInterattivo, () => {
        // assicuriamoci che il giocatore non continui a muoversi dopo la collisione
        this._giocatore.setVelocity(0);
      });

      // mantiene la logica d'interazione con il tasto E
      this.physics.add.overlap(
        this._giocatore,
        this._oggettoInterattivo,
        this.quandoSovrapposto as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );
    }
  }

  /**
   * Metodo chiamato ogni frame.
   * Gestisce movimento, input di interazione e altre logiche di gioco.
   * Può essere esteso con fisica, animazioni o eventi temporali.
   */
  update() {
    this.gestisciMovimentoGiocatore();
    if (
      this._oggettoInterattivo &&
      Phaser.Input.Keyboard.JustDown(this._tastoInterazione) &&
      // controlla la distanza invece di rely su overlap, visto che usiamo già un collider
      Phaser.Math.Distance.Between(
        this._giocatore.x,
        this._giocatore.y,
        this._oggettoInterattivo.x,
        this._oggettoInterattivo.y
      ) <= this.INTERACTION_RANGE
    ) {
      this.gestisciInterazione(this._oggettoInterattivo);
    }
  }

  /**
   * Applica velocità al player in base ai cursori.
   * Zero velocità se nessuna freccia è premuta (stop immediato).
   *
   * Separate rispetto a `update` per rendere il movimento riutilizzabile
   * in altre scene o sistemi (es. con accelerazione o joystick).
   */
  private gestisciMovimentoGiocatore() {
    this._giocatore.setVelocity(0);
    if (this._cursori.left.isDown) {
      this._giocatore.setVelocityX(-100);
    } else if (this._cursori.right.isDown) {
      this._giocatore.setVelocityX(100);
    }
    if (this._cursori.up.isDown) {
      this._giocatore.setVelocityY(-100);
    } else if (this._cursori.down.isDown) {
      this._giocatore.setVelocityY(100);
    }
  }

  /**
   * Callback dell'overlap fisico tra player e oggetto.
   * Qui si salva il riferimento all'oggetto in modo da permettere
   * l'interazione tramite tasto.
   */
  private quandoSovrapposto(
    object1: Phaser.GameObjects.GameObject | Phaser.Physics.Arcade.Body,
    object2: Phaser.GameObjects.GameObject | Phaser.Physics.Arcade.Body
  ) {
    this._oggettoInterattivo = object2 as Phaser.Physics.Arcade.Sprite;
  }

  /**
   * Esegue l'azione di interazione: mostra un messaggio temporaneo
   * e rimuove l'oggetto interattivo.
   */
  private gestisciInterazione(obj: Phaser.Physics.Arcade.Sprite) {
    const message = this.add
      .text(
        this._cameraPrincipale.worldView.centerX,
        this._cameraPrincipale.worldView.centerY,
        'Hai premuto il quadrato!',
        { font: '24px Arial', color: '#ffffff' }
      )
      .setOrigin(0.5);

    this.time.delayedCall(2000, () => message.destroy());

    obj.destroy();
    this._oggettoInterattivo = null;
  }
}