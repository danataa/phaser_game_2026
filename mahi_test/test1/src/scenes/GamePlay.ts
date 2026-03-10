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
  private sprintText: Phaser.GameObjects.Text;
  private objectiveText: Phaser.GameObjects.Text;
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

  // Pause
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
    this.enemyBullets = this.physics.add.group();
    this.enemies = this.physics.add.group();

    this.player = this.physics.add.sprite(200, 200, "player") as any;
    this.player.hp = 100;
    this.player.isInvulnerable = false;
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(30, 30);
    this.player.setOffset(26, 35);
    this.physics.add.collider(this.player, collideLayer);

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
    this.physics.add.collider(this.enemyBullets, collideLayer, (b: any) => b.destroy());

    this.physics.add.overlap(this.bullets, this.enemies, (b: any, e: any) => {
      b.destroy();
      this.damageEnemy(e);
    });

    this.physics.add.overlap(this.enemyBullets, this.player, (p: any, b: any) => {
      b.destroy();
      this.handlePlayerDamage();
    });

    this.physics.add.collider(this.player, this.enemies, (p, e) => {
      this.handlePlayerDamage();
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

  handlePlayerDamage() {
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
  }

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
      this.anims.create({ key: "walk", frames: this.anims.generateFrameNumbers("player", { start: 10, end: 17 }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: "punch", frames: this.anims.generateFrameNumbers("player", { start: 41, end: 42 }), frameRate: 15, repeat: 0 });
      this.anims.create({ key: "shoot", frames: this.anims.generateFrameNumbers("player", { start: 7, end: 10 }), frameRate: 15, repeat: 0 });
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
    enemy.hp = hp;
    enemy.maxHp = enemy.hp;
    enemy.type = type;
    enemy.state = "CHASE";
    enemy.lastAttackTime = 0;
    enemy.healthBar = this.add.graphics();

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
    this.enemyBullets.clear(true, true);
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

  private updateEnemyAI(enemy: any, time: number) {
    if (this.isGameOver || this.isPaused) return;

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

  private updateSkeletonAI(enemy: any, dist: number, angle: number, time: number) {
    // Lo scheletro insegue e quando è vicino fa un piccolo scatto (lunge)
    if (dist < 120 && time > enemy.lastAttackTime + 2000) {
      // Attacco Lunge
      enemy.lastAttackTime = time;
      this.physics.velocityFromRotation(angle, 400, enemy.body.velocity);
      enemy.setTint(0xffaa00);
      this.time.delayedCall(300, () => enemy.clearTint());
    } else if (dist > 30) {
      this.physics.moveToObject(enemy, this.player, 120);
    }
  }

  private updateMagoAI(enemy: any, dist: number, angle: number, time: number) {
    // IA "Smart": mantiene distanza e si muove in modo intelligente
    if (dist > 400) {
      // Troppo lontano, si avvicina
      this.physics.moveToObject(enemy, this.player, 120);
    } else if (dist < 250) {
      // Troppo vicino, scappa via dal player
      this.physics.velocityFromRotation(angle, -150, enemy.body.velocity);
    } else {
      // Distanza ottimale (250-400), si muove un po' lateralmente (strafing)
      // Aggiunge un movimento perpendicolare (strafing)
      const strafeAngle = angle + Math.PI / 2;
      enemy.body.velocity.set(Math.cos(strafeAngle) * 50, Math.sin(strafeAngle) * 50);

      // Spara se pronto
      if (time > enemy.lastAttackTime + Phaser.Math.Between(1500, 3000)) {
        enemy.lastAttackTime = time;
        this.enemyShoot(enemy);
      }
    }
  }

  private updateDemonAI(enemy: any, dist: number, angle: number, time: number) {
    // Il demone carica se è a media distanza
    if (enemy.state === "CHARGE") {
      // Sta già caricando, non cambiare velocità finché non finisce
      return;
    }

    if (dist > 150 && dist < 400 && time > enemy.lastAttackTime + 4000) {
      // Inizia carica
      enemy.state = "CHARGE";
      enemy.lastAttackTime = time;
      enemy.setTint(0xff00ff);
      this.physics.velocityFromRotation(angle, 500, enemy.body.velocity);
      
      this.time.delayedCall(1000, () => {
        enemy.state = "CHASE";
        enemy.clearTint();
      });
    } else {
      this.physics.moveToObject(enemy, this.player, 80);
    }
  }

  enemyShoot(enemy: any) {
    if (this.isGameOver || this.isPaused) return;
    
    // Spara verso il player
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const bullet = this.enemyBullets.create(enemy.x, enemy.y, "phaser") as any;
    
    if (this.hudCamera) this.hudCamera.ignore(bullet);
    
    bullet.setScale(0.1);
    bullet.setTint(0xff0000); // Proiettili nemici rossi
    
    const speed = 300;
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    bullet.setRotation(angle);
    
    // Effetto visivo "flash" sul mago quando spara
    enemy.setTint(0xffff00);
    this.time.delayedCall(200, () => {
      if (enemy.active) enemy.clearTint();
    });
  }

  update(time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) return;

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
      let dx = 0;
      let dy = 0;
      if (this.cursors.left.isDown || this.wasd.left.isDown) dx = -1;
      else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
      if (this.cursors.up.isDown || this.wasd.up.isDown) dy = -1;
      else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;

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
      this.updateEnemyAI(enemy, time);
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
