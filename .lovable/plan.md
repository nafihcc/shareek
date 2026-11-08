# Arabic-only Quran reader

## What will change
- Remove the English translation and all translation-related loading.
- Replace the approximate 12-verse pages with the Quran's standard 604-page structure.
- Keep a verse-by-verse reading mode alongside page reading.
- Add recitation controls for the whole visible page and for individual verses.
- Turn Surah search and navigation into a panel that can be opened and closed.
- Improve Arabic typography with a dedicated Quran typeface and spacious, right-to-left layout.

## Technical details
- Continue using the existing Quran data service, requesting the Arabic Alafasy edition by page or Surah.
- Sequence page audio verse-by-verse for uninterrupted playback.
- Preserve the existing app shell and visual design tokens while making the reader responsive.
