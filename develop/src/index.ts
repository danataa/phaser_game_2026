import "phaser";

import Boot from "./scenes/Boot";
import Hud from "./scenes/Hud";
import Preloader from "./scenes/Preloader";
import GamePlay from "./scenes/GamePlay";
import GameOver from "./scenes/GameOver";
import Menu from "./scenes/Menu";

import { GameData } from "./GameData";

// Entry point: al caricamento della pagina crea l'istanza di Phaser
window.addEventListener("load", () => {

  // Configurazione del gioco Phaser
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: GameData.globals.bgColor,
    parent: "my-game",
    scale: {
      mode: Phaser.Scale.FIT,
      width: GameData.globals.gameWidth,
      height: GameData.globals.gameHeight,
    },

    scene: [
      Boot,
      Hud,
      Preloader,
      Menu,
      GamePlay,
      GameOver
    ],

    physics: {
      default: "arcade",
      arcade: { debug: GameData.globals.debug, }
    },

    input: {
      activePointers: 2,
      keyboard: true,
    },

    render: {
      pixelArt: false,
      antialias: true,
    },
  };

  const game = new Phaser.Game(config);

});
