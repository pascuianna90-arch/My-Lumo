const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const SEED_FILE = path.join(ROOT, 'data', 'state.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(STATE_FILE) && fs.existsSync(SEED_FILE)) fs.copyFileSync(SEED_FILE, STATE_FILE);
const PAYMENTS_ENABLED = String(process.env.PAYMENTS_ENABLED || 'false').toLowerCase() === 'true';

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch (e) { console.error('State load failed:', e); process.exit(1); }
}
let state = loadState();

function saveState() {
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, STATE_FILE);
}

function sendJson(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50_000) { reject(new Error('Payload too large')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const blocked = [
  /\b(kill|murder|suicide|rape|porn|nude|sex)\b/i,
  /\b(öld|ölj|megöl|öngyilk|pornó|meztelen|szex)\b/i,
  /\b(ucide|omor|sinuc|porno|sex)\b/i
];

function normalize(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function detectAction(command) {
  const s = normalize(command);
  const has = (...terms) => terms.some(t => s.includes(normalize(t)));
  if (has('pizza', 'egyél', 'enni', 'eat pizza', 'mananca pizza')) return 'pizza';
  if (has('tánc', 'dance', 'danseaza', 'dansează')) return 'dance';
  if (has('város', 'city', 'oras', 'oraș')) return 'city';
  if (has('autó', 'car', 'masina', 'mașina', 'kocsi')) return 'car';
  if (has('kutya', 'dog', 'caine', 'câine', 'barátkozz', 'friend')) return 'friend';
  if (has('tenger', 'beach', 'plaja', 'plajă')) return 'beach';
  if (has('ház', 'house', 'casa', 'casă', 'építs', 'build')) return 'house';
  if (has('csirke', 'chicken', 'pui')) return 'chicken';
  if (has('kalap', 'hat', 'palaria', 'pălărie', 'öltözz', 'dress', 'ruha')) return 'dress';
  if (has('gitár', 'guitar', 'chitara', 'chitară')) return 'guitar';
  if (has('aludj', 'sleep', 'dormi')) return 'sleep';
  if (has('hegy', 'mountain', 'munte')) return 'mountain';
  if (has('erdő', 'forest', 'padure', 'pădure')) return 'forest';
  if (has('otthon', 'home', 'acasa', 'acasă')) return 'home';
  return 'explore';
}

function actionDuration(action) {
  return ({ pizza: 4300, dance: 3800, city: 5200, car: 5000, friend: 4700, beach: 5200,
    house: 6200, chicken: 4300, dress: 3600, guitar: 4200, sleep: 5000,
    mountain: 5200, forest: 4200, home: 4200, explore: 4000 })[action] || 4000;
}

function safePushUnique(arr, value) {
  if (!arr.includes(value)) arr.push(value);
}
function addWorldChange(text) {
  state.lumo.worldChanges.unshift(text);
  state.lumo.worldChanges = state.lumo.worldChanges.slice(0, 30);
}

function applyAction(item) {
  const l = state.lumo;
  switch (item.action) {
    case 'pizza': l.mood = 'Boldog'; safePushUnique(l.inventory, 'Pizza'); l.lastAction = 'Lumo megette a pizzát.'; addWorldChange('Lumo evett egy pizzát.'); break;
    case 'dance': l.mood = 'Vidám'; l.lastAction = 'Lumo táncolt.'; addWorldChange('Lumo táncolt egyet.'); break;
    case 'city': l.location = 'Város'; l.lastAction = 'Lumo megérkezett a városba.'; addWorldChange('Lumo az erdőből a városba ment.'); break;
    case 'car': safePushUnique(l.inventory, 'Piros autó'); l.lastAction = 'Lumo vett egy piros autót.'; addWorldChange('Lumo mostantól egy piros autó tulajdonosa.'); break;
    case 'friend': safePushUnique(l.inventory, 'Kutyabarát'); l.mood = 'Nagyon boldog'; l.lastAction = 'Lumo összebarátkozott egy kutyával.'; addWorldChange('Lumo új barátot szerzett: egy kutyát.'); break;
    case 'beach': l.location = 'Tengerpart'; safePushUnique(l.inventory, 'Napszemüveg'); l.lastAction = 'Lumo megérkezett a tengerpartra.'; addWorldChange('Lumo elment a tengerpartra.'); break;
    case 'house': l.location = 'Otthon'; safePushUnique(l.inventory, 'Saját ház'); l.lastAction = 'Lumo felépítette a saját házát.'; addWorldChange('Lumo felépített egy házat, ami megmarad a világban.'); break;
    case 'chicken': safePushUnique(l.inventory, 'Csirke'); l.lastAction = 'Lumo vett egy csirkét.'; addWorldChange('Lumohoz költözött egy csirke.'); break;
    case 'dress': safePushUnique(l.inventory, 'Piros sapka'); l.lastAction = 'Lumo átöltözött.'; addWorldChange('Lumo új ruhát vett fel.'); break;
    case 'guitar': safePushUnique(l.inventory, 'Gitár'); l.mood = 'Vidám'; l.lastAction = 'Lumo gitározott.'; addWorldChange('Lumo megtanult gitározni.'); break;
    case 'sleep': l.location = 'Otthon'; l.mood = 'Kipihent'; l.lastAction = 'Lumo aludt egy nagyot.'; addWorldChange('Lumo kipihente magát.'); break;
    case 'mountain': l.location = 'Hegyek'; l.lastAction = 'Lumo felment a hegyekbe.'; addWorldChange('Lumo felfedezi a hegyeket.'); break;
    case 'forest': l.location = 'Erdő'; l.lastAction = 'Lumo visszament az erdőbe.'; addWorldChange('Lumo visszatért az erdőbe.'); break;
    case 'home': l.location = 'Otthon'; l.lastAction = 'Lumo hazament.'; addWorldChange('Lumo hazament.'); break;
    default: l.mood = 'Kíváncsi'; l.lastAction = `Lumo teljesítette: ${item.command}`; addWorldChange(`Új parancs teljesítve: ${item.command}`);
  }
  l.followers += 1;
  const completed = state.history.length + 1;
  l.level = 12 + Math.floor(completed / 10);
}

function findCommand(id) {
  const n = Number(id);
  if (state.current && state.current.id === n) return state.current;
  const q = state.queue.find(x => x.id === n); if (q) return q;
  const h = state.history.find(x => x.id === n); if (h) return h;
  return null;
}

setInterval(() => {
  const now = Date.now();
  if (!state.current && state.queue.length) {
    state.current = state.queue.shift();
    state.current.status = 'processing';
    state.current.startedAt = now;
    state.current.completeAt = now + actionDuration(state.current.action);
    saveState();
    return;
  }
  if (state.current && now >= state.current.completeAt) {
    const done = state.current;
    applyAction(done);
    done.status = 'done';
    done.completedAt = now;
    delete done.startedAt;
    delete done.completeAt;
    state.history.unshift(done);
    state.history = state.history.slice(0, 100);
    state.current = null;
    saveState();
  }
}, 300);

const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

function serveStatic(req, res, pathname) {
  let rel = pathname === '/' ? '/index.html' : pathname;
  rel = decodeURIComponent(rel).replace(/\\/g, '/');
  const filePath = path.normalize(path.join(PUBLIC, rel));
  if (!filePath.startsWith(PUBLIC)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600' });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = u.pathname;
  if (p === '/health') return sendJson(res, 200, { ok: true, app: 'My Lumo' });
  if (p === '/api/config' && req.method === 'GET') return sendJson(res, 200, { commandCost: 2, paymentsEnabled: PAYMENTS_ENABLED });
  if (p === '/api/state' && req.method === 'GET') return sendJson(res, 200, state);
  if (p === '/api/history' && req.method === 'GET') return sendJson(res, 200, { history: state.history });
  if (p.startsWith('/api/command/') && req.method === 'GET') {
    const item = findCommand(p.split('/').pop());
    return item ? sendJson(res, 200, item) : sendJson(res, 404, { error: 'Parancs nem található.' });
  }
  if (p === '/api/command' && req.method === 'POST') {
    try {
      const body = await readJson(req);
      const command = String(body.command || '').trim();
      if (command.length < 2 || command.length > 140) return sendJson(res, 400, { error: 'A parancs 2–140 karakter lehet.' });
      if (blocked.some(rx => rx.test(command))) return sendJson(res, 400, { error: 'Ezt a parancsot Lumo nem hajtja végre. Csak biztonságos, pozitív parancsok engedélyezettek.' });
      const item = {
        id: state.nextId++,
        country: String(body.country || '🌍 Világ').slice(0, 40),
        command,
        action: detectAction(command),
        status: 'queued',
        createdAt: new Date().toISOString()
      };
      state.queue.push(item);
      saveState();
      return sendJson(res, 201, { ...item, queuePosition: state.queue.length + (state.current ? 1 : 0) });
    } catch (e) { return sendJson(res, 400, { error: e.message || 'Hibás kérés.' }); }
  }
  return serveStatic(req, res, p);
});

server.listen(PORT, '0.0.0.0', () => console.log(`My Lumo running on http://0.0.0.0:${PORT}`));
