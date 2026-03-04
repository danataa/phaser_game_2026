
import GamePlay from "../../scenes/GamePlay";
import IBonus from "./IBonus";
import { bonusTypes } from "../../Enums";
import Bonus from "./Bonus";


export default class BonusShooter
    extends Bonus
    implements IBonus {

    constructor(params: bonusConfig) {

        super(params);

        this.setDepth(100).setOrigin(0.5, 0.5);

    }

    getBonus(): void {

        if (this._isCollectable) return;
        this._isCollectable = true;

        super.getBonus();

    }



}


