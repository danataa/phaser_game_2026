import GamePlay from "./GamePlay";

import { EVENTS_NAME, GameStatus } from '../consts';
import { Score, ScoreOperations } from '../gameComponents/score';
import { Text } from '../gameComponents/text';


export default class Hud extends Phaser.Scene {

    private score!: Score;
  private gameEndPhrase!: Text;
  private winScore = 100;

  private chestLootHandler: () => void;
  private gameEndHandler: (status: GameStatus) => void;

  constructor() {
    super({
      key: "Hud",
    });


    this.chestLootHandler = () => {
        this.score.changeValue(ScoreOperations.INCREASE, 10);
  
        if (this.score.getValue() === this.winScore) {
          this.game.events.emit(EVENTS_NAME.gameEnd, 'win');
        }
      };

      this.gameEndHandler = (status) => {
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
        this.game.scene.pause('GamePlay');
  
        this.gameEndPhrase = new Text(
          this,
          this.game.scale.width / 2,
          this.game.scale.height * 0.4,
          status === GameStatus.LOSE
            ? `WASTED!\nCLICK TO RESTART`
            : `YOU ARE ROCK!\nCLICK TO RESTART`,
        )
          .setAlign('center')
          .setColor(status === GameStatus.LOSE ? '#ff0000' : '#ffffff');
  
        this.gameEndPhrase.setPosition(
          this.game.scale.width / 2 - this.gameEndPhrase.width / 2,
          this.game.scale.height * 0.4,
        );
  
        this.input.on('pointerdown', () => {
          this.game.events.off(EVENTS_NAME.chestLoot, this.chestLootHandler);
          this.game.events.off(EVENTS_NAME.gameEnd, this.gameEndHandler);
          this.scene.get('GamePlay').scene.restart();
          this.scene.restart();
        });
      };

  }


  init ()
  {
    
  }

  create ()
  {
    this.score = new Score(this, 20, 20, 0);

    this.initListeners();
  }

  private initListeners(): void {
    this.game.events.on(EVENTS_NAME.chestLoot, this.chestLootHandler, this);
    this.game.events.once(EVENTS_NAME.gameEnd, this.gameEndHandler, this);
  }
}
