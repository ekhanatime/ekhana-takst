/* Ekhana Standalone v5
   - JSON-first: loads canonical profile from /data/ns3600_fullprofil_v1.0.0.json
   - Three views: Kunde, Takstmann, Preview
   - Local-only state: localStorage
   NOTE: Kamera/medieopptak er neste steg (krever https/localhost)
*/

const PATHS = {
  profile: 'data/ns3600_fullprofil_v1.0.0.json',
  rules: 'data/property_object_generator_rules_v1.0.0.json',
  example: 'data/example_property.json'
};

const LS_KEY = 'ekhana_takst_state_v5';

// Build marker shown in UI (handy for deploy/cache verification)
const BUILD_ID = 'v5.3 • 20. januar 2026';

let PROFILE = null;
let RULES = null;
let EXAMPLE = null;
let STATE = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// --- UI icon helpers (JSON-driven; monochrome SVG, lucide-style; fallback to Tag) ---
// Note: We embed a small subset of lucide icons as inline SVG so icons are always monotone.
const LUCIDE_SVG = {
  FileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  TreePine: '<path d="M12 2l4 6H8z"/><path d="M12 8l5 7H7z"/><path d="M12 15l6 7H6z"/>',
  Waves: '<path d="M2 12c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/><path d="M2 16c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/>',
  Wind: '<path d="M3 12h10a2 2 0 1 0-2-2"/><path d="M4 6h12a2 2 0 1 1-2 2"/><path d="M2 18h12a2 2 0 1 0-2-2"/>',
  ThermometerSun: '<path d="M14 4a2 2 0 0 0-4 0v10a4 4 0 1 0 4 0Z"/><path d="M16 6h.01"/><path d="M20 6h.01"/><path d="M18 4v.01"/><path d="M18 8v.01"/>',
  DoorOpen: '<path d="M3 21V3a2 2 0 0 1 2-2h10"/><path d="M21 21V5a2 2 0 0 0-2-2H9"/><path d="M7 21V4"/><path d="M15 12h.01"/>',
  Home: '<path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/>',
  BedDouble: '<path d="M2 10V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/><path d="M2 10h20"/><path d="M4 10v10"/><path d="M20 10v10"/><path d="M2 20h20"/><path d="M6 8h4"/><path d="M14 8h4"/>',
  CookingPot: '<path d="M4 11h16"/><path d="M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><path d="M6 11v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7"/><path d="M4 11v2"/><path d="M20 11v2"/>',
  ShowerHead: '<path d="M4 6l8 8"/><path d="M12 6a6 6 0 0 1 6 6"/><path d="M18 12l-6 6"/><path d="M7 15v.01"/><path d="M10 18v.01"/><path d="M13 21v.01"/><path d="M16 18v.01"/>',
  Toilet: '<path d="M6 3h12"/><path d="M6 7h12"/><path d="M8 7v10a4 4 0 0 0 8 0V7"/><path d="M10 21h4"/>',
  WashingMachine: '<path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M8 6h.01"/><path d="M12 6h.01"/><circle cx="12" cy="14" r="4"/>',
  Car: '<path d="M3 16l1-4a3 3 0 0 1 3-2h10a3 3 0 0 1 3 2l1 4"/><path d="M5 16h14"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/>',
  Package: '<path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.29 7 12 12l8.71-5"/><path d="M12 22V12"/>',
  BrickWall: '<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/><path d="M7 6v6"/><path d="M17 12v6"/><path d="M13 6v6"/><path d="M11 12v6"/>',
  Landmark: '<path d="M12 2 3 7v2h18V7z"/><path d="M5 9v11"/><path d="M9 9v11"/><path d="M15 9v11"/><path d="M19 9v11"/><path d="M3 20h18"/>',
  PanelsTopLeft: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/>',
  Cpu: '<rect x="9" y="9" width="6" height="6" rx="1"/><path d="M4 10h2"/><path d="M4 14h2"/><path d="M18 10h2"/><path d="M18 14h2"/><path d="M10 4v2"/><path d="M14 4v2"/><path d="M10 18v2"/><path d="M14 18v2"/><rect x="6" y="6" width="12" height="12" rx="2"/>',
  Steps: '<path d="M4 18h6v-4h4v-4h6"/><path d="M4 14h6"/><path d="M10 10h4"/>',
  Sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M19.1 4.9l-1.4 1.4"/><path d="M6.3 17.7l-1.4 1.4"/>',
  Users: '<path d="M16 11a4 4 0 1 0-8 0"/><path d="M17 21H7a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4Z"/><path d="M22 21a4 4 0 0 0-3-3.87"/><path d="M2 21a4 4 0 0 1 3-3.87"/>',
  Warehouse: '<path d="M3 10l9-6 9 6"/><path d="M4 10v10h16V10"/><path d="M8 20v-6h8v6"/>',
  Shapes: '<rect x="3" y="3" width="7" height="7" rx="2"/><circle cx="17" cy="7" r="3"/><path d="M14 14h7v7h-7z"/>',
  Sofa: '<path d="M4 12a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6H4z"/><path d="M6 10V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><path d="M4 18v2"/><path d="M20 18v2"/>',
  MessageSquare: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>' ,
  Tag: '<path d="M20 10V6a2 2 0 0 0-2-2h-4L2 16l6 6 12-12v-4Z"/><path d="M7.5 7.5h.01"/>'
};

function svgIcon(name){
  const body = LUCIDE_SVG[name] || LUCIDE_SVG.Tag;
  return `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

function iconFromKey(key){
  if(!key) return svgIcon('Tag');
  const name = String(key).includes(':') ? String(key).split(':',2)[1] : String(key);
  return svgIcon(name);
}

function roomTypeIcon(roomType){
  const iconKey = PROFILE?.ui_catalog?.room_type_icons?.[roomType];
  return iconFromKey(iconKey);
}

function buildingPartIcon(code){
  const bp = (PROFILE?.building_parts_catalog||[]).find(x=>x.code===code);
  const iconKey = bp?.ui?.icon;
  return iconFromKey(iconKey);
}

function iconPill(emoji, label){
  const e = emoji || svgIcon('Tag');
  const l = label || '';
  return `<span class="iconPill"><span class="ic">${e}</span><span>${l}</span></span>`;
}

// Modal helpers (simple, dependency-free)
function modalOpen({title='Modal', subtitle='', bodyHtml='', footerHtml=''}){
  const m = $('#modal');
  $('#modalTitle').textContent = title;
  $('#modalSubtitle').textContent = subtitle || '';
  $('#modalBody').innerHTML = bodyHtml;
  $('#modalFooter').innerHTML = footerHtml;
  m.hidden = false;

  // close handlers
  $$('#modal [data-close]').forEach(el=>{
    el.onclick = () => modalClose();
  });

  // esc
  const onKey = (e)=>{ if(e.key==='Escape') modalClose(); };
  modalOpen._onKey = onKey;
  window.addEventListener('keydown', onKey);
}

function modalClose(){
  const m = $('#modal');
  if(!m) return;
  m.hidden = true;
  if(modalOpen._onKey){
    window.removeEventListener('keydown', modalOpen._onKey);
    modalOpen._onKey = null;
  }
}

function oneLine(str, max=90){
  const s = String(str||'').trim();
  if(!s) return '';
  return s.replace(/\s+/g,' ').slice(0, max);
}

function splitToChips(str){
  const s = String(str||'').trim();
  if(!s) return [];
  // crude but effective for demo: split on newline / bullet / semicolon / comma
  const parts = s
    .split(/\n|•|;|\|/g)
    .map(x=>x.trim())
    .filter(Boolean);
  // if user wrote a full sentence, keep it as one chip
  if(parts.length===1 && parts[0].length>42) return [parts[0]];
  return parts.slice(0,3);
}

function tgRank(tg){
  const map = {TG0:0,TG1:1,TG2:2,TG3:3};
  return map[tg] ?? 0;
}

function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>{t.hidden=true;}, 2200);
}

function uid(prefix='id'){
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function loadState(){
  const raw = localStorage.getItem(LS_KEY);
  if(raw){
    try { return JSON.parse(raw); } catch(e){}
  }
  // initialize from example
  const s = {
    assignment: EXAMPLE.assignment,
    property: EXAMPLE.property,
    rooms: EXAMPLE.rooms,
    checklist_items: [],
    observations: {},
    media: {},
    costs: {}
  };
  return s;
}

function saveState(){
  localStorage.setItem(LS_KEY, JSON.stringify(STATE));
}

function deepGet(obj, path){
  return path.split('.').reduce((acc,k)=>acc && acc[k], obj);
}

function buildChecklist(){
  // Build building-part items (required ones) + room items (per roomtype mandatory_checks)
  const items = [];

  // BUILDING_PART required
  const buildingParts = PROFILE.building_parts_catalog || [];
  const catalog = PROFILE.checklist_items_catalog || [];

  // include all required BUILDING_PART items from catalog
  for(const it of catalog){
    if(it.scope === 'BUILDING_PART' && it.required){
      items.push({
        checklist_item_id: uid('cli'),
        scope: 'BUILDING_PART',
        building_part_code: it.building_part_code || null,
        room_id: null,
        item_code: it.item_code,
        title: it.title,
        required: !!it.required,
        status: 'OK',
        guidance: it.guidance || ''
      });
    }
  }

  // ROOM mandatory per room type
  const rtc = PROFILE.roomtype_catalog || {};
  for(const room of STATE.rooms){
    const def = rtc[room.type];
    if(!def) continue;
    for(const code of (def.mandatory_checks || [])){
      // find title from catalog if exists
      const catItem = catalog.find(x=>x.item_code===code);
      items.push({
        checklist_item_id: uid('cli'),
        scope: 'ROOM',
        building_part_code: null,
        room_id: room.room_id,
        item_code: code,
        title: (catItem && catItem.title) ? catItem.title : code,
        required: true,
        status: 'OK',
        guidance: (catItem && catItem.guidance) ? catItem.guidance : ''
      });
    }
  }

  // Deduplicate ROOM items per room+item_code
  const seen = new Set();
  const dedup = [];
  for(const it of items){
    const key = `${it.scope}|${it.room_id||''}|${it.building_part_code||''}|${it.item_code}`;
    if(seen.has(key)) continue;
    seen.add(key);
    dedup.push(it);
  }

  STATE.checklist_items = dedup;
  saveState();
}

function tgCounts(){
  const counts = {TG0:0,TG1:0,TG2:0,TG3:0};
  for(const k of Object.keys(STATE.observations)){
    const o = STATE.observations[k];
    if(o && o.tg && counts[o.tg] !== undefined) counts[o.tg]++;
  }
  return counts;
}

function validateObservation(obs){
  const rules = PROFILE.field_rules || {};
  const errors = [];
  const tg = obs.tg;
  if(!tg) return ['TG mangler'];

  const requires = [];
  if((tg==='TG2' || tg==='TG3') && Array.isArray(rules.tg2_tg3_requires)){
    for(const p of rules.tg2_tg3_requires) requires.push(p);
  }
  if(tg==='TG3' && Array.isArray(rules.tg3_additionally_requires)){
    for(const p of rules.tg3_additionally_requires) requires.push(p);
  }
  // map observation.finding -> finding etc
  for(const p of requires){
    const key = p.replace('observation.','');
    if(!obs[key] || String(obs[key]).trim()==='') errors.push(`${key} mangler`);
  }

  // media requirement (simple: require at least 1 photo for TG2/TG3)
  const mediaReq = (rules.requires_media_for || {});
  if((tg==='TG2' || tg==='TG3') && mediaReq[tg]){
    const neededKinds = mediaReq[tg];
    const media = STATE.media[obs.observation_id] || [];
    const kinds = new Set(media.map(m=>m.kind));
    for(const kind of neededKinds){
      if(!kinds.has(kind)) errors.push(`mangler media: ${kind}`);
    }
  }

  return errors;
}

function renderClient(){
  const root = $('#viewClient');
  const p = STATE.property;
  const a = STATE.assignment;

  // Ensure floors labels exist and match count
  const floorCount = Math.max(1, parseInt(p.floors?.count||'1',10)||1);
  p.floors = p.floors || {count: floorCount, labels: []};
  p.floors.count = floorCount;
  p.floors.labels = Array.isArray(p.floors.labels) ? p.floors.labels : [];
  while(p.floors.labels.length < floorCount) p.floors.labels.push(p.floors.labels.length===0 ? '1. etg' : `Etasje ${p.floors.labels.length+1}`);
  if(p.floors.labels.length > floorCount) p.floors.labels = p.floors.labels.slice(0,floorCount);

  root.innerHTML = `
    <div class="card">
      <div class="sectionTitle">
        <h2>Kunde • Oppdragsinfo</h2>
        <span class="pill"><span class="dot"></span> Offline-first</span>
      </div>
      <div class="small">Denne siden simulerer lenken kunden får. Feltene danner grunnlag for dynamisk sjekkliste.</div>
      <div class="hr"></div>

      <div class="row">
        <div class="field"><label>Oppdrags-ID</label><input id="c_assignment_id" value="${a.assignment_id||''}"></div>
        <div class="field"><label>Dato befaring</label><input id="c_date_inspected" type="date" value="${a.date_inspected||''}"></div>
      </div>

      <div class="row">
        <div class="field"><label>Kunde navn</label><input id="c_client_name" value="${a.client?.name||''}"></div>
        <div class="field"><label>Telefon</label><input id="c_client_phone" value="${a.client?.phone||''}"></div>
        <div class="field"><label>E-post</label><input id="c_client_email" value="${a.client?.email||''}"></div>
      </div>

      <div class="hr"></div>
      <h2>Eiendom</h2>
      <div class="row">
        <div class="field"><label>Adresse (full)</label><input id="p_addr_full" value="${p.address?.full||''}"></div>
      </div>

      <div class="row">
        <div class="field"><label>Boligtype</label>${enumSelect('p_type', PROFILE.enums?.property_type, p.type)}</div>
        <div class="field"><label>Byggeår</label><input id="p_build_year" type="number" value="${p.build_year||''}"></div>
        <div class="field"><label>Etasjer</label><input id="p_floors" type="number" value="${p.floors?.count||1}"></div>
      </div>

      <div class="hr"></div>
      <h2>Rom</h2>
      <div class="small">Velg etasje først, og legg inn rom via et kort romvalg (modal). Dette gir mindre rot og unike romnavn (Soverom 1, Soverom 2 osv.).</div>
      ${renderFloorsRoomsUI()}

      <div class="hr"></div>
      <div class="row">
        <button class="btn" id="btnSaveClient">Lagre og generer sjekkliste</button>
        <button class="btn secondary" id="btnUseExample">Bruk eksempeldata</button>
      </div>
    </div>
  `;

  $('#btnSaveClient').onclick = () => {
    STATE.assignment.assignment_id = $('#c_assignment_id').value.trim();
    STATE.assignment.date_inspected = $('#c_date_inspected').value;
    STATE.assignment.client.name = $('#c_client_name').value.trim();
    STATE.assignment.client.phone = $('#c_client_phone').value.trim();
    STATE.assignment.client.email = $('#c_client_email').value.trim();

    STATE.property.address.full = $('#p_addr_full').value.trim();
    STATE.property.type = $('#p_type').value;
    STATE.property.build_year = parseInt($('#p_build_year').value||'0',10) || null;
    STATE.property.floors.count = parseInt($('#p_floors').value||'1',10) || 1;
    // floor labels from UI
    const labels = $$('#floorsWrap [data-floorlabel]').map(inp=>inp.value.trim()).filter(Boolean);
    STATE.property.floors.labels = labels.length ? labels : STATE.property.floors.labels;

    saveState();
    buildChecklist();
    toast('Lagret. Sjekkliste generert.');
    renderInspector();
    renderPreview();
  };

  $('#btnUseExample').onclick = () => {
    STATE = {
      assignment: EXAMPLE.assignment,
      property: EXAMPLE.property,
      rooms: EXAMPLE.rooms,
      checklist_items: [],
      observations: {},
      media: {},
      costs: {}
    };
    saveState();
    buildChecklist();
    toast('Eksempel lastet.');
    renderClient();
    renderInspector();
    renderPreview();
  };

  wireFloorsRoomsControls();
}

function slugDisplay(name){
  return String(name||'').replace(/_/g,' ');
}

function uniqueRoomName(type, floor_index){
  const base = (type==='Teknisk_rom') ? 'Teknisk rom' : slugDisplay(type);
  const roomsOnFloor = (STATE.rooms||[]).filter(r=>r.floor_index===floor_index);
  const existing = new Set(roomsOnFloor.map(r=>r.name));

  // Bedroom convention
  if(type==='Soverom'){
    let n = 1
    while(existing.has(`Soverom ${n}`)) n += 1;
    return `Soverom ${n}`;
  }

  if(!existing.has(base)) return base;
  let i = 2;
  while(existing.has(`${base} ${i}`)) i += 1;
  return `${base} ${i}`;
}

function addRoomToState({type, floor_index}){
  const name = uniqueRoomName(type, floor_index);
  STATE.rooms = STATE.rooms || [];
  STATE.rooms.push({
    room_id: uid('room'),
    type,
    name,
    floor_index,
    size_hint: 'middels',
    is_wet_room: !!(PROFILE.roomtype_catalog?.[type]?.is_wet_room)
  });
  saveState();
}

function renderFloorsRoomsUI(){
  const p = STATE.property;
  const count = Math.max(1, parseInt(p.floors?.count||'1',10)||1);
  const labels = Array.isArray(p.floors?.labels) ? p.floors.labels : [];

  const byFloor = new Map();
  for(let i=0;i<count;i++) byFloor.set(i, []);
  for(const r of (STATE.rooms||[])){
    if(!byFloor.has(r.floor_index)) byFloor.set(r.floor_index, []);
    byFloor.get(r.floor_index).push(r);
  }

  const floorCards = Array.from(byFloor.keys()).sort((a,b)=>a-b).map((floorIndex)=>{
    const title = labels[floorIndex] || `Etasje ${floorIndex}`;
    const rooms = (byFloor.get(floorIndex)||[]);
    const roomPills = rooms.length
      ? rooms.map(r=>`<span class="roomPill" title="${r.type}"><span class="ic">${roomTypeIcon(r.type)}</span>${r.name}<button class="pillX" data-delroom="${r.room_id}" aria-label="Fjern">×</button></span>`).join('')
      : '<div class="small">Ingen rom på denne etasjen ennå.</div>';
    return `
      <div class="card subtle" style="margin-top:10px" data-floorcard="${floorIndex}">
        <div class="row" style="align-items:flex-end">
          <div class="field" style="min-width:240px">
            <label>Etasje (label)</label>
            <input data-floorlabel value="${title}">
          </div>
          <div class="field" style="flex:1">
            <label>Rom på etasjen</label>
            <div class="pillWrap">${roomPills}</div>
          </div>
          <div class="field" style="width:220px">
            <label>&nbsp;</label>
            <button class="btn secondary" data-addrooms="${floorIndex}">+ Legg til rom (modal)</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div id="floorsWrap">
      ${floorCards}
    </div>
  `;
}

function wireFloorsRoomsControls(){
  // delete room pills
  $$('#viewClient [data-delroom]').forEach(btn=>{
    btn.onclick = (e)=>{
      const id = btn.getAttribute('data-delroom');
      STATE.rooms = (STATE.rooms||[]).filter(r=>r.room_id!==id);
      saveState();
      renderClient();
    };
  });
  // add rooms modal per floor
  $$('#viewClient [data-addrooms]').forEach(btn=>{
    btn.onclick = () => openAddRoomsModal(parseInt(btn.getAttribute('data-addrooms')||'0',10)||0);
  });
}

function openAddRoomsModal(floorIndex){
  const all = (PROFILE.enums?.room_type || []).slice();
  // Make list shorter: exclude bedrooms from quick list (handled separately)
  const types = all.filter(t=>t!=='Soverom');
  const quick = [
    'Entré/Gang','Stue','Kjøkken','Bad','WC','Vaskerom','Bod','Teknisk_rom','Trapp','Garasje','Balkong/Terrasse','Uthus/Anneks','Kjeller','Loft','Fellesareal','Annet'
  ].filter(t=>types.includes(t));

  const list = (quick.length?quick:types).map(t=>{
    return `<button class="btn secondary" style="justify-content:flex-start" data-addtype="${t}"><span class="ic">${roomTypeIcon(t)}</span>${slugDisplay(t)}</button>`;
  }).join('');

  modalOpen({
    title: `Legg til rom • Etasje ${floorIndex}`,
    subtitle: 'Velg vanlige rom. Soverom legges inn med antall for å sikre unike navn.',
    bodyHtml: `
      <div class="row" style="gap:12px;align-items:flex-end">
        <div class="field" style="max-width:220px">
          <label>Soverom (antall)</label>
          <input id="bedCount" type="number" min="0" value="0">
        </div>
        <div class="field" style="max-width:260px">
          <label>&nbsp;</label>
          <button class="btn" id="btnAddBedrooms">Legg til soverom</button>
        </div>
      </div>
      <div class="hr"></div>
      <div class="small" style="margin-bottom:8px">Vanlige rom</div>
      <div class="gridButtons">${list}</div>
      <div class="hr"></div>
      <div class="small">Tips: Du kan legge til flere av samme romtype – navnet nummereres automatisk per etasje.</div>
    `,
    footerHtml: `<button class="btn secondary" data-close>Lukk</button>`
  });

  // wire buttons
  $$('#modal [data-addtype]').forEach(b=>{
    b.onclick = ()=>{
      const type = b.getAttribute('data-addtype');
      addRoomToState({type, floor_index: floorIndex});
      modalClose();
      renderClient();
    };
  });
  $('#btnAddBedrooms').onclick = ()=>{
    const n = Math.max(0, parseInt($('#bedCount').value||'0',10)||0);
    for(let i=0;i<n;i++) addRoomToState({type:'Soverom', floor_index: floorIndex});
    modalClose();
    renderClient();
  };
}

function enumSelect(id, values, current){
  const opts = (values||[]).map(v => `<option ${v===current?'selected':''}>${v}</option>`).join('');
  return `<select id="${id}">${opts}</select>`;
}

function roomPicker(){
  const types = PROFILE.enums?.room_type || [];
  const existing = new Map((STATE.rooms||[]).map(r=>[r.room_id,r]));
  // We store as a simple editable table: room_id hidden, but we regenerate on save
  const rows = (STATE.rooms||[]).map(r=>{
    return `<div class="row" data-roomrow>
      <div class="field"><label>Romtype</label>${enumSelect(`rt_${r.room_id}`, types, r.type)}</div>
      <div class="field"><label>Navn</label><input data-roomname value="${r.name||''}"></div>
      <div class="field"><label>Etasje (index)</label><input data-floor type="number" value="${r.floor_index||0}"></div>
      <div class="field"><label></label><button class="btn secondary" data-del>Fjern</button></div>
    </div>`;
  }).join('');

  return `
    <div id="roomTable">
      ${rows || '<div class="small">Ingen rom lagt til ennå. Legg til under.</div>'}
    </div>
    <div class="hr"></div>
    <button class="btn secondary" id="btnAddRoom">+ Legg til rom</button>
  `;
}

function collectRoomsFromPicker(){
  const types = PROFILE.enums?.room_type || [];
  const table = $('#roomTable');
  const rows = table ? Array.from(table.querySelectorAll('[data-roomrow]')) : [];
  const out = [];
  for(const row of rows){
    const sel = row.querySelector('select');
    const name = row.querySelector('[data-roomname]').value.trim();
    const floor = parseInt(row.querySelector('[data-floor]').value||'0',10) || 0;
    const type = sel.value;
    out.push({
      room_id: uid('room'),
      type,
      name: name || type,
      floor_index: floor,
      size_hint: '',
      is_wet_room: !!(PROFILE.roomtype_catalog?.[type]?.is_wet_room)
    });
  }
  // if user has no rows, create a minimal default
  if(out.length===0){
    out.push({room_id: uid('room'), type: 'Stue', name:'Stue', floor_index:0, is_wet_room:false});
  }
  return out;
}

function wireRoomPickerControls(){
  const add = $('#btnAddRoom');
  if(!add) return;
  add.onclick = () => {
    const table = $('#roomTable');
    const rid = uid('room');
    const types = PROFILE.enums?.room_type || [];
    const wrapper = document.createElement('div');
    wrapper.className = 'row';
    wrapper.setAttribute('data-roomrow','');
    wrapper.innerHTML = `
      <div class="field"><label>Romtype</label>${enumSelect(`rt_${rid}`, types, 'Stue')}</div>
      <div class="field"><label>Navn</label><input data-roomname value=""></div>
      <div class="field"><label>Etasje (index)</label><input data-floor type="number" value="0"></div>
      <div class="field"><label></label><button class="btn secondary" data-del>Fjern</button></div>
    `;
    table.appendChild(wrapper);
    wrapper.querySelector('[data-del]').onclick = () => wrapper.remove();
  };

  // existing delete buttons
  $$('#roomTable [data-del]').forEach(btn => {
    btn.onclick = (e) => e.target.closest('[data-roomrow]').remove();
  });
}

function renderInspector(){
  const root = $('#viewInspector');
  const items = STATE.checklist_items || [];

  const roomMap = new Map((STATE.rooms||[]).map(r=>[r.room_id,r]));
  const buildingItems = items.filter(i=>i.scope==='BUILDING_PART');
  const roomItems = items.filter(i=>i.scope==='ROOM');

  // Ensure observations exist
  for(const it of items) ensureObservation(it);

  const sectionsHtml = [
    renderBuildingPartSections(buildingItems),
    renderRoomSections(roomItems, roomMap)
  ].join('');

  root.innerHTML = `
    <div class="card">
      <div class="sectionTitle">
        <h2>Takstmann • Befaring</h2>
        <span class="badge ok">Seksjoner + tabeller</span>
      </div>
      <div class="small">Ryddig oversikt: én tabell per seksjon. Redigering skjer i modaler (ingen store tekstfelt som skyver layouten).</div>
      <div class="hr"></div>

      ${sectionsHtml || '<div class="small">Ingen sjekkliste generert ennå. Gå til Kunde-fanen og lagre.</div>'}

      <div class="hr"></div>
      <div class="row">
        <button class="btn" id="btnValidate">Valider (publish-sjekk)</button>
        <button class="btn secondary" id="btnRebuild">Bygg sjekkliste på nytt</button>
      </div>
      <div id="validationOut" class="small" style="margin-top:10px"></div>
    </div>
  `;

  // Wire section actions
  $$('#viewInspector [data-collapse]').forEach(btn=>{
    btn.onclick = () => {
      const id = btn.getAttribute('data-collapse');
      const body = document.querySelector(`[data-section-body="${id}"]`);
      const isHidden = body.getAttribute('data-collapsed') === '1';
      body.setAttribute('data-collapsed', isHidden ? '0' : '1');
      body.hidden = !isHidden;
      btn.textContent = isHidden ? 'Skjul' : 'Vis';
    };
  });

  // Wire row actions
  $$('#viewInspector [data-edit]').forEach(btn=>{
    btn.onclick = () => openObservationModal(btn.getAttribute('data-edit'), {focus:null});
  });
  $$('#viewInspector [data-edit-notes]').forEach(btn=>{
    btn.onclick = () => openObservationModal(btn.getAttribute('data-edit-notes'), {focus:'notes'});
  });
  $$('#viewInspector [data-tgbtn]').forEach(btn=>{
    btn.onclick = () => openTGQuickPicker(btn.getAttribute('data-tgbtn'));
  });
  $$('#viewInspector [data-thumb]').forEach(img=>{
    img.onclick = () => openMediaViewer(img.getAttribute('data-oid'));
  });

  $('#btnValidate').onclick = () => {
    const errs = [];
    for(const oid of Object.keys(STATE.observations)){
      const e = validateObservation(STATE.observations[oid]);
      if(e.length) errs.push({oid, errors:e});
    }
    const out = $('#validationOut');
    if(!errs.length){
      out.innerHTML = '<span class="badge ok">OK</span> Ingen blocking-feil funnet.';
      toast('Validering OK');
      return;
    }
    out.innerHTML = `<span class="badge danger">Feil</span> ${errs.length} observasjoner har mangler.<div class="hr"></div>` +
      errs.slice(0,20).map(x=>`<div>• ${x.oid}: ${x.errors.join(', ')}</div>`).join('') +
      (errs.length>20? `<div class="small">(+ ${errs.length-20} flere)</div>`:'');
    toast('Validering fant mangler');
  };

  $('#btnRebuild').onclick = () => {
    buildChecklist();
    toast('Sjekkliste bygget på nytt');
    renderInspector();
    renderPreview();
  };
}

function ensureObservation(item){
  const oid = item.checklist_item_id;
  if(STATE.observations[oid]) return STATE.observations[oid];

  const defaults = PROFILE?.field_defaults?.observation || {};
  STATE.observations[oid] = {
    observation_id: oid,
    checklist_item_id: oid,
    tg: defaults.tg || 'TG0',
    finding: defaults.finding || '',
    cause: defaults.cause || '',
    consequence: defaults.consequence || '',
    action: defaults.action || '',
    action_priority: defaults.action_priority || 'Middels',
    action_timeframe: defaults.action_timeframe || 'Ved_anledning',
    not_inspected_reason: defaults.not_inspected_reason || '',
    moisture: defaults.moisture || { indication: 'Ikke_målt', measurement: '' },
    notes: defaults.notes || ''
  };
  saveState();
  return STATE.observations[oid];
}

function renderBuildingPartSections(buildingItems){
  const parts = PROFILE.building_parts_catalog || [];
  const map = new Map();
  for(const it of buildingItems){
    const code = it.building_part_code || 'UKJENT';
    if(!map.has(code)) map.set(code, []);
    map.get(code).push(it);
  }

  // render in catalog order, then extras
  const orderedCodes = parts.map(p=>p.code).filter(code=>map.has(code));
  const extras = Array.from(map.keys()).filter(c=>!orderedCodes.includes(c));
  const codes = [...orderedCodes, ...extras];

  return codes.map(code=>{
    const def = parts.find(p=>p.code===code);
    const title = def ? def.name : code;
    const icon = iconForBuildingPart(code);
    const arr = map.get(code) || [];
    return renderSectionBlock({
      id:`bp_${code}`,
      title,
      icon,
      subtitle:'Bygningsdel',
      items: arr,
      context: {kind:'BUILDING_PART', building_part_code: code}
    });
  }).join('');
}

function renderRoomSections(roomItems, roomMap){
  const byRoom = new Map();
  for(const it of roomItems){
    if(!byRoom.has(it.room_id)) byRoom.set(it.room_id, []);
    byRoom.get(it.room_id).push(it);
  }

  const blocks = [];
  for(const [room_id, arr] of byRoom.entries()){
    const r = roomMap.get(room_id);
    const title = r ? `${r.type} • ${r.name||''}` : `Rom ${room_id}`;
    const icon = iconForRoom(r?.type);
    blocks.push(renderSectionBlock({
      id:`room_${room_id}`,
      title,
      icon,
      subtitle:'Rom',
      items: arr,
      context: {kind:'ROOM', room_id, room_type: r?.type || null}
    }));
  }
  return blocks.join('');
}

function renderSectionBlock({id,title,subtitle,icon,items,context}){
  const tgWorst = worstTG(items.map(i=>STATE.observations[i.checklist_item_id]?.tg || 'TG0'));
  const counts = countTGs(items);

  return `
    <div class="sectionBlock" data-section="${id}">
      <div class="sectionHeader">
        <div class="sectionHeader__left">
          <div class="sectionIcon" title="${escapeHtml(subtitle)}">${icon}</div>
          <div class="sectionMeta">
            <div class="sectionTitleTxt">${escapeHtml(title)}</div>
            <div class="sectionSubTxt">${escapeHtml(subtitle)} • ${items.length} punkt</div>
          </div>
        </div>
        <div class="sectionHeader__right">
          <div class="badgeGroup">
            <div class="tgPill" data-tg="${tgWorst}"><span class="dot"></span>${tgWorst}</div>
            <span class="badge">TG2: ${counts.TG2} • TG3: ${counts.TG3}</span>
          </div>
          <button class="iconbtn small" data-collapse="${id}">Skjul</button>
        </div>
      </div>

      <div class="tableWrap" data-section-body="${id}">
        ${renderSectionTable(items, context)}
      </div>
    </div>
  `;
}

function renderSectionTable(items, context){
  const rows = items.map(it=>renderTableRow(it, context)).join('');
  return `
    <div class="tTableWrap">
    <table class="tTable" aria-label="Seksjonstabell">
      <thead>
        <tr>
          <th class="colTg">TG</th>
          <th>Punkt</th>
          <th>Funn</th>
          <th>Årsak</th>
          <th>Konsekvens</th>
          <th>Tiltak</th>
          <th class="colComment">Kommentar</th>
          <th class="colThumbs">Bilder</th>
          <th class="colActions">Handlinger</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="9" class="mini">Ingen punkter i denne seksjonen.</td></tr>'}
      </tbody>
    </table>
    </div>
  `;
}

function setObservationTG(oid, newTg, {openModalOnRaise=true, rerender=true}={}){
  const o = STATE.observations[oid];
  if(!o) return;
  const prev = o.tg || 'TG0';
  o.tg = newTg;
  saveState();
  if(rerender) renderAll();

  // If user raises TG from TG0 -> something else, jump straight into modal to fill required fields.
  if(openModalOnRaise && prev==='TG0' && newTg!=='TG0'){
    openObservationModal(oid, {focus:'finding'});
  }
}

function openTGQuickPicker(oid){
  const o = STATE.observations[oid];
  if(!o) return;
  const options = (PROFILE.principles?.tg_scale || ['TG0','TG1','TG2','TG3']);
  const body = `
    <div class="tgPick">
      ${options.map(tg=>`
        <button class="tgPickBtn" data-tg-pick="${tg}" data-current="${o.tg===tg?'1':'0'}">
          <span class="tgPill" data-tg="${tg}"><span class="dot"></span>${tg}</span>
          <span class="mini">${tg==='TG0'?'Ingen avvik registrert':(tg==='TG1'?'Avvik / mindre tiltak':(tg==='TG2'?'Vesentlige forhold':'Alvorlige forhold'))}</span>
        </button>
      `).join('')}
    </div>
  `;
  const footer = `<button class="iconbtn" data-close>Lukk</button>`;
  modalOpen({
    title: 'Velg TG',
    subtitle: 'Trykk på graden. Ved TG1–TG3 åpnes redigering automatisk.',
    bodyHtml: body,
    footerHtml: footer
  });
  $$('#modal [data-tg-pick]').forEach(btn=>{
    btn.onclick = () => {
      const tg = btn.getAttribute('data-tg-pick');
      modalClose();
      setObservationTG(oid, tg, {openModalOnRaise:true});
    };
  });
}

function renderTableRow(item, context){
  const oid = item.checklist_item_id;
  const o = STATE.observations[oid];

  const finding = oneLine(o.finding, 70);
  const cause = oneLine(o.cause, 70);
  const consequence = oneLine(o.consequence, 70);
  const action = oneLine(o.action, 70);

  const media = (STATE.media?.[oid] || []).filter(m=>m.kind==='photo');
  const thumbs = media.slice(0,3).map((m,idx)=>
    `<img class="thumb" data-thumb data-oid="${oid}" alt="Bilde ${idx+1}" src="${escapeHtml(m.storage_key||m.url||'')}" />`
  ).join('');
  const more = media.length>3 ? `<span class="thumbMore" data-thumb data-oid="${oid}">+${media.length-3}</span>` : '';

  const notes = String(o.notes||'').trim();

  return `
    <tr>
      <td class="colTg">
        <button class="tgPill tgBtn" data-tgbtn="${oid}" data-tg="${o.tg}" title="Trykk for å velge TG">
          <span class="dot"></span>${o.tg}
        </button>
      </td>
      <td>
        <div class="titleCell">${escapeHtml(item.title)}</div>
        ${item.guidance ? `<div class="mutedLine">${escapeHtml(item.guidance)}</div>` : ''}
      </td>
      <td>
        ${renderOneLineCell(finding, o.finding)}
      </td>
      <td>
        ${renderOneLineCell(cause, o.cause)}
      </td>
      <td>
        ${renderOneLineCell(consequence, o.consequence)}
      </td>
      <td>
        ${renderOneLineCell(action, o.action)}
      </td>
      <td class="colComment">
        <button class="iconbtn small" data-edit-notes="${oid}" title="Rediger kommentar">
          <span class="ic">${svgIcon('MessageSquare')}</span>
          ${notes ? '<span class="mini">•</span>' : '<span class="mini">+</span>'}
        </button>
      </td>
      <td class="colThumbs">
        <div class="thumbs">${thumbs}${more}${(!media.length ? '<span class="mini">—</span>' : '')}</div>
      </td>
      <td class="colActions">
        <button class="iconbtn small" data-edit="${oid}">Rediger</button>
      </td>
    </tr>
  `;
}

function renderOneLineCell(shortText, fullText){
  const full = String(fullText||'').trim();
  if(!full) return `<span class="mini">—</span>`;
  const s = shortText || oneLine(full, 90);
  return `<div class="cellOneLine" title="${escapeHtml(full)}">${escapeHtml(s)}</div>`;
}

function renderChipsOrDash(chips, raw){
  if(chips && chips.length){
    return `<div class="chips">${chips.map(c=>`<span class="chip">${escapeHtml(c)}</span>`).join('')}</div>`;
  }
  const ol = oneLine(raw);
  if(ol) return `<div class="mini">${escapeHtml(ol)}</div>`;
  return `<span class="mini">—</span>`;
}

function countTGs(items){
  const c = {TG0:0,TG1:0,TG2:0,TG3:0};
  for(const it of items){
    const tg = STATE.observations[it.checklist_item_id]?.tg || 'TG0';
    if(c[tg]!==undefined) c[tg]++;
  }
  return c;
}

function worstTG(tgs){
  let best = 'TG0';
  for(const tg of (tgs||[])){
    if(tgRank(tg) > tgRank(best)) best = tg;
  }
  return best;
}

function iconForBuildingPart(code){
  // Prefer JSON-driven icons (PROFILE.building_parts_catalog[].ui.icon)
  return buildingPartIcon(code) || svgIcon('Tag');
}

function iconForRoom(type){
  // Prefer JSON-driven icons (PROFILE.ui_catalog.room_type_icons)
  return roomTypeIcon(type) || svgIcon('Tag');
}

function getSuggestionsFor({field, building_part_code=null, room_type=null}){
  const lib = PROFILE.autosuggestion_library || {};
  const out = [];

  // generic suggestions
  const gen = lib.generic || {};
  if(Array.isArray(gen[field])) out.push(...gen[field]);

  // bygningsdel suggestions
  const by = lib.bygningsdel || {};
  if(building_part_code && by[building_part_code]){
    const b = by[building_part_code];
    if(field==='finding' && Array.isArray(b.quick_findings)) out.push(...b.quick_findings);
    if(Array.isArray(b[field])) out.push(...b[field]);
  }

  // romtype suggestions
  const rt = lib.romtype || {};
  if(room_type && rt[room_type]){
    const r = rt[room_type];
    if(field==='finding' && Array.isArray(r.quick_findings)) out.push(...r.quick_findings);
    if(Array.isArray(r[field])) out.push(...r[field]);
  }

  // uniq + limit
  const seen = new Set();
  const uniq = [];
  for(const s of out){
    const k = String(s||'').trim();
    if(!k) continue;
    if(seen.has(k)) continue;
    seen.add(k);
    uniq.push(k);
    if(uniq.length>=18) break;
  }
  return uniq;
}

function openObservationModal(oid, {focus=null}={}){
  const o = STATE.observations[oid];
  if(!o) return;
  const item = STATE.checklist_items.find(x=>x.checklist_item_id===oid);

  // determine context for suggestions
  const building_part_code = item?.scope==='BUILDING_PART' ? (item.building_part_code||null) : null;
  const room = item?.scope==='ROOM' ? (STATE.rooms.find(r=>r.room_id===item.room_id) || null) : null;
  const room_type = room?.type || null;

  const apOpts = (PROFILE.enums?.action_priority||[]).map(v=>`<option ${v===o.action_priority?'selected':''}>${v}</option>`).join('');
  const atOpts = (PROFILE.enums?.action_timeframe||[]).map(v=>`<option ${v===o.action_timeframe?'selected':''}>${v}</option>`).join('');
  const miOpts = (PROFILE.enums?.moisture_indication||[]).map(v=>`<option ${v===o.moisture?.indication?'selected':''}>${v}</option>`).join('');

  const sugFinding = getSuggestionsFor({field:'finding', building_part_code, room_type});
  const sugCause = getSuggestionsFor({field:'cause', building_part_code, room_type});
  const sugCons = getSuggestionsFor({field:'consequence', building_part_code, room_type});
  const sugAction = getSuggestionsFor({field:'action', building_part_code, room_type});

  const media = (STATE.media?.[oid] || []).filter(m=>m.kind==='photo');

  const tgScale = (PROFILE.principles?.tg_scale || ['TG0','TG1','TG2','TG3']);

  const body = `
    <div class="modalTopRow">
      <div class="tgInline" aria-label="Velg TG">
        ${tgScale.map(tg=>`
          <button class="tgPill tgInlineBtn" data-tg-inline="${tg}" data-active="${o.tg===tg?'1':'0'}">
            <span class="dot"></span>${tg}
          </button>
        `).join('')}
      </div>

      <div class="row compact">
        <div class="field">
          <label>Prioritet</label>
          <select id="m_ap">${apOpts}</select>
        </div>
        <div class="field">
          <label>Tidsrom</label>
          <select id="m_at">${atOpts}</select>
        </div>
      </div>
    </div>

    <div class="hr"></div>

    <div class="split2">
      <div>
        <div class="modalCard">
          <div class="modalCardTitle">Funn</div>
          <div class="field">
            <textarea id="m_finding" rows="2" maxlength="220" placeholder="Kort, presist…">${escapeHtml(o.finding||'')}</textarea>
          </div>
          ${suggestionBox('Funn-forslag', 'm_finding', sugFinding)}
        </div>

        <div class="modalCard" style="margin-top:10px">
          <div class="modalCardTitle">Årsak</div>
          <div class="field">
            <textarea id="m_cause" rows="2" maxlength="220" placeholder="Hva skyldes funnet?">${escapeHtml(o.cause||'')}</textarea>
          </div>
          ${suggestionBox('Årsak-forslag', 'm_cause', sugCause)}
        </div>

        <div class="modalCard" style="margin-top:10px">
          <div class="modalCardTitle">Konsekvens</div>
          <div class="field">
            <textarea id="m_consequence" rows="2" maxlength="220" placeholder="Hva kan dette føre til?">${escapeHtml(o.consequence||'')}</textarea>
          </div>
          ${suggestionBox('Konsekvens-forslag', 'm_consequence', sugCons)}
        </div>

        <div class="modalCard" style="margin-top:10px">
          <div class="modalCardTitle">Tiltak</div>
          <div class="field">
            <textarea id="m_action" rows="2" maxlength="220" placeholder="Anbefalt tiltak…">${escapeHtml(o.action||'')}</textarea>
          </div>
          ${suggestionBox('Tiltak-forslag', 'm_action', sugAction)}
        </div>

        <div class="modalGrid" style="margin-top:10px">
          <div class="modalCard">
            <div class="modalCardTitle">Fukt</div>
            <div class="row compact" style="align-items:flex-end">
              <div class="field" style="flex:1">
                <label>Indikasjon</label>
                <select id="m_mi">${miOpts}</select>
              </div>
              <div class="field" style="flex:1">
                <label>Måling</label>
                <input id="m_mm" type="text" placeholder="Metode/verdi…" value="${escapeHtml(o.moisture?.measurement||'')}" />
              </div>
            </div>
            <div class="field" style="margin-top:8px">
              <label>Ikke inspisert – årsak</label>
              <input id="m_notinsp" type="text" placeholder="Hvis ikke inspisert: kort begrunnelse…" value="${escapeHtml(o.not_inspected_reason||'')}" />
            </div>
          </div>

          <div class="modalCard">
            <div class="modalCardTitle">Kommentar</div>
            <div class="field">
              <textarea id="m_notes" rows="2" maxlength="140" placeholder="Kort linjenotat…">${escapeHtml(o.notes||'')}</textarea>
            </div>
          </div>
        </div>

        <div class="modalCard" style="margin-top:10px">
          <div class="modalCardTitle">Info</div>
          <div class="mini"><b>Linje-ID:</b> ${escapeHtml(oid)}</div>
          <div class="mini" style="margin-top:6px"><b>Validering:</b> <span id="m_validation">—</span></div>
        </div>
      </div>

      <div>
        <div class="modalCard">
          <div class="modalCardTitle">Bilder (thumbnail)</div>
          <div class="thumbs" style="margin-bottom:10px">
            ${media.length ? media.map((m,idx)=>
              `<img class="thumb" data-thumb data-oid="${oid}" alt="Bilde ${idx+1}" src="${escapeHtml(m.storage_key||m.url||'')}" />`
            ).join('') : '<span class="mini">Ingen bilder lagt til.</span>'}
          </div>
          <div class="field">
            <label>Legg til bilde (demo)</label>
            <input id="m_photo" type="file" accept="image/*" />
            <div class="mini">(Lagrer som data-URL i localStorage – kun demo)</div>
          </div>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="iconbtn" id="btnMediaViewer">Åpne galleri</button>
          </div>
        </div>
      </div>
    </div>

  `;

  const footer = `
    <button class="iconbtn" data-close>Avbryt</button>
    <button class="btn" id="btnSaveObs">Lagre</button>
  `;

  modalOpen({
    title: item?.title ? item.title : 'Observasjon',
    subtitle: building_part_code ? `Bygningsdel: ${building_part_code}` : (room ? `Rom: ${room.type} • ${room.name||''}` : ''),
    bodyHtml: body,
    footerHtml: footer
  });

  // TG inline change
  $$('#modal [data-tg-inline]').forEach(btn=>{
    btn.onclick = () => {
      const tg = btn.getAttribute('data-tg-inline');
      setObservationTG(oid, tg, {openModalOnRaise:false, rerender:false});
      // update active visuals without full rerender
      $$('#modal [data-tg-inline]').forEach(b=>b.setAttribute('data-active', b.getAttribute('data-tg-inline')===tg?'1':'0'));
    };
  });

  // focus
  if(focus==='notes') setTimeout(()=>$('#m_notes')?.focus(), 0);
  if(focus==='finding') setTimeout(()=>$('#m_finding')?.focus(), 0);

  // Wire suggestion chips
  $$('#modal [data-sug]').forEach(btn=>{
    btn.onclick = () => {
      const target = btn.getAttribute('data-target');
      const txt = btn.getAttribute('data-sug');
      const el = document.getElementById(target);
      if(!el) return;
      const v = el.value || '';
      el.value = v ? (v.trim().endsWith('.') ? `${v} ${txt}` : `${v}\n• ${txt}`) : txt;
      el.dispatchEvent(new Event('input'));
      el.focus();
    };
  });

  // Wire media viewer + add photo
  $('#btnMediaViewer').onclick = () => openMediaViewer(oid);
  const inp = $('#m_photo');
  inp.onchange = async () => {
    const f = inp.files?.[0];
    if(!f) return;
    const dataUrl = await fileToDataURL(f);
    if(!STATE.media[oid]) STATE.media[oid] = [];
    STATE.media[oid].push({
      media_id: uid('med'),
      observation_id: oid,
      kind: 'photo',
      storage_key: dataUrl,
      caption: ''
    });
    saveState();
    toast('Bilde lagt til (demo)');
    openObservationModal(oid, {focus});
  };

  // validate live
  const updateValidation = () => {
    const tmp = {
      observation_id: oid,
      checklist_item_id: oid,
      tg: o.tg,
      finding: $('#m_finding').value,
      cause: $('#m_cause').value,
      consequence: $('#m_consequence').value,
      action: $('#m_action').value,
      action_priority: $('#m_ap').value,
      action_timeframe: $('#m_at').value,
      moisture: {
        indication: $('#m_mi')?.value || (o.moisture?.indication||''),
        measurement: $('#m_mm')?.value || (o.moisture?.measurement||'')
      },
      not_inspected_reason: $('#m_notinsp')?.value || (o.not_inspected_reason||''),
      notes: $('#m_notes').value
    };
    const errs = validateObservation({...o, ...tmp});
    const el = $('#m_validation');
    if(!errs.length) el.innerHTML = '<span class="badge ok">OK</span> Ingen mangler oppdaget.';
    else el.innerHTML = `<span class="badge danger">Mangler</span> <span class="dangerText">${escapeHtml(errs.join(', '))}</span>`;
  };
  ['m_finding','m_cause','m_consequence','m_action','m_ap','m_at','m_mi','m_mm','m_notinsp','m_notes'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.oninput = updateValidation;
    el.onchange = updateValidation;
  });
  updateValidation();

  // Save
  $('#btnSaveObs').onclick = () => {
    o.finding = $('#m_finding').value;
    o.cause = $('#m_cause').value;
    o.consequence = $('#m_consequence').value;
    o.action = $('#m_action').value;
    o.action_priority = $('#m_ap').value;
    o.action_timeframe = $('#m_at').value;
    o.moisture = {
      indication: $('#m_mi')?.value || (o.moisture?.indication||'Ikke_målt'),
      measurement: $('#m_mm')?.value || ''
    };
    o.not_inspected_reason = $('#m_notinsp')?.value || '';
    o.notes = $('#m_notes').value;
    saveState();
    modalClose();
    renderInspector();
    renderPreview();
    toast('Lagret');
  };
}

function suggestionBox(title, targetId, suggestions){
  if(!suggestions || !suggestions.length) return '';
  return `
    <div class="hintBox" style="margin-top:8px">
      <div class="hintTitle">${escapeHtml(title)}</div>
      <div class="hintChips">
        ${suggestions.map(s=>`<span class="chip chipBtn" data-target="${targetId}" data-sug="${escapeHtml(s)}">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>
  `;
}

function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function openMediaViewer(oid){
  const media = (STATE.media?.[oid] || []).filter(m=>m.kind==='photo');
  const body = `
    <div class="small">Klikk på et bilde for å kopiere det inn i modal-visning (demo). Du kan også slette.</div>
    <div class="hr"></div>
    <div class="thumbs">
      ${media.length ? media.map((m,idx)=>`
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
          <img class="thumb" style="width:120px;height:120px" src="${escapeHtml(m.storage_key||m.url||'')}" alt="Bilde ${idx+1}" />
          <button class="iconbtn small" data-delmedia="${m.media_id}">Slett</button>
        </div>
      `).join('') : '<span class="mini">Ingen bilder.</span>'}
    </div>
  `;

  modalOpen({
    title: 'Bilder',
    subtitle: `observasjon_id: ${oid}`,
    bodyHtml: body,
    footerHtml: `<button class="iconbtn" data-close>Lukk</button>`
  });

  $$('#modal [data-delmedia]').forEach(btn=>{
    btn.onclick = () => {
      const mid = btn.getAttribute('data-delmedia');
      STATE.media[oid] = (STATE.media[oid] || []).filter(m=>m.media_id !== mid);
      saveState();
      toast('Bilde slettet');
      openMediaViewer(oid);
      renderInspector();
    };
  });
}

function enumSelectInline(id, values, current, dataAttr, oid){
  const opts = (values||[]).map(v=>`<option ${v===current?'selected':''}>${v}</option>`).join('');
  return `<select id="${id}" ${dataAttr} data-oid="${oid}">${opts}</select>`;
}

function renderPreview(){
  const root = $('#viewPreview');
  const counts = tgCounts();
  const total = Object.values(counts).reduce((a,b)=>a+b,0) || 1;

  const important = Object.values(STATE.observations).filter(o=>o.tg==='TG3' || o.tg==='TG2');

  root.innerHTML = `
    <div class="card">
      <div class="sectionTitle">
        <h2>Takst preview</h2>
        <span class="badge warn">Utkast</span>
      </div>
      <div class="small">Preview genereres av registrerte observasjoner og krav i profilen.</div>
      <div class="hr"></div>

      <div class="kpis">
        ${kpi('TG0', counts.TG0)}
        ${kpi('TG1', counts.TG1)}
        ${kpi('TG2', counts.TG2)}
        ${kpi('TG3', counts.TG3)}
      </div>

      <div class="hr"></div>
      <div class="itemTitle">TG-fordeling</div>
      ${distBar(counts, total)}

      <div class="hr"></div>
      <div class="itemTitle">Avvik og tiltak (TG2/TG3)</div>
      ${important.length ? important.map(o=>renderFindingLine(o)).join('') : '<div class="small">Ingen TG2/TG3 registrert.</div>'}

      <div class="hr"></div>
      <div class="itemTitle">Rapport-seksjoner (obligatorisk)</div>
      <div class="small">${(PROFILE.report_structure?.mandatory_sections||[]).join(' • ')}</div>

      <div class="hr"></div>
      <div class="small">Denne previewen er en mock. Full rapport-layout + vedlegg + grafer er neste steg, men bruker samme JSON.</div>
    </div>
  `;
}

function kpi(label, val){
  const cls = label==='TG3'?'danger':(label==='TG2'?'warn':'ok');
  return `<div class="kpi"><div class="small">${label}</div><div class="n">${val}</div><div class="badge ${cls}">status</div></div>`;
}

function distBar(counts, total){
  const pct = (n)=>Math.round((n/total)*100);
  return `
    <div class="card" style="margin-top:10px">
      <div class="small">TG0 ${pct(counts.TG0)}% • TG1 ${pct(counts.TG1)}% • TG2 ${pct(counts.TG2)}% • TG3 ${pct(counts.TG3)}%</div>
      <div class="bar" style="margin-top:10px"><div style="width:${Math.min(100, pct(counts.TG2)+pct(counts.TG3))}%"></div></div>
      <div class="small" style="margin-top:8px">(Baren viser andel TG2+TG3)</div>
    </div>
  `;
}

function renderFindingLine(o){
  const ci = STATE.checklist_items.find(x=>x.checklist_item_id===o.checklist_item_id);
  const title = ci ? ci.title : o.checklist_item_id;
  return `
    <div class="card" style="margin:10px 0">
      <div class="sectionTitle">
        <div class="itemTitle">${escapeHtml(title)}</div>
        <div class="tgPill" data-tg="${o.tg}"><span class="dot"></span>${o.tg}</div>
      </div>
      ${o.finding ? `<div><b>Funn:</b> ${escapeHtml(o.finding)}</div>`:''}
      ${o.cause ? `<div><b>Årsak:</b> ${escapeHtml(o.cause)}</div>`:''}
      ${o.consequence ? `<div><b>Konsekvens:</b> ${escapeHtml(o.consequence)}</div>`:''}
      ${o.action ? `<div><b>Tiltak:</b> ${escapeHtml(o.action)}</div>`:''}
      <div class="small" style="margin-top:8px">observasjon_id: ${o.observation_id}</div>
    </div>
  `;
}

function escapeHtml(str){
  return String(str||'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

function setTab(tab){
  const map = {
    client: {btn: '[data-tab="client"]', view:'#viewClient'},
    inspector: {btn: '[data-tab="inspector"]', view:'#viewInspector'},
    preview: {btn: '[data-tab="preview"]', view:'#viewPreview'}
  };
  for(const k of Object.keys(map)){
    const b = $(map[k].btn);
    const v = $(map[k].view);
    if(k===tab){ b.classList.add('active'); v.hidden=false; }
    else { b.classList.remove('active'); v.hidden=true; }
  }
  if(tab==='client') {
    renderClient();
    wireRoomPickerControls();
  }
  if(tab==='inspector') renderInspector();
  if(tab==='preview') renderPreview();
}

async function boot(){
  // Show build marker (helps confirm correct files are deployed)
  const buildEl = document.getElementById('buildId');
  if(buildEl) buildEl.textContent = BUILD_ID;

  // Resolve JSON paths relative to the directory where app.js is served from.
  // This makes /takst/... deployments work even when the page lives in a sub-folder (e.g. /takst/2/).
  const scriptEl = document.querySelector('script[src*="js/app.js"]') || document.currentScript;
  const scriptBase = (()=>{
    try{
      const u = new URL(scriptEl?.src || window.location.href, window.location.href);
      return u.href.substring(0, u.href.lastIndexOf('/')+1);
    }catch(e){ return './'; }
  })();

  const resolvePath = (p)=>{
    try{ return new URL(p, scriptBase).href; }catch(e){ return p; }
  };

  const fetchJson = async (p) => {
    const url = resolvePath(p);
    const r = await fetch(url, {cache:'no-store'});
    if(!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r.json();
  };

  PROFILE = await fetchJson(PATHS.profile);
  RULES = await fetchJson(PATHS.rules).catch(()=>null);
  EXAMPLE = await fetchJson(PATHS.example);

  STATE = loadState();

  // Ensure mandatory scaffolding exists
  STATE.assignment = STATE.assignment || EXAMPLE.assignment;
  STATE.property = STATE.property || EXAMPLE.property;
  STATE.rooms = STATE.rooms || EXAMPLE.rooms || [];
  STATE.observations = STATE.observations || {};
  STATE.media = STATE.media || {};
  STATE.checklist_items = STATE.checklist_items || [];

  // Build checklist if empty
  if(!STATE.checklist_items.length) buildChecklist();

  // Tab click
  $$('.tab').forEach(btn=>{
    btn.onclick = () => setTab(btn.getAttribute('data-tab'));
  });

  // reset
  $('#btnReset').onclick = () => {
    localStorage.removeItem(LS_KEY);
    STATE = {
      assignment: EXAMPLE.assignment,
      property: EXAMPLE.property,
      rooms: EXAMPLE.rooms,
      checklist_items: [],
      observations: {},
      media: {},
      costs: {}
    };
    saveState();
    buildChecklist();
    toast('Demo nullstilt');
    setTab('client');
  };

  setTab('client');
  renderInspector();
  renderPreview();
}

boot();
