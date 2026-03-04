export let GameData: gameData = {
  globals: {
    gameWidth: 1024,
    gameHeight: 768,
    bgColor: "#ffffff",
    debug: false
  },

  preloader: {
    bgColor: "ffffff",
    image: "loading",
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

    { name: "start", path: "assets/images/start.png" },
    { name: "title", path: "assets/images/title.png" },
    { name: "logo", path: "assets/images/logo.png" },
    { name: "background", path: "assets/images/background.png" },
    { name: "bulletHole", path: "assets/images/bullet-hole.png" },




  ],
  atlas: [
    {
      key: "bank-panic",
      jsonpath: "assets/images/bank-panic.json",
      imagepath: "assets/images/bank-panic.png",
    }
  ],
  sounds: [
    {
    name: "shot",
    paths: ["assets/sounds/shot.ogg", "assets/sounds/shot.m4a", "assets/sounds/shot.mp3"],
   
},
{
    name: "banditShot",
    paths: ["assets/sounds/50cal.ogg", "assets/sounds/50cal.m4a", "assets/sounds/50cal.mp3"],
},
{
    name: "money",
    paths: ["assets/sounds/money.ogg", "assets/sounds/money.m4a", "assets/sounds/money.mp3"],
},
{
    name: "levelComplete",
    paths: ["assets/sounds/complete.ogg", "assets/sounds/complete.m4a", "assets/sounds/complete.mp3"], 
},
{
    name: "gameOver",
    paths: ["assets/sounds/gameover.ogg", "assets/sounds/gameover.m4a", "assets/sounds/gameover.mp3"],
},
{
    name: "music",
    paths: ["assets/sounds/music.ogg", "assets/sounds/music.m4a", "assets/sounds/music.mp3"],
},
{
    name: "door",
    paths: ["assets/sounds/door.ogg", "assets/sounds/door.m4a", "assets/sounds/door.mp3"]
  },
  {
    name: "scream1",
    paths: ["assets/sounds/scream1.ogg", "assets/sounds/scream1.m4a", "assets/sounds/scream1.mp3"]
  },
  {
    name: "scream2",
    paths: ["assets/sounds/scream2.ogg", "assets/sounds/scream2.m4a", "assets/sounds/scream2.mp3"]
  },
  {
    name: "scream3",
    paths: ["assets/sounds/scream3.ogg", "assets/sounds/scream3.m4a", "assets/sounds/scream3.mp3"]
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
  bitmapfonts: [],
};
