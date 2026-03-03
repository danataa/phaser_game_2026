//viene importato un riferimento a gamedata per poter usare le variabili globali
import CustomPipelineCrt from "../components/shaders/CustomPipelineCrt";
import CustomPipelineGlitch from "../components/shaders/CustomPipelineGlitch";
import CustomPipelineBloodRain from "../components/shaders/CustomPipelineBloodRain";
import CustomPipelineRain from "../components/shaders/CustomPipelineRain";
import CustomPipelineFire  from "../components/shaders/CustomPipelineFire"; 
import CustomPipelineGlitch2 from "../components/shaders/CustomPipelineGlitch2";
import CustomPipelineWaterLights from "../components/shaders/CustomPipelineWaterLights";
import CustomPipelineWaterLights2 from "../components/shaders/CustomPipelineWaterLights2";
import { GameData } from "../GameData";

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
    this.cameras.main.setBackgroundColor("#000000");
    //precarichiamo l'immagine del logo
    this.load.image("logo", "assets/images/phaser.png");

   //  this.load.json("fragData", "assets/shaders.glsl.json");


  }

  //il metodo create viene chiamato dopo il metodo preload
  create() {

   
    const renderer = this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    renderer.pipelines.addPostPipeline("crt", CustomPipelineCrt);
    renderer.pipelines.addPostPipeline("glitch", CustomPipelineGlitch);
    renderer.pipelines.addPostPipeline("glitch2", CustomPipelineGlitch2);
    renderer.pipelines.addPostPipeline("bloodRain", CustomPipelineBloodRain);
    renderer.pipelines.addPostPipeline("waterLights", CustomPipelineWaterLights);
     renderer.pipelines.addPostPipeline("waterLights2", CustomPipelineWaterLights2);
        renderer.pipelines.addPostPipeline("fire", CustomPipelineFire);
             renderer.pipelines.addPostPipeline("rain", CustomPipelineRain);
   


    this.add.image(400, 300, "logo").setPostPipeline(CustomPipelineCrt).setPostPipeline(CustomPipelineGlitch);

      //this.cameras.main.setPostPipeline(CustomPipelineCrt);
     // this.cameras.main.setPostPipeline(CustomPipelineRain);
     // this.cameras.main.setPostPipeline(CustomPipelineRain);

  }






  update(time: number, delta: number): void {

    //this._text.angle += 1;

  }




}
