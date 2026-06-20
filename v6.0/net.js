/* =====================================================
   LIQUID LOGIC v6.0 — Host Buzzer Networking
   -----------------------------------------------------
   Runs on the HOST screen (the board). Connects to the LAN
   buzzer server, advertises the join QR/link, broadcasts
   game state to phones, and feeds incoming phone buzzes
   into the existing engine via app.handleBuzz().

   The engine stays authoritative — this module never
   decides buzz validity, it just relays. When no server is
   reachable (e.g. static GitHub Pages), this stays dormant
   and the game falls back to keyboard + moderated play.
   ===================================================== */

export class BuzzerHost {
  constructor(app) {
    this.app = app;
    this.ws = null;
    this.enabled = false;
    this.connected = false;
    this.serverAvailable = false;
    this.buzzerUrl = '';
    this._reconnect = null;
    this._onBuzz = (team) => this.app.handleBuzz(team);
  }

  // Is a local buzzer server reachable from this page?
  async probe() {
    try {
      const r = await fetch('/health', { cache: 'no-store' });
      const j = await r.json();
      this.serverAvailable = !!j.ok;
    } catch (e) {
      this.serverAvailable = false;
    }
    return this.serverAvailable;
  }

  async resolveUrls() {
    try {
      const r = await fetch('/whoami', { cache: 'no-store' });
      const j = await r.json();
      this.buzzerUrl = j.buzzerUrl || (location.origin + '/buzzer');
    } catch (e) {
      this.buzzerUrl = location.origin + '/buzzer';
    }
    return this.buzzerUrl;
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this._connect();
  }

  disable() {
    this.enabled = false;
    clearTimeout(this._reconnect);
    if (this.ws) { try { this.ws.close(); } catch (e) {} }
    this.ws = null;
    this.connected = false;
    this._emitStatus();
  }

  _wsURL() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${location.host}/ws`;
  }

  _connect() {
    if (!this.enabled) return;
    this.ws = new WebSocket(this._wsURL());

    this.ws.onopen = () => {
      this.connected = true;
      this._send({ type: 'host_hello' });
      this.syncState();
      this._emitStatus();
    };
    this.ws.onclose = () => {
      this.connected = false;
      this._emitStatus();
      if (this.enabled) {
        clearTimeout(this._reconnect);
        this._reconnect = setTimeout(() => this._connect(), 1500);
      }
    };
    this.ws.onerror = () => { try { this.ws.close(); } catch (e) {} };
    this.ws.onmessage = (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg.type === 'buzz' && typeof msg.team === 'number') {
        this._onBuzz(msg.team);
      } else if (msg.type === 'phone_joined') {
        // A phone just connected — push the current roster/phase.
        this.syncState();
      }
    };
  }

  _send(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }

  // Push current game state to all phones. Called by the engine
  // whenever phase / locks / teams change.
  syncState() {
    if (!this.connected) return;
    const s = this.app.state;
    const teams = s.teams.map((name, i) => ({
      i, name, color: (this.app.constructor.TEAM_COLORS || [])[i] || undefined,
    }));
    this._send({
      type: 'state',
      phase: s.gamePhase,
      teams,
      lockedTeams: [...(s.lockedTeams || [])],
      frozenUntil: { ...(s.buzzFreezeUntil || {}) },
      buzzedTeam: s.buzzedTeam,
      clueValue: s.currentClue?.value ?? null,
    });
  }

  _emitStatus() {
    if (typeof this.onStatusChange === 'function') {
      this.onStatusChange({
        enabled: this.enabled,
        connected: this.connected,
        buzzerUrl: this.buzzerUrl,
      });
    }
  }
}
