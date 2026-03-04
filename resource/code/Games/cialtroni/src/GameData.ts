import { gameType, HudType, staticObjects } from "./Enums";

export const GameData: gameData = {
  globals: {
    gameWidth: 1280,
    gameHeight: 720,
    bgColor: "#ffffff",
    debug: false,
    leaderboard: false,
  },

  preloader: {
    bgColor: "000000",
    image: "logo",
    imageX: 1280 / 2,
    imageY: 720 / 2,
    loadingText: "Caricamento...",
    loadingTextFont: "roboto",
    loadingTextComplete: "Tappa/clicca per iniziare!!",
    loadingTextY: 695,
    loadingBarColor: 0x2e8ac1,
    loadingBarY: 660,
  },


  levels: [




    /* {
         title: "Level 1",
         gameType: gameType.breakout,
          hudType: HudType.breakout,
         breakout: {
           offset: { x: 32 * 4, y: 64 * 2 },
           bricks: [
             10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
             0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
             20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
             0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
             70, 70, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
           ]
         }
       },

       */


    {
      title: "Molo Beverello",
      gameType: gameType.beat,
      hudType: HudType.beat,
      time: 60,
      music: { key: "loop", volume: 0.4, loop: true },
      beat: {
        dialogMusic: { key: "dialog", volume: 0.3, loop: true },
        ground: "base",
        parallax: [
          { key: "vesuvio", scrollFactor: 0.1, y: 484, x: 0, w: 1280, h: 163 },
          { key: "sea", scrollFactor: 0.5, y: 600, x: 0, w: 1280, h: 119 },
          { key: "boat", scrollFactor: 0.95, y: 602, x: 0, w: 1280, h: 386 }

        ],
        enemyFrameLose: 7,
        enemyName: "U Cafò!",
        enemies: [
         { type: 0, x: 700, main: true, speed: 20 }
        ],
        cars: [
          { x: 1050 }
        ],
        map: { pin: { x: 730, y: 330 } },
        statics: [

          { type: staticObjects.bonusHolder, x: 1300, y: 610, maxHits: 3, texture: "static", frame: 0 },
          { type: staticObjects.bonusHolder, x: 800, y: 610, maxHits: 3, texture: "static", frame: 0 },
          { type: staticObjects.bonusHolder, x: 1500, y: 610, maxHits: 3, texture: "static", frame: 0 },
          { type: staticObjects.bonusHolder, x: 1700, y: 610, maxHits: 3, texture: "static", frame: 0 },
          { type: staticObjects.bonusHolder, x: 2000, y: 610, maxHits: 3, texture: "static", frame: 0 },

          { type: staticObjects.bonusDischarger, x: 100, y: 600, maxHits: -1, texture: "static", frame: 5 },
          { type: staticObjects.bonusDischarger, x: 1280 * 2 - 100, y: 600, maxHits: -1, texture: "static", frame: 5 },
        ]
      }

    },



    {
      title: "Mappatella Beach",
      gameType: gameType.beat,
      hudType: HudType.beat,
      time: 90,
      music: { key: "loop", volume: 0.4, loop: true },
      beat: {
        dialogMusic: { key: "dialog", volume: 0.3, loop: true },
        ground: "base2",
        map: { pin: { x: 430, y: 420 } },
        parallax: [
          { key: "vesuvio", scrollFactor: 0.1, y: 484, x: 0, w: 1280, h: 163 },
          { key: "sea", scrollFactor: 0.5, y: 600, x: 0, w: 1280, h: 119 },
          { key: "ombrelloni", scrollFactor: 0.9, y: 602, x: 0, w: 1280, h: 386 }
        ],
        enemyFrameLose: 5,
        enemyName: "U Chiattò!",
        enemies: [
          { type: 1, x: 700, main: true, speed: 20 },
          { type: 0, x: 1400, main: false, speed: -5 }
        ],
        cars: [{ x: 1050 }, { x: 1500 }],
        statics: [


          { type: staticObjects.bonusDischarger, x: 100, y: 610, maxHits: -1, texture: "static", frame: 5 },
          { type: staticObjects.bonusDischarger, x: 1280 * 2 - 100, y: 610, maxHits: -1, texture: "static", frame: 5 },

          { type: staticObjects.static, x: 200, y: 640, maxHits: -1, texture: "ombrelloni-foreground", frame: 0 },
          { type: staticObjects.static, x: 850, y: 640, maxHits: -1, texture: "ombrelloni-foreground", frame: 1 },
          { type: staticObjects.static, x: 1300, y: 640, maxHits: -1, texture: "ombrelloni-foreground", frame: 2 },
          { type: staticObjects.static, x: 1700, y: 640, maxHits: -1, texture: "ombrelloni-foreground", frame: 0 },
          { type: staticObjects.static, x: 2150, y: 640, maxHits: -1, texture: "ombrelloni-foreground", frame: 1 },

          { type: staticObjects.bonusHolder, x: 600, y: 610, maxHits: 4, texture: "static", frame: 0 },
          { type: staticObjects.bonusHolder, x: 1300, y: 610, maxHits: 4, texture: "static", frame: 10 },
          { type: staticObjects.bonusHolder, x: 850, y: 610, maxHits: 4, texture: "static", frame: 10 },
          { type: staticObjects.bonusHolder, x: 1800, y: 610, maxHits: 4, texture: "static", frame: 10 },
          { type: staticObjects.bonusHolder, x: 2000, y: 610, maxHits: 4, texture: "static", frame: 0 },

        ]
      }

    },



    {
      title: "Quartieri Spagnoli",
      gameType: gameType.beat,
      hudType: HudType.beat,
      time: 120,
      music: { key: "loop", volume: 0.4, loop: true },
      beat: {
        dialogMusic: { key: "dialog", volume: 0.3, loop: true },
        map: { pin: { x: 580, y: 300 } },
        ground: "base3",
        parallax: [


        ],
        enemyFrameLose: 3,
        enemyName: "U Prufssò!",
        enemies: [
             { type: 2, x: 700, main: true, speed: 20 },
             { type: 1, x: 1200, main: false, speed: 0 },
             { type: 0, x: 1400, main: false, speed: -5 }
              
        ],
        cars: [{ x: 800 },{ x: 1300 }, { x: 1800 }
        ],
        statics: [
          { type: staticObjects.bonusHolder, x: 300, y: 610, maxHits: 7, texture: "static", frame: 0 },
          { type: staticObjects.bonusHolder, x: 500, y: 610, maxHits: 7, texture: "static", frame: 15 },
          { type: staticObjects.bonusHolder, x: 600, y: 610, maxHits: 7, texture: "static", frame: 15 },
          { type: staticObjects.bonusHolder, x: 1070, y: 610, maxHits: 7, texture: "static", frame: 15 },
          { type: staticObjects.bonusHolder, x: 1570, y: 610, maxHits: 7, texture: "static", frame: 0 },
          { type: staticObjects.bonusHolder, x: 2100, y: 610, maxHits: 7, texture: "static", frame: 15 },

          { type: staticObjects.bonusDischarger, x: 100, y: 600, maxHits: -1, texture: "static", frame: 5 },
          { type: staticObjects.bonusDischarger, x: 1280 * 2 - 100, y: 600, maxHits: -1, texture: "static", frame: 5 },

        ]
      }

    },
    /*
        {
          title: "Level 1",
          gameType: gameType.platform,
          shooter: {
            map: "level-0-platform",
          }
    
        },
    
        {
          title: "Level 1",
          gameType: gameType.shooter,
          shooter: {
            map: "level-0-shooter",
          }
    
        },
    
    
    
        {
          title: "Level 1",
          gameType: gameType.platform,
          shooter: {
            map: "level-0-platform",
          }
    
        },
    
        {
          title: "Level 1",
          gameType: gameType.breakout,
          breakout: {
            offset: { x: 32 * 4, y: 64 * 2 },
            bricks: [
              10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              70, 70, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
            ]
          }
        },
    
        {
          title: "Level 1",
          gameType: gameType.breakout,
          breakout: {
            offset: { x: 32 * 4, y: 64 * 2 },
            bricks: [
    
              0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0,
            ]
          }
        },
    
    
    
    
        {
          title: "Level 2",
          gameType: gameType.breakout,
          breakout: {
            offset: { x: 32 * 4, y: 64 * 2 },
            bricks: [
              10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
            ]
          }
        }*/
  ],

  tilemaps: [
    {
      key: "level-0-shooter",
      path: "assets/map/level-0-shooter.json",
    },
    {
      key: "level-0-platform",
      path: "assets/map/level-0-platform.json",
    },

  ],

  spritesheets: [

    { name: "countdown", path: "assets/images/cialtroni/countdown.png", width: 122, height: 161, frames: 22 },
    { name: "step4-slash", path: "assets/images/cialtroni/PreIntro/step4/slash.png", width: 264, height: 400, frames: 5 },
    { name: "step2-faces", path: "assets/images/cialtroni/PreIntro/step2/faces.png", width: 96, height: 209, frames: 4 },
    { name: "special", path: "assets/images/cialtroni/special.png", width: 287, height: 100, frames: 2 },
    /*  { name: "fire", path: "assets/images/cialtroni/fire.png", width: 189, height: 190, frames: 10 },*/
    { name: "static", path: "assets/images/cialtroni/static.png", width: 71, height: 91, frames: 20 },
    { name: "step5-badguy", path: "assets/images/cialtroni/PreIntro/step5/bad-guy.png", width: 292, height: 319, frames: 2 },
    { name: "step5-goodguy", path: "assets/images/cialtroni/PreIntro/step5/good-guy.png", width: 318, height: 333, frames: 4 },
    { name: "car", path: "assets/images/cialtroni/car.png", width: 189, height: 98, frames: 14 },
    { name: "effects", path: "assets/images/cialtroni/effects.png", width: 50, height: 50, frames: 70 },
    { name: "player-beat", path: "assets/images/cialtroni/player3.png", width: 192, height: 192, frames: 126 },
    { name: "portraits", path: "assets/images/cialtroni/portraits.png", width: 273, height: 249, frames: 8 },
    { name: "reader", path: "assets/images/cialtroni/intro/reader.png", width: 192, height: 192, frames: 8 },
    { name: "couple", path: "assets/images/cialtroni/intro/couple.png", width: 192, height: 192, frames: 4 },
    { name: "scooter0", path: "assets/images/cialtroni/intro/scooter.png", width: 192, height: 192, frames: 4 },
    { name: "scooter1", path: "assets/images/cialtroni/intro/scooter2.png", width: 192, height: 192, frames: 4 },
    { name: "negoziante", path: "assets/images/cialtroni/intro/negoziante.png", width: 192, height: 192, frames: 4 },
    { name: "girl", path: "assets/images/cialtroni/intro/girl.png", width: 192, height: 192, frames: 4 },
    { name: "tecnico", path: "assets/images/cialtroni/intro/tecnico.png", width: 100, height: 182, frames: 3 },
    { name: "bobcat", path: "assets/images/cialtroni/intro/bobcat.png", width: 247, height: 201, frames: 1 },
    { name: "button-start", path: "assets/images/cialtroni/intro/button-start.png", width: 190, height: 72, frames: 2 },
    { name: "superPower1", path: "assets/images/cialtroni/fire.png", width: 34, height: 59, frames: 3 },
    { name: "ombrelloni-foreground", path: "assets/images/cialtroni/levels/ombrelloni-foreground.png", width: 210, height: 210, frames: 3 },
    { name: "switch", path: "assets/images/cialtroni/switch.png", width: 90, height: 30, frames: 2 },
    { name: "menu-btn", path: "assets/images/cialtroni/menu.png", width: 30, height: 30, frames: 2 },
    { name: "soccer", path: "assets/images/cialtroni/intro/soccer.png", width: 256, height: 169, frames: 5 },
    {
      name: "birds",
      path: "assets/images/cialtroni/intro/birds.png",
      width: 44,
      height: 38,
      frames: 29,
    },
    {
      name: "flags",
      path: "assets/images/cialtroni/flags.png",
      width: 80,
      height: 57,
      frames: 4,
    },
    { name: "bricks", path: "assets/images/bricks.png", width: 64, height: 32, frames: 50 },
    { name: "bonus", path: "assets/images/bonus.png", width: 66, height: 36, frames: 152 },
    { name: "paddle", path: "assets/images/paddle.png", width: 87, height: 22, frames: 23 },
    { name: "paddle-explosion", path: "assets/images/paddle-explosion.png", width: 123, height: 50, frames: 5 },
    { name: "stars", path: "assets/images/stars.png", width: 2, height: 2, frames: 3 },
    { name: "balls", path: "assets/images/balls.png", width: 22, height: 22, frames: 2 },
    { name: "enemies", path: "assets/images/enemies.png", width: 44, height: 44, frames: 150 },
    { name: "explosion", path: "assets/images/explosion.png", width: 64, height: 64, frames: 25 },
    { name: "notes", path: "assets/images/notes.png", width: 10, height: 13, frames: 4 },
    {
      name: "robo-player",
      path: "assets/images/robo-player.png",
      width: 30,
      height: 50,
      frames: 8
    },
    {
      name: "robo-enemy",
      path: "assets/images/robo-enemy.png",
      width: 30,
      height: 50,
      frames: 8
    },

    {
      name: "tilemap-extruded",
      path: "assets/map/tilemap-extruded.png",
      width: 32,
      height: 32,
      spacing: 2,
      margin: 1,
    },

    {
      name: "traffic-light", path: "assets/images/cialtroni/traffic-light.png", width: 94,
      height: 142,
      frames: 4
    },
  ],
  images: [
    { name: "howtoplay-it", path: "assets/images/cialtroni/howtoplay-it.png" },
     { name: "howtoplay-en", path: "assets/images/cialtroni/howtoplay-en.png" },
      { name: "howtoplay-n", path: "assets/images/cialtroni/howtoplay-n.png" },
    { name: "traffic-light-top", path: "assets/images/cialtroni/traffic-light-top.png" },
    { name: "step1-grass", path: "assets/images/cialtroni/PreIntro/step1/grass.png" },
    { name: "step1-bg", path: "assets/images/cialtroni/PreIntro/step1/bg.png" },
    { name: "step1-clouds", path: "assets/images/cialtroni/PreIntro/step1/clouds.png" },
    { name: "step1-badguy", path: "assets/images/cialtroni/PreIntro/step1/bad-guy.png" },
    { name: "step1-goodguy", path: "assets/images/cialtroni/PreIntro/step1/good-guy.png" },
    { name: "step2-bg", path: "assets/images/cialtroni/PreIntro/step2/bg.png" },
    { name: "step3-mask", path: "assets/images/cialtroni/PreIntro/step3/mask.png" },
    { name: "step3-lines", path: "assets/images/cialtroni/PreIntro/step3/lines.png" },
    { name: "step4-bg", path: "assets/images/cialtroni/PreIntro/step4/bg.png" },
    { name: "step4-badguy", path: "assets/images/cialtroni/PreIntro/step4/bad-guy.png" },
    { name: "step4-goodguy", path: "assets/images/cialtroni/PreIntro/step4/good-guy.png" },
    { name: "step5-bg", path: "assets/images/cialtroni/PreIntro/step5/bg.png" },
    { name: "pizza", path: "assets/images/cialtroni/pizza2.png" },
    { name: "sfogliatella", path: "assets/images/cialtroni/sfogliata.png" },
    { name: "audio", path: "assets/images/cialtroni/audio.png" },
    { name: "sfx", path: "assets/images/cialtroni/sfx.png" },
    { name: "healthbarfront", path: "assets/images/cialtroni/healthbarfront.png" },
    { name: "healthbarback", path: "assets/images/cialtroni/healthbarback.png" },
    { name: "shot", path: "assets/images/cialtroni/shot.png" },
    { name: "portraitBg", path: "assets/images/cialtroni/portraitBg.png" },
    { name: "back", path: "assets/images/cialtroni/back.png" },
    { name: "slice", path: "assets/images/cialtroni/slice.png" },
    { name: "beer", path: "assets/images/cialtroni/beer.png" },
    { name: "clouds", path: "assets/images/cialtroni/intro/clouds.png" },
    { name: "dialog", path: "assets/images/cialtroni/dialog.png" },
    { name: "modal-options", path: "assets/images/cialtroni/modal-options.png" },
    { name: "base", path: "assets/images/cialtroni/levels/base.png" },
    { name: "sea", path: "assets/images/cialtroni/levels/sea.png" },
    { name: "sky", path: "assets/images/cialtroni/levels/sky.png" },
    { name: "boat", path: "assets/images/cialtroni/levels/boat.png" },
    { name: "base2", path: "assets/images/cialtroni/levels/base2.png" },
    { name: "ombrelloni", path: "assets/images/cialtroni/levels/ombrelloni.png" },
    { name: "base3", path: "assets/images/cialtroni/levels/base3.png" },
    { name: "win", path: "assets/images/cialtroni/win.png" },
    { name: "win-emilio", path: "assets/images/cialtroni/win-emilio.png" },
    { name: "bg", path: "assets/images/cialtroni/intro/bg.png" },
    { name: "baloon", path: "assets/images/cialtroni/intro/baloon.png" },
    { name: "bg-tree", path: "assets/images/cialtroni/intro/tree.png" },
    { name: "bg-car", path: "assets/images/cialtroni/intro/car.png" },
    { name: "bg-logo", path: "assets/images/cialtroni/intro/logo.png" },
    { name: "bg-light", path: "assets/images/cialtroni/intro/light.png" },
    { name: "arkanoid-logo", path: "assets/images/arkanoid-logo.png" },
    { name: "borders", path: "assets/images/borders.png" },
    { name: "bg-tile", path: "assets/images/bg-tile.jpg" },
    { name: "bg-tile-2", path: "assets/images/bg-tile.png" },
    { name: "bg-0", path: "assets/images/bg-0.jpg" },
    { name: "bg-1", path: "assets/images/bg-1.jpg" },
    { name: "bg-2", path: "assets/images/bg-2.jpg" },
    { name: "platform-bg-2", path: "assets/images/bg-tile-platform.png" },
    { name: "platform-bg-3", path: "assets/images/bg-tile-platform-2.png" },
    { name: "patter", path: "assets/images/pattern.jpg" },
    { name: "patter-front", path: "assets/images/pattern-front.png" },
    { name: "patter-back", path: "assets/images/pattern-back.png" },
    { name: "audiobtn", path: "assets/images/audiobtn.png" },
    { name: "vesuvio", path: "assets/images/cialtroni/levels/vesuvio.png" },
    { name: "map", path: "assets/images/cialtroni/prelevel/map.jpg" },
    { name: "pin", path: "assets/images/cialtroni/prelevel/pin.png" },
    { name: "vs", path: "assets/images/cialtroni/prelevel/vs.png" },
    { name: "phaser", path: "assets/images/logo-phaser.png" },
    { name: "rub", path: "assets/images/rub.png" },
    { name: "end", path: "assets/images/end.png" },
    { name: "block", path: "assets/images/block.png" },
    { name: "rub2", path: "assets/images/cialtroni/rub.png" },
    { name: "end2", path: "assets/images/cialtroni/end.png" },


  ],
  atlas: [{
    key: "explosionParticles",
    imagepath: "assets/images/explosionParticles.png",
    jsonpath: "assets/images/explosionParticles.json",
  }
  ],
  sounds: [
    {
      name: "intro",
      paths: ["assets/sounds/intro.ogg", "assets/sounds/intro.m4a"],
    },
    {
      name: "breeze",
      paths: ["assets/sounds/breeze.ogg", "assets/sounds/breeze.m4a"],
    },
    {
      name: "loop",
      paths: ["assets/sounds/loop.ogg", "assets/sounds/loop.m4a"],
    },
    {
      name: "dialog",
      paths: ["assets/sounds/dialog.ogg", "assets/sounds/dialog.m4a"],
    },
    {
      name: "win",
      paths: ["assets/sounds/win.ogg", "assets/sounds/win.m4a"],
    }
  ],

  videos: [],
  audios: [
    {
      name: "sfx",
      jsonpath: "assets/sounds/sfx.json",
      paths: ["assets/sounds/sfx.ogg", "assets/sounds/sfx.m4a"],
      instance: { instance: 10 }
    },
    {
      name: "sfx-intro",
      jsonpath: "assets/sounds/sfx-intro.json",
      paths: ["assets/sounds/sfx-intro.ogg", "assets/sounds/sfx-intro.m4a"],
      instance: { instance: 10 }
    }
  ],

  scripts: [],
  fonts: [
    { key: "pixelifyBold", path: "assets/fonts/PixelifySans-Bold.ttf", type: "truetype" },
    { key: "pixelifyMedium", path: "assets/fonts/PixelifySans-Medium.ttf", type: "truetype" },
    { key: "pixelifyRegular", path: "assets/fonts/PixelifySans-Regular.ttf", type: "truetype" },
    { key: "pixelifySemiBold", path: "assets/fonts/PixelifySans-SemiBold.ttf", type: "truetype" },
    { key: "PressStart2P", path: "assets/fonts/PressStart2P-Regular.ttf", type: "truetype" },
    { key: "gagalin", path: "assets/fonts/Gagalin-Regular.otf", type: "opentype" }
  ],
  webfonts: [{ key: 'Roboto' }],
  bitmapfonts: [{ name: 'arcade', imgpath: 'assets/fonts/arcade.png', xmlpath: 'assets/fonts/arcade.xml' }],
};
