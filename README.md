# (RE)VOLUTION

Benvenuti nel repository di **(RE)VOLUTION**, un videogioco survival top-down sviluppato con **Phaser 3** e **TypeScript**. Il progetto è ambientato durante la Rivoluzione Francese in un'atmosfera cupa e soprannaturale.

## 📖 Storia e Ambientazione
Parigi, fine XVIII secolo. Le masse sono in fermento, la rivoluzione è nell'aria. Il Re di Francia, consapevole che nulla può salvarlo da un popolo in subbuglio, stringe un patto disperato con il diavolo in persona. Il sovrano permette l'apertura dei cancelli dell'inferno situati nelle profondità delle catacombe parigine in cambio della promessa (ingannevole) che i rivoltosi vengano placati.

Il nostro eroe, un vecchio cavaliere che ha ancora qualche colpo in canna, riceve una lettera anonima che svela il terribile piano. Decide così di addentrarsi nelle catacombe per respingere le ripugnanti creature infernali e permettere che la storia faccia il suo corso, proteggendo il popolo dal sovrannaturale.

## 🕹️ Gameplay
**(RE)VOLUTION** è un survival top-down ispirato a titoli come *Vampire Survivors*. Il giocatore deve sopravvivere a ondate crescenti di nemici all'interno di una vasta mappa delle catacombe di Parigi.

### Obiettivo e Progressione
*   **Sopravvivenza:** Resistere a quante più orde possibili. Il gioco termina con la morte del giocatore.
*   **Anime:** I nemici sconfitti rilasciano anime, la valuta del gioco.
*   **Lo Shop:** Tra un'orda e l'altra, il giocatore può accedere a un negozio situato al centro della mappa per acquistare potenziamenti e abilità.

### ✨ Il Sistema dei Perk
Il giocatore dispone di **solo 2 slot** per i perk speciali. Questi appaiono casualmente nel negozio, potenziandosi e aumentando di prezzo dopo ogni ondata:
*   **Scatto:** Permette di scattare rapidamente nella direzione di movimento.
*   **Cura:** Ripristina una porzione della salute.
*   **Attacco ad area:** Un attacco speciale che infligge danni radiali ai nemici circostanti.

Oltre ai perk, sono disponibili **potenziamenti permanenti** per statistiche base come Salute Massima e Potenza d'Attacco.

## 👹 Bestiario
*   **Non Morto:** Nemico base, lento, attacca in mischia.
*   **Scheletro:** Combattente agile, utilizza cariche rapide e colpi di spada.
*   **Demone:** Attaccante a distanza, lancia palle di fuoco micidiali.

## 🛠️ Tecnologie Utilizzate
*   **Motore di gioco:** [Phaser 3](https://phaser.io/)
*   **Linguaggio:** TypeScript
*   **Level Design:** Tiled (JSON Tilemaps)
*   **Build Tool:** Webpack

## 📁 Struttura del Progetto
*   `develop/src/`: Codice sorgente del gioco (Scene, Componenti, Logica).
*   `assets/`: Risorse grafiche, sonore e tilemap.
*   `resource/info/`: Documentazione dettagliata (Concept, Diagrammi).

---
*Progetto realizzato per il corso "Crea un videogame con PhaserJs e Typescript".*
