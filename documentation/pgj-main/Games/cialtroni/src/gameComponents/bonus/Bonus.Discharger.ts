
import GamePlay from "../../scenes/GamePlay";
import IBonus from "./IBonus";
import { bonusTypes, hitDirection } from "../../Enums";
import Bonus from "./Bonus";



export default class BonusDischarger
    extends Bonus
    implements IBonus {

    private _barrel: Phaser.FX.Barrel;
    private _glow: Phaser.FX.Glow;
    private _tween: Phaser.Tweens.Tween;

    constructor(params: bonusConfig) {

        super(params);

        this._scene.events.off("stop-player-rage", this.stopDischarge, this);
        this._scene.events.on("stop-player-rage", this.stopDischarge, this);

    }

    startDischarge() {


        if (!this._scene.sys.game.device.input.touch) {
            this._glow = this.preFX.addGlow(0xffffff, 0.3, 2, false);
            this._barrel = this.preFX.addBarrel(0.99);

            this._tween = this._scene.tweens.add({
                targets: this._barrel,
                amount: 1.2,
                yoyo: true,
                duration: 200,
                loop: -1,
                ease: 'sine.inout'
            });
        } else {

            this._tween = this._scene.tweens.add({
                targets: this,
                scale: 1.2,
                yoyo: true,
                duration: 200,
                loop: -1,
                ease: 'sine.inout'
            });
        }


    }


    stopDischarge() {

         if (this._tween) this._tween.stop();
        if (!this._scene.sys.game.device.input.touch) {
           
            if (this._barrel) this.preFX.remove(this._barrel);
            if (this._glow) this.preFX.remove(this._glow);
        }
    }


}


