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
let bird = {
    x: 80,
    y: 300,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jumpPower: -10
};

let pipes = [];
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let gameRunning = false;
let frameCount = 0;
let lastTime = 0;

// Constants
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 3; // FIXED: Constant speed
const PIPE_INTERVAL = 1500; // Every 1.5 seconds

// Initialize
function init() {
    highScoreElement.textContent = highScore;
    
    // Event Listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    
    // Jump controls
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && gameRunning) {
            bird.velocity = bird.jumpPower;
        }
    });
    
    canvas.addEventListener('click', function() {
        if (gameRunning) {
            bird.velocity = bird.jumpPower;
        }
    });
    
    drawStartScreen();
}

// Start Game
function startGame() {
    // Reset everything
    bird.y = 300;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameRunning = true;
    frameCount = 0;
    lastTime = 0;
    
    scoreElement.textContent = score;
    gameOverScreen.style.display = 'none';
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop(currentTime) {
    if (!gameRunning) return;
    
    // Calculate delta time for consistent speed
    const deltaTime = lastTime ? currentTime - lastTime : 16; // Approx 60 FPS
    lastTime = currentTime;
    
    // Clear canvas
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update bird
    updateBird(deltaTime);
    
    // Update pipes
    updatePipes(deltaTime);
    
    // Draw everything
    drawBird();
    drawPipes();
    drawGround();
    
    // Check collisions
    if (checkCollisions()) {
        gameOver();
        return;
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Update Bird
function updateBird(deltaTime) {
    // Apply gravity (scaled by deltaTime for consistent speed)
    bird.velocity += bird.gravity * (deltaTime / 16);
    bird.y += bird.velocity * (deltaTime / 16);
}

// Update Pipes
function updatePipes(deltaTime) {
    // Add new pipe at regular interval
    if (frameCount % Math.floor(PIPE_INTERVAL / 16) === 0) {
        addPipe();
    }
    
    // Move pipes (constant speed)
    for (let i = pipes.length - 1; i >= 0; i--) {
        let pipe = pipes[i];
        pipe.x -= PIPE_SPEED * (deltaTime / 16);
        
        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
            continue;
        }
        
        // Check if bird passed the pipe
        if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = score;
        }
    }
    
    frameCount++;
}

// Add New Pipe
function addPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - PIPE_GAP - 100;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        passed: false
    });
}

// Draw Bird
function drawBird() {
    // Bird body
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Bird wing
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(bird.x - 8, bird.y + 10, 15, 12);
    
    // Bird eye
    ctx.fillStyle = 'black';
    ctx.fillRect(bird.x + 25, bird.y + 8, 6, 6);
    
    // Bird beak
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(bird.x + 35, bird.y + 12, 15, 8);
}

// Draw Pipes
function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#2a9d8f';
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        
        // Top pipe cap
        ctx.fillStyle = '#1d7a6b';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 15, PIPE_WIDTH + 10, 15);
        
        // Bottom pipe
        const bottomY = pipe.topHeight + PIPE_GAP;
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, canvas.height - bottomY);
        
        // Bottom pipe cap
        ctx.fillRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 15);
    });
}

// Draw Ground
function drawGround() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i, canvas.height - 30, 20, 10);
    }
}

// Check Collisions
function checkCollisions() {
    // Check ground and ceiling
    if (bird.y + bird.height > canvas.height - 30 || bird.y < 0) {
        return true;
    }
    
    // Check pipe collisions
    for (let pipe of pipes) {
        // Check top pipe collision
        if (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + PIPE_WIDTH && 
            bird.y < pipe.topHeight) {
            return true;
        }
        
        // Check bottom pipe collision
        const bottomY = pipe.topHeight + PIPE_GAP;
        if (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + PIPE_WIDTH && 
            bird.y + bird.height > bottomY) {
            return true;
        }
    }
    
    return false;
}

// Game Over
function gameOver() {
    gameRunning = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('flappyHighScore', highScore);
    }
    
    // Show game over screen
    finalScoreElement.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'flex';
}

// Draw Start Screen
function drawStartScreen() {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sample bird
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(150, 250, 40, 30);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(142, 260, 15, 12);
    
    // Draw sample pipe
    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(300, 100, 60, 200);
    ctx.fillRect(300, 350, 60, 250);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Flappy Bird', canvas.width / 2, 100);
    
    ctx.font = '20px Arial';
    ctx.fillText('Click START GAME to play', canvas.width / 2, canvas.height - 100);
    ctx.fillText('Press SPACE or CLICK to flap', canvas.width / 2, canvas.height - 60);
}

// Initialize game
init();
