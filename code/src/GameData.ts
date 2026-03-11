export let GameData: gameData = {
  globals: {
    gameWidth: 1280,
    gameHeight: 800,
    bgColor: "#000000",
    debug: true
  },

  preloader: {
    bgColor: "#ffffff",
    image: "freedoom",
    imageX: 1280 / 2,
    imageY: 800 / 2,
    loadingText: "Loading...",
    loadingTextFont: "20px Arial",
    loadingTextComplete: "Loading complete",
    loadingTextY: 620,
    loadingBarColor: 0xffffff,
    loadingBarY: 650,
  },

  spritesheets: [

    { name: "player_attack_1", path: "assets/spritesheets/knight/Knight_3/Attack 1.png", width: 128, height: 128, frames: 5 },
    { name: "player_attack_2", path: "assets/spritesheets/knight/Knight_3/Attack 2.png", width: 128, height: 128, frames: 4 },
    { name: "player_attack_3", path: "assets/spritesheets/knight/Knight_3/Attack 3.png", width: 128, height: 128, frames: 4 },
    { name: "player_dead", path: "assets/spritesheets/knight/Knight_3/Dead.png", width: 128, height: 128, frames: 6 },
    { name: "player_idle", path: "assets/spritesheets/knight/Knight_3/Idle.png", width: 128, height: 128, frames: 4 },
    { name: "player_hurt", path: "assets/spritesheets/knight/Knight_3/Hurt.png", width: 128, height: 128, frames: 2 },
    { name: "player_walk", path: "assets/spritesheets/knight/Knight_3/Run.png", width: 128, height: 128, frames: 7 },
    // Mago (Wizzard) animations (128x128 frames)
    { name: "mago", path: "assets/images/Wizzard/Idle.png", width: 128, height: 128, frames: 8 },
    { name: "mago_walk", path: "assets/images/Wizzard/Walk.png", width: 128, height: 128, frames: 7 },
    { name: "mago_run", path: "assets/images/Wizzard/Run.png", width: 128, height: 128, frames: 8 },
    { name: "mago_attack_1", path: "assets/images/Wizzard/Attack_1.png", width: 128, height: 128, frames: 7 },
    { name: "mago_attack_2", path: "assets/images/Wizzard/Attack_2.png", width: 128, height: 128, frames: 9 },
    // Charge_1 has smaller frames (64x128, 9 frames)
    { name: "mago_charge_1", path: "assets/images/Wizzard/Charge_1.png", width: 64, height: 128, frames: 9 },
    { name: "mago_charge_2", path: "assets/images/Wizzard/Charge_2.png", width: 128, height: 128, frames: 3 },
    { name: "mago_hurt", path: "assets/images/Wizzard/Hurt.png", width: 128, height: 128, frames: 4 },
    { name: "mago_dead", path: "assets/images/Wizzard/Dead.png", width: 128, height: 128, frames: 4 },

    // Demon animations (128x128 frames)
    { name: "demon_idle", path: "assets/images/Demon/Idle.png", width: 128, height: 128, frames: 6 },
    { name: "demon_idle_2", path: "assets/images/Demon/Idle_2.png", width: 128, height: 128, frames: 5 },
    { name: "demon_walk", path: "assets/images/Demon/Walk.png", width: 128, height: 128, frames: 8 },
    { name: "demon_run", path: "assets/images/Demon/Run.png", width: 128, height: 128, frames: 8 },
    { name: "demon_jump", path: "assets/images/Demon/Jump.png", width: 128, height: 128, frames: 15 },
    { name: "demon_attack_1", path: "assets/images/Demon/Attack_1.png", width: 128, height: 128, frames: 3 },
    { name: "demon_attack_2", path: "assets/images/Demon/Attack_2.png", width: 128, height: 128, frames: 6 },
    { name: "demon_attack_3", path: "assets/images/Demon/Attack_3.png", width: 128, height: 128, frames: 4 },
    { name: "demon_hurt", path: "assets/images/Demon/Hurt.png", width: 128, height: 128, frames: 3 },
    { name: "demon_dead", path: "assets/images/Demon/Dead.png", width: 128, height: 128, frames: 6 },
    // Scheletro animations (128x128 frames)
    { name: "scheletro_idle", path: "assets/images/Scheletro/Idle.png", width: 128, height: 128, frames: 7 },
    { name: "scheletro_walk", path: "assets/images/Scheletro/Walk.png", width: 128, height: 128, frames: 7 },
    { name: "scheletro_run", path: "assets/images/Scheletro/Run.png", width: 128, height: 128, frames: 8 },
    { name: "scheletro_run_attack", path: "assets/images/Scheletro/Run+attack.png", width: 128, height: 128, frames: 7 },
    { name: "scheletro_attack_1", path: "assets/images/Scheletro/Attack_1.png", width: 128, height: 128, frames: 5 },
    { name: "scheletro_attack_2", path: "assets/images/Scheletro/Attack_2.png", width: 128, height: 128, frames: 6 },
    { name: "scheletro_attack_3", path: "assets/images/Scheletro/Attack_3.png", width: 128, height: 128, frames: 4 },
    { name: "scheletro_hurt", path: "assets/images/Scheletro/Hurt.png", width: 128, height: 128, frames: 2 },
    { name: "scheletro_dead", path: "assets/images/Scheletro/Dead.png", width: 128, height: 128, frames: 4 },
    { name: "scheletro_protect", path: "assets/images/Scheletro/Protect.png", width: 128, height: 128, frames: 1 },

    
    //{ name: "tileset_0", path: "assets/map/tileset_inferno.png", width: 320, height: 192, frames: 0 },
    
  ],

  tilemaps: [
    {key: "tilemap_0", path: "assets/map/catacombe.json"}
  ],

  images: [

    { name: "phaser", path: "assets/images/logo-phaser.png" },
    { name: "arrow_1", path: "assets/images/arrow_1.png" },
    { name: "vignette-mask", path: "assets/images/vignette_mask.png" },
    { name: "freedoom", path: "assets/images/freedoom.png" },
    { name: "thelucasart", path: "assets/images/thelucasart.png" },
    { name: "tileset_0", path: "assets/map/mainlevbuild.png" },
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

  fonts: [
    {key:"ralewayRegular", 
    path:"assets/fonts/raleway.regular.ttf",
    type:"truetype"}],

  webfonts: [
    { key: 'Nosifer' }, 
    { key: 'Roboto' },
    { key: 'Press+Start+2P' }, 
    { key: 'Rubik+Doodle+Shadow' }, 
    { key: 'Rubik+Glitch' }],
 
  bitmapfonts: [],
};
