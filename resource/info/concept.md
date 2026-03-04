# Titolo del Gioco (TBD)

## 🌟 Concept Fondamentale
Un alchimista possiede **tre maschere magiche** che gli conferiscono poteri unici. Deve affrontare una piaga che trasforma gli esseri viventi in mostri. Il giocatore può cambiare maschera in qualsiasi momento per adattarsi ai nemici e all'ambiente circostante.

**Obiettivo:** Raggiungere la capitale e distruggere la fonte della Piaga.

---

## 🎮 Gameplay in Breve
*   **Genere:** Action 2D Top-Down (visuale dall'alto) a stanze collegate.
*   **Controlli:**
    *   `WASD`: Movimento.
    *   `Click Sinistro` / `Spazio`: Attacco base.
    *   `1`, `2`, `3`: Cambio rapido della maschera.
*   **Meccaniche Core:**
    *   Ogni maschera ha un'**abilità base**, un'**abilità speciale** (con cooldown) e una **passiva**.
    *   I nemici presentano debolezze specifiche legate a una determinata maschera.
    *   Progressione lineare: focus sull'azione e sul cambio tattico delle maschere, senza sistemi complessi di crafting o risorse.

---

## 🎭 Le Tre Maschere

| Maschera | Abilità Base | Abilità Speciale | Utilità / Debolezze |
| :--- | :--- | :--- | :--- |
| **Alchimista** | **Pozione di Fuoco:** Area di danno nel tempo (DoT). | **Bomba Acida:** Danno istantaneo e riduzione difesa. | Efficace contro **nemici corazzati**. |
| **Soldato** | **Fendente di Spada:** Danno fisico ravvicinato. | **Carica:** Scatto in avanti che danneggia e stordisce. | Efficace contro **nemici veloci**. |
| **Medico** | **Raggio Benevolo:** Attacco a distanza che scaccia il male. | **Cura:** Ripristina una percentuale di HP. | Efficace contro **infetti dalla Piaga**. |

> **Nota sul Cambio Maschera:** Il cambio è istantaneo e privo di costo, con un brevissimo cooldown (0.5s) per prevenire lo spam eccessivo.

---

## 🧩 Struttura del Gioco

### Livelli
Il gioco si articola in **3 livelli (o macro-stanze)** lineari, ognuno contenente:
1.  **Area Esplorativa:** Un ambiente a tema con piccoli segreti.
2.  **Scontri:** 2-3 tipologie di nemici diversi per stanza.
3.  **Puzzle Ambientale:** Sfide semplici che richiedono una maschera specifica (es. muro di fiamme da estinguere o porte pesanti da sfondare).
4.  **Boss Finale:** Uno scontro epico che richiede l'alternanza di tutte le maschere.

### Bestiario (Esempi)
*   🪨 **Golem di Pietra:** Resistente ai danni fisici, vulnerabile al calore (**Alchimista**).
*   👻 **Spettro Veloce:** Schiva i colpi lenti, vulnerabile allo stordimento della carica (**Soldato**).
*   🤮 **Infetto:** Rilascia nubi tossiche, vulnerabile alla purificazione (**Medico**).

### Boss Finale: Il Cuore della Piaga
Un'entità mutante che attraversa tre fasi distinte, ognuna legata a una maschera:
*   **Fase 1 (Pietra):** Protetto da uno scudo minerale. Richiede il **Soldato** per essere infranto.
*   **Fase 2 (Veleno):** Emana miasmi tossici. Richiede il **Medico** per purificare l'aria e infliggere danni.
*   **Fase 3 (Rigenerazione):** Tenta di curarsi rapidamente. Richiede l'**Alchimista** per bruciarlo costantemente.
