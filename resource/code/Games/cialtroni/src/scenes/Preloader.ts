//importiamo la classe GameData
import { GameData } from "../GameData";
import WebFontFile from '../scenes/webFontFile';
import { language } from "../Enums";
import { translations } from "../Translations";

export default class Preloader extends Phaser.Scene {

  private _loading: Phaser.GameObjects.Text;
  private _progress: Phaser.GameObjects.Graphics;
  private _image: Phaser.GameObjects.Image;
  private _currentLanguage: language = language.english;
  private _disclaimerText: Phaser.GameObjects.Text;
  private _mobileDisclaimerText: Phaser.GameObjects.Text;
  private _startGameButton: Phaser.GameObjects.Text;
  
  private _buttonStart: Phaser.GameObjects.Sprite;
  private _nextText: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "Preloader",
    });
  }

  preload() {
    this.cameras.main.setBackgroundColor(GameData.preloader.bgColor);
    this._progress = this.add.graphics();
    this.loadAssets();
  }

  init() {



    this._currentLanguage = this.registry.get("language") || language.english;
    this._image = this.add
      .image(
        GameData.preloader.imageX,
        GameData.preloader.imageY,
        GameData.preloader.image
      )
      .setAlpha(0)

    this.tweens.add({
      targets: [this._image],
      alpha: 1,
      duration: 500,
    });



    this._loading = this.add
      .text(this.game.canvas.width / 2, GameData.preloader.loadingTextY, "")
      .setAlpha(1)
      .setDepth(1001)
      .setOrigin(0.5, .5)
      .setColor("#ffffff")
      .setFontSize(30)
      .setFontFamily(GameData.preloader.loadingTextFont)




  }

  loadAssets(): void {

    this.load.on("start", () => { });

    this.load.on("fileprogress", (file: any, value: any) => {

      //console.log("fileprogress: " + file.key);

    });

    this.load.on("load", (file: any, value: any) => {

      //console.log("loaded: " + file.key);

    });

    this.load.on("loaderror", (file: any, value: any) => {

      //console.log("loaderror: " + file.key);

    });

    this.load.on("filecomplete", (filename: any, value: any) => {

      // console.log("filecomplete: " + filename);

    });

    this.load.on("progress", (value: number) => {

      this._progress.clear();
      this._progress.fillStyle(GameData.preloader.loadingBarColor, 1);
      this._progress.fillRect(0, GameData.preloader.loadingBarY, GameData.globals.gameWidth * value, 70);
      this._loading.setText(translations[this._currentLanguage].loading + " " + Math.round(value * 100) + "%");
    });

    this.load.on("complete", () => {

      this._progress.clear();
      this._loading.setText(translations[this._currentLanguage].loadingComplete);


      this.input.once("pointerdown", () => {
        this.tweens.add({
          targets: [this._image, this._loading],
          alpha: 0,
          duration: 500,
          onComplete: () => {


            //verifichiamo se il dispositivo è touch o meno
            //se non è mobile partiamo direttamente
            if (!this.sys.game.device.input.touch) {

              this.startGame();
            } 
            //se è mobile mostriamo il disclaimer
            else {
              this.tweens.add({
                targets: [this._disclaimerText, this._mobileDisclaimerText, this._buttonStart, this._nextText],
                alpha: 1,
                duration: 500,
              });

            }


/*




            return;

            this.scene.start("Audio");


            this.scene.start("Intro");
            this.scene.start("Menu");
            this.scene.bringToTop("Menu");
            return;



            this.scene.stop(this);
            this.scene.start("Prelevel", { level: 0 });
            this.scene.start("Menu");
            this.scene.bringToTop("Menu");
            return;



            this.scene.start("PreIntro");
            return;
            //   this.scene.start("Win");
            //   return;








            //richiamiamo il metodo start della far partire la scena Intro
            //this.scene.start("GamePlay");
            //this.scene.start("Hud");
            //this.scene.bringToTop("Hud");
            */

          },
        });

      });

    });


    //Assets Load
    //--------------------------

    //WEB FONT
    if (GameData.webfonts != null) {
      let _fonts: Array<string> = [];
      GameData.webfonts.forEach((element: FontAsset) => {
        _fonts.push(element.key);
      });
      this.load.addFile(new WebFontFile(this.load, _fonts));
    }

    //local FONT
    if (GameData.fonts != null) {
      let _fonts: Array<string> = [];
      GameData.fonts.forEach((element: FontAsset) => {
        this.load.font(element.key, element.path, element.type);
      });

    }


    //SCRIPT
    if (GameData.scripts != null)
      GameData.scripts.forEach((element: ScriptAsset) => {
        this.load.script(element.key, element.path);
      });

    // IMAGES
    if (GameData.images != null)
      GameData.images.forEach((element: ImageAsset) => {
        this.load.image(element.name, element.path);
      });

    // TILEMAPS
    if (GameData.tilemaps != null)
      GameData.tilemaps.forEach((element: TileMapsAsset) => {
        this.load.tilemapTiledJSON(element.key, element.path);
      });

    // ATLAS
    if (GameData.atlas != null)
      GameData.atlas.forEach((element: AtlasAsset) => {
        this.load.atlas(element.key, element.imagepath, element.jsonpath);
      });

    // SPRITESHEETS
    if (GameData.spritesheets != null)
      GameData.spritesheets.forEach((element: SpritesheetsAsset) => {
        this.load.spritesheet(element.name, element.path, {
          frameWidth: element.width,
          frameHeight: element.height,
          endFrame: element.frames,
        });
      });

    //video 
    if (GameData.videos != null) {
      GameData.videos.forEach((element: VideoAsset) => {
        this.load.video(element.name, element.path, true);
      });
    }

    //bitmap fonts
    if (GameData.bitmapfonts != null)
      GameData.bitmapfonts.forEach((element: BitmapfontAsset) => {
        this.load.bitmapFont(element.name, element.imgpath, element.xmlpath);
      });

    // SOUNDS
    if (GameData.sounds != null)
      GameData.sounds.forEach((element: SoundAsset) => {
        this.load.audio(element.name, element.paths);
      });

    // Audio
    if (GameData.audios != null)
      GameData.audios.forEach((element: AudioSpriteAsset) => {
        this.load.audioSprite(
          element.name,
          element.jsonpath,
          element.paths,
          element.instance
        );
      });
  }


  create() {


    this._disclaimerText = this.add
      .text(this.game.canvas.width / 2, 150, translations[this._currentLanguage].disclaimer, {
        fontSize: "60px",
        color: "#ff6600",
        align: "center",
        wordWrap: { width: GameData.globals.gameWidth - 100 }
      })
      .setAlpha(0)
      .setDepth(1001)
      .setOrigin(0.5, .5)
      .setFontFamily("PressStart2P")
      .setShadow(2, 2, "#000000", 2, true, true);

    this._mobileDisclaimerText = this.add
      .text(this.game.canvas.width / 2, 300, translations[this._currentLanguage].mobileDisclaimer, {
        fontSize: "30px",
        color: "#ffffff",
        align: "left",
        lineSpacing: 10,
        wordWrap: { width: GameData.globals.gameWidth - 100 }
      })
      .setAlpha(0)
      .setDepth(1001)
      .setOrigin(0.5, .5)
      .setFontFamily("PressStart2P")


        this._buttonStart = this.add.sprite(640, 420 + 50, "button-start").setOrigin(0.5, 0).setInteractive().setDepth(1002).setAlpha(0).on("pointerdown", () => {
      this.startGame();
    }).on("pointerover", () => {

      

      this._buttonStart.setFrame(1);
      this._nextText.setY(592 + 57);

    }).on("pointerout", () => {

      this._buttonStart.setFrame(0);
      this._nextText.setY(584 + 57);

    });

    this._nextText = this.add.text(640, 434 + 57, translations[this._currentLanguage].continue, { fontFamily: "PressStart2P", fontSize: "28px", color: "#000000", align: "center" })
      .setOrigin(0.5, 0)
      .setColor("#ffffff")
      .setFontSize(20)
      .setFontFamily("PressStart2P").setDepth(1002).setAlpha(0);

  }

  startGame(): void {
    this.scene.start("Audio");
     this.scene.start("PreIntro");
  }


}
