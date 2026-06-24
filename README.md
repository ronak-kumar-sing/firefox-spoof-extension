# Firefox Spoof for Chrome

A minimal Chrome extension that makes Chrome identify as Firefox so test portals (like the TCS verbal test in your screenshot) allow you to click **Start Test** in Chrome.

## Files

- `manifest.json` — Extension manifest (Manifest V3)
- `background.js` — Service worker that keeps the header-spoofing ruleset in sync with the toggle
- `content.js` — Isolated content script that controls the on/off state
- `injected.js` — MAIN-world content script registered by the service worker to spoof `navigator` properties without violating page CSPs
- `rules.json` — Rewrites the outgoing `User-Agent` HTTP header to Firefox
- `popup.html` / `popup.js` — Toolbar toggle to enable/disable spoofing and update open tabs live
- `icon.png` — Toolbar icon
- `test-page.html` — Local test page to verify the spoof works

## Install in Chrome

1. Open Chrome and go to `chrome://extensions/`.
2. Turn on **Developer mode** (toggle in the top-right).
3. Click **Load unpacked**.
4. Select the folder `firefox-spoof-extension` on your Desktop.
5. The extension icon appears in the toolbar. Click it and make sure **Spoof as Firefox** is checked.
6. Open the test portal and click **Start Test**.

## Verify it works

1. Make sure the local HTTP server is running (see below) or open `test-page.html` directly.
2. With the extension enabled, the test page should show Firefox/Gecko values for `userAgent`, `platform`, `vendor`, etc.
3. If values still show Chrome, reload the page.

### Run the local test server

```bash
cd ~/Desktop/firefox-spoof-extension
python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765/test-page.html` in Chrome.

## Notes

- The extension spoofs browser identity both in JavaScript (`navigator.userAgent`, `navigator.platform`, etc.) and at the network layer (HTTP `User-Agent` header).
- Toggling the popup now updates open tabs immediately and turns the HTTP header spoof on/off via the service worker.
- Some portals also check for `window.InstallTrigger`; this extension adds a minimal stub.
- If the portal still blocks Chrome, inspect its detection code and add the missing property to `injected.js`.
