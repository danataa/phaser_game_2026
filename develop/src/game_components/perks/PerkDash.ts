import Phaser from "phaser";
import Perk from "./Perk";
import type Player from "../Player";

export default class PerkDash extends Perk {
    // --- Configuration Properties ---
    private readonly _dashPower: number;
    private readonly _dashDuration: number;
    private readonly _cooldown: number;
    private readonly _directionEpsilon: number = 0.0001;
    private _snapshotDirection: Phaser.Math.Vector2 | null = null;

    /**
     * Manteniamo potenza, durata e cooldown separati per rendere il perk facilmente
     * bilanciabile da una futura Shop senza toccare la logica interna di esecuzione.
     */
    constructor(owner: Player, dashPower: number, dashDuration: number, cooldown: number) {
        super(owner, cooldown);
        this._dashPower = Math.max(0, dashPower);
        this._dashDuration = Math.max(1, dashDuration);
        this._cooldown = Math.max(0, cooldown);
    }

    get dashPower(): number {
        return this._dashPower;
    }

    /** Durata della finestra di scatto in millisecondi. */
    get dashDuration(): number {
        return this._dashDuration;
    }

    /** Cooldown del perk in millisecondi, esposto per UI/Shop. */
    get cooldown(): number {
        return this._cooldown;
    }

    /**
     * Catturiamo la direzione nello stesso frame del click e consumiamo il cooldown
     * solo quando il dash e' realmente avviabile.
     */
    execute(): boolean {
        if (!this.canExecute() || this.owner.isDashing || this.owner.isAttacking) {
            return false;
        }

        const snapshotDirection = this._resolveDashDirection();
        if (snapshotDirection.lengthSq() <= this._directionEpsilon) {
            return false;
        }

        this._snapshotDirection = snapshotDirection;
        return super.execute();
    }

    /**
     * Normalizziamo il vettore prima di applicare la potenza per garantire che la distanza
     * percepita del dash resti coerente in diagonale e sugli assi cardinali.
     */
    protected _executeInternal(): void {
        const direction = this._snapshotDirection ? this._snapshotDirection.clone() : this._resolveDashDirection();
        this._snapshotDirection = null;

        if (direction.lengthSq() <= this._directionEpsilon) {
            return;
        }

        this.owner.startDash(direction, this._dashPower, this._dashDuration);
    }

    /**
     * Leggiamo una snapshot atomica dal player per evitare mismatch tra input e velocita'
     * quando il dash viene attivato nello stesso frame di cambio direzione.
     */
    private _resolveDashDirection(): Phaser.Math.Vector2 {
        return this.owner.getDashDirectionSnapshot();
    }
}
