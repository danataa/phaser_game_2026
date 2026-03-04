class Tomato extends Phaser.GameObjects.Sprite {

   private jumping: boolean;
    private prevMov: string;
    private hitDelay: boolean;
    private cursor: Phaser.Types.Input.Keyboard.CursorKeys;
    private life: number;
    private _body: Phaser.Physics.Arcade.Body;


    constructor(config:any) {
        super(config.scene, config.x, config.y, 'tomato');

        this.scene = config.scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        this.setScale(2);
        this._body = this.body as Phaser.Physics.Arcade.Body;

        this._body.setSize(14, 20);
        this._body.setOffset(2, 5);
        this._body.setBounce(0.2);

        this.jumping = false;

        this.anims.play('tomato_idle');
        this.prevMov = 'tomato_idle';

        this.hitDelay = false;

        this.cursor = this.scene.input.keyboard.createCursorKeys();

        this.life = 3;

    }

    update() {
        if(this.cursor.left.isDown) {
            this._body.setVelocityX(-200);
            this.flipX = true;
            if(this.prevMov !== 'left' && !this.jumping) {
                this.prevMov = 'left';
                this.anims.play('tomato_walk');
            }
        } else if(this.cursor.right.isDown) {
            this._body.setVelocityX(200);
            this.flipX = false;
            if(this.prevMov !== 'right' && !this.jumping) {
                this.prevMov = 'right';
                this.anims.play('tomato_walk');
            }

        } else if(this.cursor.down.isDown && !this.jumping) {
            this._body.setVelocityX(0);
            this._body.setSize(14, 15);
            this._body.setOffset(2, 10);

            if(this.prevMov !== 'down' && !this.jumping) {
                this.prevMov = 'down';
                this.anims.play('tomato_down');
            }

        }
        else {
            this._body.setVelocityX(0);
            this._body.setSize(14, 20);
            this._body.setOffset(2, 5);
            if(this.prevMov !== 'tomato_idle' && !this.jumping) {
                this.prevMov = 'tomato_idle';
                this.anims.play('tomato_idle');
            }
        }

        if(Phaser.Input.Keyboard.JustDown(this.cursor.up) && !this.jumping) {
            this.jumping = true;
            this._body.setVelocityY(-800);
            if(this.prevMov !== 'jump') {
                this.prevMov = 'jump';
                this.anims.play('tomato_jump');
            }
        } else if(this._body.blocked.down) {
            this.jumping = false;
        }
    }

    bombCollision() {
        if(!this.hitDelay) {
            this.hitDelay = true;

            this.scene.sound.play('draw');
            this.life--;
            this.scene.registry.events.emit('remove_life');

            if(this.life === 0) {
                this.scene.registry.events.emit('game_over');
            }

            this.setTint(0x1abc9c);
            this.scene.time.addEvent({
                delay: 600,
                callback: () => {
                    this.hitDelay = false;
                    this.clearTint();
                }
            });
        }
    }
}

export default Tomato;