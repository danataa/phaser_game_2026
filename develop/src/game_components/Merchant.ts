import Phaser from "phaser";
import Actor from "./Actor";
import Player from "./Player";

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

  // ================================
  // ATTRIBUTI
  // ================================
  private _scena: Phaser.Scene;

  private _poolPerk: IPerk[] = [
    { id: "cura",     nome: "Cura",          descrizione: "Ripristina 30 HP",              costoBase: 30, valoreBase: 30, tipo: "permanente", categoria: "hp"      },
    { id: "hp_up",    nome: "+20 HP",         descrizione: "Aumenta la vita massima di 20", costoBase: 40, valoreBase: 20, tipo: "permanente", categoria: "hp"      },
    { id: "atk_up",   nome: "+10% Danno",     descrizione: "Aumenta il danno base del 10%", costoBase: 60, valoreBase: 10, tipo: "permanente", categoria: "atk"     },
    { id: "speed_up", nome: "+Velocità",      descrizione: "Aumenta la velocità",           costoBase: 50, valoreBase: 50, tipo: "permanente", categoria: "speed"   },
    { id: "scatto",   nome: "Scatto",         descrizione: "Scatta nella direzione",        costoBase: 50, valoreBase: 1,  tipo: "temporaneo", categoria: "generic" },
    { id: "area",     nome: "Attacco area",   descrizione: "Danni a tutti i nemici vicini", costoBase: 70, valoreBase: 20, tipo: "temporaneo", categoria: "generic" },
  // scudo temporaneamente disabilitato
  //{ id: "scudo",    nome: "Scudo",          descrizione: "Assorbe il prossimo colpo",     costoBase: 80, valoreBase: 1,  tipo: "temporaneo", categoria: "generic" },
  ];

  private _slotAttivi: ISlotMercante[] = [];
  private _moltiplicatoreScaling: number = 1;
  private _ondataCorrente: number = 1;
  private _shopAperto: boolean = false;
  private _raggioInterazione: number = 300;
  private _tastoInterazione: Phaser.Input.Keyboard.Key;
  private _etichetta: Phaser.GameObjects.Text;
  private _prompt: Phaser.GameObjects.Text;

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

    // Hitbox più piccola centrata sul personaggio
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
    this._controllaProssimita(playerX, playerY);
    this._etichetta.setPosition(this.x, this.y - 90);
    this._prompt.setPosition(this.x, this.y - 120);
  }

  // ================================
  // SHOP LOGIC — PUBBLICI
  // ================================

  /** Rigenera i 2 slot e ricalcola i costi per l'ondata */
  public refreshStock(wave: number): void {
    this._ondataCorrente = wave;
    this._moltiplicatoreScaling = 1 + wave * Merchant.SCALA_COSTO_PER_ONDATA;

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

  /** Esegue l'acquisto dello slot indicato */
  public executePurchase(player: Player, slotIndex: number): void {
    const slot = this._slotAttivi[slotIndex];

    if (!slot || slot.acquistato) {
      console.warn("⚠️ Slot non valido o già acquistato");
      return;
    }

    if (!this.canAfford(player, slot.costoAttuale)) {
      console.warn("⚠️ Anime insufficienti");
      return;
    }

    player.spendi(slot.costoAttuale);
    slot.acquistato = true;

    if (slot.perk.tipo === "permanente") {
      this.applyPermanentUpgrade(player, slot.perk.categoria, slot.perk.valoreBase);
    } else {
      // TODO: applicare effetti temporanei
      console.log(`⚡ Perk temporaneo: ${slot.perk.nome}`);
    }

    this._scena.events.emit("anime-cambiate", player.anime);
    console.log(`✅ Acquistato: ${slot.perk.nome} — anime rimaste: ${player.anime}`);
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
      const ondataAttiva = gamePlayScene._waveManager?.isOndataActive() || false;
      
      // Cambia il testo in base allo stato dell'ondata
      if (ondataAttiva) {
        this._prompt.setText("Al termine puoi aprire");
        this._prompt.setColor("#ff6666");
      } else {
        this._prompt.setText("[ F ] Apri negozio");
        this._prompt.setColor("#ffaa00");
      }
      
      if (Phaser.Input.Keyboard.JustDown(this._tastoInterazione)) {
        this._apriShop();
      }
    } else {
      this._prompt.setVisible(false);
    }
  }

  private _apriShop(): void {
    // Controlla se un'ondata è in corso
    const gamePlayScene = this._scena.scene.get("GamePlay") as any;
    if (gamePlayScene._waveManager?.isOndataActive()) {
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

  private _calcolaCosto(perk: IPerk): number {
    return Math.floor(perk.costoBase * this._moltiplicatoreScaling);
  }

  // ================================
  // GETTER
  // ================================
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