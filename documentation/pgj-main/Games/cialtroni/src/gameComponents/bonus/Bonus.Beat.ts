
import GamePlay from "../../scenes/GamePlay";
import IBonus from "./IBonus";
import { bonusTypes, hitDirection } from "../../Enums";
import Bonus from "./Bonus";


export default class BonusBeat
    extends Bonus
    implements IBonus {

    constructor(params: bonusConfig) {

        super(params);

        let _xVel: number = 0;

        this._body.setGravityY(600).setCollideWorldBounds(true)

        if (params.bonusData.hitDirection !== null) {

            if (params.bonusData.hitDirection === hitDirection.left) {
                _xVel = 50;
            } else {
                _xVel = -50;
            }
            this._body.setVelocity(_xVel, -200).setBounce(0.7);

            
        }

        this.setDepth(100).setOrigin(0.5, 0.5);
       
        if (_xVel != 0) {
            this.scene.tweens.addCounter({
                from: _xVel,
                to: 0,
                duration: 3000,
                onUpdate: (tween) => {
                    this._body.setVelocityX(tween.getValue());
                }
            });
        }


    }

  



}


