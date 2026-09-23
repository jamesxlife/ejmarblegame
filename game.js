const TEAMS = [
  "Arsenal",
  "Aston Villa",
  "Bournemouth",
  "Brentford",
  "Brighton",
  "Burnley",
  "Chelsea",
  "Crystal Palace",
  "Everton",
  "Fulham",
  "Leeds United",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Newcastle United",
  "Nottingham Forest",
  "Sunderland",
  "Tottenham Hotspur",
  "West Ham United",
  "Wolverhampton Wanderers",
  "Swansea City",
  "Wrexham",
  "Cardiff City",
  "Tonna FC",
  "YG Castell-Nedd FC"
];

const COLORS = [
  "#e11d48",
  "#7f1d1d",
  "#dc2626",
  "#ef4444",
  "#2563eb",
  "#7f1d1d",
  "#1d4ed8",
  "#dc2626",
  "#2563eb",
  "#111827",
  "#fde047",
  "#dc2626",
  "#60a5fa",
  "#ef4444",
  "#111827",
  "#ef4444",
  "#dc2626",
  "#f8fafc",
  "#7c2d12",
  "#f97316",
  "#f8fafc",
  "#dc2626",
  "#2563eb",
  "#16a34a",
  "#f59e0b"
];

const W = 900;
const H = 1240;
const R = 11;

const c = document.getElementById("game");
const ctx = c.getContext("2d");

const cc = document.getElementById("confetti");
const cx = cc.getContext("2d");

const playBtn = document.getElementById("play");
const joltBtn = document.getElementById("jolt");
const soundBtn = document.getElementById("sound");
const againBtn = document.getElementById("again");

const resultsEl = document.getElementById("results");
const timerEl = document.getElementById("timer");

const winnerBanner = document.getElementById("winnerBanner");
const winnerText = document.getElementById("winnerText");

const crowd = document.getElementById("crowdCheer");

let balls = [];
let results = [];
let running = false;

let start = 0;
let lastTimer = 0;

let audioCtx = null;
let soundOn = true;
let musicTimer = null;

let confetti = [];


// ======================================================
// TEAM INITIALS
// ======================================================

const initials = name =>
  name
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 3);


// ======================================================
// AUDIO ENGINE
// ======================================================

function ac() {

  if (!audioCtx) {

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    audioCtx =
      new AudioContextClass();
  }

  return audioCtx;
}


async function unlock() {

  const audio =
    ac();

  if (!audio) {
    return false;
  }

  if (
    audio.state ===
    "suspended"
  ) {

    try {

      await audio.resume();

    } catch (error) {

      return false;
    }
  }

  return (
    audio.state ===
    "running"
  );
}


function tone(
  frequency,
  duration = 0.15,
  volume = 0.08,
  type = "sine",
  delay = 0
) {

  if (!soundOn) {
    return;
  }

  const audio =
    ac();

  if (
    !audio ||
    audio.state !==
    "running"
  ) {
    return;
  }

  const oscillator =
    audio.createOscillator();

  const gain =
    audio.createGain();

  const time =
    audio.currentTime +
    delay;

  oscillator.type =
    type;

  oscillator.frequency.setValueAtTime(
    frequency,
    time
  );

  gain.gain.setValueAtTime(
    volume,
    time
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    time + duration
  );

  oscillator.connect(
    gain
  );

  gain.connect(
    audio.destination
  );

  oscillator.start(
    time
  );

  oscillator.stop(
    time + duration
  );
}


// ======================================================
// START WHISTLE
// ======================================================

function whistle() {

  tone(
    1200,
    0.18,
    0.09,
    "sine"
  );

  tone(
    1500,
    0.20,
    0.09,
    "sine",
    0.20
  );

  tone(
    1850,
    0.45,
    0.10,
    "sine",
    0.42
  );
}


// ======================================================
// JOLT SOUND
// ======================================================

function joltSound() {

  tone(
    140,
    0.12,
    0.12,
    "square"
  );

  tone(
    90,
    0.20,
    0.10,
    "sawtooth",
    0.08
  );

  tone(
    220,
    0.10,
    0.06,
    "square",
    0.14
  );
}


// ======================================================
// WINNER FANFARE
// ======================================================

function winnerSound() {

  tone(
    523,
    0.20,
    0.09,
    "triangle"
  );

  tone(
    659,
    0.20,
    0.09,
    "triangle",
    0.15
  );

  tone(
    784,
    0.20,
    0.09,
    "triangle",
    0.30
  );

  tone(
    1047,
    0.55,
    0.12,
    "triangle",
    0.45
  );
}


// ======================================================
// SPORTING BACKGROUND RHYTHM
// ======================================================

function stopMusic() {

  if (musicTimer) {

    clearInterval(
      musicTimer
    );

    musicTimer = null;
  }
}


function startMusic() {

  stopMusic();

  if (!soundOn) {
    return;
  }

  let beat = 0;

  musicTimer =
    setInterval(() => {

      if (
        !running ||
        !soundOn
      ) {
        return;
      }

      if (
        beat % 4 === 0
      ) {

        tone(
          110,
          0.10,
          0.025,
          "triangle"
        );
      }

      if (
        beat % 4 === 2
      ) {

        tone(
          165,
          0.07,
          0.018,
          "triangle"
        );
      }

      if (
        beat % 8 === 6
      ) {

        tone(
          220,
          0.05,
          0.012
        );
      }

      beat++;

    }, 350);
}


// ======================================================
// RESET GAME
// ======================================================

function reset() {

  stopMusic();

  results = [];
  confetti = [];

  cx.clearRect(
    0,
    0,
    W,
    H
  );

  winnerBanner.hidden =
    true;

  resultsEl.innerHTML = `
    <p class="hint">
      Click <b>PLAY</b> to launch every marble at once.
      Positions appear here at the finish.
    </p>
  `;

  againBtn.hidden =
    true;

  timerEl.textContent =
    "";

  balls =
    TEAMS.map(
      (name, i) => ({

        name,

        color:
          COLORS[i],

        x:
          80 +
          (i % 12) * 67,

        y:
          60 -
          Math.floor(i / 12) *
          28,

        vx:
          (Math.random() - 0.5) *
          2,

        vy: 0,

        done: false

      })
    );
}


// ======================================================
// PLAY
// ======================================================

async function play() {

  if (soundOn) {
    await unlock();
  }

  reset();

  start =
    performance.now();

  running =
    true;

  playBtn.disabled =
    true;

  playBtn.textContent =
    "🏁 RACING...";

  joltBtn.disabled =
    false;

  if (
    soundOn &&
    audioCtx &&
    audioCtx.state ===
    "running"
  ) {

    whistle();

    startMusic();
  }
}


// ======================================================
// JOLT
// ======================================================

function jolt() {

  if (!running) {
    return;
  }

  balls.forEach(
    ball => {

      if (!ball.done) {

        ball.vx +=
          (Math.random() - 0.5) *
          5;

        ball.vy -=
          1.5 +
          Math.random() *
          2.5;

        ball.x +=
          (Math.random() - 0.5) *
          5;
      }
    }
  );
}


// ======================================================
// OBSTACLE COLLISION
// ======================================================

function seg(
  ball,
  x1,
  y1,
  x2,
  y2,
  width = 10
) {

  let dx =
    x2 - x1;

  let dy =
    y2 - y1;

  let length =
    dx * dx +
    dy * dy;

  let t =
    (
      (ball.x - x1) * dx +
      (ball.y - y1) * dy
    ) /
    length;

  t =
    Math.max(
      0,
      Math.min(
        1,
        t
      )
    );

  let px =
    x1 + t * dx;

  let py =
    y1 + t * dy;

  let nx =
    ball.x - px;

  let ny =
    ball.y - py;

  let distance =
    Math.hypot(
      nx,
      ny
    );

  if (
    distance <
      R + width &&
    distance >
      0.01
  ) {

    let ux =
      nx / distance;

    let uy =
      ny / distance;

    ball.x =
      px +
      ux *
      (R + width + 0.5);

    ball.y =
      py +
      uy *
      (R + width + 0.5);

    let dot =
      ball.vx * ux +
      ball.vy * uy;

    if (
      dot < 0
    ) {

      ball.vx -=
        1.72 *
        dot *
        ux;

      ball.vy -=
        1.72 *
        dot *
        uy;
    }
  }
}


// ======================================================
// PEG COLLISION
// ======================================================

function peg(
  ball,
  x,
  y
) {

  let dx =
    ball.x - x;

  let dy =
    ball.y - y;

  let distance =
    Math.hypot(
      dx,
      dy
    );

  if (
    distance <
      R + 11 &&
    distance >
      0.01
  ) {

    let ux =
      dx / distance;

    let uy =
      dy / distance;

    ball.x =
      x +
      ux *
      (R + 11);

    ball.y =
      y +
      uy *
      (R + 11);

    let dot =
      ball.vx * ux +
      ball.vy * uy;

    if (
      dot < 0
    ) {

      ball.vx -=
        1.75 *
        dot *
        ux;

      ball.vy -=
        1.75 *
        dot *
        uy;
    }
  }
}


// ======================================================
// WINNER CELEBRATION
// ======================================================

function celebrate(name) {

  winnerText.textContent =
    name + " WINS!";

  winnerBanner.hidden =
    false;

  setTimeout(
    () => {

      winnerBanner.hidden =
        true;

    },
    5000
  );


  // Winner fanfare

  winnerSound();


  // Real crowd cheer MP3

  if (
    soundOn &&
    crowd
  ) {

    crowd.currentTime =
      0;

    crowd.volume =
      0.75;

    crowd
      .play()
      .catch(
        () => {}
      );
  }


  // Confetti colours

  const colours = [
    "#facc15",
    "#ef4444",
    "#3b82f6",
    "#22c55e",
    "#a855f7",
    "#f97316",
    "#ec4899",
    "#ffffff"
  ];


  for (
    let i = 0;
    i < 250;
    i++
  ) {

    confetti.push({

      x:
        W / 2 +
        (Math.random() - 0.5) *
        500,

      y:
        H - 100,

      vx:
        (Math.random() - 0.5) *
        9,

      vy:
        -5 -
        Math.random() *
        13,

      gravity:
        0.12 +
        Math.random() *
        0.08,

      rotation:
        Math.random() *
        Math.PI *
        2,

      rotationSpeed:
        (Math.random() - 0.5) *
        0.3,

      size:
        5 +
        Math.random() *
        8,

      colour:
        colours[
          Math.floor(
            Math.random() *
            colours.length
          )
        ],

      life:
        300

    });
  }
}


// ======================================================
// LEADERBOARD
// ======================================================

function addResult(ball) {

  results.push(
    ball.name
  );


  if (
    results.length === 1
  ) {

    celebrate(
      ball.name
    );
  }


  const list =
    document.createElement(
      "ol"
    );


  results.forEach(
    (name, i) => {

      const item =
        document.createElement(
          "li"
        );


      if (
        i === 0
      ) {

        item.className =
          "gold";

      } else if (
        i === 1
      ) {

        item.className =
          "silver";

      } else if (
        i === 2
      ) {

        item.className =
          "bronze";
      }


      item.innerHTML = `
        <span class="rank">
          ${i + 1}
        </span>

        <span
          class="dot"
          style="background:${COLORS[TEAMS.indexOf(name)]}"
        ></span>

        <span>
          ${name}
        </span>
      `;


      list.appendChild(
        item
      );
    }
  );


  resultsEl.replaceChildren(
    list
  );


  if (
    results.length ===
    TEAMS.length
  ) {

    stopMusic();

    running =
      false;

    playBtn.disabled =
      false;

    playBtn.textContent =
      "▶ PLAY";

    joltBtn.disabled =
      true;

    againBtn.hidden =
      false;
  }
}


// ======================================================
// GAME PHYSICS
// ======================================================

function update(now) {

  if (
    now -
    lastTimer >
    100
  ) {

    timerEl.textContent =
      (
        (now - start) /
        1000
      ).toFixed(1) +
      "s";

    lastTimer =
      now;
  }


  const rotation =
    now / 550;


  balls.forEach(
    ball => {

      if (
        ball.done
      ) {
        return;
      }


      // Gravity

      ball.vy +=
        0.085;


      // Random movement

      ball.vx +=
        (
          Math.random() -
          0.5
        ) *
        0.028;


      ball.vx *=
        0.998;


      ball.vy =
        Math.min(
          6,
          ball.vy
        );


      ball.x +=
        ball.vx;

      ball.y +=
        ball.vy;


      // Left wall

      if (
        ball.x <
        42 + R
      ) {

        ball.x =
          42 + R;

        ball.vx =
          Math.abs(
            ball.vx
          ) *
          0.8;
      }


      // Right wall

      if (
        ball.x >
        W - 42 - R
      ) {

        ball.x =
          W - 42 - R;

        ball.vx =
          -Math.abs(
            ball.vx
          ) *
          0.8;
      }


      // ==================================================
      // PEG SLALOM
      // ==================================================

      for (
        let row = 0;
        row < 3;
        row++
      ) {

        for (
          let x =
            105 +
            (row % 2) *
            45;

          x <
          W - 70;

          x +=
            90
        ) {

          peg(
            ball,
            x,
            190 +
            row *
            45
          );
        }
      }


      // ==================================================
      // GATE DROP
      // ==================================================

      seg(
        ball,
        55,
        390,
        380,
        390
      );

      seg(
        ball,
        520,
        460,
        845,
        460
      );


      // ==================================================
      // THE FUNNEL
      // ==================================================

      seg(
        ball,
        50,
        600,
        390,
        720
      );

      seg(
        ball,
        850,
        600,
        510,
        720
      );


      // ==================================================
      // ROTATING CROSS
      // ==================================================

      for (
        let q = 0;
        q < 2;
        q++
      ) {

        let angle =
          rotation +
          q *
          Math.PI /
          2;

        let dx =
          Math.cos(
            angle
          ) *
          125;

        let dy =
          Math.sin(
            angle
          ) *
          125;

        seg(
          ball,
          W / 2 - dx,
          815 - dy,
          W / 2 + dx,
          815 + dy,
          9
        );
      }


      // ==================================================
      // PINBALL ALLEY
      // ==================================================

      for (
        let row = 0;
        row < 3;
        row++
      ) {

        for (
          let x =
            105 +
            (row % 2) *
            45;

          x <
          W - 70;

          x +=
            90
        ) {

          peg(
            ball,
            x,
            965 +
            row *
            45
          );
        }
      }


      // FINISH

      if (
        ball.y >=
        H - 70
      ) {

        ball.y =
          H - 70;

        ball.done =
          true;

        addResult(
          ball
        );
      }

    }
  );


  // ====================================================
  // MARBLE COLLISIONS
  // ====================================================

  for (
    let i = 0;
    i <
    balls.length;
    i++
  ) {

    for (
      let j =
        i + 1;
      j <
        balls.length;
      j++
    ) {

      let A =
        balls[i];

      let B =
        balls[j];


      if (
        A.done ||
        B.done
      ) {
        continue;
      }


      let dx =
        B.x - A.x;

      let dy =
        B.y - A.y;

      let distance =
        Math.hypot(
          dx,
          dy
        );


      if (
        distance > 0 &&
        distance <
        2 * R
      ) {

        let ux =
          dx / distance;

        let uy =
          dy / distance;

        let overlap =
          2 * R -
          distance;


        A.x -=
          ux *
          overlap /
          2;

        A.y -=
          uy *
          overlap /
          2;


        B.x +=
          ux *
          overlap /
          2;

        B.y +=
          uy *
          overlap /
          2;


        let relative =
          (
            B.vx -
            A.vx
          ) *
          ux +
          (
            B.vy -
            A.vy
          ) *
          uy;


        if (
          relative < 0
        ) {

          A.vx +=
            relative *
            ux *
            0.9;

          A.vy +=
            relative *
            uy *
            0.9;


          B.vx -=
            relative *
            ux *
            0.9;

          B.vy -=
            relative *
            uy *
            0.9;
        }
      }
    }
  }
}


// ======================================================
// CONFETTI PHYSICS
// ======================================================

function updateConfetti() {

  confetti.forEach(
    piece => {

      piece.x +=
        piece.vx;

      piece.y +=
        piece.vy;

      piece.vy +=
        piece.gravity;

      piece.rotation +=
        piece.rotationSpeed;

      piece.life--;

    }
  );


  confetti =
    confetti.filter(
      piece =>
        piece.life > 0 &&
        piece.y <
        H + 50
    );
}


function drawConfetti() {

  cx.clearRect(
    0,
    0,
    W,
    H
  );


  confetti.forEach(
    piece => {

      cx.save();

      cx.translate(
        piece.x,
        piece.y
      );

      cx.rotate(
        piece.rotation
      );

      cx.fillStyle =
        piece.colour;

      cx.fillRect(
        -piece.size / 2,
        -piece.size / 2,
        piece.size,
        piece.size * 0.55
      );

      cx.restore();

    }
  );
}


// ======================================================
// DRAW RACECOURSE
// ======================================================

function draw() {

  ctx.clearRect(
    0,
    0,
    W,
    H
  );


  // Pitch stripes

  for (
    let y = 0;
    y < H;
    y += 80
  ) {

    ctx.fillStyle =
      (y / 80) % 2
        ? "#075f39"
        : "#087447";

    ctx.fillRect(
      0,
      y,
      W,
      80
    );
  }


  // Pitch border

  ctx.strokeStyle =
    "rgba(255,255,255,.5)";

  ctx.lineWidth =
    3;

  ctx.strokeRect(
    30,
    15,
    W - 60,
    H - 30
  );


  ctx.textAlign =
    "center";

  ctx.font =
    "900 23px system-ui";

  ctx.fillStyle =
    "#fff";


  ctx.fillText(
    "START",
    W / 2,
    38
  );

  ctx.fillText(
    "FINISH",
    W / 2,
    H - 35
  );


  // Finish line

  ctx.beginPath();

  ctx.moveTo(
    32,
    H - 70
  );

  ctx.lineTo(
    W - 32,
    H - 70
  );

  ctx.stroke();


  // Obstacle labels

  ctx.font =
    "800 15px system-ui";

  ctx.fillStyle =
    "rgba(255,255,255,.85)";


  [
    "1  PEG SLALOM",
    "2  GATE DROP",
    "3  THE FUNNEL",
    "4  ROTATING CROSS",
    "5  PINBALL ALLEY"
  ].forEach(
    (text, i) => {

      ctx.fillText(
        text,
        W / 2,
        [
          155,
          360,
          570,
          775,
          935
        ][i]
      );

    }
  );


  // Yellow pegs

  ctx.fillStyle =
    "#facc15";


  for (
    const base of
    [190, 965]
  ) {

    for (
      let row = 0;
      row < 3;
      row++
    ) {

      for (
        let x =
          105 +
          (row % 2) *
          45;

        x <
        W - 70;

        x +=
          90
      ) {

        ctx.beginPath();

        ctx.arc(
          x,
          base +
          row *
          45,
          11,
          0,
          Math.PI *
          2
        );

        ctx.fill();
      }
    }
  }


  // Gate Drop

  ctx.strokeStyle =
    "#38bdf8";

  ctx.lineWidth =
    20;

  ctx.beginPath();

  ctx.moveTo(
    55,
    390
  );

  ctx.lineTo(
    380,
    390
  );

  ctx.moveTo(
    520,
    460
  );

  ctx.lineTo(
    845,
    460
  );

  ctx.stroke();


  // Funnel

  ctx.strokeStyle =
    "#fb923c";

  ctx.lineWidth =
    18;

  ctx.beginPath();

  ctx.moveTo(
    50,
    600
  );

  ctx.lineTo(
    390,
    720
  );

  ctx.moveTo(
    850,
    600
  );

  ctx.lineTo(
    510,
    720
  );

  ctx.stroke();


  // Rotating cross

  let rotation =
    performance.now() /
    550;

  ctx.save();

  ctx.translate(
    W / 2,
    815
  );

  ctx.rotate(
    rotation
  );

  ctx.strokeStyle =
    "#c084fc";

  ctx.lineWidth =
    18;

  ctx.beginPath();

  ctx.moveTo(
    -125,
    0
  );

  ctx.lineTo(
    125,
    0
  );

  ctx.moveTo(
    0,
    -125
  );

  ctx.lineTo(
    0,
    125
  );

  ctx.stroke();

  ctx.restore();


  // Marbles

  balls.forEach(
    ball => {

      ctx.shadowColor =
        "#000";

      ctx.shadowBlur =
        8;

      ctx.fillStyle =
        ball.color;

      ctx.beginPath();

      ctx.arc(
        ball.x,
        ball.y,
        R,
        0,
        Math.PI *
        2
      );

      ctx.fill();

      ctx.shadowBlur =
        0;

      ctx.strokeStyle =
        "#fff";

      ctx.lineWidth =
        2;

      ctx.stroke();

      ctx.fillStyle =
        "#fff";

      ctx.font =
        "900 7px system-ui";

      ctx.fillText(
        initials(
          ball.name
        ),
        ball.x,
        ball.y + 2.5
      );

    }
  );
}


// ======================================================
// MAIN LOOP
// ======================================================

function loop(now) {

  if (running) {
    update(now);
  }

  updateConfetti();

  draw();

  drawConfetti();

  requestAnimationFrame(
    loop
  );
}


// ======================================================
// BUTTONS
// ======================================================

playBtn.addEventListener(
  "click",
  play
);


joltBtn.addEventListener(
  "click",
  async () => {

    if (soundOn) {
      await unlock();
    }

    jolt();

    if (soundOn) {
      joltSound();
    }

  }
);


againBtn.addEventListener(
  "click",
  play
);


soundBtn.addEventListener(
  "click",
  async () => {

    if (soundOn) {

      soundOn =
        false;

      stopMusic();

      if (crowd) {
        crowd.pause();
      }

      soundBtn.textContent =
        "🔇 SOUND OFF";

      return;
    }


    soundOn =
      true;

    soundBtn.textContent =
      "🔊 SOUND ON";


    if (
      await unlock()
    ) {

      // Confirmation sound

      tone(
        660,
        0.12,
        0.08
      );

      tone(
        880,
        0.18,
        0.08,
        "sine",
        0.13
      );


      if (running) {
        startMusic();
      }
    }

  }
);


// ======================================================
// START
// ======================================================

reset();

requestAnimationFrame(
  loop
);
