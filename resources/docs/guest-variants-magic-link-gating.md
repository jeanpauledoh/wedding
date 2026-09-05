# Guest Invitation Variants — Signed Magic Links & Conditional Rendering

## Goal
Guest experience varies by invitation without a backend: the invite URL carries
`?t=<token>` that resolves to a **variant** (`vows` | `party`) plus a guest **name**,
letting us conditionally render ceremony/venue content. Pure client-side; the real
security upgrade moves to a serverless function in Phase 4.

## Design decisions (already approved)
- Token encodes variant + name; rendered client-side (obscurity accepted — the secret ships in the bundle).
- Unknown/expired token → **graceful landing page**, not an error screen.
- `vows` guests see ceremony + venue/maps details; `party` guests see a stripped version.
- Deferred: Google Maps embed → Phase 3; uploads/serverless → Phase 4.

## Token spec (`src/lib/token.ts`)
- Format: `base64url(JSON.{v, n, exp}) + '.' + hex(HMAC-SHA256(secret, payload)[0..6])`.
- Validate: parse → check signature → check `exp` (e.g., 2027-01-01) → check `v ∈ {vows, party}`; `n` clamped to 40 chars.
- Minting script `scripts/gen-token.mjs` (Node `crypto`, no deps) so invites can carry real links.

## New files
- `src/lib/token.ts` — encode/verify types + helpers (`parseToken`, `variantFromToken`).
- `src/context/GuestContext.tsx` — `GuestProvider` reads `?t=` once, verifies, exposes `{ variant, name, status: 'ok' | 'invalid' | 'absent' }`.
- `src/components/InvalidLink.tsx` — full-screen, brand-styled landing: explainer + contact CTA, translated.
- `scripts/gen-token.mjs` — CLI: `node scripts/gen-token.mjs vows "Alice"`.

## Modified files
- `src/App.tsx` — wrap in `GuestProvider`; render `InvalidLink` when `status === 'invalid'`.
- `src/components/Details.tsx` — `Vows` card (+ ceremony timing/venue) only when `variant === 'vows'`; otherwise Reception only.
- `src/components/Travel.tsx` — venue feature + `Open in Maps` link only for `vows`; hotels/shuttle note kept for both.
- `src/components/Header.tsx` — `days to go` chip and nav unchanged; may drop `#details` nav promise tweak if ceremony is absent (keep as-is unless decided otherwise).
- `src/locales/{en,de,fr}/messages.po` — new strings (landing copy, etc.); run `npm run lingui:extract`, translate, rebuild.

## Behavior matrix
| `?t=` | Result |
|---|---|
| absent | full site, default `vows` (current behavior) |
| valid `vows` | full site incl. ceremony + venue/maps |
| valid `party` | site minus ceremony + venue section |
| invalid / expired / tampered | `InvalidLink` landing page |

## Verification
- `npm run typecheck` && `npm run build` && dev-server spot checks for each matrix row.
- Confirm a `party` token hides the ceremony card and venue/maps.

## Open questions (resolve before execution)
1. Absent token → full `vows` site (recommended) vs. landing page.
2. For `party`, should `#details` show dedicated "Party/Reception" copy for the timeline heading ("the celebration") or just drop ceremony bits?
3. Keep the 2027 registry age-gate idea out of Phase 2 scope (recommended).