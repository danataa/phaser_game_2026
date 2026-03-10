/**
 * Player-following vignette PostFX pipeline.
 *
 * This is a camera post-processing filter: it darkens pixels based on a vignette mask texture,
 * centered on a UV position (usually the player projected into the camera viewport).
 */
export default class PlayerVignettePostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  /** Mask texture key in the Texture Manager (alpha = darkness). */
  public maskKey: string = "vignette-mask";

  /** Center of the effect in normalized screen UV (0..1). */
  public centerX: number = 0.5;
  public centerY: number = 0.5;

  /** Radius in screen UV space (0..1). Smaller = tighter vignette. */
  public radius: number = 0.45;

  /** Intensity (0..1). 0 = no effect. */
  public intensity: number = 0.85;

  constructor(game: Phaser.Game, _config?: unknown) {
    super({
      game,
      fragShader: `
#define SHADER_NAME PLAYER_VIGNETTE_FS

precision mediump float;

uniform sampler2D uMainSampler;
uniform sampler2D uVignetteSampler;

uniform vec2 uCenter;
uniform float uRadius;
uniform float uIntensity;

varying vec2 outTexCoord;

void main ()
{
  vec4 base = texture2D(uMainSampler, outTexCoord);

  float r = max(uRadius, 0.0001);
  vec2 delta = (outTexCoord - uCenter) / r;

  // Map a circle of radius r to the full 0..1 range of the vignette texture.
  vec2 uv = delta * 0.5 + 0.5;

  // Outside the mask texture, treat as no darkening.
  float inside = step(0.0, uv.x) * step(0.0, uv.y) * step(uv.x, 1.0) * step(uv.y, 1.0);
  float mask = texture2D(uVignetteSampler, uv).a * inside;

  float dark = clamp(mask * uIntensity, 0.0, 1.0);
  base.rgb *= (1.0 - dark);

  gl_FragColor = base;
}
      `,
    });
  }

  /**
   * Renders the post effect: bind the mask texture as sampler1 and draw the full screen quad.
   */
  onDraw(source: Phaser.Renderer.WebGL.RenderTarget, _swapTarget?: Phaser.Renderer.WebGL.RenderTarget) {
    // This is a variant of PostFXPipeline.bindAndDraw with an extra sampler bound to texture unit 1.
    const gl = this.gl;
    const renderer: any = this.renderer as any;

    this.bind();

    this.set1i("uMainSampler", 0);
    this.set1i("uVignetteSampler", 1);
    this.set2f("uCenter", this.centerX, this.centerY);
    this.set1f("uRadius", this.radius);
    this.set1f("uIntensity", this.intensity);

    const frame = this.game.textures.getFrame(this.maskKey) as any;
    if (frame && frame.glTexture) {
      this.bindTexture(frame.glTexture, 1);
    } else {
      this.bindTexture(renderer.whiteTexture, 1);
    }

    // Draw to whatever is next on the FBO stack (usually the game canvas for camera post-fx).
    renderer.popFramebuffer(false, false);

    if (!renderer.currentFramebuffer) {
      gl.viewport(0, 0, renderer.width, renderer.height);
    }

    renderer.restoreStencilMask();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source.texture.webGLTexture);

    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
