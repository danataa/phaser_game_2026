import Dialog from "phaser3-rex-plugins/templates/ui/dialog/Dialog";
import GamePlay from "./GamePlay";
import EnergyBar from "../gameComponents/others/EnergyBar";
import Portraits from "../gameComponents/others/Portraits";
import Dialogs from "../gameComponents/others/Dialogs";
import { GameData } from "../GameData";
import { language } from "../Enums";
import { translations } from "../Translations";
import Hud from "./Hud";
import Controls from "../gameComponents/others/Controls";




export default class HudBeat extends Hud {

  private _portraitLeft: Portraits;
  private _portraitRight: Portraits;
  private _dialogs: Dialogs;
  private _Controls: Controls;
  private _trafficLightContainer: Phaser.GameObjects.Container;
  private _trafficLight: Phaser.GameObjects.Sprite;

  constructor() {
    super();




  }


  update(time: number, delta: number): void {



  }

  //nel caso la hud è già stata creata resetto solo le cose che mi interessano
  updateHud(level: number, scene: GamePlay) {
    this._Gameplay = scene;
    this._levelData = GameData.levels[level];
    this.stopTime();

  }

  //creo la hud la prima volta
  setUpHud(level: number, scene: GamePlay) {


    super.setUpHud(level, scene);

    this._trafficLightContainer = this.add.container(0, -100).setAlpha(0);
    this._trafficLight = this.add.sprite(640, 108, "traffic-light").setOrigin(0.5, 0);


    if (!this.anims.exists("red-light")) {
      this.anims.create({
        key: "red-light",
        frames: this.anims.generateFrameNumbers("traffic-light", { frames: [0, 1] }),
        frameRate: 3,
        repeat: -1
      });
    }

    if (!this.anims.exists("yellow-light")) {
      this.anims.create({
        key: "yellow-light",
        frames: this.anims.generateFrameNumbers("traffic-light", { frames: [0, 2] }),
        frameRate: 3,
        repeat: -1
      });
    }

    if (!this.anims.exists("green-light")) {
      this.anims.create({
        key: "green-light",
        frames: this.anims.generateFrameNumbers("traffic-light", { frames: [0, 3] }),
        frameRate: 3,
        repeat: -1
      });
    }

    this._trafficLight.play("red-light");

    this._trafficLightContainer.add(
      this.add.image(640, 0, "traffic-light-top").setOrigin(0.5, 0)
    );

    this._trafficLightContainer.add(
      this._trafficLight
    );



    this._portraitLeft = new Portraits({
      scene: this,
      x: 100,
      y: 100,
      portrait: { x: 100, y: 100, key: "portraits" },
      portraitModal: { x: 40, y: 40, key: "dialog" },
      portraitName: { x: 280, y: 40 },
      energyBar: { text: { x: 180, y: 60 }, x: 180, y: 77, width: 300, height: 20, value: 100 },
      rageBar: { text: { x: 180, y: 108 }, x: 180, y: 124, width: 300, height: 20, value: 0, rageDuration: 300 }
    });

    this._portraitRight = new Portraits({
      scene: this,
      x: 1180,
      y: 100,
      portrait: { x: 1180, y: 100, key: "portraits" },
      portraitModal: { x: 780, y: 40, key: "dialog", flipX: true },
      portraitName: { x: 1080, y: 40 },
      energyBar: { text: { x: 1100, y: 60, originX: 1 }, x: 800, y: 77, width: 300, height: 20, value: 100 },
      rageBar: { text: { x: 1100, y: 108, originX: 1 }, x: 800, y: 124, width: 300, height: 20, value: 0, rageDuration: 150 }
    });


    this._dialogs = new Dialogs({ scene: this });



    scene.events.off("start-dialog", this.startDialog, this);
    scene.events.off("start-enemy-rage", this.startEnemyRage, this);
    scene.events.off("start-player-rage", this.startPlayerRage, this);

    scene.events.on("start-dialog", this.startDialog, this);
    scene.events.on("start-enemy-rage", this.startEnemyRage, this);
    scene.events.on("start-player-rage", this.startPlayerRage, this);


    //se è mobile setto i controlli mobile
    if (this.sys.game.device.input.touch) {
      this._Controls = new Controls({ scene: this, gameplay: this._Gameplay });
    }


  }


  startEnemyRage(): void {
    this._portraitRight.startRage(() => { this.endEnemyRage(); });
  }

  startPlayerRage(): void {
    this._portraitLeft.startRage(() => { this.endPlayerRage(); });
    this.greenLight();
  }


  greenLight(): void {
    this.playSfx("bonus-activate", 0.5);
    this._trafficLight.play("green-light");
  }
  
  redLight(): void {
    this._trafficLight.play("red-light");
    this.playSfx("rage-end", 0.5);
  }


  endEnemyRage(): void {
    this._Gameplay.endEnemyRage();
  }

  endPlayerRage(): void {
    this._Gameplay.endPlayerRage();
    this.redLight();
  }

  startDialog(parameters: Array<any>): void {

    this._currentLanguage = this.registry.get("language") || language.english;
    let _index = <number>parameters[0];

    this._dialogs.setLanguage(this._currentLanguage);
    this._dialogs.startDialog(_index);


  }

  showPortraits() {
    this._currentLanguage = this.registry.get("language") || language.english;
    this._portraitLeft.setLanguage(this._currentLanguage);
    this._portraitLeft.show();
    this._portraitRight.setLanguage(this._currentLanguage);
    this._portraitRight.show();
    this.showTrafficLight();

  }

  showTrafficLight(): void {
    this.tweens.add({
      targets: this._trafficLightContainer,
      alpha: 1,
      y: 0,
      duration: 500,
      ease: Phaser.Math.Easing.Bounce.Out
    });
  }

  hideTrafficLight(): void {
    this.tweens.add({
      targets: this._trafficLightContainer,
      alpha: 0,
      y: "-=100",
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
    });
  }

  setPortraitFrame(frame: number): void {
    this._portraitLeft.setPortraitFrame(0);
    this._portraitRight.setPortraitFrame(frame);
  }


  updatePlayerRage(rage: number): number {
    return this._portraitLeft.updateRageBar(rage);
  }

  updateEnemyRage(rage: number): number {
    return this._portraitRight.updateRageBar(rage);
  }


  updatePlayerEnergy(energy: number): number {
    return this._portraitLeft.updateEnergyBar(energy);
  }

  updateEnemyEnergy(energy: number): number {
    return this._portraitRight.updateEnergyBar(energy);
  }

  getPlayerEnergy(): number {
    return this._portraitLeft.getEnergyValue();
  }

  getEnemyEnergy(): number {
    return this._portraitRight.getEnergyValue();
  }


  changeLanguage(_language: language) {

    super.changeLanguage(_language);
    if (this._portraitLeft != null) this._portraitLeft.setLanguage(_language);
    if (this._portraitRight != null) this._portraitRight.setLanguage(_language);
    if (this._dialogs != null) this._dialogs.setLanguage(_language);

  }



  hideAll(): void {
    super.hideAll();
    this._portraitLeft.hide();
    this._portraitRight.hide();

    this.hideTrafficLight();
    if (this.sys.game.device.input.touch) 
    {this._Controls.removeControls();}
  }

  getPlayerRage(): number {
    return this._portraitLeft.getRageValue();
  }

  getEnemyRage(): number {
    return this._portraitRight.getRageValue();
  }

}
