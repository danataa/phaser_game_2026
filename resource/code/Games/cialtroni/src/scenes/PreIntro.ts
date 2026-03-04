import { language } from "../Enums";
import { translations } from "../Translations";

export default class PreIntro extends Phaser.Scene {


  private _containerStep1: Phaser.GameObjects.Container;
  private _step1_grass: Phaser.GameObjects.Image;
  private _step1_bg: Phaser.GameObjects.Image;
  private _step1_clouds: Phaser.GameObjects.Image;
  private _step1_badguy: Phaser.GameObjects.Image;
  private _step1_goodguy: Phaser.GameObjects.Image;

  private _containerStep2: Phaser.GameObjects.Container;
  private _step2_goodguy: Phaser.GameObjects.Sprite;
  private _step2_badguy: Phaser.GameObjects.Sprite;
  private _step2_bg: Phaser.GameObjects.Image;

  private _containerStep3: Phaser.GameObjects.Container;
  private _step3_mask_left: Phaser.GameObjects.Image;
  private _step3_mask_right: Phaser.GameObjects.Image;
  private _step3_lines_left: Phaser.GameObjects.TileSprite;
  private _step3_lines_right: Phaser.GameObjects.TileSprite;
  private _step3_badguy: Phaser.GameObjects.Sprite;
  private _step3_goodguy: Phaser.GameObjects.Sprite;

  private _containerStep4: Phaser.GameObjects.Container;
  private _step4_bg: Phaser.GameObjects.Image;
  private _step4_badguy: Phaser.GameObjects.Image;
  private _step4_goodguy: Phaser.GameObjects.Image;
  private _step4_slash1: Phaser.GameObjects.Sprite;
  private _step4_slash2: Phaser.GameObjects.Sprite;

  private _containerStep5: Phaser.GameObjects.Container;
  private _step5_bg: Phaser.GameObjects.Image;
  private _step5_badguy: Phaser.GameObjects.Sprite;
  private _step5_goodguy: Phaser.GameObjects.Sprite;
  private _step5_1280x110_bottom: Phaser.GameObjects.Image;
  private _step5_1280x110_top: Phaser.GameObjects.Image;

  private _skipText: Phaser.GameObjects.Text;

  private _audio: Phaser.Sound.BaseSound;

  private _currentLanguage: language = language.english;

  constructor() {
    super({
      key: "PreIntro",
    });
  }

  preload() { }


  create() {

    this._currentLanguage = this.registry.get("language") || language.english;
    //setta il background di sfondo a nero
    this.cameras.main.setBackgroundColor("#000000");
    this.cameras.main.fadeIn(250, 0, 0, 0);

    this._skipText = this.add.text(1280 - 20, 720 - 20, translations[this._currentLanguage].skip, {
      fontSize: "20px",
      color: "#ffffff"
    }).setOrigin(1, 1).setInteractive().setDepth(1000).setFontFamily("PressStart2P").on("pointerover", () => {
      this._skipText.setColor("#ff0000");
    }).on("pointerout", () => {
      this._skipText.setColor("#ffffff");
    }).on("pointerdown", () => {
      this.fadeOut();
    });

    this._audio = this.sound.add("breeze");
    this._audio.play({ loop: true });

    this._containerStep1 = this.add.container(0, 0);
    this._containerStep2 = this.add.container(0, 0).setVisible(false);
    this._containerStep3 = this.add.container(0, 0).setVisible(false);
    this._containerStep4 = this.add.container(0, 0).setVisible(false);
    this._containerStep5 = this.add.container(0, 0).setVisible(false);


    // Step 1
    //----------------------------------------
    let _1280x110_top = this.add.image(0, 0, "1280x110").setOrigin(0, 0);
    let _1280x110_bottom = this.add.image(0, 720, "1280x110").setOrigin(0, 1);
    this._step1_grass = this.add.image(0, 610, "step1-grass").setOrigin(0, 1);
    this._step1_bg = this.add.image(-100, 610, "step1-bg").setOrigin(0, 1);
    this._step1_clouds = this.add.image(0, 110, "step1-clouds").setOrigin(0, 0);
    this._step1_badguy = this.add.image(200, 660, "step1-badguy").setOrigin(0, 1);
    this._step1_goodguy = this.add.image(1000, 620, "step1-goodguy").setOrigin(0, 1);
    this._containerStep1.add([this._step1_bg, this._step1_clouds, this._step1_badguy, this._step1_goodguy, this._step1_grass, _1280x110_top, _1280x110_bottom
    ]);


    // Step 2
    //----------------------------------------
    let _400x720 = this.add.image(1280 / 2, 0, "400x720").setOrigin(.5, 0);
    let _100x720_left = this.add.image(0, 0, "100x720").setOrigin(0, 0);
    let _100x720_right = this.add.image(1280, 0, "100x720").setOrigin(1, 0);
    this._step2_bg = this.add.image(0, 0, "step2-bg").setOrigin(0, 0);
    this._step2_badguy = this.add.sprite(0, 50, "step2-faces").setOrigin(0, 0).setFrame(0).setScale(5)
    this._step2_goodguy = this.add.sprite(1230, -300, "step2-faces").setOrigin(1, 0).setFrame(2).setScale(5)
    this._containerStep2.add([this._step2_bg, this._step2_goodguy, this._step2_badguy, _100x720_left, _400x720, _100x720_right]);

    //step 3
    //----------------------------------------
    let _step3_1280x110_top = this.add.image(0, 0, "1280x110").setOrigin(0, 0);
    let _step3_1280x110_bottom = this.add.image(0, 720, "1280x110").setOrigin(0, 1);
    this._step3_mask_left = this.add.image(100, 110, "step3-mask").setOrigin(0, 0);
    this._step3_mask_right = this.add.image(1180, 610, "step3-mask").setOrigin(1, 1).setFlipX(true);

    this._step3_lines_left = this.add.tileSprite(0, 110, 1280, 211, "step3-lines").setOrigin(0, 0);
    this._step3_lines_right = this.add.tileSprite(1280, 610, 1280, 211, "step3-lines").setOrigin(1, 1);

    let _1280x70 = this.add.image(0, 720 / 2, "1280x70").setOrigin(0, 0.5);


    this._step3_badguy = this.add.sprite(-500, 320, "player-beat").setOrigin(0, 1).setScale(3);
    let _animation: Phaser.Types.Animations.Animation = {
      key: "bad-guy-run",
      frames: this.anims.generateFrameNumbers("player-beat", { frames: [35, 36, 37, 42, 43, 44] }),
      frameRate: 15,
      yoyo: false,
      repeat: -1
    };

    this.anims.create(_animation);

    this._step3_badguy.play("bad-guy-run");

    this._step3_goodguy = this.add.sprite(1200, 600, "player-beat").setOrigin(0, 1).setFlipX(true).setScale(3);
    let _animation2: Phaser.Types.Animations.Animation = {
      key: "good-guy-run",
      frames: this.anims.generateFrameNumbers("player-beat", { frames: [7, 8, 9, 10, 11, 12] }),
      frameRate: 15,
      yoyo: false,
      repeat: -1
    };

    this.anims.create(_animation2);

    this._step3_goodguy.play("good-guy-run");

    this._containerStep3.add([this._step3_lines_left, this._step3_lines_right, this._step3_badguy, this._step3_goodguy, this._step3_mask_left, this._step3_mask_right, _step3_1280x110_top, _step3_1280x110_bottom, _1280x70]);

    // Step 4
    //----------------------------------------


    this._step4_bg = this.add.image(0, 0, "step4-bg").setOrigin(0, 0);
    this._step4_badguy = this.add.image(380, 520, "step4-badguy").setOrigin(0, 1);
    this._step4_goodguy = this.add.image(1040, 520, "step4-goodguy").setOrigin(1, 1);
    this._step4_slash1 = this.add.sprite(600, 360, "step4-slash").setOrigin(0.5).setAlpha(0);
    this._step4_slash2 = this.add.sprite(680, 360, "step4-slash").setOrigin(0.5).setAlpha(0).setFlipX(true);
    let _animation4: Phaser.Types.Animations.Animation = {
      key: "slash",
      frames: this.anims.generateFrameNumbers("step4-slash", { frames: [0, 1, 2, 3, 4, 5] }),
      frameRate: 20,
      yoyo: false,
      repeat: 0
    };

    this.anims.create(_animation4);

    this._containerStep4.add([this._step4_bg, this._step4_badguy, this._step4_goodguy, this._step4_slash1, this._step4_slash2]);


    // Step 5
    //----------------------------------------
    this._step5_1280x110_bottom = this.add.image(0, 660, "1280x110").setOrigin(0, 1);
    this._step5_1280x110_top = this.add.image(0, 60, "1280x110").setOrigin(0, 0);
    this._step5_bg = this.add.image(640, 360, "step5-bg").setOrigin(.5);
    this._step5_badguy = this.add.sprite(0, 630, "step5-badguy").setOrigin(0, 1);
    this._step5_goodguy = this.add.sprite(1280, 550, "step5-goodguy").setOrigin(1, 1);
    let _animation3: Phaser.Types.Animations.Animation = {
      key: "good-guy-ray",
      frames: this.anims.generateFrameNumbers("step5-goodguy", { frames: [1, 2, 3, 0] }),
      frameRate: 20,
      yoyo: false,
      repeat: 0
    };

    this.anims.create(_animation3);
    this._containerStep5.add([this._step5_bg, this._step5_badguy, this._step5_goodguy, this._step5_1280x110_bottom, this._step5_1280x110_top]);
    this._step5_goodguy.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      () => {
        let _anim = this._step5_goodguy.anims.currentAnim.key;
        if (
          _anim == "good-guy-ray"
        ) {
          this.stepFinale();
        }
      },
      this
    );

    this.step1Animations();


  }

  step1Animations() {

    this.tweens.add({
      targets: this._step1_grass,
      x: -400,
      duration: 3000,
      ease: "Power2",
      yoyo: false,
      repeat: 0,
    });

    this.tweens.add({
      targets: this._step1_badguy,
      x: "-=80",
      duration: 3000,
      ease: "Power2",
      yoyo: false,
      repeat: 0,
    });

    this.tweens.add({
      targets: this._step1_goodguy,
      x: "-=40",
      duration: 3000,
      ease: "Power2",
      yoyo: false,
      repeat: 0,
    });

    this.tweens.add({
      targets: this._step1_clouds,
      x: "-=50",
      duration: 3000,
      ease: "Power2",
      yoyo: false,
      repeat: 0,
    });


    this.tweens.add({
      targets: this._step1_bg,
      x: "-=20",
      duration: 3000,
      ease: "Power2",
      yoyo: false,
      repeat: 0,
      onComplete: () => {

        this.step2Animations();
      }
    });

  }

  step2Animations() {
    this.sound.playAudioSprite("sfx-intro", "step2-intro", { volume: 1 });
    this._containerStep1.visible = false;
    this._containerStep2.visible = true;


    this.tweens.add({
      targets: this._step2_badguy,
      y: "-=100",
      duration: 2300,
      ease: Phaser.Math.Easing.Sine.Out,
      yoyo: false,
      repeat: 0,
    });

    this.tweens.add({
      targets: this._step2_goodguy,
      y: "+=100",
      duration: 2300,
      ease: Phaser.Math.Easing.Sine.Out,
      yoyo: false,
      repeat: 0,
      onComplete: () => {
        this.sound.playAudioSprite("sfx-intro", "step2-start", { volume: 1 });
        this._step2_badguy.setFrame(1);
        this._step2_goodguy.setFrame(3);
        this.time.addEvent({
          delay: 500,
          callback: () => {
            this.step3Animations();
          }
        });
      }
    });



  }

  step3Animations() {
    this._containerStep1.visible = false;
    this._containerStep2.visible = false;
    this._containerStep3.visible = true;
    this.sound.playAudioSprite("sfx-intro", "step3-steps", { volume: 1 });


    this.tweens.add({
      targets: this._step3_lines_left,
      tilePositionX: "+=2850",
      duration: 1000,
      ease: "linear",
      yoyo: false,
      repeat: 0,
    });

    this.tweens.add({
      targets: [this._step3_mask_left, this._step3_badguy],
      x: "+=500",
      duration: 1000,
      ease: "Power2",
      yoyo: false,
      repeat: 0,
    });

    this.tweens.add({
      targets: this._step3_lines_right,
      tilePositionX: "-=2850",
      duration: 1000,
      ease: "linear",
      yoyo: false,
      repeat: 0,
    });

    this.tweens.add({
      targets: [this._step3_mask_right, this._step3_goodguy],
      x: "-=500",
      duration: 1000,
      ease: "Power2",
      yoyo: false,
      repeat: 0,

    });


    this.time.addEvent({
      delay: 1000, callback: () => {

        this._step3_goodguy.stop().setFrame(15);
        this._step3_badguy.stop().setFrame(43);
        this.sound.playAudioSprite("sfx-intro", "step4-jump", { volume: 1 });
        this.tweens.add({
          targets: [this._step3_goodguy, this._step3_badguy],
          y: "-=50",
          duration: 150,
          ease: "Linear",
          yoyo: false,
          repeat: 0,
          onComplete: () => {
            this.step4Animations();
          }
        });



      }
    });

  }


  step4Animations() {

    this._containerStep1.visible = false;
    this._containerStep2.visible = false;
    this._containerStep3.visible = false;
    this._containerStep4.visible = true;

    this.tweens.add({
      targets: this._step4_badguy,
      x: "+=40",
      duration: 1000,
      ease: "Linear",
      yoyo: false,
      repeat: 0,
    });

    this.tweens.add({
      targets: this._step4_goodguy,
      x: "-=40",
      duration: 1000,
      ease: "Linear",
      yoyo: false,
      repeat: 0,
      onComplete: () => {
        this._step4_goodguy.setTintFill(0x000000);
        this._step4_badguy.setTintFill(0x000000);
        this._step4_bg.setTintFill(0x000000);
        this._step4_slash1.setAlpha(1);
        this._step4_slash1.play("slash");
        this.sound.playAudioSprite("sfx-intro", "step4-slash", { volume: 1 });
        this.time.addEvent({
          delay: 250,
          callback: () => {
            this._step4_slash2.setAlpha(1);
            this._step4_slash2.play("slash");

            this.time.addEvent({
              delay: 1700,
              callback: () => {
                this.step5Animations();
              }
            });


          }
        });

      }
    });



  }

  step5Animations() {
    this._containerStep1.visible = false;
    this._containerStep2.visible = false;
    this._containerStep3.visible = false;
    this._containerStep4.visible = false;
    this._containerStep5.visible = true;

    this.tweens.add({
      targets: this._step5_badguy,
      x: "+=100",
      duration: 2000,
      ease: Phaser.Math.Easing.Sine.Out,
      yoyo: false,
      repeat: 0,
    });

    this.tweens.add({
      targets: this._step5_goodguy,
      x: "-=100",
      duration: 2000,
      ease: Phaser.Math.Easing.Sine.Out,
      yoyo: false,
      repeat: 0,
      onComplete: () => {
        this._step5_goodguy.play("good-guy-ray");
      }
    });



  }


  stepFinale() {

    this.time.addEvent({
      delay: 500, callback: () => {


        this._step5_badguy.setFrame(1);
        this.sound.playAudioSprite("sfx-intro", "step5-fall", { volume: 1 });

        this.time.addEvent({
          delay: 300,
          callback: () => {
            this.sound.playAudioSprite("sfx-intro", "step5-thunder", { volume: 1 });
            this._step5_bg.setTintFill(0xffffff);
            this._step5_1280x110_bottom.setTintFill(0xffffff);
            this._step5_1280x110_top.setTintFill(0xffffff);
            this._step5_badguy.setTintFill(0x000000);
            this._step5_goodguy.setTintFill(0x000000);

            this.time.addEvent({
              delay: 100,
              callback: () => {


                this._step5_bg.clearTint();
                this._step5_1280x110_bottom.clearTint();
                this._step5_1280x110_top.clearTint();
                this._step5_badguy.clearTint();
                this._step5_goodguy.clearTint();


                this.time.addEvent({
                  delay: 100,
                  callback: () => {


                    this._step5_bg.setTintFill(0xffffff);
                    this._step5_1280x110_bottom.setTintFill(0xffffff);
                    this._step5_1280x110_top.setTintFill(0xffffff);
                    this._step5_badguy.setTintFill(0x000000);
                    this._step5_goodguy.setTintFill(0x000000);


                    this.time.addEvent({
                      delay: 100,
                      callback: () => {
                        this.fadeOut();

                      }
                    });


                  }
                });


              }
            });
          }
        });

      }
    });


  }


  fadeOut() {

    this.cameras.main.fadeOut(500, 255, 255, 255, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {

      if (progress == 1) {

        this._audio.stop();
        this.scene.start("Intro");
        this.scene.start("Menu");
        this.scene.bringToTop("Menu");
      }
    }, this);

  }


  update(time: number, delta: number): void { }




}

