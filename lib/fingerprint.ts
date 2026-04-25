// Lightweight browser fingerprint. Combines stable device signals into a
// single SHA-256 hash. Not user-identifying on its own, but stable enough
// to detect a returning visitor on the same machine + browser.

function canvasFingerprint(): string {
  if (typeof window === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    canvas.width = 240;
    canvas.height = 60;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.font = "11pt Arial";
    ctx.fillText("Vaultix-FP-✓-2026", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.font = "18pt Arial";
    ctx.fillText("Vaultix-FP-✓-2026", 4, 45);
    return canvas.toDataURL();
  } catch {
    return "";
  }
}

async function sha256Hex(input: string): Promise<string> {
  const buffer = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "";

  const nav = window.navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };

  const signals = [
    nav.userAgent,
    nav.language,
    Array.isArray(nav.languages) ? nav.languages.join(",") : "",
    nav.platform || "",
    String(nav.hardwareConcurrency || 0),
    String(nav.deviceMemory || 0),
    `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    String(window.screen.pixelDepth || 0),
    Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    String(new Date().getTimezoneOffset()),
    canvasFingerprint(),
  ];

  return sha256Hex(signals.join("||"));
}
