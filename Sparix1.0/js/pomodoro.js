'use strict';
const PomodoroApp = (() => {
  const STORE_KEY = 'sparix_pomodoro';
  let state = {
    mode: 'focus', // focus | short | long
    duration: { focus: 25, short: 5, long: 15 },
    remaining: 25 * 60,
    running: false,
    sessions: 0,
    history: [],
  };
  let interval = null;
  let audioCtx = null;

  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  function load() {
    const d = localStorage.getItem(STORE_KEY);
    if (d) { const p = JSON.parse(d); state = { ...state, ...p, running: false }; }
  }

  function fmt(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

  function render() {
    document.getElementById('timer-display').textContent = fmt(state.remaining);
    document.getElementById('session-count').textContent = state.sessions;
    document.title = `${fmt(state.remaining)} — SPARIX Pomodoro`;
    const pct = 1 - state.remaining / (state.duration[state.mode] * 60);
    document.getElementById('timer-ring').style.strokeDashoffset = 283 * (1 - pct);
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === state.mode));
    document.getElementById('btn-start').style.display = state.running ? 'none' : 'inline-flex';
    document.getElementById('btn-pause').style.display = state.running ? 'inline-flex' : 'none';
    renderHistory();
  }

  function renderHistory() {
    const el = document.getElementById('session-history');
    if (!el) return;
    if (!state.history.length) { el.innerHTML = '<p class="empty-state-text">No sessions yet. Start your first focus session!</p>'; return; }
    el.innerHTML = state.history.slice(-10).reverse().map(h =>
      `<div class="session-row"><span class="badge badge-${h.mode==='focus'?'primary':'success'}">${h.mode}</span><span>${h.duration}min</span><span class="text-muted">${h.time}</span></div>`
    ).join('');
  }

  function beep() {
    try {
      audioCtx = audioCtx || new AudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.frequency.value = 880; osc.type = 'sine';
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.start(); osc.stop(audioCtx.currentTime + 1.2);
    } catch(e) {}
  }

  function notify(title, body) {
    if (Notification.permission === 'granted') new Notification(title, { body, icon: '/favicon.ico' });
  }

  function tick() {
    if (state.remaining > 0) { state.remaining--; save(); render(); return; }
    clearInterval(interval); interval = null; state.running = false;
    state.history.push({ mode: state.mode, duration: state.duration[state.mode], time: new Date().toLocaleTimeString() });
    if (state.mode === 'focus') state.sessions++;
    beep();
    notify('SPARIX Pomodoro', state.mode === 'focus' ? '🎉 Focus session complete! Take a break.' : '⏰ Break over. Time to focus!');
    save(); render();
  }

  function start() { if (state.running) return; state.running = true; interval = setInterval(tick, 1000); save(); render(); }
  function pause() { clearInterval(interval); interval = null; state.running = false; save(); render(); }
  function reset() { pause(); state.remaining = state.duration[state.mode] * 60; save(); render(); }
  function setMode(m) { pause(); state.mode = m; state.remaining = state.duration[m] * 60; save(); render(); }

  function applyCustom() {
    const v = parseInt(document.getElementById('custom-duration').value);
    if (v > 0 && v <= 120) { state.duration.focus = v; if (state.mode === 'focus') { state.remaining = v * 60; } save(); render(); Toast.show('Duration updated!', 'success'); }
    else Toast.show('Enter a value between 1–120 minutes.', 'error');
  }

  function requestNotif() {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }

  function init() {
    load(); requestNotif();
    document.getElementById('btn-start').addEventListener('click', start);
    document.getElementById('btn-pause').addEventListener('click', pause);
    document.getElementById('btn-reset').addEventListener('click', reset);
    document.getElementById('btn-apply-custom').addEventListener('click', applyCustom);
    document.querySelectorAll('.mode-btn').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    render();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => PomodoroApp.init());

// Toast helper (standalone fallback)
const Toast = window.Toast || {
  show(msg, type='info') {
    const c = document.getElementById('toast-container') || (() => { const d=document.createElement('div'); d.className='toast-container'; d.id='toast-container'; document.body.appendChild(d); return d; })();
    const t = document.createElement('div'); t.className=`toast ${type}`;
    t.innerHTML=`<span class="toast-content"><span class="toast-title">${msg}</span></span>`;
    c.appendChild(t); setTimeout(() => t.remove(), 3000);
  }
};
