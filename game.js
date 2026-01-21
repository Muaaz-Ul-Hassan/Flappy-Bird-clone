const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Bird properties
let bird = { x: 80, y: 300, width: 30, height: 30, velocity: 0 };
const gravity = 0.6;
const jump = -10;
let birdWingUp = true;

// Pipes properties
let pipes = [];
const pipeWidth = 50;
const gapHeight = 150;
let frame = 0;

// Score
let score = 0;
let gameInterval;
let gameOverFlag = false;
let gameStarted = false;

// Start button
document.getElementById("startBtn").addEventListener("click", startGame);

function startGame() {
    bird = { x: 80, y: 300, width: 30, height: 30, velocity: 0 };
    pipes = [];
    score = 0;
    frame = 0;
    gameOverFlag = false;
    gameStarted = true;
    document.getElementById("score").textContent = "Score: 0";
    document.getElementById("startBtn").textContent = "Restart Game";

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 20);
}

// Jump on key or click
document.addEventListener("keydown", function(e) {
    if (e.code === "Space" && gameStarted && !gameOverFlag) {
        bird.velocity = jump;
        birdWingUp = !birdWingUp; // Toggle wing for animation
    }
});

canvas.addEventListener("click", function() {
    if (gameStarted && !gameOverFlag) {
        bird.velocity = jump;
        birdWingUp = !birdWingUp; // Toggle wing for animation
    }
});

function drawBird() {
    // Bird body
    ctx.fillStyle = "#ffd700"; // Gold color
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Bird eye
    ctx.fillStyle = "black";
    ctx.fillRect(bird.x + 20, bird.y + 8, 6, 6);
    
    // Bird beak
    ctx.fillStyle = "#ff6600";
    ctx.fillRect(bird.x + 30, bird.y + 12, 10, 6);
    
    // Bird wing (animated)
    ctx.fillStyle = "#ffaa00";
    if (birdWingUp) {
        ctx.fillRect(bird.x + 5, bird.y + 5, 20, 15);
    } else {
        ctx.fillRect(bird.x + 5, bird.y + 10, 20, 15);
    }
}

function drawPipe(x, y) {
    // Top pipe
    ctx.fillStyle = "#228B22"; // Forest green
    ctx.fillRect(x, 0, pipeWidth, y);
    
    // Top pipe cap
    ctx.fillStyle = "#32CD32"; // Lime green
    ctx.fillRect(x - 5, y - 20, pipeWidth + 10, 20);
    
    // Bottom pipe
    ctx.fillStyle = "#228B22";
    ctx.fillRect(x, y + gapHeight, pipeWidth, canvasHeight - y - gapHeight);
    
    // Bottom pipe cap
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(x - 5, y + gapHeight, pipeWidth + 10, 20);
}

function checkCollision(pipe) {
    // Check collision with top pipe
    if (bird.x < pipe.x + pipeWidth && 
        bird.x + bird.width > pipe.x && 
        bird.y < pipe.y) {
        return true;
    }
    
    // Check collision with bottom pipe
    if (bird.x < pipe.x + pipeWidth && 
        bird.x + bird.width > pipe.x && 
        bird.y + bird.height > pipe.y + gapHeight) {
        return true;
    }
    
    return false;
}

function gameLoop() {
    // Clear canvas with sky color
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw clouds
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(100 + (frame % 400), 80, 20, 0, Math.PI * 2);
    ctx.arc(120 + (frame % 400), 80, 25, 0, Math.PI * 2);
    ctx.arc(140 + (frame % 400), 80, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird physics
    bird.velocity += gravity;
    bird.y += bird.velocity;
    
    // Draw bird
    drawBird();
    
    // Pipes logic - add new pipe every 100 frames
    if (frame % 100 === 0) {
        const minHeight = 50;
        const maxHeight = canvasHeight - gapHeight - 50;
        const pipeY = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
        pipes.push({ x: canvasWidth, y: pipeY });
    }
    
    // Update and draw pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        let pipe = pipes[i];
        pipe.x -= 2; // move left
        
        // Draw pipe
        drawPipe(pipe.x, pipe.y);
        
        // Check collision
        if (checkCollision(pipe)) {
            endGame();
            return;
        }
        
        // Increase score when pipe passed (bird's x position > pipe's right edge)
        if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
            pipe.passed = true;
            score++;
            document.getElementById("score").textContent = "Score: " + score;
        }
        
        // Remove offscreen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
    
    // Check floor and ceiling collision
    if (bird.y + bird.height > canvasHeight || bird.y < 0) {
        endGame();
        return;
    }
    
    frame++;
    
    // Animate wing every 10 frames
    if (frame % 10 === 0) {
        birdWingUp = !birdWingUp;
    }
}

function endGame() {
    clearInterval(gameInterval);
    gameOverFlag = true;
    gameStarted = false;
    
    // Draw game over text
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2 - 30);
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, canvasWidth / 2, canvasHeight / 2 + 10);
    ctx.fillText("Click Start to play again", canvasWidth / 2, canvasHeight / 2 + 40);
    
    document.getElementById("startBtn").textContent = "Start Game";
}

// Draw initial screen
function drawStartScreen() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Flappy Bird", canvasWidth / 2, 100);
    
    // Draw sample bird
    birdWingUp = true;
    drawBird();
    
    // Draw sample pipe
    drawPipe(300, 200);
    
    ctx.font = "18px Arial";
    ctx.fillText("Click SPACE or Click to Flap", canvasWidth / 2, 400);
    ctx.fillText("Click Start Game to Play", canvasWidth / 2, 450);
}

// Initialize
drawStartScreen();
