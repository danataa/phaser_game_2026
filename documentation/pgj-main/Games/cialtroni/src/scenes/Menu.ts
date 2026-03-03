import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import Credits from "../gameComponents/others/Credits";
import Options from "../gameComponents/others/Options";
import HowToPlay from '../gameComponents/others/HowToPlay';
import { language } from "../Enums";
import { translations } from "../Translations";
import Audio from './Audio';
import CustomPipelineCrt from '../gameComponents/pipelines/CustomPipelineCrt';


export default class Menu extends Phaser.Scene {

  private _Audio: Audio;
  private _Options: Options;
  private _Credits: Credits;
  private _HowToPlay: HowToPlay;
  private _currentLanguage: language = language.english;
  private _menuBtn: Phaser.GameObjects.Sprite;
  private _menuText: Phaser.GameObjects.Text;
  private _menuContainer: Phaser.GameObjects.Container;
  private _modal: Phaser.GameObjects.Image;
  private _layer: Phaser.GameObjects.Image;
  private rexUI: UIPlugin;
  private _isMenuOpen: boolean = false;
  private _textContainer: Phaser.GameObjects.Container;
  private _optionsText: Phaser.GameObjects.Text;
  private _creditsText: Phaser.GameObjects.Text;
  private _howToPlayText: Phaser.GameObjects.Text;
  private _pizza: Phaser.GameObjects.Image;
  private _special: Phaser.GameObjects.Sprite;
  private _specialText: Phaser.GameObjects.Text;
  private _pizzaIsTweening: boolean = false;



  constructor() {
    super({
      key: "Menu",
    });

  }

  init() {
    // Inizializza le opzioni
  }

  create() {


    this._Audio = <Audio>this.scene.get("Audio");
    this._Credits = new Credits({ scene: this, rexUI: this.rexUI });
    this._HowToPlay = new HowToPlay({ scene: this, rexUI: this.rexUI });
    this._Options = new Options({ scene: this, rexUI: this.rexUI });


    this._menuBtn = this.add.sprite(1270, 0, "menu-btn").setOrigin(1, 0).setScale(2).setInteractive().on("pointerdown", () => {

      this.toggle();
    }).setDepth(1001).setAlpha(0).setActive(false).on("pointerover", () => {


      if (!this._isMenuOpen) {

        this._menuBtn.setFrame(1);
      }


    }).on("pointerout", () => {
      if (!this._isMenuOpen) {
        this._menuBtn.setFrame(0);
      }

    });

    this._menuContainer = this.add.container(0, 0).setDepth(1000).setAlpha(0).setActive(false)

    this._layer = this.add.image(0, 0, "options-layer").setOrigin(0).setInteractive();
    this._modal = this.add.image(640, 360, "modal-options").setOrigin(0.5);
    this._pizza = this.add.image(900, 290, "pizza").setOrigin(0.5).setAlpha(0);
    this._menuContainer.add([this._layer, this._modal, this._pizza]);

    this._textContainer = this.add.container(0, 0).setDepth(1001);

    this._menuText = this.add.text(395, 350, "MENU", { fontSize: "60px", color: "#f5a400" }).setOrigin(0).setFontFamily("gagalin");

    this._optionsText = this.add.text(400, 450, translations[this._currentLanguage].options, { fontSize: "20px", color: "#ffffff" }).setOrigin(0).setFontFamily("PressStart2P").setInteractive().on("pointerdown", () => {
      this.showOptions();


      this.playSfx("click", 1);

    }).on("pointerover", () => {
      this._optionsText.setStyle({ color: "#0088ff" });
    }).on("pointerout", () => {
      this._optionsText.setStyle({ color: "#ffffff" });
    });

    let _line1 = this.add.image(400, 490, "menu-line").setOrigin(0)

    this._creditsText = this.add.text(400, 520, translations[this._currentLanguage].credits, { fontSize: "20px", color: "#ffffff" }).setOrigin(0).setFontFamily("PressStart2P").setInteractive().on("pointerdown", () => {
      this.showCredits();
      this.playSfx("click", 1);

    }).on("pointerover", () => {
      this._creditsText.setStyle({ color: "#0088ff" });
    }).on("pointerout", () => {
      this._creditsText.setStyle({ color: "#ffffff" });
    });

    let _line2 = this.add.image(400, 560, "menu-line").setOrigin(0)

    this._howToPlayText = this.add.text(400, 590, translations[this._currentLanguage].howToPlay, { fontSize: "20px", color: "#ffffff" }).setOrigin(0).setFontFamily("PressStart2P").setInteractive().on("pointerdown", () => {
      this.showHowToPlay();
      this.playSfx("click", 1);
    })
      .on("pointerover", () => {
        this._howToPlayText.setStyle({ color: "#0088ff" });
      }).on("pointerout", () => {
        this._howToPlayText.setStyle({ color: "#ffffff" });
      });


    let _slice = this.add.image(350, 450, "slice").setOrigin(0.5).setScale(.2);
    let _beer = this.add.image(350, 525, "beer").setOrigin(0.5).setScale(.2);
    let _sfogliatella = this.add.image(350, 600, "sfogliatella").setOrigin(0.5).setScale(.15);


    this._special = this.add.sprite(690, 520, "special").setOrigin(0).setInteractive().on("pointerdown", () => {
      this.shot(0); this.shot(100); this.shot(200);
      this._special.disableInteractive().setAlpha(0.5).setFrame(0);
      this._specialText.setAlpha(0.5);
      this.time.addEvent({
        delay: 10000, callback: () => {
          this._special.setAlpha(1).setInteractive();
          this._specialText.setAlpha(1);
        }
      });

    }).on("pointerover", () => {
      this._special.setFrame(1);
    }).on("pointerout", () => {
      this._special.setFrame(0);
    });
    this._specialText = this.add.text(705, 560, "SPECIAL", { fontSize: "40px", color: "#ffffff" }).setOrigin(0).setFontFamily("gagalin");

    this._textContainer.add([_slice, _beer, _sfogliatella, this._menuText, this._optionsText, this._creditsText, this._howToPlayText, this._special, this._specialText, _line1, _line2]).setActive(false).setAlpha(0);



    // Crea l'interfaccia delle opzioni
  }

  shot(_delay: number) {

    this.time.addEvent({
      delay: _delay, callback: () => {

        this.playSfx("gun", 1);

        let _shot = this.add.image(Phaser.Math.RND.integerInRange(300, 980), Phaser.Math.RND.integerInRange(200, 520), "shot").setDepth(10000).setTintFill(0xffffff).setRotation(Phaser.Math.RND.integerInRange(0, 360)).setScale(Phaser.Math.RND.realInRange(0.9, 1.1));

        this.tweens.add({
          delay: 5000,
          duration: 500,
          targets: _shot,
          alpha: 0,
          onComplete: () => {
            _shot.destroy();
          }
        });

      }
    })




  }

  showOptions() {
    if (this._pizzaIsTweening) return;
    this.hidePizza();
    this.hideMenuOptions();
    this._Options.toggle();

  }
  showCredits() {
    if (this._pizzaIsTweening) return;
    this.hidePizza();
    this.hideMenuOptions();
    this._Credits.toggle();
  }

  showHowToPlay() {
    if (this._pizzaIsTweening) return;
    this.hidePizza();
    this.hideMenuOptions();
    this._HowToPlay.toggle();
  }

  hidePizza() {

    this.tweens.add({
      targets: this._pizza,
      x: 900,
      alpha: 0,
      duration: 300,
      ease: Phaser.Math.Easing.Sine.Out
    });
  }

  showPizza() {

    this._pizzaIsTweening = true;
    this.tweens.add({
      targets: this._pizza,
      delay: 200,
      x: 850,
      alpha: 1,
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
      onComplete: () => {
        this._pizzaIsTweening = false;
      }
    });
  }

  pauseGame() {


    this.events.emit("pause-game", language);

  }

  resumeGame() {


    this.events.emit("resume-game", language);

  }

  changeLanguage(_language: language) {

    this._Credits.setLanguage(_language);
    this._Options.setLanguage(_language);
    this._HowToPlay.setLanguage(_language);
    this._optionsText.setText(translations[_language].options);
    this._creditsText.setText(translations[_language].credits);
    this._howToPlayText.setText(translations[_language].howToPlay);
    this.events.emit("change-language", _language);

  }



  showMenuButton() {

    this.tweens.add({
      targets: this._menuBtn,
      y: "+=10",
      alpha: 1,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this._menuBtn.setActive(true).setInteractive();
      }
    });

  }

  hideMenuButton() {
    this._menuBtn.disableInteractive()

    this.tweens.add({
      targets: this._menuBtn,
      y: "-=10",
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {

        this._menuBtn.setActive(false);
      }
    });


  }

  showMenuOptions() {
    this._textContainer.setActive(true).setAlpha(1);
  }
  hideMenuOptions() {
    this._textContainer.setActive(false).setAlpha(0);
  }


  toggle() {

    this.playSfx("click", 1);

    this._menuBtn.disableInteractive();
    if (!this._isMenuOpen) {

      this.showMenu();
      this.pauseGame();
    } else {

      this.hideMenu();
      this._Credits.hide();
      this._Options.hide();
      this._HowToPlay.hide();
      this.resumeGame();
      this._menuBtn.setFrame(0);
    }


  }

  showMenu() {

    this._isMenuOpen = true;
    this.tweens.add({
      targets: [this._menuContainer, this._textContainer],
      alpha: 1,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this._menuBtn.setInteractive();
      }
    });

    this.showPizza();


  }

  hideMenu() {

    this.tweens.add({
      targets: [this._menuContainer, this._textContainer],
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this._menuBtn.setInteractive();
        this._isMenuOpen = false;
      }
    });
    this.hidePizza();


  }

  update(time: number, delta: number): void {

    //  console.log(this._pizza.x)


  }

  getAudio(): Audio {
    return this._Audio;
  }

  playSfx(sfx: string, volume: number): void {

    this._Audio.playSfx(sfx, volume);

  }



}
