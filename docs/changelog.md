# 📘 CHANGELOG
## Ekhana Takst – UI / JSON / UX
**Dato:** 19. januar 2026

### 1) Applikasjonen lastet ikke (JSON 404)
- Identifisert 404 på `.../takst/2/js/data/ns3600_fullprofil_v1.0.0.json`.
- Standardisert deploy-struktur slik at JSON finnes på forventet sti.
- Resultat: `/takst/2/` rendrer innhold stabilt.

### 2) Arkiv/deploy rydding
- Avklart at forskjellige ZIP-arkiver hadde ulikt innhold og formål.
- Standardisert én deploy-struktur: `index.html`, `styles.css`, `js/app.js`, `js/data/*.json`.

### 3) UX-retning
- Definert ny presentasjon: **Rad = signal**, **Modal = detaljer**.
- Redusert kognitiv belastning ved å fjerne horisontal scrolling der mulig.

### 4) TG-flyt
- Endring: når TG går fra TG0 til TG1–TG3, skal redigering åpnes automatisk.

### 5) Ferdigstatus og fremdrift
- Innført `reviewed`-konsept per punkt (rad), med mulig timestamp.
- Påbegynt tankegang for fremdrift per seksjon/rom (X/Y).

### 6) Layoutmodernisering
- Påbegynt/implementert modernisering: sticky header, tydeligere navigasjon og mer luft/whitespace.

### 7) Nye krav (definert)
- Check-mark ved siden av TG (samme størrelse som TG-badge).
- Stor checkbox per rom + “X/Y OK”.
- Romareal per romkort: KVM + Lengde/Bredde i cm.

---

## 20. januar 2026

### 8) TG-velg = åpne modal (hurtigflyt)
- Endret flyt: når TG endres til **TG1–TG3**, åpnes observasjonsmodal automatisk (uavhengig av om du kommer fra TG0).
- TG i tabell er nå **ett klikk = neste TG**, og du havner rett i utfylling.

### 9) Ferdigmarkering på rad (ved siden av TG)
- La inn **check-mark (□/✓)** ved siden av TG, samme størrelse og visuell vekt.
- Markerer `._reviewed` + timestamp per observasjon.

### 10) Rom-areal og mål (KVM + L/B)
- La inn rom-metadata: `room.area = { kvm, length_cm, width_cm }`.
- Kundevisning: rom-pill viser `00 KVM • L×B cm` som standard.
- Klikk på rom-pill åpner modal for å legge inn KVM + Lengde/Bredde i cm.
- Takstmannvisning: rom-seksjonsheader viser arealbadge.

### 11) Romnivå “ferdig”
- La inn stor rom-checkbox i rom-seksjonsheader.
- Lagrer `room._room_reviewed` + timestamp.

### 12) Stabilisering av rendering (manglende helpers)
- Gjeninnført nødvendige render/helpers som var referert i koden:
  - `renderTableRow`, `computeObservationStatus`, `countTGs`, `countDone`, `worstTG`, `tgCounts`, icon-wrappers.
- Ryddet en bug i media-viewer (fjernet referanse til udefinert variabel).


---

## 20. januar 2026 kl. 13:45
### UI / Layout
- Innfort Bootstrap 5.3 som grunn-UI (index + docs-sider), for mer konsistent grid, spacing og komponent-stil.
- Oppdatert toppbar i hovedapp med tydelige CTA-knapper: **Onboarding**, **Changelog**, samt **Nullstill demo**.
- Oppdatert bunnnavigasjon til Bootstrap `nav-pills` (Kunde / Takstmann / Preview).

### Onboarding
- Renamet kunde-innhenting fra `customer_intake.html` til `onboarding.html`.
- Flyttet egen JS til `js/onboarding.js` og rettet script-path i onboarding-siden.

### Data / Struktur
- Standardisert JSON-paths i deploy: lagt inn `data/`-mappe med:
  - `ns3600_fullprofil_v1.0.0.json`
  - `example_property.json`
  - `property_object_generator_rules_v1.0.0.json`

### Versjonering
- BUILD_ID oppdatert til `v5.3 • 20. januar 2026`.
- Cache-buster oppdatert til `?v=6`.

---

## 20. januar 2026 kl. 17:00

### GitHub-integrasjon
- Initialisert Git-repository for versjonskontroll
- Opprettet nytt GitHub-repository for prosjektet
- Forberedt prosjekt for åpen kildekode-samarbeid
- Lagt til .gitignore for Node.js/Bootstrap-avhengigheter
- Satt opp remote origin og pushet første commit

---

## 20. januar 2026 kl. 17:15

### Prosjektstruktur-refactoring
- Omorganisert mappestruktur for bedre vedlikehold:
  - `src/pages/` for HTML-filer
  - `src/js/` for JavaScript-filer
  - `assets/css/` for stilark
  - `docs/` for dokumentasjon
- Oppdaterte alle interne lenker og sti-referanser
- Opprettet omfattende README.md med prosjektoversikt
- Rydde opp i repository-struktur

---

## 20. januar 2026 kl. 17:20

### Lint-fiks og tilgjengelighet
- Fikset accessibility-feil: lagt til placeholder på input-felt i onboarding
- Flyttet inline CSS til ekstern fil for bedre vedlikehold
- Forbedret kodekvalitet og linting-samsvar
- Opprettet omfattende README.md for GitHub-profil med prosjektoversikt, funksjoner og bidragsretningslinjer
