# 🏠 Ekhana Takst - Eiendomstaksering Prototype 🇳🇴

[![GitHub](https://img.shields.io/badge/GitHub-ekhanatime/ekhana--takst-blue)](https://github.com/ekhanatime/ekhana-takst)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Static](https://img.shields.io/badge/Deploy-Static-orange)](#-kjør-prosjektet)

> **Eiendomstaksering gjort enkelt.** En moderne prototype for takstmenn som kombinerer norsk fagkunnskap med fleksibel teknologi og 3D-visualisering.

## 📋 Hva er problemet?

Tradisjonelle takstverktøy er ofte:
- **Rigide** - Fastlåste skjema som ikke tilpasser seg ulike eiendomstyper
- **Komplekse** - Krever omfattende opplæring og spesialisert programvare
- **Dyrt** - Kostbare lisenser og tung infrastruktur
- **Ufleksible** - Vanskelig å tilpasse til nye krav eller standarder
- **2D-begrenset** - Mangler presis 3D-dokumentasjon og visualisering

Resultatet? Takstmenn bruker mye tid på administrasjon istedenfor faglig arbeid, og kunder får ikke alltid den beste opplevelsen eller presise 3D-data for beslutninger.

## 🎯 Hvorfor denne løsningen?

**Ekhana Takst** er designet fra bunnen av med **JSON-first**-arkitektur som gjør systemet:

### ✨ Fleksibelt
- **NS3600-standard** som JSON-konfigurasjon
- Enkelt å legge til nye romtyper, bygningsdeler eller kontrollpunkter
- Tilpassbare arbeidsflyter uten kodeendringer
- **3D Point Cloud støtte** - Leica BLK2GO integrasjon

### 🚀 Effektivt
- **Statisk deployment** - Virker på hvilken som helst webserver
- **Offline-kompatibelt** - Ingen backend-avhengigheter
- **Hurtig arbeidsflyt** - Fra TG-valg til ferdig dokumentasjon på sekunder
- **Automatisk 3D-prosessering** - E57 → Web-viewer på minutter

### 👥 Brukerfokusert
- **Takstmann**: Intuitiv flyt med fremdriftsindikatorer
- **Kunde**: Enkel onboarding og transparent preview
- **Tilgjengelig**: Norsk språk og responsivt design
- **3D-visualisering**: Interaktive punktclouds uten spesialprogramvare

## 🔧 Hva løser dette?

### For Takstmenn
- ⚡ **Raskere arbeidsflyt** - TG-valg → dokumentasjon → markering som ferdig
- 📊 **Full oversikt** - Se fremdrift per rom og bygningsdel
- 🎯 **Fokus på faglighet** - Intuitivt grensesnitt som ikke distraherer
- 📱 **Mobilvennlig** - Arbeid hvor som helst
- 🏗️ **3D-dokumentasjon** - Presis bygningsmodellering med LiDAR

### For Kunder
- 🏡 **Enkel onboarding** - Registrer eiendom på noen minutter
- 🗺️ **Interaktivt kart** - Vis adresse og eiendomsinfo
- 👁️ **Transparent preview** - Se taksten underveis
- 📧 **Digital kommunikasjon** - Alt i ett sted
- 📐 **3D-visualisering** - Utforsk bygget virtuelt før kjøp

### For Virksomheter
- 💰 **Kostnadseffektivt** - Ingen dyre lisenser eller infrastruktur
- 🔧 **Tilpassbart** - Enkelt å utvide med nye tjenester
- 📈 **Skalerbart** - Statisk hosting som håndterer høy trafikk
- 🔒 **Sikkert** - Ingen databaser eller sensitive data lagret
- 🏭 **3D-produksjon** - Self-hosted pipeline for kontinuerlig bruk

## 🏗️ Teknisk Arkitektur

```mermaid
flowchart LR
    A[Browser] --> B[index.html]
    B --> C[src/js/app.js]
    C --> D[data/ns3600.json]
    C --> E[localStorage]
    B --> F[src/pages/scans.html]
    F --> G[Potree Viewer]
    G --> H[pointcloud.potree]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#e1f5fe
    style G fill:#fff3e0
    style H fill:#fce4ec
```

### Kjerneteknologier
- **HTML/CSS/JavaScript** - Ren webteknologi, ingen rammeverk-avhengigheter
- **Bootstrap 5** - Moderne, responsivt UI-komponentbibliotek
- **Leaflet** - Interaktive kart for eiendomsvisning
- **Potree** - Web-basert 3D point cloud visualisering
- **PDAL/Entwine** - LiDAR-prosessering og konvertering
- **JSON-first** - Konfigurasjon-drevet arkitektur

### Nøkkelfunksjoner
- **TG-klassifisering** - NS3600-standard for tilstandsgradering
- **Dynamiske skjema** - UI bygges fra JSON-konfigurasjon
- **Fremdriftssporing** - Per punkt og per rom
- **Modal-basert redigering** - Kompakt og fokusert arbeidsflyt
- **Offline-lagring** - localStorage for utkast
- **3D Point Cloud Pipeline** - Full BLK2GO-integrasjon
- **E57-prosessering** - Automatisk konvertering til web-format

## 🚀 Kjør prosjektet

### Enkelt oppsett
```bash
# 1. Last ned eller klon repository
https://github.com/ekhanatime/ekhana-takst.git

# 2. Åpne index.html i nettleser
open index.html
```

Det er det! Ingen installasjon, bygging eller server nødvendig.

### For utviklere
```bash
# Klone repository
https://github.com/ekhanatime/ekhana-takst.git

# Arbeid med filer
# Alle endringer lagres automatisk i localStorage

# Push endringer
git add .
git commit -m "feat: Legg til ny funksjon"
git push
```

### 3D-funksjonalitet
```bash
# For full 3D-pipeline (krever backend)
# Installer PDAL og Entwine for LiDAR-prosessering
# Last opp .e57-filer via web-UI
# Automatisk konvertering til Potree-format
```

## 📁 Prosjektstruktur

```
/├── index.html                    # Hovedapplikasjon (entry point)
/├── README.md                     # Denne filen
/├── src/
/│   ├── pages/                    # HTML-sider
/│   │   ├── onboarding.html       # Kunde-innhenting
/│   │   ├── changelog.html        # Dokumentasjon
/│   │   └── scans.html            # 3D-scans (kommende)
/│   └── js/                       # JavaScript-logikk
/│       ├── app.js                # Hovedapplikasjon
/│       ├── onboarding.js         # Onboarding-flyt
/│       ├── changelog.js          # Dokumentasjonsviser
/│       └── potree-viewer.js      # 3D-visualisering (kommende)
/├── assets/
/│   └── css/
/│       └── styles.css            # UI-stiler
├── docs/                         # Teknisk dokumentasjon
/│   ├── project.md                # Detaljert arkitektur
/│   ├── changelog.md              # Endringshistorikk
/│   ├── tasklog.md                # Utviklingslogg
/│   └── 3d-pipeline.md            # 3D-dokumentasjon (kommende)
/├── data/                         # JSON-konfigurasjoner
/│   ├── ns3600_fullprofil_v1.0.0.json     # NS3600-standard
/│   ├── example_property.json              # Eksempeldata
/│   └── property_object_generator_rules_v1.0.0.json
/├── scans/                        # 3D-scan data (kommende)
/│   ├── master/                   # E57-filer (read-only)
/│   └── web/                      # Potree-filer (served)
/└── .gitignore                    # Git ignore-regler
```

## 🎨 Brukergrensesnitt

### 📱 Responsivt Design
- **Desktop**: Full funksjonalitet med sidepanel
- **Tablet**: Optimalisert for berøring
- **Mobil**: Enkelt, intuitivt grensesnitt

### 🎯 Brukeropplevelse
- **Kunde-visning**: Oversiktlig romliste med areal-info
- **Takstmann-visning**: Detaljert tabell med TG-klassifisering
- **Preview**: Profesjonell presentasjon for kunder
- **3D-Viewer**: Interaktiv punktcloud-navigasjon

## 🔬 3D Point Cloud Pipeline

### Arbeidsflyt
1. **Skanning** - Leica BLK2GO i felt (10-30 min)
2. **Opplasting** - .e57-fil til web-plattform
3. **Prosessering** - Automatisk E57 → LAZ → Potree (2-6 min)
4. **Visualisering** - Interaktiv 3D-visning i nettleser

### Funksjoner
- **Full 3D-navigasjon** - Rotasjon, zoom, pan
- **Top-down visning** - 2D-plan som grunnlag for tegninger
- **Måleverktøy** - Avstand, høyde, areal, vinkler
- **Klipping/Snitt** - Se innvendige strukturer
- **Annotations** - Kommentarer og merknader
- **Eksport** - 2D-planer, målinger, rapporter

### Teknisk Stack
- **Input**: E57 (ISO-standard for point clouds)
- **Prosessering**: PDAL + Entwine (automatisk pipeline)
- **Output**: Potree (web-optimized point cloud)
- **Viewer**: Potree.js (JavaScript 3D-renderer)

## 🤝 Bidrag og utvikling

### Kom i gang
1. **Fork** repository'et
2. **Klon** din fork: `git clone https://github.com/YOUR_USERNAME/ekhana-takst.git`
3. **Installer** eventuelle dev-verktøy (valgfritt)
4. **Arbeid** med features i separate branches
5. **Test** grundig - åpne `index.html` i forskjellige nettlesere
6. **Commit** med beskrivende meldinger
7. **Push** og lag pull request

### Utviklingsretningslinjer
- 🔧 **JavaScript**: Ren ES6+, ingen rammeverk
- 🎨 **CSS**: BEM-lignende navngiving, CSS-variabler
- 📝 **Dokumentasjon**: Oppdater `docs/` ved endringer
- 🧪 **Testing**: Manuell testing i moderne nettlesere
- 📱 **Tilgjengelighet**: Følg WCAG-retningslinjer

### Mulige bidrag
- 🏗️ **3D-Pipeline** - Backend for automatisk prosessering
- 📐 **Måleverktøy** - Avanserte målefunksjoner i 3D-viewer
- 📊 **2D-eksport** - Automatisk plantegning-generering
- 🔄 **Synkronisering** - Koble 3D-data med taksering
- 📋 **Templates** - Tilpassbare takstmaler

## 📊 Status og roadmap

### ✅ Implementert
- [x] JSON-first arkitektur med NS3600
- [x] TG-klassifisering og modal-redigering
- [x] Fremdriftsindikatorer per rom/punkt
- [x] Kunde-onboarding med kartintegrasjon
- [x] Responsivt Bootstrap 5 design
- [x] Offline-lagring i localStorage

### 🚧 Pågående arbeid
- [ ] Bilder og mediehåndtering
- [ ] Eksportering til PDF/Excel
- [ ] Backend-integrasjon
- [ ] Mobilapp-versjon
- [ ] **3D Point Cloud Pipeline** - BLK2GO-integrasjon
- [ ] **Web 3D-Viewer** - Potree-implementasjon

### 💡 Fremtidsplaner
- [ ] Multi-bruker støtte
- [ ] Realtime samarbeid
- [ ] AI-assistert taksering
- [ ] Integrasjon med offentlige registre
- [ ] **Automatisk 2D-planer** fra point cloud
- [ ] **Annotations** i 3D-modeller
- [ ] **AR/VR-visning** av eiendommer

## 📞 Kontakt og støtte

- **Issues**: [GitHub Issues](https://github.com/ekhanatime/ekhana-takst/issues)
- **Diskusjoner**: [GitHub Discussions](https://github.com/ekhanatime/ekhana-takst/discussions)
- **E-post**: For private henvendelser

## 📄 Lisens

Dette prosjektet er lisensiert under **MIT License** - se [LICENSE](LICENSE) for detaljer.

## 🙏 Takk til

- **NS3600** - Norsk standard for bygningstaksering
- **Bootstrap** - UI-komponentbibliotek
- **Leaflet** - Kartbibliotek
- **OpenStreetMap** - Kartdata
- **Potree** - 3D point cloud visualisering
- **PDAL** - Point data processing
- **Leica BLK2GO** - LiDAR-skanning teknologi

---

<div align="center">

**Bygget med ❤️ for norske takstmenn og deres kunder**

[🚀 Prøv demo](index.html) • [📖 Les docs](src/pages/changelog.html) • [🏗️ 3D-Demo](src/pages/scans.html) • [🐛 Rapporter feil](https://github.com/ekhanatime/ekhana-takst/issues)

</div>
