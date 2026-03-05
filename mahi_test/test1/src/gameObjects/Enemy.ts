export abstract class Enemy extends Phaser.GameObjects.Rectangle {
    public body: Phaser.Physics.Arcade.Body;
    protected moveSpeed: number = 50;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color: number) {
        super(scene, x, y, width, height, color);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body = this.body as Phaser.Physics.Arcade.Body;
    }

    public abstract update(player: Phaser.GameObjects.Sprite): void;

    public destroy(fromScene?: boolean): void {
        super.destroy(fromScene);
    }
}

export class Soldier extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 20, 20, 0xff0000);
        this.moveSpeed = 80;
    }

    public update(player: Phaser.GameObjects.Sprite): void {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.body.setVelocity(
            Math.cos(angle) * this.moveSpeed,
            Math.sin(angle) * this.moveSpeed
        );
    }
}

export class Sniper extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 15, 15, 0xffa500);
        this.moveSpeed = 60;
    }

    public update(player: Phaser.GameObjects.Sprite): void {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance > 300) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.body.setVelocity(
                Math.cos(angle) * this.moveSpeed,
                Math.sin(angle) * this.moveSpeed
            );
        } else {
            this.body.setVelocity(0, 0);
        }
    }
}

export class Tank extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 40, 40, 0x808080);
        this.moveSpeed = 40;
    }

    public update(player: Phaser.GameObjects.Sprite): void {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.body.setVelocity(
            Math.cos(angle) * this.moveSpeed,
            Math.sin(angle) * this.moveSpeed
        );
    }
}
