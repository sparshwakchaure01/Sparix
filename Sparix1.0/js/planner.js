'use strict';
const PlannerApp = (() => {
  const KEY = 'sparix_planner';
  let blocks = [];
  let editId = null;
  let view = 'daily'; // daily | weekly | monthly
  let currentDate = new Date();

  function save() { localStorage.setItem(KEY, JSON.stringify(blocks)); }
  function load() { blocks = JSON.parse(localStorage.getItem(KEY) || '[]'); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

  function dateKey(d) { return d.toISOString().split('T')[0]; }
  function weekDates(d) {
    const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d); mon.setDate(diff);
    return Array.from({length:7}, (_,i) => { const dd=new Date(mon); dd.setDate(mon.getDate()+i); return dd; });
  }
  function monthDates(d) {
    const days = [];
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last = new Date(d.getFullYear(), d.getMonth()+1, 0);
    for (let i=1; i<=last.getDate(); i++) days.push(new Date(d.getFullYear(), d.getMonth(), i));
    return days;
  }

  function renderBlock(b) {
    return `<div class="planner-block card" data-id="${b.id}">
      <div class="flex justify-between align-center">
        <div>
          <strong>${b.subject}</strong><span class="text-muted text-sm"> — ${b.topic}</span>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" onclick="PlannerApp.edit('${b.id}')">Edit</button>
          <button class="btn btn-ghost btn-sm text-danger" onclick="PlannerApp.del('${b.id}')">✕</button>
        </div>
      </div>
      <p class="text-xs text-muted mt-1">${b.time} · ${b.duration}min</p>
    </div>`;
  }

  function renderDaily() {
    const key = dateKey(currentDate);
    const day = blocks.filter(b => b.date === key).sort((a,b) => a.time.localeCompare(b.time));
    const el = document.getElementById('planner-content');
    el.innerHTML = `<h3 class="mb-4">${currentDate.toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</h3>
      ${day.length ? day.map(renderBlock).join('') : '<div class="empty-state"><div class="empty-state-icon">📅</div><p class="empty-state-text">No study blocks for today.</p></div>'}`;
  }

  function renderWeekly() {
    const dates = weekDates(currentDate);
    const el = document.getElementById('planner-content');
    el.innerHTML = `<div class="weekly-grid">` + dates.map(d => {
      const key = dateKey(d);
      const day = blocks.filter(b => b.date === key).sort((a,b) => a.time.localeCompare(b.time));
      return `<div class="weekly-day"><div class="weekly-day-header">${d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric'})}</div>
        ${day.length ? day.map(renderBlock).join('') : '<p class="text-faint text-xs text-center py-2">Empty</p>'}
      </div>`;
    }).join('') + '</div>';
  }

  function renderMonthly() {
    const dates = monthDates(currentDate);
    const el = document.getElementById('planner-content');
    el.innerHTML = `<div class="monthly-grid">` + dates.map(d => {
      const key = dateKey(d);
      const count = blocks.filter(b => b.date === key).length;
      return `<div class="monthly-cell ${key===dateKey(new Date())?'today':''}">
        <span class="monthly-day-num">${d.getDate()}</span>
        ${count ? `<span class="badge badge-primary">${count}</span>` : ''}
      </div>`;
    }).join('') + '</div>';
  }

  function render() {
    if (view === 'daily') renderDaily();
    else if (view === 'weekly') renderWeekly();
    else renderMonthly();
    renderUpcoming();
  }

  function renderUpcoming() {
    const today = dateKey(new Date());
    const upcoming = blocks.filter(b => b.date >= today).sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).slice(0, 5);
    const el = document.getElementById('upcoming-list');
    if (!el) return;
    el.innerHTML = upcoming.length ? upcoming.map(b =>
      `<div class="flex justify-between align-center py-2 border-bottom">
        <div><strong class="text-sm">${b.subject}</strong><p class="text-xs text-muted">${b.topic}</p></div>
        <div class="text-right"><p class="text-xs">${b.date}</p><p class="text-xs text-muted">${b.time} · ${b.duration}min</p></div>
      </div>`).join('') : '<p class="text-faint text-sm">No upcoming sessions.</p>';
  }

  function submit() {
    const subject = document.getElementById('p-subject').value.trim();
    const topic = document.getElementById('p-topic').value.trim();
    const date = document.getElementById('p-date').value;
    const time = document.getElementById('p-time').value;
    const duration = parseInt(document.getElementById('p-duration').value) || 60;
    if (!subject || !date || !time) { Toast.show('Subject, date, and time are required.', 'error'); return; }
    const block = { id: editId || uid(), subject, topic, date, time, duration };
    if (editId) { const i = blocks.findIndex(x=>x.id===editId); blocks[i] = block; }
    else blocks.push(block);
    save(); clearForm(); render();
    Toast.show(editId ? 'Block updated!' : 'Block added!', 'success');
  }

  function clearForm() {
    editId = null;
    document.getElementById('planner-form').reset();
    document.getElementById('p-submit-btn').textContent = 'Add Block';
  }

  function edit(id) {
    const b = blocks.find(x=>x.id===id);
    if (!b) return;
    editId = id;
    document.getElementById('p-subject').value = b.subject;
    document.getElementById('p-topic').value = b.topic;
    document.getElementById('p-date').value = b.date;
    document.getElementById('p-time').value = b.time;
    document.getElementById('p-duration').value = b.duration;
    document.getElementById('p-submit-btn').textContent = 'Update Block';
  }

  function del(id) {
    if (!confirm('Delete this block?')) return;
    blocks = blocks.filter(x=>x.id!==id);
    save(); render();
  }

  function navigate(dir) {
    if (view === 'daily') currentDate.setDate(currentDate.getDate() + dir);
    else if (view === 'weekly') currentDate.setDate(currentDate.getDate() + dir*7);
    else currentDate.setMonth(currentDate.getMonth() + dir);
    render();
  }

  function init() {
    load();
    document.getElementById('p-submit-btn').addEventListener('click', submit);
    document.getElementById('p-cancel-btn').addEventListener('click', clearForm);
    document.querySelectorAll('.view-tab').forEach(b => b.addEventListener('click', () => {
      view = b.dataset.view;
      document.querySelectorAll('.view-tab').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      render();
    }));
    document.getElementById('nav-prev').addEventListener('click', () => navigate(-1));
    document.getElementById('nav-next').addEventListener('click', () => navigate(1));
    document.getElementById('nav-today').addEventListener('click', () => { currentDate = new Date(); render(); });
    render();
  }
  return { init, edit, del };
})();

document.addEventListener('DOMContentLoaded', () => PlannerApp.init());

const Toast = window.Toast || {
  show(msg, type='info') {
    const c = document.getElementById('toast-container') || (() => { const d=document.createElement('div'); d.className='toast-container'; d.id='toast-container'; document.body.appendChild(d); return d; })();
    const t = document.createElement('div'); t.className=`toast ${type}`;
    t.innerHTML=`<span class="toast-content"><span class="toast-title">${msg}</span></span>`;
    c.appendChild(t); setTimeout(() => t.remove(), 3000);
  }
};
