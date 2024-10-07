let gameActive = false;
let gameOver = false;
let seaweedData = null;
let reelLineData = null;
let bubblesData = null;

window.addEventListener("mousedown", indicatorActive);
window.addEventListener("mouseup", indicatorInactive);
window.addEventListener("keydown", indicatorActive);
window.addEventListener("keyup", indicatorInactive);
window.addEventListener("touchstart", indicatorActive);
window.addEventListener("touchend", indicatorInactive);

function indicatorActive() {
  if (!keyPressed) {
    keyPressed = true;
    document.body.classList.add("indicator-active");
  }
}

function indicatorInactive() {
  if (keyPressed) {
    keyPressed = false;
    document.body.classList.remove("indicator-active");
  }
}
// ----
// Iniciar minigame através do evento NUI
// ----

window.addEventListener("message", (event) => {
  if (event.data.action === "hide") {
    document.querySelector("body").style.display = "none";
    document.body.style.cursor = "default";
  }

  if (event.data.action === "startMinigame") {
    startMiniGame();
  }
});

// ----
// Loop de animação principal
// ----
function animationLoop() {
  if (!gameActive && gameOver) return;

  indicator.updatePosition();
  fish.updateFishPosition();
  progressBar.updateUi();
  progressBar.detectGameEnd();
  indicator.detectCollision(fish);

  if (bubblesData) {
    bubblesData.clearCanvas();
    Object.keys(bubblesData.bubbles).forEach((bubble) =>
      bubblesData.bubbles[bubble].draw()
    );
  }
  if (reelLineData) {
    reelLineData.clearCanvas();
    reelLineData.line.draw();
    reelLineData.line.animate();
  }

  if (seaweedData) {
    seaweedData.clearCanvas();
    seaweedData.seaweed.forEach((seaweed) => seaweed.draw());
  }

  requestAnimationFrame(animationLoop);
}

async function startMiniGame() {
  gameActive = true;
  gameOver = false;

  document.querySelector("body").style.display = "flex";
  document.body.style.cursor = "none";

  seaweedData = initSeaweed();
  reelLineData = initReelLineTension();
  bubblesData = initBubbles();
  animationLoop();

  const timer = setTimeout(async () => {
    if (!gameOver) {
      gameOver = true;
      await endMinigame();
    }
  }, 20000);

  setTimeout(async () => {
    const minigameSuccess = progressBar.detectGameEnd();

    if (minigameSuccess) {
      clearTimeout(timer);
      await endMinigame(minigameSuccess);
    }
  }, 20000);
}

function endMinigame() {
  resetGame();
  document.querySelector("body").style.display = "none";
  document.body.style.cursor = "default";
}

// ---------
// Indicator
// ---------
class Indicator {
  constructor() {
    this.indicator = document.querySelector(".indicator");
    this.height = this.indicator.clientHeight;
    this.y = 0;
    this.velocity = 0;
    this.acceleration = 0;
    this.calculateBounds();
  }

  applyForce(force) {
    this.acceleration += force;
  }

  calculateBounds() {
    this.topBounds = gameBody.clientHeight * -1 + 130;
    this.bottomBounds = 0;
  }
  updatePosition() {
    if (!gameActive) return;

    this.calculateBounds();

    this.velocity += this.acceleration;
    this.y += this.velocity;
    this.acceleration = 0;

    // // Mudança de direção e fricção
    if (this.y > this.bottomBounds) {
      this.y = this.bottomBounds;
      this.velocity *= 0.5;
    }

    // // Limite superior
    if (this.y < this.topBounds) {
      this.y = this.topBounds;
      this.velocity = 0;
    } else {
      if (keyPressed) {
        this.applyForce(-0.5);
      }
    }

    // Aplica uma força constante (gravidade)
    this.applyForce(0.3);

    // // Atualiza a posição do indicator na tela
    this.indicator.style.transform = `translateY(${this.y}px)`;

    // using top property
    // this.indicator.style.top = `${this.y}px`;  // Use top em vez de transform
  }

  detectCollision(fish) {
    const indicatorRect = this.indicator.getBoundingClientRect();
    const fishRect = fish.fish.getBoundingClientRect();

    if (
      indicatorRect.bottom >= fishRect.top &&
      indicatorRect.top <= fishRect.bottom
    ) {
      progressBar.fill();
      document.body.classList.add("collision");
    } else {
      // Sem colisão
      progressBar.drain();
      document.body.classList.remove("collision");
    }
  }
}

// ----
// Fish
// ----

class Fish {
  constructor() {
    this.fish = document.querySelector(".fish");
    this.height = this.fish.clientHeight;
    this.y = 5;
    this.direction = null;
    this.randomPosition = null;
    this.randomCountdown = null;
    this.speed = 2;
  }

  resetPosition() {
    this.y = 5;
  }

  updateFishPosition() {
    if (!gameActive) return;

    if (!this.randomPosition || this.randomCountdown < 0) {
      this.randomPosition =
        Math.ceil(Math.random() * (gameBody.clientHeight - this.height)) * -1;
      this.randomCountdown = Math.abs(this.y - this.randomPosition);
      this.speed = Math.abs(Math.random() * (2 - 1) + 1);
    }

    if (this.randomPosition < this.y) {
      this.y -= this.speed;
    } else {
      this.y += this.speed;
    }

    this.fish.style.transform = `translateY(${this.y}px)`;
    this.randomCountdown -= this.speed;
  }
}

// ------------
// Progress bar
// ------------

class ProgressBar {
  constructor() {
    this.wrapper = document.querySelector(".progress-bar");
    this.progressBar = this.wrapper.querySelector(".progress-gradient-wrapper");
    this.progress = 50;
  }

  reset() {
    this.progress = 50;
  }

  drain() {
    if (this.progress > 0) this.progress -= 0.5;
    if (this.progress < 1) this.progress = 0;
  }

  fill() {
    if (this.progress < 100) this.progress += 0.3; // padrão 0.3
  }

  async detectGameEnd() {
    if (this.progress >= 100) {
      // successTimeline().play();
      // successTimeline().invalidate().play(0);

      const successData = { success: true };

      await fetchNui("minigameResult", successData)
        .then((response) => {
          endMinigame();
          console.log("Minigame result sent:", response);
        })
        .catch((error) => {
          console.error("Failed to send minigame result:", error);
        });

      gameOver = true;
    }
  }

  updateUi() {
    if (!gameActive) return;
    this.progressBar.style.height = `${this.progress}%`;
  }
}

// -----------
// Application
// -----------

const gameBody = document.querySelector(".game-body");
let keyPressed = false;
const indicator = new Indicator();
const progressBar = new ProgressBar();
const fish = new Fish();

// ----------
// Reset game
// ----------

const niceCatch = document.querySelector(".nice-catch");
const perfect = document.querySelector(".perfect");
const successButton = document.querySelector(".success");
const game = document.querySelector(".game");
// successButton.addEventListener("click", resetGame);

function resetGame() {
  gameActive = false; // Pausa o jogo
  gameOver = true;

  progressBar.reset();
  fish.resetPosition();

  // successButton.removeAttribute("style");
  // niceCatch.removeAttribute("style");
  // perfect.removeAttribute("style");
  // game.removeAttribute("style");

  // animationLoop();
}

// ----------------
// Success timeline
// ----------------

// function successTimeline() {
//   // TweenMax.set(".success", { display: "flex" });
//   // TweenMax.set(".nice-catch", { y: 50 });
//   // TweenMax.set(".perfect", { perspective: 800 });
//   // TweenMax.set(".perfect", { transformStyle: "preserve-3d" });
//   // TweenMax.set(".perfect", { rotationX: -90 });

//   const tl = new TimelineMax({ paused: true })
//     .to(".game", 0.2, { opacity: 0 })
//     .to(".success", 0.5, { ease: Power3.easeOut, opacity: 1 }, "ending")
//     .to(".nice-catch", 0.5, { ease: Power3.easeOut, y: 0 }, "ending")
//     .to(
//       ".perfect",
//       3,
//       { ease: Elastic.easeOut.config(1, 0.3), rotationX: 0 },
//       "+=0.2"
//     );

//   return tl;
// }

// -------------
// Initiate loop
// -------------

// animationLoop();

// -------
// Seaweed
// -------
function initSeaweed() {
  let seaweed = [];
  const canvas = document.querySelector('[data-element="seaweed"]');
  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;
  const context = canvas.getContext("2d");

  function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  class Seaweed {
    constructor(segments, spread, xoff) {
      this.segments = segments;
      this.segmentSpread = spread;
      this.x = 0;
      this.xoff = xoff;
      this.y = 0;
      this.radius = 1;
      this.sin = Math.random() * 10;
    }

    draw() {
      context.beginPath();
      context.strokeStyle = "#143e5a";
      context.fillStyle = "#143e5a";
      context.lineWidth = 2;
      for (let i = this.segments; i >= 0; i--) {
        if (i === this.segments) {
          context.moveTo(
            (Math.sin(this.sin + i) * i) / 2.5 + this.xoff,
            canvas.height + -i * this.segmentSpread
          );
        } else {
          context.lineTo(
            (Math.sin(this.sin + i) * i) / 2.5 + this.xoff,
            canvas.height + -i * this.segmentSpread
          );
        }
      }
      context.stroke();
      this.sin += 0.05;
    }
  }

  // Cria instâncias de Seaweed e as adiciona ao array
  seaweed.push(new Seaweed(6, 8, 25));
  seaweed.push(new Seaweed(8, 10, 35));
  seaweed.push(new Seaweed(4, 8, 45));

  // Retorna o array de algas para ser controlado no loop principal
  return { seaweed, clearCanvas };
}

// -----------------
// Reel line tension
// -----------------

function initReelLineTension() {
  let line = null;
  const canvas = document.querySelector('[data-element="reel-line-tension"]');
  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;
  const context = canvas.getContext("2d");

  function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  class Line {
    constructor() {
      this.tension = 0;
      this.tensionDirection = "right";
    }

    draw() {
      context.beginPath();
      context.strokeStyle = "#18343d";
      context.lineWidth = 1.3;
      context.moveTo(canvas.width, 0);
      context.bezierCurveTo(
        canvas.width,
        canvas.height / 2 + this.tension,
        canvas.width / 2,
        canvas.height + this.tension,
        0,
        canvas.height
      );
      context.stroke();
    }

    animate() {
      if (document.body.classList.contains("collision")) {
        if (this.tension > -30) this.tension -= 8;
      } else {
        if (this.tension < 0) this.tension += 4;
      }
    }
  }

  // Cria uma nova linha de tensão
  line = new Line();
  return { line, clearCanvas };
}

// -------
// Bubbles
// -------

function initBubbles() {
  let bubbles = {};
  let bubblesCreated = 0;
  const canvas = document.querySelector('[data-element="bubbles"]');
  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;
  const context = canvas.getContext("2d");

  function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  class Bubble {
    constructor() {
      this.index = Object.keys(bubbles).length;
      this.radius = Math.random() * (6 - 2) + 2;
      this.y = canvas.height + this.radius;
      this.x = canvas.width * Math.random() - this.radius;
      this.sin = this.style > 0.5 ? 0 : 5;
      this.style = Math.random();
      this.childAdded = false;
      this.speed = 1;
      this.sway = Math.random() * (0.03 - 0.01) + 0.01;
      this.swayDistance =
        Math.random() * (canvas.width - canvas.width / 2) + canvas.width / 2;
    }

    draw() {
      context.beginPath();
      context.strokeStyle = "#abe2f9";
      context.lineWidth = 2;
      context.arc(
        this.x + this.radius,
        this.y + this.radius,
        this.radius,
        0,
        2 * Math.PI
      );
      context.stroke();

      this.x =
        Math.sin(this.sin) * this.swayDistance +
        this.swayDistance -
        this.radius;
      this.sin += this.sway;
      this.y -= this.speed;

      if (this.y + this.radius < 0) {
        delete bubbles[this.index];
      }

      if (this.y < canvas.height * 0.6 && !this.childAdded) {
        bubbles[bubblesCreated] = new Bubble();
        bubblesCreated++;
        this.childAdded = true;
      }
    }
  }

  bubbles[bubblesCreated] = new Bubble();
  bubblesCreated++;

  return { bubbles, clearCanvas };
}
