export let GameData: gameData = {
  globals: {
    gameWidth: 1280,
    gameHeight: 800,
    bgColor: "#000000",
    debug: false
  },

  preloader: {
    bgColor: "000000",
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

  spritesheets: [
    { name: "player", path: "assets/images/player.png", width: 50, height: 70, frames: 32 },
    { name: "tilemap", path: "assets/map/tilemap-extruded.png", width: 16, height: 16 }
  ],
  images: [
    { name: "phaser", path: "assets/images/logo-phaser.png" },
    { name: "freedoom", path: "assets/images/freedoom.png" },
    { name: "thelucasart", path: "assets/images/thelucasart.png" },
    { name: "intro-bg", path: "assets/images/intro-bg.jpg" },
    { name: "panel-border", path: "assets/Ui/panel-border-000.png" },
    { name: "panel", path: "assets/Ui/panel-000.png" },
    { name: "divider", path: "assets/Ui/divider-000.png" }
  ],
  tilemaps: [
    { key: "level0", path: "assets/map/level-0.json" }
  ],
  atlas: [],
  sounds: [
    /*{
    name: "music",
    paths: ["assets/sounds/intro.ogg", "assets/sounds/intro.m4a"],
    volume: 1,
    loop: true,
    frame: 1,
  }*/
  ],

  videos: [

    // { name: "video", path: "/assets/video/video.mp4" },

  ],
  audios: [

    /*{
    name: "sfx",
    jsonpath: "assets/sounds/sfx.json",
    paths: ["assets/sounds/sfx.ogg", "assets/sounds/sfx.m4a"],
    instances: 10,
  }*/
  ],

  scripts: [],
  fonts: [{key:"ralewayRegular", path:"assets/fonts/raleway.regular.ttf",type:"truetype"}],
  webfonts: [{ key: 'Nosifer' }, { key: 'Roboto' }, { key: 'Press+Start+2P' }, { key: 'Rubik+Doodle+Shadow' }, { key: 'Rubik+Glitch' }],
  bitmapfonts: [],
};
