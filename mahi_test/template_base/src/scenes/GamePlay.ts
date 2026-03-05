import { GameData } from "../GameData";

export default class GamePlay extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({
      key: "GamePlay",
    });
  }


  init() {

  }


  create() {
    this.cameras.main.setBackgroundColor(0x000000);

    // Visualizza la tilemap
    const map = this.add.tilemap("tilemap_0");
    const tileset = map.addTilesetImage("tileset_inferno", "tileset_0");
    map.createLayer("world", tileset, 0, 0);
    const collideLayer = map.createLayer("collide", tileset, 0, 0);
    collideLayer.setCollisionByProperty({ collide: true });
    
    // imposta i limiti del mondo fisico alle dimensioni della tilemap
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // // optional: draw the collision rectangles for debugging
    // const debugGraphics = this.add.graphics().setAlpha(0.6);
    // collideLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    // });

    // Aggiungi il player come sprite con fisica
    this.player = this.physics.add.sprite(100, 100, "player");
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, collideLayer);

    // telecamera segue il player
    this.cameras.main.startFollow(this.player);

    // input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
    }) as Phaser.Types.Input.Keyboard.CursorKeys;

    // definizioni animazioni
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player", { start: 10, end: 17 }),
      frameRate: 10,
      repeat: -1,
    });

  }

  update(time: number, delta: number): void {
    const speed = 200;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // azzera la velocità
    body.setVelocity(0);

    // movimento orizzontale
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      body.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      body.setVelocityX(speed);
      this.player.setFlipX(false);
    }

    // movimento verticale
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      body.setVelocityY(speed);
    }

    // avvia/ferma animazioni
    if (body.velocity.x !== 0 || body.velocity.y !== 0) {
      this.player.anims.play("walk", true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(0);
    }
  }


}
