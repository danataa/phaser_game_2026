import Phaser from "phaser";
import Merchant from "../game_components/Merchant";
import GamePlay from "./GamePlay";

enum TutorialStep {
  Movement = 0,
  Attack = 1,
  Perk = 2,
  Merchant = 3,
  Done = 4,
}

export default class TutorialScene extends Phaser.Scene {
  private static readonly MOVE_TARGET_PX: number = 180;
  private static readonly TYPING_INTERVAL_MS: number = 18;
  private static readonly DIALOG_WIDTH_PX: number = 920;
  private static readonly DIALOG_HEIGHT_PX: number = 180;
  private static readonly FONT_KEY: string = "tutorial_bitmap_font";
  private static readonly MERCHANT_REACH_DISTANCE_PX: number = 220;
  private static readonly MERCHANT_REACH_PADDING_PX: number = 80;
  private static readonly ARROW_SCREEN_MARGIN_PX: number = 90;
  private static readonly ARROW_TWEEN_MS: number = 550;
  private static readonly COLOR_SHADOW: number = 0x000000;
  private static readonly COLOR_PARCHMENT_OUTER: number = 0xc8904a;
  private static readonly COLOR_PARCHMENT_MID: number = 0xe2b978;
  private static readonly COLOR_PARCHMENT_INNER: number = 0xeecb8e;
  private static readonly COLOR_BORDER_DARK: number = 0x5a2e0a;
  private static readonly COLOR_BORDER_MID: number = 0x8b5a2b;
  private static readonly COLOR_TEXT_DARK: number = 0x2a1000;

  private _gamePlayScene: GamePlay | null = null;
  private _dialogBox: Phaser.GameObjects.Rectangle | null = null;
  private _dialogMidBox: Phaser.GameObjects.Rectangle | null = null;
  private _dialogOuterBox: Phaser.GameObjects.Rectangle | null = null;
  private _dialogShadow: Phaser.GameObjects.Rectangle | null = null;
  private _dialogText: Phaser.GameObjects.BitmapText | null = null;
  private _currentStep: TutorialStep = TutorialStep.Movement;
  private _fullMessage: string = "";
  private _typedChars: number = 0;
  private _nextTypeAtMs: number = 0;
  private _moveDistancePx: number = 0;
  private _lastPlayerX: number = 0;
  private _lastPlayerY: number = 0;
  private _hasPlayerPosition: boolean = false;
  private _stepDelayTimer: Phaser.Time.TimerEvent | null = null;
  private _keyQ: Phaser.Input.Keyboard.Key | null = null;
  private _keyE: Phaser.Input.Keyboard.Key | null = null;
  private _merchantArrow: Phaser.GameObjects.Triangle | null = null;
  private _merchantReached: boolean = false;
  private _merchantDialogTimer: Phaser.Time.TimerEvent | null = null;
  private _merchantCallBgHideTimer: Phaser.Time.TimerEvent | null = null;
  private _merchantDialogIndex: number = 0;

  private readonly _merchantDialogLines: string[] = [
    "Sono solo un umile demone capitalista, ",
    " qui per le tue anime.",
    " Niente anime, niente affari. ",
    " Capito, cavaliere?",
    "Raccogli anime sconfiggendo i nemici:",
    "sono la tua valuta di gioco.",
    "Avvicinati a me tra un'ondata e l'altra",
    "e premi F per aprire lo shop.",
    "Nel negozio compri perk temporanei",
    "e potenziamenti permanenti.",
  ];

  constructor() {
    super({ key: "Tutorial" });
  }

  create(): void {
    this._gamePlayScene = this.scene.get("GamePlay") as GamePlay;
    this._ensureBitmapFont();
    this._createDialogUI();

    const keyboard = this.input.keyboard;
    if (keyboard) {
      this._keyQ = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this._keyE = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._onShutdown, this);
    this._showCurrentStepMessage();
  }

  update(): void {
    this._updateTyping();

    if (!this._gamePlayScene?.player) {
      return;
    }

    if (this._currentStep === TutorialStep.Movement) {
      this._updateMoveDistance();

      if (this._moveDistancePx >= TutorialScene.MOVE_TARGET_PX) {
        this.nextStep();
      }
      return;
    }

    if (this._currentStep === TutorialStep.Perk) {
      if (!this._keyQ || !this._keyE) {
        return;
      }

      const usedQ = Phaser.Input.Keyboard.JustDown(this._keyQ);
      const usedE = Phaser.Input.Keyboard.JustDown(this._keyE);

      if (usedQ || usedE) {
        this.nextStep();
      }
      return;
    }

    if (this._currentStep === TutorialStep.Merchant) {
      this._updateMerchantTutorial();
      return;
    }
  }

  nextStep(): void {
    if (this._currentStep === TutorialStep.Movement) {
      this._currentStep = TutorialStep.Attack;
      this._showCurrentStepMessage();
      return;
    }

    if (this._currentStep === TutorialStep.Attack) {
      this._currentStep = TutorialStep.Perk;
      this._showCurrentStepMessage();
      return;
    }

    if (this._currentStep === TutorialStep.Perk) {
      this._currentStep = TutorialStep.Merchant;
      this._showCurrentStepMessage();
      return;
    }

    if (this._currentStep === TutorialStep.Merchant) {
      this._currentStep = TutorialStep.Done;
      this._finishTutorial();
      return;
    }

    this._finishTutorial();
  }

  private _onAttackInput(): void {
    if (this._currentStep !== TutorialStep.Attack) {
      return;
    }

    this.nextStep();
  }

  private _showCurrentStepMessage(): void {
    if (this._currentStep === TutorialStep.Movement) {
      this._setMessage(
          "\nUsa WASD per muoverti."
          + "\n"
          + "Muoviti per continuare.",
      );
      this._moveDistancePx = 0;
      this._hasPlayerPosition = false;
      return;
    }

    if (this._currentStep === TutorialStep.Attack) {
      this._setMessage(

          "\nPremi Click Sinistro del mouse"
          + "\n"
          + "per colpire i nemici.",
      );
      this.input.once(
        Phaser.Input.Events.POINTER_DOWN,
        this._onAttackInput,
        this,
      );
      return;
    }

    if (this._currentStep === TutorialStep.Perk) {
      this._setMessage(
          "\nUsa gli slot Q ed E."
          + "\n"
          + "I cooldown dei perk sono visibili nell'HUD.",
      );
      return;
    }

    if (this._currentStep === TutorialStep.Merchant) {
      this._setMessage(
          "\nUn demone ti sta chiamando!?!?"
          + "\n"
          + "Segui la freccia e raggiungilo.",
      );
      this._showDialogBackground();

      if (this._merchantCallBgHideTimer) {
        this._merchantCallBgHideTimer.remove(false);
        this._merchantCallBgHideTimer = null;
      }

      this._merchantCallBgHideTimer = this.time.delayedCall(5000, () => {
        this._merchantCallBgHideTimer = null;
        if (this._currentStep === TutorialStep.Merchant && !this._merchantReached) {
          this._hideDialogBackground();
        }
      });

      this._startMerchantGuide();
    }
  }

  private _showDialogBackground(): void {
    this._dialogShadow?.setVisible(true);
    this._dialogOuterBox?.setVisible(true);
    this._dialogMidBox?.setVisible(true);
    this._dialogBox?.setVisible(true);
    this._dialogText?.setVisible(true);
  }

  private _hideDialogBackground(): void {
    this._dialogShadow?.setVisible(false);
    this._dialogOuterBox?.setVisible(false);
    this._dialogMidBox?.setVisible(false);
    this._dialogBox?.setVisible(false);
    this._dialogText?.setVisible(false);
  }

  private _startMerchantGuide(): void {
    this._merchantReached = false;
    this._merchantDialogIndex = 0;

    if (this._merchantDialogTimer) {
      this._merchantDialogTimer.remove(false);
      this._merchantDialogTimer = null;
    }

    if (!this._merchantArrow) {
      this._merchantArrow = this.add.triangle(
        0,
        0,
        0,
        48,
        24,
        0,
        48,
        48,
        0xc8904a,
        1,
      );
      this._merchantArrow.setScrollFactor(0);
      this._merchantArrow.setStrokeStyle(2, 0x5a2e0a, 0.95);

      this.tweens.add({
        targets: this._merchantArrow,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: TutorialScene.ARROW_TWEEN_MS,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
    }

  }

  private _updateMerchantTutorial(): void {
    const player = this._gamePlayScene?.player;
    const merchant = this._gamePlayScene?.merchant as Merchant | undefined;

    if (!player || !merchant) {
      return;
    }

    if (!this._merchantReached) {
      this._updateMerchantArrow(
        player.x,
        player.y,
        merchant.x,
        merchant.y,
      );

      const distance = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        merchant.x,
        merchant.y,
      );

      if (distance <= TutorialScene.MERCHANT_REACH_DISTANCE_PX) {
        this._merchantReached = true;
        this._destroyMerchantArrow();
        this._beginMerchantDialog(merchant);
        return;
      }

      if (this._isPlayerInsideMerchantReachArea(player, merchant)) {
        this._merchantReached = true;
        this._destroyMerchantArrow();
        this._beginMerchantDialog(merchant);
      }
    }
  }

  /**
   * Usiamo la hitbox fisica del mercante invece dello sprite visivo per avere
    * una zona di arrivo coerente a 360° anche con offset verticali
    * della sprite.
   */
  private _isPlayerInsideMerchantReachArea(
    player: Phaser.Physics.Arcade.Sprite,
    merchant: Phaser.Physics.Arcade.Sprite,
  ): boolean {
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const merchantBody = merchant.body as Phaser.Physics.Arcade.Body;

    if (!playerBody || !merchantBody) {
      return false;
    }

    const playerCenterX = playerBody.center.x;
    const playerCenterY = playerBody.center.y;
    const closestX = Phaser.Math.Clamp(
      playerCenterX,
      merchantBody.left,
      merchantBody.right,
    );
    const closestY = Phaser.Math.Clamp(
      playerCenterY,
      merchantBody.top,
      merchantBody.bottom,
    );
    const distanceToBody = Phaser.Math.Distance.Between(
      playerCenterX,
      playerCenterY,
      closestX,
      closestY,
    );

    return distanceToBody <= TutorialScene.MERCHANT_REACH_PADDING_PX;
  }

  private _updateMerchantArrow(
    playerX: number,
    playerY: number,
    targetX: number,
    targetY: number,
  ): void {
    if (!this._merchantArrow) {
      return;
    }

    const camera = this.cameras.main;
    const viewCenterX = camera.width / 2;
    const viewCenterY = camera.height / 2;
    const direction = new Phaser.Math.Vector2(
      targetX - playerX,
      targetY - playerY,
    );

    if (direction.lengthSq() <= 0.0001) {
      this._merchantArrow.setPosition(viewCenterX, viewCenterY);
      return;
    }

    direction.normalize();

    const radiusX = (camera.width / 2)
      - TutorialScene.ARROW_SCREEN_MARGIN_PX;
    const radiusY = (camera.height / 2)
      - TutorialScene.ARROW_SCREEN_MARGIN_PX;
    const arrowX = viewCenterX + direction.x * radiusX;
    const arrowY = viewCenterY + direction.y * radiusY;
    const angle = Phaser.Math.Angle.Between(
      0,
      0,
      direction.x,
      direction.y,
    );

    this._merchantArrow.setPosition(arrowX, arrowY);
    this._merchantArrow.setRotation(angle + Math.PI / 2);
  }

  private _beginMerchantDialog(merchant: Merchant): void {
    if (this._dialogBox) {
      this._dialogBox.setVisible(false);
    }

    if (this._dialogText) {
      this._dialogText.setVisible(false);
    }

    merchant.startTutorialPrompt();
    this._showMerchantDialogLine(merchant);
  }

  private _showMerchantDialogLine(merchant: Merchant): void {
    if (this._merchantDialogIndex >= this._merchantDialogLines.length) {
      merchant.stopTutorialPrompt();
      this.nextStep();
      return;
    }

    const line = this._merchantDialogLines[this._merchantDialogIndex];
    merchant.setTutorialPromptText(line);
    this._merchantDialogIndex += 1;

    const durationMs = Math.max(2000, line.length * 42);
    this._merchantDialogTimer = this.time.delayedCall(durationMs, () => {
      this._merchantDialogTimer = null;
      this._showMerchantDialogLine(merchant);
    });
  }

  private _destroyMerchantArrow(): void {
    if (this._merchantArrow) {
      this._merchantArrow.destroy();
      this._merchantArrow = null;
    }

  }

  private _updateMoveDistance(): void {
    const player = this._gamePlayScene?.player;

    if (!player) {
      return;
    }

    if (!this._hasPlayerPosition) {
      this._lastPlayerX = player.x;
      this._lastPlayerY = player.y;
      this._hasPlayerPosition = true;
      return;
    }

    const delta = Phaser.Math.Distance.Between(
      this._lastPlayerX,
      this._lastPlayerY,
      player.x,
      player.y,
    );

    this._moveDistancePx += delta;
    this._lastPlayerX = player.x;
    this._lastPlayerY = player.y;
  }

  private _createDialogUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const centerX = width / 2;
    const posY = height - 160;

    this._dialogShadow = this.add.rectangle(
      centerX + 10,
      posY + 10,
      TutorialScene.DIALOG_WIDTH_PX,
      TutorialScene.DIALOG_HEIGHT_PX,
      TutorialScene.COLOR_SHADOW,
      0.5,
    );
    this._dialogShadow.setScrollFactor(0);

    this._dialogOuterBox = this.add.rectangle(
      centerX,
      posY,
      TutorialScene.DIALOG_WIDTH_PX,
      TutorialScene.DIALOG_HEIGHT_PX,
      TutorialScene.COLOR_PARCHMENT_OUTER,
      1,
    );
    this._dialogOuterBox.setScrollFactor(0);
    this._dialogOuterBox.setStrokeStyle(
      3,
      TutorialScene.COLOR_BORDER_DARK,
      1,
    );

    this._dialogMidBox = this.add.rectangle(
      centerX,
      posY,
      TutorialScene.DIALOG_WIDTH_PX - 20,
      TutorialScene.DIALOG_HEIGHT_PX - 20,
      TutorialScene.COLOR_PARCHMENT_MID,
      1,
    );
    this._dialogMidBox.setScrollFactor(0);
    this._dialogMidBox.setStrokeStyle(
      2,
      TutorialScene.COLOR_BORDER_MID,
      0.9,
    );

    this._dialogBox = this.add.rectangle(
      centerX,
      posY,
      TutorialScene.DIALOG_WIDTH_PX - 42,
      TutorialScene.DIALOG_HEIGHT_PX - 42,
      TutorialScene.COLOR_PARCHMENT_INNER,
      1,
    );
    this._dialogBox.setScrollFactor(0);
    this._dialogBox.setStrokeStyle(1, TutorialScene.COLOR_BORDER_MID, 0.7);

    this._dialogText = this.add.bitmapText(
      centerX - (TutorialScene.DIALOG_WIDTH_PX / 2) + 38,
      posY - (TutorialScene.DIALOG_HEIGHT_PX / 2) + 24,
      TutorialScene.FONT_KEY,
      "",
      24,
    );
    this._dialogText.setScrollFactor(0);
    this._dialogText.setMaxWidth(TutorialScene.DIALOG_WIDTH_PX - 76);
    this._dialogText.setTint(TutorialScene.COLOR_TEXT_DARK);
  }

  private _setMessage(message: string): void {
    this._fullMessage = message;
    this._typedChars = 0;
    this._nextTypeAtMs = 0;

    if (!this._dialogText) {
      return;
    }

    this._dialogText.setText("");
  }

  private _updateTyping(): void {
    if (!this._dialogText) {
      return;
    }

    if (this._typedChars >= this._fullMessage.length) {
      return;
    }

    if (this.time.now < this._nextTypeAtMs) {
      return;
    }

    this._typedChars += 1;
    this._dialogText.setText(this._fullMessage.slice(0, this._typedChars));
    this._nextTypeAtMs = this.time.now + TutorialScene.TYPING_INTERVAL_MS;
  }

  private _isTypingComplete(): boolean {
    return this._typedChars >= this._fullMessage.length;
  }

  /**
   * Persistiamo nel registry per mantenere lo stato tra restart di scena
   * (es. morte -> GameOver -> GamePlay) senza dipendere da variabili locali.
   */
  private _finishTutorial(): void {
    this._showDialogBackground();

    if (this._dialogText) {
      this._dialogText.setVisible(true);
    }

    this.registry.set("tutorialCompleted", true);
    this._gamePlayScene?.events.emit("tutorial-finished");
    this.scene.stop("Tutorial");
  }

  private _ensureBitmapFont(): void {
    if (this.cache.bitmapFont.exists(TutorialScene.FONT_KEY)) {
      return;
    }

    const cellSize = 16;
    const firstCharCode = 32;
    const lastCharCode = 126;
    const totalChars = lastCharCode - firstCharCode + 1;
    const cols = 16;
    const rows = Math.ceil(totalChars / cols);
    const width = cols * cellSize;
    const height = rows * cellSize;
    const textureKey = "tutorial_bitmap_font_texture";

    if (!this.textures.exists(textureKey)) {
      this.textures.createCanvas(textureKey, width, height);
    }

    const canvasTexture = this.textures.get(
      textureKey,
    ) as Phaser.Textures.CanvasTexture;
    const context = canvasTexture.getContext();

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.font = "16px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";

    let xmlChars = "";

    for (let code = firstCharCode; code <= lastCharCode; code += 1) {
      const index = code - firstCharCode;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * cellSize;
      const y = row * cellSize;
      const drawX = x + cellSize / 2;
      const drawY = y + cellSize / 2;

      context.fillText(String.fromCharCode(code), drawX, drawY);

      xmlChars += "<char id=\"" + code + "\" x=\"" + x;
      xmlChars += "\" y=\"" + y + "\" width=\"" + cellSize;
      xmlChars += "\" height=\"" + cellSize + "\" xoffset=\"0\"";
      xmlChars += " yoffset=\"0\" xadvance=\"" + cellSize;
      xmlChars += "\" page=\"0\" chnl=\"0\" />";
    }

    canvasTexture.refresh();

    const xml = "<?xml version=\"1.0\"?>"
      + "<font>"
      + "<info face=\"tutorial_font\" size=\"16\" />"
      + "<common lineHeight=\"16\" base=\"16\""
      + " scaleW=\"" + width + "\""
      + " scaleH=\"" + height + "\" pages=\"1\" packed=\"0\" />"
      + "<pages><page id=\"0\" file=\"generated\" /></pages>"
      + "<chars count=\"" + totalChars + "\">"
      + xmlChars
      + "</chars>"
      + "<kernings count=\"0\" />"
      + "</font>";

    const parsedXml = new DOMParser().parseFromString(
      xml,
      "application/xml",
    );
    const textureFrame = this.textures.getFrame(textureKey, "__BASE");

    if (!textureFrame) {
      throw new Error("Tutorial bitmap font frame non trovato.");
    }

    const xmlData = Phaser.GameObjects.BitmapText.ParseXMLBitmapFont(
      parsedXml,
      textureFrame,
    );

    this.cache.bitmapFont.add(
      TutorialScene.FONT_KEY,
      {
        data: xmlData,
        texture: textureKey,
        frame: null,
      },
    );
  }

  private _onShutdown(): void {
    if (this._stepDelayTimer) {
      this._stepDelayTimer.remove(false);
      this._stepDelayTimer = null;
    }

    if (this._merchantCallBgHideTimer) {
      this._merchantCallBgHideTimer.remove(false);
      this._merchantCallBgHideTimer = null;
    }

    if (this._merchantDialogTimer) {
      this._merchantDialogTimer.remove(false);
      this._merchantDialogTimer = null;
    }

    this._destroyMerchantArrow();
    this._gamePlayScene?.merchant?.stopTutorialPrompt();
  }
}