const RULESET_ID = "ruleset_1";

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
  await syncEnabledState();
});

chrome.runtime.onStartup.addListener(syncEnabledState);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.enabled) {
    syncEnabledState();
  }
});

// Sync immediately in case the service worker was restarted mid-session.
syncEnabledState();
