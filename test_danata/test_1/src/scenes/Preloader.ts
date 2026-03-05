import { GameData } from "../GameData";
import WebFontFile from '../scenes/webFontFile';

export default class Preloader extends Phaser.Scene {
  private _loadingCircle: Phaser.GameObjects.Graphics;
  private _image: Phaser.GameObjects.Image;

  constructor() {
    super({ key: "Preloader" });
  }

  preload() {
    this.cameras.main.setBackgroundColor(GameData.globals.bgColor);
    this.loadAssets();

    this._loadingCircle = this.add.graphics();
    const centerX = this.game.canvas.width / 2;
    const centerY = this.game.canvas.height / 2 + 300;
    this._loadingCircle.setPosition(centerX, centerY);
    this.drawLoadingCircle();

    this.tweens.add({
      targets: this._loadingCircle,
      rotation: Math.PI * 2,
      duration: 2000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  create() {
    this._image = this.add
      .image(GameData.preloader.imageX, GameData.preloader.imageY, GameData.preloader.image)
      .setAlpha(0)
      .setScale(0.4);

    this.tweens.add({
      targets: this._image,
      alpha: 1,
      duration: 4000,
    });
  }

  private drawLoadingCircle() {
    const radius = 40;
    const thickness = 8;

    this._loadingCircle.clear();
    this._loadingCircle.lineStyle(thickness, 0xffffff, 1);
    this._loadingCircle.beginPath();
    this._loadingCircle.arc(0, 0, radius, 0, Math.PI * 1.5);
    this._loadingCircle.strokePath();
  }

  loadAssets(): void {
    this.load.on("start", () => {});
    this.load.on("fileprogress", () => {});
    this.load.on("progress", () => {
      // il cerchio ruota automaticamente
    });

    this.load.on("complete", () => {
      // cerchio in dissolvenza senza interrompere la rotazione
      this.tweens.add({
        targets: this._loadingCircle,
        alpha: 0,
        duration: 1000,
      });

      // piccolo ritardo prima del fade-in dell'immagine
      this.time.delayedCall(2000, () => {
        this.tweens.add({
          targets: this._image,
          alpha: 1,
          duration: 3000,
        });
      });

      // dopo 5s scompare tutto e si passa alla scena Menu
      this.time.delayedCall(5000, () => {
        this.tweens.add({
          targets: [this._image, this._loadingCircle],
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            this.scene.stop("Preloader");
            this.scene.start("Menu");
          },
        });
      });
    });


    //Assets Load
    //--------------------------

    // WEB FONT
    if (GameData.webfonts != null) {
      let _fonts: Array<string> = [];
      GameData.webfonts.forEach((element: FontAsset) => {
        _fonts.push(element.key);
      });
      this.load.addFile(new WebFontFile(this.load, _fonts));
    }

    // LOCAL FONT
    if (GameData.fonts != null) {
      let _fonts: Array<string> = [];
      GameData.fonts.forEach((element: FontAsset) => {
        this.load.font(element.key, element.path,element.type);
      });
      
    }

    // SCRIPT
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

    // VIDEO 
    if (GameData.videos != null) {
      GameData.videos.forEach((element: VideoAsset) => {
        this.load.video(element.name, element.path, true);
      });
    }

    // BITMAP FONTS
    if (GameData.bitmapfonts != null)
      GameData.bitmapfonts.forEach((element: BitmapfontAsset) => {
        this.load.bitmapFont(element.name, element.imgpath, element.xmlpath);
      });

    // SOUNDS
    if (GameData.sounds != null)
      GameData.sounds.forEach((element: SoundAsset) => {
        this.load.audio(element.name, element.paths);
      });

    // AUDIO
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
