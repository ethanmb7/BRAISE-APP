import type { CSSProperties, ReactNode } from "react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { emblemFor } from "@/lib/world/emblems";
import { Island } from "@/components/world/Island";
import { archipelagoHeight, islandSlots } from "@/lib/world/layout";
import type { LibraryEntry } from "@/lib/catalog/catalog";

const INK = "#151821";

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <svg
      className="wd-cloud"
      viewBox="-14 -16 108 56"
      style={
        { ["--x" as string]: x, ["--y" as string]: y, ["--w" as string]: 108 * s } as CSSProperties
      }
      aria-hidden="true"
    >
      <path
        d="M0 30a18 18 0 0 1 8-30a22 22 0 0 1 40-6a18 18 0 0 1 28 14a14 14 0 0 1-4 22z"
        fill="#fff"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A subject as a small archipelago: one island per course, zigzagging down a sky and sea tinted with
 *  the subject's colour. Everything is open; the suggested island is a little bigger and Braise stands
 *  by it. The header and the bottom strip are passed in, so the screen decides what they say. */
export function Archipelago({
  color,
  entries,
  suggestedKey,
  selectedKey,
  onSelect,
  header,
  dock,
}: {
  color: string;
  entries: LibraryEntry[];
  suggestedKey: string | null;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  header: ReactNode;
  dock: ReactNode;
}) {
  const slots = islandSlots(entries.length);
  const height = archipelagoHeight(entries.length);
  const suggestedIndex = entries.findIndex((e) => e.key === suggestedKey);
  const braiseSlot = suggestedIndex >= 0 ? slots[suggestedIndex] : null;
  // Braise stands on the rim of the island she suggests, on the side away from its monument.
  const braiseX = braiseSlot ? braiseSlot.x + (braiseSlot.x > 195 ? -54 : 56) : 0;

  return (
    <section
      className="world"
      style={{ ["--subject" as string]: color } as CSSProperties}
      aria-label="Carte des cours"
    >
      <div className="world-head">{header}</div>
      <div className="world-inner" style={{ ["--h" as string]: height } as CSSProperties}>
        <span className="wd-sun" aria-hidden="true" />
        {entries.slice(2).map((_, i) => (
          <Cloud key={i} x={i % 2 === 0 ? 14 : 290} y={150 + i * 260} s={0.7 + (i % 3) * 0.08} />
        ))}
        {entries.map((entry, i) => (
          <Island
            key={entry.key}
            entry={entry}
            emblem={emblemFor(entry.chapterId, i)}
            slot={slots[i]}
            index={i}
            suggested={entry.key === suggestedKey}
            selected={entry.key === selectedKey}
            onSelect={() => onSelect(entry.key)}
          />
        ))}
        {braiseSlot && (
          <span
            className="wd-braise"
            style={
              { ["--x" as string]: braiseX, ["--y" as string]: braiseSlot.y - 6 } as CSSProperties
            }
            aria-hidden="true"
          >
            <BraiseMascot size={56} mood="eager" />
          </span>
        )}
        <svg className="wd-sea" viewBox="0 0 390 92" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 26Q20 12 40 26T80 26T120 26T160 26T200 26T240 26T280 26T320 26T360 26T400 26V92H0Z"
            fill="var(--sea)"
            stroke={INK}
            strokeWidth="4"
          />
          <path
            d="M0 52Q20 40 40 52T80 52T120 52T160 52T200 52T240 52T280 52T320 52T360 52T400 52"
            fill="none"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".75"
          />
        </svg>
        {dock}
      </div>
    </section>
  );
}
