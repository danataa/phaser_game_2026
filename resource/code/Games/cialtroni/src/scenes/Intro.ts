
import { Leaderboard } from "./LeaderBoard";
import { language, } from "../Enums";
import { translations } from "../Translations";
import Menu from './Menu';
import Audio from "./Audio";
import CustomPipelineCrt from "../gameComponents/pipelines/CustomPipelineCrt";


export default class Intro extends Phaser.Scene {

  private _startGameText: Phaser.GameObjects.Text;
  private _payoff: Phaser.GameObjects.Text;
  private _Audio: Audio;
  private _audioBtn: Phaser.GameObjects.Sprite;
  private _audioIsMuted: boolean = false;
  private _counter: number = 0;
  private _leaderBoard: Leaderboard;
  private _highScoresTexts: Array<Phaser.GameObjects.BitmapText> = [];
  private _notesEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private _audioTween: Phaser.Tweens.Tween;
  private _audioBarrel: Phaser.FX.Barrel;
  private _clouds: Phaser.GameObjects.TileSprite;
  private _currentLanguage: language;
  protected _Menu: Menu;
  private _bobcat: Phaser.GameObjects.Sprite;
  private _car: Phaser.GameObjects.Image;
  private _borrelli: Phaser.GameObjects.Sprite;
  private _layer: Phaser.GameObjects.Image;
  private _buttonStart: Phaser.GameObjects.Sprite;
  private _highScoresContainer: Phaser.GameObjects.Container;
  private _highScoresTitle: Phaser.GameObjects.Text;
  private _highScoresBg: Phaser.GameObjects.Image;
  private _baloon: Phaser.GameObjects.Image;
  private _baloonText: Phaser.GameObjects.Text;
  private _iastemEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private _trafficLight: Phaser.GameObjects.Sprite;
  private _loading: Phaser.GameObjects.Text;


  private _btnFacebook: Phaser.GameObjects.Image;
  private _linkFacebook: string = "https://www.facebook.com/sharer/sharer.php?u=https%3A//sh4rko.itch.io/cialtroni";
  private _btnTwitter: Phaser.GameObjects.Image
  private _linkTwitter: string = "https://twitter.com/intent/tweet?text=Play%20Cialtroni%21%20https%3A//sh4rko.itch.io/cialtroni";
  private _btnWhatsapp: Phaser.GameObjects.Image;
  private _linkWhatsapp: string = "https://api.whatsapp.com/send?text=Play%20Cialtroni%21%20https%3A//sh4rko.itch.io/cialtroni";
  private _btnTelegram: Phaser.GameObjects.Image;
  private _linkTelegram: string = "https://t.me/share/url?url=https%3A//sh4rko.itch.io/cialtroni&text=Play%20Cialtroni";


  constructor() {
    super({
      key: "Intro",
    });
  }

  preload() { }


  create() {



    this._Menu = <Menu>this.scene.get("Menu");
    this._Audio = <Audio>this.scene.get("Audio");
    this._currentLanguage = this.registry.get("language") || language.english;

    //setta il background di sfondo a nero
    this.cameras.main.setBackgroundColor("#000000");
    this._loading = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, translations[this._currentLanguage].loading).setColor("#ffffff").setFontSize(40).setFontFamily("PressStart2P").setDepth(1002).setOrigin(0.5, 0.5);
    this._clouds = this.add.tileSprite(-20, -20, 1320, 491, "clouds").setOrigin(0, 0).setScrollFactor(0).setAlpha(0);

    //quando viene inizializzata (autenticazione + recupero della classifica) la classe leaderBoard richiama la funzione setUpScene
    this._leaderBoard = new Leaderboard(this);

    this.offEventsListeners();

    this._Menu.events.on("change-language", this.setLanguage, this);
    this._Menu.events.on("pause-game", this.pauseIntro, this);
    this._Menu.events.on("resume-game", this.resumeIntro, this);

    //imposto il container per gli highscores
    this._highScoresContainer = this.add.container(0, 0).setDepth(1002).setAlpha(0);
    this._highScoresBg = this.add.image(640, 630, "highscoresBg").setOrigin(0.5).setScale(1).setDepth(1002);
    this._highScoresTitle = this.add.text(640, 500, translations[this._currentLanguage].highscores).setOrigin(0.5).setColor("#ffffff").setFontSize(22).setFontFamily("PressStart2P").setDepth(1002);

    this._highScoresContainer.add([this._highScoresBg, this._highScoresTitle]);

  }

  offEventsListeners() {
    this._Menu.events.off("change-language", this.setLanguage, this);
    this._Menu.events.off("pause-game", this.pauseIntro, this);
    this._Menu.events.off("resume-game", this.resumeIntro, this);
  }


  setLanguage(params: any) {

    this._currentLanguage = params;
    this._payoff.setText(translations[this._currentLanguage].story);
    this._startGameText.setText(translations[this._currentLanguage].play);
    this._highScoresTitle.setText(translations[this._currentLanguage].highscores);


  }

  pauseIntro() {
    this.scene.pause(this);

  }

  resumeIntro() {
    this.scene.resume(this);

  }


  setUpScene() {
    this._loading.destroy();
    this.setHighscoresValues();
    this._currentLanguage = language.english;
    this.cameras.main.fadeIn(250, 0, 0, 0);
    this.add.tileSprite(-20, -20, 1320, 491, "sky").setOrigin(0, 0).setScrollFactor(0).setDepth(-1);

    let _birds = this.add.sprite(100, 100, "birds").setOrigin(0.5);


    let _animationConfig = {
      key: "flying",
      frames: this.anims.generateFrameNumbers("birds", {
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
      }),
      frameRate: 7,
      yoyo: false,
      repeat: -1,
    };
    if (!this.anims.exists("flying")) {
      this.anims.create(_animationConfig);
    }

    _birds.play("flying");

    this.add.image(10, 720, "bg-light").setOrigin(0, 1).setDepth(10001);

    //carica la musica
    this._Audio.playMusic("intro", true, 0.5);
    this._clouds.setAlpha(1);
    this.add.image(0, 0, "bg").setOrigin(0, 0);

    //animazione lettore
    this.animateReader();

    //animazione del negoziante
    this.animateNegoziante();

    //animazione della coppia
    this.animateCouple(Phaser.Math.Between(5000, 10000));

    this._borrelli = this.add.sprite(1350, 640, "player-beat").setOrigin(.5).setDepth(1).setFlipX(true).setScale(.5).setDepth(100);

    if (!this.anims.exists("borrelli-run")) {
      this.anims.create({
        key: "borrelli-run",
        frames: this.anims.generateFrameNumbers("player-beat", { frames: [7, 8, 9, 14, 15, 16] }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!this.anims.exists("borrelli-idle")) {
      this.anims.create({
        key: "borrelli-idle",
        frames: this.anims.generateFrameNumbers("player-beat", { frames: [0, 1, 2] }),
        frameRate: 5,
        repeat: -1
      });
    }
    this._borrelli.play("borrelli-run");

    this._baloon = this.add.image(700, 570, "baloon").setOrigin(0.5).setDepth(1001).setScale(0.25).setAlpha(0);
    this._baloonText = this.add.text(705, 570, "Cialtrone!", { fontSize: '8px', color: '#000' }).setOrigin(0.5).setDepth(1002).setFontFamily("PressStart2P").setAlpha(0);

    this.add.image(1350, 92, "bg-tree").setOrigin(1, 0).setDepth(1);
    this._bobcat = this.add.sprite(1400, 625, "bobcat").setOrigin(.5).setDepth(1).setScale(.55);
    this._car = this.add.image(640, 647, "bg-car").setOrigin(.5).setDepth(1).setScale(.9);


    //animazione della ragazza
    this.animateGirl(Phaser.Math.Between(5000, 10000));

    //animazione del tecnico
    this.animateTecnico();

    //animazione della ragazza
    this.animateScooter(Phaser.Math.Between(5000, 10000));

    this._audioBtn = this.add.sprite(71, 362, "audiobtn", 0).setScale(.5).setOrigin(.5).setInteractive()

    //creo l'emitter per le note musicali
    this._notesEmitter = this.add.particles(this._audioBtn.x, this._audioBtn.y, 'notes', {
      speed: 40,
      frame: [0, 1, 2, 3],
      lifespan: 1200,
      scale: { start: 3, end: 2 },
      alpha: { start: 1, end: 0 },
      gravityY: -200,
      frequency: 200,
      emitting: false

    }).setDepth(1000);

    //creo l'emitter per le note musicali
    this._iastemEmitter = this.add.particles(this._baloon.x, this._baloon.y, 'effects', {
      speed: 40,
      frame: [40, 41],
      lifespan: 1200,
      scale: { start: 1, end: 1.2 },
      alpha: { start: 1, end: 0 },
      gravityY: -200,
      frequency: 200,
      emitting: false

    }).setDepth(1000)

    let _logo: Phaser.GameObjects.Image = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2 - 400, "bg-logo").setScale(.2).setAlpha(0).setDepth(1002);

    //Shader per il post pipeline
    //se non è un dispositivo touch aggiungo il post pipeline
    if (!this.sys.game.device.input.touch) { }


    let _tweenConfig: Phaser.Types.Tweens.TweenBuilderConfig = {
      targets: _logo,
      scale: 1,
      alpha: 1,
      repeat: 0,
      yoyo: false,
      delay: 500,
      y: this.game.canvas.height / 2 - 250,
      ease: Phaser.Math.Easing.Sine.Out,
      duration: 1000,
      onComplete: () => {
        this.startIntro();

        //event!
        this._Menu.events.emit("check-storage-settings");

      },
    }
    this.tweens.add(_tweenConfig)

    this._layer = this.add.image(0, 0, "layer").setOrigin(0, 0).setDepth(1001).setAlpha(0).setInteractive();


    //creo il bottone audio
    this._audioBtn.on("pointerdown", () => {

      this.playSfx("click", 1);
      if (!this._audioIsMuted) {
        this.stopAudio();

      } else {
        this.playAudio();
      }

    }).setDepth(100001);

    this.playAudio();
    this.animateBorrelli();


    this._trafficLight = this.add.sprite(270, 474, "traffic-light").setOrigin(0.5).setDepth(1004).setScale(1);

    if (!this.anims.exists("yellow-light")) {
      this.anims.create({
        key: "yellow-light",
        frames: this.anims.generateFrameNumbers("traffic-light", { frames: [0, 2] }),
        frameRate: 3,
        repeat: -1
      });
    }
    this._trafficLight.play("yellow-light");


    if (this._Audio.getMusicVolume() > 0) {
      this.playAudio();
    } else {
      this.stopAudio();
    }

    this._btnWhatsapp = this.add.image(40, 40, "effects", 63).setOrigin(0.5).setInteractive().setDepth(1002).on("pointerdown", () => {
      window.open(this._linkWhatsapp, '_blank');
    });

    this._btnTelegram = this.add.image(100, 40, "effects", 64).setOrigin(0.5).setInteractive().setDepth(1002).on("pointerdown", () => { 
      window.open(this._linkTelegram, '_blank');
    });
    this._btnFacebook = this.add.image(160, 40, "effects", 65).setOrigin(0.5).setInteractive().setDepth(1002).on("pointerdown", () => { 
      window.open(this._linkFacebook, '_blank');
    });
    this._btnTwitter = this.add.image(220, 40, "effects", 66).setOrigin(0.5).setInteractive().setDepth(1002).on("pointerdown", () => { 
      window.open(this._linkTwitter, '_blank');
    });


  }


  stopAudio() {

    this._Audio.pauseMusic();
    this._audioIsMuted = true;
    this._notesEmitter.stop();

    this._audioBtn.setAlpha(.75);

    if (!this.sys.game.device.input.touch) {
      if (this._audioTween) this._audioTween.stop();
      if (this._audioBarrel) this._audioBtn.preFX.remove(this._audioBarrel);
    }
  }

  playAudio() {

    this._Audio.resumeMusic();
    this._audioIsMuted = false;
    this._notesEmitter.start();

    this._audioBtn.setAlpha(1);

    if (!this.sys.game.device.input.touch) {
      //https://labs.phaser.io/edit.html?src=src\fx\barrel\barrel%20squish%20fx.js
      //deformazione del bottone audio
      this._audioBarrel = this._audioBtn.preFX.addBarrel(0.99);

      //creo il tween per la deformazione del bottone audio
      this._audioTween = this.tweens.add({
        targets: this._audioBarrel,
        amount: 1.4,
        yoyo: true,
        duration: 500,
        loop: -1,
        ease: 'sine.inout'
      });
    }
  }



  startIntro() {

    this._payoff = this.add.text(640, 215, translations[this._currentLanguage].story).setOrigin(0.5, 0.5).setColor("#ffffff").setFontSize(26).setFontFamily("PressStart2P").setDepth(1002).setAlpha(0).setStroke("#f60", 8);

    this.tweens.add({
      targets: this._payoff,
      alpha: 1,
      duration: 250,
      delay: 0,
      onComplete: () => {
        this._Menu.showMenuButton();
      }
    });

    this._buttonStart = this.add.sprite(640, 270, "button-start").setOrigin(0.5, 0).setInteractive().setDepth(1002).on("pointerdown", () => {

      this.startGame();


    }).on("pointerover", () => {

      this.playSfx("selection", .25);

      this._buttonStart.setFrame(1);
      this._startGameText.setY(292);

    }).on("pointerout", () => {

      this._buttonStart.setFrame(0);
      this._startGameText.setY(284);

    }).setAlpha(0);


    this._startGameText = this.add.text(640, 284, translations[this._currentLanguage].play)
      .setOrigin(0.5, 0)
      .setColor("#ffffff")
      .setFontSize(34)
      .setFontFamily("PressStart2P").setDepth(1002).setAlpha(0);

    this.tweens.add({
      targets: [this._buttonStart, this._startGameText],
      alpha: 1,
      duration: 250,
      delay: 500,
    });


  }


  startGame() {

    this.cameras.main.fadeOut(250, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {


      if (progress === 1) {
        this.offEventsListeners();
        this.scene.stop(this);
        this._Menu.hideMenuButton();
        this.scene.start("Prelevel", { level: 0 });
        this._Audio.stopMusic();
      }
    });

  }

  setHighscoresValues() {
    let _highScores: Array<any> = this._leaderBoard.getHighScores();
    this._highScoresTexts = [];
    let _colors: Array<number> = [0xff0000, 0xff8200, 0xffff00, 0x00ff00, 0x00bfff];
    _highScores.forEach((score: any, index: number) => {
      let _text: Phaser.GameObjects.BitmapText = this.add.bitmapText(440, 550 + (index * 50), "arcade", `${index + 1}: ${this.setSoreNameTo8Digits(score.name)} - ${score.score}`).setOrigin(0, 0.5).setDepth(1002).setAlpha(1).setFontSize(20).setTintFill(_colors[index]);
      this._highScoresTexts.push(_text);
      this._highScoresContainer.add(_text);
    });

  }

  setSoreNameTo8Digits(name: string): string {

    let _newName: string = name;
    while (_newName.length < 8) {
      _newName += " ";
    }
    return `${_newName}`;

  }



  update(time: number, delta: number): void {

    //se la classifica è stata caricata
    if (this._leaderBoard.isLoaded()) {

      //aumento il counter
      this._counter += 0.01;


    }

    this._clouds.tilePositionX += 0.4;

  }


  animateTecnico() {
    let _tecnico = this.add.sprite(180, 512, "tecnico").setScale(1).setOrigin(.5).setFlipX(false).setDepth(10002);


    if (!this.anims.exists("tecnico")) {
      this.anims.create({
        key: "tecnico",
        frames: this.anims.generateFrameNumbers("tecnico", { frames: [0, 1, 2] }),
        frameRate: 3,
        repeat: -1
      });
    }
    _tecnico.play("tecnico");
  }

  animateCouple(delay: number = 0) {

    let _couple = this.add.sprite(1350, 614, "couple").setScale(.5).setOrigin(.5);

    if (!this.anims.exists("couple")) {
      this.anims.create({
        key: "couple",
        frames: this.anims.generateFrameNumbers("couple", { frames: [0, 1, 2, 3] }),
        frameRate: 3,
        repeat: -1
      });
    }
    _couple.play("couple");

    this.tweens.add({
      targets: _couple,
      delay: 5000,
      x: 700,
      duration: 20000,
      ease: 'linear',
      yoyo: true,

      onYoyo: () => {
        _couple.setFlipX(true);
      },
      onRepeat: () => {
        _couple.setFlipX(false);
      },
      onComplete: () => {
        _couple.destroy();
        this.animateCouple(Phaser.Math.Between(5000, 10000));
      }

    });
  }


  animateBorrelli(delay: number = 0) {

    this.tweens.add({
      targets: this._borrelli,
      delay: 2000,
      x: 750,
      duration: 6000,
      ease: 'linear',
      onComplete: () => {

        this._borrelli.play("borrelli-idle");


        this.tweens.add({
          targets: [this._baloon, this._baloonText],
          alpha: 1,
          duration: 200,
          onComplete: () => {
            this._iastemEmitter.start();

          }
        });

        this.tweens.add({
          targets: this._borrelli,
          delay: 5000,
          x: 1300,
          duration: 6000,
          ease: 'linear',
          onStart: () => {

            this._iastemEmitter.stop();
            this.tweens.add({
              targets: [this._baloon, this._baloonText],
              alpha: 0,
              duration: 200,
            });

            this._borrelli.setFlipX(false);
            this._borrelli.play("borrelli-run");
          },
          onComplete: () => {


            this.openHighScores(0);




          }

        });




      }

    });
  }

  animateNegoziante() {
    let _negoziante = this.add.sprite(480, 618, "negoziante").setScale(.5).setOrigin(.5);


    if (!this.anims.exists("negoziante")) {
      this.anims.create({
        key: "negoziante",
        frames: this.anims.generateFrameNumbers("negoziante", { frames: [0, 1, 2, 3] }),
        frameRate: 3,
        repeat: -1
      });
    }
    _negoziante.play("negoziante");
  }

  animateReader() {
    let _reader = this.add.sprite(260, 612, "reader").setScale(.5).setOrigin(.5);


    if (!this.anims.exists("reader")) {
      this.anims.create({
        key: "reader",
        frames: this.anims.generateFrameNumbers("reader", { frames: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7] }),
        frameRate: 5,
        repeat: -1
      });
    }
    _reader.play("reader");
  }

  animateGirl(delay: number = 0) {
    let _girl = this.add.sprite(-50, 618, "girl").setScale(.5).setOrigin(.5).setFlipX(true).setDepth(2);


    if (!this.anims.exists("girl")) {
      this.anims.create({
        key: "girl",
        frames: this.anims.generateFrameNumbers("girl", { frames: [0, 1, 2, 3] }),
        frameRate: 3,
        repeat: -1
      });
    }
    _girl.play("girl");

    this.tweens.add({
      targets: _girl,
      delay: delay,
      x: 540,
      duration: 21000,
      ease: 'linear',
      yoyo: true,
      repeat: -1,
      onYoyo: () => {
        _girl.setFlipX(false);
      },
      onRepeat: () => {
        _girl.setFlipX(true);
      },
      onComplete: () => {
        _girl.destroy();
        this.animateGirl(Phaser.Math.Between(5000, 10000));
      }
    });


  }


  animateScooter(delay: number = 0, type: number = 0) {


    let _x1: number = 0;
    let _x2: number = 0;
    let _flip: boolean = true;

    let randomNum = Phaser.Math.Between(0, 1);

    if (randomNum === 0) {
      _x1 = -100;
      _x2 = 1380;

    } else {
      _x1 = 1380;
      _x2 = -100;
      _flip = false;
    }


    let _scooter = this.add.sprite(_x1, 710, "scooter" + type).setScale(.6).setOrigin(.5, 1).setFlipX(_flip).setDepth(1000);

    if (!this.anims.exists("scooter" + type)) {
      this.anims.create({
        key: "scooter" + type,
        frames: this.anims.generateFrameNumbers("scooter" + type, { frames: [0, 1, 2, 3] }),
        frameRate: 3,
        repeat: -1
      });
    }
    _scooter.play("scooter" + type);

    this.tweens.add({
      targets: _scooter,
      delay: delay,
      x: _x2,
      duration: Phaser.Math.Between(3000, 5000),
      ease: 'linear',
      repeat: 0,

      onComplete: () => {
        _scooter.destroy();
        this.randomScooter();
      }
    });
  }


  randomScooter() {
    let randomNum = Phaser.Math.Between(0, 1);
    if (randomNum === 0) {
      this.animateScooter(Phaser.Math.Between(15000, 20000), 0);
    } else {
      this.animateScooter(Phaser.Math.Between(15000, 20000), 1);
    }
  }

  removeCarAnimation() {


    this.tweens.add({
      targets: this._bobcat,
      x: 730,
      ease: Phaser.Math.Easing.Sine.Out,
      duration: 3000,

      onComplete: () => {

        this.tweens.add({
          targets: this._car,
          x: "+=5",
          yoyo: true,
          ease: 'Sine.InOut',
          duration: 100,
          repeat: 0,
          onComplete: () => {

            this.tweens.add({
              targets: this._car,
              delay: 1000,
              y: "-=5",
              ease: 'Sine.InOut',
              duration: 1000,
              repeat: 0,
              onComplete: () => {

                this._car.setDepth(100);
                this._bobcat.setDepth(100);

                this.tweens.add({
                  targets: [this._bobcat],
                  x: -100,
                  ease: Phaser.Math.Easing.Sine.In,
                  duration: 3000,
                });

                this.tweens.add({
                  targets: [this._car],
                  x: -200,
                  ease: Phaser.Math.Easing.Sine.In,
                  duration: 3000,
                  onComplete: () => {
                    this.openHighScores(1);
                  }
                });

              }
            });


          }
        });


      }
    });


  }



  openHighScores(step: number = 0) {

    this._layer.setAlpha(1);
    this.tweens.add({
      targets: this._highScoresContainer,
      alpha: 1,
      y: "-=100",
      duration: 500,
      ease: 'Power2'
    });
    this.time.delayedCall(8000, () => {
      this.closeHighScores(step);
    }, [], this);
  }


  closeHighScores(step: number = 0) {

    this._layer.setAlpha(0);
    this.tweens.add({
      targets: this._highScoresContainer,
      alpha: 0,
      y: "+=100",
      duration: 500,
      ease: 'Power2',
      onStart: () => {
        if (step === 0) { } else if (step === 1) {
          this.resetCarAnimation()
        }

      },
      onComplete: () => {
        if (step === 0) {
          this.removeCarAnimation()
        } else if (step === 1) {
          this._layer.setAlpha(0);
          this.animateBorrelli();
        }

      }
    });

  }

  resetCarAnimation() {
    this._car.setPosition(640, 647);
    this._bobcat.setX(1400);
    this._car.setDepth(1);
    this._borrelli.setX(1350).setFlipX(true);
    this._bobcat.setDepth(1);

  }


  playSfx(sfx: string, volume: number): void {

    this._Audio.playSfx(sfx, volume);

  }


}

