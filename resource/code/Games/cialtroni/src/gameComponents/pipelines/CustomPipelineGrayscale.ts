export default class CustomPipelineGrayscale extends Phaser.Renderer.WebGL
  .Pipelines.PostFXPipeline {
  private _time: number = 0;
  private _config: Phaser.Types.Renderer.WebGL.WebGLPipelineConfig;
  constructor(game: Phaser.Game) {
    super({
      game: game,
      name: "glitch",
      renderTarget: true,

      fragShader: `
precision mediump float;
                uniform sampler2D uMainSampler;
                varying vec2 outTexCoord;
                void main(void) {
                vec4 color = texture2D(uMainSampler, outTexCoord);
                float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                gl_FragColor = vec4(vec3(gray), 1.0);
                }
`,
    });

    //console.log(this.renderer.width, this.renderer.height);
    this._time = 0;
  }

  onBoot(): void {
    this.setTexture();
  }

  setTexture(texture: string = "__DEFAULT", resizeMode?: number): this {
    let phaserTexture = this.game.textures.getFrame(texture);

    if (!phaserTexture) {
      phaserTexture = this.game.textures.getFrame("__DEFAULT");
    }
    this.set1i("uMainSampler2", 1);
    this.setTexture2D();
    return this;
  }

  onPreRender() {
    this._time += 0.005;
    this.set1f("iTime", this._time);
    this.set2f("iResolution", this.renderer.width, this.renderer.height);
  }
}
