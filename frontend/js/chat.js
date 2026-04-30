// ═══════════════════════════════════════
//  MindMate AI — chat.js
//  AI Chat Companion Logic
// ═══════════════════════════════════════

let isSending = false;

// ─── Send Message ───
window.sendMessage = async function () {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || isSending) return;

  input.value = '';
  input.style.height = 'auto';
  isSending = true;

  // Append user message
  appendMessage('user', text);

  // Show typing animation
  const typingId = showTyping();

  try {
    const res = await window.authFetch(`${API_BASE}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    removeTyping(typingId);

    if (data.isEmergency) {
      showEmergencyBanner(data);
    } else {
      appendMessage('ai', data.response);
      updateEmotionBadge(data.detectedMood);
      if (data.suggestion) showSuggestionChip(data.suggestion);
    }
  } catch (err) {
    removeTyping(typingId);
    appendMessage('ai', "Hmm, I'm having a little trouble connecting right now. Check that the server is running and try again.");
  }

  isSending = false;
};

// ─── Handle Enter Key ───
window.handleChatKey = function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

// ─── Auto-Resize Textarea ───
window.autoResize = function (el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
};

// ─── Append Message Bubble ───
function appendMessage(role, text) {
  const container = document.getElementById('chatMessages');
  const row = document.createElement('div');
  row.className = `message-row ${role}`;

  const avatarEl = document.createElement('div');
  avatarEl.className = `msg-avatar ${role}`;
  avatarEl.textContent = role === 'ai' ? '🧠' : '😊';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;

  row.appendChild(avatarEl);
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

// ─── Typing Indicator ───
function showTyping() {
  const container = document.getElementById('chatMessages');
  const id = 'typing_' + Date.now();
  const row = document.createElement('div');
  row.className = 'message-row ai';
  row.id = id;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar ai';
  avatar.textContent = '🧠';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = `<div class="typing-bubble">
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  </div>`;

  row.appendChild(avatar);
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ─── Emotion Badge ───
function updateEmotionBadge(mood) {
  const badge = document.getElementById('emotionBadge');
  const labels = {
    happy: '😄 Happy', sad: '😔 Sad', anxious: '😰 Anxious',
    angry: '😠 Angry', stressed: '😤 Stressed', calm: '😌 Calm', neutral: '—'
  };
  badge.textContent = labels[mood] || mood;
  badge.className = `emotion-badge ${mood || 'neutral'}`;
}

// ─── Suggestion Chips ───
function showSuggestionChip(suggestion) {
  const container = document.getElementById('suggestionChips');
  container.innerHTML = '';

  const chip = document.createElement('button');
  chip.className = 'chip';
  chip.textContent = suggestion.chip;
  chip.title = suggestion.tip;
  chip.onclick = () => {
    showToast(`💡 ${suggestion.tip}`, 6000);
    container.innerHTML = '';
  };

  container.appendChild(chip);

  // Quick reply chips
  const quickReplies = ['Tell me more', 'I need a distraction', 'I\'m feeling better now'];
  quickReplies.forEach(label => {
    const qChip = document.createElement('button');
    qChip.className = 'chip';
    qChip.textContent = label;
    qChip.onclick = () => {
      document.getElementById('chatInput').value = label;
      sendMessage();
      container.innerHTML = '';
    };
    container.appendChild(qChip);
  });
}

// ─── Emergency Banner ───
function showEmergencyBanner(data) {
  const banner = document.getElementById('emergencyBanner');
  const msg = document.getElementById('emergencyMsg');
  const links = document.getElementById('emergencyLinks');

  msg.textContent = data.message;
  links.innerHTML = (data.resources || []).map(r =>
    `<a href="${r.url || '#'}" target="_blank">${r.name}: ${r.number}</a>`
  ).join('');

  banner.classList.remove('hidden');
  banner.scrollIntoView({ behavior: 'smooth' });
}
