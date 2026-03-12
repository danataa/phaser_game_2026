export default class ShopUI extends Phaser.Scene {

  // ================================
  // ATTRIBUTI
  // ================================
  private _perk: { nome: string; costo: number; descrizione: string }[] = [];
  private _anime: number = 100;
  private _animeText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "ShopUI" });
  }

  // ================================
  // INIT — riceve i dati dal Merchant
  // ================================
  init(data: { perk: { nome: string; costo: number; descrizione: string }[] }) {
    this._perk = data.perk || [];
  }

  // ================================
  // CREATE
  // ================================
  create() {
    const W = this.game.canvas.width;
    const H = this.game.canvas.height;

    this.creaOverlay(W, H);
    this.creaPergamena(W, H);
    this.creaTitolo(W, H);
    this.creaAnime(W, H);
    this.creaSeparatore(W, H);
    this.creaPerk(W, H);
    this.creaBottoneChiudi(W, H);

    // Fade in entrata
    this.cameras.main.setAlpha(0);
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 1,
      duration: 400,
      ease: "Power2",
    });
  }

  // ================================
  // OVERLAY
  // ================================
  private creaOverlay(W: number, H: number): void {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x1a0e00, 0.8);
    overlay.fillRect(0, 0, W, H);
  }

  // ================================
  // PERGAMENA
  // ================================
  private creaPergamena(W: number, H: number): void {
    const panW = 740;
    const panH = 560;
    const panX = W / 2 - panW / 2;
    const panY = H / 2 - panH / 2;

    const g = this.add.graphics();

    // Ombra
    g.fillStyle(0x000000, 0.6);
    g.fillRoundedRect(panX + 10, panY + 10, panW, panH, 4);

    // Corpo pergamena — beige caldo
    g.fillStyle(0xd4a96a, 1);
    g.fillRoundedRect(panX, panY, panW, panH, 4);

    // Texture interna più chiara
    g.fillStyle(0xe8c48a, 1);
    g.fillRoundedRect(panX + 12, panY + 12, panW - 24, panH - 24, 4);

    // Macchie invecchiamento — angoli scuri
    g.fillStyle(0xb8894a, 0.4);
    g.fillCircle(panX + 30, panY + 30, 35);
    g.fillCircle(panX + panW - 30, panY + 30, 35);
    g.fillCircle(panX + 30, panY + panH - 30, 35);
    g.fillCircle(panX + panW - 30, panY + panH - 30, 35);

    // Bordo esterno scuro
    g.lineStyle(4, 0x6b3a1f, 1);
    g.strokeRoundedRect(panX, panY, panW, panH, 4);

    // Bordo interno decorativo
    g.lineStyle(2, 0x8b5a2b, 0.6);
    g.strokeRoundedRect(panX + 12, panY + 12, panW - 24, panH - 24, 4);

    // Rotoli in cima e in fondo
    this.creaRotolo(g, panX, panY, panW, true);
    this.creaRotolo(g, panX, panY + panH - 30, panW, false);
  }

  private creaRotolo(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    w: number,
    sopra: boolean
  ): void {
    g.fillStyle(0xb8894a, 1);
    g.fillRoundedRect(x - 10, y - (sopra ? 10 : 0), w + 20, 30, 8);
    g.lineStyle(2, 0x6b3a1f, 1);
    g.strokeRoundedRect(x - 10, y - (sopra ? 10 : 0), w + 20, 30, 8);
    g.fillStyle(0x8b5a2b, 0.3);
    g.fillRoundedRect(x - 10, y - (sopra ? 10 : 0) + 15, w + 20, 15, 8);
  }

  // ================================
  // TITOLO
  // ================================
  private creaTitolo(W: number, H: number): void {
    this.add.text(W / 2, H / 2 - 230, "✦  Bottega del Mercante  ✦", {
      fontFamily: "'Press Start 2P'",
      fontSize: "20px",
      color: "#3d1a00",
      stroke: "#b8894a",
      strokeThickness: 2,
    }).setOrigin(0.5);
  }

  // ================================
  // SEPARATORE DECORATIVO
  // ================================
  private creaSeparatore(W: number, H: number): void {
    const g = this.add.graphics();
    g.lineStyle(2, 0x6b3a1f, 0.7);
    g.lineBetween(W / 2 - 310, H / 2 - 195, W / 2 + 310, H / 2 - 195);

    this.add.text(W / 2, H / 2 - 195, "❧", {
      fontSize: "20px",
      color: "#6b3a1f",
    }).setOrigin(0.5);
  }

  // ================================
  // ANIME DISPONIBILI
  // ================================
  private creaAnime(W: number, H: number): void {
    this.add.text(W / 2 - 310, H / 2 - 213, "Monete:", {
      fontFamily: "'Press Start 2P'",
      fontSize: "15px",
      color: "#3d1a00",
    });

    this._animeText = this.add.text(W / 2 - 195, H / 2 - 213, `${this._anime} 👻`, {
      fontFamily: "'Press Start 2P'",
      fontSize: "15px",
      color: "#5a0000",
      stroke: "#e8c48a",
      strokeThickness: 1,
    });
  }

  // ================================
  // PERK
  // ================================
  private creaPerk(W: number, H: number): void {
    const startY = H / 2 - 165;
    const spaziatura = 108;

    this._perk.forEach((perk, i) => {
      this.creaRigaPerk(perk, W, startY + i * spaziatura);
    });
  }

  private creaRigaPerk(
    perk: { nome: string; costo: number; descrizione: string },
    W: number,
    y: number
  ): void {
    const rigaW = 620;
    const rigaH = 88;
    const rigaX = W / 2 - rigaW / 2;

    // Sfondo riga — sempre uguale, non dipende dalle anime
    const bg = this.add.graphics();
    bg.fillStyle(0xc49050, 0.5);
    bg.fillRoundedRect(rigaX, y, rigaW, rigaH, 4);
    bg.lineStyle(1, 0x6b3a1f, 0.8);
    bg.strokeRoundedRect(rigaX, y, rigaW, rigaH, 4);

    // Icona a sinistra
    const iconBg = this.add.graphics();
    iconBg.fillStyle(0x8b5a2b, 0.4);
    iconBg.fillRoundedRect(rigaX + 10, y + 10, 65, 65, 4);
    iconBg.lineStyle(1, 0x6b3a1f, 0.6);
    iconBg.strokeRoundedRect(rigaX + 10, y + 10, 65, 65, 4);

    this.add.text(rigaX + 42, y + 44, "⚗️", {
      fontSize: "26px",
    }).setOrigin(0.5);

    // Nome perk
    this.add.text(rigaX + 90, y + 14, perk.nome, {
      fontFamily: "'Press Start 2P'",
      fontSize: "14px",
      color: "#3d1a00",
      stroke: "#e8c48a",
      strokeThickness: 1,
    });

    // Descrizione
    this.add.text(rigaX + 90, y + 46, perk.descrizione, {
      fontFamily: "'Press Start 2P'",
      fontSize: "9px",
      color: "#5a3a10",
      wordWrap: { width: 330 },
    });

    // Bottone acquisto
    const btnW = 130;
    const btnH = 46;
    const btnX = rigaX + rigaW - btnW - 10;
    const btnY = y + rigaH / 2 - btnH / 2;

    const btnBg = this.add.graphics();
    this.disegnaBottone(btnBg, btnX, btnY, btnW, btnH, true);

    const btnTesto = this.add.text(btnX + btnW / 2, btnY + btnH / 2, `${perk.costo} 👻`, {
      fontFamily: "'Press Start 2P'",
      fontSize: "13px",
      color: "#e8c48a",
      stroke: "#000000",
      strokeThickness: 1,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnTesto.on("pointerover", () => {
      this.disegnaBottone(btnBg, btnX, btnY, btnW, btnH, true, true);
      btnTesto.setColor("#ffffff");
    });

    btnTesto.on("pointerout", () => {
      this.disegnaBottone(btnBg, btnX, btnY, btnW, btnH, true, false);
      btnTesto.setColor("#e8c48a");
    });

    btnTesto.on("pointerdown", () => {
      // ✅ Controlliamo le anime AL MOMENTO DEL CLICK — non prima
      if (this._anime >= perk.costo) {
        this.acquista(perk, btnTesto, btnBg, btnX, btnY, btnW, btnH);
      } else {
        // Feedback rifiuto — messaggio + shake sul bottone
        this.mostraMessaggio("✦ Monete insufficienti! ✦", "#8b0000");
        this.tweens.add({
          targets: btnTesto,
          x: btnTesto.x + 4,
          duration: 40,
          yoyo: true,
          repeat: 3,
          onComplete: () => btnTesto.setX(btnX + btnW / 2),
        });
      }
    });
  }

  // ================================
  // DISEGNA BOTTONE
  // ================================
  private disegnaBottone(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    w: number, h: number,
    attivo: boolean,
    hover: boolean = false
  ): void {
    g.clear();
    if (attivo) {
      g.fillStyle(hover ? 0x5a1a00 : 0x3d1a00, 1);
      g.fillRoundedRect(x, y, w, h, 6);
      g.lineStyle(2, hover ? 0xffaa00 : 0x8b5a2b, 1);
      g.strokeRoundedRect(x, y, w, h, 6);
    } else {
      g.fillStyle(0x1a4a1a, 1);
      g.fillRoundedRect(x, y, w, h, 6);
      g.lineStyle(2, 0x44aa44, 1);
      g.strokeRoundedRect(x, y, w, h, 6);
    }
  }

  // ================================
  // ACQUISTO
  // ================================
  private acquista(
    perk: { nome: string; costo: number; descrizione: string },
    btnTesto: Phaser.GameObjects.Text,
    btnBg: Phaser.GameObjects.Graphics,
    btnX: number, btnY: number,
    btnW: number, btnH: number
  ): void {
    // Scalliamo le anime
    this._anime -= perk.costo;
    this._animeText.setText(`${this._anime} 👻`);

    // Disabilitiamo il bottone e lo rendiamo verde
    btnTesto.disableInteractive();
    this.disegnaBottone(btnBg, btnX, btnY, btnW, btnH, false);
    btnTesto.setText("✓ OK");
    btnTesto.setColor("#44ff88");
    btnTesto.setFontSize("13px");
    btnTesto.setX(btnX + btnW / 2);

    console.log(`✅ Acquistato: ${perk.nome}`);
    this.mostraMessaggio(`✦ ${perk.nome} acquistato! ✦`, "#1a5a00");

    // TODO: applicare effetto perk al player
  }

  // ================================
  // MESSAGGIO CENTRALE
  // ================================
  private mostraMessaggio(testo: string, colore: string): void {
    const W = this.game.canvas.width;
    const H = this.game.canvas.height;

    const msgBg = this.add.graphics();
    msgBg.fillStyle(0xe8c48a, 0.95);
    msgBg.fillRoundedRect(W / 2 - 240, H / 2 + 195, 480, 55, 6);
    msgBg.lineStyle(2, 0x6b3a1f, 1);
    msgBg.strokeRoundedRect(W / 2 - 240, H / 2 + 195, 480, 55, 6);
    msgBg.setAlpha(0);

    const msg = this.add.text(W / 2, H / 2 + 222, testo, {
      fontFamily: "'Press Start 2P'",
      fontSize: "13px",
      color: colore,
      stroke: "#e8c48a",
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [msg, msgBg],
      alpha: 1,
      duration: 250,
      yoyo: true,
      hold: 1400,
      onComplete: () => {
        msg.destroy();
        msgBg.destroy();
      },
    });
  }

  // ================================
  // BOTTONE CHIUDI
  // ================================
  private creaBottoneChiudi(W: number, H: number): void {
    const x = W / 2 + 352;
    const y = H / 2 - 262;

    const bg = this.add.graphics();
    bg.fillStyle(0x3d1a00, 1);
    bg.fillCircle(x, y, 20);
    bg.lineStyle(2, 0x8b5a2b, 1);
    bg.strokeCircle(x, y, 20);

    const testo = this.add.text(x, y, "✕", {
      fontFamily: "'Press Start 2P'",
      fontSize: "16px",
      color: "#e8c48a",
      stroke: "#000000",
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    testo.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(0x5a0000, 1);
      bg.fillCircle(x, y, 20);
      bg.lineStyle(2, 0xffaa00, 1);
      bg.strokeCircle(x, y, 20);
      testo.setColor("#ffffff");
    });

    testo.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(0x3d1a00, 1);
      bg.fillCircle(x, y, 20);
      bg.lineStyle(2, 0x8b5a2b, 1);
      bg.strokeCircle(x, y, 20);
      testo.setColor("#e8c48a");
    });

    testo.on("pointerdown", () => this.chiudi());
  }

  // ================================
  // CHIUDI
  // ================================
  private chiudi(): void {
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.scene.get("GamePlay").events.emit("shop-chiuso");
        this.scene.stop();
      }
    });
  }

  // ================================
  // UPDATE
  // ================================
  update(time: number, delta: number): void {}
}