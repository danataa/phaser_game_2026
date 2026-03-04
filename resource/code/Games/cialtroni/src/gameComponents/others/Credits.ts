import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { BBCodeText } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import { language } from "../../Enums";
import {translations} from "../../Translations";
import ICredits from "./iCredits";
import Menu from "../../scenes/Menu";

export default class Credits

    implements ICredits {

    protected _scene: Menu;
    private _currentLanguage: language = language.english;
    private _isOpen: boolean = false;
    private _rexUI: UIPlugin;
    private _scrollablePanel: UIPlugin.ScrollablePanel;
    private _creditsContainer: Phaser.GameObjects.Container;
    private _textContent: BBCodeText;
    private _creditsHeadline: Phaser.GameObjects.Text;
    private _back: Phaser.GameObjects.Image;
    private _beer: Phaser.GameObjects.Image;
    constructor(params: optionsConfig

    ) {



        this._scene = <Menu>params.scene;

        this._rexUI = params.rexUI;
        this._creditsContainer = this._scene.add.container(0, 0).setDepth(1005).setAlpha(0);
      

        this._creditsHeadline = this._scene.add.text(320, 330, translations[this._currentLanguage].credits, { fontSize: "50px", color: "#ffffff" }).setOrigin(0, 0).setFontFamily("gagalin");

        this._back = this._scene.add.image(245, 335, "back").setOrigin(0).setInteractive().on("pointerdown", () => {
             this._scene.sound.playAudioSprite("sfx", "click", { volume: 1 });
            this.hide();
            this._scene.showMenu();
        }).on("pointerover", () => {
            this._back.setTintFill(0xffffff);
        }).on("pointerout", () => {
            this._back.setTintFill(0x000000);
        });

        this._beer = this._scene.add.image(680, 80, "beer").setOrigin(0).setScale(1);

        this.createScrollabelPanel();

        this._creditsContainer.add([this._back, this._beer, this._creditsHeadline,this._scrollablePanel]);
        

    }

    createScrollabelPanel() {

        this._scrollablePanel = this._rexUI.add.scrollablePanel({
            x: 670, y: 515,
            height: 250,
            width: 665,
            scrollMode: 'y',
            background: this._rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xf5a400).setInteractive().setAlpha(1),
            panel: {
                child: this.createPanel(),
                mask: { padding: 1, },
            },

            slider: {
                track: this._rexUI.add.roundRectangle(0, 0, 5, 0, { radius: 5 }, 0xaaaaaa),
                thumb: this._rexUI.add.roundRectangle(0, 0, 5, 150, { radius: 5 }, 0xffffff),
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            },
            space: { left: 10, right: 10, top: 10, bottom: 10, panel: 3, header: 5, footer: 5 }
        }).layout().scrollToBottom().scrollToTop().setDepth(1005);

    }

    createPanel(): Phaser.GameObjects.Container {
        this._textContent = this._rexUI.add.BBCodeText(0, 0, '', {
            wrap: {
                mode: 'word',
                width: 665
            }
        }).setColor("#000000").setText(translations[this._currentLanguage].creditsText).setFontSize(20).setLineSpacing(6).setFontFamily("PressStart2P");

        let container = this._scene.add.container()
            .add(this._textContent)
            .setSize(665, this._textContent.height);

        return container;
    }

    toggle() {

        if (!this._isOpen) {
            this.show();
        } else {
            this.hide();
        }
    }


    show() {


        this._isOpen = true;
        this._scrollablePanel.scrollToTop();

        this._scene.tweens.add({
            targets: [this._creditsContainer],
            alpha: 1,
            duration: 300,
            ease: "Power2"
        });

        this._scene.tweens.add({
            targets: this._beer,
            alpha: 1,
            x: 630,
            duration: 1000,
            ease: Phaser.Math.Easing.Sine.Out
        });


    }

    hide() {


    
        this._scene.tweens.add({
            targets: [this._creditsContainer],
            alpha: 0,
            duration: 300,
            ease: "Power2",
            onComplete: () => {
                this._isOpen = false;


            }
        });

        this._scene.tweens.add({
            targets: this._beer,
            alpha: 1,
            x: 680,
            duration: 300,
            ease: Phaser.Math.Easing.Sine.Out
        });


    }



    setLanguage(language: language) {
        this._currentLanguage = language;
        this._creditsHeadline.setText(translations[this._currentLanguage].credits);
        this._textContent.setText(translations[this._currentLanguage].creditsText);
        this._scrollablePanel.layout();
     
    }

}