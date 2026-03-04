export default class CustomPipelineWaterLights extends Phaser.Renderer.WebGL.Pipelines
  .PostFXPipeline {
  private _time: number = 0;
  private _config: Phaser.Types.Renderer.WebGL.WebGLPipelineConfig;
  constructor(game: Phaser.Game) {
    super({
      game: game,
      name: "waterLights",
      renderTarget: true,
      fragShader: `
   precision mediump float;   
uniform float     iTime;
uniform vec2      iResolution;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
vec2 uv;

float GodRay(float scale,float threshold,float speed,float angle){
	float value = pow(sin((uv.x+uv.y*angle+iTime*speed)*scale),6.0);
    value+=float(threshold<value);
    return float(threshold<(sin((uv.x+uv.y*angle+iTime*speed)*scale)));
    
    //return clamp(value,0.0,1.0); 
}

void main(void)
{
	uv = gl_FragCoord.xy / iResolution.xy;
    
    float light = GodRay(22.0,0.5,-0.003,0.2)*	0.3;
    light+=GodRay(47.0,	0.99,	0.02,	0.2)*	0.1;
    light+=GodRay(25.0,0.9,		-0.01,	0.2)*	0.2;
    light+=GodRay(52.0,	0.4,	0.0001,	0.2)*	0.1;
    light+=GodRay(49.0,	0.4,	0.0003,	0.2)*	0.1;
    light+=GodRay(57.0,	0.4,	-0.0001,0.2)*	0.1;
    light+=GodRay(200.0,0.8,	-0.0001,0.2)*	0.05;
    light-=pow((1.0-uv.y)*0.7,0.8);
    light=max(light,0.0);
    
    vec3 LightColor = vec3(1.0,0.95,0.85);
    
    // Campiona la texture sottostante
    vec4 texColor = texture2D(uMainSampler, uv);
    
    // Blend additivo: aggiungi i raggi alla texture esistente
    vec3 finalColor = texColor.rgb + light * LightColor * 0.9;
    
    // Usa l'intensità della luce per l'alpha
    float alpha = texColor.a + light * 0.1;
    
    gl_FragColor = vec4(finalColor, alpha);
}
`,
    });
   // console.log(this.renderer.width, this.renderer.height);
    this._time = 0;
  }
  onPreRender() {
    this._time += 0.005;
    this.set1f("iTime", this._time);
    this.set2f("iResolution", this.renderer.width, this.renderer.height);
  }
}
