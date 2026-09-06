# Image Placeholders — Open Topic

The images are currently **placeholders from the original template** (Sonoma vineyard theme).
They do not match the real Berlin wedding. The code references the existing files, so nothing
is broken — but these should be replaced with real photos before sharing the site.

## How images are wired up

- `src/images.ts` — imports the image files
- `css/style.css` (`hero__bg`) — references `img/hero.jpg` directly
- Component usage:
  - `Hero` → `hero.jpg` (CSS background)
  - `Details` ceremony card → `img/ceremony.jpg`
  - `Details` brunch card → `img/reception.jpg` (placeholder)
  - `Details` celebration card → `img/venue.jpg` (placeholder)
  - `OptionalDay` → `img/gallery1.jpg` (placeholder)
  - `Gallery` → `gallery1.jpg` … `gallery6.jpg` + `venue.jpg`

## Suggested replacements

| File | Current (placeholder) | Suggested real photo |
| ---- | --------------------- | -------------------- |
| `img/hero.jpg` | Sonoma bouquet | Berlin / couple photo |
| `img/ceremony.jpg` | Floral arch in a field | Standesamt Berlin Mitte (Parochialstraße 3) |
| `img/reception.jpg` | Candlelit banquet table | Interior of "Sag mir wo die Blumen sind" |
| `img/venue.jpg` | Vineyard estate | Restaurant "Whitebird" |
| `img/gallery1.jpg` | Roses close-up | Personal photo |
| `img/gallery2.jpg` | Naked cake | Personal photo |
| `img/gallery3.jpg` | Rings | Personal photo |
| `img/gallery4.jpg` | Candlelit table | Personal photo |
| `img/gallery5.jpg` | Vineyard rows | Personal photo |
| `img/gallery6.jpg` | Table setting | Personal photo |

## Ideas

- Once real venue photos exist, consider dedicated files (e.g. `img/brunch.jpg`,
  `img/party.jpg`, `img/botanical.jpg`) and update the component imports instead of reusing
  the gallery images.

## Deleted template files (no longer referenced)

`party1.jpg`, `party2.jpg`, `party3.jpg`, `party4.jpg`, `party5.jpg`, `party6.jpg`,
`hotel1.jpg`, `hotel2.jpg` — safe to delete from `img/` whenever wanted.