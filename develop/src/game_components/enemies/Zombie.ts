import Enemy from "../Enemy";

// Nemico di tipo zombie 
export default class Zombie extends Enemy {
    private _canAttack: boolean = true;
    private _isAttacking: boolean = false;
    private _attackDelay: number = 800;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "zombie_idle");

        // Valori specifici dello zombie: danno, velocità e HP
        this.setDamage(20);
        this.setSpeed(380);
        this.setHp(50);

        // Crea le animazioni 
        this._createAnimations();

        // Hitbox modellata per collisioni più precise
        this.setScale(1.5);
        this.body.setSize(40, 65).setOffset(44, 63); 
    }

    private _createAnimations(): void {
            this.anims.create({
                key: "idle",
                frames: this.anims.generateFrameNumbers("zombie_idle", { start: 0, end: 5 }),
                frameRate: 6,
                repeat: -1,
            });

            this.anims.create({
                key: "walk",
                frames: this.anims.generateFrameNumbers("zombie_walk", { start: 0, end: 9 }),
                frameRate: 12,
                repeat: -1,
            });

            this.anims.create({
                key: "attack",
                frames: this.anims.generateFrameNumbers("zombie_attack", { start: 0, end: 3 }),
                frameRate: 5,
                repeat: 0,
            });
        }

    // Gestisce l'attacco: infligge danno una volta per ciclo con delay tra un attacco e l'altro
    private _handleAttack(): void {
        if (!this.target) return;

        if (this._canAttack && !this._isAttacking) {
            this._canAttack = false;
            this._isAttacking = true;
            this.anims.play("attack", true);
            
            // Infligge danno al completamento dell'animazione
            this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "attack", () => {
                if (this.target && this.active) {
                    this.target.takeDamage(this.damage);
                }

                // Delay prima di poter attaccare di nuovo
                this.scene.time.delayedCall(this._attackDelay, () => {
                    this._canAttack = true;
                    this._isAttacking = false;
                });
            });
        }
    }

    // Override del metodo update per gestire le animazioni specifiche dello zombie
    update() {
        super.update();
        
        if(this.target && Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 50) {
            // Ferma lo zombie quando è in range d'attacco
            this.setVelocity(0, 0);
            this._handleAttack();
        } else if (!this._isAttacking) {
            // Cambia animazione solo se non stiamo attaccando
            if(this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
                this.anims.play("walk", true);
                if (this.body.velocity.x > 0) {
                    this.setFlipX(false);
                } else if (this.body.velocity.x < 0) {
                    this.setFlipX(true);
                }
            } else {
                this.anims.play("idle", true);
            }
        }
    }
}