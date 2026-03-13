import type Player from "../Player";

/**
 * Classe base dei perk con gestione cooldown centralizzata.
 *
 * Esporre un contratto unico (`execute`) permette alla Shop di trattare tutti i perk
 * in modo uniforme (equip/unequip) senza conoscere i dettagli delle singole abilita'.
 */
export default abstract class Perk {
    // --- Configuration Properties ---
    private readonly _owner: Player;
    private readonly _delayMs: number;

    // --- Runtime State ---
    private _lastExecutionAt: number = Number.NEGATIVE_INFINITY;

    protected constructor(owner: Player, delayMs: number) {
        this._owner = owner;
        this._delayMs = Math.max(0, delayMs);
    }

    get owner(): Player {
        return this._owner;
    }

    get delayMs(): number {
        return this._delayMs;
    }

    get lastExecutionAt(): number {
        return this._lastExecutionAt;
    }

    get remainingCooldownMs(): number {
        const elapsed = this._owner.scene.time.now - this._lastExecutionAt;
        return Math.max(0, this._delayMs - elapsed);
    }

    canExecute(): boolean {
        return this.remainingCooldownMs === 0;
    }

    execute(): boolean {
        if (!this.canExecute()) {
            return false;
        }

        this._lastExecutionAt = this._owner.scene.time.now;
        this._executeInternal();
        return true;
    }

    protected abstract _executeInternal(): void;
}
