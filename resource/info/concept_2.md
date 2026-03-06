# Concept di Gioco: (RE)VOLUTION

## Storia
Francia, Parigi. Nell'aria si respira rivoluzione: le masse sono in fermento, i parigini non ne possono più e devono fare qualcosa. Il re lo sa bene e sa anche che nulla può salvarlo da un popolo in subbuglio, nulla tranne un patto con il diavolo in persona. Il diavolo promette al re che, se gli avesse permesso di aprire i cancelli dell'inferno situati nelle catacombe di Parigi, avrebbe placato i rivoltosi (probabilmente con il terrore, ma l'ingenuo re non lo sapeva).

Una lettera anonima arriva al nostro eroe, *[nome_eroe]*. Agli occhi di tutti è un semplice alchimista, ma possiede una speciale maschera che gli permette di tramutarsi in varie forme (alchimista, cavaliere, chierico). Viene avvisato dell'imminente pericolo e decide di entrare nelle catacombe per evitare la catastrofe.

### Come far capire la storia al player
Piccola cutscene per immagini:
1. Busta da lettera
2. Lettera aperta
3. Re
4. Rivolta
5. Diavolo
6. Lettera aperta

Nel frattempo, una voce narrante AI legge la lettera, che contiene la storia.

---

## Gameplay
Il gioco è un top-down survival simile a *Vampire Survivors*.  
Ambientato in un'unica grande mappa (tilemap) rappresentante le catacombe di Parigi. Il giocatore deve affrontare un numero definito di orde di nemici di vario tipo (che stanno uscendo dalla porta dell'inferno) e, una volta sconfitte tutte, completa il gioco.

La meccanica principale è la possibilità di **switchare tra tre maschere** durante il gameplay (con un tempo di attesa tra uno switch e l'altro). Ogni maschera cambia radicalmente lo stile di gioco ed è più efficace contro specifici tipi di nemici.

### Maschere

#### Alchimista
- **Attacco base**: lancia spuntoni di ghiaccio (a distanza)
- **Abilità speciale**: bomba acida (ad area)
- **Nemici deboli**: demoni

#### Cavaliere
- **Attacco base**: spada (corpo a corpo)
- **Abilità speciale**: carica – il personaggio si sposta rapidamente nella direzione indicata (da decidere se causa solo spostamento o anche danno)
- **Nemici deboli**: scheletri

#### Chierico
- **Attacco base**: preghiera – genera un cerchio sacro intorno a sé che danneggia i dannati (ad area)
- **Abilità speciale**: recupero vita
- **Nemici deboli**: non morti

### Nemici
- **Demone**: attacco corpo a corpo (da implementare meglio se avanza tempo)
- **Scheletro**: attacco corpo a corpo (da implementare meglio se avanza tempo)
- **Non morto**: attacco corpo a corpo (da implementare meglio se avanza tempo)

---

## Diagramma delle Classi (concettuale)

- **Player**  
  *Gestisce i movimenti di base del personaggio, la barra della vita, ecc.*

  - **Alchimista** (estende Player)  
    *Implementa l'attacco di base (spuntoni di ghiaccio) e l'abilità (bomba acida)*

  - **Cavaliere** (estende Player)  
    *Implementa l'attacco di base (spada) e l'abilità (carica)*

  - **Chierico** (estende Player)  
    *Implementa l'attacco di base (preghiera ad area) e l'abilità (recupero vita)*

- **Nemico**  
  *Implementa l'AI di movimento verso il player, i punti di spawn degli sprite e la barra della vita*

  - **Demone** (estende Nemico)  
    *Implementa l'attacco specifico*

  - **Scheletro** (estende Nemico)  
    *Implementa l'attacco specifico*

  - **NonMorto** (estende Nemico)  
    *Implementa l'attacco specifico*

---

## Cosa c'entra con (RE)VOLUTION?
- **La storia**: parla della Rivoluzione francese, e il nostro compito è di permetterla in un certo senso.
- **Il gameplay**: la dinamica di switch tra le tre maschere rappresenta una rivoluzione dello stile di gioco ad ogni cambio.