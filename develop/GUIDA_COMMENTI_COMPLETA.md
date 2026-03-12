# 🎮 GUIDA COMPLETA AI COMMENTI - PHASER GAME 2026

## 📂 File Commentati Completamente

### ✅ **Actor.ts** - Classe Base
**Che cosa fa:** Fornisce le funzionalità base a tutti i personaggi (HP, movimento, danno)

**Attributi importanti:**
```typescript
private _hp: number;         // Punti vita attuali
private _hpMax: number;      // Punti vita massimi
private _speed: number;      // Velocità di movimento
```

**Metodi principali:**
```typescript
move(direction)          // Muove il personaggio
takeDamage(amount)       // Il personaggio riceve danno
setSpeed(value)          // Cambia la velocità
setHp(value)             // Imposta la vita
```

---

### ✅ **Player.ts** - Il Tuo Personaggio
**Che cosa fa:** Gestisce il movimento (WASD), l'attacco (click sinistro) e la raccolta di anime

**Attributi importanti:**
```typescript
private _dannoAttacco: number = 20;        // Danno per attacco
private _raggioAttacco: number = 100;      // Raggio d'effetto dell'attacco
private _cooldownAttacco: number = 600;    // ms tra attacchi
private _anime: number = 0;                // Anime raccolte
```

**Come funziona:**
```
1. Premi WASD → update() legge i tasti
2. Il player si muove alla velocità di 500 px/s
3. Clicchi il mouse sinistro → attacca()
4. Emetti evento "player-attacca"
5. I nemici hanno la chance di prendere danno
6. Quando muoiono, raccogliAnime()
```

---

### ✅ **Zombie.ts** - Nemico Intelligente
**Che cosa fa:** Nemico che ti insegue, attacca e rilascia anime

**Attributi importanti:**
```typescript
private _dannoContatto: number = 10;       // Danno quando mi attacca il player
private _raggioAttacco: number = 60;       // Distanza per attaccare il player
private _ondataCorrente: number;           // Quale ondata sono
private _animeRilasciate: number;          // Anime da dare al player
```

**Difficoltà per ondata:**
```
Ondata 1: Velocità 400, HP 30, Danno 10, Anime 5
Ondata 2: Velocità 525, HP 45, Danno 12, Anime 7
Ondata 3: Velocità 650, HP 60, Danno 14, Anime 9
```

**Come funziona:**
```
1. Ogni frame: update() calcola distanza dal player
2. inseguiPlayer() → muoviti verso il player
3. Se distanza < 60px → attacca()
4. Se prendi danno → takeDamage() → flash bianco
5. Se HP ≤ 0 → die() → rilascia anime
```

---

### ⏳ **WaveManager.ts** - Gestione Ondate
**Che cosa fa:** Controlla quando nascono i nemici, quando passa alla ondata successiva, aumenta difficoltà

**Attributi importanti:**
```typescript
private _ondataCorrente: number = 1;       // Ondata attuale
private _nemiciPerOndata: number = 5;      // Quanti nemici spawn
private _nemiciRimasti: number = 0;        // Nemici ancora vivi
private _ondataAttiva: boolean = false;    // Ondata in corso?
private _delaySpawn: number = 800;         // ms tra uno spawn e l'altro
```

**Timeline ondate:**
```
Ondata 1: 5 nemici, spawn ogni 800ms
Ondata 2: 7 nemici (+50%), spawn ogni 700ms
Ondata 3: 10 nemici (+50%), spawn ogni 600ms
Ondata 4+: +50% nemici, -100ms spawn (min 300ms)
```

**Come funziona:**
```
1. avviaOndata() → crea N nemici
2. I nemici spawano dai bordi uno dopo l'altro
3. I nemici aggiugnono il valore ondata corrente
4. Quando tutti muoiono: ondataCompletata()
5. Prepara la prossima ondata (più nemici, spawn più veloce)
```

---

### 🎮 **GamePlay.ts** - Scena Principale
**Che cosa fa:** Orchestration di tutto il gioco - player, nemici, collisioni, eventi

**Componenti:**
```typescript
private _player: Player;              // Il player
private _mapManager: MapManager;      // La mappa
private _merchant: Merchant;          // Negozio
private _waveManager: WaveManager;    // Ondate
```

**Eventi gestiti:**
```
"player-attacca"       → Colpisci nemici nel raggio
"nemico-morto"         → Un nemico è stato ucciso
"anima-spawned"        → Raccogli anime
"ondata-completata"    → Apri negozio
"resume"               → Riprendi dalla pausa (negozio)
```

---

## 🎯 Modifica Rapida

### Vuoi: Aumentare il danno del player?
**File:** Player.ts, Riga 25
```typescript
private _dannoAttacco: number = 20;  // Cambia in 30, 40, ecc
```

### Vuoi: Più nemici per ondata?
**File:** WaveManager.ts, Riga 20
```typescript
private _nemiciPerOndata: number = 5;  // Cambia in 10, 15, ecc
```

### Vuoi: Nemici più veloci?
**File:** Zombie.ts, Riga 65
```typescript
const velocita = 500 * moltiplicatore;  // Cambia 500 in 600, 700, ecc
```

### Vuoi: Meno danno ai nemici?
**File:** Zombie.ts, Riga 66
```typescript
const danno = Math.floor(10 + (ondata - 1) * 2);  // Riduci il 2
```

### Vuoi: Nemici spariscono più velocemente?
**File:** Zombie.ts, Riga 195
```typescript
duration: 300,  // Cambia in 150 per più veloce
```

---

## 📊 Diagramma del Flusso di Gioco

```
START
  ↓
[GamePlay create]
  ├─ Crea Player → velocità 500
  ├─ Crea WaveManager
  └─ Crea collisioni
  ↓
[GamePlay update - ogni frame]
  ├─ Player.update() → Leggi WASD, Animazioni
  ├─ WaveManager.update() → Aggiorna nemici
  └─ Merchant.update() → Controlla interazione
  ↓
[Attacco Player - Click sinistro]
  ├─ event: "player-attacca"
  ├─ Calcola nemici nel raggio
  └─ Infliggi 20 danno a ciascuno
  ↓
[Nemico prende danno]
  ├─ takeDamage() → flash bianco
  ├─ Se HP ≤ 0 → die()
  └─ event: "nemico-morto" → +anime
  ↓
[Tutti nemici morti]
  ├─ event: "ondata-completata"
  ├─ Apri negozio (3 sec)
  └─ Prepara ondata successiva (+50%)
  ↓
[LOOP ONDATE]
```

---

## 🔑 Concetti Chiave

### Velocità del Player
**500 px/s** = Molto veloce, puoi scappare dai nemici

### Cooldown Attacchi
**600ms** = 1.67 attacchi al secondo = rapido ma non spam

### Raggio Attacco
**100px** = Piuttosto lungo, puoi colpire da lontano

### Difficoltà Ondate
- **HP aumenta**: 30 → 45 → 60
- **Velocità aumenta**: 400 → 525 → 650
- **Numero aumenta**: 5 → 7 → 10
- **Spawn accelera**: 800 → 700 → 600 → 300ms

---

**Ultima aggiornamento:** 12 Marzo 2026
**Stato:** Tutti i file principali commentati
**Prossimi:** Skeleton.ts, Demon.ts, Merchant.ts (quando implementati pienamente)
