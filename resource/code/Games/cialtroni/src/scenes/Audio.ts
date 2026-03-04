
import { language, } from "../Enums";
import { translations } from "../Translations";
export default class Audio extends Phaser.Scene {

  private _musicVolume: number = 1;
  private _sfxVolume: number = 1;
  private _currentMusic: Phaser.Sound.BaseSound | null = null;
  private _bg: Phaser.GameObjects.Image;
  private _text: Phaser.GameObjects.Text;
  private _currentLanguage: language = language.english;

  constructor() {
    // il metodo super prende come parametro un oggetto con una chiave key che ha come valore il nome della scena
    super({
      key: "Audio",
    });

  }



  //il metodo create viene chiamato dopo il metodo preload
  create() {


    //take game screenshot on key press O
    /*this.input.keyboard.on('keydown-O', () => {
     this.takeScreenshot();
    });
    */



    this._currentLanguage = this.registry.get("language") || language.english;

    this._bg = this.add
      .image(this.game.canvas.width / 2, this.game.canvas.height / 2, "layer")
      .setOrigin(0.5, 0.5);

    this._text = this.add
      .text(this.game.canvas.width / 2, this.game.canvas.height / 2, translations[this._currentLanguage].paused)
      .setOrigin(0.5).setColor("#ffffff").setFontSize(80).setFontFamily("PressStart2P").setDepth(1002);


    //lose focus event

    this.game.events.on(Phaser.Core.Events.BLUR, () => {

      this.scene.bringToTop();
      this.scene.manager.scenes.forEach((scene) => {
        if (scene.scene.isActive() && scene.scene.key !== this.scene.key) {
          scene.scene.pause();
        }
      });
    });

    //focus event
    this.game.events.on(Phaser.Core.Events.FOCUS, () => {
      this.scene.sendToBack();
      this.scene.manager.scenes.forEach((scene) => {
        if (scene.scene.isPaused() && scene.scene.key !== this.scene.key) {
          scene.scene.resume();
        }
      });


    });


    /*this.scenes.forEach((scene) => {

      console.log(scene.key);
    });*/

  }

  playMusic(musicKey: string, restart: boolean, volume: number): void {
    if (this._currentMusic) {
      this._currentMusic.stop();
    }
    this._currentMusic = this.sound.add(musicKey, { loop: restart, volume: volume * this._musicVolume });
    this._currentMusic.play();
  }


  setMusicVolume(volume: number): void {
    this._musicVolume = volume;
    localStorage.setItem("musicVolume", volume.toString());

    // Aggiorna il volume della musica corrente

    if (this._currentMusic) {
      (this._currentMusic as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).volume = this._musicVolume;
    }
  }

  stopMusic(): void {
    if (this._currentMusic) {
      this._currentMusic.stop();
    }
  }

  pauseMusic(): void {
    if (this._currentMusic) {
      this._currentMusic.pause();
    }
  }

  resumeMusic(): void {
    if (this._currentMusic) {
      this._currentMusic.resume();
    }
  }

  playSfx(sfx: string, volume: number): void {
    //console.log("play sfx!", params);

    //inserire codice per la regolazione degli fx sulla base del volume globale
    this.sound.playAudioSprite("sfx", sfx, { volume: volume * this._sfxVolume });
  }

  setSfxVolume(volume: number): void {
    this._sfxVolume = volume;
    localStorage.setItem("sfxVolume", volume.toString());

  }

  getMusicVolume(): number {
    return this._musicVolume;
  }
  getSfxVolume(): number {
    return this._sfxVolume;
  }

  takeScreenshot(): void {
    this.game.renderer.snapshot((image: any) => {
      //dpwnload the image
      const a: any = document.createElement('a');
      a.href = image.src;
      a.download = 'screenshot.png';
      a.click();
    });
  }



}
