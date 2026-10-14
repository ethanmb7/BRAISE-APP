// What the sheet of a world lists: its chapters, each with one word for where the student stands. Pure,
// so it is tested without a screen. The word is the same language as the islands (see Island.tsx): the
// cards waiting when there are some, otherwise the state of the chapter.
import { STATUS_LABEL } from "@/lib/course/statusLabels";
import type { Library, LibraryEntry } from "@/lib/catalog/catalog";

export type SheetChip = {
  label: string;
  /** The suffix of the `isl-tag--` class that tints it: "due", or the state of the chapter. */
  tone: string;
};

export type SheetRow = {
  entry: LibraryEntry;
  chip: SheetChip;
  /** The chapter Braise would pick up (only in the world she suggests). */
  resume: boolean;
};

export function chipFor(entry: LibraryEntry): SheetChip {
  return entry.dueCount > 0
    ? { label: `${entry.dueCount} à rafraîchir`, tone: "due" }
    : { label: STATUS_LABEL[entry.status], tone: entry.status };
}

/** The chapters of a world in the order of its map, with the one Braise suggests marked. */
export function sheetRows(library: Library, resumeKey: string | null): SheetRow[] {
  return library.entries.map((entry) => ({
    entry,
    chip: chipFor(entry),
    resume: entry.key === resumeKey,
  }));
}
