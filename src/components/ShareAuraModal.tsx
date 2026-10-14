import { useEffect, useRef, useState } from 'react';
import { Share2, X, Zap } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import type { Rank } from '@/lib/aura';
import { BRAISE_BODY_PATHS, BRAISE_RANK_COLORS } from '@/components/BraiseCharacter';
import type { BraiseRankId } from '@/components/BraiseCharacter';

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
  masteredCards,
  onClose,
}: {
  rank: Rank;
  streak: number;
  xp: number;
  subjectsCount: number;
  masteredCards: number;
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
  }, [rank.id, streak, xp, subjectsCount, masteredCards]);

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

    const pseudo = (state.user.name || 'JOUEUR').toUpperCase();

    // ---- Background: the app's cream paper, plus a burst of the rank's own colour so the card
    // reads as an object lying ON something, not as a flat poster.
    ctx.fillStyle = '#FDF7EF';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawRays(ctx, CANVAS_W / 2, 800, rank.colorFrom);
    drawDotGrid(ctx);

    // ---- The collectible card itself ----------------------------------------------------
    const CX = 64;
    const CY = 208;
    const CW = CANVAS_W - CX * 2;
    const CH = 1322;
    const PAD = 34;

    neoRect(ctx, CX, CY, CW, CH, 46, '#FFFFFF', 26, 14);

    // Header strip: wordmark + rarity, in the rank's gradient.
    ctx.save();
    roundedPath(ctx, CX, CY, CW, CH, 46);
    ctx.clip();
    const band = ctx.createLinearGradient(CX, CY, CX + CW, CY + 120);
    band.addColorStop(0, rank.colorFrom);
    band.addColorStop(1, rank.colorTo);
    ctx.fillStyle = band;
    ctx.fillRect(CX, CY, CW, 122);
    ctx.fillStyle = INK;
    ctx.fillRect(CX, CY + 122, CW, 10);
    ctx.restore();

    drawFlameIcon(ctx, CX + PAD, CY + 34, 56);
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '700 40px "IBM Plex Mono", monospace';
    ctx.fillText('BRAISE', CX + PAD + 74, CY + 62);

    const rarity = rarityLabel(rank.id);
    ctx.font = '700 30px "IBM Plex Mono", monospace';
    const rarW = ctx.measureText(rarity).width + 56;
    neoRect(ctx, CX + CW - PAD - rarW, CY + 28, rarW, 68, 34, '#151821', 0, 5);
    ctx.fillStyle = '#FDF7EF';
    ctx.textAlign = 'center';
    ctx.font = '700 30px "IBM Plex Mono", monospace';
    ctx.fillText(rarity, CX + CW - PAD - rarW / 2, CY + 63);

    // Art window: Braise, full rank colours, holo stripes.
    const AX = CX + PAD;
    const AY = CY + 158;
    const AW = CW - PAD * 2;
    const AH = 716;
    ctx.fillStyle = '#000';
    roundedPath(ctx, AX + 10, AY + 10, AW, AH, 28);
    ctx.fill();
    ctx.save();
    roundedPath(ctx, AX, AY, AW, AH, 28);
    ctx.clip();
    const art = ctx.createLinearGradient(AX, AY, AX + AW, AY + AH);
    art.addColorStop(0, rank.colorTo);
    art.addColorStop(1, rank.colorFrom);
    ctx.fillStyle = art;
    ctx.fillRect(AX, AY, AW, AH);
    drawRays(ctx, AX + AW / 2, AY + AH * 0.55, '#FFFFFF', 0.22);
    drawHolo(ctx, AX, AY, AW, AH);
    drawMascot(ctx, AX + AW / 2, AY + AH / 2 - 10, 600, rank.id);
    ctx.restore();
    roundedPath(ctx, AX, AY, AW, AH, 28);
    ctx.lineWidth = 10;
    ctx.strokeStyle = INK;
    ctx.stroke();

    // Rank sticker slapped on the corner of the art.
    drawRankStamp(ctx, AX + AW / 2, AY + AH - 18, rank);

    // Name plate: the pseudo is the card's title — this is THEIR card.
    const NY = AY + AH + 56;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = INK;
    fitText(ctx, pseudo, AX, NY + 58, AW - 120, 84, 'Baloo 2');
    ctx.font = '700 28px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#5B6172';
    ctx.fillText(hookText(rank, streak), AX, NY + 104);

    // Stats: three real numbers, compact, inside the card.
    const SY = NY + 128;
    const gap = 22;
    const sw = (AW - gap * 2) / 3;
    miniStat(ctx, AX, SY, sw, 170, '#C4B5FD', `${xp}`, 'XP');
    if (streak > 0) miniStat(ctx, AX + sw + gap, SY, sw, 170, '#FFD166', `${streak}`, 'JOURS');
    else miniStat(ctx, AX + sw + gap, SY, sw, 170, '#FFD166', `${masteredCards}`, 'SUES');
    miniStat(ctx, AX + (sw + gap) * 2, SY, sw, 170, '#A7F3D0', `${subjectsCount}`, 'MATIÈRES');

    // Card footer: real proof + real date, like a serial line.
    ctx.textAlign = 'left';
    ctx.fillStyle = '#5B6172';
    ctx.font = '700 26px "IBM Plex Mono", monospace';
    ctx.fillText(`${masteredCards} CARTES MAÎTRISÉES`, AX, CY + CH - 34);
    ctx.textAlign = 'right';
    ctx.fillText(editionCode(), AX + AW, CY + CH - 34);

    // ---- Invitation, outside the card ----------------------------------------------------
    const ctaY = 1566;
    ctx.fillStyle = INK;
    roundedPath(ctx, CX, ctaY, CW, 174, 30);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FDF7EF';
    ctx.font = '800 46px "Baloo 2", sans-serif';
    ctx.fillText('BATS MON SCORE SUR', CANVAS_W / 2, ctaY + 68);
    ctx.fillStyle = '#FF7A1A';
    ctx.font = '800 56px "Baloo 2", sans-serif';
    ctx.fillText('BRAISE →', CANVAS_W / 2, ctaY + 130);

    ctx.fillStyle = '#5B6172';
    ctx.font = '700 28px "IBM Plex Mono", monospace';
    ctx.fillText('2 MIN PAR JOUR · TA CARTE ÉVOLUE AVEC TOI', CANVAS_W / 2, 1822);

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

// Rarity mirrors the real rank — nothing decorative: a Bronze card cannot claim to be rare.
function rarityLabel(rankId: string): string {
  switch (rankId) {
    case 'argent':
      return 'RARE';
    case 'or':
      return 'ÉPIQUE';
    case 'platine':
      return 'MYTHIQUE';
    case 'legende':
      return 'LÉGENDAIRE';
    default:
      return 'COMMUNE';
  }
}

// The date the card was generated — a real edition marker, not a fake serial number.
function editionCode(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `ÉDITION ${p(d.getDate())}.${p(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
}

// Radial burst behind the card and inside the art window — the "pull" of a collectible reveal.
function drawRays(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, alpha = 0.16) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  const count = 18;
  for (let i = 0; i < count; i += 2) {
    const a0 = (i / count) * Math.PI * 2;
    const a1 = ((i + 1) / count) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a0) * 2200, cy + Math.sin(a0) * 2200);
    ctx.lineTo(cx + Math.cos(a1) * 2200, cy + Math.sin(a1) * 2200);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// Holographic sheen: hard-edged diagonal bands, no blur — the neobrutalist take on a foil card.
function drawHolo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#FFFFFF';
  for (let i = -h; i < w + h; i += 120) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + h);
    ctx.lineTo(x + i + 54, y + h);
    ctx.lineTo(x + i + 54 + h, y);
    ctx.lineTo(x + i + h, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// Shrinks the font until the string fits — a long pseudo must never run off the card.
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  family: string
) {
  let s = size;
  ctx.font = `800 ${s}px "${family}", sans-serif`;
  while (ctx.measureText(text).width > maxWidth && s > 30) {
    s -= 2;
    ctx.font = `800 ${s}px "${family}", sans-serif`;
  }
  ctx.fillText(text, x, y);
}

// Compact stat block used inside the card frame.
function miniStat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  value: string,
  label: string
) {
  neoRect(ctx, x, y, w, h, 22, fill, 8, 6);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  fitText(ctx, value, x + w / 2, y + 98, w - 28, 68, 'Baloo 2');
  ctx.font = '700 26px "IBM Plex Mono", monospace';
  ctx.fillText(label, x + w / 2, y + 142);
  ctx.textAlign = 'left';
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

// The app's cream paper texture: a faint ink dot grid, same rhythm as .app-content.
function drawDotGrid(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = 'rgba(21, 24, 33, 0.09)';
  const step = 56;
  for (let y = step / 2; y < CANVAS_H; y += step) {
    for (let x = step / 2; x < CANVAS_W; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Rank sticker: slapped at an angle across the banner edge, icon + name, hard shadow.
function drawRankStamp(ctx: CanvasRenderingContext2D, cx: number, cy: number, rank: Rank) {
  const label = `RANG ${rank.name.toUpperCase()}`;
  const iconSize = 58;
  const gap = 18;
  ctx.save();
  ctx.font = '800 48px "Baloo 2", sans-serif';
  const labelW = ctx.measureText(label).width;
  const w = iconSize + gap + labelW + 96;
  const h = 108;
  ctx.translate(cx, cy);
  ctx.rotate(-0.045);
  neoRect(ctx, -w / 2, -h / 2, w, h, 20, rankBadgeFill(rank.id), 10, 7);
  drawRankIcon(ctx, rank.id, -w / 2 + 48, -iconSize / 2, iconSize, rank.colorFrom);
  ctx.fillStyle = '#151821';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '800 48px "Baloo 2", sans-serif';
  ctx.fillText(label, -w / 2 + 48 + iconSize + gap, 4);
  ctx.restore();
}

// Stat tile: coloured block, icon badge on white, big real number, mono label.
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
  neoRect(ctx, x, y, w, h, 24, fill, 9, 6);
  neoRect(ctx, x + w / 2 - 46, y + 26, 92, 92, 22, '#FFFFFF', 5, 4);
  drawIcon(ctx, x + w / 2 - 29, y + 43, 58);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#151821';
  ctx.font = '800 66px "Baloo 2", sans-serif';
  ctx.fillText(value, x + w / 2, y + 208);
  ctx.font = '700 24px "IBM Plex Mono", monospace';
  ctx.fillText(label, x + w / 2, y + 256);
  ctx.textBaseline = 'middle';
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

// Same filled-circle-with-checkmark motif already used for a completed lesson node on a subject's
// own path view — reused here for "cartes maîtrisées" so the share card's stand-in for the
// streak chip (when streak is 0) still reads as an established "done" signal, not a new symbol.
const CHECK_D = 'M7 12.5 L10.3 16 L17.5 8';

function drawCheckIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  withIconBox(ctx, x, y, size, 24, () => {
    ctx.beginPath();
    ctx.arc(12, 12, 10.5, 0, Math.PI * 2);
    ctx.fillStyle = '#4ade80';
    ctx.fill();
    ctx.lineWidth = 1.7;
    ctx.strokeStyle = INK;
    ctx.stroke();
    fillStrokePath(ctx, CHECK_D, undefined, '#fff', 2.4);
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
  const safeRank = (rankId in BRAISE_RANK_COLORS ? rankId : 'bronze') as BraiseRankId;
  const [outer, middle, inner] = BRAISE_RANK_COLORS[safeRank];
  const mature = safeRank === 'or' || safeRank === 'platine' || safeRank === 'legende';
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 108, size / 116);

  fillStrokePath(ctx, BRAISE_BODY_PATHS[safeRank], outer, INK, 4.5);
  fillStrokePath(ctx, mature ? 'M26 82 C25 59 39 43 53 42 C71 41 86 58 83 82 C81 98 68 105 53 105 C37 105 28 98 26 82 Z' : 'M30 80 C29 61 40 47 53 46 C69 46 80 60 79 80 C78 94 67 101 53 101 C39 101 31 94 30 80 Z', middle);
  fillStrokePath(ctx, mature ? 'M30 67 C30 52 40 45 53 45 C68 45 78 53 78 68 C78 82 67 89 53 89 C39 89 30 81 30 67 Z' : 'M31 67 C31 53 41 46 53 46 C67 46 77 54 77 68 C77 82 67 89 53 89 C40 89 31 81 31 67 Z', '#FFF2D8', INK, 3.2);

  // The exported card carries the same brand signature as the app: controlled gaze + live core.
  if (mature) fillStrokePath(ctx, 'M36 53 L49 55 M58 55 L71 52', undefined, INK, 2.8);
  fillStrokePath(ctx, safeRank === 'bronze' ? 'M53 76 L58 82 L53 90 L48 82 Z' : safeRank === 'argent' ? 'M53 72 L60 81 L53 92 L46 81 Z' : safeRank === 'or' ? 'M53 69 L62 80 L53 94 L44 80 Z' : safeRank === 'platine' ? 'M53 66 L63 79 L58 94 L48 94 L43 79 Z' : 'M53 64 L65 78 L60 96 L46 96 L41 78 Z', inner, INK, 2.6);

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
