'use strict';

/* =========================================================
   Grundlagen, Helfer & Demo-Daten
   ========================================================= */

const STORAGE_KEY = 'awo-fuhrpark-demo-v1';
const DB_VERSION = 1;

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const MONTHS_SHORT = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const VEHICLE_STATUS = {
  available: { label: 'Verfügbar', badge: 'green' },
  in_use: { label: 'Unterwegs', badge: 'blue' },
  maintenance: { label: 'In Wartung', badge: 'amber' }
};

const BOOKING_STATUS = {
  planned: { label: 'Geplant', badge: 'blue' },
  active: { label: 'Aktiv', badge: 'green' },
  completed: { label: 'Abgeschlossen', badge: 'gray' },
  canceled: { label: 'Storniert', badge: 'red' }
};

const CATEGORY_META = {
  'Kraftstoff': { color: '#e2001a', icon: 'fuel' },
  'Laden': { color: '#0f8f8a', icon: 'zap' },
  'Wartung': { color: '#c27a00', icon: 'wrench' },
  'Versicherung': { color: '#2563eb', icon: 'shield' },
  'Kfz-Steuer': { color: '#7c3aed', icon: 'receipt' },
  'Sonstiges': { color: '#8993a2', icon: 'receipt' }
};

const COST_CATEGORIES = Object.keys(CATEGORY_META);
const VEHICLE_COLORS = ['#2563eb', '#0f766e', '#7c3aed', '#059669', '#e2600f', '#0891b2', '#4338ca', '#b45309', '#be123c', '#475569'];
const DRIVER_COLORS = ['#e2001a', '#0f766e', '#7c3aed', '#2563eb', '#b45309', '#be123c', '#0f8f8a', '#4338ca'];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const pad2 = (value) => String(value).padStart(2, '0');

function toISODate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function todayISO() {
  return toISODate(new Date());
}

function parseISODate(value) {
  if (!value) return new Date(NaN);
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

function parseISODateTime(value) {
  if (!value) return new Date(NaN);
  const [datePart, timePart = '00:00'] = String(value).split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0);
}

function addDays(isoDate, days) {
  const date = parseISODate(isoDate);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

function daysUntil(isoDate) {
  if (!isoDate) return null;
  const today = parseISODate(todayISO());
  const target = parseISODate(isoDate);
  return Math.round((target - today) / 86400000);
}

function formatNumber(value) {
  return new Intl.NumberFormat('de-DE').format(Number(value) || 0);
}

function formatDecimal(value, digits = 1) {
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(Number(value) || 0);
}

function formatMoney(value, digits = 0) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value) || 0);
}

function formatKm(value) {
  return `${formatNumber(value)} km`;
}

function formatDate(isoDate) {
  const date = parseISODate(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function formatDateShort(isoDate) {
  const date = parseISODate(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getDate()}. ${MONTHS_SHORT[date.getMonth()]}`;
}

function formatDateLong(isoDate) {
  const date = parseISODate(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function formatTime(value) {
  if (!value) return '—';
  return String(value).slice(11, 16);
}

function formatTimeRange(start, end) {
  if (!start || !end) return '—';
  return `${formatTime(start)}–${formatTime(end)} Uhr`;
}

function formatWeekRange(startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.getDate()}. ${MONTHS_SHORT[start.getMonth()]} ${start.getFullYear()} – ${end.getDate()}. ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${start.getDate()}. ${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()}. ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  }
  return `${start.getDate()}. – ${end.getDate()}. ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
}

function startOfWeekISO(isoDate) {
  const date = parseISODate(isoDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toISODate(date);
}

function durationMinutes(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((parseISODateTime(end) - parseISODateTime(start)) / 60000));
}

function humanDays(days) {
  if (days === null || days === undefined) return '';
  if (days === 0) return 'heute';
  if (days === 1) return 'morgen';
  if (days === -1) return 'gestern';
  if (days < 0) return `vor ${Math.abs(days)} Tagen`;
  return `in ${days} Tagen`;
}

function monthKey(isoDate) {
  return String(isoDate || '').slice(0, 7);
}

function lastMonths(count) {
  const now = new Date();
  const result = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    result.push({
      key: `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`,
      label: MONTHS_SHORT[date.getMonth()],
      longLabel: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
      year: date.getFullYear()
    });
  }
  return result;
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || '';
}

function shortName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || '';
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function escapeHtml(value) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, (char) => map[char]);
}

const esc = escapeHtml;

function hexToRgba(hex, alpha = 0.1) {
  let color = String(hex || '').replace('#', '').trim();
  if (color.length === 3) color = color.split('').map((char) => char + char).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(color)) return `rgba(120, 128, 140, ${alpha})`;
  const number = parseInt(color, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function icon(name, className = '') {
  return `<svg class="icon ${className}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

function uid(prefix = 'id') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function sortByDateAsc(items, field = 'start') {
  return [...items].sort((a, b) => String(a[field]).localeCompare(String(b[field])));
}

function sortByDateDesc(items, field = 'start') {
  return [...items].sort((a, b) => String(b[field]).localeCompare(String(a[field])));
}

const PAGES = [
  { route: 'dashboard', title: 'Dashboard', description: 'Überblick über Flotte, Buchungen und Hinweise', icon: 'grid' },
  { route: 'fahrzeuge', title: 'Fahrzeuge', description: 'Flotte, Standorte und Fahrzeugdetails', icon: 'car' },
  { route: 'buchungen', title: 'Buchungen', description: 'Fahrten planen und verwalten', icon: 'calendar' },
  { route: 'fahrtenbuch', title: 'Fahrtenbuch', description: 'Gefahrene Strecken und Kilometer', icon: 'book' },
  { route: 'wartung', title: 'Wartung & TÜV', description: 'Wartungsplan und Hauptuntersuchungen', icon: 'wrench' },
  { route: 'kosten', title: 'Kosten', description: 'Betriebskosten und Auswertungen', icon: 'receipt' },
  { route: 'fahrer', title: 'Fahrer:innen', description: 'Mitarbeitende und Führerscheine', icon: 'users' },
  { route: 'einstellungen', title: 'Einstellungen', description: 'Organisation, Daten und Demo', icon: 'settings' }
];

/* =========================================================
   Demo-Daten
   ========================================================= */
function buildSeedData() {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateAt = (offset) => {
    const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
    return toISODate(date);
  };
  const timeAt = (offset, time) => `${dateAt(offset)}T${time}`;
  const monthAt = (monthsBack, day) => {
    const date = new Date(base.getFullYear(), base.getMonth() - monthsBack, Math.min(day, 27));
    return toISODate(date);
  };

  const vehicles = [
    {
      id: 'v1', name: 'VW Caddy 5', plate: 'HB-AW 101', type: 'Pkw', fuel: 'Diesel', seats: 5,
      location: 'Kita Pusteblume', department: 'Kita', status: 'available', mileage: 48210,
      nextService: dateAt(45), tuv: dateAt(190), insurance: 'HUK-COBURG · SF 12',
      acquired: dateAt(-890), color: '#2563eb', notes: 'Kita-Fahrzeug, Kindersitzausstattung vorhanden.'
    },
    {
      id: 'v2', name: 'Ford Transit Custom', plate: 'HB-AW 204', type: 'Transporter', fuel: 'Diesel', seats: 6,
      location: 'Ambulante Pflege', department: 'Ambulante Pflege', status: 'in_use', mileage: 76340,
      nextService: dateAt(12), tuv: dateAt(38), insurance: 'VGH · Flottentarif',
      acquired: dateAt(-640), color: '#0f766e', notes: 'Medizinische Ausstattung und Wundversorgung an Bord.'
    },
    {
      id: 'v3', name: 'Mercedes Sprinter', plate: 'HB-AW 318', type: 'Transporter', fuel: 'Diesel', seats: 9,
      location: 'Seniorenzentrum', department: 'Seniorenzentrum', status: 'in_use', mileage: 112560,
      nextService: dateAt(60), tuv: dateAt(160), insurance: 'VGH · Flottentarif',
      acquired: dateAt(-1420), color: '#7c3aed', notes: 'Behindertengerechter Ausbau mit Rampe.'
    },
    {
      id: 'v4', name: 'VW ID.4', plate: 'HB-AW 42E', type: 'Pkw', fuel: 'Elektro', seats: 5,
      location: 'Verwaltung', department: 'Verwaltung', status: 'available', mileage: 21450,
      nextService: dateAt(90), tuv: dateAt(420), insurance: 'VGH · E-Flotte',
      acquired: dateAt(-430), color: '#059669', notes: 'Wallbox an der Verwaltung vorhanden.'
    },
    {
      id: 'v5', name: 'Renault Zoe', plate: 'HB-AW 77E', type: 'Pkw', fuel: 'Elektro', seats: 5,
      location: 'Tagespflege', department: 'Tagespflege', status: 'maintenance', mileage: 38900,
      nextService: dateAt(-3), tuv: dateAt(120), insurance: 'VGH · E-Flotte',
      acquired: dateAt(-760), color: '#e2600f', notes: 'Aktuell in der Werkstatt: Bremsenprüfung.'
    },
    {
      id: 'v6', name: 'Opel Vivaro', plate: 'HB-AW 512', type: 'Transporter', fuel: 'Diesel', seats: 6,
      location: 'Hauswirtschaft', department: 'Hauswirtschaft', status: 'available', mileage: 92780,
      nextService: dateAt(25), tuv: dateAt(-5), insurance: 'HUK-COBURG · Flottentarif',
      acquired: dateAt(-1180), color: '#0891b2', notes: 'Transportfahrzeug für Hauswirtschaft und Material.'
    },
    {
      id: 'v7', name: 'VW T6.1 Multivan', plate: 'HB-AW 606', type: 'Bus', fuel: 'Diesel', seats: 8,
      location: 'Seniorenzentrum', department: 'Seniorenzentrum', status: 'available', mileage: 68420,
      nextService: dateAt(120), tuv: dateAt(300), insurance: 'VGH · Flottentarif',
      acquired: dateAt(-980), color: '#4338ca', notes: 'Ausflugsfahrzeug mit acht Sitzplätzen.'
    },
    {
      id: 'v8', name: 'Fiat Ducato', plate: 'HB-AW 708', type: 'Transporter', fuel: 'Diesel', seats: 3,
      location: 'Begegnungsstätte', department: 'Begegnungsstätte', status: 'available', mileage: 145000,
      nextService: dateAt(70), tuv: dateAt(80), insurance: 'VGH · Flottentarif',
      acquired: dateAt(-1650), color: '#b45309', notes: 'Mittagstisch-Lieferfahrzeug mit Kühlbox.'
    }
  ];

  const drivers = [
    { id: 'd1', name: 'Maria Schmidt', role: 'Fuhrparkleitung', department: 'Verwaltung', phone: '0471 12345-30', email: 'm.schmidt@awo-bremerhaven.de', license: ['B'], status: 'available', color: '#e2001a' },
    { id: 'd2', name: 'Thomas Krüger', role: 'Fahrer Ambulante Pflege', department: 'Ambulante Pflege', phone: '0471 12345-41', email: 't.krueger@awo-bremerhaven.de', license: ['B', 'BE'], status: 'available', color: '#0f766e' },
    { id: 'd3', name: 'Aylin Yilmaz', role: 'Pflegefachkraft', department: 'Ambulante Pflege', phone: '0471 12345-47', email: 'a.yilmaz@awo-bremerhaven.de', license: ['B'], status: 'available', color: '#7c3aed' },
    { id: 'd4', name: 'Jan Petersen', role: 'Haustechnik & Fahrer', department: 'Hauswirtschaft', phone: '0471 12345-58', email: 'j.petersen@awo-bremerhaven.de', license: ['B', 'BE', 'C1'], status: 'available', color: '#2563eb' },
    { id: 'd5', name: 'Sabine Koch', role: 'Erzieherin', department: 'Kita Pusteblume', phone: '0471 12345-66', email: 's.koch@awo-bremerhaven.de', license: ['B'], status: 'available', color: '#b45309' },
    { id: 'd6', name: 'Michael Brandt', role: 'Fahrer Seniorenzentrum', department: 'Seniorenzentrum', phone: '0471 12345-71', email: 'm.brandt@awo-bremerhaven.de', license: ['B', 'D1'], status: 'available', color: '#0f8f8a' },
    { id: 'd7', name: 'Lena Hoffmann', role: 'Verwaltung', department: 'Verwaltung', phone: '0471 12345-33', email: 'l.hoffmann@awo-bremerhaven.de', license: ['B'], status: 'away', color: '#8993a2' }
  ];

  const bookings = [
    { id: 'b1', vehicleId: 'v2', driverId: 'd2', purpose: 'Hausbesuche Ambulante Pflege', start: timeAt(0, '08:00'), end: timeAt(0, '12:30'), status: 'active', startKm: 76340, endKm: null, notes: 'Tour Nord mit vier Hausbesuchen.' },
    { id: 'b2', vehicleId: 'v3', driverId: 'd6', purpose: 'Seniorenausflug Weserpromenade', start: timeAt(0, '09:30'), end: timeAt(0, '12:00'), status: 'active', startKm: 112560, endKm: null, notes: 'Gruppe mit sieben Bewohner:innen.' },
    { id: 'b3', vehicleId: 'v8', driverId: 'd4', purpose: 'Mittagstisch beliefern', start: timeAt(0, '11:00'), end: timeAt(0, '14:30'), status: 'planned', startKm: null, endKm: null, notes: 'Drei Ausgabestellen in Bremerhaven.' },
    { id: 'b4', vehicleId: 'v1', driverId: 'd5', purpose: 'Elternabend Kita Pusteblume', start: timeAt(0, '16:30'), end: timeAt(0, '19:00'), status: 'planned', startKm: null, endKm: null, notes: 'Material und Getränke transportieren.' },
    { id: 'b5', vehicleId: 'v4', driverId: 'd1', purpose: 'Termin Jugendamt', start: timeAt(1, '09:00'), end: timeAt(1, '11:00'), status: 'planned', startKm: null, endKm: null, notes: '' },
    { id: 'b6', vehicleId: 'v6', driverId: 'd4', purpose: 'Möbeltransport Begegnungsstätte', start: timeAt(1, '10:00'), end: timeAt(1, '14:00'), status: 'planned', startKm: null, endKm: null, notes: 'Vier Tische und Stühle aus dem Lager.' },
    { id: 'b7', vehicleId: 'v7', driverId: 'd6', purpose: 'Tagesausflug Havenwelten', start: timeAt(2, '09:00'), end: timeAt(2, '15:30'), status: 'planned', startKm: null, endKm: null, notes: 'Picknick ist gepackt.' },
    { id: 'b8', vehicleId: 'v2', driverId: 'd3', purpose: 'Pflegevisiten Lehe', start: timeAt(3, '08:30'), end: timeAt(3, '12:00'), status: 'planned', startKm: null, endKm: null, notes: '' },
    { id: 'b9', vehicleId: 'v1', driverId: 'd5', purpose: 'Kita-Ausflug Klimahaus', start: timeAt(3, '09:00'), end: timeAt(3, '13:00'), status: 'planned', startKm: null, endKm: null, notes: 'Kindergruppe mit 12 Kindern.' },
    { id: 'b10', vehicleId: 'v3', driverId: 'd6', purpose: 'Seniorennachmittag', start: timeAt(4, '10:00'), end: timeAt(4, '15:00'), status: 'planned', startKm: null, endKm: null, notes: '' },
    { id: 'b11', vehicleId: 'v4', driverId: 'd1', purpose: 'Fortbildung', start: timeAt(5, '09:00'), end: timeAt(5, '11:00'), status: 'planned', startKm: null, endKm: null, notes: 'Seminar in der Verwaltung.' },
    { id: 'b12', vehicleId: 'v6', driverId: 'd4', purpose: 'Veranstaltungslogistik', start: timeAt(6, '13:00'), end: timeAt(6, '17:00'), status: 'planned', startKm: null, endKm: null, notes: '' },
    { id: 'b13', vehicleId: 'v2', driverId: 'd5', purpose: 'Elternsprechtag', start: timeAt(4, '14:00'), end: timeAt(4, '16:00'), status: 'canceled', startKm: null, endKm: null, notes: 'Termin wurde verlegt.' },
    { id: 'b14', vehicleId: 'v1', driverId: 'd5', purpose: 'Ausflug Kindergruppe', start: timeAt(-2, '09:00'), end: timeAt(-2, '13:00'), status: 'completed', startKm: 48105, endKm: 48162, notes: 'Ausflug zum Spielplatz Leherheide.' },
    { id: 'b15', vehicleId: 'v3', driverId: 'd6', purpose: 'Seniorenausflug Fischereihafen', start: timeAt(-3, '08:30'), end: timeAt(-3, '12:00'), status: 'completed', startKm: 112340, endKm: 112430, notes: '' },
    { id: 'b16', vehicleId: 'v2', driverId: 'd2', purpose: 'Hausbesuche und Wundversorgung', start: timeAt(-4, '07:45'), end: timeAt(-4, '12:15'), status: 'completed', startKm: 76180, endKm: 76305, notes: '' },
    { id: 'b17', vehicleId: 'v6', driverId: 'd4', purpose: 'Materialtransport', start: timeAt(-5, '10:00'), end: timeAt(-5, '15:00'), status: 'completed', startKm: 92320, endKm: 92445, notes: 'Material für die Begegnungsstätte.' },
    { id: 'b18', vehicleId: 'v4', driverId: 'd1', purpose: 'Dienstbesprechung', start: timeAt(-7, '08:00'), end: timeAt(-7, '10:30'), status: 'completed', startKm: 21280, endKm: 21320, notes: '' },
    { id: 'b19', vehicleId: 'v7', driverId: 'd6', purpose: 'Ausflug Butjadingen', start: timeAt(-9, '09:00'), end: timeAt(-9, '16:00'), status: 'completed', startKm: 68210, endKm: 68385, notes: '' },
    { id: 'b20', vehicleId: 'v8', driverId: 'd4', purpose: 'Mittagstisch beliefern', start: timeAt(-11, '10:00'), end: timeAt(-11, '13:30'), status: 'completed', startKm: 144210, endKm: 144305, notes: '' },
    { id: 'b21', vehicleId: 'v1', driverId: 'd3', purpose: 'Kita-Fahrdienst', start: timeAt(-13, '08:00'), end: timeAt(-13, '11:30'), status: 'completed', startKm: 48040, endKm: 48105, notes: '' },
    { id: 'b22', vehicleId: 'v5', driverId: 'd3', purpose: 'Tagespflege Fahrdienst', start: timeAt(-16, '07:30'), end: timeAt(-16, '09:30'), status: 'completed', startKm: 38540, endKm: 38595, notes: '' },
    { id: 'b23', vehicleId: 'v6', driverId: 'd2', purpose: 'Werkstattfahrt', start: timeAt(-18, '12:00'), end: timeAt(-18, '16:00'), status: 'completed', startKm: 92180, endKm: 92320, notes: '' },
    { id: 'b24', vehicleId: 'v2', driverId: 'd2', purpose: 'Pflegevisiten', start: timeAt(-21, '07:45'), end: timeAt(-21, '12:30'), status: 'completed', startKm: 76010, endKm: 76180, notes: '' },
    { id: 'b25', vehicleId: 'v3', driverId: 'd6', purpose: 'Seniorennachmittag', start: timeAt(-24, '09:00'), end: timeAt(-24, '15:00'), status: 'completed', startKm: 112180, endKm: 112340, notes: '' },
    { id: 'b26', vehicleId: 'v4', driverId: 'd1', purpose: 'Behördengang', start: timeAt(-28, '10:00'), end: timeAt(-28, '12:00'), status: 'completed', startKm: 21220, endKm: 21280, notes: '' },
    { id: 'b27', vehicleId: 'v7', driverId: 'd6', purpose: 'Tagesausflug Cuxhaven', start: timeAt(-32, '08:30'), end: timeAt(-32, '17:00'), status: 'completed', startKm: 67980, endKm: 68210, notes: '' }
  ];

  const maintenance = [
    { id: 'm1', vehicleId: 'v5', title: 'Bremsanlage prüfen', dueDate: dateAt(-2), workshop: 'Autohaus Nord', cost: 450, status: 'open', notes: 'Quietschen an der Vorderachse.' },
    { id: 'm2', vehicleId: 'v2', title: 'Inspektion 75.000 km', dueDate: dateAt(12), workshop: 'Ford Partner Bremerhaven', cost: 390, status: 'planned', notes: '' },
    { id: 'm3', vehicleId: 'v7', title: 'Reifenwechsel Winter', dueDate: dateAt(21), workshop: 'Reifenservice Bremerhaven', cost: 180, status: 'planned', notes: 'Satz Winterreifen im Lager.' },
    { id: 'm4', vehicleId: 'v4', title: 'Reifenwechsel Winter', dueDate: dateAt(30), workshop: 'Reifenservice Bremerhaven', cost: 160, status: 'planned', notes: '' },
    { id: 'm5', vehicleId: 'v3', title: 'Klimaanlagen-Service', dueDate: dateAt(-22), workshop: 'Autohaus Nord', cost: 289, status: 'done', completedAt: dateAt(-22), notes: '' },
    { id: 'm6', vehicleId: 'v1', title: 'Inspektion 45.000 km', dueDate: dateAt(-48), workshop: 'VW Service Bremerhaven', cost: 340, status: 'done', completedAt: dateAt(-48), notes: '' }
  ];

  const costs = [];
  let costCounter = 1;
  const addCost = (vehicleId, date, category, amount, note) => {
    costs.push({ id: `c${costCounter++}`, vehicleId, date, category, amount, note });
  };

  addCost('v2', dateAt(-2), 'Kraftstoff', 84.60, 'Diesel · 54,2 l');
  addCost('v3', dateAt(-4), 'Kraftstoff', 102.30, 'Diesel · 65,5 l');
  addCost('v8', dateAt(-6), 'Kraftstoff', 91.80, 'Diesel · 58,7 l');
  addCost('v5', dateAt(-8), 'Laden', 24.50, 'AC-Laden · 106 kWh');
  addCost('v4', dateAt(-9), 'Laden', 18.90, 'AC-Laden · 78 kWh');
  addCost('v6', dateAt(-12), 'Sonstiges', 49.90, 'Innen- und Außenreinigung');
  addCost('v7', dateAt(-14), 'Kraftstoff', 88.40, 'Diesel · 56,4 l');
  addCost('v1', dateAt(-16), 'Kraftstoff', 62.70, 'Diesel · 40,1 l');

  addCost('v2', monthAt(1, 4), 'Kraftstoff', 92.10, 'Diesel · 58,9 l');
  addCost('v3', monthAt(1, 8), 'Kraftstoff', 110.50, 'Diesel · 70,2 l');
  addCost('v6', monthAt(1, 12), 'Kraftstoff', 76.30, 'Diesel · 48,7 l');
  addCost('v7', monthAt(1, 16), 'Kraftstoff', 83.70, 'Diesel · 53,5 l');
  addCost('v4', monthAt(1, 20), 'Laden', 21.30, 'AC-Laden · 89 kWh');
  addCost('v5', monthAt(1, 24), 'Laden', 27.10, 'AC-Laden · 112 kWh');
  addCost('v1', monthAt(1, 15), 'Wartung', 340.00, 'Inspektion 45.000 km');
  addCost('v2', monthAt(1, 2), 'Versicherung', 214.30, 'Kfz-Versicherung · Quartal');

  addCost('v2', monthAt(2, 6), 'Kraftstoff', 89.00, 'Diesel · 57,1 l');
  addCost('v8', monthAt(2, 10), 'Kraftstoff', 95.80, 'Diesel · 61,3 l');
  addCost('v1', monthAt(2, 14), 'Kraftstoff', 71.40, 'Diesel · 45,8 l');
  addCost('v5', monthAt(2, 18), 'Laden', 22.80, 'AC-Laden · 95 kWh');
  addCost('v3', monthAt(2, 21), 'Wartung', 289.00, 'Klimaanlagen-Service');
  addCost('v7', monthAt(2, 3), 'Versicherung', 198.50, 'Kfz-Versicherung · Quartal');

  addCost('v2', monthAt(3, 5), 'Kraftstoff', 86.20, 'Diesel · 55,3 l');
  addCost('v3', monthAt(3, 9), 'Kraftstoff', 98.70, 'Diesel · 63,2 l');
  addCost('v6', monthAt(3, 13), 'Kraftstoff', 74.60, 'Diesel · 47,9 l');
  addCost('v7', monthAt(3, 17), 'Kraftstoff', 90.10, 'Diesel · 57,8 l');
  addCost('v4', monthAt(3, 22), 'Laden', 19.80, 'AC-Laden · 83 kWh');
  addCost('v8', monthAt(3, 2), 'Versicherung', 209.70, 'Kfz-Versicherung · Quartal');
  addCost('v6', monthAt(3, 4), 'Kfz-Steuer', 156.00, 'Kfz-Steuer Jahresbeitrag');

  addCost('v2', monthAt(4, 7), 'Kraftstoff', 90.40, 'Diesel · 58,1 l');
  addCost('v3', monthAt(4, 11), 'Kraftstoff', 101.20, 'Diesel · 64,8 l');
  addCost('v8', monthAt(4, 15), 'Kraftstoff', 87.60, 'Diesel · 56,2 l');
  addCost('v5', monthAt(4, 19), 'Laden', 26.40, 'AC-Laden · 110 kWh');
  addCost('v1', monthAt(4, 24), 'Kraftstoff', 68.90, 'Diesel · 44,0 l');
  addCost('v4', monthAt(4, 26), 'Wartung', 160.00, 'Reifenwechsel und Auswuchten');

  addCost('v2', monthAt(5, 8), 'Kraftstoff', 88.30, 'Diesel · 56,8 l');
  addCost('v3', monthAt(5, 12), 'Kraftstoff', 96.40, 'Diesel · 61,5 l');
  addCost('v6', monthAt(5, 16), 'Kraftstoff', 79.50, 'Diesel · 50,9 l');
  addCost('v4', monthAt(5, 20), 'Laden', 20.60, 'AC-Laden · 86 kWh');
  addCost('v1', monthAt(5, 24), 'Kraftstoff', 69.80, 'Diesel · 44,6 l');
  addCost('v8', monthAt(5, 27), 'Kraftstoff', 93.20, 'Diesel · 59,6 l');

  return {
    meta: { version: DB_VERSION, seededAt: todayISO() },
    settings: {
      orgName: 'AWO Bremerhaven',
      location: 'Bremerhaven',
      email: 'fuhrpark@awo-bremerhaven.de',
      phone: '0471 12345-30'
    },
    notificationReads: [],
    vehicles,
    drivers,
    bookings,
    maintenance,
    costs
  };
}
