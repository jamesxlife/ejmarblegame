// ======================================================
// EJ'S FOOTBALL MARBLE CUP
// 25 TEAM VERSION
// ======================================================


// ======================================================
// TEAMS
// ======================================================

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


// ======================================================
// MARBLE COLOURS
// ======================================================

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


// ======================================================
// GAME CONSTANTS
// ======================================================

const W = 900;
const H = 1240;
const R = 11;


// ======================================================
// PAGE ELEMENTS
// ======================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const playBtn = document.getElementById("play");
const joltBtn = document.getElementById("jolt");
const againBtn = document.getElementById("again");

const resultsEl = document.getElementById("results");
const timerEl = document.getElementById("timer");

const soundBtn = document.getElementById("sound");


// ======================================================
// GAME STATE
// ======================================================

let balls = [];
let results = [];

let running = false;

let startTime = 0;
let lastTimerUpdate = 0;


// ======================================================
// AUDIO SYSTEM
// ======================================================

let audioCtx = null;
let soundOn = true;
let musicTimer = null;


function getAudioContext() {

  if (!audioCtx) {

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      console.log("Web Audio is not supported.");
      return null;
    }

    audioCtx =
      new AudioContextClass();
  }

  return audioCtx;
}


async function unlockAudio() {

  const ac =
    getAudioContext();

  if (!ac) {
    return false;
  }

  if (ac.state === "suspended") {

    try {
      await ac.resume();
    }
    catch (error) {

      console.log(
        "Audio could not start:",
        error
      );

      return false;
    }
  }

  return ac.state === "running";
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

  const ac =
    getAudioContext();

  if (
    !ac ||
    ac.state !== "running"
  ) {
    return;
  }

  const time =
    ac.currentTime + delay;

  const oscillator =
    ac.createOscillator();

  const gain =
    ac.createGain();

  oscillator.type = type;

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

  oscillator.connect(gain);
  gain.connect(ac.destination);

  oscillator.start(time);
  oscillator.stop(time + duration);
}


// ======================================================
// SOUND EFFECTS
// ======================================================

function soundTest() {

  tone(
    660,
    0.12,
    0.10,
    "sine",
    0
  );

  tone(
    880,
    0.18,
    0.10,
    "sine",
    0.13
  );
}


function startWhistle() {

  tone(
    1200,
    0.18,
    0.10,
    "sine",
    0
  );

  tone(
    1500,
    0.20,
    0.10,
    "sine",
    0.21
  );

  tone(
    1850,
    0.45,
    0.12,
    "sine",
    0.43
  );
}


function joltSound() {

  tone(
    140,
    0.12,
    0.12,
    "square",
    0
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
    0.07,
    "square",
    0.15
  );
}


function winnerSound() {

  tone(
    523,
    0.20,
    0.10,
    "triangle",
    0
  );

  tone(
    659,
    0.20,
    0.10,
    "triangle",
    0.16
  );

  tone(
    784,
    0.20,
    0.10,
    "triangle",
    0.32
  );

  tone(
    1047,
    0.60,
    0.14,
    "triangle",
    0.48
  );
}


// ======================================================
// BACKGROUND SPORTING RHYTHM
// ======================================================

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

      if (beat % 4 === 0) {

        tone(
          110,
          0.10,
          0.04,
          "triangle"
        );
      }

      if (beat % 4 === 2) {

        tone(
          165,
          0.07,
          0.03,
          "triangle"
        );
      }

      if (beat % 8 === 6) {

        tone(
          220,
          0.05,
          0.02,
          "sine"
        );
      }

      beat++;

    }, 350);
}


function stopMusic() {

  if (musicTimer) {

    clearInterval(
      musicTimer
    );

    musicTimer = null;
  }
}


// ======================================================
// TEAM INITIALS
// ======================================================

function initials(name) {

  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 3);
}


// ======================================================
// RESET GAME
// ======================================================

function reset() {

  stopMusic();

  results = [];

  resultsEl.innerHTML = `
    <p class="hint">
      Click <b>PLAY</b> to launch every marble at once.
      Positions will appear here as each team crosses the line.
    </p>
  `;

  againBtn.hidden = true;

  timerEl.textContent = "";

  balls =
    TEAMS.map(
      (name, i) => ({

        name: name,

        color:
          COLORS[i],

        x:
          80 +
          (i % 12) * 67,

        y:
          60 -
          Math.floor(i / 12) * 28,

        vx:
          (Math.random() - 0.5) * 2,

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
    await unlockAudio();
  }

  reset();

  startTime =
    performance.now();

  running = true;

  playBtn.disabled =
    true;

  playBtn.textContent =
    "🏁 RACING...";

  joltBtn.disabled =
    false;

  if (
    soundOn &&
    audioCtx &&
    audioCtx.state === "running"
  ) {

    startWhistle();

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
          (Math.random() - 0.5) * 5;

        ball.vy -=
          1.5 +
          Math.random() * 2.5;

        ball.x +=
          (Math.random() - 0.5) * 5;
      }

    }
  );
}


// ======================================================
// LINE COLLISION
// ======================================================

function seg(
  ball,
  x1,
  y1,
  x2,
  y2,
  width = 10
) {

  const dx =
    x2 - x1;

  const dy =
    y2 - y1;

  const lengthSquared =
    dx * dx +
    dy * dy;

  let t =
    (
      (ball.x - x1) * dx +
      (ball.y - y1) * dy
    ) /
    lengthSquared;

  t =
    Math.max(
      0,
      Math.min(
        1,
        t
      )
    );

  const px =
    x1 + t * dx;

  const py =
    y1 + t * dy;

  const nx =
    ball.x - px;

  const ny =
    ball.y - py;

  const distance =
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

    const ux =
      nx / distance;

    const uy =
      ny / distance;

    ball.x =
      px +
      ux *
      (R + width + 0.5);

    ball.y =
      py +
      uy *
      (R + width + 0.5);

    const dot =
      ball.vx * ux +
      ball.vy * uy;

    if (dot < 0) {

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

  const dx =
    ball.x - x;

  const dy =
    ball.y - y;

  const distance =
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

    const ux =
      dx / distance;

    const uy =
      dy / distance;

    ball.x =
      x +
      ux *
      (R + 11);

    ball.y =
      y +
      uy *
      (R + 11);

    const dot =
      ball.vx * ux +
      ball.vy * uy;

    if (dot < 0) {

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
// LEADERBOARD
// ======================================================

function addResult(ball) {

  results.push(
    ball.name
  );

  // Winner
  if (
    results.length === 1
  ) {
    winnerSound();
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

      if (i === 0) {

        item.className =
          "gold";

      } else if (i === 1) {

        item.className =
          "silver";

      } else if (i === 2) {

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

  // Entire race finished
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
// PHYSICS
// ======================================================

function update(now) {

  if (
    now -
    lastTimerUpdate >
    100
  ) {

    timerEl.textContent =
      (
        (now - startTime) /
        1000
      ).toFixed(1) +
      "s";

    lastTimerUpdate =
      now;
  }

  const rotation =
    now / 550;

  balls.forEach(
    ball => {

      if (ball.done) {
        return;
      }


      // Gravity

      ball.vy +=
        0.085;


      // Random sideways drift

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


      // LEFT WALL

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


      // RIGHT WALL

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
      // 1. PEG SLALOM
      // ==================================================

      for (
        let row = 0;
        row < 3;
        row++
      ) {

        for (
          let x =
            105 +
            (row % 2) * 45;

          x <
          W - 70;

          x += 90
        ) {

          peg(
            ball,
            x,
            190 +
            row * 45
          );
        }
      }


      // ==================================================
      // 2. GATE DROP
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
      // 3. FUNNEL
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
      // 4. ROTATING CROSS
      // ==================================================

      for (
        let q = 0;
        q < 2;
        q++
      ) {

        const angle =
          rotation +
          q *
          Math.PI /
          2;

        const dx =
          Math.cos(
            angle
          ) *
          125;

        const dy =
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
      // 5. PINBALL ALLEY
      // ==================================================

      for (
        let row = 0;
        row < 3;
        row++
      ) {

        for (
          let x =
            105 +
            (row % 2) * 45;

          x <
          W - 70;

          x += 90
        ) {

          peg(
            ball,
            x,
            965 +
            row * 45
          );
        }
      }


      // ==================================================
      // FINISH
      // ==================================================

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
    i < balls.length;
    i++
  ) {

    for (
      let j = i + 1;
      j < balls.length;
      j++
    ) {

      const A =
        balls[i];

      const B =
        balls[j];

      if (
        A.done ||
        B.done
      ) {
        continue;
      }

      const dx =
        B.x - A.x;

      const dy =
        B.y - A.y;

      const distance =
        Math.hypot(
          dx,
          dy
        );

      if (
        distance > 0 &&
        distance < 2 * R
      ) {

        const ux =
          dx / distance;

        const uy =
          dy / distance;

        const overlap =
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

        const relative =
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
// DRAW
// ======================================================

function draw() {

  ctx.clearRect(
    0,
    0,
    W,
    H
  );


  // ====================================================
  // FOOTBALL PITCH
  // ====================================================

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


  // START / FINISH

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


  // ====================================================
  // OBSTACLE LABELS
  // ====================================================

  ctx.font =
    "800 15px system-ui";

  ctx.fillStyle =
    "rgba(255,255,255,.85)";

  const labels = [
    "1  PEG SLALOM",
    "2  GATE DROP",
    "3  THE FUNNEL",
    "4  ROTATING CROSS",
    "5  PINBALL ALLEY"
  ];

  const labelPositions = [
    155,
    360,
    570,
    775,
    935
  ];

  labels.forEach(
    (label, index) => {

      ctx.fillText(
        label,
        W / 2,
        labelPositions[index]
      );

    }
  );


  // ====================================================
  // YELLOW PEGS
  // ====================================================

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
          (row % 2) * 45;

        x <
        W - 70;

        x += 90
      ) {

        ctx.beginPath();

        ctx.arc(
          x,
          base +
          row * 45,
          11,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    }
  }


  // ====================================================
  // BLUE GATE DROP
  // ====================================================

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


  // ====================================================
  // ORANGE FUNNEL
  // ====================================================

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


  // ====================================================
  // PURPLE ROTATING CROSS
  // ====================================================

  const rotation =
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


  // ====================================================
  // MARBLES
  // ====================================================

  balls.forEach(
    ball => {

      ctx.shadowColor =
        "rgba(0,0,0,.8)";

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
        Math.PI * 2
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
// ANIMATION LOOP
// ======================================================

function loop(now) {

  if (running) {
    update(now);
  }

  draw();

  requestAnimationFrame(
    loop
  );
}


// ======================================================
// BUTTONS
// ======================================================


// PLAY

playBtn.addEventListener(
  "click",
  play
);


// JOLT

joltBtn.addEventListener(
  "click",
  async () => {

    if (soundOn) {
      await unlockAudio();
    }

    jolt();

    if (soundOn) {
      joltSound();
    }

  }
);


// RACE AGAIN

againBtn.addEventListener(
  "click",
  play
);


// SOUND ON / OFF

if (soundBtn) {

  soundBtn.addEventListener(
    "click",
    async () => {


      // Turn sound off

      if (soundOn) {

        soundOn =
          false;

        stopMusic();

        soundBtn.textContent =
          "🔇 SOUND OFF";

        return;
      }


      // Turn sound back on

      soundOn =
        true;

      soundBtn.textContent =
        "🔊 SOUND ON";


      const audioWorking =
        await unlockAudio();


      if (audioWorking) {

        soundTest();

        if (running) {
          startMusic();
        }
      }

    }
  );
}


// ======================================================
// START GAME
// ======================================================

reset();

requestAnimationFrame(
  loop
);
