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
/**
 * Player-following vignette PostFX pipeline.
 *
 * This is a camera post-processing filter: it darkens pixels based on a vignette mask texture,
 * centered on a UV position (usually the player projected into the camera viewport).
 */
var PlayerVignettePostFX = /** @class */ (function (_super) {
    __extends(PlayerVignettePostFX, _super);
    function PlayerVignettePostFX(game, _config) {
        var _this = _super.call(this, {
            game: game,
            fragShader: "\n#define SHADER_NAME PLAYER_VIGNETTE_FS\n\nprecision mediump float;\n\nuniform sampler2D uMainSampler;\nuniform sampler2D uVignetteSampler;\n\nuniform vec2 uCenter;\nuniform float uRadius;\nuniform float uIntensity;\n\nvarying vec2 outTexCoord;\n\nvoid main ()\n{\n  vec4 base = texture2D(uMainSampler, outTexCoord);\n\n  float r = max(uRadius, 0.0001);\n  vec2 delta = (outTexCoord - uCenter) / r;\n\n  // Map a circle of radius r to the full 0..1 range of the vignette texture.\n  vec2 uv = delta * 0.5 + 0.5;\n\n  // Outside the mask texture, treat as no darkening.\n  float inside = step(0.0, uv.x) * step(0.0, uv.y) * step(uv.x, 1.0) * step(uv.y, 1.0);\n  float mask = texture2D(uVignetteSampler, uv).a * inside;\n\n  float dark = clamp(mask * uIntensity, 0.0, 1.0);\n  base.rgb *= (1.0 - dark);\n\n  gl_FragColor = base;\n}\n      ",
        }) || this;
        /** Mask texture key in the Texture Manager (alpha = darkness). */
        _this.maskKey = "vignette-mask";
        /** Center of the effect in normalized screen UV (0..1). */
        _this.centerX = 0.5;
        _this.centerY = 0.5;
        /** Radius in screen UV space (0..1). Smaller = tighter vignette. */
        _this.radius = 0.45;
        /** Intensity (0..1). 0 = no effect. */
        _this.intensity = 0.85;
        return _this;
    }
    /**
     * Renders the post effect: bind the mask texture as sampler1 and draw the full screen quad.
     */
    PlayerVignettePostFX.prototype.onDraw = function (source, _swapTarget) {
        // This is a variant of PostFXPipeline.bindAndDraw with an extra sampler bound to texture unit 1.
        var gl = this.gl;
        var renderer = this.renderer;
        this.bind();
        this.set1i("uMainSampler", 0);
        this.set1i("uVignetteSampler", 1);
        this.set2f("uCenter", this.centerX, this.centerY);
        this.set1f("uRadius", this.radius);
        this.set1f("uIntensity", this.intensity);
        var frame = this.game.textures.getFrame(this.maskKey);
        if (frame && frame.glTexture) {
            this.bindTexture(frame.glTexture, 1);
        }
        else {
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
    };
    return PlayerVignettePostFX;
}(Phaser.Renderer.WebGL.Pipelines.PostFXPipeline));
exports.default = PlayerVignettePostFX;
//# sourceMappingURL=PlayerVignettePostFX.js.map