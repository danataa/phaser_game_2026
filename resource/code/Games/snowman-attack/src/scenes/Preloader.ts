//importiamo la classe GameData
import { GameData } from "../GameData";
import WebFontFile from '../scenes/webFontFile';

export default class Preloader extends Phaser.Scene {

  private _loading: Phaser.GameObjects.Text;
  private _progress: Phaser.GameObjects.Graphics;
  private _image: Phaser.GameObjects.Image;

  constructor() {
    super({
      key: "Preloader",
    });
  }

  preload() {
    this.cameras.main.setBackgroundColor(GameData.globals.bgColor);
    this._progress = this.add.graphics();
    this.loadAssets();
  }

  init() {
    this._image = this.add
      .image(
        GameData.preloader.imageX,
        GameData.preloader.imageY,
        GameData.preloader.image
      )
      .setAlpha(0).setScale(.5);

    this.tweens.add({
      targets: [this._image],
      alpha: 1,
      duration: 500,
    });

    this._loading = this.add
      .text(this.game.canvas.width / 2, GameData.preloader.loadingTextY, "")
      .setAlpha(1)
      .setDepth(1001)
      .setOrigin(0.5, 1).setColor("#000000").setFontSize(40).setFontFamily(GameData.preloader.loadingTextFont);
  }

  loadAssets(): void {

    this.load.on("start", () => { });

    this.load.on("fileprogress", (file: any, value: any) => {

    });

    this.load.on("progress", (value: number) => {

      this._progress.clear();
      this._progress.fillStyle(GameData.preloader.loadingBarColor, 1);
      this._progress.fillRect(0, GameData.preloader.loadingBarY, GameData.globals.gameWidth * value, 70);
      this._loading.setText(GameData.preloader.loadingText + " " + Math.round(value * 100) + "%");
    });

    this.load.on("complete", () => {

      this._progress.clear();
      this._loading.setText(GameData.preloader.loadingTextComplete);

      this.input.once("pointerdown", () => {
        this.tweens.add({
          targets: [this._image, this._loading],
          alpha: 0,
          duration: 500,
          onComplete: () => {


            //custom code from https://phaser.io/examples/v3.85.0/games/view/tom
            this.anims.create({
              key: 'die',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'die', start: 0, end: 0, zeroPad: 3 })
          });
  
          this.anims.create({
              key: 'idle',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'idle', start: 0, end: 3, zeroPad: 3 }),
              yoyo: true,
              frameRate: 8,
              repeat: -1
          });
  
          this.anims.create({
              key: 'throwStart',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'throw', start: 0, end: 8, zeroPad: 3 }),
              frameRate: 26
          });
  
          this.anims.create({
              key: 'throwEnd',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'throw', start: 9, end: 11, zeroPad: 3 }),
              frameRate: 26
          });
  
          this.anims.create({
              key: 'snowmanIdleBig',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-idle', start: 0, end: 3 }),
              yoyo: true,
              frameRate: 8,
              repeat: -1
          });
  
          this.anims.create({
              key: 'snowmanWalkBig',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-walk', start: 0, end: 7 }),
              frameRate: 8,
              repeat: -1
          });
  
          this.anims.create({
              key: 'snowmanThrowStartBig',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-throw', start: 0, end: 5 }),
              frameRate: 20
          });
  
          this.anims.create({
              key: 'snowmanThrowEndBig',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-throw', start: 6, end: 8 }),
              frameRate: 20
          });
  
          this.anims.create({
              key: 'snowmanDieBig',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-die', start: 0, end: 4 }),
              frameRate: 14
          });
  
          this.anims.create({
              key: 'snowmanIdleSmall',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-idle', start: 0, end: 3 }),
              yoyo: true,
              frameRate: 8,
              repeat: -1
          });
  
          this.anims.create({
              key: 'snowmanWalkSmall',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-walk', start: 0, end: 7 }),
              frameRate: 8,
              repeat: -1
          });
  
          this.anims.create({
              key: 'snowmanThrowStartSmall',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-throw', start: 0, end: 5 }),
              frameRate: 20
          });
  
          this.anims.create({
              key: 'snowmanThrowEndSmall',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-throw', start: 6, end: 8 }),
              frameRate: 20
          });
  
          this.anims.create({
              key: 'snowmanDieSmall',
              frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-die', start: 0, end: 4 }),
              frameRate: 14
          });
            //end custom code

            //fermiamo la scena corrente
            this.scene.stop("Preloader");
            //richiamiamo il metodo start della far partire la scena Intro
            this.scene.start("Intro");

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
     
      GameData.fonts.forEach((element: FontAsset) => {
        this.load.font(element.key, element.path,element.type);
      });
      
    }

    //glsl
    if (GameData.glsl != null) {
      
      GameData.glsl.forEach((element: FontAsset) => {
        this.load.glsl(element.key, element.path);
      });
      
    }


     //JSON
     if (GameData.json != null) {
       GameData.json.forEach((element: jsonAsset) => {
        this.load.json(element.key, element.path);
      });
      
    }


     //Animations
     if (GameData.animations != null) {
      
      GameData.animations.forEach((element: jsonAsset) => {
        this.load.animation(element.key, element.path);
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
}
