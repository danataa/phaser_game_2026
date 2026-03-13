import Phaser from "phaser";
import type Enemy from "./Enemy";
import type Player from "./Player";

export interface IPerk {
    readonly id: string;
    readonly name: string;
    readonly baseCost: number;
    activate(player: Player): void;
    setEffectivenessMultiplier(multiplier: number): void;
}

abstract class BasePerk implements IPerk {
    public readonly id: string;
    public readonly name: string;
    public readonly baseCost: number;
    protected _effectivenessMultiplier: number = 1;

    constructor(id: string, name: string, baseCost: number) {
        this.id = id;
        this.name = name;
        this.baseCost = baseCost;
    }

    public setEffectivenessMultiplier(multiplier: number): void {
        this._effectivenessMultiplier = Math.max(1, multiplier);
    }

    public abstract activate(player: Player): void;
}

export class DashPerk extends BasePerk {
    private readonly _dashDurationMs: number = 200;
    private readonly _baseSpeedMultiplier: number = 2;

    constructor() {
        super("dash", "Dash", 35);
    }

    public activate(player: Player): void {
        player.triggerPerkFeedback();
        player.dashInCurrentDirection(this._baseSpeedMultiplier * this._effectivenessMultiplier, this._dashDurationMs);
    }
}

export class HealPerk extends BasePerk {
    private readonly _baseHealPercent: number = 0.2;

    constructor() {
        super("heal", "Heal", 30);
    }

    public activate(player: Player): void {
        player.healByPercentOfCurrent(this._baseHealPercent * this._effectivenessMultiplier);
    }
}

export class AreaAttackPerk extends BasePerk {
    private readonly _hitboxLifetimeMs: number = 100;
    private readonly _baseRadius: number = 120;

    constructor() {
        super("aoe", "Area Attack", 50);
    }

    public activate(player: Player): void {
        const scene = player.scene;
        const radius = this._baseRadius * this._effectivenessMultiplier;
        const damage = Math.ceil(player.baseAttackDamage * this._effectivenessMultiplier);

        player.triggerPerkFeedback();

        const aoeHitbox = scene.add.zone(player.x, player.y, radius * 2, radius * 2);
        scene.physics.add.existing(aoeHitbox);

        const aoeBody = aoeHitbox.body as Phaser.Physics.Arcade.Body;
        aoeBody.setAllowGravity(false);
        aoeBody.setImmovable(true);
        aoeBody.setCircle(radius);

        const hitEnemies: Enemy[] = [];
        for (const enemy of player.getActiveEnemies()) {
            if (scene.physics.overlap(aoeHitbox, enemy)) {
                enemy.takeDamage(damage);
                hitEnemies.push(enemy);
            }
        }

        for (const enemy of hitEnemies) {
            enemy.setTint(0xff5555);
            scene.time.delayedCall(120, () => {
                if (enemy.active) {
                    enemy.clearTint();
                }
            });
        }

        scene.time.delayedCall(this._hitboxLifetimeMs, () => {
            if (aoeHitbox.active) {
                aoeHitbox.destroy();
            }
        });
    }
}
