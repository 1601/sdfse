const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const skip20Button = document.getElementById('skip-20-button');
const skip5Button = document.getElementById('skip-5-button');
const defuseButton = document.getElementById('defuse-button');
const bestScoreDisplay = document.getElementById('best-score');
const lastScoreDisplay = document.getElementById('last-score');
const defuseIndicator = document.getElementById('defuse-indicator');
const defuseProgress = document.getElementById('defuse-progress');
const instructions = document.getElementById('instructions');
const runScoreDisplay = document.getElementById('run-score');
const debugInfo = document.getElementById('debug-info');
const debugToggle = document.getElementById('debug-toggle');
const debugBefore = document.getElementById('debug-before');
const resetRecordsButton = document.getElementById('reset-records-button');	

const currentTimerDisplay = document.getElementById('current-timer');
const defuseStartDisplay = document.getElementById('defuse-start');
const heldTimeDisplay = document.getElementById('held-time');
const currentDefuseTimeDisplay = document.getElementById('current-defuse-time');

let timerInterval;
let timer = 49;
let startTime;
let defuseStart = null;
let audio;
let defuseAudio;
let defusing = false;
let defuseTime = 0;
let defuseHeldTime = 0;

// Add event listener for the title click to show debug info after 3 clicks
let titleClickCount = 0;
const title = document.querySelector('h1');

// Add reset records button functionality
resetRecordsButton.addEventListener('click', () => {
    localStorage.removeItem('bestScore');
    localStorage.removeItem('lastScore');
    bestScoreDisplay.textContent = 'Best Score: 0.00';
    lastScoreDisplay.textContent = 'Last Score: 0.00';
});

title.addEventListener('click', () => {
    titleClickCount += 1;
    if (titleClickCount >= 3) {
        debugBefore.style.display = 'block';
    }
});

// Make it mobile-friendly with defuse button
defuseButton.addEventListener('mousedown', (e) => {
    if (defusing) {
        stopDefuse();
    } else if (timer < 49) {
        defuseStart = timer;
        startDefuse();
    }
});

defuseButton.addEventListener('mouseup', (e) => {
    stopDefuse();
});

function startGame() {
    resetGame();
    timer = 49;
    playAudio('spike.mp3');
    instructions.style.display = 'none';
    runScoreDisplay.style.display = 'none';
    startButton.style.display = 'none';
    restartButton.style.display = 'inline';
    skip20Button.style.display = 'inline';
    skip5Button.style.display = 'inline';
    defuseButton.style.display = 'inline';
    defuseIndicator.style.display = 'block';
    updateDebugInfo();
    startTimer();
}

function handleKeyPress(e) {
    if (e.key === ' ') {
        if (timer === 49 || defuseStart === null) {
            startGame();
        }
    } else if (e.key === '4') {
        if (!defusing && timer < 49) {
            defuseStart = timer;
            startDefuse();
        }
    }
}

function handleKeyRelease(e) {
    if (e.key === '4') {
        stopDefuse();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer -= 0.01;
        updateDebugInfo();
        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 10);
}

function calculateScore() {
    if (defuseStart === null) {
        return -timer;
    }
    return Math.abs(timer); // The score is based on the timer at the end
}


function endGame() {
    audio.pause();
    const finalScore = calculateScore();
    console.log('timer', timer);
    console.log('defuseStart', defuseStart);
    console.log('defuseHeldTime', defuseHeldTime);
    console.log('defuseTime', defuseTime);
    console.log('finalScore', finalScore);
    saveBestScore(finalScore);
    saveLastScore(finalScore);
    runScoreDisplay.textContent = `${finalScore.toFixed(2)}`;
    runScoreDisplay.style.display = 'block';
    resetGame();
   
    updateDebugInfo();
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

function saveLastScore(score) {
    localStorage.setItem('lastScore', score);
    lastScoreDisplay.textContent = `Last Score: ${score.toFixed(2)}`;
}

function skipSeconds(seconds) {
    if (audio) {
        audio.currentTime += seconds;
    }
    timer -= seconds;
    updateDebugInfo();
}

function playAudio(src, startAt = 0) {
    audio = new Audio(src);
    audio.currentTime = startAt;
    audio.play();
}

function playDefuseAudio() {
    defuseAudio = new Audio('spikedefuse.mp3');
    defuseAudio.currentTime = 10;
    defuseAudio.play();
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);
skip20Button.addEventListener('click', () => skipSeconds(20));
skip5Button.addEventListener('click', () => skipSeconds(5));

// Toggle debug info visibility
debugToggle.addEventListener('change', () => {
    debugInfo.style.display = debugToggle.checked ? 'block' : 'none';
});

// Load best score and last score on page load
document.addEventListener('DOMContentLoaded', () => {
    const bestScore = localStorage.getItem('bestScore');
    if (bestScore !== null) {
        bestScoreDisplay.textContent = `Best Score: ${parseFloat(bestScore).toFixed(2)}`;
    }
    const lastScore = localStorage.getItem('lastScore');
    if (lastScore !== null) {
        lastScoreDisplay.textContent = `Last Score: ${parseFloat(lastScore).toFixed(2)}`;
    }
    updateDebugInfo();
});

function startDefuse() {
    // if (defuseHeldTime >= 3.5) {
    //     defuseTime = 3.5;
    // } else {
    //     defuseTime = 0;
    // }
    defuseTime = 0;
    defusing = true;
    playDefuseAudio();
    updateDefuseIndicator();
    updateDebugInfo();
}

function stopDefuse() {
    defusing = false;
    if (defuseTime < 3.5 && defuseHeldTime !== 3.5) {
        defuseHeldTime = 0; // Reset if less than 3.5 seconds
    } else {
        defuseHeldTime = 3.5; // Retain if at least 3.5 seconds
    }
    // defuseTime = 0; // Reset current defuse time 
    if (defuseAudio) {
        defuseAudio.pause();
        defuseAudio.currentTime = 0;
    }
    updateDefuseIndicator();
    updateDebugInfo();
}

function updateDefuseIndicator() {
    let progress;
    if (defusing) {
        defuseTime += 0.01;
        progress = (defuseHeldTime + defuseTime) / 7 * 100;
        progress = Math.min(Math.max(progress, 0), 100);
        defuseProgress.style.width = `${progress}%`;
        document.getElementById('defuse-held-time').textContent = `Defuse Held Time: ${(defuseHeldTime + defuseTime).toFixed(2)}s`;
        if (defuseTime + defuseHeldTime >= 7) {
            clearInterval(timerInterval);
            endGame();
        } else {
            setTimeout(updateDefuseIndicator, 10); // Set frame rate to 100 fps
        }
    } else {
        progress = defuseHeldTime / 7 * 100;
        defuseProgress.style.width = `${progress}%`;
        document.getElementById('defuse-held-time').textContent = `Defuse Held Time: ${defuseHeldTime.toFixed(2)}s`;
    }
}

function updateDebugInfo() {
    currentTimerDisplay.textContent = timer.toFixed(2);
    defuseStartDisplay.textContent = defuseStart !== null ? defuseStart.toFixed(2) : 'N/A';
    heldTimeDisplay.textContent = defuseHeldTime.toFixed(2);
    currentDefuseTimeDisplay.textContent = defuseTime.toFixed(2);
}

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        if (timer === 49 || defuseStart === null) {
            startGame();
        }
    } else if (e.key === '4') {
        if (!defusing && timer < 49) {
            defuseStart = timer;
            startDefuse();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === '4') {
        stopDefuse();
    }
});

function resetGame() {
    instructions.style.display = 'block';
    startButton.style.display = 'inline';
    restartButton.style.display = 'none';
    skip20Button.style.display = 'none';
    skip5Button.style.display = 'none';
    defuseButton.style.display = 'none';
    defuseIndicator.style.display = 'none';
    document.removeEventListener('keydown', handleKeyPress);
    document.removeEventListener('keyup', handleKeyRelease);
    defuseButton.removeEventListener('mousedown', (e) => {
        if (defusing) {
            stopDefuse();
        } else if (timer < 49) {
            defuseStart = timer;
            startDefuse();
        }
    });
    defuseButton.removeEventListener('mouseup', (e) => {
        stopDefuse();
    });
    clearInterval(timerInterval);
    timer = 49;
    defuseStart = null;
    defusing = false;
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    if (defuseAudio) {
        defuseAudio.pause();
        defuseAudio.currentTime = 0;
    }
    defuseIndicator.style.display = 'none';
    defuseProgress.style.width = '0';
    defuseHeldTime = 0;
    document.getElementById('defuse-held-time').textContent = `Defuse Held Time: ${defuseHeldTime.toFixed(2)}s`;
    updateDebugInfo();
}


// Add modal functionality
const creditsLink = document.getElementById('credits-link');
const modal = document.getElementById('credits-modal');
const span = document.getElementsByClassName('close')[0];

creditsLink.onclick = function() {
    modal.style.display = 'block';
}

span.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

const bugsLink = document.getElementById('bugs-link');
const bugsModal = document.getElementById('bugs-modal');
const bugsSpan = document.getElementsByClassName('close')[1];

bugsLink.onclick = function() {
    bugsModal.style.display = 'block';
}

bugsSpan.onclick = function() {
    bugsModal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === bugsModal) {
        bugsModal.style.display = 'none';
    }
}