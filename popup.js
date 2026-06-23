document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("toggle");

  chrome.storage.local.get(["enabled"], function (result) {
    // Default to enabled.
    toggle.checked = result.enabled !== false;
  });

  toggle.addEventListener("change", function () {
    chrome.storage.local.set({ enabled: toggle.checked });
  });
});
