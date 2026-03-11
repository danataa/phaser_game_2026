import { GameData } from "../GameData";

export default class GamePlay extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite & { hp: number; isInvulnerable: boolean };
  private enemies: Phaser.Physics.Arcade.Group;
  private bullets: Phaser.Physics.Arcade.Group;
  private enemyBullets: Phaser.Physics.Arcade.Group;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Phaser.Types.Input.Keyboard.CursorKeys;
  private tabKey: Phaser.Input.Keyboard.Key;
  private shiftKey: Phaser.Input.Keyboard.Key;

  // UI
  private playerHealthBar: Phaser.GameObjects.Graphics;
  private abilityText: Phaser.GameObjects.Text;
  private dashText: Phaser.GameObjects.Text;
  private objectiveText: Phaser.GameObjects.Text;
  private hudCamera: Phaser.Cameras.Scene2D.Camera;

  // Game Logic
  private currentAbility: "punch" | "shoot" = "punch";
  private normalSpeed: number = 200;
  private isDashing: boolean = false;
  private canDash: boolean = true;
  private dashSpeed: number = 750;
  private dashDurationMs: number = 160;
  private dashCooldownMs: number = 900;

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
  private healthPickups: Phaser.Physics.Arcade.Group;
  private waveText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;

  // Pause
  private pauseOverlay: Phaser.GameObjects.Container;

  private lastDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private escKey: Phaser.Input.Keyboard.Key;

  /** Scene constructor (key: GamePlay). */
  constructor() {
    super({ key: "GamePlay" });
  }

  /** Creates the level, player, UI, cameras, enemies, and post-processing. */
  create() {
    this.isGameOver = false;
    this.enemiesKilled = 0;
    this.totalScore = 0;
    this.killStreak = 0;
    this.lastKillTime = 0;
    this.waveNumber = 1;
    this.lastDirection.set(1, 0);
    this.cameras.main.setBackgroundColor(0x000000);

    const map = this.add.tilemap("tilemap_0");
    const tileset = map.addTilesetImage("mainlevbuild", "tileset_0");
    const floor = map.createLayer("floor", tileset, 0, 0);
    const holes = map.createLayer("holes", tileset, 0, 0);
    const walls = map.createLayer("walls", tileset, 0, 0);
    const accesories = map.createLayer("accessories", tileset, 0, 0);

    floor.setScale(2);
    holes.setScale(2);
    accesories.setScale(2);
    walls.setScale(2);

    const collidableLayers = [floor, holes, walls, accesories];
    collidableLayers.forEach(layer => layer.setCollisionByProperty({ collide: true }));

    this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);

    this.bullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.healthPickups = this.physics.add.group();

    this.player = this.physics.add.sprite(200, 200, "player_idle") as any;
    this.player.hp = 100;
    this.player.isInvulnerable = false;
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(30, 55);
    this.player.setOffset(15, 68);
    collidableLayers.forEach(layer => this.physics.add.collider(this.player, layer));

    this.setupUI();
    this.setupPlayerAnims();
    this.setupPauseUI();

    this.bgMusic = this.sound.get("music");

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);

    this.hudCamera = this.cameras.add(0, 0, GameData.globals.gameWidth, GameData.globals.gameHeight);
    this.hudCamera.setScroll(0, 0);
    this.hudCamera.setZoom(1);

    this.hudCamera.ignore(floor);
    this.hudCamera.ignore(walls);
    this.hudCamera.ignore(this.player);
    if (this.physics.world.debugGraphic) {
      this.hudCamera.ignore(this.physics.world.debugGraphic);
    }

    this.cameras.main.ignore(this.playerHealthBar);
    this.cameras.main.ignore(this.abilityText);
    this.cameras.main.ignore(this.dashText);
    this.cameras.main.ignore(this.objectiveText);
    this.cameras.main.ignore(this.pauseOverlay);
    this.cameras.main.ignore(this.waveText);
    this.cameras.main.ignore(this.scoreText);

    if (!this.anims.exists("mago-idle")) {
      this.anims.create({ key: "mago-idle", frames: this.anims.generateFrameNumbers("mago", { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists("mago-walk")) {
      this.anims.create({ key: "mago-walk", frames: this.anims.generateFrameNumbers("mago_walk", { start: 0, end: 6 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists("mago-run")) {
      this.anims.create({ key: "mago-run", frames: this.anims.generateFrameNumbers("mago_run", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
    }
    if (!this.anims.exists("mago-attack-1")) {
      this.anims.create({ key: "mago-attack-1", frames: this.anims.generateFrameNumbers("mago_attack_1", { start: 0, end: 6 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("mago-attack-2")) {
      this.anims.create({ key: "mago-attack-2", frames: this.anims.generateFrameNumbers("mago_attack_2", { start: 0, end: 8 }), frameRate: 12, repeat: 0 });
    }
    // Projectile animation for the mago (Wizzard/Charge_1.png)
    if (!this.anims.exists("mago-projectile")) {
      this.anims.create({ key: "mago-projectile", frames: this.anims.generateFrameNumbers("mago_charge_1", { start: 0, end: 8 }), frameRate: 14, repeat: -1 });
    }
    if (!this.anims.exists("mago-charge")) {
      this.anims.create({ key: "mago-charge", frames: this.anims.generateFrameNumbers("mago_charge_2", { start: 0, end: 2 }), frameRate: 10, repeat: 0 });
    }
    if (!this.anims.exists("mago-hurt")) {
      this.anims.create({ key: "mago-hurt", frames: this.anims.generateFrameNumbers("mago_hurt", { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("mago-dead")) {
      this.anims.create({ key: "mago-dead", frames: this.anims.generateFrameNumbers("mago_dead", { start: 0, end: 3 }), frameRate: 8, repeat: 0 });
    }

    // Scheletro animations (loaded from assets/images/Scheletro/)
    if (!this.anims.exists("scheletro-idle")) {
      this.anims.create({ key: "scheletro-idle", frames: this.anims.generateFrameNumbers("scheletro_idle", { start: 0, end: 6 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists("scheletro-walk")) {
      this.anims.create({ key: "scheletro-walk", frames: this.anims.generateFrameNumbers("scheletro_walk", { start: 0, end: 6 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists("scheletro-run")) {
      this.anims.create({ key: "scheletro-run", frames: this.anims.generateFrameNumbers("scheletro_run", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
    }
    if (!this.anims.exists("scheletro-run-attack")) {
      this.anims.create({ key: "scheletro-run-attack", frames: this.anims.generateFrameNumbers("scheletro_run_attack", { start: 0, end: 6 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("scheletro-attack-1")) {
      this.anims.create({ key: "scheletro-attack-1", frames: this.anims.generateFrameNumbers("scheletro_attack_1", { start: 0, end: 4 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("scheletro-attack-2")) {
      this.anims.create({ key: "scheletro-attack-2", frames: this.anims.generateFrameNumbers("scheletro_attack_2", { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("scheletro-attack-3")) {
      this.anims.create({ key: "scheletro-attack-3", frames: this.anims.generateFrameNumbers("scheletro_attack_3", { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("scheletro-hurt")) {
      this.anims.create({ key: "scheletro-hurt", frames: this.anims.generateFrameNumbers("scheletro_hurt", { start: 0, end: 1 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("scheletro-dead")) {
      this.anims.create({ key: "scheletro-dead", frames: this.anims.generateFrameNumbers("scheletro_dead", { start: 0, end: 3 }), frameRate: 8, repeat: 0 });
    }
    if (!this.anims.exists("scheletro-protect")) {
      this.anims.create({ key: "scheletro-protect", frames: this.anims.generateFrameNumbers("scheletro_protect", { start: 0, end: 0 }), frameRate: 1, repeat: -1 });
    }
    // Demon animations (loaded from assets/images/Demon/)
    if (!this.anims.exists("demon-idle")) {
      this.anims.create({ key: "demon-idle", frames: this.anims.generateFrameNumbers("demon_idle", { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists("demon-idle-2")) {
      this.anims.create({ key: "demon-idle-2", frames: this.anims.generateFrameNumbers("demon_idle_2", { start: 0, end: 4 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists("demon-walk")) {
      this.anims.create({ key: "demon-walk", frames: this.anims.generateFrameNumbers("demon_walk", { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists("demon-run")) {
      this.anims.create({ key: "demon-run", frames: this.anims.generateFrameNumbers("demon_run", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
    }
    if (!this.anims.exists("demon-jump")) {
      this.anims.create({ key: "demon-jump", frames: this.anims.generateFrameNumbers("demon_jump", { start: 0, end: 14 }), frameRate: 15, repeat: 0 });
    }
    if (!this.anims.exists("demon-attack-1")) {
      this.anims.create({ key: "demon-attack-1", frames: this.anims.generateFrameNumbers("demon_attack_1", { start: 0, end: 2 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("demon-attack-2")) {
      this.anims.create({ key: "demon-attack-2", frames: this.anims.generateFrameNumbers("demon_attack_2", { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("demon-attack-3")) {
      this.anims.create({ key: "demon-attack-3", frames: this.anims.generateFrameNumbers("demon_attack_3", { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("demon-hurt")) {
      this.anims.create({ key: "demon-hurt", frames: this.anims.generateFrameNumbers("demon_hurt", { start: 0, end: 2 }), frameRate: 12, repeat: 0 });
    }
    if (!this.anims.exists("demon-dead")) {
      this.anims.create({ key: "demon-dead", frames: this.anims.generateFrameNumbers("demon_dead", { start: 0, end: 5 }), frameRate: 8, repeat: 0 });
    }

    for (let i = 0; i < 5; i++) {
      this.spawnEnemy(map, true);
    }

    this.spawnEvent = this.time.addEvent({
      delay: Phaser.Math.Between(2000, 4000),
      callback: () => {
        if (!this.isGameOver) {
          this.spawnEnemy(map, true);
          const minDelay = Math.max(500, 2000 - (this.waveNumber - 1) * 200);
          const maxDelay = Math.max(1000, 4000 - (this.waveNumber - 1) * 200);
          this.spawnEvent.reset({
            delay: Phaser.Math.Between(minDelay, maxDelay),
            callback: this.spawnEvent.callback,
            callbackScope: this
          });
        }
      },
      callbackScope: this,
      loop: true
    });

    collidableLayers.forEach(layer => {
      this.physics.add.collider(this.enemies, layer);
      this.physics.add.collider(this.bullets, layer, (b: any) => b.destroy());
      this.physics.add.collider(this.enemyBullets, layer, (b: any) => b.destroy());
    });

    this.physics.add.overlap(this.bullets, this.enemies, (b: any, e: any) => {
      // Effetto visivo all'impatto
      const impactEffect = this.add.circle(b.x, b.y, 15, 0xffff00, 0.8).setDepth(650);
      if (this.hudCamera) this.hudCamera.ignore(impactEffect);
      this.tweens.add({
        targets: impactEffect,
        scale: 2,
        alpha: 0,
        duration: 150,
        ease: "Power2",
        onComplete: () => impactEffect.destroy()
      });
      
      b.destroy();
      this.damageEnemy(e);
    });

    this.physics.add.overlap(this.enemyBullets, this.player, (p: any, b: any) => {
      b.destroy();
      this.handlePlayerDamage(8);
    });

    this.physics.add.collider(this.player, this.enemies, (_p: any, e: any) => {
      const dmg = e.type === "demon" ? 15 : e.type === "mago" ? 8 : 5;
      this.handlePlayerDamage(dmg);

      // Scheletro: mostra un attacco quando entra in contatto (throttled per evitare spam)
      if (e.type === "skeleton" && e.active && !e.isDying) {
        if (e.lastContactAnimTime === undefined) e.lastContactAnimTime = 0;
        const now = this.time.now;
        if (now > e.lastContactAnimTime + 500) {
          e.lastContactAnimTime = now;
          const n = Phaser.Math.Between(1, 3);
          e.play(`scheletro-attack-${n}`, true);
        }
      }

      // Demon: mostra un attacco al contatto (throttled)
      if (e.type === "demon" && e.active && !e.isDying) {
        if (e.lastContactAnimTime === undefined) e.lastContactAnimTime = 0;
        const now = this.time.now;
        if (now > e.lastContactAnimTime + 700) {
          e.lastContactAnimTime = now;
          const n = Phaser.Math.Between(1, 3);
          e.play(`demon-attack-${n}`, true);
        }
      }
    });

    this.physics.add.overlap(this.player, this.healthPickups, (_p: any, pickup: any) => {
      if (!pickup.active) return;
      pickup.destroy();
      this.player.hp = Math.min(100, this.player.hp + 20);
      this.updatePlayerHealthBar();
      this.showFloatingText(this.player.x, this.player.y - 40, "+20 HP", "#00ff00", true);
    });

    this.physics.add.collider(this.enemies, this.enemies);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: "W", down: "S", left: "A", right: "D",
    }) as Phaser.Types.Input.Keyboard.CursorKeys;

    this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.input.keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.TAB, Phaser.Input.Keyboard.KeyCodes.ESC]);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.performAttack();
      }
    });

    this.input.keyboard.on("keydown-ESC", () => {
      this.togglePause();
    });

    // Mostra banner wave all'inizio
    this.time.delayedCall(400, () => this.showWaveBanner(this.waveNumber));
  }

  /** Applies damage to the player with brief invulnerability, UI update, and game-over check. */
  handlePlayerDamage(damage: number = 10) {
    if (!this.player.isInvulnerable && !this.isGameOver) {
      this.player.hp -= damage;
      this.player.isInvulnerable = true;
      this.player.setTint(0xff0000);
      this.cameras.main.shake(150, 0.008);
      this.showFloatingText(this.player.x, this.player.y - 40, `-${damage}`, "#ff4444", true);
      this.updatePlayerHealthBar();
      if (this.player.hp <= 0) {
        this.player.anims.play("player-dead", true);
        this.showEndScreen(false);
      } else {
        this.player.anims.play("player-hurt", true);
        this.time.delayedCall(1000, () => {
          this.player.isInvulnerable = false;
          this.player.clearTint();
        });
      }
    }
  }

  /** Toggles pause state, stopping physics, animations, timers, and music. */
  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.pauseOverlay.setVisible(true);
      this.player.anims.pause();
      this.enemies.getChildren().forEach((e: any) => e.anims.pause());
      this.enemyBullets.getChildren().forEach((b: any) => { if(b.body) b.body.enable = false; });
      this.spawnEvent.paused = true;
      if (this.bgMusic) this.bgMusic.pause();
    } else {
      this.physics.resume();
      this.pauseOverlay.setVisible(false);
      this.player.anims.resume();
      this.enemies.getChildren().forEach((e: any) => e.anims.resume());
      this.enemyBullets.getChildren().forEach((b: any) => { if(b.body) b.body.enable = true; });
      this.spawnEvent.paused = false;
      if (this.bgMusic) this.bgMusic.resume();
    }
  }

  /** Builds the pause overlay UI. */
  setupPauseUI() {
    const bg = this.add.rectangle(0, 0, GameData.globals.gameWidth, GameData.globals.gameHeight, 0x000000, 0.5).setOrigin(0);
    const text = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2, "PAUSA", { fontSize: "64px", color: "#ffffff" }).setOrigin(0.5);
    const subText = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2 + 80, "Premi ESC per continuare", { fontSize: "24px", color: "#ffffff" }).setOrigin(0.5);
    this.pauseOverlay = this.add.container(0, 0, [bg, text, subText]).setScrollFactor(0).setDepth(3000).setVisible(false);
  }

  /** Executes the current player ability (punch or shoot) towards the pointer direction. */
  performAttack() {
    if (this.isGameOver || this.isPaused || this.isDashing) return;

    const pointer = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
    this.lastDirection.set(Math.cos(angle), Math.sin(angle));
    this.setPlayerFlipX(pointer.worldX < this.player.x);

    if (this.currentAbility === "punch") {
      this.player.anims.play("player-attack-1", true);
      
      // Attacco melee direzionale con hitbox rettangolare davanti al player
      const punchRange = 80;
      const punchWidth = 60;
      const punchOffsetX = this.player.x + this.lastDirection.x * punchRange / 2;
      const punchOffsetY = this.player.y + this.lastDirection.y * punchRange / 2;
      
      // Effetto visivo dell'attacco pugno (cerchio temporaneo)
      const punchEffect = this.add.circle(
        this.player.x + this.lastDirection.x * 50,
        this.player.y + this.lastDirection.y * 50,
        30,
        0xffffff,
        0.6
      ).setDepth(600);
      
      if (this.hudCamera) this.hudCamera.ignore(punchEffect);
      
      // Animazione dell'effetto
      this.tweens.add({
        targets: punchEffect,
        scale: 1.5,
        alpha: 0,
        duration: 200,
        ease: "Power2",
        onComplete: () => punchEffect.destroy()
      });
      
      this.enemies.getChildren().forEach((e: any) => {
        if (!e.active || e.isDying) return;
        
        // Calcola se il nemico è nella direzione dell'attacco
        const toEnemy = new Phaser.Math.Vector2(e.x - this.player.x, e.y - this.player.y);
        const distance = toEnemy.length();
        
        if (distance > punchRange) return;
        
        // Controlla l'angolo: il nemico deve essere davanti al player (cone attack)
        toEnemy.normalize();
        const dotProduct = this.lastDirection.dot(toEnemy);
        
        // dotProduct > 0.5 significa che il nemico è entro ~60 gradi dalla direzione di attacco
        if (dotProduct > 0.5 && distance < punchRange) {
          this.damageEnemy(e);
          // Piccolo knockback
          if (e.body) {
            e.body.velocity.x += this.lastDirection.x * 150;
            e.body.velocity.y += this.lastDirection.y * 150;
          }
        }
      });
    } else {
      this.player.anims.play("player-attack-2", true);
      const bullet = this.bullets.create(this.player.x, this.player.y, "phaser") as any;
      if (this.hudCamera) this.hudCamera.ignore(bullet);
      
      // Configura il proiettile con corpo fisico appropriato
      bullet.setScale(0.15);
      bullet.setTint(0x00ff88); // Verde brillante per i proiettili del player
      
      // Abilita il body e configura le dimensioni
      if (bullet.body) {
        bullet.body.setSize(20, 20);
        bullet.setCircle(10); // Collisione circolare più precisa
      }
      
      bullet.setVelocity(this.lastDirection.x * 600, this.lastDirection.y * 600);
      bullet.setRotation(angle);
      bullet.setDepth(500);
      
      // Distruggi il proiettile dopo 2 secondi
      this.time.delayedCall(2000, () => {
        if (bullet && bullet.active) bullet.destroy();
      });
    }
  }

  /** Creates the HUD elements (health bar, ability text, dash, objective, wave, score). */
  setupUI() {
    this.playerHealthBar = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.updatePlayerHealthBar();
    this.abilityText = this.add.text(20, 50, "Abilità: PUGNO [TAB/LMB]", { fontSize: "20px", color: "#ffffff" }).setScrollFactor(0).setDepth(1000);
    this.dashText = this.add.text(20, 80, "Scatto: PRONTO [SHIFT]", { fontSize: "20px", color: "#00ff00" }).setScrollFactor(0).setDepth(1000);
    this.objectiveText = this.add.text(GameData.globals.gameWidth - 300, 20, `Obiettivo: 0/${this.targetKills}`, { fontSize: "24px", color: "#ffffff", backgroundColor: "#00000066" }).setScrollFactor(0).setDepth(1000);
    this.waveText = this.add.text(GameData.globals.gameWidth / 2, 20, `Wave ${this.waveNumber}`, { fontSize: "22px", color: "#ffaa00", stroke: "#000000", strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    this.scoreText = this.add.text(GameData.globals.gameWidth - 300, 52, "Score: 0", { fontSize: "20px", color: "#ffffff", backgroundColor: "#00000066" }).setScrollFactor(0).setDepth(1000);
  }

  /** Defines player animations once using the new Knight_3 spritesheets. */
  setupPlayerAnims() {
    if (!this.anims.exists("player-idle")) {
      this.anims.create({ key: "player-idle",     frames: this.anims.generateFrameNumbers("player_idle",     { start: 0, end: 3 }), frameRate: 6,  repeat: -1 });
      this.anims.create({ key: "player-walk",     frames: this.anims.generateFrameNumbers("player_walk",     { start: 0, end: 6 }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: "player-attack-1", frames: this.anims.generateFrameNumbers("player_attack_1", { start: 0, end: 4 }), frameRate: 12, repeat: 0 });
      this.anims.create({ key: "player-attack-2", frames: this.anims.generateFrameNumbers("player_attack_2", { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
      this.anims.create({ key: "player-attack-3", frames: this.anims.generateFrameNumbers("player_attack_3", { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
      this.anims.create({ key: "player-hurt",     frames: this.anims.generateFrameNumbers("player_hurt",     { start: 0, end: 1 }), frameRate: 12, repeat: 0 });
      this.anims.create({ key: "player-dead",     frames: this.anims.generateFrameNumbers("player_dead",     { start: 0, end: 5 }), frameRate: 8,  repeat: 0 });
    }
  }

  /** Spawns a random enemy type around the camera and sets up its properties and animation. */
  spawnEnemy(map: Phaser.Tilemaps.Tilemap, forceRandom: boolean = false) {
    const cam = this.cameras.main;
    const offset = 100;
    let x: number, y: number;

    if (forceRandom || cam.worldView.width === 0) {
      x = Phaser.Math.Between(40, map.widthInPixels * 2 - 40);
      y = Phaser.Math.Between(40, map.heightInPixels * 2 - 40);
      const px = this.player ? this.player.x : 200;
      const py = this.player ? this.player.y : 200;
      const dist = Phaser.Math.Distance.Between(x, y, px, py);
      if (dist < 300) {
        x = Phaser.Math.Between(40, map.widthInPixels * 2 - 40);
        y = Phaser.Math.Between(40, map.heightInPixels * 2 - 40);
      }
    } else {
      const side = Phaser.Math.Between(0, 3);
      switch (side) {
        case 0: x = Phaser.Math.Between(cam.worldView.left, cam.worldView.right); y = cam.worldView.top - offset; break;
        case 1: x = cam.worldView.right + offset; y = Phaser.Math.Between(cam.worldView.top, cam.worldView.bottom); break;
        case 2: x = Phaser.Math.Between(cam.worldView.left, cam.worldView.right); y = cam.worldView.bottom + offset; break;
        default: x = cam.worldView.left - offset; y = Phaser.Math.Between(cam.worldView.top, cam.worldView.bottom); break;
      }
    }

    x = Phaser.Math.Clamp(x, 40, map.widthInPixels * 2 - 40);
    y = Phaser.Math.Clamp(y, 40, map.heightInPixels * 2 - 40);

    const rand = Phaser.Math.Between(0, 2);
    let type: "skeleton" | "mago" | "demon";
    let textureKey: string;
    let animKey: string;
    let hp: number;

    const waveHpBonus = Math.floor((this.waveNumber - 1) * 0.5);
    const waveSpeedBonus = (this.waveNumber - 1) * 8;

    if (rand === 0) {
      type = "skeleton";
      textureKey = "scheletro_run";
      animKey = "scheletro-run";
    hp = 1 + waveHpBonus;
    } else if (rand === 1) {
      type = "mago";
      textureKey = "mago";
      animKey = "mago-idle";
      hp = 2 + waveHpBonus;
    } else {
      type = "demon";
      textureKey = "demon_run";
      animKey = "demon-run";
      hp = 4 + waveHpBonus;
    }

    const enemy = this.enemies.create(x, y, textureKey) as any;
    enemy.hp = hp;
    enemy.maxHp = enemy.hp;
    enemy.type = type;
    enemy.state = "CHASE";
    enemy.isDying = false;
    enemy.lastAttackTime = 0;
    enemy.healthBar = this.add.graphics();
    // Velocità scalata per wave
    if (type === "skeleton") {
      enemy.chaseSpeed = 120 + waveSpeedBonus;
    } else if (type === "mago") {
      enemy.chaseSpeed = 160 + waveSpeedBonus;
    } else {
      enemy.chaseSpeed = 80 + waveSpeedBonus;
    }

    if (this.hudCamera) {
      this.hudCamera.ignore(enemy);
      this.hudCamera.ignore(enemy.healthBar);
    }

    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
    enemy.setDrag(100);

    if (type === "skeleton") {
      enemy.setScale(0.8);
      enemy.setBodySize(80, 100);
      enemy.setOffset(24, 20);
    } else if (type === "mago") {
      enemy.setScale(1);
      enemy.setBodySize(40, 70);
      enemy.setOffset(18, 45);
    } else {
      enemy.setScale(0.6);
      enemy.setBodySize(80, 100);
      enemy.setOffset(24, 20);
    }

    enemy.play(animKey);
  }

  /** Applies damage to an enemy, handles death, score, drops, and hit feedback. */
  damageEnemy(e: any) {
    if (!e.active || e.isDying) return;
    e.hp -= 1;
    this.showFloatingText(e.x, e.y - 40, "-1", "#ffff00", true);
    if (e.hp <= 0) {
      e.isDying = true;
      // Scheletro/Demon: animazione morte. Altri: flash bianco e scomparsa rapida.
      if (e.type === "skeleton") {
        if (e.body) { e.body.enable = false; e.body.velocity.set(0); }
        e.clearTint();
        e.setAlpha(1);
        e.play("scheletro-dead", true);
        this.time.delayedCall(500, () => {
          if (e.healthBar) e.healthBar.destroy();
          if (e.active) e.destroy();
        });
      } else if (e.type === "mago") {
        if (e.body) { e.body.enable = false; e.body.velocity.set(0); }
        e.clearTint();
        e.setAlpha(1);
        e.play("mago-dead", true);
        this.time.delayedCall(500, () => {
          if (e.healthBar) e.healthBar.destroy();
          if (e.active) e.destroy();
        });
      } else if (e.type === "demon") {
        if (e.body) { e.body.enable = false; e.body.velocity.set(0); }
        e.clearTint();
        e.setAlpha(1);
        e.play("demon-dead", true);
        this.time.delayedCall(650, () => {
          if (e.healthBar) e.healthBar.destroy();
          if (e.active) e.destroy();
        });
      } else {
        e.setTint(0xffffff);
        e.setAlpha(0.8);
        this.time.delayedCall(150, () => {
          if (e.healthBar) e.healthBar.destroy();
          if (e.active) e.destroy();
        });
      }
      this.enemiesKilled++;
      // Score per tipo
      const pts = e.type === "demon" ? 30 : e.type === "mago" ? 20 : 10;
      this.totalScore += pts;
      this.showFloatingText(e.x, e.y - 20, `+${pts}`, "#ffd700", true);
      this.updateKillStreak();
      this.objectiveText.setText(`Obiettivo: ${this.enemiesKilled}/${this.targetKills}`);
      this.scoreText.setText(`Score: ${this.totalScore}`);
      // Drop vita (30% di probabilità)
      if (Phaser.Math.Between(0, 99) < 30) {
        this.dropHealthPickup(e.x, e.y);
      }
      if (this.enemiesKilled >= this.targetKills && !this.isGameOver) this.showEndScreen(true);
    } else {
      // Nemico colpito ma non ucciso - feedback visivo
      e.setTint(0xff0000);
      this.cameras.main.shake(80, 0.003); // Piccolo shake della camera
      
      if (e.type === "skeleton") {
        e.play("scheletro-hurt", true);
        e.once("animationcomplete-scheletro-hurt", () => { if (e.active && !e.isDying) e.play("scheletro-run", true); });
      } else if (e.type === "mago") {
        e.play("mago-hurt", true);
        e.once("animationcomplete-mago-hurt", () => { if (e.active && !e.isDying) e.play("mago-idle", true); });
      } else if (e.type === "demon") {
        e.play("demon-hurt", true);
        e.once("animationcomplete-demon-hurt", () => { if (e.active && !e.isDying) e.play("demon-walk", true); });
      }
      this.time.delayedCall(150, () => { if (e.active) e.clearTint(); });
    }
  }

  /** Redraws the player health bar based on current HP. */
  updatePlayerHealthBar() {
    this.playerHealthBar.clear();
    this.playerHealthBar.fillStyle(0x000000, 0.5);
    this.playerHealthBar.fillRect(20, 20, 200, 20);
    const color = this.player.hp > 30 ? 0x00ff00 : 0xff0000;
    this.playerHealthBar.fillStyle(color, 1);
    this.playerHealthBar.fillRect(20, 20, (this.player.hp / 100) * 200, 20);
  }

  /** Redraws an enemy health bar above the enemy sprite. */
  updateEnemyHealthBar(enemy: any) {
    enemy.healthBar.clear();
    if (enemy.hp <= 0) return;
    const x = enemy.x - 25;
    const y = enemy.y - 55;
    enemy.healthBar.fillStyle(0x000000, 0.5);
    enemy.healthBar.fillRect(x, y, 50, 6);
    enemy.healthBar.fillStyle(0xff0000, 1);
    enemy.healthBar.fillRect(x, y, (enemy.hp / enemy.maxHp) * 50, 6);
  }

  /** Displays end-of-wave or game-over overlay with restart/next actions. */
  showEndScreen(victory: boolean) {
    this.isGameOver = true;
    this.physics.pause();
    this.enemyBullets.clear(true, true);
    this.player.setTint(victory ? 0x00ff00 : 0xff0000);
    const overlay = this.add.rectangle(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2, GameData.globals.gameWidth, GameData.globals.gameHeight, 0x000000, 0.7).setScrollFactor(0).setDepth(2000);
    const title = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2 - 120, victory ? "🏆 VITTORIA!" : "💀 GAME OVER", { fontSize: "60px", color: victory ? "#00ff00" : "#ff0000", stroke: "#000000", strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    const waveMsg = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2 - 50, `Wave ${this.waveNumber}  |  Score: ${this.totalScore}`, { fontSize: "28px", color: "#ffaa00" }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    const msg = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2, `Nemici sconfitti: ${this.enemiesKilled}`, { fontSize: "26px", color: "#ffffff" }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    const btnRestart = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2 + 70, " RIAVVIA ", { fontSize: "32px", color: "#ffffff", backgroundColor: "#00aa00", padding: { x: 20, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(2001).setInteractive({ useHandCursor: true });
    btnRestart.on("pointerover", function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#00cc00"); });
    btnRestart.on("pointerout", function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#00aa00"); });
    btnRestart.on("pointerdown", () => {
      if (this.bgMusic) this.bgMusic.stop();
      this.scene.restart();
    });
    const btnAction = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2 + 150, victory ? " PROSSIMA WAVE ▶ " : " MENU PRINCIPALE ", { fontSize: "32px", color: "#ffffff", backgroundColor: "#333333", padding: { x: 20, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(2001).setInteractive({ useHandCursor: true });
    btnAction.on("pointerover", function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#555555"); });
    btnAction.on("pointerout", function(this: Phaser.GameObjects.Text) { this.setBackgroundColor("#333333"); });

    this.cameras.main.ignore(overlay);
    this.cameras.main.ignore(title);
    this.cameras.main.ignore(waveMsg);
    this.cameras.main.ignore(msg);
    this.cameras.main.ignore(btnRestart);
    this.cameras.main.ignore(btnAction);

    btnAction.on("pointerdown", () => {
      if (victory) {
        this.waveNumber++;
        this.targetKills += 20;
        this.isGameOver = false;
        this.physics.resume();
        overlay.destroy(); title.destroy(); waveMsg.destroy(); msg.destroy(); btnRestart.destroy(); btnAction.destroy();
        this.objectiveText.setText(`Obiettivo: ${this.enemiesKilled}/${this.targetKills}`);
        this.waveText.setText(`Wave ${this.waveNumber}`);
        this.showWaveBanner(this.waveNumber);
      } else {
        if (this.bgMusic) this.bgMusic.stop();
        this.scene.start("Menu");
      }
    });
  }

  /** Per-enemy AI dispatcher: skeleton / mago / demon. */
  private updateEnemyAI(enemy: any, time: number) {
    if (this.isGameOver || this.isPaused || enemy.isDying) return;

    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);

    switch (enemy.type) {
      case "skeleton":
        this.updateSkeletonAI(enemy, dist, angle, time);
        break;
      case "mago":
        this.updateMagoAI(enemy, dist, angle, time);
        break;
      case "demon":
        this.updateDemonAI(enemy, dist, angle, time);
        break;
    }

    enemy.setFlipX(this.player.x < enemy.x); // Guarda sempre il player
    this.updateEnemyHealthBar(enemy);
  }

  /** Skeleton AI: chase, dash attack when close, idle when too near. */
  private updateSkeletonAI(enemy: any, dist: number, angle: number, time: number) {
    if (dist < 120 && time > enemy.lastAttackTime + 2000) {
      enemy.lastAttackTime = time;
      this.physics.velocityFromRotation(angle, 400 + (enemy.chaseSpeed - 120) * 0.5, enemy.body.velocity);
      enemy.setTint(0xffaa00);
      enemy.play("scheletro-run-attack", true);
      this.time.delayedCall(300, () => { if (enemy.active) enemy.clearTint(); });
    } else if (dist > 30) {
      this.physics.moveToObject(enemy, this.player, enemy.chaseSpeed);
      const cur = enemy.anims?.currentAnim?.key;
      const busy = !!enemy.anims?.isPlaying && (cur === "scheletro-run-attack" || cur === "scheletro-attack-1" || cur === "scheletro-attack-2" || cur === "scheletro-attack-3" || cur === "scheletro-hurt" || cur === "scheletro-dead");
      const desired = enemy.chaseSpeed >= 170 ? "scheletro-run" : "scheletro-walk";
      if (!busy && cur !== desired) enemy.play(desired, true);
    } else {
      if (enemy.body) enemy.body.velocity.set(0);
      const cur = enemy.anims?.currentAnim?.key;
      const busy = !!enemy.anims?.isPlaying && (cur === "scheletro-run-attack" || cur === "scheletro-attack-1" || cur === "scheletro-attack-2" || cur === "scheletro-attack-3" || cur === "scheletro-hurt" || cur === "scheletro-dead");
      if (!busy && cur !== "scheletro-idle") enemy.play("scheletro-idle", true);
    }
  }

  /** Mago AI: strafes around optimal range and shoots with cooldown. */
  private updateMagoAI(enemy: any, dist: number, angle: number, time: number) {
    // Inizializza la direzione di strafe se non esiste
    if (enemy.strafeDir === undefined) {
      enemy.strafeDir = 1;
      enemy.strafeChangeTime = 0;
    }
    // Alterna la direzione di strafe ogni 1.5-2.5 secondi
    if (time > enemy.strafeChangeTime) {
      enemy.strafeDir *= -1;
      enemy.strafeChangeTime = time + Phaser.Math.Between(1500, 2500);
    }

    let didShoot = false;
    const cur = enemy.anims?.currentAnim?.key;
    const busy = !!enemy.anims?.isPlaying && (cur === "mago-attack-1" || cur === "mago-attack-2" || cur === "mago-charge" || cur === "mago-hurt" || cur === "mago-dead");

    if (dist > 380) {
      // Troppo lontano: si avvicina veloce e spara in movimento
      this.physics.moveToObject(enemy, this.player, enemy.chaseSpeed);
      if (time > enemy.lastAttackTime + Phaser.Math.Between(1800, 2800)) {
        enemy.lastAttackTime = time;
        didShoot = true;
        this.enemyShoot(enemy);
      }
    } else if (dist < 200) {
      // Troppo vicino: scappa rapidamente in diagonale
      const escapeAngle = angle + enemy.strafeDir * 0.4;
      this.physics.velocityFromRotation(escapeAngle, -(enemy.chaseSpeed + 40), enemy.body.velocity);
      // Spara anche mentre scappa
      if (time > enemy.lastAttackTime + Phaser.Math.Between(800, 1500)) {
        enemy.lastAttackTime = time;
        didShoot = true;
        this.enemyShoot(enemy);
      }
    } else {
      // Distanza ottimale (200-380): strafing alternato + tiro frequente
      const strafeAngle = angle + (Math.PI / 2) * enemy.strafeDir;
      const strafeSpeed = 80 + (enemy.chaseSpeed - 160) * 0.5;
      enemy.body.velocity.set(Math.cos(strafeAngle) * strafeSpeed, Math.sin(strafeAngle) * strafeSpeed);

      if (time > enemy.lastAttackTime + Phaser.Math.Between(900, 2000)) {
        enemy.lastAttackTime = time;
        didShoot = true;
        this.enemyShoot(enemy);
      }
    }

    // Animazione movimento (se non sta facendo attacchi/hurt/dead)
    if (!busy && !didShoot) {
      const speed = enemy.body?.velocity ? enemy.body.velocity.length() : 0;
      const desired = speed > 30 ? "mago-run" : "mago-idle";
      if (cur !== desired) enemy.play(desired, true);
    }
  }

  /** Demon AI: chases and occasionally charges (jump) at mid-range. */
  private updateDemonAI(enemy: any, dist: number, angle: number, time: number) {
    // Il demone carica se è a media distanza
    if (enemy.state === "CHARGE") {
      // Sta già caricando, non cambiare velocità finché non finisce
      return;
    }

    if (dist > 150 && dist < 400 && time > enemy.lastAttackTime + 4000) {
      enemy.state = "CHARGE";
      enemy.lastAttackTime = time;
      enemy.setTint(0xff00ff);
      enemy.play("demon-jump", true);
      this.physics.velocityFromRotation(angle, 500 + (enemy.chaseSpeed - 80) * 2, enemy.body.velocity);
      
      this.time.delayedCall(1000, () => {
        if (enemy.active) {
          enemy.state = "CHASE";
          enemy.clearTint();
          const desired = enemy.chaseSpeed >= 120 ? "demon-run" : "demon-walk";
          enemy.play(desired, true);
        }
      });
    } else {
      this.physics.moveToObject(enemy, this.player, enemy.chaseSpeed);
      const cur = enemy.anims?.currentAnim?.key;
      const busy = !!enemy.anims?.isPlaying && (cur === "demon-jump" || cur === "demon-attack-1" || cur === "demon-attack-2" || cur === "demon-attack-3" || cur === "demon-hurt" || cur === "demon-dead");
      const desired = enemy.chaseSpeed >= 120 ? "demon-run" : "demon-walk";
      if (!busy && cur !== desired) enemy.play(desired, true);
    }
  }

  /** Enemy ranged attack (mago uses animated projectile; others use generic bullet). */
  enemyShoot(enemy: any) {
    if (this.isGameOver || this.isPaused) return;
    
    // Mago: usa l'animazione Charge_1 come proiettile (al posto di arrow_1.png)
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);

    if (enemy.type === "mago") {
      const atkKey = Phaser.Math.Between(1, 2) === 1 ? "mago-attack-1" : "mago-attack-2";
      enemy.play(atkKey, true);
      enemy.once(`animationcomplete-${atkKey}`, () => {
        if (!enemy.active || enemy.isDying) return;
        const v = enemy.body?.velocity ? enemy.body.velocity.length() : 0;
        enemy.play(v > 30 ? "mago-run" : "mago-idle", true);
      });

      const bullet = this.enemyBullets.create(enemy.x, enemy.y, "mago_charge_1") as any;
      if (this.hudCamera) this.hudCamera.ignore(bullet);
      bullet.setScale(1);
      // Colore magico blu per il mago
      bullet.setTint(0x2aa8ff);
      if (bullet.anims) bullet.play("mago-projectile", true);

      const speed = 300;
      bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      bullet.setRotation(angle);
      
      // Configura il body per collisioni migliori
      if (bullet.body) {
        bullet.setCircle(15);
      }
      
      // Distruggi dopo 3 secondi
      this.time.delayedCall(3000, () => {
        if (bullet && bullet.active) bullet.destroy();
      });

      enemy.setTint(0x2aa8ff);
      this.time.delayedCall(200, () => { if (enemy.active) enemy.clearTint(); });
      return;
    }

    // (fallback) proiettile generico
    const bullet = this.enemyBullets.create(enemy.x, enemy.y, "arrow_1") as any;
    
    if (this.hudCamera) this.hudCamera.ignore(bullet);
    
    bullet.setScale(1);
    bullet.setTint(0xff0000); // Proiettili nemici rossi
    
    const speed = 300;
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    // `arrow_1.png` e' disegnata "verso l'alto": aggiustiamo la rotazione per puntare verso il target.
    bullet.setRotation(angle + Math.PI / 2);
    
    // Configura il body per collisioni migliori
    if (bullet.body) {
      bullet.setCircle(12);
    }
    
    // Distruggi dopo 3 secondi
    this.time.delayedCall(3000, () => {
      if (bullet && bullet.active) bullet.destroy();
    });
    
    // Effetto visivo "flash" quando spara
    enemy.setTint(0xffff00);
    this.time.delayedCall(200, () => {
      if (enemy.active) enemy.clearTint();
    });
  }

  /** Main game loop: input handling, player movement/attack, enemy AI, and post FX updates. */
  update(time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) this.startDash();
    if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
      this.currentAbility = this.currentAbility === "punch" ? "shoot" : "punch";
      this.abilityText.setText(`Abilità: ${this.currentAbility === "punch" ? "PUGNO" : "SPARO"} [TAB/LMB]`);
    }

    const isAttacking = this.player.anims.currentAnim &&
      (this.player.anims.currentAnim.key === "player-attack-1" ||
       this.player.anims.currentAnim.key === "player-attack-2" ||
       this.player.anims.currentAnim.key === "player-attack-3") &&
      this.player.anims.isPlaying;

    if (this.isDashing) {
      // Durante lo scatto non accettiamo input di movimento / attacco.
    } else if (isAttacking) {
      body.setVelocity(0);
    } else {
      let dx = 0;
      let dy = 0;
      if (this.cursors.left.isDown || this.wasd.left.isDown) dx = -1;
      else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
      if (this.cursors.up.isDown || this.wasd.up.isDown) dy = -1;
      else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        this.lastDirection.set(dx / len, dy / len);
        body.setVelocity(dx * this.normalSpeed, dy * this.normalSpeed);
        this.setPlayerFlipX(dx < 0);
        this.player.anims.play("player-walk", true);
      } else {
        body.setVelocity(0);
        this.player.anims.play("player-idle", true);
      }

      if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this.performAttack();
        return;
      }
    }

    this.enemies.getChildren().forEach((enemy: any) => {
      this.updateEnemyAI(enemy, time);
    });
  }

  /** Mirrors the player sprite and adjusts the physics body offset to match. */
  private setPlayerFlipX(flip: boolean) {
    this.player.setFlipX(flip);
    const bodyOffsetX = 15;
    const bodyWidth = 30;
    const bodyOffsetY = 68;
    if (flip) {
      this.player.setOffset(this.player.width - bodyWidth - bodyOffsetX, bodyOffsetY);
    } else {
      this.player.setOffset(bodyOffsetX, bodyOffsetY);
    }
  }

  /** Performs a short dash in the last movement/aim direction with cooldown. */
  startDash() {
    if (!this.canDash || this.isDashing) return;
    if (this.isGameOver || this.isPaused) return;

    this.isDashing = true;
    this.canDash = false;
    this.dashText.setText("Scatto: ATTIVO!").setColor("#2aa8ff");
    this.player.setAlpha(0.7);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(this.lastDirection.x * this.dashSpeed, this.lastDirection.y * this.dashSpeed);

    this.time.delayedCall(this.dashDurationMs, () => {
      this.isDashing = false;
      this.player.setAlpha(1);
      this.dashText.setText("Scatto: COOLDOWN...").setColor("#ff0000");

      this.time.delayedCall(this.dashCooldownMs, () => {
        this.canDash = true;
        this.dashText.setText("Scatto: PRONTO [SHIFT]").setColor("#00ff00");
      });
    });
  }

  // --- Metodi nuovi ---

  /** Spawns a transient floating text, either in world space or HUD space. */
  showFloatingText(x: number, y: number, text: string, color: string, worldSpace: boolean) {
    const txt = this.add.text(x, y, text, {
      fontSize: "22px",
      color: color,
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(1500);
    if (worldSpace) {
      // Visibile nella scena world, nascosto dalla hudCamera
      if (this.hudCamera) this.hudCamera.ignore(txt);
    } else {
      txt.setScrollFactor(0);
      this.cameras.main.ignore(txt);
    }
    this.tweens.add({
      targets: txt,
      y: y - 60,
      alpha: 0,
      duration: 900,
      ease: "Power1",
      onComplete: () => txt.destroy(),
    });
  }

  /** Drops a health pickup at the given world position. */
  dropHealthPickup(x: number, y: number) {
    const pickup = this.healthPickups.create(x, y, "phaser") as any;
    pickup.setTint(0x00ff44);
    pickup.setScale(0.14);
    pickup.setBounce(0.4);
    pickup.setCollideWorldBounds(true);
    if (this.hudCamera) this.hudCamera.ignore(pickup);
    // Piccolo tween di "pop" per renderlo visibile
    this.tweens.add({ targets: pickup, scaleX: 0.18, scaleY: 0.18, duration: 150, yoyo: true });
  }

  /** Shows a wave banner overlay for a short duration. */
  showWaveBanner(wave: number) {
    const cx = GameData.globals.gameWidth / 2;
    const cy = GameData.globals.gameHeight / 2;
    const txt = this.add.text(cx, cy, `⚔  WAVE ${wave}  ⚔`, {
      fontSize: "72px",
      color: "#ffaa00",
      stroke: "#000000",
      strokeThickness: 7,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2500).setAlpha(0);
    this.cameras.main.ignore(txt);
    this.tweens.add({
      targets: txt,
      alpha: 1,
      duration: 350,
      yoyo: true,
      hold: 1000,
      onComplete: () => txt.destroy(),
    });
  }

  /** Updates the kill-streak counter and score multiplier window. */
  updateKillStreak() {
    const now = this.time.now;
    if (now - this.lastKillTime < 2000) {
      this.killStreak++;
      if (this.killStreak >= 2) {
        this.showStreakText(`x${this.killStreak} COMBO! 🔥`);
      }
    } else {
      this.killStreak = 1;
    }
    this.lastKillTime = now;
  }

  /** Shows a kill-streak/combo text overlay (HUD). */
  showStreakText(text: string) {
    const cx = GameData.globals.gameWidth / 2;
    const cy = GameData.globals.gameHeight / 2 - 120;
    const txt = this.add.text(cx, cy, text, {
      fontSize: "34px",
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1600).setAlpha(0);
    this.cameras.main.ignore(txt);
    this.tweens.add({
      targets: txt,
      alpha: 1,
      y: cy - 25,
      duration: 250,
      yoyo: true,
      hold: 600,
      onComplete: () => txt.destroy(),
    });
  }
}
