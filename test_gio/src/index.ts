import "phaser";
import Boot from "./scenes/Boot";
import Hud from "./scenes/Hud";
import Preloader from "./scenes/Preloader";
import GamePlay from "./scenes/GamePlay";
import GameOver from "./scenes/GameOver";
import Intro from "./scenes/Intro";
import { GameData } from "./GameData";

// Aspettiamo che la pagina sia completamente caricata prima di inizializzare Phaser
window.addEventListener("load", () => {

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,                          // Rendering tramite WebGL
    backgroundColor: GameData.globals.bgColor,   // Colore di sfondo dal GameData
    parent: "my-game",                           // ID del div contenitore nell'HTML

    scale: {
      mode: Phaser.Scale.RESIZE,                 // Il canvas si adatta alla finestra del browser
      autoCenter: Phaser.Scale.CENTER_BOTH,      // Centra il canvas orizzontalmente e verticalmente
      width: GameData.globals.gameWidth,
      height: GameData.globals.gameHeight,
    },

    // Ordine delle scene: la prima nell'array è quella che parte automaticamente
    scene: [Boot, Hud, Preloader, Intro, GamePlay, GameOver],

    physics: {
      default: "arcade",      // Fisica ARCADE — leggera e adatta a giochi 2D top-down
      arcade: { debug: false }, // debug: true mostra i collider, false in produzione
    },

    input: {
      activePointers: 2,  // Supporta fino a 2 tocchi simultanei (mobile)
      keyboard: true,
    },

    render: {
      pixelArt: false,    // true per giochi pixel art (disabilita l'antialiasing)
      antialias: true,    // Smoothing delle immagini
    },
  };

  // Inizializziamo il gioco con la configurazione
  new Phaser.Game(config);
});