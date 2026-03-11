"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//importiamo la libreria phaser
require("phaser");
//importiamo le nostre scene
var Boot_1 = __importDefault(require("./scenes/Boot"));
var Hud_1 = __importDefault(require("./scenes/Hud"));
var Preloader_1 = __importDefault(require("./scenes/Preloader"));
var GamePlay_1 = __importDefault(require("./scenes/GamePlay"));
var GameOver_1 = __importDefault(require("./scenes/GameOver"));
var Menu_1 = __importDefault(require("./scenes/Menu"));
//importiamo GameData che contiene i valori globali del gioco
var GameData_1 = require("./GameData");
//il listener per l'evento load della pagina
//questo evento viene lanciato quando la pagina è stata caricata
//e tutti gli elementi della pagina sono disponibili
window.addEventListener("load", function () {
    /** Builds the Phaser game config and boots the game. */
    //creiamo un oggetto di configurazione per il gioco
    //questo oggetto viene passato al costruttore di Phaser.Game
    // e contiene i parametri di configurazione del gioco
    // come il tipo di rendering, le dimensioni del canvas, le scene, ecc.
    var config = {
        type: Phaser.WEBGL,
        backgroundColor: GameData_1.GameData.globals.bgColor,
        parent: "my-game",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: GameData_1.GameData.globals.gameWidth,
            height: GameData_1.GameData.globals.gameHeight,
        },
        scene: [
            Boot_1.default,
            Hud_1.default,
            Preloader_1.default,
            Menu_1.default,
            GamePlay_1.default,
            GameOver_1.default
        ],
        physics: {
            default: "arcade",
            arcade: { debug: GameData_1.GameData.globals.debug, }
        },
        input: {
            activePointers: 2,
            keyboard: true,
        },
        render: {
            pixelArt: false,
            antialias: true,
        },
    };
    //inizializziamo il gioco passando la configurazione
    var game = new Phaser.Game(config);
});
//# sourceMappingURL=index.js.map