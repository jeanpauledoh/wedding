# Guest Photo Upload — Implementation Plan

> Status: Approved, ready to implement.
> Created: 2026-09-06 · Revised: 2026-09-06 (flag gates only the downloadable album)

## Overview

Logged-in guests can upload wedding photos through a modal with drag-and-drop. Images are compressed client-side (2048px, JPEG 80%) before uploading through the existing Cloudflare Worker to an R2 bucket. Uploaded photos are viewable in a grid inside the same section. Only the downloadable ZIP album is gated by a build-time flag (`VITE_GALLERY_ENABLED`).

## Flag Semantics

| Feature | Gated by | Signal |
|---|---|---|
| Upload | R2 binding present | Worker meta `wedding:photos=on` |
| View grid | R2 binding present | Worker meta `wedding:photos=on` |
| Download album (zip) | `GALLERY_ENABLED=true` | `VITE_GALLERY_ENABLED` (frontend) + `GALLERY_ENABLED` worker secret (backend) |

To disable everything, remove/rename the R2 binding. The album alone is disabled by unsetting `GALLERY_ENABLED`.

## Architecture

```
Browser (React)
  ↓ compress via Canvas API (2048px, JPEG 0.8)     POST /api/upload
  ↓                                                 GET /api/gallery (list)
Cloudflare Worker (auth verify + file validate)     GET /api/photo/{key}
  ↓ R2.put() / R2.get()                             GET /api/album (streamed zip)
Cloudflare R2 bucket (wedding-guest-uploads)
```

## One-Time Setup (manual)

1. **Create R2 bucket** in Cloudflare dashboard → name: `wedding-guest-uploads`
2. (Optional) Enable R2.dev public access — not required; images are served auth'd through the Worker.
3. **Add GitHub Actions secret**: `GALLERY_ENABLED=true` → enables the downloadable album (frontend button + Worker `/api/album` guard).

## Files Modified

| File | Action | Purpose |
|---|---|---|
| `worker/wrangler.toml` | Edit | Add `[[r2_buckets]]` binding (`PHOTOS` → `wedding-guest-uploads`) |
| `worker/src/index.ts` | Edit | Inject `wedding:photos` meta; add `/api/upload`, `/api/gallery`, `/api/photo/{key}`, `/api/album` |
| `worker/.dev.vars` | local | `GALLERY_ENABLED=true` for local album testing |
| `src/components/GuestPhotos.tsx` | **Create** | Section: upload modal + guest grid + album download |
| `src/lib/compress.ts` | **Create** | Client-side image compression (Canvas API) |
| `src/components/Icons.tsx` | Edit | Add `CameraIcon` |
| `css/style.css` | Edit | Upload/dropzone/preview/grid/album styles |
| `src/App.tsx` | Edit | Add `<GuestPhotos />` after `<Gallery />` |
| `src/context/GuestContext.tsx` | Edit | Add `photos: boolean` from `wedding:photos` meta |
| `src/locales/{de,fr,en}/messages.po` | Edit | i18n strings |
| `.env.example` | Edit | Document `VITE_GALLERY_ENABLED` (album only) |
| `.github/workflows/deploy.yml` | Edit | Pass `VITE_GALLERY_ENABLED` to build; `wrangler secret put GALLERY_ENABLED` |

## Worker Routes

All API routes sit behind the auth cookie check (only verified guests reach them).

- **`POST /api/upload`** — parse multipart `files`; validate `image/jpeg|png|webp|heic|heif`, ≤10MB; key `guest-uploads/{sanitizedName}/{ts}-{uuid}.{ext}`; return 201 on success.
- **`GET /api/gallery`** — list `guest-uploads/`; return `{ key, size, uploaded }[]`.
- **`GET /api/photo/{key}`** — serve one image (content-type from stored metadata). Validates prefix + no `..`. Keys contain UUIDs (unguessable), so photos stay private behind the gate.
- **`GET /api/album`** — guarded by `env.GALLERY_ENABLED === 'true'`; streams a ZIP of every photo using **fflate** `Zip` + `ZipPassThrough` (JPEGs stored as-is → no recompression, no buffering). `Content-Disposition: attachment`.

All routes return 404 when `env.PHOTOS` is absent (feature off).

## Frontend

- **`GuestContext`** adds `photos` — set when the Worker injected `wedding:photos=on` (localhost defaults to true, mirroring the `variant` override).
- **`GuestPhotos`** renders only when `photos` is true:
  - Upload button → existing modal (dropzone, previews, progress, success/error).
  - Guest grid → fetches `/api/gallery` on mount + after each successful upload; renders `<img src="/api/photo/{key}">`; empty state "No photos yet – be the first!"; error state hides grid.
  - Album button `<a href="/api/album">` rendered only when `VITE_GALLERY_ENABLED === 'true'`.

## Compression

`src/lib/compress.ts` — `createImageBitmap` + `OffscreenCanvas`, downscale to 2048px longest side, export JPEG at 0.8. Fallback to the original file on any failure. 5MB phone photo → ~300KB; 10GB free tier holds tens of thousands.

## Security

- All uploads/viewing/downloading go through the Worker — verified before touching R2.
- File type/size validated client- and server-side; per-guest folder prefix.
- Keys validated against traversal; images unguessable (UUID).
- `PHOTOS` binding optional in `Env` → routes 404 when disabled.

## Enabling / Disabling

**Enable everything:** create the bucket (binding present) → deploy. Add `GALLERY_ENABLED=true` secret → album button + `/api/album` come online.

**Disable album only:** unset/`false` the `GALLERY_ENABLED` secret and redeploy; upload + view keep working.

**Disable everything:** comment out the `[[r2_buckets]]` section and redeploy (or rename the binding).