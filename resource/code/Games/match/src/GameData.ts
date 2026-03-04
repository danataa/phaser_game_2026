

export let GameData: gameData = {
  globals: {
    gameWidth: 550,
    gameHeight: 480,
    bgColor: "#ffffff",
    debug: false
  },

  preloader: {
    bgColor: "ffffff",
    image: "logo-phaser",
    imageX: 550 / 2,
    imageY: 480 / 2,
    loadingText: "Caricamento...",
    loadingTextFont: "roboto",
    loadingTextComplete: "Tappa/clicca per iniziare!!",
    loadingTextY: 400,
    loadingBarColor: 0xff0000,
    loadingBarY: 430,
  },

  spritesheets: [

   // { name: "player", path: "assets/images/player.png", width: 82, height: 70, frames: 50 },

  ],
  images: [

    { name: "background", path: "assets/images/background.png" },
    { name: "volume-icon", path: "assets/images/volume-icon.png" },
    { name: "volume-icon_off", path: "assets/images/volume-icon_off.png" },
    { name: "card-back", path: "assets/images/card-back.png" },
    { name: "card-0", path: "assets/images/card-0.png" },
    { name: "card-1", path: "assets/images/card-1.png" },
    { name: "card-2", path: "assets/images/card-2.png" },
    { name: "card-3", path: "assets/images/card-3.png" },
    { name: "card-4", path: "assets/images/card-4.png" },
    { name: "card-5", path: "assets/images/card-5.png" },
    { name: "heart", path: "assets/images/heart.png" },
   
  ],

  glsl:[
    //{key:"",path:""}
    ],

  json:[
   // {key:"",path:""}
  ],

  animations: [/*{
    key: "",
    path: "",
  }*/],

  atlas: [],

  sounds: [
    {
    name: "theme-song",
    paths: ["assets/sounds/fat-caps-audionatix.mp3"],
 
  },
  {
    name: "whoosh",
    paths: ["assets/sounds/whoosh.mp3"],
 
  },
  {
    name: "card-flip",
    paths: ["assets/sounds/card-flip.mp3"],
 
  },
  {
    name: "card-match",
    paths: ["assets/sounds/card-match.mp3"],
 
  },
  {
    name: "card-mismatch",
    paths: ["assets/sounds/card-mismatch.mp3"],
 
  },
  {
    name: "card-slide",
    paths: ["assets/sounds/card-slide.mp3"],
 
  },
  {
    name: "victory",
    paths: ["assets/sounds/victory.mp3"],
 
  },
 
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
  bitmapfonts: [{name:"slime",imgpath:"assets/fonts/slime-font.png",xmlpath:"assets/fonts/slime-font.xml" }],
};
