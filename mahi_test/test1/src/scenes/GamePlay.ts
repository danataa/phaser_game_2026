import { GameData } from "../GameData";
import Player from "../gameObjects/Player";
import { Enemy, Soldier, Sniper, Tank } from "../gameObjects/Enemy";

export default class GamePlay extends Phaser.Scene {
    private player: Player;
    private enemies: Phaser.GameObjects.Group;
    private transmutationCircle: Phaser.GameObjects.Arc;
    private transmutationRadius: number = 100;
    private transmutationCooldown: number = 3000;
    private lastTransmutation: number = 0;
    
    private kills: number = 0;
    private nextUpgradeKills: number = 30;
    private gameTime: number = 0; // in seconds
    private spawnTimer: Phaser.Time.TimerEvent;
    private difficultyTimer: Phaser.Time.TimerEvent;
    private spawnRate: number = 3000;
    
    private map: Phaser.Tilemaps.Tilemap;

    constructor() {
        super({ key: "GamePlay" });
    }

    create() {
        this.kills = 0;
        this.nextUpgradeKills = 30;
        this.gameTime = 0;
        this.spawnRate = 3000;

        // Tilemap
        this.map = this.make.tilemap({ key: "level0" });
        const tileset = this.map.addTilesetImage("tilemap-extruded", "tilemap", 16, 16, 1, 2);
        
        const worldLayer = this.map.createLayer("world", tileset, 0, 0);
        const collisionLayer = this.map.createLayer("collision", tileset, 0, 0);
        
        collisionLayer.setCollisionByExclusion([-1]);

        // Player
        this.player = new Player(this, this.map.widthInPixels / 2, this.map.heightInPixels / 2);
        this.physics.add.collider(this.player, collisionLayer);

        // Camera
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Enemies
        this.enemies = this.add.group({ runChildUpdate: true });
        this.physics.add.collider(this.enemies, collisionLayer);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, undefined, this);

        // Transmutation Circle (visual only, actual logic in update)
        this.transmutationCircle = this.add.arc(this.player.x, this.player.y, this.transmutationRadius, 0, 360, false, 0xffffff, 0.3);
        this.transmutationCircle.setStrokeStyle(2, 0xffffff, 0.8);
        this.transmutationCircle.setVisible(false);

        // Timers
        this.spawnTimer = this.time.addEvent({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        this.difficultyTimer = this.time.addEvent({
            delay: 60000, // 1 minute
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });

        // Game Timer
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameTime++;
                if (this.gameTime >= 600) { // 10 minutes
                    this.scene.start("VictoryScene");
                    this.scene.stop("Hud");
                }
            },
            loop: true
        });

        // Events
        this.events.on("resume", (scene: any, data: any) => {
            if (data && data.upgrade) {
                this.applyUpgrade(data.upgrade);
            }
        });
    }

    private spawnEnemy() {
        const bounds = this.cameras.main.getBounds();
        let x, y;

        // Spawn from edges
        const side = Phaser.Math.Between(0, 3);
        switch (side) {
            case 0: // Top
                x = Phaser.Math.Between(0, this.map.widthInPixels);
                y = -50;
                break;
            case 1: // Right
                x = this.map.widthInPixels + 50;
                y = Phaser.Math.Between(0, this.map.heightInPixels);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(0, this.map.widthInPixels);
                y = this.map.heightInPixels + 50;
                break;
            default: // Left
                x = -50;
                y = Phaser.Math.Between(0, this.map.heightInPixels);
                break;
        }

        const rand = Phaser.Math.Between(0, 100);
        let enemy: Enemy;
        if (rand < 70) {
            enemy = new Soldier(this, x, y);
        } else if (rand < 90) {
            enemy = new Sniper(this, x, y);
        } else {
            enemy = new Tank(this, x, y);
        }
        this.enemies.add(enemy);
    }

    private increaseDifficulty() {
        this.spawnRate = Math.max(500, this.spawnRate - 500);
        this.spawnTimer.reset({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    private handlePlayerEnemyCollision(player: any, enemy: any) {
        if (this.player.getShield()) {
            this.player.setShield(false);
            enemy.destroy();
            return;
        }
        // Simple game over for now
        this.scene.start("GameOver");
        this.scene.stop("Hud");
    }

    private applyUpgrade(upgradeId: string) {
        switch (upgradeId) {
            case "radius":
                this.transmutationRadius *= 1.2;
                break;
            case "frequency":
                this.transmutationCooldown *= 0.8;
                break;
            case "speed":
                this.player.setMoveSpeed(this.player.getMoveSpeed() * 1.15);
                break;
            case "shield":
                this.player.setShield(true);
                break;
        }
    }

    update(time: number, delta: number) {
        this.player.update();
        
        // Update enemies to follow player
        this.enemies.getChildren().forEach((enemy: any) => {
            enemy.update(this.player);
        });

        // Transmutation logic
        if (time > this.lastTransmutation + this.transmutationCooldown) {
            this.performTransmutation();
            this.lastTransmutation = time;
        }

        // Update circle position
        this.transmutationCircle.setPosition(this.player.x, this.player.y);
        this.transmutationCircle.setRadius(this.transmutationRadius);
        
        // Flash circle when cooldown is almost up or just happened
        const timeSinceLast = time - this.lastTransmutation;
        if (timeSinceLast < 200) {
            this.transmutationCircle.setVisible(true);
            this.transmutationCircle.setAlpha(1 - (timeSinceLast / 200));
        } else {
            this.transmutationCircle.setVisible(false);
        }

        // Update HUD (via events or direct reference if possible)
        this.events.emit("updateHud", {
            kills: this.kills,
            time: this.gameTime,
            nextUpgrade: this.nextUpgradeKills - this.kills
        });
    }

    private performTransmutation() {
        const enemiesInRange = this.enemies.getChildren().filter((enemy: any) => {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            return dist <= this.transmutationRadius;
        });

        enemiesInRange.forEach((enemy: any) => {
            enemy.destroy();
            this.kills++;
            
            if (this.kills >= this.nextUpgradeKills) {
                this.nextUpgradeKills += 30;
                this.scene.pause();
                this.scene.launch("UpgradeScene");
            }
        });
    }
}
