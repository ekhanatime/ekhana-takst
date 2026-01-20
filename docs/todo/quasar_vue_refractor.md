SPEC — Takst Module (Quasar + Vue/TS) Desktop-first + Mobil feltmodus + Bundle→FastAPI→Web/PDF
0) Scope

Bygge et “Takst Module” som:

fungerer som desktop webapp (primær arbeidsflate)

fungerer som mobil feltmodus (innsamling med kamera/mikrofon, offline)

deler samme JSON datastruktur uansett plattform

kan sende ferdig takst som “bundle” til backend (FastAPI)

backend genererer webvisning + PDF

pointcloud viewer er en separat modul (primært desktop)

1) Teknologi & rammer
Frontend

Quasar (Vue 3)

TypeScript

Vite (via Quasar tooling)

State: Pinia

Storage: IndexedDB (Dexie) for web / evt. Capacitor Filesystem ved mobilapp packaging (valgfritt)

Networking: fetch eller axios

Offline: Service Worker (Quasar PWA mode) + offline queue

Mobil distribusjon (valgfritt)

Kjør som PWA først

Senere: pakk med Capacitor ved behov (kamera/mikrofon mer robust på iOS/Android)

Dette er valgfritt og skal ikke være blocker for web.

Backend (for submit/generering)

FastAPI

Filbasert lagring først (/data/takster/…)

HTML rendering (Jinja2) + PDF (Playwright print) eller ReportLab

2) Hovedflyt (end-to-end)

Bruker starter ny takst (onboarding: adresse, eiendomsmetadata).

App oppretter prosjekt lokalt:

project_id

device_id

Bruker registrerer etasjer/rom (KVM + L/B), og gjør observasjoner per rom/bygningsdel.

Bruker tar bilder/video/lydopptak knyttet til observasjoner.

Alt lagres lokalt, også offline.

Når “Ferdig”:

App genererer bundle_id

App pakker manifest.json + mediafiler

App laster opp til FastAPI (multipart)

Backend lagrer, genererer web/PDF og returnerer:

takst_id, view_url, pdf_url

App viser lenker og lagrer takst_id i prosjektet.

3) Identiteter
device_id

Genereres første gang app kjører: UUID

Lagres i local storage (Preferences i Capacitor senere)

Brukes som stabil identifikator pr enhet

project_id

Opprettes ved “Ny takst”

Unik, kan være device_id + timestamp + random

bundle_id

Opprettes ved “Ferdigstill”

Brukes som idempotency-key ved opplasting

4) Data-modell (lokalt)

Alle data lagres som JSON + media-lenker.

Project (lokal)

project_id

device_id

status: draft | completed | submitted

customer: navn/telefon (valgfritt), adresse, gnr/bnr, metadata

structure:

floors[]

rooms[]

observations[]

mediaIndex[] (liste over alle media, med path, type, størrelse, checksum optional)

submit:

bundle_id

takst_id

view_url

pdf_url

submitted_at

Floor

floor_id

label (f.eks. “1. etasje”)

order

Room

room_id

floor_id

name

area_m2

length_cm (optional)

width_cm (optional)

roomDone (boolean)

order

Observation

obs_id

room_id

bygningsdel

tg (TG0/TG1/TG2/TG3)

title (optional)

text (rich/plain)

standardRef (NS3600/TEK etc) optional

created_at / updated_at

mediaRefs[] (IDs til media)

MediaRef

media_id

type: image | video | audio

local_path (relative)

mime

size

created_at

meta: { duration?, width?, height? }

5) Bundle-format (server submit)
Transport: multipart/form-data (v1)

Fields:

manifest: JSON string

files: multiple file parts, each with:

filename som inkluderer relativ path (f.eks. media/images/img_001.jpg)

eller et ekstra felt path per fil (hvis nødvendig)

Manifest content:

schema: takst_bundle_v1

bundle_id, device_id, project_id

created_at, completed_at

customer, property, floors, rooms, observations

mediaIndex

Idempotency:

Header: Idempotency-Key: <bundle_id>

6) Offline-first krav
Lokal lagring

Bruk IndexedDB til:

prosjekter

observasjoner

media-metadata

Media blobs:

V1: lagre i IndexedDB (for bilder + korte audio)

V1b: for video/tyngre media, bruk filesystem (Capacitor senere) eller “file handles” i PWA hvis tilgjengelig

Det skal finnes “Eksporter ZIP” som fallback (valgfritt v2)

Upload queue

Queue table:

bundle_id, project_id, status, retries, last_error, created_at

Trigger:

manuelt “Send inn”

automatisk ved nett (navigator.onLine + backoff)

7) UI/UX krav (Desktop-first + Mobil)
Global layout

Desktop:

venstre: prosjekt-navigasjon (etasjer/rom)

midt: romliste/observasjoner

høyre: detaljer + media panel + TG hurtigvalg

Mobil:

tab/stepper:

Rom

Observasjoner

Media

Sammendrag

store touch targets, minimal scrolling

Sider / routes

/ Dashboard (prosjekter)

/takst/new Onboarding (adresse + metadata + velg etasjer/rom)

/takst/:projectId Editor (desktop/mobil responsivt)

/takst/:projectId/pointcloud Viewer (desktop fokus)

/takst/:projectId/submit Ferdigstill + send inn

/takst/:projectId/summary Sammendrag + TG oversikt + sjekklister

Viktige komponenter (Quasar)

ProjectCard

RoomGrid

RoomNavigator

ObservationList

ObservationModal (kompakt, alternating rows, TG clickable)

TGChip (click opens modal, TG change triggers modal)

MediaPicker (image/video/audio)

MediaGallery (lightbox, sort, delete)

UploadQueuePanel (progress, retry)

SummaryPanel (TG counts, incomplete rooms)

8) Pointcloud modul (separat)
Primærmål

Desktop viewer integrert i route /pointcloud

Fokus: visning + måling + enkel annotasjon (v2)

V1 forslag

Start med Potree eller Giro3D(COPC) avhengig av format dere ender på.

Viewer lever i egen “module” med lazy-load, slik at den ikke påvirker takst-editor initial load.

Integrasjon v1

Pointcloud data knyttes til prosjekt via:

pointcloud_asset: URL eller filreferanse (server-side)

Viewer kan åpne “observasjon” sidepanel for rom og knytte “snapshot” (bilde) til observasjon.

9) FastAPI backend spec (minimum)
Endpoints

POST /api/takst/submit

auth (API key)

idempotency via bundle_id

lagre til disk

generer html + pdf

returner URLs

GET /t/{takst_id}

serve report.html

GET /t/{takst_id}.pdf

serve report.pdf

GET /media/{takst_id}/{path}

serve media

Lagring

/data/takster/{takst_id}/manifest.json

/data/takster/{takst_id}/media/...

/data/takster/{takst_id}/report.html

/data/takster/{takst_id}/report.pdf

mapping bundle_id -> takst_id (fil/sqlite/postgres senere)

PDF

V1: HTML→PDF med Playwright

print CSS må være definert (A4, margins, page breaks, image sizing)

10) Sikkerhet & personvern (minimum)

API key for submit

Guess-resistant takst_id (uuid/ulid)

Sanitization av paths (ingen ../)

Max upload size policy + chunking plan (v2 for store videoer)

11) Akseptansekriterier (DoD)

Kan opprette takst, legge etasjer/rom og observasjoner på desktop

Kan bruke mobil til å legge inn TG og tekst og legge ved bilder/lyd (offline)

Prosjekt lagres lokalt og overlever refresh

Ferdigstill genererer bundle_id og legger i upload queue

Upload til FastAPI fungerer og returnerer view_url + pdf_url

Webside viser rapport med media

PDF lastes ned og matcher webside layout for hovedinnhold

12) Iterasjonsplan (kort)
Iterasjon 1

Quasar prosjekt + prosjektmodell + room/obs UI + lokal lagring

Media images (ikke video/audio enda)

Submit multipart + backend html + pdf

Iterasjon 2

Audio recording + video upload

Upload queue + retry

Summary panel + TG stats

Iterasjon 3

Pointcloud viewer route (Potree/Giro3D)

Snapshot linking til observasjon

13) Notes: Vercel / dependencies

Ingen krav om Vercel. Frontend kan hostes som statiske filer på samme server som FastAPI.

Quasar build krever Node i build-step, men runtime er statisk.

PDF med Playwright krever Chromium-runtime på server.

Hvis du vil, kan jeg også gi deg en “repo skeleton” (mappestruktur) som matcher denne specen, med:

/src/modules/takst/*

/src/services/storage/*

/src/services/uploadQueue/*

/src/pages/*

/backend/* (FastAPI)
…så Windsurf kan generere filer helt konsekvent.