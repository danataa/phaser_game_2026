export default class CustomPipelineWaterLights2 extends Phaser.Renderer.WebGL.Pipelines
  .PostFXPipeline {
  private _time: number = 0;
  private _config: Phaser.Types.Renderer.WebGL.WebGLPipelineConfig;
  constructor(game: Phaser.Game) {
    super({
      game: game,
      name: "waterLights2",
      renderTarget: true,
      fragShader: `
precision mediump float;   
uniform float     iTime;
uniform vec2      iResolution;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed)
{
	vec2 sourceToCoord = coord - raySource;
	float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
	
	return clamp(
		(0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
		(0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
		0.0, 1.0) *
		clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main( void )
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
	vec2 coord = gl_FragCoord.xy;
	
	// Set the parameters of the sun rays (positioned at the top)
	vec2 rayPos1 = vec2(iResolution.x * 0.7, iResolution.y * 1.4);
	vec2 rayRefDir1 = normalize(vec2(1.0, 0.116));
	float raySeedA1 = 36.2214;
	float raySeedB1 = 21.11349;
	float raySpeed1 = 1.5;
	
	vec2 rayPos2 = vec2(iResolution.x * 0.8, iResolution.y * 1.6);
	vec2 rayRefDir2 = normalize(vec2(1.0, -0.241));
	const float raySeedA2 = 22.39910;
	const float raySeedB2 = 18.0234;
	const float raySpeed2 = 1.1;
	
	// Calculate the strength of the caustics
	float caustics1 = rayStrength(rayPos1, rayRefDir1, coord, raySeedA1, raySeedB1, raySpeed1);
	float caustics2 = rayStrength(rayPos2, rayRefDir2, coord, raySeedA2, raySeedB2, raySpeed2);
	
	float totalCaustics = caustics1 * 0.5 + caustics2 * 0.4;
	
	// Attenuate brightness towards the bottom, simulating light-loss due to depth
	float brightness = 1.0 - (coord.y / iResolution.y);
	
	// Create the caustic light color with blue-green tinge
	vec3 causticColor = vec3(
		0.1 + (brightness * 0.8),
		0.3 + (brightness * 0.6), 
		0.5 + (brightness * 0.5)
	);
	
	// Sample the underlying texture
	vec4 texColor = texture2D(uMainSampler, uv);
	
	// Blend additively: add caustics to existing texture
	vec3 finalColor = texColor.rgb + totalCaustics * causticColor * 0.8;
	
	// Use the texture's alpha plus caustic intensity for transparency
	float alpha = texColor.a + totalCaustics * 0.2;
	
	gl_FragColor = vec4(finalColor, alpha);
}
`,
    });
   // console.log(this.renderer.width, this.renderer.height);
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
