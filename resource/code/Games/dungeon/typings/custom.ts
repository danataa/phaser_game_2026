
interface Window {
  sizeChanged: () => void;
  game: Phaser.Game;
}

type ObjectPoint = {
  height: number;
  id: number;
  name: string;
  point: boolean;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
};

interface gameData {

  globals: {
    gameWidth: number,
    gameHeight: number,
    bgColor: string,
    debug: boolean
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

  spritesheets?: Array<SpritesheetsAsset>,
  images?: Array<ImageAsset>,
  atlas?: Array<AtlasAsset>,
  sounds?: Array<SoundAsset>,
  videos?: Array<VideoAsset>,
  audios?: Array<AudioSpriteAsset>,
  scripts?: Array<ScriptAsset>,
  tilemaps?: Array<TileMapsAsset>,
  fonts?: Array<FontAsset>,
  webfonts?: Array<FontAsset>,
  bitmapfonts?: Array<BitmapfontAsset>,
  json?: Array<any>,
  animations?: Array<any>

}

interface genericConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  key: string;
}

interface jsonAsset  {
key: string;
path: string;
}

interface animationAsset { 
  key: string;
  path: string;
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
  frames: number;
  spacing?: number;
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



