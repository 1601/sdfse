const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const skip20Button = document.getElementById('skip-20-button');
const skip5Button = document.getElementById('skip-5-button');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
const defuseIndicator = document.getElementById('defuse-indicator');

let timerInterval;
let timer = 45;
let startTime;
let defuseStart = null;

function startGame() {
    timer = 45;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timer -= 0.01;
        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
        updateTimerDisplay();
    }, 10);

    playAudio('spike.mp3');
}

function updateTimerDisplay() {
    timerDisplay.textContent = timer.toFixed(2);
}

function endGame() {
    const finalScore = calculateScore();
    scoreDisplay.textContent = `Score: ${finalScore.toFixed(2)}`;
    saveBestScore(finalScore);
}

function calculateScore() {
    if (defuseStart === null) {
        return -timer;
    }
    return 7 - (timer - defuseStart);
}

function saveBestScore(score) {
    let bestScore = localStorage.getItem('bestScore');
    if (bestScore === null || score < parseFloat(bestScore)) {
        localStorage.setItem('bestScore', score);
        bestScoreDisplay.textContent = `Best Score: ${score.toFixed(2)}`;
    } else {
        bestScoreDisplay.textContent = `Best Score: ${parseFloat(bestScore).toFixed(2)}`;
    }
}

function resetGame() {
    clearInterval(timerInterval);
    timer = 45;
    updateTimerDisplay();
    defuseStart = null;
    scoreDisplay.textContent = 'Score: 0.00';
}

function skipSeconds(seconds) {
    timer -= seconds;
}

function playAudio(src) {
    const audio = new Audio(src);
    audio.play();
}

document.addEventListener('keydown', (e) => {
    if (e.key === '4') {
        if (timer === 45) {
            startGame();
        } else {
            if (defuseStart === null) {
                defuseStart = timer;
                playAudio('spikedefuse.mp3');
                document.querySelector('#defuse-indicator::before').style.width = '100%';
            }
        }
    }
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);
skip20Button.addEventListener('click', () => skipSeconds(20));
skip5Button.addEventListener('click', () => skipSeconds(5));

// Load best score on page load
document.addEventListener('DOMContentLoaded', () => {
    const bestScore = localStorage.getItem('bestScore');
    if (bestScore !== null) {
        bestScoreDisplay.textContent = `Best Score: ${parseFloat(bestScore).toFixed(2)}`;
    }
});
