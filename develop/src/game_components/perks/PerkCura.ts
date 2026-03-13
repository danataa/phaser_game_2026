import Phaser from "phaser";
import Perk from "./Perk";
import type Player from "../Player";

export default class PerkCura extends Perk {
    // --- Configuration Properties ---
    private readonly _healPercent: number;

    constructor(owner: Player, healPercent: number, delayMs: number) {
        super(owner, delayMs);
        this._healPercent = Phaser.Math.Clamp(healPercent, 0, 1);
    }

    get healPercent(): number {
        return this._healPercent;
    }

    protected _executeInternal(): void {
        this.owner.healByPercent(this._healPercent);
    }
}
