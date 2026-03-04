import { GameData } from "../GameData";
import Tomato from "../gameComponents/Tomato";
import Bombs from "../gameComponents/Bombs";
import TomatoItem from "../gameComponents/TomatoItem";

export default class GamePlay extends Phaser.Scene {


  private wall_floor: Phaser.Physics.Arcade.StaticGroup;
  private tomato: Tomato;
  private bombsGroup: Bombs;
  private itemsGroup: TomatoItem;


  constructor() {
    super({
      key: "GamePlay",
    });
  }


  init() {
    this.scene.launch('Hud');
    this.scene.bringToTop('Hud');
  }


  create ()
  {
      this.add.image(0, 0, 'background')
          .setOrigin(0);

      this.wall_floor = this.physics.add.staticGroup();

      this.wall_floor.create(0, 0, 'wall')
          .setOrigin(0);
      this.wall_floor.create(this.scale.width, 0, 'wall')
          .setOrigin(1, 0)
          .setFlipX(true);

      this.wall_floor.create(0, this.scale.height, 'floor')
          .setOrigin(0, 1);

      this.wall_floor.refresh();

      //this.wall_floor.getChildren()[2].setOffset(0, 15);

      // Bombs
      this.bombsGroup = new Bombs({
          physicsWorld: this.physics.world,
          scene: this
      });

      // Items
      this.itemsGroup = new TomatoItem({
          physicsWorld: this.physics.world,
          scene: this
      });

      // Personaje
      this.tomato = new Tomato({
          scene: this,
          x: 100,
          y: 100,
      });

      

      this.physics.add.collider(this.tomato, this.wall_floor);
      this.physics.add.collider(this.bombsGroup, this.wall_floor);


      this.physics.add.overlap(this.tomato, this.bombsGroup, () => {
          this.tomato.bombCollision();
      });

      this.physics.add.overlap(this.itemsGroup, this.tomato, () => {
          this.sound.play('pop');
          this.registry.events.emit('update_points');
          this.itemsGroup.destroyItem();
          this.bombsGroup.addBomb();
      });
  }

  update ()
  {
      this.tomato.update();
      this.bombsGroup.update();
  }


}
