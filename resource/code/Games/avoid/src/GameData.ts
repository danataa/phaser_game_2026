

export let GameData: gameData = {
  globals: {
    gameWidth: 800,
    gameHeight: 600,
    bgColor: "#ffffff",
    debug: false
  },

  preloader: {
    bgColor: "ffffff",
    image: "logo-phaser",
    imageX: 800 / 2,
    imageY: 600 / 2,
    loadingText: "Caricamento...",
    loadingTextFont: "roboto",
    loadingTextComplete: "Tappa/clicca per iniziare!!",
    loadingTextY: 500,
    loadingBarColor: 0xff0000,
    loadingBarY: 530,
  },

  spritesheets: [

   // { name: "player", path: "assets/images/player.png", width: 82, height: 70, frames: 50 },

  ],
  images: [

    { name: "background", path: "assets/images/background.png" },
   
  ],

  glsl:[{key:"goo",path:"assets/shaders/goo.glsl.js"}],

  json:[
    {key:"fontData",path:"assets/fonts/font.json"}
  ],

  animations: [/*{
    key: "",
    path: "",
  }*/],

  atlas: [{
    key: "assets",
    jsonpath: "assets/images/germs.json",
    imagepath: "assets/images/germs.png",
  }],

  sounds: [
    {
    name: "appear",
    paths: ["assets/sounds/appear.mp3","assets/sounds/appear.ogg","assets/sounds/appear.m4a"],
 
  },
  {
    name: "fail",
    paths: ["assets/sounds/fail.mp3","assets/sounds/fail.ogg","assets/sounds/fail.m4a"],
 
  },
  {
    name: "laugh",
    paths: ["assets/sounds/laugh.mp3","assets/sounds/laugh.ogg","assets/sounds/laugh.m4a"],
 
  },
  {
    name: "music",
    paths: ["assets/sounds/music.mp3","assets/sounds/music.ogg","assets/sounds/music.m4a"],
 
  },
  {
    name: "pickup",
    paths: ["assets/sounds/pickup.mp3","assets/sounds/pickup.ogg","assets/sounds/pickup.m4a"],
 
  }, {
    name: "start",
    paths: ["assets/sounds/start.mp3","assets/sounds/start.ogg","assets/sounds/start.m4a"],
 
  }, {
    name: "victory",
    paths: ["assets/sounds/victory.mp3","assets/sounds/victory.ogg","assets/sounds/victory.m4a"],
 
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
  bitmapfonts: [{name:"slime",imgpath:"assets/fonts/slime-font.png",xmlpath:"assets/fonts/slime-font.xml" }],
};
