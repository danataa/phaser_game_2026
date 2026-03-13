export default class Menu extends Phaser.Scene {

  // ================================
  // ATTRIBUTI
  // ================================
  private _enterKey!: Phaser.Input.Keyboard.Key;
  private _escapeKey!: Phaser.Input.Keyboard.Key;
  private _creditsPanel!: Phaser.GameObjects.Container;
  private _creditsVisible: boolean = false;

  constructor() {
    super({ key: "Menu" });
  }

  // ================================
  // PRELOAD
  // ================================
  preload() {
    this.load.image("menuBg", "assets/background/background_3.png");
  }

  // ================================
  // CREATE
  // ================================
  create() {
    const W = this.game.canvas.width;
    const H = this.game.canvas.height;
    const CX = W / 2;
    const CY = H / 2;

    this._creaBackground(W, H, CX, CY);
    this._creaPannelloSinistro(H);
    this._creaTitolo(H);
    this._creaBottoni(H);
    this._creaCreditsPanel(CX, CY);

    this._enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this._escapeKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  // ================================
  // BACKGROUND
  // ================================
  private _creaBackground(W: number, H: number, CX: number, CY: number): void {
    this.add.image(CX, CY, "menuBg").setOrigin(0.5);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.35);
    overlay.fillRect(0, 0, W, H);
  }

  // ================================
  // PANNELLO SINISTRO
  // ================================
  private _creaPannelloSinistro(H: number): void {
    const g = this.add.graphics();

    // Sfondo pannello
    g.fillStyle(0x050000, 0.82);
    g.fillRect(0, 0, 300, H);

    // Bordo destro rosso sangue
    g.lineStyle(3, 0x8b0000, 1);
    g.lineBetween(300, 0, 300, H);

    // Bordo dorato sottile
    g.lineStyle(1, 0xc8a800, 0.4);
    g.lineBetween(296, 0, 296, H);

    // Ornamenti orizzontali
    g.lineStyle(1, 0x8b0000, 0.4);
    g.lineBetween(20, 30, 280, 30);
    g.lineBetween(20, H - 30, 280, H - 30);

    this._creaAngoliAnimati(H);
    this._creaParticelleBrace(H);
    this._creaTestoVerticale(H);

    // Simbolo croce pulsante
    const simbolo = this.add.text(150, H - 55, "☩", {
      fontFamily: "'Press Start 2P'",
      fontSize: "18px",
      color: "#8b0000",
    }).setOrigin(0.5).setAlpha(0.5);

    this.tweens.add({
      targets: simbolo,
      alpha: 0.15,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Versione
    this.add.text(150, H - 22, "v0.1 — alpha", {
      fontFamily: "'Press Start 2P'",
      fontSize: "8px",
      color: "#333333",
    }).setOrigin(0.5);
  }

  // ================================
  // ANGOLI ANIMATI
  // ================================
  private _creaAngoliAnimati(H: number): void {
    const angoli = [
      { x: 16,  y: 16      },
      { x: 284, y: 16      },
      { x: 16,  y: H - 16  },
      { x: 284, y: H - 16  },
    ];

    const lunghezza = 22;

    angoli.forEach(({ x, y }) => {
      const g = this.add.graphics();
      const dirX = x < 150 ? 1 : -1;
      const dirY = y < H / 2 ? 1 : -1;

      const disegna = (alpha: number) => {
        g.clear();
        g.lineStyle(2, 0xc8a800, alpha);
        g.lineBetween(x, y, x + dirX * lunghezza, y);
        g.lineBetween(x, y, x, y + dirY * lunghezza);
        g.fillStyle(0xc8a800, alpha);
        g.fillCircle(x, y, 3);
      };

      disegna(0.6);

      this.tweens.add({
        targets: { val: 0.6 },
        val: 0.15,
        duration: 1500 + Math.random() * 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
        onUpdate: (tween) => disegna(tween.getValue()),
      });
    });
  }

  // ================================
  // PARTICELLE BRACE
  // ================================
  private _creaParticelleBrace(H: number): void {
    for (let i = 0; i < 12; i++) {
      const x = 20 + Math.random() * 260;
      const startY = H * 0.4 + Math.random() * H * 0.5;
      const size = 1 + Math.random() * 2;
      const colori = [0xff4400, 0xff8800, 0xffaa00, 0xff2200];
      const colore = colori[Math.floor(Math.random() * colori.length)];

      const p = this.add.graphics();
      p.fillStyle(colore, 0.8);
      p.fillCircle(x, startY, size);

      this.tweens.add({
        targets: p,
        y: -(50 + Math.random() * 100),
        alpha: 0,
        duration: 2000 + Math.random() * 3000,
        delay: Math.random() * 4000,
        repeat: -1,
        ease: "Power1.out",
        onRepeat: () => {
          p.clear();
          const newX = 20 + Math.random() * 260;
          const newSize = 1 + Math.random() * 2;
          p.fillStyle(colore, 0.8);
          p.fillCircle(newX, 0, newSize);
          p.setY(startY);
          p.setAlpha(0.8);
        },
      });
    }
  }

  // ================================
  // TESTO VERTICALE DECORATIVO
  // ================================
  private _creaTestoVerticale(H: number): void {
    const frasi = ["SANGUE", "FUOCO", "GLORIA"];

    frasi.forEach((frase, i) => {
      const t = this.add.text(10, H / 2 - 60 + i * 40, frase, {
        fontFamily: "'Press Start 2P'",
        fontSize: "9px",
        color: "#3a0000",
      }).setOrigin(0, 0.5).setAngle(-90).setAlpha(0.4);

      this.tweens.add({
        targets: t,
        alpha: 0.15,
        duration: 1800 + i * 400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    });

    // Linea verticale sinistra
    const g = this.add.graphics();
    g.lineStyle(1, 0x3a0000, 0.5);
    g.lineBetween(22, 60, 22, H - 60);

    // Rombi decorativi pulsanti
    [0.25, 0.5, 0.75].forEach(pct => {
      const y = 60 + (H - 120) * pct;
      const d = this.add.graphics();

      const disegnaRombo = (alpha: number) => {
        d.clear();
        d.lineStyle(1, 0xc8a800, alpha);
        d.strokeTriangle(22, y - 6, 28, y, 22, y + 6);
        d.strokeTriangle(22, y - 6, 16, y, 22, y + 6);
      };

      disegnaRombo(0.4);

      this.tweens.add({
        targets: { val: 0.4 },
        val: 0.1,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
        onUpdate: (tween) => disegnaRombo(tween.getValue()),
      });
    });
  }

  // ================================
  // TITOLO ANIMATO
  // ================================
  private _creaTitolo(H: number): void {
    const x = 150;
    const startY = 80;

    // Ornamento sopra
    const ornSopra = this.add.text(x, startY, "✦ ✦ ✦", {
      fontFamily: "'Press Start 2P'",
      fontSize: "12px",
      color: "#8b0000",
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: ornSopra,
      alpha: 0.7,
      duration: 800,
      delay: 200,
      ease: "Power2.inOut",
    });

    // Ombra titolo
    const titoloOmbra = this.add.text(x + 3, startY + 43, "Hell's\nGate", {
      fontFamily: "'Press Start 2P'",
      fontSize: "48px",
      color: "#1a0000",
      align: "center",
      lineSpacing: 8,
    }).setOrigin(0.5, 0).setAlpha(0);

    // Titolo principale
    const titoloTesto = this.add.text(x, startY + 40, "Hell's\nGate", {
      fontFamily: "'Press Start 2P'",
      fontSize: "48px",
      color: "#cc0000",
      stroke: "#c8a800",
      strokeThickness: 3,
      align: "center",
      lineSpacing: 8,
    }).setOrigin(0.5, 0).setAlpha(0);

    this.tweens.add({
      targets: [titoloOmbra, titoloTesto],
      alpha: 1,
      duration: 1200,
      delay: 400,
      ease: "Power2.inOut",
    });

    // Pulsazione lenta
    this.time.delayedCall(1600, () => {
      this.tweens.add({
        targets: titoloTesto,
        alpha: 0.7,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    });

    // Separatore
    const sep = this.add.graphics();
    sep.lineStyle(2, 0x8b0000, 0.7);
    sep.lineBetween(30, startY + 178, 270, startY + 178);
    sep.setAlpha(0);

    this.tweens.add({
      targets: sep,
      alpha: 1,
      duration: 600,
      delay: 1200,
    });

    // Sottotitolo
    const sottoTesto = this.add.text(x, startY + 192, "— Parigi, 1789 —\nL'inferno si apre", {
      fontFamily: "'Press Start 2P'",
      fontSize: "11px",
      color: "#aa7700",
      align: "center",
      lineSpacing: 6,
    }).setOrigin(0.5, 0).setAlpha(0);

    this.tweens.add({
      targets: sottoTesto,
      alpha: 1,
      duration: 800,
      delay: 1400,
      ease: "Power2.inOut",
    });

    // Ornamento sotto
    const ornSotto = this.add.text(x, startY + 256, "— ☩ —", {
      fontFamily: "'Press Start 2P'",
      fontSize: "13px",
      color: "#8b0000",
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: ornSotto,
      alpha: 0.6,
      duration: 800,
      delay: 1800,
      ease: "Power2.inOut",
    });
  }

  // ================================
  // BOTTONI
  // ================================
  private _creaBottoni(H: number): void {
    const x = 150;
    const btnY1 = H / 2 + 80;
    const btnY2 = H / 2 + 170;

    this._creaBottone(
      x, btnY1,
      "⚔  GIOCA  ⚔",
      0x6b0000, 0xaa0000, 0xcc0000,
      "18px", 240, 60, 1800,
      () => this._startGame()
    );

    this._creaBottone(
      x, btnY2,
      "✦  CREDITI",
      0x1a1000, 0x3a2800, 0xc8a800,
      "13px", 200, 48, 2000,
      () => this._toggleCredits()
    );
  }

  private _creaBottone(
    x: number, y: number,
    label: string,
    colorNorm: number, colorHover: number, colorBordo: number,
    fontSize: string,
    w: number, h: number,
    delay: number,
    onClick: () => void
  ): void {
    const bx = x - w / 2;
    const by = y - h / 2;

    const bg = this.add.graphics();
    this._disegnaBottone(bg, bx, by, w, h, colorNorm, colorBordo, false);
    bg.setAlpha(0);

    const dec = this.add.graphics();
    dec.lineStyle(1, colorBordo, 0.3);
    dec.strokeRect(bx + 5, by + 5, w - 10, h - 10);
    dec.setAlpha(0);

    const testo = this.add.text(x, y, label, {
      fontFamily: "'Press Start 2P'",
      fontSize,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: [bg, testo, dec],
      alpha: 1,
      duration: 600,
      delay,
      ease: "Power2.inOut",
    });

    testo.on("pointerover", () => {
      this._disegnaBottone(bg, bx, by, w, h, colorHover, colorBordo, true);
      testo.setColor("#ffdd88");
      this.tweens.add({ targets: testo, scaleX: 1.06, scaleY: 1.06, duration: 100 });
    });

    testo.on("pointerout", () => {
      this._disegnaBottone(bg, bx, by, w, h, colorNorm, colorBordo, false);
      testo.setColor("#ffffff");
      this.tweens.add({ targets: testo, scaleX: 1, scaleY: 1, duration: 100 });
    });

    testo.on("pointerdown", () => {
      this.tweens.add({ targets: testo, scaleX: 0.94, scaleY: 0.94, duration: 60, yoyo: true });
      onClick();
    });
  }

  private _disegnaBottone(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    w: number, h: number,
    fill: number,
    bordo: number,
    hover: boolean
  ): void {
    g.clear();
    g.fillStyle(fill, hover ? 0.95 : 0.8);
    g.fillRoundedRect(x, y, w, h, 4);
    g.lineStyle(2, bordo, 1);
    g.strokeRoundedRect(x, y, w, h, 4);
    g.fillStyle(0xffffff, 0.05);
    g.fillRoundedRect(x + 2, y + 2, w - 4, h / 2 - 2, 3);
  }

  // ================================
  // PANEL CREDITI
  // ================================
  private _creaCreditsPanel(CX: number, CY: number): void {
    this._creditsPanel = this.add.container(CX, CY);
    this._creditsPanel.setVisible(false);

    const W = 680;
    const H = 460;

    const bg = this.add.graphics();
    bg.fillStyle(0x020000, 0.96);
    bg.fillRoundedRect(-W / 2, -H / 2, W, H, 6);
    bg.lineStyle(3, 0x8b0000, 1);
    bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 6);
    bg.lineStyle(1, 0xc8a800, 0.3);
    bg.strokeRoundedRect(-W / 2 + 8, -H / 2 + 8, W - 16, H - 16, 4);
    this._creditsPanel.add(bg);

    // Titolo
    const titolo = this.add.text(0, -H / 2 + 38, "☩  CREDITI  ☩", {
      fontFamily: "'Press Start 2P'",
      fontSize: "20px",
      color: "#c8a800",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5);
    this._creditsPanel.add(titolo);

    // Separatore
    const sep = this.add.graphics();
    sep.lineStyle(1, 0x8b0000, 0.7);
    sep.lineBetween(-W / 2 + 40, -H / 2 + 70, W / 2 - 40, -H / 2 + 70);
    this._creditsPanel.add(sep);

    // Contenuto
    const righe = [
      { testo: "(RE)VOLUTION", grande: true },
      { testo: "", grande: false },
      { testo: "Design & Development", grande: true },
      { testo: "— Il tuo nome —", grande: false },
      { testo: "", grande: false },
      { testo: "Corso: Crea un videogioco", grande: false },
      { testo: "con PhaserJS e TypeScript", grande: false },
      { testo: "", grande: false },
      { testo: "Assets: itch.io", grande: false },
      { testo: "Font: Google Fonts", grande: false },
    ];

    righe.forEach((riga, i) => {
      const t = this.add.text(0, -H / 2 + 100 + i * 30, riga.testo, {
        fontFamily: "'Press Start 2P'",
        fontSize: riga.grande ? "14px" : "11px",
        color: riga.grande ? "#ffdd88" : "#888888",
        align: "center",
      }).setOrigin(0.5);
      this._creditsPanel.add(t);
    });

    // Bottone chiudi
    const closeX = this.add.text(W / 2 - 18, -H / 2 + 18, "✕", {
      fontFamily: "'Press Start 2P'",
      fontSize: "18px",
      color: "#8b0000",
      stroke: "#000000",
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeX.on("pointerover", () => closeX.setColor("#ff2222"));
    closeX.on("pointerout", () => closeX.setColor("#8b0000"));
    closeX.on("pointerdown", () => this._toggleCredits());
    this._creditsPanel.add(closeX);

    // Hint ESC
    const hint = this.add.text(0, H / 2 - 22, "[ ESC ] chiudi", {
      fontFamily: "'Press Start 2P'",
      fontSize: "9px",
      color: "#444444",
    }).setOrigin(0.5);
    this._creditsPanel.add(hint);
  }

  // ================================
  // TOGGLE CREDITI
  // ================================
  private _toggleCredits(): void {
    this._creditsVisible = !this._creditsVisible;

    if (this._creditsVisible) {
      this._creditsPanel.setVisible(true);
      this._creditsPanel.setAlpha(0);
      this.tweens.add({
        targets: this._creditsPanel,
        alpha: 1,
        duration: 300,
        ease: "Power2.out",
      });
    } else {
      this.tweens.add({
        targets: this._creditsPanel,
        alpha: 0,
        duration: 300,
        ease: "Power2.out",
        onComplete: () => this._creditsPanel.setVisible(false),
      });
    }
  }

  // ================================
  // START GAME
  // ================================
  private _startGame(): void {
    this.cameras.main.fade(600, 0, 0, 0);
    this.time.delayedCall(600, () => {
      this.scene.start("GamePlay");
    });
  }

  // ================================
  // UPDATE
  // ================================
  update(_time: number, _delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this._enterKey)) {
      if (!this._creditsVisible) this._startGame();
    }
    if (Phaser.Input.Keyboard.JustDown(this._escapeKey)) {
      if (this._creditsVisible) this._toggleCredits();
    }
  }
}