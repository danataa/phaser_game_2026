import { GameData } from "../GameData";
import WebFontFile from "../scenes/webFontFile";

const TIPS = [
  "Usa SHIFT per scattare e schivare i nemici",
  "I demoni sono lenti ma resistenti — tienili a distanza",
  "Ogni wave ripristina la tua vita al massimo",
  "TAB cambia arma: pugno o pistola",
  "I nemici aumentano di HP e velocità ogni wave",
  "I critici fanno il doppio del danno — premi spesso il tasto fuoco",
  "Raccogli i cuori per +25 HP durante la wave",
  "Più nemici elimini, più alto è il moltiplicatore combo",
];

const MIN_LOAD_MS = 3500; // minimum loading screen duration (~3.5 s)

export default class Preloader extends Phaser.Scene {
  private progressBar: Phaser.GameObjects.Graphics;
  private pctText: Phaser.GameObjects.Text;
  private tipText: Phaser.GameObjects.Text;
  private tipIdx: number = 0;

  constructor() { super({ key: "Preloader" }); }

  init() {
    const W = this.game.canvas.width, H = this.game.canvas.height;
    this.cameras.main.setBackgroundColor("#03020f");

    // ── Starfield ──────────────────────────────────────────────────────────
    const starG = this.add.graphics();
    for (let i = 0; i < 250; i++) {
      const r = Phaser.Math.FloatBetween(0.3, 1.8);
      starG.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.7));
      starG.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), r);
    }
    // Twinkling stars
    for (let i = 0; i < 25; i++) {
      const g = this.add.graphics();
      g.fillStyle(0xffffcc, 0.85);
      g.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.FloatBetween(1.0, 2.2));
      this.tweens.add({ targets: g, alpha: 0.05, duration: Phaser.Math.Between(600, 2500), ease: "Sine.easeInOut", yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 1500) });
    }

    // ── Nebula clouds ──────────────────────────────────────────────────────
    [[0x220011, W * 0.25, H * 0.4], [0x110033, W * 0.75, H * 0.55], [0x001122, W * 0.5, H * 0.7]].forEach(([c, x, y]) => {
      const g = this.add.graphics();
      g.fillStyle(c as number, 0.22);
      g.fillEllipse(x as number, y as number, Phaser.Math.Between(500, 750), Phaser.Math.Between(220, 370));
      this.tweens.add({ targets: g, alpha: 0.05, duration: Phaser.Math.Between(2500, 4500), ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    });

    // ── Title glow pulse ───────────────────────────────────────────────────
    const glowG = this.add.graphics();
    glowG.fillStyle(0xff6600, 0.06);
    glowG.fillEllipse(W / 2, H * 0.22, 720, 140);
    this.tweens.add({ targets: glowG, alpha: 0.28, duration: 1600, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

    // ── Title shadow + title ───────────────────────────────────────────────
    this.add.text(W / 2 + 4, H * 0.22 + 4, "🔥  HELL'S GATE  🔥", {
      fontSize: "56px", fontStyle: "bold", color: "#551100",
    }).setOrigin(0.5).setAlpha(0.55);

    const titleTxt = this.add.text(W / 2, H * 0.22, "🔥  HELL'S GATE  🔥", {
      fontSize: "56px", fontStyle: "bold", color: "#ffaa00",
      stroke: "#000000", strokeThickness: 7,
    }).setOrigin(0.5);
    this.tweens.add({ targets: titleTxt, scaleX: 1.018, scaleY: 1.018, duration: 1500, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

    // ── Subtitle ───────────────────────────────────────────────────────────
    const sub = this.add.text(W / 2, H * 0.22 + 58, "— SILENT PRODUCTION —", {
      fontSize: "14px", color: "#664422", letterSpacing: 4,
    }).setOrigin(0.5);
    this.tweens.add({ targets: sub, alpha: 0.35, duration: 1200, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

    // ── Decorative separator ───────────────────────────────────────────────
    const sepG = this.add.graphics();
    sepG.lineStyle(1, 0x883300, 0.5);
    sepG.lineBetween(W / 2 - 280, H * 0.22 + 82, W / 2 + 280, H * 0.22 + 82);

    // ── Floating skulls ────────────────────────────────────────────────────
    const icons = ["💀", "⚔️", "🔥", "👻"];
    for (let i = 0; i < 12; i++) {
      const sk = this.add.text(
        Phaser.Math.Between(30, W - 30),
        Phaser.Math.Between(H * 0.5, H + 40),
        Phaser.Utils.Array.GetRandom(icons) as string,
        { fontSize: `${Phaser.Math.Between(12, 22)}px`, alpha: 0.4 } as any
      ).setOrigin(0.5).setAlpha(0.35);
      this.tweens.add({
        targets: sk, y: `-=${Phaser.Math.Between(200, 420)}`, alpha: 0,
        duration: Phaser.Math.Between(4000, 8000), delay: Phaser.Math.Between(0, 4000),
        repeat: -1, onRepeat: () => { sk.x = Phaser.Math.Between(30, W - 30); (sk as any).y = H + 30; sk.setAlpha(0.35); }
      });
    }

    // ── Loading tip ────────────────────────────────────────────────────────
    const tipBg = this.add.graphics();
    tipBg.fillStyle(0x0a0818, 0.85);
    tipBg.fillRoundedRect(W / 2 - 310, H * 0.62, 620, 40, 8);
    tipBg.lineStyle(1, 0x332255, 0.6);
    tipBg.strokeRoundedRect(W / 2 - 310, H * 0.62, 620, 40, 8);

    this.add.text(W / 2 - 300, H * 0.62 + 7, "💡", { fontSize: "16px" });
    this.tipText = this.add.text(W / 2 - 274, H * 0.62 + 10, TIPS[0], {
      fontSize: "13px", color: "#9988cc",
    });
    this.time.addEvent({
      delay: 2800, loop: true, callback: () => {
        this.tipIdx = (this.tipIdx + 1) % TIPS.length;
        this.tweens.add({ targets: this.tipText, alpha: 0, duration: 220, onComplete: () => {
          this.tipText.setText(TIPS[this.tipIdx]);
          this.tweens.add({ targets: this.tipText, alpha: 1, duration: 220 });
        }});
      }
    });

    // ── Progress bar area ──────────────────────────────────────────────────
    const barY = H * 0.82;
    const barX = W * 0.18, barW = W * 0.64, barH = 20;

    // Label
    this.add.text(W / 2, barY - 28, "CARICAMENTO", {
      fontSize: "11px", color: "#4455aa", letterSpacing: 5,
    }).setOrigin(0.5);

    // Track bg with inner shadow
    const trackG = this.add.graphics();
    trackG.fillStyle(0x08081a, 1);
    trackG.fillRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 10);
    trackG.lineStyle(1.5, 0x223388, 0.7);
    trackG.strokeRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 10);

    this.progressBar = this.add.graphics();
    this.pctText = this.add.text(W / 2, barY + barH + 14, "0%", {
      fontSize: "14px", color: "#5566bb",
    }).setOrigin(0.5);

    // Store barX/W/H for progress handler
    (this as any)._barX = barX; (this as any)._barW = barW; (this as any)._barH = barH; (this as any)._barY = barY;

    // ── Press to start (shown after load) ─────────────────────────────────
    const readyTxt = this.add.text(W / 2, barY + barH + 50, "", {
      fontSize: "20px", color: "#00ff88", stroke: "#000000", strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);
    (this as any)._readyTxt = readyTxt;
    (this as any)._trackG = trackG;
  }

  preload() {
    const { _barX: barX, _barW: barW, _barH: barH, _barY: barY } = this as any;
    (this as any)._loadStart = Date.now();

    this.load.on("progress", (value: number) => {
      this.progressBar.clear();
      const fill = barW * value;
      // Main fill with color shift
      const col = value > 0.7 ? 0x44ff99 : value > 0.35 ? 0x3366ff : 0x8833cc;
      this.progressBar.fillStyle(col, 1);
      this.progressBar.fillRoundedRect(barX, barY, fill, barH, { tl: 8, tr: fill >= barW ? 8 : 0, bl: 8, br: fill >= barW ? 8 : 0 });
      // Shimmer top
      this.progressBar.fillStyle(0xffffff, 0.2);
      this.progressBar.fillRoundedRect(barX, barY, fill, barH / 2, { tl: 8, tr: fill >= barW ? 8 : 0, bl: 0, br: 0 });
      // Glow cap
      if (value > 0.01) {
        this.progressBar.fillStyle(0xffffff, 0.6);
        this.progressBar.fillRoundedRect(barX + fill - 6, barY + 2, 6, barH - 4, 4);
      }
      this.pctText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on("complete", () => {
      const elapsed = Date.now() - (this as any)._loadStart;
      const remaining = Math.max(0, MIN_LOAD_MS - elapsed);

      // If assets loaded faster than MIN_LOAD_MS, animate the bar to 100%
      // over the remaining time so the user sees a smooth fill.
      const fakeProgress = { value: elapsed / MIN_LOAD_MS };
      this.tweens.add({
        targets: fakeProgress,
        value: 1,
        duration: remaining,
        ease: "Quad.easeOut",
        onUpdate: () => {
          const v = fakeProgress.value;
          const fill = barW * v;
          this.progressBar.clear();
          const col = v > 0.7 ? 0x44ff99 : v > 0.35 ? 0x3366ff : 0x8833cc;
          this.progressBar.fillStyle(col, 1);
          this.progressBar.fillRoundedRect(barX, barY, fill, barH, { tl: 8, tr: fill >= barW ? 8 : 0, bl: 8, br: fill >= barW ? 8 : 0 });
          this.progressBar.fillStyle(0xffffff, 0.2);
          this.progressBar.fillRoundedRect(barX, barY, fill, barH / 2, { tl: 8, tr: fill >= barW ? 8 : 0, bl: 0, br: 0 });
          if (v > 0.01) {
            this.progressBar.fillStyle(0xffffff, 0.6);
            this.progressBar.fillRoundedRect(barX + fill - 6, barY + 2, 6, barH - 4, 4);
          }
          this.pctText.setText(`${Math.round(v * 100)}%`);
        },
        onComplete: () => {
          // Full green bar
          this.progressBar.clear();
          this.progressBar.fillStyle(0x22dd66, 1);
          this.progressBar.fillRoundedRect(barX, barY, barW, barH, 8);
          this.progressBar.fillStyle(0xffffff, 0.18);
          this.progressBar.fillRoundedRect(barX, barY, barW, barH / 2, { tl: 8, tr: 8, bl: 0, br: 0 });
          this.pctText.setText("100%").setColor("#00ff88");

          const readyTxt: Phaser.GameObjects.Text = (this as any)._readyTxt;
          readyTxt.setText("▶  Clicca per iniziare");
          this.tweens.add({ targets: readyTxt, alpha: 1, duration: 500 });
          this.tweens.add({ targets: readyTxt, alpha: 0.2, duration: 700, ease: "Sine.easeInOut", yoyo: true, repeat: -1, delay: 500 });

          this.input.once("pointerdown", () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once("camerafadeoutcomplete", () => {
              this.scene.stop("Preloader");
              this.scene.start("Intro");
            });
          });
        },
      });
    });

    this.loadAssets();
  }

  loadAssets(): void {
    if (GameData.webfonts) {
      const keys: string[] = GameData.webfonts.map((f: any) => f.key);
      this.load.addFile(new WebFontFile(this.load, keys));
    }
    if (GameData.fonts)       GameData.fonts.forEach((f: any)        => this.load.font(f.key, f.path, f.type));
    if (GameData.scripts)     GameData.scripts.forEach((e: any)       => this.load.script(e.key, e.path));
    if (GameData.images)      GameData.images.forEach((e: any)        => this.load.image(e.name, e.path));
    if (GameData.tilemaps)    GameData.tilemaps.forEach((e: any)      => this.load.tilemapTiledJSON(e.key, e.path));
    if (GameData.atlas)       GameData.atlas.forEach((e: any)         => this.load.atlas(e.key, e.imagepath, e.jsonpath));
    if (GameData.spritesheets) GameData.spritesheets.forEach((e: any) =>
      this.load.spritesheet(e.name, e.path, { frameWidth: e.width, frameHeight: e.height, endFrame: e.frames })
    );
    if (GameData.videos)      GameData.videos.forEach((e: any)        => this.load.video(e.name, e.path, true));
    if (GameData.bitmapfonts) GameData.bitmapfonts.forEach((e: any)   => this.load.bitmapFont(e.name, e.imgpath, e.xmlpath));
    if (GameData.sounds)      GameData.sounds.forEach((e: any)        => this.load.audio(e.name, e.paths));
    if (GameData.audios)      GameData.audios.forEach((e: any)        => this.load.audioSprite(e.name, e.jsonpath, e.paths, e.instance));
  }

  update() {}
}
