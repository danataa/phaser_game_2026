import { Scene } from "phaser";
import GamePlay from "../../scenes/GamePlay";
import Hud from "../../scenes/Hud";
import { language } from "../../Enums";
import {  translations } from "../../Translations";
import IOptions from "./iOptions";
import Menu from "../../scenes/Menu";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { IConfig } from "phaser3-rex-plugins/templates/ui/utils/buttongroup/Buttons";



export default class Options
    extends Phaser.GameObjects.Container
    implements IOptions {

    protected _scene: Menu;
    private _currentLanguage: language = language.english;
    private _isOpen: boolean = false;
    private _flagEnglish: Phaser.GameObjects.Image;
    private _flagEnglishText: Phaser.GameObjects.Text;
    private _flagItalian: Phaser.GameObjects.Image;
    private _flagItalianText: Phaser.GameObjects.Text;
    private _flagNapolitan: Phaser.GameObjects.Image;
    private _flagNapolitanText: Phaser.GameObjects.Text;
    private _flagSelected: Phaser.GameObjects.Image;
    private _optionsHeadline: Phaser.GameObjects.Text;
    private _back: Phaser.GameObjects.Image;
    private _slice: Phaser.GameObjects.Image;
    private _flagY: number = 420;
    private _flagTextY: number = 460;
    private _rexUI: UIPlugin;
    private _audioKnob: UIPlugin.Knob;
    private _sfxKnob: UIPlugin.Knob;

    private _audioSwitch: Phaser.GameObjects.Sprite;
    private _lastAudioVolume: number = 1;
    private _sfxSwitch: Phaser.GameObjects.Sprite;

    private _audioSwitchIsOn: boolean = true;
    private _lastSfxVolume: number = 1;
    private _sfxSwitchIsOn: boolean = true;


    constructor(params: optionsConfig) {

        super(params.scene);


        this._scene = <Menu>params.scene;
        this._rexUI = params.rexUI;

        //event!
         this._scene.events.off("check-storage-settings", this.checkLocalStorage, this);
        this._scene.events.on("check-storage-settings", this.checkLocalStorage, this);


        this._optionsHeadline = this._scene.add.text(320, 330, translations[this._currentLanguage].options, { fontSize: "50px", color: "#ffffff" }).setOrigin(0, 0).setFontFamily("gagalin");

        this._back = this._scene.add.image(245, 335, "back").setOrigin(0).setInteractive().on("pointerdown", () => {
            this._scene.playSfx("click", 1);

            this.hide();
            this._scene.showMenu();
        }).on("pointerover", () => {
            this._back.setTintFill(0xffffff);
        }).on("pointerout", () => {
            this._back.setTintFill(0x000000);
        });

        this._slice = this._scene.add.image(650, 80, "slice").setOrigin(0).setScale(1);

        let _textConfig = { fontSize: "16px", fontFamily: "PressStart2P", color: "#666666" };

        this._flagEnglish = this.scene.add.image(640 - 180, this._flagY, "flags", 3).setOrigin(0.5).setInteractive().on("pointerdown", () => {
            this.changeLanguage(language.english);
        });
        this._flagEnglishText = this.scene.add.text(640 - 180, this._flagTextY, translations[this._currentLanguage].english, _textConfig).setOrigin(0.5);

        this._flagItalian = this.scene.add.image(640, this._flagY, "flags", 2).setOrigin(0.5).setInteractive().on("pointerdown", () => {
            this.changeLanguage(language.italian);
        });
        this._flagItalianText = this.scene.add.text(640, this._flagTextY, translations[this._currentLanguage].italian, _textConfig).setOrigin(0.5);

        this._flagNapolitan = this.scene.add.image(640 + 180, this._flagY, "flags", 1).setOrigin(0.5).setInteractive().on("pointerdown", () => {
            this.changeLanguage(language.napolitan);
        });
        this._flagNapolitanText = this.scene.add.text(640 + 180, this._flagTextY, translations[this._currentLanguage].napolitan, _textConfig).setOrigin(0.5);

        this._flagSelected = this.scene.add.image(640 - 180, this._flagY, "flags", 0).setOrigin(0.5);

        this._audioSwitch = this._scene.add.sprite(500, 610, "switch").setInteractive().on("pointerdown", () => {
            this.toggleAudio();
        });



        const savedAudioVolume = localStorage.getItem("musicVolume");
        const musicVolume = savedAudioVolume ? parseFloat(savedAudioVolume) : .9;


        this._scene.getAudio().setMusicVolume(musicVolume);

        this._audioKnob = this._rexUI.add.knob({
            x: 500,
            y: 540,
            width: 100,
            height: 100,
            value: musicVolume,
            barColor: 0xf5a400,
            trackColor: 0x555555,
            text: this._rexUI.add.label({
                text: this._scene.add.text(0, 0, '', {
                    fontSize: '20px', fontFamily: 'gagalin'
                }),
                icon: this._scene.add.image(0, 0, 'audio'),
                space: {
                    icon: 10
                }
            }),
            textFormatCallback: function (value) {
                return Math.floor(value * 100).toString();
            },
            valuechangeCallback: (value: number) => {

                this._scene.getAudio().setMusicVolume(value);
                
                if (value <= 0) {
                    this._audioSwitchIsOn = false;
                    this._audioSwitch.setFrame(1);
                } else {
                    this._audioSwitchIsOn = true;
                    this._audioSwitch.setFrame(0);
                }


            }
        }).layout();


        this._sfxSwitch = this._scene.add.sprite(800, 610, "switch").setInteractive().on("pointerdown", () => {
            this.toggleSfx();
        });

        const savedSfxVolume = localStorage.getItem("sfxVolume");
        const sfxVolume = savedSfxVolume ? parseFloat(savedSfxVolume) : .9;
        this._scene.getAudio().setSfxVolume(sfxVolume);

        this._sfxKnob = this._rexUI.add.knob({
            x: 800,
            y: 540,
            width: 100,
            height: 100,
            value: sfxVolume,
            barColor: 0xf5a400,
            trackColor: 0x555555,
            text: this._rexUI.add.label({
                text: this._scene.add.text(0, 0, '', {
                    fontSize: '20px', fontFamily: 'gagalin'
                }),
                icon: this._scene.add.image(0, 0, 'sfx'),
                space: {
                    icon: 10
                }
            }),
            textFormatCallback: function (value) {
                return Math.floor(value * 100).toString();
            },
            valuechangeCallback: (value: number) => {

                
                this._scene.getAudio().setSfxVolume(value);
                if (value <= 0) {
                    this._sfxSwitchIsOn = false;
                    this._sfxSwitch.setFrame(1);
                } else {
                    this._sfxSwitchIsOn = true;
                    this._sfxSwitch.setFrame(0);
                }



            }
        }).layout();




        this.add([this._back, this._slice, this._optionsHeadline, this._flagEnglish, this._flagItalian, this._flagNapolitan, this._flagEnglishText, this._flagItalianText, this._flagNapolitanText, this._flagSelected, this._audioKnob, this._sfxKnob, this._audioSwitch, this._sfxSwitch]).setAlpha(0).setActive(false).setDepth(1005);
        this._scene.add.existing(this);

    }

    toggleAudio() {
        // Implement audio toggle functionality here
        this._audioSwitchIsOn = !this._audioSwitchIsOn;
        this._audioSwitch.setFrame(this._audioSwitchIsOn ? 0 : 1);
        // You can add code here to actually mute/unmute the audio based on this._audioSwitchIsOn
        if (this._audioSwitchIsOn) {
            this._audioKnob.setValue(this._lastAudioVolume);
        } else {
            this._lastAudioVolume = this._audioKnob.value;
            this._audioKnob.setValue(0);

        }

    }
    toggleSfx() {
        // Implement sfx toggle functionality here
        this._sfxSwitchIsOn = !this._sfxSwitchIsOn;
        this._sfxSwitch.setFrame(this._sfxSwitchIsOn ? 0 : 1);
        // You can add code here to actually mute/unmute the sfx based on this._sfxSwitchIsOn
        if (this._sfxSwitchIsOn) {
            this._sfxKnob.setValue(this._lastSfxVolume);
        } else {
            this._lastSfxVolume = this._sfxKnob.value;
            this._sfxKnob.setValue(0);
        }

    }

    toggle() {

        if (!this._isOpen) {
            this.show();
        } else {
            this.hide();
        }
    }

    checkLocalStorage() {

        //recupero i valori dal local storage e se presenti li setto
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage) {
            this._currentLanguage = parseInt(savedLanguage) as language;
            this.changeLanguage(this._currentLanguage);

        }


    }


    show() {
        this._isOpen = true;
        this.setActive(true);

        this._scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 300,
            ease: "Power2"
        });

        this._scene.tweens.add({
            targets: this._slice,
            alpha: 1,
            x: 600,
            duration: 1000,
            ease: Phaser.Math.Easing.Sine.Out
        });

    }

    hide() {

        this.setActive(false);
        this._isOpen = false;
        this._scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 300,
            ease: "Power2"
        });

        this._scene.tweens.add({
            targets: this._slice,
            alpha: 1,
            x: 650,
            duration: 300,
            ease: Phaser.Math.Easing.Sine.Out
        });


    }

    changeLanguage(_language: language) {

        this._currentLanguage = _language;

        localStorage.setItem("language", _language.toString());
        this._scene.registry.set("language", _language);
        this._scene.changeLanguage(_language);
        this._scene.playSfx("click", 1);


        switch (_language) {
            case language.english:
                this._flagSelected.setPosition(640 - 180, this._flagY);
                break;

            case language.italian:
                this._flagSelected.setPosition(640, this._flagY);
                break;

            case language.napolitan:
                this._flagSelected.setPosition(640 + 180, this._flagY);
                break;

        }


    }

    setLanguage(language: language) {

        this._flagEnglishText.setText(translations[this._currentLanguage].english);
        this._flagItalianText.setText(translations[this._currentLanguage].italian);
        this._flagNapolitanText.setText(translations[this._currentLanguage].napolitan);
        this._optionsHeadline.setText(translations[this._currentLanguage].options);

    }

}