export default class Intro extends Phaser.Scene {

  private _image1: Phaser.GameObjects.Image;
  private music: Phaser.Sound.BaseSound;


  constructor() {
    super({
      key: "Intro",
    });

  }

  preload() {


  }
  create() {

    this.add.image(512, 384, 'title');

    let sign = this.add.image(512, -400, 'logo');

    this.tweens.add({
        targets: sign,
        y: 180,
        ease: 'Bounce.easeOut',
        duration: 2000
    });

    let cactus1 = this.add.image(150, 680, 'bank-panic', 'cactus');
    let cactus2 = this.add.image(880, 680, 'bank-panic', 'cactus').setFlipX(true);

    this.tweens.add({
        targets: cactus1,
        props: {
            scaleX: { value: 0.9, duration: 250 },
            scaleY: { value: 1.1, duration: 250 },
            angle: { value: -20, duration: 500, delay: 250 },
            y: { value: 660, duration: 250 }
        },
        ease: 'Sine.easeInOut',
        repeat: -1,
        yoyo: true
    });

    this.tweens.add({
        targets: cactus2,
        props: {
            scaleX: { value: 0.9, duration: 250 },
            scaleY: { value: 1.1, duration: 250 },
            angle: { value: 20, duration: 500, delay: 250 },
            y: { value: 660, duration: 250 }
        },
        ease: 'Sine.easeInOut',
        repeat: -1,
        yoyo: true
    });

    this.music = this.sound.add('music', { loop: true });
    this.music.play();

    this.add.text(512, 600, 'Click to ', { fontFamily: 'Arial', fontSize: 48, color: '#ffffff' }).setOrigin(0.5).setStroke('#000000', 6);
    this.add.image(512, 700, 'start').setScale(0.5);
    this.input.once('pointerdown', () => {

        this.sound.stopAll();

        this.sound.play('shot');

        this.scene.stop(this);

        this.scene.start('GamePlay');

    });

  }

  update(time: number, delta: number): void {

    

  }

}

