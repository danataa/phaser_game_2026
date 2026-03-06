# Piano di Sviluppo: (RE)VOLUTION

Questo documento delinea la suddivisione dei compiti per il team di sviluppo. Il progetto è strutturato in modo modulare per facilitare l'integrazione del codice.

---

## 👤 Gioacchino: Sviluppo Player e Sistema Maschere
**Focus:** Meccaniche di movimento, gestione delle classi del giocatore e sistema di combattimento diversificato.

### Compiti Dettagliati:
- [ ] **Classe Base `Actor` e `Player`**: Implementazione del movimento top-down e gestione della vita (HP).
- [ ] **Sistema di Switch Maschere**: Realizzazione della logica per cambiare maschera durante il gameplay con cooldown.
- [ ] **Sviluppo Maschere (Pattern Strategy)**:
    - **Alchimista**: Attacco proiettile (Spuntoni di ghiaccio) e abilità area (Bomba acida).
    - **Cavaliere**: Attacco melee (Spata) e abilità di movimento (Carica/Dash).
    - **Chierico**: Attacco area (Cerchio sacro) e abilità di supporto (Cura).
- [ ] **Gestione Input**: Mapping dei tasti per movimento, attacco, abilità speciale e switch maschere.

---

## 👤 Mahi: Sviluppo Nemici e Intelligenza Artificiale
**Focus:** Comportamento delle entità ostili e logica di spawn.

### Compiti Dettagliati:
- [ ] **Classe Base `Enemy`**: Logica comune a tutti i nemici (movimento verso il player, ricezione danno).
- [ ] **Implementazione Varianti Nemici**:
    - **Demone**: Vulnerabile all'Alchimista.
    - **Scheletro**: Vulnerabile al Cavaliere.
    - **Non Morto**: Vulnerabile al Chierico.
- [ ] **IA di Inseguimento**: Sviluppo dell'algoritmo di pathfinding semplice per seguire costantemente il player.
- [ ] **Sistema di Debolezze**: Integrazione dei moltiplicatori di danno in base alla maschera attiva del giocatore.

---

## 👤 Daniele: Regia, Integrazione e World Building
**Focus:** Gestione delle scene, interfaccia utente (UI) e coordinamento del codice globale.

### Compiti Dettagliati:
- [ ] **Gestione Scene (Phaser Scenes)**:
    - **Intro**: Integrazione e riproduzione del file video della cutscene (fornito dal team grafico).
    - **GamePlay**: Setup del loop principale e gestione della Tilemap delle Catacombe.
    - **Hud**: Creazione dell'interfaccia (barre HP, timer orde, icone maschere e cooldown).
- [ ] **Gestione Orde**: Implementazione del sistema di spawn progressivo (stile survival).
- [ ] **Integrazione Asset**: Organizzazione e caricamento di sprite, tilemap e file audio.
- [ ] **Merging e Debug**: Revisione del codice degli altri membri e risoluzione dei conflitti per garantire la fluidità del gioco.

---

## 🎨 Team Grafico
- [ ] **Produzione Cutscene**: Creazione del video narrativo (Lettera/Re/Diavolo) completo di audio.
- [ ] **Asset Artistici**: Fornitura di sprite, animazioni e tileset.
- [ ] **Level Design**: Creazione tilemap.

---

## 🛠️ Tecnologie di Riferimento
- **Engine**: Phaser 3 (TypeScript)
- **Video**: Plugin Video di Phaser 3 per la cutscene intro.
- **Architettura**: Orientata ai Componenti.
- **Mappe**: Tiled (JSON Tilemaps).