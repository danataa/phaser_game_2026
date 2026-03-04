
import IBullet from "./iBullet";
import Bullet from "./Bullet";
import { bulletDirection } from "../../Enums";
export default class BulletBasic
    extends Bullet
    implements IBullet {

    constructor(params: bulletConfig) {

        super(params);

        if (params.name == null) this.setName("basic");
        if(params.body==null) this._body.setCircle(10, 2, 2);
        if(params.bulletData.animation==null && this._scene.anims.exists("basic-animation")) 
             this.play("basic-animation");


  

        switch (this._direction) {
            case bulletDirection.up:
                this.setVelocityY(-params.speed);
                break;
            case bulletDirection.down:
                this.setVelocityY(params.speed);
                break;
            case bulletDirection.left:
                this.setVelocityX(-params.speed);
                break;
            case bulletDirection.right:
                this.setVelocityX(params.speed);
                break;
        }

    }



    update(time: number, delta: number): void {

        super.update(time, delta);

    }


}


