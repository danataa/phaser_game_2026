import Phaser from "phaser";
import Actor from "./Actor";

export default class Merchant extends Actor {

  // ================================
  // ATTRIBUTI
  // ================================

  // Distanza massima entro cui il player può interagire
  private _raggioInterazione: number = 120;

  // Testo "Premi E" che appare sopra la testa del merchant
  private _prompt!: Phaser.GameObjects.Text;

  // Etichetta "MERCANTE" sempre visibile sopra il personaggio
  private _etichetta!: Phaser.GameObjects.Text;

  // Evita di aprire lo shop due volte contemporaneamente
  private _shopAperto: boolean = false;

  // Tasto E per aprire lo shop
  private _tastoInterazione!: Phaser.Input.Keyboard.Key;

  // Riferimento alla scena
  private _scena: Phaser.Scene;

  // Lista perk disponibili nel negozio
  private _perk = [
    { nome: "Scatto",          costo: 50, descrizione: "Scatta rapidamente nella direzione di movimento" },
    { nome: "Cura",            costo: 30, descrizione: "Ripristina 30 HP immediatamente" },
    { nome: "Attacco ad area", costo: 70, descrizione: "Infligge danni a tutti i nemici vicini" },
    { nome: "+20 HP",          costo: 40, descrizione: "Aumenta la vita massima di 20" },
    { nome: "+10% Danno",      costo: 60, descrizione: "Aumenta il danno base del 10%" },
    { nome: "Scudo",           costo: 80, descrizione: "Assorbe il prossimo colpo ricevuto" },
  ];

  // ================================
  // COSTRUTTORE
  // ================================
  constructor(scene: Phaser.Scene, x: number, y: number) {

    // Creiamo il placeholder se la texture non esiste ancora
    // 🖼️ TODO: sostituire con la texture definitiva del mercante
    if (!scene.textures.exists("merchant_placeholder")) {
      const gfx = scene.add.graphics();

      // Corpo — rettangolo arancione grande
      gfx.fillStyle(0xffaa00);
      gfx.fillRect(0, 0, 64, 96);

      // Testa — cerchio più chiaro
      gfx.fillStyle(0xffcc66);
      gfx.fillCircle(32, 16, 18);

      // Mantello — triangolo scuro in basso
      gfx.fillStyle(0x884400);
      gfx.fillTriangle(0, 50, 64, 50, 32, 96);

      gfx.generateTexture("merchant_placeholder", 64, 96);
      gfx.destroy();
    }

    super(scene, x, y, "merchant_placeholder");

    this._scena = scene;

    // Il merchant è statico — non si muove mai
    this.setImmovable(true);
    this.setScale(1.5);

    // Tasto E per interagire
    this._tastoInterazione = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    // Etichetta "MERCANTE" — sempre visibile
    this._etichetta = scene.add.text(x, y - 90, "MERCANTE", {
      fontFamily: "'Press Start 2P'",
      fontSize: "20px",
      color: "#ffaa00",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Prompt "[ E ] Apri negozio" — visibile solo quando il player è vicino
    this._prompt = scene.add.text(x, y - 120, "[ E ] Apri negozio", {
      fontFamily: "'Press Start 2P'",
      fontSize: "20px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      backgroundColor: "#00000088",
      padding: { x: 6, y: 4 },
    }).setOrigin(0.5).setVisible(false);
  }

  // ================================
  // UPDATE — chiamato ogni frame da GamePlay
  // ================================
  update(playerX: number, playerY: number): void {
    // Non aggiorniamo se lo shop è aperto
    if (this._shopAperto) return;

    this.controllaProssimita(playerX, playerY);

    // Le etichette seguono la testa del merchant
    this._etichetta.setPosition(this.x, this.y - 90);
    this._prompt.setPosition(this.x, this.y - 120);
  }

  // ================================
  // CONTROLLA PROSSIMITÀ
  // ================================
  private controllaProssimita(playerX: number, playerY: number): void {
    const distanza = Phaser.Math.Distance.Between(
      this.x, this.y,
      playerX, playerY
    );

    if (distanza <= this._raggioInterazione) {
      this._prompt.setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this._tastoInterazione)) {
        this.apriShop();
      }
    } else {
      this._prompt.setVisible(false);
    }
  }

  // ================================
  // APRI SHOP
  // ================================
  public apriShop(): void {
    this._shopAperto = true;
    this._prompt.setVisible(false);
    console.log("🛒 Shop aperto!");

    // ✅ Freeziamo fisica e scena GamePlay
    this._scena.physics.pause();
    (this._scena as Phaser.Scene).scene.pause();

    // Generiamo perk casuali e lanciamo ShopUI in overlay
    const perkCasuali = this.generaPerk(4);
    this._scena.scene.launch("ShopUI", { perk: perkCasuali });

    // Ascoltiamo la chiusura dello shop da ShopUI
    this._scena.events.once("shop-chiuso", () => {
      this.chiudiShop();
    });
  }

  // ================================
  // CHIUDI SHOP
  // ================================
  private chiudiShop(): void {
    this._shopAperto = false;
    console.log("🛒 Shop chiuso!");

    // ✅ Riprendiamo fisica e scena GamePlay
    this._scena.scene.resume();
    this._scena.physics.resume();
  }

  // ================================
  // GENERA PERK CASUALI
  // Pesca N perk casuali dalla lista senza ripetizioni
  // ================================
  private generaPerk(quantita: number): typeof this._perk {
    return Phaser.Utils.Array.Shuffle([...this._perk]).slice(0, quantita);
  }

  // ================================
  // AGGIORNA PREZZI
  // Chiamato da GamePlay alla fine di ogni ondata — +20% per ondata
  // ================================
  public aggiornaPrezzi(ondata: number): void {
    this._perk = this._perk.map(p => ({
      ...p,
      costo: Math.floor(p.costo * (1 + ondata * 0.2)),
    }));
    console.log(`💰 Prezzi aggiornati per ondata ${ondata}`);
  }

  // ================================
  // DESTROY — pulizia quando la scena viene distrutta
  // ================================
  destroy(fromScene?: boolean): void {
    this._prompt.destroy();
    this._etichetta.destroy();
    super.destroy(fromScene);
  }
}