import HudBeat from "../../scenes/HudBeat";
import { enemyMovementTypes } from "../../Enums";
import IEnergyBar from "./iEnergyBar";


export default class EnergyBar
    extends Phaser.GameObjects.Graphics
    implements IEnergyBar {

    protected _health: number = 0;
    protected _startValue: number = 0;
    protected _currentValue: number = 0;
    protected _hud: HudBeat;
    protected _config: energyBarConfig;
    protected _p: number = 0;
    protected _isVisible: boolean = false;
    protected _visibleTimer: Phaser.Time.TimerEvent | undefined;
    protected _disappearAfter: number = 3000; //ms
    protected _hideTween: Phaser.Tweens.Tween | undefined;
    protected _hide: boolean = false;
    protected _border: boolean = false;
    protected _borderColor: number = 0x000000;
    protected _rageDuration: number = 150;


    constructor(params: energyBarConfig) {

        super(params.scene, {});
        this._config = params;

        
        this._hud = <HudBeat>params.scene;
        this._health = params.energybarData.health;
        this._startValue = this._currentValue = this._health;
        this._config.scene.add.existing(this);
        this._p = this._config.energybarData.width / 100;
        this._hide = params.energybarData.hide;

        if (params.energybarData.border !== undefined) {
            this._border = params.energybarData.border;
        }

        if (params.energybarData.borderColor !== undefined) {
            this._borderColor = params.energybarData.borderColor;
        }

        if (params.energybarData.rageDuration !== undefined) {
            this._rageDuration = params.energybarData.rageDuration;
        }

        this.x = this._config.x;
        this.y = this._config.y;

        this.draw(this._startValue);

        if (this._hide) {
            this.resetTimer();

            this._hideTween = this._hud.tweens.add({
                targets: this,
                alpha: 0,
                persist: true,
                duration: 200,
                onComplete: () => {
                    this._isVisible = false;
                }
            }).pause();
        }

        /* if (params.energybarData.name !== undefined) {
             this.name = params.energybarData.name;
             console.log("energy name", this.name, this._config.scene.scene.key);
         }
         */


    }

    getValue(): number {
        return this._currentValue;
    }

    hide(): void {

        this._hideTween.resume();
    }

    updatePosition(x: number, y: number, depth?:number): void {
        this.x = x;
        this.y = y;
        if(depth!==undefined) this.setDepth(depth);
    }

    startRage(_callback?: any): void {

        let _start: number = this._currentValue;
        let _end: number = 0;

        this._hud.tweens.addCounter({
            from: _start,
            to: _end,
            duration: this._rageDuration*_start,
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                this.draw(tween.getValue());
            }, onComplete: () => {

                this._currentValue = this._health = this._startValue = 0;
                if (_callback) _callback();
               
               

            }
        });



    }

    resetTimer(): void {

        this._visibleTimer = this._hud.time.addEvent({
            delay: this._disappearAfter,
            loop: false,
            callback: () => {
                this.hide();
            }
        });
    }

    updatePercentage(percentage: number): number {

        if ((!this._isVisible || this._hideTween.isPlaying) && this._hide) {
            this._hideTween.seek(0); this._hideTween.paused = true; this.setAlpha(1); this._isVisible = true; this.resetTimer();

        }
        let _start: number = this._currentValue;

        let _end: number = _start - percentage;

        this._hud.tweens.addCounter({
            from: _start,
            to: _end,
            duration: 200,
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                this.draw(tween.getValue());
            }, onComplete: () => {
                this._currentValue = _end;
            }
        });

        return _end;
    }

    updateValue(amount: number): number {

        if ((!this._isVisible || this._hideTween.isPlaying) && this._hide) {
            this._hideTween.seek(0); this._hideTween.paused = true; this.setAlpha(1); this._isVisible = true; this.resetTimer();

        }


        let _start: number = this._currentValue;
        let _end: number = this._currentValue + amount;

        if (_end > 100) _end = 100;
        if (_end < 0) _end = 0;

        this._hud.tweens.addCounter({
            from: _start,
            to: _end,
            duration: 200,
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                this.draw(tween.getValue());
            }, onComplete: () => {
                this._currentValue = _end;
            }
        });



        return _end


    }




    draw(tweenAmount: number): void {

        this.clear();

        if (this._border) {
            this.fillStyle(this._borderColor);
            this.fillRect(-2, -2, this._config.energybarData.width + 4, this._config.energybarData.height + 4);
        }
        //  Health

        this.fillStyle(0xaaaaaa);
        this.fillRect(0, 0, this._config.energybarData.width, this._config.energybarData.height);

        //set the fillStyle based on % of current health
        const healthPercent = (tweenAmount / this._health) * 100;

        if (healthPercent >= 60) {
            this.fillStyle(0x00ff00);
        }
        else if (healthPercent < 60 && healthPercent > 30) {
            this.fillStyle(0xffcc00);
        }
        else {
            this.fillStyle(0xff0000);
        }

        var d = Math.floor(this._p * tweenAmount);

        this.fillRect(0, 0, d, this._config.energybarData.height);

        this.setPosition(this.x, this.y);

    }




}


