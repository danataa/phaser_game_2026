import IPlayer from "./IPlayer";
import GamePlay from "../../scenes/GamePlay";
import { PlayerType } from "../../Enums";
import BulletOrb from "../bullets/Bullet.Orb";

export default class Player extends Phaser.GameObjects.Sprite implements IPlayer {

    protected _config: genericConfig;
    protected _body: Phaser.Physics.Arcade.Body;
    protected _scene: GamePlay;
    protected _isActivated: boolean = false;
    protected _isInvulnerable: boolean = false;
    protected _isTouchDevice: boolean = false;
    protected _isDead: boolean = false;
    protected _playerType: PlayerType;
    protected _damage: number = 0;
    protected _canBeat: boolean = false;

    protected _LEFT: Phaser.Input.Keyboard.Key;
    protected _RIGHT: Phaser.Input.Keyboard.Key;
    protected _UP: Phaser.Input.Keyboard.Key;
    protected _DOWN: Phaser.Input.Keyboard.Key;
    protected _SPACE: Phaser.Input.Keyboard.Key;

    protected _invulnerabilityTween: Phaser.Tweens.Tween;
    protected _invulnerabilityTimer: Phaser.Time.TimerEvent;

    protected _speed: number;
    protected _isJumping: boolean;
    protected _isPunching: boolean;
    protected _maxSpeed: number;
    protected _maxDamage: number = 100;
    private _isHitted: boolean = false;

    constructor(params: playerConfig) {

        super(params.scene, params.x, params.y, params.key);
        this._config = params;
        this._scene = <GamePlay>params.scene;
        this._playerType = params.playerType;
        this._config.scene.add.existing(this);
        this._config.scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this._body = this.body as Phaser.Physics.Arcade.Body;
        this._isTouchDevice = this.scene.sys.game.device.input.touch;

        this._LEFT = this._scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT
        );
        this._RIGHT = this._scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT
        );
        this._UP = this._scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.UP
        );
        this._DOWN = this._scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.DOWN
        );
        this._SPACE = this._scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

    }

    initPlayer() { }



    getSpeed(): number {
        return this._speed;
    }


    enterAnimation(): void {
        this.play("player-enter");
    }

    enterLevel(): void {

    }


    playAnimation(anim: string): void {
        this.play(anim, true);
    }

    enlarge(): void {
        this.setScale(1.5);
    }

    normalSize(): void {
        this.setScale(1);
    }



    handleInput(): void {

        if (this._isTouchDevice) {
            this.handleMobileInput();
        }
    }

    handleMobileInput(): void {

    }

    handleKeyboardInput(): void {

    }

    isBlocked(): Phaser.Types.Physics.Arcade.ArcadeBodyCollision {
        return this._body.blocked;
    }

    isTouching(): Phaser.Types.Physics.Arcade.ArcadeBodyCollision {
        return this._body.touching;
    }

    isJumping(): boolean {
        return this._isJumping;
    }

    setJumping(jump: boolean) {
        this._isJumping = jump;
    }

    isPunching(): boolean {
        return this._isPunching;
    }

    setPunching(punch: boolean): void {
        this._isPunching = punch;
    }

    activate(): void {

        this._isActivated = true;

    }

    isHitted(): boolean {
        return this._isHitted;
    }

    setHitted(hitted: boolean): void {
        this._isHitted = hitted;
    }

    isDead(): boolean {
        return this._isDead;
    }

    setDead(dead: boolean): void {
        this._isDead = dead;
    }

    deactivate(): void {

        this._isActivated = false;
    }

    activateInvulnerability(): void {
        //console.log("activate invulnerability");
        this._isInvulnerable = true;
    }



    deactivateInvulnerability(): void {
        // console.log("deactivate invulnerability");
        this._isInvulnerable = false;
        if (this._invulnerabilityTimer != null) this._invulnerabilityTimer.remove();
        if (this._invulnerabilityTween != null) { this._invulnerabilityTween.stop(); this._invulnerabilityTween.remove(); }
        this.alpha = 1;


    }

    setInvulnerability(time: number): void {

        this.activateInvulnerability();
        this._invulnerabilityTimer = this._scene.time.addEvent({ delay: time, callback: () => { this.deactivateInvulnerability(); }, callbackScope: this, loop: false });
        this._invulnerabilityTween = this._scene.tweens.add({ targets: this, alpha: 0.5, duration: time / 30, yoyo: true, repeat: 10 });
    }

    isInvulnerable(): boolean {
        return this._isInvulnerable;
    }


    gameOver(): void {

    }

    deadSequence(): void {

    }
    update(time: number, delta: number) {
    }

    increaseScore(score: number): void {
        this._scene.increaseScore(score);
    }

    getBody(): Phaser.Physics.Arcade.Body {
        return this._body;
    }

    startRage(): void {
        // to be implemented in specific player
    }
    endRage(): void {
        // to be implemented in specific player
    }
    isRage(): boolean {
        return false;
    }
    setRage(value: boolean): void { }
    setInputDirection(direction: string): void {

    }
    setInputJump(value: boolean): void {

    }
    setInputAttack(value: boolean): void {

    }

    setBeat(value: boolean): void {
        this._canBeat = value;
    }
    
    canBeat(): boolean {
        return this._canBeat;
    }

    increaseDamage(damage: number): void {
        this._damage += damage;
        if (this._damage > this._maxDamage) {
            this._damage = this._maxDamage;

        }
    }
}
