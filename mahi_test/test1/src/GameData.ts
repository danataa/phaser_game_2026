export let GameData: gameData = {
  globals: {
    gameWidth: 1280,
    gameHeight: 800,
    bgColor: "#ffffff",
    debug: true
  },

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

  spritesheets: [

    { name: "player", path: "assets/images/player.png", width: 82, height: 70, frames: 50 },
    //nemico
    { name: "mago", path: "assets/images/Pawn_Idle.png", width: 192, height: 192, frames: 8 },
    { name: "tileset_0", path: "assets/map/mainlevbuild.png", width: 320, height: 192, frames: 0 },
    { name: "demon_run", path: "assets/images/demon_run.png", width: 128, height: 128, frames: 8 },
    { name: "scheletro_run", path: "assets/images/Scheletro/Run.png", width: 128, height: 128, frames: 8 },

    
    //{ name: "tileset_0", path: "assets/map/tileset_inferno.png", width: 320, height: 192, frames: 0 },
    
  ],

  tilemaps: [
    //{key: "tilemap_0", path: "assets/map/test_0.json"}

    {key: "tilemap_0", path: "assets/map/catacombe.json"}
  ],

  images: [

    { name: "phaser", path: "assets/images/logo-phaser.png" },
    { name: "freedoom", path: "assets/images/freedoom.png" },
    { name: "thelucasart", path: "assets/images/thelucasart.png" },
    { name: "intro-bg", path: "assets/images/intro-bg.jpg" },



  ],
  atlas: [],
  sounds: [
    {
      name: "music",
      paths: ["assets/sounds/music.m4a"],
      volume: 0.5,
      loop: true,
    }
  ] as any,

  videos: [

    // { name: "video", path: "/assets/video/video.mp4" },

  ],
  audios: [

   /* {
    name: "sfx",
    jsonpath: "assets/sounds/sfx.json",
    paths: ["assets/sounds/sfx.ogg", "assets/sounds/sfx.m4a"],
    instances: 10,
  } */
  ],

  scripts: [],
  fonts: [{key:"ralewayRegular", path:"assets/fonts/raleway.regular.ttf",type:"truetype"}],
  webfonts: [{ key: 'Nosifer' }, { key: 'Roboto' }, { key: 'Press+Start+2P' }, { key: 'Rubik+Doodle+Shadow' }, { key: 'Rubik+Glitch' }],
  bitmapfonts: [],
};
