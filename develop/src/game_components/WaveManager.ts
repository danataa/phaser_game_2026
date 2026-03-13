import Phaser from "phaser";
import Enemy from "./Enemy";
import MapManager from "./MapManager";
import Player from "./Player";
import Demon from "./enemies/Demon";
import Skeleton from "./enemies/Skeleton";
import Zombie from "./enemies/Zombie";

type EnemyType = "Zombie" | "Skeleton" | "Demon";

// Gestisce le ondate di nemici
export default class WaveManager {
	// --- Costanti di bilanciamento ---
	private static readonly ENEMY_WEIGHTS: Readonly<Record<EnemyType, number>> = {
		Zombie: 10,
		Skeleton: 15,
		Demon: 25,
	};

	private static readonly SPECIAL_WAVES: ReadonlyMap<number, Readonly<Record<EnemyType, number>>> = new Map([
		[1, { Zombie: 100, Skeleton: 0, Demon: 0 }],
		[2, { Zombie: 60, Skeleton: 40, Demon: 0 }],
		[3, { Zombie: 60, Skeleton: 0, Demon: 40 }],
	]);

	private readonly _spawnIntervalMs: number = 1500;
	private readonly _spawnSafetyDistancePx: number = 100;
	private readonly _basePoints: number = 60;
	private readonly _difficultyMultiplier: number = 25;

	// --- Dipendenze runtime ---
	private readonly _scene: Phaser.Scene;
	private readonly _enemyGroup: Phaser.Physics.Arcade.Group;

	// --- Stato runtime ---
	private _currentWave: number = 0;
	private _currentWaveBudget: number = 0;
	private _spawnTimer: Phaser.Time.TimerEvent | null = null;
	private _spawnQueue: EnemyType[] = [];
	private _spawnedEnemiesCount: number = 0;
	private _isWaveSpawning: boolean = false;
	private _activeWaveEnemies: Set<Enemy> = new Set<Enemy>();

	private _player: Player | null = null;
	private _mapManager: MapManager | null = null;

	constructor(scene: Phaser.Scene, enemyGroup: Phaser.Physics.Arcade.Group) {
		this._scene = scene;
		this._enemyGroup = enemyGroup;
		Enemy.configureEnemyCollisions(this._scene, this._enemyGroup);
		this._refreshSceneDependencies();
	}

	// --- Getter stato pubblico ---
	get currentWave(): number {
		return this._currentWave;
	}

	get currentWaveBudget(): number {
		return this._currentWaveBudget;
	}

	get spawnedEnemiesCount(): number {
		return this._spawnedEnemiesCount;
	}

	get activeEnemiesCount(): number {
		return this._activeWaveEnemies.size;
	}

	get isWaveSpawning(): boolean {
		return this._isWaveSpawning;
	}

	// --- API pubblica ---

	startNextWave(): void {
		this.startWave(this._currentWave + 1);
	}

	startWave(waveNumber: number): void {
		this.stop();
		this._refreshSceneDependencies();

		if (!this._player) {
			throw new Error("WaveManager: impossibile avviare l'onda senza Player nella scena.");
		}

		this._currentWave = Math.max(1, waveNumber);
		this._currentWaveBudget = this._calculateWaveBudget(this._currentWave);
		this._spawnQueue = this._buildWaveSpawnQueue(this._currentWave, this._currentWaveBudget);
		this._spawnedEnemiesCount = 0;
		this._activeWaveEnemies.clear();
		this._isWaveSpawning = true;

		this._spawnTimer = this._scene.time.addEvent({
			delay: this._spawnIntervalMs,
			loop: true,
			callback: this._spawnTick,
			callbackScope: this,
		});
	}

	stop(): void {
		if (this._spawnTimer) {
			this._spawnTimer.remove(false);
			this._spawnTimer = null;
		}
		this._isWaveSpawning = false;
		this._spawnQueue = [];
	}

	// --- Spawn logic ---

	/**
	 * Budget progressivo per onda.
	 *
	 * Si usa una crescita lineare `BasePoints + wave * difficultyMultiplier` perché mantiene
	 * il ritmo prevedibile: il giocatore percepisce un aumento costante della pressione,
	 * ma senza picchi esponenziali che renderebbero il bilanciamento fragile.
	 */
	private _calculateWaveBudget(waveNumber: number): number {
		return this._basePoints + waveNumber * this._difficultyMultiplier;
	}

	private _buildWaveSpawnQueue(waveNumber: number, waveBudget: number): EnemyType[] {
		const specialPercentages = WaveManager.SPECIAL_WAVES.get(waveNumber);

		if (specialPercentages) {
			return this._buildSpecialWaveQueue(waveBudget, specialPercentages);
		}

		return this._buildDynamicWaveQueue(waveBudget, waveNumber);
	}

	/**
	 * Le onde speciali usano percentuali fisse per produrre pattern riconoscibili.
	 * Questo crea "milestone" leggibili dal player: la difficoltà non cresce solo in quantità,
	 * ma anche in identità tattica dell'onda.
	 */
	private _buildSpecialWaveQueue(
		waveBudget: number,
		percentages: Readonly<Record<EnemyType, number>>,
	): EnemyType[] {
		const queue: EnemyType[] = [];
		let consumedBudget = 0;

		const enemyTypes = Object.keys(WaveManager.ENEMY_WEIGHTS) as EnemyType[];
		for (const enemyType of enemyTypes) {
			const percent = percentages[enemyType] ?? 0;
			const typeBudget = Math.floor((waveBudget * percent) / 100);
			const typeCost = WaveManager.ENEMY_WEIGHTS[enemyType];
			const count = Math.floor(typeBudget / typeCost);

			for (let i = 0; i < count; i++) {
				queue.push(enemyType);
			}

			consumedBudget += count * typeCost;
		}

		let remainingBudget = waveBudget - consumedBudget;
		const minEnemyCost = Math.min(...Object.values(WaveManager.ENEMY_WEIGHTS));

		while (remainingBudget >= minEnemyCost) {
			const affordable = enemyTypes.filter((type) => WaveManager.ENEMY_WEIGHTS[type] <= remainingBudget);
			if (affordable.length === 0) {
				break;
			}

			const pickedType = this._pickByPercentages(affordable, percentages);
			queue.push(pickedType);
			remainingBudget -= WaveManager.ENEMY_WEIGHTS[pickedType];
		}

		return Phaser.Utils.Array.Shuffle(queue);
	}

	/**
	 * Onde standard: probabilità dinamiche in funzione del numero onda.
	 * Aumentare gradualmente Skeleton/Demon aumenta la complessità meccanica,
	 * non solo il DPS grezzo, mantenendo il gameplay leggibile nelle prime ondate.
	 */
	private _buildDynamicWaveQueue(waveBudget: number, waveNumber: number): EnemyType[] {
		const queue: EnemyType[] = [];
		const minEnemyCost = Math.min(...Object.values(WaveManager.ENEMY_WEIGHTS));
		let remainingBudget = waveBudget;

		while (remainingBudget >= minEnemyCost) {
			const dynamicWeights = this._getDynamicSpawnWeights(waveNumber);
			const affordableTypes = (Object.keys(WaveManager.ENEMY_WEIGHTS) as EnemyType[]).filter(
				(type) => WaveManager.ENEMY_WEIGHTS[type] <= remainingBudget,
			);

			if (affordableTypes.length === 0) {
				break;
			}

			const pickedType = this._pickByPercentages(affordableTypes, dynamicWeights);
			queue.push(pickedType);
			remainingBudget -= WaveManager.ENEMY_WEIGHTS[pickedType];
		}

		return queue;
	}

	private _getDynamicSpawnWeights(waveNumber: number): Readonly<Record<EnemyType, number>> {
		const zombieWeight = Math.max(20, 75 - waveNumber * 5);
		const skeletonWeight = Math.min(50, 20 + waveNumber * 3);
		const demonWeight = Math.min(45, 5 + waveNumber * 2);

		return {
			Zombie: zombieWeight,
			Skeleton: skeletonWeight,
			Demon: demonWeight,
		};
	}

	private _pickByPercentages(
		availableTypes: EnemyType[],
		weights: Readonly<Record<EnemyType, number>>,
	): EnemyType {
		const total = availableTypes.reduce((sum, type) => sum + (weights[type] ?? 0), 0);

		if (total <= 0) {
			return availableTypes[Phaser.Math.Between(0, availableTypes.length - 1)];
		}

		let roll = Phaser.Math.Between(1, total);
		for (const type of availableTypes) {
			roll -= weights[type] ?? 0;
			if (roll <= 0) {
				return type;
			}
		}

		return availableTypes[availableTypes.length - 1];
	}

	private _spawnTick(): void {
		if (this._spawnQueue.length === 0) {
			if (this._spawnTimer) {
				this._spawnTimer.remove(false);
				this._spawnTimer = null;
			}
			this._isWaveSpawning = false;
			this._checkWaveCompletion();
			return;
		}

		const enemyType = this._spawnQueue.shift();
		if (!enemyType) {
			return;
		}

		this._spawnEnemy(enemyType);
	}

	private _spawnEnemy(enemyType: EnemyType): void {
		this._refreshSceneDependencies();
		if (!this._player) {
			return;
		}

		const spawnPosition = this.getSpawnPosition();
		let enemy: Enemy;

		switch (enemyType) {
			case "Zombie":
				enemy = new Zombie(this._scene, spawnPosition.x, spawnPosition.y, this._player);
				break;
			case "Skeleton":
				enemy = new Skeleton(this._scene, spawnPosition.x, spawnPosition.y, this._player);
				break;
			case "Demon":
				enemy = new Demon(this._scene, spawnPosition.x, spawnPosition.y, this._player);
				break;
			default:
				return;
		}

		if (this._mapManager) {
			enemy.setMapManager(this._mapManager);
			this._mapManager.addCollider(enemy);
		}

		this._enemyGroup.add(enemy, true);
		this._spawnedEnemiesCount += 1;
		this._activeWaveEnemies.add(enemy);

		enemy.once(Phaser.GameObjects.Events.DESTROY, () => {
			this._activeWaveEnemies.delete(enemy);
			this._checkWaveCompletion();
		});
	}

	/**
	 * Restituisce una posizione di spawn fuori viewport.
	 *
	 * Spawnare fuori camera evita pop-in e concede al giocatore un breve tempo di reazione.
	 * La distanza di sicurezza rende consistente il "telegraphing" dell'ingresso nemico
	 * indipendentemente da zoom o velocità del target.
	 */
	getSpawnPosition(): Phaser.Math.Vector2 {
		this._refreshSceneDependencies();
		const view = this._scene.cameras.main.worldView;
		const margin = this._spawnSafetyDistancePx;
		const maxAttempts = 40;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const side = Phaser.Math.Between(0, 3);
			let candidate: Phaser.Math.Vector2;

			if (side === 0) {
				candidate = new Phaser.Math.Vector2(
					Phaser.Math.Between(Math.floor(view.left), Math.floor(view.right)),
					Math.floor(view.top - margin),
				);
			} else if (side === 1) {
				candidate = new Phaser.Math.Vector2(
					Phaser.Math.Between(Math.floor(view.left), Math.floor(view.right)),
					Math.floor(view.bottom + margin),
				);
			} else if (side === 2) {
				candidate = new Phaser.Math.Vector2(
					Math.floor(view.right + margin),
					Phaser.Math.Between(Math.floor(view.top), Math.floor(view.bottom)),
				);
			} else {
				candidate = new Phaser.Math.Vector2(
					Math.floor(view.left - margin),
					Phaser.Math.Between(Math.floor(view.top), Math.floor(view.bottom)),
				);
			}

			if (this._isValidSpawnPosition(candidate)) {
				return candidate;
			}
		}

		const fallback = new Phaser.Math.Vector2(Math.floor(view.centerX), Math.floor(view.centerY));
		if (this._isValidSpawnPosition(fallback)) {
			return fallback;
		}

		return new Phaser.Math.Vector2(Math.floor(view.left), Math.floor(view.top));
	}

	private _isValidSpawnPosition(position: Phaser.Math.Vector2): boolean {
		if (!this._mapManager) {
			return true;
		}

		if (!this._isWithinMapBounds(position.x, position.y)) {
			return false;
		}

		const map = this._mapManager.map;
		const scale = this._mapManager.scale;
		const tileX = Math.floor(position.x / (map.tileWidth * scale));
		const tileY = Math.floor(position.y / (map.tileHeight * scale));

		for (const layer of this._mapManager.collidableLayers) {
			const tile = layer.getTileAt(tileX, tileY);
			if (tile && tile.collides) {
				return false;
			}
		}

		return true;
	}

	private _isWithinMapBounds(x: number, y: number): boolean {
		if (!this._mapManager) {
			return true;
		}

		return x >= 0 && y >= 0 && x < this._mapManager.widthInPixels && y < this._mapManager.heightInPixels;
	}

	private _checkWaveCompletion(): void {
		if (this._isWaveSpawning) {
			return;
		}

		if (this._activeWaveEnemies.size === 0) {
			this._scene.events.emit("wave-complete", this._currentWave);
		}
	}

	private _refreshSceneDependencies(): void {
		const gameplayScene = this._scene as Phaser.Scene & {
			_player?: Player;
			player?: Player;
			_mapManager?: MapManager;
			mapManager?: MapManager;
		};

		this._player = gameplayScene._player ?? gameplayScene.player ?? this._findPlayerInScene();
		this._mapManager = gameplayScene._mapManager ?? gameplayScene.mapManager ?? null;
	}

	private _findPlayerInScene(): Player | null {
		const playerObject = this._scene.children.list.find((child) => child instanceof Player);
		return (playerObject as Player) ?? null;
	}
}