# Silmaril 2.0 — Client web

Un modo semplice per giocare a **Silmaril** dal browser (client Silmaril 2.0).

Il gioco è già impostato su:

- indirizzo: `silmaril.servegame.com`
- porta: `44444`

Non devi scrivere host o porta.

---

## Se ti hanno dato un link (il modo più facile)

1. Apri Chrome, Edge o Firefox.
2. Incolla il link che ti hanno mandato.
3. Aspetta che in alto compaia **In gioco**.
4. Gioca come al solito (nome, password, comandi).

In alto puoi usare **Bug** / **Miglioria** per segnalare problemi o idee.

Se non funziona: aggiorna la pagina (F5) e riprova.

### Admin (solo gestore)

Apri `/admin` sullo stesso sito, entra con la password configurata in `[admin]` e gestisci i ticket.

---

## Se vuoi farlo partire sul tuo PC (Windows)

### Passo 1 — Installa Rust (solo la prima volta)

1. Apri: [https://rustup.rs](https://rustup.rs)
2. Scarica e installa (lascia le opzioni normali).
3. **Riavvia il PC**.

### Passo 2 — Scarica questo progetto

- Da GitHub: pulsante verde **Code** → **Download ZIP**
- Oppure: `git clone` se sai già usarlo

Scompatta la cartella dove vuoi (es. Desktop).

### Passo 3 — Avvia

1. Entra nella cartella del progetto.
2. Fai **doppio clic** su `start.bat`
3. La prima volta può impiegare alcuni minuti (sta preparando il programma).
4. Quando nella finestra nera vedi qualcosa tipo `gateway listening`, apri il browser qui:

**http://127.0.0.1:8088/**

5. Gioca.

Per spegnere: chiudi la finestra nera di `start.bat`.

---

## Guida rapida nella pagina

| Zona | A cosa serve |
|------|----------------|
| Centro (Cronaca) | Testo del gioco |
| Basso | Dove scrivi i comandi |
| Sinistra | Luogo, bussola, Safe, barre vita/mana/movimento |
| Destra | Pulsanti personalizzati e scorciatoie |

**Safe:** imposta un punto, muoviti, poi “Torna” per ripercorrere indietro (se sei esausto, aspetta e premi Riprendi).

**Pulsanti / keybind:** restano salvati nel browser. In **Modifica** puoi **Esporta** / **Importa** un file JSON per fare backup o spostarli su un altro PC.

---

## Problemi frequenti

**Non so cos’è Rust / la finestra dice che manca cargo**  
Installa Rust da [https://rustup.rs](https://rustup.rs), riavvia il PC, riprova `start.bat`.

**La pagina non si apre**  
Controlla che `start.bat` sia ancora aperto e che l’indirizzo sia proprio `http://127.0.0.1:8088/`

**Dice Disconnesso**  
Silmaril potrebbe essere spento o la rete bloccata. Riprova più tardi.

**La prima volta è lentissima**  
Normale: scarica pezzi e compila. Dalla seconda volta è più veloce.

---

## Per chi gestisce un server (avanzato)

- **Questa VPS (deploy quotidiano):** vedi `DEPLOY-VPS.md` — locale prima, publish solo su richiesta, script `deploy/_redeploy_web.py`.
- **Guida generica Apache/HTTPS:** `DEPLOYMENT.md`.

In produzione:

- usa `config.production.toml` (o copia da `config.example.toml`)
- host e porta Silmaril restano quelli dell’esempio, salvo diversa necessità

Questo progetto è basato su **Silma Web Client** (licenza CC0, vedi `LICENSE`).
