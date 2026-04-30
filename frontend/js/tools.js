// ═══════════════════════════════════════
//  MindMate AI — tools.js
//  Self-Care Tools: Breathing Exercise
// ═══════════════════════════════════════

let breathingActive = false;
let breathTimer = null;
let breathCycle = 0;

// 4-7-8 breathing pattern: inhale 4s, hold 7s, exhale 8s
const BREATH_PHASES = [
  { label: 'Breathe IN', duration: 4000, scale: 1.5, bg: 'linear-gradient(135deg, #ddeeff, #e8f5ff)' },
  { label: 'Hold', duration: 7000, scale: 1.5, bg: 'linear-gradient(135deg, #fff9e0, #fef3c7)' },
  { label: 'Breathe OUT', duration: 8000, scale: 1.0, bg: 'linear-gradient(135deg, #dff5ef, #d1fae5)' },
];

window.toggleBreathing = function () {
  if (breathingActive) {
    stopBreathing();
  } else {
    startBreathing();
  }
};

function startBreathing() {
  breathingActive = true;
  breathCycle = 0;
  document.getElementById('breathBtn').textContent = 'Stop';
  document.getElementById('breathText').textContent = 'Ready...';
  document.getElementById('breathPhase').textContent = '';
  runBreathPhase();
}

function stopBreathing() {
  breathingActive = false;
  clearTimeout(breathTimer);

  const circle = document.getElementById('breathCircle');
  const phase = document.getElementById('breathPhase');
  const text = document.getElementById('breathText');

  circle.style.transform = 'scale(1)';
  circle.style.background = 'linear-gradient(135deg, var(--purple-light), var(--mint-light))';
  circle.style.transition = 'transform 1s ease, background 1s ease';

  text.textContent = 'Tap to begin';
  phase.textContent = '';
  document.getElementById('breathBtn').textContent = 'Start Breathing';
}

function runBreathPhase() {
  if (!breathingActive) return;

  const phaseData = BREATH_PHASES[breathCycle % 3];
  const circle = document.getElementById('breathCircle');
  const phaseEl = document.getElementById('breathPhase');
  const textEl = document.getElementById('breathText');

  phaseEl.textContent = phaseData.label;
  textEl.textContent = `${phaseData.duration / 1000}s`;
  circle.style.background = phaseData.bg;
  circle.style.transition = `transform ${phaseData.duration}ms cubic-bezier(0.4, 0, 0.2, 1), background ${phaseData.duration}ms ease`;
  circle.style.transform = `scale(${phaseData.scale})`;

  // Countdown
  let remaining = phaseData.duration / 1000;
  const countInterval = setInterval(() => {
    remaining--;
    if (remaining > 0 && breathingActive) {
      textEl.textContent = `${remaining}s`;
    } else {
      clearInterval(countInterval);
    }
  }, 1000);

  breathTimer = setTimeout(() => {
    clearInterval(countInterval);
    breathCycle++;
    runBreathPhase();
  }, phaseData.duration);
}
