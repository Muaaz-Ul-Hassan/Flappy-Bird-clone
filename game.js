const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Bird properties
let bird = { x: 80, y: 300, width: 30, height: 30, velocity: 0 };
const gravity = 0.6;
const jump = -10;

// Pipes properties
let pipes = [];
const pipeWidth = 50;
const gapHeight = 150;
let frame = 0;

// Score
let score = 0;
let gameInterval;
let gameOverFlag = false;

// Start button
document.getElementById("startBtn").addEventListener("click", startGame);

function startGame() {
    bird = { x: 80, y: 300, width: 30, height: 30, velocity: 0 };
    pipes = [];
    score = 0;
    frame = 0;
    gameOverFlag = false;
    document.getElementById("score").textContent = "Score: 0";

    if(gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 20);
}

// Jump on key or click
document.addEventListener("keydown", function(e){
    if(e.code === "Space") bird.velocity = jump;
});
canvas.addEventListener("click", function(){
    bird.velocity = jump;
});

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Bird physics
    bird.velocity += gravity;
    bird.y += bird.velocity;

    // Draw bird
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Pipes logic
    if(frame % 90 === 0) { // every 90 frames
        const pipeY = Math.floor(Math.random() * (canvasHeight - gapHeight - 50)) + 25;
        pipes.push({ x: canvasWidth, y: pipeY });
    }

    for(let i=0; i<pipes.length; i++) {
        let p = pipes[i];
        p.x -= 2; // move left

        // Draw top pipe
        ctx.fillStyle = "green";
        ctx.fillRect(p.x, 0, pipeWidth, p.y);

        // Draw bottom pipe
        ctx.fillRect(p.x, p.y + gapHeight, pipeWidth, canvasHeight - p.y - gapHeight);

        // Check collision
        if(bird.x < p.x + pipeWidth && bird.x + bird.width > p.x &&
           (bird.y < p.y || bird.y + bird.height > p.y + gapHeight)) {
            endGame();
        }

        // Increase score when pipe passed
        if(p.x + pipeWidth === bird.x) {
            score++;
            document.getElementById("score").textContent = "Score: " + score;
        }
    }

    // Remove offscreen pipes
    pipes = pipes.filter(p => p.x + pipeWidth > 0);

    // Check floor and ceiling
    if(bird.y + bird.height > canvasHeight || bird.y < 0) {
        endGame();
    }

    frame++;
}

function endGame() {
    clearInterval(gameInterval);
    gameOverFlag = true;
    alert("Game Over! Score: " + score);
}

