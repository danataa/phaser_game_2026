import { GameData } from "../GameData";
import { gameType, language } from "../Enums";
import { translations } from "../Translations";
import { Leaderboard } from "./LeaderBoard";
import Audio from './Audio';
import InputScore from "../gameComponents/others/InputScore";
import CustomPipelineGrayscale from "../gameComponents/pipelines/CustomPipelineGrayscale";

export default class GameOver extends Phaser.Scene {
  private _leaderBoard: Leaderboard;
  private _Audio: Audio;
  private _inputScore: InputScore;
  private _inputContainer: Phaser.GameObjects.Container;
  private _currentLanguage: language = language.english;
  private _countdown: Phaser.GameObjects.Sprite;
  private _countdownSeq: Array<number> = [20, 19, 19, 20, 0, 18, 17, 17, 18, 0, 16, 15, 15, 16, 0, 14, 13, 13, 14, 0, 12, 11, 11, 12, 0, 10, 9, 9, 10, 0, 8, 7, 7, 8, 0, 6, 5, 5, 6, 0, 4, 3, 3, 4, 0, 2, 1, 1, 2, 0];
  private _gameOvertype: string = "game-over"; //"game-over" o "time-over" o "win"
  private _level: number = 0;
  private _levelData: levelConfig;
  private _portraitLeft: Phaser.GameObjects.Sprite;
  private _portraitRight: Phaser.GameObjects.Sprite;
  private _portraitBgLeft: Phaser.GameObjects.Image;
  private _portraitBgRight: Phaser.GameObjects.Image;
  private _portraitLeftText: Phaser.GameObjects.Text;
  private _portraitRightText: Phaser.GameObjects.Text;
  private _score: number = 0;
  private _endText: Phaser.GameObjects.Text;
  private _GameOverText: Phaser.GameObjects.Text;
  private _screenShotImage: Phaser.GameObjects.Image;
  private _saved:boolean=false;

  constructor() {
    super({
      key: "GameOver",
    });


  }


  init(data: any) {


    this._gameOvertype = data.type || "game-over";
    this._level = data.level || 0;

  }

  create() {

    this.cameras.main.setBackgroundColor("#000000");
    this._Audio = <Audio>this.scene.get("Audio");

    if (this.scene.getIndex("GamePlay")) this.scene.remove("GamePlay");
    if (this.scene.getIndex("Hud")) this.scene.remove("Hud");

    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      this._currentLanguage = parseInt(savedLanguage) as language;
    }

    this._score = <number>this.registry.get("score");
    this.registry.set("score", 0);

    if (this._score == null || this._score == undefined) this._score = 0;

    this._levelData = GameData.levels[this._level];


    this._inputScore = new InputScore(this, this._currentLanguage, this._score);
    this._inputScore.setPosition(0, 500);
    this.add.existing(this._inputScore);

    this._portraitLeftText = this.add.text(200, 60, "Borrelli", { fontFamily: "PressStart2P", fontSize: "26px", color: "#ffffff", align: "center", wordWrap: { width: 200 } }).setOrigin(0.5, 0.5).setDepth(1001).setStroke("#000000", 6).setAlpha(0);
    this._portraitRightText = this.add.text(1080, 60, this._levelData.beat.enemyName, { fontFamily: "PressStart2P", fontSize: "26px", color: "#ffffff", align: "center", wordWrap: { width: 200 } }).setOrigin(0.5, 0.5).setDepth(1001).setStroke("#000000", 6).setAlpha(0);

    this._portraitBgLeft = this.add.image(200, 200, "portraitBg").setAlpha(0);
    this._portraitBgRight = this.add.image(1080, 200, "portraitBg").setAlpha(0);

    this._portraitLeft = this.add.sprite(200, 200, "portraits", 0).setAlpha(0);
    this._portraitRight = this.add.sprite(1080, 200, "portraits", this._levelData.beat.enemyFrameLose - 1).setAlpha(0);

    this._countdown = this.add.sprite(
      this.game.canvas.width / 2,
      200,
      "countdown"
    ).setOrigin(0.5, 0.5).setScale(1).setFrame(0).setAlpha(0);

    if (!this.anims.exists("countdown_anim")) {
      this.anims.create({
        key: "countdown_anim",
        frames: this._countdownSeq.map((f) => { return { key: "countdown", frame: f }; }),
        frameRate: 4,
        repeat: 0,
      });
    }


    this._countdown.on(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      (
        anim: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame,
        sprite: Phaser.GameObjects.Sprite,
        frameKey: string
      ) => {

        if (anim.key === "countdown_anim" && frame.textureFrame === 0) {
          this._Audio.playSfx("countdown", .3);
        }
      },
      this
    );

    this._countdown.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (
        anim: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame,
        sprite: Phaser.GameObjects.Sprite,
        frameKey: string
      ) => {

        this.endSequence();
      },
      this
    );

    let _text: string;
    let _x: number = 70;
    let _originX: number = 0;
    // this._gameOvertype="game-over";

    if (this._gameOvertype === "game-over") {
      _text = Phaser.Math.RND.pick(translations[this._currentLanguage].insults);

      _x = 1210;
      _originX = 1;
      this._portraitLeft.setFrame(1);
    }
    else if (this._gameOvertype === "time-over") {
      _text = Phaser.Math.RND.pick(translations[this._currentLanguage].timeOverTexts);
    }


    this._endText = this.add.text(_x, 340, _text, { fontFamily: "PressStart2P", fontSize: "28px", color: "#ffffff", align: "left", wordWrap: { width: 600 } }).setOrigin(_originX, 0).setDepth(1001).setStroke("#000000", 6).setAlpha(0);
    this._leaderBoard = new Leaderboard(this);


  }

  setUpScene() {


    this.tweens.add({
      targets: [this._portraitLeft, this._portraitBgLeft, this._portraitLeftText],
      alpha: 1,
      x: "+=20",
      duration: 500,
      delay: 200,
      ease: 'Power1',
    });

    this.tweens.add({
      targets: [this._portraitRight, this._portraitBgRight, this._portraitRightText],
      alpha: 1,
      x: "-=20",
      duration: 500,
      delay: 200,
      ease: 'Power1',
    });


    this.tweens.add({
      targets: this._countdown,
      alpha: 1,
      scale: 1.4,
      duration: 1000,
      delay: 300,
      onComplete: () => {
        this._countdown.play("countdown_anim", false);
      },
      ease: 'Power1',
    });


    this.tweens.add({
      targets: this._endText,
      alpha: 1,

      duration: 1000,
      delay: 500,
      ease: 'Power1',
    });


    this._screenShotImage = this.add.image(this.game.canvas.width -20, this.game.canvas.height -20, "effects",67).setOrigin(1).setDepth(10000).setInteractive().setScale(1).on("pointerover", () => {
      this._screenShotImage.setScale(1.1);
    }).on("pointerout", () => {
      this._screenShotImage.setScale(1);
    }).on("pointerdown", () => {
      this.takeScreenshot();
    });

  }

  restartCountdown() {
    this._countdown.play("countdown_anim", false);
  }

  saveScore(name: string) {
    if (this._saved) return;
    this._saved=true;
    if (name.trim() === "") name = "no-name";
    let _scoreObj = { score: this._score, name: name, level: this._level, date: new Date().toISOString() }
    this._leaderBoard.saveScore(_scoreObj);
    this.endSequence();
  }




  endSequence() {

    this.cameras.main.flash(500, 255, 255, 255);
    const renderer = this.game
      .renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    renderer.pipelines.addPostPipeline("crt", CustomPipelineGrayscale);
    this.anims.pauseAll();
    this.cameras.main.setPostPipeline([CustomPipelineGrayscale]);
    this.shot(100);
    this.shot(200);
    this.shot(300);
    this.time.delayedCall(1500, () => {
      this.cameras.main.fade(1000, 0, 0, 0);
    });
    this.time.delayedCall(2500, () => {
      this.sceneEnd();
    });


  }



  shot(_delay: number) {

    this.time.addEvent({
      delay: _delay, callback: () => {

        this._Audio.playSfx("gun", 1);

        let _shot = this.add.image(Phaser.Math.RND.integerInRange(300, 980), Phaser.Math.RND.integerInRange(200, 520), "shot").setDepth(10000).setTintFill(0xffffff).setRotation(Phaser.Math.RND.integerInRange(0, 360)).setScale(Phaser.Math.RND.realInRange(0.9, 1.1));



      }
    })




  }


  sceneEnd() {
    this.anims.resumeAll();
    this.scene.stop(this)
    this.scene.start("Intro");
  }


  takeScreenshot(): void {
    this.game.renderer.snapshot((image: any) => {
      //download the image
      const a: any = document.createElement('a');
      a.href = image.src;
      a.download = 'screenshot.png';
      a.click();
    });
  }


}

