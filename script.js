   const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const popup = document.getElementById('popup');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const topScoreDisplay = document.getElementById('topScore');
    const scorePopup = document.getElementById('scorePopup');
    const leaderboardList = document.getElementById('leaderboardList');
    const leaderboardKey = 'bubblesLeaderboard';
    const startPopup = document.getElementById('startPopup');

    let baseWidth = 900, baseHeight = 450, scale = 1;
    let circleX, circleY, circleRadius;
    let arrowX, arrowY;
    const arrowSpeed = -5;
    let hit = false;
    let animationFrame;
    let circleColor = 'blue';
    let score = 0;
    let timeLeft = 30;
    let timer;
    let gameRunning = false;
    let leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    let topScore = parseInt(localStorage.getItem('topScore')) || 0;
    topScoreDisplay.textContent = `Top Score: ${topScore}`;
    let circleSpeed = 1;
    let missedShots = 0;

    function resizeCanvas() {
      const bounds = canvas.getBoundingClientRect();
      scale = bounds.width / baseWidth;
      canvas.width = baseWidth * scale;
      canvas.height = baseHeight * scale;
      resetPositions();
    }

    function resetPositions() {
      circleRadius = 40 * scale;
      circleX = 100 * scale;
      circleY = canvas.height / 2;
      arrowX = canvas.width - 150 * scale;
      arrowY = canvas.height / 2;
      drawEverything();
    }

    function repositionCircle() {
      let newX, newY;
      do {
        newX = Math.random() * (canvas.width * 0.4 - circleRadius * 2) + circleRadius;
        newY = Math.random() * (canvas.height - circleRadius * 2) + circleRadius;
      } while (Math.abs(newX - arrowX) < 100 * scale);
      circleX = newX;
      circleY = newY;
    }

    function drawCircle() {
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = circleColor;
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = 'black';
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    function drawArrow() {
      if (arrowY < 0) arrowY = 0;
      if (arrowY > canvas.height) arrowY = canvas.height;

      ctx.fillStyle = 'black';
      ctx.fillRect(arrowX + 10 * scale, arrowY - 4 * scale, 40 * scale, 8 * scale);
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX + 10 * scale, arrowY - 10 * scale);
      ctx.lineTo(arrowX + 10 * scale, arrowY + 10 * scale);
      ctx.closePath();
      ctx.fill();
    }

    function drawEverything() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCircle();
      drawArrow();
    }

    function startHit() {
      if (!gameRunning || hit || timeLeft <= 0) return;

      function animate() {
        animationFrame = requestAnimationFrame(animate);
        arrowX += arrowSpeed * scale;

        const dx = arrowX - circleX;
        const dy = arrowY - circleY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < circleRadius + 10 * scale) {
          hit = true;
          cancelAnimationFrame(animationFrame);

          if (gameRunning && timeLeft > 0) {
            score++;
            missedShots = 0;
            scoreDisplay.textContent = `Score: ${score}`;
            if (score > topScore) {
              topScore = score;
              localStorage.setItem('topScore', topScore);
              topScoreDisplay.textContent = `Top Score: ${topScore}`;
            }
            showScorePopup();
            animateColorChange();
            repositionCircle();
            setTimeout(() => {
              arrowX = canvas.width - 120 * scale;
              hit = false;
              drawEverything();
            }, 300);
          }
        }

        if (arrowX < 0) {
          cancelAnimationFrame(animationFrame);
          arrowX = canvas.width - 120 * scale;
          missedShots++;
          if (missedShots >= 3) {
            endGameEarly();
          } else {
            hit = false;
          }
        }

        drawEverything();
      }

      animate();
    }

    function endGameEarly() {
      cancelAnimationFrame(animationFrame);
      clearInterval(timer);
      gameRunning = false;
      popup.textContent = "You've Missed 3 Times. Game Over!";
      popup.style.display = 'block';
      saveScore();
      updateLeaderboard();
    }

    function showScorePopup() {
  scorePopup.textContent = `+1`;
  scorePopup.style.display = 'block';

  if (score === topScore) {
    const badge = document.getElementById('newHighScoreBadge');
    badge.style.display = 'block';
    setTimeout(() => badge.style.display = 'none', 1500);
  }

  setTimeout(() => scorePopup.style.display = 'none', 500);
}


    function animateColorChange() {
      let steps = 0;
      const interval = setInterval(() => {
        steps++;
        if (steps > 20) {
          clearInterval(interval);
          circleColor = 'blue';
          return;
        }
        let r = 51 + ((255 - 51) * (steps / 20));
        let g = 138 + ((211 - 138) * (steps / 20));
        let b = 243 - ((243 - 102) * (steps / 20));
        circleColor = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        drawEverything();
      }, 20);
    }

    function reset() {
      cancelAnimationFrame(animationFrame);
      hit = false;
      score = 0;
      timeLeft = 30;
      missedShots = 0;
      scoreDisplay.textContent = `Score: 0`;
      timerDisplay.textContent = `Time: 30`;
      circleColor = 'blue';
      popup.style.display = 'none';
      startPopup.style.display = 'block';
      gameRunning = false;
      resetPositions();
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => {
        if (!gameRunning) return;
        timeLeft--;
        timerDisplay.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
          clearInterval(timer);
          gameRunning = false;
          popup.textContent = "Game Over";
          popup.style.display = 'block';
          saveScore();
          updateLeaderboard();
        }
      }, 1000);
    }

    function saveScore() {
      leaderboard.push(score);
      leaderboard.sort((a, b) => b - a);
      leaderboard = leaderboard.slice(0, 10);
      localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
    }

    function updateLeaderboard() {
  leaderboardList.innerHTML = '';
  leaderboard.forEach((score, index) => {
    const li = document.createElement('li');
    const trophy = index === 0 ? ' 🏆' : '';
    li.innerHTML = `<span>#${index + 1}</span> <span>Score: ${score}${trophy}</span>`;
    leaderboardList.appendChild(li);
  });
}


    function toggleLeaderboard() {
      const lb = document.getElementById('leaderboard');
      lb.style.display = lb.style.display === 'none' ? 'block' : 'none';
    }

    function showInstructions() {
      document.getElementById('instructions').style.display = 'block';
    }

    function closeInstructions() {
      document.getElementById('instructions').style.display = 'none';
    }

    function startGame() {
  startPopup.style.display = 'none';
  initializeGame();
  gameRunning = true;
  startTimer();
  animateCircle();
}

function initializeGame() {
  cancelAnimationFrame(animationFrame);
  hit = false;
  score = 0;
  timeLeft = 30;
  missedShots = 0;
  scoreDisplay.textContent = `Score: 0`;
  timerDisplay.textContent = `Time: 30`;
  circleColor = 'blue';
  popup.style.display = 'none';
  gameRunning = false;
  resetPositions();
}


    function animateCircle() {
      if (!gameRunning) return;
      circleX += 2 * circleSpeed * scale;
      if (circleX + circleRadius >= canvas.width * 0.5 || circleX - circleRadius <= 0) {
        circleSpeed = -circleSpeed;
      }
      drawEverything();
      requestAnimationFrame(animateCircle);
    }

    let dragging = false;
    function getY(e) {
      return e.touches ? e.touches[0].clientY : e.clientY;
    }

    canvas.addEventListener('mousedown', (e) => {
      if (Math.abs(getY(e) - canvas.getBoundingClientRect().top - arrowY) < 50) dragging = true;
    });
    canvas.addEventListener('mousemove', (e) => {
      if (dragging) {
        arrowY = getY(e) - canvas.getBoundingClientRect().top;
        drawEverything();
      }
    });
    canvas.addEventListener('mouseup', () => dragging = false);
    canvas.addEventListener('touchstart', (e) => {
      if (Math.abs(getY(e) - canvas.getBoundingClientRect().top - arrowY) < 50) dragging = true;
    });
    canvas.addEventListener('touchmove', (e) => {
      if (dragging) {
        arrowY = getY(e) - canvas.getBoundingClientRect().top;
        drawEverything();
      }
    });
    canvas.addEventListener('touchend', () => dragging = false);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') arrowY -= 10 * scale;
      else if (e.key === 'ArrowDown') arrowY += 10 * scale;
      drawEverything();
    });

    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    updateLeaderboard();
    toggleLeaderboard();