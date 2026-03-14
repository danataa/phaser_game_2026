export default class GameOver extends Phaser.Scene {

  constructor() {
    super({ key: "GameOver" });
  }

  // ================================
  // CREATE
  // ================================
  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const CX = W / 2;
    const CY = H / 2;

    this._creaBackground(W, H, CX, CY);
    this._creaParticelleBrace(W, H);
    this._creaDecorazioniAngoli(W, H);
    this._creaTitolo(CX, CY);
    this._creaBottoni(CX, CY, H);
    this._creaLogo(CX, H);

    // ESC → Menu
    this.input.keyboard!.on("keydown-ESC", () => {
      this._vaAlMenu();
    });
  }

  // ================================
  // BACKGROUND
  // ================================
  private _creaBackground(W: number, H: number, CX: number, CY: number): void {
    const bg = this.add.graphics();

    // Sfondo nero
    bg.fillStyle(0x000000, 1);
    bg.fillRect(0, 0, W, H);

    // Overlay rosso sangue
    bg.fillStyle(0x1a0000, 0.8);
    bg.fillRect(0, 0, W, H);

    // Vignette bordi
    bg.fillStyle(0x000000, 0.6);
    bg.fillRect(0, 0, W, 100);
    bg.fillRect(0, H - 100, W, 100);
    bg.fillRect(0, 0, 120, H);
    bg.fillRect(W - 120, 0, 120, H);

    // Linee orizzontali decorative
    bg.lineStyle(1, 0x8b0000, 0.3);
    bg.lineBetween(80, 60, W - 80, 60);
    bg.lineBetween(80, H - 60, W - 80, H - 60);

    // Bordo dorato sottile
    bg.lineStyle(1, 0xc8a800, 0.2);
    bg.lineBetween(80, 64, W - 80, 64);
    bg.lineBetween(80, H - 64, W - 80, H - 64);
  }

  // ================================
  // DECORAZIONI ANGOLI
  // ================================
  private _creaDecorazioniAngoli(W: number, H: number): void {
    const angoli = [
      { x: 80,     y: 50      },
      { x: W - 80, y: 50      },
      { x: 80,     y: H - 50  },
      { x: W - 80, y: H - 50  },
    ];

    const lunghezza = 28;

    angoli.forEach(({ x, y }) => {
      const g = this.add.graphics();
      const dirX = x < W / 2 ? 1 : -1;
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
  // PARTICELLE BRACE — su tutto lo schermo
  // ================================
  private _creaParticelleBrace(W: number, H: number): void {
    for (let i = 0; i < 30; i++) {
      const x = 80 + Math.random() * (W - 160);
      const startY = H * 0.3 + Math.random() * H * 0.6;
      const size = 1 + Math.random() * 2.5;
      const colori = [0xff4400, 0xff8800, 0xffaa00, 0xff2200];
      const colore = colori[Math.floor(Math.random() * colori.length)];

      const p = this.add.graphics();
      p.fillStyle(colore, 0.7);
      p.fillCircle(x, startY, size);

      this.tweens.add({
        targets: p,
        y: -(60 + Math.random() * 120),
        alpha: 0,
        duration: 2500 + Math.random() * 3500,
        delay: Math.random() * 5000,
        repeat: -1,
        ease: "Power1.out",
        onRepeat: () => {
          p.clear();
          const newX = 80 + Math.random() * (W - 160);
          p.fillStyle(colore, 0.7);
          p.fillCircle(newX, 0, size);
          p.setY(startY);
          p.setAlpha(0.7);
        },
      });
    }
  }

  // ================================
  // TITOLO — centrato
  // ================================
  private _creaTitolo(CX: number, CY: number): void {
    // Ornamento sopra
    const ornSopra = this.add.text(CX, CY - 280, "✦ ✦ ✦", {
      fontFamily: "'Press Start 2P'",
      fontSize: "14px",
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
    const titoloOmbra = this.add.text(CX + 4, CY - 192, "GAME  OVER", {
      fontFamily: "'Press Start 2P'",
      fontSize: "72px",
      color: "#1a0000",
      align: "center",
    }).setOrigin(0.5).setAlpha(0);

    // Titolo principale
    const titoloTesto = this.add.text(CX, CY - 196, "GAME  OVER", {
      fontFamily: "'Press Start 2P'",
      fontSize: "72px",
      color: "#cc0000",
      stroke: "#c8a800",
      strokeThickness: 4,
      align: "center",
    }).setOrigin(0.5).setAlpha(0);

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
        alpha: 0.75,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    });

    // Separatore dorato
    const sep = this.add.graphics();
    sep.lineStyle(2, 0x8b0000, 0.7);
    sep.lineBetween(CX - 320, CY - 110, CX + 320, CY - 110);
    sep.setAlpha(0);

    this.tweens.add({
      targets: sep,
      alpha: 1,
      duration: 600,
      delay: 1200,
    });

    // Ornamento separatore
    const ornSep = this.add.text(CX, CY - 110, "  ✦ ☩ ✦  ", {
      fontSize: "16px",
      color: "#8b0000",
      backgroundColor: "#0d0000",
      padding: { x: 8, y: 0 },
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: ornSep,
      alpha: 0.8,
      duration: 600,
      delay: 1200,
    });

    // Sottotitolo
    const sottoTesto = this.add.text(CX, CY - 75, "— sei morto —\nL'inferno ha modificato la storia", {
      fontFamily: "'Press Start 2P'",
      fontSize: "14px",
      color: "#aa7700",
      align: "center",
      lineSpacing: 10,
    }).setOrigin(0.5, 0).setAlpha(0);

    this.tweens.add({
      targets: sottoTesto,
      alpha: 1,
      duration: 800,
      delay: 1400,
      ease: "Power2.inOut",
    });

    // Ornamento sotto
    const ornSotto = this.add.text(CX, CY - 10, "— ☩ —", {
      fontFamily: "'Press Start 2P'",
      fontSize: "14px",
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
  // BOTTONI — centrati
  // ================================
  private _creaBottoni(CX: number, CY: number, H: number): void {
    const btnY1 = CY + 80;
    const btnY2 = CY + 170;

    // ——— RIPROVA ———
    this._creaBottone(
      CX, btnY1,
      "⚔  RIPROVA  ⚔",
      0x6b0000, 0xaa0000, 0xcc0000,
      "20px", 300, 64, 1800,
      () => this._riprova()
    );

    // ——— MENU ———
    this._creaBottone(
      CX, btnY2,
      "☩  TORNA AL MENU",
      0x1a1000, 0x3a2800, 0xc8a800,
      "14px", 280, 52, 2000,
      () => this._vaAlMenu()
    );

    // ESC hint
    const hint = this.add.text(CX, CY + 248, "[ ESC ] torna al menu", {
      fontFamily: "'Press Start 2P'",
      fontSize: "10px",
      color: "#333333",
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: hint,
      alpha: 0.6,
      duration: 600,
      delay: 2400,
    });
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
      // ✅ Piccolo delay prima di eseguire onClick
      this.time.delayedCall(150, () => onClick());
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
  // LOGO IN BASSO
  // ================================
private _creaLogo(CX: number, H: number): void {
  const logo = this.add.image(CX, H - 900, "main_logo")  // più alto
    .setScale(0.5)   
    .setOrigin(0.5)
    .setAlpha(0);

  this.tweens.add({
    targets: logo,
    alpha: 0.7,
    duration: 800,
    delay: 2600,
    ease: "Power2.inOut",
  });

  // Pulsazione
  this.time.delayedCall(3400, () => {
    this.tweens.add({
      targets: logo,
      alpha: 0.35,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  });
}

  // ================================
  // AZIONI — con fade out prima del cambio scena
  // ================================
  private _riprova(): void {
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 0,
      duration: 800,        // ✅ fade lento
      ease: "Power2.inOut",
      onComplete: () => {
        this.scene.start("GamePlay");
      },
    });
  }

  private _vaAlMenu(): void {
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 0,
      duration: 800,        // ✅ fade lento
      ease: "Power2.inOut",
      onComplete: () => {
        this.scene.start("Menu");
      },
    });
  }
}