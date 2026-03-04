import nipplejs from 'nipplejs';
import { PlayerType, hitDirection, hitTypes } from "../../Enums";
import Player from "./Player";
import IPlayerBeat from "./IPlayer.Beat";
import BulletBeat from '../bullets/Bullet.Beat';
import GamePlayBeat from '../../scenes/GamePlayBeat';



enum playerDirection {
    left = "left",
    right = "right",
    none = "none"
}

export default class PlayerBeat
    extends Player
    implements IPlayerBeat {

    private _canDoubleJump: boolean = true;
    private _direction: playerDirection = playerDirection.right;
    _scene: GamePlayBeat;
    private _firstBounceDead: boolean = false;
    private _startDamage: number = 10;
    private _isRage: boolean = false;


    private _inputDirection: playerDirection | null = null;
    private _inputJump: boolean = false;
    private _inputAttack: boolean = false;
   

    private _beatStatus: Phaser.GameObjects.Image;

    constructor(params: playerConfig) {

        super(params);

        this._speed = 300;
        this._maxSpeed = 500;
        this._scene = <GamePlayBeat>params.scene;

        this._scene.events.off("start-dialog", this.startDialog, this);
        this._scene.events.on("start-dialog", this.startDialog, this);

        this._scene.events.off("end-dialog", this.endDialog, this);
        this._scene.events.on("end-dialog", this.endDialog, this);

        this._scene.events.off("stop-action", this.stopAction, this);
        this._scene.events.on("stop-action", this.stopAction, this);

        this._scene.events.off("start-player-rage", this.startRage, this);
        this._scene.events.on("start-player-rage", this.startRage, this);

        this._scene.events.off("end-player-rage", this.endRage, this);
        this._scene.events.on("end-player-rage", this.endRage, this);

        this._beatStatus = this._scene.add.image(this.x, this.y, "effects", 56).setDepth(1001).setOrigin(0.5, 0.5).setScale(2).setActive(false).setVisible(false);

        this.scene.tweens.add({
            targets: this._beatStatus,
            scale: 1.5,
            duration: 400,
            ease: "Power2",
            yoyo: true,
            repeat: -1
        });

        this.initPlayer();

        this._canDoubleJump = true;

        if (!this._config.scene.anims.exists("player-beat-idle")) {
            this._config.scene.anims.create({
                key: "player-beat-idle",
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: [0, 1, 2, 1] }),
                frameRate: 5,
                repeat: -1
            });
        }

        if (!this._config.scene.anims.exists("player-beat-walk")) {
            this._config.scene.anims.create({
                key: "player-beat-walk",
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: [3, 4, 5, 6, 7] }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this._config.scene.anims.exists("player-beat-run")) {
            this._config.scene.anims.create({
                key: "player-beat-run",
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: [7, 8, 9, 14, 15, 16] }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this._config.scene.anims.exists("player-beat-jump")) {
            this._config.scene.anims.create({
                key: "player-beat-jump",
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: [17] }),
                frameRate: 10,
                repeat: 0
            });
        }

        if (!this._config.scene.anims.exists("player-beat-hit-front")) {
            this._config.scene.anims.create({
                key: "player-beat-hit-front",
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: [18] }),
                frameRate: 10,
                repeat: 0
            });
        }

        if (!this._config.scene.anims.exists("player-beat-dead")) {
            this._config.scene.anims.create({
                key: "player-beat-dead",
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: [10, 10, 10, 11, 10, 11] }),
                frameRate: 5,
                repeat: 0
            });
        }

        if (!this._config.scene.anims.exists("player-beat-hit-back")) {
            this._config.scene.anims.create({
                key: "player-beat-hit-back",
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: [10] }),
                frameRate: 10,
                repeat: 0
            });
        }

        if (!this._config.scene.anims.exists("player-beat-punch")) {
            this._config.scene.anims.create({
                key: "player-beat-punch",
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: [19, 20] }),
                frameRate: 10,
                repeat: 0
            });
        }

        if (!this._config.scene.anims.exists("player-beat-kick")) {
            this._config.scene.anims.create({
                key: "player-beat-kick",
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: [21, 22] }),
                frameRate: 10,
                repeat: 0
            });
        }

        if (!this._config.scene.anims.exists("player-beat-kick-jump")) {
            this._config.scene.anims.create({
                key: "player-beat-kick-jump",
                frames: this._config.scene.anims.generateFrameNumbers(this._config.key, { frames: [23] }),
                frameRate: 15,
                repeat: 0
            });
        }

        this.on(
            Phaser.Animations.Events.ANIMATION_COMPLETE,
            () => {
                let _anim = this.anims.currentAnim.key;
                if (
                    _anim == "player-beat-kick" ||
                    _anim == "player-beat-punch" ||
                    _anim == "player-beat-kick-jump"
                ) {
                    this.setPunching(false);
                }
            },
            this
        );

        this._scene.physics.world.on('worldbounds', () => {

            if (this.isDead() && this._firstBounceDead && this._body.blocked.down) {

                this._firstBounceDead = true;
                this._scene.cameras.main.shake(300, 0.01);
            }
        });


        this.on(
            Phaser.Animations.Events.ANIMATION_UPDATE,
            (
                anim: Phaser.Animations.Animation,
                frame: Phaser.Animations.AnimationFrame,
                sprite: Phaser.GameObjects.Sprite,
                frameKey: string
            ) => {
                if (anim.key === "player-beat-punch" && frame.index === 2) {
                    this.punch();
                } else if (
                    anim.key === "player-beat-kick" && frame.index === 2
                ) {
                    this.kick();
                }
            },
            this
        );


    }

    punch(): void {


        this._scene.addPlayerBeat(
            new BulletBeat({
                scene: this.scene,
                x: this.x + (this._direction === playerDirection.right ? 60 : -70),
                y: this.y + 15,
                key: "circle",
                damage: this._startDamage + this._damage,
                hidden: true,
                bulletData: { from: "player", parentPosition: { x: this.x, y: this.y }, removeAfter: 10 },
            })
        )


    }


    kick(): void {
        this._scene.addPlayerBeat(
            new BulletBeat({
                scene: this.scene,
                x: this.x + (this._direction === playerDirection.right ? 70 : -80),
                y: this.y + 10,
                key: "circle",
                damage: this._startDamage + this._damage,
                hidden: true,
                bulletData: { from: "player", parentPosition: { x: this.x, y: this.y }, removeAfter: 10 },
            })
        )
    }


    initPlayer(): void {

        this._body
            .setMaxVelocity(this._maxSpeed, this._maxSpeed)
            .setBounce(0, 0)
            .setCollideWorldBounds(true, 0, 0, true)
            .setGravityY(1000)
            .setImmovable(false)
            .setSize(60, 160).setOffset(71, 32);


        this.setOrigin(0.5, 0.5);

        this.setJumping(false);
        this.setPunching(false);
        this._body.enable = false;
        this.scene.add.existing(this);

    }

    enterLevel(): void {

        this.activate();
        this.playAnimation("player-beat-idle");
        this.handleInput();
        this._body.enable = true;
    }







    handleKeyboardInput(): void {


        if (this.isBlocked().down) {
            if (this._isJumping) {
                this._scene.playSfx("land", 0.5);
            }
            this._canDoubleJump = true;
            this.setJumping(false);


        }

        //if nothing is pressed stop the player
        if (!this.isLeftInput() && !this.isRightInput() && this.isBlocked().down && !this.isJumping() && !this.isPunching()) {


            this._body.setVelocityX(0);

            if (this._direction === playerDirection.left) {
                this._body.setSize(60, 160).setOffset(61, 32);
            } else {
                this._body.setSize(60, 160).setOffset(71, 32);
            }

            this.playAnimation("player-beat-idle");

        }

        //if left arrow key is pressed down set velocity with drag acceleration
        if (this.isLeftInput() && !this.isPunching()) {
            this._direction = playerDirection.left;
            this._body.setVelocityX(-this.getSpeed())
            this.setFlipX(true);
            this._beatStatus.setFlipX(false);
            if (!this.isJumping()) {
                this._body.setSize(60, 160).setOffset(61, 32);
                this.playAnimation("player-beat-run");
            }
        }

        //if right arrow key is pressed down set velocity with drag acceleration
        if (this.isRightInput() && !this.isPunching()) {
            this._direction = playerDirection.right;
            this._body.setVelocityX(this.getSpeed())
            this.setFlipX(false);
            this._beatStatus.setFlipX(true);
            if (!this.isJumping()) {
                this._body.setSize(60, 160).setOffset(71, 32);
                this.playAnimation("player-beat-run");
            }

        }

        //if up arrow key is pressed down then jump
        if ((this.isBlocked().down && this.isJumpInput()) && !this.isPunching()) {

            this.setJumping(true);
            if (this._direction === playerDirection.right) {
                this._body.setVelocityY(-this.getSpeed() * 2).setSize(60, 140).setOffset(71, 52);
            } else {
                this._body.setVelocityY(-this.getSpeed() * 2).setSize(60, 140).setOffset(61, 52);
            }
            this._scene.playSfx("jump", 0.5);
            this.playAnimation("player-beat-jump");

        }

        // double jump
        if (!this.isBlocked().down && this.isJumpInput() && this._canDoubleJump) {
            this._canDoubleJump = false;
            this.setJumping(true);
            if (this._direction === playerDirection.right) {
                this._body.setVelocityY(-this.getSpeed() * 2).setSize(60, 140).setOffset(71, 52);
            } else {
                this._body.setVelocityY(-this.getSpeed() * 2).setSize(60, 140).setOffset(61, 52);
            }
            this._scene.playSfx("jump", 0.5);
            this.playAnimation("player-beat-jump");
        }

        //if space key is pressed down then punch
        if (this.isAttackInput() && !this.isPunching() && !this.isJumping() && this.canBeat()) {

            this.setPunching(true);
            this._body.setVelocityX(0);


            if (Phaser.Math.RND.between(0, 1)) {
                this._scene.playSfx("punch1", 0.5);
                this.playAnimation("player-beat-kick");
            } else {
                this._scene.playSfx("punch2", 0.5);
                this.playAnimation("player-beat-punch");
            }

        }

        /* 
        if (this._body.velocity.y > 0 && !this.isJumping() && !this.isPunching()) {
             //this.setJumping(true);
             this.playAnimation("player-beat-jump");
         }
 
           if (this._SPACE.isDown && this.isJumping()) {
               console.log("kick jump");
               this.setPunching(true);
               this.playAnimation("player-beat-kick-jump");
           }
         */

        this._inputJump = false;
        this._inputAttack = false;

    }

    update(time: number, delta: number): void {

        if (this._isActivated && !this.isHitted() && !this.isDead()) {
            this.handleKeyboardInput();
            if (this._isJumping) {
                this._beatStatus.setPosition(this.x, this.y - 80);
            } else {
                this._beatStatus.setPosition(this.x, this.y - 100);
            }


        } else if (this.isBlocked().down && !this.isHitted() && !this.isDead()) {
            this._body.setVelocity(0, 0);

            this.playAnimation("player-beat-idle");
        }

    }

    stopAction(params: any): void {

        this.deactivateInvulnerability();
        this.deactivate();
        //this._body.enable = false;
        this._body.setVelocity(0, 0);
        if (!this.isDead()) { this.playAnimation("player-beat-idle"); }

    }

    startDialog(): void {

        this.deactivate();
        this._body.setVelocityX(0);
        this.play("player-beat-idle");

    }

    endDialog(): void {

        this.activate();
    }

    hitToDeath(damage: number, hitFrom: hitDirection, x: number, y: number, hitType: hitTypes): void {

        if (this.isDead() || this.isHitted()) return;

        console.log("player hit to death");


        switch (hitType) {

            case hitTypes.punchOrKick:
                this._scene.playSfx(Phaser.Math.RND.pick(["hit0", "hit1", "hit2", "hit3", "hit4"]), 0.5);
                break;
            case hitTypes.superPower1:

                break;
            case hitTypes.superPower2:

                this._scene.playSfx(Phaser.Math.RND.pick(["hit0", "hit1", "hit2", "hit3", "hit4"]), 0.5);
                break;
            case hitTypes.superPower3:

                this._scene.playSfx(Phaser.Math.RND.pick(["hit0", "hit1", "hit2", "hit3", "hit4"]), 0.5);
                break;
        }

        this._scene.playSfx(Phaser.Math.RND.pick(["death0", "death1", "death2"]), 0.5);

        this.setDead(true);
        let angle: number = 90;
        let velX: number = 400;
        this._body.setVelocityY(-250);
        this._body.setCollideWorldBounds(true, 0, .5, true);
        this._body.setSize(50, 50);

        let _velX: number = 0;
        let _angle: number = 0;

        if (hitFrom === null) {
            if (this.x < x) { hitFrom = hitDirection.right; } else { hitFrom = hitDirection.left; }
        }

        //enemy-> <-player
        if (hitFrom === hitDirection.left && this._direction === playerDirection.left) {

            _velX = velX;
            _angle = angle;

        }

        // player-> <-enemy
        else if (hitFrom === hitDirection.right && this._direction === playerDirection.right) {

            _velX = -velX;
            _angle = -angle;
        }
        // enemy--> player-->
        else if (hitFrom === hitDirection.left && this._direction === playerDirection.right) {
            this.setFlipX(true);
            _velX = velX;
            _angle = angle;

        }
        // <--player <--enemy
        else if (hitFrom === hitDirection.right && this._direction === playerDirection.left) {

            this.setFlipX(false);
            _velX = -velX;
            _angle = -angle;

        }

        this._scene.tweens.add({
            targets: this,
            angle: _angle,
            duration: 500,
            ease: "Power2",
            yoyo: false,
            repeat: 0
        });

        this._scene.tweens.addCounter({
            from: _velX,
            to: 0,
            duration: 3000,
            ease: Phaser.Math.Easing.Sine.Out,
            yoyo: false,
            repeat: 0,
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                this._body.setVelocityX(tween.getValue());
            },
            onComplete: () => {
                this._body.setVelocityX(0);
                this._body.enable = false;
                this._scene.setPlayerBeated(true);
            }
        });

        this.play("player-beat-dead").setDepth(10);

    }

    getPlayerDirection(): playerDirection {
        return this._direction;
    }

    hit(damage: number, hitFrom: hitDirection, x: number, y: number, hitType: hitTypes): void {

        if (this.isDead() || this.isHitted()) return;
        switch (hitType) {

            case hitTypes.punchOrKick:
                this._scene.playSfx(Phaser.Math.RND.pick(["hit0", "hit1", "hit2", "hit3", "hit4"]), 0.5);
                this._scene.playSfx(Phaser.Math.RND.pick(["ouch0", "ouch1", "ouch2"]), 0.5);
                break;
            case hitTypes.superPower1:
                this._scene.playSfx(Phaser.Math.RND.pick(["ouch0", "ouch1", "ouch2"]), 0.5);
                break;
            case hitTypes.superPower2:

                this._scene.playSfx(Phaser.Math.RND.pick(["hit0", "hit1", "hit2", "hit3", "hit4"]), 0.5);
                this._scene.playSfx(Phaser.Math.RND.pick(["ouch0", "ouch1", "ouch2"]), 0.5);
                break;
            case hitTypes.superPower3:

                this._scene.playSfx(Phaser.Math.RND.pick(["hit0", "hit1", "hit2", "hit3", "hit4"]), 0.5);
                this._scene.playSfx(Phaser.Math.RND.pick(["ouch0", "ouch1", "ouch2"]), 0.5);
                break;
        }


        this.setInvulnerability(2000);


        this.setPunching(false);
        this.setHitted(true);
        this._body.setVelocityX(0);

        let _velocityX: number = 0;
        let _hitBackString: number;


        //Player-> <-Enemy
        if (hitFrom === hitDirection.left && this._direction === playerDirection.left) {
            this.play("player-beat-hit-front");
            _hitBackString = 300;

        }

        // Enemy-> <-Player
        else if (hitFrom === hitDirection.right && this._direction === playerDirection.right) {

            this.play("player-beat-hit-front");

            _hitBackString = -300;
        }
        // <-Enemy <-Player
        else if (hitFrom === hitDirection.left && this._direction === playerDirection.right) {
            this.play("player-beat-hit-back");

            _hitBackString = 300;


        }
        // Player-> Enemy->
        else if (hitFrom === hitDirection.right && this._direction === playerDirection.left) {
            this.play("player-beat-hit-back");

            _hitBackString = -300;


        } else {
            _hitBackString = 0;
        }


        if (_hitBackString !== 0) {
            this._body.setVelocityX(_hitBackString);

            this._scene.time.addEvent({
                delay: 500,
                callback: () => {
                    this.setHitted(false);
                },
                callbackScope: this
            });


        } else {
            this.setHitted(false);
        }

    }

    increaseSpeed(value: number): void {
        this._speed += value;
        if (this._speed > this._maxSpeed) this._speed = this._maxSpeed;
    }

    increaseDamage(value: number): void {
        this._damage += value;
        if (this._damage > this._maxDamage) this._damage = this._maxDamage;
    }

 

    isRage(): boolean {
        return this._isRage;
    }

    setRage(value: boolean): void {
        this._isRage = value;
    }

    startRage(): void {

        this.setRage(true);
        this.setBeat(true);

    }

    endRage(): void {
        this.setRage(false);
        this.setBeat(false);
       
    }

    canBeat(): boolean {
        return this._canBeat;
    }

    setBeat(value: boolean, fromBonus: boolean = false): void {
        this._canBeat = value;
        if(value){
            this._beatStatus.setActive(true).setVisible(true);
        }
        else{
            this._beatStatus.setActive(false).setVisible(false);
        }   
       
    }

    isLeftInput(): boolean {
        if (this._LEFT.isDown || this._inputDirection === playerDirection.left) {
            return true;
        } else {
            return false;
        }
    }

    isRightInput(): boolean {
        if (this._RIGHT.isDown || this._inputDirection === playerDirection.right) {
            return true;
        } else {
            return false;
        }
    }

    isAttackInput(): boolean {
        if (Phaser.Input.Keyboard.JustDown(this._SPACE) || this._inputAttack) {
            return true;
        } else {
            return false;
        }
    }

    isJumpInput(): boolean {

        if (Phaser.Input.Keyboard.JustDown(this._UP) || this._inputJump) {
            return true;
        } else {
            return false;
        }
    }


    setInputDirection(direction: string): void {


        if (direction === "left") {
            this._inputDirection = playerDirection.left;
        } else if (direction === "right") {
            this._inputDirection = playerDirection.right;
        } else {
            this._inputDirection = playerDirection.none;
        }

    }
    setInputJump(value: boolean): void {

        this._inputJump = value;
    }

    setInputAttack(value: boolean): void {

        this._inputAttack = value;
    }



}


