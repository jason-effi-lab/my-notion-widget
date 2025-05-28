const WORK_DURATION_SECONDS = 25 * 60;
const SHORT_BREAK_DURATION_SECONDS = 5 * 60;
const LONG_BREAK_DURATION_SECONDS = 15 * 60;
const POMODOROS_UNTIL_LONG_BREAK = 4;

const timeDisplay = document.getElementById('time-display');
const statusDisplay = document.getElementById('status-display');
const pomodoroCountDisplay = document.getElementById('pomodoro-count-display');
const playPauseButton = document.getElementById('play-pause-button');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const stopButton = document.getElementById('stop-button');
const skipButton = document.getElementById('skip-button');
const progressFill = document.getElementById('progress-fill');

const CIRCLE_RADIUS = 45; // SVG circle radius
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~282.74

let timerInterval = null;
let currentTotalDuration = WORK_DURATION_SECONDS; // Duration of the current phase
let remainingTime = WORK_DURATION_SECONDS;
let currentState = 'work'; // 'work', 'shortBreak', 'longBreak'
let pomodorosCompleted = 0;
let isPaused = true;

// --- Helper Functions ---
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateProgressCircle() {
    const progress = (remainingTime / currentTotalDuration);
    // Inverse progress for stroke-dashoffset if it starts full and empties
    const dashOffset = CIRCUMFERENCE * (1 - progress);
    progressFill.style.strokeDashoffset = dashOffset;
}


function updateDisplay() {
    timeDisplay.textContent = formatTime(remainingTime);
    pomodoroCountDisplay.textContent = `已完成番茄: ${pomodorosCompleted}`;

    let statusText = '';
    switch (currentState) {
        case 'work':
            statusText = '专注工作';
            break;
        case 'shortBreak':
            statusText = '短暂休息';
            break;
        case 'longBreak':
            statusText = '轻松一下';
            break;
        default:
            statusText = '准备开始';
    }
    statusDisplay.textContent = statusText;

    if (isPaused) {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    }
    updateProgressCircle();
}

function setPhase(phase) {
    currentState = phase;
    isPaused = true; // Always start new phases paused

    switch (phase) {
        case 'work':
            currentTotalDuration = WORK_DURATION_SECONDS;
            break;
        case 'shortBreak':
            currentTotalDuration = SHORT_BREAK_DURATION_SECONDS;
            break;
        case 'longBreak':
            currentTotalDuration = LONG_BREAK_DURATION_SECONDS;
            break;
    }
    remainingTime = currentTotalDuration;
    updateDisplay();
}

// --- Timer Logic ---
function startTimer() {
    if (remainingTime <= 0) return; // Don't start if time is up

    isPaused = false;
    updateDisplay();

    timerInterval = setInterval(() => {
        remainingTime--;
        updateDisplay();

        if (remainingTime < 0) { // Use < 0 to ensure it hits 00:00
            clearInterval(timerInterval);
            handleSessionEnd();
            remainingTime = 0; // Correct display if it overshot
            updateDisplay(); // Final update to show 00:00
        }
    }, 1000);
}

function pauseTimer() {
    isPaused = true;
    clearInterval(timerInterval);
    updateDisplay();
}

function stopAndResetCurrentPhase() {
    pauseTimer();
    remainingTime = currentTotalDuration; // Reset to current phase's total duration
    isPaused = true;
    updateDisplay();
}

function skipToNextState() {
    pauseTimer();
    handleSessionEnd(true); // Pass true to indicate a skip
}

function handleSessionEnd(skipped = false) {
    let playSound = true; // Flag to control sound playing
    if (currentState === 'work' && !skipped) {
        pomodorosCompleted++;
        if (pomodorosCompleted % POMODOROS_UNTIL_LONG_BREAK === 0) {
            setPhase('longBreak');
        } else {
            setPhase('shortBreak');
        }
    } else if (currentState === 'work' && skipped) {
        setPhase('shortBreak');
        playSound = false; // Don't play sound on user skip
    } else { // Current state was a break or skipped a break
        setPhase('work');
        if (skipped) playSound = false;
    }

    // Optionally play a sound
    if (playSound) {
        const sound = new Audio('notification.mp3'); // 替换 'notification.mp3' 为您的音频文件路径或URL
        sound.play();
        console.log("Session ended, play sound!");
    }
}


// --- Event Listeners ---
playPauseButton.addEventListener('click', () => {
    if (isPaused) {
        startTimer();
    } else {
        pauseTimer();
    }
});

stopButton.addEventListener('click', () => {
    stopAndResetCurrentPhase();
});

skipButton.addEventListener('click', () => {
    skipToNextState();
});


// --- Initial Setup ---
progressFill.style.strokeDasharray = CIRCUMFERENCE;
progressFill.style.strokeDashoffset = 0; // Start full initially
setPhase('work'); // Initialize to work phase (paused)
updateDisplay();