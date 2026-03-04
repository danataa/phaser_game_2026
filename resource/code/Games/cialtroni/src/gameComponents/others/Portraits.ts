import GamePlay from "../../scenes/GamePlay";
import { enemyMovementTypes } from "../../Enums";
import EnergyBar from "./EnergyBar";
import IPortraits from "./iPortraits";
import Hud from "../../scenes/Hud";
import { language } from "../../Enums";
import { translations } from "../../Translations";
import HudBeat from "../../scenes/HudBeat";

export default class Portraits
    extends Phaser.GameObjects.Container
    implements IPortraits {


    protected _hud: HudBeat;
    protected _portrait: Phaser.GameObjects.Image;
    protected _portraitModal: Phaser.GameObjects.Image;
    protected _portraitName: Phaser.GameObjects.Text;
    protected _energyBar: EnergyBar;
    protected _energyText: Phaser.GameObjects.Text;
    protected _rageBar: EnergyBar;
    protected _rageText: Phaser.GameObjects.Text;
    private _currentLanguage: language = language.english;

    constructor(params: portraitConfig

    ) {

        super(params.scene);

        this._hud = <HudBeat>params.scene;
        this._portraitModal = this._hud.add.image(params.portraitModal.x, params.portraitModal.y, params.portraitModal.key).setOrigin(0).setScale(.5)
        this._portrait = this._hud.add.image(params.portrait.x, params.portrait.y, params.portrait.key).setOrigin(0.5, 0.5).setScale(0.5).setFrame(0);
        this._portraitName = this._hud.add.text(params.portraitName.x, params.portraitName.y, "", { fontSize: "22px", color: "#480000" }).setOrigin(0).setFontFamily("'Press Start 2P'").setWordWrapWidth(650).setLineSpacing(10);
        this._energyText = this._hud.add.text(params.energyBar.text.x, params.energyBar.text.y, translations[this._currentLanguage].energy, { fontSize: "14px", color: "#" }).setOrigin(0).setFontFamily("PressStart2P");
        this._rageText = this._hud.add.text(params.rageBar.text.x, params.rageBar.text.y, translations[this._currentLanguage].rage, { fontSize: "14px", color: "#480000" }).setOrigin(0).setFontFamily("PressStart2P");

        if (params.portraitModal.flipX) {
            this._portraitModal.setFlipX(true);
        }

        if (params.energyBar.text.originX) {
            this._energyText.setOrigin(params.energyBar.text.originX, 0);
        }

        if (params.rageBar.text.originX) {
            this._rageText.setOrigin(params.rageBar.text.originX, 0);
        }

        this._energyBar = new EnergyBar({
            scene: this._hud,
            x: params.energyBar.x,
            y: params.energyBar.y,
            energybarData: { health: params.energyBar.value, width: params.energyBar.width, height: params.energyBar.height, hide: false }
        });

        this._rageBar = new EnergyBar({
            scene: this._hud,
            x: params.rageBar.x,
            y: params.rageBar.y,
            energybarData: { health: params.rageBar.value, width: params.rageBar.width, height: params.rageBar.height, hide: false, rageDuration: params.rageBar.rageDuration }
        });



        this.add([this._portraitModal, this._portrait, this._portraitName, this._energyBar, this._energyText, this._rageBar, this._rageText]);

        this._hud.add.existing(this);
        this.setAlpha(0).setY(50);

    }

    setLanguage(language: language) {
        this._currentLanguage = language;
        this._energyText.setText(translations[this._currentLanguage].energy);
        this._rageText.setText(translations[this._currentLanguage].rage);

    }

    updateEnergyBar(energy: number): number {
        return this._energyBar.updateValue(energy);

    }

    updateRageBar(energy: number): number {

        return this._rageBar.updateValue(energy);
    }

    getEnergyValue(): number {
        return this._energyBar.getValue();
    }


    setPortraitFrame(frame: number): void {
        this._portrait.setFrame(frame);
    }

    hide(): void {
        this._hud.tweens.add({
            targets: this,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.setVisible(false);
            }
        });
    }

    show(): void {
        this.setVisible(true);
        this._hud.tweens.add({
            targets: this,
            alpha: 1,
            duration: 300
        });
    }

    setPortraitName(name: string): void {
        this._portraitName.setText(name);
    }

    startRage(_callback?: any): void {
        this._rageBar.startRage(_callback);
    }

    getRageValue(): number {
        return this._rageBar.getValue();
    }




}


