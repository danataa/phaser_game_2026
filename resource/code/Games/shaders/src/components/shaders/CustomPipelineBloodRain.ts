export default class CustomPipelineBloodRain extends Phaser.Renderer.WebGL
  .Pipelines.PostFXPipeline {
  private _time: number = 0;
  private _config: Phaser.Types.Renderer.WebGL.WebGLPipelineConfig;
  constructor(game: Phaser.Game) {
    super({
      game: game,
      name: "bloodRain",
      renderTarget: true,
      fragShader: `
precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D uMainSampler;
uniform sampler2D uNoiseSampler;

varying vec2 outTexCoord;

#define PI 3.141592653589793

float hash21(vec2 p)
{
    // Versione compatibile senza uvec2
    vec2 q = floor(p);
    q = fract(q * vec2(1597.334673, 3812.015801));
    float n = fract((q.x + q.y) * 1597.334673);
    return n;
}

vec3 hash13(float p) {
   vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787));
   p3 += dot(p3, p3.yzx + 19.19);
   return fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

float rainDrops(vec2 st, float t, float size)
{
    vec2 uv = st * size;
    uv.x *= resolution.x / resolution.y;
    vec2 gridUv = fract(uv) - 0.5;
    vec2 id = floor(uv);
    vec3 h = (hash13(id.x * 467.983 + id.y * 1294.387) - 0.5) * 0.8;
    vec2 dropUv = gridUv - h.xy;
    vec4 noise = texture2D(uNoiseSampler, id * 0.05);
    float drop = smoothstep(0.25, 0.0, length(dropUv)) *
        max(0.0, 1.0 - fract(t * (noise.b + 0.1) * 0.2 + noise.g) * 2.0);
    return drop;
}

vec2 wigglyDrops(vec2 st, float t, float size)
{
    vec2 wigglyDropAspect = vec2(2.0, 1.0);
    vec2 uv = st * size * wigglyDropAspect;
    uv.x *= resolution.x / resolution.y;
    uv.y += t * 0.23;

    vec2 gridUv = fract(uv) - 0.5;
    vec2 id = floor(uv);
    
    float h = hash21(id);
    t += h * 2.0 * PI;
    float w = st.y * 10.0;
    float dx = (h - 0.5) * 0.8;
    dx += (0.3 - abs(dx)) * pow(sin(w), 2.0) * sin(2.0 * w) *
        pow(cos(w), 3.0) * 1.05;
    float dy = -sin(t + sin(t + sin(t) * 0.5)) * 0.45;
    dy -= (gridUv.x - dx) * (gridUv.x - dx);
    
    vec2 dropUv = (gridUv - vec2(dx, dy)) / wigglyDropAspect;
    float drop = smoothstep(0.06, 0.0, length(dropUv));
    
    vec2 trailUv = (gridUv - vec2(dx, t * 0.23)) / wigglyDropAspect;
    trailUv.y = (fract((trailUv.y) * 8.0) - 0.5) / 8.0;
    float trailDrop = smoothstep(0.03, 0.0, length(trailUv));
    trailDrop *= smoothstep(-0.05, 0.05, dropUv.y) * smoothstep(0.4, dy, gridUv.y) *
        (1.0 - step(0.4, gridUv.y));
    
    float fogTrail = smoothstep(-0.05, 0.05, dropUv.y) * smoothstep(0.4, dy, gridUv.y) *
        smoothstep(0.05, 0.01, abs(dropUv.x)) * (1.0 - step(0.4, gridUv.y));
    
    return vec2(drop + trailDrop, fogTrail);
}

vec2 getDrops(vec2 st, float t)
{
    vec2 largeDrops = wigglyDrops(st, t * 2.0, 1.6);
    vec2 mediumDrops = wigglyDrops(st + 2.65, (t + 1296.675) * 1.4, 2.5);
    vec2 smallDrops = wigglyDrops(st - 1.67, t - 896.431, 3.6);
    float rain = rainDrops(st, t, 20.0);
    
    vec2 drops;
    drops.y = max(largeDrops.y, max(mediumDrops.y, smallDrops.y));
    drops.x = smoothstep(0.4, 2.0, (1.0 - drops.y) * rain + largeDrops.x +
                          mediumDrops.x + smallDrops.x);

    return drops;
}

void main()
{
    vec2 st = outTexCoord;
    float t = mod(time + 100.0, 7200.0);
    
    vec2 drops = getDrops(st, t);
    vec2 offset = drops.xy;
    float lod = (1.0 - drops.y) * 4.8;
    
    vec2 dropsX = getDrops(st + vec2(0.001, 0.0), t);
    vec2 dropsY = getDrops(st + vec2(0.0, 0.001), t);
    vec3 normal = vec3(dropsX.x - drops.x, dropsY.x - drops.x, 0.0);
    normal.z = sqrt(1.0 - normal.x * normal.x - normal.y * normal.y);
    normal = normalize(normal);
    
    float lightning = sin(t * sin(t * 30.0));
    float lightningTime = mod(t, 10.0) / 9.9;
    lightning *= 1.0 - smoothstep(0.0, 0.1, lightningTime)
        + smoothstep(0.9, 1.0, lightningTime);
    
    vec3 col = texture2D(uMainSampler, st + normal.xy * 3.0).rgb;
    col *= (1.0 + lightning);
    
    col *= vec3(1.0, 0.8, 0.7);
    col += (drops.y > 0.0 ? vec3(0.5, -0.1, -0.15) * drops.y : vec3(0.0));
    col *= (drops.x > 0.0 ? vec3(0.8, 0.2, 0.1) * (1.0 - drops.x) : vec3(1.0));
    
    col = mix(col, col * smoothstep(0.8, 0.35, length(st - 0.5)), 0.6);
    
    gl_FragColor = vec4(col, 1.0);
}
`
    });

    //console.log(this.renderer.width, this.renderer.height);
    this._time = 0;
  }

  onBoot(): void {
    //this.setTexture();
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
    this.set1f("time", this._time);
    this.set2f("resolution", this.renderer.width, this.renderer.height);
  }
}
