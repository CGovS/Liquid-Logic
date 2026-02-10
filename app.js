console.log("App Module Evaluating...");
import { library } from './trivia_db.js';

class LiquidLogicV2 {
    constructor() {
        this.state = {
            theme: 'chalkboard',
            teams: ['Team 1', 'Team 2'],
            scores: [0, 0],
            sipsReceived: [0, 0],
            usedClues: new Set(),
            currentClue: null,
            winnerIndex: -1,
            selectedTheme: 'daily',
            currentBoard: [] // Generated at runtime
        };

        this.init();
    }

    init() {
        try {
            console.log("Initializing Liquid Logic V2.1...");
            console.log("Library loaded with", Object.keys(library.pool).length, "categories.");

            // 1. Setup Phase
            this.setupThemeSelector();
            this.setupTeamInputs();

            // 2. Event Listeners
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.addEventListener('click', () => this.startGame());

            const quitBtn = document.getElementById('quit-btn');
            if (quitBtn) quitBtn.addEventListener('click', () => this.quitGame());

            // Modal Interactions
            document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
            document.getElementById('reveal-btn').addEventListener('click', () => this.revealAnswer());
            document.getElementById('no-winner-btn').addEventListener('click', () => this.handleNoWinner());

            // Navigation - Force listener directly
            const homeBtnContainer = document.getElementById('home-btn-container');
            if (homeBtnContainer) {
                console.log("Attaching Home Button listener to CONTAINER");
                homeBtnContainer.addEventListener('click', (e) => {
                    console.log("Home Button Container Clicked");
                    this.resetGame();
                });
            } else {
                console.error("Home Button Container NOT FOUND");
            }

            // Preload voices
            this.loadVoices();

            /* 
               Remove this listener if it exists, or update init to call populateBoardSelect 
               Actually, I need to call populateBoardSelect in Setup Phase (Line 27 area)
            */
            this.populateBoardSelect();


            // Rules
            document.getElementById('how-to-play-btn').addEventListener('click', () => {
                document.getElementById('rules-modal').classList.remove('hidden');
            });
            document.getElementById('close-rules').addEventListener('click', () => {
                document.getElementById('rules-modal').classList.add('hidden');
            });
        } catch (error) {
            console.error("Initialization Failed:", error);
            alert("Game failed to initialize: " + error.message);
        }
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
            console.log("Selected Theme:", this.state.selectedTheme);
        });
    }

    setupThemeSelector() {
        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // UI Update
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Logic Update
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
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (container.children.length < 6) {
                    const num = container.children.length + 1;
                    container.insertAdjacentHTML('beforeend', inputTemplate(num));
                }
            });
        }

        const removeBtn = document.getElementById('remove-team-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (container.children.length > 2) {
                    container.removeChild(container.lastElementChild);
                }
            });
        }
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
            window.speechSynthesis.cancel(); // Stop previous
            const utterance = new SpeechSynthesisUtterance(text);

            // Ensure voices are loaded
            let voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) {
                // Try to wait for voices (though this is async, for this call we might just use default)
                // Ideally we cache this on init.
                // Fallback:
            }

            // Retry getting voices if we have cached ones or try to find them
            if (this.cachedVoices && this.cachedVoices.length > 0) {
                voices = this.cachedVoices;
            }

            const preferredVoice = voices.find(v => v.name === 'Google US English') ||
                voices.find(v => v.name === 'Samantha') ||
                voices.find(v => v.lang === 'en-US');

            if (preferredVoice) utterance.voice = preferredVoice;

            // Adjust rate/pitch for more natural feel
            utterance.rate = 0.9;
            utterance.pitch = 1.0;

            window.speechSynthesis.speak(utterance);
        }
    }

    loadVoices() {
        if ('speechSynthesis' in window) {
            const load = () => {
                this.cachedVoices = window.speechSynthesis.getVoices();
                console.log("Voices loaded:", this.cachedVoices.length);
            };
            window.speechSynthesis.onvoiceschanged = load;
            load(); // Try immediately too
        }
    }

    generateBoard() {
        console.log("Generating board for theme:", this.state.selectedTheme || "daily");

        let availableCategories = [];
        let boardName = "Randomized Daily Mix";

        // Filter Categories
        if (this.state.selectedTheme && this.state.selectedTheme !== 'daily' && library.themes[this.state.selectedTheme]) {
            const themeData = library.themes[this.state.selectedTheme];
            boardName = themeData.name;
            availableCategories = themeData.categories;
        } else {
            availableCategories = Object.keys(library.pool);
        }

        // Shuffle and pick 5 categories
        // Simple Shuffle
        const shuffledCats = availableCategories.sort(() => 0.5 - Math.random()).slice(0, 5);

        const categories = [];
        shuffledCats.forEach(catName => {
            const poolQuestions = library.pool[catName];

            // Select one question for each difficulty level (1-5)
            const selectedQs = [];

            for (let level = 1; level <= 5; level++) {
                // Filter for specific difficulty
                const tierQuestions = poolQuestions.filter(q => q.difficulty === level);

                if (tierQuestions.length > 0) {
                    // Pick a random one from this tier
                    const randomQ = tierQuestions[Math.floor(Math.random() * tierQuestions.length)];
                    selectedQs.push(randomQ);
                } else {
                    // Fallback: Pick any unused question
                    console.warn(`No difficulty ${level} found for ${catName}, using random fallback.`);
                    const remaining = poolQuestions.filter(q => !selectedQs.includes(q));
                    if (remaining.length > 0) {
                        const randomFallback = remaining[Math.floor(Math.random() * remaining.length)];
                        selectedQs.push(randomFallback);
                    }
                }
            }

            // Assign values
            const values = [200, 400, 600, 800, 1000];
            const clues = selectedQs.map((q, i) => ({
                ...q,
                value: values[i],
                penalty: this.calculatePenalty(values[i])
            }));

            categories.push({ title: catName, clues: clues });
        });

        this.state.currentBoard = { name: boardName, categories: categories };
        console.log("Board Generated:", this.state.currentBoard);
    }

    startGame() {
        // Capture Teams
        const inputs = document.querySelectorAll('.team-input');
        this.state.teams = Array.from(inputs).map(i => i.value.trim() || `Team ${Math.random().toString().substr(2, 3)}`);

        if (this.state.teams.length < 2) {
            alert("Please add at least 2 teams!");
            return;
        }

        // Reset Scores
        this.state.scores = new Array(this.state.teams.length).fill(0);
        this.state.sipsReceived = new Array(this.state.teams.length).fill(0);
        this.state.usedClues.clear();

        // Generate Board
        this.generateBoard();

        // Render Board
        this.renderHeader();
        this.renderScoreboard();
        this.renderGrid();

        // Switch Screen
        document.getElementById('landing-page').classList.remove('active');
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('game-board').classList.remove('hidden');
        document.getElementById('game-board').classList.add('active');
    }

    quitGame() {
        if (confirm("Are you sure you want to quit?")) {
            this.resetGame();
        }
    }

    resetGame() {
        // Instant Reset (User requested "it doesn't work", assumption: confirm dialog was blocked/ignored)
        console.log("Resetting Game - Instant");
        document.getElementById('game-board').classList.remove('active');
        document.getElementById('game-board').classList.add('hidden');
        document.getElementById('landing-page').classList.remove('hidden');
        document.getElementById('landing-page').classList.add('active');

        // Optional: Reload to truly reset state
        // location.reload(); 
    }

    /* --- RENDERERS --- */

    renderHeader() {
        const board = this.state.currentBoard;
        if (board) {
            document.getElementById('current-board-name').textContent = board.name;
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

        if (!boardData || !boardData.categories) {
            console.error("No board data rendered!");
            return;
        }

        // Headers
        boardData.categories.forEach(cat => {
            const cell = document.createElement('div');
            cell.className = 'category-cell';
            cell.textContent = cat.title;
            grid.appendChild(cell);
        });

        // Cells
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
        const boardData = this.state.currentBoard;
        const clue = boardData.categories[catIndex].clues[clueIndex];

        this.state.currentClue = { ...clue, id, element };

        // TTS
        this.speak(clue.question);

        // Update Modal Content
        document.getElementById('modal-points').textContent = `${clue.value}`;
        document.getElementById('modal-penalty').textContent = `Penalty: ${clue.penalty}`;
        document.getElementById('modal-question').textContent = clue.question;
        document.getElementById('modal-answer').textContent = clue.answer;

        // Reset View State
        document.getElementById('modal-phase-question').classList.remove('hidden');
        document.getElementById('modal-phase-answer').classList.add('hidden');
        document.getElementById('modal-phase-sips').classList.add('hidden');

        document.getElementById('modal').classList.remove('hidden');
    }

    handleNoWinner() {
        // No one got it right, no sips distributed
        this.closeModalAndMarkUsed();
    }

    handleWrongAnswer(index) {
        // Deduct Points
        this.state.scores[index] -= this.state.currentClue.value;
        this.renderScoreboard();
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

            // Correct Button
            const btnCorrect = document.createElement('button');
            btnCorrect.className = 'action-btn small';
            btnCorrect.style.fontSize = "1rem";
            btnCorrect.style.marginBottom = "5px";
            btnCorrect.textContent = `${team} (Correct)`;
            btnCorrect.addEventListener('click', () => this.handleWinnerSelected(index));

            // Wrong Button (Minus Function)
            const btnWrong = document.createElement('button');
            btnWrong.className = 'secondary-btn small';
            btnWrong.style.fontSize = "0.8rem";
            btnWrong.style.padding = "5px 10px";
            btnWrong.style.borderColor = "#ff6b6b";
            btnWrong.style.color = "#ff6b6b";
            btnWrong.textContent = "Wrong (-)";
            btnWrong.addEventListener('click', () => {
                this.handleWrongAnswer(index);
                // Visual feedback?
                btnWrong.disabled = true;
                btnWrong.textContent = "Points Deducted";
            });

            wrapper.appendChild(btnCorrect);
            wrapper.appendChild(btnWrong);
            container.appendChild(wrapper);
        });
    }

    handleWinnerSelected(index) {
        this.state.winnerIndex = index;
        // Award Points
        this.state.scores[index] += this.state.currentClue.value;

        // Transition to Sip Distribution
        this.startSipDistribution();
    }

    startSipDistribution() {
        document.getElementById('modal-phase-answer').classList.add('hidden');
        document.getElementById('modal-phase-sips').classList.remove('hidden');

        const winnerName = this.state.teams[this.state.winnerIndex];
        // Ensure points is a number (it should be, but let's be safe)
        const points = parseInt(this.state.currentClue.value, 10);
        const amount = Math.floor(points / 200);
        let penaltyText = "";

        // Grammar Logic
        // Special Case: 1000 points = "this 1 Shot"
        if (points === 1000) {
            penaltyText = "this 1 Shot";
        }
        // Normal Cases
        else if (amount === 1) {
            penaltyText = "this 1 sip";
        } else {
            penaltyText = `these ${amount} sips`;
        }

        document.getElementById('sip-instruction').textContent = `${winnerName}, who must drink ${penaltyText}?`;

        // Render Target Buttons (Exclude Winner? Usually yes, but self-sabotage is fun. Let's allowing targeting anyone).
        const container = document.getElementById('target-buttons');
        container.innerHTML = '';
        this.state.teams.forEach((team, index) => {
            // Don't disable winner, they can drink their own if they want!
            const btn = document.createElement('button');
            btn.className = 'action-btn small';
            btn.style.margin = "5px";
            btn.style.background = "#ff6b6b";
            btn.style.fontSize = "1rem";
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
        // UI Updates
        document.getElementById('modal').classList.add('hidden');
        this.state.currentClue.element.classList.add('used');
        this.state.usedClues.add(this.state.currentClue.id);

        this.renderScoreboard();
        this.state.currentClue = null;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
}

// Init
console.log("Instantiating LiquidLogicV2.1");
window.app = new LiquidLogicV2();
