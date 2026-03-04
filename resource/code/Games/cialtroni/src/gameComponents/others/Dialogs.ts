
import HudBeat from "../../scenes/HudBeat";
import { language, dialogSpeaker } from "../../Enums";
import {  translations } from "../../Translations";
import IDialogs from "./iDialogs";
import {dialogsTexts} from "../../Translations";

export default class Dialogs

  implements IDialogs {

  private _barTop: Phaser.GameObjects.Image;
  private _barBottom: Phaser.GameObjects.Image;
  protected _Hud: HudBeat;
  private _dialogLeftContainer: Phaser.GameObjects.Container;
  private _dialogLeftPortrait: Phaser.GameObjects.Image;
  private _dialogLeftName: Phaser.GameObjects.Text;
  private _dialogLeftText: Phaser.GameObjects.Text;
  private _dialogLeftNext: Phaser.GameObjects.Image;

  private _dialogRightContainer: Phaser.GameObjects.Container;
  private _dialogRightPortrait: Phaser.GameObjects.Image;
  private _dialogRightName: Phaser.GameObjects.Text;
  private _dialogRightText: Phaser.GameObjects.Text;
  private _dialogRightNext: Phaser.GameObjects.Image;

  private _skipDialogButton: Phaser.GameObjects.Text;
  private _currentLanguage: language = language.english;

  private _dialogs: Array<dialog> = dialogsTexts
  private _currentDialogIndex: number = 0;
  private _currentDialogStep: number = 0;
  private _currentDialog: dialog;

  constructor(params: dialogConfig

  ) {




    this._Hud = <HudBeat>params.scene;


    this._barTop = this._Hud.add.image(0, -150, "dialogBar").setOrigin(0, 0);
    this._barBottom = this._Hud.add.image(0, 720 + 150, "dialogBar").setOrigin(0, 1);
    this._skipDialogButton = this._Hud.add.text(1280 / 2, 50, translations[this._currentLanguage].skipDialog, { color: "#ffffff" }).setFontFamily("'Press Start 2P'").setFontSize(20).setInteractive().on("pointerdown", () => {
      this.skipDialog();
    }).on("pointerover", () => {
      this._skipDialogButton.setStyle({ fill: "#f60" });
    }).on("pointerout", () => {
      this._skipDialogButton.setStyle({ fill: "#ffffff" });
    }).setOrigin(0.5, 0.5).setAlpha(0);

    this.createDialogContainers();


  }


  setLanguage(language: language) {
    this._currentLanguage = language;

    this._skipDialogButton.setText(translations[this._currentLanguage].skipDialog);

  }

  startDialog(index: number): void {

  
    this._currentDialogIndex = index;

    this._currentDialog = this._dialogs[this._currentDialogIndex];


    this._dialogRightName.setText(this._currentDialog.cialtrone.name);
    this._dialogRightPortrait.setFrame(this._currentDialog.cialtrone.frame);
    this._Hud.setPortraitFrame(this._currentDialog.cialtrone.frame);
 

    this._Hud.tweens.add({

      targets: this._barTop,
      y: 0,
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,

    });

    this._Hud.tweens.add({

      targets: this._barBottom,
      y: 720,
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,

    });

    this._Hud.tweens.add({
      targets: this._Hud.getGamePlay().cameras.main,
      zoom: 1.5,
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
      onComplete: () => {

        this.showBorrelliDialog();
        this._Hud.tweens.add({
          targets: this._skipDialogButton,
          alpha: 1,
          duration: 500,
        });
      }

    });



  }



  endDialog(): void {

    this.hideBorrelliDialog();
    this.hideCialtroneDialog();
    this._skipDialogButton.setInteractive(false);
    this._skipDialogButton.setAlpha(0);

    this._Hud.tweens.add({

      targets: this._barTop,
      y: "-=150",
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,

    });

    this._Hud.tweens.add({

      targets: this._barBottom,
      y: "+=150",
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,

    });

    this._Hud.tweens.add({
      targets: this._Hud.getGamePlay().cameras.main,
      zoom: 1,
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
      onComplete: () => {

        this._currentDialogStep = 0;
        this._Hud.getGamePlay().events.emit("end-dialog");
        this._Hud.getGamePlay().endDialog();
        this._Hud.showTime();
        this._Hud.showPortraits();

      }
    });
  }


  createDialogContainers(): void {

    this._dialogLeftContainer = this._Hud.add.container(0, 90).setAlpha(0);
    let _dialogBg = this._Hud.add.image(0, 0, "dialog").setOrigin(0);
    this._dialogLeftPortrait = this._Hud.add.image(135, 122, "portraits", 0).setOrigin(0.5);
    this._dialogLeftName = this._Hud.add.text(140, -15, "Borrelli", { fontSize: "28px", color: "#fff" }).setOrigin(0.5).setFontFamily("'Press Start 2P'");
    this._dialogLeftText = this._Hud.add.text(280, 40, "", { fontSize: "22px", color: "#480000" }).setOrigin(0).setFontFamily("'Press Start 2P'").setWordWrapWidth(650).setLineSpacing(10);
    this._dialogLeftNext = this._Hud.add.image(900, 195, "back").setOrigin(0.5).setInteractive().on("pointerdown", () => {
      this.nextDialog()
    }).setFlipX(true).on("pointerover", () => {
      this._dialogLeftNext.setTintFill(0xff6600);
    }).on("pointerout", () => {
      this._dialogLeftNext.clearTint();
    });

    this._dialogLeftContainer.add([_dialogBg, this._dialogLeftPortrait, this._dialogLeftName, this._dialogLeftText, this._dialogLeftNext]);


    this._dialogRightContainer = this._Hud.add.container(0, 90).setAlpha(0);
    let _dialogBg2 = this._Hud.add.image(1280, 0, "dialog").setOrigin(1, 0).setFlipX(true);
    this._dialogRightPortrait = this._Hud.add.image(1143, 122, "portraits", 3).setOrigin(0.5);
    this._dialogRightName = this._Hud.add.text(1145, -15, "", { fontSize: "28px", color: "#fff" }).setOrigin(0.5).setOrigin(0.5).setFontFamily("'Press Start 2P'");
    this._dialogRightText = this._Hud.add.text(370, 40, "", { fontSize: "22px", color: "#480000" }).setOrigin(0).setFontFamily("'Press Start 2P'").setWordWrapWidth(650).setLineSpacing(10);
    this._dialogRightNext = this._Hud.add.image(1280 - 900, 195, "back").setOrigin(0.5).setInteractive().on("pointerdown", () => {
      this.nextDialog()
    }).setFlipX(false).on("pointerover", () => {
      this._dialogRightNext.setTintFill(0xff6600);
    }).on("pointerout", () => {
      this._dialogRightNext.clearTint();
    });

    this._dialogRightContainer.add([_dialogBg2, this._dialogRightPortrait, this._dialogRightName, this._dialogRightText, this._dialogRightNext]);
  }


  nextDialog(): void {

    this.playSfx("click", 1);




    if (this._currentDialogStep < this._currentDialog.dialog[this._currentLanguage].length - 1) {

      this._currentDialogStep++;

      if (this._currentDialog.dialog[this._currentLanguage][this._currentDialogStep].speaker === dialogSpeaker.borrelli) {

        this.showBorrelliDialog();
        this.hideCialtroneDialog();

      } else if (this._currentDialog.dialog[this._currentLanguage][this._currentDialogStep].speaker === dialogSpeaker.cialtrone) {


        this.showCialtroneDialog();
        this.hideBorrelliDialog();

      }
    } else {

      this.endDialog();


    }







  }

  hideBorrelliDialog(): void {
    this._Hud.tweens.add({
      targets: this._dialogLeftContainer,
      alpha: 0,
      x: "-=50",
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
      onComplete: () => {
        this._dialogLeftText.setText("");
      }
    });
  }
  showBorrelliDialog(): void {

    this._Hud.tweens.add({
      targets: this._dialogLeftContainer,
      alpha: 1,
      x: "+=50",
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
      onComplete: () => {

        this.typeWriterEffect(this._currentDialog.dialog[this._currentLanguage][this._currentDialogStep].text, this._currentDialog.dialog[this._currentLanguage][this._currentDialogStep].speaker);
      }
    });
  }
  hideCialtroneDialog(): void {
    this._Hud.tweens.add({
      targets: this._dialogRightContainer,
      alpha: 0,
      x: "+=50",
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
      onComplete: () => {
        this._dialogRightText.setText("");
      }
    });
  }

  showCialtroneDialog(): void {

    this._Hud.tweens.add({
      targets: this._dialogRightContainer,
      alpha: 1,
      x: "-=50",
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
      onComplete: () => {
        this.typeWriterEffect(this._currentDialog.dialog[this._currentLanguage][this._currentDialogStep].text, this._currentDialog.dialog[this._currentLanguage][this._currentDialogStep].speaker);
      }
    });
  }


  //crea una funzione che passando una stringa di testo visualizzi tipo typewriter il testo
  typeWriterEffect(text: string, speaker: dialogSpeaker): void {
    let container: Phaser.GameObjects.Container;
    let textObject: Phaser.GameObjects.Text;
    if (speaker === dialogSpeaker.borrelli) {
      textObject = this._dialogLeftText
    } else if (speaker === dialogSpeaker.cialtrone) {
      textObject = this._dialogRightText

    }

    textObject.setText("");

    let index = 0;
    const speed = 1; // Velocità di scrittura

    const type = () => {
      if (index < text.length) {
        textObject.setText(textObject.text + text.charAt(index));
        index++;
        this._Hud.time.delayedCall(speed, type);
      }
    };

    type();
  }


  skipDialog(): void {

    this.playSfx("click", 1);
    this.hideBorrelliDialog();
    this.hideCialtroneDialog();
    this.endDialog();
    this._currentDialogStep = 0;

  }



  playSfx(sfx: string, volume: number): void {

    this._Hud.playSfx(sfx, volume);



  }









}


