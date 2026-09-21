// Small WCAG 2.1 contrast helpers, used only by contrast.test.ts. Exists so a colour-token
// regression (e.g. someone reverting a fix in index.css) gets caught by `npm test` instead of
// only by eyeballing the app or re-running one-off Node scripts by hand.

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

// Mirrors CSS `color-mix(in srgb, hexA pctA%, hexB)`: a plain per-channel lerp in gamma-encoded
// sRGB space (not linear-light), which is what `in srgb` means.
export function mixHex(hexA: string, hexB: string, pctA: number): string {
  const a = parseInt(hexA.replace('#', ''), 16);
  const b = parseInt(hexB.replace('#', ''), 16);
  const t = pctA / 100;
  const mix = (shift: number) => {
    const ca = (a >> shift) & 255;
    const cb = (b >> shift) & 255;
    return Math.round(ca * t + cb * (1 - t));
  };
  const r = mix(16);
  const g = mix(8);
  const bl = mix(0);
  return '#' + [r, g, bl].map((x) => x.toString(16).padStart(2, '0')).join('');
}
