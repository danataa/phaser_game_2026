import Phaser from "phaser";
import Enemy from "../Enemy";
import Perk from "./Perk";
import type Player from "../Player";

export default class PerkAOE extends Perk {
    // --- Configuration Properties ---
    private readonly _radius: number;
    private readonly _damage: number;

    constructor(owner: Player, radius: number, damage: number, delayMs: number) {
        super(owner, delayMs);
        this._radius = Math.max(0, radius);
        this._damage = Math.max(0, damage);
    }

    get radius(): number {
        return this._radius;
    }

    get damage(): number {
        return this._damage;
    }

    /**
     * Usiamo la distanza euclidea dal centro player per determinare i bersagli nel raggio.
     * Questo evita dipendenze da hitbox temporanee Arcade e rende il risultato stabile
     * rispetto al frame-rate quando molti nemici sono vicini al bordo dell'area.
     */
    protected _executeInternal(): void {
        const player = this.owner;
        const scene = player.scene;

        player.performSmashAttack(() => {
            const body = player.body as Phaser.Physics.Arcade.Body;
            const centerX = body.center.x;
            const centerY = body.center.y;

            // Il body center resta coerente anche quando origin/flip cambiano per il facing.
            const shockwave = scene.add.circle(centerX, centerY, 16, 0x88ccff, 0.45);
            scene.tweens.add({
                targets: shockwave,
                radius: this._radius,
                alpha: 0,
                duration: 180,
                onComplete: () => {
                    shockwave.destroy();
                },
            });

            const hitEnemies: Enemy[] = [];
            for (const enemy of player.getActiveEnemies()) {
                const distance = Phaser.Math.Distance.Between(centerX, centerY, enemy.x, enemy.y);
                if (distance <= this._radius) {
                    enemy.takeDamage(this._damage);
                    hitEnemies.push(enemy);
                }
            }

            if (hitEnemies.length > 0) {
                player.applyHitFeedback(hitEnemies);
            }
        });
    }
}
