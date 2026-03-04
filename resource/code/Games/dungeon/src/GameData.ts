

export let GameData: gameData = {
  globals: {
    gameWidth: window.innerWidth,
    gameHeight: window.innerHeight,
    bgColor: "#000000",
    debug: false
  },

  preloader: {
    bgColor: "#ffffff",
    image: "logo-phaser",
    imageX: window.innerWidth / 2,
    imageY: window.innerHeight / 2,
    loadingText: "Caricamento...",
    loadingTextFont: "roboto",
    loadingTextComplete: "Tappa/clicca per iniziare!!",
    loadingTextY: window.innerHeight/2+200,
    loadingBarColor: 0xff0000,
    loadingBarY: 230,
  },

  spritesheets: [

  { name: "tiles_spr", path: "assets/images/tilemaps/tiles/dungeon-16-16.png", width: 16, height: 16,frames:1024},

  ],
  images: [

    { name: "tiles", path: "assets/images/tilemaps/tiles/dungeon-16-16.png" },
    { name: "king", path: "assets/images/sprites/king.png" },
    { name: "intro-bg", path: "assets/images/intro.jpeg" },
    { name: "intro-logo", path: "assets/images/logo.png" },
   
     ],

  json:[
    {key:"fontData",path:"assets/fonts/font.json"}
  ],

  tilemaps: [
    { key: "dungeon", path: "assets/images/tilemaps/json/dungeon.json" },
  ],

  animations: [],

  atlas: [{
    key: "a-king",
    jsonpath: "assets/images/spritesheets/a-king_atlas.json",
    imagepath: "assets/images/spritesheets/a-king.png",
  }],

  sounds: [
    {
    name: "bongo",
    paths: ["assets/sounds/bongojam_f.mp3"],
 
  },
  {
    name: "pop",
    paths: ["assets/sounds/pop.mp3"],
 
  },
  {
    name: "draw",
    paths: ["assets/sounds/draw.mp3"],
 
  }
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
