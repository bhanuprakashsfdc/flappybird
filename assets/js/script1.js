const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = "assets/img/img.png";

// Sound effects
const flySound = new Audio('assets/audio/sfx_point.wav');
const hitSound = new Audio('assets/audio/sfx_die.wav');
const spaceSound = new Audio('assets/audio/sfx_wing.wav');

// general settings
let gamePlaying = false;
const gravity = 0.8;
const speed = 6.2;
const size = [51, 36];
const jump = -11.5;
const cTenth = (canvas.width / 10);

let index = 0,
   bestScore = 0,
   // bestScore = retrieveBestScore();  // Retrieve the best score from local storage,
    flight,
    flyHeight,
    currentScore,
    pipes;

// pipe settings
const pipeWidth = 78;
const pipeGap = 270;
const pipeLoc = () => (Math.random() * ((canvas.height - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

const setup = () => {
 // bestScore = retrieveBestScore();
  currentScore = 0;
  flight = jump;

  // set initial flyHeight (middle of screen - size of the bird)
  flyHeight = (canvas.height / 2) - (size[1] / 2);

  // setup first 3 pipes
  pipes = Array(3).fill().map((a, i) => [canvas.width + (i * (pipeGap + pipeWidth)), pipeLoc()]);
}

const render = () => {
  index++;

  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background first part
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -((index * (speed / 2)) % canvas.width) + canvas.width, 0, canvas.width, canvas.height);
  // background second part
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -(index * (speed / 2)) % canvas.width, 0, canvas.width, canvas.height);

  // pipe display
  if (gamePlaying){
    pipes.forEach(pipe => {
      // pipe moving
      pipe[0] -= speed;

      // top pipe
      ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
      // bottom pipe
      ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap);

      // give 1 point & create new pipe
      if (pipe[0] <= -pipeWidth) {
        currentScore++;
        flySound.play();
        // check if it's the best score
        bestScore = Math.max(bestScore, currentScore);
        updateBestScore(bestScore);  // Save new best score if it's higher
        // remove & create new pipe
        pipes = [...pipes.slice(1), [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()]];
      }

      // if hit the pipe, end
      if ([
        pipe[0] <= cTenth + size[0],
        pipe[0] + pipeWidth >= cTenth,
        pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1]
      ].every(elem => elem)) {
        gamePlaying = false;
        hitSound.play();
        setup();
        checkForHighScore();
      }
    });
  }

  // draw bird
  if (gamePlaying) {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);
    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);
  } else {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);
    flyHeight = (canvas.height / 2) - (size[1] / 2);
    ctx.fillText(`Best score : ${bestScore}`, 85, 245);
    ctx.fillText('Click to play', 90, 535);
    ctx.font = "bold 30px courier";
  }

  document.getElementById('bestScore').innerHTML = `Best : ${bestScore}`;
  document.getElementById('currentScore').innerHTML = `Current : ${currentScore}`;

  window.requestAnimationFrame(render);
}

function updateBestScore(bestScore) {
  localStorage.setItem('bestScore', bestScore);
}

function retrieveBestScore() {
  return parseInt(localStorage.getItem('bestScore') || '0');
}

setup();
img.onload = render;

// start game
document.addEventListener('click', () => gamePlaying = true);
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();  // Prevent the default context menu from showing
    gamePlaying = true;
    flight = jump;
    spaceSound.play();
     
  }
});

// Event listener for mousedown to handle left mouse clicks
document.addEventListener('mousedown', (e) => {
  if (e.button === 0) { // 0 represents the left mouse button
    gamePlaying = true;
    flight = jump;
    spaceSound.play();
   
  }
});
/*
function checkForHighScore() {
  if (currentScore > bestScore) {
      document.getElementById('highScoreForm').style.display = 'block';
  }
}
*/
function updateLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  const leaderboardBody = document.getElementById('leaderboardBody');
  leaderboardBody.innerHTML = '';
  leaderboard.forEach(entry => {
      const row = `<tr>
          <td>${entry.name}</td>
          <td>${entry.country}</td>
          <td>${entry.score}</td>
      </tr>`;
      leaderboardBody.innerHTML += row;
  });
}

function submitHighScore() {
  const name = document.getElementById('playerName').value;
  const country = document.getElementById('playerCountry').value;
  const score = bestScore;
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  leaderboard.push({ name, country, score });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  updateLeaderboard();
  document.getElementById('highScoreForm').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', updateLeaderboard);

