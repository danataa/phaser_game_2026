import Phaser from "phaser";
import Merchant, { ISlotMercante } from "../game_components/Merchant";
import Player from "../game_components/Player";

export default class ShopUI extends Phaser.Scene {

  // ================================
  // ATTRIBUTI
  // ================================
  private _slots: ISlotMercante[] = [];
  private _merchant: Merchant | null = null;
  private _player: Player | null = null;
  private _animeText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: "ShopUI" });
  }

  // ================================
  // INIT
  // ================================
  init(data: any) {
    this._slots = data.slot || [];
  }

  // ================================
  // CREATE
  // ================================
  create() {
    const gamePlayScene = this.scene.get("GamePlay") as any;
    this._merchant = gamePlayScene._merchant;
    this._player = gamePlayScene._player;

    if (!this._merchant || !this._player) {
      console.warn("⚠️ Merchant o Player non trovati!");
      this._closeShop();
      return;
    }

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const CX = W / 2;
    const CY = H / 2;

    this._creaOverlay(W, H);
    this._creaPergamena(CX, CY);
    this._creaTitolo(CX, CY);
    this._creaAnime(CX, CY);
    this._creaSeparatore(CX, CY);
    this._creaSlots(CX, CY);
    this._creaBottoneChiudi(CX, CY);
    this._creaIstruzioni(CX, CY);

    // Fade in
    this.cameras.main.setAlpha(0);
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 1,
      duration: 350,
      ease: "Power2",
    });
  }

  // ================================
  // OVERLAY
  // ================================
  private _creaOverlay(W: number, H: number): void {
    this.add.graphics()
      .fillStyle(0x0a0500, 0.85)
      .fillRect(0, 0, W, H);
  }

  // ================================
  // PERGAMENA
  // ================================
  private _creaPergamena(CX: number, CY: number): void {
    const W = 820;
    const H = 480;
    const x = CX - W / 2;
    const y = CY - H / 2;
    const g = this.add.graphics();

    // Ombra esterna
    g.fillStyle(0x000000, 0.7);
    g.fillRoundedRect(x + 12, y + 12, W, H, 8);

    // Corpo pergamena
    g.fillStyle(0xc8904a, 1);
    g.fillRoundedRect(x, y, W, H, 8);

    // Strato interno beige
    g.fillStyle(0xe2b978, 1);
    g.fillRoundedRect(x + 8, y + 8, W - 16, H - 16, 6);

    // Strato interno chiaro
    g.fillStyle(0xeecb8e, 1);
    g.fillRoundedRect(x + 18, y + 18, W - 36, H - 36, 4);

    // Macchie invecchiamento angoli
    g.fillStyle(0xa87040, 0.5);
    g.fillCircle(x + 40, y + 40, 45);
    g.fillCircle(x + W - 40, y + 40, 45);
    g.fillCircle(x + 40, y + H - 40, 45);
    g.fillCircle(x + W - 40, y + H - 40, 45);

    // Macchie centrali
    g.fillStyle(0xb88050, 0.12);
    g.fillCircle(CX - 100, CY + 40, 80);
    g.fillCircle(CX + 120, CY - 60, 60);

    // Bordi
    g.lineStyle(5, 0x5a2e0a, 1);
    g.strokeRoundedRect(x, y, W, H, 8);
    g.lineStyle(2, 0x8b5a2b, 0.8);
    g.strokeRoundedRect(x + 8, y + 8, W - 16, H - 16, 6);
    g.lineStyle(1, 0xd4a030, 0.4);
    g.strokeRoundedRect(x + 18, y + 18, W - 36, H - 36, 4);

    // Rotoli
    this._creaRotolo(g, x, y, W, true);
    this._creaRotolo(g, x, y + H - 30, W, false);

    // Chiodi angolari
    this._creaChiodo(g, x + 28, y + 28);
    this._creaChiodo(g, x + W - 28, y + 28);
    this._creaChiodo(g, x + 28, y + H - 28);
    this._creaChiodo(g, x + W - 28, y + H - 28);
  }

  private _creaRotolo(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number,
    w: number,
    sopra: boolean
  ): void {
    const ry = sopra ? y - 14 : y;
    g.fillStyle(0xa87040, 1);
    g.fillRoundedRect(x - 14, ry, w + 28, 34, 12);
    g.fillStyle(0xd4a060, 0.5);
    g.fillRoundedRect(x - 14, ry + 4, w + 28, 12, 8);
    g.fillStyle(0x5a2e0a, 0.3);
    g.fillRoundedRect(x - 14, ry + 20, w + 28, 14, 12);
    g.lineStyle(2, 0x5a2e0a, 1);
    g.strokeRoundedRect(x - 14, ry, w + 28, 34, 12);
  }

  private _creaChiodo(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0x4a2800, 1);
    g.fillCircle(x, y, 7);
    g.fillStyle(0x8b6030, 1);
    g.fillCircle(x - 2, y - 2, 3);
    g.lineStyle(1, 0x2a1400, 1);
    g.strokeCircle(x, y, 7);
  }

  // ================================
  // TITOLO
  // ================================
  private _creaTitolo(CX: number, CY: number): void {
    // Ombra
    this.add.text(CX + 2, CY - 208, "✦  Bottega del Mercante  ✦", {
      fontFamily: "'Press Start 2P'",
      fontSize: "22px",
      color: "#2a1000",
    }).setOrigin(0.5);

    // Testo
    this.add.text(CX, CY - 210, "✦  Bottega del Mercante  ✦", {
      fontFamily: "'Press Start 2P'",
      fontSize: "22px",
      color: "#3d1a00",
      stroke: "#c8904a",
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  // ================================
  // ANIME
  // ================================
  private _creaAnime(CX: number, CY: number): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x3d1a00, 0.6);
    bg.fillRoundedRect(CX - 390, CY - 175, 260, 36, 6);
    bg.lineStyle(1, 0x8b5a2b, 0.8);
    bg.strokeRoundedRect(CX - 390, CY - 175, 260, 36, 6);

    this.add.text(CX - 380, CY - 157, "👻 Anime:", {
      fontFamily: "'Press Start 2P'",
      fontSize: "14px",
      color: "#c8904a",
    }).setOrigin(0, 0.5);

    this._animeText = this.add.text(CX - 240, CY - 157, `${this._player!.anime}`, {
      fontFamily: "'Press Start 2P'",
      fontSize: "14px",
      color: "#ffdd88",
      stroke: "#3d1a00",
      strokeThickness: 2,
    }).setOrigin(0, 0.5);
  }

  // ================================
  // SEPARATORE
  // ================================
  private _creaSeparatore(CX: number, CY: number): void {
    const g = this.add.graphics();
    g.lineStyle(2, 0x7a4a1a, 0.8);
    g.lineBetween(CX - 370, CY - 132, CX + 370, CY - 132);

    this.add.text(CX, CY - 132, "  ✦ ❧ ✦  ", {
      fontSize: "18px",
      color: "#8b5a2b",
      backgroundColor: "#eecb8e",
      padding: { x: 6, y: 0 },
    }).setOrigin(0.5);
  }

  // ================================
  // SLOTS — 2 in verticale
  // ================================
  private _creaSlots(CX: number, CY: number): void {
    const slotW = 720;
    const slotH = 120;
    const gap = 18;
    const startY = CY - 110;

    this._slots.forEach((slot, i) => {
      this._creaSlot(slot, i, CX - slotW / 2, startY + i * (slotH + gap), slotW, slotH);
    });
  }

  private _creaSlot(
    slot: ISlotMercante,
    index: number,
    x: number, y: number,
    w: number, h: number
  ): void {
    const acquistatoColor = 0xb09060;
    const normaleColor = 0xd4a060;

    // Sfondo slot
    const slotBg = this.add.graphics();
    slotBg.fillStyle(slot.acquistato ? acquistatoColor : normaleColor, 0.35);
    slotBg.fillRoundedRect(x, y, w, h, 8);
    slotBg.lineStyle(2, slot.acquistato ? 0x7a6040 : 0x8b5a2b, 0.9);
    slotBg.strokeRoundedRect(x, y, w, h, 8);

    // Riquadro icona
    const iconBg = this.add.graphics();
    iconBg.fillStyle(0x6a3a10, 0.4);
    iconBg.fillRoundedRect(x + 12, y + 10, 96, 96, 8);
    iconBg.lineStyle(2, slot.acquistato ? 0x6a5030 : 0x8b5a2b, 0.7);
    iconBg.strokeRoundedRect(x + 12, y + 10, 96, 96, 8);

    // Icona
    this.add.text(x + 60, y + 58,
      slot.perk.tipo === "permanente" ? "⚔️" : "⚗️", {
      fontSize: "36px",
    }).setOrigin(0.5);

    // Badge PERM / TEMP
    this.add.text(x + 60, y + 100,
      slot.perk.tipo === "permanente" ? "PERM" : "TEMP", {
      fontFamily: "'Press Start 2P'",
      fontSize: "8px",
      color: slot.perk.tipo === "permanente" ? "#cc8800" : "#6688cc",
      stroke: "#000000",
      strokeThickness: 2,
    }).setOrigin(0.5, 1);

    // Nome
    this.add.text(x + 120, y + 22, slot.perk.nome, {
      fontFamily: "'Press Start 2P'",
      fontSize: "17px",
      color: slot.acquistato ? "#8a7050" : "#2a1000",
      stroke: "#e2b978",
      strokeThickness: 2,
      wordWrap: { width: w - 310 },
    });

    // Descrizione
    this.add.text(x + 120, y + 58, slot.perk.descrizione, {
      fontFamily: "'Press Start 2P'",
      fontSize: "11px",
      color: slot.acquistato ? "#9a8060" : "#4a2800",
      wordWrap: { width: w - 310 },
    });

    // ——— BOTTONE ———
    const btnW = 170;
    const btnH = 60;
    const btnX = x + w - btnW - 14;
    const btnY = y + h / 2 - btnH / 2;
    const btnBg = this.add.graphics();

    if (slot.acquistato) {
      btnBg.fillStyle(0x1a4a1a, 0.9);
      btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 8);
      btnBg.lineStyle(2, 0x3a8a3a, 1);
      btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 8);

      this.add.text(btnX + btnW / 2, btnY + btnH / 2, "✓  Acquistato", {
        fontFamily: "'Press Start 2P'",
        fontSize: "12px",
        color: "#55ee88",
        stroke: "#0a2a0a",
        strokeThickness: 2,
      }).setOrigin(0.5);

    } else {
      const puoAcquistare = this._player!.anime >= slot.costoAttuale;

      btnBg.fillStyle(puoAcquistare ? 0x3d1a00 : 0x2a1a10, 1);
      btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 8);
      btnBg.lineStyle(2, puoAcquistare ? 0x9b6a3b : 0x5a4030, 1);
      btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 8);

      const btnTesto = this.add.text(
        btnX + btnW / 2,
        btnY + btnH / 2,
        `${slot.costoAttuale}  👻`,
        {
          fontFamily: "'Press Start 2P'",
          fontSize: "16px",
          color: puoAcquistare ? "#e8c48a" : "#6a5a40",
          stroke: "#1a0a00",
          strokeThickness: 2,
        }
      ).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btnTesto.on("pointerover", () => {
        btnBg.clear();
        btnBg.fillStyle(0x6a2a00, 1);
        btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 8);
        btnBg.lineStyle(2, 0xffaa00, 1);
        btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 8);
        btnTesto.setColor("#ffffff");
      });

      btnTesto.on("pointerout", () => {
        btnBg.clear();
        btnBg.fillStyle(puoAcquistare ? 0x3d1a00 : 0x2a1a10, 1);
        btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 8);
        btnBg.lineStyle(2, puoAcquistare ? 0x9b6a3b : 0x5a4030, 1);
        btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 8);
        btnTesto.setColor(puoAcquistare ? "#e8c48a" : "#6a5a40");
      });

      btnTesto.on("pointerdown", () => {
        // Check al momento del click
        if (this._player!.anime < slot.costoAttuale) {
          this._mostraMessaggio("✦ Anime insufficienti! ✦", "#8b0000");
          this.tweens.add({
            targets: btnTesto,
            x: btnTesto.x + 5,
            duration: 40,
            yoyo: true,
            repeat: 3,
            onComplete: () => btnTesto.setX(btnX + btnW / 2),
          });
          return;
        }

        this._merchant!.executePurchase(this._player!, index);

        // Aggiorna anime
        this._animeText?.setText(`${this._player!.anime}`);

        // Bottone → verde
        btnTesto.disableInteractive();
        btnBg.clear();
        btnBg.fillStyle(0x1a4a1a, 1);
        btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 8);
        btnBg.lineStyle(2, 0x44aa44, 1);
        btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 8);
        btnTesto.setText("✓  Acquistato");
        btnTesto.setColor("#55ee88");
        btnTesto.setFontSize("12px");
        btnTesto.setX(btnX + btnW / 2);

        // Sbiadisci sfondo slot
        slotBg.clear();
        slotBg.fillStyle(acquistatoColor, 0.25);
        slotBg.fillRoundedRect(x, y, w, h, 8);
        slotBg.lineStyle(2, 0x7a6040, 0.7);
        slotBg.strokeRoundedRect(x, y, w, h, 8);

        this._mostraMessaggio(`✦ ${slot.perk.nome} acquistato! ✦`, "#1a6a00");
      });
    }
  }

  // ================================
  // MESSAGGIO FEEDBACK
  // ================================
  private _mostraMessaggio(testo: string, colore: string): void {
    const CX = this.cameras.main.centerX;
    const CY = this.cameras.main.centerY;

    const msgBg = this.add.graphics();
    msgBg.fillStyle(0xeecb8e, 0.97);
    msgBg.fillRoundedRect(CX - 280, CY + 170, 560, 58, 8);
    msgBg.lineStyle(2, 0x6b3a1f, 1);
    msgBg.strokeRoundedRect(CX - 280, CY + 170, 560, 58, 8);
    msgBg.setAlpha(0);

    const msg = this.add.text(CX, CY + 199, testo, {
      fontFamily: "'Press Start 2P'",
      fontSize: "15px",
      color: colore,
      stroke: "#eecb8e",
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [msg, msgBg],
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 1400,
      onComplete: () => {
        msg.destroy();
        msgBg.destroy();
      },
    });
  }

  // ================================
  // ISTRUZIONI
  // ================================
  private _creaIstruzioni(CX: number, CY: number): void {
    this.add.text(CX, CY + 208, "— clicca sul prezzo per acquistare —", {
      fontFamily: "'Press Start 2P'",
      fontSize: "10px",
      color: "#7a5a30",
    }).setOrigin(0.5);
  }

  // ================================
  // BOTTONE CHIUDI X
  // ================================
  private _creaBottoneChiudi(CX: number, CY: number): void {
    const x = CX + 390;
    const y = CY - 222;
    const r = 24;

    const bg = this.add.graphics();
    bg.fillStyle(0x4a1000, 1);
    bg.fillCircle(x, y, r);
    bg.lineStyle(2, 0x8b4a2b, 1);
    bg.strokeCircle(x, y, r);
    bg.fillStyle(0x7a3010, 0.4);
    bg.fillCircle(x - 4, y - 4, r / 2);

    const testo = this.add.text(x, y, "✕", {
      fontFamily: "'Press Start 2P'",
      fontSize: "18px",
      color: "#e8c48a",
      stroke: "#1a0500",
      strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    testo.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(0x8a0000, 1);
      bg.fillCircle(x, y, r);
      bg.lineStyle(2, 0xff4400, 1);
      bg.strokeCircle(x, y, r);
      testo.setColor("#ffffff");
      this.tweens.add({ targets: testo, scaleX: 1.2, scaleY: 1.2, duration: 80 });
    });

    testo.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(0x4a1000, 1);
      bg.fillCircle(x, y, r);
      bg.lineStyle(2, 0x8b4a2b, 1);
      bg.strokeCircle(x, y, r);
      testo.setColor("#e8c48a");
      this.tweens.add({ targets: testo, scaleX: 1, scaleY: 1, duration: 80 });
    });

    testo.on("pointerdown", () => this._closeShop());
  }

  // ================================
  // CHIUDI
  // ================================
  private _closeShop(): void {
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        const gamePlayScene = this.scene.get("GamePlay");
        gamePlayScene.events.emit("shop-chiuso");
        gamePlayScene.physics.resume();
        gamePlayScene.scene.resume();
        this.scene.stop();
      },
    });
  }

  // ================================
  // UPDATE
  // ================================
  update(_time: number, _delta: number): void {}
}