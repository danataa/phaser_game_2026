import GamePlay from "../scenes/GamePlay";

export default class Germ extends Phaser.Physics.Arcade.Sprite
{
    private speed:number;
    private lifespan:number;
    private isChasing:boolean;
    private target:Phaser.Math.Vector2;
    private _gamePlay:GamePlay

    constructor (scene:Phaser.Scene, x:number, y:number, animation:string, speed:number)
    {
        super(scene, x, y, 'assets');

        this.play(animation)

        this.setScale(Phaser.Math.FloatBetween(1, 2));

        this.speed = speed;

        this.alpha = 0;
        this.lifespan = 0;
        this.isChasing = false;
        this._gamePlay = scene as GamePlay

        this.target = new Phaser.Math.Vector2();
    }

    Start (chaseDelay:number)
    {
        this.setCircle(14, 6, 2);

        if (!chaseDelay)
        {
            chaseDelay = Phaser.Math.RND.between(3000, 8000);

            this.scene.sound.play('appear');
        }

        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 2000,
            ease: 'Linear',
            hold: chaseDelay,
            onComplete: () => {
                if (this._gamePlay.player.isAlive)
                {
                    this.lifespan = Phaser.Math.RND.between(6000, 12000);
                    this.isChasing = true;
                }
            }
        });

        return this;
    }

    Restart (x:number, y:number)
    {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(0);

        return this.Start(0);
    }

    preUpdate (time:number, delta:number)
    {
        super.preUpdate(time, delta);

        if (this.isChasing)
        {
            this.lifespan -= delta;

            if (this.lifespan <= 0)
            {
                this.isChasing = false;

                this.body.stop();

                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: 1000,
                    ease: 'Linear',
                    onComplete: () => {
                        this.setActive(false);
                        this.setVisible(false);
                    }
                });
            }
            else
            {
                this._gamePlay.getPlayer(this.target);
            
                //  Add 90 degrees because the sprite is drawn facing up
                this.rotation = this.scene.physics.moveToObject(this, this.target, this.speed) + 1.5707963267948966;
            }
        }
    }

    Stop ()
    {
        this.isChasing = false;

        this.body.stop();
    }
}