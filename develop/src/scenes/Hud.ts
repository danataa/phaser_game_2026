export default class Hud extends Phaser.Scene {

  // ================================
  // ATTRIBUTI
  // ================================

  // Vita
  private _barraVitaSfondo!: Phaser.GameObjects.Graphics;
  private _barraVita!: Phaser.GameObjects.Graphics;
  private _testoVita!: Phaser.GameObjects.Text;
  private _vita: number = 100;
  private _vitaMassima: number = 100;

  // Anime
  private _testoAnime!: Phaser.GameObjects.Text;
  private _anime: number = 0;

  // Ondata
  private _testoOndata!: Phaser.GameObjects.Text;
  private _ondata: number = 1;

  // Dimensioni barra vita
  private readonly BARRA_W = 350;
  private readonly BARRA_H = 36;
  private readonly PADDING = 24;

  constructor() {
    super({ key: "Hud" });
  }

  // ================================
  // CREATE
  // ================================
  create() {
    const W = this.game.canvas.width;

    this.creaBarraVita();
    this.creaAnime(W);
    this.creaOndata(W);
    this.ascoltaEventi();
  }

  // ================================
  // BARRA VITA — in alto a sinistra, senza sfondo fascia
  // ================================
  private creaBarraVita(): void {
    const x = this.PADDING;
    const y = 30;

    // Icona cuore
    this.add.text(x, y, "❤️", {
      fontSize: "30px",
    }).setOrigin(0, 0.5);

    // Label "VITA"
    this.add.text(x + 42, y - 16, "VITA", {
      fontFamily: "'Press Start 2P'",
      fontSize: "13px",
      color: "#ffaa00",
      stroke: "#000000",
      strokeThickness: 3,
    });

    // Sfondo barra vita
    this._barraVitaSfondo = this.add.graphics();
    this._barraVitaSfondo.fillStyle(0x000000, 0.6);
    this._barraVitaSfondo.fillRoundedRect(x + 42, y + 2, this.BARRA_W, this.BARRA_H, 8);
    this._barraVitaSfondo.lineStyle(2, 0x8b5a2b, 1);
    this._barraVitaSfondo.strokeRoundedRect(x + 42, y + 2, this.BARRA_W, this.BARRA_H, 8);

    // Riempimento barra vita
    this._barraVita = this.add.graphics();
    this.aggiornaBarraVita();

    // Testo vita numerica sopra la barra
    this._testoVita = this.add.text(
      x + 42 + this.BARRA_W / 2,
      y + 2 + this.BARRA_H / 2,
      `${this._vita} / ${this._vitaMassima}`,
      {
        fontFamily: "'Press Start 2P'",
        fontSize: "13px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      }
    ).setOrigin(0.5);
  }

  // ================================
  // AGGIORNA BARRA VITA
  // ================================
  private aggiornaBarraVita(): void {
    const x = this.PADDING + 42;
    const y = 32;

    const percentuale = Math.max(this._vita / this._vitaMassima, 0);
    const larghezza = this.BARRA_W * percentuale;

    // Verde → arancione → rosso in base alla vita rimasta
    let colore = 0x44cc44;
    if (percentuale < 0.5) colore = 0xffaa00;
    if (percentuale < 0.25) colore = 0xcc2200;

    this._barraVita.clear();
    if (larghezza > 0) {
      this._barraVita.fillStyle(colore, 1);
      this._barraVita.fillRoundedRect(x, y, larghezza, this.BARRA_H, 8);
    }
  }

  // ================================
  // ANIME — al centro
  // ================================
  private creaAnime(W: number): void {
    // Icona
    this.add.text(W / 2 - 90, 30, "👻", {
      fontSize: "30px",
    }).setOrigin(0, 0.5);

    // Label
    this.add.text(W / 2 - 50, 14, "ANIME", {
      fontFamily: "'Press Start 2P'",
      fontSize: "13px",
      color: "#ffaa00",
      stroke: "#000000",
      strokeThickness: 3,
    });

    // Valore
    this._testoAnime = this.add.text(W / 2 - 50, 36, `${this._anime}`, {
      fontFamily: "'Press Start 2P'",
      fontSize: "22px",
      color: "#aaaaff",
      stroke: "#000000",
      strokeThickness: 3,
    });
  }

  // ================================
  // ONDATA — a destra
  // ================================
  private creaOndata(W: number): void {
    // Label
    this.add.text(W - this.PADDING - 180, 14, "ONDATA", {
      fontFamily: "'Press Start 2P'",
      fontSize: "13px",
      color: "#ffaa00",
      stroke: "#000000",
      strokeThickness: 3,
    });

    // Numero ondata
    this._testoOndata = this.add.text(W - this.PADDING - 180, 36, `${this._ondata}`, {
      fontFamily: "'Press Start 2P'",
      fontSize: "26px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    });
  }

  // ================================
  // ASCOLTA EVENTI DA GAMEPLAY
  // ================================
  private ascoltaEventi(): void {
    const gameplay = this.scene.get("GamePlay");

    // Aggiorna vita
    gameplay.events.on("vita-cambiata", (vita: number, vitaMassima: number) => {
      this._vita = vita;
      this._vitaMassima = vitaMassima;
      this.aggiornaBarraVita();
      this._testoVita.setText(`${this._vita} / ${this._vitaMassima}`);
    });

    // Aggiorna anime — animazione di scala al cambio
    gameplay.events.on("anime-cambiate", (anime: number) => {
      this._anime = anime;
      this._testoAnime.setText(`${this._anime}`);

      this.tweens.add({
        targets: this._testoAnime,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        yoyo: true,
      });
    });

    // Aggiorna ondata — animazione di scala al cambio
    gameplay.events.on("ondata-cambiata", (ondata: number) => {
      this._ondata = ondata;
      this._testoOndata.setText(`${this._ondata}`);

      this.tweens.add({
        targets: this._testoOndata,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 200,
        yoyo: true,
      });
    });
  }

  // ================================
  // UPDATE
  // ================================
  update(_time: number, _delta: number): void {}
}