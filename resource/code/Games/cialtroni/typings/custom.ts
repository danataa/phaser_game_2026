interface dialog {

  cialtrone: { name: string; frame: number };
  dialog: Array<Array<dialogStep>>;

}

interface dialogStep {
  text: string;
  speaker: number;
}

interface gameData {

  globals: {
    gameWidth: number,
    gameHeight: number,
    bgColor: string,
    debug: boolean,
    leaderboard: boolean,
  },

  preloader: {
    bgColor: string,
    image: string,
    imageX: number,
    imageY: number,
    loadingText: string,
    loadingTextFont: string,
    loadingTextComplete: string,
    loadingTextY: number
    loadingBarColor: number,
    loadingBarY: number
  },

  levels: Array<levelConfig>,



  spritesheets?: Array<SpritesheetsAsset>,
  images?: Array<ImageAsset>,
  atlas?: Array<AtlasAsset>,
  sounds?: Array<SoundAsset>,
  videos?: Array<VideoAsset>,
  audios?: Array<AudioSpriteAsset>,
  bitmapfonts?: Array<BitmapfontAsset>,
  scripts?: Array<ScriptAsset>,
  tilemaps?: Array<TileMapsAsset>,
  fonts?: Array<FontAsset>,
  webfonts?: Array<FontAsset>,

}

interface levelConfig {
  title: string;
  gameType: string;
  hudType: string;
  time?: number;

  music?: { key: string, volume?: number, loop?: boolean };

  breakout?: {
    bricks?: Array<number>;
    offset?: { x: number; y: number };
  };

  shooter?: {
    map?: string;
  };

  beat?: {
    dialogMusic?: { key: string, volume?: number, loop?: boolean };
    enemyFrameLose?: number;
    enemyName: string;
    enemies: Array<{ type: number; x: number; main: boolean; speed: number; }>;
    statics?: Array<{ type: number; x: number; y?: number; maxHits?: number, texture?: string, frame?: number, bonusHolded?: any }>;
    cars: Array<{ x: number }>;
    ground?: string;
    map: { pin: { x: number, y: number } };
    parallax?: Array<{ key: string; scrollFactor: number; y: number; x: number, w: number, h: number }>;
  };

}

interface genericConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  key: string;
  frame?: string | number;
}



interface bonusConfig extends genericConfig {
  type: string;
  bonusData?: bonusData;

}

interface bonusData {
  score?: number;
  type?: string;
  hitDirection?: string;
  energyBar?: any;
  maxHits?: number;
  texture?: string;
  frame?: number;
  holdedType?: any;
}

interface playerConfig extends genericConfig {

  frame?: string | number;
  playerType?: number;
}


interface fireObjects {

  frontal: { active: boolean };
  side: { active: boolean };
  rear: { active: boolean };
  missile: { active: boolean };
  laser: { active: boolean };

}

interface enemyConfig extends genericConfig {
  enemyData: enemyData;
}

interface enemyData {
  health?: number;
  speed?: number;
  frame?: string | number;
  actions?: enemyActions;
  type?: string | number;
  texture?: string;
  sprite?: string;
  hasBonus?: boolean;
  hit?: number;
  main?: boolean;
  energyBar?: any;
  maxHits?: number;
}
interface enemyActions {
  movement: enemyMovement;
}

interface cialtroneSetup {

  key: string;
  name: string; texture: string;
  turnBackDistance: number;
  walkSpeed: number;
  runSpeed: number;
  energyBar: { offset: { x: number; y: number } };
  hitBack: number;
  body: { left: { w: number; h: number; ox: number; oy: number }; right: { w: number; h: number; ox: number; oy: number } };
  beat: { range: number; beats: Array<{ index: number; lx: number; ly: number; rx: number; ry: number; damage: number }> };
  superPower: { range: number; beforeStart: number; pause: number; };
  charge: { range: number; damage: number; speed: number, pause: number, duration: number, offset: { left: { x: number; y: number }; right: { x: number; y: number } } };
  animations: Array<{ key: string; frames: Array<number>; frameRate: number; yoyo: boolean; repeat: number }>;

}

interface enemyMovement {
  type: string;
  data?: any;

}

interface bulletConfig extends genericConfig {
  damage: number;
  health?: number;
  direction?: number;
  speed?: number;
  name?: string;
  frame?: number;
  scale?: { x: number, y: number };
  hidden?: boolean;
  body?: { shape: string, w?: number, h?: number, ox?: number, oy?: number, radius?: number };
  bulletData?: any;
}

interface dialogConfig {
  scene: Phaser.Scene;
}

interface optionsConfig {
  scene: Phaser.Scene;
  rexUI?: any;
}

interface portraitConfig {
  scene: Phaser.Scene;
  x?: number;
  y?: number;
  portrait: { x: number, y: number, key: string };
  portraitModal: { x: number, y: number, key: string, flipX?: boolean, flipY?: boolean };
  portraitName: { x: number, y: number };
  energyBar?: { text: { x: number, y: number, originX?: number }, x: number, y: number, width: number, height: number, value: number };
  rageBar?: { text: { x: number, y: number, originX?: number }, x: number, y: number, width: number, height: number, value: number, rageDuration?: number };

}

interface dictionary {
  skip: string
  loading: string;
  loadingComplete: string;
  energy: string;
  rage: string;
  options: string;
  skipDialog: string;
  selectLanguage: string;
  english: string;
  italian: string;
  napolitan: string;
  restart: string;
  youWin: string;
  youLose: string;
  gameOver: string;
  timeOver: string;
  insults: Array<string>;
  story: string;
  play: string;
  credits: string;
  creditsText: string;
  levelCompleted: string;
  back: string;
  next: string;
  howToPlay: string;
  highscores: string;
  nextLevel: string;
  winLevelTexts: Array<string>;
  score: string;
  name: string;
  enterName: string;
  fight: string;
  prelevelText: Array<string>;
  chapter: string;
  continue: string;
  timeOverTexts: Array<string>;
  win: string;
  screenshoot: string;
  paused: string;
  damage: string;
  invulnerability: string;
  fightStart: string;
  timeStart: string;
  seconds: string;
  health: string;
  howToPlayText: string;
  disclaimer:string;
  mobileDisclaimer:string;
}



interface triggerConfig extends genericConfig {
  triggerData: triggerData;
}

interface energyBarConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;

  energybarData: { health: number; width: number; height: number; name?: string, container?: Phaser.GameObjects.Container, hide: boolean, border?: boolean, borderColor?: number, rageDuration?: number };
};


interface triggerData {
  activatedOn: string;
  type: string;
  data: any;
}



interface optionsControls {
  scene: Phaser.Scene;
  gameplay: Phaser.Scene;
}


interface ImageAsset {
  name: string;
  path: string;
}

interface VideoAsset {
  name: string;
  path: string;
}

interface ScriptAsset {
  key: string;
  path: string;
}

interface TileMapsAsset {
  key: string;
  path: string;
}

interface FontAsset {
  key: string;
  path?: string;
  type?: string;
}

interface SpritesheetsAsset {
  name: string;
  path: string;
  width: number;
  height: number;
  frames?: number;
  spacing?: number;
  margin?: number;
}

interface SoundAsset {
  name: string;
  paths: Array<string>;
}

interface AudioSpriteAsset {
  name: string;
  jsonpath: string;
  paths: Array<string>;
  instance: { instance: number };
}

interface BitmapfontAsset {
  name: string;
  imgpath: string;
  xmlpath: string;
}

interface AtlasAsset {
  key: string;
  imagepath: string;
  jsonpath: string;
}



