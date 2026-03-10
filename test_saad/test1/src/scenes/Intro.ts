const HS_KEY   = "dungeonHuntHighScore";
const DIFF_KEY = "hellsGateDiff";
const SFX_KEY  = "hellsGateSfxVol";

export default class Intro extends Phaser.Scene {
  private bgMusic: Phaser.Sound.BaseSound;
  private optionsContainer: Phaser.GameObjects.Container;
  private creditsContainer: Phaser.GameObjects.Container;

  // music volume
  private volBarFill: Phaser.GameObjects.Graphics;
  private volPctText: Phaser.GameObjects.Text;
  private currentVol: number = 0.5;

  // sfx volume
  private sfxBarFill: Phaser.GameObjects.Graphics;
  private sfxPctText: Phaser.GameObjects.Text;
  private currentSfxVol: number = parseFloat(localStorage.getItem(SFX_KEY) || "0.8");

  // misc
  private muteBtn: Phaser.GameObjects.Text;
  private currentDiff: string = localStorage.getItem(DIFF_KEY) || "normal";
  private diffBtns: { [k: string]: Phaser.GameObjects.Text } = {};
  private fullscreenBtn: Phaser.GameObjects.Text;

  constructor() { super({ key: "Intro" }); }

  create() {
    const W = 1280, H = 800;

    this.add.rectangle(0, 0, W, H, 0x02020e).setOrigin(0);

    const grad = this.add.graphics();
    grad.fillGradientStyle(0x000033, 0x000033, 0x000000, 0x000000, 0.5, 0.5, 0.0, 0.0);
    grad.fillRect(0, 0, W, H / 2);

    this.createStarfield(W, H);
    this.createNebula(W, H);

    const lineG = this.add.graphics();
    lineG.lineStyle(1, 0x333366, 0.5);
    for (let i = 0; i < 8; i++) lineG.lineBetween(0, 180 + i * 90, W, 180 + i * 90);
    lineG.lineStyle(1, 0x222255, 0.35);
    for (let i = 0; i < 14; i++) lineG.lineBetween(i * 100, 0, i * 100, H);

    const glowG = this.add.graphics();
    glowG.fillStyle(0xff8800, 0.08);
    glowG.fillEllipse(W / 2, 90, 700, 130);
    this.tweens.add({ targets: glowG, alpha: 0.3, duration: 1800, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

    const titleShadow = this.add.text(W / 2 + 4, 94, "🔥  HELL'S GATE  🔥", {
      fontSize: "54px", fontStyle: "bold", color: "#551100",
    }).setOrigin(0.5).setAlpha(0.6);

    const title = this.add.text(W / 2, 90, "🔥  HELL'S GATE  🔥", {
      fontSize: "54px", fontStyle: "bold", color: "#ffaa00",
      stroke: "#000000", strokeThickness: 7,
    }).setOrigin(0.5);
    this.tweens.add({ targets: [title, titleShadow], scaleX: 1.02, scaleY: 1.02, duration: 1700, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

    this.add.text(W / 2, 152, "— Sopravvivi alle ondate di nemici —", {
      fontSize: "17px", color: "#775533", fontStyle: "italic",
    }).setOrigin(0.5);

    const sep = this.add.graphics();
    sep.lineStyle(1, 0x886622, 0.4);
    sep.lineBetween(W / 2 - 260, 172, W / 2 + 260, 172);

    const hs = parseInt(localStorage.getItem(HS_KEY) || "0");
    if (hs > 0) {
      const hsBg = this.add.graphics();
      hsBg.fillStyle(0x111100, 0.8);
      hsBg.fillRoundedRect(W / 2 - 150, H - 48, 300, 34, 8);
      hsBg.lineStyle(1, 0x887700, 0.6);
      hsBg.strokeRoundedRect(W / 2 - 150, H - 48, 300, 34, 8);
      this.add.text(W / 2, H - 31, `🏆  Miglior punteggio:  ${hs}`, {
        fontSize: "16px", color: "#ffd700",
      }).setOrigin(0.5);
    }

    this.add.text(W - 8, H - 8, "v2.0", { fontSize: "11px", color: "#333366" }).setOrigin(1, 1);

    if (!this.sound.get("music")) {
      this.bgMusic = this.sound.add("music", { loop: true, volume: this.currentVol });
      this.bgMusic.play();
    } else {
      this.bgMusic = this.sound.get("music");
      if (!(this.bgMusic as any).isPlaying) this.bgMusic.play();
      this.currentVol = (this.bgMusic as any).volume ?? 0.5;
    }

    this.registry.set("sfxVolume",  this.currentSfxVol);
    this.registry.set("difficulty", this.currentDiff);

    this.createMainButtons(W);
    this.createControlsPanel(W, H);
    this.setupOptionsUI(W, H);
    this.setupCreditsUI(W, H);
  }

  // ── Starfield ───────────────────────────────────────────────────────────────
  createStarfield(W: number, H: number) {
    const starG = this.add.graphics();
    for (let i = 0; i < 220; i++) {
      const r = Phaser.Math.FloatBetween(0.4, 2.0);
      const a = Phaser.Math.FloatBetween(0.2, 0.95);
      starG.fillStyle(0xffffff, a);
      starG.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), r);
    }
    for (let i = 0; i < 30; i++) {
      const g = this.add.graphics();
      g.fillStyle(0xffffee, 0.9);
      g.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.FloatBetween(1.2, 2.5));
      this.tweens.add({ targets: g, alpha: 0.05, duration: Phaser.Math.Between(800, 3000), ease: "Sine.easeInOut", yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000) });
    }
  }

  createNebula(W: number, H: number) {
    const colors = [0x110033, 0x003311, 0x220011];
    colors.forEach((c, i) => {
      const g = this.add.graphics();
      g.fillStyle(c, 0.25);
      g.fillEllipse(Phaser.Math.Between(100, W - 100), Phaser.Math.Between(200, H - 200), Phaser.Math.Between(400, 700), Phaser.Math.Between(200, 380));
      this.tweens.add({ targets: g, alpha: 0.04, duration: 3000 + i * 1200, ease: "Sine.easeInOut", yoyo: true, repeat: -1, delay: i * 800 });
    });
  }

  // ── Main Buttons ────────────────────────────────────────────────────────────
  createMainButtons(W: number) {
    const buttons = [
      { y: 230, label: "▶   GIOCA",   bg: "#112211", hover: "#1e4a1e", border: 0x22aa44, cb: () => this.scene.start("GamePlay") },
      { y: 308, label: "⚙   OPZIONI", bg: "#111122", hover: "#1e1e4a", border: 0x4455cc, cb: () => { this.optionsContainer.setVisible(!this.optionsContainer.visible); this.creditsContainer.setVisible(false); } },
      { y: 386, label: "★   CREDITI", bg: "#221133", hover: "#3a1a4a", border: 0x7733aa, cb: () => { this.creditsContainer.setVisible(!this.creditsContainer.visible); this.optionsContainer.setVisible(false); } },
    ];
    buttons.forEach(({ y, label, bg, hover, border, cb }) => {
      const g = this.add.graphics();
      const bx = W / 2 - 120, bw = 240, bh = 52;
      g.lineStyle(1.5, border, 0.7);
      g.strokeRoundedRect(bx - 1, y - bh / 2 - 1, bw + 2, bh + 2, 8);
      const btn = this.add.text(W / 2, y, label, {
        fontSize: "28px", color: "#ffffff", backgroundColor: bg, padding: { x: 36, y: 12 }, stroke: "#000000", strokeThickness: 2,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on("pointerover",  function(this: Phaser.GameObjects.Text) { this.setBackgroundColor(hover); this.setScale(1.04); });
      btn.on("pointerout",   function(this: Phaser.GameObjects.Text) { this.setBackgroundColor(bg);    this.setScale(1.0); });
      btn.on("pointerdown",  () => cb());
    });
  }

  // ── Controls Panel ──────────────────────────────────────────────────────────
  createControlsPanel(W: number, H: number) {
    const panelX = W / 2 - 290, panelY = 462, panelW = 580, panelH = 110;
    const pg = this.add.graphics();
    pg.fillStyle(0x080818, 0.75);
    pg.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
    pg.lineStyle(1, 0x333355, 0.7);
    pg.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);
    this.add.text(W / 2, panelY + 14, "CONTROLLI", { fontSize: "11px", color: "#4455aa", letterSpacing: 4 }).setOrigin(0.5);
    const controls: [string, string][] = [
      ["WASD / ↑↓←→", "Muovi"], ["Click SX", "Attacca"], ["TAB", "Cambia arma"], ["SHIFT", "Sprint (4s)"], ["ESC", "Pausa"],
    ];
    const cols = 2, colW = 250;
    controls.forEach(([key, action], i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = panelX + 40 + col * colW;
      const cy = panelY + 36 + row * 24;
      this.add.text(cx, cy, key, { fontSize: "13px", color: "#ffcc77", fontStyle: "bold" });
      this.add.text(cx + 90, cy, `— ${action}`, { fontSize: "13px", color: "#8888aa" });
    });
  }

  // ── Options Panel ───────────────────────────────────────────────────────────
  setupOptionsUI(W: number, H: number) {
    const cx = W / 2, cy = H / 2 + 10;
    const PW = 480, PH = 500;
    const px = -PW / 2, py = -PH / 2;

    // Panel bg
    const panelG = this.add.graphics();
    panelG.fillStyle(0x07071a, 0.97);
    panelG.fillRoundedRect(px, py, PW, PH, 12);
    panelG.lineStyle(2, 0x5566dd, 0.9);
    panelG.strokeRoundedRect(px, py, PW, PH, 12);
    panelG.lineStyle(1, 0x8899ff, 0.22);
    panelG.strokeRoundedRect(px + 2, py + 2, PW - 4, PH - 4, 11);

    // Title bar
    const titleBar = this.add.graphics();
    titleBar.fillStyle(0x1a1a4a, 1);
    titleBar.fillRoundedRect(px, py, PW, 44, { tl: 12, tr: 12, bl: 0, br: 0 });

    const titleT = this.add.text(0, py + 22, "⚙   IMPOSTAZIONI", {
      fontSize: "22px", color: "#aabbff", stroke: "#000000", strokeThickness: 2, letterSpacing: 2,
    }).setOrigin(0.5);

    const secG = this.add.graphics();
    secG.lineStyle(1, 0x2233aa, 0.45);
    const items: Phaser.GameObjects.GameObject[] = [panelG, titleBar, titleT, secG];
    let curY = py + 58; // start below title bar

    // ── Helper: draw section header ─────────────────────────────────────────
    const addSection = (label: string) => {
      secG.lineBetween(px + 20, curY, -px - 20, curY);
      items.push(this.add.text(px + 20, curY + 4, label, { fontSize: "10px", color: "#4455bb", letterSpacing: 3 }));
      curY += 22;
    };

    // ── Helper: volume bar row ──────────────────────────────────────────────
    const addVolBar = (initVol: number, onChange: (v: number) => void) => {
      const BAR_X = -90, BAR_Y = curY, BAR_W = 180, BAR_H = 18;

      const barBg = this.add.graphics();
      barBg.fillStyle(0x111133, 1);
      barBg.fillRoundedRect(BAR_X, BAR_Y, BAR_W, BAR_H, 8);
      barBg.lineStyle(1, 0x334488, 0.8);
      barBg.strokeRoundedRect(BAR_X, BAR_Y, BAR_W, BAR_H, 8);

      const barFill = this.add.graphics();
      const drawFill = (vol: number) => {
        barFill.clear();
        if (vol > 0) {
          const fill = BAR_W * Math.max(0, Math.min(1, vol));
          const col = vol > 0.6 ? 0x4466ff : vol > 0.3 ? 0x88aaff : 0xaaaaff;
          barFill.fillStyle(col, 1);
          barFill.fillRoundedRect(BAR_X, BAR_Y, fill, BAR_H, { tl: 8, tr: fill >= BAR_W ? 8 : 0, bl: 8, br: fill >= BAR_W ? 8 : 0 });
          barFill.fillStyle(0xffffff, 0.18);
          barFill.fillRoundedRect(BAR_X, BAR_Y, fill, BAR_H / 2, { tl: 8, tr: fill >= BAR_W ? 8 : 0, bl: 0, br: 0 });
        }
      };
      drawFill(initVol);

      const pctText = this.add.text(BAR_X + BAR_W + 10, BAR_Y + BAR_H / 2, `${Math.round(initVol * 100)}%`, {
        fontSize: "13px", color: "#aabbff",
      }).setOrigin(0, 0.5);

      const hitZone = this.add.zone(BAR_X, BAR_Y, BAR_W, BAR_H).setOrigin(0, 0).setInteractive({ useHandCursor: true });
      hitZone.on("pointerdown", (ptr: Phaser.Input.Pointer) => {
        const local = ptr.x - (cx + BAR_X);
        const v = Phaser.Math.Clamp(local / BAR_W, 0, 1);
        onChange(v);
        drawFill(v);
        pctText.setText(`${Math.round(v * 100)}%`);
      });

      const btnDn = this.makeRoundBtn(BAR_X - 30, BAR_Y + BAR_H / 2, " − ", "#1e1e44", "#3333aa", () => {
        const v = Phaser.Math.Clamp(initVol - 0.1, 0, 1);
        initVol = v; onChange(v); drawFill(v); pctText.setText(`${Math.round(v * 100)}%`);
      });
      const btnUp = this.makeRoundBtn(BAR_X + BAR_W + 46, BAR_Y + BAR_H / 2, " + ", "#1e1e44", "#3333aa", () => {
        const v = Phaser.Math.Clamp(initVol + 0.1, 0, 1);
        initVol = v; onChange(v); drawFill(v); pctText.setText(`${Math.round(v * 100)}%`);
      });

      items.push(barBg, barFill, pctText, hitZone, btnDn, btnUp);
      curY += 36;
    };

    // ── Section 1: Volume Musica ────────────────────────────────────────────
    addSection("VOLUME MUSICA");
    addVolBar(this.currentVol, (v) => {
      this.currentVol = v;
      (this.bgMusic as any).setVolume?.(v);
    });
    curY += 4;

    // ── Section 2: Volume SFX ───────────────────────────────────────────────
    addSection("VOLUME SFX");
    addVolBar(this.currentSfxVol, (v) => {
      this.currentSfxVol = v;
      localStorage.setItem(SFX_KEY, String(v));
      this.registry.set("sfxVolume", v);
    });
    curY += 4;

    // ── Section 3: Audio ────────────────────────────────────────────────────
    addSection("AUDIO");
    this.muteBtn = this.makeRoundBtn(-80, curY + 14, "  🔊  SUONO ATTIVO  ", "#1a3322", "#2a5533", () => {
      this.sound.mute = !this.sound.mute;
      this.muteBtn.setText(this.sound.mute ? "  🔇  SUONO DISATTIVO  " : "  🔊  SUONO ATTIVO  ");
      this.muteBtn.setBackgroundColor(this.sound.mute ? "#441111" : "#1a3322");
    });
    items.push(this.muteBtn);
    curY += 44;

    // ── Section 4: Difficoltà ───────────────────────────────────────────────
    addSection("DIFFICOLTÀ");
    const diffs: { key: string; label: string; color: string; hover: string }[] = [
      { key: "easy",   label: "FACILE",    color: "#1a3322", hover: "#2a5533" },
      { key: "normal", label: "NORMALE",   color: "#112233", hover: "#1a3a55" },
      { key: "hard",   label: "DIFFICILE", color: "#331111", hover: "#552222" },
    ];
    const diffY = curY + 14;
    diffs.forEach(({ key, label, color, hover }, idx) => {
      const x = -130 + idx * 100;
      const isActive = this.currentDiff === key;
      const btn = this.makeRoundBtn(x, diffY, label, isActive ? hover : color, hover, () => {
        this.currentDiff = key;
        localStorage.setItem(DIFF_KEY, key);
        this.registry.set("difficulty", key);
        diffs.forEach(d => {
          const b = this.diffBtns[d.key];
          b.setBackgroundColor(this.currentDiff === d.key ? d.hover : d.color);
        });
      });
      this.diffBtns[key] = btn;
      items.push(btn);
    });
    curY += 44;

    // ── Section 5: Schermo Intero ───────────────────────────────────────────
    addSection("DISPLAY");
    this.fullscreenBtn = this.makeRoundBtn(-80, curY + 14, "  ⛶  SCHERMO INTERO  ", "#1a1a33", "#2a2a55", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
        this.fullscreenBtn.setText("  ⛶  SCHERMO INTERO  ");
      } else {
        this.scale.startFullscreen();
        this.fullscreenBtn.setText("  ⛶  FINESTRA  ");
      }
    });
    items.push(this.fullscreenBtn);
    curY += 48;

    // ── Close ───────────────────────────────────────────────────────────────
    secG.lineBetween(px + 20, curY, -px - 20, curY);
    const closeBtn = this.makeRoundBtn(0, curY + 22, "  ✕   CHIUDI  ", "#1a2a1a", "#2a4a2a", () => {
      this.optionsContainer.setVisible(false);
    });
    items.push(closeBtn);

    this.optionsContainer = this.add.container(cx, cy, items).setVisible(false).setDepth(600);
  }

  // ── Credits Panel ───────────────────────────────────────────────────────────
  setupCreditsUI(W: number, H: number) {
    const cx = W / 2, cy = H / 2;
    const PW = 460;

    // Sections (label, values[]) — each occupies SECTION_H pixels
    const SECTION_H = 52;
    const sections: [string, string[]][] = [
      ["STUDIO",         ["Silent Production"]],
      ["ENGINE",         ["Phaser 3.90  •  TypeScript 5"]],
      ["TILESET / ARTE", ["Risorse pubbliche / OpenGameArt"]],
      ["PERSONAGGI",     ["Skeleton, Mago, Demon Sprites"]],
      ["MUSICA",         ["Colonna sonora originale"]],
    ];
    const TITLE_H   = 44;
    const CLOSE_H   = 52;
    const PADDING_V = 16;
    const CONTENT_H = sections.length * SECTION_H;
    const PH        = TITLE_H + PADDING_V + CONTENT_H + CLOSE_H + PADDING_V;
    const px = -PW / 2, py = -PH / 2;

    const panelG = this.add.graphics();
    panelG.fillStyle(0x08080e, 0.97);
    panelG.fillRoundedRect(px, py, PW, PH, 12);
    panelG.lineStyle(2, 0x7733aa, 0.9);
    panelG.strokeRoundedRect(px, py, PW, PH, 12);
    panelG.lineStyle(1, 0xaa55ff, 0.18);
    panelG.strokeRoundedRect(px + 2, py + 2, PW - 4, PH - 4, 11);

    const titleBar = this.add.graphics();
    titleBar.fillStyle(0x1a0a2a, 1);
    titleBar.fillRoundedRect(px, py, PW, TITLE_H, { tl: 12, tr: 12, bl: 0, br: 0 });

    const titleT = this.add.text(0, py + TITLE_H / 2, "★   CREDITI", {
      fontSize: "22px", color: "#cc99ff", stroke: "#000000", strokeThickness: 2, letterSpacing: 2,
    }).setOrigin(0.5);

    const divG = this.add.graphics();
    divG.lineStyle(1, 0x441166, 0.5);

    const sectionItems: Phaser.GameObjects.Text[] = [];
    sections.forEach(([header, lines], idx) => {
      const baseY = py + TITLE_H + PADDING_V + idx * SECTION_H;
      divG.lineBetween(px + 30, baseY, -px - 30, baseY);
      sectionItems.push(
        this.add.text(0, baseY + 6, header, {
          fontSize: "10px", color: "#7744bb", letterSpacing: 3,
        }).setOrigin(0.5)
      );
      lines.forEach((line, li) => {
        sectionItems.push(
          this.add.text(0, baseY + 22 + li * 20, line, {
            fontSize: "16px", color: "#ccbbff",
          }).setOrigin(0.5)
        );
      });
    });

    const closeBtnY = py + TITLE_H + PADDING_V + CONTENT_H + CLOSE_H / 2;
    divG.lineBetween(px + 30, closeBtnY - 20, -px - 30, closeBtnY - 20);
    const closeBtn = this.makeRoundBtn(0, closeBtnY, "  ✕   CHIUDI  ", "#1a1a2a", "#2a2a4a", () => {
      this.creditsContainer.setVisible(false);
    });

    this.creditsContainer = this.add.container(cx, cy, [
      panelG, titleBar, titleT, divG, ...sectionItems, closeBtn,
    ]).setVisible(false).setDepth(600);
  }

  makeRoundBtn(x: number, y: number, label: string, bg: string, hover: string, cb: () => void) {
    const btn = this.add.text(x, y, label, {
      fontSize: "14px", color: "#ddeeff", backgroundColor: bg, padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on("pointerover",  function(this: Phaser.GameObjects.Text) { this.setBackgroundColor(hover); this.setScale(1.04); });
    btn.on("pointerout",   function(this: Phaser.GameObjects.Text) { this.setBackgroundColor(bg);    this.setScale(1.0); });
    btn.on("pointerdown",  () => cb());
    return btn;
  }

  drawVolFill(vol: number) { /* kept for compat, replaced by closures above */ }

  update() {}
}
