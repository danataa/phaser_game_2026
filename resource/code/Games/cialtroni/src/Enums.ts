export enum brickType {
  none = 0,
  blue = 10,
  red = 20,
  cyan = 30,
  yellow = 40,
  silver = 50,
  purple = 60,
  gold = 70,
  orange = 80,
  white = 90,
}

export enum staticObjects {
  bonusHolder = 0,
  bonusDischarger = 1,
  static = 2
}

export enum language {
  english,
  italian,
  napolitan
}

export enum levelEndState {

  gameOver,
  timeOver,
  levelCompleted
}

export enum hitTypes {
  punchOrKick,
  superPower1,
  superPower2,
  superPower3
}


export enum dialogSpeaker {
  borrelli,
  cialtrone
}


export enum hitDirection {
  left = "left",
  right = "right",
  both = "both"
}


export enum bonusTypes {
  none = 'none',
  ball = 'ball',
  score = 'score',
  enlarge = 'enlarge',
  damage = 'damage',
  speed = 'speed',
  fireRate = 'firerate',
  shield = 'shield',
  missile = 'missile',
  laser = 'laser',
  invulnerability = 'invulnerability',
  rear = 'rear',
  side = 'side',
  orb = 'orb',
  health = 'health',
  trash = 'trash',
  discharger = 'discharger',
  holder = 'holder',
  time = 'time',
  canStrike = 'canStrike'
}

export enum enemyType {
  none = 'none',
  basic = 'basic',
  brick = 'brick',
}

export enum enemySprite {
  none = 'none',
  orb = 'orb',
  sphere = 'sphere',
  molecula = 'molecula',
  pyramid = 'pyramid',
  cube = 'cube',
  cone = 'cone',

}

export enum PlayerType {
  PLAYER1,
  PLAYER2,
  PLAYER3
}

export enum bulletDirection {
  up,
  upRight,
  right,
  downRight,
  down,
  downLeft,
  left,
  upLeft,
  follow,
  circular
}

export enum enemyMovementTypes {

  straight = "straight",
  toLeft = "toLeft",
  toRight = "toRight",
  sineToLeft = "sineToLeft",
  sineToRight = "sineToRight",
  toPlayer = "toPlayer",

}

export enum gameType {
  breakout = 'breakout',
  shooter = 'shooter',
  platform = 'platform',
  beat = 'beat'

}

export enum HudType {
  breakout = 'breakout',
  shooter = 'shooter',
  platform = 'platform',
  beat = 'beat',
  none = 'none'
}

export enum bulletType {
  ball = "ball",
  basic = "basic",
  missile = "missile",
  laser = "laser",
  orb = "orb",

}