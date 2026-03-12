# 📝 GUIDA AI COMMENTI DEL GIOCO

## Struttura del Progetto

```
src/
├── game_components/          # Componenti principali del gioco
│   ├── Actor.ts             # ✅ COMMENTATO - Classe base personaggi
│   ├── Player.ts            # ✅ COMMENTATO - Il tuo personaggio
│   ├── WaveManager.ts       # Gestisce le ondate di nemici
│   ├── Merchant.ts          # Negozio per acquistare potenziamenti
│   ├── enemies/
│   │   └── Zombie.ts        # ✅ COMMENTATO - Nemico intelligente
│   │   ├── Skeleton.ts      # Nemico veloce (da personalizzare)
│   │   └── Demon.ts         # Nemico forte (da personalizzare)
├── scenes/
│   ├── GamePlay.ts          # Scena principale del gioco
│   ├── Menu.ts              # Menu iniziale
│   ├── Boot.ts              # Caricamento risorse
│   └── Preloader.ts         # Precaricamento asset
└── assets/                  # Immagini, suoni, mappe
```

---

## 🎮 Come Funziona il Gioco

### 1️⃣ **MOVIMENTO E ATTACCO (Player.ts)**
```
WASD = Movimento
Click sinistro = Attacco
```
- Il player si muove con WASD a 500 px/s
- Ogni attacco infligge 20 danno (cooldown 600ms)
- L'attacco colpisce nemici entro 100px

### 2️⃣ **NEMICI E ONDATE (Zombie.ts + WaveManager.ts)**
```
Ondata 1: 5 nemici, 30 HP, 10 danno
Ondata 2: 7 nemici, 45 HP, 12 danno  
Ondata 3: 10 nemici, 60 HP, 14 danno
```
- I nemici ti inseguono sempre
- Attaccano quando ti avvicini (entro 60px)
- Rilasciano anime quando muoiono
- Ogni ondata è il 50% più difficile

### 3️⃣ **ANIME E NEGOZIO (Player.ts + Merchant.ts)**
```
Raccogli anime → Apri negozio → Compra potenziamenti
```
- Ogni kill dà anime (5 per nemico semplice)
- Usa le anime per potenziamenti nel negozio
- I prezzi aumentano ogni ondata (+20%)

---

## 📖 LEGGENDA COMMENTI

Nei file troverai:

### Blocchi di Sezione
```typescript
// ===== RIFERIMENTI E ATTRIBUTI PRINCIPALI =====
private _player: Phaser.Physics.Arcade.Sprite;
```
Raggruppa variabili correlate

### Commenti di Metodo
```typescript
/**
 * Attacca i nemici nel raggio d'attacco
 * @param time - Timestamp attuale del gioco
 */
```
Documenta cosa fa il metodo e i parametri

### Commenti Inline
```typescript
direction.normalize();  // Rendi la velocità costante in diagonale
```
Spiega il "perché" del codice, non il "cosa"

---

## 🔧 MODIFICHE FREQUENTI

### Aumentare il Danno del Player
**Player.ts** - Riga 25
```typescript
private _dannoAttacco: number = 20;  // Aumenta questo numero
```

### Cambiare Velocità Nemici
**Zombie.ts** - Riga 65
```typescript
const velocita = 500 * moltiplicatore;  // Aumenta il 500
```

### Più Nemici per Ondata
**WaveManager.ts** - Inizio metodo `avviaOndata()`
```typescript
this._nemiciPerOndata = 5;  // Aumenta questo numero
```

---

## 🎯 PROSSIMI PASSI

1. **Completare i commenti per:**
   - WaveManager.ts
   - GamePlay.ts
   - Merchant.ts
   - Skeleton.ts e Demon.ts (quando pronti)

2. **Aggiungere tipi TypeScript** per validare meglio il codice

3. **Refactoring** in base ai feedback del gameplay

---

**Ultima modifica:** 12 Marzo 2026
**Autore:** AI Assistant
