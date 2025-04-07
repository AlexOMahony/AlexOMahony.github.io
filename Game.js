// JavaScript source code
// author: Who Know's (Me I do, Alex O'Mahony (and AI))
class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.score = 0;
    this.timeLeft = 30;
    this.targets = [];
    this.isRunning = false;

    // Set canvas size
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    // Initialize both touch and mouse events
    this.canvas.addEventListener(
      "touchstart",
      (e) => this.handleInteraction(e, true),
      { passive: false }
    );
    this.canvas.addEventListener("mousedown", (e) =>
      this.handleInteraction(e, false)
    );

    // Start button
    document
      .getElementById("startButton")
      .addEventListener("click", () => this.startGame());

    // Load target images
    this.targetImages = [];
    for (let i = 1; i <= 5; i++) {
      const img = new Image();
      img.src = "Images/Vola.png"; // Replace with your actual image paths
      this.targetImages.push(img);
    }

    // Load explosion image
    this.explosionImage = new Image();
    this.explosionImage.src = "Images/Kaboom.png"; // Replace with actual explosion image path

    // Load explosion sound
    this.explosionSound = new Audio("Sounds/VolaDie.mp3"); // Replace with the actual path to the sound effect
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = window.innerHeight * 0.7;
  }

  startGame() {
    this.score = 0;
    this.timeLeft = 30;
    this.targets = [];
    this.isRunning = true;
    document.getElementById("startButton").style.display = "none";
    document.getElementById("score-value").textContent = this.score;
    document.getElementById("time-value").textContent = this.timeLeft;

    // Create 5 targets initially
    for (let i = 0; i < 5; i++) {
      this.targets.push(this.createTarget());
    }

    // Start game loop
    this.gameLoop();

    // Start timer
    this.timer = setInterval(() => {
      this.timeLeft--;
      document.getElementById("time-value").textContent = this.timeLeft;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  }

  createTarget() {
    const size = 30 + Math.random() * 20;
    const randomImage =
      this.targetImages[Math.floor(Math.random() * this.targetImages.length)];
    return {
      x: Math.random() * (this.canvas.width - size),
      y: Math.random() * (this.canvas.height - size),
      size: size,
      image: randomImage,
      exploding: false, // New property to track if the target is in explosion state
      speedX: (Math.random() - 0.5) * 8,
      speedY: (Math.random() - 0.5) * 8,
    };
  }

  handleInteraction(e, isTouch) {
    if (!this.isRunning) return;

    e.preventDefault(); // Prevent default behavior

    const rect = this.canvas.getBoundingClientRect();
    let x, y;

    if (isTouch) {
      const touch = e.touches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Scale coordinates if canvas is scaled
    x = x * (this.canvas.width / rect.width);
    y = y * (this.canvas.height / rect.height);

    this.targets.forEach((target, index) => {
      // Check if the point is inside the rectangular bounds of the image
      if (
        x >= target.x &&
        x <= target.x + target.size &&
        y >= target.y &&
        y <= target.y + target.size
      ) {
        this.score += 1;
        document.getElementById("score-value").textContent = this.score;

        // Trigger explosion effect
        target.exploding = true;

        // Play explosion sound
        this.explosionSound.currentTime = 0; // Reset sound if it’s already playing
        this.explosionSound.play();

        setTimeout(() => {
          target.exploding = false; // Revert back to normal after 200ms
          this.targets.splice(index, 1);
          this.targets.push(this.createTarget()); // Replace with a new target
        }, 200);
      }
    });
  }

  updateTargets() {
    this.targets.forEach((target) => {
      target.x += target.speedX;
      target.y += target.speedY;

      // Bounce off walls
      if (target.x <= 0 || target.x + target.size >= this.canvas.width) {
        target.speedX *= -1;
        target.x = Math.max(
          0,
          Math.min(target.x, this.canvas.width - target.size)
        );
      }
      if (target.y <= 0 || target.y + target.size >= this.canvas.height) {
        target.speedY *= -1;
        target.y = Math.max(
          0,
          Math.min(target.y, this.canvas.height - target.size)
        );
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.targets.forEach((target) => {
      if (target.exploding) {
        // Draw explosion image
        this.ctx.drawImage(
          this.explosionImage,
          target.x,
          target.y,
          target.size,
          target.size
        );
      } else {
        // Draw the target's assigned image
        this.ctx.drawImage(
          target.image,
          target.x,
          target.y,
          target.size,
          target.size
        );
      }
    });
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.updateTargets();
    this.draw();

    // Ensure we always have 5 targets
    while (this.targets.length < 5) {
      this.targets.push(this.createTarget());
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  endGame() {
    this.isRunning = false;
    clearInterval(this.timer);
    alert(`Game Over! Your score: ${this.score}`);
    document.getElementById("startButton").style.display = "block";
  }
}

// Start the game when the page loads
window.onload = () => {
  new Game();
};
