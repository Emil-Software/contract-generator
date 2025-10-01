# Contract Generator
- [Contract Generator](#contract-generator)
  - [Descrizione](#descrizione)
  - [Funzionamento](#funzionamento)
  - [`DocumentParams`](#documentparams)
    - [Numero della pagina](#numero-della-pagina)
  - [`DocumentConfig`](#documentconfig)
    - [Definizione dei **font**](#definizione-dei-font)
    - [Inserimento testi](#inserimento-testi)
    - [Inserimento immagini](#inserimento-immagini)
    - [Elenchi](#elenchi)
    - [Salto Riga](#salto-riga)
    - [Struttura per il template `.json`](#struttura-per-il-template-json)
      - [Sezioni File](#sezioni-file)
        - [versione](#versione)
        - [impostazioni pagina](#impostazioni-pagina)
        - [contenuti](#contenuti)
      - [Esempio file](#esempio-file)
      - [Sintassi per formattazione](#sintassi-per-formattazione)


## Descrizione

Libreria che genera pdf con la possibilità di inserire testi, immagini, elenchi, tabelle

## Funzionamento

I dati che vanno a generare il documento arrivano da due oggetti: `DocumentParams` e `DocumentConfig`.
- `DocumentConfig` costituisce lo scheletro rigido del documento e fornisce quindi la struttura di base definendo la posizione e gli stili degli elementi nel pdf
- `DocumentParams` viene passato dinamicamente ogni volta che si genera un documento e contiene i dati variabili come nomi, date, dati contenuti nelle tabelle ecc..



## API backend NestJS

Per facilitare l'utilizzo del nuovo servizio `TemplateGenerator` è stato aggiunto un micro-backend basato su [NestJS](https://nestjs.com/).
L'applicazione espone tre endpoint REST sotto il prefisso `/api`:

| Metodo | Endpoint         | Descrizione |
| ------ | ---------------- | ----------- |
| `POST` | `/api/templates` | Crea un nuovo template JSON, opzionalmente persistendolo su disco. |
| `GET`  | `/api/templates` | Carica il template da un percorso JSON esistente (`?path=/percorso/file.json`). |
| `PATCH`| `/api/templates` | Aggiorna un file di configurazione esistente con il payload fornito. |

### Avvio in locale

1. Installare le dipendenze del progetto.
2. Eseguire la build TypeScript (`npm run build`).
3. Avviare il server con `node dist/backend/main.js` (porta di default `3000`, configurabile tramite `PORT`).

Ogni endpoint restituisce il template aggiornato e, quando viene effettuato il salvataggio, anche il percorso del file.



## `DocumentParams`

### Numero della pagina
``` javascript
  numPagina: {
      label: "Pag",
      fontId: "testiPiccoli",
      totPages: "di"
  },
```
Per inserire il numero della pagina in calce al documento è necessario passare un oggetto simile a quello sopra.
- `label` sarà l'etichetta davanti al numero. Questo può essere anche stringa vuota ma è obbligatorio che sia presente.
- `fontId` se si vuole assegnare un font diverso da quello di default occore passare l'id di uno dei font definiti nelle [configurazioni](#definizione-dei-font)
- `totPages` se presente questa stringa viene posta tra il numero di pagina e il totale delle pagine del documento, altrimenti non viene mostrato il totale.

 

## `DocumentConfig`

Essendo un elemento statico che mira a costituire un template fisso per ogni documento, è possibile definirlo all'interno del progetto come file `.json`. Passando al costruttore il percorso di tale file verrà letto direttamente dalla libreria.

### Definizione dei **font**

Possiamo predisporre i font da utilizzare nel documento, passando un elemento di tipo `DocumentFont`
font disponibili di default: 
- helvetica: [ 'normal', 'bold', 'italic', 'bolditalic' ],
- Helvetica: [ '', 'Bold', 'Oblique', 'BoldOblique' ],
- courier: [ 'normal', 'bold', 'italic', 'bolditalic' ],
- Courier: [ '', 'Bold', 'Oblique', 'BoldOblique' ],
- times: [ 'normal', 'bold', 'italic', 'bolditalic' ],
- Times: [ 'Roman', 'Bold', 'Italic', 'BoldItalic' ],
- zapfdingbats: [ 'normal' ],
- ZapfDingbats: [ '' ],
- symbol: [ 'normal' ],
- Symbol: [ '' ],




### Inserimento testi

I testi possono essere inseriti con la chiave `testo` e il contenuto di tale campo può essere sia una stringa che un'array di stringhe. Passando un array di stringhe, il sistema scrive una riga per ogni elemento dell'array.

Questo testo può essere formattato utilizzando una serie di [tag]() che permettono di definire il font (tra quelli indicati vedi [sopra](#definizione-dei-font)) e l'allineamento del testo.


### Inserimento immagini

Per inserire un'immagine occore inserire, nella sezione contenuti file `json` un elemento `immagine` che conterrà i seguenti campi: 
````json
"immagine": {
        "path": "./logo-contratto.png",
        "posizione": [
          180,
          100
        ],
        "dimensioni": [
          40,
          10
        ],
        "coeffDim": 0.042
      }
````
- `path` percorso nel sistema del file immagine
- `posizione` posizione relativa al cursore, il primo elemento per il posizionamento orizzontale, il secondo per quello verticale (crescente verso il basso). Essendo tutta la stesura del documento pensata in modo sequenziale, gli elementi vengono inseriti nel pdf seguendo l'ordine in cui sono stati definiti nel `json`, la posizione per l'immagine serve per dare un offset rispetto alla posizione attuale per permettere di correggere la posizione. **Attenzione** questo sistema non controlla la sovrapposizone degli elementi, è quindi consigliabile testare la creazione del documento ad ogni modifica.
- `dimensioni` larghezza, altezza. Il campo è obbligatorio e permette qualsiasi valore, non mantiene quindi le proporzioni originali dell'immagine
- `coeffDim` *NON IMPLEMENTATO*

### Elenchi 
- • `Alt` + 7 tastierino
- ○ `Alt` + 9 tastierino
- ► `Alt` + 16 tastierino
- → `Alt` + 26 tastierino


### Salto Riga

Permette di distanziare verticalmente gli elementi della pagina aggiungendo righe vuote a piacere.
Il nome del campo è `saltoRiga` e il valore che può assumere è un numero intero positivo

### Struttura per il template `.json`

#### Sezioni File

##### versione
numero della versione del documento serve in produzione per avere traccia di eventuali modifiche nel tempo. (*non viene mostrato nel documento finale*)
##### impostazioni pagina

##### contenuti
i tipi di contenuto possono essere: 
- `testo`:
- `immagine` vedi dettagli di funzionamento alla sezione [inserimento immagini](#inserimento-immagini)
- `Punti`
#### Esempio file 

````json

{
  "versione": "0.1.1",
  "impostazioniPagina": {
    "fonts": [
      {
        "id": "default",
        "nome": "Montserrat",
        "dimensione": 8,
        "colore": "#000000",
        "style": "bold, normal",
        "installPath": "./Montserrat-Bold.ttf, ./Montserrat-Regular.ttf"
      },
      {
        "id": "helvetica_10",
        "nome": "helvetica",
        "dimensione": 10,
        "colore": "#000000",
        "style": "normal"
      },
      {
        "id": "testiPiccoli",
        "nome": "courier",
        "dimensione": 6,
        "colore": "#000000",
        "style": "italic"
      }
    ],
    "margini": {
      "sx": 10,
      "dx": 19,
      "alto": 10,
      "basso": 10
    },
    "interlinea": 1.08,
    "staccoriga": 5,
    "rientro": 3,
    "box": {
      "background": "#faffc7",
      "raggio": 2,
      "padding": 2,
      "lineWidth": 0.12,
      "lineColor": "#cc1269"
    }
  },
  "contenuti": [
    {
      "testoBox": [
        "Contratto di servizio tra **pincoPallino Joe srl** e $cliente:denominazione$",
        "Altro testo su una nuova riga per vedere dove arriva il cursore",
        "Magari proviamo a scendere ulteriormente"
      ],
      "immagine": {
        "path": "./logo.png",
        "posizione": [
          0,
          0
        ],
        "dimensioni": [
          40,
          20
        ],
        "coeffDim": 0.042
      },
      "testo": "Questo è un testo di prova, potrebbe essere una intestazione con il **nome azienda**"
    },
    {
      "saltoRiga": 1
    },
    {
      "testo": "Contratto di servizio tra pincoPallino Joe srl e $cliente:denominazione$ in data $data$"
    },
    {
      "testo": "<|fontId: default|>Il presente contratto (di seguito, \"Contratto\") regola i **termini** e le **condizioni** tra $fornitore:denominazione$, codice fiscale $fornitore:codiceFiscale$, con sede in $fornitore:indirizzoCompleto$, e $cliente:denominazione$, **codice fiscale** $cliente:codiceFiscale$, con sede in $cliente:indirizzoCompleto$, per la fornitura e gestione di kit di biancheria da lavanderie industriali."
    },
    {
      "testo": "^Omnis illo molestiae ut et amet **blanditiis** amet. Ea voluptas est nostrum saepe corrupti. Incidunt nobis quos voluptatem laboriosam excepturi sed. Deserunt exercitationem praesentium quasi. Ab blanditiis vero sit eveniet. Accusamus quae explicabo rerum rem corrupti placeat similique voluptatem. Non assumenda at voluptas deleniti ipsum numquam accusantium. Laudantium eum ut possimus ullam perferendis nemo. Facere distinctio earum quia. Unde rerum qui dolorum. Repellat esse veniam voluptatum dolores placeat et. Autem et labore provident non. Nihil dolore exercitationem vel hic dolorem voluptatem. Rerum quae natus quia consectetur eaque natus veritatis consequatur. Corporis magnam suscipit nihil autem natus. Quia libero et hic ipsam praesentium omnis aut esse.^"
    },
    {
      "testo": "<|fontId: helvetica_10|>^Box della **denominazione** del cliente $cliente:denominazione$^"
    },
    {
      "punti": [
        {
          "titolo": "1. OGGETTO DEL CONTRATTO",
          "sottopunti": [
            {
              "titolo": "1.1. Servizio fornito da pincoPallino Joe srl",
              "contenuto": [
                "pincoPallino Joe si impegna a:",
                "• Lanciare ",
                "• Schivare ",
                "• Piegarsi ",
                "• Abbassarsi ",
                "• Schivare "
              ]
            },
            {
              "titolo": "**1.3. Ordini**",
              "contenuto": [
                "Gli **ordini** possono essere caricati:",
                "• Manualmente tramite lo store e-commerce pincoPallino Joe,",
                "• Gli ordini devono rispettare i check-out"
              ]
            },
            {
              "titolo": "2.2. Il pagamento deve avvenire al momento dell'ordine tramite:",
              "contenuto": [
                "• Carta di credito",
                "• SEPA (bonifico bancario)",
                "• SDD"
              ]
            },
            {
              "titolo": "3.3. Consegne mancanti o ritardate",
              "contenuto": [
                "In caso di mancata consegna per cause imputabili al Cliente, la consegna sarà riprogrammata con addebito:",
                "• Del costo della consegna “saltata”.",
                "• Del costo della nuova consegna."
              ]
            },
            {
              "titolo": "7.1. Obblighi del Cliente",
              "contenuto": [
                "• Giocae a dodgeball"
              ]
            }
          ]
        }
      ]
    },
    {
    "immagine": {
      "path": "./logo.png",
      "posizione": [
        0,
        0
      ],
      "dimensioni": [
        40,
        20
      ],
      "coeffDim": 0.042
    }
  },
  {
    "tabella": "TABLE1"
  }
  ]
}

````
----

#### Sintassi per formattazione

usare il carattere `<| |>` seguito da una chiave e il valore
- Tag per lo stile: 
  - `<|font: times|>` setta il font a Times new roman
  - `<|size: 9|>` setta la dimensione del font
  - `<|style: bold|>` setta lo stile
  - `<|offsetX: 42|>` impone un incremento orizzontale del cursore per avere uno stacco tra gli elementi di testo
  - `<|offsetY: 42|>` impone un incremento verticale del cursore per avere uno stacco tra gli elementi di testo

- **da implementare**~~Tag per il posizionamento~~ 
  ~~- `<|vAlign: center|>` centra il testo verticalmente~~
  ~~- `<|hAlign: center|>` centra il testo orizzontalmente~~
  
Quanto non vengono passati tag, la formattazione diventa quella contenuta in fontDefault ( vedi [impostazioni pagina](#impostazioni-pagina)) e il posizionamento viene dettato dalla posizione del cursore.

