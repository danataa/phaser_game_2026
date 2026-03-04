import GamePlay from "./GamePlay";

export default class Hud extends Phaser.Scene {

  private groupLife: Phaser.GameObjects.Group;
  private points: Phaser.GameObjects.BitmapText;
  private actual_points: number;

  constructor() {
    super({
      key: "Hud",
    });
  }


  init ()
  {
      this.scene.moveUp();
      this.actual_points = 0;
  }

  create ()
  {
      this.groupLife = this.add.group({
          key: 'life',
          repeat: 2,
          setXY: {
              x: 50,
              y: 20,
              stepX: 25
          }
      });

      this.points = this.add.bitmapText(
          this.scale.width - 40,
          20,
          'pixelFont',
          Phaser.Utils.String.Pad('0', 6, '0', 1)
      ).setOrigin(1, 0).setTint(0x000000);


      // Eventos
      this.registry.events.on('remove_life', () => {
          this.groupLife.getChildren()[this.groupLife.getChildren().length - 1].destroy();
      });
      this.registry.events.on('game_over', () => {
          this.registry.events.removeAllListeners();
          this.scene.start('Intro', {points: this.actual_points});
          this.scene.stop('GamePlay');
      });

      this.registry.events.on('update_points', () => {
          this.actual_points += 10;
          this.points.setText(Phaser.Utils.String.Pad(this.actual_points, 6, '0', 1));
      });
  }


}
