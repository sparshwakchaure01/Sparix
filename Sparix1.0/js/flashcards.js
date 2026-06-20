'use strict';
const FlashcardsApp = (() => {
  const KEY = 'sparix_flashcards';
  let cards = [];
  let editId = null;
  let filterSubject = 'all';
  let reviewCards = [];
  let reviewIdx = 0;
  let reviewMode = false;
  let random = false;

  function save() { localStorage.setItem(KEY, JSON.stringify(cards)); }
  function load() { cards = JSON.parse(localStorage.getItem(KEY) || '[]'); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

  function subjects() { return [...new Set(cards.map(c=>c.subject))].filter(Boolean); }

  function updateSubjectFilter() {
    const sel = document.getElementById('fc-filter-subject');
    const subs = subjects();
    sel.innerHTML = `<option value="all">All Subjects</option>` + subs.map(s=>`<option value="${s}">${s}</option>`).join('');
    sel.value = filterSubject;
  }

  function renderLibrary() {
    updateSubjectFilter();
    const el = document.getElementById('fc-library');
    const list = cards.filter(c => filterSubject === 'all' || c.subject === filterSubject);
    if (!list.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🃏</div><p class="empty-state-text">No flashcards yet. Create your first card!</p></div>`;
      return;
    }
    el.innerHTML = list.map(c => `
      <div class="card fc-lib-card" data-id="${c.id}">
        <div class="flex justify-between align-center mb-2">
          <span class="badge badge-secondary">${c.subject || 'General'}</span>
          <div class="flex gap-1">
            <button class="btn btn-ghost btn-xs" onclick="FlashcardsApp.openEdit('${c.id}')">✏️</button>
            <button class="btn btn-ghost btn-xs text-danger" onclick="FlashcardsApp.del('${c.id}')">🗑️</button>
          </div>
        </div>
        <p class="text-sm font-medium">Q: ${c.front}</p>
        <p class="text-sm text-muted mt-1">A: ${c.back}</p>
      </div>`).join('');
  }

  function submit() {
    const front = document.getElementById('fc-front').value.trim();
    const back = document.getElementById('fc-back').value.trim();
    if (!front || !back) { Toast.show('Front and back are required.', 'error'); return; }
    const card = {
      id: editId || uid(),
      front, back,
      subject: document.getElementById('fc-subject').value.trim() || 'General',
    };
    if (editId) { const i = cards.findIndex(c=>c.id===editId); cards[i] = card; }
    else cards.unshift(card);
    save(); clearForm(); renderLibrary();
    Toast.show(editId ? 'Card updated!' : 'Card created!', 'success');
  }

  function clearForm() {
    editId = null;
    document.getElementById('fc-form').reset();
    document.getElementById('fc-submit-btn').textContent = 'Add Card';
  }

  function openEdit(id) {
    const c = cards.find(x=>x.id===id);
    if (!c) return;
    editId = id;
    document.getElementById('fc-front').value = c.front;
    document.getElementById('fc-back').value = c.back;
    document.getElementById('fc-subject').value = c.subject;
    document.getElementById('fc-submit-btn').textContent = 'Update Card';
    document.getElementById('fc-creator').scrollIntoView({ behavior: 'smooth' });
  }

  function del(id) {
    if (!confirm('Delete this card?')) return;
    cards = cards.filter(c=>c.id!==id);
    save(); renderLibrary();
  }

  function startReview() {
    let pool = cards.filter(c => filterSubject === 'all' || c.subject === filterSubject);
    if (!pool.length) { Toast.show('No cards to review!', 'error'); return; }
    reviewCards = random ? pool.sort(()=>Math.random()-0.5) : [...pool];
    reviewIdx = 0;
    reviewMode = true;
    document.getElementById('review-panel').style.display = 'block';
    document.getElementById('fc-library-section').style.display = 'none';
    showReviewCard();
  }

  function stopReview() {
    reviewMode = false;
    document.getElementById('review-panel').style.display = 'none';
    document.getElementById('fc-library-section').style.display = 'block';
    document.getElementById('review-card').classList.remove('flipped');
  }

  function showReviewCard() {
    const c = reviewCards[reviewIdx];
    document.getElementById('review-front').textContent = c.front;
    document.getElementById('review-back').textContent = c.back;
    document.getElementById('review-card').classList.remove('flipped');
    document.getElementById('review-progress').textContent = `${reviewIdx+1} / ${reviewCards.length}`;
    document.getElementById('review-subject').textContent = c.subject;
  }

  function flipCard() { document.getElementById('review-card').classList.toggle('flipped'); }

  function reviewNext() {
    if (reviewIdx < reviewCards.length-1) { reviewIdx++; showReviewCard(); }
    else Toast.show('Review complete! 🎉', 'success');
  }
  function reviewPrev() {
    if (reviewIdx > 0) { reviewIdx--; showReviewCard(); }
  }

  function init() {
    load();
    document.getElementById('fc-submit-btn').addEventListener('click', submit);
    document.getElementById('fc-cancel-btn').addEventListener('click', clearForm);
    document.getElementById('fc-filter-subject').addEventListener('change', e => { filterSubject = e.target.value; renderLibrary(); });
    document.getElementById('btn-start-review').addEventListener('click', startReview);
    document.getElementById('btn-random-review').addEventListener('click', () => { random = !random; Toast.show(`Random order: ${random?'ON':'OFF'}`, 'info'); });
    document.getElementById('btn-stop-review').addEventListener('click', stopReview);
    document.getElementById('review-card').addEventListener('click', flipCard);
    document.getElementById('btn-review-prev').addEventListener('click', reviewPrev);
    document.getElementById('btn-review-next').addEventListener('click', reviewNext);
    renderLibrary();
  }
  return { init, openEdit, del };
})();

document.addEventListener('DOMContentLoaded', () => FlashcardsApp.init());

const Toast = window.Toast || {
  show(msg, type='info') {
    const c = document.getElementById('toast-container') || (() => { const d=document.createElement('div'); d.className='toast-container'; d.id='toast-container'; document.body.appendChild(d); return d; })();
    const t = document.createElement('div'); t.className=`toast ${type}`;
    t.innerHTML=`<span class="toast-content"><span class="toast-title">${msg}</span></span>`;
    c.appendChild(t); setTimeout(() => t.remove(), 3000);
  }
};
