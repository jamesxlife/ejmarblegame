// ======================================================
// EJ'S FOOTBALL MARBLE CUP
// 25 TEAMS + AUDIO + CROWD + CONFETTI
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
// GAME ELEMENTS
// ======================================================

const W = 900;
const H = 1240;
const R = 11;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const confettiCanvas =
  document.getElementById("confetti");

const confettiCtx =
  confettiCanvas.getContext("2d");

const playBtn =
  document.getElementById("play");

const joltBtn =
  document.getElementById("jolt");

const soundBtn =
  document.getElementById("sound");

const againBtn =
  document.getElementById("again");

const resultsEl =
  document.getElementById("results");

const timerEl =
  document.getElementById("timer");

const winnerBanner =
  document.getElementById("winnerBanner");

const winnerText =
  document.getElementById("winnerText");

const crowdCheer =
  document.getElementById("crowdCheer");


// ======================================================
// GAME STATE
// ======================================================

let balls = [];
let results = [];

let running = false;

let startTime = 0;
let lastTimerUpdate = 0;


// ======================================================
// AUDIO
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

  oscillator.connect(gain);

  gain.connect(
    ac.destination
  );

  oscillator.start(time);

  oscillator.stop(
    time + duration
  );
}


// ======================================================
// RACE SOUNDS
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
    0.65,
    0.14,
    "triangle",
    0.48
  );
}


// ======================================================
// CROWD CHEER
// ======================================================

function playCrowdCheer() {

  if (
    !soundOn ||
    !crowdCheer
  ) {
    return;
  }

  crowdCheer.pause();

  crowdCheer.currentTime = 0;

  crowdCheer.volume = 0.75;

  crowdCheer.play().catch(
    error => {
      console.log(
        "Crowd audio unavailable:",
        error
      );
    }
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

      if (
        beat % 4 === 0
      ) {

        tone(
          110,
          0.10,
          0.035,
          "triangle"
        );
      }

      if (
        beat % 4 === 2
      ) {

        tone(
          165,
          0.07,
          0.025,
          "triangle"
        );
      }

      if (
        beat % 8 === 6
      ) {

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
// CONFETTI
// ======================================================

let confettiPieces = [];
let confettiRunning = false;


const CONFETTI_COLORS = [
  "#facc15",
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f97316",
  "#ec4899",
  "#ffffff"
];


function launchConfetti() {

  confettiPieces = [];

  confettiRunning
