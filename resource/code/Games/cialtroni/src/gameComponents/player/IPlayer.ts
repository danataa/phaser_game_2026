

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
    isJumping():boolean
    isPunching(): boolean;
    setPunching(punch: boolean): void;
    setJumping(jump:boolean):void
    activateInvulnerability(): void;
    deactivateInvulnerability(): void;
    setInvulnerability(time: number): void;
    isInvulnerable(): boolean;

    increaseScore(score: number): void;

    getBody(): Phaser.Physics.Arcade.Body;

    gameOver(): void;

    deadSequence(): void;
    setRage(value: boolean): void;
    isRage(): boolean;
    startRage(): void;
    endRage(): void;

    setInputDirection(direction: string): void;
    setInputJump(value:boolean):void;
    setInputAttack(value:boolean):void;

    canBeat(value:boolean):boolean;
    setBeat(value:boolean):void;

}
export default IPlayer;