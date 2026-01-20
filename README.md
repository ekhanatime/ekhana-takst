# Ekhana Takst - Property Assessment Prototype

En statisk prototype for eiendomstaksering (property assessment) med norsk UI og JSON-first arkitektur.

## 🚀 Kjør prosjektet

Åpne `index.html` i en nettleser for å starte applikasjonen.

## 📁 Prosjektstruktur

```
/
├── index.html                 # Hovedapplikasjon (entry point)
├── src/
│   ├── pages/                 # HTML-sider
│   │   ├── onboarding.html    # Kunde-innhenting
│   │   └── changelog.html     # Dokumentasjon
│   └── js/                    # JavaScript-filer
│       ├── app.js             # Hovedapplikasjon
│       ├── onboarding.js      # Onboarding-logikk
│       └── changelog.js       # Docs-renderer
├── assets/
│   └── css/
│       └── styles.css         # Hovedstiler
├── docs/                      # Dokumentasjon (Markdown)
│   ├── changelog.md           # Endringslogg
│   ├── project.md             # Prosjektbeskrivelse
│   └── tasklog.md             # Utviklingslogg
├── data/                      # JSON-datafiler
│   ├── ns3600_fullprofil_v1.0.0.json
│   ├── example_property.json
│   └── property_object_generator_rules_v1.0.0.json
└── .gitignore                 # Git ignore-regler
```

## ✨ Funksjoner

- **Kunde-innhenting**: Samle kundeinformasjon og eiendomsdata
- **Takstmann-visning**: JSON-drevet takseringsgrensesnitt med TG-klassifisering
- **Preview**: Kundevennlig visning av takseringsdata
- **Dokumentasjon**: Integrert changelog og prosjektinfo

## 🛠 Teknologi

- **HTML/CSS/JavaScript** - Ren webteknologi uten rammeverk
- **Bootstrap 5** - UI-komponenter
- **Leaflet** - Kartintegrasjon
- **JSON-first** - Data-drevet arkitektur

## 📄 Dokumentasjon

- [Changelog](src/pages/changelog.html)
- [Prosjektbeskrivelse](docs/project.md)
- [Utviklingslogg](docs/tasklog.md)

## 🤝 Bidra

1. Fork repository'et
2. Lag en feature-branch
3. Commit endringer
4. Push og lag pull request

---

**Repository**: https://github.com/ekhanatime/ekhana-takst
