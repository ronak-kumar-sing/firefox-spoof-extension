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

  // Default to enabled; the isolated-world content script may override this.
  if (typeof window.__firefoxSpoofEnabled === "undefined") {
    window.__firefoxSpoofEnabled = true;
  }

  // Some detection scripts look for Firefox's InstallTrigger.
  if (!window.InstallTrigger) {
    window.InstallTrigger = {};
  }

  const originals = {};
  for (const key in SPOOFED) {
    try {
      originals[key] = navigator[key];
      Object.defineProperty(navigator, key, {
        get: function () {
          return window.__firefoxSpoofEnabled ? SPOOFED[key] : originals[key];
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
      originals.userAgentData = navigator.userAgentData;
      Object.defineProperty(navigator, "userAgentData", {
        get: function () {
          return window.__firefoxSpoofEnabled ? fakeData : originals.userAgentData;
        },
        configurable: true,
        enumerable: true
      });
    }
  } catch (e) {}
})();
