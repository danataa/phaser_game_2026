import { GameData } from "../GameData";

export default class GamePlay extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite & { hp: number; isInvulnerable: boolean };
  private enemies: Phaser.Physics.Arcade.Group;
  private bullets: Phaser.Physics.Arcade.Group;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Phaser.Types.Input.Keyboard.CursorKeys;
  private tabKey: Phaser.Input.Keyboard.Key;
  private shiftKey: Phaser.Input.Keyboard.Key;
  
  // UI
  private playerHealthBar: Phaser.GameObjects.Graphics;
  private abilityText: Phaser.GameObjects.Text;
  private sprintText: Phaser.GameObjects.Text;
  private objectiveText: Phaser.GameObjects.Text;
  private hudElements: Phaser.GameObjects.Group;
  private hudCamera: Phaser.Cameras.Scene2D.Camera;

  // Game Logic
  private currentAbility: "punch" | "shoot" = "punch";
  private isSprinting: boolean = false;
  private canSprint: boolean = true;
  private normalSpeed: number = 200;
  private sprintSpeed: number = 400;
  
  private enemiesKilled: number = 0;
  private targetKills: number = 15;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private spawnEvent: Phaser.Time.TimerEvent;
  private bgMusic: Phaser.Sound.BaseSound;
  
  // Effetto Luce/Vignette
  private lightOverlay: Phaser.GameObjects.RenderTexture;
  
  // UI
  private pauseOverlay: Phaser.GameObjects.Container;
  
  private lastDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private escKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "GamePlay" });
  }

  create() {
    this.isGameOver = false;
    this.enemiesKilled = 0;
    this.lastDirection.set(1, 0);
    this.cameras.main.setBackgroundColor(0x000000);

    const map = this.add.tilemap("tilemap_0");
    const tileset = map.addTilesetImage("mainlevbuild", "tileset_0");
    const floor = map.createLayer("floor", tileset, 0, 0);
    const collideLayer = map.createLayer("wall", tileset, 0, 0);
    
    floor.setScale(2);
    collideLayer.setScale(2);
    collideLayer.setCollisionByProperty({ collide: true });
    
    this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);

    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();

    this.player = this.physics.add.sprite(200, 200, "player") as any;
    this.player.hp = 100;
    this.player.isInvulnerable = false;
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(30, 30);
    this.player.setOffset(26, 35);
    this.physics.add.collider(this.player, collideLayer);

    // Inizializza effetto Luce/Vignette (RenderTexture grande come lo schermo)
    this.lightOverlay = this.add.renderTexture(0, 0, GameData.globals.gameWidth, GameData.globals.gameHeight)
      .setDepth(9999)
      .setScrollFactor(0);
    
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
    this.hudCamera.ignore(collideLayer);
    this.hudCamera.ignore(this.player);
    this.hudCamera.ignore(this.lightOverlay);
    if (this.physics.world.debugGraphic) {
      this.hudCamera.ignore(this.physics.world.debugGraphic);
    }

    this.cameras.main.ignore(this.playerHealthBar);
    this.cameras.main.ignore(this.abilityText);
    this.cameras.main.ignore(this.sprintText);
    this.cameras.main.ignore(this.objectiveText);
    this.cameras.main.ignore(this.pauseOverlay);

    if (!this.anims.exists("mago-idle")) {
      this.anims.create({
        key: "mago-idle",
        frames: this.anims.generateFrameNumbers("mago", { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("scheletro-run")) {
      this.anims.create({
        key: "scheletro-run",
        frames: this.anims.generateFrameNumbers("scheletro_run", { start: 0, end: 6 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists("demon-run")) {
      this.anims.create({
        key: "demon-run",
        frames: this.anims.generateFrameNumbers("demon_run", { start: 0, end: 6 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    for (let i = 0; i < 5; i++) {
      this.spawnEnemy(map, true);
    }

    this.spawnEvent = this.time.addEvent({
      delay: Phaser.Math.Between(2000, 4000),
      callback: () => {
        if (!this.isGameOver) {
          this.spawnEnemy(map, true);
          this.spawnEvent.reset({
            delay: Phaser.Math.Between(2000, 4000),
            callback: this.spawnEvent.callback,
            callbackScope: this
          });
        }
      },
      callbackScope: this,
      loop: true
    });

    this.physics.add.collider(this.enemies, collideLayer);
    this.physics.add.collider(this.bullets, collideLayer, (b: any) => b.destroy());
    
    this.physics.add.overlap(this.bullets, this.enemies, (b: any, e: any) => {
      b.destroy();
      this.damageEnemy(e);
    });

    this.physics.add.collider(this.player, this.enemies, (p, e) => {
      if (!this.player.isInvulnerable && !this.isGameOver) {
        this.player.hp -= 10;
        this.player.isInvulnerable = true;
        this.player.setTint(0xff0000);
        this.updatePlayerHealthBar();
        if (this.player.hp <= 0) this.showEndScreen(false);
        else {
          this.time.delayedCall(1000, () => {
            this.player.isInvulnerable = false;
            this.player.clearTint();
          });
        }
      }
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
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.physics.pause();
      this.pauseOverlay.setVisible(true);
      this.player.anims.pause();
      this.enemies.getChildren().forEach((e: any) => e.anims.pause());
      this.spawnEvent.paused = true;
      if (this.bgMusic) this.bgMusic.pause();
    } else {
      this.physics.resume();
      this.pauseOverlay.setVisible(false);
      this.player.anims.resume();
      this.enemies.getChildren().forEach((e: any) => e.anims.resume());
      this.spawnEvent.paused = false;
      if (this.bgMusic) this.bgMusic.resume();
    }
  }

  setupPauseUI() {
    const bg = this.add.rectangle(0, 0, GameData.globals.gameWidth, GameData.globals.gameHeight, 0x000000, 0.5).setOrigin(0);
    const text = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2, "PAUSA", { fontSize: "64px", color: "#ffffff" }).setOrigin(0.5);
    const subText = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2 + 80, "Premi ESC per continuare", { fontSize: "24px", color: "#ffffff" }).setOrigin(0.5);
    this.pauseOverlay = this.add.container(0, 0, [bg, text, subText]).setScrollFactor(0).setDepth(3000).setVisible(false);
  }

  performAttack() {
    if (this.isGameOver || this.isPaused) return;
    
    const pointer = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
    this.lastDirection.set(Math.cos(angle), Math.sin(angle));
    this.player.setFlipX(pointer.worldX < this.player.x);

    if (this.currentAbility === "punch") {
      this.player.anims.play("punch", true);
      this.enemies.getChildren().forEach((e: any) => {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
        if (distance < 100) this.damageEnemy(e);
      });
    } else {
      this.player.anims.play("shoot", true);
      const bullet = this.bullets.create(this.player.x, this.player.y, "phaser") as any;
      if (this.hudCamera) this.hudCamera.ignore(bullet);
      bullet.setScale(0.1);
      bullet.setVelocity(this.lastDirection.x * 500, this.lastDirection.y * 500);
      bullet.setRotation(angle);
    }
  }

  setupUI() {
    this.playerHealthBar = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.updatePlayerHealthBar();
    this.abilityText = this.add.text(20, 50, "Abilità: PUGNO [TAB/LMB]", { fontSize: "20px", color: "#ffffff" }).setScrollFactor(0).setDepth(1000);
    this.sprintText = this.add.text(20, 80, "Sprint: PRONTO [SHIFT]", { fontSize: "20px", color: "#00ff00" }).setScrollFactor(0).setDepth(1000);
    this.objectiveText = this.add.text(GameData.globals.gameWidth - 300, 20, `Obiettivo: 0/${this.targetKills}`, { fontSize: "24px", color: "#ffffff", backgroundColor: "#00000066" }).setScrollFactor(0).setDepth(1000);
  }

  setupPlayerAnims() {
    if (!this.anims.exists("walk")) {
      this.anims.create({ key: "walk",  frames: this.anims.generateFrameNumbers("player", { start: 10, end: 17 }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: "punch", frames: this.anims.generateFrameNumbers("player", { start: 41, end: 42 }), frameRate: 15, repeat: 0 });
      this.anims.create({ key: "shoot", frames: this.anims.generateFrameNumbers("player", { start: 7,  end: 10 }), frameRate: 15, repeat: 0 });
    }
  }

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

    if (rand === 0) {
      type = "skeleton";
      textureKey = "scheletro_run";
      animKey = "scheletro-run";
      hp = 2;
    } else if (rand === 1) {
      type = "mago";
      textureKey = "mago";
      animKey = "mago-idle";
      hp = 3;
    } else {
      type = "demon";
      textureKey = "demon_run";
      animKey = "demon-run";
      hp = 5;
    }

    const enemy = this.enemies.create(x, y, textureKey) as any;
    enemy.hp    = hp;
    enemy.maxHp = enemy.hp;
    enemy.healthBar = this.add.graphics();

    if (this.hudCamera) {
      this.hudCamera.ignore(enemy);
      this.hudCamera.ignore(enemy.healthBar);
    }

    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
    enemy.setDrag(100);

    if (type === "skeleton") {
      enemy.setScale(0.6);
      enemy.setBodySize(80, 100);
      enemy.setOffset(24, 20);
    } else if (type === "mago") {
      enemy.setScale(0.5);
      enemy.setBodySize(60, 60);
      enemy.setOffset(65, 80);
    } else {
      enemy.setScale(0.6);
      enemy.setBodySize(80, 100);
      enemy.setOffset(24, 20);
    }

    enemy.play(animKey);
  }

  damageEnemy(e: any) {
    e.hp -= 1;
    e.setTint(0xff0000);
    this.time.delayedCall(200, () => e.clearTint());
    if (e.hp <= 0) {
      e.healthBar.destroy();
      e.destroy();
      this.enemiesKilled++;
      this.objectiveText.setText(`Obiettivo: ${this.enemiesKilled}/${this.targetKills}`);
      if (this.enemiesKilled >= this.targetKills && !this.isGameOver) this.showEndScreen(true);
    }
  }

  updatePlayerHealthBar() {
    this.playerHealthBar.clear();
    this.playerHealthBar.fillStyle(0x000000, 0.5);
    this.playerHealthBar.fillRect(20, 20, 200, 20);
    const color = this.player.hp > 30 ? 0x00ff00 : 0xff0000;
    this.playerHealthBar.fillStyle(color, 1);
    this.playerHealthBar.fillRect(20, 20, (this.player.hp / 100) * 200, 20);
  }

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

  showEndScreen(victory: boolean) {
    this.isGameOver = true;
    this.physics.pause();
    this.player.setTint(victory ? 0x00ff00 : 0xff0000);
    const overlay = this.add.rectangle(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2, GameData.globals.gameWidth, GameData.globals.gameHeight, 0x000000, 0.7).setScrollFactor(0).setDepth(2000);
    const title = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2 - 100, victory ? "VITTORIA!" : "GAME OVER", { fontSize: "60px", color: victory ? "#00ff00" : "#ff0000" }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    const msg = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2 - 20, `Nemici sconfitti: ${this.enemiesKilled}`, { fontSize: "30px", color: "#ffffff" }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    const btnRestart = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2 + 60, " RIAVVIA GIOCO ", { fontSize: "32px", color: "#ffffff", backgroundColor: "#00aa00", padding: { x: 20, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(2001).setInteractive({ useHandCursor: true });
    btnRestart.on("pointerdown", () => {
      if (this.bgMusic) this.bgMusic.stop();
      this.scene.restart();
    });
    const btnAction = this.add.text(GameData.globals.gameWidth / 2, GameData.globals.gameHeight / 2 + 140, victory ? " CONTINUA (Endless) " : " TORNA AL MENU ", { fontSize: "32px", color: "#ffffff", backgroundColor: "#333333", padding: { x: 20, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(2001).setInteractive({ useHandCursor: true });

    this.cameras.main.ignore(overlay);
    this.cameras.main.ignore(title);
    this.cameras.main.ignore(msg);
    this.cameras.main.ignore(btnRestart);
    this.cameras.main.ignore(btnAction);

    btnAction.on("pointerdown", () => {
      if (victory) {
        this.isGameOver = false;
        this.physics.resume();
        overlay.destroy(); title.destroy(); msg.destroy(); btnRestart.destroy(); btnAction.destroy();
        this.targetKills += 20;
        this.objectiveText.setText(`Obiettivo: ${this.enemiesKilled}/${this.targetKills}`);
      } else {
        if (this.bgMusic) this.bgMusic.stop();
        this.scene.start("Intro");
      }
    });
  }

  private updateLightEffect() {
    this.lightOverlay.clear();
    // 1. Riempie tutto di buio (alpha 0.85)
    this.lightOverlay.fill(0x000000, 0.85);

    const cam = this.cameras.main;
    // 2. Calcola le coordinate del player a schermo
    const screenX = (this.player.x - cam.worldView.x) * cam.zoom;
    const screenY = (this.player.y - cam.worldView.y) * cam.zoom;

    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 3. "Scava" un buco nella RenderTexture con un gradiente
    const innerRadius = 150;
    const outerRadius = 280;
    const steps = 15;
    
    for (let r = outerRadius; r >= 0; r -= (outerRadius / steps)) {
      // Per ERASE, il colore non importa, conta solo l'alpha
      let alpha = 1;
      if (r > innerRadius) {
        alpha = 1 - ((r - innerRadius) / (outerRadius - innerRadius));
      }
      gfx.fillStyle(0xffffff, alpha);
      gfx.fillCircle(screenX, screenY, r);
    }
    
    // Applica ERASE alla RenderTexture
    this.lightOverlay.erase(gfx);

    // 4. Aggiungi un alone caldo sopra (opzionale ma chiesto nel prompt precedente)
    // Usiamo blendMode normal per aggiungere colore
    gfx.clear();
    gfx.fillStyle(0xffe8c0, 0.1); // Molto tenue
    gfx.fillCircle(screenX, screenY, innerRadius);
    this.lightOverlay.draw(gfx);

    gfx.destroy();
  }

  update(time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) return;
    this.updateLightEffect();
    const currentSpeed = this.isSprinting ? this.sprintSpeed : this.normalSpeed;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && this.canSprint) this.startSprint();
    if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
      this.currentAbility = this.currentAbility === "punch" ? "shoot" : "punch";
      this.abilityText.setText(`Abilità: ${this.currentAbility === "punch" ? "PUGNO" : "SPARO"} [TAB/LMB]`);
    }

    const isAttacking = this.player.anims.currentAnim &&
      (this.player.anims.currentAnim.key === "punch" || this.player.anims.currentAnim.key === "shoot") &&
      this.player.anims.isPlaying;

    if (isAttacking) {
      body.setVelocity(0);
    } else {
      let dx = 0; let dy = 0;
      if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -1;
      else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
      if (this.cursors.up.isDown   || this.wasd.up.isDown)   dy = -1;
      else if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy = 1;

      if (dx !== 0 || dy !== 0) {
        body.setVelocity(dx * currentSpeed, dy * currentSpeed);
        if (!isAttacking) this.player.setFlipX(dx < 0);
        this.player.anims.play("walk", true);
      } else {
        body.setVelocity(0);
        this.player.anims.stop();
        this.player.setFrame(0);
      }

      if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this.performAttack();
        return;
      }
    }

    this.enemies.getChildren().forEach((enemy: any) => {
      this.physics.moveToObject(enemy, this.player, 100);
      enemy.setFlipX(enemy.body.velocity.x < 0);
      this.updateEnemyHealthBar(enemy);
    });
  }

  startSprint() {
    this.isSprinting = true;
    this.canSprint = false;
    this.sprintText.setText("Sprint: ATTIVO!").setColor("#ffff00");
    this.player.setAlpha(0.7);
    this.time.delayedCall(5000, () => {
      this.isSprinting = false;
      this.player.setAlpha(1);
      this.sprintText.setText("Sprint: COOLDOWN...").setColor("#ff0000");
      this.time.delayedCall(5000, () => {
        this.canSprint = true;
        this.sprintText.setText("Sprint: PRONTO [SHIFT]").setColor("#00ff00");
      });
    });
  }
}