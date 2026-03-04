import GamePlay from '../scenes/GamePlay';
export default class EnemySnowball extends Phaser.Physics.Arcade.Sprite
{
    private _scene:GamePlay;
    constructor (scene:Phaser.Scene, x:number, y:number, key:string, frame:number)
    {
        super(scene, x, y, key, frame);

        this._scene = <GamePlay>scene;


        this.setScale(0.5);
    }

    fire (x:number, y:number)
    {
        this.body.enable = true;
        this.body.reset(x + 10, y - 44);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(200);
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

        if (this.x >= 970)
        {
            this.Stop();

            this._scene.gameOver();
        }
    }
}