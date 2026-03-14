import { GameData } from "../GameData";

export default class GameOver extends Phaser.Scene {

  constructor() {
    super({ key: "GameOver" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#000000");

    // Game Over container
    const gameOverPanel = this.add.container(width / 2, height / 2)
      .setAlpha(0)
      .setDepth(100);

    // Minimal overlay - barely visible
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.05)
      .setOrigin(0.5, 0.5)
      .setInteractive();

    // Red accent line at top (inferno theme)
    const accentTop = this.add.rectangle(0, -250, 800, 2, 0xff3333, 0.5);

    // Red accent line at bottom
    const accentBottom = this.add.rectangle(0, 250, 800, 2, 0xff3333, 0.5);

    // Subtle pulsing accents
    this.tweens.add({
      targets: [accentTop, accentBottom],
      alpha: { from: 0.3, to: 0.6 },
      duration: 2500,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // Title
    const title = this.add.text(0, -80, "GAME  OVER", { 
      fontFamily: 'Roboto', 
      fontSize: '64px', 
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2
    })
      .setOrigin(0.5)
      .setShadow(2, 2, '#000000', 0.7);

    // Title subtle pulse
    this.tweens.add({
      targets: title,
      alpha: { from: 0.85, to: 1 },
      duration: 2000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // Retry Button
    const retryBtn = this.add.text(0, 40, "RETRY", { 
      fontFamily: 'Roboto', 
      fontSize: '28px', 
      color: '#ffffff',
      fontStyle: 'bold'
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.tweens.add({
          targets: retryBtn,
          scale: 1.1,
          duration: 150,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: retryBtn,
          alpha: { from: 1, to: 0.7 },
          duration: 150
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: retryBtn,
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: retryBtn,
          alpha: 1,
          duration: 150
        });
      })
      .on('pointerdown', () => {
        this.tweens.add({
          targets: gameOverPanel,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.scene.start("GamePlay");
          }
        });
      });

    // Menu Button
    const menuBtn = this.add.text(0, 100, "MENU", { 
      fontFamily: 'Roboto', 
      fontSize: '28px', 
      color: '#ffffff',
      fontStyle: 'bold'
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.tweens.add({
          targets: menuBtn,
          scale: 1.1,
          duration: 150,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: menuBtn,
          alpha: { from: 1, to: 0.7 },
          duration: 150
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: menuBtn,
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: menuBtn,
          alpha: 1,
          duration: 150
        });
      })
      .on('pointerdown', () => {
        this.tweens.add({
          targets: gameOverPanel,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.scene.start("Menu");
          }
        });
      });

    // Add elements to panel
    gameOverPanel.add([overlay, accentTop, accentBottom, title, retryBtn, menuBtn]);

    // Animate panel in
    this.tweens.add({
      targets: gameOverPanel,
      alpha: 1,
      duration: 300,
      ease: 'Power2.easeOut'
    });

    // ESC key to go back to menu
    this.input.keyboard.on('keydown-ESC', () => {
      this.tweens.add({
        targets: gameOverPanel,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.scene.start("Menu");
        }
      });
    });
  }
}
