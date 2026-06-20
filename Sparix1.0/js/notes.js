'use strict';
const NotesApp = (() => {
  const KEY = 'sparix_notes';
  let notes = [];
  let editId = null;
  let filter = { category: 'all', search: '' };
  let sortBy = 'pinned';

  function save() { localStorage.setItem(KEY, JSON.stringify(notes)); }
  function load() { notes = JSON.parse(localStorage.getItem(KEY) || '[]'); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

  const cats = ['general','subject-notes','revision-notes','personal'];

  function filtered() {
    let list = [...notes];
    if (filter.category !== 'all') list = list.filter(n => n.category === filter.category);
    if (filter.search) list = list.filter(n => n.title.toLowerCase().includes(filter.search) || n.content.toLowerCase().includes(filter.search));
    if (sortBy === 'pinned') list.sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0) || b.updated - a.updated);
    else if (sortBy === 'newest') list.sort((a,b) => b.updated - a.updated);
    else if (sortBy === 'oldest') list.sort((a,b) => a.updated - b.updated);
    else if (sortBy === 'title') list.sort((a,b) => a.title.localeCompare(b.title));
    return list;
  }

  function render() {
    const el = document.getElementById('notes-grid');
    const list = filtered();
    if (!list.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📝</div><p class="empty-state-text">No notes found. Create your first note!</p></div>`;
      return;
    }
    el.innerHTML = list.map(n => `
      <div class="card note-card ${n.pinned?'note-pinned':''}" data-id="${n.id}">
        <div class="note-card-header">
          <span class="badge badge-secondary">${n.category}</span>
          <div class="flex gap-1">
            <button class="btn btn-ghost btn-xs ${n.pinned?'text-warning':''}" onclick="NotesApp.togglePin('${n.id}')" title="${n.pinned?'Unpin':'Pin'}">📌</button>
            <button class="btn btn-ghost btn-xs" onclick="NotesApp.openEdit('${n.id}')">✏️</button>
            <button class="btn btn-ghost btn-xs" onclick="NotesApp.exportNote('${n.id}')">⬇️</button>
            <button class="btn btn-ghost btn-xs text-danger" onclick="NotesApp.del('${n.id}')">🗑️</button>
          </div>
        </div>
        <h4 class="note-title mt-2">${n.title}</h4>
        <p class="note-preview text-muted text-sm mt-1 line-clamp-3">${n.content}</p>
        <p class="text-faint text-xs mt-3">${new Date(n.updated).toLocaleDateString()}</p>
      </div>`).join('');
  }

  function submit() {
    const title = document.getElementById('n-title').value.trim();
    const content = document.getElementById('n-content').value.trim();
    if (!title || !content) { Toast.show('Title and content are required.', 'error'); return; }
    const note = {
      id: editId || uid(),
      title,
      content,
      category: document.getElementById('n-category').value,
      pinned: editId ? (notes.find(n=>n.id===editId)||{}).pinned || false : false,
      updated: Date.now(),
    };
    if (editId) { const i = notes.findIndex(n=>n.id===editId); notes[i] = note; }
    else notes.unshift(note);
    save(); clearForm(); render();
    Toast.show(editId ? 'Note updated!' : 'Note created!', 'success');
  }

  function clearForm() {
    editId = null;
    document.getElementById('notes-form').reset();
    document.getElementById('n-submit-btn').textContent = 'Save Note';
  }

  function openEdit(id) {
    const n = notes.find(x=>x.id===id);
    if (!n) return;
    editId = id;
    document.getElementById('n-title').value = n.title;
    document.getElementById('n-content').value = n.content;
    document.getElementById('n-category').value = n.category;
    document.getElementById('n-submit-btn').textContent = 'Update Note';
    document.getElementById('note-editor-section').scrollIntoView({ behavior: 'smooth' });
  }

  function togglePin(id) {
    const n = notes.find(x=>x.id===id);
    if (n) { n.pinned = !n.pinned; save(); render(); }
  }

  function del(id) {
    if (!confirm('Delete this note?')) return;
    notes = notes.filter(n=>n.id!==id);
    save(); render();
  }

  function exportNote(id) {
    const n = notes.find(x=>x.id===id);
    if (!n) return;
    const blob = new Blob([`${n.title}\n${'='.repeat(n.title.length)}\nCategory: ${n.category}\nDate: ${new Date(n.updated).toLocaleDateString()}\n\n${n.content}`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${n.title.replace(/\s+/g,'_')}.txt`;
    a.click();
  }

  function init() {
    load();
    document.getElementById('n-submit-btn').addEventListener('click', submit);
    document.getElementById('n-cancel-btn').addEventListener('click', clearForm);
    document.getElementById('n-search').addEventListener('input', e => { filter.search = e.target.value.toLowerCase(); render(); });
    document.getElementById('n-sort').addEventListener('change', e => { sortBy = e.target.value; render(); });
    document.querySelectorAll('.cat-filter-btn').forEach(b => b.addEventListener('click', () => {
      filter.category = b.dataset.cat;
      document.querySelectorAll('.cat-filter-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      render();
    }));
    render();
  }
  return { init, openEdit, togglePin, del, exportNote };
})();

document.addEventListener('DOMContentLoaded', () => NotesApp.init());

const Toast = window.Toast || {
  show(msg, type='info') {
    const c = document.getElementById('toast-container') || (() => { const d=document.createElement('div'); d.className='toast-container'; d.id='toast-container'; document.body.appendChild(d); return d; })();
    const t = document.createElement('div'); t.className=`toast ${type}`;
    t.innerHTML=`<span class="toast-content"><span class="toast-title">${msg}</span></span>`;
    c.appendChild(t); setTimeout(() => t.remove(), 3000);
  }
};
