// GameData contiene tutti i dati globali del gioco (configurazione, asset, scene)
// È la fonte centralizzata di verità per tutto il progetto

export let GameData: gameData = {
  // Configurazione globale del gioco
  globals: {
    gameWidth: 1280,
    gameHeight: 800,
    bgColor: "#ffffff",
    debug: false,
  },

  // Configurazione della scena Preloader (schermata di caricamento)
  preloader: {
    bgColor: "ffffff",
    image: "logo",
    imageX: 1280 / 2,
    imageY: 800 / 2,
    loadingText: "Caricamento...",
    loadingTextFont: "roboto",
    loadingTextComplete: "Tappa/clicca per iniziare!!",
    loadingTextY: 700,
    loadingBarColor: 0xff0000,
    loadingBarY: 630,
  },

  // Spritesheet del player: immagine con 50 frame, ogni frame 82x70px
  spritesheets: [
    { name: "player", path: "assets/images/player.png", width: 82, height: 70, frames: 50 },
  ],

  // Immagini statiche utilizzate nelle varie scene
  images: [
    { name: "phaser", path: "assets/images/logo-phaser.png" },
    { name: "freedoom", path: "assets/images/freedoom.png" },
    { name: "thelucasart", path: "assets/images/thelucasart.png" },
    { name: "intro-bg", path: "assets/images/intro-bg.jpg" },
    { name: "bg-1", path: "assets/images/bg/1.png" },
    { name: "bg-2", path: "assets/images/bg/2.png" },
    { name: "bg-3", path: "assets/images/bg/3.png" },
    { name: "bg-4", path: "assets/images/bg/4.png" },
    { name: "bg-5", path: "assets/images/bg/5.png" },
    { name: "bg-6", path: "assets/images/bg/6.png" },
    { name: "bg-7", path: "assets/images/bg/7.png" },
    // Tileset della mappa
    { name: "tileset_word", path: "assets/tilemap/tilemap.png" },
  ],

  // Tilemap JSON esportata da Tiled
  tilemaps: [
    { key: "tilemap_0", path: "assets/tilemap/tilemap.json" },
  ],

  atlas: [],
  sounds: [],
  videos: [],
  audios: [],
  scripts: [],

  fonts: [{ key: "ralewayRegular", path: "assets/fonts/raleway.regular.ttf", type: "truetype" }],
  webfonts: [{ key: "Nosifer" }, { key: "Roboto" }, { key: "Press+Start+2P" }, { key: "Rubik+Doodle+Shadow" }, { key: "Rubik+Glitch" }],
  bitmapfonts: [],
};