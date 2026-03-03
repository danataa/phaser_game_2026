export default class Intro extends Phaser.Scene {



    private  gridConfiguration = {
        x: 113,
        y: 102,
        paddingX: 10,
        paddingY: 10
    }

  constructor() {
    super({
      key: "Intro",
    });

  }

  init() {

    // Fadein camera
    this.cameras.main.fadeIn(500);
    this.cameras.main.setBackgroundColor("#192a56");
  
    this.volumeButton();
 
}

create ()
 {

     this.add.image(this.gridConfiguration.x - 63, this.gridConfiguration.y - 77, "background").setOrigin(0);

     const titleText = this.add.text(this.sys.game.scale.width / 2, this.sys.game.scale.height / 2,
         "Memory Card Game\nClick to Play",
         { align: "center", strokeThickness: 4, fontSize: 40, fontStyle: "bold", color: "#8c7ae6" }
     )
         .setOrigin(.5)
         .setDepth(3)
         .setInteractive();
     // title tween like retro arcade
     this.add.tween({
         targets: titleText,
         duration: 800,
         ease: (value:number) => (value > .8),
         alpha: 0,
         repeat: -1,
         yoyo: true,
     });

     // Text Events
     titleText.on(Phaser.Input.Events.POINTER_OVER, () => {
         titleText.setColor("#9c88ff");
         this.input.setDefaultCursor("pointer");
     });
     titleText.on(Phaser.Input.Events.POINTER_OUT, () => {
         titleText.setColor("#8c7ae6");
         this.input.setDefaultCursor("default");
     });
     titleText.on(Phaser.Input.Events.POINTER_DOWN, () => {
         this.sound.play("whoosh", { volume: 1.3 });
         this.add.tween({
             targets: titleText,
             ease: Phaser.Math.Easing.Bounce.InOut,
             y: -1000,
             onComplete: () => {
               
                 this.scene.start("GamePlay");
             }
         })
     });


 }


 volumeButton ()
 {
     const volumeIcon = this.add.image(25, 25, "volume-icon").setName("volume-icon");
     volumeIcon.setInteractive();

     // Mouse enter
     volumeIcon.on(Phaser.Input.Events.POINTER_OVER, () => {
         this.input.setDefaultCursor("pointer");
     });
     // Mouse leave
     volumeIcon.on(Phaser.Input.Events.POINTER_OUT, () => {
         console.log("Mouse leave");
         this.input.setDefaultCursor("default");
     });


     volumeIcon.on(Phaser.Input.Events.POINTER_DOWN, () => {
         if (this.sound.volume === 0) {
             this.sound.setVolume(1);
             volumeIcon.setTexture("volume-icon");
             volumeIcon.setAlpha(1);
         } else {
             this.sound.setVolume(0);
             volumeIcon.setTexture("volume-icon_off");
             volumeIcon.setAlpha(.5)
         }
     });
 }



  update(time: number, delta: number): void {

   

  }

}

