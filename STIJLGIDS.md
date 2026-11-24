# Stijlgids — Campos Automation (redesign-concept)

## Concept: "Er wordt altijd opgenomen"
Campos Automation verkoopt rust: de telefoon gaat, en er wordt opgenomen — ook tijdens een behandeling of om 23:04.
De site is daarom geen donkere tech-site maar een rustig, redactioneel "praktijkpapier" in de eigen huisstijl (navy + ivoor).

**Signatuur-element: het belregister.** Een levend logboek op ivoor papier waarin telefoontjes binnenkomen,
"rinkelen" en worden afgehandeld (geboekt, verzet, vraag beantwoord, SMS verstuurd). Terugkerend motief:
gelinieerde regels, tijdstempels in mono, een signaaloranje stip voor "gaat over".

Tweede vast element: **de dagstrook** — een werkdag van 07:00–23:00 met behandelblokken en binnenkomende
telefoontjes. Schakelaar "zonder / met Campos" laat zien welke oproepen nu gemist worden.

## Kleur
| Token | Hex | Rol |
|---|---|---|
| `--navy` | `#000B3D` | Huiskleur: tekst, donkere secties, knoppen |
| `--navy-2` | `#1A2A5C` | Secundair navy, randen op donker |
| `--ivory` | `#FFFFF0` | Huiskleur: tekst op navy, kaarten |
| `--paper` | `#F6F4E8` | Paginabackground (warm papier) |
| `--rule` | `#DAD7C4` | Linialen/regels van het register |
| `--muted` | `#4B5378` | Secundaire tekst op papier (AA) |
| `--signal` | `#E2531F` | Alleen voor "gaat over / gemist" — stippen, markeringen |
| `--ok` | `#1D6B47` | "Opgenomen / SMS verstuurd" |

Geen gradients, geen glas, geen gloed.

## Typografie
- **Display:** Instrument Serif (400, italic voor nadruk) — elegant, sluit aan bij het dunne CA-monogram.
- **Body:** Hanken Grotesk 400/500/600.
- **Register/data:** JetBrains Mono 400/500 — tijdstempels, labels, kickers.

Schaal: h1 clamp(44px, 7vw, 96px) / h2 clamp(34px, 4.6vw, 60px) / body 17px / mono 13px, uppercase-kickers 12px met .12em spatiëring.

## Ruimte & grid
- Max-breedte 1200px, gutter 24px (16px op mobiel).
- Secties 112px verticaal (72px mobiel).
- Regels (1px `--rule`) scheiden inhoud in plaats van kaarten met schaduw.

## Componenten
- **Knop primair:** navy vlak, ivoor tekst, radius 999px, 15px/600, pijl →.
- **Knop secundair:** tekst + onderstreping.
- **Registerregel:** mono tijd | wie belt | uitkomst | status-chip (ok = groen, gaat over = oranje stip pulserend).
- **FAQ:** `<details>` met regel ertussen, + die naar × draait.
- **Formulier:** onderlijnde velden op navy, ivoor tekst.

## Tone of voice
Je-vorm, nuchter, concreet en Haags-lokaal. Korte zinnen, echte situaties ("woensdagmiddag, kwart over drie").
Geen buzzwords (geen "naadloos", "supercharge", "next-level"). Geen verzonnen cijfers of testimonials —
alleen feiten van de huidige site (vanaf €149 p/m, live in 5 werkdagen, maandelijks opzegbaar, KVK 42184285).
