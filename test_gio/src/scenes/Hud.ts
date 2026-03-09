import GamePlay from "./GamePlay";

export default class Hud extends Phaser.Scene {

  private _testoVita!: Phaser.GameObjects.Text;
  private _testoClasse!: Phaser.GameObjects.Text;
  private _gamePlayScene!: GamePlay;

  constructor() {
    super({
      key: "Hud",
    });
  }

  create() {
    this._testoVita = this.add.text(20, 20, "Vita: 100", {
      font: "24px Arial",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    });

    this._testoClasse = this.add.text(20, 50, "Classe: Cavaliere", {
      font: "24px Arial",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    });

    // Ottieni riferimento alla scena di gioco
    this._gamePlayScene = this.scene.get("GamePlay") as GamePlay;

    // Ascolta eventi
    this._gamePlayScene.events.on("vita-cambiata", (vita: number) => {
      this._testoVita.setText(`Vita: ${vita}`);
    });

    this._gamePlayScene.events.on("classe-cambiata", (classe: string) => {
      this._testoClasse.setText(`Classe: ${classe}`);
    });
    
    // Pulizia eventi alla chiusura
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this._gamePlayScene.events.off("vita-cambiata");
      this._gamePlayScene.events.off("classe-cambiata");
    });
  }
}
