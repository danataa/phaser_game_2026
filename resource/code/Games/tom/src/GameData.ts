

export let GameData: gameData = {
  globals: {
    gameWidth: 640,
    gameHeight: 360,
    bgColor: "#ffffff",
    debug: false
  },

  preloader: {
    bgColor: "ffffff",
    image: "logo-phaser",
    imageX: 640 / 2,
    imageY: 360 / 2,
    loadingText: "Caricamento...",
    loadingTextFont: "roboto",
    loadingTextComplete: "Tappa/clicca per iniziare!!",
    loadingTextY: 300,
    loadingBarColor: 0xff0000,
    loadingBarY: 230,
  },

  spritesheets: [

   // { name: "player", path: "assets/images/player.png", width: 82, height: 70, frames: 50 },

  ],
  images: [

    { name: "background", path: "assets/images/background.png" },
    { name: "floor", path: "assets/images/floor.png" },
    { name: "wall", path: "assets/images/wall.png" },
    { name: "bomb", path: "assets/images/bomb.png" },
    { name: "tomato_item", path: "assets/images/tomato_item.png" },
    { name: "life", path: "assets/images/life.png" },
    { name: "logo", path: "assets/images/logo.png" },
    { name: "font", path: "assets/fonts/font.png" },
   
   

  ],

  json:[
    {key:"fontData",path:"assets/fonts/font.json"}
  ],

  animations: [{
    key: "tomatoAnim",
    path: "assets/images/tomato_anim.json",
  }],

  atlas: [{
    key: "tomato",
    jsonpath: "assets/images/tomato_atlas.json",
    imagepath: "assets/images/tomato.png",
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
