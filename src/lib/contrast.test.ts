import { describe, it, expect } from 'vitest';
import { contrastRatio, mixHex } from '@/lib/contrast';

// Real tokens from src/index.css, duplicated here because CSS custom properties aren't readable
// from a Node test environment. Keep these in sync with index.css's :root / .dark blocks —
// a mismatch would make these tests check the wrong colours instead of failing loudly, so if a
// token changes there, update it here too.
const NEO_ORANGE = '#ff4500';
const LIGHT = { bg: '#f8fafc', ink: '#16213a' };
const DARK = { bg: '#0f1830', ink: '#eaf1ff' };

const AA_TEXT_MIN = 4.5;

describe('Ton Aura contrast — WCAG 2.1 AA text minimum (4.5:1)', () => {
  it('plain --neo-orange on the light background fails — documents why .rank-rail-caption-amount cannot use it directly', () => {
    expect(contrastRatio(NEO_ORANGE, LIGHT.bg)).toBeLessThan(AA_TEXT_MIN);
  });

  it('.rank-rail-caption-amount: --neo-orange mixed toward --ink passes in light mode', () => {
    const resolved = mixHex(NEO_ORANGE, LIGHT.ink, 80);
    expect(resolved).toBe('#d03e0c');
    expect(contrastRatio(resolved, LIGHT.bg)).toBeGreaterThanOrEqual(AA_TEXT_MIN);
  });

  it('.rank-rail-caption-amount: same formula stays compliant in dark mode — mixing toward a fixed #000 would have failed here', () => {
    const resolved = mixHex(NEO_ORANGE, DARK.ink, 80);
    expect(resolved).toBe('#fb6733');
    expect(contrastRatio(resolved, DARK.bg)).toBeGreaterThanOrEqual(AA_TEXT_MIN);

    const brokenAlternative = mixHex(NEO_ORANGE, '#000000', 80);
    expect(contrastRatio(brokenAlternative, DARK.bg)).toBeLessThan(AA_TEXT_MIN);
  });

  it('.mastery-tab / .aura-share-cta: white text on --neo-orange darkened 20% toward black passes, in both themes', () => {
    const resolved = mixHex(NEO_ORANGE, '#000000', 80);
    expect(resolved).toBe('#cc3700');
    expect(contrastRatio(resolved, '#ffffff')).toBeGreaterThanOrEqual(AA_TEXT_MIN);
  });

  it('white text on plain --neo-orange fails — documents why .mastery-tab / .aura-share-cta cannot use it directly', () => {
    expect(contrastRatio(NEO_ORANGE, '#ffffff')).toBeLessThan(AA_TEXT_MIN);
  });
});
