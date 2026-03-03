

export let GameData: gameData = {
  globals: {
    gameWidth: 1024,
    gameHeight: 768,
    bgColor: "#ffffff",
    debug: false
  },

  preloader: {
    bgColor: "ffffff",
    image: "logo-phaser",
    imageX: 1024 / 2,
    imageY: 768 / 2,
    loadingText: "Caricamento...",
    loadingTextFont: "roboto",
    loadingTextComplete: "Tappa/clicca per iniziare!!",
    loadingTextY: 700,
    loadingBarColor: 0xff0000,
    loadingBarY: 630,
  },

  spritesheets: [

   // { name: "player", path: "assets/images/player.png", width: 82, height: 70, frames: 50 },

  ],
  images: [

    { name: "background", path: "assets/images/background.png" },
    { name: "overlay", path: "assets/images/overlay.png" },
    { name: "gameover", path: "assets/images/gameover.png" },
    { name: "title", path: "assets/images/title.png" },
    { name: "phaser", path: "assets/images/phaser.png" },


   
   

  ],

  glsl:[{key:"snow",path:"assets/shaders/snow.glsl.js"}],

  json:[
  
  ],

  

  atlas: [{
    key: "sprites",
    jsonpath: "assets/images/sprites.json",
    imagepath: "assets/images/sprites.png",
  }],

  sounds: [
    {
    name: "music",
    paths: ["assets/sounds/music.ogg","assets/sounds/music.m4a","assets/sounds/music.mp3"],
 
  },
  {
    name: "throw",
    paths: ["assets/sounds/throw.ogg","assets/sounds/throw.m4a","assets/sounds/throw.mp3"],
 
  },
  {
    name: "move",
    paths: ["assets/sounds/move.ogg","assets/sounds/move.m4a","assets/sounds/move.mp3"],
 
  },
  {
    name: "hit-snowman",
    paths: ["assets/sounds/hit-snowman.ogg","assets/sounds/hit-snowman.m4a","assets/sounds/hit-snowman.mp3"],
 
  },
  ,
  {
    name: "gameover",
    paths: ["assets/sounds/gameover.ogg","assets/sounds/gameover.m4a","assets/sounds/gameover.mp3"],
 
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
