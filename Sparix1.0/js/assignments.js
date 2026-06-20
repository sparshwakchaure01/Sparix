'use strict';
const AssignmentsApp = (() => {
  const KEY = 'sparix_assignments';
  let items = [];
  let editId = null;
  let searchQ = '';
  let sortBy = 'deadline';

  function save() { localStorage.setItem(KEY, JSON.stringify(items)); }
  function load() { items = JSON.parse(localStorage.getItem(KEY) || '[]'); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

  function statusBadge(s) { return { 'not-started':'secondary','in-progress':'info','completed':'success' }[s] || 'secondary'; }

  function daysLeft(due) {
    if (!due) return null;
    const d = Math.ceil((new Date(due) - Date.now()) / 86400000);
    return d;
  }

  function render() {
    let list = [...items];
    if (searchQ) list = list.filter(a => a.name.toLowerCase().includes(searchQ) || a.subject.toLowerCase().includes(searchQ));
    if (sortBy === 'deadline') list.sort((a,b) => (a.deadline||'').localeCompare(b.deadline||''));
    else if (sortBy === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
    else if (sortBy === 'progress') list.sort((a,b) => b.progress - a.progress);

    const el = document.getElementById('assignment-list');
    if (!list.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📚</div><p class="empty-state-text">No assignments yet. Add one!</p></div>`;
      return;
    }
    el.innerHTML = list.map(a => {
      const dl = daysLeft(a.deadline);
      const dlClass = dl !== null ? (dl < 0 ? 'text-danger' : dl <= 3 ? 'text-warning' : 'text-success') : '';
      return `<div class="card assignment-card" data-id="${a.id}">
        <div class="flex justify-between align-center flex-wrap gap-2 mb-3">
          <div>
            <h4 class="font-semibold">${a.name}</h4>
            <span class="text-muted text-sm">${a.subject}</span>
          </div>
          <div class="flex gap-2 align-center">
            <span class="badge badge-${statusBadge(a.status)}">${a.status}</span>
            <button class="btn btn-ghost btn-sm" onclick="AssignmentsApp.edit('${a.id}')">Edit</button>
            <button class="btn btn-ghost btn-sm text-danger" onclick="AssignmentsApp.del('${a.id}')">Delete</button>
          </div>
        </div>
        <div class="progress-bar-wrap mb-2">
          <div class="progress-bar" style="width:${a.progress}%"></div>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-muted">Progress: <strong>${a.progress}%</strong></span>
          ${a.deadline ? `<span class="${dlClass}">${dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? 'Due today' : `${dl}d left`}</span>` : ''}
        </div>
        ${a.deadline ? `<p class="text-faint text-xs mt-1">Deadline: ${a.deadline}</p>` : ''}
      </div>`;
    }).join('');
  }

  function submit() {
    const name = document.getElementById('a-name').value.trim();
    const subject = document.getElementById('a-subject').value.trim();
    if (!name || !subject) { Toast.show('Name and subject are required.', 'error'); return; }
    const item = {
      id: editId || uid(),
      name, subject,
      deadline: document.getElementById('a-deadline').value,
      progress: parseInt(document.getElementById('a-progress').value) || 0,
      status: document.getElementById('a-status').value,
    };
    if (editId) { const i = items.findIndex(x=>x.id===editId); items[i] = item; }
    else items.unshift(item);
    save(); clearForm(); render();
    Toast.show(editId ? 'Assignment updated!' : 'Assignment added!', 'success');
  }

  function clearForm() {
    editId = null;
    document.getElementById('assignment-form').reset();
    document.getElementById('a-submit-btn').textContent = 'Add Assignment';
  }

  function edit(id) {
    const a = items.find(x=>x.id===id);
    if (!a) return;
    editId = id;
    document.getElementById('a-name').value = a.name;
    document.getElementById('a-subject').value = a.subject;
    document.getElementById('a-deadline').value = a.deadline || '';
    document.getElementById('a-progress').value = a.progress;
    document.getElementById('a-status').value = a.status;
    document.getElementById('a-submit-btn').textContent = 'Update Assignment';
    document.getElementById('assignment-form-section').scrollIntoView({ behavior: 'smooth' });
  }

  function del(id) {
    if (!confirm('Delete assignment?')) return;
    items = items.filter(x=>x.id!==id);
    save(); render();
  }

  function init() {
    load();
    document.getElementById('a-submit-btn').addEventListener('click', submit);
    document.getElementById('a-cancel-btn').addEventListener('click', clearForm);
    document.getElementById('a-search').addEventListener('input', e => { searchQ = e.target.value.toLowerCase(); render(); });
    document.getElementById('a-sort').addEventListener('change', e => { sortBy = e.target.value; render(); });
    render();
  }
  return { init, edit, del };
})();

document.addEventListener('DOMContentLoaded', () => AssignmentsApp.init());

const Toast = window.Toast || {
  show(msg, type='info') {
    const c = document.getElementById('toast-container') || (() => { const d=document.createElement('div'); d.className='toast-container'; d.id='toast-container'; document.body.appendChild(d); return d; })();
    const t = document.createElement('div'); t.className=`toast ${type}`;
    t.innerHTML=`<span class="toast-content"><span class="toast-title">${msg}</span></span>`;
    c.appendChild(t); setTimeout(() => t.remove(), 3000);
  }
};
