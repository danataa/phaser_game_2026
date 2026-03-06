import Dialog from "phaser3-rex-plugins/templates/ui/dialog/Dialog";
import GamePlay from "./GamePlay";
import EnergyBar from "../gameComponents/others/EnergyBar";
import Portraits from "../gameComponents/others/Portraits";
import Dialogs from "../gameComponents/others/Dialogs";
import { GameData } from "../GameData";
import { language } from "../Enums";
import {translations } from "../Translations";
import Intro from "./Intro";
import Menu from "./Menu";
import HudBeat from "./HudBeat";
import Audio from "./Audio";



export default class Hud extends Phaser.Scene {

  protected _score: number = 0;
  protected _scoreText: Phaser.GameObjects.Text;
  protected _livesArray: Array<Phaser.GameObjects.Sprite> = [];
  protected _lives: number = 3;
  protected _Gameplay: GamePlay;
  protected _Menu: Menu;
  protected _Audio: Audio;
  protected _time: Phaser.GameObjects.Text;
  protected _timeCounter: number = 600;
  protected _timeInterval: number = 1000;
  protected _timer: Phaser.Time.TimerEvent;
  protected _timeIsOver: boolean = false;
  protected _currentLanguage: language = language.napolitan;
  protected _levelData: levelConfig;
  protected _level: number = 0;
  protected _isPaused: boolean = false;


  constructor() {
    super({
      key: "Hud",
    });



  }

  create() {

    //tasto p premuto per mettere in pausa
    this.input.keyboard.on("keydown-P", () => {

      if (!this._isPaused) {
        this._isPaused = true;
        this.pauseGame();
      } else {
        this._isPaused = false;
        this.resumeGame();
      }
    });


  }


  //creo la hud la prima volta
  setUpHud(level: number, scene: GamePlay) {



    this._Gameplay = scene;
    this._Audio = <Audio>this.scene.get("Audio");
    this._Menu = <Menu>this.scene.get("Menu");
    this._Menu.showMenuButton();
    this._level = level;

    this._levelData = GameData.levels[level];

    this._timeCounter = this._levelData.time;

    this._time = this.add.text(1280 / 2 + 2, 8, "" + this._timeCounter, { color: "#000000" }).setOrigin(0.5, 0).setFontFamily("PressStart2P").setFontSize(20).setAlpha(0).setDepth(10);

    this._score = 0;

    let _scoreFromRegistry = this.registry.get("score");
    if (_scoreFromRegistry != null) {
      this._score = _scoreFromRegistry;
    }

  
    this._lives = 0;

    if (!this.anims.exists("paddle-explosion")) {
      let _paddleExplosionConfig: Phaser.Types.Animations.Animation = {
        key: "paddle-explosion",
        frames: this.anims.generateFrameNumbers("paddle-explosion", { frames: [1, 2, 3, 4] }),
        frameRate: 15,
      };

      this.anims.create(_paddleExplosionConfig);

    }
    for (let i = 0; i < this._lives; i++) {
      let _live = this.add.sprite(1100 + (i * 60), 40, "paddle-explosion").setScale(.5);
      _live.setOrigin(.5, .5);
      this._livesArray.push(_live);
    }

  
    this._Gameplay.events.off("update-score", this.updateScore, this);
    this._Gameplay.events.off("update-lives", this.updateLives, this);
    this._Gameplay.events.off("update-time", this.updateTime, this);

    this._Gameplay.events.off("level-completed", this.levelCompleted, this);
    this._Gameplay.events.off("game-over", this.gameOver, this);

    this._Menu.events.off("change-language", this.changeLanguage, this);
    this._Menu.events.off("pause-game", this.pauseGame, this);
    this._Menu.events.off("resume-game", this.resumeGame, this);

    //ricreiamo i listeners
    this._Gameplay.events.on("update-score", this.updateScore, this);
    this._Gameplay.events.on("update-lives", this.updateLives, this);
    this._Gameplay.events.on("update-time", this.updateTime, this);

    this._Gameplay.events.on("level-completed", this.levelCompleted, this);
    this._Gameplay.events.on("game-over", this.gameOver, this);

    this._Menu.events.on("change-language", this.changeLanguage, this);
    this._Menu.events.on("pause-game", this.pauseGame, this);
    this._Menu.events.on("resume-game", this.resumeGame, this);

    
    this._scoreText = this.add.text(20, 20, this._score + "", { color: "#ffffff" }).setFontFamily('PressStart2P').setFontSize(30);

    //sullo shutdown della scena rimuovo tutti i listeners "PER SICUREZZA"
    this.events.on("shutdown", () => {
      
      this._Gameplay.events.off("update-score", this.updateScore, this);
      this._Gameplay.events.off("update-lives", this.updateLives, this);
      this._Gameplay.events.off("update-time", this.updateTime, this);  
      this._Gameplay.events.off("level-completed", this.levelCompleted, this);
      this._Gameplay.events.off("game-over", this.gameOver, this);
      this._Menu.events.off("change-language", this.changeLanguage, this);
      this._Menu.events.off("pause-game", this.pauseGame, this);
      this._Menu.events.off("resume-game", this.resumeGame, this);
    });

  }

 
  getGamePlay(): GamePlay {
    return this._Gameplay;
  }




  //metodo privato di Hud richiamato quando si deve aggiornare il punteggio
  updateScore(score: number): void {
    // il primo valore dell’array è lo score 
    // che aggiungiamo allo score corrente
    this._score += score;
    // settiamo il valore del gameobject
    this._scoreText.setText(this._score + "");
    // salviamo il valore nel registry in modo che possa essere utilizzato
    // nella scena di GameOver
    this.registry.set("score", this._score);
  }

  updateTime(time: number): void {
    this._timeCounter += time;
    if (this._timeCounter < 0) this._timeCounter = 0;
    this._time.setText("" + this._timeCounter);
  }


  updateLives(): number {
    this._lives--;
    if (this._lives < 0) {
      this._lives = 0;
      return 0;
    }

    //remove the first element of the array
    let _live: Phaser.GameObjects.Sprite = this._livesArray.shift();
    _live.play("paddle-explosion");
    _live.on("animationcomplete", () => {
      _live.destroy();
    });

    return this._lives;

  }

  pauseGame(): void {
    this.scene.pause(this._Gameplay);
    if (this._timer != null) this._timer.paused = true;


  }

  resumeGame(): void {
    this.scene.resume(this._Gameplay);
    if (this._timer != null) this._timer.paused = false;

  }

  gameOver(params: any): void {

    this._Menu.hideMenuButton();
    this.scene.stop(this._Gameplay);
    this.scene.stop(this);
    this.scene.start("GameOver", { type: params[0], level: this._level });

  }

  levelCompleted(): void {
    this._Menu.hideMenuButton();
    this.scene.stop(this._Gameplay);
    this.scene.start('Prelevel', { level: this._level + 1 });
  }

  changeLanguage(_language: language): void {

    this._currentLanguage = _language;
    this._Gameplay.setLanguage(_language);

  }

  startBonusTimeCount(): void {

    this._timer.destroy();
    let _bonusTime: number = this._timeCounter;
    let _bonusScore: number = 0;
    let _timePerPoint: number = 100; //ogni 100 ms aggiungo un punto
    this._timeCounter = 0;
    this._timer = this.time.addEvent({
      delay: _timePerPoint,
      callback: () => {
        if (_bonusTime > 0) {
          _bonusTime--;
          _bonusScore++;
          this._time.setText("" + _bonusTime);
          this.playSfx("time-bonus", 0.5);
           this.updateScore(100);
        } else {

          this.registry.set("score", this._score);
          this._timer.remove();
          this.hideAll();
          this._Gameplay.nextLevel()
      
        } 
      },
      loop: true
    });

  }

  startTimer(): void {

    this._timer = this.time.addEvent({
      delay: this._timeInterval,
      callback: () => {
        this._timeCounter--;
        if(this._timeCounter<=10){
          this.playSfx("countdown", 0.5);
        }
        if (this._timeCounter <= 0) {
          this._timeCounter = 0;
          this._timeIsOver = true;
        }
        this._time.setText("" + this._timeCounter);
      },
      loop: true
    });

  }

  isTimeOver(): boolean {
    return this._timeIsOver;
  }

  showTime(): void {
    this._time.setAlpha(1);
    this.tweens.add({
      targets: this._time,
      alpha: 1,
      y: "+=50",
      duration: 500,
      ease: Phaser.Math.Easing.Bounce.Out
    });

    this.startTimer();
  }

  hideTime(): void {
    this.tweens.add({
      targets: this._time,
      alpha: 0,
      y: "-=50",
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
    });

  }

  hideAll(): void {

    this.stopTime();
    this._scoreText.setAlpha(0);
    this._time.setAlpha(0);
  }

  stopTime(): void {
    if (this._timer != null)
      this._timer.remove();
  }



  updatePlayerEnergy(energy: number): number {
    return 0;
  }

  updateEnemyEnergy(energy: number): number {
    return 0;
  }

  getEnemyRage(): number {
    return 0;
  }

  updateEnemyRage(rage: number): number {
    return 0;
  }
  updatePlayerRage(rage: number): number {
    return 0;
  }
  getPlayerRage(): number {
    return 0;
  }

  getPlayerEnergy(): number {
    return 0;
  }

  hideMenuButton() {
    this._Menu.hideMenuButton();
  }

  greenLight(): void {
   
  }
  redLight(): void {
  }

  playSfx(sfx: string, volume: number): void {

   
    this._Audio.playSfx(sfx, volume);

  }
}
