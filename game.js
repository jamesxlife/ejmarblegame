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

const playBtn = document.getElementById("play");
const joltBtn = document.getElementById("jolt");
const againBtn = document.getElementById("again");
const resultsEl = document.getElementById("results");
const timerEl = document.getElementById("timer");
const soundBtn = document.getElementById("sound");

let balls = [];
let results = [];
let running = false;
let start = 0;
let lastTimer = 0;


// ======================================================
// EJ'S FOOTBALL MARBLE CUP AUDIO
// ======================================================

let audioCtx = null;
let soundOn = true;
let musicTimer = null;

function getAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}


function tone(
  freq,
  duration = 0.15,
  volume = 0.08,
  type = "sine",
  delay = 0
) {
  if (!soundOn) return;

  const ac = getAudio();
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(
    volume,
    ac.currentTime + delay
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ac.currentTime + delay + duration
  );

  osc.connect(gain);
  gain.connect(ac.destination);

  osc.start(ac.currentTime + delay);
  osc.stop(ac.currentTime + delay + duration);
}


// ======================================================
// STARTING WHISTLE
// ======================================================

function startWhistle() {
  if (!soundOn) return;

  tone(1200, 0.18, 0.09, "sine", 0);
  tone(1500, 0.20, 0.09, "sine", 0.20);
  tone(1850, 0.45, 0.10, "sine", 0.42);
}


// ======================================================
// JOLT SOUND
// ======================================================

function joltSound() {
  if (!soundOn) return;

  tone(140, 0.12, 0.12, "square");
  tone
