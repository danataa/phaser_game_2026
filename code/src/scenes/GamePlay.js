"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var GameData_1 = require("../GameData");
var PlayerVignettePostFX_1 = __importDefault(require("../pipelines/PlayerVignettePostFX"));
var GamePlay = /** @class */ (function (_super) {
    __extends(GamePlay, _super);
    /** Scene constructor (key: GamePlay). */
    function GamePlay() {
        var _this = _super.call(this, { key: "GamePlay" }) || this;
        // Game Logic
        _this.currentAbility = "punch";
        _this.normalSpeed = 200;
        _this.isDashing = false;
        _this.canDash = true;
        _this.dashSpeed = 750;
        _this.dashDurationMs = 160;
        _this.dashCooldownMs = 900;
        _this.enemiesKilled = 0;
        _this.targetKills = 15;
        _this.isGameOver = false;
        _this.isPaused = false;
        // Wave & Score
        _this.waveNumber = 1;
        _this.totalScore = 0;
        _this.lastKillTime = 0;
        _this.killStreak = 0;
        _this.lastDirection = new Phaser.Math.Vector2(1, 0);
        _this.vignetteRadius = 0.45; // 0..1 in screen UV space
        _this.vignetteIntensity = 0.85; // 0..1
        _this.vignetteMaskKey = "vignette-mask";
        _this.lightRadiusPx = 240;
        _this.fogFeatherPx = 180;
        _this.darknessAlpha = 1;
        return _this;
    }
    /** Creates the level, player, UI, cameras, enemies, and post-processing. */
    GamePlay.prototype.create = function () {
        var _this = this;
        this.isGameOver = false;
        this.enemiesKilled = 0;
        this.totalScore = 0;
        this.killStreak = 0;
        this.lastKillTime = 0;
        this.waveNumber = 1;
        this.lastDirection.set(1, 0);
        this.cameras.main.setBackgroundColor(0x000000);
        var map = this.add.tilemap("tilemap_0");
        var tileset = map.addTilesetImage("mainlevbuild", "tileset_0");
        var floor = map.createLayer("floor", tileset, 0, 0);
        var collideLayer = map.createLayer("wall", tileset, 0, 0);
        floor.setScale(2);
        collideLayer.setScale(2);
        collideLayer.setCollisionByProperty({ collide: true });
        this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);
        this.bullets = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.healthPickups = this.physics.add.group();
        this.player = this.physics.add.sprite(200, 200, "player");
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
        this.hudCamera = this.cameras.add(0, 0, GameData_1.GameData.globals.gameWidth, GameData_1.GameData.globals.gameHeight);
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
        for (var i = 0; i < 5; i++) {
            this.spawnEnemy(map, true);
        }
        this.spawnEvent = this.time.addEvent({
            delay: Phaser.Math.Between(2000, 4000),
            callback: function () {
                if (!_this.isGameOver) {
                    _this.spawnEnemy(map, true);
                    var minDelay = Math.max(500, 2000 - (_this.waveNumber - 1) * 200);
                    var maxDelay = Math.max(1000, 4000 - (_this.waveNumber - 1) * 200);
                    _this.spawnEvent.reset({
                        delay: Phaser.Math.Between(minDelay, maxDelay),
                        callback: _this.spawnEvent.callback,
                        callbackScope: _this
                    });
                }
            },
            callbackScope: this,
            loop: true
        });
        this.physics.add.collider(this.enemies, collideLayer);
        this.physics.add.collider(this.bullets, collideLayer, function (b) { return b.destroy(); });
        this.physics.add.collider(this.enemyBullets, collideLayer, function (b) { return b.destroy(); });
        this.physics.add.overlap(this.bullets, this.enemies, function (b, e) {
            b.destroy();
            _this.damageEnemy(e);
        });
        this.physics.add.overlap(this.enemyBullets, this.player, function (p, b) {
            b.destroy();
            _this.handlePlayerDamage(8);
        });
        this.physics.add.collider(this.player, this.enemies, function (_p, e) {
            var dmg = e.type === "demon" ? 15 : e.type === "mago" ? 8 : 5;
            _this.handlePlayerDamage(dmg);
            // Scheletro: mostra un attacco quando entra in contatto (throttled per evitare spam)
            if (e.type === "skeleton" && e.active && !e.isDying) {
                if (e.lastContactAnimTime === undefined)
                    e.lastContactAnimTime = 0;
                var now = _this.time.now;
                if (now > e.lastContactAnimTime + 500) {
                    e.lastContactAnimTime = now;
                    var n = Phaser.Math.Between(1, 3);
                    e.play("scheletro-attack-".concat(n), true);
                }
            }
            // Demon: mostra un attacco al contatto (throttled)
            if (e.type === "demon" && e.active && !e.isDying) {
                if (e.lastContactAnimTime === undefined)
                    e.lastContactAnimTime = 0;
                var now = _this.time.now;
                if (now > e.lastContactAnimTime + 700) {
                    e.lastContactAnimTime = now;
                    var n = Phaser.Math.Between(1, 3);
                    e.play("demon-attack-".concat(n), true);
                }
            }
        });
        this.physics.add.overlap(this.player, this.healthPickups, function (_p, pickup) {
            if (!pickup.active)
                return;
            pickup.destroy();
            _this.player.hp = Math.min(100, _this.player.hp + 20);
            _this.updatePlayerHealthBar();
            _this.showFloatingText(_this.player.x, _this.player.y - 40, "+20 HP", "#00ff00", true);
        });
        this.physics.add.collider(this.enemies, this.enemies);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: "W", down: "S", left: "A", right: "D",
        });
        this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.input.keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.TAB, Phaser.Input.Keyboard.KeyCodes.ESC]);
        // Vignette controls
        this.vignetteRadiusDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.vignetteRadiusUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.vignetteIntensityDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.vignetteIntensityUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.input.on("pointerdown", function (pointer) {
            if (pointer.leftButtonDown()) {
                _this.performAttack();
            }
        });
        this.input.keyboard.on("keydown-ESC", function () {
            _this.togglePause();
        });
        // Mostra banner wave all'inizio
        this.time.delayedCall(400, function () { return _this.showWaveBanner(_this.waveNumber); });
        // Dynamic light mask overlay (main camera only)
        this.setupLightMask();
    };
    /** Applies damage to the player with brief invulnerability, UI update, and game-over check. */
    GamePlay.prototype.handlePlayerDamage = function (damage) {
        var _this = this;
        if (damage === void 0) { damage = 10; }
        if (!this.player.isInvulnerable && !this.isGameOver) {
            this.player.hp -= damage;
            this.player.isInvulnerable = true;
            this.player.setTint(0xff0000);
            this.cameras.main.shake(150, 0.008);
            this.showFloatingText(this.player.x, this.player.y - 40, "-".concat(damage), "#ff4444", true);
            this.updatePlayerHealthBar();
            if (this.player.hp <= 0)
                this.showEndScreen(false);
            else {
                this.time.delayedCall(1000, function () {
                    _this.player.isInvulnerable = false;
                    _this.player.clearTint();
                });
            }
        }
    };
    /** Toggles pause state, stopping physics, animations, timers, and music. */
    GamePlay.prototype.togglePause = function () {
        if (this.isGameOver)
            return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
            this.pauseOverlay.setVisible(true);
            this.player.anims.pause();
            this.enemies.getChildren().forEach(function (e) { return e.anims.pause(); });
            this.enemyBullets.getChildren().forEach(function (b) { if (b.body)
                b.body.enable = false; });
            this.spawnEvent.paused = true;
            if (this.bgMusic)
                this.bgMusic.pause();
        }
        else {
            this.physics.resume();
            this.pauseOverlay.setVisible(false);
            this.player.anims.resume();
            this.enemies.getChildren().forEach(function (e) { return e.anims.resume(); });
            this.enemyBullets.getChildren().forEach(function (b) { if (b.body)
                b.body.enable = true; });
            this.spawnEvent.paused = false;
            if (this.bgMusic)
                this.bgMusic.resume();
        }
    };
    /** Builds the pause overlay UI. */
    GamePlay.prototype.setupPauseUI = function () {
        var bg = this.add.rectangle(0, 0, GameData_1.GameData.globals.gameWidth, GameData_1.GameData.globals.gameHeight, 0x000000, 0.5).setOrigin(0);
        var text = this.add.text(GameData_1.GameData.globals.gameWidth / 2, GameData_1.GameData.globals.gameHeight / 2, "PAUSA", { fontSize: "64px", color: "#ffffff" }).setOrigin(0.5);
        var subText = this.add.text(GameData_1.GameData.globals.gameWidth / 2, GameData_1.GameData.globals.gameHeight / 2 + 80, "Premi ESC per continuare", { fontSize: "24px", color: "#ffffff" }).setOrigin(0.5);
        this.pauseOverlay = this.add.container(0, 0, [bg, text, subText]).setScrollFactor(0).setDepth(3000).setVisible(false);
    };
    /** Executes the current player ability (punch or shoot) towards the pointer direction. */
    GamePlay.prototype.performAttack = function () {
        var _this = this;
        if (this.isGameOver || this.isPaused || this.isDashing)
            return;
        var pointer = this.input.activePointer;
        var angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
        this.lastDirection.set(Math.cos(angle), Math.sin(angle));
        this.player.setFlipX(pointer.worldX < this.player.x);
        if (this.currentAbility === "punch") {
            this.player.anims.play("punch", true);
            this.enemies.getChildren().forEach(function (e) {
                var distance = Phaser.Math.Distance.Between(_this.player.x, _this.player.y, e.x, e.y);
                if (distance < 100)
                    _this.damageEnemy(e);
            });
        }
        else {
            this.player.anims.play("shoot", true);
            var bullet = this.bullets.create(this.player.x, this.player.y, "phaser");
            if (this.hudCamera)
                this.hudCamera.ignore(bullet);
            bullet.setScale(0.1);
            bullet.setVelocity(this.lastDirection.x * 500, this.lastDirection.y * 500);
            bullet.setRotation(angle);
        }
    };
    /** Creates the HUD elements (health bar, ability text, dash, objective, wave, score). */
    GamePlay.prototype.setupUI = function () {
        this.playerHealthBar = this.add.graphics().setScrollFactor(0).setDepth(1000);
        this.updatePlayerHealthBar();
        this.abilityText = this.add.text(20, 50, "Abilità: PUGNO [TAB/LMB]", { fontSize: "20px", color: "#ffffff" }).setScrollFactor(0).setDepth(1000);
        this.dashText = this.add.text(20, 80, "Scatto: PRONTO [SHIFT]", { fontSize: "20px", color: "#00ff00" }).setScrollFactor(0).setDepth(1000);
        this.objectiveText = this.add.text(GameData_1.GameData.globals.gameWidth - 300, 20, "Obiettivo: 0/".concat(this.targetKills), { fontSize: "24px", color: "#ffffff", backgroundColor: "#00000066" }).setScrollFactor(0).setDepth(1000);
        this.waveText = this.add.text(GameData_1.GameData.globals.gameWidth / 2, 20, "Wave ".concat(this.waveNumber), { fontSize: "22px", color: "#ffaa00", stroke: "#000000", strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        this.scoreText = this.add.text(GameData_1.GameData.globals.gameWidth - 300, 52, "Score: 0", { fontSize: "20px", color: "#ffffff", backgroundColor: "#00000066" }).setScrollFactor(0).setDepth(1000);
    };
    /** Defines player animations (walk, punch, shoot) once. */
    GamePlay.prototype.setupPlayerAnims = function () {
        if (!this.anims.exists("walk")) {
            this.anims.create({ key: "walk", frames: this.anims.generateFrameNumbers("player", { start: 10, end: 17 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: "punch", frames: this.anims.generateFrameNumbers("player", { start: 41, end: 42 }), frameRate: 15, repeat: 0 });
            this.anims.create({ key: "shoot", frames: this.anims.generateFrameNumbers("player", { start: 7, end: 10 }), frameRate: 15, repeat: 0 });
        }
    };
    /** Ensures the vignette mask texture exists (fallback: generate a canvas texture). */
    GamePlay.prototype.ensureVignetteMaskTexture = function (key, size) {
        if (size === void 0) { size = 512; }
        if (this.textures.exists(key))
            return;
        var tex = this.textures.createCanvas(key, size, size);
        var ctx = tex.getContext();
        // Alpha 0 al centro, alpha 1 ai bordi: usiamo l'alpha come "darkness mask" nello shader.
        ctx.clearRect(0, 0, size, size);
        var g = ctx.createRadialGradient(size / 2, size / 2, size * 0.12, size / 2, size / 2, size / 2);
        g.addColorStop(0.0, "rgba(0,0,0,0)");
        g.addColorStop(0.55, "rgba(0,0,0,0)");
        g.addColorStop(1.0, "rgba(0,0,0,1)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        tex.refresh();
    };
    /** Registers and applies the vignette PostFX pipeline to the main camera. */
    GamePlay.prototype.setupVignetteFx = function () {
        var _a;
        // WebGL only. In canvas renderer, pipelines are not available.
        var renderer = this.sys.renderer;
        if (!((_a = renderer === null || renderer === void 0 ? void 0 : renderer.pipelines) === null || _a === void 0 ? void 0 : _a.addPostPipeline))
            return;
        this.ensureVignetteMaskTexture(this.vignetteMaskKey);
        renderer.pipelines.addPostPipeline("PlayerVignette", PlayerVignettePostFX_1.default);
        this.cameras.main.setPostPipeline("PlayerVignette");
        var got = this.cameras.main.getPostPipeline("PlayerVignette");
        var fx = (Array.isArray(got) ? got[0] : got);
        if (!fx)
            return;
        fx.maskKey = this.vignetteMaskKey;
        fx.radius = this.vignetteRadius;
        fx.intensity = this.vignetteIntensity;
        this.vignetteFx = fx;
    };
    /** Updates vignette center/radius/intensity so it follows the player. */
    GamePlay.prototype.updateVignetteFx = function () {
        if (!this.vignetteFx)
            return;
        var cam = this.cameras.main;
        // Convert world -> normalized screen UV using camera worldView.
        var cx = (this.player.x - cam.worldView.x) / cam.worldView.width;
        var cy = (this.player.y - cam.worldView.y) / cam.worldView.height;
        this.vignetteFx.centerX = Phaser.Math.Clamp(cx, 0, 1);
        this.vignetteFx.centerY = Phaser.Math.Clamp(cy, 0, 1);
        this.vignetteFx.radius = this.vignetteRadius;
        this.vignetteFx.intensity = this.vignetteIntensity;
    };
    /** Keyboard controls for tweaking vignette radius (Q/E) and intensity (Z/C). */
    GamePlay.prototype.handleVignetteControls = function () {
        if (Phaser.Input.Keyboard.JustDown(this.vignetteRadiusDownKey)) {
            this.vignetteRadius = Phaser.Math.Clamp(this.vignetteRadius - 0.03, 0.15, 1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.vignetteRadiusUpKey)) {
            this.vignetteRadius = Phaser.Math.Clamp(this.vignetteRadius + 0.03, 0.15, 1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.vignetteIntensityDownKey)) {
            this.vignetteIntensity = Phaser.Math.Clamp(this.vignetteIntensity - 0.05, 0, 1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.vignetteIntensityUpKey)) {
            this.vignetteIntensity = Phaser.Math.Clamp(this.vignetteIntensity + 0.05, 0, 1);
        }
    };
    /**
     * Creates a full-screen dark overlay and a circular GeometryMask hole that follows the player.
     * The overlay uses MULTIPLY so the world stays visible (but dark) outside the circle.
     */
    GamePlay.prototype.setupLightMask = function () {
        this.darknessOverlay = this.add.rectangle(0, 0, GameData_1.GameData.globals.gameWidth, GameData_1.GameData.globals.gameHeight, 0x000000, this.darknessAlpha)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(1400);
        // For full fog-of-war we want a solid black occlusion (not a multiply darken).
        this.darknessOverlay.setBlendMode(Phaser.BlendModes.NORMAL);
        // Mask graphics live in screen space (scrollFactor 0). We invert alpha to create a "hole".
        this.lightMaskGraphics = this.add.graphics().setScrollFactor(0).setDepth(1401);
        this.lightMaskGraphics.setVisible(false);
        var mask = this.lightMaskGraphics.createGeometryMask();
        mask.invertAlpha = true;
        this.darknessOverlay.setMask(mask);
        // Keep HUD readable by not rendering the darkness layer in the HUD camera.
        if (this.hudCamera) {
            this.hudCamera.ignore(this.darknessOverlay);
            this.hudCamera.ignore(this.lightMaskGraphics);
        }
        // No camera post-processing: this fog-of-war is implemented purely via overlay + mask.
    };
    /** Updates the circular mask position so it stays centered on the player every frame. */
    GamePlay.prototype.updateLightMask = function () {
        if (!this.darknessOverlay || !this.lightMaskGraphics)
            return;
        var cam = this.cameras.main;
        // Player screen position (pixels) relative to the camera viewport.
        var sx = (this.player.x - cam.worldView.x) * cam.zoom;
        var sy = (this.player.y - cam.worldView.y) * cam.zoom;
        this.lightMaskGraphics.clear();
        this.lightMaskGraphics.fillStyle(0xffffff, 1);
        // Solid clear circle.
        this.lightMaskGraphics.fillCircle(sx, sy, this.lightRadiusPx);
        // Feather ring: gradually reduce mask alpha towards the edge so the overlay fades in.
        // This avoids camera post-fx while still giving a vignette-like falloff.
        var steps = 10;
        var stepW = this.fogFeatherPx / steps;
        for (var i = 1; i <= steps; i++) {
            var t = i / steps;
            var a = 1 - t;
            this.lightMaskGraphics.lineStyle(stepW + 1, 0xffffff, a);
            this.lightMaskGraphics.strokeCircle(sx, sy, this.lightRadiusPx + i * stepW);
        }
        this.darknessOverlay.setAlpha(this.darknessAlpha);
    };
    /** Keyboard controls for tweaking light radius (Q/E) and darkness intensity (Z/C). */
    GamePlay.prototype.handleLightMaskControls = function () {
        if (Phaser.Input.Keyboard.JustDown(this.vignetteRadiusDownKey)) {
            this.lightRadiusPx = Phaser.Math.Clamp(this.lightRadiusPx - 15, 60, 900);
        }
        if (Phaser.Input.Keyboard.JustDown(this.vignetteRadiusUpKey)) {
            this.lightRadiusPx = Phaser.Math.Clamp(this.lightRadiusPx + 15, 60, 900);
        }
        if (Phaser.Input.Keyboard.JustDown(this.vignetteIntensityDownKey)) {
            this.darknessAlpha = Phaser.Math.Clamp(this.darknessAlpha - 0.05, 0, 0.95);
        }
        if (Phaser.Input.Keyboard.JustDown(this.vignetteIntensityUpKey)) {
            this.darknessAlpha = Phaser.Math.Clamp(this.darknessAlpha + 0.05, 0, 0.95);
        }
    };
    /** Spawns a random enemy type around the camera and sets up its properties and animation. */
    GamePlay.prototype.spawnEnemy = function (map, forceRandom) {
        if (forceRandom === void 0) { forceRandom = false; }
        var cam = this.cameras.main;
        var offset = 100;
        var x, y;
        if (forceRandom || cam.worldView.width === 0) {
            x = Phaser.Math.Between(40, map.widthInPixels * 2 - 40);
            y = Phaser.Math.Between(40, map.heightInPixels * 2 - 40);
            var px = this.player ? this.player.x : 200;
            var py = this.player ? this.player.y : 200;
            var dist = Phaser.Math.Distance.Between(x, y, px, py);
            if (dist < 300) {
                x = Phaser.Math.Between(40, map.widthInPixels * 2 - 40);
                y = Phaser.Math.Between(40, map.heightInPixels * 2 - 40);
            }
        }
        else {
            var side = Phaser.Math.Between(0, 3);
            switch (side) {
                case 0:
                    x = Phaser.Math.Between(cam.worldView.left, cam.worldView.right);
                    y = cam.worldView.top - offset;
                    break;
                case 1:
                    x = cam.worldView.right + offset;
                    y = Phaser.Math.Between(cam.worldView.top, cam.worldView.bottom);
                    break;
                case 2:
                    x = Phaser.Math.Between(cam.worldView.left, cam.worldView.right);
                    y = cam.worldView.bottom + offset;
                    break;
                default:
                    x = cam.worldView.left - offset;
                    y = Phaser.Math.Between(cam.worldView.top, cam.worldView.bottom);
                    break;
            }
        }
        x = Phaser.Math.Clamp(x, 40, map.widthInPixels * 2 - 40);
        y = Phaser.Math.Clamp(y, 40, map.heightInPixels * 2 - 40);
        var rand = Phaser.Math.Between(0, 2);
        var type;
        var textureKey;
        var animKey;
        var hp;
        var waveHpBonus = Math.floor((this.waveNumber - 1) * 0.5);
        var waveSpeedBonus = (this.waveNumber - 1) * 8;
        if (rand === 0) {
            type = "skeleton";
            textureKey = "scheletro_run";
            animKey = "scheletro-run";
            hp = 1 + waveHpBonus;
        }
        else if (rand === 1) {
            type = "mago";
            textureKey = "mago";
            animKey = "mago-idle";
            hp = 2 + waveHpBonus;
        }
        else {
            type = "demon";
            textureKey = "demon_run";
            animKey = "demon-run";
            hp = 4 + waveHpBonus;
        }
        var enemy = this.enemies.create(x, y, textureKey);
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
        }
        else if (type === "mago") {
            enemy.chaseSpeed = 160 + waveSpeedBonus;
        }
        else {
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
        }
        else if (type === "mago") {
            enemy.setScale(1);
            enemy.setBodySize(40, 70);
            enemy.setOffset(18, 45);
        }
        else {
            enemy.setScale(0.6);
            enemy.setBodySize(80, 100);
            enemy.setOffset(24, 20);
        }
        enemy.play(animKey);
    };
    /** Applies damage to an enemy, handles death, score, drops, and hit feedback. */
    GamePlay.prototype.damageEnemy = function (e) {
        if (!e.active || e.isDying)
            return;
        e.hp -= 1;
        this.showFloatingText(e.x, e.y - 40, "-1", "#ffff00", true);
        if (e.hp <= 0) {
            e.isDying = true;
            // Scheletro/Demon: animazione morte. Altri: flash bianco e scomparsa rapida.
            if (e.type === "skeleton") {
                if (e.body) {
                    e.body.enable = false;
                    e.body.velocity.set(0);
                }
                e.clearTint();
                e.setAlpha(1);
                e.play("scheletro-dead", true);
                this.time.delayedCall(500, function () {
                    if (e.healthBar)
                        e.healthBar.destroy();
                    if (e.active)
                        e.destroy();
                });
            }
            else if (e.type === "mago") {
                if (e.body) {
                    e.body.enable = false;
                    e.body.velocity.set(0);
                }
                e.clearTint();
                e.setAlpha(1);
                e.play("mago-dead", true);
                this.time.delayedCall(500, function () {
                    if (e.healthBar)
                        e.healthBar.destroy();
                    if (e.active)
                        e.destroy();
                });
            }
            else if (e.type === "demon") {
                if (e.body) {
                    e.body.enable = false;
                    e.body.velocity.set(0);
                }
                e.clearTint();
                e.setAlpha(1);
                e.play("demon-dead", true);
                this.time.delayedCall(650, function () {
                    if (e.healthBar)
                        e.healthBar.destroy();
                    if (e.active)
                        e.destroy();
                });
            }
            else {
                e.setTint(0xffffff);
                e.setAlpha(0.8);
                this.time.delayedCall(150, function () {
                    if (e.healthBar)
                        e.healthBar.destroy();
                    if (e.active)
                        e.destroy();
                });
            }
            this.enemiesKilled++;
            // Score per tipo
            var pts = e.type === "demon" ? 30 : e.type === "mago" ? 20 : 10;
            this.totalScore += pts;
            this.showFloatingText(e.x, e.y - 20, "+".concat(pts), "#ffd700", true);
            this.updateKillStreak();
            this.objectiveText.setText("Obiettivo: ".concat(this.enemiesKilled, "/").concat(this.targetKills));
            this.scoreText.setText("Score: ".concat(this.totalScore));
            // Drop vita (30% di probabilità)
            if (Phaser.Math.Between(0, 99) < 30) {
                this.dropHealthPickup(e.x, e.y);
            }
            if (this.enemiesKilled >= this.targetKills && !this.isGameOver)
                this.showEndScreen(true);
        }
        else {
            e.setTint(0xff0000);
            if (e.type === "skeleton") {
                e.play("scheletro-hurt", true);
                e.once("animationcomplete-scheletro-hurt", function () { if (e.active && !e.isDying)
                    e.play("scheletro-run", true); });
            }
            else if (e.type === "mago") {
                e.play("mago-hurt", true);
                e.once("animationcomplete-mago-hurt", function () { if (e.active && !e.isDying)
                    e.play("mago-idle", true); });
            }
            else if (e.type === "demon") {
                e.play("demon-hurt", true);
                e.once("animationcomplete-demon-hurt", function () { if (e.active && !e.isDying)
                    e.play("demon-walk", true); });
            }
            this.time.delayedCall(150, function () { if (e.active)
                e.clearTint(); });
        }
    };
    /** Redraws the player health bar based on current HP. */
    GamePlay.prototype.updatePlayerHealthBar = function () {
        this.playerHealthBar.clear();
        this.playerHealthBar.fillStyle(0x000000, 0.5);
        this.playerHealthBar.fillRect(20, 20, 200, 20);
        var color = this.player.hp > 30 ? 0x00ff00 : 0xff0000;
        this.playerHealthBar.fillStyle(color, 1);
        this.playerHealthBar.fillRect(20, 20, (this.player.hp / 100) * 200, 20);
    };
    /** Redraws an enemy health bar above the enemy sprite. */
    GamePlay.prototype.updateEnemyHealthBar = function (enemy) {
        enemy.healthBar.clear();
        if (enemy.hp <= 0)
            return;
        var x = enemy.x - 25;
        var y = enemy.y - 55;
        enemy.healthBar.fillStyle(0x000000, 0.5);
        enemy.healthBar.fillRect(x, y, 50, 6);
        enemy.healthBar.fillStyle(0xff0000, 1);
        enemy.healthBar.fillRect(x, y, (enemy.hp / enemy.maxHp) * 50, 6);
    };
    /** Displays end-of-wave or game-over overlay with restart/next actions. */
    GamePlay.prototype.showEndScreen = function (victory) {
        var _this = this;
        this.isGameOver = true;
        this.physics.pause();
        this.enemyBullets.clear(true, true);
        this.player.setTint(victory ? 0x00ff00 : 0xff0000);
        var overlay = this.add.rectangle(GameData_1.GameData.globals.gameWidth / 2, GameData_1.GameData.globals.gameHeight / 2, GameData_1.GameData.globals.gameWidth, GameData_1.GameData.globals.gameHeight, 0x000000, 0.7).setScrollFactor(0).setDepth(2000);
        var title = this.add.text(GameData_1.GameData.globals.gameWidth / 2, GameData_1.GameData.globals.gameHeight / 2 - 120, victory ? "🏆 VITTORIA!" : "💀 GAME OVER", { fontSize: "60px", color: victory ? "#00ff00" : "#ff0000", stroke: "#000000", strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        var waveMsg = this.add.text(GameData_1.GameData.globals.gameWidth / 2, GameData_1.GameData.globals.gameHeight / 2 - 50, "Wave ".concat(this.waveNumber, "  |  Score: ").concat(this.totalScore), { fontSize: "28px", color: "#ffaa00" }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        var msg = this.add.text(GameData_1.GameData.globals.gameWidth / 2, GameData_1.GameData.globals.gameHeight / 2, "Nemici sconfitti: ".concat(this.enemiesKilled), { fontSize: "26px", color: "#ffffff" }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        var btnRestart = this.add.text(GameData_1.GameData.globals.gameWidth / 2, GameData_1.GameData.globals.gameHeight / 2 + 70, " RIAVVIA ", { fontSize: "32px", color: "#ffffff", backgroundColor: "#00aa00", padding: { x: 20, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(2001).setInteractive({ useHandCursor: true });
        btnRestart.on("pointerover", function () { this.setBackgroundColor("#00cc00"); });
        btnRestart.on("pointerout", function () { this.setBackgroundColor("#00aa00"); });
        btnRestart.on("pointerdown", function () {
            if (_this.bgMusic)
                _this.bgMusic.stop();
            _this.scene.restart();
        });
        var btnAction = this.add.text(GameData_1.GameData.globals.gameWidth / 2, GameData_1.GameData.globals.gameHeight / 2 + 150, victory ? " PROSSIMA WAVE ▶ " : " MENU PRINCIPALE ", { fontSize: "32px", color: "#ffffff", backgroundColor: "#333333", padding: { x: 20, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(2001).setInteractive({ useHandCursor: true });
        btnAction.on("pointerover", function () { this.setBackgroundColor("#555555"); });
        btnAction.on("pointerout", function () { this.setBackgroundColor("#333333"); });
        this.cameras.main.ignore(overlay);
        this.cameras.main.ignore(title);
        this.cameras.main.ignore(waveMsg);
        this.cameras.main.ignore(msg);
        this.cameras.main.ignore(btnRestart);
        this.cameras.main.ignore(btnAction);
        btnAction.on("pointerdown", function () {
            if (victory) {
                _this.waveNumber++;
                _this.targetKills += 20;
                _this.isGameOver = false;
                _this.physics.resume();
                overlay.destroy();
                title.destroy();
                waveMsg.destroy();
                msg.destroy();
                btnRestart.destroy();
                btnAction.destroy();
                _this.objectiveText.setText("Obiettivo: ".concat(_this.enemiesKilled, "/").concat(_this.targetKills));
                _this.waveText.setText("Wave ".concat(_this.waveNumber));
                _this.showWaveBanner(_this.waveNumber);
            }
            else {
                if (_this.bgMusic)
                    _this.bgMusic.stop();
                _this.scene.start("Menu");
            }
        });
    };
    /** Per-enemy AI dispatcher: skeleton / mago / demon. */
    GamePlay.prototype.updateEnemyAI = function (enemy, time) {
        if (this.isGameOver || this.isPaused || enemy.isDying)
            return;
        var dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        var angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
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
    };
    /** Skeleton AI: chase, dash attack when close, idle when too near. */
    GamePlay.prototype.updateSkeletonAI = function (enemy, dist, angle, time) {
        var _a, _b, _c, _d, _e, _f;
        if (dist < 120 && time > enemy.lastAttackTime + 2000) {
            enemy.lastAttackTime = time;
            this.physics.velocityFromRotation(angle, 400 + (enemy.chaseSpeed - 120) * 0.5, enemy.body.velocity);
            enemy.setTint(0xffaa00);
            enemy.play("scheletro-run-attack", true);
            this.time.delayedCall(300, function () { if (enemy.active)
                enemy.clearTint(); });
        }
        else if (dist > 30) {
            this.physics.moveToObject(enemy, this.player, enemy.chaseSpeed);
            var cur = (_b = (_a = enemy.anims) === null || _a === void 0 ? void 0 : _a.currentAnim) === null || _b === void 0 ? void 0 : _b.key;
            var busy = !!((_c = enemy.anims) === null || _c === void 0 ? void 0 : _c.isPlaying) && (cur === "scheletro-run-attack" || cur === "scheletro-attack-1" || cur === "scheletro-attack-2" || cur === "scheletro-attack-3" || cur === "scheletro-hurt" || cur === "scheletro-dead");
            var desired = enemy.chaseSpeed >= 170 ? "scheletro-run" : "scheletro-walk";
            if (!busy && cur !== desired)
                enemy.play(desired, true);
        }
        else {
            if (enemy.body)
                enemy.body.velocity.set(0);
            var cur = (_e = (_d = enemy.anims) === null || _d === void 0 ? void 0 : _d.currentAnim) === null || _e === void 0 ? void 0 : _e.key;
            var busy = !!((_f = enemy.anims) === null || _f === void 0 ? void 0 : _f.isPlaying) && (cur === "scheletro-run-attack" || cur === "scheletro-attack-1" || cur === "scheletro-attack-2" || cur === "scheletro-attack-3" || cur === "scheletro-hurt" || cur === "scheletro-dead");
            if (!busy && cur !== "scheletro-idle")
                enemy.play("scheletro-idle", true);
        }
    };
    /** Mago AI: strafes around optimal range and shoots with cooldown. */
    GamePlay.prototype.updateMagoAI = function (enemy, dist, angle, time) {
        var _a, _b, _c, _d;
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
        var didShoot = false;
        var cur = (_b = (_a = enemy.anims) === null || _a === void 0 ? void 0 : _a.currentAnim) === null || _b === void 0 ? void 0 : _b.key;
        var busy = !!((_c = enemy.anims) === null || _c === void 0 ? void 0 : _c.isPlaying) && (cur === "mago-attack-1" || cur === "mago-attack-2" || cur === "mago-charge" || cur === "mago-hurt" || cur === "mago-dead");
        if (dist > 380) {
            // Troppo lontano: si avvicina veloce e spara in movimento
            this.physics.moveToObject(enemy, this.player, enemy.chaseSpeed);
            if (time > enemy.lastAttackTime + Phaser.Math.Between(1800, 2800)) {
                enemy.lastAttackTime = time;
                didShoot = true;
                this.enemyShoot(enemy);
            }
        }
        else if (dist < 200) {
            // Troppo vicino: scappa rapidamente in diagonale
            var escapeAngle = angle + enemy.strafeDir * 0.4;
            this.physics.velocityFromRotation(escapeAngle, -(enemy.chaseSpeed + 40), enemy.body.velocity);
            // Spara anche mentre scappa
            if (time > enemy.lastAttackTime + Phaser.Math.Between(800, 1500)) {
                enemy.lastAttackTime = time;
                didShoot = true;
                this.enemyShoot(enemy);
            }
        }
        else {
            // Distanza ottimale (200-380): strafing alternato + tiro frequente
            var strafeAngle = angle + (Math.PI / 2) * enemy.strafeDir;
            var strafeSpeed = 80 + (enemy.chaseSpeed - 160) * 0.5;
            enemy.body.velocity.set(Math.cos(strafeAngle) * strafeSpeed, Math.sin(strafeAngle) * strafeSpeed);
            if (time > enemy.lastAttackTime + Phaser.Math.Between(900, 2000)) {
                enemy.lastAttackTime = time;
                didShoot = true;
                this.enemyShoot(enemy);
            }
        }
        // Animazione movimento (se non sta facendo attacchi/hurt/dead)
        if (!busy && !didShoot) {
            var speed = ((_d = enemy.body) === null || _d === void 0 ? void 0 : _d.velocity) ? enemy.body.velocity.length() : 0;
            var desired = speed > 30 ? "mago-run" : "mago-idle";
            if (cur !== desired)
                enemy.play(desired, true);
        }
    };
    /** Demon AI: chases and occasionally charges (jump) at mid-range. */
    GamePlay.prototype.updateDemonAI = function (enemy, dist, angle, time) {
        var _a, _b, _c;
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
            this.time.delayedCall(1000, function () {
                if (enemy.active) {
                    enemy.state = "CHASE";
                    enemy.clearTint();
                    var desired = enemy.chaseSpeed >= 120 ? "demon-run" : "demon-walk";
                    enemy.play(desired, true);
                }
            });
        }
        else {
            this.physics.moveToObject(enemy, this.player, enemy.chaseSpeed);
            var cur = (_b = (_a = enemy.anims) === null || _a === void 0 ? void 0 : _a.currentAnim) === null || _b === void 0 ? void 0 : _b.key;
            var busy = !!((_c = enemy.anims) === null || _c === void 0 ? void 0 : _c.isPlaying) && (cur === "demon-jump" || cur === "demon-attack-1" || cur === "demon-attack-2" || cur === "demon-attack-3" || cur === "demon-hurt" || cur === "demon-dead");
            var desired = enemy.chaseSpeed >= 120 ? "demon-run" : "demon-walk";
            if (!busy && cur !== desired)
                enemy.play(desired, true);
        }
    };
    /** Enemy ranged attack (mago uses animated projectile; others use generic bullet). */
    GamePlay.prototype.enemyShoot = function (enemy) {
        if (this.isGameOver || this.isPaused)
            return;
        // Mago: usa l'animazione Charge_1 come proiettile (al posto di arrow_1.png)
        var angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (enemy.type === "mago") {
            var atkKey = Phaser.Math.Between(1, 2) === 1 ? "mago-attack-1" : "mago-attack-2";
            enemy.play(atkKey, true);
            enemy.once("animationcomplete-".concat(atkKey), function () {
                var _a;
                if (!enemy.active || enemy.isDying)
                    return;
                var v = ((_a = enemy.body) === null || _a === void 0 ? void 0 : _a.velocity) ? enemy.body.velocity.length() : 0;
                enemy.play(v > 30 ? "mago-run" : "mago-idle", true);
            });
            var bullet_1 = this.enemyBullets.create(enemy.x, enemy.y, "mago_charge_1");
            if (this.hudCamera)
                this.hudCamera.ignore(bullet_1);
            bullet_1.setScale(1);
            // Colore magico blu per il mago
            bullet_1.setTint(0x2aa8ff);
            if (bullet_1.anims)
                bullet_1.play("mago-projectile", true);
            var speed_1 = 300;
            bullet_1.setVelocity(Math.cos(angle) * speed_1, Math.sin(angle) * speed_1);
            bullet_1.setRotation(angle);
            enemy.setTint(0x2aa8ff);
            this.time.delayedCall(200, function () { if (enemy.active)
                enemy.clearTint(); });
            return;
        }
        // (fallback) proiettile generico
        var bullet = this.enemyBullets.create(enemy.x, enemy.y, "arrow_1");
        if (this.hudCamera)
            this.hudCamera.ignore(bullet);
        bullet.setScale(1);
        bullet.setTint(0xff0000); // Proiettili nemici rossi
        var speed = 300;
        bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        // `arrow_1.png` e' disegnata "verso l'alto": aggiustiamo la rotazione per puntare verso il target.
        bullet.setRotation(angle + Math.PI / 2);
        // Effetto visivo "flash" quando spara
        enemy.setTint(0xffff00);
        this.time.delayedCall(200, function () {
            if (enemy.active)
                enemy.clearTint();
        });
    };
    /** Main game loop: input handling, player movement/attack, enemy AI, and post FX updates. */
    GamePlay.prototype.update = function (time, delta) {
        var _this = this;
        if (this.isGameOver || this.isPaused)
            return;
        var body = this.player.body;
        this.updateLightMask();
        this.handleLightMaskControls();
        if (Phaser.Input.Keyboard.JustDown(this.shiftKey))
            this.startDash();
        if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
            this.currentAbility = this.currentAbility === "punch" ? "shoot" : "punch";
            this.abilityText.setText("Abilit\u00E0: ".concat(this.currentAbility === "punch" ? "PUGNO" : "SPARO", " [TAB/LMB]"));
        }
        var isAttacking = this.player.anims.currentAnim &&
            (this.player.anims.currentAnim.key === "punch" || this.player.anims.currentAnim.key === "shoot") &&
            this.player.anims.isPlaying;
        if (this.isDashing) {
            // Durante lo scatto non accettiamo input di movimento / attacco.
        }
        else if (isAttacking) {
            body.setVelocity(0);
        }
        else {
            var dx = 0;
            var dy = 0;
            if (this.cursors.left.isDown || this.wasd.left.isDown)
                dx = -1;
            else if (this.cursors.right.isDown || this.wasd.right.isDown)
                dx = 1;
            if (this.cursors.up.isDown || this.wasd.up.isDown)
                dy = -1;
            else if (this.cursors.down.isDown || this.wasd.down.isDown)
                dy = 1;
            if (dx !== 0 || dy !== 0) {
                var len = Math.sqrt(dx * dx + dy * dy) || 1;
                this.lastDirection.set(dx / len, dy / len);
                body.setVelocity(dx * this.normalSpeed, dy * this.normalSpeed);
                this.player.setFlipX(dx < 0);
                this.player.anims.play("walk", true);
            }
            else {
                body.setVelocity(0);
                this.player.anims.stop();
                this.player.setFrame(0);
            }
            if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
                this.performAttack();
                return;
            }
        }
        this.enemies.getChildren().forEach(function (enemy) {
            _this.updateEnemyAI(enemy, time);
        });
    };
    /** Performs a short dash in the last movement/aim direction with cooldown. */
    GamePlay.prototype.startDash = function () {
        var _this = this;
        if (!this.canDash || this.isDashing)
            return;
        if (this.isGameOver || this.isPaused)
            return;
        this.isDashing = true;
        this.canDash = false;
        this.dashText.setText("Scatto: ATTIVO!").setColor("#2aa8ff");
        this.player.setAlpha(0.7);
        var body = this.player.body;
        body.setVelocity(this.lastDirection.x * this.dashSpeed, this.lastDirection.y * this.dashSpeed);
        this.time.delayedCall(this.dashDurationMs, function () {
            _this.isDashing = false;
            _this.player.setAlpha(1);
            _this.dashText.setText("Scatto: COOLDOWN...").setColor("#ff0000");
            _this.time.delayedCall(_this.dashCooldownMs, function () {
                _this.canDash = true;
                _this.dashText.setText("Scatto: PRONTO [SHIFT]").setColor("#00ff00");
            });
        });
    };
    // --- Metodi nuovi ---
    /** Spawns a transient floating text, either in world space or HUD space. */
    GamePlay.prototype.showFloatingText = function (x, y, text, color, worldSpace) {
        var txt = this.add.text(x, y, text, {
            fontSize: "22px",
            color: color,
            stroke: "#000000",
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(1500);
        if (worldSpace) {
            // Visibile nella scena world, nascosto dalla hudCamera
            if (this.hudCamera)
                this.hudCamera.ignore(txt);
        }
        else {
            txt.setScrollFactor(0);
            this.cameras.main.ignore(txt);
        }
        this.tweens.add({
            targets: txt,
            y: y - 60,
            alpha: 0,
            duration: 900,
            ease: "Power1",
            onComplete: function () { return txt.destroy(); },
        });
    };
    /** Drops a health pickup at the given world position. */
    GamePlay.prototype.dropHealthPickup = function (x, y) {
        var pickup = this.healthPickups.create(x, y, "phaser");
        pickup.setTint(0x00ff44);
        pickup.setScale(0.14);
        pickup.setBounce(0.4);
        pickup.setCollideWorldBounds(true);
        if (this.hudCamera)
            this.hudCamera.ignore(pickup);
        // Piccolo tween di "pop" per renderlo visibile
        this.tweens.add({ targets: pickup, scaleX: 0.18, scaleY: 0.18, duration: 150, yoyo: true });
    };
    /** Shows a wave banner overlay for a short duration. */
    GamePlay.prototype.showWaveBanner = function (wave) {
        var cx = GameData_1.GameData.globals.gameWidth / 2;
        var cy = GameData_1.GameData.globals.gameHeight / 2;
        var txt = this.add.text(cx, cy, "\u2694  WAVE ".concat(wave, "  \u2694"), {
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
            onComplete: function () { return txt.destroy(); },
        });
    };
    /** Updates the kill-streak counter and score multiplier window. */
    GamePlay.prototype.updateKillStreak = function () {
        var now = this.time.now;
        if (now - this.lastKillTime < 2000) {
            this.killStreak++;
            if (this.killStreak >= 2) {
                this.showStreakText("x".concat(this.killStreak, " COMBO! \uD83D\uDD25"));
            }
        }
        else {
            this.killStreak = 1;
        }
        this.lastKillTime = now;
    };
    /** Shows a kill-streak/combo text overlay (HUD). */
    GamePlay.prototype.showStreakText = function (text) {
        var cx = GameData_1.GameData.globals.gameWidth / 2;
        var cy = GameData_1.GameData.globals.gameHeight / 2 - 120;
        var txt = this.add.text(cx, cy, text, {
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
            onComplete: function () { return txt.destroy(); },
        });
    };
    return GamePlay;
}(Phaser.Scene));
exports.default = GamePlay;
//# sourceMappingURL=GamePlay.js.map