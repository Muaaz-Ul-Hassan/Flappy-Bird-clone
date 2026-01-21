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
    y: canvas.height / 2,
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
const pipeWidth = 60;
const pipeGap = 150;
const pipeSpeed = 3;

// Initialize
function init() {
    // Set high score
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
    
    // Draw initial screen
    drawStartScreen();
}

// Start Game
function startGame() {
    // Reset game state
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameRunning = true;
    
    // Update UI
    scoreElement.textContent = score;
    gameOverScreen.style.display = 'none';
    startBtn.innerHTML = '<i class="fas fa-play"></i> Game Running';
    startBtn.style.background = 'linear-gradient(to right, #FF416C, #FF4B2B)';
    
    // Start game loop
    gameLoop();
}

// Game Loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update bird
    updateBird();
    
    // Update pipes
    updatePipes();
    
    // Draw everything
    drawBird();
    drawPipes();
    drawGround();
    
    // Check collisions
    if (checkCollisions()) {
        gameOver();
        return;
    }
    
    // Next frame
    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Update Bird
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
}

// Draw Bird
function drawBird() {
    // Bird body
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Bird wing (animated)
    ctx.fillStyle = '#FFA500';
    const wingY = bird.y + (Math.sin(frameCount * 0.2) * 3);
    ctx.fillRect(bird.x - 8, wingY + 5, 15, 12);
    
    // Bird eye
    ctx.fillStyle = 'black';
    ctx.fillRect(bird.x + 25, bird.y + 8, 6, 6);
    
    // Bird beak
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(bird.x + 35, bird.y + 12, 15, 8);
}

// Update Pipes
function updatePipes() {
    // Add new pipe every 120 frames
    if (frameCount % 120 === 0) {
        addPipe();
    }
    
    // Move and check pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        let pipe = pipes[i];
        pipe.x -= pipeSpeed;
        
        // Remove off-screen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
            continue;
        }
        
        // Check if bird passed the pipe
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = score;
        }
    }
}

// Add New Pipe
function addPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - 50;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        passed: false
    });
}

// Draw Pipes
function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#2a9d8f';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // Top pipe cap
        ctx.fillStyle = '#1d7a6b';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        const bottomY = pipe.topHeight + pipeGap;
        ctx.fillRect(pipe.x, bottomY, pipeWidth, canvas.height - bottomY);
        
        // Bottom pipe cap
        ctx.fillStyle = '#1d7a6b';
        ctx.fillRect(pipe.x - 5, bottomY, pipeWidth + 10, 20);
    });
}

// Draw Ground
function drawGround() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Ground pattern
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i, canvas.height - 20, 20, 5);
    }
}

// Check Collisions
function checkCollisions() {
    // Check ground and ceiling
    if (bird.y + bird.height > canvas.height - 20 || bird.y < 0) {
        return true;
    }
    
    // Check pipe collisions
    for (let pipe of pipes) {
        // Check top pipe collision
        if (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + pipeWidth && 
            bird.y < pipe.topHeight) {
            return true;
        }
        
        // Check bottom pipe collision
        const bottomY = pipe.topHeight + pipeGap;
        if (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + pipeWidth && 
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
    
    // Reset button
    startBtn.innerHTML = '<i class="fas fa-redo"></i> Restart Game';
    startBtn.style.background = 'linear-gradient(to right, #00b09b, #96c93d)';
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
