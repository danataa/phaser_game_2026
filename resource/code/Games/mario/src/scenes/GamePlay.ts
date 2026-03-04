import Kong from "../gameComponents/Kong";
import Mario from "../gameComponents/Mario";
import Lady from "../gameComponents/Lady";



export default class GamePlay extends Phaser.Scene {

  map: Phaser.Tilemaps.Tilemap;
  ladders: Phaser.Tilemaps.TilemapLayer;
  scaffolding: Phaser.Tilemaps.TilemapLayer;
  rivets: Phaser.Physics.Arcade.Group;
  kong: Kong;
  mario: Mario;
  lady: Lady;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  spacebar: Phaser.Input.Keyboard.Key;
  jumpSFX: Phaser.Sound.BaseSound;
  stompSFX: Phaser.Sound.BaseSound;
  score: number = 0;
  scoreText: Phaser.GameObjects.BitmapText;
  score100: Phaser.GameObjects.Image;



  constructor() {
    super({
      key: "GamePlay",
    });
  }


  init() {

  }


  create() {

    this.createAnims();
    this.createFonts();
    
    this.map = this.make.tilemap({ key: 'map', tileWidth: 8, tileHeight: 8 });
    const tileset = this.map.addTilesetImage('tileset1','tileset');
    const laddersLayerID = this.map.getLayerIndex('Ladders');
    const scaffoldingLayerID = this.map.getLayerIndex('Scaffolding');
    this.ladders = this.map.createLayer(laddersLayerID, tileset, 0, 0);
    this.scaffolding = this.map.createLayer(scaffoldingLayerID, tileset, 0, 0); // layer index, tileset, x, y
    this.map.setCollision(1, true, true, this.scaffolding);

    this.rivets = this.physics.add.group({allowGravity: false,});


       const _rivetPosition = this.map.getObjectLayer("Rivets")!.objects as any[];
_rivetPosition.forEach((tile: Phaser.Tilemaps.Tile) => {
    this.rivets.create(tile.x, tile.y, 'rivet').setOrigin(0,1).body.setSize(8, 32).setOffset(0,-16);
});
     

    this.kong = new Kong(this, 112,56);
    this.mario = new Mario(this, 90,220);   
    this.lady = new Lady(this, 112,20);
    
    this.physics.add.collider(this.mario, this.scaffolding, null, this.checkXSection, this);
    this.physics.add.collider(this.mario, this.rivets, this.unRivet, null, this);
    this.physics.add.collider(this.kong, this.scaffolding)
    this.physics.add.collider(this.lady, this.scaffolding)

    this.add.image(0,0,'HUD').setOrigin(0)
    
    //this.jumpSFX = this.sound.add('jumpSFX');
    //this.stompSFX = this.sound.add('stompSFX');
  
   // this.scoreText = this.add.bitmapText(8,8,'namcoFont', "000000");
    this.score100 = this.add.image(0,0,'100').setVisible(false);
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
  }

  update(time: number, delta: number): void {
this.mario.update();
  }

  getMap() {
    return this.map;
  }


   renderScore(score:number) {
     //this.scoreText.setText(Phaser.Utils.String.Pad(this.score, 6, '0', 1));
  }
  
  unRivet(mario:any,rivet:any) {
    this.score100.setPosition(mario.x, mario.y+8).setVisible(true);
    rivet.disableBody(true, true);
    
    this.time.delayedCall(1000, this.eraseFloatScore,[this.score100] , this);
  
    this.score+=100;
    this.renderScore(this.score);
  }
  
  eraseFloatScore(scoreText:Phaser.GameObjects.Image) {
    scoreText.setVisible(false)
  }
  
  checkXSection(mario:any, tile:any) {
   
    return !(
     ((mario.status === Mario.Status.Climbing) || (mario.status === Mario.Status.Walking && this.cursors.down.isDown && mario.canClimb(mario.getBottomCenter())))
   )
  } 
  

  createFonts() {

let _config:Phaser.Types.GameObjects.BitmapText.RetroFontConfig;
_config = {
   
    image: 'namcoFont',
    width: 8,
    height: 8,
    chars:  '0123456789',
    "spacing.x": 1,
    "spacing.y": 1,
    "offset.x": 0,
    "offset.y": 0,
    charsPerRow: 10,
    lineSpacing: 0

  }


     this.cache.bitmapFont.add('namcoFont', Phaser.GameObjects.RetroFont.Parse(this, _config));
  }
    
  
  createAnims() {

    this.anims.create({
      key: 'walking',
       frames: this.anims.generateFrameNames('mario', {
        prefix: 'mario',
        suffix: '.png',
        start: 1,
        end: 2
      }),
      frameRate: 13,
      repeat: -1
    });
 
    this.anims.create({
      key: 'climb',
      frames: this.anims.generateFrameNames('mario', {
        prefix: 'climb',
        suffix: '.png',
        start: 0,
        end: 1
      }),
      frameRate: 13,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: [{key:'mario', frame: 'mario0.png' }]
    });

    this.anims.create({
      key: 'jump',
      frames: [{key:'mario', frame: 'jump.png' }] 
    });
   
 
    this.anims.create({
      key: 'kong-stomp',
      frames: this.anims.generateFrameNumbers('kong-idle', { start: 1, end: 2 }),
      frameRate: 1,
      repeat: 2
    });
 
  }

}
