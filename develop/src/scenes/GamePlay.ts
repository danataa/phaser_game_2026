import Phaser from "phaser";
import MapManager from "../game_components/MapManager";
import Merchant from "../game_components/Merchant";
import Player from "../game_components/Player";
import WaveManager from "../game_components/WaveManager";
import PerkAOE from "../game_components/perks/PerkAOE";
import PerkDash from "../game_components/perks/PerkDash";

// Scena principale di gioco: crea mappa, player, shop e wave.
export default class GamePlay extends Phaser.Scene {
  private static readonly INTER_WAVE_MAX_MS: number = 60000;
  private static readonly SHOP_INTERACTION_RADIUS_PX: number = 150;

  private readonly _defaultMusicVolume: number = 0.4;

  private _player: Player;
  private _merchant: Merchant;
  private _waveManager: WaveManager;
  private _mapManager: MapManager;
  private _enemyGroup: Phaser.Physics.Arcade.Group;

  private _interWaveTimer: Phaser.Time.TimerEvent | null = null;
  private _interWaveEndsAtMs: number = 0;
  private _isInterWaveActive: boolean = false;
  private _pendingNextWave: number = 1;
  private _isPlayerNearMerchant: boolean = false;
  private _shopInteractKey: Phaser.Input.Keyboard.Key | null = null;
  private _skipInterWaveKey: Phaser.Input.Keyboard.Key | null = null;

  constructor() {
    super({ key: "GamePlay" });
  }

  init(): void {
    /**
     * Phaser restarts reuse the same scene instance, therefore transient flags
     * must be reset here to guarantee wave 1 boot behavior after GameOver.
     */
    this._resetRuntimeState();
  }

  get player(): Player {
    return this._player;
  }

  get merchant(): Merchant {
    return this._merchant;
  }

  get waveManager(): WaveManager {
    return this._waveManager;
  }

  get mapManager(): MapManager {
    return this._mapManager;
  }

  get isInterWaveActive(): boolean {
    return this._isInterWaveActive;
  }

  get interWaveRemainingMs(): number {
    if (!this._isInterWaveActive) {
      return 0;
    }

    return Math.max(0, this._interWaveEndsAtMs - this.time.now);
  }

  get canOpenShopAtMerchant(): boolean {
    return (
      this._isInterWaveActive &&
      this._isPlayerNearMerchant &&
      !this._merchant?.shopAperto
    );
  }

  create(): void {
    /**
     * Audio playback must never block GamePlay init, otherwise wave timers
     * would not be created and the core loop would appear frozen.
     */
    const hasGameMusic = this.cache.audio.exists("game_music");
    const gameMusic = this.sound.get("game_music");
    const isGameMusicPlaying = gameMusic?.isPlaying ?? false;
    if (hasGameMusic && !isGameMusicPlaying) {
      try {
        this.sound.play("game_music", {
          loop: true,
          volume: this._defaultMusicVolume,
        });
      } catch (_error) {
        console.warn("Audio game_music non disponibile.");
      }
    }

    if (!this.scene.isActive("Hud")) {
      this.scene.launch("Hud");
    }
    this.scene.bringToTop("Hud");

    this._mapManager = new MapManager(this);

    this._player = new Player(
      this,
      (this._mapManager.widthInPixels / 2) -50,
      400,
    );
    this._player.setScale(2);

    this._player.setPerkSlotQ(new PerkAOE(this._player, 120, 50, 2000));
    this._player.setPerkSlotE(new PerkDash(this._player, 1800, 110, 1200));

    this._mapManager.addCollider(this._player);
    this._mapManager.setupCamera(this._player);

    this._merchant = new Merchant(
      this,
      this._mapManager.widthInPixels / 2,
      this._mapManager.heightInPixels / 2,
    );
    this._merchant.setInteractionEnabled(false);
    this._mapManager.addCollider(this._merchant);
    this.physics.add.collider(this._player, this._merchant);

    this._enemyGroup = this.physics.add.group({ runChildUpdate: true });
    this._waveManager = new WaveManager(this, this._enemyGroup);

    const keyboard = this.input.keyboard;
    if (keyboard) {
      this._shopInteractKey = keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.F,
      );
      this._skipInterWaveKey = keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      );
    }

    this.registry.set("current-score", this._player.anime);
    this.registry.set("final-score", this._player.anime);

    this.events.on("score-delta", this._onScoreDelta, this);
    this.events.on("update-score", this._onUpdateScore, this);
    this.events.on("wave-complete", this._onWaveComplete, this);
    this.events.on("shop-chiuso", this._onShopClosed, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._onShutdown, this);

    this._waveManager.startWave(1);
  }

  update(): void {
    this._player?.update();
    this._merchant?.update(this._player.x, this._player.y);
    this._waveManager?.update();
    this._updateInterWaveState();

    /**
     * The transition is kept in this scene because HP authority lives on the
     * Player object updated in this loop, guaranteeing a single handoff point.
     */
    if (this._player.getHp <= 0) {
      this.scene.start("GameOver");
    }
  }

  private _onScoreDelta(soulsValue: number): void {
    this._player.raccogliAnime(soulsValue);
  }

  private _resetRuntimeState(): void {
    this._cancelInterWaveTimer();
    this._isInterWaveActive = false;
    this._interWaveEndsAtMs = 0;
    this._pendingNextWave = 1;
    this._isPlayerNearMerchant = false;
  }

  private _onUpdateScore(currentScore: number): void {
    this.registry.set("current-score", currentScore);
    this.registry.set("final-score", currentScore);
  }

  private _onWaveComplete(completedWave: number): void {
    this._startInterWave(completedWave + 1);
  }

  private _startInterWave(nextWave: number): void {
    this._cancelInterWaveTimer();

    this._pendingNextWave = Math.max(1, nextWave);
    this._isInterWaveActive = true;
    this._isPlayerNearMerchant = false;
    this._interWaveEndsAtMs = this.time.now + GamePlay.INTER_WAVE_MAX_MS;
    this._merchant.refreshStock(this._pendingNextWave);

    this._interWaveTimer = this.time.delayedCall(
      GamePlay.INTER_WAVE_MAX_MS,
      () => {
        this._startPendingWaveNow();
      },
    );
  }

  private _updateInterWaveState(): void {
    if (!this._isInterWaveActive || this._merchant.shopAperto) {
      return;
    }

    this._isPlayerNearMerchant = this._isPlayerWithinShopRange();

    if (
      this._isPlayerNearMerchant &&
      this._shopInteractKey &&
      Phaser.Input.Keyboard.JustDown(this._shopInteractKey)
    ) {
      this._merchant.apriShopEsterno();
      return;
    }

    if (
      this._skipInterWaveKey &&
      Phaser.Input.Keyboard.JustDown(this._skipInterWaveKey)
    ) {
      this._startPendingWaveNow();
    }
  }

  private _isPlayerWithinShopRange(): boolean {
    const merchantBody = this._merchant.body as Phaser.Physics.Arcade.Body;

    if (!merchantBody) {
      const fallbackDistance = Phaser.Math.Distance.Between(
        this._player.x,
        this._player.y,
        this._merchant.x,
        this._merchant.y,
      );
      return fallbackDistance <= GamePlay.SHOP_INTERACTION_RADIUS_PX;
    }

    const closestX = Phaser.Math.Clamp(
      this._player.x,
      merchantBody.left,
      merchantBody.right,
    );
    const closestY = Phaser.Math.Clamp(
      this._player.y,
      merchantBody.top,
      merchantBody.bottom,
    );

    const distance = Phaser.Math.Distance.Between(
      this._player.x,
      this._player.y,
      closestX,
      closestY,
    );

    return distance <= GamePlay.SHOP_INTERACTION_RADIUS_PX;
  }

  private _startPendingWaveNow(): void {
    if (!this._isInterWaveActive) {
      return;
    }

    this._cancelInterWaveTimer();
    this._isInterWaveActive = false;
    this._isPlayerNearMerchant = false;
    this._interWaveEndsAtMs = 0;

    this._waveManager.startWave(this._pendingNextWave);
  }

  private _cancelInterWaveTimer(): void {
    if (!this._interWaveTimer) {
      return;
    }

    this._interWaveTimer.remove(false);
    this._interWaveTimer = null;
  }

  private _onShopClosed(): void {
    if (!this._isInterWaveActive) {
      return;
    }

    this._startPendingWaveNow();
  }

  private _onShutdown(): void {
    if (this.scene.isActive("Hud")) {
      this.scene.stop("Hud");
    }

    this.registry.set("final-score", this._player.anime);
    this.registry.set("current-score", this._player.anime);
    this.events.off("score-delta", this._onScoreDelta, this);
    this.events.off("update-score", this._onUpdateScore, this);
    this.events.off("wave-complete", this._onWaveComplete, this);
    this.events.off("shop-chiuso", this._onShopClosed, this);
    this._cancelInterWaveTimer();
    this._waveManager.stop();
  }
}
