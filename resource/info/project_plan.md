# Project Plan: The Alchemist's Masks

## Informazioni Generali
- **Team:** 5 Componenti
- **Durata:** 10 Giorni
- **Tecnologia:** TypeScript, Phaser 3
- **Genere:** 2D Top-down Action

## Ruoli e Responsabilità
1. **Lead Programmer & Architect:** Gestione architettura, sistema delle Maschere, stato globale del gioco.
2. **Gameplay & Combat Programmer:** IA nemici, collisioni, combat loop, boss phases.
3. **Level & Technical Designer:** Creazione mappe (Tiled), implementazione puzzle, interazioni ambientali.
4. **UI/UX & Sound Programmer:** HUD, menu, feedback visivi (VFX) e sonori (SFX), transizioni scene.
5. **Asset & Integration Manager:** Animazioni sprite, gestione asset (immagini/suoni), rifinitura estetica.

## Roadmap (10 Giorni)

### Fase 1: Setup e Core (Giorno 1-2)
- Setup repository e boilerplate dal template.
- Implementazione movimento base (WASD).
- Prototipo sistema di cambio maschera (Input 1, 2, 3) con cooldown.
- Ricerca/Creazione asset grafici base (Placeholder).

### Fase 2: Meccaniche e Livello 1 (Giorno 3-4)
- Implementazione attacchi base per le 3 maschere.
- Sviluppo Livello 1 (Tilemap).
- IA Nemico base (Patrol/Chase).
- Creazione del primo puzzle (es. porta bloccata).

### Fase 3: Espansione e Abilità (Giorno 5-6)
- Implementazione abilità speciali (Bomba Acida, Carica, Cura).
- Sviluppo Livello 2 e 3.
- Inserimento varianti nemici (Golem, Spettro, Infetto) con debolezze specifiche.
- Sistema di HUD (Barra HP, Icona Maschera attiva, Cooldown).

### Fase 4: Boss Battle e Refinement (Giorno 7-8)
- Implementazione Boss Finale "Il Cuore della Piaga" (3 fasi).
- Refinement dei puzzle ambientali.
- Integrazione completa SFX e Musica.
- Gestione Game Over e Schermata Vittoria.

### Fase 5: Polishing e Debug (Giorno 9-10)
- Playtesting e bilanciamento difficoltà.
- Bug fixing (collisioni, glitch grafici).
- Ottimizzazione performance.
- Preparazione consegna e documentazione finale.

## Strumenti
- **Codice:** VS Code + Phaser 3 + TypeScript
- **Asset:** Tiled (Mappe), Aseprite/Piskel (Pixel Art)
- **Collaborazione:** Git/GitHub
