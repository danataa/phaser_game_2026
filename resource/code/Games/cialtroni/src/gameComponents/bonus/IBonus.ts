
interface IBonus {

    update(time: number, delta: number): void;
    getBonus(): void;
    isCollectable(): boolean;


}
export default IBonus;