import { useEffect, useRef, useState } from 'react';
import { Share2, X, Zap } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import type { Rank } from '@/lib/aura';
import { RANK_FLAME_COLORS } from '@/components/BraiseMascot';

// Native Story format (1080x1920) — the canvas is always rasterized at this true resolution
// for a crisp export; on screen it's scaled down responsively via CSS (width:100%, height:auto
// on the <canvas> element), so what you preview is a shrunk view of exactly what gets shared.
const CANVAS_W = 1080;
const CANVAS_H = 1920;

// Full-screen modal, not an inline card — the 1080x1920 preview used to sit permanently in the
// main flow (a giant phone mockup eating the fold before you even reach the streak), which is
// exactly the "visual noise" the redesign was meant to cut. Now it only exists for the few
// seconds someone is actually deciding whether to share, summoned by one clear CTA and gone
// the instant they close it.
export function ShareAuraModal({
  rank,
  streak,
  xp,
  subjectsCount,
  onClose,
}: {
  rank: Rank;
  streak: number;
  xp: number;
  subjectsCount: number;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useApp();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    draw();
    // Web fonts (Baloo 2 / IBM Plex Mono) may not be ready yet on the very first paint, which
    // would silently fall back to a system serif inside the canvas (unlike DOM text, a canvas
    // draw never re-flows itself once a font finishes loading). Redrawing once fonts.ready
    // resolves catches that without any visible flicker — it's the same pixels, just crisper.
    document.fonts?.ready?.then(() => draw());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rank.id, streak, xp, subjectsCount]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function draw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const bg = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    bg.addColorStop(0, rank.colorFrom);
    bg.addColorStop(1, rank.colorTo);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Wordmark, top-left
    neoPill(ctx, 64, 64, 300, 76, '#faf8f3');
    drawFlameIcon(ctx, 96, 78, 48);
    ctx.fillStyle = '#151821';
    ctx.font = '700 34px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('BRAISE', 154, 102);

    // Main panel
    const panelX = 90;
    const panelY = 320;
    const panelW = CANVAS_W - panelX * 2;
    const panelH = 1230;
    neoRect(ctx, panelX, panelY, panelW, panelH, 28, '#faf8f3', 10, 7);

    // The real mascot, evolved per rank — same construction (flame body, rank accent, sunglasses)
    // as BraiseMascot.tsx, ported to canvas path drawing since canvas can't render a React
    // component directly. Used to be a rasterized flame emoji standing in for Braise entirely;
    // this is the actual character people already recognize from the rest of the app.
    drawMascot(ctx, CANVAS_W / 2, panelY + 230, 460, rank.id);

    // Rank badge — icon drawn as its own vector shape, not `${rank.emoji}` inside the string,
    // so this badge matches the same medal/gem/crown language as the rank rail on Ton Aura
    // instead of falling back to platform emoji rendering.
    const badgeW = 460;
    const badgeY = panelY + 300;
    neoPill(ctx, CANVAS_W / 2 - badgeW / 2, badgeY, badgeW, 92, rankBadgeFill(rank.id));
    ctx.font = '800 42px "Baloo 2", sans-serif';
    const badgeLabel = `RANG ${rank.name.toUpperCase()}`;
    const badgeIconSize = 52;
    const badgeGap = 16;
    const labelW = ctx.measureText(badgeLabel).width;
    const groupW = badgeIconSize + badgeGap + labelW;
    const groupX = CANVAS_W / 2 - groupW / 2;
    drawRankIcon(ctx, rank.id, groupX, badgeY + 20, badgeIconSize, rank.colorFrom);
    ctx.fillStyle = '#151821';
    ctx.textAlign = 'left';
    ctx.fillText(badgeLabel, groupX + badgeIconSize + badgeGap, badgeY + 46);

    // Dynamic hook, tiered by streak/rank
    ctx.font = '800 62px "Baloo 2", sans-serif';
    ctx.fillStyle = '#151821';
    wrapText(ctx, hookText(rank, streak), CANVAS_W / 2, panelY + 490, panelW - 140, 70);

    // Stat chips — same flame/bolt/book vocabulary as the rest of the app (streak flame, XP
    // bolt, subject book) instead of the generic ⭐🔥📚 platform glyphs.
    const chipY = panelY + 700;
    const chipGap = 28;
    const chipW = (panelW - 120 - chipGap * 2) / 3;
    const chipX0 = panelX + 60;
    statChip(ctx, chipX0, chipY, chipW, 240, '#c4b5fd', drawBoltIcon, `${xp}`, 'XP TOTAL');
    statChip(ctx, chipX0 + chipW + chipGap, chipY, chipW, 240, '#ffd166', drawFlameIcon, `${streak}`, 'JOURS');
    statChip(ctx, chipX0 + (chipW + chipGap) * 2, chipY, chipW, 240, '#a7f3d0', drawBookIcon, `${subjectsCount}`, 'MATIÈRES');

    // CTA bar — a text/wordmark badge rather than a fake QR code: a QR that isn't wired to a
    // real invite link would look functional and not be, which is worse than not having one.
    // Wiring a real one just needs a `qrcode` dep plus a real deep-link once that exists.
    const ctaY = panelY + panelH - 210;
    ctx.fillStyle = '#151821';
    roundedPath(ctx, panelX + 40, ctaY, panelW - 80, 150, 20);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '800 40px "Baloo 2", sans-serif';
    ctx.fillText('BATS MON SCORE SUR', CANVAS_W / 2, ctaY + 56);
    ctx.font = '800 46px "Baloo 2", sans-serif';
    ctx.fillText('BRAISE →', CANVAS_W / 2, ctaY + 106);

    ctx.textAlign = 'left';
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    sfx.tap(state.soundOn);
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;
      const file = new File([blob], 'braise-aura.png', { type: 'image/png' });
      const nav = navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>;
        canShare?: (data: ShareData) => boolean;
      };
      if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
        try {
          await nav.share({ files: [file], title: 'Mon Aura Braise', text: 'Bats mon score sur Braise !' });
          return;
        } catch (err) {
          if ((err as Error)?.name === 'AbortError') return;
          // any other share failure falls through to the plain download below
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'braise-aura.png';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-head">
          <span className="share-modal-title">
            <Zap size={18} className="share-modal-title-icon" aria-hidden="true" />
            Partager mon Aura
          </span>
          <button className="share-modal-close" onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        <div className="share-preview-frame">
          <canvas ref={canvasRef} className="share-canvas" aria-label="Aperçu de la carte à partager" />
        </div>
        <button className="btn-block share-export-btn" onClick={handleShare} disabled={busy}>
          <Share2 size={18} />
          {busy ? 'Génération…' : 'Partager ma carte'}
        </button>
      </div>
    </div>
  );
}

function hookText(rank: Rank, streak: number): string {
  if (streak >= 7) return `${streak} JOURS DE SUITE. INARRÊTABLE.`;
  if (rank.id === 'bronze') return 'LA MONTÉE COMMENCE ICI.';
  return `RANG ${rank.name.toUpperCase()}. VENEZ ME CHERCHER.`;
}

function rankBadgeFill(rankId: string): string {
  switch (rankId) {
    case 'argent':
      return '#dbe4f0';
    case 'or':
      return '#ffd166';
    case 'platine':
      return '#b9f3ea';
    case 'legende':
      return '#ffb199';
    default:
      return '#e8b088';
  }
}

function roundedPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

// The neobrutalist hard shadow, reproduced in canvas: a solid (unblurred) black copy of the
// same shape, offset down-right, painted first — then the real fill + border on top.
function neoRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  shadowOffset = 8,
  borderWidth = 6
) {
  ctx.fillStyle = '#000';
  roundedPath(ctx, x + shadowOffset, y + shadowOffset, w, h, r);
  ctx.fill();

  roundedPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = '#000';
  ctx.stroke();
}

function neoPill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  neoRect(ctx, x, y, w, h, h / 2, fill, 5, 4);
}

function statChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  drawIcon: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void,
  value: string,
  label: string
) {
  neoRect(ctx, x, y, w, h, 18, fill, 6, 5);
  drawIcon(ctx, x + w / 2 - 27, y + 24, 54);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#151821';
  ctx.font = '800 46px "Baloo 2", sans-serif';
  ctx.fillText(value, x + w / 2, y + 138);
  ctx.font = '700 24px "IBM Plex Mono", monospace';
  ctx.fillText(label, x + w / 2, y + 182);
}

// Canvas has no built-in text wrapping — breaks `text` into lines that fit `maxWidth`, each
// drawn `lineHeight` apart and vertically centered as a block around `y`.
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, centerX, startY + i * lineHeight));
}

// ===== Vector icons + mascot, ported to canvas =====
//
// Everything below mirrors the real SVG components used on Ton Aura itself (StreakFlameIcon,
// RankIcon, BadgeIcon, BraiseMascot) — same path data, same colours — drawn with Path2D instead
// of JSX, since canvas can't render a React component directly. This card used to fall back to
// platform emoji (🔥⭐📚, and a giant 🔥 standing in for Braise entirely) precisely because
// nobody had ported the real artwork; it's the one artifact that actually leaves the app and
// lands on a real feed, so it's the last place that should still look like a placeholder.

const INK = '#151821';

function darkenHex(hex: string, amount: number): string {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const num = parseInt(full, 16);
  const r = Math.round(((num >> 16) & 255) * (1 - amount));
  const g = Math.round(((num >> 8) & 255) * (1 - amount));
  const b = Math.round((num & 255) * (1 - amount));
  return `rgb(${r}, ${g}, ${b})`;
}

function fillStrokePath(
  ctx: CanvasRenderingContext2D,
  d: string,
  fill?: string,
  stroke?: string,
  strokeWidth?: number,
  opacity = 1
) {
  const path = new Path2D(d);
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = prevAlpha * opacity;
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill(path);
  }
  if (stroke && strokeWidth) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke(path);
  }
  ctx.globalAlpha = prevAlpha;
}

// Runs `draw` inside a transform that places a `viewBox`-unit icon with its top-left at (x, y),
// scaled to render at `size` px — so path data can stay in its native SVG coordinate space.
function withIconBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  viewBox: number,
  draw: () => void
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / viewBox, size / viewBox);
  draw();
  ctx.restore();
}

const FLAME_OUTER_D =
  'M12 2 C14.3 5.6 17 8.2 17 12.8 C17 17.4 14.8 20.5 12 20.5 C8.6 20.5 6 17.6 6 13.4 C6 11 7.3 9.4 7.9 7.6 C8.3 9.7 9.2 10.2 9.8 9.3 C8.9 6.3 9.8 3.4 12 2 Z';
const FLAME_INNER_D =
  'M12.2 10.6 C13.4 12.6 14.2 14.1 14.2 16 C14.2 17.7 13.2 18.8 12 18.8 C10.5 18.8 9.5 17.7 9.5 16.1 C9.5 14.8 10.4 14 11 13 C11.3 14.1 11.9 14.3 12.2 13.5 C11.6 12 11.6 11.3 12.2 10.6 Z';

function drawFlameIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  withIconBox(ctx, x, y, size, 24, () => {
    fillStrokePath(ctx, FLAME_OUTER_D, '#ff4500', INK, 1.7);
    fillStrokePath(ctx, FLAME_INNER_D, '#ffd166');
  });
}

const BOLT_D = 'M13 1.5 3.5 13.8h6.2l-1 8.7L19.5 9h-6.4l1.2-7.5Z';
const BOLT_DETAIL_D = 'M13.4 3 9.6 10.2l3.4-0.9';

function drawBoltIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  withIconBox(ctx, x, y, size, 24, () => {
    fillStrokePath(ctx, BOLT_D, '#ffc700', INK, 1.7);
    fillStrokePath(ctx, BOLT_DETAIL_D, undefined, INK, 0.8, 0.5);
  });
}

const BOOK_D =
  'M12 6.5 C10.3 5 7.7 4.7 5 5.6 L5 18.1 C7.7 17.2 10.3 17.5 12 19 C13.7 17.5 16.3 17.2 19 18.1 L19 5.6 C16.3 4.7 13.7 5 12 6.5 Z';
const BOOK_SPINE_D = 'M12 6.5 L12 19';
const BOOK_HL_L_D = 'M6.5 8.3 L9.8 7.8';
const BOOK_HL_R_D = 'M14.2 7.8 L17.5 8.3';

function drawBookIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  withIconBox(ctx, x, y, size, 24, () => {
    fillStrokePath(ctx, BOOK_D, '#818cf8', INK, 1.7);
    fillStrokePath(ctx, BOOK_SPINE_D, undefined, INK, 1.2);
    fillStrokePath(ctx, BOOK_HL_L_D, undefined, '#fff', 0.9, 0.7);
    fillStrokePath(ctx, BOOK_HL_R_D, undefined, '#fff', 0.9, 0.7);
  });
}

// Medal (bronze/argent/or): ribboned coin, same silhouette as RankIcon.tsx, differing only by
// colour — the medal → gem → crown escalation lives entirely in drawRankIcon below.
const MEDAL_RIBBON_L_D = 'M7.5 2 L10.5 2 L10.5 12.5 L7.5 15 Z';
const MEDAL_RIBBON_R_D = 'M13.5 2 L16.5 2 L16.5 15 L13.5 12.5 Z';
const MEDAL_STAR_D =
  'M12 11.8 L12.76 13.95 L15.04 14.01 L13.24 15.4 L13.88 17.59 L12 16.3 L10.12 17.59 L10.76 15.4 L8.96 14.01 L11.24 13.95 Z';
const GEM_D = 'M6 9 L9 4 L15 4 L18 9 L12 20.5 Z';
const GEM_FACETS_D = 'M6 9 L18 9 M9 4 L12 9 M15 4 L12 9 M12 9 L12 20.5';
const GEM_SHINE_D = 'M9.3 4.6 L7.4 8.7';
const CROWN_D = 'M4.5 18 L3 8.5 L7.5 12.5 L12 5 L16.5 12.5 L21 8.5 L19.5 18 Z';

function drawRankIcon(ctx: CanvasRenderingContext2D, rankId: string, x: number, y: number, size: number, color: string) {
  withIconBox(ctx, x, y, size, 24, () => {
    if (rankId === 'platine') {
      fillStrokePath(ctx, GEM_D, color, INK, 1.8);
      fillStrokePath(ctx, GEM_FACETS_D, undefined, INK, 1, 0.55);
      fillStrokePath(ctx, GEM_SHINE_D, undefined, '#fff', 1, 0.6);
      return;
    }
    if (rankId === 'legende') {
      fillStrokePath(ctx, CROWN_D, color, INK, 1.8);
      ctx.fillStyle = color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
      roundedPath(ctx, 4.3, 18, 15.4, 2.6, 0.8);
      ctx.fill();
      ctx.stroke();
      [
        [3, 8.5, 1.5],
        [12, 5, 1.6],
        [21, 8.5, 1.5],
      ].forEach(([cx, cy, r]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = INK;
        ctx.stroke();
      });
      return;
    }
    // bronze / argent / or
    const ribbon = darkenHex(color, 0.25);
    fillStrokePath(ctx, MEDAL_RIBBON_L_D, ribbon, INK, 1.4);
    fillStrokePath(ctx, MEDAL_RIBBON_R_D, ribbon, INK, 1.4);
    ctx.beginPath();
    ctx.arc(12, 15, 7, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = INK;
    ctx.stroke();
    fillStrokePath(ctx, MEDAL_STAR_D, '#fff', undefined, undefined, 0.92);
  });
}

// Braise, ported from BraiseMascot.tsx's own 100x100 construction: the flame body (three
// layered paths, coloured per rank via the same RANK_FLAME_COLORS BraiseMascot itself exports),
// one rank-specific accent feature, then the "cool" face (sunglasses) — the same mood used for
// the Hero medallion on Ton Aura, since this card is the same kind of flex moment.
const FLAME_BODY_OUTER_D =
  'M50 6 C 60 24, 72 30, 72 52 C 72 70, 62 82, 50 82 C 38 82, 28 70, 28 52 C 28 34, 40 30, 44 18 C 46 12, 48 8, 50 6 Z';
const FLAME_BODY_MIDDLE_D =
  'M50 22 C 56 34, 64 38, 64 54 C 64 66, 58 74, 50 74 C 42 74, 36 66, 36 54 C 36 42, 44 38, 46 30 C 47 26, 49 24, 50 22 Z';
const FLAME_BODY_INNER_D =
  'M50 38 C 54 46, 58 48, 58 58 C 58 64, 54 68, 50 68 C 46 68, 42 64, 42 58 C 42 50, 48 48, 48 42 C 49 40, 49 39, 50 38 Z';

function drawRankAccent(ctx: CanvasRenderingContext2D, rankId: string) {
  if (rankId === 'argent') {
    fillStrokePath(ctx, 'M50 0 L55.5 8 L50 16 L44.5 8 Z', '#CFE8FF', INK, 1.4);
    fillStrokePath(ctx, 'M50 0 L50 16 M44.5 8 L55.5 8', undefined, '#3373D6', 0.6, 0.7);
  } else if (rankId === 'or') {
    fillStrokePath(
      ctx,
      'M65 15 C 70.5 20.5, 75 25, 73 33 C 71 39.5, 64.5 41, 61.5 36.5 C 59 32.5, 61 28.5, 63 24.5 C 64.5 21, 64.5 18, 65 15 Z',
      '#FDE68A',
      INK,
      1.5
    );
    ctx.beginPath();
    ctx.arc(66.5, 24, 1.3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (rankId === 'platine') {
    fillStrokePath(ctx, 'M33 21 L39.5 27.5 M67 21 L60.5 27.5 M29.5 39 L37 43 M70.5 39 L63 43', undefined, '#0E7490', 1.4, 0.8);
    fillStrokePath(ctx, 'M50 4 L54 11 L50 18 L46 11 Z', '#CFFAFE', INK, 1.4);
  } else if (rankId === 'legende') {
    fillStrokePath(ctx, 'M40 14 L43 2 L50 10 L57 2 L60 14 L58 17 L42 17 Z', '#FFD84B', INK, 1.5);
    [
      [43, 2, 1.5],
      [57, 2, 1.5],
      [50, 10, 1.7],
    ].forEach(([cx, cy, r]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#FF6F59';
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = INK;
      ctx.stroke();
    });
  }
}

function drawMascot(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, rankId: string) {
  const [outer, middle, inner] = RANK_FLAME_COLORS[rankId] ?? RANK_FLAME_COLORS.bronze;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 100, size / 100);

  fillStrokePath(ctx, FLAME_BODY_OUTER_D, outer);
  fillStrokePath(ctx, FLAME_BODY_MIDDLE_D, middle);
  fillStrokePath(ctx, FLAME_BODY_INNER_D, inner);
  drawRankAccent(ctx, rankId);

  // Eyes
  [
    [42, 54, 3.2, '#16213A'],
    [58, 54, 3.2, '#16213A'],
    [43, 53, 1, '#fff'],
    [59, 53, 1, '#fff'],
  ].forEach(([x, y, r, fill]) => {
    ctx.beginPath();
    ctx.arc(x as number, y as number, r as number, 0, Math.PI * 2);
    ctx.fillStyle = fill as string;
    ctx.fill();
  });

  // Smile
  ctx.beginPath();
  ctx.moveTo(44, 62);
  ctx.quadraticCurveTo(50, 67, 56, 62);
  ctx.strokeStyle = '#16213A';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Cheeks
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#FF6F59';
  ctx.beginPath();
  ctx.arc(38, 60, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(62, 60, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Sunglasses — the same "cool" mood as the Hero medallion, since this card is the same flex.
  ctx.fillStyle = '#16213A';
  roundedPath(ctx, 34.5, 49.5, 12, 8, 4);
  ctx.fill();
  roundedPath(ctx, 53.5, 49.5, 12, 8, 4);
  ctx.fill();
  ctx.fillRect(46.5, 52, 7, 2);
  ctx.strokeStyle = '#16213A';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(33, 51);
  ctx.lineTo(28, 49);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(67, 51);
  ctx.lineTo(72, 49);
  ctx.stroke();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#fff';
  roundedPath(ctx, 37, 51.5, 4, 2.5, 1);
  ctx.fill();
  roundedPath(ctx, 56, 51.5, 4, 2.5, 1);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}
