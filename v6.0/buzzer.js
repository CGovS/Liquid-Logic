/* =====================================================
   LIQUID LOGIC v6.0 — Phone Buzzer Client
   -----------------------------------------------------
   Connects to the LAN buzzer server, lets a player pick a
   team, and sends "buzz" events. The host engine decides
   validity (phase / freeze / lock); this client just
   reflects the state the host broadcasts.
   ===================================================== */

(() => {
  const TEAM_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];

  const els = {
    dot: document.getElementById('conn-dot'),
    connText: document.getElementById('conn-text'),
    picker: document.getElementById('team-picker'),
    grid: document.getElementById('team-grid'),
    buzzArea: document.getElementById('buzz-area'),
    myTeam: document.getElementById('my-team-name'),
    btn: document.getElementById('buzz-btn'),
    status: document.getElementById('status'),
    change: document.getElementById('change-team'),
  };

  const state = {
    teams: [],                // [{i, name, color}]
    myTeam: null,             // chosen team index
    phase: 'IDLE',            // IDLE | READING | OPEN | ANSWERING | RESOLVED
    lockedTeams: [],
    frozenUntil: {},          // { teamIdx: epochMs }
    buzzedTeam: -1,
    hostOnline: false,
  };

  // Remember team choice across reconnects / refreshes.
  try {
    const saved = localStorage.getItem('llBuzzerTeam');
    if (saved !== null) state.myTeam = parseInt(saved, 10);
  } catch (e) {}

  // ── WebSocket ───────────────────────────────────────
  let ws = null;
  let reconnectTimer = null;

  function wsURL() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${location.host}/ws`;
  }

  function connect() {
    ws = new WebSocket(wsURL());

    ws.onopen = () => {
      setConn(true, 'Connected');
      send({ type: 'phone_hello' });
    };
    ws.onclose = () => {
      setConn(false, 'Reconnecting…');
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 1500);
    };
    ws.onerror = () => { try { ws.close(); } catch (e) {} };
    ws.onmessage = (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch (e) { return; }
      handle(msg);
    };
  }

  function send(obj) {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }

  function handle(msg) {
    switch (msg.type) {
      case 'state':
        state.teams = msg.teams || state.teams;
        state.phase = msg.phase ?? state.phase;
        state.lockedTeams = msg.lockedTeams || [];
        state.frozenUntil = msg.frozenUntil || {};
        state.buzzedTeam = msg.buzzedTeam ?? -1;
        state.hostOnline = true;
        renderTeams();
        renderBuzz();
        break;
      case 'host_online':
        state.hostOnline = true;
        break;
      case 'host_offline':
        state.hostOnline = false;
        state.phase = 'IDLE';
        renderBuzz();
        break;
    }
  }

  // ── Connection indicator ────────────────────────────
  function setConn(online, text) {
    els.dot.className = 'dot ' + (online ? 'online' : 'offline');
    els.connText.textContent = text;
  }

  // ── Team picker ─────────────────────────────────────
  function renderTeams() {
    if (!state.teams.length) {
      els.grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;opacity:.6">Waiting for the host to start a game…</p>';
      return;
    }
    els.grid.innerHTML = '';
    state.teams.forEach(t => {
      const color = t.color || TEAM_COLORS[t.i % TEAM_COLORS.length];
      const b = document.createElement('button');
      b.className = 'team-opt';
      b.style.setProperty('--c', color);
      b.style.color = color;
      b.textContent = t.name;
      b.addEventListener('click', () => chooseTeam(t.i));
      els.grid.appendChild(b);
    });
    // If we already had a team saved, jump straight to the buzzer.
    if (state.myTeam !== null && state.teams.some(t => t.i === state.myTeam)) {
      showBuzzer();
    }
  }

  function chooseTeam(i) {
    state.myTeam = i;
    try { localStorage.setItem('llBuzzerTeam', String(i)); } catch (e) {}
    showBuzzer();
    renderBuzz();
  }

  function teamName(i) {
    const t = state.teams.find(x => x.i === i);
    return t ? t.name : `Team ${i + 1}`;
  }
  function teamColor(i) {
    const t = state.teams.find(x => x.i === i);
    return (t && t.color) || TEAM_COLORS[i % TEAM_COLORS.length];
  }

  function showBuzzer() {
    els.picker.style.display = 'none';
    els.buzzArea.style.display = 'flex';
    els.myTeam.textContent = teamName(state.myTeam);
    els.myTeam.style.color = teamColor(state.myTeam);
  }

  els.change.addEventListener('click', () => {
    els.picker.style.display = 'block';
    els.buzzArea.style.display = 'none';
  });

  // ── Buzzer button state machine ─────────────────────
  let freezeTicker = null;

  function renderBuzz() {
    if (state.myTeam === null) return;
    clearInterval(freezeTicker);

    const btn = els.btn;
    btn.className = 'buzz-btn';
    btn.disabled = false;

    if (!state.hostOnline) {
      btn.classList.add('locked'); btn.textContent = 'BUZZ';
      els.status.textContent = 'Waiting for host…';
      return;
    }

    const locked = state.lockedTeams.includes(state.myTeam);
    const frozenUntil = state.frozenUntil[state.myTeam] || 0;
    const now = Date.now();

    if (locked) {
      btn.classList.add('locked'); btn.textContent = 'OUT';
      els.status.textContent = 'You already answered this clue.';
      return;
    }

    switch (state.phase) {
      case 'READING':
        btn.classList.add('warn'); btn.textContent = 'WAIT';
        els.status.textContent = 'Reading… buzzing now = 2s freeze!';
        break;

      case 'OPEN':
        if (now < frozenUntil) {
          btn.classList.add('locked'); btn.textContent = 'FROZEN';
          tickFreeze(frozenUntil);
        } else {
          btn.classList.add('armed'); btn.textContent = 'BUZZ!';
          els.status.textContent = 'Buzzers open — go!';
        }
        break;

      case 'ANSWERING':
        if (state.buzzedTeam === state.myTeam) {
          btn.classList.add('mine'); btn.textContent = "YOU'RE UP";
          els.status.textContent = 'Answer out loud!';
        } else {
          btn.classList.add('locked'); btn.textContent = 'LOCKED';
          els.status.textContent = `${teamName(state.buzzedTeam)} is answering…`;
        }
        break;

      default: // IDLE / RESOLVED
        btn.classList.add('locked'); btn.textContent = 'BUZZ';
        els.status.textContent = 'Waiting for the next clue…';
    }
  }

  function tickFreeze(until) {
    const update = () => {
      const left = Math.max(0, until - Date.now());
      if (left <= 0) { clearInterval(freezeTicker); renderBuzz(); return; }
      els.status.textContent = `Frozen for ${(left / 1000).toFixed(1)}s (buzzed early)`;
    };
    update();
    freezeTicker = setInterval(update, 100);
  }

  // ── Buzz! ───────────────────────────────────────────
  function doBuzz() {
    if (state.myTeam === null || !state.hostOnline) return;
    // Send regardless of phase: the host decides (early buzz = freeze,
    // open = race, locked = ignored) — same rules as the keyboard path.
    send({ type: 'buzz', team: state.myTeam });
    if (navigator.vibrate) navigator.vibrate(40);
  }
  els.btn.addEventListener('click', doBuzz);

  // Re-evaluate frozen state when the tab regains focus.
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderBuzz(); });

  renderTeams();
  connect();
})();
