import { GameData } from "../GameData";
import { gameType, language } from "../Enums";
import { translations } from "../Translations";
import GamePlay from "./GamePlay";
import GamePlayBreakout from "./GamePlayBreakout";
import GamePlayPlatform from "./GamePlayPlatform";
import GamePlayShooter from "./GamePlayShooter";
import GamePlayBeat from "./GamePlayBeat";
import Hud from "./Hud";
import Audio from "./Audio";
import HudBeat from "./HudBeat";



export default class Prelevel extends Phaser.Scene {

  private _level: number = 0;
  private _levelData: levelConfig;
  private _hud: Hud;
  private _gameplay: GamePlay;
  private _portraitLeft: Phaser.GameObjects.Sprite;
  private _portraitRight: Phaser.GameObjects.Sprite;
  private _portraitBgLeft: Phaser.GameObjects.Image;
  private _portraitBgRight: Phaser.GameObjects.Image;
  private _portraitLeftText: Phaser.GameObjects.Text;
  private _portraitRightText: Phaser.GameObjects.Text;

  private _currentLanguage: language = language.english;
  private _levelText: Phaser.GameObjects.Text;
  private _levelTitleText: Phaser.GameObjects.Text;
  private _chapterText: Phaser.GameObjects.Text;
  private _vsImage: Phaser.GameObjects.Image;
  private _pinImage: Phaser.GameObjects.Image;

  private _buttonStart: Phaser.GameObjects.Sprite;
  private _nextText: Phaser.GameObjects.Text;

  private _Audio: Audio;

  constructor() {
    super({
      key: "Prelevel",
    });

  }

  init(data: { level: number }): void {
    // recupero il livello da caricare
    if (data == null || data.level == null) {
      this._level = 0;
    } else {
      this._level = data.level;
    }

    this._levelData = GameData.levels[this._level];
    this._currentLanguage = this.registry.get("language") || language.english;

    //non ci sono altri livelli quindi vado direttamente alla scena di vittoria



  }

  create() {

    if (!this._levelData) {
      this.scene.start("Win");
      return;
    }

    this._Audio = <Audio>this.scene.get("Audio");



    // se esiste la scena di gioco la rimuovo perchè ne devo creare una nuova
    if (this.scene.getIndex("GamePlay")) this.scene.remove("GamePlay");
    if (this.scene.getIndex("Hud")) this.scene.remove("Hud");


    // in base al tipo di gioco creo la scena di gioco
    // nell'enum gameType sono presenti i tipi di gioco

    switch (this._levelData.gameType) {

      case gameType.breakout:
        this._gameplay = <GamePlay>new GamePlayBreakout();
        break;

      case gameType.shooter:
        this._gameplay = <GamePlay>new GamePlayShooter();
        break;

      case gameType.platform:
        this._gameplay = <GamePlay>new GamePlayPlatform();
        break;

      case gameType.beat:
        this._gameplay = <GamePlay>new GamePlayBeat();
        break;

    }

    switch (this._levelData.hudType) {

      case gameType.breakout:
        this._hud = <Hud>new Hud();

        break;

      case gameType.beat:
        this._hud = <HudBeat>new HudBeat();
        this.add.image(640, 360, "map").setScale(1);
        this._pinImage = this.add.image(this._levelData.beat.map.pin.x, this._levelData.beat.map.pin.y, "pin");
        this._vsImage = this.add.image(640, 200, "vs").setScale(.5).setAlpha(0);
        this.playSfx("jingle1", .5);
        this._portraitLeftText = this.add.text(200, 60, "Borrelli", { fontFamily: "PressStart2P", fontSize: "26px", color: "#ffffff", align: "center", wordWrap: { width: 200 } }).setOrigin(0.5, 0.5).setDepth(1001).setStroke("#000000", 6).setAlpha(0);
        this._portraitRightText = this.add.text(1080, 60, "???", { fontFamily: "PressStart2P", fontSize: "26px", color: "#ffffff", align: "center", wordWrap: { width: 200 } }).setOrigin(0.5, 0.5).setDepth(1001).setStroke("#000000", 6).setAlpha(0);

        this._portraitBgLeft = this.add.image(200, 200, "portraitBg").setAlpha(0);
        this._portraitBgRight = this.add.image(1080, 200, "portraitBg").setAlpha(0);

        this._portraitLeft = this.add.sprite(200, 200, "portraits", 0).setAlpha(0);
        this._portraitRight = this.add.sprite(1080, 200, "portraits", this._levelData.beat.enemyFrameLose - 1).setTintFill(0x000000).setAlpha(0);



        this.tweens.add({
          targets: [this._vsImage],
          alpha: 1,
          duration: 500,
          delay: 750,
          ease: 'Power1',
        });

        this.tweens.add({
          targets: [this._vsImage],
          scale: .75,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Power1',
        });

        this.tweens.add({
          targets: [this._portraitLeft, this._portraitBgLeft, this._portraitLeftText, this._levelText],
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





        break;

    }




    this.cameras.main.fadeIn(250, 0, 0, 0);

    let _levelText: string = Phaser.Math.RND.pick(translations[this._currentLanguage].prelevelText);

    this._levelText = this.add.text(70, 340, _levelText, { fontFamily: "PressStart2P", fontSize: "28px", color: "#ffffff", align: "left", wordWrap: { width: 600 } }).setOrigin(0).setDepth(1001).setStroke("#000000", 6).setAlpha(0);

    this._chapterText = this.add.text(640, 500, translations[this._currentLanguage].chapter + " " + (this._level + 1), { fontFamily: "PressStart2P", fontSize: "20px", color: "#ffff00", align: "center" }).setOrigin(0.5, 0.5).setDepth(1001).setStroke("#000000", 6)

    this._levelTitleText = this.add.text(640, 550, '"' + this._levelData.title + '"', { fontFamily: "PressStart2P", fontSize: "40px", color: "#ffffff", align: "center", wordWrap: { width: 1200 } }).setOrigin(0.5, 0.5).setDepth(1001).setStroke("#000000", 6);

    this._buttonStart = this.add.sprite(640, 570 + 50, "button-start").setOrigin(0.5, 0).setInteractive().setDepth(1002).on("pointerdown", () => {
      this.nextLevel();
    }).on("pointerover", () => {

      this.playSfx("selection", .25);

      this._buttonStart.setFrame(1);
      this._nextText.setY(592 + 57);

    }).on("pointerout", () => {

      this._buttonStart.setFrame(0);
      this._nextText.setY(584 + 57);

    }).setAlpha(1);

    this._nextText = this.add.text(640, 584 + 57, translations[this._currentLanguage].continue, { fontFamily: "PressStart2P", fontSize: "28px", color: "#000000", align: "center" })
      .setOrigin(0.5, 0)
      .setColor("#ffffff")
      .setFontSize(20)
      .setFontFamily("PressStart2P").setDepth(1002).setAlpha(1);

  }

  nextLevel(): void {

    // aggiungo la scena della hud
    this.scene.add("Hud", this._hud, false);
    // aggiungo la scena di gioco
    this.scene.add("GamePlay", this._gameplay, false);
    // avvio le scene
    this.scene.start("Hud");
    this.scene.start("GamePlay", { level: this._level });
    // porto in primo piano la hud e il menu
    this.scene.bringToTop("Hud");
    this.scene.bringToTop("Menu");

  }


  nextLevelFade(): void {

    this.cameras.main.fadeOut(250, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {

      if (progress === 1) {
        this.nextLevel();
      }

    });

  }



  playSfx(sfx: string, volume: number): void {
    //inserire codice per la regolazione degli fx sulla base del volume globale
    //this.sound.playAudioSprite("sfx", sfx, { volume: volume });
    // console.log("play sfx", sfx, volume);
    this._Audio.playSfx(sfx, volume);
  }

}
