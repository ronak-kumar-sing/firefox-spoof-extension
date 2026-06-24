const RULESET_ID = "ruleset_1";
const CONTENT_SCRIPT_ID = "firefox-spoof-main";

async function registerMainWorldScript() {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [CONTENT_SCRIPT_ID] });
  } catch (e) {
    // Ignore if it was not registered.
  }

  try {
    await chrome.scripting.registerContentScripts([
      {
        id: CONTENT_SCRIPT_ID,
        js: ["injected.js"],
        matches: ["<all_urls>"],
        runAt: "document_start",
        world: "MAIN",
        allFrames: true
      }
    ]);
  } catch (e) {
    // Ignore errors on browsers that do not support world: "MAIN".
  }
}

async function updateBadge(enabled) {
  try {
    await chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
    await chrome.action.setBadgeBackgroundColor({ color: enabled ? "#2ea043" : "#6e7681" });
  } catch (e) {
    // Ignore errors from restricted contexts.
  }
}

async function syncRuleset(enabled) {
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: enabled ? [RULESET_ID] : [],
      disableRulesetIds: enabled ? [] : [RULESET_ID]
    });
  } catch (e) {
    // Ignore errors if the ruleset is already in the desired state.
  }
}

async function syncEnabledState() {
  const result = await chrome.storage.local.get("enabled");
  const enabled = result.enabled !== false;
  await syncRuleset(enabled);
  await updateBadge(enabled);
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.local.set({ enabled: true });
  }
  await registerMainWorldScript();
  await syncEnabledState();
});

chrome.runtime.onStartup.addListener(async () => {
  await registerMainWorldScript();
  await syncEnabledState();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.enabled) {
    syncEnabledState();
  }
});

// Sync immediately in case the service worker was restarted mid-session.
registerMainWorldScript();
syncEnabledState();
