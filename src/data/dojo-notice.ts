export interface DojoNoticeData {
  /** Also the dismissal value in storage, so changing it re-shows a dismissed notice. */
  id: string;
  text: string;
  /** Shown below 600px, falls back to `text`. Keep short enough to fit 320px. */
  shortText?: string;
  href: string;
  /** YYYY-MM-DD, inclusive, read in the visitor's local time. */
  start: string;
  /** YYYY-MM-DD, inclusive through the end of that day, visitor's local time. */
  end: string;
  /** Defaults to olive. Matches PanelSection's colour names. */
  color?: 'olive' | 'cream';
}

/** Set to null when there is nothing to announce, which renders no markup at all. */
const NOTICE: DojoNoticeData | null = {
  id: 'oita-fest-2026',
  text: 'Experience Iaijutsu at the 2026 Austin-Oita Festival',
  shortText: 'Iaijutsu at the Austin-Oita Festival',
  href: 'https://www.austinoita.org/2026-oita-japan-festival',
  start: '2026-08-01',
  end: '2026-08-30',
};

/**
 * Returns a copy, because the module is evaluated once and every caller would
 * otherwise share one object that any of them could mutate. Every field is a string,
 * so a shallow copy is a complete one.
 */
export function getNotice(): DojoNoticeData | null {
  if (NOTICE === null) {
    return null;
  }
  return { ...NOTICE };
}
