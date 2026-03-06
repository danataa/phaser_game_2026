import Alchimista from "../class_player/alchimista";

export default class GamePlay extends Phaser.Scene {

  // ================================
  // ATTRIBUTI
  // ================================
  private _cameraPrincipale!: Phaser.Cameras.Scene2D.Camera;
  private _giocatore!: Alchimista;
  private _tastoInterazione!: Phaser.Input.Keyboard.Key;
  private _oggettoInterattivo!: Phaser.Physics.Arcade.Sprite | null;
  private _mappa!: Phaser.Tilemaps.Tilemap;
  private _layerMondo!: Phaser.Tilemaps.TilemapLayer;
  private _layerCollisioni!: Phaser.Tilemaps.TilemapLayer;

  // Distanza massima in pixel entro cui è possibile interagire con un oggetto
  private readonly INTERACTION_RANGE = 48;

  constructor() {
    super({ key: "GamePlay" });
  }

  // ================================
  // CREATE
  // ================================
  create() {
    // L'ordine è importante: la mappa va creata prima del player e della camera
    this.creaMappa();
    this.creaGiocatore();
    this.configuraCamera();
    this.configuraInput();
    this.creaQuadratoInterattivo(200, 200);
  }

  // ================================
  // UPDATE — chiamato ogni frame
  // ================================
  update(time: number, delta: number): void {
    this._giocatore.update(time, delta);

    // Controlliamo se il giocatore preme E vicino all'oggetto interattivo
    if (
      this._oggettoInterattivo &&
      Phaser.Input.Keyboard.JustDown(this._tastoInterazione) &&
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

  // ================================
  // METODI PRIVATI
  // ================================

  /**
   * Crea la tilemap con i due layer:
   * - "world": layer visivo con i tile dello sfondo
   * - "collide": layer invisibile con i tile che bloccano il movimento
   * Le collisioni sono attivate tramite la property "collide: true" settata in Tiled.
   */
  private creaMappa(): void {
    this._mappa = this.make.tilemap({ key: "tilemap_0" });
    const tileset = this._mappa.addTilesetImage("tileset_inferno", "tileset_0");

    // Layer visivo — renderizzato come sfondo
    this._layerMondo = this._mappa.createLayer("world", tileset, 0, 0);

    // Layer collisioni — invisibile, usato solo per la fisica
    this._layerCollisioni = this._mappa.createLayer("collide", tileset, 0, 0);
    this._layerCollisioni.setCollisionByProperty({ collide: true });
    this._layerCollisioni.setVisible(false);

    // Bounds del mondo fisico basati sulle dimensioni reali della mappa
    this.physics.world.setBounds(
      0, 0,
      this._mappa.widthInPixels,
      this._mappa.heightInPixels
    );
  }

  /**
   * Crea l'Alchimista al centro della mappa.
   * Aggiunge il collider tra il player e il layer di collisioni.
   */
  private creaGiocatore(): void {
    this._giocatore = new Alchimista({
      scene: this,
      x: this._mappa.widthInPixels / 2,
      y: this._mappa.heightInPixels / 2,
    });

    // Il player viene bloccato dai tile con collisioni
    this.physics.add.collider(this._giocatore, this._layerCollisioni);
  }

  /**
   * Configura la camera principale:
   * - imposta i bounds della camera alle dimensioni della mappa
   * - avvia il follow del player con smoothing
   * - zoom fisso a 2 per rendere i tile e i proiettili ben visibili
   */
  private configuraCamera(): void {
    this._cameraPrincipale = this.cameras.main;

    // Bounds della camera — non va oltre i bordi della mappa
    this._cameraPrincipale.setBounds(
      0, 0,
      this._mappa.widthInPixels,
      this._mappa.heightInPixels
    );

    // Follow smooth del player
    this._cameraPrincipale.startFollow(this._giocatore, true, 0.1, 0.1);

    // Zoom fisso a 2 — i tile sono 32px, con zoom 2 diventano 64px ben visibili
    // Aumenta o diminuisci questo valore a piacere
    this._cameraPrincipale.setZoom(2);
  }

  /**
   * Inizializza il tasto di interazione (E).
   * I cursori direzionali e il tasto F sono gestiti dalla classe Player/Alchimista.
   */
  private configuraInput(): void {
    this._tastoInterazione = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
  }

  /**
   * Crea un oggetto interattivo (quadrato verde) in una posizione specificata.
   * Aggiunge collider con il player e overlap per la logica di interazione.
   * I proiettili dell'Alchimista distruggono il quadrato al contatto.
   */
  private creaQuadratoInterattivo(x: number, y: number): void {
    const size = 32;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x00ff00);
    gfx.fillRect(0, 0, size, size);
    gfx.generateTexture("square", size, size);
    gfx.destroy();

    this._oggettoInterattivo = this.physics.add.staticSprite(x, y, "square");
    this._oggettoInterattivo.setImmovable(true);

    // Il collider blocca fisicamente il player sull'oggetto
    this.physics.add.collider(this._giocatore, this._oggettoInterattivo, () => {
      this._giocatore.setVelocity(0);
    });

    // L'overlap rileva la sovrapposizione per abilitare il tasto E
    this.physics.add.overlap(
      this._giocatore,
      this._oggettoInterattivo,
      this.quandoSovrapposto as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // I proiettili distruggono il quadrato al contatto
    this.physics.add.collider(
      this._giocatore.proiettili,
      this._oggettoInterattivo,
      (proiettile, oggetto) => {
        (proiettile as Phaser.Physics.Arcade.Image).destroy();
        (oggetto as Phaser.Physics.Arcade.Sprite).destroy();
        this._oggettoInterattivo = null;
        console.log("Quadrato colpito da un proiettile!");
      }
    );
  }

  /**
   * Callback dell'overlap: salva il riferimento all'oggetto vicino al player.
   */
  private quandoSovrapposto(
    _player: Phaser.GameObjects.GameObject,
    object2: Phaser.GameObjects.GameObject
  ): void {
    this._oggettoInterattivo = object2 as Phaser.Physics.Arcade.Sprite;
  }

  /**
   * Esegue l'interazione: mostra un messaggio temporaneo e distrugge l'oggetto.
   */
  private gestisciInterazione(obj: Phaser.Physics.Arcade.Sprite): void {
    const message = this.add
      .text(
        this._cameraPrincipale.worldView.centerX,
        this._cameraPrincipale.worldView.centerY,
        "Hai premuto il quadrato!",
        { font: "24px Arial", color: "#ffffff" }
      )
      .setOrigin(0.5);

    this.time.delayedCall(2000, () => message.destroy());

    obj.destroy();
    this._oggettoInterattivo = null;
  }
}