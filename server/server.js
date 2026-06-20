/* =====================================================
   LIQUID LOGIC v6.0 — LAN Buzzer Server
   -----------------------------------------------------
   A tiny local server that:
     1. Serves the game files (the v6.0/ folder) over your LAN.
     2. Relays buzzer events between the HOST screen and
        player PHONES over WebSocket.
     3. Prints a QR code + URL so phones on the same WiFi
        can join instantly.

   The host engine stays authoritative: phones just send
   "buzz" messages; the host decides validity (phase /
   freeze / lock) exactly like the keyboard path. The
   server is a dumb relay + connection registry.

   Run:   npm install && npm start
   ===================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer } = require('ws');

let qrcode = null;
try { qrcode = require('qrcode-terminal'); } catch (e) { /* optional */ }

let qrImage = null;
try { qrImage = require('qrcode'); } catch (e) { /* optional: enables /qr.svg */ }

const PORT = process.env.PORT || 8090;
// Game files live one level up, in the v6.0/ folder.
const ROOT = path.join(__dirname, '..', 'v6.0');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml',
};

// ── Static file server ───────────────────────────────
const httpServer = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  // Health check so the host page can detect "server is on".
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, version: '6.0' }));
    return;
  }

  // Tell the host page its LAN-reachable buzzer URL (NOT localhost),
  // so the QR / displayed link works from phones.
  if (pathname === '/whoami') {
    const addrs = lanAddresses();
    const primary = addrs[0] || 'localhost';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      port: PORT,
      addresses: addrs,
      hostUrl: `http://${primary}:${PORT}/`,
      buzzerUrl: `http://${primary}:${PORT}/buzzer`,
    }));
    return;
  }

  // Server-rendered QR (requires optional "qrcode" dep). Host page
  // falls back to a plain text link if this 404s.
  if (pathname === '/qr.svg') {
    const text = url.searchParams.get('text') || '';
    if (!qrImage || !text) { res.writeHead(404); res.end('no qr'); return; }
    qrImage.toString(text, { type: 'svg', margin: 1, width: 320 }, (err, svg) => {
      if (err) { res.writeHead(500); res.end('qr error'); return; }
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      res.end(svg);
    });
    return;
  }

  if (pathname === '/' || pathname === '') pathname = '/index.html';
  // The phone buzzer client.
  if (pathname === '/buzzer') pathname = '/buzzer.html';

  // Prevent path traversal.
  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// ── WebSocket relay ──────────────────────────────────
// Single implicit room (one host per LAN server). The host
// connects as role=host; phones connect as role=buzzer.
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

let hostSocket = null;
const phones = new Set();

function sendJSON(ws, obj) {
  if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}
function broadcastPhones(obj) {
  const msg = JSON.stringify(obj);
  phones.forEach(ws => { if (ws.readyState === ws.OPEN) ws.send(msg); });
}

wss.on('connection', (ws) => {
  ws.role = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch (e) { return; }

    switch (msg.type) {
      case 'host_hello':
        // The board screen identifies itself and claims the room.
        ws.role = 'host';
        hostSocket = ws;
        // Tell phones the host is online so they can (re)register.
        broadcastPhones({ type: 'host_online' });
        break;

      case 'phone_hello':
        ws.role = 'buzzer';
        phones.add(ws);
        // Ask the host to push the current roster + phase to this phone.
        sendJSON(hostSocket, { type: 'phone_joined' });
        break;

      case 'state':
        // Host pushes phase / teams / locks / freezes → fan out to phones.
        if (ws.role === 'host') broadcastPhones(msg);
        break;

      case 'buzz':
        // Phone buzzes → relay to host (host engine decides validity).
        if (ws.role === 'buzzer') sendJSON(hostSocket, { type: 'buzz', team: msg.team });
        break;

      default:
        break;
    }
  });

  ws.on('close', () => {
    if (ws.role === 'host' && hostSocket === ws) {
      hostSocket = null;
      broadcastPhones({ type: 'host_offline' });
    }
    phones.delete(ws);
  });
});

// ── LAN address discovery ────────────────────────────
function lanAddresses() {
  const out = [];
  const ifaces = os.networkInterfaces();
  Object.values(ifaces).forEach(list => {
    (list || []).forEach(i => {
      if (i.family === 'IPv4' && !i.internal) out.push(i.address);
    });
  });
  return out;
}

httpServer.listen(PORT, () => {
  const addrs = lanAddresses();
  const primary = addrs[0] || 'localhost';
  const hostUrl = `http://${primary}:${PORT}/`;
  const buzzerUrl = `http://${primary}:${PORT}/buzzer`;

  console.log('\n=====================================================');
  console.log('  LIQUID LOGIC v6.0 — LAN Buzzer Server is running');
  console.log('=====================================================\n');
  console.log(`  HOST (open on the TV / main screen):`);
  console.log(`    ${hostUrl}\n`);
  console.log(`  PLAYERS (open on phones, same WiFi):`);
  console.log(`    ${buzzerUrl}\n`);
  if (addrs.length > 1) {
    console.log('  Other addresses detected:');
    addrs.slice(1).forEach(a => console.log(`    http://${a}:${PORT}/buzzer`));
    console.log('');
  }
  if (qrcode) {
    console.log('  Scan to join as a player:\n');
    qrcode.generate(buzzerUrl, { small: true });
  } else {
    console.log('  (Install "qrcode-terminal" to print a scannable QR here.)');
  }
  console.log('\n  Press Ctrl+C to stop the server.\n');
});
