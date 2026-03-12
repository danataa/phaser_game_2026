import Enemy from "../Enemy";
import Player from "../Player";
import Fireball from "../Fireball";

// Nemico di tipo demon che attacca a distanza con fireball
export default class Demon extends Enemy {
    private _fireRate: number = 3000;
    private _fireTimer: Phaser.Time.TimerEvent | null = null;
    private _isAttacking: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Player) {
        super(scene, x, y, "demon_idle", target);

        // Valori specifici del demon: danno, velocità e HP
        this.setDamage(30);
        this.setSpeed(350);
        this.setHp(80);
        this._soulsValue = 20;

        // Crea le animazioni 
        this._createAnimations();

        // Hitbox modellata per collisioni più precise
        this.setScale(1.5);
        this.body.setSize(40, 65).setOffset(44, 63); 

        // Crea il timer ciclico per sparare fireball
        this.create();
    }

    private _createAnimations(): void {
        if (!this.anims.exists("demon_idle")) {
            this.anims.create({
                key: "demon_idle",
                frames: this.anims.generateFrameNumbers("demon_idle", { start: 0, end: 5 }),
                frameRate: 6,
                repeat: -1,
            });
        }

        if (!this.anims.exists("demon_walk")) {
            this.anims.create({
                key: "demon_walk",
                frames: this.anims.generateFrameNumbers("demon_walk", { start: 0, end: 7 }),
                frameRate: 12,
                repeat: -1,
            });
        }

        if (!this.anims.exists("demon_attack")) {
            this.anims.create({
                key: "demon_attack",
                frames: this.anims.generateFrameNumbers("demon_attack", { start: 0, end: 6 }),
                frameRate: 8,
                repeat: 0,
            });
        }

        if (!this.anims.exists("demon-death")) {
            this.anims.create({
                key: "demon-death",
                frames: this.anims.generateFrameNumbers("demon_dead", { start: 0, end: 9 }),
                frameRate: 8,
                repeat: 0,
            });
        }
    }

    // Crea il timer ciclico per sparare
    private create(): void {
        this._fireTimer = this.scene.time.addEvent({
            delay: this._fireRate,
            callback: this.shootFireball,
            callbackScope: this,
            loop: true
        });
    }

    // Spara una fireball verso il player se il demon è vivo
    private shootFireball(): void {
        if (this._isDead || !this.target || !this.active || this._isAttacking) return;

        // Riproduce prima l'animazione di attacco, poi spara al termine.
        this._isAttacking = true;
        this.anims.play("demon_attack", true);
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "demon_attack", () => {
            if (!this.active || this._isDead || !this.target) {
                this._isAttacking = false;
                return;
            }

            // Calcola l'angolo verso il player
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x + 16, this.target.y + 50);
            const collidableLayers = this._mapManager ? this._mapManager.collidableLayers : [];

            // Crea la fireball alla posizione del demon
            const fireball = new Fireball(this.scene, this.x, this.y, this.target, collidableLayers);

            // Lancia la fireball verso il player usando velocityFromRotation
            const velocity = 500;
            this.scene.physics.velocityFromRotation(angle, velocity, fireball.body.velocity);

            // Ruota visivamente la fireball nella direzione di movimento
            fireball.setRotation(angle);

            this._isAttacking = false;
        });
    }

    // Override del metodo startDeath per gestire morte e fermare il timer
    protected startDeath(): void {
        // Ferma il timer di sparo
        if (this._fireTimer) {
            this._fireTimer.destroy();
            this._fireTimer = null;
        }

        this._isAttacking = false;
        
        // Riproduce l'animazione di morte
        this.anims.play('demon-death', true);
    }

    // Override del metodo update per implementare inseguimento che si ferma a 200px
    update(): void {
        if (this._isDead) return;

        if (this.target) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            
            // Se siamo a più di 500px, usa il comportamento normale di inseguimento
            if (distance > 500) {
                super.update();
                
                // Gestisci le animazioni durante il movimento
                if (!this._isAttacking && (this.body.velocity.x !== 0 || this.body.velocity.y !== 0)) {
                    this.anims.play("demon_walk", true);
                    // Flip orizzontale in base alla direzione
                    if (this.body.velocity.x > 0) {
                        this.setFlipX(false);
                    } else if (this.body.velocity.x < 0) {
                        this.setFlipX(true);
                    }
                } else if (!this._isAttacking) {
                    this.anims.play("demon_idle", true);
                }
            } else {
                // Se siamo a 500px o meno, fermati per attaccare a distanza
                this.setVelocity(0, 0);
                if (!this._isAttacking) {
                    this.anims.play("demon_idle", true);
                }
                
                // Orienta il demon verso il player anche quando è fermo
                if (this.target.x > this.x) {
                    this.setFlipX(false);
                } else {
                    this.setFlipX(true);
                }
            }
        }
    }
}