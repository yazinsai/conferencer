# Speaker portraits

The people in this repository's demo data are **fictional**. These portraits are placeholder
photography and do not depict the named individuals, their employers, or anyone connected to them.

## Source

[randomuser.me/photos](https://randomuser.me/photos). Its portraits are, in the project's own words,
"hand picked from the authorized section of [UI Faces](https://uifaces.co)" — a set curated for
placeholder and prototyping use. See the [UI Faces FAQ](https://uifaces.co) for the terms that govern
them; they are appropriate for a demo like this one, and a production deployment should replace them
with photographs of its actual speakers.

Served at 128×128, already square and face-centred, so they are vendored unmodified.

Regenerate with `npm run media faces`. The indices are pinned in `scripts/media.mjs` so a re-run
never reshuffles who is who.

| File | randomuser index | URL | Size |
| --- | --- | --- | --- |
| `priya.jpg` | women/8 | https://randomuser.me/api/portraits/women/8.jpg | 5.7 KB |
| `marcus.jpg` | men/80 | https://randomuser.me/api/portraits/men/80.jpg | 4.7 KB |
| `grace.jpg` | women/27 | https://randomuser.me/api/portraits/women/27.jpg | 4.3 KB |
| `hugo.jpg` | men/41 | https://randomuser.me/api/portraits/men/41.jpg | 4.2 KB |
| `elena.jpg` | women/26 | https://randomuser.me/api/portraits/women/26.jpg | 4.6 KB |
| `ana.jpg` | women/29 | https://randomuser.me/api/portraits/women/29.jpg | 5.3 KB |
| `keiko.jpg` | women/51 | https://randomuser.me/api/portraits/women/51.jpg | 3.7 KB |
| `farid.jpg` | men/86 | https://randomuser.me/api/portraits/men/86.jpg | 5.3 KB |
| `iris.jpg` | women/62 | https://randomuser.me/api/portraits/women/62.jpg | 5 KB |
| `chen.jpg` | men/26 | https://randomuser.me/api/portraits/men/26.jpg | 9.7 KB |
| `dana.jpg` | women/45 | https://randomuser.me/api/portraits/women/45.jpg | 4.4 KB |

Total 57 KB across 11 portraits.

One speaker — Ron Weasley — has no portrait on purpose, so the speaker gallery's no-photo
fallback stays visible in the demo.
