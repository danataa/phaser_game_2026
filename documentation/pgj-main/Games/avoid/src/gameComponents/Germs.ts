import Germ from './Germ';

export default class Germs extends Phaser.Physics.Arcade.Group
{
    

    private germConfig:any;
    private timedEvent:Phaser.Time.TimerEvent;

    constructor (world:any, scene:Phaser.Scene)
    {
        super(world, scene);

        this.classType = Germ;

        this.germConfig = [
            { animation: 'germ1', speed: 60 },
            { animation: 'germ2', speed: 90 },
            { animation: 'germ3', speed: 120 },
            { animation: 'germ4', speed: 180 }
        ];
    }

    start ()
    {
        let germ1 = new Germ(this.scene, 100, 100, 'germ1', 60);
        let germ2 = new Germ(this.scene, 700, 600, 'germ1', 60);
        let germ3 = new Germ(this.scene, 200, 400, 'germ1', 60);

        this.add(germ1, true);
        this.add(germ2, true);
        this.add(germ3, true);

        germ1.Start(1000);
        germ2.Start(2000);
        germ3.Start(0);

        this.timedEvent = this.scene.time.addEvent({ delay: 2000, callback: this.releaseGerm, callbackScope: this, loop: true });
    }

    stop ()
    {
        this.timedEvent.remove();

        this.getChildren().forEach((child:any) => {

            child.Stop();

        });
    }

    releaseGerm ()
    {
        const x = Phaser.Math.RND.between(0, 800);
        const y = Phaser.Math.RND.between(0, 600);

        let germ:any;

        let config:any = Phaser.Math.RND.pick(this.germConfig);

        this.getChildren().forEach((child:any) => {

            if (child.anims.getName() === config.animation && !child.active)
            {
                //  We found a dead matching germ, so resurrect it
                germ = child;
            }

        });

        if (germ)
        {
            germ.Restart(x, y);
        }
        else
        {
            germ = new Germ(this.scene, x, y, config.animation, config.speed);

            this.add(germ, true);

            germ.Start();
        }
    }
}