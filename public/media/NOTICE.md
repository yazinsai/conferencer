# Photography & hero video

Three photographs, used in three of the places `design.md` § Per-page allowances permits: the
public event fold, the landing page's proof band, and the landing page's closing statement band.
All are wide shots in which no individual is the subject.

Source: [Pixabay](https://pixabay.com), under the
[Content License](https://pixabay.com/service/license-summary/) — free to use and modify, no
attribution required. Credit is given anyway, as it is for the fonts.

Centre-cropped to 16:9 and re-encoded as WebP. Regenerate with `npm run media scenes`
(needs `PIXABAY_API_KEY` and `ffmpeg`).

| File | Pixabay | Photographer | Size |
| --- | --- | --- | --- |
| `venue.webp` | [6651873](https://pixabay.com/photos/chairs-hall-empty-rows-of-chairs-6651873/) | wal_172619 | 126 KB |
| `audience.webp` | [83519](https://pixabay.com/photos/meeting-addis-ababa-ethiopia-hall-83519/) | 12019 | 127 KB |
| `hall.webp` | [80721](https://pixabay.com/photos/cia-langley-virginia-auditorium-80721/) | 12019 | 55 KB |

## Hero loop

| File | Source | Notes |
| --- | --- | --- |
| `hero-conference-v3.mp4` | Gemini Omni Flash (fal.ai), 8s 16:9, muted re-encode | Landing `/` full-bleed background |
| `hero-conference-v3.webp` | Frame at t≈2s from the same clip | Poster / reduced-motion fallback |

Master + prompt log: `/Users/rock/generations/conferencer_hero_speakers_1786472857.{mp4,json}` (stage speakers → audience ovation)
