export let GameData: gameData = {
  globals: {
    gameWidth: 224,
    gameHeight: 256,
    bgColor: "#000000",
    debug: true
  },

  preloader: {
    bgColor: "000000",
    image: "logo",
    imageX: 224 / 2,
    imageY: 256 / 2,
    loadingText: "Caricamento...",
    loadingTextFont: "roboto",
    loadingTextComplete: "Tappa/clicca per iniziare!!",
    loadingTextY: 256,
    loadingBarColor: 0xff0000,
    loadingBarY: 220,
  },

  spritesheets: [

    { name: "liftUp", path: "assets/images/liftUp.png", width: 16, height: 16, frames: 8 },
    { name: "kong-idle", path: "assets/images/kong-idle.png", width: 46, height: 32, frames: 3 },
    { name: "lady", path: "assets/images/lady.png", width: 16, height: 22, frames: 3 },

  ],
  images: [

    { name: "phaser", path: "assets/images/logo-phaser.png" },
    { name: "tileset", path: "assets/images/tileset1.png" },
    { name: "rivet", path: "assets/images/rivet.png" },

     { name: "namcoFont", path: "assets/images/fontset.png" },
      { name: "HUD", path: "assets/images/HUD.png" },
       { name: "100", path: "assets/images/100.png" },




  ],
  tilemaps: [
    { key: "map", path: "assets/images/DonkeyKong.json"},
   
  ],

  atlas: [
    { key: "mario", imagepath: "assets/images/mario_sprite.png", jsonpath: "assets/images/mario_sprite.json" },
  ],
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
