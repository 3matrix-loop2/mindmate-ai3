// ═══════════════════════════════════════
//  MindMate AI — mood.js
//  Mood Tracker Logic
// ═══════════════════════════════════════

let moodChart = null;

// ─── Log Mood ───
window.logMood = async function () {
  const selected = document.querySelector('input[name="moodLog"]:checked');
  if (!selected) { showToast('Please select a mood first!'); return; }

  const mood = selected.value;
  const intensity = document.getElementById('intensitySlider').value;
  const note = document.getElementById('moodNote').value.trim();

  try {
    await window.authFetch(`${API_BASE}/mood`, {
      method: 'POST',
      body: JSON.stringify({ mood, intensity: parseInt(intensity), note })
    });
    showToast(`${moodEmoji(mood)} Mood logged successfully!`);
    document.getElementById('moodNote').value = '';
    selected.checked = false;
    loadMoodData();
  } catch {
    showToast('Failed to save mood. Is the server running?');
  }
};

// ─── Load Mood Data & Render Chart ───
window.loadMoodData = async function () {
  try {
    const res = await window.authFetch(`${API_BASE}/mood?limit=30`);
    const data = await res.json();

    if (!data.moods || data.moods.length === 0) {
      renderMoodChart([], []);
      renderMoodHistoryList([]);
      return;
    }

    const sorted = [...data.moods].reverse(); // oldest first for chart
    const labels = sorted.map(m => formatDateShort(m.timestamp));
    const values = sorted.map(m => moodToValue(m.mood));
    const colors = sorted.map(m => moodColor(m.mood));

    renderMoodChart(labels, values, colors);
    renderMoodHistoryList(data.moods.slice(0, 10));
  } catch (err) {
    console.error('Mood load error:', err);
  }
};

// ─── Chart.js Render ───
function renderMoodChart(labels, values, colors) {
  const ctx = document.getElementById('moodChart')?.getContext('2d');
  if (!ctx) return;

  if (moodChart) moodChart.destroy();

  moodChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Mood',
        data: values,
        borderColor: '#7c5cbf',
        backgroundColor: 'rgba(124,92,191,0.08)',
        pointBackgroundColor: colors || '#7c5cbf',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 6,
          ticks: {
            stepSize: 1,
            callback: (val) => ['', 'Angry', 'Sad', 'Anxious', 'Stressed', 'Calm', 'Happy'][val] || ''
          },
          grid: { color: 'rgba(0,0,0,0.04)' }
        },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const map = ['', 'Angry', 'Sad', 'Anxious', 'Stressed', 'Calm', 'Happy'];
              return ` ${map[ctx.parsed.y] || ctx.parsed.y}`;
            }
          }
        }
      }
    }
  });
}

// ─── Mood History List ───
function renderMoodHistoryList(moods) {
  const container = document.getElementById('moodHistoryList');
  if (!moods.length) {
    container.innerHTML = '<p class="empty-state">No mood entries yet. Start logging to see your patterns!</p>';
    return;
  }

  container.innerHTML = moods.map(m => `
    <div class="mood-history-item">
      <span class="mood-pill ${m.mood}">${moodEmoji(m.mood)} ${capitalize(m.mood)}</span>
      <span style="color:var(--text-muted);font-size:0.82rem;">${m.note || ''}</span>
      <span style="color:var(--text-muted);font-size:0.78rem;">${formatRelativeDate(m.timestamp)}</span>
    </div>
  `).join('');
}

// ─── Helpers ───
function moodToValue(mood) {
  const map = { angry: 1, sad: 2, anxious: 3, stressed: 4, calm: 5, happy: 6, neutral: 4 };
  return map[mood] ?? 3;
}

function moodColor(mood) {
  const map = {
    happy: '#f5c842', calm: '#4a90d9', sad: '#7c5cbf',
    anxious: '#4ab8a0', stressed: '#f4845f', angry: '#e8709a', neutral: '#a09bb5'
  };
  return map[mood] || '#7c5cbf';
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
