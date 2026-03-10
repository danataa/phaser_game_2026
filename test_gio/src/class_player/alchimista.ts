import GamePlay from "../scenes/GamePlay";
import Player from "./Player";

export default class Alchimista extends Player {

  // ================================
  // ATTRIBUTI
  // ================================
  private _cooldown: number = 1000;       // millisecondi tra uno sparo e l'altro
  private _ultimoSparo: number = 0;       // timestamp dell'ultimo sparo
  private _proiettili!: Phaser.Physics.Arcade.Group; // gruppo dei triangolini attivi

  // ================================
  // COSTRUTTORE
  // ================================
  constructor(params: { scene: GamePlay; x: number; y: number }) {
    super(params);

    // Gruppo di proiettili — contiene tutti i triangolini attivi nella scena
    this._proiettili = params.scene.physics.add.group();

    // Salviamo il riferimento alla scena per usarlo nel listener in modo sicuro
    const scena = params.scene;

    // Click sinistro del mouse per sparare
    params.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Se l'alchimista è stato distrutto (cambio classe) ignoriamo il click
      if (!this.active || !this.scene) return;
      if (pointer.leftButtonDown()) {
        const now = scena.time.now;
        if (now - this._ultimoSparo >= this._cooldown) {
          this.spara(now);
        }
      }
    });
  }

  // ================================
  // UPDATE — chiamato ogni frame da GamePlay
  // ================================
  update(time: number, delta: number): void {
    super.update(time, delta);

    // Distruggiamo i proiettili usciti dai bounds della mappa
    this._proiettili.getChildren().forEach((p) => {
      const proiettile = p as Phaser.Physics.Arcade.Image;
      if (!proiettile.active) return;
      if (
        proiettile.x < 0 || proiettile.x > this.scene.physics.world.bounds.width ||
        proiettile.y < 0 || proiettile.y > this.scene.physics.world.bounds.height
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

    // Creiamo la texture del triangolino al volo — una volta sola
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

    // Convertiamo le coordinate del mouse in coordinate del mondo
    const puntatore = this.scene.input.activePointer;
    const camera = this.scene.cameras.main;
    const mouseX = puntatore.x / camera.zoom + camera.worldView.x;
    const mouseY = puntatore.y / camera.zoom + camera.worldView.y;

    // Calcoliamo l'angolo tra il player e il mouse e impostiamo la velocità
    const angolo = Phaser.Math.Angle.Between(this.x, this.y, mouseX, mouseY);
    proiettile.setRotation(angolo);
    this.scene.physics.velocityFromAngle(
      Phaser.Math.RadToDeg(angolo),
      400,
      proiettile.body.velocity
    );
  }

  // ================================
  // DESTROY — rimuoviamo il listener quando si cambia classe
  // ================================
  destroy(fromScene?: boolean): void {
    this._scena.input.off("pointerdown");
    super.destroy(fromScene);
  }

  // ================================
  // GETTER
  // ================================
  get proiettili(): Phaser.Physics.Arcade.Group {
    return this._proiettili;
  }
}