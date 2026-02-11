console.log("App Module Evaluating...");
import { library } from './trivia_db.js?v=3.6';

class LiquidLogicV3 {
    constructor() {
        this.state = {
            theme: 'tv', // Default to TV
            teams: ['Team 1', 'Team 2'],
            scores: [0, 0],
            sipsReceived: [0, 0],
            usedClues: new Set(),
            currentClue: null,
            winnerIndex: -1,
            selectedTheme: 'daily',
            currentBoard: [],
            // V3 State
            gamePhase: 'IDLE', // IDLE, READING, OPEN, BUZZED, ANSWERING, RESOLVED
            buzzedTeam: -1,
            lockedTeams: new Set(), // Teams that answered wrong
            speechSynth: null,
            speechUtterance: null,
            timerInterval: null,
            timerValue: 4,
            earlyBuzzPenalties: new Set(),
            penaltyActive: false
        };

        this.init();
    }

    init() {
        try {
            console.log("Initializing Liquid Logic V3.0...");
            console.log("Library loaded with", Object.keys(library.pool).length, "categories.");

            // 1. Setup Phase
            this.setupThemeSelector();
            this.setupTeamInputs();

            // 2. Event Listeners
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.addEventListener('click', () => this.startGame());

            const quitBtn = document.getElementById('quit-btn');
            if (quitBtn) quitBtn.addEventListener('click', () => this.quitGame());

            // Home Header Click -> Quit/Reset (Instant)
            const homeBtn = document.getElementById('home-btn-container');
            if (homeBtn) {
                // Ensure no duplicates
                homeBtn.removeEventListener('click', () => this.quitGame()); // Safety
                homeBtn.addEventListener('click', () => this.quitGame());
            }

            // Modal Interactions
            document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
            document.getElementById('reveal-btn').addEventListener('click', () => this.revealAnswer());
            document.getElementById('no-winner-btn').addEventListener('click', () => this.handleNoWinner());

            // Rules
            document.getElementById('how-to-play-btn').addEventListener('click', () => {
                document.getElementById('rules-modal').classList.remove('hidden');
            });
            // Fix "Got It" button logic
            const closeRulesBtn = document.getElementById('close-rules-btn') || document.getElementById('close-rules');
            if (closeRulesBtn) {
                closeRulesBtn.addEventListener('click', () => {
                    document.getElementById('rules-modal').classList.add('hidden');
                });
            }
            document.getElementById('close-rules').addEventListener('click', () => {
                document.getElementById('rules-modal').classList.add('hidden');
            });

            // About Modal
            document.getElementById('about-btn').addEventListener('click', () => {
                document.getElementById('about-modal').classList.remove('hidden');
            });
            const closeAboutBtn = document.getElementById('close-about-btn');
            if (closeAboutBtn) {
                closeAboutBtn.addEventListener('click', () => {
                    document.getElementById('about-modal').classList.add('hidden');
                });
            }
            document.getElementById('close-about').addEventListener('click', () => {
                document.getElementById('about-modal').classList.add('hidden');
            });

            // V3 Buzzer Listener
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                    // Also support closing rules/about if open
                    document.getElementById('rules-modal').classList.add('hidden');
                    document.getElementById('about-modal').classList.add('hidden');
                }
                this.handleKeyPress(e);
            });

            this.loadVoices();
            this.populateBoardSelect();

        } catch (error) {
            console.error("Initialization Failed:", error);
            alert("Game failed to initialize: " + error.message);
        }
    }

    handleKeyPress(e) {
        if (this.state.gamePhase !== 'READING' && this.state.gamePhase !== 'OPEN') return;
        if (this.state.currentClue === null) return;
        if (document.getElementById('modal').classList.contains('hidden')) return;

        const key = e.key.toLowerCase();
        let teamIndex = -1;

        if (key === '1') teamIndex = 0; // Top Left
        if (key === '=') teamIndex = 1; // Top Mid (Updated v3.4)
        if (key === '6') teamIndex = 2; // Top Right (Updated v3.4)
        if (key === 'z') teamIndex = 3; // Bot Left
        if (key === 'b') teamIndex = 4; // Bot Mid
        if (key === '/') teamIndex = 5; // Bot Right

        if (teamIndex !== -1 && teamIndex < this.state.teams.length) {
            this.handleBuzz(teamIndex);
        }
    }

    handleBuzz(teamIndex) {
        if (this.state.lockedTeams.has(teamIndex)) return; // Already answered wrong

        // Early Buzz Logic
        if (this.state.gamePhase === 'READING') {
            // v3.4: Strict Anti-Buzz
            if (!this.state.earlyBuzzPenalties.has(teamIndex)) {
                this.state.earlyBuzzPenalties.add(teamIndex);
                console.log(`Early Buzz by ${this.state.teams[teamIndex]}! Penalty pending.`);
                this.showNotification(`${this.state.teams[teamIndex]}! WAIT FOR VOICE! (Penalty Applied)`);
            }
            // Do NOT stop speech. Do NOT activate buzz.
        } else if (this.state.gamePhase === 'OPEN') {
            // Check for active penalty
            if (this.state.penaltyActive && this.state.earlyBuzzPenalties.has(teamIndex)) {
                console.log(`${this.state.teams[teamIndex]} is locked out due to penalty.`);
                return;
            }
            this.activateBuzz(teamIndex);
        } else if (this.state.gamePhase === 'IDLE' || this.state.gamePhase === 'RESOLVED') {
            // Ignore
        }
    }

    activateBuzz(teamIndex) {
        this.state.gamePhase = 'ANSWERING';
        this.state.buzzedTeam = teamIndex;
        this.state.timerValue = 4; // Reset Timer

        // UI Feedback
        const modalQuestion = document.getElementById('modal-question');
        modalQuestion.style.border = "4px solid #00ff00";
        this.updateTimerUI(teamIndex);

        const revealBtn = document.getElementById('reveal-btn');
        revealBtn.textContent = `Reveal Answer (for ${this.state.teams[teamIndex]})`;
        revealBtn.focus();

        // Start Countdown
        if (this.state.timerInterval) clearInterval(this.state.timerInterval);
        this.state.timerInterval = setInterval(() => {
            this.state.timerValue--;
            this.updateTimerUI(teamIndex);

            if (this.state.timerValue <= 0) {
                clearInterval(this.state.timerInterval);
                // Time's Up! Treat as Wrong Answer
                this.handleWrongAnswer(teamIndex, true); // true = time out
            }
        }, 1000);
    }

    updateTimerUI(teamIndex) {
        const modalQuestion = document.getElementById('modal-question');
        modalQuestion.textContent = `BUZZED: ${this.state.teams[teamIndex]}! (${this.state.timerValue}s)`;
    }


    /* --- SETUP HELPERS --- */

    populateBoardSelect() {
        const select = document.getElementById('board-select');
        if (!select) return;

        select.innerHTML = '<option value="daily">Randomized Daily Mix</option>';

        if (library.themes) {
            Object.keys(library.themes).forEach(key => {
                const theme = library.themes[key];
                const option = document.createElement('option');
                option.value = key;
                option.textContent = theme.name;
                select.appendChild(option);
            });
        }

        select.addEventListener('change', (e) => {
            this.state.selectedTheme = e.target.value;
        });
    }

    setupThemeSelector() {
        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const theme = btn.dataset.setTheme;
                this.state.theme = theme;
                document.body.setAttribute('data-theme', theme);
            });
        });
    }

    setupTeamInputs() {
        const container = document.getElementById('teams-container');
        if (!container) return;
        const inputTemplate = (num) => `<input type="text" class="team-input" placeholder="Team ${num} Name" value="Team ${num}">`;

        const addBtn = document.getElementById('add-team-btn');
        if (addBtn) addBtn.addEventListener('click', () => {
            if (container.children.length < 6) {
                container.insertAdjacentHTML('beforeend', inputTemplate(container.children.length + 1));
            }
        });

        const removeBtn = document.getElementById('remove-team-btn');
        if (removeBtn) removeBtn.addEventListener('click', () => {
            if (container.children.length > 2) {
                container.removeChild(container.lastElementChild);
            }
        });
    }

    /* --- GAME FLOW --- */

    calculatePenalty(value) {
        if (value === 200) return "1 Sip";
        if (value === 400) return "2 Sips";
        if (value === 600) return "3 Sips";
        if (value === 800) return "4 Sips";
        if (value === 1000) return "1 Shot";
        return "1 Sip";
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);

            // Voice selection logic (simplified)
            const voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.lang === 'en-US') || voices[0];
            if (voice) utterance.voice = voice;
            utterance.rate = 1.0;

            utterance.onend = () => {
                this.onSpeechEnd();
            };

            this.state.gamePhase = 'READING';
            this.state.earlyBuzzPenalties.clear(); // Reset penalties for new question
            window.speechSynthesis.speak(utterance);
        } else {
            this.state.gamePhase = 'OPEN';
        }
    }

    onSpeechEnd() {
        if (this.state.gamePhase === 'READING') {
            this.state.gamePhase = 'OPEN';

            // Apply Penalty Delay if needed
            if (this.state.earlyBuzzPenalties.size > 0) {
                this.state.penaltyActive = true;
                setTimeout(() => {
                    this.state.penaltyActive = false;
                    // Optional: Visual cue that penalty is over?
                }, 100); // 0.1s requested
            }
        }
    }

    showNotification(msg) {
        const notif = document.createElement('div');
        notif.className = 'notification-toast';
        notif.textContent = msg;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }

    loadVoices() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
        }
    }

    generateBoard() {
        let availableCategories = [];
        let boardName = "Randomized Daily Mix";

        if (this.state.selectedTheme && this.state.selectedTheme !== 'daily' && library.themes[this.state.selectedTheme]) {
            const themeData = library.themes[this.state.selectedTheme];
            boardName = themeData.name;
            availableCategories = themeData.categories;
        } else {
            availableCategories = Object.keys(library.pool);
        }

        const shuffledCats = availableCategories.sort(() => 0.5 - Math.random()).slice(0, 5);

        const categories = [];
        shuffledCats.forEach(catName => {
            const poolQuestions = library.pool[catName] || [];
            const selectedQs = [];

            for (let level = 1; level <= 5; level++) {
                const tierQuestions = poolQuestions.filter(q => q.difficulty === level);
                if (tierQuestions.length > 0) {
                    selectedQs.push(tierQuestions[Math.floor(Math.random() * tierQuestions.length)]);
                } else {
                    const remaining = poolQuestions.filter(q => !selectedQs.includes(q));
                    if (remaining.length > 0) selectedQs.push(remaining[0]);
                }
            }

            // Map to Clues
            const values = [200, 400, 600, 800, 1000];
            const clues = selectedQs.map((q, i) => ({
                ...q,
                value: values[i],
                penalty: this.calculatePenalty(values[i])
            }));
            categories.push({ title: catName, clues: clues });
        });

        this.state.currentBoard = { name: boardName, categories: categories };
    }

    startGame() {
        const inputs = document.querySelectorAll('.team-input');
        this.state.teams = Array.from(inputs).map(i => i.value.trim() || `Team ${Math.random().toString().substr(2, 3)}`);

        this.state.scores = new Array(this.state.teams.length).fill(0);
        this.state.sipsReceived = new Array(this.state.teams.length).fill(0);
        this.state.usedClues.clear();

        this.generateBoard();
        this.renderHeader();
        this.renderScoreboard();
        this.renderGrid();

        document.getElementById('landing-page').classList.remove('active');
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('game-board').classList.remove('hidden');
        document.getElementById('game-board').classList.add('active');
    }

    quitGame() {
        // Instant Quit as requested ("Override")
        this.resetGame();
    }

    resetGame() {
        document.getElementById('game-board').classList.remove('active');
        document.getElementById('game-board').classList.add('hidden');
        document.getElementById('landing-page').classList.remove('hidden');
        document.getElementById('landing-page').classList.add('active');
    }

    /* --- RENDERERS --- */

    renderHeader() {
        if (this.state.currentBoard) {
            document.getElementById('current-board-name').textContent = this.state.currentBoard.name;
        }
    }

    renderScoreboard() {
        const board = document.getElementById('scoreboard');
        board.innerHTML = '';
        this.state.teams.forEach((team, index) => {
            const card = document.createElement('div');
            card.className = 'score-card';
            card.innerHTML = `
        <span class="team-name">${team}</span>
        <span class="team-score">${this.state.scores[index]}</span>
        <span class="team-sips">${this.state.sipsReceived[index]} sips drunk</span>
      `;
            board.appendChild(card);
        });
    }

    renderGrid() {
        const grid = document.getElementById('board-grid');
        grid.innerHTML = '';
        const boardData = this.state.currentBoard;

        if (!boardData || !boardData.categories) return;

        boardData.categories.forEach(cat => {
            const cell = document.createElement('div');
            cell.className = 'category-cell';
            cell.textContent = cat.title;
            grid.appendChild(cell);
        });

        for (let i = 0; i < 5; i++) {
            boardData.categories.forEach((cat, catIndex) => {
                const clue = cat.clues[i];
                const cell = document.createElement('div');
                cell.className = 'clue-card';
                cell.textContent = clue.value;
                cell.dataset.id = `${catIndex}-${i}`;

                if (this.state.usedClues.has(cell.dataset.id)) {
                    cell.classList.add('used');
                } else {
                    cell.addEventListener('click', () => this.handleClueClick(catIndex, i, cell.dataset.id, cell));
                }
                grid.appendChild(cell);
            });
        }
    }

    /* --- MODAL LOGIC --- */

    handleClueClick(catIndex, clueIndex, id, element) {
        const clue = this.state.currentBoard.categories[catIndex].clues[clueIndex];
        this.state.currentClue = { ...clue, id, element };

        // Reset Phase State
        this.state.lockedTeams.clear();
        this.state.buzzedTeam = -1;
        this.state.gamePhase = 'READING'; // Will be set in speak, but explicitly here too

        document.getElementById('modal-points').textContent = `${clue.value}`;
        document.getElementById('modal-penalty').textContent = `Penalty: ${clue.penalty}`;
        document.getElementById('modal-question').textContent = clue.question;
        document.getElementById('modal-question').style.border = "none";
        document.getElementById('modal-answer').textContent = clue.answer;

        document.getElementById('reveal-btn').textContent = "Reveal Answer";

        document.getElementById('modal-phase-question').classList.remove('hidden');
        document.getElementById('modal-phase-answer').classList.add('hidden');
        document.getElementById('modal-phase-sips').classList.add('hidden');
        document.getElementById('modal').classList.remove('hidden');

        this.speak(clue.question);
    }

    handleNoWinner() {
        this.closeModalAndMarkUsed();
    }

    // Steal Logic implementation
    handleWrongAnswer(index, isTimeout = false) {
        // Stop Timer
        if (this.state.timerInterval) clearInterval(this.state.timerInterval);

        // Deduct Points
        const points = this.state.currentClue.value;
        this.state.scores[index] -= points; // Negative points
        this.state.lockedTeams.add(index);
        this.renderScoreboard();

        // Check if other teams can steal
        const activeTeams = this.state.teams.length;
        const blockedCount = this.state.lockedTeams.size;

        if (blockedCount >= activeTeams) {
            this.handleNoWinner();
        } else {
            // STEAL OPPORTUNITY - RE-OPEN BUZZER
            this.state.gamePhase = 'OPEN';

            const modalQuestion = document.getElementById('modal-question');
            modalQuestion.style.border = "4px solid #ffcc00"; // Yellow/Warn

            if (isTimeout) {
                modalQuestion.textContent = `TIME'S UP! Steal Mode: Buzzer OPEN! (Keys: 1,=,6,z,b,/)`;
            } else {
                modalQuestion.textContent = `INCORRECT! Steal Mode: Buzzer OPEN! (Keys: 1,=,6,z,b,/)`;
            }

            // Go back to Question Phase (hide Answer buttons)
            document.getElementById('modal-phase-answer').classList.add('hidden');
            document.getElementById('modal-phase-question').classList.remove('hidden');

            const revealBtn = document.getElementById('reveal-btn');
            revealBtn.textContent = "Reveal Answer";
            revealBtn.focus();
        }
    }

    revealAnswer() {
        document.getElementById('modal-phase-question').classList.add('hidden');
        document.getElementById('modal-phase-answer').classList.remove('hidden');

        // Render Winner Buttons
        const container = document.getElementById('winner-buttons');
        container.innerHTML = '';

        this.state.teams.forEach((team, index) => {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.margin = '5px';

            const btnCorrect = document.createElement('button');
            btnCorrect.className = 'action-btn small';
            btnCorrect.style.fontSize = "1rem";
            btnCorrect.textContent = `${team} (Correct)`;

            // Disable if locked (tried to steal/answer early and failed?)
            // Actually reset locks for result phase unless we want to track who buzzed and failed.
            if (this.state.lockedTeams.has(index)) {
                btnCorrect.disabled = true;
                btnCorrect.style.opacity = 0.5;
            }

            btnCorrect.addEventListener('click', () => this.handleWinnerSelected(index));

            const btnWrong = document.createElement('button');
            btnWrong.className = 'secondary-btn small';
            btnWrong.style.fontSize = "0.8rem";
            btnWrong.style.color = "#ff6b6b";
            btnWrong.textContent = "Wrong (-)";

            if (this.state.lockedTeams.has(index)) {
                btnWrong.disabled = true;
            }

            btnWrong.addEventListener('click', () => {
                this.handleWrongAnswer(index);
                btnWrong.disabled = true;
                btnCorrect.disabled = true;
                wrapper.style.opacity = 0.5;
            });

            wrapper.appendChild(btnCorrect);
            wrapper.appendChild(btnWrong);
            container.appendChild(wrapper);
        });
    }

    handleWinnerSelected(index) {
        if (this.state.timerInterval) clearInterval(this.state.timerInterval);
        this.state.winnerIndex = index;
        this.state.scores[index] += this.state.currentClue.value;
        this.startSipDistribution();
    }

    startSipDistribution() {
        document.getElementById('modal-phase-answer').classList.add('hidden');
        document.getElementById('modal-phase-sips').classList.remove('hidden');

        const winnerName = this.state.teams[this.state.winnerIndex];
        const points = parseInt(this.state.currentClue.value, 10);
        const amount = Math.floor(points / 200);
        let penaltyText = "";

        if (points === 1000) {
            penaltyText = "this 1 Shot";
        } else if (amount === 1) {
            penaltyText = "this 1 sip";
        } else {
            penaltyText = `these ${amount} sips`;
        }

        document.getElementById('sip-instruction').textContent = `${winnerName}, who must drink ${penaltyText}?`;

        const container = document.getElementById('target-buttons');
        container.innerHTML = '';
        this.state.teams.forEach((team, index) => {
            const btn = document.createElement('button');
            btn.className = 'action-btn small';
            btn.style.margin = "5px";
            btn.style.background = "#ff6b6b";
            btn.textContent = team;
            btn.addEventListener('click', () => this.handleSipTarget(index, amount));
            container.appendChild(btn);
        });
    }

    handleSipTarget(targetIndex, amount) {
        this.state.sipsReceived[targetIndex] += amount;
        this.closeModalAndMarkUsed();
    }

    closeModalAndMarkUsed() {
        document.getElementById('modal').classList.add('hidden');
        this.state.currentClue.element.classList.add('used');
        this.state.usedClues.add(this.state.currentClue.id);
        this.state.gamePhase = 'RESOLVED';
        this.renderScoreboard();
        this.state.currentClue = null;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
}

window.app = new LiquidLogicV3();
