// ═══════════════════════════════════════
//  MindMate AI — journal.js
//  Journal Page Logic
// ═══════════════════════════════════════

// ─── Word Count ───
window.updateWordCount = function () {
  const content = document.getElementById('journalContent').value;
  const count = content.trim() ? content.trim().split(/\s+/).length : 0;
  document.getElementById('wordCount').textContent = `${count} word${count !== 1 ? 's' : ''}`;
};

// ─── Save Journal ───
window.saveJournal = async function () {
  const content = document.getElementById('journalContent').value.trim();
  if (!content) { showToast('Write something first!'); return; }
  if (content.split(/\s+/).length < 5) { showToast('Write a little more before saving...'); return; }

  try {
    await window.authFetch(`${API_BASE}/journal`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    showToast('📓 Journal entry saved!');
    document.getElementById('journalContent').value = '';
    updateWordCount();
    loadJournalList();
  } catch {
    showToast('Failed to save journal. Check your connection.');
  }
};

// ─── Analyze Journal with AI ───
window.analyzeJournal = async function () {
  const content = document.getElementById('journalContent').value.trim();
  if (!content) { showToast('Write something to analyze first!'); return; }
  if (content.split(/\s+/).length < 10) { showToast('Write a bit more for a better AI analysis.'); return; }

  const analysisCard = document.getElementById('journalAnalysis');
  const btn = event.target;
  btn.textContent = '🧠 Analyzing...';
  btn.disabled = true;

  try {
    const res = await window.authFetch(`${API_BASE}/journal`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    const data = await res.json();

    if (data.analysis) {
      document.getElementById('analysisSummary').textContent = data.analysis.summary;
      document.getElementById('analysisFeedback').textContent = data.analysis.feedback;

      const moodBadge = document.getElementById('analysisMoodBadge');
      const m = data.analysis.detectedMood || 'neutral';
      moodBadge.textContent = `${moodEmoji(m)} ${capitalize(m)}`;
      moodBadge.className = `emotion-badge ${m}`;

      analysisCard.classList.remove('hidden');
      analysisCard.scrollIntoView({ behavior: 'smooth' });

      document.getElementById('journalContent').value = '';
      updateWordCount();
      loadJournalList();
    }
  } catch {
    showToast('AI analysis failed. Is the server running?');
  }

  btn.textContent = '🧠 Analyze with AI';
  btn.disabled = false;
};

// ─── Load Journal List ───
window.loadJournalList = async function () {
  const container = document.getElementById('journalList');
  try {
    const res = await window.authFetch(`${API_BASE}/journal`);
    const journals = await res.json();

    if (!journals.length) {
      container.innerHTML = '<p class="empty-state">Your journal entries will appear here.</p>';
      return;
    }

    container.innerHTML = journals.map(j => `
      <div class="journal-item">
        <div>
          <div style="font-weight:600;font-size:0.9rem;color:var(--text-primary)">
            ${formatRelativeDate(j.timestamp)}
          </div>
          <div style="font-size:0.78rem;color:var(--text-muted)">
            ${j.wordCount || 0} words · ${j.aiSummary ? 'AI analyzed' : 'Saved'}
          </div>
        </div>
        <span class="mood-pill ${j.detectedMood || 'neutral'}">
          ${moodEmoji(j.detectedMood)} ${capitalize(j.detectedMood || 'neutral')}
        </span>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<p class="empty-state">Could not load journal entries.</p>';
  }
};
