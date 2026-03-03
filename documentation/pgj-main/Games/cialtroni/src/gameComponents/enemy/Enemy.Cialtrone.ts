
import IEnemy from "./iEnemy";
import Enemy from "./Enemy";
import { bulletDirection, enemyMovementTypes, enemySprite, hitDirection } from "../../Enums";
import GamePlayBeat from "../../scenes/GamePlayBeat";
import BulletBeat from "../bullets/Bullet.Beat";
import BulletBasic from "../bullets/Bullet.Basic";
import EnergyBar from "../others/EnergyBar";


enum cialtroneState {
    idle = "idle",
    walk = "walk",
    run = "run",
    charge = "charge",
    dead = "dead",

}

enum cialtroneDirection {
    left = "left",
    right = "right"
}


export default class EnemyCialtrone

    extends Enemy
    implements IEnemy {
    _scene: GamePlayBeat;

    private _cialtroni: Array<cialtroneSetup> =

        [

            {
                key: "cialtrone",
                name: "U cafò",
                texture: "player-beat",
                walkSpeed: 50,
                runSpeed: 250,
                turnBackDistance: 400,
                hitBack: 50,
                energyBar: { offset: { x: -30, y: -80 } },
                body: { left: { w: 60, h: 160, ox: 61, oy: 32 }, right: { w: 60, h: 160, ox: 71, oy: 32 } },
                beat: {
                    range: 80, beats: [
                        { index: 2, lx: 20, ly: -25, rx: -20, ry: -25, damage: 50 },
                        { index: 3, lx: -60, ly: 5, rx: 55, ry: 5, damage: 10 },
                        { index: 4, lx: -55, ly: 75, rx: 60, ry: 75, damage: 15 }]
                },
                charge: {
                    range: 200, damage: 20, speed: 800, duration: 2000, pause: 2000, offset: { left: { x: -50, y: 0 }, right: { x: 50, y: 0 } }
                },
                superPower: {
                    range: 400, beforeStart: 200, pause: 2800
                },
                animations: [
                    { key: "idle", frames: [28, 29, 30], frameRate: 5, yoyo: false, repeat: -1 },
                    { key: "walk", frames: [31, 32, 33, 34], frameRate: 5, yoyo: false, repeat: -1 },
                    { key: "run", frames: [35, 36, 37, 42, 43, 44], frameRate: 8, yoyo: false, repeat: -1 },
                    { key: "hit-front", frames: [45], frameRate: 5, yoyo: false, repeat: 0 },
                    { key: "hit-back", frames: [46], frameRate: 5, yoyo: false, repeat: 0 },
                    { key: "beat", frames: [47, 48, 49, 50], frameRate: 10, yoyo: false, repeat: 0 },
                    { key: "dead", frames: [46, 46, 46, 51, 46, 52], frameRate: 5, yoyo: false, repeat: 0 },
                    { key: "idle-shocked", frames: [38, 39, 40, 41], frameRate: 5, yoyo: false, repeat: -1 },
                    { key: "charge", frames: [47, 53, 53, 53, 53, 53, 53, 53, 53, 47], frameRate: 10, yoyo: false, repeat: 0 },
                    { key: "power", frames: [47, 48, 49, 50], frameRate: 5, yoyo: false, repeat: 0 },


                ]
            },
            {
                key: "cialtrone",
                name: "O chiattò",
                texture: "player-beat",
                turnBackDistance: 400,
                walkSpeed: 30,
                runSpeed: 220,
                hitBack: 30,
                energyBar: { offset: { x: -30, y: -80 } },
                body: { left: { w: 60, h: 160, ox: 61, oy: 32 }, right: { w: 60, h: 160, ox: 71, oy: 32 } },
                beat: {
                    range: 50, beats: [{ index: 2, lx: -45, ly: 0, rx: 45, ry: 0, damage: 5 },
                    { index: 3, lx: -45, ly: -20, rx: 45, ry: -20, damage: 10 },
                    { index: 4, lx: -45, ly: -20, rx: 45, ry: -20, damage: 20 }]
                },
                charge: {
                    range: 180, damage: 30, speed: 750, duration: 2000, pause: 2000, offset: { left: { x: -70, y: 0 }, right: { x: 70, y: 0 } }
                },
                superPower: {
                    range: 300, beforeStart: 200, pause: 1000
                },
                animations: [
                    { key: "idle", frames: [56, 57, 58], frameRate: 5, yoyo: false, repeat: -1 },
                    { key: "walk", frames: [59, 60, 61, 62], frameRate: 5, yoyo: false, repeat: -1 },
                    { key: "run", frames: [63, 64, 65, 70, 71, 72], frameRate: 7, yoyo: false, repeat: -1 },
                    { key: "hit-front", frames: [73], frameRate: 5, yoyo: false, repeat: 0 },
                    { key: "hit-back", frames: [74], frameRate: 5, yoyo: false, repeat: 0 },
                    { key: "beat", frames: [75, 76, 77, 78], frameRate: 10, yoyo: false, repeat: 0 },
                    { key: "dead", frames: [74, 74, 74, 79, 74, 80], frameRate: 5, yoyo: false, repeat: 0 },
                    { key: "idle-shocked", frames: [66, 67, 68, 69], frameRate: 5, yoyo: false, repeat: -1 },
                    { key: "charge", frames: [75, 81, 81, 81, 75, 75], frameRate: 5, yoyo: false, repeat: 0 },

                    { key: "power", frames: [75, 76, 77, 78], frameRate: 5, yoyo: false, repeat: 0 },

                ]
            },

            {
                key: "cialtrone",
                name: "U prufessò",
                texture: "player-beat",
                turnBackDistance: 400,
                walkSpeed: 45,
                runSpeed: 210,
                hitBack: 45,
                energyBar: { offset: { x: -30, y: -80 } },
                body: { left: { w: 60, h: 160, ox: 61, oy: 32 }, right: { w: 60, h: 160, ox: 71, oy: 32 } },
                beat: {
                    range: 90, beats: [{ index: 2, lx: 5, ly: 15, rx: 5, ry: 15, damage: 3 },
                    { index: 3, lx: -70, ly: 5, rx: 70, ry: 5, damage: 20 },
                    { index: 4, lx: -15, ly: 0, rx: 15, ry: 0, damage: 7 }]
                },
                charge: {
                    range: 100, damage: 30, speed: 400, duration: 2000, pause: 2000, offset: { left: { x: -70, y: 20 }, right: { x: 70, y: 20 } }
                },
                superPower: {
                    range: 300, beforeStart: 200, pause: 1000
                },
                animations: [
                    { key: "idle", frames: [84, 85, 86], frameRate: 5, yoyo: false, repeat: -1 },
                    { key: "walk", frames: [87, 88, 89, 90], frameRate: 5, yoyo: false, repeat: -1 },
                    { key: "run", frames: [91, 92, 93, 98, 99, 100], frameRate: 8, yoyo: false, repeat: -1 },
                    { key: "hit-front", frames: [101], frameRate: 5, yoyo: false, repeat: 0 },
                    { key: "hit-back", frames: [102], frameRate: 5, yoyo: false, repeat: 0 },
                    { key: "beat", frames: [103, 104, 105, 106], frameRate: 10, yoyo: false, repeat: 0 },
                    { key: "dead", frames: [102, 102, 102, 107, 102, 108], frameRate: 5, yoyo: false, repeat: 0 },
                    { key: "idle-shocked", frames: [66, 67, 68, 69], frameRate: 5, yoyo: false, repeat: -1 },
                    { key: "charge", frames: [103, 109, 109, 109, 109, 109, 109, 109, 109, 103], frameRate: 10, yoyo: false, repeat: 0 },
                    { key: "power", frames: [112, 113, 114, 115, 116], frameRate: 5, yoyo: false, repeat: 0 },
                ]
            }

        ];

    private _firstBounceDead: boolean = false;
    private _turnBackRandom: number = 0;
    private _isRage: boolean = false;
    private _chargeSpeed: number = 0;
    private _chargePause: boolean = false;
    private _chargeTween: Phaser.Tweens.Tween;
    private _chargeBeat: BulletBeat;
    private _isSuperPowerUsed: boolean = false;
    private _cialtrone: cialtroneSetup;
    private _animations: Array<{ key: string, frames: Array<number>, frameRate: number, yoyo: boolean, repeat: number }>;
    private _currentDirection: cialtroneDirection = cialtroneDirection.left;
    private _walkTimer: Phaser.Time.TimerEvent;
    private _walkSpeed: number = 40;
    private _runSpeed: number = 80;
    private _hitBack: number = 40;
    private _stopBeat: boolean = false;
    private _isHitted: boolean;
    private _isRunning: boolean = false;
    private _isWalking: boolean = false;
    private _cialtroneState: cialtroneState = cialtroneState.idle;
    private _playerIsdead: boolean = false;
    private _isMain: boolean = false;
    private _energyBar: EnergyBar;
    private _nextHit: boolean = true;
    private _type: number;

    constructor(params: enemyConfig) {

        super(params);

        this._isMain = params.enemyData.main || false;

        if (this._isMain) {
            this._turnBackRandom = 50;
        } else {
            this._turnBackRandom = Phaser.Math.RND.integerInRange(150, 200);
            this._energyBar = params.enemyData.energyBar;
        }

        this._scene.events.off("start-dialog", this.startDialog, this);
        this._scene.events.on("start-dialog", this.startDialog, this);

        this._scene.events.off("end-dialog", this.endDialog, this);
        this._scene.events.on("end-dialog", this.endDialog, this);
        
        this._scene.events.off("start-enemy-rage", this.startEnemyRage, this);
        this._scene.events.on("start-enemy-rage", this.startEnemyRage, this);

        this._scene.events.off("stop-enemy-rage", this.stopEnemyRage, this);
        this._scene.events.on("stop-enemy-rage", this.stopEnemyRage, this);

       this._scene.events.off("car-hit", this.carHit, this);
        this._scene.events.on("car-hit", this.carHit, this);

        this._scene.events.off("stop-action", this.stopAction, this);
        this._scene.events.on("stop-action", this.stopAction, this);
        
        this._type = <number>params.enemyData.type || 0;
        this._cialtrone = this._cialtroni[this._type];

        this._animations = this._cialtrone.animations;
        this._walkSpeed = this._cialtrone.walkSpeed;
        this._runSpeed = this._cialtrone.runSpeed;
        this._hitBack = this._cialtrone.hitBack;

        this.name = this._cialtrone.key;

        let _addSpeed = params.enemyData.speed || 0;
        if (_addSpeed !== 0) {

            this._walkSpeed += _addSpeed;
            this._runSpeed += (_addSpeed * 2);

        }

        this.setAlpha(1);
        this._body
            .setGravityY(1000)
            .setCollideWorldBounds(true, 0, 0, false)
            .setImmovable(true);


        //creo le animazioni se non sono già state create
        this._animations.forEach(element => {

            //se l'animazione non esiste la creo
            if (!this._scene.anims.exists(this._cialtrone.key + "-" + this._type + "-" + element.key)) {

                // creo l'oggetto animazione
                let _animation: Phaser.Types.Animations.Animation = {
                    key: this._cialtrone.key + "-" + this._type + "-" + element.key,
                    frames: this.anims.generateFrameNumbers(this._cialtrone.texture, { frames: element.frames }),
                    frameRate: element.frameRate,
                    yoyo: element.yoyo,
                    repeat: element.repeat
                };
                // aggiungo l'animazione
                this._scene.anims.create(_animation);
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

                //se l'animazione che si sta riproducendo è quella dell'attacco
                if (anim.key === this._cialtrone.key + "-" + this._type + "-beat") {
                    //cicla tutti i frame di attacco per vedere se quello corrente è un frame di attacco
                    this._cialtrone.beat.beats.forEach(beat => {
                        if (beat.index === frame.index) {
                            //se siamo in un frame di attacco eseguiamo il colpo
                            this.beat(beat);
                        }
                    });
                }

            },
            this
        );

        this.on(
            Phaser.Animations.Events.ANIMATION_COMPLETE,
            (
                anim: Phaser.Animations.Animation,
                frame: Phaser.Animations.AnimationFrame,
                sprite: Phaser.GameObjects.Sprite,
                frameKey: string
            ) => {


                //se l'animazione che si è conclusa è quella dell'attacco    
                if (anim.key === this._cialtrone.key + "-" + this._type + "-beat") {

                    if (this._scene.getPlayer().isDead()) {

                        this._playerIsdead = true;

                    } else {

                        if (this.isRage()) {
                            this._scene.cameras.main.shake(300, 0.01);
                        }

                        this.changeCialtroneDirection(this.playerDirection());
                    }

                }

            },
            this
        );

        this.play(this._cialtrone.key + "-" + this._type + "-" + "idle", true);

        this.changeCialtroneDirection(this.playerDirection());

    }

    stopAction(params: any): void {

        this.setActivated(false);
        this._cialtroneState = cialtroneState.idle;
        this._body.setVelocityX(0);
        if (!this.isDead()) { this.play(this._cialtrone.key + "-" + this._type + "-" + "idle", true); }

    }




    startEnemyRage(): void {

        if (this._isMain) {
            this.setRage(true);
        }

    }

    stopEnemyRage(): void {
        if (this._isMain) {
            this.setRage(false);
            this._isSuperPowerUsed = false;
        }
    }

    playerDirection(): cialtroneDirection {

        return this._scene.playerPosition().x < this.x ? cialtroneDirection.left : cialtroneDirection.right;

    }

    carHit(): void {

        //se non è il cialtrone principale o è morto non facciamo nulla se la macchina viene colpita
        if (!this.isMainEnemy() || this.isDead()) return;

       

        let _playerPosition: { x: number, y: number } = this._scene.playerPosition();

        //Controllo se il player è a sinistra o a destra del cialtrone
        if (_playerPosition.x < this.x) {
            this.changeCialtroneDirection(cialtroneDirection.left);

            // Il player è a sinistra del cialtrone
        } else {
            this.changeCialtroneDirection(cialtroneDirection.right);

            // Il player è a destra del cialtrone
        }
        this.startRun();

    }

    startRun(): void {
        if (!this.isDead() && !this.isCharging() && !this.isSuperPower()) {
            this._cialtroneState = cialtroneState.run;
            this._isRunning = true;
            this._isWalking = false;
            this._body.setVelocityX(this._currentDirection === cialtroneDirection.left ? -this._runSpeed : this._runSpeed);
            this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "run", randomFrame: true }, true);

        }

    }

    startWalk(): void {
        if (this.isDead() && this.isCharging() && this.isSuperPower()) return;
        if (this.isRage()) {
            this.startRun();

        } else {
            this._cialtroneState = cialtroneState.walk;
            this._isRunning = false;
            this._isWalking = true;
            this._body.setVelocityX(this._currentDirection === cialtroneDirection.left ? -this._walkSpeed : this._walkSpeed);
            this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "walk", randomFrame: true }, true);
        }

    }

    beat(beat: { index: number, lx: number, ly: number, rx: number, ry: number, damage: number }): void {



        if (this.isDead()) return;
        let _ox, _oy: number = 0;
        if (this._currentDirection === cialtroneDirection.left) {
            _ox = beat.lx;
            _oy = beat.ly;

        } else {
            _ox = beat.rx;
            _oy = beat.ry;
        }

        this._scene.addToBulletGroup(
            new BulletBeat({
                scene: this.scene,
                x: this.x + _ox,
                y: this.y + _oy,
                key: "circle",
                damage: beat.damage,
                hidden: true,
                bulletData: { from: "cialtrone", parentPosition: { x: this.x, y: this.y }, removeAfter: 10 },


            })
        )
    }

    hitPlayer(): void {

        this._scene.playSfx("punch1", 0.5);
        this._body.setVelocityX(0);
        this.play(this._cialtrone.key + "-" + this._type + "-" + "beat");
    }

    changeCialtroneDirection(direction: cialtroneDirection, callback?: () => void): void {


        if (this.isDead()) return;

        if (direction !== undefined) {
            if (direction === cialtroneDirection.left) {
                this.setFlipX(true);
            } else {
                this.setFlipX(false);
            }

            this._currentDirection = direction;



        } else {
            this.setFlipX(!this.flipX);
            this._currentDirection = this.flipX ? cialtroneDirection.left : cialtroneDirection.right;
        }


        if (this.flipX) {
            this._currentDirection = cialtroneDirection.left;
            this.setFlipX(true);
            this._body.setSize(this._cialtrone.body.left.w, this._cialtrone.body.left.h).setOffset(this._cialtrone.body.left.ox, this._cialtrone.body.left.oy)
        } else {
            this._currentDirection = cialtroneDirection.right;
            this.setFlipX(false);
            this._body.setSize(this._cialtrone.body.right.w, this._cialtrone.body.right.h).setOffset(this._cialtrone.body.right.ox, this._cialtrone.body.right.oy)
        }

        if (callback !== undefined) {
            callback();
        } else if (this._isWalking && !callback) {
            this.startWalk();
        } else if (this._isRunning && !callback) {
            this.startRun();
        }
    }

    getEnergyBar(): EnergyBar {
        return this._energyBar;
    }

    hit(damage: number, hitFrom: hitDirection, x: number, y: number): void {

        if (this.isDead() || !this.isActivated()) return;

        this._scene.playSfx(Phaser.Math.RND.pick(["hit0", "hit1", "hit2", "hit3", "hit4"]), 0.5);

        this.setTintFill(0xffffff);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        }, [], this);

        this._isHitted = true;
        if (this._walkTimer !== undefined) { this._walkTimer.remove(); }

        this._body.setVelocityX(0);

        let _velocityX: number = 0;
        let _hitBackString: string = "";
        let _changeDirection: boolean = false;

        //Player-> <-Enemy
        if (hitFrom === hitDirection.left && this._currentDirection === cialtroneDirection.left) {
            this.play(this._cialtrone.key + "-" + this._type + "-" + "hit-front");
            _velocityX = -this._walkSpeed;
            _hitBackString = "+=" + this._hitBack;

        }
        // Enemy-> <-Player
        else if (hitFrom === hitDirection.right && this._currentDirection === cialtroneDirection.right) {

            this.play(this._cialtrone.key + "-" + this._type + "-" + "hit-front");
            _velocityX = this._walkSpeed;
            _hitBackString = "-=" + this._hitBack;
        }
        // <-Enemy <-Player
        else if (hitFrom === hitDirection.left && this._currentDirection === cialtroneDirection.right) {
            this.play(this._cialtrone.key + "-" + this._type + "-" + "hit-back");
            _velocityX = this._walkSpeed;
            _hitBackString = "+=" + this._hitBack;
            _changeDirection = true;

        }
        // Player-> Enemy->
        else if (hitFrom === hitDirection.right && this._currentDirection === cialtroneDirection.left) {
            this.play(this._cialtrone.key + "-" + this._type + "-" + "hit-back");
            _velocityX = -this._walkSpeed;
            _hitBackString = "-=" + this._hitBack;
            _changeDirection = true;

        }

        this.scene.tweens.add({
            targets: this,
            x: _hitBackString,
            duration: 200,
            ease: Phaser.Math.Easing.Sine.Out,
            onComplete: () => {
                if (this.isDead() || !this.isActivated()) return;
                this._isHitted = false;
                this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "idle", randomFrame: true });
                this._walkTimer = this.scene.time.delayedCall(500, () => {

                    this.changeCialtroneDirection(this.playerDirection(), () => {
                        this.startRun();
                    });

                });
            }
        });


    }

    hitToDeath(damage: number, hitFrom: hitDirection, x: number, y: number): void {


        if (this.isDead()) return;

        this._scene.playSfx(Phaser.Math.RND.pick(["hit0", "hit1", "hit2", "hit3", "hit4"]), 0.5);

        if (this._energyBar !== undefined) {
            this._energyBar.destroy();

        }

        this._scene.playSfx(Phaser.Math.RND.pick(["death0", "death1", "death2"]), 0.5);



        this.setDead(true);


        let angle: number = 90;
        let velX: number = 600;
        this._body.setVelocityY(-250);

        this._body.setSize(50, 50);

        let _velX: number = 0;
        let _angle: number = 0;
        //enemy-> <-player
        if (hitFrom === hitDirection.left && this._currentDirection === cialtroneDirection.left) {

            _velX = velX;
            _angle = angle;

        }

        // player-> <-enemy
        else if (hitFrom === hitDirection.right && this._currentDirection === cialtroneDirection.right) {

            _velX = -velX;
            _angle = -angle;
        }
        // enemy--> player-->
        else if (hitFrom === hitDirection.left && this._currentDirection === cialtroneDirection.right) {
            this.setFlipX(true);
            _velX = velX;
            _angle = angle;

        }
        // <--player <--enemy
        else if (hitFrom === hitDirection.right && this._currentDirection === cialtroneDirection.left) {

            this.setFlipX(false);
            _velX = -velX;
            _angle = -angle;

        }

        this._scene.tweens.add({
            targets: this,
            angle: _angle,
            duration: 250,
            ease: "Power2",
            yoyo: false,
            repeat: 0,
            onComplete: () => {

                this._body.setCollideWorldBounds(true, 0, 0.5, true);
                this._scene.physics.world.on('worldbounds', () => {

                    if (this.isDead() && !this._firstBounceDead && this._body.blocked.down) {

                        this._firstBounceDead = true;
                        this._scene.cameras.main.shake(300, 0.01);
                    }
                });
            }
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
                this._scene.setEnemyBeated(true);
            }
        });

        this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "dead", randomFrame: false });

    }

    isRage(): boolean {
        return this._isRage;
    }

    setRage(value: boolean): void {
        this._isRage = value;
    }

    update(time: number, delta: number): void {

        //se il cialtrone ha la barra della vita la aggiorniamo con la posizione corrente del cialtrone
        if (this._energyBar !== undefined) {
            this._energyBar.updatePosition(this.x + this._cialtrone.energyBar.offset.x, this.y + this._cialtrone.energyBar.offset.y, this.depth);
        }

        //se il cialtrone è morto o non è attivo non deve effettuare nessuna atività
        if (this.isDead() || !this.isActivated()) return;

        //recuperiamo la posizione del player dalla scena 
        let _playerPosition = this._scene.playerPosition();

        //calcola la distanza sull'asse x tra il cialtrone e il player
        let _distance = Phaser.Math.Distance.Between(this.x, 0, _playerPosition.x, 0);

        // se il player è morto il cialtrone si ferma
        if (this._playerIsdead) {

            this._body.setVelocityX(0);
            this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "idle", randomFrame: true }, true);

        } else
        // se il player NON è morto il cialtrone fa altro
        {

            //se il cialtrone è in modalità furia
            //-------------------------------------------------------
            if (this.isRage()) {

                //se arriva al termine dell'area di gioco a sinistra o a destra cambia direzione
                if (this.checkIfBlocked()) {

                    this.changeCialtroneDirection(this.playerDirection());

                }
                else if (this.checkIfBlocked() && this.isCharging()) {

                    this.stopCharging();

                }
                //se il corpo non è bloccato
                //facciamo un pò di controlli prima di verificare che sia possibile caricare il player
                else if (this.checkCanCharge(_distance)) {
                    //Controllo se il player è a sinistra o a destra del cialtrone e asegno la velocità della carica
                    this._chargeSpeed = _playerPosition.x < this.x ? -this._cialtrone.charge.speed : this._cialtrone.charge.speed;
                    //proviamo a caricare il player
                    this.charge();

                }
                //facciamo un pò di controlli prima di verificare che sia possibile usare il superpotere del cialtrone
                else if (this.checkCanSuperPower(_distance)) {
                    this.changeCialtroneDirection(this.playerDirection(), () => { });
                    this.superPowerAction();

                }
                //se la distanza è maggiore della distanza di ritorno e il cialtrone non è rivolto verso il player il cialtrone deve girarsi e tornare indietro
                else if (this.checkTurnback(_distance, _playerPosition)) {
                    this.changeCialtroneDirection(this.playerDirection());

                }


            }
            //se il cialtrone NON è in modalità furia
            //-------------------------------------------------------
            else {

                //se arriva al termine dell'area di gioco a sinistra o a destra cambia direzione
                if (this.checkIfBlocked()) {

                    this.changeCialtroneDirection(this.playerDirection());

                }
                //se il corpo non è bloccato e la distanza è minore della distanza di attacco e il cialtrone non è già in modalità attacco
                else if (this.checkCanHit(_distance)) {

                    this.changeCialtroneDirection(this.playerDirection(), () => { });
                    //colpiamo il player
                    this.hitPlayer();
                    this._nextHit = false;
                    //evitiamo che il cialtrone possa colpire di nuovo per un certo periodo
                    this._scene.time.delayedCall(2000, () => {
                        this._nextHit = true;
                    });
                }

                //se la distanza è maggiore della distanza di ritorno e il cialtrone non è rivolto verso il player il cialtrone deve girarsi e tornare indietro
                else if (this.checkTurnback(_distance, _playerPosition)) {
                    this.changeCialtroneDirection(this.playerDirection());

                }


            }

        }


    }


    checkCanHit(_distance: number): boolean {

        if (
            _distance < this._cialtrone.beat.range &&
            this.anims.currentAnim.key !== this._cialtrone.key + "-" + this._type + "-beat" &&
            !this._isHitted &&
            !this._scene.getPlayer().isInvulnerable() &&
            !this._scene.getPlayer().isDead() &&
            !this.isCharging() &&
            !this.isSuperPower() &&
            !this.checkIfBlocked() &&
            this._nextHit
        ) {
            return true;
        }
        return false;
    }

    checkCanCharge(_distance: number): boolean {
        if (
            _distance < this._cialtrone.charge.range &&
            this.anims.currentAnim.key !== this._cialtrone.key + "-" + this._type + "-charge" &&
            !this._isHitted &&
            !this._chargePause &&
            !this._scene.getPlayer().isInvulnerable() &&
            !this._scene.getPlayer().isDead() &&
            !this.isCharging() &&
            !this.checkIfBlocked() &&
            !this.isSuperPower()
        ) {
            return true;
        }
        return false;
    }

    checkCanSuperPower(_distance: number): boolean {
        if (
            _distance > this._cialtrone.charge.range &&
            _distance < this._cialtrone.superPower.range &&
            this.anims.currentAnim.key !== this._cialtrone.key + "-" + this._type + "-power" &&
            !this._isHitted &&
            !this._scene.getPlayer().isInvulnerable() &&
            !this._scene.getPlayer().isDead() &&
            !this._isSuperPowerUsed &&
            !this.isCharging() &&
            !this.checkIfBlocked() &&
            !this.isSuperPower()
        ) {
            return true;
        }
        return false;
    }


    checkTurnback(_distance: number, _playerPosition: { x: number; y: number; }): boolean {

        if (
            _distance > (this._cialtrone.turnBackDistance / 2) + this._turnBackRandom &&
            !this.isCharging() &&
            !this.isSuperPower() &&
            !this.checkIfBlocked() &&
            ((_playerPosition.x < this.x && this._currentDirection === cialtroneDirection.right) || (_playerPosition.x > this.x && this._currentDirection === cialtroneDirection.left))
        ) {
            return true;
        }

        return false;
    }

    checkIfBlocked(): boolean {

        if (this._body.blocked.left || this._body.blocked.right) return true;
        return false;

    }

    superPowerAction(): void {

        this.setSuperPower(true);
        this._isSuperPowerUsed = true;

        switch (this._config.enemyData.type) {
            case 0: //cafò
                this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "idle", randomFrame: true });
                this._body.setVelocityX(0);

                this._scene.time.delayedCall(this._cialtrone.superPower.beforeStart, () => {

                    this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "power", randomFrame: false }, true);
                    this._scene.time.delayedCall(700, () => {
                        this.superPower1();
                        this._scene.cameras.main.shake(300, 0.01);
                    });
                    this._scene.time.delayedCall(this._cialtrone.superPower.pause, () => {
                        this.setSuperPower(false)
                        this.changeCialtroneDirection(this.playerDirection());
                    });

                });
                break;
            case 1: //chiattò

                this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "idle", randomFrame: true });
                this._body.setVelocityX(0);
                this._scene.time.delayedCall(this._cialtrone.superPower.beforeStart, () => {

                    this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "power", randomFrame: false }, true);
                    this._scene.time.delayedCall(400, () => {
                        this.superPower2();

                    });
                    this._scene.time.delayedCall(this._cialtrone.superPower.pause, () => {
                        this.setSuperPower(false)
                        this.changeCialtroneDirection(this.playerDirection());
                    });

                });

                break;
            case 2: //prufessò
                this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "idle", randomFrame: true });
                this._body.setVelocityX(0);
                this._scene.time.delayedCall(this._cialtrone.superPower.beforeStart, () => {

                    this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "power", randomFrame: false }, true);
                    this._scene.time.delayedCall(700, () => {
                        this.superPower3();
                        this._scene.cameras.main.shake(300, 0.01);
                    });
                    this._scene.time.delayedCall(this._cialtrone.superPower.pause, () => {
                        this.setSuperPower(false)
                        this.changeCialtroneDirection(this.playerDirection());
                    });

                });
                break;
        }

    }

    superPower1(): void {
        this._scene.superPower1(this.x)
    }

    superPower2(): void {
        this._scene.superPower2(this.x)
    }

    superPower3(): void {
        this._scene.superPower3(this.x)
    }

    stopCharging() {

        this.setCharging(false);
        if (this._chargeTween) {
            this._chargeTween.stop();
            this._chargeTween = null;
        }
        this._chargePause = true;
        this.changeCialtroneDirection(this.playerDirection());
        this._scene.time.delayedCall(this._cialtrone.charge.pause, () => {
            this._chargePause = false;

        });


    }

    charge(): void {
        this._cialtroneState = cialtroneState.charge;
        this.setCharging(true);
        this.changeCialtroneDirection(this.playerDirection(), () => { });
        this._body.setVelocityX(0).setVelocityY(-400);
        this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "charge" }, true);

        this._chargeBeat = new BulletBeat({
            scene: this.scene,
            x: this.x,
            y: this.y,
            key: "circle",
            hidden: true,
            damage: this._cialtrone.charge.damage,
            bulletData: { from: "cialtrone", parentPosition: { x: this.x, y: this.y }, parent: this, removeAfter: 1000, chargeDirection: this._currentDirection, offset: this._cialtrone.charge.offset },


        })
        this._scene.addToBulletGroup(this._chargeBeat);

        this._chargeTween = this._scene.tweens.addCounter({
            from: 1,
            to: 0,
            duration: this._cialtrone.charge.duration,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: (tween) => {

                this._body.setVelocityX(this._chargeSpeed * tween.getValue());

            },
            onComplete: () => {
                this.stopCharging();
            }
        });

    }

    startDialog(): void {

        this._body.setVelocityX(0);
        this.play({ key: this._cialtrone.key + "-" + this._type + "-" + "idle", randomFrame: true });

    }

    endDialog(): void {

        this.changeCialtroneDirection(cialtroneDirection.left);
        this.changeCialtroneDirection(this.playerDirection(), () => { this.startWalk(); });

    }

    isMainEnemy(): boolean {
        return this._isMain;
    }

    isAlive(): boolean {
        return !this.isDead();
    }


}