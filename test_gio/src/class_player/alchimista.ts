import GamePlay from "../scenes/GamePlay";
import Player from "./Player";

export default class Alchimista extends Player {

  // ================================
  // ATTRIBUTI
  // ================================
  private _cooldown: number = 1000;        // ricarica in millisecondi (3 secondi)
  private _ultimoSparo: number = 0;        // timestamp dell'ultimo sparo
  private _proiettili!: Phaser.Physics.Arcade.Group; // gruppo che contiene i triangolini
  private _tastoSparo!: Phaser.Input.Keyboard.Key;

  // ================================
  // COSTRUTTORE
  // ================================
  constructor(params: { scene: GamePlay; x: number; y: number }) {
    super(params);

    // Gruppo di proiettili — contiene tutti i triangolini attivi nella scena
    this._proiettili = params.scene.physics.add.group();

    // Tasto F per sparare
    this._tastoSparo = params.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.F
    );
  }

  // ================================
  // UPDATE — chiamato ogni frame da GamePlay
  // ================================
  update(time: number, delta: number): void {
    // Chiamiamo l'update del Player base (movimento + SPACE per danno)
    super.update(time, delta);

    // Controlliamo se F è premuto e se il cooldown è scaduto
    if (
      Phaser.Input.Keyboard.JustDown(this._tastoSparo) &&
      time - this._ultimoSparo >= this._cooldown
    ) {
      this.spara(time);
    }

    // Distruggiamo i proiettili usciti dai bounds della mappa
    this._proiettili.getChildren().forEach((p) => {
      const proiettile = p as Phaser.Physics.Arcade.Image;
      if (!proiettile.active) return;
      if (
        proiettile.x < 0 || proiettile.x > 560 ||
        proiettile.y < 0 || proiettile.y > 560
      ) {
        proiettile.destroy();
      }
    });
  }

  // ================================
  // SPARO
  // ================================

  /**
   * Crea un triangolino nella posizione del player e lo lancia verso il mouse.
   * Il cooldown impedisce di sparare più volte prima che il tempo sia scaduto.
   */
  private spara(time: number): void {
    this._ultimoSparo = time;

    // Creiamo la texture del triangolino al volo con Graphics
    if (!this.scene.textures.exists("triangolino")) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0xff6600);
      gfx.fillTriangle(8, 0, 16, 16, 0, 16);
      gfx.generateTexture("triangolino", 16, 16);
      gfx.destroy();
    }

    // Posizioniamo il proiettile sulla posizione attuale del player
    const proiettile = this.scene.physics.add.image(this.x, this.y, "triangolino");
    this._proiettili.add(proiettile);

    // Calcoliamo la direzione verso il puntatore del mouse
    const puntatore = this.scene.input.activePointer;
    const camera = this.scene.cameras.main;

    // Convertiamo le coordinate del mouse in coordinate del mondo
    const mouseX = puntatore.x / camera.zoom + camera.worldView.x;
    const mouseY = puntatore.y / camera.zoom + camera.worldView.y;

    // Calcoliamo l'angolo tra il player e il mouse
    const angolo = Phaser.Math.Angle.Between(this.x, this.y, mouseX, mouseY);

    // Ruotiamo il triangolino nella direzione di sparo
    proiettile.setRotation(angolo);

    // Impostiamo la velocità del proiettile nella direzione calcolata
    const velocita = 400;
    this.scene.physics.velocityFromAngle(
      Phaser.Math.RadToDeg(angolo),
      velocita,
      proiettile.body.velocity
    );
  }

  // ================================
  // GETTER
  // ================================

  // Espone il gruppo proiettili alla scena (utile per aggiungere collider)
  get proiettili(): Phaser.Physics.Arcade.Group {
    return this._proiettili;
  }
}