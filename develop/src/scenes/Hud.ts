import type Perk from "../game_components/perks/Perk";

type PerkSlot = "Q" | "E";

interface IPerkSlotUi {
  container: Phaser.GameObjects.Container;
  icon: Phaser.GameObjects.Rectangle;
  iconLabel: Phaser.GameObjects.Text;
  cooldownMask: Phaser.GameObjects.Rectangle;
  keyLabel: Phaser.GameObjects.Text;
  perk: Perk | null;
}

interface IGamePlayHudBridge {
  events: Phaser.Events.EventEmitter;
  waveManager?: {
    currentWave: number;
  };
  isInterWaveActive: boolean;
  interWaveRemainingMs: number;
  canOpenShopAtMerchant: boolean;
  player: {
    getHp: number;
    getHpMax: () => number;
    perkSlotQ: Perk | null;
    perkSlotE: Perk | null;
  };
}

// Scena overlay per l'interfaccia utente (HUD)
export default class Hud extends Phaser.Scene {
  private _gamePlayScene: IGamePlayHudBridge | null = null;
  private _healthBarBackground: Phaser.GameObjects.Rectangle;
  private _healthBar: Phaser.GameObjects.Rectangle;
  private _healthBarBaseWidth: number = 374;
  private _healthValueText: Phaser.GameObjects.Text;
  private _waveIndicatorText: Phaser.GameObjects.Text;
  private _interWaveText: Phaser.GameObjects.Text;
  private _merchantHintText: Phaser.GameObjects.Text;
  private _slotQ: IPerkSlotUi;
  private _slotE: IPerkSlotUi;

  constructor() {
    super({ key: "Hud" });
  }

  /**
   * We keep HUD in a dedicated scene so UI concerns stay isolated from combat
   * systems and can be iterated without coupling camera/world logic.
   */
  create(): void {
    this._gamePlayScene = this.scene.get("GamePlay") as unknown as
      IGamePlayHudBridge;
    this.scene.bringToTop("Hud");

    this._buildPlayerHpBar();
    this._buildWaveIndicator();
    this._buildInterWaveTexts();
    this._slotQ = this._buildPerkSlot("Q", 26, 975);
    this._slotE = this._buildPerkSlot("E", 124, 975);

    this._wireEvents();
    this._syncInitialState();

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this._onShutdown,
      this,
    );
  }

  update(): void {
    this._updateSlotCooldown(this._slotQ);
    this._updateSlotCooldown(this._slotE);
    this._updateWaveIndicator();
    this._updateInterWaveUi();
  }

  private _buildWaveIndicator(): void {
    this._waveIndicatorText = this.add.text(
      this.cameras.main.width - 40,
      20,
      "1",
      {
        fontFamily: "'Press Start 2P'",
        fontSize: "30px",
        color: "#fff0c9",
        stroke: "#3d1a00",
        strokeThickness: 3,
      },
    );
    this._waveIndicatorText.setOrigin(1, 0);
    this._waveIndicatorText.setScrollFactor(0);
    this._waveIndicatorText.setDepth(1006);
  }

  private _buildInterWaveTexts(): void {
    this._interWaveText = this.add.text(
      this.cameras.main.width / 2,
      58,
      "",
      {
        fontFamily: "'Press Start 2P'",
        fontSize: "12px",
        color: "#ffe29a",
        stroke: "#3d1a00",
        strokeThickness: 3,
      },
    );
    this._interWaveText.setOrigin(0.5, 0);
    this._interWaveText.setScrollFactor(0);
    this._interWaveText.setDepth(1007);
    this._interWaveText.setVisible(false);

    this._merchantHintText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 76,
      "",
      {
        fontFamily: "'Press Start 2P'",
        fontSize: "12px",
        color: "#fff8e7",
        stroke: "#3d1a00",
        strokeThickness: 3,
      },
    );
    this._merchantHintText.setOrigin(0.5, 0.5);
    this._merchantHintText.setScrollFactor(0);
    this._merchantHintText.setDepth(1007);
    this._merchantHintText.setVisible(false);
  }

  private _buildPlayerHpBar(): void {
    const x =
      (this.cameras.main.width - this._healthBarBaseWidth) * 0.5;
    const y = 18;
    const height = 18;

    this._healthBarBackground = this.add.rectangle(
      x,
      y,
      this._healthBarBaseWidth,
      height,
      0x7f1111,
      1,
    );
    this._healthBarBackground.setOrigin(0, 0);
    this._healthBarBackground.setScrollFactor(0);
    this._healthBarBackground.setDepth(1004);
    this._healthBarBackground.setStrokeStyle(2, 0x3d1a00, 0.9);

    this._healthBar = this.add.rectangle(
      x,
      y,
      this._healthBarBaseWidth,
      height,
      0x42c86f,
      1,
    );
    this._healthBar.setOrigin(0, 0);
    this._healthBar.setScrollFactor(0);
    this._healthBar.setDepth(1005);

    this._healthValueText = this.add.text(
      x + this._healthBarBaseWidth - 4,
      y + height / 2,
      "0 / 0",
      {
        fontFamily: "'Press Start 2P'",
        fontSize: "9px",
        color: "#fff8e7",
        stroke: "#3d1a00",
        strokeThickness: 3,
      },
    );
    this._healthValueText.setOrigin(1, 0.5);
    this._healthValueText.setScrollFactor(0);
    this._healthValueText.setDepth(1006);
  }

  /**
   * A container keeps each perk slot atomic (label, icon, cooldown) so layout
   * and future skinning can evolve without touching gameplay event contracts.
   */
  private _buildPerkSlot(
    slotKey: PerkSlot,
    x: number,
    y: number,
  ): IPerkSlotUi {
    const container = this.add.container(x, y);
    container.setScrollFactor(0);
    container.setDepth(1008);

    const frameShadow = this.add.rectangle(4, 4, 76, 76, 0x000000, 0.35);
    frameShadow.setOrigin(0, 0);
    frameShadow.setScrollFactor(0);

    const frame = this.add.rectangle(0, 0, 76, 76, 0xc8904a, 1);
    frame.setOrigin(0, 0);
    frame.setStrokeStyle(3, 0x5a2e0a, 1);
    frame.setScrollFactor(0);

    const frameInner = this.add.rectangle(5, 5, 66, 66, 0xeecb8e, 1);
    frameInner.setOrigin(0, 0);
    frameInner.setStrokeStyle(2, 0x8b5a2b, 0.85);
    frameInner.setScrollFactor(0);

    const icon = this.add.rectangle(10, 24, 56, 42, 0x7e7e7e, 1);
    icon.setOrigin(0, 0);
    icon.setStrokeStyle(2, 0x3d1a00, 0.85);
    icon.setScrollFactor(0);

    const iconLabel = this.add.text(38, 45, "--", {
      fontFamily: "'Press Start 2P'",
      fontSize: "8px",
      color: "#fff8e7",
      stroke: "#3d1a00",
      strokeThickness: 2,
    });
    iconLabel.setOrigin(0.5, 0.5);
    iconLabel.setScrollFactor(0);

    const cooldownMask = this.add.rectangle(10, 24, 56, 42, 0x000000, 0.58);
    cooldownMask.setOrigin(0, 0);
    cooldownMask.setScrollFactor(0);

    const keyLabel = this.add.text(8, 6, slotKey, {
      fontFamily: "'Press Start 2P'",
      fontSize: "12px",
      color: "#3d1a00",
      stroke: "#f5e3b7",
      strokeThickness: 2,
    });
    keyLabel.setScrollFactor(0);

    container.add(frameShadow);
    container.add(frame);
    container.add(frameInner);
    container.add(icon);
    container.add(iconLabel);
    container.add(cooldownMask);
    container.add(keyLabel);

    return {
      container,
      icon,
      iconLabel,
      cooldownMask,
      keyLabel,
      perk: null,
    };
  }

  private _wireEvents(): void {
    this.scene.get("GamePlay").events.on(
      "update-hp",
      this._onUpdateHp,
      this,
    );
    this.scene.get("GamePlay").events.on(
      "perk-equipped",
      this._onPerkEquipped,
      this,
    );
  }

  private _syncInitialState(): void {
    const player = this._gamePlayScene?.player;
    if (!player) {
      return;
    }

    this._onUpdateHp(player.getHp, player.getHpMax());

    if (player.perkSlotQ) {
      this._onPerkEquipped("Q", player.perkSlotQ);
    }

    if (player.perkSlotE) {
      this._onPerkEquipped("E", player.perkSlotE);
    }

    this._updateWaveIndicator();
  }

  private _updateWaveIndicator(): void {
    const waveValue = this._gamePlayScene?.waveManager?.currentWave;
    const wave = Math.max(1, waveValue ?? 1);
    this._waveIndicatorText.setText("" + wave);
  }

  private _updateInterWaveUi(): void {
    if (!this._gamePlayScene?.isInterWaveActive) {
      this._interWaveText.setVisible(false);
      this._merchantHintText.setVisible(false);
      return;
    }

    const remainingMs = Math.max(0, this._gamePlayScene.interWaveRemainingMs);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    this._interWaveText.setText(
      "Alla prossima orda: "
      + remainingSeconds
      + "s  [SPACE] Inizia subito",
    );
    this._interWaveText.setVisible(true);

    if (this._gamePlayScene.canOpenShopAtMerchant) {
      this._merchantHintText.setText("Premi F per commerciare");
      this._merchantHintText.setVisible(true);
      return;
    }

    this._merchantHintText.setVisible(false);
  }

  private _onUpdateHp(currentHp: number, maxHp: number): void {
    const safeMaxHp = Math.max(1, maxHp);
    const ratio = Phaser.Math.Clamp(currentHp / safeMaxHp, 0, 1);
    this._healthBar.width = ratio * this._healthBarBaseWidth;
    this._healthValueText.setText(currentHp + " / " + safeMaxHp);
  }

  private _onPerkEquipped(slot: PerkSlot, perk: Perk | null): void {
    const slotUi = slot === "Q" ? this._slotQ : this._slotE;
    slotUi.perk = perk;

    if (!perk) {
      slotUi.icon.setFillStyle(0x7e7e7e, 1);
      slotUi.iconLabel.setText("--");
      slotUi.cooldownMask.visible = false;
      return;
    }

    const iconStyle = this._resolvePerkIconStyle(perk.constructor.name);
    slotUi.icon.setFillStyle(iconStyle.color, 1);
    slotUi.iconLabel.setText(iconStyle.label);
    slotUi.cooldownMask.visible = true;
  }

  /**
   * Cooldown is represented as remaining ratio to total delay because this is
   * frame-rate independent and maps directly to Perk's time-based contract.
   */
  private _updateSlotCooldown(slotUi: IPerkSlotUi): void {
    if (!slotUi.perk) {
      slotUi.cooldownMask.visible = false;
      return;
    }

    const totalDelay = Math.max(1, slotUi.perk.delayMs);
    const remaining = Math.max(0, slotUi.perk.remainingCooldownMs);
    const ratio = Phaser.Math.Clamp(remaining / totalDelay, 0, 1);

    slotUi.cooldownMask.visible = ratio > 0;
    slotUi.cooldownMask.height = 42 * ratio;
    slotUi.cooldownMask.y = 24 + (42 - slotUi.cooldownMask.height);
  }

  private _resolvePerkIconStyle(
    perkName: string,
  ): { color: number; label: string } {
    if (perkName === "PerkAOE") {
      return { color: 0x4d8cff, label: "AOE" };
    }

    if (perkName === "PerkDash") {
      return { color: 0xffaa33, label: "DSH" };
    }

    if (perkName === "PerkCura") {
      return { color: 0x42c86f, label: "HEAL" };
    }

    return { color: 0x999999, label: "PRK" };
  }

  private _onShutdown(): void {
    this.scene.get("GamePlay").events.off(
      "update-hp",
      this._onUpdateHp,
      this,
    );
    this.scene.get("GamePlay").events.off(
      "perk-equipped",
      this._onPerkEquipped,
      this,
    );
    this._gamePlayScene = null;
  }
}
