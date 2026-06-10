# Digioh QA Form Filler

A Chrome extension that auto-fills Digioh campaign forms the moment they appear — including forms inside iframes, which standard autofill tools can't reach. No clicking required to trigger the fill.

## Why this exists

Digioh campaigns render inside iframes injected into the host page. Standard autofill tools only see the top-level document, so every QA session requires slow manual entry. This extension detects the iframe the moment Digioh writes content into it, fills every field automatically, and shows a one-click Submit button.

## How it works

1. A content script runs in every frame on every page.
2. It checks whether the current frame is a Digioh iframe (by inspecting `window.frameElement.id` / `className`).
3. A `MutationObserver` watches for form fields to appear (Digioh writes HTML into an `about:blank` iframe dynamically).
4. The moment fields are detected they are filled and highlighted in yellow.
5. A floating **⚡ Submit** button appears — one click submits the form.
6. For multi-step forms / quizzes the observer re-triggers on each step automatically.

## Features

- **Zero-click fill** — form appears → fields are filled instantly, no extension icon needed
- **Floating Submit button** — single click to submit after auto-fill
- **Fills everything** — known fields matched by name/id/placeholder/aria-label, unknown fields get sensible fallbacks (selects → first option, text → "Test", number → "25", etc.)
- **Covers**: email, first/last/full name, phone, country, zip/postal
- **React / Vue compatible** — fires native `input`, `change`, `blur` events so framework-controlled inputs update correctly
- **Four email patterns**:
  - `hussain+[timestamp]@digioh.com` — always unique (default)
  - `hussain+[N]@digioh.com` — auto-incrementing counter
  - `hussain+[YYYYMMDD]@digioh.com` — date-based
  - Custom base address with auto-appended timestamp
- **Persistent presets** — saved to `chrome.storage.local`, survive browser restarts
- **Popup = settings only** — click the icon to change preset values; filling is fully automatic

## Installation

1. Clone or download this repo.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the project folder.
5. The "QA Form Filler" icon appears in the toolbar.

## Usage

1. Navigate to the page with the Digioh campaign.
2. Wait for the Digioh popup or inline form to appear.
3. Fields fill automatically — yellow highlight confirms what was set.
4. Click **⚡ Submit** to submit.

### Changing preset values

Click the extension icon to open the settings popup:
- Edit any field value — it takes effect on the **next** page load / form appearance.
- Click **Save as default** to persist values across sessions.
- Click **Clear saved** to reset to built-in defaults.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (MV3), declares permissions and content script |
| `content.js` | Auto-fill engine — runs in Digioh iframes, MutationObserver + fill + Submit button |
| `popup.html` | Settings popup UI |
| `popup.css` | Popup styles |
| `popup.js` | Popup logic — preset management and email generation preview |

## Permissions

| Permission | Reason |
|---|---|
| `storage` | Save/load presets and email counter |
| `scripting` | Used by popup for manual override (fallback) |
| `activeTab` | Access the current tab for scripting |
| `<all_urls>` | Content script must run on any host page that embeds Digioh |

## Defaults

| Field | Default value |
|---|---|
| First name | Test |
| Last name | User |
| Phone | +15550001234 |
| Country | US |
| Zip | 10001 |
| Email pattern | timestamp (`hussain+[timestamp]@digioh.com`) |
