document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("toggle");

  chrome.storage.local.get(["enabled"], function (result) {
    const enabled = result.enabled !== false;
    toggle.checked = enabled;
    updateBadge(enabled);
  });

  toggle.addEventListener("change", function () {
    const enabled = toggle.checked;
    chrome.storage.local.set({ enabled: enabled }, function () {
      updateBadge(enabled);
      notifyAllTabs(enabled);
    });
  });

  function updateBadge(enabled) {
    chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: enabled ? "#2ea043" : "#6e7681" });
  }

  function notifyAllTabs(enabled) {
    chrome.tabs.query({}, function (tabs) {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { enabled: enabled }).catch(function () {
          // Ignore tabs that do not have the content script injected.
        });
      }
    });
  }
});
