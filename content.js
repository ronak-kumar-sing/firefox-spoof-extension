(function () {
  function setEnabled(enabled) {
    window.__firefoxSpoofEnabled = enabled;
  }

  // Default to enabled until storage is read.
  setEnabled(true);

  // Apply the stored state as soon as storage is available.
  chrome.storage.local.get(["enabled"], function (result) {
    setEnabled(result.enabled !== false);
  });

  // Update live when the popup/background changes the stored state.
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === "local" && changes.enabled) {
      setEnabled(changes.enabled.newValue !== false);
    }
  });

  // Also respond to direct messages from the popup.
  chrome.runtime.onMessage.addListener(function (message) {
    if (message && typeof message.enabled === "boolean") {
      setEnabled(message.enabled);
    }
  });
})();
