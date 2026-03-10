import { GameData } from "../GameData";

const HS_KEY = "dungeonHuntHighScore";

// ─── Tuning constants (tweak these to balance the game) ──────────────────────
const ENEMY_HP: Record<string, number> = { skeleton: 10, mago: 18, demon: 30 };
const ENEMY_HP_PER_WAVE: Record<string, number> = { skeleton: 5, mago: 7, demon: 12 };
const ENEMY_SPEED_BASE: Record<string, number> = { skeleton: 115, mago: 155, demon: 75 };
const ENEMY_SPEED_PER_WAVE: number = 10;

const PUNCH_DMG        = 2;
const PUNCH_RANGE      = 115;
const SHOOT_DMG        = 3;
const SHOOT_SPEED      = 640;
const SHOOT_COOLDOWN   = 280;    // ms between shots
const CRIT_CHANCE      = 12;     // percent
const CRIT_MULT        = 2.0;

const PLAYER_MAX_HP    = 100;
const SPRINT_DURATION  = 4000;
const SPRINT_COOLDOWN  = 6000;
const SPRINT_SPEED     = 380;
const NORMAL_SPEED     = 195;
const PLAYER_SPAWN_X   = 200;
const PLAYER_SPAWN_Y   = 200;

const MAX_ENEMIES_SCREEN = 14;   // hard cap on screen at once
const SPAWN_INTERVAL_BASE = 2000; // ms, decreases with waves
const SPAWN_INTERVAL_MIN  = 600;
// ─── Merchant NPC ─────────────────────────────────────────────────────────────
const NPC_X                = 1580;
const NPC_Y                = 1580;
const NPC_INTERACT_RANGE   = 130;
const COIN_POTION_HP_COST  = 20;
const COIN_POTION_DMG_COST = 40;
const COIN_POTION_SPD_COST = 30;
const BUFF_DURATION_MS     = 22000;
const DAMAGE_BUFF_MULT     = 1.6;
const SPEED_BUFF_MULT      = 1.4;
// ─────────────────────────────────────────────────────────────────────────────

export default class GamePlay extends Phaser.Scene {
  // World
  private map: Phaser.Tilemaps.Tilemap;

  // Sprites
  private player: Phaser.Physics.Arcade.Sprite & { hp: number; isInvulnerable: boolean };
  private enemies: Phaser.Physics.Arcade.Group;
  private bullets: Phaser.Physics.Arcade.Group;
  private enemyBullets: Phaser.Physics.Arcade.Group;
  private healthPickups: Phaser.Physics.Arcade.Group;

  // Input
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Phaser.Types.Input.Keyboard.CursorKeys;
  private tabKey: Phaser.Input.Keyboard.Key;
  private shiftKey: Phaser.Input.Keyboard.Key;
  private escKey: Phaser.Input.Keyboard.Key;

  // HUD elements
  private playerHealthBar: Phaser.GameObjects.Graphics;
  private sprintBar: Phaser.GameObjects.Graphics;
  private minimap: Phaser.GameObjects.Graphics;
  private minimapBg: Phaser.GameObjects.Graphics;
  private abilityText: Phaser.GameObjects.Text;
  private sprintText: Phaser.GameObjects.Text;
  private objectiveText: Phaser.GameObjects.Text;
  private healthText: Phaser.GameObjects.Text;
  private enemyCountText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;
  private hudCamera: Phaser.Cameras.Scene2D.Camera;

  // State
  private currentAbility: "punch" | "shoot" = "punch";
  private isSprinting: boolean = false;
  private canSprint: boolean = true;
  private isInSprintCooldown: boolean = false;
  private sprintStartTime: number = 0;
  private sprintCooldownStartTime: number = 0;
  private lastShootTime: number = 0;
  private lastSpawnTime: number = 0;
  private enemiesKilled: number = 0;
  private targetKills: number = 15;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private spawnEvent: Phaser.Time.TimerEvent;
  private bgMusic: Phaser.Sound.BaseSound;

  // Wave & Score
  private waveNumber: number = 1;
  private totalScore: number = 0;
  private lastKillTime: number = 0;
  private killStreak: number = 0;
  private comboMultiplier: number = 1;
  private lastDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

  // Pause
  private pauseOverlay: Phaser.GameObjects.Container;

  // ── Merchant NPC ────────────────────────────────────────────────────────────
  private merchantSprite:       Phaser.GameObjects.Container;
  private merchantHint:         Phaser.GameObjects.Text;
  private merchantUI:           Phaser.GameObjects.Container;
  private merchantBtnContainer: Phaser.GameObjects.Container;
  private merchantMsgText:      Phaser.GameObjects.Text;
  private merchantCoinDisplay:  Phaser.GameObjects.Text;
  private isMerchantOpen:       boolean = false;
  private merchantGreetedOnce:  boolean = false;
  private _merchantSayTimer:    Phaser.Time.TimerEvent | null = null;
  private fKey:                 Phaser.Input.Keyboard.Key;

  // ── Coins & buffs ────────────────────────────────────────────────────────────
  private playerCoins:      number  = 0;
  private coinText:         Phaser.GameObjects.Text;
  private damageBuff:       boolean = false;
  private speedBuff:        boolean = false;
  private damageBuffExpiry: number  = 0;
  private speedBuffExpiry:  number  = 0;

  constructor() {
    super({ key: "GamePlay" });
  }

  create() {
    // ── Reset state ────────────────────────────────────────────────────────
    this.isGameOver = false;
    this.isPaused = false;
    this.enemiesKilled = 0;
    this.totalScore = 0;
    this.killStreak = 0;
    this.comboMultiplier = 1;
    this.lastKillTime = 0;
    this.waveNumber = 1;
    this.targetKills = 15;
    this.isSprinting = false;
    this.canSprint = true;
    this.isInSprintCooldown = false;
    this.lastShootTime = 0;
    this.lastSpawnTime = 0;
    this.lastDirection.set(1, 0);
    this.isMerchantOpen     = false;
    this.merchantGreetedOnce = false;
    this.playerCoins        = 0;
    this.damageBuff         = false;
    this.speedBuff          = false;
    this.damageBuffExpiry   = 0;
    this.speedBuffExpiry    = 0;
    this.cameras.main.setBackgroundColor(0x000000);

    // ── Map ────────────────────────────────────────────────────────────────
    this.map = this.add.tilemap("tilemap_0");
    const tileset = this.map.addTilesetImage("mainlevbuild", "tileset_0");
    const floor = this.map.createLayer("floor", tileset, 0, 0);
    const collideLayer = this.map.createLayer("wall", tileset, 0, 0);
    floor.setScale(2);
    collideLayer.setScale(2);
    collideLayer.setCollisionByProperty({ collide: true });
    this.physics.world.setBounds(0, 0, this.map.widthInPixels * 2, this.map.heightInPixels * 2);

    // ── Groups ─────────────────────────────────────────────────────────────
    this.bullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.healthPickups = this.physics.add.group();

    // ── Player ─────────────────────────────────────────────────────────────
    this.player = this.physics.add.sprite(PLAYER_SPAWN_X, PLAYER_SPAWN_Y, "player") as any;
    this.player.hp = PLAYER_MAX_HP;
    this.player.isInvulnerable = false;
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(30, 30);
    this.player.setOffset(26, 35);
    this.physics.add.collider(this.player, collideLayer);

    this.setupUI();
    this.setupPlayerAnims();
    this.setupEnemyAnims();
    this.setupPauseUI();

    this.bgMusic = this.sound.get("music");

    // ── Cameras ────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);

    this.hudCamera = this.cameras.add(0, 0, GameData.globals.gameWidth, GameData.globals.gameHeight);
    this.hudCamera.setScroll(0, 0).setZoom(1);
    this.hudCamera.ignore(floor);
    this.hudCamera.ignore(collideLayer);
    this.hudCamera.ignore(this.player);
    if (this.physics.world.debugGraphic) this.hudCamera.ignore(this.physics.world.debugGraphic);

    this.cameras.main.ignore(this.playerHealthBar);
    this.cameras.main.ignore(this.sprintBar);
    this.cameras.main.ignore(this.healthText);
    this.cameras.main.ignore(this.abilityText);
    this.cameras.main.ignore(this.sprintText);
    this.cameras.main.ignore(this.objectiveText);
    this.cameras.main.ignore(this.waveText);
    this.cameras.main.ignore(this.scoreText);
    this.cameras.main.ignore(this.enemyCountText);
    this.cameras.main.ignore(this.minimap);
    this.cameras.main.ignore(this.minimapBg);
    this.cameras.main.ignore(this.pauseOverlay);

    // ── Merchant NPC ──────────────────────────────────────────────────────────
    this.spawnMerchant();
    this.setupMerchantUI();
    this.cameras.main.ignore(this.merchantUI);
    this.cameras.main.ignore(this.merchantBtnContainer);
    this.cameras.main.ignore(this.merchantHint);
    this.cameras.main.ignore(this.coinText);

    // ── Initial enemies ────────────────────────────────────────────────────
    for (let i = 0; i < 6; i++) this.spawnEnemy(true);
    this.lastSpawnTime = this.time.now;

    // ── Spawn timer  (FIX: simple 600ms loop, no reset() call) ─────────────
    // Using loop:true + lastSpawnTime tracking avoids the Phaser reset() bug
    // that caused spawn to stop mid-wave.
    this.spawnEvent = this.time.addEvent({
      delay: 600,
      loop: true,
      callback: this.tickSpawn,
      callbackScope: this
    });

    // ── Physics ────────────────────────────────────────────────────────────
    this.physics.add.collider(this.enemies, collideLayer);
    this.physics.add.collider(this.bullets, collideLayer, (b: any) => {
      this.createImpact(b.x, b.y, 0x00ccff); b.destroy();
    });
    this.physics.add.collider(this.enemyBullets, collideLayer, (b: any) => b.destroy());

    this.physics.add.overlap(this.bullets, this.enemies, (b: any, e: any) => {
      this.createImpact(b.x, b.y, 0x00ccff); b.destroy();
      const isCrit = Phaser.Math.Between(0, 99) < CRIT_CHANCE;
      this.damageEnemy(e, isCrit ? SHOOT_DMG * CRIT_MULT : SHOOT_DMG, isCrit);
    });
    this.physics.add.overlap(this.enemyBullets, this.player, (_p: any, b: any) => {
      this.createImpact(b.x, b.y, 0xff2200); b.destroy();
      this.handlePlayerDamage(8);
    });
    this.physics.add.collider(this.player, this.enemies, (_p: any, e: any) => {
      const dmg = e.type === "demon" ? 16 : e.type === "mago" ? 9 : 5;
      this.handlePlayerDamage(dmg);
    });
    this.physics.add.overlap(this.player, this.healthPickups, (_p: any, pickup: any) => {
      if (!pickup.active) return;
      pickup.destroy();
      this.player.hp = Math.min(PLAYER_MAX_HP, this.player.hp + 25);
      this.updatePlayerHealthBar();
      this.showFloatingText(this.player.x, this.player.y - 40, "+25 HP", "#00ff88", true);
    });
    this.physics.add.collider(this.enemies, this.enemies);

    // ── Input ──────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: "W", down: "S", left: "A", right: "D" }) as Phaser.Types.Input.Keyboard.CursorKeys;
    this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.fKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.TAB,
      Phaser.Input.Keyboard.KeyCodes.ESC,
      Phaser.Input.Keyboard.KeyCodes.F
    ]);
    this.input.on("pointerdown", (ptr: Phaser.Input.Pointer) => { if (ptr.leftButtonDown()) this.performAttack(); });
    this.input.keyboard.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard.on("keydown-F", () => {
      if (this.isGameOver) return;
      if (this.isMerchantOpen) { this.closeMerchant(); return; }
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, NPC_X, NPC_Y);
      if (d < NPC_INTERACT_RANGE) this.openMerchant();
    });

    this.time.delayedCall(400, () => this.showWaveBanner(this.waveNumber));
  }

  // ─── Spawn (FIXED) ────────────────────────────────────────────────────────
  private tickSpawn() {
    if (this.isGameOver || this.isPaused) return;
    const now = this.time.now;
    const onScreen = this.enemies.getChildren().filter((e: any) => e.active && !e.isDying).length;
    const spawnInterval = Math.max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_BASE - (this.waveNumber - 1) * 150);
    if (onScreen < MAX_ENEMIES_SCREEN && now - this.lastSpawnTime >= spawnInterval) {
      this.spawnEnemy(false);
      this.lastSpawnTime = now;
    }
  }

  spawnEnemy(forceRandom: boolean) {
    const cam = this.cameras.main;
    const off = 170;
    let x: number, y: number;
    const wW = this.map.widthInPixels * 2, wH = this.map.heightInPixels * 2;

    if (forceRandom) {
      const px = this.player ? this.player.x : 200;
      const py = this.player ? this.player.y : 200;
      let tries = 0;
      do {
        x = Phaser.Math.Between(50, wW - 50);
        y = Phaser.Math.Between(50, wH - 50);
        tries++;
      } while (Phaser.Math.Distance.Between(x, y, px, py) < 280 && tries < 20);
    } else {
      const side = Phaser.Math.Between(0, 3);
      switch (side) {
        case 0: x = Phaser.Math.Between(cam.worldView.left, cam.worldView.right); y = cam.worldView.top - off; break;
        case 1: x = cam.worldView.right + off; y = Phaser.Math.Between(cam.worldView.top, cam.worldView.bottom); break;
        case 2: x = Phaser.Math.Between(cam.worldView.left, cam.worldView.right); y = cam.worldView.bottom + off; break;
        default: x = cam.worldView.left - off; y = Phaser.Math.Between(cam.worldView.top, cam.worldView.bottom); break;
      }
    }
    x = Phaser.Math.Clamp(x, 50, wW - 50);
    y = Phaser.Math.Clamp(y, 50, wH - 50);

    // Wave-weighted distribution
    const demonPct = Math.min(28, 4 + (this.waveNumber - 1) * 5);
    const magoPct  = Math.min(38, 16 + (this.waveNumber - 1) * 3);
    const roll = Phaser.Math.Between(0, 99);
    const wHp  = (this.waveNumber - 1);
    const wSpd = (this.waveNumber - 1) * ENEMY_SPEED_PER_WAVE;

    let type: "skeleton" | "mago" | "demon";
    let texKey: string, animKey: string, hp: number;

    if (roll < demonPct) {
      type = "demon"; texKey = "demon_run"; animKey = "demon-run";
      hp = ENEMY_HP.demon + wHp * ENEMY_HP_PER_WAVE.demon;
    } else if (roll < demonPct + magoPct) {
      type = "mago"; texKey = "mago"; animKey = "mago-idle";
      hp = ENEMY_HP.mago + wHp * ENEMY_HP_PER_WAVE.mago;
    } else {
      type = "skeleton"; texKey = "scheletro_run"; animKey = "scheletro-run";
      hp = ENEMY_HP.skeleton + wHp * ENEMY_HP_PER_WAVE.skeleton;
    }

    // Spawn flash
    const flash = this.add.graphics();
    flash.fillStyle(0xff2200, 0.45);
    flash.fillCircle(x, y, 24);
    if (this.hudCamera) this.hudCamera.ignore(flash);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 2.2, scaleY: 2.2, duration: 420, onComplete: () => flash.destroy() });

    const enemy = this.enemies.create(x, y, texKey) as any;
    enemy.hp = hp;
    enemy.maxHp = hp;
    enemy.type = type;
    enemy.state = "CHASE";
    enemy.isDying = false;
    enemy.lastAttackTime = 0;
    enemy.healthBar = this.add.graphics();
    enemy.chaseSpeed = ENEMY_SPEED_BASE[type] + wSpd;

    if (this.hudCamera) { this.hudCamera.ignore(enemy); this.hudCamera.ignore(enemy.healthBar); }

    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0.3);
    enemy.setDrag(130);

    if (type === "skeleton") { enemy.setScale(0.8);  enemy.setBodySize(80, 100); enemy.setOffset(24, 20); }
    else if (type === "mago") { enemy.setScale(0.5);  enemy.setBodySize(60, 60);  enemy.setOffset(65, 80); }
    else                      { enemy.setScale(0.62); enemy.setBodySize(80, 100); enemy.setOffset(24, 20); }

    enemy.play(animKey);
    this.updateEnemyCount();
  }

  // ─── Combat ───────────────────────────────────────────────────────────────

  performAttack() {
    if (this.isGameOver || this.isPaused) return;
    const ptr = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, ptr.worldX, ptr.worldY);
    this.lastDirection.set(Math.cos(angle), Math.sin(angle));
    this.player.setFlipX(ptr.worldX < this.player.x);

    if (this.currentAbility === "punch") {
      this.player.anims.play("punch", true);
      this.enemies.getChildren().forEach((e: any) => {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < PUNCH_RANGE) {
          const isCrit = Phaser.Math.Between(0, 99) < CRIT_CHANCE;
          this.damageEnemy(e, isCrit ? PUNCH_DMG * CRIT_MULT : PUNCH_DMG, isCrit);
        }
      });
    } else {
      const now = this.time.now;
      if (now - this.lastShootTime < SHOOT_COOLDOWN) return;
      this.lastShootTime = now;
      this.player.anims.play("shoot", true);
      const b = this.bullets.create(this.player.x, this.player.y, "phaser") as any;
      if (this.hudCamera) this.hudCamera.ignore(b);
      b.setScale(0.08);
      b.setTint(0x55ddff);
      b.setVelocity(this.lastDirection.x * SHOOT_SPEED, this.lastDirection.y * SHOOT_SPEED);
      b.setRotation(angle);
    }
  }

  handlePlayerDamage(damage: number) {
    if (this.player.isInvulnerable || this.isGameOver) return;
    this.player.hp -= damage;
    this.player.isInvulnerable = true;
    this.player.setTint(0xff3333);
    this.cameras.main.shake(200, 0.011);
    this.cameras.main.flash(90, 220, 0, 0, false);
    this.showFloatingText(this.player.x, this.player.y - 40, `-${damage}`, "#ff4444", true, "24px");
    this.updatePlayerHealthBar();
    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.updatePlayerHealthBar();
      this.time.delayedCall(350, () => this.endGameDeath());
    } else {
      this.time.delayedCall(950, () => { this.player.isInvulnerable = false; this.player.clearTint(); });
    }
  }

  damageEnemy(e: any, damage: number, isCrit: boolean) {
    if (!e.active || e.isDying) return;
    const actualDmg = this.damageBuff ? Math.round(damage * DAMAGE_BUFF_MULT) : damage;
    e.hp -= actualDmg;
    const dmgColor = isCrit ? "#ff8800" : (this.damageBuff ? "#ff6600" : "#ffff55");
    const dmgLabel = isCrit ? `💥 CRIT ${actualDmg}!` : (this.damageBuff ? `🔥 ${actualDmg}` : `-${actualDmg}`);
    this.showFloatingText(e.x, e.y - 50, dmgLabel, dmgColor, true, isCrit ? "24px" : "18px");

    if (e.hp <= 0) {
      e.isDying = true;
      this.tweens.add({
        targets: e, scaleX: e.scaleX * 1.35, scaleY: e.scaleY * 1.35, alpha: 0, duration: 240,
        onComplete: () => { if (e.healthBar) e.healthBar.destroy(); if (e.active) e.destroy(); this.updateEnemyCount(); }
      });
      this.enemiesKilled++;
      const basePts = e.type === "demon" ? 30 : e.type === "mago" ? 20 : 10;
      const pts = Math.round(basePts * this.comboMultiplier);
      this.totalScore += pts;
      const ptsLabel = this.comboMultiplier > 1 ? `+${pts} ×${this.comboMultiplier.toFixed(1)}` : `+${pts}`;
      this.showFloatingText(e.x, e.y - 18, ptsLabel, "#ffd700", true);
      this.updateKillStreak();
      this.objectiveText.setText(`🎯  ${this.enemiesKilled} / ${this.targetKills}`);
      this.scoreText.setText(`⭐  ${this.totalScore}`);
      const dropChance = e.type === "demon" ? 48 : e.type === "mago" ? 32 : 20;
      if (Phaser.Math.Between(0, 99) < dropChance) this.dropHealthPickup(e.x, e.y);
      // Coin drops
      const [minC, maxC]: [number, number] = e.type === "demon" ? [4, 9] : e.type === "mago" ? [2, 5] : [1, 3];
      const coins = Phaser.Math.Between(minC, maxC);
      this.playerCoins += coins;
      if (this.coinText) this.coinText.setText(`🪙  ${this.playerCoins}`);
      this.showFloatingText(e.x, e.y - 36, `+${coins}🪙`, "#ffd700", true, "14px");
      if (this.enemiesKilled >= this.targetKills && !this.isGameOver) this.showVictoryScreen();
    } else {
      e.setTint(isCrit ? 0xff7700 : 0xff3333);
      this.time.delayedCall(isCrit ? 320 : 150, () => { if (e.active) e.clearTint(); });
    }
  }

  createImpact(x: number, y: number, color: number) {
    const g = this.add.graphics();
    if (this.hudCamera) this.hudCamera.ignore(g);
    g.lineStyle(2.5, color, 1);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      g.lineBetween(x, y, x + Math.cos(a) * 16, y + Math.sin(a) * 16);
    }
    this.tweens.add({ targets: g, alpha: 0, duration: 240, onComplete: () => g.destroy() });
  }

  // ─── Enemy AI ─────────────────────────────────────────────────────────────

  private updateEnemyAI(enemy: any, time: number) {
    if (this.isGameOver || this.isPaused || enemy.isDying) return;
    const dist  = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    switch (enemy.type) {
      case "skeleton": this.updateSkeletonAI(enemy, dist, angle, time); break;
      case "mago":     this.updateMagoAI(enemy, dist, angle, time); break;
      case "demon":    this.updateDemonAI(enemy, dist, angle, time); break;
    }
    enemy.setFlipX(this.player.x < enemy.x);
    this.updateEnemyHealthBar(enemy);
  }

  private updateSkeletonAI(e: any, dist: number, angle: number, time: number) {
    if (dist < 130 && time > e.lastAttackTime + 2000) {
      e.lastAttackTime = time;
      this.physics.velocityFromRotation(angle, 420 + (e.chaseSpeed - 115) * 0.5, e.body.velocity);
      e.setTint(0xffaa00);
      this.time.delayedCall(300, () => { if (e.active) e.clearTint(); });
    } else if (dist > 30) {
      this.physics.moveToObject(e, this.player, e.chaseSpeed);
    }
  }

  private updateMagoAI(e: any, dist: number, angle: number, time: number) {
    if (e.strafeDir === undefined) { e.strafeDir = 1; e.strafeChangeTime = 0; }
    if (time > e.strafeChangeTime) {
      e.strafeDir *= -1;
      e.strafeChangeTime = time + Phaser.Math.Between(1400, 2600);
    }
    if (dist > 390) {
      this.physics.moveToObject(e, this.player, e.chaseSpeed);
      if (time > e.lastAttackTime + Phaser.Math.Between(1700, 2800)) { e.lastAttackTime = time; this.enemyShoot(e); }
    } else if (dist < 200) {
      const escAngle = angle + e.strafeDir * 0.4;
      this.physics.velocityFromRotation(escAngle, -(e.chaseSpeed + 45), e.body.velocity);
      if (time > e.lastAttackTime + Phaser.Math.Between(750, 1400)) { e.lastAttackTime = time; this.enemyShoot(e); }
    } else {
      const strafeAngle = angle + (Math.PI / 2) * e.strafeDir;
      const strafeSpd = 85 + (e.chaseSpeed - 155) * 0.5;
      e.body.velocity.set(Math.cos(strafeAngle) * strafeSpd, Math.sin(strafeAngle) * strafeSpd);
      if (time > e.lastAttackTime + Phaser.Math.Between(850, 1900)) { e.lastAttackTime = time; this.enemyShoot(e); }
    }
  }

  private updateDemonAI(e: any, dist: number, angle: number, time: number) {
    if (e.state === "CHARGE") return;
    if (dist > 150 && dist < 440 && time > e.lastAttackTime + 4200) {
      e.state = "CHARGE";
      e.lastAttackTime = time;
      e.setTint(0xff00ff);
      this.time.delayedCall(380, () => {
        if (!e.active || e.isDying) return;
        const a = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
        this.physics.velocityFromRotation(a, 530 + (e.chaseSpeed - 75) * 2.2, e.body.velocity);
        this.time.delayedCall(950, () => { if (e.active) { e.state = "CHASE"; e.clearTint(); } });
      });
    } else {
      this.physics.moveToObject(e, this.player, e.chaseSpeed);
    }
  }

  enemyShoot(e: any) {
    if (this.isGameOver || this.isPaused) return;
    const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
    const b = this.enemyBullets.create(e.x, e.y, "phaser") as any;
    if (this.hudCamera) this.hudCamera.ignore(b);
    b.setScale(0.08);
    b.setTint(0xff3300);
    const spd = 310 + (this.waveNumber - 1) * 12;
    b.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
    b.setRotation(angle);
    e.setTint(0xffff00);
    this.time.delayedCall(200, () => { if (e.active) e.clearTint(); });
  }

  // ─── HUD setup ────────────────────────────────────────────────────────────

  setupUI() {
    const W = GameData.globals.gameWidth;
    const H = GameData.globals.gameHeight;

    // Health bar
    this.playerHealthBar = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.healthText = this.add.text(26, 26, "100/100", {
      fontSize: "13px", color: "#ffffff", stroke: "#000000", strokeThickness: 2
    }).setScrollFactor(0).setDepth(1002).setOrigin(0);
    this.updatePlayerHealthBar();

    // Sprint bar + label
    this.sprintBar = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.sprintText = this.add.text(20, 63, "⚡ PRONTO", {
      fontSize: "14px", color: "#00ff88", backgroundColor: "#00000077", padding: { x: 5, y: 3 }
    }).setScrollFactor(0).setDepth(1001);
    this.updateSprintBar(1);

    // Ability label
    this.abilityText = this.add.text(20, 90, "🥊 PUGNO  [TAB]", {
      fontSize: "14px", color: "#ffffff", backgroundColor: "#00000077", padding: { x: 5, y: 3 }
    }).setScrollFactor(0).setDepth(1001);

    // Wave (top-center)
    this.waveText = this.add.text(W / 2, 10, "⚔  WAVE 1  ⚔", {
      fontSize: "20px", color: "#ffaa00", stroke: "#000000", strokeThickness: 3,
      backgroundColor: "#00000088", padding: { x: 14, y: 5 }
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001);

    // Top-right
    this.objectiveText = this.add.text(W - 14, 12, "🎯  0 / 15", {
      fontSize: "17px", color: "#ffffff", stroke: "#000000", strokeThickness: 2,
      backgroundColor: "#00000088", padding: { x: 10, y: 5 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1001);
    this.scoreText = this.add.text(W - 14, 44, "⭐  0", {
      fontSize: "15px", color: "#ffd700", stroke: "#000000", strokeThickness: 2,
      backgroundColor: "#00000088", padding: { x: 10, y: 4 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1001);
    this.enemyCountText = this.add.text(W - 14, 74, "👾  0 nemici", {
      fontSize: "14px", color: "#ff9999", backgroundColor: "#00000077", padding: { x: 8, y: 3 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1001);

    // Coin display (below ability text)
    this.coinText = this.add.text(20, 120, "🪙  0", {
      fontSize: "15px", color: "#ffd700", stroke: "#000000", strokeThickness: 2,
      backgroundColor: "#00000077", padding: { x: 5, y: 3 }
    }).setScrollFactor(0).setDepth(1001);

    // Minimap (bottom-right)
    const mmS = 112, mmX = W - mmS - 12, mmY = H - mmS - 12;
    this.minimapBg = this.add.graphics().setScrollFactor(0).setDepth(999);
    this.minimapBg.fillStyle(0x000022, 0.76);
    this.minimapBg.fillRoundedRect(mmX - 2, mmY - 14, mmS + 4, mmS + 16, 5);
    this.minimapBg.lineStyle(1.5, 0x3344bb, 0.9);
    this.minimapBg.strokeRoundedRect(mmX - 2, mmY - 14, mmS + 4, mmS + 16, 5);
    const mmLabel = this.add.text(mmX + mmS / 2, mmY - 7, "MAPPA", {
      fontSize: "9px", color: "#5566bb", letterSpacing: 2
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(1001);
    this.cameras.main.ignore(mmLabel);
    this.minimap = this.add.graphics().setScrollFactor(0).setDepth(1000);
  }

  updateSprintBar(ratio: number) {
    const x = 20, y = 52, w = 135, h = 7;
    this.sprintBar.clear();
    this.sprintBar.fillStyle(0x111111, 0.7);
    this.sprintBar.fillRoundedRect(x, y, w, h, 3);
    const col = this.isSprinting ? 0xffee00 : this.isInSprintCooldown ? 0xff6600 : 0x00ff88;
    const fill = w * Math.max(0, Math.min(1, ratio));
    if (fill > 0) { this.sprintBar.fillStyle(col, 1); this.sprintBar.fillRoundedRect(x, y, fill, h, 3); }
    this.sprintBar.lineStyle(1, 0x555555, 0.6);
    this.sprintBar.strokeRoundedRect(x, y, w, h, 3);
  }

  setupPlayerAnims() {
    if (!this.anims.exists("walk")) {
      this.anims.create({ key: "walk",  frames: this.anims.generateFrameNumbers("player", { start: 10, end: 17 }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: "punch", frames: this.anims.generateFrameNumbers("player", { start: 41, end: 42 }), frameRate: 15, repeat: 0 });
      this.anims.create({ key: "shoot", frames: this.anims.generateFrameNumbers("player", { start: 7,  end: 10 }), frameRate: 15, repeat: 0 });
    }
  }

  setupEnemyAnims() {
    if (!this.anims.exists("mago-idle"))    this.anims.create({ key: "mago-idle",     frames: this.anims.generateFrameNumbers("mago",          { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
    if (!this.anims.exists("scheletro-run")) this.anims.create({ key: "scheletro-run", frames: this.anims.generateFrameNumbers("scheletro_run",  { start: 0, end: 6 }), frameRate: 8,  repeat: -1 });
    if (!this.anims.exists("demon-run"))    this.anims.create({ key: "demon-run",     frames: this.anims.generateFrameNumbers("demon_run",       { start: 0, end: 6 }), frameRate: 8,  repeat: -1 });
  }

  setupPauseUI() {
    const W = GameData.globals.gameWidth, H = GameData.globals.gameHeight;
    const bg     = this.add.rectangle(0, 0, W, H, 0x000000, 0.62).setOrigin(0);
    const border = this.add.rectangle(W / 2, H / 2, 428, 188, 0x3344aa, 1).setOrigin(0.5);
    const panel  = this.add.rectangle(W / 2, H / 2, 424, 184, 0x0d0d2a, 1).setOrigin(0.5);
    const title  = this.add.text(W / 2, H / 2 - 40, "⏸  PAUSA", { fontSize: "48px", color: "#ffffff", stroke: "#000000", strokeThickness: 4 }).setOrigin(0.5);
    const sub    = this.add.text(W / 2, H / 2 + 34, "Premi  ESC  per continuare", { fontSize: "19px", color: "#7788cc" }).setOrigin(0.5);
    this.pauseOverlay = this.add.container(0, 0, [bg, border, panel, title, sub]).setScrollFactor(0).setDepth(3000).setVisible(false);
  }

  // ─── Health Bars ──────────────────────────────────────────────────────────

  updatePlayerHealthBar() {
    this.playerHealthBar.clear();
    const x = 20, y = 20, w = 190, h = 22;
    this.playerHealthBar.fillStyle(0x000000, 0.55);
    this.playerHealthBar.fillRoundedRect(x - 1, y - 1, w + 2, h + 2, 4);
    this.playerHealthBar.fillStyle(0x330000, 1);
    this.playerHealthBar.fillRoundedRect(x, y, w, h, 3);
    const ratio = Math.max(0, this.player.hp) / PLAYER_MAX_HP;
    if (ratio > 0) {
      const col = ratio > 0.6 ? 0x22cc55 : ratio > 0.3 ? 0xffaa00 : 0xff2222;
      this.playerHealthBar.fillStyle(col, 1);
      this.playerHealthBar.fillRoundedRect(x, y, w * ratio, h, 3);
    }
    this.playerHealthBar.lineStyle(1.5, 0x666666, 0.8);
    this.playerHealthBar.strokeRoundedRect(x, y, w, h, 3);
    if (this.healthText) this.healthText.setText(`${Math.max(0, this.player.hp)} / ${PLAYER_MAX_HP}`);
  }

  updateEnemyHealthBar(e: any) {
    e.healthBar.clear();
    if (e.hp <= 0) return;
    const bx = e.x - 28, by = e.y - 62;
    e.healthBar.fillStyle(0x000000, 0.65);
    e.healthBar.fillRect(bx - 1, by - 1, 58, 10);
    const ratio = e.hp / e.maxHp;
    const col = ratio > 0.6 ? 0x22dd55 : ratio > 0.3 ? 0xffaa00 : 0xff2222;
    e.healthBar.fillStyle(col, 1);
    e.healthBar.fillRect(bx, by, 56 * ratio, 8);
  }

  // ─── Minimap ──────────────────────────────────────────────────────────────

  updateMinimap() {
    if (!this.map) return;
    const W = GameData.globals.gameWidth, H = GameData.globals.gameHeight;
    const mmS = 112, mmX = W - mmS - 12, mmY = H - mmS - 12;
    const wW = this.map.widthInPixels * 2, wH = this.map.heightInPixels * 2;
    this.minimap.clear();
    const px = mmX + (this.player.x / wW) * mmS;
    const py = mmY + (this.player.y / wH) * mmS;
    this.minimap.fillStyle(0xffffff, 1);
    this.minimap.fillCircle(px, py, 3.8);
    this.enemies.getChildren().forEach((e: any) => {
      if (!e.active || e.isDying) return;
      const col = e.type === "demon" ? 0xff00ff : e.type === "mago" ? 0xff8800 : 0xff2222;
      this.minimap.fillStyle(col, 0.9);
      this.minimap.fillCircle(mmX + (e.x / wW) * mmS, mmY + (e.y / wH) * mmS, 2.5);
    });
    // Merchant NPC dot (gold ⚗)
    const npx = mmX + (NPC_X / wW) * mmS;
    const npy = mmY + (NPC_Y / wH) * mmS;
    this.minimap.fillStyle(0xffdd00, 1);
    this.minimap.fillCircle(npx, npy, 4);
    this.minimap.lineStyle(1.5, 0xffffff, 0.9);
    this.minimap.strokeCircle(npx, npy, 4);
    this.healthPickups.getChildren().forEach((p: any) => {
      if (!p.active) return;
      this.minimap.fillStyle(0x00ff88, 0.8);
      this.minimap.fillCircle(mmX + (p.x / wW) * mmS, mmY + (p.y / wH) * mmS, 2);
    });
  }

  // ─── Combo / Streaks ──────────────────────────────────────────────────────

  updateEnemyCount() {
    const n = this.enemies.getChildren().filter((e: any) => e.active && !e.isDying).length;
    this.enemyCountText.setText(`👾  ${n} nemici`);
  }

  updateKillStreak() {
    const now = this.time.now;
    if (now - this.lastKillTime < 2500) {
      this.killStreak++;
      this.comboMultiplier = Math.min(3.0, 1 + (this.killStreak - 1) * 0.25);
      if (this.killStreak >= 2) this.showStreakText(`x${this.killStreak} COMBO! 🔥`, this.killStreak);
    } else {
      this.killStreak = 1;
      this.comboMultiplier = 1;
    }
    this.lastKillTime = now;
  }

  showStreakText(text: string, streak: number) {
    const cx = GameData.globals.gameWidth / 2;
    const cy = GameData.globals.gameHeight / 2 - 125;
    const size = Math.min(52, 26 + streak * 4);
    const palette = ["#ffff00","#ffcc00","#ff8800","#ff4400","#ff00cc"];
    const col = palette[Math.min(streak - 2, palette.length - 1)];
    const txt = this.add.text(cx, cy, text, {
      fontSize: `${size}px`, color: col, stroke: "#000000", strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1600).setAlpha(0);
    this.cameras.main.ignore(txt);
    this.tweens.add({ targets: txt, alpha: 1, scaleX: 1.14, scaleY: 1.14, y: cy - 28, duration: 220, yoyo: true, hold: 700, onComplete: () => txt.destroy() });
  }

  showWaveBanner(wave: number) {
    const cx = GameData.globals.gameWidth / 2, cy = GameData.globals.gameHeight / 2;
    const bg  = this.add.rectangle(cx, cy, 540, 100, 0x000000, 0.72).setOrigin(0.5).setScrollFactor(0).setDepth(2499).setAlpha(0);
    const txt = this.add.text(cx, cy, `⚔  WAVE ${wave}  ⚔`, {
      fontSize: "70px", color: "#ffaa00", stroke: "#000000", strokeThickness: 7
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2500).setAlpha(0);
    this.cameras.main.ignore(bg);
    this.cameras.main.ignore(txt);
    this.tweens.add({ targets: [bg, txt], alpha: 1, duration: 360, yoyo: true, hold: 1100, onComplete: () => { bg.destroy(); txt.destroy(); } });
  }

  showFloatingText(x: number, y: number, text: string, color: string, worldSpace: boolean, fontSize: string = "18px") {
    const txt = this.add.text(x, y, text, { fontSize, color, stroke: "#000000", strokeThickness: 3 }).setOrigin(0.5).setDepth(1500);
    if (worldSpace) { if (this.hudCamera) this.hudCamera.ignore(txt); }
    else { txt.setScrollFactor(0); this.cameras.main.ignore(txt); }
    this.tweens.add({ targets: txt, y: y - 68, alpha: 0, duration: 980, ease: "Power2", onComplete: () => txt.destroy() });
  }

  dropHealthPickup(x: number, y: number) {
    const p = this.healthPickups.create(x, y, "phaser") as any;
    p.setTint(0x00ff88);
    p.setScale(0.1);
    p.setBounce(0.3);
    p.setCollideWorldBounds(true);
    if (this.hudCamera) this.hudCamera.ignore(p);
    this.tweens.add({ targets: p, scaleX: 0.15, scaleY: 0.15, duration: 200, yoyo: true, repeat: 3 });
  }

  // ─── Sprint ───────────────────────────────────────────────────────────────

  startSprint() {
    this.isSprinting = true;
    this.canSprint = false;
    this.isInSprintCooldown = false;
    this.sprintStartTime = this.time.now;
    this.sprintText.setText("⚡ ATTIVO!").setColor("#ffee00");
    this.player.setAlpha(0.75);
    this.time.delayedCall(SPRINT_DURATION, () => {
      this.isSprinting = false;
      this.isInSprintCooldown = true;
      this.sprintCooldownStartTime = this.time.now;
      this.player.setAlpha(1);
      this.sprintText.setText("⏳ RICARICA...").setColor("#ff8844");
      this.updateSprintBar(0);
      this.time.delayedCall(SPRINT_COOLDOWN, () => {
        this.canSprint = true;
        this.isInSprintCooldown = false;
        this.sprintText.setText("⚡ PRONTO").setColor("#00ff88");
        this.updateSprintBar(1);
      });
    });
  }

  // ─── End Screens ──────────────────────────────────────────────────────────

  endGameDeath() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.physics.pause();
    this.enemyBullets.clear(true, true);
    this.player.setTint(0xff2200);
    if (this.bgMusic) this.bgMusic.stop();
    this.time.delayedCall(500, () => {
      this.scene.start("GameOver", { score: this.totalScore, wave: this.waveNumber, kills: this.enemiesKilled });
    });
  }

  showVictoryScreen() {
    this.isGameOver = true;
    this.physics.pause();
    this.enemyBullets.clear(true, true);
    this.player.setTint(0x00ff88);

    const W = GameData.globals.gameWidth, H = GameData.globals.gameHeight;
    const waveBonus = this.waveNumber * 200;
    this.totalScore += waveBonus;
    this.scoreText.setText(`⭐  ${this.totalScore}`);
    const hs = parseInt(localStorage.getItem(HS_KEY) || "0");
    if (this.totalScore > hs) localStorage.setItem(HS_KEY, String(this.totalScore));

    const overlay  = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.74).setScrollFactor(0).setDepth(2000);
    const panelBdr = this.add.rectangle(W/2, H/2, 500, 400, 0x00aa44, 1).setScrollFactor(0).setDepth(2001);
    const panelBg  = this.add.rectangle(W/2, H/2, 496, 396, 0x002200, 0.97).setScrollFactor(0).setDepth(2002);
    const title    = this.add.text(W/2, H/2-172, "🏆  VITTORIA!", { fontSize: "54px", color: "#00ff88", stroke: "#000000", strokeThickness: 5 }).setOrigin(0.5).setScrollFactor(0).setDepth(2003);
    const l1 = this.add.text(W/2, H/2-98,  `Onda completata: ${this.waveNumber}`,   { fontSize: "22px", color: "#ffaa00" }).setOrigin(0.5).setScrollFactor(0).setDepth(2003);
    const l2 = this.add.text(W/2, H/2-64,  `Score totale: ${this.totalScore}`,      { fontSize: "22px", color: "#ffd700" }).setOrigin(0.5).setScrollFactor(0).setDepth(2003);
    const l3 = this.add.text(W/2, H/2-30,  `Nemici sconfitti: ${this.enemiesKilled}`,{ fontSize: "20px", color: "#ffffff" }).setOrigin(0.5).setScrollFactor(0).setDepth(2003);
    const l4 = this.add.text(W/2, H/2+4,   `Bonus wave: +${waveBonus}`,             { fontSize: "18px", color: "#00ff88" }).setOrigin(0.5).setScrollFactor(0).setDepth(2003);

    const mkBtn = (x: number, y: number, label: string, bg: string, hover: string, cb: () => void) => {
      const btn = this.add.text(x, y, label, { fontSize: "22px", color: "#ffffff", backgroundColor: bg, padding: { x: 16, y: 11 } })
        .setOrigin(0.5).setScrollFactor(0).setDepth(2003).setInteractive({ useHandCursor: true });
      btn.on("pointerover",  function(this: Phaser.GameObjects.Text) { this.setBackgroundColor(hover); this.setScale(1.04); });
      btn.on("pointerout",   function(this: Phaser.GameObjects.Text) { this.setBackgroundColor(bg);    this.setScale(1.0); });
      btn.on("pointerdown",  () => cb());
      return btn;
    };

    const btnRestart = mkBtn(W/2-130, H/2+80, " 🔄 RIAVVIA ", "#225522", "#337733", () => { if (this.bgMusic) this.bgMusic.stop(); this.scene.restart(); });
    const btnNext    = mkBtn(W/2+130, H/2+80, " ⚔ PROSSIMA ", "#224488", "#3355aa", () => {
      this.waveNumber++;
      this.targetKills += 20;
      this.isGameOver = false;
      this.physics.resume();
      [overlay, panelBdr, panelBg, title, l1, l2, l3, l4, btnRestart, btnNext].forEach(o => o.destroy());
      this.player.clearTint();
      this.objectiveText.setText(`🎯  ${this.enemiesKilled} / ${this.targetKills}`);
      this.waveText.setText(`⚔  WAVE ${this.waveNumber}  ⚔`);
      this.lastSpawnTime = 0;

      // ── Full HP restore + teleport to spawn ───────────────────────────
      this.player.hp = PLAYER_MAX_HP;
      this.player.setPosition(PLAYER_SPAWN_X, PLAYER_SPAWN_Y);
      // Green heal flash on player
      this.player.setTint(0x44ff88);
      this.time.delayedCall(350, () => this.player.clearTint());
      // Floating "+VITA PIENA" text
      const healTxt = this.add.text(this.player.x, this.player.y - 60, "❤  VITA PIENA!", {
        fontSize: "20px", color: "#44ff88", stroke: "#000000", strokeThickness: 3,
      }).setOrigin(0.5).setDepth(2010).setScrollFactor(1);
      this.tweens.add({ targets: healTxt, y: healTxt.y - 55, alpha: 0, duration: 1600, ease: "Cubic.easeOut", onComplete: () => healTxt.destroy() });
      this.hudCamera.ignore(healTxt);

      this.showWaveBanner(this.waveNumber);
    });

    [overlay, panelBdr, panelBg, title, l1, l2, l3, l4, btnRestart, btnNext].forEach(o => this.cameras.main.ignore(o));
  }

  // ─── Toggle pause ─────────────────────────────────────────────────────────

  togglePause() {
    if (this.isGameOver || this.isMerchantOpen) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      this.pauseOverlay.setVisible(true);
      this.player.anims.pause();
      this.enemies.getChildren().forEach((e: any) => e.anims.pause());
      this.enemyBullets.getChildren().forEach((b: any) => { if (b.body) b.body.enable = false; });
      this.spawnEvent.paused = true;
      if (this.bgMusic) this.bgMusic.pause();
    } else {
      this.physics.resume();
      this.pauseOverlay.setVisible(false);
      this.player.anims.resume();
      this.enemies.getChildren().forEach((e: any) => e.anims.resume());
      this.enemyBullets.getChildren().forEach((b: any) => { if (b.body) b.body.enable = true; });
      this.spawnEvent.paused = false;
      if (this.bgMusic) this.bgMusic.resume();
    }
  }

  // ─── Main Update ──────────────────────────────────────────────────────────

  update(time: number, _delta: number) {
    // ── Buff expiry (runs even while paused) ─────────────────────────────────
    if (this.damageBuff && time >= this.damageBuffExpiry) {
      this.damageBuff = false;
      this.showFloatingText(this.player.x, this.player.y - 40, "💢 Buff Danno scaduto!", "#ff8844", true, "15px");
    }
    if (this.speedBuff && time >= this.speedBuffExpiry) {
      this.speedBuff = false;
      this.showFloatingText(this.player.x, this.player.y - 40, "💨 Buff Velocità scaduto!", "#44aaff", true, "15px");
    }
    // ── Merchant proximity hint ───────────────────────────────────────────────
    if (!this.isGameOver && this.merchantHint && (this.player as any)?.active) {
      const distNPC = Phaser.Math.Distance.Between(this.player.x, this.player.y, NPC_X, NPC_Y);
      this.merchantHint.setVisible(distNPC < NPC_INTERACT_RANGE && !this.isMerchantOpen && !this.isPaused);
    }
    if (this.isGameOver || this.isPaused) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && this.canSprint) this.startSprint();
    if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
      this.currentAbility = this.currentAbility === "punch" ? "shoot" : "punch";
      this.abilityText.setText(this.currentAbility === "punch" ? "🥊 PUGNO  [TAB]" : "🔫 SPARO  [TAB]");
    }

    const isAttacking = this.player.anims.currentAnim &&
      (this.player.anims.currentAnim.key === "punch" || this.player.anims.currentAnim.key === "shoot") &&
      this.player.anims.isPlaying;

    const baseSpeed = this.speedBuff ? Math.round(NORMAL_SPEED * SPEED_BUFF_MULT) : NORMAL_SPEED;
    const curSpeed = this.isSprinting ? SPRINT_SPEED : baseSpeed;

    if (isAttacking) {
      body.setVelocity(0);
    } else {
      let dx = 0, dy = 0;
      if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -1;
      else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
      if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy = -1;
      else if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy = 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        body.setVelocity((dx / len) * curSpeed, (dy / len) * curSpeed);
        if (!isAttacking) this.player.setFlipX(dx < 0);
        this.player.anims.play("walk", true);
      } else {
        body.setVelocity(0);
        this.player.anims.stop();
        this.player.setFrame(0);
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) { this.performAttack(); return; }
    }

    // Sprint bar update
    if (this.isSprinting) {
      this.updateSprintBar(Math.max(0, 1 - (time - this.sprintStartTime) / SPRINT_DURATION));
    } else if (this.isInSprintCooldown) {
      this.updateSprintBar(Math.min(1, (time - this.sprintCooldownStartTime) / SPRINT_COOLDOWN));
    }

    this.enemies.getChildren().forEach((e: any) => this.updateEnemyAI(e, time));
    this.updateMinimap();

    // Clean out-of-bounds bullets
    const wW = this.map.widthInPixels * 2, wH = this.map.heightInPixels * 2;
    const clean = (b: any) => { if (b.active && (b.x < -50 || b.x > wW+50 || b.y < -50 || b.y > wH+50)) b.destroy(); };
    this.bullets.getChildren().forEach(clean);
    this.enemyBullets.getChildren().forEach(clean);
  }

  // ─── Merchant NPC ─────────────────────────────────────────────────────────

  private spawnMerchant() {
    const x = NPC_X, y = NPC_Y;

    // Shadow on ground
    const ground = this.add.graphics();
    ground.fillStyle(0x440000, 0.35);
    ground.fillEllipse(0, 36, 96, 28);

    // Aura ring
    const aura = this.add.graphics();
    aura.fillStyle(0xaa2200, 0.16);
    aura.fillCircle(0, 0, 70);
    aura.lineStyle(2, 0xff6600, 0.5);
    aura.strokeCircle(0, 0, 70);

    // Body figure
    const fig = this.add.graphics();
    // Robe
    fig.fillStyle(0x130820, 1);
    fig.fillTriangle(-24, 8, 24, 8, 34, 54);
    fig.fillTriangle(-24, 8, -34, 54, 34, 54);
    fig.fillRect(-34, 44, 68, 14);
    // Hood/head
    fig.fillStyle(0x0b0515, 1);
    fig.fillEllipse(0, -18, 46, 50);
    // Face shadow
    fig.fillStyle(0x1a0900, 1);
    fig.fillEllipse(0, -12, 30, 28);
    // Eyes
    fig.fillStyle(0xff5500, 0.92);
    fig.fillCircle(-9, -14, 5.5);
    fig.fillCircle(9, -14, 5.5);
    fig.fillStyle(0xffcc00, 1);
    fig.fillCircle(-9, -14, 2.8);
    fig.fillCircle(9, -14, 2.8);
    // Staff rod
    fig.lineStyle(3, 0x7700cc, 1);
    fig.lineBetween(30, -4, 30, 56);
    // Staff orb
    fig.fillStyle(0xaa00ff, 0.92);
    fig.fillCircle(30, -8, 9.5);
    fig.fillStyle(0xeeddff, 1);
    fig.fillCircle(30, -8, 5);

    // Name tag
    const nameTag = this.add.text(0, -74, "⚗  MEPHISTO", {
      fontSize: "13px", color: "#ff8800", stroke: "#000000", strokeThickness: 3,
      backgroundColor: "#00000099", padding: { x: 6, y: 4 }
    }).setOrigin(0.5);
    const subTag = this.add.text(0, -56, "Mercante dell'Abisso", {
      fontSize: "9px", color: "#cc5500", stroke: "#000000", strokeThickness: 2
    }).setOrigin(0.5);

    this.merchantSprite = this.add.container(x, y, [ground, aura, fig, nameTag, subTag]).setDepth(52);

    // Floating animation
    this.tweens.add({
      targets: this.merchantSprite, y: y - 10,
      duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });
    // Aura pulse
    this.tweens.add({
      targets: aura, scaleX: 1.28, scaleY: 1.28, alpha: 0.55,
      duration: 1800, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });
    // Staff orb flicker
    this.time.addEvent({
      delay: 3800, loop: true,
      callback: () => this.tweens.add({
        targets: fig, alpha: { from: 1, to: 0.35 },
        duration: 90, yoyo: true, repeat: 3
      })
    });

    if (this.hudCamera) this.hudCamera.ignore(this.merchantSprite);
  }

  private setupMerchantUI() {
    const W = GameData.globals.gameWidth;
    const H = GameData.globals.gameHeight;
    const pW = 640, pH = 452;
    const pX = (W - pW) / 2, pY = (H - pH) / 2;

    // ── Proximity hint ──────────────────────────────────────────────────────
    this.merchantHint = this.add.text(W / 2, H - 55, "[ F ]  Parla con  ⚗ Mephisto", {
      fontSize: "16px", color: "#ffaa00", stroke: "#000000", strokeThickness: 3,
      backgroundColor: "#00000099", padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1050).setVisible(false);

    // ── Panel ──────────────────────────────────────────────────────────────
    const dimOverlay  = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.60).setOrigin(0.5);
    const glowBorder  = this.add.rectangle(W / 2, H / 2, pW + 14, pH + 14, 0xff5500, 0.75).setOrigin(0.5);
    const frameBorder = this.add.rectangle(W / 2, H / 2, pW + 4, pH + 4, 0x440000, 1).setOrigin(0.5);
    const panelBg     = this.add.rectangle(W / 2, H / 2, pW, pH, 0x06020e, 0.97).setOrigin(0.5);
    const headerBg    = this.add.rectangle(W / 2, pY + 22, pW, 44, 0x1a0025, 1).setOrigin(0.5);
    const headerTxt   = this.add.text(W / 2, pY + 22, "⚗   MEPHISTO  ─  Il Mercante dell'Abisso   ⚗", {
      fontSize: "14px", color: "#ff8800", stroke: "#000000", strokeThickness: 2
    }).setOrigin(0.5);

    // ── Portrait column ────────────────────────────────────────────────────
    const portraitBg = this.add.rectangle(pX + 90, H / 2 + 10, 154, 230, 0x0e0018, 1).setOrigin(0.5);
    const divLine    = this.add.rectangle(pX + 169, H / 2, 2, pH - 50, 0x440022, 1).setOrigin(0.5);
    const portrait   = this.add.graphics();
    const ppx = pX + 90, ppy = H / 2 - 32;
    portrait.fillStyle(0xbb2200, 0.2);  portrait.fillCircle(ppx, ppy, 52);
    portrait.fillStyle(0x0b0515, 1);    portrait.fillEllipse(ppx, ppy - 10, 58, 64);
    portrait.fillStyle(0x1a0900, 1);    portrait.fillEllipse(ppx, ppy - 4, 36, 34);
    portrait.fillStyle(0xff5500, 0.92); portrait.fillCircle(ppx - 10, ppy - 7, 6.5);
    portrait.fillCircle(ppx + 10, ppy - 7, 6.5);
    portrait.fillStyle(0xffcc00, 1);    portrait.fillCircle(ppx - 10, ppy - 7, 3.2);
    portrait.fillCircle(ppx + 10, ppy - 7, 3.2);
    portrait.fillStyle(0x130820, 1);
    portrait.fillTriangle(ppx - 30, ppy + 14, ppx + 30, ppy + 14, ppx + 40, ppy + 84);
    portrait.fillTriangle(ppx - 30, ppy + 14, ppx - 40, ppy + 84, ppx + 40, ppy + 84);
    portrait.lineStyle(3, 0x7700cc, 1);
    portrait.lineBetween(ppx + 36, ppy + 10, ppx + 36, ppy + 90);
    portrait.fillStyle(0xaa00ff, 0.92); portrait.fillCircle(ppx + 36, ppy + 5, 10);
    portrait.fillStyle(0xeeddff, 1);    portrait.fillCircle(ppx + 36, ppy + 5, 5);
    const portName     = this.add.text(pX + 90, H / 2 + 92, "MEPHISTO",            { fontSize: "12px", color: "#ff8800", stroke: "#000000", strokeThickness: 2 }).setOrigin(0.5);
    const portIQ       = this.add.text(pX + 90, H / 2 + 108, "Demone di 1° Ordine", { fontSize: "10px", color: "#664444" }).setOrigin(0.5);
    const portSubtitle = this.add.text(pX + 90, H / 2 + 122, "Commerciante • Profeta • Genio", { fontSize: "8px", color: "#440033" }).setOrigin(0.5);

    // ── Message area ───────────────────────────────────────────────────────
    const msgBg = this.add.rectangle(pX + 400, pY + 138, 362, 162, 0x0c001e, 1).setOrigin(0.5);
    this.merchantMsgText = this.add.text(pX + 222, pY + 59, "", {
      fontSize: "13px", color: "#cccccc", wordWrap: { width: 352 }, lineSpacing: 5
    });
    this.merchantCoinDisplay = this.add.text(pX + 222, pY + 226, "🪙  0 monete", {
      fontSize: "15px", color: "#ffd700", stroke: "#000000", strokeThickness: 2
    });

    // ── Close button ───────────────────────────────────────────────────────
    const closeBtn = this.add.text(pX + pW - 6, pY + 6, " ✕ ", {
      fontSize: "18px", color: "#ff4444", stroke: "#000000", strokeThickness: 2,
      backgroundColor: "#33000088", padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    closeBtn.on("pointerdown", () => this.closeMerchant());
    closeBtn.on("pointerover",  function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#660000"); });
    closeBtn.on("pointerout",   function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#33000088"); });

    this.merchantUI = this.add.container(0, 0, [
      dimOverlay, glowBorder, frameBorder, panelBg,
      headerBg, headerTxt,
      portraitBg, divLine, portrait, portName, portIQ, portSubtitle,
      msgBg, this.merchantMsgText, this.merchantCoinDisplay,
      closeBtn
    ]).setScrollFactor(0).setDepth(1998).setVisible(false);

    // Dynamic button container (buttons added per-state)
    this.merchantBtnContainer = this.add.container(0, 0)
      .setScrollFactor(0).setDepth(2007).setVisible(false);
  }

  private openMerchant() {
    if (this.isMerchantOpen || this.isGameOver) return;
    this.isMerchantOpen = true;
    this.isPaused = true;
    this.physics.pause();
    this.player.anims.pause();
    this.enemies.getChildren().forEach((e: any) => { if (e.active) e.anims.pause(); });
    this.enemyBullets.getChildren().forEach((b: any) => { if (b.body) b.body.enable = false; });
    this.spawnEvent.paused = true;
    this.merchantHint.setVisible(false);
    this.merchantUI.setVisible(true);
    this.merchantBtnContainer.setVisible(true);
    this.merchantCoinDisplay.setText(`🪙  ${this.playerCoins} monete`);
    this.merchantSay(this.merchantGreetedOnce ? this.getMephistoRevisit() : this.getMephistoGreeting());
    this.merchantGreetedOnce = true;
    this.showMerchantMainMenu();
  }

  private closeMerchant() {
    if (!this.isMerchantOpen) return;
    this.isMerchantOpen = false;
    this.isPaused = false;
    this.merchantUI.setVisible(false);
    this.merchantBtnContainer.setVisible(false);
    this.clearMerchantButtons();
    this.physics.resume();
    this.player.anims.resume();
    this.enemies.getChildren().forEach((e: any) => { if (e.active) e.anims.resume(); });
    this.enemyBullets.getChildren().forEach((b: any) => { if (b.body) b.body.enable = true; });
    this.spawnEvent.paused = false;
    this.showFloatingText(this.player.x, this.player.y - 50, "A presto...", "#888888", true, "15px");
  }

  private clearMerchantButtons() {
    this.merchantBtnContainer.removeAll(true);
  }

  private addMerchantButton(label: string, x: number, y: number, textColor: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: "13px", color: textColor,
      backgroundColor: "#1e0030", padding: { x: 10, y: 8 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2008).setInteractive({ useHandCursor: true });
    btn.on("pointerover",  function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#4a0080"); this.setScale(1.05); });
    btn.on("pointerout",   function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#1e0030"); this.setScale(1); });
    btn.on("pointerdown",  cb);
    this.merchantBtnContainer.add(btn);
    this.cameras.main.ignore(btn);
  }

  private showMerchantMainMenu() {
    this.clearMerchantButtons();
    const W = GameData.globals.gameWidth, H = GameData.globals.gameHeight;
    const pX = (W - 640) / 2, pY = (H - 452) / 2;
    const btnY = pY + 452 - 48;
    this.addMerchantButton("🧪 Compra Pozioni",   pX + 240, btnY, "#ffaa44", () => this.showMerchantShop());
    this.addMerchantButton("🔮 Chiedi Consiglio", pX + 368, btnY, "#aaaaff", () => this.merchantSay(this.getMephistoAdvice()));
    this.addMerchantButton("📜 Lore Oscuro",      pX + 492, btnY, "#ff88bb", () => {
      const t = ["pact", "catacombs", "king", "hell", "mask"];
      this.merchantSay(this.getMephistoLore(t[Phaser.Math.Between(0, t.length - 1)]));
    });
    this.addMerchantButton("🚪 Via di Qui",       pX + 606, btnY, "#888888", () => this.closeMerchant());
  }

  private showMerchantShop() {
    this.clearMerchantButtons();
    const W = GameData.globals.gameWidth, H = GameData.globals.gameHeight;
    const pX = (W - 640) / 2, pY = (H - 452) / 2;
    const btnY = pY + 452 - 48;

    const tryBuy = (cost: number, onOk: () => void, noMoneyMsg: string) => {
      if (this.playerCoins < cost) { this.merchantSay(noMoneyMsg); return; }
      this.playerCoins -= cost;
      if (this.coinText) this.coinText.setText(`🪙  ${this.playerCoins}`);
      this.merchantCoinDisplay.setText(`🪙  ${this.playerCoins} monete`);
      onOk();
    };

    this.addMerchantButton(
      `❤ Vita +50  [${COIN_POTION_HP_COST}🪙]`, pX + 236, btnY, "#00ff88",
      () => tryBuy(COIN_POTION_HP_COST,
        () => {
          if (this.player.hp >= PLAYER_MAX_HP) {
            this.playerCoins += COIN_POTION_HP_COST;
            if (this.coinText) this.coinText.setText(`🪙  ${this.playerCoins}`);
            this.merchantCoinDisplay.setText(`🪙  ${this.playerCoins} monete`);
            this.merchantSay("Sei già a piena salute. L'avidità è un peccato capitale. Anche qui nell'Inferno. Le monete ti sono state restituite... questa volta.");
          } else {
            this.player.hp = Math.min(PLAYER_MAX_HP, this.player.hp + 50);
            this.updatePlayerHealthBar();
            this.merchantSay("Ah, il pragmatismo della sopravvivenza. +50 HP. Aristotele ne sarebbe disgustato. Io sono lieto di fare affari.");
          }
        },
        "Non hai abbastanza monete. Prova a uccidere qualcosa... o a supplicare. Entrambe le opzioni mi divertono tremendamente."
      )
    );

    this.addMerchantButton(
      `⚔ Danno ×${DAMAGE_BUFF_MULT}  [${COIN_POTION_DMG_COST}🪙]`, pX + 386, btnY, "#ff8800",
      () => tryBuy(COIN_POTION_DMG_COST,
        () => {
          this.damageBuff = true;
          this.damageBuffExpiry = this.time.now + BUFF_DURATION_MS;
          this.merchantSay(`Danno ×${DAMAGE_BUFF_MULT} per ${BUFF_DURATION_MS / 1000}s. Con questo potresti rovesciare un regno. O almeno un demone di medio livello. Probabilmente entrambi.`);
        },
        "Monete insufficienti. L'universo non funziona a credito. Almeno non il mio angolo di esso."
      )
    );

    this.addMerchantButton(
      `💨 Velocità ×${SPEED_BUFF_MULT}  [${COIN_POTION_SPD_COST}🪙]`, pX + 526, btnY, "#44ccff",
      () => tryBuy(COIN_POTION_SPD_COST,
        () => {
          this.speedBuff = true;
          this.speedBuffExpiry = this.time.now + BUFF_DURATION_MS;
          this.merchantSay(`Velocità ×${SPEED_BUFF_MULT} per ${BUFF_DURATION_MS / 1000}s. Corri pure — ma ricorda: non si scappa dal destino. Solo dalla seconda ondata. E dalla terza. Forse dalla quarta.`);
        },
        "Povero alchimista... la velocità costa. Come tutto ciò che vale la pena avere nell'Inferno, tra cui la tua anima."
      )
    );

    this.addMerchantButton("◀ Indietro", pX + 616, btnY, "#aaaaaa", () => {
      this.showMerchantMainMenu();
      this.merchantSay(this.getMephistoRevisit());
    });

    this.merchantSay("Prezzi onesti per un demonio di primo ordine. O così dicono i clienti meno squattrinati.");
  }

  private merchantSay(text: string) {
    // Cancel any running typewriter to prevent stacking
    if (this._merchantSayTimer) {
      this._merchantSayTimer.remove(false);
      this._merchantSayTimer = null;
    }
    this.merchantMsgText.setText("");
    let i = 0;
    const chars = text.split("");
    this._merchantSayTimer = this.time.addEvent({
      delay: 20, repeat: chars.length - 1,
      callback: () => {
        if (this.merchantMsgText && chars[i] !== undefined)
          this.merchantMsgText.setText(this.merchantMsgText.text + chars[i++]);
      }
    });
  }

  private getMephistoGreeting(): string {
    if (this.player.hp < PLAYER_MAX_HP * 0.3) {
      return `Ah. Sei arrivato. Con ${this.player.hp} punti vita, direi — e lo dico con tutto il rispetto che mi è possibile — che sei un disastro ambulante. Fortunatamente per te, Mephisto è presente.`;
    }
    if (this.waveNumber >= 3) {
      return `Wave ${this.waveNumber} e ancora in piedi. Interessante. La maggior parte muore prima. Non che mi importi, ma lo registro. Benvenuto. Sono Mephisto — presumo tu sappia già chi sono.`;
    }
    return "Finalmente qualcuno degno di fermarsi. Sono Mephisto — ma questo lo sai già, chiunque valga qualcosa lo sa. Commerciante, visionario, unico essere in queste catacombe con un minimo di gusto. Cosa posso fare per te?";
  }

  private getMephistoRevisit(): string {
    const opts = [
      "Di nuovo tu. Come previsto. Letteralmente previsto — non è una metafora.",
      "Sapevo che saresti tornato prima ancora che tu lo sapessi. Uno dei vantaggi dell'essere me.",
      "Ah, il mio cliente preferito. Non perché mi sia simpatico — semplicemente perché sei l'unico.",
      "Tornato? Non ti biasimo. Se potessi conversare con me stesso, lo farei in continuazione.",
      `Wave ${this.waveNumber}, ${this.enemiesKilled} nemici. Ancora vivo. Devo ammettere che cominci a sorprendermi. Quasi.`,
      "Puntuale come la morte. E in questo posto, è un complimento.",
      "Ti aspettavo. Come sempre. È una delle poche soddisfazioni che mi rimangono in questo lavoro.",
    ];
    return opts[Phaser.Math.Between(0, opts.length - 1)];
  }

  private getMephistoAdvice(): string {
    const hp = this.player.hp, w = this.waveNumber, k = this.enemiesKilled;
    const s = this._randomTangent();
    if (hp < 30) return `${hp} HP. Non è un consiglio, è un'urgenza: compra una pozione adesso. Prima di finire questa frase. Muoviti.${s}`;
    if (hp > 80 && this.playerCoins > 40) return `Hai ${this.playerCoins} monete e buona salute — una rarità assoluta qui sotto. Un buff ora potrebbe farti passare da "sopravvissuto fortunato" a "minaccia credibile". Considera il Danno.${s}`;
    if (w >= 4) return `Wave ${w}: i demoni si moltiplicano come le menzogne a corte. Il Buff Danno trasformerebbe ogni tuo colpo in qualcosa di cui vergognarsi. I nemici, intendo.${s}`;
    if (k > 25) return `${k} nemici. Il Diavolo ti guarda con irritazione crescente. Io ti guardo con curiosità — che è molto di più, venendo da me.${s}`;
    return `Muoviti. Colpisci. Non morire. Sembra banale, eppure il 94% delle persone che entrano qui fallisce almeno uno di questi tre punti.${s}`;
  }

  private getMephistoLore(topic: string): string {
    const s = this._randomTangent();
    const lore: Record<string, string> = {
      pact:      `Il Re ha venduto l'anima al Diavolo per sedare la Rivoluzione. Errore classico del dispotismo disperato. Il prezzo era l'apertura dei cancelli. Il Re non ha letto le clausole — nessuno le legge mai.${s}`,
      catacombs: `Sei a 47 metri sotto Parigi. Sei milioni di morti riposano qui — o riposavano, prima del Diavolo. Ora è più affollato del solito e il vicinato è notevolmente peggiorato.${s}`,
      king:      `Luigi XVI: onesto, mediocre, disperato. Ha scelto il potere demonico perché non sapeva come fare altrimenti. La storia lo giudica con la ghigliottina. L'Inferno ha già emesso un verdetto molto più definitivo.${s}`,
      hell:      `I cancelli hanno tre sigilli, tre guardiani. I demoni che stai affrontando sono servitori — fastidiosi ma irrilevanti nel quadro generale. I guardiani sono un'altra categoria. Non correre verso di loro.${s}`,
      mask:      `La tua maschera è un artefatto alchemico medievale, perduto durante l'Inquisizione. Ogni forma è un potere diverso. Chi te l'ha inviata? Non lo so. E questo — devo ammettere — mi disturba profondamente.${s}`,
    };
    return lore[topic] ?? `Domanda interessante. La risposta richiederebbe più tempo di quanto tu ne abbia. Ma apprezzo l'audacia della domanda.${s}`;
  }

  /** Appends a random non-sequitur (~25% chance) */
  private _randomTangent(): string {
    if (Phaser.Math.Between(0, 3) !== 0) return "";
    const lines = [
      " ...Napoleone aveva paura dei gatti. Irrilevante, ma vero.",
      " ...Ho contato le pietre di questo corridoio. Sono 3.847. Non so perché te lo dico.",
      " ...A volte mi chiedo cosa significhi il colore blu. Poi mi ricordo che me ne frega poco.",
      " ...Ho venduto una maschera simile alla tua trecento anni fa. Non finì bene per il compratore.",
      " ...Voltaire mi insultò una volta. Ebbe il coraggio di non pentirsi. Lo rispetto ancora.",
      " ...I pipistrelli dormono a testa in giù. Gli scheletri dormono nella terra. Tu non dormi affatto.",
      " ...C'è una crepa nel muro dietro di te. Non è importante.",
      " ...Avrei potuto essere un poeta. Avrei scritto cose terribili. Magnificamente terribili.",
      " ...La fisica quantistica suggerisce che tu possa non esistere. Lo trovo stranamente rassicurante.",
      " ...Un mio collega demone aprì un panificio nel 1347. Fallì in tre giorni. Non c'entra nulla.",
      " ...Il numero sette è il preferito degli umani. Curioso. Non capirò mai gli umani.",
      " ...Ho dimenticato il filo del discorso. No, eccolo. Comunque.",
    ];
    return lines[Phaser.Math.Between(0, lines.length - 1)];
  }
}
