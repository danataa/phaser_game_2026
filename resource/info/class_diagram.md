# Diagramma delle Classi e Struttura File

Il progetto segue l'architettura a componenti suggerita dal template, estendendo le funzionalità di Phaser per gestire la logica specifica delle maschere e dei nemici.

## Struttura dei File (Directory `src/`)

```text
src/
├── GameData.ts           # Configurazione asset e costanti globali
├── index.ts              # Entry point e configurazione Phaser.Game
├── gameComponents/
│   ├── Actor.ts          # Classe base per Player e Enemy (fisica, hp)
│   ├── Player.ts         # Gestione input e movimento giocatore
│   ├── Enemy.ts          # Classe base IA nemici
│   ├── Projectile.ts     # Gestione proiettili (pozioni, raggio)
│   ├── masks/
│   │   ├── Mask.ts       # Interfaccia/Classe base Astratta per le maschere
│   │   ├── Alchemist.ts  # Logica maschera Alchimista
│   │   ├── Soldier.ts    # Logica maschera Soldato
│   │   └── Doctor.ts     # Logica maschera Medico
│   └── enemies/
│       ├── Golem.ts      # Nemico resistente al fisico
│       ├── Ghost.ts      # Nemico veloce
│       └── Infected.ts   # Nemico tossico
├── scenes/
│   ├── Boot.ts           # Inizializzazione sistema
│   ├── Preloader.ts      # Caricamento asset definiti in GameData
│   ├── Intro.ts          # Menu principale
│   ├── GamePlay.ts       # Scena principale (loop dei livelli)
│   ├── Hud.ts            # UI sovrapposta (HP, Maschere)
│   └── GameOver.ts       # Schermata di fine gioco/vittoria
└── helpers/
    └── StateMachine.ts   # Helper per gestire gli stati (fasi boss, stati player)
```

## Relazioni tra le Classi (Logica)

### 1. Sistema delle Maschere (Pattern Strategy)
- **Player** possiede un'istanza di `Mask`.
- Quando il giocatore preme 1, 2 o 3, il `Player` sostituisce l'istanza corrente con `AlchemistMask`, `SoldierMask` o `DoctorMask`.
- Ogni classe Maschera implementa i metodi:
  - `attack()`: Azione base.
  - `special()`: Abilità con cooldown.
  - `getPassive()`: Bonus passivo applicato al Player.

### 2. Gerarchia Actor
- **Actor** (extends `Phaser.GameObjects.Sprite`):
    - Proprietà: `hp`, `speed`, `isDead`.
    - Metodo: `takeDamage(amount, type)`.
- **Player** (extends `Actor`):
    - Gestisce `Mask` e input WASD.
- **Enemy** (extends `Actor`):
    - Proprietà: `weakness` (tipo di danno a cui è vulnerabile).
    - Metodo: `updateAI()`.

### 3. Comunicazione Scene
- **GamePlay** gestisce il mondo di gioco (mappe, collisioni).
- **Hud** ascolta gli eventi emessi da `GamePlay` (es. "update-hp", "mask-changed") per aggiornare l'interfaccia senza appesantire la logica di gioco.

## Flusso di Gioco
1. `Intro` -> Click su Start.
2. `GamePlay` carica il Livello 1.
3. `Player` interagisce con `Enemy` e `Environment`.
4. Al raggiungimento dell'uscita, `GamePlay` resetta la mappa e carica il livello successivo.
5. Sconfitto il Boss in `GamePlay`, si passa a `GameOver` (Vittoria).
