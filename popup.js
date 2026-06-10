/* ─── Defaults ─────────────────────────────────────────────────────────────── */

const DEFAULTS = {
  firstName:       'Test',
  lastName:        'User',
  phone:           '+15550001234',
  country:         'US',
  zip:             '10001',
  emailPattern:    'timestamp',
  customEmailBase: 'hussain@digioh.com',
  counter:         1,
};

/* ─── DOM refs ──────────────────────────────────────────────────────────────── */

const $ = id => document.getElementById(id);

const emailInput       = $('email');
const emailPattern     = $('emailPattern');
const customEmailRow   = $('customEmailRow');
const customEmailBase  = $('customEmailBase');
const generateBtn      = $('generateEmail');
const firstNameInput   = $('firstName');
const lastNameInput    = $('lastName');
const phoneInput       = $('phone');
const countryInput     = $('country');
const zipInput         = $('zip');
const savePresetBtn    = $('savePreset');
const clearPresetBtn   = $('clearPreset');
const statusBar        = $('statusBar');

/* ─── Email generation ──────────────────────────────────────────────────────── */

function generateEmail(pattern, counter, customBase) {
  switch (pattern) {
    case 'timestamp': return `hussain+${Date.now()}@digioh.com`;
    case 'counter':   return `hussain+${counter}@digioh.com`;
    case 'date': {
      const d = new Date();
      const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
      return `hussain+${ymd}@digioh.com`;
    }
    case 'custom': {
      const base = customBase || 'hussain@digioh.com';
      const [user, domain] = base.split('@');
      return domain ? `${user}+${Date.now()}@${domain}` : base;
    }
    default: return `hussain+${Date.now()}@digioh.com`;
  }
}

/* ─── Load / save state ─────────────────────────────────────────────────────── */

function loadState() {
  chrome.storage.local.get(['qaPreset', 'emailCounter'], result => {
    const preset  = result.qaPreset    || DEFAULTS;
    const counter = result.emailCounter || DEFAULTS.counter;

    firstNameInput.value  = preset.firstName      || DEFAULTS.firstName;
    lastNameInput.value   = preset.lastName       || DEFAULTS.lastName;
    phoneInput.value      = preset.phone          || DEFAULTS.phone;
    countryInput.value    = preset.country        || DEFAULTS.country;
    zipInput.value        = preset.zip            || DEFAULTS.zip;
    emailPattern.value    = preset.emailPattern   || DEFAULTS.emailPattern;
    customEmailBase.value = preset.customEmailBase || DEFAULTS.customEmailBase;

    toggleCustomEmailRow(emailPattern.value);
    emailInput.value = generateEmail(emailPattern.value, counter, customEmailBase.value);
  });
}

function savePreset() {
  chrome.storage.local.set({ qaPreset: currentPreset() }, () =>
    showStatus('Default saved.', 'success')
  );
}

function clearPreset() {
  chrome.storage.local.remove(['qaPreset', 'emailCounter'], () => {
    chrome.storage.local.set({ qaPreset: DEFAULTS, emailCounter: 1 }, () => {
      loadState();
      showStatus('Preset cleared.', 'info');
    });
  });
}

function currentPreset() {
  return {
    firstName:       firstNameInput.value.trim(),
    lastName:        lastNameInput.value.trim(),
    phone:           phoneInput.value.trim(),
    country:         countryInput.value.trim(),
    zip:             zipInput.value.trim(),
    emailPattern:    emailPattern.value,
    customEmailBase: customEmailBase.value.trim(),
  };
}

/* ─── UI helpers ────────────────────────────────────────────────────────────── */

function toggleCustomEmailRow(pattern) {
  customEmailRow.style.display = (pattern === 'custom') ? 'flex' : 'none';
}

function showStatus(msg, type = 'info') {
  statusBar.textContent   = msg;
  statusBar.className     = `status-bar ${type}`;
  statusBar.style.display = 'block';
  setTimeout(() => { statusBar.style.display = 'none'; }, 3000);
}

/* ─── Event listeners ───────────────────────────────────────────────────────── */

generateBtn.addEventListener('click', () => {
  chrome.storage.local.get('emailCounter', r => {
    const counter = r.emailCounter || 1;
    emailInput.value = generateEmail(emailPattern.value, counter, customEmailBase.value);
    if (emailPattern.value === 'counter') {
      chrome.storage.local.set({ emailCounter: counter + 1 });
    }
  });
});

emailPattern.addEventListener('change', () => {
  toggleCustomEmailRow(emailPattern.value);
  chrome.storage.local.get('emailCounter', r => {
    emailInput.value = generateEmail(emailPattern.value, r.emailCounter || 1, customEmailBase.value);
  });
});

customEmailBase.addEventListener('input', () => {
  chrome.storage.local.get('emailCounter', r => {
    emailInput.value = generateEmail('custom', r.emailCounter || 1, customEmailBase.value);
  });
});

savePresetBtn.addEventListener('click', savePreset);
clearPresetBtn.addEventListener('click', clearPreset);

/* ─── Init ──────────────────────────────────────────────────────────────────── */

loadState();
