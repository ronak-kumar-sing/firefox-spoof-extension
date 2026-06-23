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

  // Inject immediately at document_start so page scripts see Firefox values.
  injectScript(
    "(" +
      function (props) {
        window.__firefoxSpoofEnabled = true;

        // Some detection scripts look for Firefox's InstallTrigger.
        if (!window.InstallTrigger) {
          window.InstallTrigger = {};
        }

        const originals = {};
        for (const key in props) {
          try {
            originals[key] = navigator[key];
            Object.defineProperty(navigator, key, {
              get: function () {
                return window.__firefoxSpoofEnabled ? props[key] : originals[key];
              },
              configurable: true,
              enumerable: true
            });
          } catch (e) {}
        }

        // Spoof Client Hints API if exposed.
        try {
          if ("userAgentData" in navigator) {
            const fakeData = {
              brands: [
                { brand: "Not.A/Brand", version: "8" },
                { brand: "Firefox", version: "127" },
                { brand: "Mozilla", version: "5" }
              ],
              mobile: false,
              platform: "Windows"
            };
            Object.defineProperty(navigator, "userAgentData", {
              get: function () {
                return window.__firefoxSpoofEnabled ? fakeData : originals.userAgentData;
              },
              configurable: true,
              enumerable: true
            });
          }
        } catch (e) {}
      } +
      ")(" +
      JSON.stringify(SPOOFED) +
      ");"
  );

  // If the user disabled the extension, flip the flag as soon as storage is read.
  chrome.storage.local.get(["enabled"], function (result) {
    if (result.enabled === false) {
      injectScript("window.__firefoxSpoofEnabled = false;");
    }
  });
})();
