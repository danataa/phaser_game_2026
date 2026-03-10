const HS_KEY = "dungeonHuntHighScore";

export default class GameOver extends Phaser.Scene {
  private score: number = 0;
  private wave: number = 1;
  private kills: number = 0;

  constructor() { super({ key: "GameOver" }); }

  init(data: { score?: number; wave?: number; kills?: number }) {
    this.score = data.score || 0;
    this.wave  = data.wave  || 1;
    this.kills = data.kills || 0;
  }

  create() {
    const W = 1280, H = 800;

    this.add.rectangle(0, 0, W, H, 0x060006).setOrigin(0);

    // Red nebula background
    const neb = this.add.graphics();
    neb.fillStyle(0x440000, 0.22);
    neb.fillEllipse(W / 2, H / 2, 900, 500);
    this.tweens.add({ targets: neb, scaleX: 1.1, scaleY: 1.1, alpha: 0.08, duration: 2200, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });

    // Stars (red tinted)
    for (let i = 0; i < 160; i++) {
      const g = this.add.graphics();
      const r = Phaser.Math.FloatBetween(0.4, 2.0);
      const c = Phaser.Math.Between(0, 1) ? 0xffaaaa : 0xffffff;
      g.fillStyle(c, Phaser.Math.FloatBetween(0.15, 0.55));
      g.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), r);
    }

    // Grid lines
    const lg = this.add.graphics();
    lg.lineStyle(1, 0x330000, 0.3);
    for (let i = 0; i < 10; i++) lg.lineBetween(0, i * 88, W, i * 88);
    for (let i = 0; i < 15; i++) lg.lineBetween(i * 96, 0, i * 96, H);

    // Panel
    const panelG = this.add.graphics();
    panelG.fillStyle(0x0d0005, 0.97);
    panelG.fillRoundedRect(W/2 - 270, H/2 - 210, 540, 420, 14);
    panelG.lineStyle(2.5, 0xaa2222, 0.9);
    panelG.strokeRoundedRect(W/2 - 270, H/2 - 210, 540, 420, 14);
    panelG.lineStyle(1, 0xff4444, 0.2);
    panelG.strokeRoundedRect(W/2 - 268, H/2 - 208, 536, 416, 13);

    // Title bar
    const titleBar = this.add.graphics();
    titleBar.fillStyle(0x2a0000, 1);
    titleBar.fillRoundedRect(W/2 - 270, H/2 - 210, 540, 50, { tl: 14, tr: 14, bl: 0, br: 0 });

    const title = this.add.text(W / 2, H / 2 - 185, "💀  GAME OVER", {
      fontSize: "50px", fontStyle: "bold", color: "#ff3333",
      stroke: "#000000", strokeThickness: 6,
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, x: W / 2 - 3, duration: 55, yoyo: true, repeat: 6 });

    // Divider
    const dg = this.add.graphics();
    dg.lineStyle(1, 0x550000, 0.7);
    dg.lineBetween(W/2 - 230, H/2 - 130, W/2 + 230, H/2 - 130);

    // Stats
    const stats: [string, string, string][] = [
      ["Onda raggiunta",     `${this.wave}`,  "#ffaa00"],
      ["Punteggio",          `${this.score}`, "#ffd700"],
      ["Nemici sconfitti",   `${this.kills}`, "#ffffff"],
    ];
    stats.forEach(([label, val, color], i) => {
      const y = H/2 - 96 + i * 46;
      this.add.text(W/2 - 190, y, label, { fontSize: "18px", color: "#888888" });
      this.add.text(W/2 + 190, y, val,   { fontSize: "22px", color, stroke: "#000000", strokeThickness: 2 }).setOrigin(1, 0);
      // Row separator
      if (i < stats.length - 1) {
        dg.lineStyle(1, 0x330000, 0.5);
        dg.lineBetween(W/2 - 190, y + 40, W/2 + 190, y + 40);
      }
    });

    // High Score
    const prev = parseInt(localStorage.getItem(HS_KEY) || "0");
    const isNew = this.score > prev;
    if (isNew) localStorage.setItem(HS_KEY, String(this.score));
    const hsY = H/2 + 50;
    const hsBg = this.add.graphics();
    hsBg.fillStyle(isNew ? 0x222200 : 0x111111, 0.8);
    hsBg.fillRoundedRect(W/2 - 180, hsY - 14, 360, 32, 8);
    hsBg.lineStyle(1, isNew ? 0xaaaa00 : 0x444444, 0.7);
    hsBg.strokeRoundedRect(W/2 - 180, hsY - 14, 360, 32, 8);
    this.add.text(W/2, hsY + 2, isNew ? `🎉 NUOVO RECORD: ${this.score}!` : `🏆 Record: ${Math.max(prev, this.score)}`, {
      fontSize: "17px", color: isNew ? "#ffff44" : "#999999",
    }).setOrigin(0.5);

    // Buttons
    const mkBtn = (x: number, y: number, label: string, bg: string, hover: string, cb: () => void) => {
      const btn = this.add.text(x, y, label, {
        fontSize: "24px", color: "#ffffff", backgroundColor: bg,
        padding: { x: 22, y: 12 }, stroke: "#000000", strokeThickness: 2,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on("pointerover",  function(this: Phaser.GameObjects.Text) { this.setBackgroundColor(hover); this.setScale(1.05); });
      btn.on("pointerout",   function(this: Phaser.GameObjects.Text) { this.setBackgroundColor(bg);    this.setScale(1.0); });
      btn.on("pointerdown",  () => cb());
      return btn;
    };
    mkBtn(W/2 - 130, H/2 + 110, " 🔄 RIPROVA ", "#1a3322", "#2a5533", () => this.scene.start("GamePlay"));
    mkBtn(W/2 + 130, H/2 + 110, " 🏠 MENU ",    "#111133", "#222266", () => this.scene.start("Intro"));

    // Floating skulls animation
    const icons = ["💀", "👻", "🩸", "⚔️"];
    for (let i = 0; i < 10; i++) {
      const sk = this.add.text(
        Phaser.Math.Between(30, W - 30),
        Phaser.Math.Between(H + 10, H + 70),
        Phaser.Utils.Array.GetRandom(icons) as string,
        { fontSize: `${Phaser.Math.Between(14, 24)}px` }
      ).setOrigin(0.5).setAlpha(0.6);
      this.tweens.add({
        targets: sk, y: -30, alpha: 0,
        duration: Phaser.Math.Between(3500, 7000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        onRepeat: () => { sk.x = Phaser.Math.Between(30, W - 30); sk.y = H + 40; sk.setAlpha(0.6); }
      });
    }
  }

  update() {}
}
