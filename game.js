// Game Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game Variables
let bird = { x: 80, y: 300, width: 40, height: 30, velocity: 0, gravity: 0.5, jumpPower: -10 };
let pipes = [];
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let gameRunning = false;
let lastTime = 0;
let lastPipeTime = 0;

// Constants
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const PIPE_INTERVAL = 1500; // milliseconds

// Initialize
function init() {
    highScoreElement.textContent = `High Score: ${highScore}`;

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    document.addEventListener('keydown', (e) => {
        if ((e.code === 'Space' || e.code === 'ArrowUp') && gameRunning) bird.velocity = bird.jumpPower;
    });

    canvas.addEventListener('click', () => {
        if (gameRunning) bird.velocity = bird.jumpPower;
    });

    drawStartScreen();
}

// Start Game
function startGame() {
    bird.y = 300;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameRunning = true;
    lastTime = 0;
    lastPipeTime = 0;

    scoreElement.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'none';
    startBtn.style.display = 'none';

    requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop(currentTime) {
    if (!gameRunning) return;

    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    updatePipes(currentTime);

    drawBird();
    drawPipes();
    drawGround();

    if (checkCollisions()) {
        gameOver();
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Update Pipes
function updatePipes(currentTime) {
    if (currentTime - lastPipeTime > PIPE_INTERVAL) {
        addPipe();
        lastPipeTime = currentTime;
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= PIPE_SPEED;

        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
            continue;
        }

        if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = `Score: ${score}`;
        }
    }
}

// Add Pipe
function addPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - PIPE_GAP - 100;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    pipes.push({ x: canvas.width, topHeight, passed: false });
}

// Draw Bird
function drawBird() {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(bird.x - 8, bird.y + 10, 15, 12);
    ctx.fillStyle = 'black';
    ctx.fillRect(bird.x + 25, bird.y + 8, 6, 6);
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(bird.x + 35, bird.y + 12, 15, 8);
}

// Draw Pipes
function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = '#2a9d8f';
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillStyle = '#1d7a6b';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 15, PIPE_WIDTH + 10, 15);
        const bottomY = pipe.topHeight + PIPE_GAP;
        ctx.fillStyle = '#2a9d8f';
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, canvas.height - bottomY);
        ctx.fillRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 15);
    });
}

// Draw Ground
function drawGround() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < canvas.width; i += 40) ctx.fillRect(i, canvas.height - 30, 20, 10);
}

// Check Collisions
function checkCollisions() {
    if (bird.y + bird.height > canvas.height - 30 || bird.y < 0) return true;
    for (let pipe of pipes) {
        const bottomY = pipe.topHeight + PIPE_GAP;
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + PIPE_WIDTH &&
            (bird.y < pipe.topHeight || bird.y + bird.height > bottomY)
        ) return true;
    }
    return false;
}

// Game Over
function gameOver() {
    gameRunning = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
    }
    highScoreElement.textContent = `High Score: ${highScore}`;
    finalScoreElement.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'flex';
    startBtn.style.display = 'block';
}

// Start Screen
function drawStartScreen() {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(150, 250, 40, 30);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(142, 260, 15, 12);
    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(300, 100, 60, 200);
    ctx.fillRect(300, 350, 60, 250);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Flappy Bird', canvas.width / 2, 100);
    ctx.font = '20px Arial';
    ctx.fillText('Click START GAME to play', canvas.width / 2, canvas.height - 100);
    ctx.fillText('Press SPACE or CLICK to flap', canvas.width / 2, canvas.height - 60);
}

init();
