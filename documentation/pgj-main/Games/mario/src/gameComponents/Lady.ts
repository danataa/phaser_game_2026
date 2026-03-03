export default class Lady extends Phaser.GameObjects.Sprite {
  constructor(scene:Phaser.Scene, x:number, y:number) {
    super(scene, x, y, 'lady');
    this.scene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);
 
  } 
}