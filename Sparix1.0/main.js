bash

cat > /mnt/user-data/outputs/main.js << 'JSEOF'
/**
 * ============================================================
 * SPARIX — Foundation JavaScript System
 * main.js | v1.0.0
 * "Study. Build. Grow."
 * ============================================================
 * TABLE OF CONTENTS
 * 01. App Initialization
 * 02. Navbar & Mobile Navigation
 * 03. Sidebar System
 * 04. Theme Switching & Dark Mode
 * 05. Modal Systemzz
 * 06. Toast Notification System
 * 07. Accordion System
 * 08. Tabs System
 * 09. Dropdown System
 * 10. Tooltip System
 * 11. Search Filtering System
 * 12. Local Storage Manager
 * 13. Session Storage Manager
 * 14. Form Validation
 * 15. Input Validators
 * 16. Date & Time Utilities
 * 17. Formatting Utilities
 * 18. Clipboard Utilities
 * 19. Performance Helpers (Debounce, Throttle)
 * 20. Export & Import Utilities
 * 21. Dashboard Utilities
 * 22. Loading & Skeleton System
 * 23. User Preference Manager
 * 24. Keyboard Shortcut System
 * 25. Error Handling Helpers
 * 26. Notification Helpers
 * 27. Responsive Helpers
 * 28. Statistics Helpers
 * 29. Widget Helpers
 * 30. Quick Action Helpers
 * 31. Recent Activity Helpers
 * ============================================================
 */

'use strict';

/* ============================================================
   01. APP INITIALIZATION
   ============================================================ */

/** Central SPARIX app namespace — prevents global pollution */
const SPARIX = {
  version: '1.0.0',
  name: 'SPARIX',

  /** Called once on DOM ready. Boots all subsystems. */
  init() {
    Navbar.init();
    Sidebar.init();
    Theme.init();
    Modal.init();
    Accordion.init();
    Tabs.init();
    Dropdown.init();
    Tooltip.init();
    Keyboard.init();
    this._injectToastContainer();
    console.info(`[${this.name}] v${this.version} initialized ✓`);
  },

  /** Inject toast container if not present */
  _injectToastContainer() {
    if (!document.querySelector('.toast-container')) {
      const el = document.createElement('div');
      el.className = 'toast-container';
      el.id = 'toast-container';
      document.body.appendChild(el);
    }
  },
};

document.addEventListener('DOMContentLoaded', () => SPARIX.init());


/* ============================================================
   02. NAVBAR & MOBILE NAVIGATION
   ============================================================ */

const Navbar = {
  navbar: null,
  toggle: null,
  mobileNav: null,
  isOpen: false,

  init() {
    this.navbar    = document.querySelector('.navbar');
    this.toggle    = document.querySelector('.navbar-toggle');
    this.mobileNav = document.querySelector('.mobile-nav');
    if (!this.navbar) return;

    this._bindScrollEffect();
    this._bindToggle();
    this._bindOutsideClick();
  },

  /** Add scrolled class when page is scrolled past 10px */
  _bindScrollEffect() {
    const onScroll = throttle(() => {
      this.navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, 100);
    window.addEventListener('scroll', onScroll, { passive: true });
  },

  /** Hamburger toggle */
  _bindToggle() {
    if (!this.toggle) return;
    this.toggle.addEventListener('click', () => this.toggleMobileNav());
  },

  /** Close on outside click */
  _bindOutsideClick() {
    document.addEventListener('click', (e) => {
      if (!this.isOpen) return;
      if (!this.navbar.contains(e.target) && !this.mobileNav?.contains(e.target)) {
        this.closeMobileNav();
      }
    });
  },

  toggleMobileNav() {
    this.isOpen ? this.closeMobileNav() : this.openMobileNav();
  },

  openMobileNav() {
    this.isOpen = true;
    this.toggle?.classList.add('open');
    this.mobileNav?.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeMobileNav() {
    this.isOpen = false;
    this.toggle?.classList.remove('open');
    this.mobileNav?.classList.remove('open');
    document.body.style.overflow = '';
  },
};


/* ============================================================
   03. SIDEBAR SYSTEM
   ============================================================ */

const Sidebar = {
  sidebar: null,
  toggleBtn: null,
  isCollapsed: false,
  LS_KEY: 'sparix_sidebar_collapsed',

  init() {
    this.sidebar    = document.querySelector('.sidebar');
    this.toggleBtn  = document.querySelector('.sidebar-toggle-btn');
    if (!this.sidebar) return;

    // Restore collapsed state
    this.isCollapsed = LocalStore.get(this.LS_KEY) === true;
    if (this.isCollapsed) this._applyCollapsed(false);

    this.toggleBtn?.addEventListener('click', () => this.toggle());
    this._bindMobileOverlay();
  },

  toggle() {
    this.isCollapsed ? this.expand() : this.collapse();
  },

  collapse() {
    this.isCollapsed = true;
    this._applyCollapsed(true);
    LocalStore.set(this.LS_KEY, true);
  },

  expand() {
    this.isCollapsed = false;
    this._applyCollapsed(false);
    LocalStore.set(this.LS_KEY, false);
  },

  _applyCollapsed(animate) {
    if (!animate) this.sidebar.style.transition = 'none';
    this.sidebar.classList.toggle('collapsed', this.isCollapsed);
    document.querySelector('.page-wrapper')?.classList.toggle('layout-sidebar-collapsed', this.isCollapsed);
    if (!animate) {
      this.sidebar.offsetHeight; // reflow
      this.sidebar.style.transition = '';
    }
  },

  /** Mobile: open/close sidebar with overlay */
  openMobile() {
    this.sidebar.classList.add('mobile-open');
    this._showMobileOverlay();
  },

  closeMobile() {
    this.sidebar.classList.remove('mobile-open');
    this._hideMobileOverlay();
  },

  _bindMobileOverlay() {
    document.addEventListener('click', (e) => {
      if (this.sidebar.classList.contains('mobile-open') &&
          !this.sidebar.contains(e.target)) {
        this.closeMobile();
      }
    });
  },

  _showMobileOverlay() {
    let overlay = document.getElementById('sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(100,71,54,0.4);z-index:199;backdrop-filter:blur(3px)';
      overlay.addEventListener('click', () => this.closeMobile());
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'block';
  },

  _hideMobileOverlay() {
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.style.display = 'none';
  },
};


/* ============================================================
   04. THEME SWITCHING & DARK MODE PERSISTENCE
   ============================================================ */

const Theme = {
  LS_KEY: 'sparix_theme',
  current: 'light',

  init() {
    const saved = LocalStore.get(this.LS_KEY);
    // Respect OS preference if no preference saved
    if (!saved) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.current = prefersDark ? 'dark' : 'light';
    } else {
      this.current = saved;
    }
    this._apply();
    this._bindToggle();
  },

  toggle() {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    this._apply();
    LocalStore.set(this.LS_KEY, this.current);
  },

  setTheme(theme) {
    this.current = theme;
    this._apply();
    LocalStore.set(this.LS_KEY, this.current);
  },

  isDark() { return this.current === 'dark'; },

  _apply() {
    document.documentElement.setAttribute('data-theme', this.current);
    // Update any theme toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-label', this.isDark() ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('data-current', this.current);
    });
  },

  _bindToggle() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  },
};


/* ============================================================
   05. MODAL SYSTEM
   ============================================================ */

const Modal = {
  activeModal: null,
  _focusTrap: null,

  init() {
    // Auto-bind data-modal-open triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal-open]');
      if (trigger) this.open(trigger.dataset.modalOpen);

      const closer = e.target.closest('[data-modal-close]');
      if (closer) this.close(closer.dataset.modalClose || this.activeModal);
    });

    // Close on backdrop click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        this.close(this.activeModal);
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) this.close(this.activeModal);
    });
  },

  /**
   * Open a modal by its ID
   * @param {string} modalId - The ID of the modal element or backdrop
   */
  open(modalId) {
    const backdrop = document.getElementById(modalId) ||
                     document.querySelector(`[data-modal="${modalId}"]`);
    if (!backdrop) {
      console.warn(`[Modal] No modal found with id: ${modalId}`);
      return;
    }
    backdrop.classList.add('open');
    this.activeModal = modalId;
    document.body.style.overflow = 'hidden';
    this._trapFocus(backdrop);
    backdrop.dispatchEvent(new CustomEvent('modal:open'));
  },

  /**
   * Close a modal by its ID (or the currently active one)
   * @param {string} [modalId]
   */
  close(modalId) {
    const id = modalId || this.activeModal;
    const backdrop = document.getElementById(id) ||
                     document.querySelector(`[data-modal="${id}"]`);
    if (!backdrop) return;
    backdrop.classList.remove('open');
    this.activeModal = null;
    document.body.style.overflow = '';
    this._releaseFocus();
    backdrop.dispatchEvent(new CustomEvent('modal:close'));
  },

  closeAll() {
    document.querySelectorAll('.modal-backdrop.open').forEach(b => {
      b.classList.remove('open');
    });
    this.activeModal = null;
    document.body.style.overflow = '';
    this._releaseFocus();
  },

  /** Basic focus trap for accessibility */
  _trapFocus(container) {
    const focusable = container.querySelectorAll(
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    focusable[0].focus();
    this._focusTrap = (e) => {
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener('keydown', this._focusTrap);
  },

  _releaseFocus() {
    if (this._focusTrap) {
      document.removeEventListener('keydown', this._focusTrap);
      this._focusTrap = null;
    }
  },
};


/* ============================================================
   06. TOAST NOTIFICATION SYSTEM
   ============================================================ */

const Toast = {
  DEFAULTS: {
    type: 'info',      // success | warning | error | info
    title: '',
    message: '',
    duration: 4000,    // ms, 0 = persistent
    closable: true,
  },

  /**
   * Show a toast notification
   * @param {object} options
   * @param {string} options.title
   * @param {string} [options.message]
   * @param {'success'|'warning'|'error'|'info'} [options.type]
   * @param {number} [options.duration]
   * @param {boolean} [options.closable]
   */
  show(options = {}) {
    const cfg = { ...this.DEFAULTS, ...options };
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${cfg.type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    toast.innerHTML = `
      <span class="toast-icon">${this._icon(cfg.type)}</span>
      <div class="toast-content">
        ${cfg.title ? `<div class="toast-title">${cfg.title}</div>` : ''}
        ${cfg.message ? `<div class="toast-body">${cfg.message}</div>` : ''}
      </div>
      ${cfg.closable ? `<button class="toast-close" aria-label="Dismiss">✕</button>` : ''}
    `;

    container.appendChild(toast);

    // Dismiss button
    toast.querySelector('.toast-close')?.addEventListener('click', () => this._dismiss(toast));

    // Auto-dismiss
    if (cfg.duration > 0) {
      setTimeout(() => this._dismiss(toast), cfg.duration);
    }

    return toast;
  },

  _dismiss(toast) {
    toast.classList.add('exiting');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400); // safety net
  },

  _icon(type) {
    const icons = {
      success: '✓',
      warning: '⚠',
      error:   '✕',
      info:    'ℹ',
    };
    return icons[type] || icons.info;
  },

  // Convenience methods
  success(title, message, opts = {}) { return this.show({ type: 'success', title, message, ...opts }); },
  warning(title, message, opts = {}) { return this.show({ type: 'warning', title, message, ...opts }); },
  error  (title, message, opts = {}) { return this.show({ type: 'error',   title, message, ...opts }); },
  info   (title, message, opts = {}) { return this.show({ type: 'info',    title, message, ...opts }); },
};

// Expose globally
window.showToast = (options) => Toast.show(options);


/* ============================================================
   07. ACCORDION SYSTEM
   ============================================================ */

const Accordion = {
  init() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.accordion-trigger');
      if (!trigger) return;
      const item   = trigger.closest('.accordion-item');
      const body   = item?.querySelector('.accordion-body');
      if (!item || !body) return;

      const isOpen = trigger.classList.contains('open');

      // If accordion is exclusive (single-open), close siblings
      const accordion = item.closest('.accordion');
      if (accordion && !accordion.hasAttribute('data-multi')) {
        accordion.querySelectorAll('.accordion-trigger.open').forEach(t => {
          if (t !== trigger) this._close(t, t.closest('.accordion-item')?.querySelector('.accordion-body'));
        });
      }

      isOpen ? this._close(trigger, body) : this._open(trigger, body);
    });
  },

  _open(trigger, body) {
    trigger.classList.add('open');
    body.classList.add('open');
    body.style.maxHeight = body.scrollHeight + 'px';
    trigger.setAttribute('aria-expanded', 'true');
  },

  _close(trigger, body) {
    trigger.classList.remove('open');
    body.classList.remove('open');
    body.style.maxHeight = '0';
    trigger.setAttribute('aria-expanded', 'false');
  },
};


/* ============================================================
   08. TABS SYSTEM
   ============================================================ */

const Tabs = {
  init() {
    document.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab-item');
      if (!tab) return;
      const target = tab.dataset.tab;
      const container = tab.closest('[data-tabs]') || tab.closest('.tabs')?.parentElement;
      if (target && container) this.activate(container, tab, target);
    });
  },

  /**
   * Activate a tab within a container
   * @param {HTMLElement} container
   * @param {HTMLElement} activeTab
   * @param {string} panelId
   */
  activate(container, activeTab, panelId) {
    // Deactivate all tabs & panels in this container
    container.querySelectorAll('.tab-item').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    // Activate selected
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
    const panel = container.querySelector(`#${panelId}`) ||
                  container.querySelector(`[data-tab-panel="${panelId}"]`);
    panel?.classList.add('active');

    container.dispatchEvent(new CustomEvent('tabs:change', { detail: { tab: panelId } }));
  },
};


/* ============================================================
   09. DROPDOWN SYSTEM
   ============================================================ */

const Dropdown = {
  active: null,

  init() {
    // Toggle on trigger click
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-dropdown-toggle]');
      if (trigger) {
        e.stopPropagation();
        const menuId = trigger.dataset.dropdownToggle;
        const menu   = document.getElementById(menuId) || trigger.nextElementSibling;
        this.toggle(menu);
        return;
      }
      // Close on outside click
      this.closeAll();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
    });
  },

  toggle(menu) {
    if (!menu) return;
    menu.classList.contains('open') ? this.close(menu) : this.open(menu);
  },

  open(menu) {
    if (this.active && this.active !== menu) this.close(this.active);
    menu.classList.add('open');
    this.active = menu;
  },

  close(menu) {
    menu?.classList.remove('open');
    if (this.active === menu) this.active = null;
  },

  closeAll() {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    this.active = null;
  },
};


/* ============================================================
   10. TOOLTIP SYSTEM
   ============================================================ */

const Tooltip = {
  /**
   * The basic tooltip is handled via CSS [data-tooltip].
   * This module provides programmatic tooltip creation for dynamic elements.
   */
  init() {
    // Dynamic tooltips for JS-created elements (data-tooltip-js)
    document.addEventListener('mouseenter', (e) => {
      const el = e.target.closest('[data-tooltip-js]');
      if (el) this._show(el);
    }, true);
    document.addEventListener('mouseleave', (e) => {
      const el = e.target.closest('[data-tooltip-js]');
      if (el) this._hide();
    }, true);
  },

  _show(el) {
    const text = el.dataset.tooltipJs;
    if (!text) return;

    const tip = document.createElement('div');
    tip.id = 'sparix-tooltip';
    tip.style.cssText = `
      position:fixed;z-index:9999;
      background:var(--text-primary);color:var(--text-inverse);
      font-size:var(--text-xs);font-weight:500;
      padding:6px 12px;border-radius:6px;pointer-events:none;
      max-width:220px;text-align:center;white-space:normal;
      font-family:var(--font-body);
      box-shadow:var(--shadow-lg);
    `;
    tip.textContent = text;
    document.body.appendChild(tip);

    const rect = el.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    tip.style.left = Math.min(
      rect.left + (rect.width - tipRect.width) / 2,
      window.innerWidth - tipRect.width - 8
    ) + 'px';
    tip.style.top  = (rect.top - tipRect.height - 8) + 'px';
  },

  _hide() {
    document.getElementById('sparix-tooltip')?.remove();
  },

  /**
   * Programmatically attach a tooltip to an element
   * @param {HTMLElement} el
   * @param {string} text
   */
  attach(el, text) {
    el.dataset.tooltipJs = text;
  },
};


/* ============================================================
   11. SEARCH FILTERING SYSTEM
   ============================================================ */

const SearchFilter = {
  /**
   * Live filter a list of elements based on a query string
   * @param {string} query - The search term
   * @param {HTMLElement[]|NodeList} items - Elements to filter
   * @param {object} opts
   * @param {string} [opts.searchAttr='data-search'] - Attribute holding searchable text
   * @param {string} [opts.emptyClass='hidden'] - Class added to non-matching items
   * @param {HTMLElement} [opts.emptyState] - Element to show when no results
   */
  filter(query, items, opts = {}) {
    const {
      searchAttr = 'data-search',
      emptyClass = 'hidden',
      emptyState = null,
    } = opts;

    const q = query.toLowerCase().trim();
    let visible = 0;

    items.forEach(item => {
      const text = (item.getAttribute(searchAttr) || item.textContent || '').toLowerCase();
      const match = !q || text.includes(q);
      item.classList.toggle(emptyClass, !match);
      if (match) visible++;
    });

    if (emptyState) emptyState.classList.toggle('hidden', visible > 0);

    return visible;
  },

  /**
   * Bind a search input to auto-filter items
   * @param {HTMLElement} input
   * @param {Function} getItems - Returns current list of items
   * @param {object} opts
   */
  bind(input, getItems, opts = {}) {
    const handler = debounce((e) => {
      this.filter(e.target.value, getItems(), opts);
    }, 200);
    input.addEventListener('input', handler);
  },

  /**
   * Highlight search term within a text node
   * @param {string} text - Original text
   * @param {string} query - Term to highlight
   * @returns {string} HTML string with highlights
   */
  highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'),
      '<mark class="search-result-highlight">$1</mark>');
  },
};


/* ============================================================
   12. LOCAL STORAGE MANAGER
   ============================================================ */

const LocalStore = {
  PREFIX: 'sparix_',

  _key(k) { return `${this.PREFIX}${k}`; },

  /**
   * Save data to localStorage
   * @param {string} key
   * @param {*} value - Will be JSON serialized
   */
  set(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[LocalStore] set failed:', e);
      return false;
    }
  },

  /**
   * Retrieve data from localStorage
   * @param {string} key
   * @param {*} [fallback=null]
   * @returns {*}
   */
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  /**
   * Update nested property in a stored object
   * @param {string} key
   * @param {object} updates - Partial object to merge
   */
  update(key, updates) {
    const current = this.get(key, {});
    return this.set(key, { ...current, ...updates });
  },

  /** Remove a key */
  delete(key) {
    try {
      localStorage.removeItem(this._key(key));
      return true;
    } catch { return false; }
  },

  /** Clear all SPARIX keys */
  clear() {
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(this.PREFIX)) localStorage.removeItem(k);
      });
      return true;
    } catch { return false; }
  },

  /** Check if key exists */
  has(key) { return localStorage.getItem(this._key(key)) !== null; },

  /** Get all SPARIX keys */
  keys() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(this.PREFIX))
      .map(k => k.slice(this.PREFIX.length));
  },
};

// Aliases for backward compat / shorter access
const saveData   = (k, v)    => LocalStore.set(k, v);
const getData    = (k, fb)   => LocalStore.get(k, fb);
const updateData = (k, u)    => LocalStore.update(k, u);
const deleteData = (k)       => LocalStore.delete(k);
const clearData  = ()        => LocalStore.clear();


/* ============================================================
   13. SESSION STORAGE MANAGER
   ============================================================ */

const SessionStore = {
  PREFIX: 'sparix_sess_',
  _key(k) { return `${this.PREFIX}${k}`; },

  set(key, value) {
    try { sessionStorage.setItem(this._key(key), JSON.stringify(value)); return true; }
    catch (e) { console.error('[SessionStore]', e); return false; }
  },

  get(key, fallback = null) {
    try {
      const raw = sessionStorage.getItem(this._key(key));
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },

  update(key, updates) {
    return this.set(key, { ...this.get(key, {}), ...updates });
  },

  delete(key) {
    try { sessionStorage.removeItem(this._key(key)); return true; }
    catch { return false; }
  },

  clear() {
    Object.keys(sessionStorage)
      .filter(k => k.startsWith(this.PREFIX))
      .forEach(k => sessionStorage.removeItem(k));
  },
};


/* ============================================================
   14. FORM VALIDATION
   ============================================================ */

const FormValidator = {
  /**
   * Validate an entire form element
   * @param {HTMLFormElement} form
   * @param {object} rules - { fieldName: [validators] }
   * @returns {{ valid: boolean, errors: object }}
   */
  validate(form, rules = {}) {
    const errors = {};
    let valid = true;

    Object.entries(rules).forEach(([name, fieldRules]) => {
      const field = form.elements[name];
      if (!field) return;
      const value = field.value?.trim() ?? '';

      for (const rule of fieldRules) {
        const error = rule(value, field);
        if (error) {
          errors[name] = error;
          valid = false;
          this._showError(field, error);
          break;
        } else {
          this._clearError(field);
        }
      }
    });

    return { valid, errors };
  },

  _showError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    let errEl = field.closest('.form-group')?.querySelector('.form-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'form-error';
      field.closest('.form-group')?.appendChild(errEl);
    }
    errEl.textContent = message;
  },

  _clearError(field) {
    field.classList.remove('error');
    const errEl = field.closest('.form-group')?.querySelector('.form-error');
    if (errEl) errEl.textContent = '';
  },

  _showSuccess(field) {
    field.classList.add('success');
    field.classList.remove('error');
  },

  /** Reset all validation states on a form */
  reset(form) {
    form.querySelectorAll('.input, .textarea, .select').forEach(f => {
      f.classList.remove('error', 'success');
    });
    form.querySelectorAll('.form-error').forEach(e => (e.textContent = ''));
  },
};


/* ============================================================
   15. INPUT VALIDATORS (chainable rule functions)
   ============================================================ */

const Validators = {
  /** Field is required */
  required: (msg = 'This field is required') => (value) =>
    !value ? msg : null,

  /** Minimum character length */
  minLength: (min, msg) => (value) =>
    value.length < min ? (msg || `Minimum ${min} characters required`) : null,

  /** Maximum character length */
  maxLength: (max, msg) => (value) =>
    value.length > max ? (msg || `Maximum ${max} characters allowed`) : null,

  /** Valid email address */
  email: (msg = 'Enter a valid email address') => (value) =>
    value && !Validate.isEmail(value) ? msg : null,

  /** Number only */
  numeric: (msg = 'Must be a number') => (value) =>
    value && !Validate.isNumeric(value) ? msg : null,

  /** Matches another field value */
  matches: (fieldValue, msg = 'Values do not match') => (value) =>
    value !== fieldValue ? msg : null,

  /** Custom regex pattern */
  pattern: (regex, msg = 'Invalid format') => (value) =>
    value && !regex.test(value) ? msg : null,

  /** URL validation */
  url: (msg = 'Enter a valid URL') => (value) =>
    value && !Validate.isURL(value) ? msg : null,

  /** Minimum numeric value */
  min: (min, msg) => (value) =>
    !isNaN(value) && Number(value) < min ? (msg || `Minimum value is ${min}`) : null,

  /** Maximum numeric value */
  max: (max, msg) => (value) =>
    !isNaN(value) && Number(value) > max ? (msg || `Maximum value is ${max}`) : null,
};


/* ============================================================
   15b. VALIDATION HELPERS
   ============================================================ */

const Validate = {
  isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  isNumeric(value) {
    return /^-?\d+(\.\d+)?$/.test(value);
  },

  isInteger(value) {
    return /^-?\d+$/.test(value);
  },

  isURL(value) {
    try { new URL(value); return true; } catch { return false; }
  },

  isPhone(value) {
    return /^[+]?[\d\s\-().]{7,15}$/.test(value);
  },

  isStrongPassword(value) {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(value);
  },

  isPAN(value) { // India PAN card
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value);
  },

  isPincode(value) {
    return /^[1-9][0-9]{5}$/.test(value);
  },

  isEmpty(value) {
    return value === null || value === undefined || String(value).trim() === '';
  },
};


/* ============================================================
   16. DATE & TIME UTILITIES
   ============================================================ */

const DateUtils = {
  /**
   * Format a Date to locale string
   * @param {Date|string|number} date
   * @param {Intl.DateTimeFormatOptions} [opts]
   * @param {string} [locale='en-IN']
   */
  format(date, opts = { day: 'numeric', month: 'short', year: 'numeric' }, locale = 'en-IN') {
    return new Intl.DateTimeFormat(locale, opts).format(new Date(date));
  },

  /** Relative time: "2 hours ago", "in 3 days" */
  relative(date, locale = 'en') {
    const diff = (new Date(date) - Date.now()) / 1000;
    const rtf  = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const ranges = [
      [60,         'second', 1],
      [3600,       'minute', 60],
      [86400,      'hour',   3600],
      [604800,     'day',    86400],
      [2592000,    'week',   604800],
      [31536000,   'month',  2592000],
      [Infinity,   'year',   31536000],
    ];
    for (const [limit, unit, divisor] of ranges) {
      if (Math.abs(diff) < limit) return rtf.format(Math.round(diff / divisor), unit);
    }
  },

  /** Days between two dates */
  daysBetween(a, b) {
    return Math.round(Math.abs(new Date(a) - new Date(b)) / 86400000);
  },

  /** Is the date today? */
  isToday(date) {
    const d = new Date(date);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  },

  /** Start of day */
  startOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /** Add days to a date */
  addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  /** Current academic year string e.g. "2024–25" */
  academicYear(date = new Date()) {
    const y = date.getMonth() >= 5 ? date.getFullYear() : date.getFullYear() - 1;
    return `${y}–${String(y + 1).slice(2)}`;
  },

  /** Format milliseconds as mm:ss */
  msToTime(ms) {
    const m = Math.floor(ms / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    return `${m}:${s}`;
  },

  /** ISO date string (YYYY-MM-DD) */
  toISO(date = new Date()) { return new Date(date).toISOString().split('T')[0]; },
};


/* ============================================================
   17. FORMATTING UTILITIES
   ============================================================ */

const Format = {
  /**
   * Format a number with locale separators
   * @param {number} n
   * @param {number} [decimals=0]
   * @param {string} [locale='en-IN']
   */
  number(n, decimals = 0, locale = 'en-IN') {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n);
  },

  /** Format as currency */
  currency(amount, currency = 'INR', locale = 'en-IN') {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  },

  /** Compact number: 1400 → "1.4K", 2000000 → "2M" */
  compact(n, locale = 'en-IN') {
    return new Intl.NumberFormat(locale, { notation: 'compact' }).format(n);
  },

  /** Format bytes to human-readable */
  bytes(bytes, decimals = 1) {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / 1024 ** i).toFixed(decimals))} ${sizes[i]}`;
  },

  /** Percentage string */
  percent(value, total, decimals = 1) {
    if (!total) return '0%';
    return `${((value / total) * 100).toFixed(decimals)}%`;
  },

  /** Title case */
  titleCase(str) {
    return str.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
  },

  /** Truncate text */
  truncate(str, length = 80, suffix = '…') {
    return str.length > length ? str.slice(0, length).trim() + suffix : str;
  },

  /** Slug: "Hello World" → "hello-world" */
  slug(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  },

  /** Initials from full name: "Arjun Sharma" → "AS" */
  initials(name) {
    return name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() || '').join('');
  },

  /** GPA to letter grade */
  gpaToGrade(gpa) {
    if (gpa >= 9.0) return 'O';
    if (gpa >= 8.0) return 'A+';
    if (gpa >= 7.0) return 'A';
    if (gpa >= 6.0) return 'B+';
    if (gpa >= 5.5) return 'B';
    if (gpa >= 5.0) return 'C';
    return 'F';
  },
};


/* ============================================================
   18. CLIPBOARD UTILITIES
   ============================================================ */

const Clipboard = {
  /**
   * Copy text to clipboard
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async copy(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const el = document.createElement('textarea');
        el.value = text;
        el.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      return true;
    } catch (e) {
      console.error('[Clipboard]', e);
      return false;
    }
  },

  /**
   * Copy text and show a toast notification
   * @param {string} text
   * @param {string} [label='Copied!']
   */
  async copyWithFeedback(text, label = 'Copied to clipboard') {
    const ok = await this.copy(text);
    if (ok) Toast.success(label, '', { duration: 2000 });
    else    Toast.error('Failed to copy', 'Please copy manually.');
    return ok;
  },
};

// Expose globally
window.copyToClipboard = (text, label) => Clipboard.copyWithFeedback(text, label);


/* ============================================================
   19. PERFORMANCE HELPERS
   ============================================================ */

/**
 * Debounce: delays execution until after 'wait' ms of inactivity
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
function debounce(fn, wait = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Throttle: ensures fn runs at most once per 'limit' ms
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
function throttle(fn, limit = 200) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize: cache function results
 * @param {Function} fn
 * @returns {Function}
 */
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Once: ensure a function only runs once
 * @param {Function} fn
 * @returns {Function}
 */
function once(fn) {
  let called = false, result;
  return function (...args) {
    if (!called) { called = true; result = fn.apply(this, args); }
    return result;
  };
}


/* ============================================================
   20. EXPORT & IMPORT UTILITIES
   ============================================================ */

const ExportUtils = {
  /**
   * Export data as JSON file
   * @param {object} data
   * @param {string} filename
   */
  toJSON(data, filename = 'sparix-export') {
    this._download(
      'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)),
      `${filename}.json`
    );
  },

  /**
   * Export 2D array as CSV file
   * @param {Array<Array>} rows - Array of arrays
   * @param {string[]} headers
   * @param {string} filename
   */
  toCSV(rows, headers = [], filename = 'sparix-export') {
    const lines = [];
    if (headers.length) lines.push(headers.map(h => `"${h}"`).join(','));
    rows.forEach(row => lines.push(row.map(c => `"${c ?? ''}"`).join(',')));
    this._download(
      'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n')),
      `${filename}.csv`
    );
  },

  /** Print the current page */
  print() { window.print(); },

  /** Share via Web Share API or copy link as fallback */
  async share(data = {}) {
    if (navigator.share) {
      try { await navigator.share(data); return true; } catch { return false; }
    } else {
      await Clipboard.copyWithFeedback(data.url || window.location.href, 'Link copied!');
      return false;
    }
  },

  _download(href, filename) {
    const a = document.createElement('a');
    a.href = href; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};

const ImportUtils = {
  /**
   * Read a JSON file from an <input type="file"> element
   * @param {File} file
   * @returns {Promise<object>}
   */
  fromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try { resolve(JSON.parse(e.target.result)); }
        catch { reject(new Error('Invalid JSON')); }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
  },

  /**
   * Read a CSV file and return array of row objects
   * @param {File} file
   * @returns {Promise<object[]>}
   */
  fromCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const lines  = e.target.result.split('\n').filter(Boolean);
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const rows    = lines.slice(1).map(line => {
          const vals = line.split(',');
          return headers.reduce((obj, h, i) => {
            obj[h] = (vals[i] || '').replace(/"/g, '').trim();
            return obj;
          }, {});
        });
        resolve(rows);
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
  },
};


/* ============================================================
   21. DASHBOARD UTILITIES
   ============================================================ */

const DashboardUtils = {
  /**
   * Update a stats card value with a count-up animation
   * @param {HTMLElement} el - The value element
   * @param {number} target
   * @param {number} [duration=1200]
   * @param {Function} [formatter]
   */
  countUp(el, target, duration = 1200, formatter = v => Math.round(v)) {
    const start = performance.now();
    const initial = parseFloat(el.textContent.replace(/[^\d.]/g, '')) || 0;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = formatter(initial + (target - initial) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  /**
   * Update progress bar width
   * @param {HTMLElement} bar
   * @param {number} percent 0–100
   */
  setProgress(bar, percent) {
    bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    bar.setAttribute('aria-valuenow', percent);
  },

  /**
   * Refresh all [data-count-up] elements on page
   */
  initCountUps() {
    document.querySelectorAll('[data-count-up]').forEach(el => {
      const target = parseFloat(el.dataset.countUp);
      if (!isNaN(target)) this.countUp(el, target);
    });
  },

  /**
   * Set dashboard greeting based on time of day
   * @param {HTMLElement} el
   * @param {string} name
   */
  setGreeting(el, name = '') {
    const hour = new Date().getHours();
    const period = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
    el.textContent = `Good ${period}${name ? `, ${name}` : ''}`;
  },
};


/* ============================================================
   22. LOADING & SKELETON SYSTEM
   ============================================================ */

const LoadingSystem = {
  /**
   * Show a loading overlay on a container
   * @param {HTMLElement} container
   * @returns {HTMLElement} overlay element
   */
  show(container) {
    container.style.position = 'relative';
    const existing = container.querySelector('.loading-overlay');
    if (existing) return existing;

    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    container.appendChild(overlay);
    return overlay;
  },

  /** Remove loading overlay from container */
  hide(container) {
    container.querySelector('.loading-overlay')?.remove();
  },

  /**
   * Replace element content with skeleton placeholders
   * @param {HTMLElement} el
   * @param {object} opts
   */
  skeleton(el, opts = { lines: 3, avatar: false, card: false }) {
    const lines = opts.lines ?? 3;
    let html = '';
    if (opts.avatar) {
      html += `<div style="display:flex;gap:12px;align-items:center;margin-bottom:16px">
        <div class="skeleton skeleton-avatar" style="width:40px;height:40px"></div>
        <div style="flex:1"><div class="skeleton skeleton-text" style="width:60%"></div>
        <div class="skeleton skeleton-text" style="width:40%"></div></div></div>`;
    }
    if (opts.card) {
      html += `<div class="skeleton skeleton-card"></div>`;
    } else {
      html += `<div class="skeleton skeleton-title"></div>`;
      for (let i = 0; i < lines; i++) {
        const w = [100, 90, 75, 85][i % 4];
        html += `<div class="skeleton skeleton-text" style="width:${w}%"></div>`;
      }
    }
    el._originalContent = el.innerHTML;
    el.innerHTML = html;
  },

  /** Restore element from skeleton */
  restore(el) {
    if (el._originalContent !== undefined) {
      el.innerHTML = el._originalContent;
      delete el._originalContent;
    }
  },

  /**
   * Wrap an async operation with loading state
   * @param {HTMLElement} container
   * @param {Function} asyncFn
   */
  async wrap(container, asyncFn) {
    const overlay = this.show(container);
    try {
      return await asyncFn();
    } finally {
      this.hide(container);
    }
  },
};


/* ============================================================
   23. USER PREFERENCE MANAGER
   ============================================================ */

const UserPrefs = {
  LS_KEY: 'user_prefs',

  defaults: {
    theme:          'light',
    sidebarCollapsed: false,
    fontSize:       'base',     // sm | base | lg
    density:        'comfortable', // compact | comfortable | spacious
    notifications:  true,
    language:       'en',
  },

  get all() { return LocalStore.get(this.LS_KEY, this.defaults); },

  get(key) { return this.all[key] ?? this.defaults[key]; },

  set(key, value) {
    LocalStore.update(this.LS_KEY, { [key]: value });
    this._apply(key, value);
  },

  setMany(updates) {
    LocalStore.update(this.LS_KEY, updates);
    Object.entries(updates).forEach(([k, v]) => this._apply(k, v));
  },

  reset() { LocalStore.delete(this.LS_KEY); },

  _apply(key, value) {
    const root = document.documentElement;
    if (key === 'theme')   Theme.setTheme(value);
    if (key === 'fontSize') root.setAttribute('data-font-size', value);
    if (key === 'density')  root.setAttribute('data-density', value);
    if (key === 'sidebarCollapsed') {
      value ? Sidebar.collapse() : Sidebar.expand();
    }
  },
};


/* ============================================================
   24. KEYBOARD SHORTCUT SYSTEM
   ============================================================ */

const Keyboard = {
  _shortcuts: [],

  init() {
    document.addEventListener('keydown', (e) => {
      // Don't fire shortcuts when typing in inputs
      const tag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && !e.ctrlKey && !e.metaKey) return;

      this._shortcuts.forEach(({ keys, fn }) => {
        if (this._matches(e, keys)) {
          e.preventDefault();
          fn(e);
        }
      });
    });

    // Built-in shortcuts
    this.register(['ctrl+k', 'meta+k'], () => {
      document.querySelector('[data-global-search]')?.focus();
    });
    this.register(['ctrl+/', 'meta+/'], () => {
      document.querySelector('[data-shortcut-help]')?.click();
    });
    this.register(['ctrl+d', 'meta+d'], () => Theme.toggle());
  },

  /**
   * Register a keyboard shortcut
   * @param {string[]} keys - e.g. ['ctrl+k', 'meta+k']
   * @param {Function} fn
   */
  register(keys, fn) {
    this._shortcuts.push({ keys, fn });
  },

  unregister(keys) {
    this._shortcuts = this._shortcuts.filter(s => !keys.some(k => s.keys.includes(k)));
  },

  _matches(e, keys) {
    return keys.some(combo => {
      const parts = combo.toLowerCase().split('+');
      const key   = parts[parts.length - 1];
      const ctrl  = parts.includes('ctrl');
      const meta  = parts.includes('meta');
      const shift = parts.includes('shift');
      const alt   = parts.includes('alt');
      return (
        (e.key.toLowerCase() === key || e.code.toLowerCase() === `key${key}`) &&
        e.ctrlKey  === ctrl &&
        e.metaKey  === meta &&
        e.shiftKey === shift &&
        e.altKey   === alt
      );
    });
  },
};


/* ============================================================
   25. ERROR HANDLING HELPERS
   ============================================================ */

const ErrorHandler = {
  /**
   * Global error boundary — catches unhandled errors and shows toast
   */
  init() {
    window.addEventListener('error', (e) => {
      console.error('[SPARIX Error]', e.error || e.message);
      if (window.SPARIX_DEBUG) {
        Toast.error('An error occurred', e.message || 'Something went wrong.');
      }
    });
    window.addEventListener('unhandledrejection', (e) => {
      console.error('[SPARIX Unhandled Promise]', e.reason);
    });
  },

  /**
   * Wrap an async function with error handling
   * @param {Function} fn
   * @param {object} [opts]
   * @param {string} [opts.errorTitle]
   * @param {boolean} [opts.rethrow]
   */
  async try(fn, opts = {}) {
    try {
      return await fn();
    } catch (e) {
      console.error('[ErrorHandler]', e);
      if (opts.errorTitle !== false) {
        Toast.error(opts.errorTitle || 'Error', e.message || 'Something went wrong.');
      }
      if (opts.rethrow) throw e;
      return null;
    }
  },

  /**
   * Display an inline error in a container
   * @param {HTMLElement} container
   * @param {string} message
   */
  showInline(container, message) {
    let el = container.querySelector('.inline-error');
    if (!el) {
      el = document.createElement('div');
      el.className = 'alert alert-danger inline-error';
      container.prepend(el);
    }
    el.textContent = message;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  clearInline(container) {
    container.querySelector('.inline-error')?.remove();
  },
};


/* ============================================================
   26. NOTIFICATION HELPERS
   ============================================================ */

const NotificationManager = {
  /**
   * Request browser notification permission
   * @returns {Promise<string>} 'granted' | 'denied' | 'default'
   */
  async requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    return Notification.requestPermission();
  },

  /**
   * Send a browser notification
   * @param {string} title
   * @param {object} opts - NotificationOptions
   */
  async push(title, opts = {}) {
    const perm = await this.requestPermission();
    if (perm !== 'granted') return null;
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...opts,
    });
  },

  /**
   * Show a badge count on a nav/sidebar element
   * @param {HTMLElement} el
   * @param {number} count
   */
  setBadge(el, count) {
    let badge = el.querySelector('.sidebar-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'sidebar-badge';
      el.appendChild(badge);
    }
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = count > 0 ? '' : 'none';
  },
};


/* ============================================================
   27. RESPONSIVE HELPERS
   ============================================================ */

const Responsive = {
  BREAKPOINTS: { sm: 640, md: 768, lg: 1024, xl: 1280 },

  isMobile() { return window.innerWidth < this.BREAKPOINTS.md; },
  isTablet() { return window.innerWidth >= this.BREAKPOINTS.md && window.innerWidth < this.BREAKPOINTS.lg; },
  isDesktop(){ return window.innerWidth >= this.BREAKPOINTS.lg; },

  /** Current breakpoint label */
  current() {
    const w = window.innerWidth;
    if (w < this.BREAKPOINTS.sm)  return 'xs';
    if (w < this.BREAKPOINTS.md)  return 'sm';
    if (w < this.BREAKPOINTS.lg)  return 'md';
    if (w < this.BREAKPOINTS.xl)  return 'lg';
    return 'xl';
  },

  /**
   * Execute callback on resize (debounced)
   * @param {Function} fn
   * @param {number} [wait=250]
   */
  onResize(fn, wait = 250) {
    window.addEventListener('resize', debounce(fn, wait));
  },

  /**
   * Run fn when element enters / exits viewport
   * @param {HTMLElement} el
   * @param {Function} onEnter
   * @param {Function} [onLeave]
   */
  observe(el, onEnter, onLeave = null) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onEnter(entry);
      else onLeave?.(entry);
    });
    observer.observe(el);
    return observer;
  },
};


/* ============================================================
   28. STATISTICS HELPERS
   ============================================================ */

const StatsUtils = {
  /** Sum of an array */
  sum(arr) { return arr.reduce((a, b) => a + (Number(b) || 0), 0); },

  /** Arithmetic mean */
  mean(arr) { return arr.length ? this.sum(arr) / arr.length : 0; },

  /** Median */
  median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid    = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  /** Percentage change between two values */
  change(prev, curr) {
    if (!prev) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  },

  /** Clamp a value between min and max */
  clamp(val, min, max) { return Math.min(max, Math.max(min, val)); },

  /** Linear interpolation */
  lerp(a, b, t) { return a + (b - a) * t; },

  /** Map a value from one range to another */
  mapRange(val, inMin, inMax, outMin, outMax) {
    return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
  },

  /** Round to decimal places */
  round(n, places = 2) { return Math.round(n * 10 ** places) / 10 ** places; },

  /** Standard deviation */
  stdDev(arr) {
    const avg = this.mean(arr);
    return Math.sqrt(this.mean(arr.map(v => (v - avg) ** 2)));
  },
};


/* ============================================================
   29. WIDGET HELPERS
   ============================================================ */

const WidgetHelper = {
  /**
   * Refresh a widget's content via callback
   * @param {HTMLElement} widget
   * @param {Function} loadFn - async function returning HTML or data
   */
  async refresh(widget, loadFn) {
    const body = widget.querySelector('.widget-body') || widget;
    LoadingSystem.skeleton(body, { lines: 3 });
    try {
      const result = await loadFn();
      if (typeof result === 'string') body.innerHTML = result;
    } catch (e) {
      ErrorHandler.showInline(body, 'Failed to load widget');
    }
  },

  /**
   * Make a widget collapsible
   * @param {HTMLElement} widget
   */
  makeCollapsible(widget) {
    const header = widget.querySelector('.widget-header');
    const body   = widget.querySelector('.widget-body');
    if (!header || !body) return;

    const btn = document.createElement('button');
    btn.className = 'btn-icon btn-sm';
    btn.innerHTML = '▾';
    btn.setAttribute('aria-label', 'Collapse widget');
    header.appendChild(btn);

    btn.addEventListener('click', () => {
      const collapsed = body.style.display === 'none';
      body.style.display = collapsed ? '' : 'none';
      btn.innerHTML = collapsed ? '▾' : '▸';
    });
  },
};


/* ============================================================
   30. QUICK ACTION HELPERS
   ============================================================ */

const QuickActions = {
  /**
   * Register a set of quick actions for the dashboard
   * @param {object[]} actions - [{ label, icon, handler, shortcut? }]
   */
  register(actions) {
    this._actions = [...(this._actions || []), ...actions];
  },

  /**
   * Render quick actions into a container
   * @param {HTMLElement} container
   */
  render(container) {
    if (!container || !this._actions?.length) return;
    container.innerHTML = this._actions.map(a => `
      <button class="quick-action-btn" data-action="${Format.slug(a.label)}"
              title="${a.shortcut || ''}" aria-label="${a.label}">
        <span class="quick-action-icon">${a.icon}</span>
        <span class="quick-action-label">${a.label}</span>
      </button>
    `).join('');

    container.querySelectorAll('.quick-action-btn').forEach((btn, i) => {
      btn.addEventListener('click', () => this._actions[i]?.handler?.());
    });
  },
};


/* ============================================================
   31. RECENT ACTIVITY HELPERS
   ============================================================ */

const ActivityLog = {
  LS_KEY: 'activity_log',
  MAX_ITEMS: 50,

  /**
   * Log an activity event
   * @param {object} event - { title, type, icon?, meta? }
   */
  log(event) {
    const activities = LocalStore.get(this.LS_KEY, []);
    activities.unshift({
      ...event,
      id:        Date.now(),
      timestamp: new Date().toISOString(),
    });
    LocalStore.set(this.LS_KEY, activities.slice(0, this.MAX_ITEMS));
  },

  /** Get recent activities */
  get(limit = 10) {
    return LocalStore.get(this.LS_KEY, []).slice(0, limit);
  },

  /** Clear all activity */
  clear() { LocalStore.delete(this.LS_KEY); },

  /**
   * Render activity feed into a container element
   * @param {HTMLElement} container
   * @param {number} [limit]
   */
  render(container, limit = 10) {
    const activities = this.get(limit);
    if (!activities.length) {
      container.innerHTML = `<div class="empty-state py-8">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">No recent activity</div>
      </div>`;
      return;
    }
    container.innerHTML = `<div class="activity-feed">
      ${activities.map(a => `
        <div class="activity-item">
          <div class="activity-icon">${a.icon || '📌'}</div>
          <div class="activity-text">
            <div class="activity-title">${a.title}</div>
            <div class="activity-time">${DateUtils.relative(a.timestamp)}</div>
          </div>
        </div>
      `).join('')}
    </div>`;
  },
};


/* ============================================================
   GLOBAL EXPORTS
   ============================================================ */

// Expose key modules globally for page-level scripts
Object.assign(window, {
  SPARIX,
  Navbar, Sidebar, Theme, Modal, Toast,
  Accordion, Tabs, Dropdown, Tooltip,
  SearchFilter, LocalStore, SessionStore,
  FormValidator, Validators, Validate,
  DateUtils, Format, Clipboard, ExportUtils, ImportUtils,
  DashboardUtils, LoadingSystem, UserPrefs,
  Keyboard, ErrorHandler, NotificationManager, Responsive,
  StatsUtils, WidgetHelper, QuickActions, ActivityLog,
  debounce, throttle, memoize, once,
  // Short aliases
  saveData, getData, updateData, deleteData, clearData,
});

JSEOF
