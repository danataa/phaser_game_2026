import Phaser from "phaser";
import Actor from "./Actor";
import Player from "./Player";
import Perk from "./perks/Perk";
import PerkAOE from "./perks/PerkAOE";
import PerkCura from "./perks/PerkCura";
import PerkDash from "./perks/PerkDash";

// ============================================================
// INTERFACCE
// ============================================================

export type PerkTipo = "temporaneo" | "permanente";
export type PerkCategoria = "hp" | "atk" | "speed" | "generic";

export interface IPerk {
  id: string;
  nome: string;
  descrizione: string;
  costoBase: number;
  valoreBase: number;
  tipo: PerkTipo;
  categoria: PerkCategoria;
}

export interface ISlotMercante {
  perk: IPerk;
  costoAttuale: number;
  acquistato: boolean;
}

// ============================================================
// CLASSE MERCHANT
// ============================================================

export default class Merchant extends Actor {

  // ================================
  // COSTANTI
  // ================================
  private static readonly NUM_SLOT: number = 2;
  private static readonly SCALA_COSTO_PER_ONDATA: number = 0.2;
  private static readonly SCALA_VALORE_PER_ONDATA: number = 0.2;
  private static readonly TIER_WAVE_STEP: number = 2;
  private static readonly TIER_MAX: number = 5;
  private static readonly FRASE_BATTAGLIA_INTERVAL_MS: number = 2200;
  private static readonly FRASI_BATTAGLIA: string[] = [
    "Torna vivo e poi trattiamo sul prezzo, eroe.",
    "Con quel casino non sento neanche il tintinnio delle anime!",
    "Niente saldi durante i morsi, politica aziendale.",
    "Prima sconfiggi i mostri, poi svuota il portafoglio.",
    "Se muori adesso, a chi vendo il prossimo perk?",
    "Io vendo miracoli, non assicurazioni sulla vita.",
    "Combatte prima, compra dopo: ordine naturale delle cose.",
    "Il negozio apre quando smetti di urlare in battaglia.",
  ];

  // --- Variabili tuning perk: attributi runtime ---
  private static readonly CURA_MIN_PERCENT: number = 0.05;
  private static readonly CURA_MAX_PERCENT: number = 0.95;
  private static readonly CURA_COOLDOWN_MS: number = 2000;

  private static readonly DASH_BASE_POWER: number = 1700;
  private static readonly DASH_POWER_PER_VALUE: number = 120;
  private static readonly DASH_DURATION_MS: number = 110;
  private static readonly DASH_COOLDOWN_MS: number = 1200;

  private static readonly AREA_BASE_DAMAGE: number = 30;
  private static readonly AREA_BASE_RADIUS: number = 100;
  private static readonly AREA_COOLDOWN_MS: number = 2000;

  // ================================
  // ATTRIBUTI
  // ================================
  private _scena: Phaser.Scene;

  private _poolPerk: IPerk[] = [
    { id: "cura",     nome: "Cura",          descrizione: "Cura il 30% della vita",         costoBase: 30, valoreBase: 30, tipo: "temporaneo", categoria: "generic" },
    { id: "hp_up",    nome: "+20 HP",         descrizione: "Aumenta la vita massima di 20", costoBase: 40, valoreBase: 20, tipo: "permanente", categoria: "hp"      },
    { id: "atk_up",   nome: "+10% Danno",     descrizione: "Aumenta il danno base del 10%", costoBase: 60, valoreBase: 10, tipo: "permanente", categoria: "atk"     },
    { id: "speed_up", nome: "+Velocità",      descrizione: "Aumenta la velocità",           costoBase: 50, valoreBase: 50, tipo: "permanente", categoria: "speed"   },
    { id: "scatto",   nome: "Scatto",         descrizione: "Scatta nella direzione",        costoBase: 50, valoreBase: 1,  tipo: "temporaneo", categoria: "generic" },
    { id: "area",     nome: "Attacco area",   descrizione: "Danni a tutti i nemici vicini", costoBase: 70, valoreBase: 20, tipo: "temporaneo", categoria: "generic" },
  ];

  private _slotAttivi: ISlotMercante[] = [];
  private _moltiplicatoreCosto: number = 1;
  private _moltiplicatoreValore: number = 1;
  private _ondataCorrente: number = 1;
  private _shopAperto: boolean = false;
  private _interactionEnabled: boolean = true;
  private _raggioInterazione: number = 300;
  private _tastoInterazione: Phaser.Input.Keyboard.Key;
  private _etichetta: Phaser.GameObjects.Text;
  private _prompt: Phaser.GameObjects.Text;
  private _fraseBattagliaCorrente: string = "";
  private _prossimoCambioFraseBattagliaAt: number = 0;

  // ================================
  // COSTRUTTORE
  // ================================
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "merchant_idle");

    this._scena = scene;  
    this.setImmovable(true);
    this.setOrigin(0.5, 0.5);
    this.setScale(5);
    this.setY(this.y - 175); // Alza il PNG visivamente

    // Hitbox iniziale del mercante.
    this.setSize(30, 73);
    this.setOffset(110, 95);

    // Crea e avvia l'animazione idle infinita (8 frame)
    if (!this.scene.anims.exists("merchant_idle_anim")) {
      this.scene.anims.create({
        key: "merchant_idle_anim",
        frames: this.scene.anims.generateFrameNumbers("merchant_idle", { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    this.anims.play("merchant_idle_anim");

    this._tastoInterazione = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.F
    );

    this._etichetta = scene.add.text(x, y - 90, "MERCANTE", {
      fontFamily: "'Press Start 2P'",
      fontSize: "20px",
      color: "#ffaa00",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5);

    this._prompt = scene.add.text(x, y - 120, "[ F ] Apri negozio", {
      fontFamily: "'Press Start 2P'",
      fontSize: "20px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      backgroundColor: "#00000088",
      padding: { x: 6, y: 4 },
    }).setOrigin(0.5).setVisible(false);

    this.refreshStock(1);
  }

  // ================================
  // UPDATE
  // ================================
  public update(playerX: number, playerY: number): void {
    if (this._shopAperto) return;
    if (this._interactionEnabled) {
      this._controllaProssimita(playerX, playerY);
    } else {
      this._prompt.setVisible(false);
    }
    this._etichetta.setPosition(this.x, this.y - 90);
    this._prompt.setPosition(this.x, this.y - 120);
  }

  public setInteractionEnabled(enabled: boolean): void {
    this._interactionEnabled = enabled;
    if (!enabled) {
      this._prompt.setVisible(false);
    }
  }

  // ================================
  // SHOP LOGIC — PUBBLICI
  // ================================

  /** Rigenera i 2 slot e ricalcola i costi per l'ondata */
  public refreshStock(wave: number): void {
    this._ondataCorrente = wave;
    this._moltiplicatoreCosto = 1 + wave * Merchant.SCALA_COSTO_PER_ONDATA;
    this._moltiplicatoreValore = 1 + wave * Merchant.SCALA_VALORE_PER_ONDATA;

    const pescati = this._pescaPerkCasuali(Merchant.NUM_SLOT);
    this._slotAttivi = pescati.map(perk => ({
      perk,
      costoAttuale: this._calcolaCosto(perk),
      acquistato: false,
    }));

    console.log(`🛒 Stock aggiornato — ondata ${wave}`, this._slotAttivi);
  }

  /** Verifica se il player ha abbastanza anime */
  public canAfford(player: Player, cost: number): boolean {
    return player.anime >= cost;
  }

  /**
   * Restituiamo il perk temporaneo al chiamante quando serve una UI di scelta
   * slot, cosi' l'assegnazione avviene solo dopo una decisione esplicita.
   */
  public executePurchase(
    player: Player,
    slotIndex: number,
    autoEquipTemporary: boolean = true,
  ): Perk | null {
    const slot = this._slotAttivi[slotIndex];

    if (!slot || slot.acquistato) {
      console.warn("⚠️ Slot non valido o già acquistato");
      return null;
    }

    if (!this.canAfford(player, slot.costoAttuale)) {
      console.warn("⚠️ Anime insufficienti");
      return null;
    }

    const paid = player.spendi(slot.costoAttuale);
    if (!paid) {
      console.warn("⚠️ Anime insufficienti");
      return null;
    }

    slot.acquistato = true;
    let temporaryPerk: Perk | null = null;
    const scaledValue = this._calcolaValorePerk(slot.perk);

    if (slot.perk.tipo === "permanente") {
      this.applyPermanentUpgrade(player, slot.perk.categoria, scaledValue);
    } else {
      temporaryPerk = this._buildTemporaryPerk(player, slot.perk);
      if (temporaryPerk && autoEquipTemporary) {
        const equippedSlot = player.equipPerk(temporaryPerk);
        console.log(
          `⚡ Perk temporaneo ${slot.perk.nome} assegnato allo slot ${equippedSlot}`,
        );
      }
    }

    this._scena.events.emit("anime-cambiate", player.anime);
    this._scena.events.emit("update-score", player.anime);
    console.log(`✅ Acquistato: ${slot.perk.nome} — anime rimaste: ${player.anime}`);
    return temporaryPerk;
  }

  /**
   * Manteniamo qui la formula dei perk temporanei per garantire che UI e runtime
   * condividano la stessa progressione tra ondate.
   */
  public getPerkDisplayName(perk: IPerk): string {
    const scaledValue = this._calcolaValorePerk(perk);
    const tier = this._calcolaTierLabel();

    if (perk.id === "cura") {
      return `Cura Rituale ${tier}`;
    }

    if (perk.id === "scatto") {
      return `Scatto Ombra ${tier}`;
    }

    if (perk.id === "area") {
      return `Levatevi Di Torno ${tier}`;
    }

    if (perk.id === "hp_up") {
      return `Tempra +${scaledValue}`;
    }

    if (perk.id === "atk_up") {
      return `Furia +${scaledValue}%`;
    }

    if (perk.id === "speed_up") {
      return `Passo +${scaledValue}`;
    }

    return perk.nome;
  }

  public getPerkDisplayDescription(perk: IPerk): string {
    const scaledValue = this._calcolaValorePerk(perk);

    if (perk.id === "cura") {
      const healPercent = Phaser.Math.Clamp(
        scaledValue / 100,
        Merchant.CURA_MIN_PERCENT,
        Merchant.CURA_MAX_PERCENT,
      );
      const percent = Math.floor(healPercent * 100);
      return `Ripristina ${percent}% HP. Cooldown ${Merchant.CURA_COOLDOWN_MS}ms.`;
    }

    if (perk.id === "scatto") {
      const dashPower = Merchant.DASH_BASE_POWER
        + scaledValue * Merchant.DASH_POWER_PER_VALUE;
      return `Scatta con power ${dashPower}. Cooldown ${Merchant.DASH_COOLDOWN_MS}ms.`;
    }

    if (perk.id === "area") {
      const damage = Merchant.AREA_BASE_DAMAGE + scaledValue;
      const radius = Merchant.AREA_BASE_RADIUS + scaledValue;
      return `Infligge ${damage} danni in raggio ${radius}.`;
    }

    if (perk.id === "hp_up") {
      return `Aumenta la vita massima di ${scaledValue}.`;
    }

    if (perk.id === "atk_up") {
      return `Aumenta il danno base del ${scaledValue}%.`;
    }

    if (perk.id === "speed_up") {
      return `Aumenta la velocita' di ${scaledValue}.`;
    }

    return perk.descrizione;
  }

  public getPerkStatsText(perk: IPerk): string {
    const scaledValue = this._calcolaValorePerk(perk);

    if (perk.id === "cura") {
      const healPercent = Phaser.Math.Clamp(
        scaledValue / 100,
        Merchant.CURA_MIN_PERCENT,
        Merchant.CURA_MAX_PERCENT,
      );
      const percent = Math.floor(healPercent * 100);
      return `Cura: \n\tHP curati = ${percent}% \n\tCooldown = ${Merchant.CURA_COOLDOWN_MS}ms`;
    }

    if (perk.id === "scatto") {
      const dashPower = Merchant.DASH_BASE_POWER
        + scaledValue * Merchant.DASH_POWER_PER_VALUE;
      const cooldown = this._calcolaDashCooldown();
      return `Scatto: \n\tPower = ${dashPower} \n\tCooldown = ${cooldown}ms`;
    }

    if (perk.id === "area") {
      const damage = Merchant.AREA_BASE_DAMAGE + scaledValue;
      const radius = Merchant.AREA_BASE_RADIUS + scaledValue;
      return `Attacco AOE: \n\tDamage = ${damage} \n\tRaggio = ${radius}`;
    }

    if (perk.id === "hp_up") {
      return `Salute max: \n\tBonus HP = ${scaledValue}`;
    }

    if (perk.id === "atk_up") {
      return `Danno base: \n\tBonus = +${scaledValue}%`;
    }

    if (perk.id === "speed_up") {
      return `Velocita': \n\tBonus = +${scaledValue}`;
    }

    return perk.descrizione;
  }

  private _buildTemporaryPerk(player: Player, perk: IPerk): Perk | null {
    const scaledValue = this._calcolaValorePerk(perk);

    if (perk.id === "cura") {
      const healPercent = Phaser.Math.Clamp(
        scaledValue / 100,
        Merchant.CURA_MIN_PERCENT,
        Merchant.CURA_MAX_PERCENT,
      );
      return new PerkCura(player, healPercent, Merchant.CURA_COOLDOWN_MS);
    }

    if (perk.id === "scatto") {
      const dashPower = Merchant.DASH_BASE_POWER
        + scaledValue * Merchant.DASH_POWER_PER_VALUE;
      const dashCooldown = this._calcolaDashCooldown();
      return new PerkDash(
        player,
        dashPower,
        Merchant.DASH_DURATION_MS,
        dashCooldown,
      );
    }

    if (perk.id === "area") {
      const radius = Merchant.AREA_BASE_RADIUS + scaledValue;
      const damage = Merchant.AREA_BASE_DAMAGE + scaledValue;
      return new PerkAOE(player, radius, damage, Merchant.AREA_COOLDOWN_MS);
    }

    console.log(`⚡ Perk temporaneo ${perk.id} non mappato`);
    return null;
  }

  /**
   * Value scaling keeps temporary perks relevant in later waves without
   * exploding cooldown-based effects, preserving room for player mastery.
   */
  private _calcolaValorePerk(perk: IPerk): number {
    return Math.max(1, Math.floor(perk.valoreBase * this._moltiplicatoreValore));
  }

  private _calcolaDashCooldown(): number {
    return Merchant.DASH_COOLDOWN_MS;
  }

  private _calcolaTierLabel(): string {
    const tierValue = 1 + Math.floor(
      Math.max(0, this._ondataCorrente - 1) / Merchant.TIER_WAVE_STEP,
    );

    if (tierValue <= 1) {
      return "I";
    }

    if (tierValue === 2) {
      return "II";
    }

    if (tierValue === 3) {
      return "III";
    }

    if (tierValue === 4) {
      return "IV";
    }

    if (tierValue <= Merchant.TIER_MAX) {
      return "V";
    }

    return `V+${tierValue - Merchant.TIER_MAX}`;
  }

  /** Applica potenziamento permanente al player */
  public applyPermanentUpgrade(player: Player, type: PerkCategoria, valore: number): void {
    switch (type) {
      case "hp":
        player.aumentaHp(valore);
        break;
      case "atk":
        player.aumentaAtk(valore);
        break;
      case "speed":
        player.aumentaVelocita(valore);
        break;
      default:
        console.log(`🔧 Upgrade generico: ${valore}`);
    }
    this._scena.events.emit("vita-cambiata", player.getHp, player.getHpMax());
    this._scena.events.emit("update-hp", player.getHp, player.getHpMax());
  }

  /** Apre lo shop dall'esterno — es. fine ondata */
  public apriShopEsterno(): void {
    if (this._shopAperto) return;
    this._apriShop();
  }

  // ================================
  // METODI PRIVATI
  // ================================

  private _controllaProssimita(playerX: number, playerY: number): void {
    const distanza = Phaser.Math.Distance.Between(
      this.x, this.y, playerX, playerY
    );

    if (distanza <= this._raggioInterazione) {
      this._prompt.setVisible(true);
      
      // Controlla se un'ondata è in corso
      const gamePlayScene = this._scena.scene.get("GamePlay") as any;
      const ondataAttiva = gamePlayScene.waveManager?.isOndataActive() || false;
      
      // Cambia il testo in base allo stato dell'ondata
      if (ondataAttiva) {
        const now = this._scena.time.now;
        if (
          this._fraseBattagliaCorrente === ""
          || now >= this._prossimoCambioFraseBattagliaAt
        ) {
          this._fraseBattagliaCorrente = this._pickBattleLine();
          this._prossimoCambioFraseBattagliaAt =
            now + Merchant.FRASE_BATTAGLIA_INTERVAL_MS;
        }

        this._prompt.setText(this._fraseBattagliaCorrente);
        this._prompt.setColor("#ff6666");
      } else {
        this._prompt.setText("[ F ] Apri negozio");
        this._prompt.setColor("#ffaa00");
        this._fraseBattagliaCorrente = "";
        this._prossimoCambioFraseBattagliaAt = 0;
      }
      
      if (Phaser.Input.Keyboard.JustDown(this._tastoInterazione)) {
        this._apriShop();
      }
    } else {
      this._prompt.setVisible(false);
      this._fraseBattagliaCorrente = "";
      this._prossimoCambioFraseBattagliaAt = 0;
    }
  }

  /**
   * Evitiamo di ripetere subito la stessa frase per mantenere il feedback vivo
   * anche quando il giocatore resta vicino al mercante in piena ondata.
   */
  private _pickBattleLine(): string {
    const lines = Merchant.FRASI_BATTAGLIA;

    if (lines.length === 0) {
      return "Niente affari adesso, solo sopravvivenza.";
    }

    if (lines.length === 1) {
      return lines[0];
    }

    let candidate = lines[Phaser.Math.Between(0, lines.length - 1)];
    let retries = 0;

    while (candidate === this._fraseBattagliaCorrente && retries < 8) {
      candidate = lines[Phaser.Math.Between(0, lines.length - 1)];
      retries += 1;
    }

    return candidate;
  }

  private _apriShop(): void {
    // Controlla se un'ondata è in corso
    const gamePlayScene = this._scena.scene.get("GamePlay") as any;
    if (gamePlayScene.waveManager?.isOndataActive()) {
      console.warn("⚠️ Negozio bloccato! Un'ondata è in corso. Termina i nemici per accedere al negozio.");
      return;
    }

    this._shopAperto = true;
    this._prompt.setVisible(false);
    console.log("🛒 Shop aperto!");

    this._scena.physics.pause();
    this._scena.scene.pause();

    this._scena.scene.launch("ShopUI", {
      slot: this._slotAttivi,
    });

    this._scena.events.once("shop-chiuso", () => {
      this._chiudiShop();
    });
  }

  private _chiudiShop(): void {
    this._shopAperto = false;
    this._scena.scene.resume();
    this._scena.physics.resume();
    // Rigenera il stock per la prossima apertura
    this.refreshStock(this._ondataCorrente);
    console.log("🛒 Shop chiuso!");
  }

  private _pescaPerkCasuali(quantita: number): IPerk[] {
    return Phaser.Utils.Array.Shuffle([...this._poolPerk]).slice(0, quantita);
  }

  /**
   * Cost scaling ties economy to wave index so buying power remains a strategic
   * tradeoff instead of a guaranteed purchase after each combat.
   */
  private _calcolaCosto(perk: IPerk): number {
    return Math.floor(perk.costoBase * this._moltiplicatoreCosto);
  }

  // ================================
  // GETTER
  // ================================
  public get costScalePerWave(): number {
    return Merchant.SCALA_COSTO_PER_ONDATA;
  }

  public get valueScalePerWave(): number {
    return Merchant.SCALA_VALORE_PER_ONDATA;
  }

  public get currentCostMultiplier(): number {
    return this._moltiplicatoreCosto;
  }

  public get currentValueMultiplier(): number {
    return this._moltiplicatoreValore;
  }

  public get healCooldownMs(): number {
    return Merchant.CURA_COOLDOWN_MS;
  }

  public get dashCooldownMs(): number {
    return Merchant.DASH_COOLDOWN_MS;
  }

  public get areaCooldownMs(): number {
    return Merchant.AREA_COOLDOWN_MS;
  }

  public get slotAttivi(): ISlotMercante[] { return this._slotAttivi; }
  public get ondataCorrente(): number { return this._ondataCorrente; }
  public get shopAperto(): boolean { return this._shopAperto; }

  // ================================
  // DESTROY
  // ================================
  destroy(fromScene?: boolean): void {
    this._prompt.destroy();
    this._etichetta.destroy();
    super.destroy(fromScene);
  }
}