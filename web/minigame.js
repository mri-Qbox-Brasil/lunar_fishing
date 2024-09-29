let gameActive = false;
let gameOver = false;


// ----
// Iniciar minigame através do evento NUI
// ----

window.addEventListener('message', (event) => {
  if (event.data.action === "hide") {
      document.querySelector("body").style.display = "none";
      document.body.style.cursor = "default";
  }

  if (event.data.action === 'startMinigame') {
      startMiniGame();  // Inicia o jogo
  }
});


function startMiniGame() {
  gameActive = true;
  gameOver = false;
  document.querySelector('body').style.display = 'flex';
  document.body.style.cursor = 'none';  // Esconde o cursor

  // Inicia a animação do jogo e o loop de atualização
  animationLoop();  

  const timer = setTimeout(async () => {
    if (!gameOver) {
        gameOver = true;
        await endMinigame(false);  // Falha se passar dos 30 segundos
    }
}, 5000);  //  TODO 5 segundos mudar para 30

// Simula o minigame, o qual pode terminar antes dos 30 segundos
setTimeout(async () => {
    const minigameSuccess = detectGameEnd()

    if (minigameSuccess) {
        clearTimeout(timer);  // Cancela o timer de 30 segundos se o jogo terminar antes
        await endMinigame(minigameSuccess);
    }
}, 5000);  // Minigame simulado dura 5 segundos
}

async function endMinigame(minigameSuccess) {
  resetGame();
  document.querySelector('body').style.display = 'none';
  document.body.style.cursor = 'default';

  await fetchNui("minigameResult", {
      success: minigameSuccess
  });
}

// ----
// Loop de animação principal
// ----
function animationLoop() {
  if (!gameActive) return;  // Se o jogo não estiver ativo, não faz nada

  indicator.updatePosition();  // Atualiza a posição do indicator
  indicator.detectCollision();  // Verifica colisões
  progressBar.updateUi();  // Atualiza a barra de progresso
  progressBar.detectGameEnd();  // Verifica se o jogo terminou
  fish.updateFishPosition();  // Atualiza a posição do peixe

  if (gameActive) {
      requestAnimationFrame(animationLoop);  // Continua o loop de animação se o jogo não terminou
  }
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
      this.topBounds = gameBody.clientHeight * -1 + 48;
      this.bottomBounds = 0;
  }

  applyForce(force) {
      this.acceleration += force;
  }

  updatePosition() {
      if (!gameActive) return;

      this.velocity += this.acceleration;
      this.y += this.velocity;

      this.acceleration = 0;

      // Mudança de direção e fricção
      if (this.y > this.bottomBounds) {
          this.y = 0;
          this.velocity *= 0.5;
          this.velocity *= -1;
      }

      // Limite superior
      if (this.y < this.topBounds) {
          this.y = this.topBounds;
          this.velocity = 0;
      } else if (keyPressed) {
          this.applyForce(-0.5);
      }

      // Aplica uma força constante
      this.applyForce(0.3);

      // Atualiza a posição do indicator na tela
      this.indicator.style.transform = `translateY(${this.y}px)`;
  }

  detectCollision() {
      if (!gameActive) return;  // Verifica colisões apenas se o jogo estiver ativo

      if (
          (fish.y < this.y && fish.y > this.y - this.height) ||
          (fish.y - fish.height < this.y && fish.y - fish.height > this.y - this.height)
      ) {
          progressBar.fill();
          document.body.classList.add("collision");
      } else {
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
      this.speed = 0;
    }

    resetPosition() {
      this.y = 5;
    }

    updateFishPosition() {

      if (!gameActive) return

      if (!this.randomPosition || this.randomCountdown < 0) {
        this.randomPosition =
          Math.ceil(Math.random() * (gameBody.clientHeight - this.height)) * -1;
        this.randomCountdown = Math.abs(this.y - this.randomPosition);
        this.speed = Math.abs(Math.random() * (0 - 1) + 1);
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
      this.progressBar = this.wrapper.querySelector(
        ".progress-gradient-wrapper"
      );
      this.progress = 50;
    }

    reset() {
      this.progress = 50;
    }

    drain() {
      if (this.progress > 0) this.progress -= 0.4;
      if (this.progress < 1) this.progress = 0;
    }

    fill() {
      if (this.progress < 100) this.progress += 0.3;
    }

    detectGameEnd() {
      if (this.progress >= 100) {
        // successTimeline().play();
        successTimeline().invalidate().play(0);

        gameOver = true;
      }
    }

    updateUi() {
      if (!gameActive) return
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

  // ------------
  // Mouse events
  // ------------

  window.addEventListener("mousedown", () => { if (gameActive) keyPressed = true; });
  window.addEventListener("mouseup", () => { if (gameActive) keyPressed = false; });
  window.addEventListener("keydown", () => { if (gameActive) keyPressed = true; });
  window.addEventListener("keyup", () => { if (gameActive) keyPressed = false; });

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

  // ----------
  // Reset game
  // ----------

  const niceCatch = document.querySelector(".nice-catch");
  const perfect = document.querySelector(".perfect");
  const successButton = document.querySelector(".success");
  const game = document.querySelector(".game");
  successButton.addEventListener("click", resetGame);

  function resetGame() {
    gameActive = false;  // Pausa o jogo
    gameOver = true;

    progressBar.reset();
    fish.resetPosition();

    successButton.removeAttribute("style");
    niceCatch.removeAttribute("style");
    perfect.removeAttribute("style");
    game.removeAttribute("style");

    gameOver = false;
    // animationLoop();
  }

  // ----------------
  // Success timeline
  // ----------------

  function successTimeline() {
    TweenMax.set(".success", { display: "flex" });
    TweenMax.set(".nice-catch", { y: 50 });
    TweenMax.set(".perfect", { perspective: 800 });
    TweenMax.set(".perfect", { transformStyle: "preserve-3d" });
    TweenMax.set(".perfect", { rotationX: -90 });

    const tl = new TimelineMax({ paused: true })
      .to(".game", 0.2, { opacity: 0 })
      .to(".success", 0.5, { ease: Power3.easeOut, opacity: 1 }, "ending")
      .to(".nice-catch", 0.5, { ease: Power3.easeOut, y: 0 }, "ending")
      .to(
        ".perfect",
        3,
        { ease: Elastic.easeOut.config(1, 0.3), rotationX: 0 },
        "+=0.2"
      );

    return tl;
  }

  // -------------
  // Initiate loop
  // -------------

  // animationLoop();

// -------
// Seaweed
// -------

(function () {
  let seaweed = [];
  const canvas = document.querySelector('[data-element="seaweed"]');
  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;
  const context = canvas.getContext("2d");

  function animationLoop() {
    if (!gameActive) return
    clearCanvas();
    seaweed.forEach((seaweed) => seaweed.draw());
 }

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
        // context.arc(Math.sin(this.sin + i) * 10 + 30, this.y + (this.segmentSpread * i), this.radius, 0, 2*Math.PI);
      }
      context.stroke();

      this.sin += 0.05;
    }
  }

  seaweed.push(new Seaweed(6, 8, 25));
  seaweed.push(new Seaweed(8, 10, 35));
  seaweed.push(new Seaweed(4, 8, 45));

  animationLoop();
})();

// -----------------
// Reel line tension
// -----------------

(function () {
  let line = null;
  const canvas = document.querySelector('[data-element="reel-line-tension"]');
  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;
  const context = canvas.getContext("2d");

  function animationLoop() {
    if (!gameActive) return

    clearCanvas();
    line.draw();
    line.animate();

  }

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

  line = new Line();
  if (!gameActive) return

  animationLoop();
})();

// -------
// Bubbles
// -------

(function () {
  let bubbles = {};
  let bubblesCreated = 0;
  const canvas = document.querySelector('[data-element="bubbles"]');
  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;
  const context = canvas.getContext("2d");

  function animationLoop() {
    if (!gameActive) return

    clearCanvas();
    Object.keys(bubbles).forEach((bubble) => bubbles[bubble].draw());

    }

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

      if (this.y < canvas.height * 0.6) {
        if (!this.childAdded) {
          bubbles[bubblesCreated] = new Bubble();
          bubblesCreated++;
          this.childAdded = true;
        }
      }
    }
  }

  bubbles[bubblesCreated] = new Bubble();
  bubblesCreated++;

  animationLoop();
})();

// ----
// NUI OLD
// ----

// window.addEventListener('message', (event) => {

//     if (event.data.action === "hide") {
//         document.querySelector("body").style.display = "none";
//         document.body.style.cursor = "default";
//     }

//     if (event.data.action === 'startMinigame') {
//         document.querySelector('body').style.display = 'flex';
//         // document.body.style.cursor = 'none';  // Esconde o cursor
//         startMinigame();  // Inicia o minigame
//     }
// });


// async function startMinigame() {
//     let minigameSuccess = false;
//     let gameOver = false;

//     // Inicia o loop de animação do minigame
//     animationLoop();

//     // Cria um timer de 30 segundos para encerrar o minigame automaticamente
//     const timer = setTimeout(async () => {
//         if (!gameOver) {
//             minigameSuccess = false;
//             await endMinigame(minigameSuccess);
//         }
//     }, 30000);  // 30 segundos

//     // Simula o minigame, o qual pode terminar antes dos 30 segundos
//     setTimeout(async () => {
//         minigameSuccess = Math.random() > 0.5;  // Randomiza sucesso ou falha

//         if (minigameSuccess) {
//             clearTimeout(timer);  // Cancela o timer de 30 segundos se o jogo terminar antes
//             gameOver = true;
//             await endMinigame(minigameSuccess);
//         }
//     }, 5000);  // Minigame simulado dura 5 segundos
// }

// async function endMinigame(minigameSuccess) {
//     // Reseta o jogo e oculta o corpo
//     resetGame();
//     document.querySelector('body').style.display = 'none';
//     document.body.style.cursor = 'default';

//     // Envia o resultado de volta ao Lua
//     await fetchNui("minigameResult", {
//         success: minigameSuccess
//     });
// }
