import Alchimista from "../class_player/alchimista";
import Chierico from "../class_player/chierico";
import Cavaliere from "../class_player/cavaliere";
import Player from "../class_player/Player";
import Nemico from "../class_player/Nemico"; // opzionale per test

export default class GamePlay extends Phaser.Scene {

  // ================================
  // ATTRIBUTI
  // ================================
  private _cameraPrincipale!: Phaser.Cameras.Scene2D.Camera;
  private _giocatore!: Player;
  private _mappa!: Phaser.Tilemaps.Tilemap;
  private _layerTerreno!: Phaser.Tilemaps.TilemapLayer;
  private _layerCespugli!: Phaser.Tilemaps.TilemapLayer;
  private _oggettoInterattivo!: Phaser.Physics.Arcade.Sprite | null;

  // Gruppo nemici (pubblico per accesso dalle classi Player)
  public nemici!: Phaser.Physics.Arcade.Group;

  // Tasti
  private _tastoInterazione!: Phaser.Input.Keyboard.Key;
  private _tastoCavaliere!: Phaser.Input.Keyboard.Key;
  private _tastoAlchimista!: Phaser.Input.Keyboard.Key;
  private _tastoChierico!: Phaser.Input.Keyboard.Key;
  private _tastoAbilita1!: Phaser.Input.Keyboard.Key; // F
  private _tastoAbilita2!: Phaser.Input.Keyboard.Key; // G
  private _tastoAbilita3!: Phaser.Input.Keyboard.Key; // H

  private readonly INTERACTION_RANGE = 48;

  constructor() {
    super({ key: "GamePlay" });
  }

  create() {
    this.creaMappa();
    this.creaGiocatoreIniziale();
    this.creaNemiciDiProva();   // opzionale
    this.configuraCamera();
    this.configuraInput();
    this.creaQuadratoInterattivo(200, 200);

    // Avvia la scena HUD
    this.scene.launch("Hud");
  }

  update(time: number, delta: number): void {
    this._giocatore.update(time, delta);

    // Cambio classe con tasti 1,2,3
    if (Phaser.Input.Keyboard.JustDown(this._tastoCavaliere)) {
      this.cambiaClasse('cavaliere');
    } else if (Phaser.Input.Keyboard.JustDown(this._tastoAlchimista)) {
      this.cambiaClasse('alchimista');
    } else if (Phaser.Input.Keyboard.JustDown(this._tastoChierico)) {
      this.cambiaClasse('chierico');
    }

    // Abilità contestuali (a seconda della classe corrente)
    if (Phaser.Input.Keyboard.JustDown(this._tastoAbilita1)) {
      if (this._giocatore instanceof Cavaliere) (this._giocatore as Cavaliere).scattoRapido();
      else if (this._giocatore instanceof Chierico) (this._giocatore as Chierico).abilitaGuarigione();
      else console.log("Abilità 1 non disponibile per questa classe");
    }
    if (Phaser.Input.Keyboard.JustDown(this._tastoAbilita2)) {
      if (this._giocatore instanceof Cavaliere) (this._giocatore as Cavaliere).attaccoRavvicinato();
      else if (this._giocatore instanceof Chierico) (this._giocatore as Chierico).scudoDivino();
      else console.log("Abilità 2 non disponibile per questa classe");
    }
    if (Phaser.Input.Keyboard.JustDown(this._tastoAbilita3)) {
      if (this._giocatore instanceof Chierico) (this._giocatore as Chierico).cerchioDiFuoco();
      else console.log("Abilità 3 non disponibile per questa classe");
    }

    // Interazione con oggetto (tasto E)
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
  // MAPPA
  // ================================
  private creaMappa(): void {
    this._mappa = this.make.tilemap({ key: "tilemap_0" });
    const tileset = this._mappa.addTilesetImage("Word", "tileset_word");
    if (!tileset) {
      console.error("Tileset non trovato!");
      return;
    }

    this._layerTerreno = this._mappa.createLayer("terreno", tileset, 0, 0);
    if (!this._layerTerreno) console.warn("Layer 'terreno' non trovato");

    this._layerCespugli = this._mappa.createLayer("cespugli", tileset, 0, 0);
    if (this._layerCespugli) {
      this._layerCespugli.setCollisionByProperty({ collide: true });
    } else {
      console.warn("Layer 'cespugli' non trovato");
    }

    this.physics.world.setBounds(0, 0, this._mappa.widthInPixels, this._mappa.heightInPixels);
  }

  // ================================
  // GIOCATORE
  // ================================
  private creaGiocatoreIniziale(): void {
    this._giocatore = new Cavaliere({
      scene: this,
      x: this._mappa.widthInPixels / 2,
      y: this._mappa.heightInPixels / 2,
    });

    if (this._layerCespugli) {
      this.physics.add.collider(this._giocatore, this._layerCespugli);
    }
    
    // Emetti evento iniziale per l'HUD
    this.time.delayedCall(100, () => {
      this.events.emit('classe-cambiata', 'Cavaliere');
      this.events.emit('vita-cambiata', this._giocatore.vita);
    });
  }

  private cambiaClasse(tipo: 'cavaliere' | 'alchimista' | 'chierico'): void {
    if (!this._giocatore) return;
    const x = this._giocatore.x;
    const y = this._giocatore.y;
    const vitaPrecedente = this._giocatore.vita;

    this._giocatore.destroy();

    let nomeClasse = '';

    switch (tipo) {
      case 'cavaliere':
        this._giocatore = new Cavaliere({ scene: this, x, y });
        nomeClasse = 'Cavaliere';
        console.log("✅ Cavaliere");
        break;
      case 'alchimista':
        this._giocatore = new Alchimista({ scene: this, x, y });
        nomeClasse = 'Alchimista';
        console.log("✅ Alchimista");
        break;
      case 'chierico':
        this._giocatore = new Chierico({ scene: this, x, y });
        nomeClasse = 'Chierico';
        console.log("✅ Chierico");
        break;
    }

    // Manteniamo la vita precedente o resettiamo? 
    // Per ora resettiamo perché è una nuova istanza, ma potremmo volerla passare al costruttore.
    // Se volessimo mantenerla: (this._giocatore as any)._vita = vitaPrecedente; (ma è protected)

    if (this._layerCespugli) {
      this.physics.add.collider(this._giocatore, this._layerCespugli);
    }
    this._cameraPrincipale.startFollow(this._giocatore, true, 0.1, 0.1);

    if (this._oggettoInterattivo) {
      this.ricreaColliderQuadrato();
    }

    this.events.emit('classe-cambiata', nomeClasse);
    this.events.emit('vita-cambiata', this._giocatore.vita);
  }

  // ================================
  // NEMICI (per test)
  // ================================
  private creaNemiciDiProva(): void {
    this.nemici = this.physics.add.group();
    const nemico1 = new Nemico({ scene: this, x: 400, y: 400, texture: 'nemico' });
    const nemico2 = new Nemico({ scene: this, x: 600, y: 500, texture: 'nemico' });
    this.nemici.add(nemico1);
    this.nemici.add(nemico2);
    // Collider con il giocatore
    this.physics.add.collider(this._giocatore, this.nemici);
  }

  // ================================
  // CAMERA
  // ================================
  private configuraCamera(): void {
    this._cameraPrincipale = this.cameras.main;
    this._cameraPrincipale.setBounds(0, 0, this._mappa.widthInPixels, this._mappa.heightInPixels);
    this._cameraPrincipale.startFollow(this._giocatore, true, 0.1, 0.1);
    this._cameraPrincipale.setZoom(2);
  }

  // ================================
  // INPUT
  // ================================
  private configuraInput(): void {
    this._tastoInterazione = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._tastoCavaliere = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this._tastoAlchimista = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this._tastoChierico = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this._tastoAbilita1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this._tastoAbilita2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    this._tastoAbilita3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
  }

  // ================================
  // OGGETTO INTERATTIVO
  // ================================
  private creaQuadratoInterattivo(x: number, y: number): void {
    const size = 32;
    const gfx = this.add.graphics();
    gfx.fillStyle(0x00ff00);
    gfx.fillRect(0, 0, size, size);
    gfx.generateTexture("square", size, size);
    gfx.destroy();

    this._oggettoInterattivo = this.physics.add.staticSprite(x, y, "square");
    this._oggettoInterattivo.setImmovable(true);
    this.ricreaColliderQuadrato();
  }

  private ricreaColliderQuadrato(): void {
    if (!this._oggettoInterattivo) return;

    this.physics.add.collider(this._giocatore, this._oggettoInterattivo, () => {
      this._giocatore.setVelocity(0);
    });

    this.physics.add.overlap(
      this._giocatore,
      this._oggettoInterattivo,
      (player, object) => this.quandoSovrapposto(player, object),
      undefined,
      this
    );

    // Se il giocatore è un Alchimista, gestiamo i proiettili
    if (this._giocatore instanceof Alchimista) {
      const alchimista = this._giocatore as Alchimista;
      this.physics.add.collider(
        alchimista.proiettili,
        this._oggettoInterattivo,
        (proiettile: any, oggetto: any) => {
          proiettile.destroy();
          oggetto.destroy();
          this._oggettoInterattivo = null;
          console.log("Quadrato colpito da un proiettile!");
        }
      );
    }
  }

  private quandoSovrapposto(player: any, object2: any): void {
    this._oggettoInterattivo = object2;
  }

  private gestisciInterazione(obj: Phaser.Physics.Arcade.Sprite): void {
    const message = this.add.text(
      this._cameraPrincipale.worldView.centerX,
      this._cameraPrincipale.worldView.centerY,
      "Hai interagito!",
      { font: "24px Arial", color: "#ffffff" }
    ).setOrigin(0.5);
    this.time.delayedCall(2000, () => message.destroy());
    obj.destroy();
    this._oggettoInterattivo = null;
  }

  // ================================
  // GETTER PER I NEMICI (opzionale, ma utile)
  // ================================
  public getNemici(): Phaser.Physics.Arcade.Group {
    return this.nemici;
  }
}