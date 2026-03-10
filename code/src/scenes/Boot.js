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
Object.defineProperty(exports, "__esModule", { value: true });
var GameData_1 = require("../GameData");
var Boot = /** @class */ (function (_super) {
    __extends(Boot, _super);
    function Boot() {
        return _super.call(this, { key: "Boot" }) || this;
    }
    Boot.prototype.init = function () {
    };
    Boot.prototype.preload = function () {
    };
    Boot.prototype.create = function () {
        this.cameras.main.setBackgroundColor(GameData_1.GameData.globals.bgColor);
        this.scene.stop("Boot");
        this.scene.start("Preloader");
    };
    Boot.prototype.update = function (time, delta) {
    };
    return Boot;
}(Phaser.Scene));
exports.default = Boot;
//# sourceMappingURL=Boot.js.map