export default class Kong extends Phaser.GameObjects.Sprite {

    scene: Phaser.Scene;
    status: number;

  constructor(scene:Phaser.Scene, x:number, y:number) {
    super(scene, x, y, 'kong-idle');
    this.scene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5,0);
    this.status = Kong.Status.Idle;
 
  }
  
  static Status = {
    Idle: 1,
    Stomping: 2,
  }
  
  update() {
    
  }
 
}
