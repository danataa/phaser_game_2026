//viene importato un riferimento a gamedata per poter usare le variabili globali
import { GameData } from "../GameData";
import { language } from "../Enums";

//creiamo la classe Boot che estende Phaser.Scene
export default class Boot extends Phaser.Scene {


  private _text: Phaser.GameObjects.Text;
  //il costruttore richiama il costruttore della classe Phaser.Scene
  //si usa il metodo super per richiamare il costruttore della classe Phaser.Scene

  constructor() {
    // il metodo super prende come parametro un oggetto con una chiave key che ha come valore il nome della scena
    super({
      key: "Boot",
    });

  }

  //il metodo init viene chiamato all'inizio della scena
  //in questo caso non esegue nessuna operazione
  init() {

  }
  //il metodo preload viene chiamato dopo il metodo init
  //nel metodo preload vengono caricati gli assets che servono per il caricamento della scena successiva
  preload() {


    //settiamo il colore di sfondo della scena
    this.cameras.main.setBackgroundColor(GameData.globals.bgColor);
    //precarichiamo l'immagine del logo
    this.load.image("logo", "assets/images/cialtroni/thelucasart.png");

    let _graphics: Phaser.GameObjects.Graphics = this.add.graphics();
    _graphics.fillStyle(0x000000, .7);
    _graphics.fillRect(0, 0, 1280, 720);
    _graphics.generateTexture("layer", 1280, 720);
    _graphics.clear();

    _graphics.fillStyle(0x000000, 1);
    _graphics.fillRect(0, 0, 1280, 150);
    _graphics.generateTexture("dialogBar", 1280, 150);
    _graphics.clear();

    _graphics.fillStyle(0xf5a400, 1);
    _graphics.fillRect(0, 0, 200, 5);
    _graphics.generateTexture("menu-line", 200, 5);
    _graphics.clear();

    _graphics.fillStyle(0xffffff, 1);
    _graphics.fillRoundedRect(0, 0, 800, 500, 20);
    _graphics.generateTexture("modal", 800, 500);
    _graphics.clear();


    _graphics.fillStyle(0x000000, .75);
    _graphics.fillRoundedRect(0, 0, 500, 350, 20);
    _graphics.generateTexture("highscoresBg", 500, 350);
    _graphics.clear();

    _graphics.fillStyle(0xffffff, 0);
    _graphics.fillRect(0, 0, 800, 100);
    _graphics.generateTexture("platform", 800, 100);
    _graphics.clear();

    _graphics.fillStyle(0xffffff, 0);
    _graphics.fillRect(0, 0, 32, 32);
    _graphics.generateTexture("trigger", 32, 32);
    _graphics.clear();


    _graphics.fillStyle(0xff0000, 1);
    _graphics.fillRect(0, 0, 40, 40);
    _graphics.generateTexture("options-btn", 40, 40);
    _graphics.clear();


    _graphics.fillStyle(0x000000, .8);
    _graphics.fillRect(0, 0, 1280, 720);
    _graphics.generateTexture("options-layer", 1280, 720);
    _graphics.clear();



    _graphics.fillStyle(0xffffff, .5);
    _graphics.fillCircle(20, 20, 20);
    _graphics.generateTexture("circle", 40, 40);
    _graphics.clear();


    _graphics.fillStyle(0x000000, 1);
    _graphics.fillRect(0, 0, 1280, 110);
    _graphics.generateTexture("1280x110", 1280, 110);
    _graphics.clear();

    _graphics.fillStyle(0x000000, 1);
    _graphics.fillRect(0, 0, 1280, 70);
    _graphics.generateTexture("1280x70", 1280, 70);
    _graphics.clear();


    _graphics.fillStyle(0x000000, 1);
    _graphics.fillRect(0, 0, 400, 720);
    _graphics.generateTexture("400x720", 400, 720);
    _graphics.clear();

    _graphics.fillStyle(0x000000, 1);
    _graphics.fillRect(0, 0, 100, 720);
    _graphics.generateTexture("100x720", 100, 720);
    _graphics.clear();



    _graphics.fillStyle(0x00ff00, 1);
    _graphics.fillRect(0, 0, 20, 200);
    _graphics.generateTexture("energyBar", 20, 200);
    _graphics.clear();

    _graphics.fillStyle(0x000000, 1);
    _graphics.fillRect(0, 0, 20, 200);
    _graphics.generateTexture("energyBarMask", 20, 200);
    _graphics.clear();


    _graphics.fillStyle(0xffffff, .5);
    _graphics.fillCircle(75, 75, 75);
    _graphics.generateTexture("button", 150, 150);
    _graphics.clear();

    _graphics.destroy();


  }

  //il metodo create viene chiamato dopo il metodo preload
  create() {


    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
    
      this.registry.set("language", savedLanguage);

    }else{
      this.registry.set("language", language.english);
      localStorage.setItem("language", language.english+"");
    }

    //fermiamo la scena corrente
    this.scene.stop("Boot");
    //richiamiamo il metodo start della scena Preloader per
    //passare alla scena successiva
    this.scene.start("Preloader");

  }

  update(time: number, delta: number): void {



  }




}
