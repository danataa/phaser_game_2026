// Configurazione globale: impostazioni di gioco e lista degli asset da caricare
export let GameData: gameData = {
  globals: {
    gameWidth: 1920,
    gameHeight: 1080,
    bgColor: "#000000",
    debug: true
  },

  preloader: {
    bgColor: "ffffff",
    image: "silent_production_logo",
    imageX: 1920 / 2,
    imageY: 1080 / 2,
    loadingText: "Caricamento...",
    loadingTextFont: "roboto",
    loadingTextComplete: "Tappa/clicca per iniziare!!",
    loadingTextY: 700,
    loadingBarColor: 0xff0000,
    loadingBarY: 630,
  },

  spritesheets: [
    { name: "player_idle", path: "assets/spritesheets/knight/Idle.png", width: 128, height: 128, frames: 4 },
    { name: "player_walk", path: "assets/spritesheets/knight/Walk.png", width: 128, height: 128, frames: 8 },
    { name: "player_attack", path: "assets/spritesheets/knight/Attack 1.png", width: 128, height: 128, frames: 5 },

    { name: "zombie_idle", path: "assets/spritesheets/zombie/Idle.png", width: 128, height: 128, frames: 6 },
    { name: "zombie_walk", path: "assets/spritesheets/zombie/Walk.png", width: 128, height: 128, frames: 10 },
    { name: "zombie_attack", path: "assets/spritesheets/zombie/Attack.png", width: 128, height: 128, frames: 4 },
    { name: "zombie_hurt", path: "assets/spritesheets/zombie/Hurt.png", width: 128, height: 128, frames: 4 },
    { name: "zombie_dead", path: "assets/spritesheets/zombie/Dead.png", width: 128, height: 128, frames: 5 },

  ],

  tilemaps: [
    {key: "tilemap", path: "assets/tilemaps/catacombe.json"},
  ],

  images: [
    { name: "silent_production_logo", path: "assets/images/logos/logo_silent_production_scontornato.png" },
    { name: "tileset_0", path: "assets/tilemaps/mainlevbuild.png" },
    { name: "tileset_1", path: "assets/tilemaps/decorative.png" },
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

  scripts: [
    // { name: "script", path: "assets/scripts/script.js" },
  ],

  fonts: [
    // {
    //   key:"ralewayRegular", 
    //   path:"assets/fonts/raleway.regular.ttf",
    //   type:"truetype"
    // }
  ],

  webfonts: [
    { key: 'Nosifer' }, 
    { key: 'Roboto' }, 
    { key: 'Press+Start+2P' }, 
    { key: 'Rubik+Doodle+Shadow' }, 
    { key: 'Rubik+Glitch' }],

  bitmapfonts: [],
};
