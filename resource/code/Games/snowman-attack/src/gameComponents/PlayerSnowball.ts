export default class PlayerSnowball extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene:Phaser.Scene, x:number, y:number, key:string, frame:number)
    {
        super(scene, x, y, key, frame);

        this.setScale(0.5);
    }

    fire (x:number, y:number)
    {
        this.body.enable = true;
        this.body.reset(x + 10, y - 44);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(-600);
        this.setAccelerationX(-1400);
    }

    Stop ()
    {
        this.setActive(false);
        this.setVisible(false);

        this.setVelocityX(0);

        this.body.enable = false;
    }

    preUpdate (time:number, delta:number)
    {
        super.preUpdate(time, delta);

        if (this.x <= -64)
        {
            this.Stop();
        }
    }
}