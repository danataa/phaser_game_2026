

import ITextMessage from "./iTextMessage";


export default class TextMessage
  extends Phaser.GameObjects.Text
  implements ITextMessage {




  constructor(params: { scene: Phaser.Scene, x: number, y: number, text: string }) {

    super(params.scene, params.x, params.y, params.text, null);



    this.setOrigin(0.5, 0.5).setFontFamily("PressStart2P").setFontSize(20).setAlpha(1).setDepth(10).setStroke("#000000", 4);
    params.scene.add.existing(this);

    params.scene.tweens.add({
      targets: [this],
      duration: 1000,
      y: "-=100",
      onComplete: () => {

        params.scene.tweens.add({
          targets: [this],
          alpha: 0,
          duration: 500,
          y: "-=50",
          onComplete: () => {

          }
        });

      }
    });

  }



}


