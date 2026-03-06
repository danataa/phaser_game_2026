export default class Intro extends Phaser.Scene {




  constructor() {
    super({
      key: "Intro",
    });

  }

  init (data:any)
  {
    

  }

  preload() {


  }
  create() {

    this.add.image(0, 0, 'intro-bg').setOrigin(0, 0);
    let _logo=this.add.image(640 / 2, 360 / 2, 'intro-logo').setAlpha(0);

    this.tweens.add({
      targets: _logo,
      alpha: 1,
      duration: 2000,
      ease: 'Power2'
    });

this.add.text(this.game.canvas.width/2, this.game.canvas.height/2, 'Start Game', { fontFamily: 'Nosifer', fontSize: 48, color: '#ffffff' }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
  this.scene.start('GamePlay');
}
);

  //  this.scene.start('GamePlay');
  

  }

  update(time: number, delta: number): void {

   

  }

}

