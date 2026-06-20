'use strict';
const TasksApp = (() => {
  const KEY = 'sparix_tasks';
  let tasks = [];
  let editId = null;
  let filter = { priority: 'all', status: 'all', search: '' };

  function save() { localStorage.setItem(KEY, JSON.stringify(tasks)); }
  function load() { tasks = JSON.parse(localStorage.getItem(KEY) || '[]'); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

  function filtered() {
    return tasks.filter(t => {
      if (filter.priority !== 'all' && t.priority !== filter.priority) return false;
      if (filter.status !== 'all' && t.status !== filter.status) return false;
      if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase()) && !(t.desc||'').toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });
  }

  function stats() {
    const total = tasks.length, done = tasks.filter(t=>t.status==='completed').length,
      inprog = tasks.filter(t=>t.status==='in-progress').length, pend = tasks.filter(t=>t.status==='pending').length;
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-done').textContent = done;
    document.getElementById('stat-prog').textContent = inprog;
    document.getElementById('stat-pend').textContent = pend;
  }

  const priBadge = { low: 'success', medium: 'warning', high: 'danger' };
  const statusBadge = { pending: 'secondary', 'in-progress': 'info', completed: 'success' };

  function render() {
    const list = document.getElementById('task-list');
    const items = filtered();
    if (!items.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><p class="empty-state-text">No tasks found. Add one above!</p></div>`;
      return;
    }
    list.innerHTML = items.map(t => `
      <div class="card task-card ${t.status==='completed'?'task-done':''}" data-id="${t.id}">
        <div class="task-card-header">
          <div class="flex gap-2 align-center">
            <span class="badge badge-${priBadge[t.priority]}">${t.priority}</span>
            <span class="badge badge-${statusBadge[t.status]}">${t.status}</span>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm task-edit-btn" data-id="${t.id}">Edit</button>
            <button class="btn btn-ghost btn-sm text-danger task-del-btn" data-id="${t.id}">Delete</button>
          </div>
        </div>
        <h4 class="task-title ${t.status==='completed'?'line-through':''}">${t.title}</h4>
        ${t.desc ? `<p class="text-muted text-sm mt-1">${t.desc}</p>` : ''}
        ${t.due ? `<p class="text-faint text-xs mt-2">Due: ${t.due}</p>` : ''}
        <div class="task-status-row mt-3">
          <select class="form-select form-select-sm task-status-sel" data-id="${t.id}">
            ${['pending','in-progress','completed'].map(s=>`<option value="${s}" ${t.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>`).join('');

    list.querySelectorAll('.task-edit-btn').forEach(b => b.onclick = () => openEdit(b.dataset.id));
    list.querySelectorAll('.task-del-btn').forEach(b => b.onclick = () => del(b.dataset.id));
    list.querySelectorAll('.task-status-sel').forEach(s => s.onchange = () => changeStatus(s.dataset.id, s.value));
    stats();
  }

  function openEdit(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    editId = id;
    document.getElementById('task-title').value = t.title;
    document.getElementById('task-desc').value = t.desc || '';
    document.getElementById('task-priority').value = t.priority;
    document.getElementById('task-status').value = t.status;
    document.getElementById('task-due').value = t.due || '';
    document.getElementById('form-submit-btn').textContent = 'Update Task';
    document.getElementById('task-title').focus();
    document.getElementById('task-form-section').scrollIntoView({ behavior: 'smooth' });
  }

  function clearForm() {
    editId = null;
    document.getElementById('task-form').reset();
    document.getElementById('form-submit-btn').textContent = 'Add Task';
  }

  function submit() {
    const title = document.getElementById('task-title').value.trim();
    if (!title) { showError('Task title is required.'); return; }
    const task = {
      id: editId || uid(),
      title,
      desc: document.getElementById('task-desc').value.trim(),
      priority: document.getElementById('task-priority').value,
      status: document.getElementById('task-status').value,
      due: document.getElementById('task-due').value,
      created: editId ? (tasks.find(t=>t.id===editId)||{}).created : Date.now()
    };
    if (editId) { const i = tasks.findIndex(t=>t.id===editId); tasks[i] = task; }
    else tasks.unshift(task);
    save(); clearForm(); render();
    Toast.show(editId ? 'Task updated!' : 'Task added!', 'success');
  }

  function del(id) {
    if (!confirm('Delete this task?')) return;
    tasks = tasks.filter(t => t.id !== id);
    save(); render();
  }

  function changeStatus(id, status) {
    const t = tasks.find(x => x.id === id);
    if (t) { t.status = status; save(); render(); }
  }

  function showError(msg) { Toast.show(msg, 'error'); }

  function init() {
    load();
    document.getElementById('form-submit-btn').addEventListener('click', submit);
    document.getElementById('form-cancel-btn').addEventListener('click', clearForm);
    document.getElementById('filter-priority').addEventListener('change', e => { filter.priority = e.target.value; render(); });
    document.getElementById('filter-status').addEventListener('change', e => { filter.status = e.target.value; render(); });
    document.getElementById('search-input').addEventListener('input', e => { filter.search = e.target.value; render(); });
    render();
  }
  return { init };
})();

document.addEventListener('DOMContentLoaded', () => TasksApp.init());

const Toast = window.Toast || {
  show(msg, type='info') {
    const c = document.getElementById('toast-container') || (() => { const d=document.createElement('div'); d.className='toast-container'; d.id='toast-container'; document.body.appendChild(d); return d; })();
    const t = document.createElement('div'); t.className=`toast ${type}`;
    t.innerHTML=`<span class="toast-content"><span class="toast-title">${msg}</span></span>`;
    c.appendChild(t); setTimeout(() => t.remove(), 3000);
  }
};
