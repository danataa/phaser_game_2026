export default class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors: any;
    private moveSpeed: number = 200;
    private hasShield: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.initAnimations();

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            });
        }
    }

    private initAnimations() {
        if (!this.scene.anims.exists("player-idle")) {
            this.scene.anims.create({
                key: "player-idle",
                frames: this.scene.anims.generateFrameNumbers("player", { start: 0, end: 0 }),
                frameRate: 1,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists("player-walk")) {
            this.scene.anims.create({
                key: "player-walk",
                frames: this.scene.anims.generateFrameNumbers("player", { frames: [0,1,2,3,4,5,6,7] }),
                frameRate: 10,
                yoyo: false,
                repeat: -1
            });
        }
    }

    public update() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);

        let isMoving = false;

        if (this.cursors.left.isDown) {
            body.setVelocityX(-this.moveSpeed);
            this.setFlipX(true);
            isMoving = true;
        } else if (this.cursors.right.isDown) {
            body.setVelocityX(this.moveSpeed);
            this.setFlipX(false);
            isMoving = true;
        }

        if (this.cursors.up.isDown) {
            body.setVelocityY(-this.moveSpeed);
            isMoving = true;
        } else if (this.cursors.down.isDown) {
            body.setVelocityY(this.moveSpeed);
            isMoving = true;
        }

        // Normalize and scale the velocity so that player can't move faster along a diagonal
        body.velocity.normalize().scale(this.moveSpeed);

        if (isMoving) {
            this.play("player-walk", true);
        } else {
            this.play("player-idle", true);
        }
    }

    public setMoveSpeed(speed: number) {
        this.moveSpeed = speed;
    }

    public getMoveSpeed(): number {
        return this.moveSpeed;
    }

    public setShield(value: boolean) {
        this.hasShield = value;
        if (value) {
            this.setTint(0x00ffff);
        } else {
            this.clearTint();
        }
    }

    public getShield(): boolean {
        return this.hasShield;
    }
}
