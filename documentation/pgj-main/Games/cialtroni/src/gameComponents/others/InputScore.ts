
import { Game } from "phaser";
import { GameData} from "../../GameData";
import { gameType, language } from "../../Enums";
import {translations} from "../../Translations";
import GameOver from "../../scenes/GameOver";
import Win from "../../scenes/Win";
import IInputScore from "./iInputScore";


export default class InputScore
    extends Phaser.GameObjects.Container
    implements IInputScore {

    private _chars: Array<Array<string>>;
    private _cursor: Phaser.Math.Vector2;
    private _name: string;
    private _charLimit: number;
    private _block: Phaser.GameObjects.Image;
    private _text: Phaser.GameObjects.BitmapText;
    private _textWhite: Phaser.GameObjects.BitmapText;
    private _gamepad: Phaser.Input.Gamepad.Gamepad;

    private _moved: boolean = false;
    private _rub: Phaser.GameObjects.Image;
    private _end: Phaser.GameObjects.Image;
    private _scene: GameOver | Win;

    private _scoreTitle: Phaser.GameObjects.BitmapText;
    private _scoreText: Phaser.GameObjects.BitmapText;
    private _score: number = 0;
    private _nameTitle: Phaser.GameObjects.BitmapText;
    private _nameText: Phaser.GameObjects.BitmapText;
    private _currentLanguage: language;
    private _blockTween: Phaser.Tweens.Tween;


    constructor(scene: GameOver| Win, currentLanguage: language = language.english, score: number = 0) {

        super(scene);

        this._scene = scene;
        this._currentLanguage = currentLanguage;
        this._score = score;

        this._chars = [
            ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
            ["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
            ["U", "V", "W", "X", "Y", "Z", ".", "-", "<", ">"],
        ];

        this._cursor = new Phaser.Math.Vector2();
        this._name = "";
        this._charLimit = 8;


        this._name = "";
        this._text = this._scene.add.bitmapText(
            180,
            20,
            "arcade",
            "ABCDEFGHIJ\n\nKLMNOPQRST\n\nUVWXYZ.-<>"
        );

        this._textWhite = this._scene.add.bitmapText(
            180,
            20,
            "arcade",
            "ABCDEFGHIJ\n\nKLMNOPQRST\n\nUVWXYZ.-<>"
        ).setLetterSpacing(20)

        this._text.setLetterSpacing(20)
        this._text.setInteractive();

        this._rub = this._scene.add
            .image(this._text.x + 430, this._text.y + 148, "rub2")

        this._end = this._scene.add
            .image(this._text.x + 482, this._text.y + 148, "end2")
            .setTint(0x00ff00)
            // .setInteractive()
            .on("pointerup", () => {
                this.end();
            });

        this._block = this._scene.add
            .image(this._text.x - 10, this._text.y - 2, "block")
            .setOrigin(0);


        this._scene.input.keyboard.on("keyup", this.anyKey, this);

        this._text.on("pointermove", this.moveBlock, this);
        this._text.on("pointerover", this.moveBlock, this);
        this._text.on("pointerup", this.pressKey, this);

        this._blockTween = this._scene.tweens.add({
            targets: this._block,
            alpha: 0.2,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
            duration: 350,
        });

        this._scoreTitle = this._scene.add
            .bitmapText(880, 0, "arcade", translations[this._currentLanguage].score)
            .setTint(0xfed500)
            .setFontSize(22)

        this._nameTitle = this._scene.add
            .bitmapText(880, 100, "arcade", translations[this._currentLanguage].name)
            .setTint(0xfed500).setFontSize(22)



        this._scoreText = this._scene.add
            .bitmapText(880, 30, "arcade", this._score + "")
            .setTint(0xffffff);

        this._nameText = this._scene.add
            .bitmapText(880, 130, "arcade", "________")
            .setTint(0xffffff);



        this.add([
            this._text,
            this._textWhite,
            this._nameTitle,
            this._scoreTitle,
            this._nameText,
            this._scoreText,
            this._block,
            this._end,
            this._rub,
            this._scene.add
                .bitmapText(180, -30, "arcade", translations[this._currentLanguage].enterName
                )
                .setFontSize(24)
                .setOrigin(0).setTint(0xfed500)
        ]);



    }






    moveBlock(pointer: Phaser.Input.Pointer, x: number, y: number) {
        let cx = Phaser.Math.Snap.Floor(x, 52, 0, true);
        let cy = Phaser.Math.Snap.Floor(y, 64, 0, true);

        let char = this._chars[cy][cx];
        this._cursor.set(cx, cy);
        this._block.x = this._text.x - 10 + cx * 52;
        this._block.y = this._text.y - 2 + cy * 64;
    }

    moveCursorLeft() {

        if (this._cursor.x > 0) {
            this._cursor.x--;
            this._block.x -= 52;
        } else {
            this._cursor.x = 9;
            this._block.x += 52 * 9;
        }
    }

    moveCursorRight() {
        if (this._cursor.x < 9) {
            this._cursor.x++;
            this._block.x += 52;
        } else {
            this._cursor.x = 0;
            this._block.x -= 52 * 9;
        }
    }

    moveCursorUp() {
        if (this._cursor.y > 0) {
            this._cursor.y--;
            this._block.y -= 64;
        } else {
            this._cursor.y = 2;
            this._block.y += 64 * 2;
        }
    }

    moveCursorDown() {
        if (this._cursor.y < 2) {
            this._cursor.y++;
            this._block.y += 64;
        } else {
            this._cursor.y = 0;
            this._block.y -= 64 * 2;
        }
    }

    anyKey(event: any) {
        //  Only allow A-Z . and -

        let code: any = event.keyCode;
        if (code === Phaser.Input.Keyboard.KeyCodes.LEFT) {
            this.moveCursorLeft();
        }
        else if (code === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
            this.moveCursorRight();
        }
        else if (code === Phaser.Input.Keyboard.KeyCodes.UP) {
            this.moveCursorUp();
        }
        else if (code === Phaser.Input.Keyboard.KeyCodes.DOWN) {
            this.moveCursorDown();
        }
        else if (code === Phaser.Input.Keyboard.KeyCodes.ENTER) {
            this.pressKey();
        }
        else if (code === Phaser.Input.Keyboard.KeyCodes.SPACE) {
            this.pressKey();
        }
        else if (code === Phaser.Input.Keyboard.KeyCodes.PERIOD) {
            this._cursor.set(6, 2);
            this.pressKey();
        }
        else if (code === Phaser.Input.Keyboard.KeyCodes.MINUS) {
            this._cursor.set(7, 2);
            this.pressKey();
        }
        else if (
            code === Phaser.Input.Keyboard.KeyCodes.BACKSPACE ||
            code === Phaser.Input.Keyboard.KeyCodes.DELETE
        ) {
            this._cursor.set(8, 2);
            this.pressKey();
        }
        else if (
            code >= Phaser.Input.Keyboard.KeyCodes.A &&
            code <= Phaser.Input.Keyboard.KeyCodes.Z
        ) {
            code -= 65;
            let y = Math.floor(code / 10);
            let x = code - y * 10;

            this._cursor.set(x, y);
            this.pressKey();
        }
    }

    rub() {
        this._scene.restartCountdown();
        // this._countdown.play("countdown_anim", false);
        let nameLength = this._name.length;
        this._name = this._name.substr(0, nameLength - 1);
        this._nameText.setText(this._name);
    }

    end() {
        this._blockTween.stop();

        if (this._name == "<") this._name = "";
        this._scene.saveScore(this._name);

    }

    pressKey() {

        let x = this._cursor.x;
        let y = this._cursor.y;
        let nameLength = this._name.length;

        this._block.x = this._text.x - 10 + x * 52;
        this._block.y = this._text.y - 2 + y * 64;

        if (x === 9 && y === 2) {
            this.end();
        } else if (x === 8 && y === 2 && nameLength > 0) {
            this.rub();
            this._scene.restartCountdown();
        } else if (this._name.length < this._charLimit) {
            this._name = this._name.concat(this._chars[y][x]);
            this._nameText.setText(this._name);
            this._scene.restartCountdown();
        }
    }






}


