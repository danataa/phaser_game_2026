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
        this._playHealSfx();
        this.owner.healByPercent(this._healPercent);
        this.owner.playHealVisualFeedback();
    }

    /**
     * Il suono di cura viene emesso all'avvio dell'effetto per dare conferma
     * immediata al giocatore prima dell'aggiornamento visivo della barra HP.
     */
    private _playHealSfx(): void {
        const scene = this.owner.scene;
        if (!scene.cache.audio.exists("perk_heal")) {
            return;
        }

        try {
            scene.sound.play("perk_heal", {
                volume: 0.7,
            });
        } catch (_error) {
            console.warn("Audio perk_heal non disponibile.");
        }
    }
}
