const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Bird
let bird = { x: 80, y: 300, width: 30, height: 30, velocity: 0 };
const gravity = 0.6;
const jump = -10;

// Pipes
let pipes = [];
const pipeWidth = 60;
const gapHeight = 140;

// Game
let score = 0;
let gameInterval;
let gameStarted = false;
let frameCount = 0;

// Start button
document.getElementById("startBtn").addEventListener("click", function() {
    startGame();
});

// Jump controls
document.addEventListener("keydown", function(e) {
    if (e.code === "Space" && gameStarted) {
        bird.velocity = jump;
    }
});

canvas.addEventListener("click", function() {
    if (gameStarted) {
        bird.velocity = jump;
    }
});

// Start game function
function startGame() {
    // Reset everything
    bird = { x: 80, y: 300, width: 30, height: 30, velocity: 0 };
    pipes = [];
    score = 0;
    gameStarted = true;
    frameCount = 0;
    
    document.getElementById("score").textContent = "Score: 0";
    document.getElementById("startBtn").textContent = "Restart Game";
    
    // Clear any existing interval
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // Start game loop
    gameInterval = setInterval(updateGame, 20);
}

// Update game function
function updateGame() {
    if (!gameStarted) return;
    
    frameCount++;
    
    // Clear canvas
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Update bird
    bird.velocity += gravity;
    bird.y += bird.velocity;
    
    // Draw bird
    drawBird();
    
    // Add new pipe every 100 frames
    if (frameCount % 100 === 0) {
        addPipe();
    }
    
    // Update pipes
    updatePipes();
    
    // Check collisions
    if (checkCollisions()) {
        gameOver();
    }
    
    // Check ground/ceiling
    if (bird.y + bird.height >= canvasHeight || bird.y <= 0) {
        gameOver();
    }
}

// Draw bird function
function drawBird() {
    // Bird body
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Bird wing (animated)
    ctx.fillStyle = "#FFA500";
    if (Math.floor(frameCount / 10) % 2 === 0) {
        ctx.fillRect(bird.x - 5, bird.y + 10, 15, 15);
    } else {
        ctx.fillRect(bird.x - 5, bird.y + 15, 15, 10);
    }
    
    // Bird eye
    ctx.fillStyle = "black";
    ctx.fillRect(bird.x + 20, bird.y + 8, 6, 6);
    
    // Bird beak
    ctx.fillStyle = "#FF4500";
    ctx.fillRect(bird.x + 30, bird.y + 12, 10, 6);
}

// Add new pipe function
function addPipe() {
    const minHeight = 50;
    const maxHeight = canvasHeight - gapHeight - 50;
    const pipeY = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    
    pipes.push({
        x: canvasWidth,
        y: pipeY,
        width: pipeWidth,
        passed: false
    });
}

// Update pipes function
function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        
        // Move pipe
        pipe.x -= 2;
        
        // Draw top pipe
        ctx.fillStyle = "#228B22";
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
        
        // Draw top pipe cap
        ctx.fillStyle = "#32CD32";
        ctx.fillRect(pipe.x - 5, pipe.y - 20, pipe.width + 10, 20);
        
        // Draw bottom pipe
        ctx.fillStyle = "#228B22";
        ctx.fillRect(pipe.x, pipe.y + gapHeight, pipe.width, canvasHeight);
        
        // Draw bottom pipe cap
        ctx.fillStyle = "#32CD32";
        ctx.fillRect(pipe.x - 5, pipe.y + gapHeight, pipe.width + 10, 20);
        
        // Check if bird passed the pipe
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score++;
            document.getElementById("score").textContent = "Score: " + score;
        }
        
        // Remove pipe if off screen
        if (pipe.x + pipe.width < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Check collisions function
function checkCollisions() {
    for (const pipe of pipes) {
        // Check collision with top pipe
        if (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + pipe.width &&
            bird.y < pipe.y) {
            return true;
        }
        
        // Check collision with bottom pipe
        if (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + pipe.width &&
            bird.y + bird.height > pipe.y + gapHeight) {
            return true;
        }
    }
    return false;
}

// Game over function
function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false;
    
    // Show game over
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = "white";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2 - 40);
    
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, canvasWidth / 2, canvasHeight / 2);
    
    ctx.font = "18px Arial";
    ctx.fillText("Click 'Restart Game' to play again", canvasWidth / 2, canvasHeight / 2 + 40);
}

// Draw initial screen
function drawStartScreen() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = "white";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Flappy Bird", canvasWidth / 2, 100);
    
    // Draw sample bird
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(150, 200, 30, 30);
    
    // Draw sample pipe
    ctx.fillStyle = "#228B22";
    ctx.fillRect(300, 0, 60, 150);
    ctx.fillRect(300, 290, 60, 310);
    
    ctx.font = "18px Arial";
    ctx.fillText("Press SPACE or CLICK to flap", canvasWidth / 2, 400);
    ctx.fillText("Click START GAME to play", canvasWidth / 2, 450);
}

// Initialize
drawStartScreen();
