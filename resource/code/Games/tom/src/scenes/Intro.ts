export default class Intro extends Phaser.Scene {

  private _image1: Phaser.GameObjects.Image;
  private points: number;
  private betsPoints: number;
  private logoMenu: Phaser.GameObjects.Image;
  private pointsText: Phaser.GameObjects.BitmapText;
  private bestPointsText: Phaser.GameObjects.BitmapText;


  constructor() {
    super({
      key: "Intro",
    });

  }

  init (data:any)
  {
      this.points = 0;

      if(Object.keys(data).length !== 0)
      {
          this.points = data.points;
      }

  }

  preload() {


  }
  create() {

    const pointsDB:number = parseInt(localStorage.getItem('best_points'));
    this.betsPoints = (pointsDB !== null) ? pointsDB : 0;

    this.add.image(0, 0, 'background').setOrigin(0);

    this.add.image(0, 0, 'wall')
        .setOrigin(0);
    this.add.image(this.scale.width, 0, 'wall')
        .setOrigin(1, 0)
        .setFlipX(true);

    this.add.image(0, this.scale.height, 'floor')
        .setOrigin(0, 1);

    this.logoMenu = this.add.image(
        this.scale.width/2,
        this.scale.height/2,
        'logo'
    ).setScale(2).setInteractive();

    this.pointsText = this.add.bitmapText(
        this.scale.width/2,
        this.scale.height - 100,
        'pixelFont',
        'POINTS ' + this.points
    ).setDepth(2).setOrigin(0.5);

    this.bestPointsText = this.add.bitmapText(
        this.scale.width/2,
        this.scale.height - 80,
        'pixelFont',
        'BEST ' + this.betsPoints
    ).setDepth(2).setOrigin(0.5);



    this.logoMenu.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.add.tween({
            targets: this.logoMenu,
            ease: 'Bounce.easeIn',
            y: -200,
            duration: 1000,
            onComplete: () => {
                this.scene.start('GamePlay');
            }
        });

        this.add.tween({
            targets: [ this.pointsText, this.bestPointsText ],
            ease: 'Bounce.easeIn',
            y: 400,
            duration: 1000
        });
    });

    if(this.points > this.betsPoints) {
        localStorage.setItem('best_points', ""+this.points);
    }

  }

  update(time: number, delta: number): void {

   

  }

}

