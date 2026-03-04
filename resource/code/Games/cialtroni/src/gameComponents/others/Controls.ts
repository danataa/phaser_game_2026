
import IControls from "./iControls";
import Hud from '../../scenes/Hud';
import nipplejs from 'nipplejs';
import GamePlay from "../../scenes/GamePlay";
import GamePlayBeat from "../../scenes/GamePlayBeat";

export default class Controls

    implements IControls {

    protected _scene: Hud;
    protected _gameplay: GamePlayBeat;
    private _nipple: nipplejs.JoystickManager;
    private _btnRight: Phaser.GameObjects.Image
    private _btnJump: Phaser.GameObjects.Image;
    private _btnAttack: Phaser.GameObjects.Image;
    private _iconJump: Phaser.GameObjects.Image;
    private _iconAttack: Phaser.GameObjects.Image;

    constructor(params: optionsControls

    ) {

        this._scene = <Hud>params.scene;
        this._gameplay = <GamePlayBeat>params.gameplay;


            this._nipple = nipplejs.create({ color: 'red', lockX: true, position:{left: '50%', bottom: '50%'}, mode: 'static', size: 100, zone: document.getElementById('nippleContainer') });
            // possiamo eseguire del codice quando il virtual joystick inizia a muoversi
             this._nipple.on('start', () => { })
            // sull’ evento move eseguiamo il codice per il movimento
            this._nipple.on('move', (data: nipplejs.EventData, output: nipplejs.JoystickOutputData) => {

               
              if(output.direction!==undefined ){
              
                this._gameplay.getPlayer().setInputDirection(output.direction.x as string);
              }
                
               
            });
            // possiamo eseguire del codice quando il virtual joystick smette di muoversi
             this._nipple.on('end', (data: nipplejs.EventData, output: nipplejs.JoystickOutputData) => { 
                this._gameplay.getPlayer().setInputDirection("none");
             });

       
        this._btnJump = this._scene.add.image(1000, 600, "button").setInteractive().on('pointerdown', () => {
            this._gameplay.getPlayer().setInputJump(true);
        });
        this._iconJump = this._scene.add.image(1000, 600, "effects",68).setScale(2);

  
       

        this._btnAttack = this._scene.add.image(1180, 500, "button").setInteractive().on('pointerdown', () => {
            this._gameplay.getPlayer().setInputAttack(true);
        });
         this._iconAttack = this._scene.add.image(1180, 500, "effects",69).setScale(2);

    }

    removeControls(): void {
        this._nipple.destroy();
        this._btnJump.destroy();
        this._btnAttack.destroy();
        this._iconJump.destroy();
        this._iconAttack.destroy();
    }

}