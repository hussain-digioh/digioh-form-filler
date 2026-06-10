/* Digioh QA auto-filler — injects into Digioh iframes only */

const STORAGE_PRESET  = 'qaPreset';
const STORAGE_COUNTER = 'emailCounter';
const BTN_ID          = 'dg-qa-btn';

const DEFAULTS = {
  firstName:       'Test',
  lastName:        'User',
  phone:           '+15550001234',
  country:         'US',
  zip:             '10001',
  emailPattern:    'timestamp',
  customEmailBase: 'hussain@digioh.com',
};

const FIELD_MAP = [
  { keys: ['email'],                                              value: d => d.email },
  { keys: ['firstname','first_name','fname','given'],             value: d => d.firstName },
  { keys: ['lastname','last_name','lname','surname','family'],    value: d => d.lastName },
  { keys: ['fullname','full_name','your_name','name'],            value: d => `${d.firstName} ${d.lastName}` },
  { keys: ['phone','tel','mobile','cell','sms'],                  value: d => d.phone },
  { keys: ['country'],                                            value: d => d.country },
  { keys: ['zip','postal','postcode','post_code'],                value: d => d.zip },
];

/* ── Detection ────────────────────────────────────────────────── */

function isDigiohFrame() {
  if (window === window.top) return false;
  try {
    const fe = window.frameElement;
    if (!fe) return false;
    return (
      (fe.id        && fe.id.startsWith('lightbox-iframe-')) ||
      (fe.className && /\bbox-\d+\b/.test(fe.className))
    );
  } catch (_) {
    return false;
  }
}

/* ── Email ────────────────────────────────────────────────────── */

function generateEmail(preset, counter) {
  switch (preset.emailPattern) {
    case 'counter': return `hussain+${counter}@digioh.com`;
    case 'date': {
      const d   = new Date();
      const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
      return `hussain+${ymd}@digioh.com`;
    }
    case 'custom': {
      const base         = preset.customEmailBase || 'hussain@digioh.com';
      const [user, domain] = base.split('@');
      return domain ? `${user}+${Date.now()}@${domain}` : base;
    }
    default: return `hussain+${Date.now()}@digioh.com`;
  }
}

/* ── Fill helpers ─────────────────────────────────────────────── */

function getHint(el) {
  return [
    el.name, el.id, el.placeholder,
    el.getAttribute('data-field') || '',
    el.getAttribute('aria-label') || '',
    el.getAttribute('data-name')  || '',
  ].join(' ').toLowerCase().replace(/[-\s]/g, '_');
}

function triggerEvents(el) {
  ['input', 'change', 'blur'].forEach(ev =>
    el.dispatchEvent(new Event(ev, { bubbles: true }))
  );
  // React / Vue synthetic value setter
  const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
  if (desc && desc.set) {
    try { desc.set.call(el, el.value); } catch (_) {}
  }
}

function highlight(el) {
  el.style.backgroundColor = '#fffde7';
  el.style.outline         = '2px solid #f9a825';
  el.style.outlineOffset   = '-1px';
}

function setVal(el, value) {
  if (el.tagName === 'SELECT') {
    const opt =
      Array.from(el.options).find(o => o.value.toLowerCase() === String(value).toLowerCase()) ||
      Array.from(el.options).find(o => o.text.toLowerCase().includes(String(value).toLowerCase())) ||
      Array.from(el.options).find(o => o.value);   // fallback: first non-empty
    if (!opt) return false;
    el.value = opt.value;
  } else {
    el.value = value;
  }
  triggerEvents(el);
  highlight(el);
  return true;
}

function fallback(el) {
  if (el.tagName === 'SELECT') {
    const first = Array.from(el.options).find(o => o.value);
    return first ? { el, value: first.value, isSelect: true } : null;
  }
  if (el.tagName === 'TEXTAREA') return { el, value: 'Test value' };
  const map = {
    number: '25', url: 'https://example.com', date: '1990-01-01',
    month: '1990-01', time: '12:00', color: '#000000', range: el.min || '0',
  };
  return { el, value: map[el.type] || 'Test' };
}

/* ── Main fill ────────────────────────────────────────────────── */

const filled = new WeakSet();

function fillAll(data) {
  const els = document.querySelectorAll(
    'input:not([type=hidden]):not([type=submit]):not([type=button])' +
    ':not([type=checkbox]):not([type=radio]):not([type=file]):not([type=image]),' +
    'select, textarea'
  );
  if (!els.length) return 0;

  let count = 0;
  els.forEach(el => {
    if (el.disabled || el.readOnly || filled.has(el)) return;
    const hint    = getHint(el);
    let   matched = false;

    for (const { keys, value } of FIELD_MAP) {
      if (!keys.some(k => hint.includes(k))) continue;
      if (setVal(el, value(data))) count++;
      filled.add(el);
      matched = true;
      break;
    }

    if (!matched) {
      const fb = fallback(el);
      if (fb) {
        setVal(el, fb.value);
        filled.add(el);
        count++;
      }
    }
  });

  return count;
}

/* ── Submit button ────────────────────────────────────────────── */

function injectButton() {
  if (document.getElementById(BTN_ID)) return;

  const btn = document.createElement('button');
  btn.id    = BTN_ID;
  btn.textContent = '⚡ Submit';
  Object.assign(btn.style, {
    position:      'fixed',
    bottom:        '16px',
    right:         '16px',
    zIndex:        '2147483647',
    background:    '#2563eb',
    color:         '#fff',
    border:        'none',
    borderRadius:  '8px',
    padding:       '10px 22px',
    fontSize:      '14px',
    fontWeight:    '600',
    cursor:        'pointer',
    boxShadow:     '0 4px 16px rgba(37,99,235,0.45)',
    fontFamily:    '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    letterSpacing: '0.01em',
    transition:    'background 0.12s, transform 0.1s',
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.background  = '#1d4ed8';
    btn.style.transform   = 'scale(1.04)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background  = '#2563eb';
    btn.style.transform   = 'scale(1)';
  });

  btn.addEventListener('click', () => {
    const submit =
      document.querySelector('[type="submit"]')              ||
      document.querySelector('button[class*="submit" i]')    ||
      document.querySelector('[data-action="submit"]')        ||
      document.querySelector('button:last-of-type');
    btn.remove();
    if (submit) setTimeout(() => submit.click(), 150);
  });

  document.body.appendChild(btn);
}

/* ── Observer loop ────────────────────────────────────────────── */

function run(data) {
  const count = fillAll(data);
  if (count > 0) injectButton();
}

function start(data) {
  run(data);
  let timer;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => run(data), 250);
  }).observe(document.body || document.documentElement, { childList: true, subtree: true });
}

/* ── Entry point ──────────────────────────────────────────────── */

if (isDigiohFrame()) {
  chrome.storage.local.get([STORAGE_PRESET, STORAGE_COUNTER], res => {
    const preset  = res[STORAGE_PRESET]  || DEFAULTS;
    const counter = res[STORAGE_COUNTER] || 1;

    const data = {
      email:     generateEmail(preset, counter),
      firstName: preset.firstName || DEFAULTS.firstName,
      lastName:  preset.lastName  || DEFAULTS.lastName,
      phone:     preset.phone     || DEFAULTS.phone,
      country:   preset.country   || DEFAULTS.country,
      zip:       preset.zip       || DEFAULTS.zip,
    };

    if (preset.emailPattern === 'counter') {
      chrome.storage.local.set({ [STORAGE_COUNTER]: counter + 1 });
    }

    if (document.body) {
      start(data);
    } else {
      document.addEventListener('DOMContentLoaded', () => start(data));
    }
  });
}
