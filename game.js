const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bird = { x: 50, y: 300, width: 30, height: 30, vy: 0 };
const pipes = [];
let score = 0;
let gameRunning = false;

// Start button
document.getElementById("startBtn").onclick = startGame;

// Jump on space or click
document.onkeydown = function(e) {
    if (e.code === "Space" && gameRunning) bird.vy = -10;
};
canvas.onclick = function() {
    if (gameRunning) bird.vy = -10;
};

function startGame() {
    // Reset everything
    bird.y = 300;
    bird.vy = 0;
    pipes.length = 0;
    score = 0;
    gameRunning = true;
    
    document.getElementById("score").textContent = "Score: 0";
    document.getElementById("startBtn").textContent = "Restart";
    
    // Start game loop
    if (window.gameLoop) cancelAnimationFrame(window.gameLoop);
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;
    
    // Clear screen
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, 400, 600);
    
    // Update bird
    bird.vy += 0.5;
    bird.y += bird.vy;
    
    // Draw bird
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    ctx.fillStyle = "orange";
    ctx.fillRect(bird.x - 5, bird.y + 10, 10, 10); // wing
    
    // Add new pipe
    if (Math.random() < 0.02) {
        const holeY = Math.random() * 300 + 100;
        pipes.push({ x: 400, top: holeY - 150, bottom: holeY + 150 });
    }
    
    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= 2;
        
        // Draw pipes
        ctx.fillStyle = "green";
        ctx.fillRect(p.x, 0, 50, p.top); // top pipe
        ctx.fillRect(p.x, p.bottom, 50, 600 - p.bottom); // bottom pipe
        
        // Check score - when bird passes pipe
        if (!p.scored && p.x + 50 < bird.x) {
            p.scored = true;
            score++;
            document.getElementById("score").textContent = "Score: " + score;
        }
        
        // Check collision
        if (bird.x + bird.width > p.x && 
            bird.x < p.x + 50 && 
            (bird.y < p.top || bird.y + bird.height > p.bottom)) {
            gameOver();
            return;
        }
        
        // Remove pipe if off screen
        if (p.x + 50 < 0) pipes.splice(i, 1);
    }
    
    // Check boundaries
    if (bird.y > 600 - bird.height || bird.y < 0) {
        gameOver();
        return;
    }
    
    window.gameLoop = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    alert("Game Over! Score: " + score);
}

// Draw initial screen
ctx.fillStyle = "#70c5ce";
ctx.fillRect(0, 0, 400, 600);
ctx.fillStyle = "white";
ctx.font = "30px Arial";
ctx.textAlign = "center";
ctx.fillText("Flappy Bird", 200, 100);
ctx.font = "20px Arial";
ctx.fillText("Click Start to Play", 200, 300);
