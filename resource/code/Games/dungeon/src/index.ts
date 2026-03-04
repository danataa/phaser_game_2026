//importiamo la libreria phaser
import "phaser";
//importiamo le nostre scene
import Boot from "./scenes/Boot";
import Hud from "./scenes/Hud";
import Preloader from "./scenes/Preloader";
import GamePlay from "./scenes/GamePlay";
import GameOver from "./scenes/GameOver";
import Intro from "./scenes/Intro";
//importiamo GameData che contiene i valori globali del gioco
import { GameData } from "./GameData";

type GameConfigExtended = Phaser.Types.Core.GameConfig & {
  winScore: number;
};

//il listener per l'evento load della pagina
//questo evento viene lanciato quando la pagina è stata caricata
//e tutti gli elementi della pagina sono disponibili
window.addEventListener("load", () => {


  //creiamo un oggetto di configurazione per il gioco
  //questo oggetto viene passato al costruttore di Phaser.Game
  // e contiene i parametri di configurazione del gioco
  // come il tipo di rendering, le dimensioni del canvas, le scene, ecc.
  const config: GameConfigExtended = {
    type: Phaser.WEBGL,
    backgroundColor: GameData.globals.bgColor,
    parent: "game",
    scale: {
      mode: Phaser.Scale.FIT,
      width: window.innerWidth,
      height:  window.innerHeight,
    },

    scene: [
      Boot,
      Hud,
      Preloader,
      Intro,
      GamePlay,
      GameOver
    ],
    physics: {
      default: "arcade",
      arcade: {  
        debug: false,}
    },

    input: {
      activePointers: 2,
      keyboard: true,
    },
    render: {
      pixelArt: true,
      antialias: false,
    },
    callbacks: {
      postBoot: () => {
        window.sizeChanged();
      },
    },
    canvasStyle: `display: block; width: 100%; height: 100%;`,
    autoFocus: true,
    audio: {
      disableWebAudio: false,
    },
    winScore: 40,
   
  };

  //inizializziamo il gioco passando la configurazione
  window.game = new Phaser.Game(config);
});

window.sizeChanged = () => {
  if (window.game.isBooted) {
    setTimeout(() => {
      window.game.scale.resize(window.innerWidth, window.innerHeight);

      window.game.canvas.setAttribute(
        'style',
        `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`,
      );
    }, 100);
  }
};

window.onresize = () => window.sizeChanged();
