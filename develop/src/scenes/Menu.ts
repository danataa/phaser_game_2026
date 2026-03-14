export default class Menu extends Phaser.Scene {
  private _buttons: Phaser.GameObjects.Container[] = [];
  private _settingsPanel: Phaser.GameObjects.Container;
  private _creditsPanel: Phaser.GameObjects.Container;
  private _escButton: Phaser.GameObjects.Container;
  private _isSettingsOpen: boolean = false;
  private _isCreditsOpen: boolean = false;
  private _logo: Phaser.GameObjects.Image;
  private _volume: number = 100;
  private _quality: string = 'HIGH';
  private _fullscreen: boolean = false;

  constructor() {
    super({ key: "Menu" });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");
    
    this._logo = this.add.image(width / 2, height * 0.3, 'main_logo');
    this._logo.setScale(0.8);
    
    // Logo pulse animation
    this.tweens.add({
      targets: this._logo,
      scale: { from: 0.75, to: 0.85 },
      duration: 3000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    this.createMenuButtons();
    this.createSettingsPanel();
    this.createCreditsPanel();
    this.showButtons();

    this.input.keyboard.on('keydown-ESC', () => {
      if (this._isSettingsOpen) this.toggleSettings(false);
      else if (this._isCreditsOpen) this.toggleCredits(false);
      else window.close();
    });
  }

  private createMenuButtons() {
    const { width, height } = this.scale;
    const buttonData = [
      { text: 'PLAY', action: () => this.startGame() },
      { text: 'SETTINGS', action: () => this.toggleSettings(true) },
      { text: 'CREDITS', action: () => this.toggleCredits(true) }
    ];

    buttonData.forEach((data, index) => {
      const container = this.add.container(width / 2, height * 0.65 + (index * 70));
      
      const txt = this.add.text(0, 0, data.text, {
        fontFamily: 'Roboto',
        fontSize: '32px',
        color: '#ffffff',
        letterSpacing: 2
      }).setOrigin(0.5);

      container.add([txt]);
      container.setSize(txt.width + 60, 60);
      container.setInteractive({ useHandCursor: true });
      container.setAlpha(0);

      // Floating animation
      this.tweens.add({
        targets: container,
        y: '-=5',
        duration: 2000 + index * 300,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });

      container.on('pointerover', () => {
        this.tweens.add({
          targets: txt,
          scale: 1.15,
          duration: 150,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: txt,
          skewX: 0.05,
          duration: 100,
          yoyo: true
        });
      });
      
      container.on('pointerout', () => {
        this.tweens.add({
          targets: txt,
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
      });

      container.on('pointerdown', data.action);
      this._buttons.push(container);
    });

    // ESC button display
    this._escButton = this.add.container(width / 2, height * 0.65 + (3 * 70));
    const escText = this.add.text(0, 0, 'ESC', {
      fontFamily: 'Roboto',
      fontSize: '28px',
      color: '#cc0000',
      letterSpacing: 2
    }).setOrigin(0.5);
    this._escButton.add([escText]);
    this._escButton.setAlpha(0);

    // ESC floating animation
    this.tweens.add({
      targets: this._escButton,
      y: '-=5',
      duration: 3200,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // ESC pulsing animation
    this.tweens.add({
      targets: escText,
      alpha: { from: 0.6, to: 1 },
      duration: 1500,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  private createCreditsPanel() {
    const { width, height } = this.scale;
    this._creditsPanel = this.add.container(width / 2, height / 2).setAlpha(0).setVisible(false).setDepth(100);
    
    const bg = this.add.rectangle(0, 0, 700, 450, 0x0a0a0a, 0.95);
    
    const title = this.add.text(0, -150, "CREDITS", { fontFamily: 'Roboto', fontSize: '40px', color: '#ffffff' }).setOrigin(0.5);
    
    // Minimal glow effect on title
    this.tweens.add({
      targets: title,
      scale: { from: 0.98, to: 1.02 },
      duration: 3000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    
    // Title alpha pulse (very subtle)
    this.tweens.add({
      targets: title,
      alpha: { from: 0.9, to: 1 },
      duration: 2500,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    const creditsText = this.add.text(0, -50, 
`Silent Production`, 
      { fontFamily: 'Roboto', fontSize: '32px', color: '#ffffff', align: 'center' }
    ).setOrigin(0.5);
    
    // Minimal text alpha pulse
    this.tweens.add({
      targets: creditsText,
      alpha: { from: 0.8, to: 1 },
      duration: 3000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // Add Silent Production logo image under text
    const logo = this.add.image(0, 80, 'silent_production_logo')
      .setScale(0.28)
      .setOrigin(0.5);
    
    // Minimal logo floating animation
    this.tweens.add({
      targets: logo,
      y: '+=3',
      duration: 3000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    
    // Logo alpha pulse
    this.tweens.add({
      targets: logo,
      alpha: { from: 0.85, to: 1 },
      duration: 2800,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    const closeBtn = this.add.text(0, 170, "CLOSE", { fontFamily: 'Roboto', fontSize: '20px', color: '#ffffff' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleCredits(false))
      .on('pointerover', () => {
        this.tweens.add({
          targets: closeBtn,
          scale: 1.15,
          duration: 150,
          ease: 'Power2'
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: closeBtn,
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
      });

    this._creditsPanel.add([bg, title, creditsText, logo, closeBtn]);
  }
  
  private toggleCredits(show: boolean) {
    this._isCreditsOpen = show;
    if (show) {
      this._creditsPanel.setVisible(true);
      this._creditsPanel.setAlpha(0);
      this._creditsPanel.setScale(0.9);
      
      this.tweens.add({
        targets: this._creditsPanel,
        alpha: 1,
        scale: 1,
        duration: 300,
        ease: 'Power2.easeOut'
      });
      this._buttons.forEach(btn => btn.setAlpha(0.1).disableInteractive());
      this._escButton.setAlpha(0.1).disableInteractive();
    } else {
      this.tweens.add({
        targets: this._creditsPanel,
        alpha: 0,
        scale: 0.9,
        duration: 250,
        ease: 'Power2.easeIn',
        onComplete: () => {
          this._creditsPanel.setVisible(false);
          this._buttons.forEach(btn => btn.setAlpha(1).setInteractive());
          this._escButton.setAlpha(1).setInteractive();
        }
      });
    }
  }

  private showButtons() {
    this._buttons.forEach((btn, index) => {
      this.tweens.add({
        targets: btn,
        alpha: 1,
        y: '-=15',
        duration: 800,
        delay: index * 100,
        ease: 'Power2'
      });
    });

    // ESC button show animation
    this.tweens.add({
      targets: this._escButton,
      alpha: 1,
      y: '-=15',
      duration: 800,
      delay: 300,
      ease: 'Power2'
    });
  }

  private startGame() {
    this.tweens.add({
      targets: [...this._buttons, this._logo],
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.scene.start("GamePlay");
      }
    });
  }

  private createSettingsPanel() {
    const { width, height } = this.scale;
    this._settingsPanel = this.add.container(width / 2, height / 2).setAlpha(0).setVisible(false).setDepth(100);
    
    const bg = this.add.rectangle(0, 0, 700, 400, 0x0a0a0a, 0.95);
    
    const title = this.add.text(0, -160, "SETTINGS", { fontFamily: 'Roboto', fontSize: '40px', color: '#ffffff' }).setOrigin(0.5);
    
    // Minimal glow effect on title
    this.tweens.add({
      targets: title,
      scale: { from: 0.98, to: 1.02 },
      duration: 3000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    
    // Title alpha pulse
    this.tweens.add({
      targets: title,
      alpha: { from: 0.9, to: 1 },
      duration: 2500,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    
    // Volume Control
    const volLabel = this.add.text(-280, -80, "VOLUME", { fontFamily: 'Roboto', fontSize: '20px', color: '#ffffff', fontStyle: 'bold' });
    const volValue = this.add.text(150, -80, this._volume + "%", { fontFamily: 'Roboto', fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0);
    
    // Volume value glow animation (minimal)
    this.tweens.add({
      targets: volValue,
      alpha: { from: 0.9, to: 1 },
      duration: 1800,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    
    const volMinus = this.add.text(20, -65, "−", { fontFamily: 'Roboto', fontSize: '32px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    
    volMinus.on('pointerdown', () => {
      this._volume = Math.max(0, this._volume - 10);
      volValue.setText(this._volume + "%");
    });
    
    volMinus.on('pointerover', () => {
      this.tweens.add({
        targets: volMinus,
        scale: 1.15,
        duration: 150,
        ease: 'Power2'
      });
      this.tweens.add({
        targets: volMinus,
        alpha: { from: 1, to: 0.7 },
        duration: 150
      });
    });
    
    volMinus.on('pointerout', () => {
      this.tweens.add({
        targets: volMinus,
        scale: 1,
        duration: 150,
        ease: 'Power2'
      });
      this.tweens.add({
        targets: volMinus,
        alpha: 1,
        duration: 150
      });
    });
    
    const volPlus = this.add.text(100, -65, "+", { fontFamily: 'Roboto', fontSize: '32px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    
    volPlus.on('pointerdown', () => {
      this._volume = Math.min(100, this._volume + 10);
      volValue.setText(this._volume + "%");
    });
    
    volPlus.on('pointerover', () => {
      this.tweens.add({
        targets: volPlus,
        scale: 1.15,
        duration: 150,
        ease: 'Power2'
      });
      this.tweens.add({
        targets: volPlus,
        alpha: { from: 1, to: 0.7 },
        duration: 150
      });
    });
    
    volPlus.on('pointerout', () => {
      this.tweens.add({
        targets: volPlus,
        scale: 1,
        duration: 150,
        ease: 'Power2'
      });
      this.tweens.add({
        targets: volPlus,
        alpha: 1,
        duration: 150
      });
    });
    
    // Fullscreen Toggle
    const fullLabel = this.add.text(-280, 30, "FULLSCREEN", { fontFamily: 'Roboto', fontSize: '20px', color: '#ffffff', fontStyle: 'bold' });
    const fullValue = this.add.text(150, 30, this._fullscreen ? "[ON]" : "[OFF]", { fontFamily: 'Roboto', fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0);
    
    // Fullscreen value glow animation
    this.tweens.add({
      targets: fullValue,
      alpha: { from: 0.8, to: 1 },
      duration: 1200,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    
    fullValue.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this._fullscreen = !this._fullscreen;
        if (this._fullscreen) {
          this.scale.startFullscreen();
          fullValue.setText("[ON]");
        } else {
          this.scale.stopFullscreen();
          fullValue.setText("[OFF]");
        }
      })
      .on('pointerover', () => {
        this.tweens.add({
          targets: fullValue,
          scale: 1.1,
          duration: 150,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: fullValue,
          alpha: { from: 1, to: 0.7 },
          duration: 150
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: fullValue,
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: fullValue,
          alpha: 1,
          duration: 150
        });
      });
    
    const closeBtn = this.add.text(0, 120, "CLOSE", { fontFamily: 'Roboto', fontSize: '24px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleSettings(false))
      .on('pointerover', () => {
        this.tweens.add({
          targets: closeBtn,
          scale: 1.15,
          duration: 150,
          ease: 'Power2'
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: closeBtn,
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
      });

    this._settingsPanel.add([bg, title, volLabel, volMinus, volPlus, volValue, fullLabel, fullValue, closeBtn]);
  }

  private toggleSettings(show: boolean) {
    this._isSettingsOpen = show;
    if (show) {
      this._settingsPanel.setVisible(true);
      this._settingsPanel.setAlpha(0);
      this._settingsPanel.setScale(0.9);
      
      this.tweens.add({
        targets: this._settingsPanel,
        alpha: 1,
        scale: 1,
        duration: 300,
        ease: 'Power2.easeOut'
      });
      this._buttons.forEach(btn => btn.setAlpha(0.1).disableInteractive());
      this._escButton.setAlpha(0.1).disableInteractive();
    } else {
      this.tweens.add({
        targets: this._settingsPanel,
        alpha: 0,
        scale: 0.9,
        duration: 250,
        ease: 'Power2.easeIn',
        onComplete: () => {
          this._settingsPanel.setVisible(false);
          this._buttons.forEach(btn => btn.setAlpha(1).setInteractive());
          this._escButton.setAlpha(1).setInteractive();
        }
      });
    }
  }
}
