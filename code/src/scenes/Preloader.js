"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var GameData_1 = require("../GameData");
var webFontFile_1 = __importDefault(require("../scenes/webFontFile"));
var Preloader = /** @class */ (function (_super) {
    __extends(Preloader, _super);
    function Preloader() {
        return _super.call(this, { key: "Preloader" }) || this;
    }
    Preloader.prototype.preload = function () {
        this.cameras.main.setBackgroundColor(GameData_1.GameData.globals.bgColor);
        this.loadAssets();
        this._loadingCircle = this.add.graphics();
        var centerX = this.game.canvas.width / 2;
        var centerY = this.game.canvas.height / 2 + 300;
        this._loadingCircle.setPosition(centerX, centerY);
        this.drawLoadingCircle();
        this.tweens.add({
            targets: this._loadingCircle,
            rotation: Math.PI * 2,
            duration: 2000,
            repeat: -1,
            ease: 'Linear',
        });
    };
    Preloader.prototype.create = function () {
        this._image = this.add
            .image(GameData_1.GameData.preloader.imageX, GameData_1.GameData.preloader.imageY, GameData_1.GameData.preloader.image)
            .setAlpha(0)
            .setScale(0.4);
        this.tweens.add({
            targets: this._image,
            alpha: 1,
            duration: 4000,
        });
    };
    Preloader.prototype.drawLoadingCircle = function () {
        var radius = 40;
        var thickness = 8;
        this._loadingCircle.clear();
        this._loadingCircle.lineStyle(thickness, 0xffffff, 1);
        this._loadingCircle.beginPath();
        this._loadingCircle.arc(0, 0, radius, 0, Math.PI * 1.5);
        this._loadingCircle.strokePath();
    };
    Preloader.prototype.loadAssets = function () {
        var _this = this;
        this.load.on("start", function () { });
        this.load.on("fileprogress", function () { });
        this.load.on("progress", function () {
            // il cerchio ruota automaticamente
        });
        this.load.on("complete", function () {
            // cerchio in dissolvenza senza interrompere la rotazione
            _this.tweens.add({
                targets: _this._loadingCircle,
                alpha: 0,
                duration: 1000,
            });
            // piccolo ritardo prima del fade-in dell'immagine
            _this.time.delayedCall(2000, function () {
                _this.tweens.add({
                    targets: _this._image,
                    alpha: 1,
                    duration: 3000,
                });
            });
            // dopo 5s scompare tutto e si passa alla scena Menu
            _this.time.delayedCall(5000, function () {
                _this.tweens.add({
                    targets: [_this._image, _this._loadingCircle],
                    alpha: 0,
                    duration: 1000,
                    onComplete: function () {
                        _this.scene.stop("Preloader");
                        _this.scene.start("Menu");
                    },
                });
            });
        });
        //Assets Load
        //--------------------------
        // WEB FONT
        if (GameData_1.GameData.webfonts != null) {
            var _fonts_1 = [];
            GameData_1.GameData.webfonts.forEach(function (element) {
                _fonts_1.push(element.key);
            });
            this.load.addFile(new webFontFile_1.default(this.load, _fonts_1));
        }
        // LOCAL FONT
        if (GameData_1.GameData.fonts != null) {
            var _fonts = [];
            GameData_1.GameData.fonts.forEach(function (element) {
                _this.load.font(element.key, element.path, element.type);
            });
        }
        // SCRIPT
        if (GameData_1.GameData.scripts != null)
            GameData_1.GameData.scripts.forEach(function (element) {
                _this.load.script(element.key, element.path);
            });
        // IMAGES
        if (GameData_1.GameData.images != null)
            GameData_1.GameData.images.forEach(function (element) {
                _this.load.image(element.name, element.path);
            });
        // TILEMAPS
        if (GameData_1.GameData.tilemaps != null)
            GameData_1.GameData.tilemaps.forEach(function (element) {
                _this.load.tilemapTiledJSON(element.key, element.path);
            });
        // ATLAS
        if (GameData_1.GameData.atlas != null)
            GameData_1.GameData.atlas.forEach(function (element) {
                _this.load.atlas(element.key, element.imagepath, element.jsonpath);
            });
        // SPRITESHEETS
        if (GameData_1.GameData.spritesheets != null)
            GameData_1.GameData.spritesheets.forEach(function (element) {
                _this.load.spritesheet(element.name, element.path, {
                    frameWidth: element.width,
                    frameHeight: element.height,
                    endFrame: element.frames,
                });
            });
        // VIDEO 
        if (GameData_1.GameData.videos != null) {
            GameData_1.GameData.videos.forEach(function (element) {
                _this.load.video(element.name, element.path, true);
            });
        }
        // BITMAP FONTS
        if (GameData_1.GameData.bitmapfonts != null)
            GameData_1.GameData.bitmapfonts.forEach(function (element) {
                _this.load.bitmapFont(element.name, element.imgpath, element.xmlpath);
            });
        // SOUNDS
        if (GameData_1.GameData.sounds != null)
            GameData_1.GameData.sounds.forEach(function (element) {
                _this.load.audio(element.name, element.paths);
            });
        // AUDIO
        if (GameData_1.GameData.audios != null)
            GameData_1.GameData.audios.forEach(function (element) {
                _this.load.audioSprite(element.name, element.jsonpath, element.paths, element.instance);
            });
    };
    return Preloader;
}(Phaser.Scene));
exports.default = Preloader;
//# sourceMappingURL=Preloader.js.map