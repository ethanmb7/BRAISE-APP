import { useEffect, useRef, useState } from 'react';
import { Share2, X } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import type { Rank } from '@/lib/aura';

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
    ctx.fillStyle = '#151821';
    ctx.font = '700 34px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔥 BRAISE', 96, 102);

    // Main panel
    const panelX = 90;
    const panelY = 320;
    const panelW = CANVAS_W - panelX * 2;
    const panelH = 1230;
    neoRect(ctx, panelX, panelY, panelW, panelH, 28, '#faf8f3', 10, 7);

    // Mascot stand-in — a rasterized flame emoji rather than the real multi-path SVG mascot,
    // which canvas can't draw directly without pre-rendering it to an image first. Good enough
    // for a v1 generator; swapping in a real per-rank mascot PNG is the natural next step.
    ctx.textAlign = 'center';
    ctx.font = '240px serif';
    ctx.fillText('🔥', CANVAS_W / 2, panelY + 230);

    // Rank badge
    const badgeW = 460;
    neoPill(ctx, CANVAS_W / 2 - badgeW / 2, panelY + 300, badgeW, 92, rankBadgeFill(rank.id));
    ctx.fillStyle = '#151821';
    ctx.font = '800 42px "Baloo 2", sans-serif';
    ctx.fillText(`${rank.emoji} RANG ${rank.name.toUpperCase()}`, CANVAS_W / 2, panelY + 346);

    // Dynamic hook, tiered by streak/rank
    ctx.font = '800 62px "Baloo 2", sans-serif';
    ctx.fillStyle = '#151821';
    wrapText(ctx, hookText(rank, streak), CANVAS_W / 2, panelY + 490, panelW - 140, 70);

    // Stat chips
    const chipY = panelY + 700;
    const chipGap = 28;
    const chipW = (panelW - 120 - chipGap * 2) / 3;
    const chipX0 = panelX + 60;
    statChip(ctx, chipX0, chipY, chipW, 240, '#c4b5fd', '⭐', `${xp}`, 'XP TOTAL');
    statChip(ctx, chipX0 + chipW + chipGap, chipY, chipW, 240, '#ffd166', '🔥', `${streak}`, 'JOURS');
    statChip(ctx, chipX0 + (chipW + chipGap) * 2, chipY, chipW, 240, '#a7f3d0', '📚', `${subjectsCount}`, 'MATIÈRES');

    // CTA bar — a text/wordmark badge rather than a fake QR code: a QR that isn't wired to a
    // real invite link would look functional and not be, which is worse than not having one.
    // Wiring a real one just needs a `qrcode` dep plus a real deep-link once that exists.
    const ctaY = panelY + panelH - 210;
    ctx.fillStyle = '#151821';
    roundedPath(ctx, panelX + 40, ctaY, panelW - 80, 150, 20);
    ctx.fill();
    ctx.fillStyle = '#fff';
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
          <span className="share-modal-title">⚡ Partager mon Aura</span>
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
  icon: string,
  value: string,
  label: string
) {
  neoRect(ctx, x, y, w, h, 18, fill, 6, 5);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#151821';
  ctx.font = '54px serif';
  ctx.fillText(icon, x + w / 2, y + 68);
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
