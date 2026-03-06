//importiamo la libreria phaser
import "phaser";
//imoprtiamo il plugin rexUI
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
//importiamo le nostre scene
import Boot from "./scenes/Boot";
import Hud from "./scenes/Hud";
import Preloader from "./scenes/Preloader";
import GamePlay from "./scenes/GamePlay";
import GameOver from "./scenes/GameOver";
import PreIntro from "./scenes/PreIntro";
import Intro from "./scenes/Intro";
import Menu from "./scenes/Menu";
import Audio from "./scenes/Audio";
import Win from "./scenes/Win";
//importiamo GameData che contiene i valori globali del gioco
import { GameData } from "./GameData";
import Prelevel from "./scenes/Prelevel";

//il listener per l'evento load della pagina
//questo evento viene lanciato quando la pagina è stata caricata
//e tutti gli elementi della pagina sono disponibili
window.addEventListener("load", () => {



  /*
  const roundHalf = (num: number): number => Math.round(num * 2) / 2;
  const graphicsSettings = { best: 1, medium: 0.75, low: 0.5 }
  const DPR = window.devicePixelRatio * graphicsSettings.medium
  const { width, height } = window.screen
  const WIDTH = Math.round(Math.max(width, height) * DPR)
  const HEIGHT = Math.round(Math.min(width, height) * DPR)
  const assetsDPR = roundHalf(Math.min(Math.max(HEIGHT / 360, 1), 4))
  
  console.log('DPR = ', DPR)
  console.log('assetsDPR = ', assetsDPR)
  console.log('WIDTH = ', WIDTH)
  console.log('HEIGHT = ', HEIGHT)
  */

  //creiamo un oggetto di configurazione per il gioco
  //questo oggetto viene passato al costruttore di Phaser.Game
  // e contiene i parametri di configurazione del gioco
  // come il tipo di rendering, le dimensioni del canvas, le scene, ecc.
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    backgroundColor: GameData.globals.bgColor,
    parent: "my-game",
    scale: {
      mode: Phaser.Scale.FIT,
      width: GameData.globals.gameWidth,
      height: GameData.globals.gameHeight,
    },

    scene: [
      Boot,
      Audio,
      Hud,
      Preloader,
      PreIntro,
      Menu,
      Intro,
      Prelevel,
      GameOver,
      Win

    ],
    physics: {
      default: "arcade",
      arcade: {
        debug: GameData.globals.debug,

      }
    },
    //aggiungiamo il plugin rexUI alla lista dei plugin
    plugins: {
      scene: [{
        key: 'rexUI',
        plugin: UIPlugin,
        mapping: 'rexUI'
      }]
    },

    input: {
      activePointers: 2,
      keyboard: true,
    },
    render: {
      pixelArt: true,
      antialias: false,
    },
  };

  //inizializziamo il gioco passando la configurazione
  const game = new Phaser.Game(config);



});
