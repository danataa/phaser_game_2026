import { Game } from "phaser";
import GamePlay from "../scenes/GamePlay";

export default class Mario extends Phaser.GameObjects.Sprite {
    scene: GamePlay;
    status: number;
    pushUpAnimFrame: number; // this is the frame counter for the special animation for Mario pushing himself up at top of ladder
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    spacebar: Phaser.Input.Keyboard.Key;
    _body: Phaser.Physics.Arcade.Body;

  constructor(scene:Phaser.Scene, x:number, y:number) {
    super(scene, x, y, 'mario');
    this.scene = <GamePlay>scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this._body =  this._body = <Phaser.Physics.Arcade.Body>this.body;
    this._body.setSize(4, 16).setOffset(6,0); 
    this._body.setCollideWorldBounds(true);
    this.pushUpAnimFrame = 0; // this is the frame counter for the special animation for Mario pushing himself up at top of ladder
    
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.status = Mario.Status.Walking;
    this.spacebar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
   
  } 

  static Status = {
    Walking: 1,
    Jumping: 2,
    Climbing: 3,
    PushUp: 4,
  }

  update() {

    switch(this.status) {
 
      case Mario.Status.Walking:
        
        if (this.cursors.right.isDown) {
          this._body.setVelocityX(60);
          this.setFlipX(true)
          this.anims.play('walking', true)
        } else if (this.cursors.left.isDown) {   
          this._body.setVelocityX(-60)
          this.setFlipX(false)
          this.anims.play('walking', true)
        } else {
          this._body.setVelocityX(0)
          this.anims.play('idle', true);
        }
     
        if (this.cursors.up.isDown && this.canClimb(this)) {
            this.setStatus(Mario.Status.Climbing);
 
        }       
        if (this.cursors.down.isDown && this.canClimb(this.getBottomCenter())) {
          this.setStatus(Mario.Status.Climbing)
        }

        if (Phaser.Input.Keyboard.JustDown(this.spacebar) && this._body.onFloor()) {
          this._body.setVelocityY(-120);
          this.setStatus(Mario.Status.Jumping);
        }
    
        break;
     
      case Mario.Status.Jumping:
    
        if (this._body.onFloor()) this.setStatus(Mario.Status.Walking);
        
         break;
    
      case Mario.Status.PushUp:
   
        if (this.cursors.up.isDown && (this.pushUpAnimFrame <7))  {
          this.pushUpAnimFrame +=0.25;        
          this.setFrame(Math.floor(this.pushUpAnimFrame));
          this.y-=0.25;          
        }

        if (this.cursors.down.isDown)  {
           if (this.pushUpAnimFrame >0) 
           {
             this.pushUpAnimFrame -=0.25;
             this.setFrame(Math.floor(this.pushUpAnimFrame));
             this.y+=0.25;             
           }
           else 
           {
             this.setStatus(Mario.Status.Climbing)
           }
        
         }        
         if (this.cursors.right.isDown && (this.pushUpAnimFrame ===7)) {
       
          this._body.setVelocityX(60);
          this.setFlipX(false)
          this.anims.play('walking', true);
          this.setStatus(Mario.Status.Walking);
        }
        else if (this.cursors.left.isDown && (this.pushUpAnimFrame ===7)) {   
          this._body.setVelocityX(-60)
          this.setFlipX(true)
          this.anims.play('walking', true);
          this.setStatus(Mario.Status.Walking);
        } 
        
        break;

      case Mario.Status.Climbing:

        if (this.cursors.right.isDown && this.isScaffolding(this.getBottomCenter()))
        {
          this._body.setVelocityX(40);
          this.setFlipX(false)
          this.anims.play('walking', true);
          this.setStatus(Mario.Status.Walking);
        }
        else if (this.cursors.left.isDown && this.isScaffolding(this.getBottomCenter()))
        {   
          this._body.setVelocityX(-40)
          this.setFlipX(true)
          this.anims.play('walking', true);
          this.setStatus(Mario.Status.Walking);
        } 
        else if (this.cursors.up.isDown)
        {
          if (this.isLadder(this.getCenter()))
          {
            this.anims.play('climb', true);
            this._body.setVelocityY(-40);            
          }
          else
          {
            this.setStatus(Mario.Status.PushUp); 
          }
        }
        else if (this.cursors.down.isDown && this.isLadder(this.getBottomCenter()))
        {
          this.anims.play('climb', true);
          this._body.setVelocityY(40)           
        }
        else
        {
          this.anims.stop()
          this._body.setVelocityY(0)
        }
        break;
     
    }
  }

  setStatus(newStatus:number) {
    this.status = newStatus;
    switch (this.status) {
      case Mario.Status.Walking:
        this._body.setAllowGravity(true);
        break;
      case Mario.Status.PushUp:
        this.pushUpAnimFrame = 0;
        this.anims.stop();
        this.setTexture('liftUp', this.pushUpAnimFrame);
        this._body.stop();
        break;
      case Mario.Status.Jumping:
        //this.scene.jumpSFX.play();
        this.anims.play('jump', true)
        break;
      case Mario.Status.Climbing:
        this._body.stop();
        this._body.setAllowGravity(false);
        break;
    }
      
  }
  
  canClimb(position:{x:number, y:number}) {
    const tile = this.scene.getMap().getTileAtWorldXY(position.x,position.y, true, this.scene.cameras.main, this.scene.ladders);
    const isLadder = (tile.index === 9);
    return (
      isLadder && (this._body.left>=tile.pixelX && this._body.right<=tile.right)
    )
  }
  
  isLadder(position:{x:number, y:number}) {
    const tile = this.scene.getMap().getTileAtWorldXY(position.x,position.y, true, this.scene.cameras.main, this.scene.ladders);
    return tile.index === 9 ;  
  }
  
  isScaffolding(position:{x:number, y:number}) {
    const tile = this.scene.getMap().getTileAtWorldXY(position.x,position.y, true, this.scene.cameras.main, this.scene.scaffolding);
    return tile.index === 1 ;  
  }
  

 
}