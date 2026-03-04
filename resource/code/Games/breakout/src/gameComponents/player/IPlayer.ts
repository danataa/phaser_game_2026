

interface IPlayer {
    initPlayer(): void;
    update(time: number, delta: number): void;
    enterAnimation(): void;
    playAnimation(anim: string): void;
    activate(): void;
    deactivate(): void;
    enterLevel(): void;
    handleInput(): void;
    handleMobileInput(): void;
    handleKeyboardInput(): void;
    isBlocked(): Phaser.Types.Physics.Arcade.ArcadeBodyCollision
    isTouching(): Phaser.Types.Physics.Arcade.ArcadeBodyCollision

    activateInvulnerability(): void;
    deactivateInvulnerability(): void;
    setInvulerability(time: number): void;
    isInvulnerable(): boolean;

    increaseScore(score: number): void;

    getBody(): Phaser.Physics.Arcade.Body;

    gameOver(): void;

}
export default IPlayer;