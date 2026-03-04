import IBullet from "./iBullet";
import Bullet from "./Bullet";
import { bulletDirection } from "../../Enums";
import GamePlayBeat from "../../scenes/GamePlayBeat";
import EnemyCialtrone from "../enemy/Enemy.Cialtrone";
import PlayerBeat from "../player/Player.Beat";
export default class BulletBeat
    extends Bullet
    implements IBullet {

    _scene: GamePlayBeat;
    _parent: EnemyCialtrone | PlayerBeat;
    _chargeDirection: string;

    constructor(params: bulletConfig) {

     
        super(params);
        this._hidden = true; 
        this._scene = <GamePlayBeat>params.scene;
        this._parent = params.bulletData.parent;
        this.setName("beat").setDepth(1000).setAlpha(0);
        this._body.setCircle(20, 0, 0);
        

       

        this.scene.time.delayedCall(params.bulletData.removeAfter, () => {

            if (params.bulletData.from === "player") {
                this._scene.removePlayerBeat(this);
            } else {
                this._scene.removeFromBulletGroup(this);
            }

        }, [], this);

      

    }



    update(time: number, delta: number): void {

        super.update(time, delta);
        let _offset: { x: number, y: number } = { x: 0, y: 0 };
        if (this._parent != null) {

            if (this._params.bulletData.chargeDirection == "left") {
                _offset = this._params.bulletData.offset.left
            } else {
                _offset = this._params.bulletData.offset.right
            }

            this.x = this._parent.x + _offset.x;
            this.y = this._parent.y + _offset.y;
        }

    }





}


