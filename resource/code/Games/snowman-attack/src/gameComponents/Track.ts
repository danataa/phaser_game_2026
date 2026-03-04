import Snowman from './Snowman';
import PlayerSnowball from './PlayerSnowball';
import EnemySnowball from './EnemySnowball';

export default class Track
{

    private scene:Phaser.Scene;
    private id:number;
    private y:number;
    private nest:Phaser.Physics.Arcade.Image;
    private snowmanBig:Snowman;
    private snowmanSmall:Snowman;
    private playerSnowballs:Phaser.Physics.Arcade.Group;
    private enemySnowballs:Phaser.Physics.Arcade.Group;
    private snowBallCollider:Phaser.Physics.Arcade.Collider;
    private snowmanSmallCollider:Phaser.Physics.Arcade.Collider;
    private snowmanBigCollider:Phaser.Physics.Arcade.Collider;
    private releaseTimerSmall:Phaser.Time.TimerEvent;
    private releaseTimerBig:Phaser.Time.TimerEvent;

    constructor (scene:Phaser.Scene, id:number, trackY:number)
    {
        this.scene = scene;
        this.id = id;
        this.y = trackY;

        this.nest = scene.physics.add.image(1024, trackY - 10, 'sprites', 'nest').setOrigin(1, 1);

        this.snowmanBig = new Snowman(scene, this, 'Big');
        this.snowmanSmall = new Snowman(scene, this, 'Small');

        this.playerSnowballs = scene.physics.add.group({
            frameQuantity: 8,
            key: 'sprites',
            frame: 'snowball2',
            active: false,
            visible: false,
            classType: PlayerSnowball
        });

        this.enemySnowballs = scene.physics.add.group({
            frameQuantity: 8,
            key: 'sprites',
            frame: 'snowball3',
            active: false,
            visible: false,
            classType: EnemySnowball
        });

        this.snowBallCollider = scene.physics.add.overlap(this.playerSnowballs, this.enemySnowballs, this.hitSnowball, null, this);
        this.snowmanSmallCollider = scene.physics.add.overlap(this.snowmanSmall, this.playerSnowballs, this.hitSnowman, null, this);
        this.snowmanBigCollider = scene.physics.add.overlap(this.snowmanBig, this.playerSnowballs, this.hitSnowman, null, this);

        this.releaseTimerSmall;
        this.releaseTimerBig;
    }

    start (minDelay:number, maxDelay:number)
    {
        const delay = Phaser.Math.Between(minDelay, maxDelay);

        this.releaseTimerSmall = this.scene.time.addEvent({

            delay: delay,

            callback: () => {
                this.snowmanSmall.start();
            }
        });

        this.releaseTimerBig = this.scene.time.addEvent({

            delay: delay * 3,

            callback: () => {
                this.snowmanBig.start();
            }
        });
    }

    Stop ()
    {
        this.snowmanSmall.Stop();
        this.snowmanBig.Stop();

        for (let snowball of <any>this.playerSnowballs.getChildren())
        {
            snowball.Stop();
        }

        for (let snowball of <any>this.enemySnowballs.getChildren())
        {
            snowball.Stop();
        }

        this.releaseTimerSmall.remove();
        this.releaseTimerBig.remove();
    }

    hitSnowball (ball1:any, ball2:any)
    {
        ball1.Stop();
        ball2.Stop();
    }

    hitSnowman (snowman:any, ball:any)
    {
        if (snowman.isAlive && snowman.x > 0)
        {
            ball.Stop();
            snowman.hit();
        }
    }

    throwPlayerSnowball (x:number)
    {
        let snowball = this.playerSnowballs.getFirstDead(false);

        if (snowball)
        {
            snowball.fire(x, this.y);
        }
    }

    throwEnemySnowball (x:number)
    {
        let snowball = this.enemySnowballs.getFirstDead(false);

        if (snowball)
        {
            snowball.fire(x, this.y);
        }
    }
}