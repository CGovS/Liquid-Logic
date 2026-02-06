import { categories } from './data.js';

class LiquidLogic {
    constructor() {
        this.teams = [];
        this.scores = [];
        this.penalties = []; // Track sips/shots count just for fun
        this.usedClues = new Set();
        this.currentClue = null;

        this.init();
    }

    init() {
        // DOM Elements
        this.screens = {
            landing: document.getElementById('landing-page'),
            board: document.getElementById('game-board')
        };
        this.inputs = document.querySelectorAll('#team-inputs input');
        this.startBtn = document.getElementById('start-btn');
        this.boardGrid = document.getElementById('board-grid');
        this.scoreboard = document.getElementById('scoreboard');

        // Modal Elements
        this.modal = document.getElementById('modal');
        this.modalPoints = document.getElementById('modal-points');
        this.modalPenalty = document.getElementById('modal-penalty');
        this.modalQuestion = document.getElementById('modal-question');
        this.modalAnswer = document.getElementById('modal-answer');
        this.revealBtn = document.getElementById('reveal-btn');
        this.scoringControls = document.getElementById('scoring-controls');
        this.teamButtonsContainer = document.getElementById('team-buttons');
        this.closeModalBtn = document.getElementById('close-modal');
        this.noWinnerBtn = document.getElementById('no-winner-btn');

        // Event Listeners
        this.startBtn.addEventListener('click', () => this.startGame());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.revealBtn.addEventListener('click', () => this.revealAnswer());
        this.noWinnerBtn.addEventListener('click', () => this.handleScore(-1)); // -1 means no winner
    }

    startGame() {
        const teamNames = Array.from(this.inputs).map(input => input.value.trim());
        const validTeams = teamNames.filter(name => name !== "");

        if (validTeams.length === 0) {
            alert("Enter at least one team name!");
            return;
        }

        this.teams = validTeams;
        this.scores = new Array(this.teams.length).fill(0);
        this.penalties = new Array(this.teams.length).fill(0); // Sips count

        this.switchScreen('board');
        this.renderScoreboard();
        this.renderGrid();
    }

    switchScreen(screenName) {
        Object.values(this.screens).forEach(el => el.classList.add('hidden'));
        this.screens[screenName].classList.remove('hidden');
        this.screens[screenName].classList.add('active');
    }

    renderScoreboard() {
        this.scoreboard.innerHTML = '';
        this.teams.forEach((team, index) => {
            const card = document.createElement('div');
            card.className = 'score-card';
            card.innerHTML = `
        <span class="team-name">${team}</span>
        <span class="team-score" id="score-${index}">0</span>
        <span class="team-penalty" id="penalty-${index}">0 sips</span>
      `;
            this.scoreboard.appendChild(card);
        });
    }

    updateScoreboard() {
        this.teams.forEach((_, index) => {
            document.getElementById(`score-${index}`).textContent = this.scores[index];
            document.getElementById(`penalty-${index}`).textContent = `${this.penalties[index]} sips`;
        });
    }

    renderGrid() {
        this.boardGrid.innerHTML = '';

        // Render Categories
        categories.forEach(cat => {
            const cell = document.createElement('div');
            cell.className = 'category-cell';
            cell.textContent = cat.title;
            this.boardGrid.appendChild(cell);
        });

        // Render Clues (Transposed: Row by Row for 5 values)
        // We have 5 categories, each has 5 clues.
        // Grid needs: Row 1 (200s), Row 2 (400s)...

        for (let i = 0; i < 5; i++) { // For each value level (0-4)
            categories.forEach((cat, catIndex) => {
                const clue = cat.clues[i];
                const cell = document.createElement('div');
                cell.className = 'clue-card';
                cell.textContent = clue.value;
                cell.dataset.catIndex = catIndex;
                cell.dataset.clueIndex = i;

                cell.addEventListener('click', (e) => this.handleClueClick(e, catIndex, i));

                this.boardGrid.appendChild(cell);
            });
        }
    }

    handleClueClick(e, catIndex, clueIndex) {
        const id = `${catIndex}-${clueIndex}`;
        if (this.usedClues.has(id)) return;

        this.currentClue = { ...categories[catIndex].clues[clueIndex], id, element: e.target };

        // Fill Modal
        this.modalPoints.textContent = `${this.currentClue.value} Points`;
        this.modalPenalty.textContent = `Penalty: ${this.currentClue.penalty}`;
        this.modalQuestion.textContent = this.currentClue.question;

        // Reset Modal State
        this.modalAnswer.textContent = this.currentClue.answer;
        this.modalAnswer.classList.add('hidden');
        this.revealBtn.classList.remove('hidden');
        this.scoringControls.classList.add('hidden');

        this.renderTeamButtons();

        this.modal.classList.remove('hidden');
    }

    renderTeamButtons() {
        this.teamButtonsContainer.innerHTML = '';
        this.teams.forEach((team, index) => {
            const btn = document.createElement('button');
            btn.className = 'chalk-btn small';
            btn.textContent = team;
            btn.addEventListener('click', () => this.handleScore(index));
            this.teamButtonsContainer.appendChild(btn);
        });
    }

    revealAnswer() {
        this.modalAnswer.classList.remove('hidden');
        this.revealBtn.classList.add('hidden');
        this.scoringControls.classList.remove('hidden');
    }

    handleScore(winnerIndex) {
        if (winnerIndex !== -1) {
            // Award points
            this.scores[winnerIndex] += this.currentClue.value;
        } else {
            // No winner (optional: could penalize everyone, but let's keep it simple)
        }

        // Convert points to "sips" roughly for the tracker? 
        // Request: 200 pts = 1 sip. So we can just add sips based on value.
        // Logic: If you win, maybe you GIVE sips? Or if you lose you TAKE?
        // User request: "Penalty Engine: 200 pts = 1 sip"
        // Usually in these games, the loser drinks.
        // But since we are only tracking the "Winner" of the question, 
        // let's say the winner gets points, and we update the "Sip Equivalent" of their score.
        // OR we track penalties for others? 
        // Let's stick to simple Score Points. The "Penalty Tracker" will track Sips *equivalent* of the score?
        // Actually, let's just track Sips = Score / 200.

        if (winnerIndex !== -1) {
            this.penalties[winnerIndex] = Math.floor(this.scores[winnerIndex] / 200);
        }

        this.updateScoreboard();

        // Mark as used
        this.usedClues.add(this.currentClue.id);
        this.currentClue.element.classList.add('used');
        this.currentClue.element.textContent = ''; // Hide value

        this.closeModal();
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.currentClue = null;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new LiquidLogic();
});
