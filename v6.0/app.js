/* =====================================================
   LIQUID LOGIC v6.0 — app.js
   Team Colors · Sound FX · Confetti · Timer Bar
   End-Game Screen · Score Animations · Difficulty Filter
   LAN Phone Buzzers (optional, server-backed)
   ===================================================== */

import { library } from './trivia_db.js';
import { BuzzerHost } from './net.js';

// ── TEAM COLORS ─────────────────────────────────────
const TEAM_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];

// ── ANSWER TIMER BY POINT VALUE (seconds) ───────────
// Harder, higher-value clues get more time to answer.
const TIMER_BY_VALUE = { 200:5, 400:6, 600:7, 800:8, 1000:10 };

// ── NORMALIZE ANSWER (for per-board dedupe) ─────────
function normalizeAnswer(ans) {
  return (ans || '')
    .toLowerCase()
    .replace(/^(what|who|where|when)\s+(is|are|was|were)\s+/i, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(the|a|an)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── WEB AUDIO SOUND ENGINE ───────────────────────────
const Sound = (() => {
  let ctx = null;
  const getCtx = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };

  function tone(freq, duration, type = 'sine', gain = 0.4) {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g); g.connect(c.destination);
      osc.type = type; osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    } catch(e) {}
  }

  return {
    buzz()    { tone(880, 0.12, 'square', 0.5); setTimeout(() => tone(660, 0.12, 'square', 0.5), 120); },
    correct() { tone(523, 0.15); setTimeout(() => tone(659, 0.15), 140); setTimeout(() => tone(784, 0.3), 280); },
    wrong()   { tone(300, 0.15, 'sawtooth', 0.4); setTimeout(() => tone(200, 0.3, 'sawtooth', 0.4), 160); },
    tick()    { tone(1200, 0.05, 'sine', 0.15); },
    timeout() { [0,120,240].forEach(d => setTimeout(() => tone(220, 0.25, 'square', 0.4), d)); },
    sip()     { tone(440, 0.1); setTimeout(() => tone(550, 0.15), 100); setTimeout(() => tone(660, 0.2), 220); },
  };
})();

// ── CONFETTI ─────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#fff','#ffcc00'];
  const pieces = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height * 0.5,
    r: Math.random() * 8 + 4,
    d: Math.random() * 3 + 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y += p.d;
      p.tilt = Math.sin(p.tiltAngle) * 15;
      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
    });
    frame++;
    if (frame < 150) requestAnimationFrame(draw);
    else { canvas.style.display = 'none'; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  draw();
}

// ── MAIN GAME CLASS ──────────────────────────────────
class LiquidLogicV6 {
  static TEAM_COLORS = TEAM_COLORS;

  constructor() {
    this.state = {
      theme:            'tv',
      teams:            ['Team 1', 'Team 2'],
      scores:           [0, 0],
      sipsReceived:     [0, 0],
      usedClues:        new Set(),
      currentClue:      null,
      winnerIndex:      -1,
      selectedTheme:    'daily',
      difficultyFilter: 'all',
      currentBoard:     null,
      isModerated:      false,
      soundEnabled:     true,
      gamePhase:        'IDLE',
      buzzedTeam:       -1,
      lockedTeams:      new Set(),
      timerInterval:    null,
      timerValue:       5,
      timerMax:         5,
      earlyBuzzPenalties: new Set(),
      buzzFreezeUntil:  {},
      totalClues:       0,
      liveBuzzers:      false,
    };
    this.net = new BuzzerHost(this);
    this.init();
  }

  init() {
    try {
      this.setupThemeSelector();
      this.setupTeamInputs();
      this.populateBoardSelect();
      this.bindEventListeners();
      this.loadVoices();
      this.setupBuzzerServer();
    } catch (e) {
      console.error('Init failed:', e);
    }
  }

  // ── LAN PHONE BUZZERS ───────────────────────────────
  // Detect whether a local buzzer server is reachable. If so, light
  // up the "Live Phone Buzzers" toggle. On static hosting (e.g. GitHub
  // Pages) no server exists, so the control stays disabled and the
  // game falls back to keyboard + moderated play.
  async setupBuzzerServer() {
    const toggle  = document.getElementById('live-buzzers-toggle');
    const panel   = document.getElementById('buzzer-server-panel');
    const hint    = document.getElementById('buzzer-server-hint');
    if (!toggle) return;

    const available = await this.net.probe();
    if (!available) {
      toggle.disabled = true;
      if (hint) hint.textContent = 'Run the local buzzer server (npm start) to enable phone buzzers.';
      return;
    }

    await this.net.resolveUrls();
    toggle.disabled = false;
    if (hint) hint.textContent = 'Players join from phones on the same WiFi.';

    this.net.onStatusChange = (st) => {
      const status = document.getElementById('buzzer-conn-status');
      if (status) status.textContent = st.connected ? 'Live — phones can join' : (st.enabled ? 'Connecting…' : 'Off');
    };

    toggle.addEventListener('change', (e) => {
      this.state.liveBuzzers = e.target.checked;
      if (e.target.checked) {
        this.net.enable();
        this.renderBuzzerJoinInfo();
        if (panel) panel.classList.remove('hidden');
      } else {
        this.net.disable();
        if (panel) panel.classList.add('hidden');
      }
    });
  }

  renderBuzzerJoinInfo() {
    const url = this.net.buzzerUrl || (location.origin + '/buzzer');
    const linkEl = document.getElementById('buzzer-join-url');
    const qrEl   = document.getElementById('buzzer-qr');
    if (linkEl) linkEl.textContent = url.replace(/^https?:\/\//, '');
    if (qrEl) {
      qrEl.onerror = () => { qrEl.style.display = 'none'; };
      qrEl.src = '/qr.svg?text=' + encodeURIComponent(url);
      qrEl.style.display = 'block';
    }
  }

  bindEventListeners() {
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());
    document.getElementById('home-btn-container').addEventListener('click', () => this.quitGame());
    document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
    document.getElementById('reveal-btn').addEventListener('click', () => this.revealAnswer());
    document.getElementById('no-winner-btn').addEventListener('click', () => this.handleNoWinner());

    document.getElementById('how-to-play-btn').addEventListener('click', () => {
      document.getElementById('rules-modal').classList.remove('hidden');
    });
    document.getElementById('close-rules').addEventListener('click', () => document.getElementById('rules-modal').classList.add('hidden'));
    document.getElementById('close-rules-btn').addEventListener('click', () => document.getElementById('rules-modal').classList.add('hidden'));

    document.getElementById('about-btn').addEventListener('click', () => document.getElementById('about-modal').classList.remove('hidden'));
    document.getElementById('close-about').addEventListener('click', () => document.getElementById('about-modal').classList.add('hidden'));
    document.getElementById('close-about-btn').addEventListener('click', () => document.getElementById('about-modal').classList.add('hidden'));

    document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
    document.getElementById('new-game-btn').addEventListener('click', () => {
      document.getElementById('end-game-overlay').classList.add('hidden');
      this.quitGame();
    });

    document.getElementById('difficulty-filter').addEventListener('change', (e) => {
      this.state.difficultyFilter = e.target.value;
    });

    document.getElementById('sound-toggle').addEventListener('change', (e) => {
      this.state.soundEnabled = e.target.checked;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('modal').classList.add('hidden');
        document.getElementById('rules-modal').classList.add('hidden');
        document.getElementById('about-modal').classList.add('hidden');
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      }
      this.handleKeyPress(e);
    });
  }

  // ── SETUP ──────────────────────────────────────────

  setupThemeSelector() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.theme = btn.dataset.setTheme;
        document.body.setAttribute('data-theme', this.state.theme);
      });
    });
  }

  setupTeamInputs() {
    const container = document.getElementById('teams-container');
    const mk = (n) => `<input type="text" class="team-input" placeholder="Team ${n} Name" value="Team ${n}">`;
    document.getElementById('add-team-btn').addEventListener('click', () => {
      if (container.children.length < 6) container.insertAdjacentHTML('beforeend', mk(container.children.length + 1));
    });
    document.getElementById('remove-team-btn').addEventListener('click', () => {
      if (container.children.length > 2) container.removeChild(container.lastElementChild);
    });
  }

  populateBoardSelect() {
    const sel = document.getElementById('board-select');
    sel.innerHTML = '<option value="daily">Randomized Daily Mix</option>';
    Object.entries(library.themes).forEach(([key, t]) => {
      const opt = document.createElement('option');
      opt.value = key; opt.textContent = t.name;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', (e) => { this.state.selectedTheme = e.target.value; });
  }

  loadVoices() {
    if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }

  // ── GAME FLOW ───────────────────────────────────────

  startGame() {
    const modToggle = document.getElementById('moderated-mode-toggle');
    this.state.isModerated = modToggle?.checked ?? false;
    this.state.soundEnabled = document.getElementById('sound-toggle')?.checked ?? true;

    const inputs = document.querySelectorAll('.team-input');
    this.state.teams = Array.from(inputs).map((inp, i) => inp.value.trim() || `Team ${i + 1}`);

    const n = this.state.teams.length;
    this.state.scores      = new Array(n).fill(0);
    this.state.sipsReceived = new Array(n).fill(0);
    this.state.usedClues.clear();

    this.generateBoard();

    document.getElementById('landing-page').classList.replace('active', 'hidden');
    document.getElementById('game-board').classList.replace('hidden', 'active');

    this.renderHeader();
    this.renderScoreboard();
    this.renderGrid();
    this.net?.syncState();
  }

  playAgain() {
    document.getElementById('end-game-overlay').classList.add('hidden');
    const n = this.state.teams.length;
    this.state.scores       = new Array(n).fill(0);
    this.state.sipsReceived = new Array(n).fill(0);
    this.state.usedClues.clear();
    this.generateBoard();
    this.renderHeader();
    this.renderScoreboard();
    this.renderGrid();
  }

  quitGame() {
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('end-game-overlay').classList.add('hidden');
    document.getElementById('game-board').classList.replace('active', 'hidden');
    document.getElementById('landing-page').classList.replace('hidden', 'active');
    this.state.gamePhase = 'IDLE';
    this.net?.syncState();
  }

  generateBoard() {
    let availableCategories = [];
    let boardName = 'Randomized Daily Mix';

    if (this.state.selectedTheme !== 'daily' && library.themes[this.state.selectedTheme]) {
      const t = library.themes[this.state.selectedTheme];
      boardName = t.name;
      availableCategories = t.categories;
    } else {
      availableCategories = Object.keys(library.pool);
    }

    const shuffled = [...availableCategories].sort(() => 0.5 - Math.random()).slice(0, 5);

    let played = new Set();
    try { const s = localStorage.getItem('llPlayedV5'); if (s) played = new Set(JSON.parse(s)); } catch(e) {}

    const values = [200, 400, 600, 800, 1000];
    // Track answers already placed anywhere on the board so no two cells
    // resolve to the same answer in a single game.
    const usedAnswers = new Set();
    const categories = shuffled.map(catName => {
      let pool = library.pool[catName] || [];

      // Apply difficulty filter
      if (this.state.difficultyFilter === 'easy') pool = pool.filter(q => q.difficulty <= 3);
      if (this.state.difficultyFilter === 'hard') pool = pool.filter(q => q.difficulty >= 3);

      const unplayed = pool.filter(q => !played.has(q.question));
      if (unplayed.length < 5) pool.forEach(q => played.delete(q.question));

      const working = pool.filter(q => !played.has(q.question));
      const clues = [];

      for (let level = 1; level <= 5; level++) {
        // With difficulty filter, remap levels so board always has 5 rows
        let tier;
        if (this.state.difficultyFilter === 'easy') {
          tier = working.filter(q => q.difficulty === Math.ceil(level * 3 / 5));
        } else if (this.state.difficultyFilter === 'hard') {
          tier = working.filter(q => q.difficulty === Math.min(3 + level - 1, 5));
        } else {
          tier = working.filter(q => q.difficulty === level);
        }

        if (!tier.length) tier = working.filter(q => !clues.includes(q));
        if (!tier.length) tier = pool.filter(q => !clues.includes(q));

        // Prefer clues whose answer isn't already on the board; only fall
        // back to duplicate answers if there's no other option.
        const deduped = tier.filter(q => !usedAnswers.has(normalizeAnswer(q.answer)));
        const candidates = deduped.length ? deduped : tier;

        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        if (pick) {
          clues.push(pick);
          played.add(pick.question);
          usedAnswers.add(normalizeAnswer(pick.answer));
          const wi = working.indexOf(pick);
          if (wi > -1) working.splice(wi, 1);
        }
      }

      return {
        title: catName,
        clues: clues.map((q, i) => ({
          ...q,
          value: values[i],
          penalty: this.calculatePenalty(values[i]),
        })),
      };
    });

    this.state.currentBoard = { name: boardName, categories };
    this.state.totalClues = categories.reduce((s, c) => s + c.clues.length, 0);

    try { localStorage.setItem('llPlayedV5', JSON.stringify([...played])); } catch(e) {}
  }

  calculatePenalty(value) {
    const map = { 200:'1 Sip', 400:'2 Sips', 600:'3 Sips', 800:'4 Sips', 1000:'5 Sips' };
    return map[value] || '1 Sip';
  }

  // ── RENDERERS ───────────────────────────────────────

  renderHeader() {
    document.getElementById('current-board-name').textContent = this.state.currentBoard?.name ?? '';
    this.updateCluesRemaining();
  }

  updateCluesRemaining() {
    const remaining = this.state.totalClues - this.state.usedClues.size;
    document.getElementById('clues-remaining').textContent = `${remaining} clues left`;
  }

  renderScoreboard() {
    const board = document.getElementById('scoreboard');
    board.innerHTML = '';
    // Compute ranks
    const sorted = this.state.scores.map((s, i) => ({ i, s })).sort((a, b) => b.s - a.s);
    const ranks = new Array(this.state.teams.length);
    sorted.forEach((item, rank) => { ranks[item.i] = rank; });

    this.state.teams.forEach((team, idx) => {
      const color = TEAM_COLORS[idx % TEAM_COLORS.length];
      const card = document.createElement('div');
      card.className = 'score-card';
      card.style.setProperty('--team-color', color);
      card.id = `score-card-${idx}`;
      const rankLabel = ranks[idx] === 0 ? 'Leading' : `#${ranks[idx]+1}`;
      card.innerHTML = `
        <span class="team-name" style="color:${color}">${team}</span>
        <span class="team-score" id="score-val-${idx}">${this.state.scores[idx]}</span>
        <span class="score-rank">${rankLabel}</span>
        <span class="team-sips">${this.state.sipsReceived[idx]} sips</span>
      `;
      board.appendChild(card);
    });
  }

  animateScore(idx, delta) {
    const el = document.getElementById(`score-val-${idx}`);
    if (!el) return;
    el.textContent = this.state.scores[idx];
    el.classList.remove('score-anim-up', 'score-anim-down');
    void el.offsetWidth; // reflow
    el.classList.add(delta > 0 ? 'score-anim-up' : 'score-anim-down');
  }

  renderGrid() {
    const grid = document.getElementById('board-grid');
    grid.innerHTML = '';
    const { categories } = this.state.currentBoard;

    categories.forEach(cat => {
      const cell = document.createElement('div');
      cell.className = 'category-cell';
      cell.textContent = cat.title;
      grid.appendChild(cell);
    });

    for (let row = 0; row < 5; row++) {
      categories.forEach((cat, catIdx) => {
        const clue = cat.clues[row];
        if (!clue) { grid.appendChild(document.createElement('div')); return; }
        const cell = document.createElement('div');
        cell.className = 'clue-card';
        cell.textContent = clue.value;
        const id = `${catIdx}-${row}`;
        cell.dataset.id = id;
        if (this.state.usedClues.has(id)) {
          cell.classList.add('used');
        } else {
          cell.addEventListener('click', () => this.handleClueClick(catIdx, row, id, cell));
        }
        grid.appendChild(cell);
      });
    }
  }

  // ── MODAL ───────────────────────────────────────────

  handleClueClick(catIdx, rowIdx, id, element) {
    const clue = this.state.currentBoard.categories[catIdx].clues[rowIdx];
    this.state.currentClue   = { ...clue, id, element };
    this.state.lockedTeams   = new Set();
    this.state.buzzedTeam    = -1;
    this.state.gamePhase     = 'READING';
    this.state.earlyBuzzPenalties.clear();
    this.state.buzzFreezeUntil = {};

    document.getElementById('modal-points').textContent = `$${clue.value}`;
    document.getElementById('modal-category-label').textContent =
      this.state.currentBoard.categories[catIdx].title;
    document.getElementById('modal-penalty').textContent = clue.penalty;
    document.getElementById('modal-question').textContent = clue.question;
    document.getElementById('modal-question').className = 'question-text';
    document.getElementById('reveal-btn').textContent = 'Reveal Answer';

    document.getElementById('timer-bar-wrap').classList.add('hidden');
    document.getElementById('modal-phase-question').classList.remove('hidden');
    document.getElementById('modal-phase-answer').classList.add('hidden');
    document.getElementById('modal-phase-sips').classList.add('hidden');
    document.getElementById('modal').classList.remove('hidden');

    this.renderBuzzerKeys();
    this.speak(clue.question);
    this.net?.syncState();
  }

  renderBuzzerKeys() {
    const wrap = document.getElementById('buzzer-keys');
    const keys = ['1', '=', '6', 'Z', 'B', '/'];
    const active = this.state.teams.length;
    if (this.state.isModerated) { wrap.classList.add('hidden'); return; }
    wrap.classList.remove('hidden');
    wrap.innerHTML = this.state.teams.slice(0, active).map((team, i) => `
      <div class="buzzer-key-item" id="key-item-${i}" data-team="${i}">
        <div class="key-chip" style="border-color:${TEAM_COLORS[i]}">${keys[i]}</div>
        <div class="key-team-name" style="color:${TEAM_COLORS[i]}">${team}</div>
      </div>
    `).join('');
  }

  // ── BUZZER SYSTEM ────────────────────────────────────

  handleKeyPress(e) {
    if (this.state.isModerated) return;
    if (!['READING','OPEN'].includes(this.state.gamePhase)) return;
    if (!this.state.currentClue) return;
    if (document.getElementById('modal').classList.contains('hidden')) return;

    const keyMap = { '1':0, '=':1, '6':2, 'z':3, 'b':4, '/':5 };
    const idx = keyMap[e.key.toLowerCase()];
    if (idx !== undefined && idx < this.state.teams.length) this.handleBuzz(idx);
  }

  handleBuzz(teamIdx) {
    if (this.state.lockedTeams.has(teamIdx)) return;

    if (this.state.gamePhase === 'READING') {
      // Jumped the gun: this team is frozen for 2s once buzzers open.
      if (!this.state.earlyBuzzPenalties.has(teamIdx)) {
        this.state.earlyBuzzPenalties.add(teamIdx);
        this.showNotification(`${this.state.teams[teamIdx]}: too early! Frozen 2s when buzzers open.`);
      }
    } else if (this.state.gamePhase === 'OPEN') {
      const frozenUntil = this.state.buzzFreezeUntil[teamIdx] || 0;
      if (Date.now() < frozenUntil) {
        this.showNotification(`${this.state.teams[teamIdx]} is still frozen.`);
        return;
      }
      this.activateBuzz(teamIdx);
    }
  }

  activateBuzz(teamIdx) {
    this.state.gamePhase  = 'ANSWERING';
    this.state.buzzedTeam = teamIdx;
    const secs = TIMER_BY_VALUE[this.state.currentClue?.value] || 5;
    this.state.timerMax   = secs;
    this.state.timerValue = secs;
    this.net?.syncState();

    if (this.state.soundEnabled) Sound.buzz();

    const color = TEAM_COLORS[teamIdx % TEAM_COLORS.length];
    const q = document.getElementById('modal-question');
    q.className = 'question-text buzzed-active';
    q.style.borderColor = color;
    q.textContent = `BUZZED: ${this.state.teams[teamIdx]}!`;

    document.getElementById('reveal-btn').textContent =
      `Reveal Answer (for ${this.state.teams[teamIdx]})`;

    // Timer bar
    const wrap = document.getElementById('timer-bar-wrap');
    const bar  = document.getElementById('timer-bar');
    const lbl  = document.getElementById('timer-label');
    wrap.classList.remove('hidden');
    bar.style.setProperty('--pct', '1');
    lbl.textContent = String(this.state.timerValue);

    // Lock out buzzer key UI
    document.querySelectorAll('.buzzer-key-item').forEach(el => {
      const ti = parseInt(el.dataset.team);
      if (ti !== teamIdx) el.classList.add('locked');
    });

    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    this.state.timerInterval = setInterval(() => {
      this.state.timerValue--;
      if (this.state.soundEnabled) Sound.tick();
      lbl.textContent = this.state.timerValue;
      bar.style.setProperty('--pct', String(Math.max(0, this.state.timerValue / this.state.timerMax)));
      if (this.state.timerValue <= 0) {
        clearInterval(this.state.timerInterval);
        if (this.state.soundEnabled) Sound.timeout();
        this.handleWrongAnswer(teamIdx, true);
      }
    }, 1000);
  }

  onSpeechEnd() {
    if (this.state.gamePhase !== 'READING') return;
    this.state.gamePhase = 'OPEN';
    // Teams that buzzed early are frozen out for the first 2 seconds.
    const freezeUntil = Date.now() + 2000;
    this.state.buzzFreezeUntil = {};
    this.state.earlyBuzzPenalties.forEach(ti => { this.state.buzzFreezeUntil[ti] = freezeUntil; });
    this.renderBuzzerKeys();
    this.net?.syncState();
  }

  speak(text) {
    if (this.state.isModerated) { this.state.gamePhase = 'OPEN'; this.renderBuzzerKeys(); return; }
    if (!('speechSynthesis' in window)) { this.state.gamePhase = 'OPEN'; return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === 'en-US') || voices[0];
    if (voice) utt.voice = voice;
    utt.rate = 1.0;
    utt.onend = () => this.onSpeechEnd();
    this.state.gamePhase = 'READING';
    window.speechSynthesis.speak(utt);
  }

  // ── ANSWER / SCORING ─────────────────────────────────

  handleWrongAnswer(teamIdx, isTimeout = false) {
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    if (this.state.soundEnabled) Sound.wrong();

    this.state.scores[teamIdx] -= this.state.currentClue.value;
    this.animateScore(teamIdx, -1);
    this.state.lockedTeams.add(teamIdx);

    const keyEl = document.getElementById(`key-item-${teamIdx}`);
    if (keyEl) keyEl.classList.add('locked');

    this.renderScoreboard();

    if (this.state.lockedTeams.size >= this.state.teams.length) {
      this.handleNoWinner();
      return;
    }

    // STEAL MODE
    this.state.gamePhase = 'OPEN';
    const q = document.getElementById('modal-question');
    q.className = 'question-text steal-mode';
    q.textContent = isTimeout ? `TIME'S UP! Steal mode: buzzer open!` : `WRONG! Steal mode: buzzer open!`;

    document.getElementById('timer-bar-wrap').classList.add('hidden');
    document.getElementById('modal-phase-answer').classList.add('hidden');
    document.getElementById('modal-phase-question').classList.remove('hidden');
    document.getElementById('reveal-btn').textContent = 'Reveal Answer';

    // Update key UI
    document.querySelectorAll('.buzzer-key-item').forEach(el => {
      const ti = parseInt(el.dataset.team);
      el.classList.toggle('locked', this.state.lockedTeams.has(ti));
    });
    this.net?.syncState();
  }

  revealAnswer() {
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    document.getElementById('timer-bar-wrap').classList.add('hidden');
    document.getElementById('modal-phase-question').classList.add('hidden');
    document.getElementById('modal-phase-answer').classList.remove('hidden');
    document.getElementById('modal-answer').textContent = this.state.currentClue.answer;

    const container = document.getElementById('winner-buttons');
    container.innerHTML = '';

    this.state.teams.forEach((team, idx) => {
      const color = TEAM_COLORS[idx % TEAM_COLORS.length];
      const isLocked = this.state.lockedTeams.has(idx);

      const btnCorrect = document.createElement('button');
      btnCorrect.className = 'team-score-btn';
      btnCorrect.style.background = color;
      btnCorrect.style.color = '#fff';
      btnCorrect.innerHTML = `${team}<span class="btn-sub">Correct</span>`;
      btnCorrect.disabled = isLocked;
      btnCorrect.addEventListener('click', () => {
        if (this.state.soundEnabled) { Sound.correct(); launchConfetti(); }
        this.handleWinnerSelected(idx);
      });

      const btnWrong = document.createElement('button');
      btnWrong.className = 'team-score-btn';
      btnWrong.style.background = 'rgba(231,76,60,0.25)';
      btnWrong.style.color = '#ff8080';
      btnWrong.style.border = '1px solid rgba(231,76,60,0.4)';
      btnWrong.innerHTML = `${team}<span class="btn-sub">Wrong</span>`;
      btnWrong.disabled = isLocked;
      btnWrong.addEventListener('click', () => {
        this.handleWrongAnswer(idx);
        btnWrong.disabled = true;
        btnCorrect.disabled = true;
      });

      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;align-items:center';
      wrap.appendChild(btnCorrect);
      wrap.appendChild(btnWrong);
      if (isLocked) wrap.style.opacity = '0.35';
      container.appendChild(wrap);
    });
  }

  handleWinnerSelected(idx) {
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    this.state.winnerIndex = idx;
    this.state.scores[idx] += this.state.currentClue.value;
    this.animateScore(idx, 1);
    this.renderScoreboard();
    this.startSipDistribution();
  }

  startSipDistribution() {
    document.getElementById('modal-phase-answer').classList.add('hidden');
    document.getElementById('modal-phase-sips').classList.remove('hidden');
    if (this.state.soundEnabled) Sound.sip();

    const winner = this.state.teams[this.state.winnerIndex];
    const pts = parseInt(this.state.currentClue.value);
    const sips = Math.floor(pts / 200);
    const sipText = sips === 1 ? '1 sip' : `${sips} sips`;

    document.getElementById('sip-instruction').innerHTML =
      `<strong>${winner}</strong>, who drinks ${sipText}?`;

    const container = document.getElementById('target-buttons');
    container.innerHTML = '';
    this.state.teams.forEach((team, idx) => {
      const color = TEAM_COLORS[idx % TEAM_COLORS.length];
      const btn = document.createElement('button');
      btn.className = 'sip-target-btn';
      btn.style.background = color;
      btn.style.color = '#fff';
      btn.textContent = team;
      btn.addEventListener('click', () => this.handleSipTarget(idx, sips));
      container.appendChild(btn);
    });
  }

  handleSipTarget(targetIdx, amount) {
    this.state.sipsReceived[targetIdx] += amount;
    this.closeModalAndMarkUsed();
  }

  handleNoWinner() {
    // Nobody got it: the whole table drinks the clue's sip value.
    const pts = parseInt(this.state.currentClue?.value || 0);
    const sips = Math.max(1, Math.floor(pts / 200));
    this.state.teams.forEach((_, i) => { this.state.sipsReceived[i] += sips; });
    if (this.state.soundEnabled) Sound.sip();
    this.showNotification(`No one got it — table drinks! Everyone takes ${sips === 1 ? '1 sip' : sips + ' sips'}.`);
    this.closeModalAndMarkUsed();
  }

  closeModalAndMarkUsed() {
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    document.getElementById('modal').classList.add('hidden');
    this.state.currentClue.element.classList.add('used');
    this.state.usedClues.add(this.state.currentClue.id);
    this.state.gamePhase = 'RESOLVED';
    this.renderScoreboard();
    this.updateCluesRemaining();
    this.net?.syncState();
    this.state.currentClue = null;

    // Check if all clues used
    if (this.state.usedClues.size >= this.state.totalClues) {
      setTimeout(() => this.showEndGame(), 600);
    }
  }

  closeModal() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    document.getElementById('modal').classList.add('hidden');
    this.state.gamePhase = 'IDLE';
  }

  // ── END GAME ─────────────────────────────────────────

  showEndGame() {
    const overlay = document.getElementById('end-game-overlay');
    const finalScores = document.getElementById('final-scores');
    const winnerAnn = document.getElementById('winner-announcement');

    const ranked = this.state.teams
      .map((t, i) => ({ name: t, score: this.state.scores[i], sips: this.state.sipsReceived[i], idx: i }))
      .sort((a, b) => b.score - a.score);

    const rankLabels = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
    finalScores.innerHTML = ranked.map((t, rank) => {
      const color = TEAM_COLORS[t.idx % TEAM_COLORS.length];
      return `
        <div class="final-score-card" style="--team-color:${color}">
          <div class="final-rank">${rankLabels[rank]}</div>
          <div class="final-name" style="color:${color}">${t.name}</div>
          <div class="final-pts">${t.score}</div>
          <div class="final-sips">${t.sips} sips</div>
        </div>
      `;
    }).join('');

    const winner = ranked[0];
    if (winner.score > 0) {
      winnerAnn.textContent = `${winner.name} wins with ${winner.score} points!`;
      if (this.state.soundEnabled) { Sound.correct(); setTimeout(() => launchConfetti(), 300); }
    } else {
      winnerAnn.textContent = `No winner — everyone scores 0!`;
    }

    overlay.classList.remove('hidden');
  }

  // ── UTILITIES ────────────────────────────────────────

  showNotification(msg) {
    const el = document.createElement('div');
    el.className = 'notification-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
}

window.app = new LiquidLogicV6();
