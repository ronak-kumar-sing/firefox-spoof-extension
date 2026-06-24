(function () {
  const SPOOFED = {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
    appVersion: "5.0 (Windows)",
    platform: "Win32",
    vendor: "",
    vendorSub: "",
    appCodeName: "Mozilla",
    appName: "Netscape",
    oscpu: "Windows NT 10.0; Win64; x64",
    product: "Gecko",
    productSub: "20100101"
  };

  function injectScript(code) {
    const script = document.createElement("script");
    script.textContent = code;
    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(script);
      script.remove();
    }
  }

  function buildPageScript(props) {
    return (
      "(function (props) {" +
      "  window.__firefoxSpoofEnabled = true;" +
      "  if (!window.InstallTrigger) {" +
      "    window.InstallTrigger = {};" +
      "  }" +
      "  const originals = {};" +
      "  for (const key in props) {" +
      "    try {" +
      "      originals[key] = navigator[key];" +
      "      Object.defineProperty(navigator, key, {" +
      "        get: function () {" +
      "          return window.__firefoxSpoofEnabled ? props[key] : originals[key];" +
      "        }," +
      "        configurable: true," +
      "        enumerable: true" +
      "      });" +
      "    } catch (e) {}" +
      "  }" +
      "  try {" +
      "    if ('userAgentData' in navigator) {" +
      "      const fakeData = {" +
      "        brands: [" +
      "          { brand: 'Not.A/Brand', version: '8' }," +
      "          { brand: 'Firefox', version: '127' }," +
      "          { brand: 'Mozilla', version: '5' }" +
      "        ]," +
      "        mobile: false," +
      "        platform: 'Windows'" +
      "      };" +
      "      originals.userAgentData = navigator.userAgentData;" +
      "      Object.defineProperty(navigator, 'userAgentData', {" +
      "        get: function () {" +
      "          return window.__firefoxSpoofEnabled ? fakeData : originals.userAgentData;" +
      "        }," +
      "        configurable: true," +
      "        enumerable: true" +
      "      });" +
      "    }" +
      "  } catch (e) {}" +
      "})(" +
      JSON.stringify(props) +
      ");"
    );
  }

  function setEnabled(enabled) {
    injectScript("window.__firefoxSpoofEnabled = " + enabled + ";");
  }

  // Inject the spoof machinery immediately at document_start so page scripts
  // that read navigator early see Firefox values. The default is enabled
  // because the extension defaults to on.
  injectScript(buildPageScript(SPOOFED));

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
