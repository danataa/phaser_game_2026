import { GameData} from "../GameData";
import { gameType, language } from "../Enums";
import {translations} from "../Translations";
import { Leaderboard } from "./LeaderBoard";
import Audio from './Audio';
import InputScore from "../gameComponents/others/InputScore";
import CustomPipelineGrayscale from "../gameComponents/pipelines/CustomPipelineGrayscale";

export default class Win extends Phaser.Scene {
  private _leaderBoard: Leaderboard;
  private _Audio: Audio;
  private _inputScore: InputScore;
  private _currentLanguage: language = language.english;
  private _score: number = 0;
  private _endText: Phaser.GameObjects.Text;
  private _tints: number[];
  private _emitter1: Phaser.GameObjects.Particles.ParticleEmitter;
  private _emitter2: Phaser.GameObjects.Particles.ParticleEmitter;
  private _emitter3: Phaser.GameObjects.Particles.ParticleEmitter;
  private _timer1: Phaser.Time.TimerEvent;
  private _timer2: Phaser.Time.TimerEvent;
  private _timer3: Phaser.Time.TimerEvent;
  private _bg: Phaser.GameObjects.Image;
  private _emilio: Phaser.GameObjects.Image;

  constructor() {
    super({
      key: "Win",
    });
  }

  init(data: any) {

    this.textures.generate("rocket", {
      data: ["0123"],
      pixelWidth: 4,
      pixelHeight: 3
    } as Phaser.Types.Create.GenerateTextureConfig);
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");
    this._Audio = this.scene.get("Audio") as Audio;

        this._Audio.playMusic("win", true, 0.5);

    // Initialize tints array
    this._tints = [
      0xff0000, // red
      0xff7f00, // orange
      0xffff00, // yellow
      0x7fff00, // lime
      0x00ff00, // green
      0x00ffff, // aqua
      0x0000ff, // blue
      0xff00ff, // fuchsia
      0x7f00ff  // purple
    ];

    if (this.scene.getIndex("GamePlay") !== -1) this.scene.remove("GamePlay");
    if (this.scene.getIndex("Hud") !== -1) this.scene.remove("Hud");

    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      this._currentLanguage = parseInt(savedLanguage) as language;
    }

    this._score = this.registry.get("score") as number;
    this.registry.set("score", 0);

    if (this._score == null || this._score == undefined) this._score = 0;

    this._bg = this.add.image(0, 0, "win").setOrigin(0, 0).setAlpha(0);

    this._emilio = this.add.image(250, 720, "win-emilio").setOrigin(1, 1).setScale(3).setAlpha(0).setDepth(1001);

    this._endText = this.add.text(500, 100, translations[this._currentLanguage].win, { fontSize: '38px', color: '#fff' }).setOrigin(0,0).setDepth(1002).setFontFamily("PressStart2P").setAlpha(0).setWordWrapWidth(700).setLineSpacing(20) ;

    this._leaderBoard = new Leaderboard(this);


  }

  updateEmitter(emitter: Phaser.GameObjects.Particles.ParticleEmitter): void {
 this._Audio.playSfx("gun", .5);

let _x = GameData.globals.gameWidth * Phaser.Math.FloatBetween(0.5, 0.75);
let _y = GameData.globals.gameHeight * Phaser.Math.FloatBetween(0.1, 0.25);


    emitter
      .setPosition(
       _x,
        _y
      )
      .setParticleTint(Phaser.Utils.Array.GetRandom(this._tints));
  }

  updateParticleRotation(p: Phaser.GameObjects.Particles.Particle): number {
    return Phaser.Math.RadToDeg(Math.atan2(p.velocityY, p.velocityX));
  }

  setUpScene(): void {


    if (this._endText) {
      this.tweens.add({
        targets: this._endText,
        alpha: 1,
        duration: 1000,
        delay: 1500,
        ease: 'Power1',
      });
    }

    this.add.tween({
      targets: [this._bg, this._emilio],
      alpha: 1,
      duration: 250,
      ease: 'Power1',
    });


    this.tweens.add({
      targets: this._bg,
      x: -200,
      ease: Phaser.Math.Easing.Sine.Out,
      duration: 2000,
      delay: 0,
    });


    this.tweens.add({
      targets: this._emilio,
      x: 500,
      ease: Phaser.Math.Easing.Sine.Out,
      duration: 2000,
      delay: 0,
    });

    // Phaser 3.90.0: Use add.particles with texture key directly
    const emitterConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {

      tint: Phaser.Utils.Array.GetRandom(this._tints),
      alpha: { start: 1, end: 0, ease: "Cubic.easeIn" },
      angle: { start: 0, end: 360, steps: 100 },
      rotate: {
        onEmit: (p: Phaser.GameObjects.Particles.Particle) => this.updateParticleRotation(p),
        onUpdate: (p: Phaser.GameObjects.Particles.Particle) => this.updateParticleRotation(p)
      },
      
      blendMode: "ADD",
      gravityY: 128,
      lifespan: 1500,
      quantity: 300,
      reserve: 500,
      scaleX: { onUpdate: (p: Phaser.GameObjects.Particles.Particle) => Phaser.Math.Easing.Cubic.Out(1 - p.lifeT) },
      speed: { min: 128, max: 256 },
      frequency: 3000
    };


    this._emitter1 = this.add.particles(GameData.globals.gameWidth * Phaser.Math.FloatBetween(0.5, 0.75),
      GameData.globals.gameHeight * Phaser.Math.FloatBetween(0, 0.25), "rocket", emitterConfig);

    this._emitter2 = this.add.particles(GameData.globals.gameWidth * Phaser.Math.FloatBetween(0.5, 0.75),
      GameData.globals.gameHeight * Phaser.Math.FloatBetween(0, 0.25), "rocket", {
      ...emitterConfig,
      frequency: 4000
    });

    this._emitter3 = this.add.particles(GameData.globals.gameWidth * Phaser.Math.FloatBetween(0.5, 0.75),
      GameData.globals.gameHeight * Phaser.Math.FloatBetween(0, 0.25), "rocket", {
      ...emitterConfig,
      frequency: 5000
    });

    // Update emitters periodically
   this._timer1 = this.time.addEvent({
      delay: 3000,
      callback: () => this.updateEmitter(this._emitter1),
      loop: true
    });

    this._timer2=this.time.addEvent({
      delay: 4000,
      callback: () => this.updateEmitter(this._emitter2),
      loop: true
    });

    this._timer3 = this.time.addEvent({
      delay: 5000,
      callback: () => this.updateEmitter(this._emitter3),
      loop: true
    });

    this._inputScore = new InputScore(this, this._currentLanguage, this._score);
    this._inputScore.setPosition(0, 500).setDepth(1002);
    this.add.existing(this._inputScore);
  }

  saveScore(name: string): void {
    if (name.trim() === "") name = "no-name";
    const _scoreObj = {
      score: this._score,
      name: name,
      level: 2,
      date: new Date().toISOString()
    };
    this._leaderBoard.saveScore(_scoreObj);
    this.endSequence();
  }

  endSequence(): void {
    this._Audio.stopMusic();
    this._timer1.remove(false);
    this._timer2.remove(false);
    this._timer3.remove(false);
    this._emitter1.destroy();
    this._emitter2.destroy();
    this._emitter3.destroy();
    this._Audio.playSfx("jingle0", 0.7);
    this.cameras.main.flash(500, 255, 255, 255);
    const renderer = this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    renderer.pipelines.addPostPipeline("crt", CustomPipelineGrayscale);
    this.anims.pauseAll();
    this.cameras.main.setPostPipeline([CustomPipelineGrayscale]);

    this.time.delayedCall(1500, () => {
      this.cameras.main.fade(1000, 0, 0, 0);
    });
    this.time.delayedCall(3000, () => {
      this.sceneEnd();
    });
  }

  sceneEnd(): void {
    this.anims.resumeAll();
    this.scene.stop(this);
    this.scene.start("Intro");
  }

  //funzione utilizzata nel gameover per riavviare il countdown
  restartCountdown(): void { }
}