/* Docs: ./docs/functions/onboarding.md | SPOT: ./SPOT.md#function-catalog */
/* Ekhana Takst – Kunde (innhenting)
  - Kontaktinfo + adresse-autocomplete via GeoNorge
  - Vis "boligkort" med kart + nøkkelinfo
  - Dynamiske etasjer/rom som mates inn i samme localStorage-state som takst UI
*/

/* global L */

const LS_KEY = 'ekhana_takst_state_v5';
const BUILD_ID = 'v5.2.2'; // kun for intake-siden

// Endpoints (GeoNorge / Kartverket)
const ADDR_SEARCH_URL = 'https://ws.geonorge.no/adresser/v1/sok';

// Kartverkets åpne kartfliser (Google Maps compat)
// NB: Denne er mye brukt i Leaflet-eksempler. Hvis Kartverket endrer, bytter vi kun her.
const TILE_URL = 'https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}';
const TILE_ATTR = '&copy; Kartverket';

const STATE = {
  customer: {
    name: '',
    phone: '',
    email: ''
  },
  property: {
    address_text: '',
    postnummer: '',
    poststed: '',
    kommunenavn: '',
    kommunenummer: '',
    gnr: null,
    bnr: null,
    fnr: 0,
    snr: 0,
    lat: null,
    lon: null,
    type: 'Grunneiendom',
    area_m2: null,
    norgeskart_url: ''
  },
  floors: [] // [{ id, label, rooms:[{id,name,type,kvm,l_cm,b_cm}] }]
};

let mapInstance = null;
let mapMarker = null;

function $(id) { return document.getElementById(id); }

function nowIso() {
  try { return new Date().toISOString(); } catch { return '';
  }
}

function safeJsonParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

function loadExistingTakstState() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  return safeJsonParse(raw);
}

function saveTakstState(patch) {
  const base = loadExistingTakstState() || {};
  const merged = {
    ...base,
    ...patch,
    _last_updated: nowIso(),
  };
  localStorage.setItem(LS_KEY, JSON.stringify(merged));
}

function setStatus(msg) {
  const el = $('status');
  if (!el) return;
  el.textContent = msg || '';
}

function slug(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\u00C0-\u017F]/g, '')
    .slice(0, 60);
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function defaultFloorLabel(i) {
  // 0 = Kjeller, 1 = 1. etg, 2 = 2. etg ...
  if (i === 0) return 'Kjeller';
  return `${i}. etg`;
}

function ensureFloors(count) {
  const n = Math.max(1, Math.min(8, Number(count || 1)));
  while (STATE.floors.length < n) {
    const idx = STATE.floors.length;
    STATE.floors.push({
      id: uid('floor'),
      label: defaultFloorLabel(idx),
      rooms: []
    });
  }
  if (STATE.floors.length > n) {
    STATE.floors = STATE.floors.slice(0, n);
  }
}

function uniqueRoomName(floorLabel, baseType, existingNames) {
  const base = `${baseType}`;
  if (!existingNames.has(base)) return base;
  let i = 2;
  while (existingNames.has(`${base} ${i}`)) i++;
  return `${base} ${i}`;
}

const ROOM_TYPES = [
  'Entré', 'Gang', 'Stue', 'Kjøkken', 'Bad', 'WC', 'Vaskerom', 'Soverom', 'Kontor',
  'Bod', 'Teknisk rom', 'Loftstue', 'Kjellerstue', 'Trapp', 'Garasje', 'Utebod'
];

function roomIcon(type) {
  const t = String(type || '').toLowerCase();
  if (t.includes('bad') || t.includes('wc')) return 'fa-solid fa-shower';
  if (t.includes('kjøkken')) return 'fa-solid fa-kitchen-set';
  if (t.includes('sover')) return 'fa-solid fa-bed';
  if (t.includes('stue')) return 'fa-solid fa-couch';
  if (t.includes('garasje')) return 'fa-solid fa-warehouse';
  if (t.includes('bod')) return 'fa-solid fa-box-archive';
  if (t.includes('teknisk')) return 'fa-solid fa-screwdriver-wrench';
  if (t.includes('trapp')) return 'fa-solid fa-stairs';
  return 'fa-solid fa-door-open';
}

function addRoomToFloor(floorId, roomType) {
  const floor = STATE.floors.find(f => f.id === floorId);
  if (!floor) return;
  const existing = new Set(floor.rooms.map(r => r.name));
  const name = uniqueRoomName(floor.label, roomType, existing);
  floor.rooms.push({
    id: uid('room'),
    type: roomType,
    name,
    kvm: '',
    l_cm: '',
    b_cm: ''
  });
}

function removeRoom(floorId, roomId) {
  const floor = STATE.floors.find(f => f.id === floorId);
  if (!floor) return;
  floor.rooms = floor.rooms.filter(r => r.id !== roomId);
}

function updateRoomField(floorId, roomId, key, value) {
  const floor = STATE.floors.find(f => f.id === floorId);
  if (!floor) return;
  const room = floor.rooms.find(r => r.id === roomId);
  if (!room) return;
  room[key] = value;
}

function renderFloorsGrid() {
  const host = $('floorsGrid');
  if (!host) return;

  host.innerHTML = '';

  STATE.floors.forEach((floor) => {
    const floorCard = document.createElement('div');
    floorCard.className = 'floorCard';

    const header = document.createElement('div');
    header.className = 'floorHeader';

    const labelWrap = document.createElement('div');
    labelWrap.className = 'floorLabelWrap';

    const label = document.createElement('input');
    label.type = 'text';
    label.value = floor.label;
    label.className = 'floorLabelInput';
    label.addEventListener('input', () => {
      floor.label = label.value;
      // re-render room names? (kun label endres, romnavn beholdes)
    });

    const count = document.createElement('div');
    count.className = 'pill';
    count.textContent = `${floor.rooms.length} rom`;

    labelWrap.appendChild(label);
    header.appendChild(labelWrap);
    header.appendChild(count);

    const rooms = document.createElement('div');
    rooms.className = 'roomsGrid';

    floor.rooms.forEach((room) => {
      const r = document.createElement('div');
      r.className = 'roomCard';

      const top = document.createElement('div');
      top.className = 'roomTop';

      const title = document.createElement('div');
      title.className = 'roomTitle';
      title.innerHTML = `<i class="${roomIcon(room.type)}"></i> <span>${escapeHtml(room.name)}</span>`;

      const del = document.createElement('button');
      del.className = 'iconBtn danger';
      del.title = 'Fjern rom';
      del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      del.addEventListener('click', () => {
        removeRoom(floor.id, room.id);
        renderFloorsGrid();
      });

      top.appendChild(title);
      top.appendChild(del);

      const meta = document.createElement('div');
      meta.className = 'roomMeta';

      const kvm = document.createElement('div');
      kvm.className = 'miniField';
      kvm.innerHTML = `<label>KVM</label><input type="number" inputmode="decimal" min="0" step="0.1" placeholder="0" value="${escapeAttr(room.kvm)}" />`;
      kvm.querySelector('input').addEventListener('input', (e) => {
        updateRoomField(floor.id, room.id, 'kvm', e.target.value);
      });

      const lb = document.createElement('div');
      lb.className = 'miniFieldRow';
      lb.innerHTML = `
        <div class="miniField">
          <label>L (cm)</label>
          <input type="number" inputmode="numeric" min="0" step="1" placeholder="0" value="${escapeAttr(room.l_cm)}" />
        </div>
        <div class="miniField">
          <label>B (cm)</label>
          <input type="number" inputmode="numeric" min="0" step="1" placeholder="0" value="${escapeAttr(room.b_cm)}" />
        </div>
      `;
      const [lInput, bInput] = lb.querySelectorAll('input');
      lInput.addEventListener('input', (e) => updateRoomField(floor.id, room.id, 'l_cm', e.target.value));
      bInput.addEventListener('input', (e) => updateRoomField(floor.id, room.id, 'b_cm', e.target.value));

      meta.appendChild(kvm);
      meta.appendChild(lb);

      r.appendChild(top);
      r.appendChild(meta);
      rooms.appendChild(r);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Legg til rom';
    addBtn.addEventListener('click', () => openRoomModal(floor.id));

    const footer = document.createElement('div');
    footer.className = 'floorFooter';
    footer.appendChild(addBtn);

    floorCard.appendChild(header);
    floorCard.appendChild(rooms);
    floorCard.appendChild(footer);

    host.appendChild(floorCard);
  });
}

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function escapeAttr(s) { return escapeHtml(s); }

// ------------------------
// Adresse-søk
// ------------------------
let addrDebounce = null;

async function fetchAddressSuggestions(query) {
  const q = String(query || '').trim();
  if (!q || q.length < 3) return [];

  const url = `${ADDR_SEARCH_URL}?sok=${encodeURIComponent(q)}&treffPerSide=10`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} fra GeoNorge adresse-søk`);
  const data = await res.json();
  const hits = Array.isArray(data.adresser) ? data.adresser : [];

  // Vi normaliserer til et format vi bruker videre
  return hits.map(hit => {
    const rep = hit.representasjonspunkt || hit.representasjonspunktWgs84 || null;
    return {
      text: hit.adressetekst || '',
      postnummer: hit.postnummer || '',
      poststed: hit.poststed || '',
      kommunenavn: hit.kommunenavn || '',
      kommunenummer: hit.kommunenummer || '',
      gnr: hit.gardsnummer ?? null,
      bnr: hit.bruksnummer ?? null,
      fnr: hit.festenummer ?? 0,
      snr: hit.seksjonsnummer ?? 0,
      lat: rep?.lat ?? null,
      lon: rep?.lon ?? null,
    };
  });
}

function norgeskartUrlFromSuggestion(s) {
  // Grov link (åpner riktig sted, vi forsøker å sette søk + marker)
  // Bruker EUREF89 UTM33 i URL-en når mulig. Vi har lat/lon, men Norgeskart tar også lat/lon via param.
  // Her holder vi det enkelt: søk=adresse.
  const q = `${s.text} ${s.postnummer} ${s.poststed}`.trim();
  return `https://www.norgeskart.no/#!?project=norgeskart&layers=1001&zoom=18&sok=${encodeURIComponent(q)}`;
}

function renderSuggestions(list) {
  const host = $('addressSuggestions');
  host.innerHTML = '';

  if (!list.length) {
    host.classList.remove('open');
    return;
  }

  host.classList.add('open');

  list.forEach((s) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'suggestionItem';
    item.innerHTML = `
      <div class="suggestionMain"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(s.text)}</div>
      <div class="suggestionSub">${escapeHtml(`${s.postnummer} ${s.poststed}, ${s.kommunenavn}`)}</div>
    `;
    item.addEventListener('click', () => selectSuggestion(s));
    host.appendChild(item);
  });
}

async function doSuggest(query) {
  try {
    const hits = await fetchAddressSuggestions(query);
    renderSuggestions(hits);
  } catch (e) {
    console.error(e);
    renderSuggestions([]);
  }
}

function wireAddressSearch() {
  const input = $('addressQuery');
  const btn = $('addressSearchBtn');

  input.addEventListener('input', () => {
    clearTimeout(addrDebounce);
    addrDebounce = setTimeout(() => doSuggest(input.value), 180);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSuggest(input.value);
    }
  });

  btn.addEventListener('click', () => doSuggest(input.value));
}

function selectSuggestion(s) {
  // Lagre i STATE
  STATE.property.address_text = s.text;
  STATE.property.postnummer = s.postnummer;
  STATE.property.poststed = s.poststed;
  STATE.property.kommunenavn = s.kommunenavn;
  STATE.property.kommunenummer = s.kommunenummer;
  STATE.property.gnr = s.gnr;
  STATE.property.bnr = s.bnr;
  STATE.property.fnr = s.fnr || 0;
  STATE.property.snr = s.snr || 0;
  STATE.property.lat = s.lat;
  STATE.property.lon = s.lon;
  STATE.property.type = 'Grunneiendom';
  STATE.property.area_m2 = STATE.property.area_m2 ?? null;
  STATE.property.norgeskart_url = norgeskartUrlFromSuggestion(s);

  // Oppdater UI
  $('addressQuery').value = `${s.text}, ${s.postnummer} ${s.poststed}`;
  renderSuggestions([]);
  renderPropertyCard();

  // Lagre "delvis" (kundedata + bolig)
  flushToTakstState();
}

function renderPropertyCard() {
  const card = $('propertyCard');
  card.classList.remove('hidden');

  const title = $('propertyTitle');
  const sub = $('propertySub');
  const m = $('keyMatrikkel');
  const t = $('keyType');
  const a = $('keyAreal');

  const addrLine = STATE.property.address_text || '—';
  const locLine = `${STATE.property.postnummer || ''} ${STATE.property.poststed || ''}`.trim();
  const kommuneLine = STATE.property.kommunenavn ? `, ${STATE.property.kommunenavn} Kommune` : '';

  title.textContent = addrLine;
  sub.textContent = `${locLine}${kommuneLine}`.trim() || '—';

  const matr = buildMatrikkelString();
  m.textContent = matr || '—';
  t.textContent = STATE.property.type || '—';
  a.textContent = STATE.property.area_m2 ? `${formatNumberNb(STATE.property.area_m2)} m²` : '—';

  const open = $('openNorgeskart');
  open.href = STATE.property.norgeskart_url || '#';

  ensureMap();
}

function buildMatrikkelString() {
  const knr = STATE.property.kommunenummer;
  const gnr = STATE.property.gnr;
  const bnr = STATE.property.bnr;
  if (!knr || gnr == null || bnr == null) return '';
  return `${knr}-${gnr}/${bnr}`;
}

function formatNumberNb(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return String(n);
  // enkel nb-NO format uten Intl (for å unngå rare miljøer)
  return x.toString().replace('.', ',');
}

function ensureMap() {
  const host = $('propertyMap');
  if (!host) return;

  const lat = Number(STATE.property.lat);
  const lon = Number(STATE.property.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    host.innerHTML = '<div class="muted" style="padding:12px;">Kartposisjon mangler.</div>';
    return;
  }

  if (!mapInstance) {
    mapInstance = L.map(host, { zoomControl: true, attributionControl: true });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 20 }).addTo(mapInstance);
    mapMarker = L.marker([lat, lon]).addTo(mapInstance);
    mapInstance.setView([lat, lon], 18);
  } else {
    mapInstance.setView([lat, lon], 18);
    if (mapMarker) mapMarker.setLatLng([lat, lon]);
  }

  // Fix Leaflet size when card becomes visible
  setTimeout(() => { try { mapInstance.invalidateSize(); } catch {} }, 120);
}

// ------------------------
// Rom-modal
// ------------------------
let pendingFloorId = null;

function openRoomModal(floorId) {
  pendingFloorId = floorId || null;
  const modal = $('roomModal');
  const floorSel = $('modalFloor');
  const roomSel = $('modalRoomType');

  // floors
  floorSel.innerHTML = '';
  STATE.floors.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.label;
    floorSel.appendChild(opt);
  });
  floorSel.value = pendingFloorId || (STATE.floors[0]?.id ?? '');

  // room types
  roomSel.innerHTML = '';
  ROOM_TYPES.forEach(rt => {
    const opt = document.createElement('option');
    opt.value = rt;
    opt.textContent = rt;
    roomSel.appendChild(opt);
  });

  modal.classList.remove('hidden');
}

function closeRoomModal() {
  $('roomModal').classList.add('hidden');
  pendingFloorId = null;
}

function wireRoomModal() {
  $('closeRoomModal').addEventListener('click', closeRoomModal);
  $('cancelRoom').addEventListener('click', closeRoomModal);

  $('addRoomConfirm').addEventListener('click', () => {
    const floorId = $('modalFloor').value;
    const type = $('modalRoomType').value;
    addRoomToFloor(floorId, type);
    closeRoomModal();
    renderFloorsGrid();
  });

  // click outside
  $('roomModal').addEventListener('click', (e) => {
    if (e.target && e.target.id === 'roomModal') closeRoomModal();
  });
}

// ------------------------
// State -> Takst
// ------------------------
function flushToTakstState() {
  // Minimal "takst"-state som takst UI forventer
  // Vi fyller customer + property, og lager en enkel room/floor-struktur som kan gjenbrukes senere.

  const patch = {
    build_id: BUILD_ID,
    customer: {
      name: STATE.customer.name,
      phone: STATE.customer.phone,
      email: STATE.customer.email
    },
    property: {
      address_text: STATE.property.address_text,
      postnummer: STATE.property.postnummer,
      poststed: STATE.property.poststed,
      kommunenavn: STATE.property.kommunenavn,
      kommunenummer: STATE.property.kommunenummer,
      gnr: STATE.property.gnr,
      bnr: STATE.property.bnr,
      fnr: STATE.property.fnr,
      snr: STATE.property.snr,
      lat: STATE.property.lat,
      lon: STATE.property.lon,
      matrikkel: buildMatrikkelString(),
      type: STATE.property.type,
      area_m2: STATE.property.area_m2,
      norgeskart_url: STATE.property.norgeskart_url
    },
    rooms: {
      floors: STATE.floors.map(f => ({
        id: f.id,
        label: f.label,
        rooms: f.rooms.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type,
          kvm: r.kvm,
          l_cm: r.l_cm,
          b_cm: r.b_cm
        }))
      }))
    }
  };

  saveTakstState(patch);
  setStatus('Lagret lokalt.');
}

function wireSaveAndReset() {
  $('saveAndGo').addEventListener('click', () => {
    readFormIntoState();
    flushToTakstState();
    window.location.href = 'index.html';
  });

  $('resetDemo').addEventListener('click', () => {
    if (!confirm('Nullstille kunde-innhenting? (lokalt)')) return;
    localStorage.removeItem(LS_KEY);
    window.location.reload();
  });
}

function readFormIntoState() {
  STATE.customer.name = $('customer_name').value.trim();
  STATE.customer.phone = $('customer_phone').value.trim();
  STATE.customer.email = $('customer_email').value.trim();
}

function wireFormPersistence() {
  ['customer_name', 'customer_phone', 'customer_email'].forEach((id) => {
    const el = $(id);
    el.addEventListener('input', () => {
      readFormIntoState();
      flushToTakstState();
    });
  });
}

function loadFromExisting() {
  const existing = loadExistingTakstState();
  if (!existing) {
    ensureFloors(1);
    return;
  }

  // customer
  const c = existing.customer || {};
  $('customer_name').value = c.name || '';
  $('customer_phone').value = c.phone || '';
  $('customer_email').value = c.email || '';

  STATE.customer.name = c.name || '';
  STATE.customer.phone = c.phone || '';
  STATE.customer.email = c.email || '';

  // property
  if (existing.property) {
    Object.assign(STATE.property, existing.property);
    if (STATE.property.address_text) {
      $('addressQuery').value = `${STATE.property.address_text}, ${STATE.property.postnummer || ''} ${STATE.property.poststed || ''}`.trim();
      renderPropertyCard();
    }
  }

  // floors/rooms
  const rf = existing.rooms?.floors;
  if (Array.isArray(rf) && rf.length) {
    STATE.floors = rf.map(f => ({
      id: f.id || uid('floor'),
      label: f.label || 'Etasje',
      rooms: Array.isArray(f.rooms) ? f.rooms.map(r => ({
        id: r.id || uid('room'),
        name: r.name || r.type || 'Rom',
        type: r.type || 'Rom',
        kvm: r.kvm || '',
        l_cm: r.l_cm || '',
        b_cm: r.b_cm || ''
      })) : []
    }));
  } else {
    ensureFloors(1);
  }

  $('floorCount').value = String(STATE.floors.length);
}

function wireFloorsControls() {
  $('applyFloors').addEventListener('click', () => {
    ensureFloors($('floorCount').value);
    renderFloorsGrid();
    flushToTakstState();
  });

  $('quickAddRoom').addEventListener('click', () => {
    // Åpner modal uten valgt etasje -> default første
    openRoomModal(null);
  });
}

function boot() {
  loadFromExisting();

  wireAddressSearch();
  wireRoomModal();
  wireSaveAndReset();
  wireFormPersistence();
  wireFloorsControls();

  ensureFloors($('floorCount').value);
  renderFloorsGrid();

  setStatus('Klar.');
}

document.addEventListener('DOMContentLoaded', boot);
